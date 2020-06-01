const { startDate, newestFirst, cheapestFirst } = require("./sortings");

test("start date sorting", () => {
  const startingInMarch = {
    startDate: new Date(2020, 3, 10),
  };

  const startingInApril = {
    startDate: new Date(2020, 4, 10),
  };

  const startingInDecember = {
    startDate: new Date(2020, 12, 10),
  };

  expect(
    startDate([startingInDecember, startingInMarch, startingInApril])
  ).toEqual([startingInMarch, startingInApril, startingInDecember]);
});

test("newest first sorting", () => {
  const createdInMarch = {
    creationDate: new Date(2020, 3, 10),
  };

  const createdInApril = {
    creationDate: new Date(2020, 4, 10),
  };

  const createdInDecember = {
    creationDate: new Date(2020, 12, 10),
  };

  expect(
    newestFirst([createdInMarch, createdInApril, createdInDecember])
  ).toEqual([createdInDecember, createdInApril, createdInMarch]);
});

test("cheapest first sorting", () => {
  const noPricing = {
    name: "no pricing (legacy)",
  };

  const free = {
    name: "i am free",
    free: true,
  };

  const startsAtZero = {
    free: false,
    localPrice: {
      from: 0,
    },
  };

  const oneBuck = {
    free: false,
    localPrice: {
      from: 1,
    },
  };

  const twoBucks = {
    free: false,
    localPrice: {
      from: 2,
    },
  };

  expect(
    cheapestFirst([noPricing, free, oneBuck, startsAtZero, twoBucks])
  ).toEqual([free, startsAtZero, oneBuck, twoBucks, noPricing]);
});
