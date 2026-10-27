import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import BookingTicket from '../components/cards/BookingTicket.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { IconAlert, IconCheck, IconTicket } from '../components/ui/Icons.jsx';
import { useBookings } from '../context/BookingsContext.jsx';
import { bookingStatus } from '../lib/bookings.js';
import { readFlightBookings } from '../lib/flightBookings.js';
import { readHotelBookings } from '../lib/hotelBookings.js';
import { formatDate, money } from '../lib/format.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function MyBookings() {
  useDocumentTitle('My trips');
  const { bookings, storageOk, cancelBooking, removeBooking } = useBookings();
  const location = useLocation();
  const navigate = useNavigate();

  // The booking form sends us here with the new reference in router state.
  // Read it once, then clear it so a refresh doesn't show the banner again.
  const [justBooked] = useState(() => location.state?.justBooked ?? null);
  const [flightJustBooked] = useState(() => location.state?.flightJustBooked ?? null);
  const [hotelJustBooked] = useState(() => location.state?.hotelJustBooked ?? null);
  const [flightBookings, setFlightBookings] = useState(readFlightBookings);
  const [hotelBookings, setHotelBookings] = useState(readHotelBookings);
  useEffect(() => {
    if (location.state?.justBooked || location.state?.flightJustBooked || location.state?.hotelJustBooked) navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const refreshFlights = (event) => {
      if (event.key === 'mana-yatra:flight-bookings:v1') setFlightBookings(readFlightBookings());
      if (event.key === 'mana-yatra:hotel-bookings:v1') setHotelBookings(readHotelBookings());
    };
    window.addEventListener('storage', refreshFlights);
    return () => window.removeEventListener('storage', refreshFlights);
  }, []);

  const [filter, setFilter] = useState('all');

  const items = useMemo(
    () =>
      [...bookings]
        .sort((a, b) => a.departure.localeCompare(b.departure))
        .map((booking) => ({ booking, status: bookingStatus(booking) })),
    [bookings],
  );

  const counts = {
    all: items.length,
    upcoming: items.filter((i) => i.status === 'upcoming').length,
    completed: items.filter((i) => i.status === 'completed').length,
    cancelled: items.filter((i) => i.status === 'cancelled').length,
  };
  const visible = filter === 'all' ? items : items.filter((i) => i.status === filter);
  const newBooking = items.find((i) => i.booking.id === justBooked)?.booking;

  return (
    <div className="container-page py-10 lg:py-14">
      <h1 className="display-lg">My trips</h1>
      <p className="mt-3 max-w-[60ch] text-lg">
        Your bookings are saved in this browser. Clearing your site data will remove them.
      </p>

      {newBooking && (
        <div
          role="status"
          className="mt-8 flex items-start gap-3 rounded-[14px] border border-ok/40 bg-white p-4 text-[15px]"
        >
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ok text-white">
            <IconCheck size={14} />
          </span>
          <p>
            <span className="font-semibold text-ink">Booking confirmed.</span> Your reference is{' '}
            <span className="font-semibold text-ink">{newBooking.id}</span>. You can cancel it any time from the
            ticket below.
          </p>
        </div>
      )}

      {!storageOk && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-[14px] border border-danger/40 bg-white p-4 text-[15px]"
        >
          <IconAlert size={20} className="mt-0.5 shrink-0 text-danger" />
          <p>
            Your browser is blocking local storage, so your bookings will disappear when you close this tab. Allow site
            data for this page to keep them.
          </p>
        </div>
      )}

      {flightBookings.find((booking) => booking.id === flightJustBooked) && (
        <div role="status" className="mt-8 flex items-start gap-3 rounded-[14px] border border-ok/40 bg-white p-4 text-[15px]">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ok text-white">
            <IconCheck size={14} />
          </span>
          <p><span className="font-semibold text-ink">Flight booking confirmed.</span> Your reference is{' '}
            <span className="font-semibold text-ink">{flightJustBooked}</span>. This sample booking is saved on this device.</p>
        </div>
      )}

      {hotelBookings.find((booking) => booking.id === hotelJustBooked) && (
        <div role="status" className="mt-8 flex items-start gap-3 rounded-[14px] border border-ok/40 bg-white p-4 text-[15px]">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ok text-white">
            <IconCheck size={14} />
          </span>
          <p><span className="font-semibold text-ink">Sample stay saved.</span> Your reference is{' '}
            <span className="font-semibold text-ink">{hotelJustBooked}</span>. This is not a real hotel reservation.</p>
        </div>
      )}

      {items.length === 0 && flightBookings.length === 0 && hotelBookings.length === 0 && (
        <div className="mt-10">
          <EmptyState
            icon={IconTicket}
            title="You have no bookings yet"
            action={
              <Link to="/destinations" className="btn btn-primary">
                Browse destinations
              </Link>
            }
          >
            When you book a trip, it shows up here with its reference, dates and price breakdown.
          </EmptyState>
        </div>
      )}

      {items.length > 0 && (
        <>
          <div role="group" aria-label="Filter bookings" className="mt-8 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className="chip"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                {f.label} ({counts[f.id]})
              </button>
            ))}
          </div>

          {visible.length > 0 ? (
            <ul className="mt-8 space-y-7">
              {visible.map(({ booking, status }) => (
                <BookingTicket
                  key={booking.id}
                  booking={booking}
                  status={status}
                  highlighted={booking.id === justBooked}
                  onCancel={() => cancelBooking(booking.id)}
                  onRemove={() => removeBooking(booking.id)}
                />
              ))}
            </ul>
          ) : (
            <div className="mt-8">
              <EmptyState icon={IconTicket} title={`No ${filter} bookings`}>
                Choose another filter to see your other trips.
              </EmptyState>
            </div>
          )}
        </>
      )}

      {flightBookings.length > 0 && (
        <section className="mt-12" aria-labelledby="flight-bookings-title">
          <h2 id="flight-bookings-title" className="display-md">Flight bookings</h2>
          <p className="mt-2 text-sm text-mute">Sample flight reservations saved in this browser.</p>
          <ul className="mt-6 grid gap-4 lg:grid-cols-2">
            {flightBookings.map((booking) => (
              <li key={booking.id} className="flight-booking-ticket">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ok">{booking.status}</p>
                    <h3 className="mt-1 font-display text-xl font-bold text-ink">{booking.from} <span aria-hidden="true">{booking.tripType === 'round' ? '⇄' : '→'}</span> {booking.to}</h3>
                    <p className="mt-1 text-sm text-mute">{formatDate(booking.departureDate)}{booking.returnDate ? ` · Return ${formatDate(booking.returnDate)}` : ''}</p>
                  </div>
                  <span className="carrier-mark" aria-label={booking.airline}>{booking.airline.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="flight-ticket-details">
                  <span>{booking.airline} · {booking.flightNumber}</span>
                  {booking.returnFlightNumber && <span>{booking.returnAirline} · {booking.returnFlightNumber} return</span>}
                  <span>{booking.adults + booking.children} traveller{booking.adults + booking.children === 1 ? '' : 's'} · {booking.cabin}</span>
                  <span>Reference <strong>{booking.id}</strong></span>
                  <strong>{money(booking.total)}</strong>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hotelBookings.length > 0 && (
        <section className="mt-12" aria-labelledby="hotel-bookings-title">
          <h2 id="hotel-bookings-title" className="display-md">Hotel stays</h2>
          <p className="mt-2 text-sm text-mute">Sample hotel listings saved in this browser; no room was reserved.</p>
          <ul className="mt-6 grid gap-4 lg:grid-cols-2">
            {hotelBookings.map((booking) => (
              <li key={booking.id} className="flight-booking-ticket">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ok">Sample stay</p>
                    <h3 className="mt-1 font-display text-xl font-bold text-ink">{booking.hotelName}</h3>
                    <p className="mt-1 text-sm text-mute">{booking.area}, {booking.city}</p>
                  </div>
                  <span className="carrier-mark" aria-hidden="true">⌂</span>
                </div>
                <div className="flight-ticket-details">
                  <span>Check-in <strong>{formatDate(booking.checkIn)}</strong></span>
                  <span>Check-out <strong>{formatDate(booking.checkOut)}</strong></span>
                  <span>{booking.guests} guest{booking.guests === 1 ? '' : 's'} · {booking.rooms} room{booking.rooms === 1 ? '' : 's'}</span>
                  <span>Reference <strong>{booking.id}</strong></span>
                  <strong>{money(booking.total)}</strong>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
