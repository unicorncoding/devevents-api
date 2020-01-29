const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

require('./utils/mixins');
require('./routes/index')(app);

if (process.env.MODE === "dev") {
  const port = 5555;
  app.listen(port, () => console.log('Server running on port ' + port));
}

exports.api = app;