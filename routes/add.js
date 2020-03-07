const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const emojiStrip = require('emoji-strip')
const normalizeUrl = url => url ? require('normalize-url')(url, { stripHash: true }) : url;
const _ = require('lodash');

const Stats = require('../utils/stats')

const { body, validationResult } = require('express-validator');
const { storeIfNew } = require('../utils/datastore');
const { countries } = require('../utils/geo');
const { topics } = require('../utils/topics');

const required = [
  body('category').isIn(['conference', 'training', 'meetup']),
  body('city').exists(),
  body('url').customSanitizer(normalizeUrl).isURL(),
  body('topicCode').isIn(topics),
  body('countryCode').isIn(countries),
  body('name').customSanitizer(emojiStrip).trim().notEmpty(),
  body('startDate').isISO8601().toDate(),
]

const optionals = [
  body('twitter').optional(),
  body('cfpEndDate').optional().toDate(),
  body('cfpUrl').optional().customSanitizer(normalizeUrl).isURL(),
  body('endDate').optional().isISO8601().toDate()
];

router.post('/', required.concat(optionals), asyncHandler(async(req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json( errors.mapped() );
  }

  const {
    name, 
    countryCode, 
    city,
    topicCode, 
    startDate, 
    endDate, 
    cfpEndDate,
    cfpUrl,
    twitter,
    url,
    category } = req.body;

  const event = {
    category: category,
    countryCode: countryCode,
    continentCode: countries[countryCode].continent,
    country: countries[countryCode].name,
    topicCode: topicCode,
    topic: topics[topicCode].name,
    source: 'devevents',
    creationDate: new Date(),
    startDate: startDate,
    endDate: endDate ? endDate : startDate,
    cfpEndDate: cfpEndDate,
    name: name,
    twitter: twitter,
    city: city,
    url: url,
    cfpUrl: cfpUrl,
    pending: true
  }

  const stats = new Stats();
  await storeIfNew(event, stats);

  const added = stats.total > 0;
  if (added) {
    res.json(event);
  } else {
    res.json(`${event.name} ${event.category} has already been scheduled in ${event.city}, ${event.country}.`);
  }

}));

module.exports = router;