import { todayISO, toISODate } from '../lib/format.js';

export const FLIGHT_CITIES = [
  { city: 'Delhi', code: 'DEL', airport: 'Indira Gandhi International Airport' },
  { city: 'Bengaluru', code: 'BLR', airport: 'Kempegowda International Airport' },
  { city: 'Mumbai', code: 'BOM', airport: 'Chhatrapati Shivaji Maharaj International Airport' },
  { city: 'Hyderabad', code: 'HYD', airport: 'Rajiv Gandhi International Airport' },
  { city: 'Chennai', code: 'MAA', airport: 'Chennai International Airport' },
  { city: 'Kolkata', code: 'CCU', airport: 'Netaji Subhas Chandra Bose International Airport' },
  { city: 'Visakhapatnam', code: 'VTZ', airport: 'Visakhapatnam International Airport' },
  { city: 'Vijayawada', code: 'VGA', airport: 'Vijayawada International Airport' },
];

const CARRIERS = [
  { name: 'IndiGo', code: '6E', color: '#173b74', fare: 5899, departure: '06:10', arrival: '08:55', duration: '2h 45m' },
  { name: 'Air India', code: 'AI', color: '#ad1f32', fare: 6840, departure: '09:25', arrival: '12:10', duration: '2h 45m' },
  { name: 'Akasa Air', code: 'QP', color: '#813b64', fare: 6210, departure: '13:40', arrival: '16:35', duration: '2h 55m' },
  { name: 'IndiGo', code: '6E', color: '#173b74', fare: 5520, departure: '18:20', arrival: '21:15', duration: '2h 55m' },
];

const shiftTime = (time, minutes) => {
  const [hours, mins] = time.split(':').map(Number);
  const shifted = (hours * 60 + mins + minutes) % (24 * 60);
  return `${String(Math.floor(shifted / 60)).padStart(2, '0')}:${String(shifted % 60).padStart(2, '0')}`;
};

const routeSeed = (fromCode, toCode) =>
  [...`${fromCode}${toCode}`].reduce((seed, character) => (seed * 31 + character.charCodeAt(0)) % 997, 7);

export function getFlights(fromCode, toCode) {
  const seed = routeSeed(fromCode, toCode);
  const directionOffset = fromCode.localeCompare(toCode) > 0 ? 50 : 0;
  return CARRIERS.map((carrier, index) => ({
    ...carrier,
    id: `${fromCode}-${toCode}-${index}`,
    flightNumber: `${carrier.code} ${1000 + ((seed + index * 137) % 9000)}`,
    departure: shiftTime(carrier.departure, directionOffset),
    arrival: shiftTime(carrier.arrival, directionOffset),
    price: carrier.fare + (seed % 250),
  }));
}

export function getReturnFlight(flight, search) {
  if (search.tripType !== 'round') return null;
  const index = Number(flight.id.split('-').at(-1));
  if (!Number.isInteger(index) || index < 0 || index >= CARRIERS.length) return null;
  return getFlights(search.to.code, search.from.code)[index];
}

export function flightSearchFromParams(params) {
  const from = FLIGHT_CITIES.find((city) => city.code === params.get('from'));
  const to = FLIGHT_CITIES.find((city) => city.code === params.get('to'));
  const adults = Number(params.get('adults') || 1);
  const children = Number(params.get('children') || 0);
  const cabin = params.get('cabin') || 'Economy';
  const tripType = params.get('trip') === 'round' ? 'round' : 'one-way';
  const fare = params.get('fare') || 'regular';
  const priceProtection = params.get('protection') === 'true';
  const departureDate = params.get('depart') || '';
  const returnDate = params.get('return') || '';
  const isDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00`);
    return Number.isFinite(date.getTime()) && toISODate(date) === value;
  };
  if (!from || !to || from.code === to.code || !isDate(departureDate) || departureDate < todayISO()) return null;
  if (!Number.isInteger(adults) || adults < 1 || adults > 9) return null;
  if (!Number.isInteger(children) || children < 0 || adults + children > 9) return null;
  if (!['Economy', 'Premium Economy', 'Business'].includes(cabin)) return null;
  if (!['regular', 'student', 'armed', 'senior', 'doctor'].includes(fare)) return null;
  if (tripType === 'round' && (!isDate(returnDate) || returnDate < departureDate)) return null;
  return { from, to, adults, children, cabin, tripType, departureDate, returnDate, fare, priceProtection };
}

export function flightSearchParams(search) {
  const params = new URLSearchParams({
    from: search.from.code,
    to: search.to.code,
    depart: search.departureDate,
    adults: String(search.adults),
    children: String(search.children),
    cabin: search.cabin,
    trip: search.tripType,
    fare: search.fare || 'regular',
  });
  if (search.tripType === 'round' && search.returnDate) params.set('return', search.returnDate);
  if (search.priceProtection) params.set('protection', 'true');
  return params;
}
