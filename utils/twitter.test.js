const Twit = require("twit");
const { tweet } = require("./twitter");
const dayjs = require("dayjs");
dayjs.extend(require("dayjs/plugin/relativeTime"));

jest.mock("Twit");

const [twitter] = Twit.mock.instances;

twitter.post
  .mockName("post")
  .mockReturnValue(Promise.resolve({ status: "OK" }));

afterEach(() => {
  jest.clearAllMocks();
});

const offlineEvent = {
  id: "id-123",
  city: "Riga",
  topics: ["fullstack"],
  countryCode: "LV",
  name: "DevTernity",
  startDate: new Date("2020-11-03T00:00:00.000Z"),
  endDate: new Date("2020-11-03T00:00:00.000Z"),
  url: "https://devternity.com",
};

test("posts a conference", async () => {
  await tweet(offlineEvent);
  expect(twitter.post).toHaveBeenCalledWith("statuses/update", {
    status: `🆕 DevTernity
ℹ️ Architecture/Full-stack conference
🇱🇻 Riga, Latvia
🗓 November 3 2020

❤️ Retweet to support!

More information: https://dev.events/conferences/id-123`,
  });
});

test("posts an event other than a conference", async () => {
  await tweet({
    ...offlineEvent,
    category: "meetup",
  });
  expect(twitter.post).toHaveBeenCalledWith("statuses/update", {
    status: `🆕 DevTernity
ℹ️ Architecture/Full-stack meetup
🇱🇻 Riga, Latvia
🗓 November 3 2020

❤️ Retweet to support!

More information: https://dev.events/conferences/id-123`,
  });
});

test("posts a conference with price", async () => {
  await tweet({
    ...offlineEvent,
    free: false,
  });
  expect(twitter.post).toHaveBeenCalledWith("statuses/update", {
    status: `🆕 DevTernity
ℹ️ Architecture/Full-stack conference
🇱🇻 Riga, Latvia
🗓 November 3 2020

❤️ Retweet to support!

More information: https://dev.events/conferences/id-123`,
  });

  await tweet({
    ...offlineEvent,
    free: false,
  });
  expect(twitter.post).toHaveBeenCalledWith("statuses/update", {
    status: `🆕 DevTernity
ℹ️ Architecture/Full-stack conference
🇱🇻 Riga, Latvia
🗓 November 3 2020

❤️ Retweet to support!

More information: https://dev.events/conferences/id-123`,
  });

  await tweet({
    ...offlineEvent,
    free: false,
    topics: ["fullstack", "web"],
  });
  expect(twitter.post).toHaveBeenCalledWith("statuses/update", {
    status: `🆕 DevTernity
ℹ️ Architecture/Full-stack · Web/Frontend conference
🇱🇻 Riga, Latvia
🗓 November 3 2020

❤️ Retweet to support!

More information: https://dev.events/conferences/id-123`,
  });
});

test("posts a multi-day conference", async () => {
  const endDate = new Date("2020-11-04T00:00:00.000Z");
  await tweet({ ...offlineEvent, endDate });
  expect(twitter.post).toHaveBeenCalledWith("statuses/update", {
    status: `🆕 DevTernity
ℹ️ Architecture/Full-stack conference
🇱🇻 Riga, Latvia
🗓 November 3-4 2020

❤️ Retweet to support!

More information: https://dev.events/conferences/id-123`,
  });
});

test("posts a multi-day conference that spans multiple months", async () => {
  const endDate = new Date("2020-12-04T00:00:00.000Z");
  await tweet({ ...offlineEvent, endDate });
  expect(twitter.post).toHaveBeenCalledWith("statuses/update", {
    status: `🆕 DevTernity
ℹ️ Architecture/Full-stack conference
🇱🇻 Riga, Latvia
🗓 November 3 - December 4 2020

❤️ Retweet to support!

More information: https://dev.events/conferences/id-123`,
  });
});

test("posts a conference with cfp", async () => {
  const cfpEndDate = new Date("2030-12-04T00:00:00.000Z");
  const remainingDays = dayjs(cfpEndDate).fromNow(true);
  await tweet({ ...offlineEvent, cfpEndDate });
  expect(twitter.post).toHaveBeenCalledWith("statuses/update", {
    status: `🆕 DevTernity
ℹ️ Architecture/Full-stack conference
🇱🇻 Riga, Latvia
🗓 November 3 2020
📢 ${remainingDays} to submit a talk

❤️ Retweet to support!

More information: https://dev.events/conferences/id-123`,
  });
});

test("posts a conference and mentions the organizer", async () => {
  await tweet({ ...offlineEvent, twitter: "devternity" });
  expect(twitter.post).toHaveBeenCalledWith("statuses/update", {
    status: `🆕 DevTernity
ℹ️ Architecture/Full-stack conference
🇱🇻 Riga, Latvia
🗓 November 3 2020

❤️ Retweet to support! @devternity

More information: https://dev.events/conferences/id-123`,
  });
});

const onlineEvent = {
  id: "666",
  city: "Online",
  countryCode: "ON",
  name: "Webinario",
  topics: ["web"],
  startDate: new Date("2020-10-10T00:00:00.000Z"),
  url: "https://webinario.com",
};

test("posts an online event", async () => {
  await tweet(onlineEvent);
  expect(twitter.post).toHaveBeenCalledWith("statuses/update", {
    status: `🆕 Webinario
ℹ️ Web/Frontend conference
🌍 Online
🗓 October 10 2020

❤️ Retweet to support!

More information: https://dev.events/conferences/666`,
  });
});

const freeEvent = {
  id: "frb-123",
  city: "Online",
  countryCode: "ON",
  name: "Freebie",
  topics: ["elixir", "php"],
  free: true,
  startDate: new Date("2021-10-03T00:00:00.000Z"),
  url: "https://freebie.net",
};

test("posts a free event", async () => {
  await tweet(freeEvent);
  expect(twitter.post).toHaveBeenCalledWith("statuses/update", {
    status: `🆕 Freebie
ℹ️ Elixir · PHP conference
🌍 Online
🗓 October 3 2021
💰 FREE

❤️ Retweet to support!

More information: https://dev.events/conferences/frb-123`,
  });
});

test("posts a free event with cfp", async () => {
  const cfpEndDate = new Date("2030-12-04T00:00:00.000Z");
  const remainingDays = dayjs(cfpEndDate).fromNow(true);
  await tweet({ ...freeEvent, cfpEndDate });
  expect(twitter.post).toHaveBeenCalledWith("statuses/update", {
    status: `🆕 Freebie
ℹ️ Elixir · PHP conference
🌍 Online
🗓 October 3 2021
💰 FREE
📢 ${remainingDays} to submit a talk

❤️ Retweet to support!

More information: https://dev.events/conferences/frb-123`,
  });
});
