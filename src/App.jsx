import { useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { RequireAuth } from './context/AuthContext.jsx';
import Inspiration from './pages/Inspiration.jsx';

import Layout from './components/layout/Layout.jsx';
import Home from './pages/Home.jsx';
import Destinations from './pages/Destinations.jsx';
import DestinationDetail from './pages/DestinationDetail.jsx';
import PackageDetail from './pages/PackageDetail.jsx';
import Booking from './pages/Booking.jsx';
import MyBookings from './pages/MyBookings.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';
import FlightResults from './pages/FlightResults.jsx';
import FlightBooking from './pages/FlightBooking.jsx';
import HotelResults from './pages/HotelResults.jsx';
import HotelBooking from './pages/HotelBooking.jsx';

const guard = (element) => <RequireAuth>{element}</RequireAuth>;

export default function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Every full page load or refresh opens on Inspiration first.
  useEffect(() => {
    if (pathname !== '/inspiration') navigate('/inspiration', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="inspiration" element={<Inspiration />} />
        <Route index element={<Home />} />
        <Route path="flights" element={guard(<FlightResults />)} />
        <Route path="flights/book" element={guard(<FlightBooking />)} />
        <Route path="hotels" element={guard(<HotelResults />)} />
        <Route path="hotels/book" element={guard(<HotelBooking />)} />
        <Route path="destinations" element={<Destinations />} />
        <Route path="destinations/:destinationId" element={<DestinationDetail />} />
        <Route path="packages/:packageId" element={<PackageDetail />} />
        <Route path="book/:packageId" element={guard(<Booking />)} />
        <Route path="bookings" element={guard(<MyBookings />)} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
