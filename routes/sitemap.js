const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const { searchForever } = require('../utils/datastore');
const continents = Object.keys(require('../utils/geo').continents);

const { SitemapStream } = require('sitemap');
const { createGzip } = require('zlib');

// remove in Node 12
const allSettled = require('promise.allsettled');
allSettled.shim();

router.get('/', asyncHandler(async(req, res) => {

  const links = new Set();

  const allEvents = await Promise.all(continents.map(it => searchForever(it, {})));

  allEvents.forEach(it => {
    links.add(`/${it.continentCode}`);
    links.add(`/${it.continentCode}/${it.topicCode}`);
    links.add(`/${it.continentCode}/${it.countryCode}`);
    links.add(`/${it.continentCode}/${it.countryCode}/${it.topicCode}`)
  })
  
  try {
    const stream = new SitemapStream({ hostname: 'https://dev.events/' });
    const pipeline = stream.pipe(createGzip());
    links.forEach(link => stream.write({ url: link,  changefreq: 'daily' }))
    stream.end();
    pipeline.pipe(res).on('error', (e) => { throw e });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }

  res.header('Content-Type', 'application/xml');
  res.header('Content-Encoding', 'gzip');
  res.send();

}));

module.exports = router;