import { readJSON, writeJSON } from './storage.js';

const KEY = 'mana-yatra:reviews:v1';

export function validateReview({ rating, text }) {
  if (!(rating >= 1 && rating <= 5)) return 'Choose a star rating.';
  const len = String(text ?? '').trim().length;
  if (len < 10) return 'Write at least 10 characters.';
  if (len > 500) return 'Keep your review under 500 characters.';
  return '';
}

export function getUserReviews(itemId) {
  const all = readJSON(KEY, {});
  return Array.isArray(all?.[itemId]) ? all[itemId] : [];
}

export function addUserReview(itemId, review) {
  const all = readJSON(KEY, {}) || {};
  const entry = {
    name: review.name,
    rating: review.rating,
    text: review.text.trim(),
    when: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    mine: true,
  };
  all[itemId] = [entry, ...(Array.isArray(all[itemId]) ? all[itemId] : [])];
  return writeJSON(KEY, all) ? entry : null;
}
