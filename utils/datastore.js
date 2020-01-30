const memoize = require('memoizee');

const { Datastore } = require('@google-cloud/datastore');
const datastore = new Datastore();

const search = continent => datastore.runQuery(
  datastore
    .createQuery('Event')
    .filter('startDate',     '>=', new Date())
    .filter('continentCode', '=',  continent)
  );

const searchForever = memoize(search, { promise: true });

module.exports.searchForever = searchForever;