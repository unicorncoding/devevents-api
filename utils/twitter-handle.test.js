const { twitterHandle } = require("./twitter-handle");

test("extracts twitter handle from a string", () => {
  expect(twitterHandle("")).toBe(undefined);
  expect(twitterHandle(" ")).toBe(undefined);
  expect(twitterHandle(null)).toBe(undefined);
  expect(twitterHandle("devternity#xx")).toBe(undefined);
  expect(twitterHandle("instagram.com/devternity")).toBe(undefined);

  expect(twitterHandle("devternity123")).toBe("devternity123");
  expect(twitterHandle("devternity")).toBe("devternity");
  expect(twitterHandle("@devternity")).toBe("devternity");
  expect(twitterHandle("https://twitter.com/devternity?a=1&b=2")).toBe(
    "devternity"
  );
  expect(twitterHandle("https://twitter.com/devternity#contact")).toBe(
    "devternity"
  );
  expect(twitterHandle("https://twitter.com/devternity")).toBe("devternity");
  expect(twitterHandle("http://twitter.com/devternity")).toBe("devternity");
  expect(twitterHandle("twitter.com/devternity")).toBe("devternity");
  expect(twitterHandle("www.twitter.com/devternity")).toBe("devternity");
});
