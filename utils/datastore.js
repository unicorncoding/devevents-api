const memoize = require('memoizee');
const { isFuture } = require('./dates');
const { hash } = require('./hash');

const { Datastore } = require('@google-cloud/datastore');
const datastore = new Datastore({ maxRetries: 5, autoRetry: true });

const topFirst = (it, that) => Boolean(that.top) - Boolean(it.top);
const noPending = it => it.pending !== true;

const search = continent => datastore.runQuery(
  datastore
    .createQuery('Event')
    .filter('startDate',     '>=', new Date())
    .filter('continentCode', '=' ,  continent)
  ).then(([hits]) => hits.filter(noPending).ordered(topFirst));

const threeMinutes = 1000 * 60 * 3;
const searchForever = memoize(search, { promise: true, maxAge: threeMinutes });

const storeIfNew = async (each, stats) => {
  const itemHash = hash(each);
  const itemKey = datastore.key([ 'Event', itemHash ]);
  const tx = datastore.transaction();
  try {
    await tx.run();
    const [event] = await tx.get(itemKey);
    if (event) {
      await tx.rollback();
      stats.skip()
    } else {
      const newItem = { key: itemKey, data: each };
      await tx.save(newItem);
      await tx.commit();
      stats.inc();
    }
  } catch (err) {
    console.error("Unable to store event " + each.name, err);
  }  
}

module.exports.searchForever = searchForever;
module.exports.storeIfNew = storeIfNew;
module.exports.byCountry = country => it => !country || country === it.countryCode;
module.exports.byTopic = topic => it => !topic || topic === it.topicCode;
module.exports.byCfp = cfp => it => !cfp || isFuture(it.cfpEndDate);
module.exports.byName = (it, that) => it.name.localeCompare(that.name);