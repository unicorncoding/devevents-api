const _ = require('lodash');
const fs = require('fs');
const util = require('util');
const path = require('path');
const dayjs = require('dayjs');
const rimraf = util.promisify(require('rimraf'));
const Git = require('nodegit');
const hash = require('hash-sum');
const normalizeUrl = require('normalize-url');
const { countries } = require('countries-list');
const { resolve } = require('path');
const { readdir } = require('fs').promises;
const { Datastore } = require('@google-cloud/datastore');

exports.importConfsTech = async (_, res) => {

  const datastore = new Datastore();
  const cloneDir = await cloneConferences()
  const confs = await conferences(cloneDir)
  console.log("Confs.tech returned" + confs.length + " conferences");
  
  const hashCalc = it => hash([it.startDate, normalizeUrl(it.url)]);
  const keyCalc = it => datastore.key(['Event', hashCalc(it)]);
  
  const inserts = await Promise.all(
    confs.map(eachConf => datastore
        .insert({ key: keyCalc(eachConf), data: eachConf })
        .then(result => { console.log(result); return "OK"; })
        .catch(error => { console.error(error); return "NOK"; })
      )
  )

  res.json({
    'inserts': inserts.filter(it => it == "OK").length,
    'skips': inserts.filter(it => it == "NOK").length
  })
  
}

async function cloneConferences() {
  const conferencesRepo = 'https://github.com/tech-conferences/conference-data'
  const cloneDir = '/tmp/repo'
  await rimraf(cloneDir);
  
  console.log('Cloning ' + conferencesRepo)
  await Git.Clone(conferencesRepo, cloneDir)
  console.log('Cloned')
  return cloneDir  
}

async function conferences(repo) {
  const upcomingOnly = e => dayjs(e.startDate).isSame(dayjs()) || dayjs(e.startDate).isAfter(dayjs())
  const files = await walk(repo + '/conferences')
  return _.flatMap(files, f => {
    const allConferences = JSON.parse(fs.readFileSync(f))
    const includeTopic = it => ({
      ...it,
      topic: path.basename(f, '.json')
    })

    return allConferences
      .filter(upcomingOnly)
      .map(normalize)
      .map(includeTopic)
  })  

}

async function walk(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map(dirent => {
    const res = resolve(dir, dirent.name);
    return dirent.isDirectory() ? walk(res) : res;
  }));
  return Array.prototype.concat(...files);
}

function normalize(it) {
  const country = normalizeCountry(it.country)
  return ({
    startDate: dayjs(it.startDate).toDate(),
    endDate: it.endDate ? dayjs(it.endDate).toDate() : undefined,
    cfpEndDate: it.cfpEndDate ? dayjs(it.cfpEndDate).toDate() : undefined,
    url: normalizeUrl(it.url),
    cfpUrl: it.cfpUrl ? normalizeUrl(it.cfpUrl) : undefined,
    city: it.city,
    country: country,
    continent: continent(country),
    category: 'conference',
    source: 'confs.tech',
    name: it.name,
    twitter: it.twitter
  });
}

function normalizeCountry(country) {
  return country
  .replace("U.S.A.", "United States")
  .replace("U.K.", "United Kingdom")
  .replace("Deutschland", "Germany")
  .replace("switzerland", "Switzerland")
  .replace("Netherland", "Netherlands")
  .replace("Netherlandss", "Netherlands")
  .replace("Czech republic", "Czech Republic")
  .trim()
}

function continent(country) {
  const match = Object.values(countries).find(it => it.name == country);
  if (!match || !match.continent) {
    throw "Cannot find continent for country " + country
  }
  return match.continent
}