import { moneyExact } from '../../lib/format.js';

/** Itemised price breakdown with the total at the bottom. `quote` comes from calcQuote(). */
export default function PriceLines({ quote, className = '' }) {
  return (
    <dl className={`text-[15px] ${className}`}>
      {quote.lines.map((line) => (
        <div key={line.key} className="flex items-baseline justify-between gap-4 py-1.5">
          <dt>{line.label}</dt>
          <dd className={`tabular-nums ${line.amount < 0 ? 'font-semibold text-ok' : 'text-ink'}`}>
            {line.amount < 0 ? `−${moneyExact(-line.amount)}` : moneyExact(line.amount)}
          </dd>
        </div>
      ))}
      <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-line pt-3">
        <dt className="font-semibold text-ink">Total</dt>
        <dd className="font-display text-2xl font-bold tracking-[-0.02em] text-ink tabular-nums">
          {moneyExact(quote.total)}
        </dd>
      </div>
    </dl>
  );
}
