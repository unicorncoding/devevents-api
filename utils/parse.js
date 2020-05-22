const { readFileSync } = require("fs");

function parseOrElse(f, orElse) {
  try {
    console.log("Preparing to parse " + f);
    return JSON.parse(readFileSync(f, "utf8"));
  } catch (e) {
    console.log("Unable to parse JSON: " + f + ". Returning " + orElse);
    return orElse;
  }
}

module.exports = parseOrElse;
