const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const { nameBy, isContinent } = require('../utils/geo');
const { Datastore } = require('@google-cloud/datastore');
const datastore = new Datastore();

router.get('/search', asyncHandler(async(req, res) => {
  const locationQuery = datastore.createQuery('Location');
  const [entities] = await datastore.runQuery(locationQuery);
  res.json(
    entities
      .map(e => ({
        ...e, 
        code: e[Datastore.KEY].name,
        name: nameBy(e[Datastore.KEY].name),
        continent: isContinent(e[Datastore.KEY].name),
      }))
  );
}));

module.exports = router;