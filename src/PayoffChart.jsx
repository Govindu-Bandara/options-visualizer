import {
  Chart as ChartJS, LinearScale, PointElement, LineElement,
  Title, SubTitle, Tooltip, Legend, Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { payoff, optionResult } from "./options";

ChartJS.register(LinearScale, PointElement, LineElement, Title, SubTitle, Tooltip, Legend, Filler);

ChartJS.defaults.font.family = "Inter, system-ui, 'Segoe UI', Arial, sans-serif";
ChartJS.defaults.font.size = 12;
ChartJS.defaults.color = "#5b6472";

const COLORS = {
  call: "#1d5fb4",
  put: "#d9690b",
  seller: "#1f2933",
  payoff: "#9aa3b0",
  strike: "#2b8a7e",
  breakeven: "#7048b8",
  market: "#111111",
};

const fmt = (n) => Number(n).toFixed(2);

export default function PayoffChart({ kind, strike, premium, spot }) {
  const lo = 0.5 * Math.min(strike, spot);
  const hi = 1.5 * Math.max(strike, spot);

  // sample the range so hovering gives values along the line, and
  // include the strike so the kink is drawn exactly
  const steps = 40;
  const xs = Array.from({ length: steps + 1 }, (_, i) => lo + ((hi - lo) * i) / steps);
  if (!xs.includes(strike)) xs.push(strike);
  xs.sort((a, b) => a - b);

  const pay    = xs.map((x) => ({ x, y: payoff(kind, strike, x) }));
  const buyer  = xs.map((x) => ({ x, y: payoff(kind, strike, x) - premium }));
  const seller = buyer.map((p) => ({ x: p.x, y: -p.y }));

  // height of the vertical lines
  const all = [...pay, ...buyer, ...seller].map((p) => p.y);
  const yMin = Math.min(...all), yMax = Math.max(...all);

  const { buyerProfit, breakeven } = optionResult(kind, strike, premium, spot);

  const accent = COLORS[kind];

  const line = (label, data, color, { dash = [], width = 2.5 } = {}) => ({
    label, data, borderColor: color, borderDash: dash,
    pointRadius: 0, pointHoverRadius: 4, borderWidth: width, tension: 0,
  });

  const data = {
    datasets: [
      line("Payoff", pay, COLORS.payoff, { dash: [6, 4], width: 2 }),
      {
        ...line("Buyer profit/loss", buyer, accent),
        // shade where the buyer is in profit (green) or at a loss (red)
        fill: { target: "origin", above: "rgba(27, 127, 75, 0.10)", below: "rgba(194, 48, 48, 0.16)" },
      },
      line("Seller profit/loss", seller, COLORS.seller),
      line(`Strike ${strike}`,
           [{ x: strike, y: yMin }, { x: strike, y: yMax }],
           COLORS.strike, { dash: [2, 3], width: 1.5 }),
      line(`Break-even ${fmt(breakeven)}`,
           [{ x: breakeven, y: yMin }, { x: breakeven, y: yMax }],
           COLORS.breakeven, { dash: [8, 4], width: 1.5 }),
      { label: `Market price ${spot}`, data: [{ x: spot, y: buyerProfit }],
        borderColor: "#ffffff", backgroundColor: COLORS.market, borderWidth: 2,
        pointRadius: 6, pointHoverRadius: 7, showLine: false },
    ],
  };

  const options = {
    responsive: true,
    aspectRatio: 1.2,
    // no animation: the tooltip was getting stuck half faded while hovering
    animation: false,
    // "index" picks the same sample on the payoff, buyer and seller lines
    interaction: { mode: "index", intersect: false },
    plugins: {
      title: {
        display: true,
        text: `${kind === "call" ? "Call" : "Put"} option payoff at maturity`,
        color: "#1f2933",
        font: { size: 14, weight: "600" },
        padding: { bottom: 2 },
      },
      subtitle: {
        display: true,
        text: "Shaded area: buyer profit (green) and loss (red)",
        color: "#667085",
        font: { size: 11 },
        padding: { bottom: 12 },
      },
      legend: {
        position: "bottom",
        labels: { boxWidth: 22, boxHeight: 2, padding: 14 },
      },
      tooltip: {
        backgroundColor: "#1f2933",
        padding: 10,
        cornerRadius: 3,
        boxPadding: 4,
        // the vertical reference lines are only 2 points, skip them in the tooltip
        animation: false,
        filter: (item) => item.datasetIndex <= 2,
        callbacks: {
          title: (items) => `Market price ${fmt(items[0].parsed.x)}`,
          label: (item) => ` ${item.dataset.label}: ${fmt(item.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        title: { display: true, text: "Market price at maturity" },
        grid: { color: "#eceef2" },
        border: { color: "#c5cad3" },
      },
      y: {
        title: { display: true, text: "Profit or loss" },
        grid: {
          color: (c) => (c.tick.value === 0 ? "#6b7280" : "#eceef2"),
          lineWidth: (c) => (c.tick.value === 0 ? 1.5 : 1),
        },
        border: { display: false },
      },
    },
  };

  return <Line data={data} options={options} />;
}
