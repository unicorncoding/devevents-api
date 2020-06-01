const is = require("is_js");

const USD = require("./usd");
const EUR = require("./eur");
const exchanges = { USD, EUR };

module.exports.localPrice = (event, targetCurrency) => {
  const { free, priceFrom, priceTo, priceCurrency } = event;
  if (free === undefined || free === true) {
    return undefined;
  }

  return {
    from: this.convert(priceFrom, priceCurrency, targetCurrency),
    to: this.convert(priceTo, priceCurrency, targetCurrency),
    curr: targetCurrency,
  };
};

module.exports.convert = (amount, sourceCurrency, targetCurrency) => {
  if (sourceCurrency === targetCurrency) {
    return Math.round(amount);
  }

  const { rate } = exchanges[targetCurrency][sourceCurrency];
  return Math.round(amount * rate);
};
