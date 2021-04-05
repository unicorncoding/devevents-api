console.time("initializing datastore");
const memoize = require("memoizee");

const dayjs = require("dayjs");
dayjs.extend(require("dayjs/plugin/utc"));
const utc = dayjs.utc;

const { countryName, stateName } = require("./geo");
const { flatten } = require("./arrays");
const { Datastore } = require("@google-cloud/datastore");
const datastore = new Datastore();
console.timeEnd("initializing datastore");


const search = async ( params = { fromInclusive: utc(), toInclusive: utc().add(3, 'year') } ) => {
  const query = datastore
    .createQuery("Event")
    .filter("startDate", ">=", params.fromInclusive.toDate())
    .filter("startDate", "<=", params.toInclusive.toDate())

  return datastore.runQuery(query).then(([events]) =>
    events.map((event) => ({
      ...event,
      id: event[datastore.KEY].name,
      country: countryName(event.countryCode),
      state: stateName(event.stateCode),
      topics: [
        ...new Set(flatten([event.topicCode, event.topics]).filter(Boolean)),
      ],
    }))
  );
};

const searchForever = memoize(search, { promise: true });

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
  return datastore.get(key).then(([event]) => ({
    ...event,
    country: countryName(event.countryCode),
    state: stateName(event.stateCode),
    id: event[datastore.KEY].name,
    topics: [
      ...new Set(flatten([event.topicCode, event.topics]).filter(Boolean)),
    ],
  }));
};

module.exports.deleteOne = deleteOne;
module.exports.updateOne = updateOne;
module.exports.fetchOne = fetchOne;
module.exports.searchForever = searchForever;
module.exports.search = search;
module.exports.storeIfNew = storeIfNew;

module.exports.byCountry = (country) => (it) =>
  !country || country === it.countryCode;

module.exports.byTopic = (topic) => (it) => !topic || topic === it.topicCode;
module.exports.byName = (it, that) => it.name.localeCompare(that.name);
