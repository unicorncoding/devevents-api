console.time("initializing search");
const asyncHandler = require("express-async-handler");
const router = require("express").Router();
const allCountries = require("../utils/geo").countries;
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

    const keepRelevant = ({ featured, topics, countryCode }) =>
      countryCode !== "ON" && (featured || !topic || topics.includes(topic));
    const mapToLocation = ({ countryCode, continentCode }) =>
      `${continentCode}/${countryCode}`;

    const countries = chain(events)
      .filter(keepRelevant)
      .map(mapToLocation)
      .concat(country && continent ? `${continent}/${country}` : undefined)
      .compact()
      .countBy()
      .value();

    const topics = chain(events)
      .filter(
        ({ countryCode, featured }) =>
          featured || !country || country === countryCode
      )
      .flatMap(({ topics }) => topics)
      .concat(topic)
      .compact()
      .countBy()
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
