const { countries, continents } = require('countries-list');

function normalizedCountry(country) {
  return country
  .replace("U.S.A.", "United States")
  .replace("U.K.", "United Kingdom")
  .replace("Deutschland", "Germany")
  .replace("switzerland", "Switzerland")
  .replace("Netherland", "Netherlands")
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
  return match.continent;
}

function codeOf(country) {
  const match = Object.entries(countries).find(([_, it]) => it.name == country);
  if (!match) {
    throw "Cannot find country code for country " + country;
  }
  const [countryCode] = match; 
  return countryCode;
}

function isContinent(code) {
  return continents[code] != undefined;
}

function nameBy(code) {
  return continents[code] ? continents[code] : countries[code].name;
}

module.exports.nameBy = nameBy;
module.exports.normalizedCountry = normalizedCountry;
module.exports.continentOf = continentOf;
module.exports.codeOf = codeOf;
module.exports.isContinent = isContinent;