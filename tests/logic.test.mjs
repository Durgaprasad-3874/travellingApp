import assert from 'node:assert/strict';
const S = new URL('../src/', import.meta.url).href;
const { destinations, packages, getDestination, packagesFor, minPriceFor, PRICE_BOUNDS, CATEGORIES, REGIONS } = await import(S + 'data/index.js');
const { reviewsFor } = await import(S + 'data/reviews.js');
const { getDepartures } = await import(S + 'lib/departures.js');
const { calcQuote, findPromo, ADD_ONS } = await import(S + 'lib/pricing.js');
const { validateBooking, travelerLimit } = await import(S + 'lib/validation.js');
const { FLIGHT_CITIES, getFlights, getReturnFlight, flightSearchFromParams, flightSearchParams } = await import(S + 'data/flights.js');
const { flightQuote } = await import(S + 'lib/flightPricing.js');
const { HOTELS, getHotel, getHotels, hotelSearchFromParams, hotelSearchParams } = await import(S + 'data/hotels.js');
const { hotelQuote } = await import(S + 'lib/hotelPricing.js');
const F = await import(S + 'lib/format.js');
const { reviewsFor: _r, hotelReviewsFor } = await import(S + 'data/reviews.js');
const { validateReview } = await import(S + 'lib/userReviews.js');
const { isValidMobile, maskMobile, createChallenge, verifyChallenge } = await import(S + 'lib/otp.js');

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok  ', name); };

