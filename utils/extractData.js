export default function extractData(text) {
  // Extract Leverage
  const leverageMatch = text.match(/Leverage: (\d+x)/);
  const leverage = leverageMatch ? leverageMatch[1] : null;

  // Extract Entry Price
  const entryPriceMatch = text.match(
    /Entry Price: \$(\d+\.\d+) - \$(\d+\.\d+)/
  );
  const entryPriceStart = entryPriceMatch ? entryPriceMatch[1] : null;
  const entryPriceEnd = entryPriceMatch ? entryPriceMatch[2] : null;

  // Extract TP1, TP2, TP3, TP4
  const tpMatches = text.match(/🎯 TP(\d+): \$(\d+\.\d+)/g);
  const takeProfits = tpMatches
    ? tpMatches.map((match) => match.match(/🎯 TP(\d+): \$(\d+\.\d+)/).slice(1))
    : [];

  // Extract Stop Loss
  const stopLossMatch = text.match(/❌ SL: \$(\d+\.\d+)/);
  const stopLoss = stopLossMatch ? stopLossMatch[1] : null;

  // Extract the coin name if found
  const coinNameMatches = text.toLowerCase().match(/(\b\w+\b)/g);
  const coinName = coinNameMatches[0];

  const orderType = text.toLowerCase().includes("long") ? "Long" : "Short";

  return {
    coinName,
    orderType,
    leverage,
    entryPriceStart,
    entryPriceEnd,
    takeProfits,
    stopLoss,
  };
}


