const asyncHandler = require("express-async-handler");
const router = require("express").Router();
const dayjs = require("dayjs");
dayjs.extend(require("dayjs/plugin/isSameOrAfter"));
dayjs.extend(require("dayjs/plugin/utc"));

const utc = dayjs.utc;

const Stats = require("../utils/stats");

const { check, body, header, validationResult } = require("express-validator");
const { storeIfNew } = require("../utils/datastore");
const { countries, countriesOrdered } = require("../utils/geo");
const { topics, topicsOrdered } = require("../utils/topics");
const { normalizedUrl } = require("../utils/urls");
const { emojiStrip } = require("../utils/emoji");
const { whois } = require("../utils/auth");

const required = [
  header("authorization").exists().notEmpty(),
  body("category").isIn(["conference", "training", "meetup"]),
  body("city").exists(),
  body("url").customSanitizer(normalizedUrl).isURL(),
  body("topicCode").isIn(topics),
  body("countryCode").isIn(countries),
  body("name").customSanitizer(emojiStrip).trim().notEmpty(),
  check("startDate")
    .custom((value) => utc(value).isAfter(utc(), "day"))
    .customSanitizer(utc),
];

const optionals = [
  body("twitter")
    .optional({ checkFalsy: true })
    .custom((value) => value.startsWith("@") && value.length > 3)
    .customSanitizer((value) => value.replace("@", "")),
  body("cfpEndDate")
    .optional({ checkFalsy: true })
    .custom((value) => utc(value).isAfter(utc(), "day"))
    .customSanitizer(utc),
  body("cfpUrl")
    .optional({ checkFalsy: true })
    .customSanitizer(normalizedUrl)
    .isURL(),
  body("endDate")
    .optional({ checkFalsy: true })
    .custom((value, { req }) => {
      const it = utc(value);
      return (
        it.isAfter(utc(), "day") && it.isSameOrAfter(req.body.startDate, "day")
      );
    })
    .customSanitizer(utc),
];

router.get(
  "/prepare",
  asyncHandler(async (req, res) => {
    const info = {
      countries: countriesOrdered,
      topics: topicsOrdered,
    };
    res.json(info);
  })
);

router.post(
  "/",
  required.concat(optionals),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json(errors.mapped());
    }

    const event = await newEventFrom(req);
    const stats = new Stats();
    await storeIfNew(event, stats);

    if (stats.hasAnyStored()) {
      res.json(event);
    } else {
      res.status(409).send(conflictsWith(event));
    }
  })
);

async function newEventFrom(req) {
  const { uid } = await whois(req);
  const body = req.body;
  return {
    category: body.category,
    countryCode: body.countryCode,
    continentCode: countries[body.countryCode].continent,
    country: countries[body.countryCode].name,
    topicCode: body.topicCode,
    topic: topics[body.topicCode].name,
    source: "devevents",
    creator: uid,
    creationDate: new Date(),
    startDate: body.startDate.toDate(),
    endDate: body.endDate ? body.endDate.toDate() : body.startDate.toDate(),
    cfpEndDate: body.cfpEndDate ? body.cfpEndDate.toDate() : body.cfpEndDate,
    name: body.name,
    twitter: body.twitter,
    city: body.city,
    url: body.url,
    cfpUrl: body.cfpUrl,
    pending: true,
  };
}

function conflictsWith(conflictingEvent) {
  const when = dayjs(conflictingEvent.startDate).format("YYYY-MM-DD");
  return `There is an event happening on ${when} that points to the same web address ${conflictingEvent.url}.`;
}

module.exports = router;
