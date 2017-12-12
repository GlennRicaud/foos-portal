var storeLib = require('/lib/store');

exports.post = function (req) {
    var leagueId = JSON.parse(req.body).leagueId;

    var playersMap = {};
    var playerRankingData = getPlayerRankingData(leagueId);
    playerRankingData.forEach(function(playerRankingDataItem) {
        var player = storeLib.getByKey(playerRankingDataItem.competitorId);
        playersMap[playerRankingDataItem.competitorId] = {
            name: player && player.name,
            imageUrl: player && '/players/image/' + player._versionKey + '/' + encodeURIComponent(player.name)
        }
    });
    
    return {
        contentType: 'application/json',
        body: {
            data: {
                playerRanking: playerRankingData,
                players: playersMap,
                games: getGamesData(leagueId)
            }
        }
    }
};

function getPlayerRankingData(leagueId) {
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
    var ranking = leaguePlayers.map(function (leaguePlayer) {
        return {
            competitorId: leaguePlayer.playerId,
            rating: leaguePlayer.rating,
            rampedRating: leaguePlayer.rampedRating,
            rampingCoef: leaguePlayer.rampingCoef,
            gamesCount: leaguePlayer.gamesCount
        };
    });

    //Sorting players by ramped rating DESC
    return ranking.sort(function (ranking1, ranking2) {
        return ranking2.rampedRating - ranking1.rampedRating;
    });
}

function getGamesData(leagueId) {
    return [];
}

function getLeaguePlayersByLeagueId(leagueId) {
    return storeLib.get({
        query: 'type="leaguePlayer" AND leagueId="' + leagueId + '"',
        count: 1024
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
