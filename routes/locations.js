const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const { nameBy, emojiBy } = require('../utils/geo');
const { Datastore } = require('@google-cloud/datastore');
const datastore = new Datastore();
const _ = require('lodash');

router.get('/search', asyncHandler(async(req, res) => {
  const locationQuery = datastore.createQuery('Location');
  const [entities] = await datastore.runQuery(locationQuery);
  res.json(
    _.partition(
          entities
            .map(e => ({
              ...e, 
              code: e[Datastore.KEY].name,
              name: nameBy(e[Datastore.KEY].name),
              emoji: emojiBy(e[Datastore.KEY].name)
            })),
        item => item.code.length == 2
    )
  );
}));

module.exports = router;