import { useState } from 'react'
import PayoffChart from './PayoffChart'
import { optionResult, moneyness, limits } from './options'
import './App.css'

const fmt = (n) => (Number.isFinite(n) ? n.toFixed(2) : 'Unlimited')
// show an explicit sign so gains and losses read without relying on colour
const signed = (n) => {
  if (!Number.isFinite(n)) return 'Unlimited'
  return n > 0 ? `+${fmt(n)}` : n < 0 ? `-${fmt(Math.abs(n))}` : fmt(n)
}
const tone = (n) => (n > 0 ? 'gain' : n < 0 ? 'loss' : '')

function Field({ label, hint, value, onChange }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        type="number"
        step="any"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="field-hint">{hint}</span>
    </label>
  )
}

function Row({ label, value, className = '' }) {
  return (
    <div className="row">
      <dt>{label}</dt>
      <dd className={className}>{value}</dd>
    </div>
  )
}

function Side({ title, note, value, maxGain, maxLoss }) {
  return (
    <div className="side">
      <span className="side-title">{title} profit or loss</span>
      <span className={`side-value ${tone(value)}`}>{signed(value)}</span>
      <span className="side-note">{note}</span>
      <dl className="side-limits">
        <div>
          <dt>Max gain</dt>
          <dd className={tone(maxGain)}>{signed(maxGain)}</dd>
        </div>
        <div>
          <dt>Max loss</dt>
          <dd className={tone(maxLoss)}>{signed(maxLoss)}</dd>
        </div>
      </dl>
    </div>
  )
}

// P/L for both options at a range of prices around the strike.
// Clicking a row moves the market price there.
function Scenarios({ strike, callPremium, putPremium, spot, onPick }) {
  const steps = [0.7, 0.8, 0.9, 0.95, 1, 1.05, 1.1, 1.2, 1.3]
  const prices = [...new Set([...steps.map((s) => +(strike * s).toFixed(2)), spot])].sort((a, b) => a - b)

  return (
    <section className="scenarios">
      <div className="scenarios-head">
        <h2>Profit or loss at different market prices</h2>
        <p>Click a row to use that price.</p>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Market price</th>
              <th scope="col" className="call">Call buyer</th>
              <th scope="col" className="call">Call seller</th>
              <th scope="col" className="put">Put buyer</th>
              <th scope="col" className="put">Put seller</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((p) => {
              const c = optionResult('call', strike, callPremium, p)
              const u = optionResult('put', strike, putPremium, p)
              const current = p === spot
              return (
                <tr
                  key={p}
                  className={current ? 'current' : ''}
                  tabIndex={0}
                  aria-current={current || undefined}
                  onClick={() => onPick(String(p))}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onPick(String(p)))}
                >
                  <th scope="row">
                    {fmt(p)}
                    {p === strike && <span className="tag">strike</span>}
                    {current && <span className="tag now">current</span>}
                  </th>
                  <td className={tone(c.buyerProfit)}>{signed(c.buyerProfit)}</td>
                  <td className={tone(c.sellerProfit)}>{signed(c.sellerProfit)}</td>
                  <td className={tone(u.buyerProfit)}>{signed(u.buyerProfit)}</td>
                  <td className={tone(u.sellerProfit)}>{signed(u.sellerProfit)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function OptionPanel({ kind, strike, premium, spot }) {
  const r = optionResult(kind, strike, premium, spot)
  const lim = limits(kind, strike, premium)

  return (
    <section className={`panel ${kind}`}>
      <header className="panel-head">
        <h2>{kind === 'call' ? 'Call option' : 'Put option'}</h2>
        <span className="status">{moneyness(kind, strike, spot)}</span>
      </header>

      <div className="sides">
        <Side
          title="Buyer"
          note={kind === 'call' ? 'Right to buy at the strike' : 'Right to sell at the strike'}
          value={r.buyerProfit}
          maxGain={lim.buyerMaxGain}
          maxLoss={lim.buyerMaxLoss}
        />
        <Side
          title="Seller"
          note={kind === 'call' ? 'Must sell at the strike if exercised' : 'Must buy at the strike if exercised'}
          value={r.sellerProfit}
          maxGain={lim.sellerMaxGain}
          maxLoss={lim.sellerMaxLoss}
        />
      </div>

      <dl className="rows">
        <Row label="Payoff at maturity" value={fmt(r.payoff)} />
        <Row label="Break-even price" value={fmt(r.breakeven)} />
        <Row label="Premium (buyer pays, seller receives)" value={fmt(premium)} />
      </dl>

      <PayoffChart kind={kind} strike={strike} premium={premium} spot={spot} />
    </section>
  )
}

function App() {
  // keep the raw text so a field can be cleared while typing
  const [strike, setStrike] = useState('100')
  const [callPremium, setCallPremium] = useState('5')
  const [putPremium, setPutPremium] = useState('4')
  const [spot, setSpot] = useState('110')

  const values = {
    strike: parseFloat(strike),
    callPremium: parseFloat(callPremium),
    putPremium: parseFloat(putPremium),
    spot: parseFloat(spot),
  }

  const errors = []
  if (!Number.isFinite(values.strike) || values.strike <= 0)
    errors.push('Strike price must be a number greater than 0.')
  if (!Number.isFinite(values.callPremium) || values.callPremium < 0)
    errors.push('Call premium must be 0 or more.')
  if (!Number.isFinite(values.putPremium) || values.putPremium < 0)
    errors.push('Put premium must be 0 or more.')
  if (!Number.isFinite(values.spot) || values.spot < 0)
    errors.push('Market price must be 0 or more.')

  return (
    <div className="container">
      <header className="page-head">
        <h1>Options Payoff Visualizer</h1>
      </header>

      <section className="inputs" aria-label="Contract details">
        <Field label="Strike price" hint="Exercise price (K)" value={strike} onChange={setStrike} />
        <Field label="Call premium" hint="Price paid for the call" value={callPremium} onChange={setCallPremium} />
        <Field label="Put premium" hint="Price paid for the put" value={putPremium} onChange={setPutPremium} />
        <Field label="Market price" hint="Underlying price at maturity" value={spot} onChange={setSpot} />
      </section>

      {errors.length > 0 ? (
        <div className="error" role="alert">
          {errors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      ) : (
        <>
          <main className="options">
            <OptionPanel
              kind="call"
              strike={values.strike}
              premium={values.callPremium}
              spot={values.spot}
            />
            <OptionPanel
              kind="put"
              strike={values.strike}
              premium={values.putPremium}
              spot={values.spot}
            />
          </main>
          <Scenarios
            strike={values.strike}
            callPremium={values.callPremium}
            putPremium={values.putPremium}
            spot={values.spot}
            onPick={setSpot}
          />
        </>
      )}
    </div>
  )
}

export default App
