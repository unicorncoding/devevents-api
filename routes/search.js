console.time("initializing search");
const asyncHandler = require("express-async-handler");
const router = require("express").Router();
const { countryName } = require("../utils/geo");
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
        !continent || featured || continentCode === continent
    );

    const countries = events
      .filter(({ topics }) => !topic || topics.includes(topic))
      .reduce((acc, it) => {
        const code = it.countryCode;
        const continent = it.continentCode;
        const name = it.country;
        const item = acc.find((item) => item.code === code) || { count: 0 };
        return acc
          .filter((that) => that != item)
          .concat({ count: item.count + 1, code, name, continent });
      }, [])
      .ordered((it, that) => it.name.localeCompare(that.name));

    const topics = chain(events)
      .filter(
        ({ countryCode, featured }) =>
          featured || !country || country === countryCode
      )
      .flatMap(({ topics }) => topics)
      .countBy();

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
        countryName: country ? countryName(country) : undefined,
      },
    ]);
  })
);

module.exports = router;
