var storeLib = require('/lib/store');
var cacheLib = require('/lib/cache');

var GAME_RANGE = 100;
var PLAYER_RAMPING_DURATION = 50;
var TEAM_RAMPING_DURATION = 20;
var STARTING_RAMPING_COEF = 0.80;

var cache = cacheLib.newCache({
    size: 32,
    expire: 86400
});

exports.post = function (req) {
    var leagueId = JSON.parse(req.body).leagueId;
    var lastGame = getLastGame(leagueId);
    var lastGameTime = lastGame ? lastGame.time : '';
    
    return {
        contentType: 'application/json',
        body: cache.get(leagueId + lastGameTime, function() {
            log.info('Retrieving data for league ' + leagueId + ' and latest game ' + lastGameTime);
            return getData(leagueId); 
        })
    }
};

function getData(leagueId) {
    var playersData = {};
    var teamsData = {};
    var gameDates = [];
    getEntityRankingData(leagueId, playersData, 'Player');
    getEntityRankingData(leagueId, teamsData, 'Team');
    getEntitiesData(playersData, 'Player');
    getEntitiesData(teamsData, 'Team');
    getEntityRatingData(leagueId, playersData, teamsData, gameDates);
    
    var playersDivisions = getEntitiesDivisions(playersData);
    var teamsDivisions = getEntitiesDivisions(teamsData);
    
    return {
        data: {
            playersData: playersData,
            teamsData: teamsData,
            gameDates: gameDates,
            playersDivisions: playersDivisions,
            teamsDivisions: teamsDivisions
        }
    };
}

function getEntityRankingData(leagueId, playersData, type) {
    var leagueEntities = getLeagueEntitiesByLeagueId(leagueId, type);

    //Filters entities not having played in the X last games
    var firstRankingGame = getFirstRankingGame(leagueId);
    if (firstRankingGame) {
        var timeMin = firstRankingGame.time;
        leagueEntities = leagueEntities.filter(function (leagueEntity) {
            var lastGameEntity = getLastGameEntityByLeagueIdEntityId(leagueId, leagueEntity[getIdName(type)], type);
            return lastGameEntity && lastGameEntity.time.localeCompare(timeMin) >= 0;
        });
    }

    //Adapt for ramping entities
    leagueEntities.forEach(function (leagueEntity) {
        var gamesCount = getGamesCountByLeagueIdEntityId(leagueId, leagueEntity[getIdName(type)], type);
        leagueEntity.gamesCount = gamesCount;
        leagueEntity.rampingCoef = getRampingCoef(gamesCount);
        leagueEntity.rampedRating = leagueEntity.rating * leagueEntity.rampingCoef;
    });

    //Return only useful information
    leagueEntities.forEach(function (leagueEntity) {
        playersData[leagueEntity[getIdName(type)]] = {
            rating: leagueEntity.rating,
            rampedRating: leagueEntity.rampedRating,
            rampingCoef: leagueEntity.rampingCoef,
            gamesCount: leagueEntity.gamesCount
        };
    });
}

function getIdName(type) {
    if (type === 'Player') {
        return 'playerId';
    } else {
        return 'teamId';
    }
}

function getRampingCoef(gamesCount, type) {
    if (type == 'Player') {
        return STARTING_RAMPING_COEF + (1 - STARTING_RAMPING_COEF) * Math.min(PLAYER_RAMPING_DURATION, gamesCount) / PLAYER_RAMPING_DURATION;
    } else {
        return STARTING_RAMPING_COEF + (1 - STARTING_RAMPING_COEF) * Math.min(TEAM_RAMPING_DURATION, gamesCount) / TEAM_RAMPING_DURATION;
    }
}

function getEntitiesData(entitiesData, type) {
    for (var entityId in entitiesData) {
        var entity = storeLib.getByKey(entityId);
        entitiesData[entityId].name = entity && entity.name;
        entitiesData[entityId].imageUrl = entity && '/' + type.toLowerCase() + 's/image/' + entity._versionKey + '/' + encodeURIComponent(entity.name);
    }
}

