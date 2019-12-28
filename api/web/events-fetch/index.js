const { Datastore } = require('@google-cloud/datastore');

module.exports = async (req, res) => {

  const datastore = new Datastore();
  
  const limit = req.query.limit;

  let query = datastore
    .createQuery("Event")
    .filter('startDate', '>', new Date())
    .order('startDate');

  
  if (limit) {
    query = query.limit(limit);
  }

  const [entities, info] = await datastore.runQuery(query);

  res.json([entities, info]);
}