const normalizeUrl = require('normalize-url');
module.exports.normalizedUrl = url => url ? normalizeUrl(url, { stripHash: true }) : url;