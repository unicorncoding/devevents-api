console.time("initializing sitemap");
const asyncHandler = require("express-async-handler");
const router = require("express").Router();
const { searchForever } = require("../utils/datastore");
const { flatten } = require("../utils/arrays");
const continents = Object.keys(require("../utils/geo").continents);

console.timeEnd("initializing sitemap");

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { SitemapStream } = require("sitemap");
    const { createGzip } = require("zlib");

    res.header("Content-Type", "application/xml");
    res.header("Content-Encoding", "gzip");

    const links = new Set();

    const events = flatten(
      await Promise.all(continents.map((it) => searchForever(it, {})))
    );

    events.forEach((it) => {
      links.add(`/${it.continentCode}`);
      it.topics.forEach((topic) => {
        links.add(`/${it.continentCode}/${topic}`);
      });
      if (it.continentCode !== "ON") {
        links.add(`/${it.continentCode}/${it.countryCode}`);
        it.topics.forEach((topic) => {
          links.add(`/${it.continentCode}/${it.countryCode}/${topic}`);
        });
      }
    });

    try {
      const stream = new SitemapStream({ hostname: "https://dev.events/" });
      const pipeline = stream.pipe(createGzip());
      links.forEach((link) => stream.write({ url: link, changefreq: "daily" }));
      stream.end();
      pipeline.pipe(res).on("error", (e) => {
        throw e;
      });
    } catch (e) {
      console.error(e);
      res.status(500).end();
    }
  })
);

module.exports = router;
