const { Datastore } = require('@google-cloud/datastore');

module.exports = async (req, res) => {

  const datastore = new Datastore();
  
  const limit = req.query.limit;
  const cursor = req.query.cursor;

  const totalQuery = datastore
    .createQuery("Event")
    .select('__key__')
    .filter('startDate', '>', new Date());

  const [keys] = (await datastore.runQuery(totalQuery));
  const total = keys.length;


  let fetchQuery = datastore
    .createQuery("Event")
    .order('startDate')
    .filter('startDate', '>', new Date());

  if (limit) { fetchQuery = fetchQuery.limit(limit); }
  if (cursor) { fetchQuery = fetchQuery.start(start); }
    
  const [entities, info] = await datastore.runQuery(fetchQuery);

  res.json([entities, { total: total, info }]);
}