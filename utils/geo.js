const unpopularCountries = ["GS", "IO", "HM", "UM", "AX", "AQ", "VI"];
const countries = require("countries-list").countries;
countries["ON"] = {
  name: "Online",
  continent: "ON",
};

const continents = {
  EU: "Europe",
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

module.exports.countryName = countryName;
module.exports.continents = continents;
module.exports.countries = countries;
module.exports.countriesOrdered = Object.keys(countries)
  .map((code) => ({ code: code, name: countries[code].name }))
  .filter((it) => !unpopularCountries.includes(it.code))
  .sort((it, that) => it.name.localeCompare(that.name));
