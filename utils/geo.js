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

function normalizedCountry(country) {
  return country
    .replace("U.S.A.", "United States")
    .replace("U.K.", "United Kingdom")
    .replace("Deutschland", "Germany")
    .replace("switzerland", "Switzerland")
    .replace("online", "Online")
    .replace("Netherland", "Netherlands")
    .replace("Germnay", "Germany")
    .replace("Netherlandss", "Netherlands")
    .replace("Perú", "Peru")
    .replace("Niederlande", "Netherlands")
    .replace("Czech republic", "Czech Republic")
    .trim();
}

function continentOf(country) {
  const match = Object.values(countries).find((it) => it.name == country);
  if (!match || !match.continent) {
    throw "Cannot find continent for country " + country;
  }
  return match.continent;
}

function codeOf(country) {
  const match = Object.entries(countries).find(([, it]) => it.name == country);
  if (!match) {
    throw "Cannot find country code for country " + country;
  }
  const [countryCode] = match;
  return countryCode;
}

function nameBy(countryCode) {
  return countries[countryCode].name;
}

function emojiBy(code) {
  const [, countryCode] = code.split("/");
  return countries[countryCode] ? countries[countryCode].emoji : undefined;
}

module.exports.nameBy = nameBy;
module.exports.emojiBy = emojiBy;
module.exports.normalizedCountry = normalizedCountry;
module.exports.continentOf = continentOf;
module.exports.codeOf = codeOf;
module.exports.continents = continents;
module.exports.countries = countries;
module.exports.countriesOrdered = Object.keys(countries)
  .map((code) => ({ code: code, name: countries[code].name }))
  .filter((it) => !unpopularCountries.includes(it.code))
  .sort((it, that) => it.name.localeCompare(that.name));
