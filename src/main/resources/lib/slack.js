var eventLib = require('/lib/xp/event');
var httpClient = require('/lib/http-client');
var nodeLib = require('/lib/xp/node');

var OFFICE_LEAGUE_GAME_REPORT_EVENT_ID = 'office-league-game-report';
var SIDES_ORDER = {
    red: 0,
    blue: 1
};

exports.init = function () {
    eventLib.listener({
        type: 'custom.' + OFFICE_LEAGUE_GAME_REPORT_EVENT_ID,
        localOnly: true,
        callback: function (event) {
            var game = JSON.parse(event.data.game);
            handleGameUpdate(game);
        }
    });
};

var handleGameUpdate = function (game) {
    // log.info('Game event: ' + JSON.stringify(game, null, 2));

    if (!game.finished && game.sides.blue.totalScore === 0 && game.sides.red.totalScore === 0) {
        sendGameStartNotification(game);
    } else if (game.finished && gameHasRatings(game)) {
        sendGameFinishedNotification(game);
    }
    // TODO check ranking changes
};

var sendGameStartNotification = function (game) {
    log.info('Game started');
    var slackAttachments = [];
    var blue, red, teamsBySide = {};
    if (game.teamCount === 0) {
        for (var playerId in game.players) {
            if (game.players[playerId].side === 'blue') {
                blue = game.players[playerId];
            } else {
                red = game.players[playerId];
            }
        }
    } else {
        for (var teamId in game.teams) {
            if (game.teams[teamId].side === 'blue') {
                blue = game.teams[teamId];
            } else {
                red = game.teams[teamId];
            }
            teamsBySide[game.teams[teamId].side] = game.teams[teamId];
        }
    }
    var expectedText = '';
    if (game.sides.blue.expectedScore > game.sides.red.expectedScore) {
        expectedText =
            blue.name + " is expected to win " + game.sides.blue.expectedScore + " to " + game.sides.red.expectedScore + " goals";
    } else {
        expectedText = red.name + " is expected to win " + game.sides.red.expectedScore + " to " + game.sides.blue.expectedScore + " goals";
    }

    var players = [], player, playerAtt = [];
    for (var playerId in game.players) {
        players.push(game.players[playerId]);
    }
    players.sort(function (p1, p2) {
        return SIDES_ORDER[p1.side] - SIDES_ORDER[p2.side];
    });
    for (var i = 0; i < players.length; i++) {
        player = players[i];

        playerAtt.push({
            "color": player.side === 'red' ? "#912B2B" : "#002657",
            "title": player.name,
            "text": player.rating + " points - " + ordinal(player.ranking),
            "footer_icon": player.imageUrl,
            // "footer_icon": "https://officeleague.rocks/app/players/image/0d7b5dd9433ef7d220c7d1ee1fc410ef1a5ae81a/GRI?size=42",
            "footer": teamsBySide[player.side] ? teamsBySide[player.side].name : undefined
        });
    }

    var att1 = {
        "color": "#429E69",
        "pretext": "A new game has started in Office League",
        "title": red.name + " - vs - " + blue.name,
        "title_link": game.gameUrl,
        "text": expectedText,
        //"image_url": game.league.imageUrl, no SVG support
        //"footer": "Office League",
        //"footer_icon": "https://officeleague.rocks/app/assets/icons/apple-touch-icon.png"
    };
    slackAttachments.push(att1);

    var slackMsg = {
        "attachments": slackAttachments
    };
    slackMsg.attachments = slackAttachments.concat(playerAtt);

    sendSlackMessage(slackMsg);
};

