var storeLib = require('/lib/store');
var cacheLib = require('/lib/cache');

var GAME_RANGE = 200;

var cache = cacheLib.newCache({
    size: 32,
    expire: 86400
});

/*
1113 games played
5393 goals scored
52% games won
4.85 goals per game
own goals

games played...
goals scored...
% games won...
goals per game...
+25 points today...
+100 points this week...
-20 points this month...
 */

exports.post = function (req) {
    var body = JSON.parse(req.body);
    var playerId = body.playerId;
    var leagueId = body.leagueId;

    return {
        contentType: 'application/json',
        body: {
            data: {
                playerProfile: getData(leagueId, playerId)
            }
        }
    }
};

function getData(leagueId, playerId) {
    var playersData = {};
    var player = getPlayerData(playerId);
    playersData.player = player;
    playersData.stats = getPlayerStats(leagueId, playerId);
    var rankingData = getRankingForPlayerLeague(playerId, leagueId);
    playersData.stats.ranking = rankingData.ranking;
    playersData.stats.rating = rankingData.rating;

    return playersData;
}

function getPlayerData(playerId) {
    var player = storeLib.getByKey(playerId);
    if (!player) {
        return null;
    }
    var imageUrl = '/players/image/' + player._versionKey + '/' + encodeURIComponent(player.name);
    return {
        playerId: player._id,
        name: player.name,
        nationality: player.nationality,
        description: player.description,
        imageUrl: imageUrl
    };
}

function getPlayerStats(leagueId, playerId) {
    var stats = {
        gameCount: getGameCountByPlayerId(leagueId, playerId),
        winningGameCount: getWinningGameCountByPlayerId(leagueId, playerId),
        goalCount: getGoalCountByPlayerId(leagueId, playerId),
        ownGoalCount: getOwnGoalCountByPlayerId(leagueId, playerId)
    };

    var goalsPerGame = stats.goalCount / stats.gameCount;
    var maxGoalsPerGame = 10 * .75; // 10 -> take it from league config
    stats.attack = goalsPerGame / maxGoalsPerGame;

    var games = getLastPlayerGames(playerId, GAME_RANGE);
    var goalsReceived = 0, gameLengthAvg = 0, teamGoals = 0, teamReceivedGoals = 0, teamGames = 0, gamesScoringLast2 = 0;
    for (var i = 0; i < games.length; i++) {
        var game = games[i];
        if (game.gameTeams && game.gameTeams.length === 2) {
            teamGames++;
            teamGoals += getTeamGoals(game, playerId);
            teamReceivedGoals += getTeamReceivedGoals(game, playerId);
        }
        if (playerTeamScoreLast2(game, playerId)) {
            gamesScoringLast2++;
        }
        goalsReceived += getGoalsReceivedInDefense(game, playerId);
        var gameLength = game.points[game.points.length - 1].time;
        gameLengthAvg += gameLength;
    }

    teamReceivedGoals = teamReceivedGoals / teamGames;

    stats.goalsReceivedPerGame = goalsReceived / games.length;
    stats.defense = Math.min(((10 - teamReceivedGoals) / 5), 1);
    stats.goalKeeping = Math.min(((5 - stats.goalsReceivedPerGame) / 5) * 2, 1);
    stats.stamina = Math.min((gamesScoringLast2 / games.length) * 1.25, 1);
    stats.teamwork = Math.min((teamGoals / teamGames) / 10, 1);
    return stats;
}

function playerTeamScoreLast2(game, playerId) {
    var p, gp, side, players = {};
    for (p = 0; p < game.gamePlayers.length; p++) {
        gp = game.gamePlayers[p];
        if (gp.playerId === playerId) {
            side = gp.side;
            break;
        }
    }
    for (p = 0; p < game.gamePlayers.length; p++) {
        gp = game.gamePlayers[p];
        if (gp.side === side) {
            players[gp.playerId] = gp;
        }
    }

    if (!game.points) {
        return false;
    }
    var pointCount = game.points.length;
    if (pointCount < 2) {
        return false;
    }
    return !!(players[game.points[pointCount - 1].playerId] && players[game.points[pointCount - 2].playerId]);
}

