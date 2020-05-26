const asyncHandler = require("express-async-handler");
const router = require("express").Router();
const { makeAdmin, whois } = require("../utils/auth");
const { deleteOne } = require("../utils/datastore");

router.post(
  "/:eventId/delete",
  asyncHandler(async (req, res) => {
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
    const admin = "co.unicorn.ding@gmail.com";
    const info = await makeAdmin(admin);
    res.send(info);
  })
);

module.exports = router;
