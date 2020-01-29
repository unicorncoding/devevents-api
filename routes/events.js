const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const memoize = require('memoizee');
const { isFuture } = require('../utils/dates');
const { count } = require('../utils/arrays');
const { Datastore } = require('@google-cloud/datastore');
const datastore = new Datastore();
const _ = require('lodash');

const search = continent => datastore.runQuery(
  datastore
    .createQuery('Event')
    .filter('startDate',     '>=', new Date())
    .filter('continentCode', '=',  continent)
  );

const searchForever = memoize(search, { promise: true });

router.get('/search', asyncHandler(async(req, res) => {

  const { cfp, continent, country, topic, limit = 30, start = 0 } = req.query;

  if (!continent) {
    res.status(404).send("Query param 'continent' is missing");
  }

  const [ events ] = await searchForever(continent);

  const byCountry = it => !country || country === it.countryCode;
  const byTopic = it => !topic || topic === it.topicCode;
  const byCfp = it => !cfp || isFuture(it.cfpEndDate);
  const byName = (it, that) => it.name.localeCompare(that.name);
  
  const countries = events
    .filter(byTopic)
    .filter(byCfp)
    .reduce(count(it => it.countryCode, it => it.country), [])
    .ordered(byName);
  
  const topics = events
    .filter(byCountry)
    .filter(byCfp)
    .reduce(count(it => it.topicCode, it => it.topic), [])
    .ordered(byName);

  const matches = events
    .filter(byTopic)
    .filter(byCountry)
    .filter(byCfp);

  const shown = _.chunk(matches, limit)[start] || [];

  const next = +start + 1;
  const more = matches.length > limit * next;

  res.json([
    shown, 
    { 
      limit: limit, 
      cursor: next, 
      more: more, 
      total: matches.length, 
      countries: countries, 
      topics: topics 
    }
  ]);
}));

module.exports = router;