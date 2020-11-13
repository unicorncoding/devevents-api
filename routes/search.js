console.time("initializing search");
const asyncHandler = require("express-async-handler");
const router = require("express").Router();
const { countryName } = require("../utils/geo");
const { search, byName } = require("../utils/datastore");
const { localPrice } = require("../utils/pricing");
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

    const targetCurrency = continent === "EU" ? "EUR" : "USD";

    const events = (await search(continent)).map((event) => ({
      ...event,
      localPrice: localPrice(event, targetCurrency),
    }));

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
      .ordered(byName);

    const topics = chain(events)
      .filter(({ countryCode }) => !country || country === countryCode)
      .flatMap(({ topics }) => topics)
      .countBy();

    const matches = sortings[sorting](
      events.filter(
        ({ topics, countryCode }) =>
          (!topic || topics.includes(topic)) &&
          (!country || country === countryCode)
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
