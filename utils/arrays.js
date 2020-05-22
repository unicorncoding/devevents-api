const count = (codeFn, nameFn) => (acc, it) => {
  const code = codeFn(it);
  const name = nameFn(it);
  const item = acc.find((item) => item.code === code) || { count: 0 };
  return acc
    .filter((that) => that != item)
    .concat({ count: item.count + 1, code: code, name: name });
};

module.exports.count = count;
