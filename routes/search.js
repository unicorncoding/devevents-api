console.time("initializing search");
const asyncHandler = require("express-async-handler");
const router = require("express").Router();
const allCountries = require("../utils/geo").countries;
const allTopics = require("../utils/topics").topics;
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

    const countByCountry = chain(events)
      .map((it) => it.countryCode)
      .countBy()
      .value();

    const countries = chain(allCountries)
      .map(({ name, continent }, code) => ({
        code,
        name,
        continent,
        count: countByCountry[code] || 0,
      }))
      .filter((it) => {
        const isSelectedCountry = country === it.code;
        const isInSelectedContinent = !continent || continent === it.continent;
        const hasAtLeastOneEvent = it.count > 0;
        return (
          isSelectedCountry || (isInSelectedContinent && hasAtLeastOneEvent)
        );
      })
      .value();

    const countByTopic = chain(events)
      .flatMap((it) => it.topics)
      .countBy()
      .value();

    const topics = chain(allTopics)
      .map(({ name }, code) => ({ code, name, count: countByTopic[code] }))
      .filter((it) => {
        const isSelectedTopic = topic === it.code;
        const hasAtLeastOneEvent = it.count > 0;
        return isSelectedTopic || hasAtLeastOneEvent;
      })
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
        countries,
        topics,
        cursor: next,
        total: matches.length,
        countryName: country ? allCountries[country].name : undefined,
      },
    ]);
  })
);

module.exports = router;
