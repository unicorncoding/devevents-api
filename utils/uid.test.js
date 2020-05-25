const { uid } = require("./uid");

test("calculates uid", () => {
  const date = new Date(2020, 10, 10);
  const id = uid({
    name: "DevTernity 2020",
    countryCode: "LV",
    startDate: date,
  });
  expect(id).toEqual(expect.stringMatching("devternity-2020-aaa59b5e"));
});
