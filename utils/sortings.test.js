const { startDate, newestFirst, cheapestFirst } = require("./sortings");

test("start date sorting", () => {
  const startingInMarch = {
    startDate: new Date(2020, 3, 10),
  };

  const startingInApril = {
    startDate: new Date(2020, 4, 10),
  };

  const topStartingInMay = {
    top: true,
    startDate: new Date(2020, 5, 10),
  };

  const startingInDecember = {
    startDate: new Date(2020, 12, 10),
  };

  expect(
    startDate([
      startingInDecember,
      topStartingInMay,
      startingInMarch,
      startingInApril,
    ])
  ).toEqual([
    topStartingInMay,
    startingInMarch,
    startingInApril,
    startingInDecember,
  ]);
});

test("newest first sorting", () => {
  const createdInMarch = {
    creationDate: new Date(2020, 3, 10),
  };

  const createdInApril = {
    creationDate: new Date(2020, 4, 10),
  };

  const topCreatedInMay = {
    top: true,
    creationDate: new Date(2020, 5, 10),
  };

  const createdInDecember = {
    creationDate: new Date(2020, 12, 10),
  };

  expect(
    newestFirst([
      createdInMarch,
      createdInApril,
      topCreatedInMay,
      createdInDecember,
    ])
  ).toEqual([
    topCreatedInMay,
    createdInDecember,
    createdInApril,
    createdInMarch,
  ]);
});

test("cheapest first sorting", () => {
  const noPricing = {
    name: "no pricing (legacy)",
  };

  const free = {
    name: "i am free",
    free: true,
  };

  const notFree = {
    name: "i am free",
    free: false,
  };

  const top = {
    top: true,
    free: false,
  };

  expect(cheapestFirst([noPricing, free, notFree, top])).toEqual([
    top,
    free,
    notFree,
    noPricing,
  ]);
});
