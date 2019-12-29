const { Datastore } = require('@google-cloud/datastore');

const datastore = new Datastore();

module.exports = async (req, res) => {

  const limit = req.query.limit ? req.query.limit : 10;
  const start = req.query.start;
  const continent = req.query.continent;
  const country = req.query.country;

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
          totalQuery = withContinent(totalQuery);
          totalQuery = withCountry(totalQuery);
  fetchQuery = withStart(fetchQuery);
  
  const [entities, info] = await datastore.runQuery(fetchQuery);

  res.json([entities, { limit: limit, total: total, info }]);

}

