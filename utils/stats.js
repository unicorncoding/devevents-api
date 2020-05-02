class Stats {
  constructor() {
    this.skipped = 0;
    this.stored = [];
  }
  dump(res) {
    const what = {
      stored: this.stored.length,
      skipped: this.skipped,
    };
    console.log(what);
    res.json(what);
  }
  skip() {
    this.skipped++;
  }

  forEachStored(operation) {
    this.stored.forEach((each) => operation(each));
  }

  hasAnyStored() {
    return this.stored.length > 0;
  }

  store(item) {
    this.stored.push(item);
  }
}

module.exports = Stats;
