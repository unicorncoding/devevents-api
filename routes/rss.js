const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const dayjs = require('dayjs');
const { topicName } = require('../utils/topics');
const { countries } = require('countries-list');
const { hash } = require('../utils/hash');
const { isFuture } = require('../utils/dates');
const { continents } = require('../utils/geo');
const { Feed } = require('feed');
const { searchForever, byCfp, byCountry, byTopic } = require('../utils/datastore');

const pretty = it => dayjs(it).format("D MMMM");
const domain = 'https://dev.events';

router.get('/:cfp(cfp)?/:continent([A-Z]{2})/:country([A-Z]{2})?/:topic(\\w+)?', asyncHandler(async(req, res) => {

  const { cfp, continent, country, topic } = req.params;
  const [ events ] = await searchForever(continent);

  const someEvents = events
    .filter(byCfp(cfp))
    .filter(byCountry(country))
    .filter(byTopic(topic));

  const where = country ? countries[country].name : continents[continent];
  const what = topic ? topicName(topic) : 'developer';
  const title = cfp 
    ? `dev.events: Upcoming ${what} events with CFP in ${where}`
    : `dev.events: Upcoming ${what} events in ${where}`;

  const infoAbout = ( { name, topic, category, startDate, city, country }) => `
  ${topic} ${category} ${name} is happening on ${pretty(startDate)} in ${city}, ${country}. `

  const cfpIfAvailable = ( { cfpEndDate, cfpUrl } ) => isFuture(cfpEndDate) 
    ? `Submit your talk proposal at ${cfpUrl} before ${pretty(cfpEndDate)}.` 
    : ''

  const toFeedItem = event => ({
    title: event.name,
    id: hash(event),
    link: event.url,
    category: [ { name: event.topic } ],
    description: infoAbout(event) + cfpIfAvailable(event)
  })

  const feed = new Feed({
    title: title,
    description: title,
    link: domain,
    image: `${domain}/logo.png`,
  });
  someEvents.map(toFeedItem).forEach(feed.addItem);

  res.set('Content-Type', 'text/xml');
  res.send(feed.rss2());
}));

module.exports = router;