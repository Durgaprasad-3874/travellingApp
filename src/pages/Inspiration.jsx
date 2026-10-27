import { Link } from 'react-router-dom';

import DestinationCard from '../components/cards/DestinationCard.jsx';
import PackageRow from '../components/cards/PackageRow.jsx';
import { destinations, packages } from '../data/index.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function Inspiration() {
  useDocumentTitle('Inspiration');

  return (
    <>
      <section className="container-page pt-28 pb-6 sm:pt-32">
        <p className="eyebrow">Inspiration</p>
        <h1 className="display-lg mt-2 max-w-[18ch]">Where to next in Andhra Pradesh?</h1>
        <p className="mt-3 max-w-[56ch] text-[15px] text-ink-2">
          Browse freely. When you are ready to search flights, find stays or book a trip, we will ask you to sign in with a mobile OTP.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/" className="btn btn-primary">Search flights &amp; hotels</Link>
          <Link to="/destinations" className="btn btn-secondary">All destinations</Link>
        </div>
      </section>

      <section className="container-page home-discover" aria-labelledby="discover-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Make room for wonder</p>
            <h2 id="discover-title" className="display-lg">Explore Andhra Pradesh</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6">
          {destinations.filter((d) => d.popular).slice(0, 8).map((d) => (
            <DestinationCard destination={d} key={d.id} />
          ))}
        </div>
      </section>

      <section className="container-page home-packages" aria-labelledby="package-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A little more planned</p>
            <h2 id="package-title" className="display-lg">Ready-made getaways</h2>
          </div>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {packages.filter((p) => p.featured).slice(0, 4).map((p) => <PackageRow key={p.id} pkg={p} />)}
        </div>
      </section>
    </>
  );
}
