import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { TextField } from '../components/ui/Field.jsx';
import { flightSearchFromParams, getFlights, getReturnFlight } from '../data/flights.js';
import { saveFlightBooking } from '../lib/flightBookings.js';
import { flightQuote } from '../lib/flightPricing.js';
import { formatDate } from '../lib/format.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function FlightBooking() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const search = flightSearchFromParams(params);
  const flight = search && getFlights(search.from.code, search.to.code).find((item) => item.id === params.get('flight'));
  const returnFlight = flight && search ? getReturnFlight(flight, search) : null;
  const quote = useMemo(() => (flight && search ? flightQuote(flight, search, returnFlight) : null), [flight, search, returnFlight]);
  const [passengerName, setPassengerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');

  useDocumentTitle(flight ? 'Passenger details' : 'Flight booking');

  if (!flight || !search || !quote) {
    return (
      <section className="container-page flight-page">
        <div className="flight-empty">
          <h1 className="display-md">That flight is no longer available</h1>
          <p>Return to search and choose one of the sample flights shown there.</p>
          <Link to="/" className="btn btn-primary">Search flights</Link>
        </div>
      </section>
    );
  }

  const submitBooking = (event) => {
    event.preventDefault();
    if (!termsAccepted) {
      setError('Please confirm that you have reviewed the booking details.');
      return;
    }
    const reference = `MYF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const booking = {
      id: reference,
      flightId: flight.id,
      flightNumber: flight.flightNumber,
      airline: flight.name,
      returnAirline: returnFlight?.name ?? null,
      returnFlightNumber: returnFlight?.flightNumber ?? null,
      returnDeparture: returnFlight?.departure ?? null,
      returnArrival: returnFlight?.arrival ?? null,
      from: search.from.city,
      fromCode: search.from.code,
      to: search.to.city,
      toCode: search.to.code,
      departureDate: search.departureDate,
      returnDate: search.returnDate,
      tripType: search.tripType,
      adults: search.adults,
      children: search.children,
      cabin: search.cabin,
      passengerName: passengerName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      total: quote.total,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
    };
    if (!saveFlightBooking(booking)) {
      setError('We couldn’t save this booking in your browser. Check your storage settings and try again.');
      return;
    }
    navigate('/bookings', { state: { flightJustBooked: booking.id } });
  };

  return (
    <section className="container-page flight-page">
      <div className="flight-checkout-heading">
        <div>
          <p className="eyebrow">Almost there</p>
          <h1 className="display-md">Passenger details</h1>
          <p>Your sample booking will be saved on this device. No payment is taken.</p>
        </div>
        <Link to="/" className="btn btn-secondary">Back to search</Link>
      </div>

      <div className="flight-checkout-grid">
        <form className="passenger-form" onSubmit={submitBooking}>
          <h2>Lead traveller</h2>
          <p className="form-intro">Enter the contact details for this booking. Add the remaining travellers with your airline.</p>
          <TextField id="flight-passenger-name" label="Full name" autoComplete="name" value={passengerName} onChange={(event) => setPassengerName(event.target.value)} placeholder="As shown on your ID" minLength={2} required />
          <TextField id="flight-passenger-email" label="Email address" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
          <TextField id="flight-passenger-phone" label="Mobile number" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" minLength={8} required />
          <label className="flight-terms">
            <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
            <span>I’ve reviewed the sample itinerary and understand this is a demo booking with no payment or airline ticket.</span>
          </label>
          {error && <p className="flight-form-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary confirm-flight-button">Confirm sample booking · ₹{quote.total.toLocaleString('en-IN')}</button>
        </form>

        <aside className="flight-itinerary-card" aria-label="Flight and fare summary">
          <p className="eyebrow">Your itinerary</p>
          <h2>{search.from.city} <span aria-hidden="true">{search.tripType === 'round' ? '⇄' : '→'}</span> {search.to.city}</h2>
          <p>{formatDate(search.departureDate)}{search.tripType === 'round' ? ` · Return ${formatDate(search.returnDate)}` : ''}</p>
          <div className="itinerary-carrier">
            <span className="carrier-mark" style={{ '--carrier-color': flight.color }}>{flight.code}</span>
            <span><strong>{flight.name}</strong><small>{flight.flightNumber} · {search.cabin}</small></span>
          </div>
          <div className="itinerary-times">
            <span><strong>{flight.departure}</strong><small>{search.from.code}</small></span>
            <span className="duration-line"><i /></span>
            <span><strong>{flight.arrival}</strong><small>{search.to.code}</small></span>
          </div>
          {returnFlight && (
            <div className="itinerary-return">
              <div className="itinerary-carrier">
                <span className="carrier-mark" style={{ '--carrier-color': returnFlight.color }}>{returnFlight.code}</span>
                <span><strong>{returnFlight.name}</strong><small>{returnFlight.flightNumber} · Return · {formatDate(search.returnDate)}</small></span>
              </div>
              <div className="itinerary-times">
                <span><strong>{returnFlight.departure}</strong><small>{search.to.code}</small></span>
                <span className="duration-line"><i /></span>
                <span><strong>{returnFlight.arrival}</strong><small>{search.from.code}</small></span>
              </div>
            </div>
          )}
          <div className="fare-breakdown">
            <div><span>Outbound sample fare</span><strong>₹{quote.outboundTotal.toLocaleString('en-IN')}</strong></div>
            {returnFlight && <div><span>Return sample fare</span><strong>₹{quote.returnTotal.toLocaleString('en-IN')}</strong></div>}
            {quote.discount > 0 && <div><span>Special fare discount</span><strong>−₹{quote.discount.toLocaleString('en-IN')}</strong></div>}
            {quote.protection > 0 && <div><span>Price protection</span><strong>₹{quote.protection.toLocaleString('en-IN')}</strong></div>}
            <div><span>Estimated taxes</span><strong>₹{quote.taxes.toLocaleString('en-IN')}</strong></div>
            <div className="fare-total"><span>Total · {quote.travelers} traveller{quote.travelers === 1 ? '' : 's'}</span><strong>₹{quote.total.toLocaleString('en-IN')}</strong></div>
          </div>
          <p className="fare-note">Sample pricing only. This does not reserve seats or issue an airline ticket.</p>
        </aside>
      </div>
    </section>
  );
}
