module.exports.twitterHandle = (str) => {
  if (!str) {
    return undefined;
  }

  str = str.replace("@", "");

  if (str.includes("twitter.com/")) {
    [, str] = str.split("twitter.com/");
    [str] = str.split("?");
    [str] = str.split("#");
  }

  const re = /^([A-Za-z0-9_]{3,15})$/;
  const matches = re.test(str);

  return matches ? str : undefined;
};