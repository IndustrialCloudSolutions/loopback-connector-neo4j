'use strict';

var GraphDatabase = require('neo4j').GraphDatabase;

exports.initialize = function (dataSource, cb) {
    var settings = dataSource.settings;
    var db = new GraphDatabase(settings.neo4j_url);
    dataSource.connector = new Neo4j(db);
    dataSource.db = db;
    cb && cb();
}

/**
 * @constructor
 * @param {Object} db
 */
function Neo4j (db) {
    this.db = db;
}

var neo4j = Neo4j.prototype;

neo4j.create = function (model, data, cb) {
    var query = 'create (n:%node% {data}) return n'
        .replace('%node%', model);
    var params = { data: data };

    this.db.query(query, params, function (err, results) {
        if (err) return cb(err);
        cb(null, results[0][model]);
    });
}

neo4j.save = function (model, data, cb) {
    console.log('save...');
    cb();
}

neo4j.all = function (model, filter, cb) {
    var keys = Object.keys(filter);
    var keyToSymbol = function (key) {
        return key + ':{filter}.' + key;
    }
    var f = keys
        .reduce(function (out, k, i) {
            var symbol = keyToSymbol(k);
            if (keys.length === 0) {
                out = '';
            } else if (keys.length === 1) {
                out = '{ ' + symbol + '}';
            } else if (i === 0) {
                out = '{ ' + symbol;
            } else if (i === keys.length-1) {
                out = out + ',' + symbol;
            } else {
                out = out + ',' + symbol + '}';
            }
            return out;
        }, '');

    var query = ('match (n:%node% ' + f + ') return n')
        .replace('%node%', model);
    var params = { filter: filter };

    this.db.query(query, params, function (err, results) {
        if (err) return cb(err);
        cb(null, results.map(function (r) {
            return r.n.data;
        }));
    });
}

neo4j.find = function (model, id, cb) {
    this.db.getNodeById(id, function (err, node) {
        if (err) return cb(err);
        cb(null, node.data);
    });
}

neo4j.exists = function (model, id, cb) {
    console.log('exists...')
    cb();
}

neo4j.destroy = function (model, id, cb) {
    var query = 'match (n:%node%) where ID(n) = {id} delete n'
        .replace('%node%', model);
    var params = { id: Number(id) };
    this.db.query(query, params, cb);
}

neo4j.count = function (model, cb, where) {
    console.log('count', where);
    cb();
};

neo4j.updateAttributes = function (model, id, data, cb) {
    console.log('updateAttributes', id, data)
    cb();
};
