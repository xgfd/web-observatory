var http = require('http');
var domain = "web-001.ecs.soton.ac.uk";
var selectURL = '/openrdf-workbench/repositories/wo/query';
var updateURL = '/openrdf-workbench/repositories/wo/update';

var queryBuilders = {
    datasets: buildSELECTDataset,
    visualisations: buildSELECTVis
};

var updateQryBuilders = {
    visualisations: buildUpdateVis,
    datasets: buildUpdateDataset

};

function getPrefix() {
    var void_ = "PREFIX void: <http://rdfs.org/ns/void#>",
        schema = "PREFIX schema: <http://schema.org/>",
        dcterms = "PREFIX dcterms: <http://purl.org/dc/terms/>",
        wo = "PREFIX wo: <http://wo.ecs.soton.ac.uk/>",
        xsd = "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
        rdf = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>",
        foaf = "PREFIX foaf: <http://xmlns.com/foaf/0.1/>";
    return void_ + " " + schema + ' ' + dcterms + " " + wo + " " + xsd + " " + rdf + " " + foaf;
}

function buildSELECTDataset(visible, readable) {
    return buildSELECT('datasets', visible, readable);
}

function buildSELECTVis(visible) {
    return buildSELECT('visualisations', visible, null);
}

function buildSELECT(type, visible) {


    var qmap = {
        visualisations: 'rdf:type schema:WebPage; schema:isBasedOnUrl ?source. VALUES ?type {"Visualisation"} ',
        datasets: 'wo:readable ?readable; rdf:type schema:Dataset. '
    };

    var visibleUnion = '?entry wo:visible "true"^^xsd:boolean. ';
    if (visible && visible.length > 0) {
        var values = '';
        for (i = 0; i < visible.length; i++)
            values += '<'+visible[i] + '> ';

        visibleUnion = '{{' + visibleUnion + '} UNION {?entry wo:visible "false"^^xsd:boolean. VALUES ?entry { ' + values + '}}} ';
    }


    var myprefix = getPrefix();
    var query =
        'SELECT DISTINCT ?title ?url ?type ?desc ?email ?readable ?source ' +
        'WHERE { ' +
        '?entry schema:name ?title; ' +
        'schema:url ?url; ' +
        'schema:additionalType ?type; ' +
        'schema:description ?desc; ' +
        'schema:publisher ?publisher; ' +
        qmap[type] +
        visibleUnion +
        '?publisher schema:email ?email. ' +
        '}';
    query = myprefix + ' ' + query;
    return query;
}

function buildUpdateVis(data) {
    return buildUpdate('visualisations', data);
}

function buildUpdateDataset(data) {
    return buildUpdate('datasets', data);
}

function buildUpdate(type, data) {
    //console.log(JSON.stringify(data));
    //?title ?url ?type ?desc ?email ?readable ?source
    var typemap = {
        visualisations: 'schema:WebPage',
        datasets: 'schema:Dataset'
    };

    var title = data.title,
        url = data.url,
        base_class = typemap[type],
        addType = data.addType,
        desc = data.desc,
        email = data.email,
        username = data.username,
        visible = data.visible === 'false' ? '"false"^^xsd:boolean' : '"true"^^xsd:boolean',
        readable = data.readable === 'false' ? '"false"^^xsd:boolean' : '"true"^^xsd:boolean',

        prefix = getPrefix(),
        graph = 'wo:void',
        date = new Date(),
        offset = date.getTimezoneOffset(),

        sign = '+';

    if (offset < 0) {
        sign = '-';
        offset = offset * -1;
    }

    var h = parseInt(offset / 60),
        min = offset % 60;

    date = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate(); //yyyy-mm-dd
    date = '\'' + date + sign + h + ':' + min + '\'' + '^^xsd:date'; //'yyyy-mm-dd+hh:mm'^^xsd:date

    var entry = '<' + url + '>';

    //class
    //general info.
    //acl
    var query =
        entry + ' rdf:type ' + base_class + '; ' +
        'schema:additionalType "' + addType + '"; ' +
        'schema:name "' + title + '"; ' +
        'schema:description "' + desc + '"; ' +
        'schema:datePublished ' + date + '; ' +
        'schema:url "' + url + '"; ' +
        'schema:publisher _:pb; ' +
        (type === 'visualisations' ?
        'schema:isBasedOnUrl "' + data.source + '"; ' :
        '') +
        'wo:visible ' + visible + '; ' +
        'wo:readable ' + readable + '; ' +
        (data.creator ? 'schema:creator _:cr. _:cr rdf:type schema:Person; ' + ' schema:name "' + data.creator + '". ' :
        '') +
        '_:pb rdf:type schema:Person; ' +
        (username ? 'schema:name "' + username + '". ' : '') +
        'schema:email "' + email + '". ';
    query = prefix + ' INSERT DATA { GRAPH ' + graph + ' { ' + query + ' } } ';

    return query;
}
/**
 *bindings: results from sparql query
 *readable: list of urls of datasets that are readable to the current user
 */

