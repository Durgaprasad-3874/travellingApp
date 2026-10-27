import { useState } from 'react';
import { Link } from 'react-router-dom';

import Poster from '../ui/Poster.jsx';
import PriceLines from '../ui/PriceLines.jsx';
import { getDestination } from '../../data/index.js';
import { formatRange, moneyExact, plural } from '../../lib/format.js';
import { ADD_ONS } from '../../lib/pricing.js';
import { STATUS_LABEL } from '../../lib/bookings.js';

const STATUS_STYLE = {
  upcoming: 'bg-action-soft text-action-dark',
  completed: 'bg-line text-ink-2',
  cancelled: 'bg-[#FBE4E4] text-danger',
};

/**
 * A boarding-pass style booking. The tear-off stub on the right holds the
 * reference, status and actions; the main part holds the trip details.
 */
export default function BookingTicket({ booking: b, status, highlighted, onCancel, onRemove }) {
  const [confirming, setConfirming] = useState(false);
  const d = getDestination(b.destinationId);

  const travelers = [
    b.adults > 0 ? plural(b.adults, 'adult') : null,
    b.children > 0 ? plural(b.children, 'child', 'children') : null,
  ]
    .filter(Boolean)
    .join(', ');
  const extras = b.addOns.map((id) => ADD_ONS.find((a) => a.id === id)?.label).filter(Boolean);

  const details = [
    { label: 'Dates', value: formatRange(b.departure, b.days) },
    { label: 'Travelers', value: travelers },
    { label: 'Extras', value: extras.length ? extras.join(', ') : 'None' },
    { label: 'Total', value: moneyExact(b.pricing.total) },
  ];

  return (
    <li
      className={`group/ticket transition-transform duration-300 hover:-translate-y-1 ${
        highlighted ? 'rounded-[18px] outline outline-2 outline-offset-4 outline-action' : ''
      }`}
      style={{ filter: 'drop-shadow(0 0 0.5px #8FA3AF) drop-shadow(0 4px 8px rgba(14,27,44,0.07))' }}
    >
      <article
        aria-labelledby={`ticket-${b.id}`}
        className="ticket flex flex-col overflow-hidden rounded-[16px] bg-white md:flex-row"
      >
        <div className="h-24 shrink-0 overflow-hidden md:h-auto md:w-36">
          {d && (
            <Poster
              destination={d}
              className="h-full w-full transition-transform duration-700 ease-out group-hover/ticket:scale-110"
            />
          )}
        </div>

        <div className="min-w-0 flex-1 p-5 sm:p-6">
          <h2 id={`ticket-${b.id}`} className="font-display text-2xl font-bold leading-tight tracking-[-0.02em] text-ink">
            {b.destinationName}
          </h2>
          <p className="text-[15px] text-mute">
            {d ? (
              <Link to={`/packages/${b.packageId}`} className="hover-underline font-medium text-ink-2 hover:text-ink">
                {b.packageTitle}
              </Link>
            ) : (
              b.packageTitle
            )}
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-4">
            {details.map((item) => (
              <div key={item.label} className="min-w-0">
                <dt className="text-sm text-mute">{item.label}</dt>
                <dd className="text-[15px] font-semibold leading-snug text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>

          <details className="group/details mt-5">
            <summary className="cursor-pointer text-sm font-semibold text-action transition-colors hover:text-action-dark">
              Price breakdown and traveler
            </summary>
            <div className="mt-3 max-w-sm">
              <PriceLines quote={b.pricing} />
              <p className="mt-4 text-sm text-mute">
                Booked by {b.contact.fullName} ({b.contact.email})
              </p>
              {b.requests && <p className="mt-1 text-sm text-mute">Request: {b.requests}</p>}
            </div>
          </details>
        </div>

        <div className="flex flex-col justify-between gap-5 border-t-2 border-dashed border-line p-5 sm:p-6 md:w-[232px] md:shrink-0 md:border-l-2 md:border-t-0">
          <div>
            <p className="text-sm text-mute">Booking reference</p>
            <p className="mt-0.5 font-display text-xl font-bold tracking-[0.04em] text-ink">{b.id}</p>
            <span
              className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${STATUS_STYLE[status]}`}
            >
              {STATUS_LABEL[status]}
            </span>
          </div>

          {status === 'upcoming' ? (
            confirming ? (
              <div role="group" aria-label="Confirm cancellation">
                <p className="text-sm font-semibold text-ink">Cancel this trip?</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" className="btn btn-secondary btn-sm flex-1" onClick={() => setConfirming(false)}>
                    Keep it
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm flex-1 bg-danger text-white hover:bg-[#a52626]"
                    onClick={onCancel}
                  >
                    Cancel trip
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirming(true)}>
                Cancel booking
              </button>
            )
          ) : (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onRemove}>
              Remove from list
            </button>
          )}
        </div>
      </article>
    </li>
  );
}
