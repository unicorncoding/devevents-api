const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const conferences = require('../utils/confs');

// remove in Node 12
const allSettled = require('promise.allsettled');
allSettled.shim();

const hash = require('hash-sum');
const { Datastore } = require('@google-cloud/datastore');

const datastore = new Datastore({ maxRetries: 5, autoRetry: true });

router.get('/devevents', asyncHandler(async(req, res) => {
  const confs = await conferences();
  const stats = new Stats();
  await Promise.allSettled(
    confs.map(each => storeIfNew(each, stats))
  )
  stats.dump(res);
}));

module.exports = router;

async function storeIfNew(each, stats) {
  const itemHash = hash([each.startDate, each.url]);
  const itemKey = datastore.key([ 'Event', itemHash ]);

  const tx = datastore.transaction();
  try {
    await tx.run();
    const [event] = await tx.get(itemKey);
    if (event) {
      tx.rollback();
      stats.skip()
    } else {
      const newItem = { key: itemKey, data: each };
      await tx.save(newItem);
      await tx.commit();
      stats.inc(each.continentCode);
      stats.inc(each.countryCode);
    }
  } catch (err) {
    console.error("Unable to store event " + each.name, err);
    tx.rollback();
  }  
}

class Stats {
  constructor() {
    this.loc = {}
  }
  dump(res) {
    res.json(this);
  }
  skip() {
    if (!this.skipped) {
      this.skipped = 0;
    }
    this.skipped++;
  }
  inc(item) {
    if (!this.loc[item]) {
      this.loc[item] = 0;
    }
    this.loc[item]++;
  }
}