const CABIN_MULTIPLIERS = {
  Economy: 1,
  'Premium Economy': 1.4,
  Business: 2.4,
};
const FARE_DISCOUNTS = {
  regular: 0,
  student: 0.05,
  armed: 0.08,
  senior: 0.08,
  doctor: 0.05,
};

export function flightQuote(flight, search, returnFlight = null) {
  const travelers = search.adults + search.children;
  const fareEquivalent = search.adults + search.children * 0.75;
  const cabinMultiplier = CABIN_MULTIPLIERS[search.cabin] ?? 1;
  const outboundFare = Math.round(flight.price * cabinMultiplier);
  const returnFare = returnFlight ? Math.round(returnFlight.price * cabinMultiplier) : 0;
  const outboundTotal = Math.round(outboundFare * fareEquivalent);
  const returnTotal = Math.round(returnFare * fareEquivalent);
  const baseFare = outboundTotal + returnTotal;
  const discount = Math.round(baseFare * (FARE_DISCOUNTS[search.fare] ?? 0));
  const protection = search.priceProtection ? travelers * 299 : 0;
  const subtotal = baseFare - discount + protection;
  const taxes = Math.round(subtotal * 0.05);
  const total = Math.round(subtotal + taxes);
  return { travelers, outboundFare, returnFare, outboundTotal, returnTotal, baseFare, discount, protection, taxes, total };
}
