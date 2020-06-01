const USD = require("./usd");
const EUR = require("./eur");
const exchanges = { USD, EUR };

module.exports.localPrice = (event, targetCurrency) => {
  const { free, priceFrom, priceTo, priceCurrency } = event;
  if (free === undefined || free === true) {
    return undefined;
  }

  const exchange = exchanges[targetCurrency];
  if (!exchange) {
    console.warn(`No exchange for target currency: ${targetCurrency}`);
    return undefined;
  }

  const convert = exchange[priceCurrency];
  if (!convert) {
    console.warn(`No exchange for ${priceCurrency} to ${targetCurrency}`);
    return undefined;
  }

  return {
    from: this.convert(priceFrom, priceCurrency, targetCurrency, convert),
    to: this.convert(priceTo, priceCurrency, targetCurrency, convert),
    curr: targetCurrency,
  };
};

module.exports.convert = (amount, sourceCurrency, targetCurrency, exchange) => {
  const { rate } = exchange;
  return Math.round(amount * rate);
};
