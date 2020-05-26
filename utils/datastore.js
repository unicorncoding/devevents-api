const memoize = require("memoizee");
const { isFuture } = require("./dates");
const { topicName } = require("./topics");
const { countryName } = require("./geo");
const { uid } = require("./uid");

const { Datastore } = require("@google-cloud/datastore");
const datastore = new Datastore();

const search = (continent) =>
  datastore
    .runQuery(
      datastore
        .createQuery("Event")
        .filter("startDate", ">=", new Date())
        .filter("continentCode", "=", continent)
    )
    .then(([events]) =>
      events.map((event) => ({
        ...event,
        id: event[datastore.KEY].name,
        country: countryName(event.countryCode),
        topic: topicName(event.topicCode),
      }))
    );

const karma = (userId) =>
  datastore
    .runQuery(
      datastore.createQuery("Event").select("__key__").filter("creator", userId)
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

const deleteOne = async (id) => {
  const key = datastore.key(["Event", id]);
  await datastore.delete(key);
};

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
