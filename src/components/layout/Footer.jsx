import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-white">
      <div className="container-page flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-3 text-sm text-mute">Guided journeys across Andhra Pradesh, with stays and local experiences.</p>
        </div>

        <nav aria-label="Footer" className="flex flex-col items-start gap-2 text-sm font-medium text-ink">
          <Link to="/" className="hover-underline">
            Search flights
          </Link>
          <Link to="/destinations" className="hover-underline">
            Destinations
          </Link>
          <Link to="/bookings" className="hover-underline">
            My trips
          </Link>
        </nav>

        <p className="max-w-xs text-sm text-mute">
          Sample itineraries for Andhra Pradesh. All prices are in Indian Rupees (INR); no payment is taken. Destination photos via Wikimedia Commons (free licences, credited to their photographers there).
        </p>
      </div>
    </footer>
  );
}
