const _ = require("lodash");

module.exports.cheapestFirst = function (arr) {
  return _.sortBy(arr, (item) => {
    if (item.free === true) {
      return Number.MIN_SAFE_INTEGER;
    }
    if (item.free === undefined || item.localPrice === undefined) {
      return Number.MAX_SAFE_INTEGER;
    }
    return item.localPrice.from;
  });
};

module.exports.newestFirst = function (arr) {
  return _.orderBy(arr, "creationDate", "desc");
};

module.exports.startDate = function (arr) {
  return _.orderBy(arr, "startDate", "asc");
};
