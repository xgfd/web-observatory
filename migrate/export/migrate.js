/**
 * Created by xgfd on 13/01/2016.
 */

var path = '../import/private/';

var sync = require('synchronize'),
    from = require('./config').from,
    MongoClient = require('mongodb').MongoClient,
    crypto = require('crypto'),
    enc_alg = 'aes256',
    fs = require('fs');

try {
    fs.mkdirSync(path);
}
catch (e) {
    if (e.errno === -17) {//folder exists
        //console.log(`Folder ${e.path} already exists`);
    } else {
        throw e;
    }
}

MongoClient.connect(from, function (err, fromDb) {
    if (err) {
        throw err;
    }

    sync.fiber(function () {
        //migrate users
        console.log('exporting users ...');
        var Clients = fromDb.collection('clients'),
            Users = fromDb.collection('users'),
            users = syncFind(Users, {});

        users = users.map(function (user) {
            return userTrans(user, Clients)
        });

        fs.writeFile(path + 'users', JSON.stringify(users, null, 2), function (err) {
            if (err) {
                throw err;
            }
        });

        //migrate datasets
        console.log('exporting datasets ...');

        var Entries = fromDb.collection('entries'),
            datasets = syncFind(Entries, {type: 'dataset'});

        datasets = datasets.map(datasetTrans);

        fs.writeFile(path + 'datasets', JSON.stringify(datasets, null, 2), function (err) {
            if (err) {
                throw err;
            }
        });
        //migrate apps
        console.log('exporting apps ...');
        var apps = syncFind(Entries, {type: 'visualisation'});

        apps = apps.map(appTrans);

        fs.writeFile(path + 'apps', JSON.stringify(apps, null, 2), function (err) {
            if (err) {
                throw err;
            }
        });

        fromDb.close();
    });
});

function syncFind(col, query) {
    var result = col.find(query);

    sync(result, 'toArray');
    return result.toArray();
}

//migrate users helper
function userTrans(user, Clients) {

    var meteorUser = {username: null, profile: {}, email: null};

    meteorUser.username = user.username || user.email;
    meteorUser.email = user.email;
    meteorUser.profile.name = user.firstName + ' ' + user.lastName;

    if (user.org) {
        meteorUser.profile.organisation = user.org;
    }

    if (user.clients) {
        var clients = user.clients;

        clients = clients.map(function (clientId) {
            var clients = syncFind(Clients, {_id: clientId}),
                clientSecret = clients[0].clientSecret,
                name = clients[0].name;
            return {clientId: clientId, clientSecret: clientSecret, name: name};
        });

        meteorUser.profile.clients = clients;
    }

    return meteorUser;
}

function datasetTrans(dataset) {
    var meteorDataset = {
        name: null,
        description: null,
        creator: null,
        publisher: null,
        datePublished: null,
        dateModified: null,
        keywords: [],
        license: null,
        aclMeta: true,
        aclContent: false,
        metaWhiteList: [],
        contentWhiteList: [],
        distribution: []
    };

    meteorDataset.name = dataset.name;
    meteorDataset.description = dataset.des;
    meteorDataset.publisher = dataset.publisher;
    meteorDataset.datePublished = dataset.pubdate;
    meteorDataset.dateModified = dataset.modified;
    meteorDataset.keywords = dataset.kw;

    if (Array.isArray(dataset.canView)) {
        dataset.canView.shift();
    }

    if (Array.isArray(dataset.canAccess)) {
        dataset.canAccess.shift();
    }

    meteorDataset.aclMeta = dataset.opVis;
    meteorDataset.aclContent = dataset.opAcc;
    meteorDataset.metaWhiteList = dataset.canView;
    meteorDataset.contentWhiteList = dataset.canAccess;
    meteorDataset.license = dataset.lice;

    var dist = {_id: null, url: null, fileFormat: null, online: null};
    dist._id = dataset._id;
    dist.url = dataset.url;
    dist.fileFormat = dataset.querytype;
    dist.online = dataset.alive;
    dist.instruction = dataset.queryinfo;

    if (dataset.auth && dataset.auth.user) {
        dist.profile = {};
        dist.profile.username = dataset.auth.user;
        var decipher = crypto.createDecipher(enc_alg, dataset.url);
        decipher.update(dataset.auth.encpwd, 'hex', 'utf8');
        try {
            dist.profile.pass = decipher.final('utf8');
        }
        catch (e) {
            console.log(e);
            console.log(dataset);
            delete dist.profile.username;
            delete dist.profile.pass;
        }
    }

    meteorDataset.distribution.push(dist);

    return meteorDataset;
}

function appTrans(app) {
    var meteorApp = {
        name: null,
        description: null,
        url: null,
        github: null,
        online: true,
        creator: null,
        publisher: null,
        datePublished: null,
        dateModified: null,
        keywords: [],
        license: null,
        aclMeta: true,
        aclContent: false,
        metaWhiteList: [],
        contentWhiteList: []
    };

    meteorApp.name = app.name;
    meteorApp.description = app.des;
    meteorApp.url = app.url;
    meteorApp.publisher = app.publisher;
    meteorApp.license = app.lice;
    meteorApp.github = app.git;
    meteorApp.online = app.alive;
    meteorApp.datePublished = app.pubdate;
    meteorApp.dateModified = app.modified;
    meteorApp.keywords = app.kw;

    if (Array.isArray(app.canAccess)) {
        app.canAccess.shift();
    }

    if (Array.isArray(app.canView)) {
        app.canView.shift();
    }

    meteorApp.aclMeta = app.opVis;
    meteorApp.aclContent = app.opAcc;
    meteorApp.metaWhiteList = app.canView;
    meteorApp.contentWhiteList = app.canAccess;

    if (app.related) {
        meteorApp.isBasedOnUrl = app.related.split(',');
    }

    return meteorApp;
}
