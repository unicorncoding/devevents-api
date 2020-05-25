const dayjs = require("dayjs");
const hash = require("hash-sum");

function uid({ name, countryCode, startDate }) {
  if (!name || !countryCode || !startDate) {
    throw `Cannot calculate uid for ${name}, because some values are missing.`;
  }

  const date = dayjs(startDate).format("DD-MM-YYYY");
  const prefix = name.replace(/[^a-zA-Z0-9]/g, "-");
  const suffix = hash([name, countryCode, date]);

  return `${prefix}-${suffix}`.toLowerCase();
}

module.exports.uid = uid;
