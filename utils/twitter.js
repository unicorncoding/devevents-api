const Twit = require("twit");
const { countries } = require("./geo");
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
  const { name, topic, category } = event;

  const status = [
    ...new Set([
      `🆕 ${name} ⠿ ${topic} ${category}`,
      location(event),
      `🗓 ${date(event)}`,
      cfpOrEmpty(event),
      ``,
      callToAction(event),
    ]),
  ].join("\n");

  return twitter
    .post("statuses/update", { status })
    .catch((e) =>
      console.error(`Tweeting of ${event.name} failed`, new Error(e))
    );
};

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

function cfpOrEmpty({ cfpEndDate }) {
  if (isFuture(cfpEndDate)) {
    const timeLeft = dayjs(cfpEndDate).fromNow(true);
    return `📢 ${timeLeft} to submit a talk`;
  } else {
    return "";
  }
}

function location({ city, country, countryCode }) {
  if (country === "Online") {
    return "🌍 Online";
  } else {
    const flag = countries[countryCode].emoji;
    return `${flag} ${city}, ${country}`;
  }
}

function callToAction({ twitter, url }) {
  if (twitter) {
    return `Follow @${twitter} and find more info: ${url}`;
  } else {
    return `More information: ${url}`;
  }
}