var sendGameFinishedNotification = function (game) {
    log.info('Game finished');
    var slackAttachments = [];
    var blue, red, teamsBySide = {};
    if (game.teamCount === 0) {
        for (var playerId in game.players) {
            if (game.players[playerId].side === 'blue') {
                blue = game.players[playerId];
            } else {
                red = game.players[playerId];
            }
        }
    } else {
        for (var teamId in game.teams) {
            if (game.teams[teamId].side === 'blue') {
                blue = game.teams[teamId];
            } else {
                red = game.teams[teamId];
            }
            teamsBySide[game.teams[teamId].side] = game.teams[teamId];
        }
    }
    var resultText = '';
    if (game.sides.blue.totalScore > game.sides.red.totalScore) {
        resultText =
            blue.name + " defeats " + red.name + ' ' + game.sides.blue.totalScore + " - " + game.sides.red.totalScore;
    } else {
        resultText = red.name + " defeats " + blue.name + ' ' + game.sides.red.totalScore + " - " + game.sides.blue.totalScore;
    }

    var blueDelta = ratingDeltaBySide(game, 'blue');
    var redDelta = ratingDeltaBySide(game, 'red');
    var ratingText = getGamePlayerNamesBySideStr(game, 'blue', ' and ') + (blueDelta > 0 ? ' win ' : ' loose ') +
                     Math.abs(blueDelta) + " rating points.\r\n";
    ratingText += getGamePlayerNamesBySideStr(game, 'red', ' and ') + (redDelta > 0 ? ' win ' : ' loose ') +
                  Math.abs(redDelta) + " rating points.";

    var players = [], player, playerAtt = [];
    for (var playerId in game.players) {
        players.push(game.players[playerId]);
    }
    players.sort(function (p1, p2) {
        return SIDES_ORDER[p1.side] - SIDES_ORDER[p2.side];
    });
    for (var i = 0; i < players.length; i++) {
        player = players[i];

        playerAtt.push({
            "color": player.side === 'red' ? "#912B2B" : "#002657",
            "title": player.name,
            "text": goals(player.score, player.scoreAgainst),
            "footer_icon": player.imageUrl,
            // "footer_icon": "https://officeleague.rocks/app/players/image/0d7b5dd9433ef7d220c7d1ee1fc410ef1a5ae81a/GRI?size=42",
            "footer": teamsBySide[player.side] ? teamsBySide[player.side].name : undefined
        });
    }

    var att1 = {
        "color": "#3389c6",
        "pretext": "A game is finished in Office League",
        "title": red.name + " - vs - " + blue.name,
        "title_link": game.gameUrl,
        "text": resultText + '\r\n' + ratingText,
        //"image_url": game.league.imageUrl, no SVG support
        //"footer": "Office League",
        //"footer_icon": "https://officeleague.rocks/app/assets/icons/apple-touch-icon.png"
    };
    slackAttachments.push(att1);

    var slackMsg = {
        "attachments": slackAttachments
    };
    slackMsg.attachments = slackAttachments.concat(playerAtt);

    sendSlackMessage(slackMsg);
};

var gameHasRatings = function (game) {
    for (var playerId in game.players) {
        if (game.players[playerId].ratingDelta && game.players[playerId].ratingDelta > 0) {
            return true;
        }
    }
    return false;
};

var getGamePlayerNamesBySideStr = function (game, side, join) {
    return getGamePlayerNamesBySide(game, side).join(join);
};

var getGamePlayerNamesBySide = function (game, side) {
    var playerNames = [];
    for (var playerId in game.players) {
        if (game.players[playerId].side === side) {
            playerNames.push(game.players[playerId].name);
        }
    }
    return playerNames;
};

var ratingDeltaBySide = function (game, side) {
    for (var playerId in game.players) {
        if (game.players[playerId].side === side) {
            return game.players[playerId].ratingDelta;
        }
    }
    return 0;
};

var sendSlackMessage = function (bodyMsg, slackWebhook) {
    if (!slackWebhook) {
        slackWebhook = getSlackUrl();
    }

    if (!slackWebhook) {
        log.info('Slack notifications not configured. Ignoring message: ' + JSON.stringify(bodyMsg, null, 2));
        return;
    }
    try {
        var response = httpClient.request({
            url: slackWebhook,
            method: 'POST',
            body: JSON.stringify(bodyMsg),
            connectionTimeout: 10000,
            readTimeout: 5000,
            contentType: 'application/json'
        });
        return response.status >= 200 && response.status < 300;
    } catch (e) {
        log.error('Error in Slack request [' + slackWebhook + ']: ' + e);
        return false;
    }
};

var ordinal = function (value) {
    if (!value) {
        return '';
    }
    switch (value) {
    case 1:
        return '1st';
    case 2:
        return '2nd';
    case 3:
        return '3rd';
    default:
        return value + 'th';
    }
};


var goals = function (goals, against) {
    var text = '';
    if (goals === 0) {
        text = 'no goals';
    } else if (goals === 1) {
        text = '1 goal';
    } else {
        text = goals + ' goals';
    }

    if (against > 0) {
        text += ' (' + against + ' against)'
    }
    return text;
};

var getSlackUrl = function () {
    var conn = nodeLib.connect({
        repoId: 'office-league',
        branch: 'master',
        principals: ["role:system.admin"]
    });

    var node = conn.get('/push-subscriptions');
    return node && node.slackWebhook;
};