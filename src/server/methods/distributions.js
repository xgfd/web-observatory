/**
 * Created by xgfd on 02/01/2016.
 */
let connPool = {};

function augsTrans(url, username, pass) {

    if (arguments.length === 1) {
        if (!url.match(/^.*:\/\//)) {
            let distId = url,
                dist = Datasets.findOne({'distribution._id': distId}, {fields: {distribution: {$elemMatch: {_id: distId}}}}).distribution[0];

            if (dist) {
                url = dist.url;
                if (dist.profile) {
                    ({username, pass} = dist.profile);
                }
            } else {
                throw new Meteor.Error('not-found', `Distribution ${distId} not found`);
            }
        }
    }

    return {url, username, pass};
}

function connectorFactory(connect) {
    return function (url, username, pass) {
        let id = url;

        ({url, username, pass} = augsTrans.apply(null, arguments));

        let {error, result} = Async.runSync(function (done) {
            connect(url, username, pass, done);
        });

        if (error) {
            throw new Meteor.Error(error.name, error.message);
        } else {
            connPool[id] = result;
            return true;
        }
    }
}

/*
 * @connector(distId) create an db connection and save it to dbPool
 * @queryExec(db, done, ...args) query execution function. result is passed to done(error, result)
 * */
function queryerFactory(connector, queryExec) {
    return function (distId, ...args) {
        let conn = connPool[distId];

        if (!conn) {
            try {
                connector(distId);
            }
            catch (e) {
                Datasets.update({distribution: {$elemMatch: {_id: distId}}}, {$set: {'distribtuion.$.online': false}});
                throw e;
            }
        }

        conn = connPool[distId];

        if (!conn) {
            Datasets.update({distribution: {$elemMatch: {_id: distId}}}, {$set: {'distribtuion.$.online': false}});
            throw new Meteor.Error('not-found', `Distribution ${distId} not initialised`);
        }

        let {error, result} = Async.runSync(function (done) {
            queryExec(conn, done, ...args);
        });

        if (error) {
            Datasets.update({distribution: {$elemMatch: {_id: distId}}}, {$set: {'distribtuion.$.online': false}});
            throw new Meteor.Error(error.name, error.message);
        } else {
            Datasets.update({distribution: {$elemMatch: {_id: distId}}}, {$set: {'distribtuion.$.online': true}});
            return result;
        }
    }
}

//TODO close connections using settimeout

/*MongoDB*/
let mongoclient = Meteor.npmRequire("mongodb").MongoClient;

/*
 call with one parameter @distId or three parameters @url @username @pass
 */
let mongodbConnect = connectorFactory(function (url, username, pass, done) {
    if (username) {
        url = `mongodb://${username}:${pass}@${url.slice('mongodb://'.length)}`;
    }
    mongoclient.connect(url, done);
});

/* MySQL */
let mysql = Meteor.npmRequire('mysql');

let mysqlConnect = connectorFactory(function (url, username, pass, done) {
    url = url.match(/(mysql:\/\/)?(.*)/)[2];//strip off mysql://

    let options = {
        connectionLimit: 20,
        host: url
    };

    if (username) {
        options.user = username;
    }

    if (pass) {
        options.pass = pass;
    }

    let pool = mysql.createPool(options);

    done(null, pool);
});

/*RabbitMQ*/
let amqp = Meteor.npmRequire('amqplib/callback_api');
let amqpConnect = connectorFactory(function (url, username, pass, done) {
    let parts = url.match(/(amqps?:\/\/)?([^\?]*)\??(\S*)/),
        query = parts[3],
        params = query.split(/[=,&]/),
        exchanges = params[params.indexOf('exchange') + 1].split(',');//value of query exchange can be a comma separate list

    if (username) {
        url = parts[1] + `${username}:${pass}@` + parts[2] + (query ? `?${query}` : '');
    }

    amqp.connect(url, function (error, conn) {
        if (conn) {
            conn.exchanges = exchanges;
        }
        done(error, conn);
    });
});

Meteor.methods({
    //connect
    mongodbConnect,
    mysqlConnect,
    amqpConnect,

    //query
    mongodbQuery: queryerFactory(mongodbConnect, (conn, done, collection, selector = {}, options = {})=> {
        conn.collection(collection, function (error, col) {
            if (error) {
                throw new Meteor.Error(error.name, error.message);
            }
            let query = col.find(selector);

            for (let key in options) {
                if (options.hasOwnProperty(key)) {
                    query = query[key](options[key]);
                }
            }
            query.toArray(done);
        })
    }),
    //utils
    mongodbCollectionNames(distId){
        let db = connPool[distId];

        if (!db) {
            mongodbConnect(distId);
        }

        db = connPool[distId];

        if (!db) {
            throw new Meteor.Error('not-found', `Distribution ${distId} not initialised`);
        }

        let {error, result} = Async.runSync(function (done) {
            db.listCollections().toArray(done);
        });

        if (error) {
            throw new Meteor.Error(error.name, error.message);
        } else {
            result = result.filter(function (x) {
                return x.name !== 'system.indexes'
            });
            //console.log(result);
            return result;
        }
    },
    mysqlQuery: queryerFactory(mysqlConnect, (conn, done, query)=> {
        conn.query(query, done);// db.query returns a third argument @fields which is discarded
    }),
    sparqlQuery: queryerFactory(connectorFactory((url, username, pass, done)=> {
        done(null, url);
    }), (url, done, query)=> {
        HTTP.get(url, {
            params: {query}, timeout: 30000, headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/sparql-results+json'
            }
        }, function (error, result) {
            if (typeof result === 'object' && result.content) {
                try {
                    result = result.content;
                } catch (e) {
                    console.log(e);
                }
            }
            done(error, result);
        });
    }),
    amqpQuery: queryerFactory(amqpConnect, (conn, done, ex, sId)=> {
        let exchanges = conn.exchanges;
        if (_.contains(exchanges, ex)) {
            conn.createChannel(function (err, ch) {
                let socket = Streamy.sockets(sId);
                //keep the channel associate with a client (socket) to close it later
                if (channels[sId]) {
                    closeCh(channels[sId], sId);
                }
                channels[sId] = ch;
                ch.assertExchange(ex, 'fanout', {durable: false});
                ch.assertQueue('', {exclusive: true}, function (err, q) {
                    ch.on('close', function () {
                        console.log(`${sId} channel closed`);
                        Streamy.emit(q.queue, {content: `${sId} channel closed`}, socket);
                    });
                    done(err, q.queue);
                    Streamy.emit(q.queue, {content: " [*] Waiting for messages"}, socket);
                    ch.bindQueue(q.queue, ex, '');
                    ch.consume(q.queue, function (msg) {
                        //console.log(" [x] %s", msg.content.toString());
                        let content = msg.content.toString();
                        Streamy.emit(q.queue, {content}, socket);
                    }, {noAck: true});
                });
            });
        } else {
            return done(new Error('Unrecognised exchange'));
        }
    }),
    amqpCollectionNames(distId){
        let conn = connPool[distId];

        if (!conn) {
            amqpConnect(distId);
        }

        conn = connPool[distId];

        if (!conn) {
            throw new Meteor.Error('not-found', `Distribution ${distId} not initialised`);
        }

        return conn.exchanges;
    }
});

let channels = {};//socketId:channel, each socket only allows for one channels
function closeCh(ch, sId) {
    if (ch) {
        try {
            ch.close();
        }
        catch (e) {
            console.log(e.stackAtStateChange);
        }
        finally {
            delete channels[sId];
        }
    }
}
/**
 * Upon disconnect, clear the client database
 */
Streamy.onDisconnect(function (socket) {
    let sId = Streamy.id(socket),
        ch = channels[sId];

    closeCh(ch, sId);
    Streamy.broadcast('__leave__', {
        'sid': Streamy.id(socket)
    });
});

Streamy.on('amqp_end', function (socket) {
    let sId = Streamy.id(socket),
        ch = channels[sId];

    closeCh(ch, sId);
    Streamy.broadcast('__leave__', {
        'sid': Streamy.id(socket)
    });
});
