import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { TextField } from '../components/ui/Field.jsx';
import { getHotel, hotelSearchFromParams } from '../data/hotels.js';
import Reviews from '../components/reviews/Reviews.jsx';
import { hotelReviewsFor } from '../data/reviews.js';
import { saveHotelBooking } from '../lib/hotelBookings.js';
import { hotelQuote } from '../lib/hotelPricing.js';
import { formatDate, money } from '../lib/format.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function HotelBooking() {
  const { search: query } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(query);
  const search = hotelSearchFromParams(params);
  const hotel = search && getHotel(params.get('hotel'));
  const quote = useMemo(() => (hotel && search ? hotelQuote(hotel, search) : null), [hotel, search]);
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState('');

  useDocumentTitle(hotel ? `Stay at ${hotel.name}` : 'Hotel reservation');

  if (!hotel || !search || !quote || hotel.destinationId !== search.destination.id) {
    return (
      <section className="container-page flight-page">
        <div className="flight-empty">
          <h1 className="display-md">That sample stay isn’t available</h1>
          <p>Return to the hotel search and choose a stay listed for your selected destination.</p>
          <Link to="/?service=hotels#hotel-search" className="btn btn-primary">Search stays</Link>
        </div>
      </section>
    );
  }

  const submitReservation = (event) => {
    event.preventDefault();
    if (!acknowledged) {
      setError('Please acknowledge that this is a demo reservation, not a confirmed hotel booking.');
      return;
    }
    const booking = {
      id: `MYS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      hotelId: hotel.id,
      hotelName: hotel.name,
      city: search.destination.name,
      area: hotel.area,
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      guests: search.guests,
      rooms: search.rooms,
      guestName: guestName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      total: quote.total,
      status: 'sample',
      bookedAt: new Date().toISOString(),
    };
    if (!saveHotelBooking(booking)) {
      setError('We couldn’t save this sample reservation in your browser. Check your storage settings and try again.');
      return;
    }
    navigate('/bookings', { state: { hotelJustBooked: booking.id } });
  };

  return (
    <section className="container-page hotel-booking-page">
      <div className="flight-checkout-heading">
        <div>
          <p className="eyebrow">Sample stay · no payment taken</p>
          <h1 className="display-md">Guest details</h1>
          <p>This demo saves your selected stay to My trips. It does not contact the property.</p>
        </div>
        <Link to={`/hotels?${new URLSearchParams({ destination: search.destination.id, checkIn: search.checkIn, checkOut: search.checkOut, guests: String(search.guests), rooms: String(search.rooms) })}`} className="btn btn-secondary">Back to stays</Link>
      </div>
      <div className="hotel-checkout-grid">
        <form className="passenger-form" onSubmit={submitReservation}>
          <h2>Lead guest</h2>
          <p className="form-intro">Provide contact details for this locally saved sample reservation.</p>
          <TextField id="hotel-guest-name" label="Full name" autoComplete="name" value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Name of lead guest" minLength={2} required />
          <TextField id="hotel-guest-email" label="Email address" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
          <TextField id="hotel-guest-phone" label="Mobile number" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" minLength={8} required />
          <label className="flight-terms">
            <input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} />
            <span>I understand this is a sample listing and does not reserve a real hotel room or take payment.</span>
          </label>
          {error && <p className="flight-form-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary confirm-flight-button">Save sample stay · {money(quote.total)}</button>
        </form>

        <aside className="flight-itinerary-card hotel-summary-card" aria-label="Stay and price summary">
          <p className="eyebrow">Your stay</p>
          <h2>{hotel.name}</h2>
          <p>{hotel.area}, {search.destination.name}</p>
          <div className="hotel-summary-dates">
            <div><span>Check-in</span><strong>{formatDate(search.checkIn)}</strong></div>
            <div><span>Check-out</span><strong>{formatDate(search.checkOut)}</strong></div>
          </div>
          <p className="hotel-summary-guests">{search.guests} guest{search.guests === 1 ? '' : 's'} · {search.rooms} room{search.rooms === 1 ? '' : 's'} · {quote.nights} night{quote.nights === 1 ? '' : 's'}</p>
          <div className="fare-breakdown">
            <div><span>{money(hotel.price)} × {quote.nights} night{quote.nights === 1 ? '' : 's'} × {search.rooms} room{search.rooms === 1 ? '' : 's'}</span><strong>{money(quote.roomTotal)}</strong></div>
            <div><span>Estimated taxes (12%)</span><strong>{money(quote.taxes)}</strong></div>
            <div className="fare-total"><span>Sample total</span><strong>{money(quote.total)}</strong></div>
          </div>
          <p className="fare-note">Sample pricing only. This is not a real reservation, availability check, or payment request.</p>
        </aside>
      </div>
      <Reviews itemId={hotel.id} sampleReviews={hotelReviewsFor(hotel.id)} title={`Guest reviews for ${hotel.name}`} />
    </section>
  );
}
