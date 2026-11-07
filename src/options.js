// Payoff = what the option is worth at expiry (premium ignored)
export function payoff(kind, strike, spot) {
  if (kind === "call") return Math.max(spot - strike, 0);
  if (kind === "put") return Math.max(strike - spot, 0);
  throw new Error("kind must be 'call' or 'put'");
}

// Full result for one option
export function optionResult(kind, strike, premium, spot) {
  const pay = payoff(kind, strike, spot);
  const buyerProfit = pay - premium;           // buyer pays the premium
  return {
    payoff: pay,
    buyerProfit,
    sellerProfit: -buyerProfit,                // seller is the mirror image
    breakeven: kind === "call" ? strike + premium : strike - premium,
  };
}

// Best and worst case at maturity for each side (Infinity = no limit).
// Losses are returned as negative numbers.
export function limits(kind, strike, premium) {
  if (kind === "call") {
    return {
      buyerMaxGain: Infinity,
      buyerMaxLoss: -premium,
      sellerMaxGain: premium,
      sellerMaxLoss: -Infinity,
    };
  }
  if (kind === "put") {
    // the put is worth the most when the price falls to 0
    return {
      buyerMaxGain: strike - premium,
      buyerMaxLoss: -premium,
      sellerMaxGain: premium,
      sellerMaxLoss: -(strike - premium),
    };
  }
  throw new Error("kind must be 'call' or 'put'");
}

// In / at / out of the money label
export function moneyness(kind, strike, spot) {
  if (spot === strike) return "At the money";
  const itm = kind === "call" ? spot > strike : spot < strike;
  return itm ? "In the money" : "Out of the money";
}