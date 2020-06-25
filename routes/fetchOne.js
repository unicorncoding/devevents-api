console.time("initializing fetchOne");
const asyncHandler = require("express-async-handler");
const router = require("express").Router();
const axios = require("axios");
const { fetchOne } = require("../utils/datastore");
const normalizeUrl = require("normalize-url");

console.timeEnd("initializing fetchOne");

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const conf = await fetchOne(id);
    const httpsUrl = normalizeUrl(conf.url, { forceHttps: true });
    const previewAvailable = await axios
      .get(httpsUrl)
      .then((response) => !response.headers["x-frame-options"])
      .catch(() => false);

    res.send({ ...conf, previewAvailable });
  })
);

module.exports = router;
