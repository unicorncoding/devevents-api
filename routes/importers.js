const asyncHandler = require("express-async-handler");
const router = require("express").Router();
const conferences = require("../utils/confs");
const Stats = require("../utils/stats");

// remove in Node 12
const allSettled = require("promise.allsettled");
allSettled.shim();

const { storeIfNew } = require("../utils/datastore");
const { tweet } = require("../utils/twitter");

router.get(
  "/devevents",
  asyncHandler(async (req, res) => {
    const confs = await conferences();
    const stats = new Stats();
    await Promise.allSettled(confs.map((each) => storeIfNew(each, stats)));

    stats.forEachStored((event) => tweet(event));

    stats.dump(res);
  })
);

module.exports = router;
