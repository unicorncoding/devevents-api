const { promisify } = require("util");
const { readdir } = require("fs");
const { resolve } = require("path");

const readdirAsync = promisify(readdir);

async function walk(dir) {
  const dirents = await readdirAsync(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? walk(res) : res;
    })
  );
  return Array.prototype.concat(...files);
}

module.exports = walk;
