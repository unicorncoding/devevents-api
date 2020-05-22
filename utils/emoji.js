const emojiStrip = require("emoji-strip");
module.exports.emojiStrip = (str) => (str ? emojiStrip(str) : str);
