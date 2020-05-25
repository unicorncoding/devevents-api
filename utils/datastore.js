const memoize = require("memoizee");

const { isFuture } = require("./dates");
const { uid } = require("./uid");

const { Datastore } = require("@google-cloud/datastore");
const datastore = new Datastore();

const includeId = (it) => ({ ...it, id: it[datastore.KEY].name });

const filtering = ({ uid, admin }) => (it) =>
  admin || !it.pending || it.creator == uid;

const search = (continent, me) =>
  datastore
    .runQuery(
      datastore
        .createQuery("Event")
        .filter("startDate", ">=", new Date())
        .filter("continentCode", "=", continent)
    )
    .then(([hits]) => hits.map(includeId).filter(filtering(me)));

const karma = (uid) =>
  datastore
    .runQuery(
      datastore.createQuery("Event").select("__key__").filter("creator", uid)
    )
    .then(([hits]) => hits.length);

const searchForever = memoize(search, { promise: true });

const storeIfNew = async (data, stats) => {
  const key = datastore.key(["Event", uid(data)]);
  const tx = datastore.transaction();
  try {
    await tx.run();
    const [event] = await tx.get(key);
    if (event) {
      await tx.rollback();
      stats.skip();
    } else {
      await tx.save({ key, data });
      await tx.commit();
      stats.store(data);
    }
  } catch (err) {
    console.error(`Unable to store event ${data.name}`, new Error(err));
  }
};

const confirm = async (id) => {
  const key = datastore.key(["Event", id]);
  const data = { pending: false };
  await datastore.merge({ key, data });
};

const findOne = async (id) => {
  const key = datastore.key(["Event", id]);
  const [event] = await datastore.get(key);
  return event;
};

const deleteOne = async (id) => {
  const key = datastore.key(["Event", id]);
  await datastore.delete(key);
};

module.exports.confirm = confirm;
module.exports.findOne = findOne;
module.exports.deleteOne = deleteOne;
module.exports.karma = karma;
module.exports.searchForever = searchForever;
module.exports.search = search;
module.exports.storeIfNew = storeIfNew;

module.exports.byCountry = (country) => (it) =>
  !country || country === it.countryCode;

module.exports.byTopic = (topic) => (it) => !topic || topic === it.topicCode;
module.exports.byCfp = (cfp) => (it) => !cfp || isFuture(it.cfpEndDate);
module.exports.byName = (it, that) => it.name.localeCompare(that.name);
