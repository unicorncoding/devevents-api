const Twit = require("twit");
const { countryName, countryEmoji } = require("./geo");
const { isFuture } = require("./dates");
const dayjs = require("dayjs");
dayjs.extend(require("dayjs/plugin/relativeTime"));

const config = {
  consumer_key: process.env.twitter_consumer_key || "none",
  consumer_secret: process.env.twitter_consumer_secret || "none",
  access_token: process.env.twitter_access_token || "none",
  access_token_secret: process.env.twitter_access_secret || "none",
};
const twitter = new Twit(config);

module.exports.tweet = (event) => {
  const status = [
    ...[
      what(event),
      location(event),
      `🗓 ${date(event)}`,
      price(event),
      cfpOrUndefined(event),
      retweetPlease(event),
      "",
      callToAction(event),
    ],
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  // if (!process.env.twitter_consumer_key) {
  //   console.log("Twitter is not configured. Dumping tweet to log:");
  //   console.log(status);
  //   return;
  // }

  return twitter
    .post("statuses/update", { status })
    .catch((e) =>
      console.error(new Error(`Tweeting of ${event.name} failed: ${e}`))
    );
};

function price({ free, priceFrom, priceTo, priceCurrency }) {
  if (free === undefined) {
    return undefined;
  }

  if (free) {
    return "💰 FREE";
  } else if (priceFrom === priceTo) {
    return `💰 ${priceFrom} ${priceCurrency}`;
  } else {
    return `💰 ${priceFrom} – ${priceTo} ${priceCurrency}`;
  }
}

function retweetPlease({ free }) {
  return "\n❤️ Retweet to support!";
}

function what({ name, twitter }) {
  if (twitter) {
    return `🆕 ${name} by @${twitter}`;
  } else {
    return `🆕 ${name}`;
  }
}

function date({ startDate, endDate }) {
  const start = dayjs(startDate);
  const oneDayEvent = !endDate || start.isSame(dayjs(endDate), "day");
  if (oneDayEvent) {
    return start.format("MMMM D YYYY");
  }
  const end = dayjs(endDate);
  const sameMonth = start.month() == end.month();
  if (sameMonth) {
    return end.format(`MMMM ${start.format("D")}-D YYYY`);
  } else {
    return start.format("MMMM D") + " - " + end.format("MMMM D YYYY");
  }
}

function cfpOrUndefined({ cfpEndDate }) {
  if (isFuture(cfpEndDate)) {
    const timeLeft = dayjs(cfpEndDate).fromNow(true);
    return `📢 ${timeLeft} to submit a talk`;
  } else {
    return undefined;
  }
}

function location({ city, countryCode }) {
  if (countryCode === "ON") {
    return "🌍 Online";
  } else {
    const name = countryName(countryCode);
    const emoji = countryEmoji(countryCode);
    return `${emoji} ${city}, ${name}`;
  }
}

function callToAction({ url }) {
  return `More information: ${url}`;
}
