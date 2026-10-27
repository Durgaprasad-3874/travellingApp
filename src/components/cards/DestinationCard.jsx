import { Link } from 'react-router-dom';

import Poster from '../ui/Poster.jsx';
import Rating from '../ui/Rating.jsx';
import { money, plural } from '../../lib/format.js';
import { minPriceFor, packagesFor } from '../../data/index.js';

/**
 * A poster tile. With `fill`, the poster stretches to the height of its grid
 * cell (used for the large tile on the home page).
 *
 * Hover: the card lifts, the poster zooms inside its frame, a "See trips" pill
 * slides up, and the name underlines. The pill also appears on keyboard focus.
 */
export default function DestinationCard({ destination: d, fill = false }) {
  const tripCount = packagesFor(d.id).length;

  return (
    <Link
      to={`/destinations/${d.id}`}
      className={`group flex flex-col transition-transform duration-300 ease-out hover:-translate-y-1.5 ${
        fill ? 'h-full' : ''
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-[14px] bg-line transition-shadow duration-300 group-hover:shadow-[0_24px_40px_-20px_rgba(14,27,44,0.55)] group-focus-visible:shadow-[0_24px_40px_-20px_rgba(14,27,44,0.55)] ${
          fill ? 'aspect-[4/3] min-h-[240px] flex-1 lg:aspect-auto' : 'aspect-[4/5]'
        }`}
      >
        <Poster
          destination={d}
          className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.07] group-focus-visible:scale-[1.07]"
        />
        <span className="pointer-events-none absolute bottom-3 left-3 translate-y-3 rounded-full bg-white/95 px-3.5 py-1.5 text-sm font-semibold text-ink opacity-0 shadow-sm transition duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          See {plural(tripCount, 'trip')}
        </span>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-xl font-semibold leading-tight tracking-[-0.01em]">
            <span className="hover-underline">{d.name}</span>
          </h3>
          <p className="text-sm text-mute">{d.country}</p>
        </div>
        <Rating value={d.rating} className="shrink-0 pt-0.5" />
      </div>
      <p className="mt-1 text-sm">
        <span className="text-mute">From </span>
        <span className="font-semibold text-ink">{money(minPriceFor(d.id))}</span>
        <span className="text-mute"> for {plural(tripCount, 'trip')}</span>
      </p>
    </Link>
  );
}
