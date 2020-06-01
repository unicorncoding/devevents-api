console.time("initializing admin");
const asyncHandler = require("express-async-handler");
const router = require("express").Router();
const { deleteOne } = require("../utils/datastore");

console.timeEnd("initializing admin");

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
