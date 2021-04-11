console.time("initializing search");
const asyncHandler = require("express-async-handler");
const router = require("express").Router();
const { countryName, countriesOrdered } = require("../utils/geo");
const { topics } = require("../utils/topics");
const { searchUpcoming } = require("../utils/datastore");
const { chunk, chain } = require("lodash");
const { startDate, cheapestFirst, newestFirst } = require("../utils/sortings");
console.timeEnd("initializing search");

const sortings = {
  cheapestFirst,
  newestFirst,
  startDate,
};

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const {
      continent,
      country,
      topic,
      sorting,
      limit = 30,
      start = 0,
    } = req.query;

    const events = (await searchUpcoming()).filter(
      ({ featured, continentCode }) =>
      featured || !continent || continentCode === continent
    );

    const eventsByCountry = chain(events)
      .map(({countryCode}) => countryCode)
      .countBy()
      .value();

    const countryStats = countriesOrdered
      .map(({code, name, continent}) => ({code, name, continent, count: eventsByCountry[code] || 0}))
      .filter(it => !continent || it.continent === continent)

    const countByTopic = chain(events)
      .flatMap(({ topics }) => topics)
      .countBy()
      .value();

    const topicStats = chain(topics)
      .mapValues((_, code) => countByTopic[code])
      .pickBy(Boolean)
      .value();

    const matches = sortings[sorting](
      events.filter(
        ({ topics, countryCode, featured }) =>
          featured ||
          ((!topic || topics.includes(topic)) &&
            (!country || country === countryCode))
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
        countries: countryStats,
        topics: topicStats,
        cursor: next,
        total: matches.length,
        countryName: country ? countryName(country) : undefined,
      },
    ]);
  })
);

module.exports = router;
