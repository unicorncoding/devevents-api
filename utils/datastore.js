console.time("initializing datastore");
const memoize = require("memoizee");
const jsonDiff = require("json-diff");
const { dayjs: utc } = require("./dates");
const { countryName, stateName } = require("./geo");
const { Datastore } = require("@google-cloud/datastore");
const datastore = new Datastore();
console.timeEnd("initializing datastore");

const taim = require("taim");
const runQuery = taim("datastore search", (query) => datastore.runQuery(query));

const mapAll = (mapper = (data) => data) => {
  let changed = 0;
  datastore
    .runQueryStream(datastore.createQuery("Event"))
    .on("error", console.error)
    .on("data", (data) => {
      const key = data[datastore.KEY];
      const copy = { ...data };
      mapper(copy);
      const diff = jsonDiff.diffString(data, copy);
      if (diff) {
        changed++;
        console.log(diff);
      }
      datastore.update({ key, data: copy });
    })
    .on("end", () =>
      console.log(`Migration has completed. ${changed} entities updated.`)
    );
};

const searchExpiredBefore = async (date) => {
  const query = datastore
    .createQuery("Event")
    .filter("endDate", "<=", date.toDate())
    .order("endDate", {
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
  if (!event) {
    return event;
  }
  return {
    ...event,
    country: countryName(event.countryCode),
    state: stateName(event.stateCode),
    id: event[datastore.KEY].name,
  };
}

module.exports.deleteOne = deleteOne;
module.exports.updateOne = updateOne;
module.exports.fetchOne = fetchOne;
module.exports.searchExpiredBefore = searchExpiredBefore;
module.exports.searchUpcomingForever = searchUpcomingForever;
module.exports.mapAll = mapAll;
module.exports.searchUpcoming = searchUpcoming;
module.exports.storeIfNew = storeIfNew;
