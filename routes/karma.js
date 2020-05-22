const asyncHandler = require("express-async-handler");
const router = require("express").Router();
const { whois } = require("../utils/auth");
const { karma } = require("../utils/datastore");

router.get(
  "/",
  asyncHandler(async (req, res) => {
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
