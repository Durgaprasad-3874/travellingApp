const inr0 = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  currencyDisplay: 'symbol',
  maximumFractionDigits: 0,
});
const inr2 = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  currencyDisplay: 'symbol',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** ₹12,999 for whole rupee amounts and paise when needed. */
export const money = (n) => (Number.isInteger(n) ? inr0.format(n) : inr2.format(n));

/** Always include paise in totals. */
export const moneyExact = (n) => inr2.format(n);

export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

// Dates are stored as "YYYY-MM-DD" strings and always parsed in local time,
// so a departure never shifts by a day across time zones.
export const toISODate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const parseISODate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (date, n) => {
  const r = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  r.setDate(r.getDate() + n);
  return r;
};

export const todayISO = () => toISODate(new Date());

const longDate = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const rangeDate = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export const formatDate = (iso) => longDate.format(parseISODate(iso));

/** Last day of a trip that starts on `iso` and lasts `days` days. */
export const tripEndISO = (iso, days) => toISODate(addDays(parseISODate(iso), days - 1));

/** "14 Nov to 20 Nov 2026" style range. */
export const formatRange = (iso, days) => {
  const start = parseISODate(iso);
  const end = addDays(start, days - 1);
  return rangeDate.formatRange(start, end);
};
