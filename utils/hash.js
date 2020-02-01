const hash = require('hash-sum');
const dayjs = require('dayjs');

function hashOf({ startDate, url }) {
  if (!startDate || !url) {
    throw `Cannot calculate a hash for ${startDate} and ${url}`;
  }
  const dateNoTime = dayjs(startDate).format("DD-MM-YYYY");
  return hash([dateNoTime, url]);
}

module.exports.hash = hashOf