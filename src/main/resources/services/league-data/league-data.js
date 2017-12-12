var storeLib = require('/lib/store');

exports.post = function (req) {
    var leagueId = JSON.parse(req.body).leagueId;

    var playersData = {};
    getPlayerRankingData(leagueId, playersData);
    getPlayersData(playersData);
    //getRatingData(playersData);

    return {
        contentType: 'application/json',
        body: {
            data: {
                playersData: playersData
            }
        }
    }
};

function getPlayerRankingData(leagueId, playersData) {
    var leaguePlayers = getLeaguePlayersByLeagueId(leagueId);

    //Filters players not having played in the X last games
    var firstRankingGame = getFirstRankingGame(leagueId);
    if (firstRankingGame) {
        var timeMin = firstRankingGame.time;
        leaguePlayers = leaguePlayers.filter(function (leaguePlayer) {
            var lastGamePlayer = getLastGamePlayerByLeagueIdPlayerId(leagueId, leaguePlayer.playerId);
            return lastGamePlayer && lastGamePlayer.time.localeCompare(timeMin) >= 0;
        });
    }

    //Adapt for ramping users
    leaguePlayers.forEach(function (leaguePlayer) {
        var gamesCount = getGamesCountByLeagueIdPlayerId(leagueId, leaguePlayer.playerId);
        leaguePlayer.gamesCount = gamesCount;
        leaguePlayer.rampingCoef = 0.75 + 0.25 * Math.min(50, gamesCount) / 50;
        leaguePlayer.rampedRating = leaguePlayer.rating * leaguePlayer.rampingCoef;
    });

    //Gather additional info and remove useless
    leaguePlayers.forEach(function (leaguePlayer) {
        playersData[leaguePlayer.playerId] = {
            rating: leaguePlayer.rating,
            rampedRating: leaguePlayer.rampedRating,
            rampingCoef: leaguePlayer.rampingCoef,
            gamesCount: leaguePlayer.gamesCount
        };
    });
}

function getPlayersData(playersData) {
    for (var playerId in playersData) {
        var player = storeLib.getByKey(playerId);
        playersData[playerId].name= player && player.name;
        playersData[playerId].imageUrl= player && '/players/image/' + player._versionKey + '/' + encodeURIComponent(player.name);
    }
}

// function getGamesData(leagueId) {
//     return getGamesByLeagueId(leagueId).map(function (game) {
//         var playerDeltas = getGamePlayersByGameId(game._id).map(function (gamePlayer) {
//             return {
//                 competitorId: gamePlayer.playerId,
//                 delta: gamePlayer.ratingDelta
//             };
//         });
//         return {
//             playerDeltas: playerDeltas
//         };
//     });
// }

function getLeaguePlayersByLeagueId(leagueId) {
    return storeLib.get({
        query: 'type="leaguePlayer" AND leagueId="' + leagueId + '"',
        count: 1024
    });
}

function getGamePlayersByGameId(gameId) {
    return storeLib.get({
        query: 'type="gamePlayer" AND gameId="' + gameId + '"',
        count: 4
    });
}

function getGamesByLeagueId(leagueId) {
    return storeLib.get({
        query: 'type="game" AND leagueId="' + leagueId + '"',
        count: 100,
        sort: 'time DESC'
    });
}

function getFirstRankingGame(leagueId) {
    return storeLib.get({
        query: 'type="game" AND leagueId="' + leagueId + '"',
        start: 99,
        count: 1,
        sort: 'time DESC'
    });
}

function getLastGamePlayerByLeagueIdPlayerId(leagueId, playerId) {
    return storeLib.get({
        query: 'type="gamePlayer" AND leagueId="' + leagueId + '" AND playerId="' + playerId + '"',
        count: 1,
        sort: 'time DESC'
    });
}

function getGamesCountByLeagueIdPlayerId(leagueId, playerId) {
    return storeLib.count({
        query: 'type="gamePlayer" AND leagueId="' + leagueId + '" AND playerId="' + playerId + '"'
    });
}
