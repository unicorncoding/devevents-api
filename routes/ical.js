const asyncHandler = require("express-async-handler");
const router = require("express").Router();
const ical = require("ical-generator");
const dayjs = require("dayjs");
const { isFuture } = require("../utils/dates");
const { topicName } = require("../utils/topics");
const { countries } = require("countries-list");
const { continents } = require("../utils/geo");
const { hash } = require("../utils/hash");
const {
  searchForever,
  byCfp,
  byCountry,
  byTopic,
} = require("../utils/datastore");

const pretty = (it) => dayjs(it).format("D MMMM");

router.get(
  "/:cfp(cfp)?/:continent([A-Z]{2})/:country([A-Z]{2})?/:topic(\\w+)?",
  asyncHandler(async (req, res) => {
    const { cfp, continent, country, topic } = req.params;
    const isOnline = continent === "ON";

    const events = await searchForever(continent, {});

    const infoAbout = ({ name, topic, category, startDate, city, country }) =>
      isOnline
        ? `Online ${topic} ${category} ${name} is happening on ${pretty(
            startDate
          )}. `.normalizeSpaces()
        : `${topic} ${category} ${name} is happening on ${pretty(
            startDate
          )} in ${city}, ${country}. `.normalizeSpaces();

    const cfpIfAvailable = ({ cfpEndDate, cfpUrl }) =>
      isFuture(cfpEndDate)
        ? `Submit your talk proposal at ${cfpUrl} before ${pretty(
            cfpEndDate
          )}.`.normalizeSpaces()
        : "";

    const inclusive = (date) => dayjs(date).add(1, "day").toDate();

    const toCalEvent = (it) => ({
      uid: hash(it),
      start: it.startDate,
      end: inclusive(it.endDate),
      summary: `${it.name} (${it.topic} ${it.category})`,
      location: `${it.city}, ${it.country}`,
      description: infoAbout(it) + cfpIfAvailable(it),
      url: it.url,
      allDay: true,
    });
    const calendarEvents = events
      .filter(byCfp(cfp))
      .filter(byCountry(country))
      .filter(byTopic(topic))
      .map(toCalEvent);

    const where = country ? countries[country].name : continents[continent];
    const what = topic ? topicName(topic) : "";
    const papers = cfp ? "with CFP" : "";
    const title = isOnline
      ? `Online ${what} events ${papers}`.normalizeSpaces()
      : `${what} events ${papers} in ${where}`.normalizeSpaces();

    const cal = ical({
      name: title,
      description: title,
      domain: "dev.events",
      prodId: {
        company: "devevents",
        product: "calendar",
        language: "EN",
      },
      events: calendarEvents,
    });

    cal.serve(res);
  })
);

module.exports = router;
