var storeLib = require('/lib/store');

exports.post = function (req) {
    var leagueId = JSON.parse(req.body).leagueId;
    var leaguePlayers = storeLib.getLeaguePlayersByLeagueId(leagueId);

    //Filters players not having played in the X last games
    var firstRankingGame = storeLib.getFirstRankingGame(leagueId);
    log.info('firstRankingGame.time:' + firstRankingGame.time);
    if (firstRankingGame) {
        var timeMin = firstRankingGame.time;
        leaguePlayers = leaguePlayers.filter(function (leaguePlayer) {
            var lastGamePlayer = storeLib.getLastGamePlayerByLeagueIdPlayerId(leagueId, leaguePlayer.playerId);
            log.info(lastGamePlayer && lastGamePlayer.time);
            return lastGamePlayer && lastGamePlayer.time.localeCompare(timeMin) >= 0;
        });
    }

    //Adapt for ramping users
    leaguePlayers.forEach(function (leaguePlayer) {
        var gamesCount = storeLib.getGamesCountByLeagueIdPlayerId(leagueId, leaguePlayer.playerId);
        leaguePlayer.gamesCount = gamesCount;
        leaguePlayer.rampedRating = leaguePlayer.rating * ( 0.5 + 0.5 * Math.min(50, gamesCount) / 50);
    });

    //Gather additional info and remove useless
    var ranking = leaguePlayers.map(function (leaguePlayer) {
        var player = storeLib.getByKey(leaguePlayer.playerId);
        return {
            playerName: player && player.name,
            rating: leaguePlayer.rating,
            rampedRating: leaguePlayer.rampedRating,
            gamesCount: leaguePlayer.gamesCount
        };
    });

    return {
        contentType: 'application/json',
        body: {
            data: ranking
        }
    }
};

function hasPlayerEnoughGames(leaguePlayerId) {

}

