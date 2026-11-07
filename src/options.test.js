import { describe, it, expect } from "vitest";
import { optionResult, moneyness, limits } from "./options";

describe("limits", () => {
  it("call buyer loses at most the premium, seller has no loss limit", () => {
    expect(limits("call", 100, 5)).toEqual({
      buyerMaxGain: Infinity, buyerMaxLoss: -5,
      sellerMaxGain: 5, sellerMaxLoss: -Infinity,
    });
  });
  it("put is capped by the strike", () => {
    expect(limits("put", 100, 4)).toEqual({
      buyerMaxGain: 96, buyerMaxLoss: -4,
      sellerMaxGain: 4, sellerMaxLoss: -96,
    });
  });
  it("put limits match optionResult at the extremes", () => {
    const l = limits("put", 100, 4);
    expect(optionResult("put", 100, 4, 0).buyerProfit).toBe(l.buyerMaxGain);
    expect(optionResult("put", 100, 4, 200).buyerProfit).toBe(l.buyerMaxLoss);
  });
  it("invalid kind throws", () => {
    expect(() => limits("swap", 100, 5)).toThrow();
  });
});

describe("call", () => {
  it("in the money", () => {
    expect(optionResult("call", 100, 5, 120)).toEqual(
      { payoff: 20, buyerProfit: 15, sellerProfit: -15, breakeven: 105 });
  });
  it("slightly in the money still loses", () => {
    const r = optionResult("call", 100, 5, 102);
    expect([r.payoff, r.buyerProfit]).toEqual([2, -3]);
  });
  it("out of the money loses the premium", () => {
    expect(optionResult("call", 100, 5, 90).buyerProfit).toBe(-5);
  });
  it("break-even gives zero profit", () => {
    expect(optionResult("call", 100, 5, 105).buyerProfit).toBe(0);
  });
});

describe("put", () => {
  it("in the money", () => {
    const r = optionResult("put", 100, 4, 80);
    expect([r.payoff, r.buyerProfit, r.sellerProfit, r.breakeven])
      .toEqual([20, 16, -16, 96]);
  });
  it("slightly in the money still loses", () => {
    const r = optionResult("put", 100, 4, 98);
    expect([r.payoff, r.buyerProfit]).toEqual([2, -2]);
  });
  it("out of the money loses the premium", () => {
    expect(optionResult("put", 100, 4, 110).buyerProfit).toBe(-4);
  });
  it("break-even gives zero profit", () => {
    expect(optionResult("put", 100, 4, 96).buyerProfit).toBe(0);
  });
});

it("buyer and seller always sum to zero", () => {
  for (const kind of ["call", "put"]) {
    for (const s of [0, 50, 100, 150]) {
      const r = optionResult(kind, 100, 5, s);
      expect(r.buyerProfit + r.sellerProfit).toBe(0);
    }
  }
});

it("moneyness labels", () => {
  expect(moneyness("call", 100, 120)).toBe("In the money");
  expect(moneyness("put", 100, 120)).toBe("Out of the money");
  expect(moneyness("call", 100, 100)).toBe("At the money");
});

it("invalid kind throws", () => {
  expect(() => optionResult("swap", 100, 5, 100)).toThrow();
});