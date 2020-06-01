console.time("initializing add");
const asyncHandler = require("express-async-handler");
const router = require("express").Router();

const dayjs = require("dayjs");
dayjs.extend(require("dayjs/plugin/isSameOrAfter"));
dayjs.extend(require("dayjs/plugin/utc"));

const { twitterHandle } = require("../utils/twitter-handle");
const is = require("is_js");
const utc = dayjs.utc;
const Stats = require("../utils/stats");
const { storeIfNew } = require("../utils/datastore");
const { countries, states } = require("../utils/geo");
const { topics } = require("../utils/topics");
const { normalizedUrl } = require("../utils/urls");
const { emojiStrip } = require("../utils/emoji");

const required = () => {
  const { body, header } = require("express-validator");
  return [
    header("authorization").exists().notEmpty(),
    body("city").exists(),
    body("url").customSanitizer(normalizedUrl).isURL(),
    body("topicCode").isIn(topics),
    body("countryCode").isIn(countries),
    body("name").customSanitizer(emojiStrip).trim().notEmpty(),
    body("price")
      .exists()
      .bail()
      .custom(({ from, to, currency, free }) => {
        return (
          free ||
          (((from === 0 && to > 0) || (from > 0 && (!to || to > from))) &&
            currency.length === 3)
        );
      }),
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

    body("cfpEndDate")
      .optional({ checkFalsy: true })
      .custom((value) => utc(value).isAfter(utc(), "day"))
      .customSanitizer(utc),
    body("cfpUrl")
      .optional({ checkFalsy: true })
      .customSanitizer(normalizedUrl)
      .isURL(),
  ];
};

console.timeEnd("initializing add");

router.get(
  "/prepare",
  asyncHandler(async (req, res) => {
    const { countriesOrdered } = require("../utils/geo");
    const { topicsOrdered } = require("../utils/topics");
    const info = {
      countries: countriesOrdered,
      topics: topicsOrdered,
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
    await storeIfNew(event, stats);

    if (stats.hasAnyStored()) {
      const { tweet } = require("../utils/twitter");
      tweet(event);
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
    topicCode: body.topicCode,
    free: body.price.free,
    priceFrom: body.price.from,
    priceTo: body.price.to,
    priceCurrency: body.price.currency,
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
