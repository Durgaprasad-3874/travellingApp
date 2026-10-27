import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import DestinationCard from '../components/cards/DestinationCard.jsx';
import HotelSearchPanel from '../components/hotels/HotelSearchPanel.jsx';
import PackageRow from '../components/cards/PackageRow.jsx';
import { IconChevronDown, IconMinus, IconPlus } from '../components/ui/Icons.jsx';
import { FLIGHT_CITIES, flightSearchParams } from '../data/flights.js';
import { destinations, packages } from '../data/index.js';
import { addDays, todayISO, toISODate } from '../lib/format.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const SERVICES = [
  { id: 'flights', label: 'Flights', icon: '✈️' },
  { id: 'hotels', label: 'Hotels', icon: '🏨' },
  { id: 'stays', label: 'Villas &\nHomestays', icon: '🏡' },
  { id: 'packages', label: 'Holiday\nPackages', icon: '🌴' },
  { id: 'trains', label: 'Trains', icon: '🚆' },
  { id: 'buses', label: 'Buses', icon: '🚌' },
  { id: 'cabs', label: 'Cabs', icon: '🚕' },
  { id: 'experiences', label: 'Tours &\nAttractions', icon: '🎡' },
  { id: 'visa', label: 'Visa', icon: '🛂' },
  { id: 'forex', label: 'Forex Card\n& Currency', icon: '💱' },
  { id: 'insurance', label: 'Travel\nInsurance', icon: '🛡️' },
];
const FARES = [
  { id: 'regular', label: 'Regular', detail: 'Everyday fares' },
  { id: 'student', label: 'Student', detail: 'Extra discounts' },
  { id: 'armed', label: 'Armed Forces', detail: 'Special fares' },
  { id: 'senior', label: 'Senior Citizen', detail: 'For 60+ travelers' },
  { id: 'doctor', label: 'Doctor & Nurses', detail: 'Special fares' },
];
const EXTRA_SERVICES = [
  { label: 'Where2Go', detail: 'Find your next place', icon: '🧭', to: '/destinations' },
  { label: 'Holiday packages', detail: 'Trips, stays & experiences', icon: '🏝️', to: '/destinations' },
  { label: 'Discover Andhra', detail: 'Local trips, made easy', icon: '🌅', to: '/destinations' },
  { label: 'My trips', detail: 'Your saved bookings', icon: '🎟️', to: '/bookings' },
];

const cityLabel = (city) => `${city.city} · ${city.code}`;

