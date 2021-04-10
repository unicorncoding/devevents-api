const asyncHandler = require("express-async-handler");
const router = require("express").Router();
const dayjs = require("dayjs");
const { searchUpcomingForever } = require("../utils/datastore");
const { topics: allTopics } = require("../utils/topics");

const pretty = (it) => dayjs(it).format("D MMMM");
const domain = "https://dev.events";

router.get(
  "/",
  asyncHandler(async (req, res) => {
    console.time("rss fetch");
    const events = await searchUpcomingForever();
    console.timeEnd("rss fetch");

    const someEvents = events;

    const title = "Upcoming developer events";

    const infoAbout = ({
      name,
      topics: [topic],
      category,
      startDate,
      city,
      country,
    }) =>
      country === "ON"
        ? `Online ${
            allTopics[topic].name
          } ${category} ${name} is happening on ${pretty(
            startDate
          )}. `.normalizeSpaces()
        : `${
            allTopics[topic].name
          } ${category} ${name} is happening on ${pretty(
            startDate
          )} in ${city}, ${country}. `.normalizeSpaces();

    const toFeedItem = (event) => ({
      title: event.name,
      id: event.id,
      link: `https://dev.events/conferences/${event.id}`,
      category: [{ name: allTopics[event.topics[0]].name }],
      description: infoAbout(event),
    });

    const { Feed } = require("feed");
    const feed = new Feed({
      title: title,
      description: title,
      link: domain,
      image: `${domain}/logo.png`,
    });
    someEvents.map(toFeedItem).forEach(feed.addItem);

    res.set("Content-Type", "text/xml");
    res.send(feed.rss2());
  })
);

module.exports = router;
