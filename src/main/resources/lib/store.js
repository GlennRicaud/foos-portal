var nodeLib = require('/lib/xp/node');

exports.getLeaguePlayersByLeagueId = function (leagueId) {
    return get({
        query: 'type="leaguePlayer" AND leagueId="' + leagueId + '"',
        count: 1024
    });
};

exports.getFirstRankingGame = function (leagueId) {
    return get({
        query: 'type="game" AND leagueId="' + leagueId + '"',
        start: 99,
        count: 1,
        sort: 'time DESC'
    });
};

exports.getLastGamePlayerByLeagueIdPlayerId = function (leagueId, playerId) {
    return get({
        query: 'type="gamePlayer" AND leagueId="' + leagueId + '" AND playerId="' + playerId + '"',
        count: 1,
        sort: 'time DESC'
    });
};

exports.getGamesCountByLeagueIdPlayerId = function (leagueId, playerId) {
    return count({
        query: 'type="gamePlayer" AND leagueId="' + leagueId + '" AND playerId="' + playerId + '"'
    });
};

exports.getByKey = function (nodeKey) {
    return connect().get(nodeKey);
};

function get(params) {
    var connection = connect();
    var ids = connection.query(params).hits.map(function (hit) {
        return hit.id;
    });
    if (ids.length > 0) {
        return connection.get(ids);
    }
    return null;
}

function ids(params) {
    return connect().query(params).hits.map(function (hit) {
        return hit.id;
    });
}

function count(params) {
    params.count = 0;
    return connect().query(params).total;
}

function connect() {
    return nodeLib.connect({
        repoId: 'office-league',
        branch: 'master'
    });
}