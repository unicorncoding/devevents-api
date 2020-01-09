const asyncHandler = require('express-async-handler');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

// const PORT = process.env.PORT || 5555;

// app.listen(PORT, () => {
  // console.log(`Server running on port ${PORT}`);
// });

app.get('/hello', (req, res) => {
  res.send("OK");
})

app.get('/api/:api', asyncHandler(async(req, res) => {
  const api = req.params.api;
  return await require("./api" + api)(req, res);
}));

exports.api = app;