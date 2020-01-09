const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const { Datastore } = require('@google-cloud/datastore');

const datastore = new Datastore();

router.get('/search', asyncHandler(async(req, res) => {

  const { start, continent, country, limit = 10 } = req.query;

  const withContinent = q => continent ? q.filter('continent', '=', continent) : q;
  const withCountry = q => country ? q.filter('countryCode', '=', country) : q;
  const withStart = q => start ? q.start(start) : q;

  let totalQuery = datastore
        .createQuery("Event")
        .select('__key__')
        .filter('startDate', '>', new Date());
  totalQuery = withContinent(totalQuery);
  totalQuery = withCountry(totalQuery);
 
  const [keys] = (await datastore.runQuery(totalQuery));
  const total = keys.length;

  let fetchQuery = datastore
          .createQuery("Event")
          .filter('startDate', '>', new Date())
          .limit(limit)
          .order('startDate');
          fetchQuery = withContinent(fetchQuery);
  fetchQuery = withCountry(fetchQuery);
  fetchQuery = withStart(fetchQuery);
  
  const [entities, info] = await datastore.runQuery(fetchQuery);

  res.json([entities, { limit: limit, total: total, info }]);

}));

module.exports = router;