function getEntityRatingData(leagueId, playersData, teamsData, gameDates) {
    var currentRatings = {};
    for (var playerId in playersData) {
        playersData[playerId].ratings = [];
        playersData[playerId].ratings[GAME_RANGE] = playersData[playerId].rating;
        currentRatings[playerId] = playersData[playerId].rating;
    }
    for (var teamId in teamsData) {
        teamsData[teamId].ratings = [];
        teamsData[teamId].ratings[GAME_RANGE] = teamsData[teamId].rating;
        currentRatings[teamId] = teamsData[teamId].rating;
    }

    var games = getGamesByLeagueId(leagueId);

    if (games) {
        var gameIndex = GAME_RANGE - 1;
        games.forEach(function (game) {
            getGamePlayersByGameId(game._id).map(function (gamePlayer) {
                currentRatings[gamePlayer.playerId] -= gamePlayer.ratingDelta;
            });
            getGameTeamsByGameId(game._id).map(function (gameTeam) {
                currentRatings[gameTeam.teamId] -= gameTeam.ratingDelta;
            });
            for (var playerId in playersData) {
                playersData[playerId].ratings[gameIndex] = currentRatings[playerId];
            }
            for (var teamId in teamsData) {
                teamsData[teamId].ratings[gameIndex] = currentRatings[teamId];
            }
            gameDates[gameIndex] = game.time.substr(0, 10);
            gameIndex--;
        });
    }
}

function getEntitiesDivisions(data) {
    var entitiesDivisions = [];

    var sortedCompetitorIds = Object.keys(data)
        .sort(function(competitorId1, competitorId2) {
            return data[competitorId2].rampedRating - data[competitorId1].rampedRating;
        });
    
    var currentCompetitorIndex = 0;
    var divisionSize = sortedCompetitorIds.length > 20 ? 12 : sortedCompetitorIds.length;
    var divisionCount = sortedCompetitorIds.length / divisionSize;
    
    for (var i = 0; i < divisionCount; i++) {
        var currentDivision = [];
        entitiesDivisions.push(currentDivision);
        for (var j = 0; j < divisionSize; j++) {
            currentDivision.push(sortedCompetitorIds[currentCompetitorIndex]);
            currentCompetitorIndex++;
        }
    }
    
    return entitiesDivisions;
}

function getLeagueEntitiesByLeagueId(leagueId, type) {
    return storeLib.get({
        query: 'type="league' + type + '" AND leagueId="' + leagueId + '"',
        count: 1024
    });
}

function getGamePlayersByGameId(gameId) {
    return storeLib.get({
        query: 'type="gamePlayer" AND gameId="' + gameId + '"',
        count: 4
    });
}

function getGameTeamsByGameId(gameId) {
    return storeLib.get({
        query: 'type="gameTeam" AND gameId="' + gameId + '"',
        count: 2
    }) || [];
}

function getGamesByLeagueId(leagueId) {
    return storeLib.get({
        query: 'type="game" AND leagueId="' + leagueId + '"',
        count: GAME_RANGE,
        sort: 'time DESC'
    });
}

function getLastGame(leagueId) {
    return storeLib.get({
        query: 'type="game" AND leagueId="' + leagueId + '"',
        count: 1,
        sort: 'time DESC'
    });
}

function getFirstRankingGame(leagueId) {
    return storeLib.get({
        query: 'type="game" AND leagueId="' + leagueId + '"',
        start: GAME_RANGE - 1,
        count: 1,
        sort: 'time DESC'
    });
}

function getLastGameEntityByLeagueIdEntityId(leagueId, entityId, type) {
    return storeLib.get({
        query: 'type="game' + type + '" AND leagueId="' + leagueId + '" AND ' + getIdName(type) + '="' + entityId + '"',
        count: 1,
        sort: 'time DESC'
    });
}

function getGamesCountByLeagueIdEntityId(leagueId, entityId, type) {
    return storeLib.count({
        query: 'type="game' + type + '" AND leagueId="' + leagueId + '" AND ' + getIdName(type) + '="' + entityId + '"'
    });
}
