const { Datastore } = require('@google-cloud/datastore');

const datastore = new Datastore();

module.exports = async (req, res) => {

  const limit = req.query.limit ? req.query.limit : 10;
  const start = req.query.start;
  const location = req.query.location;
  const withLocation = q => location ? q.filter('location', '>=', location) : q;
  const withStart = q => start ? q.start(start) : q;

  let totalQuery = datastore
        .createQuery("Event")
        .select('__key__');
        // .filter('startDate', '>', new Date());
  totalQuery = withLocation(totalQuery);

  const [keys] = (await datastore.runQuery(totalQuery));
  const total = keys.length;

  let fetchQuery = datastore
          .createQuery("Event")
          // .filter('startDate', '>', new Date())
          .limit(limit)
          .order('startDate');
  fetchQuery = withLocation(fetchQuery);
  fetchQuery = withStart(fetchQuery);
  
  const [entities, info] = await datastore.runQuery(fetchQuery);

  res.json([entities, { limit: limit, total: total, info }]);

}

