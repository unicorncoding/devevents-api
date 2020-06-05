const _ = require("lodash");

const count = (codeFn, nameFn) => (acc, it) => {
  const code = codeFn(it);
  const name = nameFn(it);
  const item = acc.find((item) => item.code === code) || { count: 0 };
  return acc
    .filter((that) => that != item)
    .concat({ count: item.count + 1, code: code, name: name });
};

module.exports.count = count;

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
