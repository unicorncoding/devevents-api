const asyncHandler = require("express-async-handler");
const router = require("express").Router();
const { nameBy } = require("../utils/geo");
const { count, orderBy } = require("../utils/arrays");
const { isFuture } = require("../utils/dates");
const { topicName } = require("../utils/topics");
const { search, byName } = require("../utils/datastore");
const _ = require("lodash");

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const {
      continent,
      cfp,
      country,
      topic,
      sorting,
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
        ({ topicCode, countryCode, cfpEndDate }) =>
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
        limit: limit,
        cursor: next,
        more: more,
        total: matches.length,
        countries: countries,
        topicName: topic ? topicName(topic) : undefined,
        countryName: country ? nameBy(country) : undefined,
        topics: topics,
      },
    ]);
  })
);

module.exports = router;
