const Twit = require("twit");
const { tweet } = require("./twitter");
const dayjs = require("dayjs");
dayjs.extend(require("dayjs/plugin/relativeTime"));

jest.mock("Twit");

const [twitter] = Twit.mock.instances;

twitter.post
  .mockName("post")
  .mockReturnValue(Promise.resolve({ status: "OK" }));

const offlineEvent = {
  category: "conference",
  city: "Riga",
  country: "Latvia",
  countryCode: "LV",
  name: "DevTernity",
  startDate: new Date("2020-11-03T00:00:00.000Z"),
  endDate: new Date("2020-11-03T00:00:00.000Z"),
  topic: "Full-stack",
  url: "https://devternity.com",
};

test("posts a conference", async () => {
  await tweet(offlineEvent);
  expect(twitter.post).toHaveBeenCalledWith("statuses/update", {
    status: `🆕 DevTernity ⠿ Full-stack conference
🇱🇻 Riga, Latvia
🗓 November 3 2020

More information: https://devternity.com`,
  });
});

test("posts a multi-day conference", async () => {
  const endDate = new Date("2020-11-04T00:00:00.000Z");
  await tweet({ ...offlineEvent, endDate });
  expect(twitter.post).toHaveBeenCalledWith("statuses/update", {
    status: `🆕 DevTernity ⠿ Full-stack conference
🇱🇻 Riga, Latvia
🗓 November 3-4 2020

More information: https://devternity.com`,
  });
});

test("posts a multi-day conference that spans multiple months", async () => {
  const endDate = new Date("2020-12-04T00:00:00.000Z");
  await tweet({ ...offlineEvent, endDate });
  expect(twitter.post).toHaveBeenCalledWith("statuses/update", {
    status: `🆕 DevTernity ⠿ Full-stack conference
🇱🇻 Riga, Latvia
🗓 November 3 - December 4 2020

More information: https://devternity.com`,
  });
});

test("posts a conference with cfp", async () => {
  const cfpEndDate = new Date("2030-12-04T00:00:00.000Z");
  const remainingDays = dayjs(cfpEndDate).fromNow(true);
  await tweet({ ...offlineEvent, cfpEndDate });
  expect(twitter.post).toHaveBeenCalledWith("statuses/update", {
    status: `🆕 DevTernity ⠿ Full-stack conference
🇱🇻 Riga, Latvia
🗓 November 3 2020
📢 ${remainingDays} to submit a talk

More information: https://devternity.com`,
  });
});

test("posts a conference and mentions the organizer", async () => {
  await tweet({ ...offlineEvent, twitter: "devternity" });
  expect(twitter.post).toHaveBeenCalledWith("statuses/update", {
    status: `🆕 DevTernity ⠿ Full-stack conference
🇱🇻 Riga, Latvia
🗓 November 3 2020

Follow @devternity and find more info: https://devternity.com`,
  });
});

const onlineEvent = {
  category: "webinar",
  city: "Online",
  country: "Online",
  countryCode: "ON",
  name: "Webinario",
  startDate: new Date("2020-10-10T00:00:00.000Z"),
  topic: "DevOps",
  url: "https://webinario.com",
};

test("posts an online event", async () => {
  await tweet(onlineEvent);
  expect(twitter.post).toHaveBeenCalledWith("statuses/update", {
    status: `🆕 Webinario ⠿ DevOps webinar
🌍 Online
🗓 October 10 2020

More information: https://webinario.com`,
  });
});
