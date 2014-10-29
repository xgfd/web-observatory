/**
 *
 * Created by xw4g08 on 16/10/2014.
 */

var queries = require('./dataset/queries.js'),
    logger = require('../../app/util/logger');

module.exports = function (req, res, next) {
    "use strict";

    var queryDriver, query, mime, modname, qtyp, ds, qlog, io;
    if (!req.attach.dataset) {
        return res.redirect(req.get('referer'));
    }

    query = req.query.query || req.body.query;
    mime = req.query.format || req.body.format;
    modname = req.query.modname || req.body.modname;
    qtyp = req.params.typ;
    ds = req.attach.dataset;

    if (modname) {
        query = {
            modname: modname,
            query: query
        };
    }

    qlog = {};
    qlog.time = new Date();
    qlog.ip = req.connection.remoteAddress;
    qlog.query = query;
    qlog.usrmail = req.user ? req.user.email : '';

    qlog.ds = ds.url;
    queryDriver = queries.drivers[ds.querytype.toLowerCase()];
    if (!queryDriver) {
        req.flash('error', ['Dataset type not supported']);
        res.redirect(req.get('referer'));
    } else {
        if (ds.querytype === 'AMQP') {
            io = req.secure ? require('../../app').socketioSSL : require('../../app').socketio;
            io.on('connection', function (socket) {
                var channel;
                queryDriver(query, mime === 'display' ? 'text/csv' : mime, ds, function (err, result, ch) {
                    if (ch) {
                        channel = ch;
                    }
                    socket.emit('chunk', result);
                });
                
                socket.on('disconnect', function () {
                    console.log('channel close');
                    channel.close();
                });
                
                socket.on('stop', function () {
                    console.log('channel close');
                    channel.close();
                });
            });

            return res.render('query/streamview');
        }
        queryDriver(query, mime === 'display' ? 'text/csv' : mime, ds,
            function (err, result) {
                //qlog.result = JSON.stringify(result);
                logger.info(qlog);
                if (err) {
                    return next(err);
                }

                if (mime === 'display') {
                    var viewer = 'jsonview';
                    if (qtyp === 'sparql') {
                        viewer = 'csvview';
                    }
                    res.render('query/' + viewer, {
                        'result': result,
                        'info': req.flash('info'),
                        'error': req.flash('error')
                    });
                } else {
                    res.attachment('result.txt');
                    res.end(result, 'UTF-8');
                }
            }
        );
    }
}