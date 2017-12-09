var mustacheLib = require('/lib/xp/mustache');

var mainTemplate = resolve("main.html");

exports.get = function (req) {
    return {
        body: mustacheLib.render(mainTemplate, {}),
        contentType: 'text/html'
    };
};