console.time('initializing search');
const asyncHandler = require("express-async-handler");
const router = require("express").Router();
const { countryName } = require("../utils/geo");
const { count, orderBy } = require("../utils/arrays");
const { isFuture } = require("../utils/dates");
const { topicName } = require("../utils/topics");
const { search, byName } = require("../utils/datastore");
const _ = require("lodash");

console.time('initializing search');

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const {
      continent,
      cfp,
      country,
      topic,
      sorting,
      freeOnly,
      limit = 30,
      start = 0,
    } = req.query;

    if (!continent) {
      res.status(404).send("Query param [continent] is missing");
      return;
    }

    const events = await search(continent);
    const countries = events
      .filter(
        ({ topicCode, cfpEndDate }) =>
          (!topic || topic === topicCode) && (!cfp || isFuture(cfpEndDate))
      )
      .reduce(
        count(
          (it) => it.countryCode,
          (it) => it.country
        ),
        []
      )
      .ordered(byName);

    const free = 0;

    const topics = events
      .filter(
        ({ countryCode, cfpEndDate }) =>
          (!country || country === countryCode) &&
          (!cfp || isFuture(cfpEndDate))
      )
      .reduce(
        count(
          (it) => it.topicCode,
          (it) => it.topic
        ),
        []
      )
      .ordered(byName);

    const matches = orderBy(
      events.filter(
        ({ topicCode, countryCode, cfpEndDate, free }) =>
          (!Boolean(freeOnly) || free) &&
          (!topic || topic === topicCode) &&
          (!country || country === countryCode) &&
          (!cfp || isFuture(cfpEndDate))
      ),
      sorting
    );

    const shown = _.chunk(matches, limit)[start] || [];

    const next = +start + 1;
    const more = matches.length > limit * next;

    res.json([
      shown,
      {
        limit,
        more,
        free,
        countries,
        topics,
        cursor: next,
        total: matches.length,
        topicName: topic ? topicName(topic) : undefined,
        countryName: country ? countryName(country) : undefined,
      },
    ]);
  })
);

module.exports = router;
