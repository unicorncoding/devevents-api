const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const { Datastore } = require('@google-cloud/datastore');

const datastore = new Datastore();

router.get('/search', asyncHandler(async(req, res) => {

  const { cfp, start, continent, country, limit = 30 } = req.query;

  const withCountry = q => country && continent ? q.filter('countryCode', '=', continent + "/" + country) : q;
  const withStart = q => start ? q.start(start) : q;

  const orderProperty = cfp ? 'cfpEndDate' : 'startDate';

  let totalQuery = datastore
        .createQuery('Event')
        .select('__key__')
        .filter(orderProperty, '>=', new Date());
  totalQuery = withCountry(totalQuery);
 
  const [keys] = await datastore.runQuery(totalQuery);
  const total = keys.length;

  let fetchQuery = datastore
          .createQuery('Event')
          .filter(orderProperty, '>=', new Date())
          .limit(limit)
          .order(orderProperty);
  fetchQuery = withCountry(fetchQuery);
  fetchQuery = withStart(fetchQuery);

  const [entities, info] = await datastore.runQuery(fetchQuery);

  res.json([entities, { limit: limit, total: total, info }]);

}));

module.exports = router;