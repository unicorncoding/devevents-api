const asyncHandler = require("express-async-handler");
const router = require("express").Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { topics } = require("../utils/topics");
    const { countries } = require("../utils/geo");
    res.json({ allTopics: topics, allCountries: countries });
  })
);

module.exports = router;
