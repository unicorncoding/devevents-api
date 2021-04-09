console.time("initializing add");
const asyncHandler = require("express-async-handler");
const router = require("express").Router();

const { dayjs } = require("../utils/dates");
const utc = dayjs.utc;

const { twitterHandle } = require("../utils/twitter-handle");
const is = require("is_js");
const Stats = require("../utils/stats");
const { storeIfNew } = require("../utils/datastore");
const { countries, countryName, states } = require("../utils/geo");
const { normalizedUrl } = require("../utils/urls");
const { emojiStrip } = require("../utils/emoji");
const { topics } = require("../utils/topics");

const eventTypes = ["conference", "training", "meetup"];

const required = () => {
  const { body, header } = require("express-validator");
  return [
    header("authorization").exists().notEmpty(),
    body("city").exists(),
    body("url").customSanitizer(normalizedUrl).isURL(),
    body("topic").isIn(Object.keys(topics)).optional(),
    body("topics") // deprecated
      .isArray({ min: 1, max: 3 })
      .isIn(Object.keys(topics))
      .optional(),
    body("countryCode").isIn(countries),
    body("category").isIn(eventTypes).optional(),
    body("name").customSanitizer(emojiStrip).trim().notEmpty(),
    body("price")
      .exists()
      .bail()
      .custom(({ free }) => free !== undefined),
    body("dates")
      .custom(is.not.empty)
      .bail()
      .customSanitizer(({ start, end = start }) => ({
        start: utc(start),
        end: utc(end),
      }))
      .custom(({ start, end }) => {
        const startsAtLeastToday = start.isSameOrAfter(utc(), "day");
        const endsNoEarlierThanStarts = end.isSameOrAfter(start, "day");
        return startsAtLeastToday && endsNoEarlierThanStarts;
      }),
    body("stateCode").custom((value, { req }) => {
      return req.body.countryCode !== "US" || !!states[value];
    }),
    body("twitter")
      .customSanitizer((value) => twitterHandle(value))
      .exists(),
  ];
};

console.timeEnd("initializing add");

router.get(
  "/prepare",
  asyncHandler(async (req, res) => {
    const { countriesOrdered } = require("../utils/geo");
    const info = {
      countries: countriesOrdered,
      types: eventTypes,
    };
    res.json(info);
  })
);

router.post(
  "/",
  required(),
  asyncHandler(async (req, res) => {
    const { validationResult } = require("express-validator");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json(errors.mapped());
    }

    const event = await newEventFrom(req);
    const stats = new Stats();
    const { uid } = require("../utils/uid");
    const id = uid(event);
    await storeIfNew(id, event, stats);

    if (stats.hasAnyStored()) {
      const { tweet } = require("../utils/twitter");
      tweet({ ...event, id });
      res.json(event);
    } else {
      res.status(409).send(conflictsWith(event));
    }
  })
);

async function newEventFrom(req) {
  const { whois } = require("../utils/auth");
  const { uid } = await whois(req);
  const body = req.body;
  return {
    countryCode: body.countryCode,
    stateCode: body.stateCode,
    continentCode: countries[body.countryCode].continent,
    topics: body.topic ? [body.topic] : body.topics,
    free: body.price.free,
    category: body.category || "conference",
    description: body.description,
    creator: uid,
    creationDate: new Date(),
    startDate: body.dates.start.toDate(),
    endDate: body.dates.end.toDate(),
    name: body.name,
    twitter: body.twitter,
    city: body.city,
    url: body.url,
  };
}

function conflictsWith(conflictingEvent) {
  const when = dayjs(conflictingEvent.startDate).format("MMMM YYYY");
  const country = countryName(conflictingEvent.countryCode);
  return `${conflictingEvent.name} already scheduled on ${when} (${country})`;
}

module.exports = router;
