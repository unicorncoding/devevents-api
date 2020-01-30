const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const hash = require('hash-sum');
const dayjs = require('dayjs');
const { isFuture } = require('../utils/dates');
const { continents } = require('../utils/geo');
const { Feed } = require('feed');
const { searchForever } = require('../utils/datastore');

const pretty = it => dayjs(it).format("D MMMM");
const domain = 'https://dev.events';

router.get('/:continent([A-Z]{2})', asyncHandler(async(req, res) => {

  const continent = req.params.continent;
  const continentName = continents[continent];
  if (!continentName) {
    res.status(404).send(`Unknown continent ${continent}.`);
    return;
  }  

  const [ events ] = await searchForever(continent);

  const title = `dev.events: Upcoming developer events in ${continentName}`;

  const infoAbout = ( { name, topic, category, startDate, city, country }) => `
  ${topic} ${category} ${name} is happening on ${pretty(startDate)} in ${city}, ${country}. `

  const cfpIfAvailable = ( { cfpEndDate, cfpUrl } ) => isFuture(cfpEndDate) 
    ? `Submit your talk proposal at ${cfpUrl} before ${pretty(cfpEndDate)}.` 
    : ''

  const toFeedItem = event => ({
    title: event.name,
    id: hash([event.url, event.startDate]),
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
  events.map(toFeedItem).forEach(feed.addItem);

  res.set('Content-Type', 'text/xml');
  res.send(feed.rss2());
}));

module.exports = router;