import { Link } from 'react-router-dom';
import { IconChevronRight } from './Icons.jsx';

/** items: [{ label, to? }]. The last item is the current page. */
export default function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-mute">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {item.to && !last ? (
                <Link to={item.to} className="font-medium transition-colors duration-200 hover:text-ink hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={last ? 'font-medium text-ink' : ''}>
                  {item.label}
                </span>
              )}
              {!last && <IconChevronRight size={14} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
