const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const dayjs = require('dayjs');
const emojiStrip = require('emoji-strip')

const _ = require('lodash');

const Stats = require('../utils/stats')

const { body, validationResult } = require('express-validator');
const { storeIfNew } = require('../utils/datastore');
const { countries } = require('../utils/geo');
const { topics } = require('../utils/topics');
const { normalizedUrl } = require('../utils/urls');

const required = [
  body('category').isIn(['conference', 'training', 'meetup']),
  body('city').exists(),
  body('url').customSanitizer(normalizedUrl).isURL(),
  body('topicCode').isIn(topics),
  body('countryCode').isIn(countries),
  body('name').customSanitizer(emojiStrip).trim().notEmpty(),
  body('startDate').isISO8601().toDate(),
]

const optionals = [
  body('twitter').optional(),
  body('cfpEndDate').optional().toDate(),
  body('cfpUrl').optional().customSanitizer(normalizedUrl).isURL(),
  body('endDate').optional().isISO8601().toDate()
];

router.post('/', required.concat(optionals), asyncHandler(async(req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.mapped());
  }

  const event = newEventFrom(req);
  const stats = new Stats();
  await storeIfNew(event, stats);

  const stored = stats.total > 0;
  if (stored) {
    res.json(event);
  } else {
    res.status(409).send(conflictsWith(event));
  }

}));

function newEventFrom(req) {
  const body = req.body;
  return ({
    category: body.category,
    countryCode: body.countryCode,
    continentCode: countries[body.countryCode].continent,
    country: countries[body.countryCode].name,
    topicCode: body.topicCode,
    topic: topics[body.topicCode].name,
    source: 'devevents',
    creationDate: new Date(),
    startDate: body.startDate,
    endDate: body.endDate ? body.endDate : body.startDate,
    cfpEndDate: body.cfpEndDate,
    name: body.name,
    twitter: body.twitter,
    city: body.city,
    url: body.url,
    cfpUrl: body.cfpUrl,
    pending: true
  });
}

function conflictsWith(conflictingEvent) {
  const what = `${conflictingEvent.name} ${conflictingEvent.category}`;
  const when = dayjs(conflictingEvent.startDate).format("YYYY-MM-DD");
  const where = `${conflictingEvent.city}, ${conflictingEvent.country}`;
  return `${what} is hapenning on ${when} in ${where}.`;
}

module.exports = router;