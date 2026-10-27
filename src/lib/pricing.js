import { money, plural } from './format.js';

export const CHILD_RATE = 0.7; // children 2 to 11 pay 70% of the adult price
export const TAX_RATE = 0.07;

export const ADD_ONS = [
  {
    id: 'insurance',
    label: 'Travel insurance',
    description: 'Medical and trip-cancellation cover for every traveler.',
    price: 299,
    unit: 'traveler',
  },
  {
    id: 'transfer',
    label: 'Private local transfer',
    description: 'A local driver takes your group between the listed trip stops.',
    price: 1499,
    unit: 'booking',
  },
];

export const PROMOS = {
  ANDHRA10: { rate: 0.1, label: '10% off the trip price' },
};

export const normalizeCode = (code) => String(code ?? '').trim().toUpperCase();

export function findPromo(code) {
  const key = normalizeCode(code);
  return PROMOS[key] ? { code: key, ...PROMOS[key] } : null;
}

const toPaise = (rupees) => Math.round(rupees * 100);
const toInt = (v) => (Number.isFinite(Number(v)) ? Math.max(0, Math.floor(Number(v))) : 0);

/**
 * Price a booking. All maths is done in whole cents, then converted back to
 * rupees, so totals never show floating-point noise.
 */
export function calcQuote({ pkg, adults, children, addOns = [], promoCode = '' }) {
  const a = toInt(adults);
  const c = toInt(children);
  const travelers = a + c;

  const adultUnit = toPaise(pkg.price);
  const childUnit = Math.round(adultUnit * CHILD_RATE);

  const adultsC = adultUnit * a;
  const childrenC = childUnit * c;
  const tripC = adultsC + childrenC;

  const addOnLines = ADD_ONS.filter((x) => addOns.includes(x.id)).map((x) => {
    const qty = x.unit === 'traveler' ? travelers : 1;
    return {
      key: x.id,
      label: x.unit === 'traveler' ? `${x.label} (${plural(qty, 'traveler')})` : x.label,
      amountC: toPaise(x.price) * qty,
    };
  });
  const addOnsC = addOnLines.reduce((sum, l) => sum + l.amountC, 0);

  const promo = findPromo(promoCode);
  const discountC = promo ? Math.round(tripC * promo.rate) : 0;

  const taxableC = tripC - discountC + addOnsC;
  const taxesC = Math.round(taxableC * TAX_RATE);
  const totalC = taxableC + taxesC;

  const lines = [];
  if (a > 0) {
    lines.push({ key: 'adults', label: `Adults (${a} × ${fmt(adultUnit)})`, amountC: adultsC });
  }
  if (c > 0) {
    lines.push({ key: 'children', label: `Children (${c} × ${fmt(childUnit)})`, amountC: childrenC });
  }
  lines.push(...addOnLines);
  if (promo && discountC > 0) {
    lines.push({ key: 'promo', label: `Promo ${promo.code}`, amountC: -discountC });
  }
  lines.push({ key: 'taxes', label: `Taxes and fees (${Math.round(TAX_RATE * 100)}%)`, amountC: taxesC });

  return {
    travelers,
    promoCode: promo ? promo.code : null,
    lines: lines.map(({ amountC, ...rest }) => ({ ...rest, amount: amountC / 100 })),
    tripTotal: tripC / 100,
    addOnsTotal: addOnsC / 100,
    discount: discountC / 100,
    taxes: taxesC / 100,
    total: totalC / 100,
  };
}

function fmt(cents) {
  return money(cents / 100);
}
