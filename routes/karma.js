console.time("initializing karma");
const asyncHandler = require("express-async-handler");
const router = require("express").Router();

console.timeEnd("initializing karma");
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { whois } = require("../utils/auth");
    const { karma } = require("../utils/datastore");
    const { uid } = await whois(req);
    if (!uid) {
      res.send("0");
      return;
    }

    const info = await karma(uid);
    res.send(info + "");
  })
);

module.exports = router;
