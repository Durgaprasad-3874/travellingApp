import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { destinations } from '../../data/destinations.js';
import { hotelSearchParams } from '../../data/hotels.js';
import { addDays, todayISO, toISODate } from '../../lib/format.js';

export default function HotelSearchPanel() {
  const navigate = useNavigate();
  const [destinationId, setDestinationId] = useState('visakhapatnam');
  const [checkIn, setCheckIn] = useState(() => toISODate(addDays(new Date(), 12)));
  const [checkOut, setCheckOut] = useState(() => toISODate(addDays(new Date(), 13)));
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [error, setError] = useState('');
  const minimumDate = todayISO();

  const submitSearch = (event) => {
    event.preventDefault();
    if (checkIn < minimumDate || checkOut <= checkIn) {
      setError('Choose a check-out date after check-in, starting today or later.');
      return;
    }
    if (guests > rooms * 4) {
      setError('Choose enough rooms for your guests (up to 4 guests per room).');
      return;
    }
    const destination = destinations.find((item) => item.id === destinationId);
    if (!destination) {
      setError('Choose a destination to find stays.');
      return;
    }
    setError('');
    navigate(`/hotels?${hotelSearchParams({ destination, checkIn, checkOut, guests, rooms })}`);
  };

  return (
    <form className="hotel-search-panel" onSubmit={submitSearch} noValidate>
      <div className="hotel-search-heading">
        <div>
          <p className="eyebrow">Places to stay</p>
          <h1>Find your stay</h1>
          <p>Browse named sample stays by destination and travel dates.</p>
        </div>
        <span className="hotel-demo-badge">SAMPLE STAYS</span>
      </div>
      <div className="hotel-search-fields">
        <label className="hotel-search-field hotel-location-field" htmlFor="hotel-city">
          <span>Where</span>
          <select id="hotel-city" value={destinationId} onChange={(event) => setDestinationId(event.target.value)}>
            {destinations.map((destination) => <option value={destination.id} key={destination.id}>{destination.name}</option>)}
          </select>
        </label>
        <label className="hotel-search-field" htmlFor="hotel-check-in">
          <span>Check-in</span>
          <input id="hotel-check-in" type="date" min={minimumDate} value={checkIn} onChange={(event) => setCheckIn(event.target.value)} />
        </label>
        <label className="hotel-search-field" htmlFor="hotel-check-out">
          <span>Check-out</span>
          <input id="hotel-check-out" type="date" min={checkIn || minimumDate} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} />
        </label>
        <label className="hotel-search-field hotel-count-field" htmlFor="hotel-guests">
          <span>Guests</span>
          <select id="hotel-guests" value={guests} onChange={(event) => setGuests(Number(event.target.value))}>
            {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => <option value={count} key={count}>{count} guest{count === 1 ? '' : 's'}</option>)}
          </select>
        </label>
        <label className="hotel-search-field hotel-count-field" htmlFor="hotel-rooms">
          <span>Rooms</span>
          <select id="hotel-rooms" value={rooms} onChange={(event) => setRooms(Number(event.target.value))}>
            {Array.from({ length: 5 }, (_, index) => index + 1).map((count) => <option value={count} key={count}>{count} room{count === 1 ? '' : 's'}</option>)}
          </select>
        </label>
        <button type="submit" className="btn btn-primary hotel-search-submit">Search stays</button>
      </div>
      {error && <p className="flight-form-error" role="alert">{error}</p>}
      <p className="hotel-search-note">Examples for this demo only. No live hotel availability or booking is connected.</p>
    </form>
  );
}
