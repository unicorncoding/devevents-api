const _ = require("lodash");

module.exports.orderBy = (items, sorting) => {
  return _.orderBy(
    items,
    sorting.replace("-", ""),
    sorting.includes("-") ? "desc" : "asc"
  );
};

const flatten = (arr) => {
  return arr.reduce((flat, toFlatten) => {
    return flat.concat(
      Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten
    );
  }, []);
};
module.exports.flatten = flatten;
