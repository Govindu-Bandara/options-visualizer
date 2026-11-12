# Options Payoff Visualizer

A small web app that calculates the payoff and the profit or loss of European call and put options at maturity, for both the buyer and the seller, and draws the payoff graphs.

Built for **IS4350 Finance Engineering**, University of Moratuwa (Group 3: Options).

---

## Contents

1. [Getting started](#getting-started)
2. [What is an option?](#what-is-an-option)
3. [Call options and put options](#call-options-and-put-options)
4. [Key words](#key-words)
5. [Payoff vs profit or loss](#payoff-vs-profit-or-loss)
6. [Why options exist](#why-options-exist)
7. [Using the system](#using-the-system)
8. [Reading the graphs](#reading-the-graphs)
9. [Try it yourself](#try-it-yourself)
10. [Project structure](#project-structure)

---

## Getting started

### Requirements

- [Node.js](https://nodejs.org/) 20 or newer (includes npm)
- Git (only needed to clone the repository)

Check what you have:

```bash
node -v
npm -v
```

### Install and run

```bash
git clone https://github.com/Govindu-Bandara/options-visualizer.git
cd options-visualizer
npm install
npm run dev
```

Open the address shown in the terminal (usually http://localhost:5173).

### Other commands

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server with live reload |
| `npm test` | Runs the unit tests for the calculations (Vitest) |
| `npm run build` | Builds a production version into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Checks the code with ESLint |

### Built with

React 19, Vite, Chart.js (through react-chartjs-2) and Vitest.

---

## What is an option?

Imagine a concert ticket costs **$100** today. You think the band is getting famous and the price may rise next month. You pay the seller a small fee of **$5** to lock in the right to buy that ticket at **$100** next month, whatever happens to the market price.

| Next month the ticket costs | What you do | Result |
|---|---|---|
| $120 | Use your right and buy at $100 | Save $20, minus the $5 fee = **+$15** |
| $90 | Don't use it, buy at $90 on the market | Lose only the **$5 fee** |

> An option is a contract. You pay a small fee now, and in return you get the **right, not the duty,** to buy or sell something at a fixed price later. As the buyer, the most you can lose is the fee.

---

## Call options and put options

### Call option: the right to BUY

You use a call when you think the price will **go up**. Example: you pay $5 for the right to buy a phone at $100 in a month.

| Price in a month | What you do | Result |
|---|---|---|
| $130 | Use your right (buy at $100) | $30 - $5 fee = **+$25** |
| $105 | Use your right | $5 - $5 fee = **0** (break-even) |
| $90 | Don't use it | **-$5** (only the fee) |

### Put option: the right to SELL

You use a put when you think the price will **go down**, or when you want protection, like insurance. Example: you own a phone worth $100 and pay $4 for the right to sell it at $100 in a month.

| Price in a month | What you do | Result |
|---|---|---|
| $70 | Use your right (sell at $100) | $30 - $4 fee = **+$26** |
| $96 | Use your right | $4 - $4 fee = **0** (break-even) |
| $110 | Don't use it | **-$4** (only the fee) |

### Side by side

| | Call | Put |
|---|---|---|
| Right to | Buy | Sell |
| Buyer hopes the price goes | Up | Down |
| Buyer's biggest loss | The premium | The premium |
| Buyer's biggest gain | Unlimited | Strike - premium |
| Break-even price | Strike + premium | Strike - premium |
| Everyday comparison | Reserving at today's price | Insurance |

**Memory trick:** with a call you "call" the asset to you (buy) and want the price up. With a put you "put" the asset onto someone else (sell) and want the price down.

**Every option has two sides.** Calls and puts both have a buyer and a seller. A put is not "the seller's option": people buy puts all the time, for example to protect shares they own.

---

## Key words

| Word | Meaning | Example |
|---|---|---|
| Strike price (K) | The locked-in price in the contract | $100 |
| Premium (P) | The fee the buyer pays for the right | $5 |
| Market price at maturity (S<sub>T</sub>) | The real price on the last day | $120 or $90 |
| Maturity / expiry | The date the contract ends | In one month |
| Buyer (long) | Pays the fee and holds the right. Loss is limited to the fee. | You |
| Seller (short / writer) | Receives the fee and must honour the deal if the buyer uses it. Gain is limited to the fee, loss can be large. | The other side |

The **seller is the exact opposite of the buyer**. If the buyer gains $15, the seller loses $15. If the buyer loses the $5 fee, the seller keeps it.

---

## Payoff vs profit or loss

- **Payoff** is what the option is worth on the last day, ignoring the fee. For the buyer it is never negative.
- **Profit or loss** is the payoff minus the premium paid. It can be negative.

### Formulas (per unit, at maturity)

| | Call | Put |
|---|---|---|
| Payoff (buyer) | max(S<sub>T</sub> - K, 0) | max(K - S<sub>T</sub>, 0) |
| Profit (buyer) | Payoff - P | Payoff - P |
| Profit (seller) | -(Payoff - P) | -(Payoff - P) |
| Break-even | K + P | K - P |
| Buyer max gain | Unlimited | K - P |
| Seller max loss | Unlimited | K - P |

`max(a, 0)` means "a, but never below zero". If the option is not worth using, the payoff is zero.

### Worked example: call, K = 100, P = 5

| S<sub>T</sub> | Payoff | Buyer profit | Seller profit |
|---|---|---|---|
| 120 | 20 | +15 | -15 |
| 105 | 5 | 0 (break-even) | 0 |
| 102 | 2 | -3 | +3 |
| 90 | 0 | -5 (max loss) | +5 (max gain) |

### Worked example: put, K = 100, P = 4

| S<sub>T</sub> | Payoff | Buyer profit | Seller profit |
|---|---|---|---|
| 80 | 20 | +16 | -16 |
| 96 | 4 | 0 (break-even) | 0 |
| 98 | 2 | -2 | +2 |
| 110 | 0 | -4 (max loss) | +4 (max gain) |

Note the 102 and 98 rows: the option pays something, but the buyer still loses because the payoff is smaller than the premium.

---

## Why options exist

- **Hedging (insurance):** an airline can lock in a fuel price so a price jump doesn't ruin its year. A farmer can lock in a minimum selling price for a crop.
- **Speculating:** a trader can bet on a price rising or falling while risking only the premium.
- **Managing risk:** banks and companies use options to limit how much they can lose.

---

## Using the system

### Inputs

| Input | Meaning | Default |
|---|---|---|
| Strike price | The locked-in price (K) | 100 |
| Call premium | Fee paid for the call | 5 |
| Put premium | Fee paid for the put | 4 |
| Market price | Underlying price at maturity (S<sub>T</sub>) | 110 |

The strike and market price are shared, so you can compare a call and a put on the same asset side by side.

### What it shows

For **each** of the call and the put:

- **Buyer** and **seller** profit or loss, shown with equal weight, plus each side's maximum gain and maximum loss
- Payoff at maturity, break-even price and the premium
- A payoff graph

Below both options, a **scenario table** shows the profit or loss of all four positions (call buyer, call seller, put buyer, put seller) at prices from 70% to 130% of the strike. The strike row is tagged and the current price is highlighted. **Click a row** (or select it and press Enter) to use that price.

Gains are green with a `+` sign and losses are red with a `-` sign.

### Validation

The strike must be greater than 0, and the premiums and the market price must be 0 or more. A blank or invalid value shows a red message instead of the results. Nothing crashes, and the results come back as soon as the value is fixed.

### How it works

```
inputs (K, P, ST) ──> src/options.js ──> numbers in the panels and table
                       (formulas)    └──> src/PayoffChart.jsx draws the graphs
```

Every change to an input recalculates everything instantly.

---

## Reading the graphs

| Line or mark | Meaning |
|---|---|
| Grey dashed line | Payoff, before subtracting the premium |
| Blue line (call) / orange line (put) | Buyer's profit or loss |
| Dark line | Seller's profit or loss, the upside-down mirror of the buyer's |
| Green shading | Where the buyer makes a profit |
| Red shading | Where the buyer makes a loss |
| Teal dotted vertical line | Strike price |
| Purple dashed vertical line | Break-even price |
| Black dot | The market price you entered, on the buyer's line |

Hover over a graph to see the payoff, buyer and seller values at that price. Click a legend item to hide or show that line.

**Call graph:** the buyer's line is flat at minus the premium on the left (only the fee is lost), crosses zero at the break-even price, then rises steadily. This is the "hockey stick" shape.

**Put graph:** the same idea flipped. Profit grows as the price falls, and the loss is flat at minus the premium on the right.

---

## Try it yourself

| Test | Inputs | Expected result |
|---|---|---|
| Call, price above strike | K 100, call premium 5, market 120 | Payoff 20, buyer +15, seller -15, break-even 105 |
| Put, price below strike | K 100, put premium 4, market 80 | Payoff 20, buyer +16, seller -16, break-even 96 |
| Call, price below strike | K 100, call premium 5, market 90 | Payoff 0, buyer -5, seller +5 |
| Bad input | Blank field or strike 0 | Red error message, no crash |

### Quick self-test (call, K = 100, premium 5)

1. The price ends at 130. Buyer's profit? <details><summary>Answer</summary>+25 (payoff 30 minus fee 5)</details>
2. The price ends at 80. Buyer's profit? <details><summary>Answer</summary>-5 (only the fee is lost)</details>
3. At what price does the buyer break even? <details><summary>Answer</summary>105 (strike plus fee)</details>
4. If the buyer makes 25, what does the seller make? <details><summary>Answer</summary>-25</details>

---

## Project structure

```
options-visualizer/
├── index.html            Page shell, loads the Inter font
├── src/
│   ├── main.jsx          Starts React
│   ├── App.jsx           Inputs, validation, option panels, scenario table
│   ├── App.css           Styles
│   ├── PayoffChart.jsx   Chart.js payoff graph for one option
│   ├── options.js        Calculations: payoff, optionResult, limits
│   └── options.test.js   Unit tests for the calculations
├── package.json
└── vite.config.js
```

All the finance logic is in `src/options.js` and is covered by the tests in `src/options.test.js`, so the calculations can be checked without opening the app.

---

## Remember

- The buyer's loss is limited to the premium.
- The seller's result is always the mirror image of the buyer's.
- Payoff ignores the fee. Profit or loss includes it.
- Call break-even = strike + premium. Put break-even = strike - premium.
