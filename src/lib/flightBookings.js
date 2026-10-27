import { readJSON, writeJSON } from './storage.js';

const STORAGE_KEY = 'mana-yatra:flight-bookings:v1';

const isFlightBooking = (booking) =>
  booking &&
  typeof booking === 'object' &&
  typeof booking.id === 'string' &&
  typeof booking.from === 'string' &&
  typeof booking.to === 'string' &&
  typeof booking.departureDate === 'string' &&
  typeof booking.passengerName === 'string' &&
  typeof booking.total === 'number';

export function readFlightBookings() {
  const saved = readJSON(STORAGE_KEY, []);
  return Array.isArray(saved) ? saved.filter(isFlightBooking) : [];
}

export function saveFlightBooking(booking) {
  const bookings = readFlightBookings();
  return writeJSON(STORAGE_KEY, [booking, ...bookings]);
}
