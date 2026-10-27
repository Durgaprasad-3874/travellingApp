import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import Poster from '../components/ui/Poster.jsx';
import Rating from '../components/ui/Rating.jsx';
import Stepper from '../components/ui/Stepper.jsx';
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx';
import { SelectField } from '../components/ui/Field.jsx';
import {
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconGauge,
  IconPin,
  IconUsers,
  IconX,
} from '../components/ui/Icons.jsx';
import NotFound from './NotFound.jsx';
import { getDestination, getPackage } from '../data/index.js';
import { reviewsFor } from '../data/reviews.js';
import Reviews from '../components/reviews/Reviews.jsx';
import { getDepartures } from '../lib/departures.js';
import { formatRange, money, moneyExact, plural } from '../lib/format.js';
import { calcQuote, CHILD_RATE, TAX_RATE } from '../lib/pricing.js';
import { travelerLimit } from '../lib/validation.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function PackageDetail() {
  const { packageId } = useParams();
  const pkg = getPackage(packageId);
  const d = pkg ? getDestination(pkg.destinationId) : null;
  useDocumentTitle(pkg ? pkg.title : 'Trip not found');

  const departures = useMemo(() => getDepartures(), []);
  const [date, setDate] = useState(departures[0]);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [openDays, setOpenDays] = useState(() => new Set([0]));

  if (!pkg || !d) {
    return <NotFound title="We can’t find that trip" />;
  }

  const limit = travelerLimit(pkg);
  const quote = calcQuote({ pkg, adults, children });
  const allOpen = openDays.size === pkg.itinerary.length;
  const reviews = reviewsFor(pkg.id);

  const toggleDay = (i) =>
    setOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const bookingUrl = `/book/${pkg.id}?date=${date}&adults=${adults}&children=${children}`;

  const facts = [
    { Icon: IconClock, label: 'Length', value: plural(pkg.days, 'day') },
    { Icon: IconUsers, label: 'Group size', value: `Up to ${pkg.groupSize}` },
    { Icon: IconGauge, label: 'Difficulty', value: pkg.difficulty },
    { Icon: IconCalendar, label: 'Best season', value: pkg.season },
  ];

  return (
    <div className="container-page py-8 lg:py-10">
      <Breadcrumbs
        items={[
          { label: 'Destinations', to: '/destinations' },
          { label: d.name, to: `/destinations/${d.id}` },
          { label: pkg.title },
        ]}
      />

      <div className="mt-4 h-48 overflow-hidden rounded-[20px] sm:h-64 lg:h-72">
        <Poster destination={d} shape="wide" className="h-full w-full" />
      </div>

      <div className="mt-8">
        <h1 className="display-lg max-w-[20ch]">{pkg.title}</h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[15px]">
          <Link to={`/destinations/${d.id}`} className="inline-flex items-center gap-1.5 font-medium hover:underline">
            <IconPin size={18} className="text-mute" />
            {d.name}, {d.country}
          </Link>
          <Rating value={d.rating} count={d.reviewCount} />
        </p>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
        {/* Booking card comes first on small screens, so price and dates are above the fold. */}
        <aside id="booking-card" className="order-first lg:sticky lg:top-24 lg:order-none lg:self-start">
          <div className="rounded-[16px] border border-line bg-white p-5 sm:p-6">
            <p>
              <span className="text-sm text-mute">From </span>
              <span className="font-display text-3xl font-bold tracking-[-0.02em] text-ink">{money(pkg.price)}</span>
              <span className="text-sm text-mute"> per adult</span>
            </p>

            <div className="mt-5 space-y-5">
              <SelectField id="departure" label="Departure" value={date} onChange={(e) => setDate(e.target.value)}>
                {departures.map((iso) => (
                  <option key={iso} value={iso}>
                    {formatRange(iso, pkg.days)}
                  </option>
                ))}
              </SelectField>
              <Stepper
                id="adults"
                label="Adults"
                hint="Age 12 and over"
                value={adults}
                min={1}
                max={limit - children}
                onChange={setAdults}
              />
              <Stepper
                id="children"
                label="Children"
                hint={`Age 2 to 11, pay ${Math.round(CHILD_RATE * 100)}%`}
                value={children}
                min={0}
                max={limit - adults}
                onChange={setChildren}
              />
            </div>

            <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-line pt-4">
              <span className="text-[15px]">Estimated total</span>
              <span className="font-display text-2xl font-bold tracking-[-0.02em] text-ink tabular-nums">
                {moneyExact(quote.total)}
              </span>
            </div>
            <p className="mt-1 text-sm text-mute">
              Includes {Math.round(TAX_RATE * 100)}% taxes and fees. Extras are optional at checkout.
            </p>

            <Link to={bookingUrl} className="btn btn-primary mt-5 w-full">
              Book this trip
            </Link>
          </div>
          <p className="mt-3 text-center text-sm text-mute">Manage or cancel this trip from My trips.</p>
        </aside>

        <div className="min-w-0 space-y-14">
          <dl className="grid grid-cols-2 gap-5 rounded-[14px] border border-line bg-white p-5 sm:grid-cols-4">
            {facts.map(({ Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon size={22} className="mt-0.5 shrink-0 text-action" />
                <div className="min-w-0">
                  <dt className="text-sm text-mute">{label}</dt>
                  <dd className="text-[15px] font-semibold leading-snug text-ink">{value}</dd>
                </div>
              </div>
            ))}
          </dl>

          <section aria-labelledby="overview-title">
            <h2 id="overview-title" className="display-md">
              Overview
            </h2>
            <p className="mt-4 max-w-[62ch] text-lg">{pkg.summary}</p>
            <p className="mt-3 max-w-[62ch]">{d.description}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {pkg.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-[15px]">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-action-soft text-action">
                    <IconCheck size={14} />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="itinerary-title">
            <div className="flex items-end justify-between gap-4">
              <h2 id="itinerary-title" className="display-md">
                Day by day
              </h2>
              <button
                type="button"
                className="hover-underline shrink-0 text-[15px] font-semibold text-action"
                onClick={() =>
                  setOpenDays(allOpen ? new Set() : new Set(pkg.itinerary.map((_, i) => i)))
                }
              >
                {allOpen ? 'Collapse all' : 'Expand all'}
              </button>
            </div>
            <ol className="mt-5 divide-y divide-line border-y border-line">
              {pkg.itinerary.map((day, i) => {
                const open = openDays.has(i);
                return (
                  <li key={day.title}>
                    <h3>
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={`day-${i}`}
                        onClick={() => toggleDay(i)}
                        className="group flex w-full items-center gap-4 py-4 text-left"
                      >
                        <span className="w-14 shrink-0 text-sm font-semibold text-action">Day {i + 1}</span>
                        <span className="flex-1 font-display text-lg font-semibold leading-snug text-ink transition-transform duration-300 ease-out group-hover:translate-x-1">
                          {day.title}
                        </span>
                        <IconChevronDown
                          size={20}
                          className={`shrink-0 text-ink transition-transform duration-300 group-hover:text-action ${
                            open ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </h3>
                    {/* grid-rows 0fr to 1fr animates the height; `invisible` hides closed text from keyboard and screen readers. */}
                    <div
                      id={`day-${i}`}
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div
                        className={`overflow-hidden transition-[visibility,opacity] duration-300 ${
                          open ? 'visible opacity-100' : 'invisible opacity-0'
                        }`}
                      >
                        <p className="max-w-[60ch] pb-5 text-[15px] sm:pl-[72px] sm:pr-10">{day.text}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section aria-labelledby="included-title">
            <h2 id="included-title" className="display-md">
              What’s included
            </h2>
            <div className="mt-5 grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="text-[15px] font-semibold text-ink">Included</h3>
                <ul className="mt-3 space-y-2.5">
                  {pkg.included.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[15px]">
                      <IconCheck size={18} className="mt-0.5 shrink-0 text-ok" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-ink">Not included</h3>
                <ul className="mt-3 space-y-2.5">
                  {pkg.excluded.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[15px]">
                      <IconX size={18} className="mt-0.5 shrink-0 text-mute" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <Reviews itemId={pkg.id} sampleReviews={reviews} />
        </div>
      </div>
    </div>
  );
}
