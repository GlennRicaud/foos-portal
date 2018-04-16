var nodeLib = require('/lib/xp/node');

exports.getByKey = function (nodeKey) {
    return connect().get(nodeKey);
};

exports.get = function (params) {
    var connection = connect();
    var ids = connection.query(params).hits.map(function (hit) {
        return hit.id;
    });
    if (ids.length > 0) {
        return connection.get(ids);
    }
    return null;
};

exports.ids = function (params) {
    return connect().query(params).hits.map(function (hit) {
        return hit.id;
    });
};

exports.count = function (params) {
    params.count = 0;
    return connect().query(params).total;
};

exports.query = function (params) {
    return connect().query(params);
};

function connect() {
    return nodeLib.connect({
        repoId: 'office-league',
        branch: 'master'
    });
}