export default function Home() {
  useDocumentTitle('');
  const navigate = useNavigate();
  const location = useLocation();
  const [service, setService] = useState(() => new URLSearchParams(location.search).get('service') === 'hotels' ? 'hotels' : 'flights');
  const [tripType, setTripType] = useState('one-way');
  const [from, setFrom] = useState('DEL');
  const [to, setTo] = useState('BLR');
  const [departureDate, setDepartureDate] = useState(() => toISODate(addDays(new Date(), 12)));
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [cabin, setCabin] = useState('Economy');
  const [fare, setFare] = useState('regular');
  const [priceProtection, setPriceProtection] = useState(false);
  const [travellersOpen, setTravellersOpen] = useState(false);
  const [error, setError] = useState('');
  const [serviceMessage, setServiceMessage] = useState('');

  const originCity = FLIGHT_CITIES.find((city) => city.code === from);
  const destinationCity = FLIGHT_CITIES.find((city) => city.code === to);
  const minimumDate = todayISO(new Date());
  const totalTravelers = adults + children;
  const chooseService = (item) => {
    setService(item.id);
    setServiceMessage(item.id === 'flights' || item.id === 'hotels' ? '' : `${item.label.replace('\n', ' ')} booking is coming soon. Browse our Andhra Pradesh trips in the meantime.`);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    if (from === to) {
      setError('Choose two different cities to search for flights.');
      return;
    }
    if (!departureDate || departureDate < minimumDate) {
      setError('Choose a departure date from today onwards.');
      return;
    }
    if (tripType === 'round' && (!returnDate || returnDate < departureDate)) {
      setError('Choose a return date on or after your departure.');
      return;
    }
    setError('');
    const search = {
      from: originCity,
      to: destinationCity,
      departureDate,
      returnDate,
      adults,
      children,
      cabin,
      tripType,
      fare,
      priceProtection,
    };
    const params = flightSearchParams(search);
    params.set('fare', fare);
    if (priceProtection) params.set('protection', 'true');
    navigate(`/flights?${params}`);
  };

  const swapCities = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <>
      <section className="flight-hero">
        <div className="flight-hero-shade" />
        <div className="flight-hero-content container-page">
          <h1 className="sr-only">Search domestic flights and discover your next trip</h1>
          <div className="flight-search-wrap">
            <nav aria-label="Travel services" className="service-tabs">
              {SERVICES.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`service-tab ${service === item.id ? 'is-active' : ''}`}
                  aria-pressed={service === item.id}
                  onClick={() => chooseService(item)}
                >
                  <span className="service-icon" aria-hidden="true">{item.icon}</span>
                  <span>{item.label.split('\n').map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</span>
                </button>
              ))}
            </nav>

            <div className="flight-search-card" id={service === 'hotels' ? 'hotel-search' : undefined}>
              {service === 'flights' ? (
                <form onSubmit={submitSearch} noValidate>
                  <div className="flight-card-topline">
                    <fieldset className="trip-types">
                      <legend className="sr-only">Trip type</legend>
                      {[
                        { id: 'one-way', label: 'One Way' },
                        { id: 'round', label: 'Round Trip' },
                      ].map((trip) => (
                        <label className={`trip-choice ${tripType === trip.id ? 'is-selected' : ''}`} key={trip.id}>
                          <input
                            type="radio"
                            name="trip-type"
                            value={trip.id}
                            checked={tripType === trip.id}
                            onChange={() => setTripType(trip.id)}
                          />
                          <span className="radio-dot" />
                          {trip.label}
                        </label>
                      ))}
                      <button type="button" className={`trip-choice ${tripType === 'multi' ? 'is-selected' : ''}`} onClick={() => setServiceMessage('Multi-city booking is coming soon. Choose one-way or round trip to continue.')}>
                        <span className="radio-dot" />Multi City
                      </button>
                    </fieldset>
                    <span className="flight-promise">Sample domestic fares · India</span>
                  </div>

                  <div className="flight-fields">
                    <label className="flight-field city-field" htmlFor="flight-from">
                      <span className="field-caption">From</span>
                      <select id="flight-from" value={from} onChange={(event) => setFrom(event.target.value)}>
                        {FLIGHT_CITIES.map((city) => <option value={city.code} key={city.code}>{cityLabel(city)}</option>)}
                      </select>
                      <span className="airport-name">{originCity?.airport}</span>
                    </label>
                    <button type="button" onClick={swapCities} className="swap-cities" aria-label="Swap origin and destination">⇄</button>
                    <label className="flight-field city-field" htmlFor="flight-to">
                      <span className="field-caption">To</span>
                      <select id="flight-to" value={to} onChange={(event) => setTo(event.target.value)}>
                        {FLIGHT_CITIES.map((city) => <option value={city.code} key={city.code}>{cityLabel(city)}</option>)}
                      </select>
                      <span className="airport-name">{destinationCity?.airport}</span>
                    </label>
                    <label className="flight-field date-field" htmlFor="departure-date">
                      <span className="field-caption">Departure</span>
                      <input id="departure-date" type="date" value={departureDate} min={minimumDate} onChange={(event) => setDepartureDate(event.target.value)} />
                      <span className="airport-name">Choose your travel date</span>
                    </label>
                    <label className={`flight-field date-field ${tripType !== 'round' ? 'is-disabled' : ''}`} htmlFor="return-date">
                      <span className="field-caption">Return</span>
                      <input id="return-date" type="date" value={returnDate} min={departureDate || minimumDate} disabled={tripType !== 'round'} onChange={(event) => setReturnDate(event.target.value)} />
                      <span className="airport-name">{tripType === 'round' ? 'Choose your return date' : 'Add a return date for round trips'}</span>
                    </label>
                    <div className="flight-field travellers-field">
                      <span className="field-caption">Travellers</span>
                      <button type="button" className="field-trigger" aria-expanded={travellersOpen} onClick={() => setTravellersOpen((open) => !open)}>
                        <strong>{totalTravelers}</strong>
                        <span>{totalTravelers === 1 ? 'Traveller' : 'Travellers'}</span>
                        <IconChevronDown size={17} />
                      </button>
                      {travellersOpen && (
                        <div className="traveller-popover">
                          {[{ label: 'Adults', hint: '12+ years', value: adults, setter: setAdults, min: 1 }, { label: 'Children', hint: '2–11 years', value: children, setter: setChildren, min: 0 }].map((person) => (
                            <div className="traveller-stepper" key={person.label}>
                              <span><strong>{person.label}</strong><small>{person.hint}</small></span>
                              <span className="stepper-actions">
                                <button type="button" aria-label={`Remove ${person.label.toLowerCase()}`} disabled={person.value <= person.min} onClick={() => person.setter((count) => count - 1)}><IconMinus size={15} /></button>
                                <strong>{person.value}</strong>
                                <button type="button" aria-label={`Add ${person.label.toLowerCase()}`} disabled={totalTravelers >= 9} onClick={() => person.setter((count) => count + 1)}><IconPlus size={15} /></button>
                              </span>
                            </div>
                          ))}
                          <button type="button" className="popover-done" onClick={() => setTravellersOpen(false)}>Done</button>
                        </div>
                      )}
                    </div>
                    <label className="flight-field cabin-field" htmlFor="cabin-class">
                      <span className="field-caption">Cabin Class</span>
                      <select id="cabin-class" value={cabin} onChange={(event) => setCabin(event.target.value)}>
                        <option>Economy</option>
                        <option>Premium Economy</option>
                        <option>Business</option>
                      </select>
                      <span className="airport-name">Choose your cabin</span>
                    </label>
                  </div>

                  <div className="fare-section">
                    <strong className="fare-heading">Select a<br />special fare</strong>
                    <div className="fare-options">
                      {FARES.map((item) => (
                        <button type="button" key={item.id} className={`fare-option ${fare === item.id ? 'is-selected' : ''}`} aria-pressed={fare === item.id} onClick={() => setFare(item.id)}>
                          <strong>{item.label}</strong>
                          <span>{item.detail}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flight-extras">
                    <label className="protection-option">
                      <input type="checkbox" checked={priceProtection} onChange={(event) => setPriceProtection(event.target.checked)} />
                      <span className="custom-check" aria-hidden="true">✓</span>
                      <span><strong>Price Drop Protection</strong><small>Optional sample add-on · ₹299 per traveller.</small></span>
                    </label>
                    <div className="quick-actions">
                      <button type="button" onClick={() => setServiceMessage('Flight status lookup will be available soon.')}><span aria-hidden="true">▤</span> Flight Status</button>
                      <button type="button" onClick={() => setServiceMessage('Fast-track immigration details will be available soon.')}><span aria-hidden="true">🛂</span> Fast Track Immigration</button>
                    </div>
                  </div>
                  {error && <p className="flight-form-error" role="alert">{error}</p>}
                  {serviceMessage && <p className="flight-form-note" role="status">{serviceMessage}</p>}
                  <button type="submit" className="flight-search-button">SEARCH FLIGHTS</button>
                </form>
              ) : service === 'hotels' ? (
                <HotelSearchPanel />
              ) : (
                <div className="service-coming-soon">
                  <span className="coming-soon-icon" aria-hidden="true">{SERVICES.find((item) => item.id === service)?.icon}</span>
                  <div>
                    <h1>{SERVICES.find((item) => item.id === service)?.label.replace('\n', ' ')}</h1>
                    <p>{serviceMessage || 'Explore flights and thoughtfully planned Andhra Pradesh trips with Mana Yatra.'}</p>
                    <Link to="/destinations" className="btn btn-primary">Explore destinations</Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="hero-caption">The journey starts with a little inspiration.</p>
        </div>
      </section>

      <nav className="more-services container-page" aria-label="Explore more">
        {EXTRA_SERVICES.map((item) => (
          <Link to={item.to} className="more-service" key={item.label}>
            <span className="more-service-icon" aria-hidden="true">{item.icon}</span>
            <span><strong>{item.label}</strong><small>{item.detail}</small></span>
          </Link>
        ))}
      </nav>

      <section className="container-page home-discover" aria-labelledby="discover-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Make room for wonder</p>
            <h2 id="discover-title" className="display-lg">Explore Andhra Pradesh</h2>
          </div>
          <Link to="/destinations" className="hover-underline shrink-0 text-[15px] font-semibold text-action">View all destinations</Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6">
          {destinations.filter((destination) => destination.popular).slice(0, 4).map((destination) => (
            <DestinationCard destination={destination} key={destination.id} />
          ))}
        </div>
      </section>

      <section className="container-page home-packages" aria-labelledby="package-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A little more planned</p>
            <h2 id="package-title" className="display-lg">Ready-made getaways</h2>
          </div>
          <Link to="/destinations" className="hover-underline shrink-0 text-[15px] font-semibold text-action">Explore trips</Link>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {packages.filter((item) => item.featured).slice(0, 3).map((pkg) => <PackageRow key={pkg.id} pkg={pkg} />)}
        </div>
      </section>
    </>
  );
}
