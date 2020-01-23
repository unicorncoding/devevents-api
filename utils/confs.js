const path = require('path');
const dayjs = require('dayjs');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));
const Git = require('nodegit');
const walk = require('./walk');
const parseOrElse = require('./parse');
const normalizeUrl = require('normalize-url');

// remove in Node 11
const flatMap = require('array.prototype.flatmap');
flatMap.shim();

const { normalizedCountry, continentOf, codeOf } = require('./geo');
const log = console.log;

async function conferences(max = Number.MAX_VALUE) {
  const repo = await gitClone();
  const upcomingOnly = e => dayjs(e.startDate).isSame(dayjs()) || dayjs(e.startDate).isAfter(dayjs());
  const offlineOnly = e => e.country != 'Online';
  const noOfftopic = e => e.topic != 'networking' && e.topic != 'tech-comm';
  const files = await walk(repo + '/conferences')
  const confs = files.flatMap(f => {
    const allConferences = parseOrElse(f, []);
    const includeTopic = it => ({ ...it, topic: path.basename(f, '.json') })
    return allConferences
      .filter(upcomingOnly)
      .filter(offlineOnly)
      .map(normalize)
      .map(normalizeTopic(includeTopic))
      .filter(noOfftopic);
  });
  log(`Confs.tech conferences: ${confs.length}`);
  return confs.slice(0, max);
}

async function gitClone() {
  const conferencesRepo = 'https://github.com/tech-conferences/conference-data'
  const cloneDir = '/tmp/repo'
  await rimraf(cloneDir);
  log('Cloning ' + conferencesRepo);
  await Git.Clone(conferencesRepo, cloneDir);
  log('Cloned');
  return cloneDir;
}

function normalizeTopic(topic) {
  return topic
  .replace("graphql", "javascript")
  .replace("typescript", "javascript")
  .replace("ios", "mobile")
  .replace("android", "mobile")
  .replace("css", "web")
  .replace("leadership", "soft skills")
  .trim()
}

function normalize(it) {
  const country = normalizedCountry(it.country);
  const continentCode = continentOf(country);
  const countryCode = codeOf(country);
  return ({
    creationDate: dayjs().toDate(),
    startDate: dayjs(it.startDate).toDate(),
    endDate: it.endDate ? dayjs(it.endDate).toDate() : undefined,
    cfpEndDate: it.cfpEndDate ? dayjs(it.cfpEndDate).toDate() : undefined,
    url: normalizeUrl(it.url),
    cfpUrl: it.cfpUrl ? normalizeUrl(it.cfpUrl) : undefined,
    city: it.city,
    country: country,
    countryCode: continentCode + '/' + countryCode,
    continentCode: continentCode,
    category: 'conference',
    source: 'confs.tech',
    name: it.name,
    twitter: it.twitter ? it.twitter.replace("@", "") : undefined
  });
}

module.exports = conferences;