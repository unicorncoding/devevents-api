console.time("initializing admin");
const asyncHandler = require("express-async-handler");
const router = require("express").Router();
const { deleteOne, updateOne, search } = require("../utils/datastore");

const { chain, merge, mapValues } = require("lodash");
const topicNames = require("../utils/topics").topics;
const dayjs = require("dayjs");
dayjs.extend(require("dayjs/plugin/utc"));
const utc = dayjs.utc;

console.timeEnd("initializing admin");

router.get(
  "/work",
  asyncHandler(async (req, res) => {
    const { whois } = require("../utils/auth");
    const { admin } = await whois(req);
    if (!admin) {
      res.status(403).send("Sorry, you don't have access to view work queue");
      return;
    }

    const topicCounts = chain(await search())
      .flatMap(({ topics }) => topics)
      .countBy()
      .mapValues((count) => ({ count }))
      .value();

    const topicStats = mapValues(merge(topicNames, topicCounts), (it) => ({
      ...it,
      count: it.count || 0,
    }));

    const expiredEvents = await search({ fromInclusive: utc().subtract(14, 'day'), toInclusive: utc() })

    res.status(200).send({
      topicStats,
      expiredEvents
    });
  })
);

router.post(
  "/:eventId/update",
  asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { whois } = require("../utils/auth");
    const { admin } = await whois(req);
    if (!admin) {
      res.status(403).send("Sorry, you don't have access to update events");
      return;
    }

    const body = { ...req.body };

    const isEmptyBody = Object.keys(body).length === 0;
    if (isEmptyBody) {
      res.status(409).send("Body is empty");
      return;
    }

    body.startDate = new Date(body.startDate);
    body.endDate = new Date(body.endDate);

    const info = await updateOne(eventId, body);
    res.send(info);
  })
);

router.post(
  "/:eventId/delete",
  asyncHandler(async (req, res) => {
    const { whois } = require("../utils/auth");
    const { eventId } = req.params;
    const { admin } = await whois(req);

    if (!admin) {
      res.status(403).send("Sorry, you don't have access to delete events");
      return;
    }

    const info = await deleteOne(eventId);
    res.send(info);
  })
);

router.get(
  "/grant",
  asyncHandler(async (req, res) => {
    const { makeAdmin } = require("../utils/auth");
    const admin = "co.unicorn.ding@gmail.com";
    const info = await makeAdmin(admin);
    res.send(info);
  })
);

module.exports = router;
