const dayjs = require("dayjs");
const hash = require("hash-sum");

function hashOf({ name, countryCode, city, startDate }) {
  if (!name || !countryCode || !startDate || !city) {
    throw `Cannot calculate a hash for ${name}, because some values are missing.`;
  }

  const date = dayjs(startDate).format("DD-MM-YYYY");
  const prefix = name.replace(/[^a-zA-Z0-9]/g, "-");
  const suffix = hash([name, countryCode, city, date]);

  return `${prefix}-${suffix}`.toLowerCase();
}

module.exports.hash = hashOf;
