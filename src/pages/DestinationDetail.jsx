import { useParams } from 'react-router-dom';

import Poster from '../components/ui/Poster.jsx';
import Rating from '../components/ui/Rating.jsx';
import PackageRow from '../components/cards/PackageRow.jsx';
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx';
import { IconPin } from '../components/ui/Icons.jsx';
import NotFound from './NotFound.jsx';
import { getDestination, packagesFor } from '../data/index.js';
import { plural } from '../lib/format.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function DestinationDetail() {
  const { destinationId } = useParams();
  const d = getDestination(destinationId);
  useDocumentTitle(d ? d.name : 'Destination not found');

  if (!d) {
    return <NotFound title="We can’t find that destination" />;
  }

  const trips = packagesFor(d.id);

  return (
    <div className="container-page py-8 lg:py-10">
      <Breadcrumbs items={[{ label: 'Destinations', to: '/destinations' }, { label: d.name }]} />

      <div className="mt-4 h-56 overflow-hidden rounded-[20px] sm:h-72 lg:h-[22rem]">
        <Poster destination={d} shape="wide" animateSun className="h-full w-full" />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-16">
        <div>
          <h1 className="display-xl">{d.name}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[15px]">
            <span className="inline-flex items-center gap-1.5">
              <IconPin size={18} className="text-mute" />
              {d.country}
            </span>
            <Rating value={d.rating} count={d.reviewCount} />
          </p>
          <p className="mt-6 font-display text-2xl font-medium leading-snug tracking-[-0.01em] text-ink">
            {d.tagline}
          </p>
          <p className="mt-4 max-w-[62ch] text-lg">{d.description}</p>
        </div>

        <dl className="space-y-5 self-start rounded-[14px] border border-line bg-white p-5 text-[15px]">
          <div>
            <dt className="text-sm text-mute">Best time to go</dt>
            <dd className="font-semibold text-ink">{d.bestTime}</dd>
          </div>
          <div>
            <dt className="text-sm text-mute">Region</dt>
            <dd className="font-semibold text-ink">{d.region}</dd>
          </div>
          <div>
            <dt className="text-sm text-mute">Good for</dt>
            <dd className="mt-1.5 flex flex-wrap gap-2">
              {d.categories.map((c) => (
                <span key={c} className="rounded-full bg-action-soft px-3 py-1 text-sm font-medium text-action-dark">
                  {c}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </div>

      <section className="mt-16" aria-labelledby="trips-title">
        <h2 id="trips-title" className="display-md">
          {plural(trips.length, 'trip')} in {d.name}
        </h2>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {trips.map((p) => (
            <PackageRow key={p.id} pkg={p} showDestination={false} />
          ))}
        </div>
      </section>
    </div>
  );
}
