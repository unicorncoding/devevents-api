console.time("initializing fetchOne");
const asyncHandler = require("express-async-handler");
const router = require("express").Router();
const { fetchOne } = require("../utils/datastore");
console.timeEnd("initializing fetchOne");

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;

    const conf = await fetchOne(id);
    res.send(conf);
  })
);

module.exports = router;
