exports.api = async (req, res) => {
  const api = req.path;
  if (!api || api == "/") {
    res.send("Nothing valuable at this endpoint.")
  }
  console.log("requesting " + api)
  return require("./api" + api)(req, res);
}