function getGoalsReceivedInDefense(game, playerId) {
    var gamePlayersByPlayer = {}, gp;
    for (var p = 0; p < game.gamePlayers.length; p++) {
        gp = game.gamePlayers[p];
        gamePlayersByPlayer[gp.playerId] = gp;
    }

    var playerSide = gamePlayersByPlayer[playerId].side, playerPosition = gamePlayersByPlayer[playerId].position;
    var goalCount = 0, blueScore = 0, redScore = 0, firstHalf = true;

    for (var i = 0; i < game.points.length; i++) {
        var point = game.points[i];
        var against = point.against;
        var pid = point.playerId;
        var gamePlayer = gamePlayersByPlayer[pid];
        var side = gamePlayer.side;
        if (side === 'red') {
            if (against) {
                blueScore++;
            } else {
                redScore++;
            }
        } else {
            if (against) {
                redScore++;
            } else {
                blueScore++;
            }
        }
        firstHalf = blueScore <= 5 && redScore <= 5;
        // log.info('blue: ' + blueScore + '  -  ' + 'red: ' + redScore + (firstHalf ? ' 1st' : ' 2nd'));

        if (!against && (side !== playerSide) && !isPlayerAttacking(playerSide, playerPosition, firstHalf)) {
            goalCount++;
        }
    }

    return goalCount;
}

function getTeamGoals(game, playerId) {
    var p, gp, side, gt;
    for (p = 0; p < game.gamePlayers.length; p++) {
        gp = game.gamePlayers[p];
        if (gp.playerId === playerId) {
            side = gp.side;
            break;
        }
    }

    var t, gt;
    for (t = 0; t < game.gameTeams.length; t++) {
        gt = game.gameTeams[t];
        if (gt.side === side) {
            return gt.score;
        }
    }
    return 0;
}

function getTeamReceivedGoals(game, playerId) {
    var p, gp, side, gt;
    for (p = 0; p < game.gamePlayers.length; p++) {
        gp = game.gamePlayers[p];
        if (gp.playerId === playerId) {
            side = gp.side;
            break;
        }
    }

    var t, gt;
    for (t = 0; t < game.gameTeams.length; t++) {
        gt = game.gameTeams[t];
        if (gt.side !== side) {
            return gt.score;
        }
    }
    return 0;
}

function isPlayerAttacking(side, position, firstHalf) {
    var isAttacking;
    if (side === 'blue') {
        isAttacking = position === 0;
    } else if (side === 'red') {
        isAttacking = position === 1;
    } else {
        throw "Invalid player side: " + side;
    }
    isAttacking = firstHalf ? isAttacking : !isAttacking;
    return isAttacking;
}

function getLastPlayerGames(playerId, gameCount) {
    var gamePlayers = storeLib.get({
        query: 'type="gamePlayer" AND playerId="' + playerId + '"',
        count: gameCount,
        sort: 'time DESC'
    });

    var gameIds = gamePlayers.map(function (gp) {
        return gp.gameId;
    });

    var games = storeLib.getByKey(gameIds);
    games = games.filter(function (game) {
        return !!game.finished && game.points && game.points.length > 0;
    });
    for (var g = 0; g < games.length; g++) {
        getGamePlayersForGame(games[g]);
        getGameTeamsForGame(games[g]);
    }

    return games;
}

function getGamePlayersForGame(game) {
    var gamePlayers = storeLib.get({
        query: 'type="gamePlayer" AND _parentPath="' + game._path + '"',
        sort: 'time DESC'
    });
    game.gamePlayers = gamePlayers;
    return game;
}

function getGameTeamsForGame(game) {
    var gameTeams = storeLib.get({
        query: 'type="gameTeam" AND _parentPath="' + game._path + '"',
        sort: 'time DESC'
    });
    game.gameTeams = gameTeams;
    return game;
}

