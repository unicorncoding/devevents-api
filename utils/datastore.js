const memoize = require('memoizee');
const { isFuture } = require('./dates');
const { Datastore } = require('@google-cloud/datastore');
const datastore = new Datastore();

const search = continent => datastore.runQuery(
  datastore
    .createQuery('Event')
    .filter('startDate',     '>=', new Date())
    .filter('continentCode', '=',  continent)
  );

const threeMinutes = 1000 * 60 * 3;
const searchForever = memoize(search, { promise: true, maxAge: threeMinutes });

module.exports.searchForever = searchForever;
module.exports.byCountry = country => it => !country || country === it.countryCode;
module.exports.byTopic = topic => it => !topic || topic === it.topicCode;
module.exports.byCfp = cfp => it => !cfp || isFuture(it.cfpEndDate);
module.exports.byName = (it, that) => it.name.localeCompare(that.name);