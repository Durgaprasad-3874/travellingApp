import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import DestinationCard from '../components/cards/DestinationCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { IconSearch, IconSliders, IconX } from '../components/ui/Icons.jsx';
import { SelectField } from '../components/ui/Field.jsx';
import {
  CATEGORIES,
  DEFAULT_ORIGIN,
  ORIGIN_CITIES,
  REGIONS,
  PRICE_BOUNDS,
  destinations,
  minPriceFor,
  packagesFor,
} from '../data/index.js';
import { money, plural } from '../lib/format.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const SORTS = [
  { value: 'popular', label: 'Most reviewed' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
];

const COMPARE = {
  popular: (a, b) => b.reviewCount - a.reviewCount,
  rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  'price-asc': (a, b) => minPriceFor(a.id) - minPriceFor(b.id),
  'price-desc': (a, b) => minPriceFor(b.id) - minPriceFor(a.id),
  name: (a, b) => a.name.localeCompare(b.name),
};

// Everything a visitor might type to find a destination.
const SEARCH_TEXT = Object.fromEntries(
  destinations.map((d) => [
    d.id,
    [
      d.name,
      d.country,
      d.region,
      d.categories.join(' '),
      d.tagline,
      packagesFor(d.id)
        .map((p) => p.title)
        .join(' '),
    ]
      .join(' ')
      .toLowerCase(),
  ]),
);

