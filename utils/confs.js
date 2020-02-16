const path = require('path');
const dayjs = require('dayjs');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));
const Git = require('nodegit');
const walk = require('./walk');
const topics = require('./topics');
const parseOrElse = require('./parse');
const normalizeUrl = require('normalize-url');

const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

// remove in Node 11
const flatMap = require('array.prototype.flatmap');
flatMap.shim();

const { normalizedCountry, continentOf, codeOf } = require('./geo');
const log = console.log;

async function conferences(max = Number.MAX_VALUE) {
  const repo = await gitClone();
  const upcomingOnly = e => dayjs(e.startDate).isSame(dayjs()) || dayjs(e.startDate).isAfter(dayjs());
  const offlineOnly = e => e.country != 'Online';
  const noOfftopic = e => e.topic != undefined;
  const noSuspiciouslyLong = e => !suspiciouslyLong(e.startDate, e.endDate);
  const files = await walk(repo + '/conferences')
  const confs = files.flatMap(f => {
    const allConferences = parseOrElse(f, []);
    const includeTopic = it => ({ ...it, topic: path.basename(f, '.json') })
    return allConferences
      .filter(upcomingOnly)
      .filter(offlineOnly)
      .map(includeTopic)
      .map(normalize)
      .filter(noSuspiciouslyLong)
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

function normalize(it) {
  const country = normalizedCountry(it.country);
  const continentCode = continentOf(country);
  const countryCode = codeOf(country);
  return ({
    creationDate: new Date(),
    startDate: new Date(it.startDate),
    endDate: it.endDate ? new Date(it.endDate) : undefined,
    cfpEndDate: it.cfpEndDate ? new Date(it.cfpEndDate) : undefined,
    url: normalizeUrl(it.url),
    cfpUrl: normalizeUrl(it.cfpUrl || it.url),
    city: it.city,
    country: country,
    countryCode: countryCode,
    continentCode: continentCode,
    category: 'conference',
    source: 'confs.tech',
    name: it.name,
    twitter: it.twitter ? it.twitter.replace("@", "") : undefined,
    ...normalizeTopic(it.topic),
  });
}

function suspiciouslyLong(startDate, endDate) {
  const diffTime = Math.abs(startDate - endDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return endDate && diffDays > 10;
}

function normalizeTopic(topic) {
  const hit = topics.find(it => it.topic == topic || (it.aliases || []).includes(topic))
  return hit ? { topicCode: hit.topic, topic: hit.name } : hit;
}

module.exports = conferences;