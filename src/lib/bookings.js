import { todayISO, tripEndISO } from './format.js';

/** upcoming, completed (the trip has ended) or cancelled. */
export function bookingStatus(booking) {
  if (booking.status === 'cancelled') return 'cancelled';
  return tripEndISO(booking.departure, booking.days) < todayISO() ? 'completed' : 'upcoming';
}

export const STATUS_LABEL = {
  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
