console.time("initializing datastore");
const memoize = require("memoizee");

const { dayjs: utc } = require("./dates");
const { countryName, stateName } = require("./geo");
const { flatten } = require("./arrays");
const { Datastore } = require("@google-cloud/datastore");
const datastore = new Datastore();
console.timeEnd("initializing datastore");

const taim = require("taim");
const runQuery = taim("datastore search", (query) => datastore.runQuery(query));

const searchExpiredBefore = async (date) => {
  const query = datastore
    .createQuery("Event")
    .filter("startDate", "<=", date.toDate())
    .order("startDate", {
      descending: true,
    })
    .limit(15);

  return runQuery(query).then(([events]) => events.map(enrich));
};

const searchUpcoming = async () => {
  const query = datastore
    .createQuery("Event")
    .filter("startDate", ">=", utc().toDate());

  return runQuery(query).then(([events]) => events.map(enrich));
};

const searchUpcomingForever = memoize(searchUpcoming, { promise: true });

const storeIfNew = async (id, data, stats) => {
  const key = datastore.key(["Event", id]);
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

const updateOne = async (id, data) => {
  const key = datastore.key(["Event", id]);
  console.log(data);
  await datastore.merge({ key, data });
};

const deleteOne = async (id) => {
  const key = datastore.key(["Event", id]);
  await datastore.delete(key);
};

const fetchOne = async (id) => {
  const key = datastore.key(["Event", id]);
  return datastore.get(key).then(([event]) => enrich(event));
};

function enrich(event) {
  return {
    ...event,
    country: countryName(event.countryCode),
    state: stateName(event.stateCode),
    id: event[datastore.KEY].name,
    topics: [
      ...new Set(flatten([event.topicCode, event.topics]).filter(Boolean)),
    ],
  };
}

module.exports.deleteOne = deleteOne;
module.exports.updateOne = updateOne;
module.exports.fetchOne = fetchOne;
module.exports.searchExpiredBefore = searchExpiredBefore;
module.exports.searchUpcomingForever = searchUpcomingForever;
module.exports.searchUpcoming = searchUpcoming;
module.exports.storeIfNew = storeIfNew;

module.exports.byCountry = (country) => (it) =>
  !country || country === it.countryCode;

module.exports.byTopic = (topic) => (it) => !topic || topic === it.topicCode;
module.exports.byName = (it, that) => it.name.localeCompare(that.name);