/**
 * Get the number of games of a player.
 * @param  {string} leagueId League id.
 * @param  {string} playerId Player id.
 * @return {number} Total number of games.
 */
function getGameCountByPlayerId(leagueId, playerId) {
    return storeLib.count({
        start: 0,
        count: 0,
        query: "type = 'gamePlayer' AND playerId='" + playerId + "' AND leagueId='" + leagueId + "'"
    });
}

/**
 * Get the number of won games of a player.
 * @param  {string} leagueId League id.
 * @param  {string} playerId Player id.
 * @return {number} Total number of won games.
 */
function getWinningGameCountByPlayerId(leagueId, playerId) {
    return storeLib.count({
        start: 0,
        count: 0,
        query: "type = 'gamePlayer' AND playerId='" + playerId + "' AND leagueId='" + leagueId + "' AND winner = 'true'"
    });
}

/**
 * Get the number of goals scored by a player.
 * @param  {string} leagueId League id.
 * @param  {string} playerId Player id.
 * @return {number} Total number of goals.
 */
function getGoalCountByPlayerId(leagueId, playerId) {
    var queryResult = storeLib.query({
        start: 0,
        count: 0,
        query: "type = 'gamePlayer' AND playerId='" + playerId + "' AND leagueId='" + leagueId + "'",
        aggregations: {
            goalStats: {
                stats: {
                    "field": "score"
                }
            }
        }
    });
    return queryResult.aggregations && queryResult.aggregations.goalStats ? queryResult.aggregations.goalStats.sum : 0;
}

/**
 * Get the number of own goals scored by a player.
 * @param  {string} leagueId League id.
 * @param  {string} playerId Player id.
 * @return {number} Total number of goals.
 */
function getOwnGoalCountByPlayerId(leagueId, playerId) {
    var queryResult = storeLib.query({
        start: 0,
        count: 0,
        query: "type = 'gamePlayer' AND playerId='" + playerId + "' AND leagueId='" + leagueId + "'",
        aggregations: {
            goalStats: {
                stats: {
                    "field": "scoreAgainst"
                }
            }
        }
    });
    return queryResult.aggregations && queryResult.aggregations.goalStats ? queryResult.aggregations.goalStats.sum : 0;
}

/**
 * Get the ranking position for a player in a league.
 * @param  {string} playerId Player id.
 * @param  {string} leagueId League id.
 * @return {object} Ranking position and rating points.
 */
function getRankingForPlayerLeague(playerId, leagueId) {
    var result = storeLib.get({
        start: 0,
        count: -1,
        query: "type = 'leaguePlayer' AND leagueId='" + leagueId + "' AND (inactive != 'true') AND (pending != 'true')",
        sort: "rating DESC"
    });

    if (result.count === 0) {
        return {ranking: -1, rating: -1};
    }

    var ranking = 0, prevRating = 0, incrementValue = 1;
    for (var i = 0; i < result.length; i++) {
        if (prevRating != result[i].rating) {
            ranking += incrementValue;
            incrementValue = 1;
        } else {
            incrementValue++;
        }
        if (result[i].playerId === playerId) {
            return {ranking: ranking, rating: result[i].rating};
        }
        prevRating = result[i].rating;
    }

    return {ranking: -1, rating: -1};
}

/**
 * Get the longest game time in seconds.
 * @param  {string} leagueId League id.
 * @return {number} Time in seconds.
 */
function getLongestGameTime(leagueId) {
    var queryResult = storeLib.query({
        start: 0,
        count: 0,
        query: "type = 'game' AND leagueId='" + leagueId + "'",
        aggregations: {
            gameTimeStats: {
                stats: {
                    "field": "points.time"
                }
            }
        }
    });
    return queryResult.aggregations && queryResult.aggregations.gameTimeStats ? queryResult.aggregations.gameTimeStats.max : 0;
}