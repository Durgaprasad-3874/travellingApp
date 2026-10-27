import { readJSON, writeJSON } from './storage.js';

const STORAGE_KEY = 'mana-yatra:hotel-bookings:v1';

const isHotelBooking = (booking) =>
  booking &&
  typeof booking === 'object' &&
  typeof booking.id === 'string' &&
  typeof booking.hotelId === 'string' &&
  typeof booking.hotelName === 'string' &&
  typeof booking.checkIn === 'string' &&
  typeof booking.checkOut === 'string' &&
  typeof booking.total === 'number';

export function readHotelBookings() {
  const saved = readJSON(STORAGE_KEY, []);
  return Array.isArray(saved) ? saved.filter(isHotelBooking) : [];
}

export function saveHotelBooking(booking) {
  return writeJSON(STORAGE_KEY, [booking, ...readHotelBookings()]);
}
