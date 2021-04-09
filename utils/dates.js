const dayjs = require("dayjs");
dayjs.extend(require("dayjs/plugin/isSameOrAfter"));
dayjs.extend(require("dayjs/plugin/relativeTime"));
dayjs.extend(require("dayjs/plugin/utc"));

function isFuture(date) {
  return date && dayjs(date).isSameOrAfter(dayjs());
}

module.exports.dayjs = dayjs;
module.exports.isFuture = isFuture;
