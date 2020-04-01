const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const { nameBy } = require('../utils/geo');
const { count } = require('../utils/arrays');
const { topicName } = require('../utils/topics');
const { whois } = require('../utils/auth');
const { search, byCountry, byTopic, byCfp, byName } = require('../utils/datastore');
const _ = require('lodash');


router.get('/', asyncHandler(async(req, res) => {

  const { continent, cfp, country, topic, limit = 30, start = 0 } = req.query;

  if (!continent) {
    res.status(404).send("Query param [continent] is missing");
    return;
  }

  const me = await whois(req);
  const events = await search(continent, me);
  
  const countries = events
    .filter(byTopic(topic))
    .filter(byCfp(cfp))
    .reduce(count(it => it.countryCode, it => it.country), [])
    .ordered(byName);
  
  const topics = events
    .filter(byCountry(country))
    .filter(byCfp(cfp))
    .reduce(count(it => it.topicCode, it => it.topic), [])
    .ordered(byName);

  const matches = events
    .filter(byTopic(topic))
    .filter(byCountry(country))
    .filter(byCfp(cfp));

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
      topicName: topic ? topicName(topic) : undefined,
      countryName : country ? nameBy(country) : undefined,
      topics: topics 
    }
  ]);
}));

module.exports = router;