const _ = require("lodash");

module.exports.cheapestFirst = function (arr) {
  return _.sortBy(arr, (item) => {
    if (item.top === true) {
      return Number.MIN_SAFE_INTEGER;
    }
    if (item.free === true) {
      return Number.MIN_SAFE_INTEGER + 1;
    }
    if (item.free === undefined) {
      return Number.MAX_SAFE_INTEGER;
    }
    return item.free;
  });
};

module.exports.newestFirst = function (arr) {
  return _.orderBy(arr, ["top", "creationDate"], ["asc", "desc"]);
};

module.exports.startDate = function (arr) {
  return _.orderBy(arr, ["top", "startDate"], ["asc", "asc"]);
};
