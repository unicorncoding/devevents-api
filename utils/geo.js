const { states } = require("./states");
const countries = require("./countries");
const emojis = require("./countries-emoji.json");

const continents = {
  EU: "EU",
  AM: "America",
  AS: "Asia",
  AF: "Africa",
  OC: "Oceania",
  ON: "Online",
};

Object.values(countries).forEach(
  (it) => (it.continent = normalizedContinent(it.continent))
);

function normalizedContinent(continent) {
  return continent.replace("NA", "AM").replace("SA", "AM");
}

function countryName(countryCode) {
  return countries[countryCode].name;
}

function countryEmoji(countryCode) {
  return emojis[countryCode].emoji;
}

function stateName(stateCode) {
  return states[stateCode];
}

module.exports.countryName = countryName;
module.exports.countryEmoji = countryEmoji;
module.exports.continents = continents;
module.exports.states = states;
module.exports.stateName = stateName;
module.exports.countries = countries;
module.exports.countriesOrdered = Object.keys(countries)
  .map((code) => ({
    code,
    name: countries[code].name,
  }))
  .sort((it, that) => it.name.localeCompare(that.name));