export default function Destinations() {
  useDocumentTitle('Destinations');

  // Filters live in the URL, so the back button and shared links keep them.
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const requestedFrom = params.get('from') ?? '';
  const from = ORIGIN_CITIES.includes(requestedFrom) ? requestedFrom : '';
  const requestedTo = params.get('to') ?? '';
  const to = destinations.some((destination) => destination.id === requestedTo) ? requestedTo : '';
  const categories = params.getAll('category').filter((c) => CATEGORIES.includes(c));
  const region = REGIONS.includes(params.get('region')) ? params.get('region') : '';
  const maxParam = params.get('max');
  const maxNumber = maxParam === null ? NaN : Number(maxParam);
  const maxPrice =
    Number.isFinite(maxNumber) && maxNumber >= PRICE_BOUNDS.min && maxNumber <= PRICE_BOUNDS.max
      ? maxNumber
      : PRICE_BOUNDS.max;
  const sort = SORTS.some((s) => s.value === params.get('sort')) ? params.get('sort') : 'popular';

  const update = useCallback(
    (patch) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(patch)) {
            next.delete(key);
            (Array.isArray(value) ? value : [value]).forEach((v) => {
              if (v !== '' && v != null) next.append(key, v);
            });
          }
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  // Keep the text field responsive while the URL catches up.
  const [qInput, setQInput] = useState(q);
  useEffect(() => setQInput(q), [q]);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const categoryKey = categories.join('|');
  const results = useMemo(() => {
    const tokens = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const list = destinations.filter((d) => {
      if (to && d.id !== to) return false;
      if (categories.length && !d.categories.some((c) => categories.includes(c))) return false;
      if (region && d.region !== region) return false;
      if (minPriceFor(d.id) > maxPrice) return false;
      return tokens.every((t) => SEARCH_TEXT[d.id].includes(t));
    });
    return [...list].sort(COMPARE[sort]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, to, categoryKey, region, maxPrice, sort]);

  const budgetActive = maxPrice < PRICE_BOUNDS.max;
  const activeCount =
    (q.trim() ? 1 : 0) + (from ? 1 : 0) + (to ? 1 : 0) + categories.length + (region ? 1 : 0) + (budgetActive ? 1 : 0);

  const clearAll = () => update({ q: '', from: '', to: '', category: [], region: '', max: '' });
  const toggleCategory = (c) =>
    update({ category: categories.includes(c) ? categories.filter((x) => x !== c) : [...categories, c] });

  const activeChips = [
    ...(q.trim() ? [{ key: 'q', label: `“${q.trim()}”`, clear: () => update({ q: '' }) }] : []),
    ...(from ? [{ key: 'from', label: `From ${from}`, clear: () => update({ from: '' }) }] : []),
    ...(to
      ? [{
          key: 'to',
          label: `To ${destinations.find((destination) => destination.id === to).name}`,
          clear: () => update({ to: '' }),
        }]
      : []),
    ...categories.map((c) => ({
      key: `c-${c}`,
      label: c,
      clear: () => update({ category: categories.filter((x) => x !== c) }),
    })),
    ...(region ? [{ key: 'r', label: region, clear: () => update({ region: '' }) }] : []),
    ...(budgetActive ? [{ key: 'm', label: `Up to ${money(maxPrice)}`, clear: () => update({ max: '' }) }] : []),
  ];

  return (
    <div className="container-page py-10 lg:py-14">
      <h1 className="display-lg">Destinations</h1>
      <p className="mt-3 max-w-[56ch] text-lg">
        Explore Andhra Pradesh destinations and guided trips, with all prices in Indian Rupees (INR).
      </p>

      <div className="mt-6 grid gap-4 rounded-[14px] border border-line bg-white p-4 sm:grid-cols-2">
        <SelectField
          id="route-from"
          label="From"
          value={from || DEFAULT_ORIGIN}
          onChange={(e) => update({ from: e.target.value })}
        >
          {ORIGIN_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
        </SelectField>
        <SelectField id="route-to" label="To" value={to} onChange={(e) => update({ to: e.target.value })}>
          <option value="">Any Andhra destination</option>
          {destinations.map((destination) => (
            <option key={destination.id} value={destination.id}>{destination.name}</option>
          ))}
        </SelectField>
      </div>

      <div className="mt-8 flex gap-3">
        <div className="relative flex-1">
          <label htmlFor="dest-search" className="sr-only">
            Search destinations
          </label>
          <IconSearch size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mute" />
          <input
            id="dest-search"
            type="search"
            value={qInput}
            onChange={(e) => {
              setQInput(e.target.value);
              update({ q: e.target.value.trim() ? e.target.value : '' });
            }}
            placeholder="Search Andhra Pradesh places or trip types"
            className="input pl-12"
          />
        </div>
        <button
          type="button"
          className="btn btn-secondary relative lg:hidden"
          aria-expanded={filtersOpen}
          aria-controls="filters"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <IconSliders size={20} />
          Filters
          {activeCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-action px-1.5 text-xs font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-12">
        <aside
          id="filters"
          aria-label="Filters"
          className={`${filtersOpen ? 'block' : 'hidden'} space-y-7 rounded-[14px] border border-line bg-white p-5 lg:block lg:self-start lg:border-0 lg:bg-transparent lg:p-0`}
        >
          <fieldset>
            <legend className="mb-3 text-[15px] font-semibold text-ink">Type of trip</legend>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="chip"
                  aria-pressed={categories.includes(c)}
                  onClick={() => toggleCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </fieldset>

          <SelectField
            id="region"
            label="Region"
            value={region}
            onChange={(e) => update({ region: e.target.value })}
          >
            <option value="">All regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </SelectField>

          <div>
            <label htmlFor="budget" className="mb-1 block text-[15px] font-semibold text-ink">
              Budget per adult
            </label>
            <p className="mb-3 text-sm text-mute" aria-live="polite">
              Trips from {money(PRICE_BOUNDS.min)} up to <span className="font-semibold text-ink">{money(maxPrice)}</span>
            </p>
            <input
              id="budget"
              type="range"
              min={PRICE_BOUNDS.min}
              max={PRICE_BOUNDS.max}
              step={100}
              value={maxPrice}
              onChange={(e) => update({ max: Number(e.target.value) >= PRICE_BOUNDS.max ? '' : e.target.value })}
              className="h-2 w-full cursor-pointer accent-action"
            />
            <div className="mt-1 flex justify-between text-xs text-mute">
              <span>{money(PRICE_BOUNDS.min)}</span>
              <span>{money(PRICE_BOUNDS.max)}</span>
            </div>
          </div>

          {activeCount > 0 && (
            <button type="button" className="btn btn-secondary btn-sm w-full" onClick={clearAll}>
              Clear all filters
            </button>
          )}
        </aside>

        <section aria-label="Results">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p role="status" aria-live="polite" className="text-[15px] font-semibold text-ink">
              {plural(results.length, 'destination')}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-mute">
                Sort by
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => update({ sort: e.target.value === 'popular' ? '' : e.target.value })}
                className="h-10 rounded-[10px] border border-line bg-white px-3 text-sm font-medium text-ink"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeChips.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Active filters">
              {activeChips.map((chip) => (
                <li key={chip.key}>
                  <button
                    type="button"
                    onClick={chip.clear}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full bg-action-soft pl-3 pr-2 text-sm font-medium text-action-dark transition duration-200 hover:bg-[#d8ddf8] active:scale-95"
                    aria-label={`Remove filter ${chip.label}`}
                  >
                    {chip.label}
                    <IconX size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6">
            {results.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:gap-x-6">
                {results.map((d) => (
                  <DestinationCard key={d.id} destination={d} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={IconSearch}
                title="No destinations match"
                action={
                  <button type="button" className="btn btn-primary" onClick={clearAll}>
                    Clear all filters
                  </button>
                }
              >
                Try a different spelling, remove a filter or raise your budget.
              </EmptyState>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
