const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

require("dotenv").config();

app.use(cors());
app.use(morgan("tiny"));
app.use(bodyParser.json());

require("./utils/mixins");
require("./routes/index")(app);

if (process.env.MODE === "dev") {
  const port = 5555;
  app.listen(port, () => console.log("Server running on port " + port));
}

exports.api = app;
