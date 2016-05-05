/**
 *
 * Created by xw4g08 on 16/10/2014.
 */

var queries = require('./dataset/queries.js'),
    winstonLogger = require('../../app/util/logger'),
    crypto = require('crypto');

function stream(req, res, next) {
    "use strict";
    var query, queryDriver, io, streamid, ds;

    ds = req.attach.dataset;

    queryDriver = queries.drivers[ds.querytype.toLowerCase()];
    if (!queryDriver) {
        return next({message: 'Dataset type not supported'});
    }

    query = req.query.query || req.query.ex || req.body.query || req.body.ex;
    io = req.secure ? req.app.get('socketioSSL') : req.app.get('socketio');
    streamid = 'socket:' + req.ip + ':' + crypto.randomBytes(32).toString('base64').replace(/\//g, '_').replace(/\+/g, '-');
    io.of(streamid)
        .on('connection', function (socket) {

            winstonLogger.info(streamid + ' channel connected');
            var channel;
            queryDriver(query, null, ds, function (err, result, ch) {
                if (err) {
                    result = err.message;
                    socket.emit('closed', err.message);
                }
                if (ch) {
                    channel = ch;
                }
                socket.emit('chunk', result);
            });

            socket.on('disconnect', function () {
                winstonLogger.info(streamid + ' channel disconnected');
                if (channel) {
                    channel.close();
                }
                socket.emit('closed', null);
            });

            socket.on('stop', function () {
                winstonLogger.info(streamid + ' channel stopped');
                if (channel) {
                    channel.close();
                }
                socket.emit('closed', null);
            });
        });

    if (0 === req.path.indexOf('/api')) {
        return res.send(streamid);
    }

    return res.render('query/streamview', {streamid: streamid});
    //next();
}

function mongostream(req, res, next) {
    "use strict";

    var queryDriver, query, limit, skip, project, modname, ds;

    ds = req.attach.dataset;

    queryDriver = queries.drivers[ds.querytype.toLowerCase()];
    if (!queryDriver) {
        return next({message: 'Dataset type not supported'});
    }

    query = req.query.query || req.body.query;
    modname = req.query.collection || req.body.collection || req.query.modname || req.body.modname;
    limit = req.query.limit || req.body.limit;
    skip = req.query.skip || req.body.skip;
    project = req.query.project || req.body.project;

    if (modname) {
        query = {
            modname: modname,
            query: query,
            limit: limit ? parseInt(limit) : 1000,
            skip: skip ? parseInt(skip) : 0,
            project: project || '{}'
        };
    }

    queryDriver(query, null, ds, function (err, stream) {
        if (err) {
            return next(err);
        }

        stream.pipe(res);
    });
}

function nonstream(req, res, next) {
    "use strict";

    var queryDriver, query, mime, ds;

    ds = req.attach.dataset;
    queryDriver = queries.drivers[ds.querytype.toLowerCase()];
    mime = req.query.format || req.body.format;
    query = req.query.query || req.body.query;

    queryDriver(query, mime === 'display' ? 'application/sparql-results+json' : mime, ds, function (err, result) {
        if (err) {
            return next(err);
        }

        if (!mime || mime === 'display') {
            res.send(result);
        } else {
            res.attachment('result.txt');
            res.end(result, 'UTF-8');
        }
    });
}

module.exports = function (req, res, next) {//dispatch function
    "use strict";
    var ds, queryDriver;

    ds = req.attach.dataset;
    if (!ds) {
        return next({message: 'Please select a dataset'});
    }

    queryDriver = queries.drivers[ds.querytype.toLowerCase()];
    if (!queryDriver) {
        return next({message: 'Dataset type not supported'});
    }

    switch (ds.querytype) {
        case 'AMQP':
            stream(req, res, next);
            break;
        case 'MongoDB':
            mongostream(req, res, next);
            break;
        default:
            nonstream(req, res, next);
    }
};