function tableEntries(bindings, readable) {
    console.log(JSON.stringify(bindings));

    var fields = [
            'title',
            'url',
            'type',
            'desc',
            'email',
            'readable',
            'source'
    ];
    var rows = [];
    for (i = 0; i < bindings.length; i++) {
        var binding = bindings[i];
        //console.log(JSON.stringify(binding));
        var row = {};
        for (i = 0; i < fields.length; i++) {
            row[fields[i]] = binding[fields[i]] ? binding[fields[i]].value : false;
        }
        //readable to the current user? set readable to true
        if (row.readable &&
            row.readable === 'false' &&
            readable.indexOf(row.url) != -1) {
            row.readable = 'true';
        }
        rows.push(row);
    }
    return rows;
}

module.exports.SPARQLGetContent = function(type, visible, readable, cb) {
    var query = queryBuilders[type](visible);
    console.log('Select query');
    console.log(query);
    var opts = {
        port: 8080,
        host: domain,
        path: selectURL + '?query=' + encodeURIComponent(query) + '&content-type=application/sparql-results+json',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/sparql-results+json'
        }
    };

    var req = http.request(opts, function(res) {
        console.log("Got response: " + res.statusCode);
        if (res.statusCode === 404)
            return cb({
                message: 'List of datasets not available'
            });
        var data = "";
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on('end', function() {
            console.log(data);
            data = JSON.parse(data);
            var rows = [];
            if (data.results) {
                var bindings = data.results.bindings;
                if (bindings.length == 1 &&
                    bindings[0]['error-message']) {
                    return cb({
                        message: bindings[0]['error-message'].value
                    });
                }
                rows = tableEntries(bindings, readable);
                cb(false, rows);
            } else {
                cb({
                    message: 'No entry retrieved'
                });
            }
        });
    }).on('error', function(e) {
        console.log("SPARQL get content error: " + e.message);
        cb(e);
    });
    req.end();
};

module.exports.SPARQLUpdateContent = function(type, data, cb) {

    var query = updateQryBuilders[type](data);
    console.log('Update query');
    console.log(query);
    var opts = {
        method: 'post',
        port: 8080,
        host: domain,
        path: updateURL + '?update=' + encodeURIComponent(query),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/sparql-results+json'
        }
    };

    var req = http.request(opts, function(res) {
        console.log("Got update response: " + res.statusCode);
        if (res.statusCode === 404)
            return cb({
                message: 'List of datasets not available'
            });
        var data = "";
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on('end', function() {
            if (data) {
                console.log(data);
                data = JSON.parse(data);
                var message = data.results.bindings;
                //console.log(message);
                cb({
                    'message': message
                });
            } else
                cb(false);

        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
        cb(e);
    });

    req.end();

};
