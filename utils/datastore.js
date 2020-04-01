const memoize = require('memoizee');

const { isFuture } = require('./dates');
const { hash } = require('./hash');

const { Datastore } = require('@google-cloud/datastore');
const datastore = new Datastore({ maxRetries: 5, autoRetry: true });

const includeId = it => ({ ...it, id: it[datastore.KEY].name });
const topFirst = (it, that) => Boolean(that.top) - Boolean(it.top);
const pendingFirst = (it, that) => Boolean(that.pending) - Boolean(it.pending);

const ordering = ( {admin} ) => (it, that) => admin ? pendingFirst(it, that) : topFirst(it, that);
const filtering = ( {uid, admin} ) => it => admin || !it.pending || it.creator == uid;

const search = (continent, me) => datastore.runQuery(
  datastore
    .createQuery('Event')
    .filter('startDate',     '>=', new Date())
    .filter('continentCode', '=' ,  continent)
  ).then(([hits]) => hits.map(includeId).filter(filtering(me)).ordered(ordering(me)));

const karma = uid => datastore.runQuery(
  datastore
    .createQuery('Event')
    .select('__key__')
    .filter('creator', uid)
).then(([hits]) => hits.length);

const searchForever = memoize(search, { promise: true });

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

const confirm = async (id) => {
  const key = datastore.key([ 'Event', id ]);
  const item = {
    key: key,
    data: {
        pending: false
    },
  };
  await datastore.merge(item);
};

const reject = async (id) => {
  const key = datastore.key([ 'Event', id ]);
  await datastore.delete(key);
};

module.exports.confirm = confirm;
module.exports.reject = reject;
module.exports.karma = karma;
module.exports.searchForever = searchForever;
module.exports.search = search;
module.exports.storeIfNew = storeIfNew;
module.exports.byCountry = country => it => !country || country === it.countryCode;
module.exports.byTopic = topic => it => !topic || topic === it.topicCode;
module.exports.byCfp = cfp => it => !cfp || isFuture(it.cfpEndDate);
module.exports.byName = (it, that) => it.name.localeCompare(that.name);