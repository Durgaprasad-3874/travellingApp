import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

export default function Layout() {
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const firstRender = useRef(true);

  // On each page change: jump to the top and move focus to the page,
  // so keyboard and screen-reader users start at the new content.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" ref={mainRef} tabIndex={-1} className="flex-1 outline-none">
        {/* Keyed by path, so each new page fades in. Filters change the query string only, so they don't replay it. */}
        <div key={pathname} className="page-in">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
