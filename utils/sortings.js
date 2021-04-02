const { sortBy, orderBy } = require("lodash");

module.exports.cheapestFirst = function (arr) {
  return sortBy(arr, (item) => {
    if (item.featured === true) {
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
  return orderBy(arr, ["featured", "creationDate"], ["asc", "desc"]);
};

module.exports.startDate = function (arr) {
  return orderBy(arr, ["featured", "startDate"], ["asc", "asc"]);
};
