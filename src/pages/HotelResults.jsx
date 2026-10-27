import { Link, useLocation } from 'react-router-dom';

import { hotelSearchFromParams, hotelSearchParams, getHotels } from '../data/hotels.js';
import { formatDate, money, plural } from '../lib/format.js';
import { hotelQuote } from '../lib/hotelPricing.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function HotelResults() {
  const { search: query } = useLocation();
  const search = hotelSearchFromParams(new URLSearchParams(query));
  useDocumentTitle(search ? `Stays in ${search.destination.name}` : 'Hotel search');

  if (!search) {
    return (
      <section className="container-page flight-page">
        <div className="flight-empty">
          <h1 className="display-md">We couldn’t read that hotel search</h1>
          <p>Choose a destination and valid check-in and check-out dates to browse sample stays.</p>
          <Link to="/?service=hotels#hotel-search" className="btn btn-primary">Search stays</Link>
        </div>
      </section>
    );
  }

  const hotels = getHotels(search.destination.id);
  const nights = Math.round((new Date(`${search.checkOut}T00:00:00`) - new Date(`${search.checkIn}T00:00:00`)) / 86400000);

  return (
    <section className="container-page hotel-results-page">
      <div className="hotel-results-heading">
        <div>
          <p className="eyebrow">Hotel search · sample listings</p>
          <h1 className="display-md">Stays in {search.destination.name}</h1>
          <p>{formatDate(search.checkIn)} – {formatDate(search.checkOut)} · {plural(nights, 'night')} · {plural(search.guests, 'guest')} · {plural(search.rooms, 'room')}</p>
        </div>
        <Link to="/?service=hotels#hotel-search" className="btn btn-secondary">Change search</Link>
      </div>

      <div className="hotel-results-layout">
        <aside className="hotel-results-sidebar">
          <span className="hotel-demo-badge">SAMPLE STAYS</span>
          <h2>{hotels.length} places in {search.destination.name}</h2>
          <p>These named accommodation examples are for the app demo. Rates and room availability are not live.</p>
          <Link to="/?service=hotels#hotel-search" className="hover-underline text-sm font-semibold text-action">Edit search</Link>
        </aside>
        <div className="hotel-results-list">
          {hotels.map((hotel, index) => {
            const quote = hotelQuote(hotel, search);
            const params = hotelSearchParams(search);
            params.set('hotel', hotel.id);
            return (
              <article className="hotel-result-card" key={hotel.id}>
                <div className={`hotel-result-art hotel-art-${index % 4}`} aria-hidden="true">
                  <span>STAY</span>
                  <strong>{search.destination.name.slice(0, 3).toUpperCase()}</strong>
                </div>
                <div className="hotel-result-copy">
                  <p className="hotel-location">{search.destination.name} · {hotel.area}</p>
                  <h2>{hotel.name}</h2>
                  <p className="hotel-rating"><span aria-hidden="true">★</span> {hotel.rating.toFixed(1)} <span>({hotel.reviews.toLocaleString('en-IN')} sample reviews)</span></p>
                  <div className="hotel-amenities">
                    {hotel.amenities.map((amenity) => <span key={amenity}>{amenity}</span>)}
                  </div>
                  <p className="hotel-guest-line">{plural(search.guests, 'guest')} · {plural(search.rooms, 'room')} · {plural(nights, 'night')}</p>
                </div>
                <div className="hotel-result-price">
                  <span>Demo rate</span>
                  <strong>{money(hotel.price)}</strong>
                  <small>per room / night</small>
                  <p>{money(quote.total)} <span>total incl. estimated taxes</span></p>
                  <Link to={`/hotels/book?${params}`} className="btn btn-primary">View stay</Link>
                </div>
              </article>
            );
          })}
          <p className="hotel-results-disclaimer">Hotel names, ratings, reviews, amenities and prices are sample data for this demo. They do not represent verified properties, current reviews, or live availability.</p>
        </div>
      </div>
    </section>
  );
}
