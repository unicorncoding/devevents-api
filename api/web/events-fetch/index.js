const { Datastore } = require('@google-cloud/datastore');

module.exports = async (req, res) => {

  const datastore = new Datastore();
  
  const limit = req.query.limit ? req.query.limit : 10;
  const start = req.query.start;
  const continent = req.query.continent;
  const country = req.query.country;

  const withOptionalContinent = q => continent ? q.filter('continent', '=', continent) : q;
  const withOptionalCountry = q => country ? q.filter('countryCode', '=', country) : q;

  const totalQuery = withOptionalCountry(
    withOptionalContinent(
      datastore
        .createQuery("Event")
        .select('__key__')
        .filter('startDate', '>', new Date())
    )
  );

  const [keys] = (await datastore.runQuery(totalQuery));
  const total = keys.length;

  let fetchQuery = withOptionalCountry(
      withOptionalContinent(
        datastore
          .createQuery("Event")
          .order('startDate')
          .limit(limit)
          .filter('startDate', '>', new Date())
      )
  );

  if (start) { fetchQuery = fetchQuery.start(start); }
    
  const [entities, info] = await datastore.runQuery(fetchQuery);

  res.json([entities, { limit: limit, total: total, info }]);


}

