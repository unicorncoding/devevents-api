const asyncHandler = require("express-async-handler");
const router = require("express").Router();
const dayjs = require("dayjs");
dayjs.extend(require("dayjs/plugin/isSameOrAfter"));
dayjs.extend(require("dayjs/plugin/utc"));

const { tweet } = require("../utils/twitter");

const utc = dayjs.utc;

const Stats = require("../utils/stats");

const { body, header, validationResult } = require("express-validator");
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
  body("dates")
    .exists()
    .bail()
    .customSanitizer((range) => ({
      start: utc(range.start),
      end: utc(range.end),
    }))
    .custom((value) => {
      const { start, end } = value;
      const startsAtLeastToday = start.isSameOrAfter(utc(), "day");
      const endsNoEarlierThanStarts = end.isSameOrAfter(start, "day");
      return startsAtLeastToday && endsNoEarlierThanStarts;
    }),
  body("stateCode").custom((value, { req }) => {
    return req.body.countryCode !== "US" || !!states[value];
  }),
  body("twitter")
    .custom((value) => value.startsWith("@") && value.length > 3)
    .customSanitizer((value) => value && value.replace("@", "")),
];

const optionals = [
  body("cfpEndDate")
    .optional({ checkFalsy: true })
    .custom((value) => utc(value).isAfter(utc(), "day"))
    .customSanitizer(utc),
  body("cfpUrl")
    .optional({ checkFalsy: true })
    .customSanitizer(normalizedUrl)
    .isURL(),
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
    startDate: body.dates.start.toDate(),
    endDate: body.dates.end.toDate(),
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
