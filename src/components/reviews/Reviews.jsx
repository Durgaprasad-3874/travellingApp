import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { IconStar } from '../ui/Icons.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { maskMobile } from '../../lib/otp.js';
import { addUserReview, getUserReviews, validateReview } from '../../lib/userReviews.js';

function Stars({ value }) {
  return (
    <span className="flex" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <IconStar key={n} size={16} className={n <= value ? 'text-sun' : 'text-line'} />
      ))}
    </span>
  );
}

export default function Reviews({ itemId, sampleReviews = [], title = 'Traveler reviews' }) {
  const { mobile } = useAuth();
  const location = useLocation();
  const [mine, setMine] = useState(() => getUserReviews(itemId));
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const problem = validateReview({ rating, text });
    if (problem) return setError(problem);
    const saved = addUserReview(itemId, { name: `Guest ${maskMobile(mobile).slice(-2)}`, rating, text });
    if (!saved) return setError('We couldn’t save your review in this browser.');
    setMine((list) => [saved, ...list]);
    setRating(0);
    setText('');
    setError('');
  };

  const all = [...mine, ...sampleReviews];
  const average = all.length ? all.reduce((sum, r) => sum + r.rating, 0) / all.length : 0;

  return (
    <section aria-labelledby={`reviews-${itemId}`} className="mt-10">
      <h2 id={`reviews-${itemId}`} className="display-md">{title}</h2>
      {all.length > 0 && (
        <p className="mt-2 text-[15px] text-ink-2">
          <strong className="text-ink">{average.toFixed(1)}</strong> average from {all.length} review{all.length === 1 ? '' : 's'}
        </p>
      )}
      <ul className="mt-5 divide-y divide-line border-y border-line">
        {all.map((r, i) => (
          <li key={`${r.name}-${i}`} className="py-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-semibold text-ink">{r.name}</span>
              <Stars value={r.rating} />
              <span className="text-sm text-mute">{r.when}{r.mine ? ' · Your review' : ''}</span>
            </div>
            <p className="mt-2 max-w-[62ch] text-[15px]">{r.text}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-mute">Sample reviews are illustrative demo content. Reviews you write are saved only in this browser.</p>

      {mobile ? (
        <form className="mt-6 max-w-xl space-y-3" onSubmit={submit} noValidate>
          <h3 className="text-lg font-semibold text-ink">Write a review</h3>
          <div role="radiogroup" aria-label="Your rating" className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} star${n === 1 ? '' : 's'}`}
                onClick={() => setRating(n)}
              >
                <IconStar size={28} className={n <= rating ? 'text-sun' : 'text-line'} />
              </button>
            ))}
          </div>
          <label htmlFor={`review-text-${itemId}`} className="sr-only">Your review</label>
          <textarea
            id={`review-text-${itemId}`}
            className="input min-h-[96px]"
            maxLength={500}
            placeholder="Share what it was like"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn btn-primary">Submit review</button>
        </form>
      ) : (
        <p className="mt-6 text-[15px]">
          <Link to="/login" state={{ from: `${location.pathname}${location.search}` }} className="font-semibold text-action underline">
            Login with OTP
          </Link>{' '}
          to write a review.
        </p>
      )}
    </section>
  );
}
