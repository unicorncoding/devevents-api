const { countries } = require('countries-list');

function normalizedCountry(country) {
  return country
  .replace("U.S.A.", "United States")
  .replace("U.K.", "United Kingdom")
  .replace("Deutschland", "Germany")
  .replace("switzerland", "Switzerland")
  .replace("Netherland", "Netherlands")
  .replace("Germnay", "Germany")
  .replace("Netherlandss", "Netherlands")
  .replace("Perú", "Peru")
  .replace("Niederlande", "Netherlands")
  .replace("Czech republic", "Czech Republic")
  .trim()
}

function continentOf(country) {
  const match = Object.values(countries).find(it => it.name == country);
  if (!match || !match.continent) {
    throw "Cannot find continent for country " + country;
  }
  return match.continent
    .replace("NA", "AM")
    .replace("SA", "AM")
}

function codeOf(country) {
  const match = Object.entries(countries).find(([_, it]) => it.name == country);
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
  const [continentCode, countryCode] = code.split("/");
  return countries[countryCode] ? countries[countryCode].emoji : undefined;
}

const continents = {
  EU: "Europe",
  AM: "Americas",
  AS: "Asia",
  AF: "Africa",
  OC: "Oceania"
}

module.exports.nameBy = nameBy;
module.exports.emojiBy = emojiBy;
module.exports.normalizedCountry = normalizedCountry;
module.exports.continentOf = continentOf;
module.exports.codeOf = codeOf;
module.exports.continents = continents;