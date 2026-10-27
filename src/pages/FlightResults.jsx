import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { FLIGHT_CITIES, flightSearchFromParams, flightSearchParams, getFlights, getReturnFlight } from '../data/flights.js';
import { flightQuote } from '../lib/flightPricing.js';
import { formatDate, plural } from '../lib/format.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function FlightResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const search = flightSearchFromParams(params);
  const [sort, setSort] = useState('recommended');
  useDocumentTitle(search ? `${search.from.city} to ${search.to.city} flights` : 'Flight search');

  const flights = useMemo(() => {
    if (!search) return [];
    const options = getFlights(search.from.code, search.to.code);
    return sort === 'price'
      ? [...options].sort((a, b) => a.price - b.price)
      : sort === 'departure'
        ? [...options].sort((a, b) => a.departure.localeCompare(b.departure))
        : options;
  }, [search, sort]);

  if (!search) {
    return (
      <section className="container-page flight-page">
        <div className="flight-empty">
          <h1 className="display-md">We couldn’t read that flight search</h1>
          <p>Choose valid cities, dates and travellers to see available sample fares.</p>
          <Link to="/" className="btn btn-primary">Search flights</Link>
        </div>
      </section>
    );
  }

  const continueToBooking = (flight) => {
    const query = flightSearchParams(search);
    query.set('fare', search.fare);
    if (search.priceProtection) query.set('protection', 'true');
    query.set('flight', flight.id);
    navigate(`/flights/book?${query}`);
  };

  return (
    <section className="container-page flight-page">
      <div className="flight-results-heading">
        <div>
          <p className="eyebrow">Sample flight fares · no payment is taken</p>
          <h1 className="display-md">{search.from.city} <span aria-hidden="true">→</span> {search.to.city}</h1>
          <p className="results-summary">
            {formatDate(search.departureDate)}
            {search.tripType === 'round' ? ` · Return ${formatDate(search.returnDate)}` : ''}
            {' · '}{plural(search.adults + search.children, 'traveller')} · {search.cabin}
          </p>
        </div>
        <Link to="/" className="btn btn-secondary">Change search</Link>
      </div>

      <div className="results-toolbar">
        <p><strong>{flights.length} flights</strong> available · {search.from.code} to {search.to.code}</p>
        <label htmlFor="flight-sort">Sort by
          <select id="flight-sort" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="recommended">Recommended</option>
            <option value="price">Lowest price</option>
            <option value="departure">Departure time</option>
          </select>
        </label>
      </div>

      <div className="flight-result-list">
        {flights.map((flight, index) => {
          const returnFlight = getReturnFlight(flight, search);
          const quote = flightQuote(flight, search, returnFlight);
          return (
            <article className="flight-result-card" key={flight.id}>
              <div className="flight-legs">
                <div className="flight-leg">
                  <p className="flight-leg-label">Outbound · {formatDate(search.departureDate)}</p>
                  <div className="carrier-cell">
                    <span className="carrier-mark" style={{ '--carrier-color': flight.color }}>{flight.code}</span>
                    <span><strong>{flight.name}</strong><small>{flight.flightNumber}</small></span>
                  </div>
                  <div className="flight-timing">
                    <strong>{flight.departure}</strong>
                    <span>{search.from.code} · {formatDate(search.departureDate)}</span>
                  </div>
                  <div className="flight-duration">
                    <span>{flight.duration}</span>
                    <span className="duration-line"><i /></span>
                    <small>Non stop</small>
                  </div>
                  <div className="flight-timing">
                    <strong>{flight.arrival}</strong>
                    <span>{search.to.code}</span>
                  </div>
                </div>
                {returnFlight && (
                  <div className="flight-leg return-flight-leg">
                    <p className="flight-leg-label">Return · {formatDate(search.returnDate)}</p>
                    <div className="carrier-cell">
                      <span className="carrier-mark" style={{ '--carrier-color': returnFlight.color }}>{returnFlight.code}</span>
                      <span><strong>{returnFlight.name}</strong><small>{returnFlight.flightNumber}</small></span>
                    </div>
                    <div className="flight-timing">
                      <strong>{returnFlight.departure}</strong>
                      <span>{search.to.code} · {formatDate(search.returnDate)}</span>
                    </div>
                    <div className="flight-duration">
                      <span>{returnFlight.duration}</span>
                      <span className="duration-line"><i /></span>
                      <small>Non stop</small>
                    </div>
                    <div className="flight-timing">
                      <strong>{returnFlight.arrival}</strong>
                      <span>{search.from.code}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flight-select">
                <div className="flight-price">
                  <strong>₹{quote.total.toLocaleString('en-IN')}</strong>
                  <small>{search.tripType === 'round' ? 'round trip' : 'one way'} · {quote.travelers} traveller{quote.travelers === 1 ? '' : 's'}</small>
                </div>
                <button className="btn btn-primary result-book-button" type="button" onClick={() => continueToBooking(flight)}>
                  Select
                </button>
              </div>
              {index === 0 && <span className="best-fare-badge">Recommended</span>}
            </article>
          );
        })}
      </div>
      <p className="flight-demo-disclaimer">
        These are illustrative sample fares for this demo, not live airline availability. Final pricing is shown before you confirm.
      </p>
    </section>
  );
}
