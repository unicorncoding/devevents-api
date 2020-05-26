const asyncHandler = require("express-async-handler");
const router = require("express").Router();
const dayjs = require("dayjs");
dayjs.extend(require("dayjs/plugin/isSameOrAfter"));
dayjs.extend(require("dayjs/plugin/utc"));

const { tweet } = require("../utils/twitter");

const utc = dayjs.utc;

const Stats = require("../utils/stats");

const { check, body, header, validationResult } = require("express-validator");
const { storeIfNew } = require("../utils/datastore");
const { countries, countriesOrdered, states } = require("../utils/geo");
const { topics, topicsOrdered } = require("../utils/topics");
const { normalizedUrl } = require("../utils/urls");
const { emojiStrip } = require("../utils/emoji");
const { whois } = require("../utils/auth");

const required = [
  header("authorization").exists().notEmpty(),
  body("city").exists(),
  body("url").customSanitizer(normalizedUrl).isURL(),
  body("topicCode").isIn(topics),
  body("countryCode").isIn(countries),
  body("name").customSanitizer(emojiStrip).trim().notEmpty(),
  check("startDate")
    .custom((value) => utc(value).isAfter(utc(), "day"))
    .customSanitizer(utc),
  body("stateCode").custom((value, { req }) => {
    return req.body.countryCode !== "US" || !!states[value];
  }),
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
      tweet(event);
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
    countryCode: body.countryCode,
    stateCode: body.stateCode,
    continentCode: countries[body.countryCode].continent,
    topicCode: body.topicCode,
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
  };
}

function conflictsWith(conflictingEvent) {
  const when = dayjs(conflictingEvent.startDate).format("DD MMMM YYYY");
  return `${conflictingEvent.name} already scheduled in ${conflictingEvent.country} on ${when}`;
}

module.exports = router;
