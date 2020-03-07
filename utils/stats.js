class Stats {
  constructor() {
    this.total = 0;
    this.skipped = 0;
  }
  dump(res) {
    console.log(this);
    res.json(this);
  }
  skip() {
    this.skipped++;
  }
  inc() {
    this.total++;
  }
}

module.exports = Stats;