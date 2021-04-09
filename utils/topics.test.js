const { relevantTopics } = require("./topics");

test("rust is rust", () => {
  expect(relevantTopics("rust")).toStrictEqual(["rust"]);
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
