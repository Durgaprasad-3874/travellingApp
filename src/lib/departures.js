import { addDays, toISODate } from './format.js';

/**
 * Upcoming departure dates, generated from today so the demo never goes stale.
 * Trips leave on Saturdays, every two weeks, starting at least three weeks out.
 */
export function getDepartures(count = 8, from = new Date()) {
  const earliest = addDays(from, 21);
  const untilSaturday = (6 - earliest.getDay() + 7) % 7;
  const first = addDays(earliest, untilSaturday);
  return Array.from({ length: count }, (_, i) => toISODate(addDays(first, i * 14)));
}
