const dayjs = require('dayjs');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter')
dayjs.extend(isSameOrAfter)

function isFuture(date) {
  return date && dayjs(date).isSameOrAfter(dayjs());
}

module.exports.isFuture = isFuture;