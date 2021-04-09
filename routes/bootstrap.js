const asyncHandler = require("express-async-handler");
const router = require("express").Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { topics } = require("../utils/topics");
    const { continents } = require("../utils/geo");
    res.json({ allTopics: topics, continents });
  })
);

module.exports = router;
