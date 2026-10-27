import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readJSON, writeJSON } from '../lib/storage.js';

const STORAGE_KEY = 'tern:bookings:v1';

const isBooking = (b) =>
  b &&
  typeof b === 'object' &&
  typeof b.id === 'string' &&
  typeof b.departure === 'string' &&
  typeof b.days === 'number' &&
  b.pricing &&
  typeof b.pricing.total === 'number';

function load() {
  const data = readJSON(STORAGE_KEY, []);
  return Array.isArray(data) ? data.filter(isBooking) : [];
}

const REF_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L

export function makeBookingId(existing = []) {
  let id;
  do {
    const bytes = new Uint8Array(6);
    window.crypto.getRandomValues(bytes);
    id = `MYA-${[...bytes].map((b) => REF_ALPHABET[b % REF_ALPHABET.length]).join('')}`;
  } while (existing.includes(id));
  return id;
}

const BookingsContext = createContext(null);

export function BookingsProvider({ children }) {
  const [bookings, setBookings] = useState(load);
  const [storageOk, setStorageOk] = useState(true);

  // Persist on every change.
  useEffect(() => {
    setStorageOk(writeJSON(STORAGE_KEY, bookings));
  }, [bookings]);

  // Keep several tabs in step.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setBookings(load());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addBooking = useCallback((booking) => {
    setBookings((prev) => [booking, ...prev]);
  }, []);

  const cancelBooking = useCallback((id) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id && b.status === 'confirmed'
          ? { ...b, status: 'cancelled', cancelledAt: new Date().toISOString() }
          : b,
      ),
    );
  }, []);

  const removeBooking = useCallback((id) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const value = useMemo(
    () => ({ bookings, storageOk, addBooking, cancelBooking, removeBooking }),
    [bookings, storageOk, addBooking, cancelBooking, removeBooking],
  );

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error('useBookings must be used inside <BookingsProvider>');
  return ctx;
}
