import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import Logo from './Logo.jsx';
import { IconMenu, IconX } from '../ui/Icons.jsx';
import { useBookings } from '../../context/BookingsContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { maskMobile } from '../../lib/otp.js';

const LINKS = [
  { to: '/inspiration', label: 'Inspiration' },
  { to: '/', label: 'Book' },
  { to: '/destinations', label: 'Destinations' },
  { to: '/bookings', label: 'My trips', showCount: true },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { bookings } = useBookings();
  const { mobile, signOut } = useAuth();
  const active = bookings.filter((b) => b.status === 'confirmed').length;
  const isHome = pathname === '/';

  // Close the mobile menu whenever the page changes.
  useEffect(() => setOpen(false), [pathname]);

  // Add a soft shadow under the header once the page has scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const renderLinks = () =>
    LINKS.map(({ to, label, showCount }) => (
      <NavLink
        key={to}
        to={to}
        className="nav-link inline-flex items-center gap-2 py-1 text-[15px] font-semibold text-ink-2 transition-colors hover:text-ink aria-[current=page]:text-ink"
      >
        {label}
        {showCount && active > 0 && (
          <span
            className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-action px-1.5 text-xs font-bold text-white"
            aria-label={`${active} active`}
          >
            {active}
          </span>
        )}
      </NavLink>
    ));

  return (
    <header className={`site-header ${isHome ? 'site-header-home' : 'site-header-inner'} ${scrolled && !isHome ? 'site-header-scrolled' : ''}`}>
      <div className="site-header-content container-page">
        <Logo light={isHome} />

        <nav aria-label="Main" className="site-desktop-nav">
          <NavLink to="/destinations" className="site-nav-link">Explore Andhra</NavLink>
          <NavLink to="/bookings" className="site-nav-link">
            My trips{active > 0 && <span className="nav-count">{active}</span>}
          </NavLink>
          <NavLink to="/inspiration" className="site-nav-link">Inspiration</NavLink>
          <NavLink to="/" end className="site-nav-link">Book</NavLink>
          {mobile ? (
            <span className="site-nav-link flex items-center gap-2">
              {maskMobile(mobile)}
              <button type="button" className="font-semibold underline" onClick={signOut}>Sign out</button>
            </span>
          ) : (
            <NavLink to="/login" className={`site-account-button ${isHome ? 'site-account-button-home' : ''}`}>
              Login with OTP
            </NavLink>
          )}
          <span className={`site-locale ${isHome ? 'site-locale-home' : ''}`}>🇮🇳 &nbsp; INR <span aria-hidden="true">⌄</span></span>
        </nav>

        <button
          type="button"
          className={`mobile-menu-button ${isHome ? 'mobile-menu-button-home' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <IconX size={24} /> : <IconMenu size={24} />}
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`mobile-menu ${open ? 'mobile-menu-open' : ''}`}
      >
        <div className="mobile-menu-inner">
          <nav aria-label="Mobile" className="container-page mobile-menu-nav">
            {renderLinks()}
            {mobile ? (
              <button type="button" className="btn btn-secondary btn-sm" onClick={signOut}>
                Sign out {maskMobile(mobile)}
              </button>
            ) : (
              <NavLink to="/login" className="btn btn-secondary btn-sm">Login with OTP</NavLink>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
