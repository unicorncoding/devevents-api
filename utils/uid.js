const dayjs = require("dayjs");
const slugify = require("@sindresorhus/slugify");

function uid({ name, city, startDate }) {
  if (!name || !city || !startDate) {
    throw `Cannot calculate uid for ${name}, because some values are missing.`;
  }

  const year = dayjs(startDate).year();
  const month = dayjs(startDate).month();

  return slugify(`${name.replace(year, "")}-${city}-${month}-${year}`);
}

module.exports.uid = uid;