t('data: unique ids, every package has a destination, every destination has a package', () => {
  assert.equal(new Set(packages.map(p => p.id)).size, packages.length);
  assert.equal(new Set(destinations.map(d => d.id)).size, destinations.length);
  for (const p of packages) assert.ok(getDestination(p.destinationId), p.id);
  for (const d of destinations) assert.ok(packagesFor(d.id).length >= 1, d.id);
});
t('data: itinerary length equals days; required fields present', () => {
  for (const p of packages) {
    assert.equal(p.itinerary.length, p.days, `${p.id}: ${p.itinerary.length} itinerary days vs ${p.days}`);
    assert.ok(p.highlights.length >= 3 && p.included.length >= 3 && p.excluded.length >= 3, p.id);
    assert.ok(p.price > 0 && p.groupSize >= 2, p.id);
    assert.ok(['Easy', 'Moderate', 'Challenging'].includes(p.difficulty), p.id);
    for (const day of p.itinerary) assert.ok(day.title && day.text, p.id);
  }
});
t('data: categories/regions valid, palettes complete, scenes known', () => {
  const scenes = new Set(['sea','dome','peaks','skyline','pagoda','dunes','terraces','savanna','aurora']);
  const keys = ['sky','sky2','sun','far','mid','near','accent','accent2'];
  for (const d of destinations) {
    assert.ok(REGIONS.includes(d.region), d.id);
    for (const c of d.categories) assert.ok(CATEGORIES.includes(c), d.id + c);
    assert.ok(scenes.has(d.art.scene), d.id);
    for (const k of keys) assert.match(d.art.palette[k], /^#[0-9A-Fa-f]{6}$/, d.id + k);
  }
  assert.ok(destinations.every(d => d.country === 'Andhra Pradesh, India'));
  assert.equal(destinations.length, 10);
  assert.equal(destinations.filter(d => d.popular).length, 5);
  assert.equal(packages.filter(p => p.featured).length, 6);
});
t('data: price bounds and per-destination minimums', () => {
  assert.equal(PRICE_BOUNDS.min, 9900); assert.equal(PRICE_BOUNDS.max, 18000);
  assert.equal(minPriceFor('visakhapatnam'), 12999); assert.equal(minPriceFor('araku-valley'), 16999);
});
t('flights: routes have stable sample options and unique ids', () => {
  const options = getFlights('DEL', 'BLR');
  assert.equal(FLIGHT_CITIES.length, 8);
  assert.equal(options.length, 4);
  assert.equal(new Set(options.map(flight => flight.id)).size, options.length);
  assert.ok(options.every(flight => flight.price > 0 && flight.flightNumber && flight.duration));
  assert.notEqual(options[0].id, getFlights('BLR', 'DEL')[0].id);
});
t('flights: round trips pair a distinct reverse-route sample flight', () => {
  const outbound = getFlights('DEL', 'BLR')[0];
  const search = {
    from: FLIGHT_CITIES.find(city => city.code === 'DEL'),
    to: FLIGHT_CITIES.find(city => city.code === 'BLR'),
    tripType: 'round',
  };
  const inbound = getReturnFlight(outbound, search);
  assert.equal(inbound.id, 'BLR-DEL-0');
  assert.notEqual(inbound.flightNumber, outbound.flightNumber);
  assert.notEqual(inbound.price, outbound.price);
  assert.notEqual(inbound.departure, outbound.departure);
  assert.equal(getReturnFlight(outbound, { ...search, tripType: 'one-way' }), null);
});
t('flights: search query encodes and validates passenger, trip and fare choices', () => {
  const search = {
    from: FLIGHT_CITIES.find(city => city.code === 'DEL'),
    to: FLIGHT_CITIES.find(city => city.code === 'BLR'),
    departureDate: '2027-01-12',
    returnDate: '2027-01-19',
    adults: 2,
    children: 1,
    cabin: 'Premium Economy',
    tripType: 'round',
    fare: 'student',
    priceProtection: true,
  };
  assert.deepEqual(flightSearchFromParams(flightSearchParams(search)), search);
  assert.equal(flightSearchFromParams(new URLSearchParams('from=DEL&to=DEL&depart=2027-01-12')), null);
  assert.equal(flightSearchFromParams(new URLSearchParams('from=DEL&to=BLR&depart=2027-01-12&adults=0')), null);
  assert.equal(flightSearchFromParams(new URLSearchParams('from=DEL&to=BLR&depart=2027-01-12&trip=round')), null);
  assert.equal(flightSearchFromParams(new URLSearchParams('from=DEL&to=BLR&depart=2027-02-30')), null);
  assert.equal(flightSearchFromParams(new URLSearchParams('from=DEL&to=BLR&depart=2026-10-25')), null);
});
t('flights: fare quote includes passengers, return trip, special fare and optional protection', () => {
  const flight = getFlights('DEL', 'BLR')[0];
  const search = { adults: 2, children: 1, cabin: 'Economy', tripType: 'one-way', fare: 'regular', priceProtection: false };
  const oneWay = flightQuote(flight, search);
  assert.equal(oneWay.travelers, 3);
  assert.equal(oneWay.total, Math.round(oneWay.baseFare * 1.05));
  const returnFlight = getReturnFlight(flight, {
    from: FLIGHT_CITIES.find(city => city.code === 'DEL'),
    to: FLIGHT_CITIES.find(city => city.code === 'BLR'),
    tripType: 'round',
  });
  const enhanced = flightQuote(flight, { ...search, tripType: 'round', fare: 'student', priceProtection: true }, returnFlight);
  const roundTrip = flightQuote(flight, { ...search, tripType: 'round', fare: 'regular' }, returnFlight);
  assert.equal(roundTrip.baseFare, roundTrip.outboundTotal + roundTrip.returnTotal);
  assert.ok(roundTrip.returnTotal > 0);
  assert.ok(enhanced.total > oneWay.total);
  assert.equal(enhanced.protection, 897);
  assert.ok(enhanced.discount > 0);
});
t('hotels: named stays are unique and grouped by destination', () => {
  assert.equal(new Set(HOTELS.map(hotel => hotel.id)).size, HOTELS.length);
  assert.equal(new Set(HOTELS.map(hotel => hotel.name)).size, HOTELS.length);
  for (const destination of destinations) assert.ok(getHotels(destination.id).length >= 1, destination.name);
  assert.equal(getHotel('vizag-harbor-view').name, 'Harbor View Visakhapatnam');
});
t('hotels: search parameters preserve valid dates, rooms and guest counts', () => {
  const search = {
    destination: destinations.find(destination => destination.id === 'visakhapatnam'),
    checkIn: '2027-01-12',
    checkOut: '2027-01-15',
    guests: 3,
    rooms: 1,
  };
  assert.deepEqual(hotelSearchFromParams(hotelSearchParams(search)), search);
  assert.equal(hotelSearchFromParams(new URLSearchParams('destination=visakhapatnam&checkIn=2027-02-30&checkOut=2027-03-02&guests=2&rooms=1')), null);
  assert.equal(hotelSearchFromParams(new URLSearchParams('destination=visakhapatnam&checkIn=2027-01-12&checkOut=2027-01-12&guests=2&rooms=1')), null);
  assert.equal(hotelSearchFromParams(new URLSearchParams('destination=visakhapatnam&checkIn=2027-01-12&checkOut=2027-01-15&guests=5&rooms=1')), null);
});
t('hotels: quote totals nights, rooms and estimated taxes', () => {
  const hotel = getHotel('vizag-harbor-view');
  const quote = hotelQuote(hotel, { checkIn: '2027-01-12', checkOut: '2027-01-15', rooms: 2 });
  assert.equal(quote.nights, 3);
  assert.equal(quote.roomTotal, hotel.price * 6);
  assert.equal(quote.taxes, Math.round(quote.roomTotal * 0.12));
  assert.equal(quote.total, quote.roomTotal + quote.taxes);
});
t('reviews: three distinct per package', () => {
  for (const p of packages) { const r = reviewsFor(p.id); assert.equal(r.length, 3); assert.equal(new Set(r.map(x => x.name)).size, 3, p.id); }
});
t('departures: Saturdays, 14 days apart, 3+ weeks out (fixed date)', () => {
  const d = getDepartures(8, new Date(2026, 9, 23)); // Fri 23 Oct 2026
  assert.equal(d[0], '2026-11-14'); assert.equal(d.length, 8);
  for (let i = 0; i < d.length; i++) {
    assert.equal(F.parseISODate(d[i]).getDay(), 6);
    if (i) assert.equal(Math.round((F.parseISODate(d[i]) - F.parseISODate(d[i-1])) / 864e5), 14);
  }
});
t('departures: stable across DST changes and for every weekday start', () => {
  for (let day = 0; day < 400; day++) {
    const from = new Date(2026, 0, 1 + day);
    const d = getDepartures(8, from);
    assert.ok(F.parseISODate(d[0]) - from >= 21 * 864e5 - 36e5, 'at least ~3 weeks out ' + F.toISODate(from));
    for (const iso of d) assert.equal(F.parseISODate(iso).getDay(), 6, iso);
  }
});
t('dates: range and end date', () => {
  assert.equal(F.tripEndISO('2026-11-14', 6), '2026-11-19');
  assert.equal(F.tripEndISO('2026-12-28', 9), '2027-01-05');
  console.log('     range:', F.formatRange('2026-11-14', 6), '|', F.formatRange('2026-12-28', 9), '|', F.formatDate('2026-11-14'));
  assert.equal(F.formatDate('2026-11-14').includes('Nov'), true);
});
t('format: money', () => {
  assert.equal(F.money(12999), '₹12,999'); assert.equal(F.money(1043.5), '₹1,043.50'); assert.equal(F.moneyExact(2980), '₹2,980.00');
  assert.equal(F.plural(1, 'traveler'), '1 traveler'); assert.equal(F.plural(3, 'traveler'), '3 travelers');
});
t('pricing: worked example (2 adults + 1 child + both add-ons + ANDHRA10)', () => {
  const pkg = packages.find(p => p.id === 'visakhapatnam-coast-and-caves');
  const q = calcQuote({ pkg, adults: 2, children: 1, addOns: ['insurance', 'transfer'], promoCode: 'andhra10 ' });
  assert.equal(q.tripTotal, 35097.3); assert.equal(q.discount, 3509.73); assert.equal(q.addOnsTotal, 2396);
  assert.equal(q.taxes, 2378.85); assert.equal(q.total, 36362.42); assert.equal(q.promoCode, 'ANDHRA10');
  console.log('     lines:', q.lines.map(l => `${l.label} ${l.amount}`).join(' | '));
});
t('pricing: lines always sum to the total (all packages, many combos, no float noise)', () => {
  for (const pkg of packages) for (let a = 1; a <= 6; a++) for (let c = 0; c <= 4; c++) for (const ao of [[], ['insurance'], ['transfer'], ['insurance','transfer']]) for (const promo of ['', 'ANDHRA10', 'nope']) {
    const q = calcQuote({ pkg, adults: a, children: c, addOns: ao, promoCode: promo });
    const sumC = q.lines.reduce((s, l) => s + Math.round(l.amount * 100), 0);
    assert.equal(sumC, Math.round(q.total * 100), `${pkg.id} ${a}/${c} ${ao} ${promo}`);
    assert.equal(Math.round(q.total * 100) / 100, q.total);
    assert.equal(q.travelers, a + c);
  }
});
t('pricing: bad input and invalid promo are handled', () => {
  const pkg = packages[0];
  assert.equal(calcQuote({ pkg, adults: 'x', children: -3 }).total, 0);
  assert.equal(findPromo('SAVE50'), null);
  assert.equal(calcQuote({ pkg, adults: 1, children: 0, promoCode: 'SAVE50' }).discount, 0);
});

const departures = getDepartures();
const ok = { fullName: 'Priya Nair', email: 'priya@example.com', phone: '+91 98765 43210', departure: departures[0], adults: 2, children: 1, terms: true };
const check = (over) => validateBooking({ ...ok, ...over }, { departures, maxTravelers: 10 });
t('validation: valid form passes', () => assert.deepEqual(check({}), {}));
t('validation: name rules', () => {
  assert.ok(check({ fullName: '' }).fullName); assert.ok(check({ fullName: 'Priya' }).fullName);
  assert.ok(check({ fullName: 'R2D2 Bot' }).fullName); assert.ok(check({ fullName: '  ' }).fullName);
  assert.deepEqual(check({ fullName: "Mary-Anne O'Neil" }), {}); assert.deepEqual(check({ fullName: 'José Álvarez' }), {});
});
t('validation: email rules', () => {
  for (const e of ['', 'a', 'a@b', 'a@b.c', 'a b@c.com', '@x.com']) assert.ok(check({ email: e }).email, e);
  assert.deepEqual(check({ email: ' a.b+c@sub.example.co ' }), {});
});
t('validation: phone rules', () => {
  for (const p of ['', '12345', 'abcdefghij', '1'.repeat(16), '555-CALL-NOW']) assert.ok(check({ phone: p }).phone, p);
  for (const p of ['+1 (555) 010-9999', '020 7946 0958', '9876543210']) assert.deepEqual(check({ phone: p }), {}, p);
});
t('validation: departure, travelers, terms', () => {
  assert.ok(check({ departure: '' }).departure); assert.ok(check({ departure: '2020-01-04' }).departure);
  assert.ok(check({ adults: 0 }).adults); assert.ok(check({ adults: 1.5 }).adults); assert.ok(check({ children: -1 }).children);
  assert.ok(check({ adults: 8, children: 3 }).adults);
  assert.deepEqual(check({ adults: 8, children: 2 }), {});
  assert.ok(check({ terms: false }).terms);
  assert.equal(travelerLimit({ groupSize: 8 }), 8); assert.equal(travelerLimit({ groupSize: 16 }), 10);
});
t('validation: reports every error at once', () => {
  const e = validateBooking({ fullName: '', email: '', phone: '', departure: '', adults: 0, children: 0, terms: false }, { departures, maxTravelers: 10 });
  assert.deepEqual(Object.keys(e).sort(), ['adults', 'departure', 'email', 'fullName', 'phone', 'terms']);
});
t('otp: mobile validation and masking', () => {
  assert.ok(isValidMobile('98765 43210')); assert.ok(isValidMobile('+91 9876543210'));
  assert.ok(!isValidMobile('1234567890')); assert.ok(!isValidMobile('98765'));
  assert.equal(maskMobile('9876543210'), '+91 98******10');
});
t('otp: verify, wrong attempts, expiry', () => {
  const c = createChallenge('9876543210', 1000, () => 0);
  assert.equal(c.code, '100000');
  assert.ok(verifyChallenge(c, '100000', 2000).ok);
  const bad = verifyChallenge(c, '000000', 2000);
  assert.ok(!bad.ok && bad.challenge.attempts === 1);
  let cur = c;
  for (let i = 0; i < 5; i++) cur = verifyChallenge(cur, '000000', 2000).challenge ?? cur;
  assert.ok(verifyChallenge(cur, '100000', 2000).locked);
  assert.ok(verifyChallenge(c, '100000', 1000 + 5 * 60 * 1000 + 1).expired);
});
t('reviews: validation and hotel samples', () => {
  assert.ok(validateReview({ rating: 0, text: 'long enough text' }));
  assert.ok(validateReview({ rating: 5, text: 'short' }));
  assert.equal(validateReview({ rating: 4, text: 'Lovely quiet stay.' }), '');
  assert.equal(hotelReviewsFor('araku-coffee-grove').length, 3);
  assert.deepEqual(hotelReviewsFor('x'), hotelReviewsFor('x'));
});
console.log(`\n${n} test groups passed`);
