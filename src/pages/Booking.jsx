import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import Poster from '../components/ui/Poster.jsx';
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx';
import PriceLines from '../components/ui/PriceLines.jsx';
import Stepper from '../components/ui/Stepper.jsx';
import { FieldError, SelectField, TextField } from '../components/ui/Field.jsx';
import NotFound from './NotFound.jsx';
import { useBookings, makeBookingId } from '../context/BookingsContext.jsx';
import { getDestination, getPackage } from '../data/index.js';
import { getDepartures } from '../lib/departures.js';
import { formatRange, money, plural } from '../lib/format.js';
import { ADD_ONS, CHILD_RATE, calcQuote, findPromo } from '../lib/pricing.js';
import { travelerLimit, validateBooking } from '../lib/validation.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

// The order errors are focused in, and the element that receives focus for each.
const FOCUS_ORDER = [
  ['departure', 'departure'],
  ['adults', 'adults-inc'],
  ['children', 'children-inc'],
  ['fullName', 'fullName'],
  ['email', 'email'],
  ['phone', 'phone'],
  ['terms', 'terms'],
];

const clampInt = (value, min, max, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

export default function Booking() {
  const { packageId } = useParams();
  const pkg = getPackage(packageId);
  const destination = pkg ? getDestination(pkg.destinationId) : null;
  useDocumentTitle(pkg ? `Book ${pkg.title}` : 'Trip not found');

  if (!pkg || !destination) return <NotFound title="We can’t find that trip" />;
  return <BookingForm key={pkg.id} pkg={pkg} destination={destination} />;
}

function BookingForm({ pkg, destination: d }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { bookings, addBooking } = useBookings();

  const departures = useMemo(() => getDepartures(), []);
  const limit = travelerLimit(pkg);

  // The trip page links here with ?date=&adults=&children= to prefill the form.
  const [values, setValues] = useState(() => {
    const date = params.get('date');
    const adults = clampInt(params.get('adults'), 1, limit, 2);
    const children = clampInt(params.get('children'), 0, limit - adults, 0);
    return {
      fullName: '',
      email: '',
      phone: '',
      departure: departures.includes(date) ? date : '',
      adults,
      children,
      addOns: [],
      requests: '',
      terms: false,
    };
  });
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState({ code: '', ok: false, message: '' });

  const errors = useMemo(
    () => validateBooking(values, { departures, maxTravelers: limit }),
    [values, departures, limit],
  );
  const errorCount = Object.keys(errors).length;
  const show = (name) => (touched[name] || attempted ? errors[name] : undefined);

  const setField = (name, value) => setValues((v) => ({ ...v, [name]: value }));
  const touch = (name) => setTouched((t) => ({ ...t, [name]: true }));
  const bind = (name) => ({
    value: values[name],
    onChange: (e) => setField(name, e.target.value),
    onBlur: () => touch(name),
    error: show(name),
  });
  const toggleAddOn = (id) =>
    setValues((v) => ({
      ...v,
      addOns: v.addOns.includes(id) ? v.addOns.filter((x) => x !== id) : [...v.addOns, id],
    }));

  const quote = calcQuote({
    pkg,
    adults: values.adults,
    children: values.children,
    addOns: values.addOns,
    promoCode: promo.code,
  });

  const applyPromo = () => {
    const typed = promoInput.trim();
    const found = findPromo(typed);
    if (!typed) setPromo({ code: '', ok: false, message: 'Enter a promo code.' });
    else if (!found) setPromo({ code: '', ok: false, message: `“${typed}” is not a valid code.` });
    else setPromo({ code: found.code, ok: true, message: `${found.code} applied: ${found.label}.` });
  };
  const removePromo = () => {
    setPromo({ code: '', ok: false, message: '' });
    setPromoInput('');
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;
    setAttempted(true);

    const firstInvalid = FOCUS_ORDER.find(([field]) => errors[field]);
    if (firstInvalid) {
      document.getElementById(firstInvalid[1])?.focus();
      return;
    }

    setSubmitting(true);
    const booking = {
      id: makeBookingId(bookings.map((b) => b.id)),
      packageId: pkg.id,
      packageTitle: pkg.title,
      destinationId: d.id,
      destinationName: d.name,
      country: d.country,
      days: pkg.days,
      departure: values.departure,
      adults: values.adults,
      children: values.children,
      addOns: values.addOns,
      contact: {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
      },
      requests: values.requests.trim(),
      pricing: quote,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    addBooking(booking);
    navigate('/bookings', { state: { justBooked: booking.id } });
  };

  const travelersLabel = [
    plural(values.adults, 'adult'),
    values.children > 0 ? plural(values.children, 'child', 'children') : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="container-page py-8 lg:py-12">
      <Breadcrumbs
        items={[
          { label: 'Destinations', to: '/destinations' },
          { label: d.name, to: `/destinations/${d.id}` },
          { label: pkg.title, to: `/packages/${pkg.id}` },
          { label: 'Book' },
        ]}
      />
      <h1 className="display-lg mt-4 max-w-[22ch]">Book {pkg.title}</h1>
      <p className="mt-3 max-w-[56ch] text-lg">Add your details and pick any extras. The total updates as you go.</p>

      <form
        noValidate
        onSubmit={onSubmit}
        className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px] lg:items-start lg:gap-14"
      >
        <div className="min-w-0 space-y-12">
          <section aria-labelledby="trip-title">
            <h2 id="trip-title" className="display-md">
              Your trip
            </h2>
            <div className="mt-5 space-y-6">
              <SelectField
                id="departure"
                label="Departure date"
                hint={values.departure ? `This trip runs ${formatRange(values.departure, pkg.days)}.` : undefined}
                {...bind('departure')}
              >
                <option value="">Select a date</option>
                {departures.map((iso) => (
                  <option key={iso} value={iso}>
                    {formatRange(iso, pkg.days)}
                  </option>
                ))}
              </SelectField>

              <div className="space-y-5 rounded-[14px] border border-line bg-white p-5">
                <Stepper
                  id="adults"
                  label="Adults"
                  hint="Age 12 and over"
                  value={values.adults}
                  min={1}
                  max={limit - values.children}
                  onChange={(n) => setField('adults', n)}
                  error={show('adults')}
                />
                <hr className="border-line" />
                <Stepper
                  id="children"
                  label="Children"
                  hint={`Age 2 to 11, pay ${Math.round(CHILD_RATE * 100)}%`}
                  value={values.children}
                  min={0}
                  max={limit - values.adults}
                  onChange={(n) => setField('children', n)}
                  error={show('children')}
                />
              </div>
              <p className="-mt-2 text-sm text-mute">Up to {limit} travelers per booking on this trip.</p>
            </div>
          </section>

          <section aria-labelledby="details-title">
            <h2 id="details-title" className="display-md">
              Lead traveler
            </h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <TextField
                id="fullName"
                label="Full name"
                autoComplete="name"
                placeholder="Priya Nair"
                className="sm:col-span-2"
                {...bind('fullName')}
              />
              <TextField
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="priya@example.com"
                {...bind('email')}
              />
              <TextField
                id="phone"
                label="Phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                {...bind('phone')}
              />
            </div>
          </section>

          <section aria-labelledby="extras-title">
            <h2 id="extras-title" className="display-md">
              Extras
            </h2>
            <fieldset className="mt-5 space-y-3">
              <legend className="sr-only">Optional extras</legend>
              {ADD_ONS.map((a) => {
                const checked = values.addOns.includes(a.id);
                return (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer items-start gap-4 rounded-[14px] border bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 ${
                      checked ? 'border-action ring-1 ring-action' : 'border-line hover:border-ink'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAddOn(a.id)}
                      className="mt-1 h-5 w-5 shrink-0 accent-action"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink">{a.label}</span>
                      <span className="block text-sm text-mute">{a.description}</span>
                    </span>
                    <span className="shrink-0 text-right text-[15px] font-semibold text-ink">
                      {money(a.price)}
                      <span className="block text-sm font-normal text-mute">per {a.unit}</span>
                    </span>
                  </label>
                );
              })}
            </fieldset>
          </section>

          <section aria-labelledby="notes-title">
            <h2 id="notes-title" className="display-md">
              Anything we should know?
            </h2>
            <div className="mt-5">
              <label htmlFor="requests" className="mb-1.5 block text-[15px] font-semibold text-ink">
                Special requests <span className="font-normal text-mute">(optional)</span>
              </label>
              <textarea
                id="requests"
                name="requests"
                rows={4}
                maxLength={300}
                value={values.requests}
                onChange={(e) => setField('requests', e.target.value)}
                placeholder="Dietary needs, mobility, celebrations"
                className="input h-auto resize-y py-3"
              />
              <p className="mt-1.5 text-sm text-mute">{values.requests.length} of 300 characters</p>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-[16px] border border-line bg-white">
            <div className="h-28 overflow-hidden">
              <Poster destination={d} shape="wide" className="h-full w-full" />
            </div>
            <div className="p-5 sm:p-6">
              <h2 className="font-display text-xl font-semibold leading-snug tracking-[-0.01em] text-ink">
                {pkg.title}
              </h2>
              <p className="text-sm text-mute">
                {d.name}, {d.country}
              </p>

              <dl className="mt-4 space-y-1.5 text-[15px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-mute">Dates</dt>
                  <dd className="text-right font-medium text-ink">
                    {values.departure ? formatRange(values.departure, pkg.days) : 'Not chosen yet'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-mute">Travelers</dt>
                  <dd className="text-right font-medium text-ink">{travelersLabel}</dd>
                </div>
              </dl>

              <hr className="my-4 border-line" />
              <PriceLines quote={quote} />

              <div className="mt-5 border-t border-line pt-4">
                <label htmlFor="promo" className="mb-1.5 block text-[15px] font-semibold text-ink">
                  Promo code
                </label>
                <div className="flex gap-2">
                  <input
                    id="promo"
                    value={promoInput}
                    readOnly={Boolean(promo.code)}
                    onChange={(e) => setPromoInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (!promo.code) applyPromo();
                      }
                    }}
                    placeholder="Enter a code"
                    autoComplete="off"
                    aria-describedby="promo-message"
                    className="input h-11"
                  />
                  {promo.code ? (
                    <button type="button" className="btn btn-secondary h-11 px-4" onClick={removePromo}>
                      Remove
                    </button>
                  ) : (
                    <button type="button" className="btn btn-secondary h-11 px-4" onClick={applyPromo}>
                      Apply
                    </button>
                  )}
                </div>
                <p id="promo-message" role="status" className={`mt-1.5 text-sm ${promo.ok ? 'text-ok' : 'text-danger'}`}>
                  {promo.message}
                </p>
                {!promo.message && <p className="mt-1.5 text-sm text-mute">Demo code: ANDHRA10</p>}
              </div>

              <div className="mt-5">
                <label className="flex cursor-pointer items-start gap-3 text-[15px]">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={values.terms}
                    onChange={(e) => setField('terms', e.target.checked)}
                    onBlur={() => touch('terms')}
                    aria-invalid={show('terms') ? 'true' : 'false'}
                    aria-describedby={show('terms') ? 'terms-error' : undefined}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-action"
                  />
                  <span>I confirm these details are correct.</span>
                </label>
                <FieldError id="terms-error">{show('terms')}</FieldError>
              </div>

              {attempted && errorCount > 0 && (
                <p role="alert" className="mt-4 rounded-[10px] bg-[#FBE4E4] px-3 py-2 text-sm font-medium text-danger">
                  {errorCount === 1 ? 'Fix 1 field to continue.' : `Fix ${errorCount} fields to continue.`}
                </p>
              )}

              <button type="submit" className="btn btn-primary mt-5 w-full" disabled={submitting}>
                Confirm booking
              </button>
              <p className="mt-3 text-center text-sm text-mute">This is a demo. No payment is taken.</p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
