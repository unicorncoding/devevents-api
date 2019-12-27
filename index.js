function handleCors(req, res) {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
  }
}

exports.api = async (req, res) => {
  handleCors(req, res);
  const api = req.path;
  if (!api || api == "/") {
    res.send("Nothing valuable at this endpoint.")
  }
  console.log("requesting " + api)
  return require("./api" + api)(req, res);
}

