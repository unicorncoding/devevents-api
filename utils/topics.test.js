const { relevantTopics } = require("./topics");

test("rust -> rust", () => {
  expect(relevantTopics("rust")).toStrictEqual(["rust"]);
});

test("unknown-topic -> unknown-topic", () => {
  expect(relevantTopics("unknown-topic")).toStrictEqual(["unknown-topic"]);
});

test("undefined -> undefined", () => {
  expect(relevantTopics(undefined)).toStrictEqual([undefined]);
});

test("fullstack -> architecture", () => {
  expect(relevantTopics("fullstack")).toStrictEqual([
    "fullstack",
    "architecture",
  ]);
});

test("architecture -> fullstack", () => {
  expect(relevantTopics("architecture")).toStrictEqual([
    "architecture",
    "fullstack",
  ]);
});

test("web (frontend) -> javascript", () => {
  expect(relevantTopics("web")).toStrictEqual(["web", "javascript"]);
});

test("javascript -> web (frontend)", () => {
  expect(relevantTopics("javascript")).toStrictEqual(["javascript", "web"]);
});

test("elixir -> fp", () => {
  expect(relevantTopics("elixir")).toStrictEqual(["elixir", "fp"]);
});

test("blockchain -> fintech", () => {
  expect(relevantTopics("blockchain")).toStrictEqual(["blockchain", "fintech"]);
});
