import { Link } from 'react-router-dom';

import Poster from '../ui/Poster.jsx';
import { IconClock, IconGauge, IconPin } from '../ui/Icons.jsx';
import { money, plural } from '../../lib/format.js';
import { getDestination } from '../../data/index.js';

/**
 * One trip in a list. The whole row is clickable through the title link's
 * stretched ::after, so there is a single link for keyboard and screen readers.
 *
 * Hover: the thumbnail zooms in its frame, the text eases right, the title
 * underlines and the price turns blue.
 */
export default function PackageRow({ pkg, showDestination = true }) {
  const d = getDestination(pkg.destinationId);

  return (
    <article className="group relative flex gap-4 py-5 sm:gap-6">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[10px] sm:h-32 sm:w-32">
        <Poster
          destination={d}
          className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.12]"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 transition-transform duration-300 ease-out group-hover:translate-x-1 sm:flex-row sm:items-center sm:gap-8">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold leading-snug tracking-[-0.01em] text-ink sm:text-xl">
            <Link to={`/packages/${pkg.id}`} className="hover-underline after:absolute after:inset-0">
              {pkg.title}
            </Link>
          </h3>
          <ul className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-mute">
            {showDestination && (
              <li className="inline-flex items-center gap-1.5">
                <IconPin size={16} />
                {d.name}, {d.country}
              </li>
            )}
            <li className="inline-flex items-center gap-1.5">
              <IconClock size={16} />
              {plural(pkg.days, 'day')}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <IconGauge size={16} />
              {pkg.difficulty}
            </li>
          </ul>
          <p className="mt-2 hidden max-w-[52ch] text-[15px] sm:block">{pkg.summary}</p>
        </div>

        <p className="shrink-0 sm:text-right">
          <span className="text-sm text-mute">From </span>
          <span className="font-display text-2xl font-bold tracking-[-0.02em] text-ink transition-colors duration-300 group-hover:text-action">
            {money(pkg.price)}
          </span>
          <span className="block text-sm text-mute">per adult</span>
        </p>
      </div>
    </article>
  );
}
