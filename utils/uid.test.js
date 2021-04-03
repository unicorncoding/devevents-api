const { uid } = require("./uid");

test("calculates uid", () => {
  const date = new Date(2020, 10, 10);
  const id1 = uid({
    name: "DevTernity 2020",
    city: "Riga",
    startDate: date,
  });
  expect(id1).toEqual(expect.stringMatching("dev-ternity-riga-10-2020"));

  const id2 = uid({
    name: "DevTernity",
    city: "Riga",
    startDate: date,
  });
  expect(id2).toEqual(expect.stringMatching("dev-ternity-riga-10-2020"));
});
