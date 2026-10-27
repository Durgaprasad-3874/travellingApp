import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function NotFound({ title = 'We can’t find that page', children }) {
  useDocumentTitle('Not found');
  return (
    <div className="container-page py-24">
      <h1 className="display-lg max-w-[18ch]">{title}</h1>
      <p className="mt-4 max-w-[50ch] text-lg">
        {children ?? 'The link may be old, or the address may have a typo. Start again from the destinations list.'}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/destinations" className="btn btn-primary">
          Browse destinations
        </Link>
        <Link to="/" className="btn btn-secondary">
          Go to the home page
        </Link>
      </div>
    </div>
  );
}
