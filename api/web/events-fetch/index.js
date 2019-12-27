const { Datastore } = require('@google-cloud/datastore');

module.exports = async (_, res) => {

  const datastore = new Datastore();

  const query = datastore.createQuery("Event");
  const result = await datastore.runQuery(query);
  res.json(result);
}