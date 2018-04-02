var mustacheLib = require('/lib/xp/mustache');
var portalLib = require('/lib/xp/portal');
var router = require('/lib/router')();

var urlLib = require("/lib/url");

var mainTemplate = resolve("main.html");
var manifestTemplate = resolve("manifest.json");

var swTemplate = resolve("sw.js");
router.get('/', function (req) {
    return {
        body: mustacheLib.render(mainTemplate, {
            appUrl: urlLib.getAppUrl(),
            baseUrl: urlLib.getBaseUrl(),
            serviceUrl: portalLib.serviceUrl({service:''}),
            officeLeagueAppUrl: '/app' //TODO
        }),
        contentType: 'text/html'
    };
});

router.get('/manifest.json', function () {
    return {
        body: mustacheLib.render(manifestTemplate, {
            startUrl: urlLib.getAppUrl()
        }),
        contentType: 'text/html'
    };
});

router.get('/sw.js', function () {
    return {
        headers: {
            'Service-Worker-Allowed': urlLib.getBaseUrl()
        },
        body: mustacheLib.render(swTemplate, {}),
        contentType: 'application/javascript'
    };
});

exports.get = function (req) {
    return router.dispatch(req);
};