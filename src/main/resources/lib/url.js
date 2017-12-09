var portalLib = require('/lib/xp/portal');

exports.getAppUrl = function() {
    return portalLib.url({path:'/app/' + app.name});
};

exports.getBaseUrl = function() {
    var appUrl = exports.getAppUrl();
    return endWithSlash(appUrl) ? appUrl.substring(0, appUrl.length - 1) : appUrl;
};

function endWithSlash(url) {
    return url.charAt(url.length - 1) === '/';
}