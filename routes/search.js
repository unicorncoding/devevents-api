console.time("initializing search");
const asyncHandler = require("express-async-handler");
const router = require("express").Router();
const { countryName } = require("../utils/geo");
const { count } = require("../utils/arrays");
const { isFuture } = require("../utils/dates");
const { topicName } = require("../utils/topics");
const { search, byName } = require("../utils/datastore");
const { localPrice } = require("../utils/pricing");
const { chunk } = require("lodash");
const { startDate, cheapestFirst, newestFirst } = require("../utils/sortings");
console.timeEnd("initializing search");

const sortings = {
  cheapestFirst: cheapestFirst,
  newestFirst: newestFirst,
  startDate: startDate,
};

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

    const targetCurrency = continent === "EU" ? "EUR" : "USD";

    const events = (await search(continent)).map((event) => ({
      ...event,
      localPrice: localPrice(event, targetCurrency),
    }));
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

    const matches = sortings[sorting](
      events.filter(
        ({ topicCode, countryCode, cfpEndDate }) =>
          (!topic || topic === topicCode) &&
          (!country || country === countryCode) &&
          (!cfp || isFuture(cfpEndDate))
      )
    );

    const shown = chunk(matches, limit)[start] || [];

    const next = +start + 1;
    const more = matches.length > limit * next;

    res.json([
      shown,
      {
        limit,
        more,
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
