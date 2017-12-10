var storeLib = require('/lib/store');

exports.post = function (req) {
    var leagueId = JSON.parse(req.body).leagueId;
    var leaguePlayers = storeLib.getLeaguePlayersByLeagueId(leagueId);

    //Filters players not having played in the X last games
    var firstRankingGame = storeLib.getFirstRankingGame(leagueId);
    if (firstRankingGame) {
        var timeMin = firstRankingGame.time;
        leaguePlayers = leaguePlayers.filter(function (leaguePlayer) {
            var lastGamePlayer = storeLib.getLastGamePlayerByLeagueIdPlayerId(leagueId, leaguePlayer.playerId);
            return lastGamePlayer && lastGamePlayer.time.localeCompare(timeMin) >= 0;
        });
    }

    //Adapt for ramping users
    leaguePlayers.forEach(function (leaguePlayer) {
        var gamesCount = storeLib.getGamesCountByLeagueIdPlayerId(leagueId, leaguePlayer.playerId);
        leaguePlayer.gamesCount = gamesCount;
        leaguePlayer.rampingCoef = 0.75 + 0.25 * Math.min(50, gamesCount) / 50;
        leaguePlayer.rampedRating = leaguePlayer.rating * leaguePlayer.rampingCoef;
    });

    //Gather additional info and remove useless
    var ranking = leaguePlayers.map(function (leaguePlayer) {
        var player = storeLib.getByKey(leaguePlayer.playerId);
        return {
            name: player && player.name,
            imageUrl: player && '/players/image/' + player._versionKey + '/' + encodeURIComponent(player.name),
            rating: leaguePlayer.rating,
            rampedRating: leaguePlayer.rampedRating,
            rampingCoef: leaguePlayer.rampingCoef,
            gamesCount: leaguePlayer.gamesCount
        };
    });

    //Sorting players by ramped rating DESC
    ranking = ranking.sort(function (ranking1, ranking2) {
        return ranking2.rampedRating - ranking1.rampedRating;
    });

    return {
        contentType: 'application/json',
        body: {
            data: ranking
        }
    }
};
