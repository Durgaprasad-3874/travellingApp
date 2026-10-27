import { IconStar } from './Icons.jsx';

export default function Rating({ value, count, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-semibold text-ink ${className}`}>
      <IconStar size={16} className="text-sun" />
      <span>{value.toFixed(1)}</span>
      {count != null && <span className="font-normal text-mute">({count.toLocaleString('en-US')})</span>}
      <span className="sr-only">out of 5</span>
    </span>
  );
}
