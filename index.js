exports.api = async (req, res) => {
  const api = req.path;
  console.log("requesting " + api)
  return require("." + api);
}

