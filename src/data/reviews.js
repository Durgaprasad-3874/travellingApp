// Mock reviews. Each package shows three of these, picked by a stable hash of its id.

const REVIEWS = [
  {
    name: 'Ananya R.',
    rating: 5,
    when: 'March 2026',
    text: 'Our guide knew the best local spots and gave us time to enjoy each place. The pace felt just right.',
  },
  {
    name: 'Ravi and Suma',
    rating: 5,
    when: 'February 2026',
    text: 'The stay was comfortable and every local transfer was on time. We would happily take this trip again.',
  },
  {
    name: 'Kiran D.',
    rating: 4,
    when: 'January 2026',
    text: 'A good balance of guided visits and free time. The small group made it easy to explore together.',
  },
  {
    name: 'Sravya N.',
    rating: 5,
    when: 'December 2025',
    text: 'Travelling solo, I was nervous about group trips. Everyone was friendly and the guide made it easy to join in.',
  },
  {
    name: 'Arjun K.',
    rating: 4,
    when: 'November 2025',
    text: 'Everything in the itinerary happened as described. I would have liked a longer lunch break on day three.',
  },
  {
    name: 'Meghana M.',
    rating: 5,
    when: 'October 2025',
    text: 'The small touches added up: a driver waiting for us and a thoughtful local tip at every stop.',
  },
  {
    name: 'Sandeep W.',
    rating: 5,
    when: 'September 2025',
    text: 'We booked for our anniversary. The team arranged a quiet dinner spot and never made a fuss about it.',
  },
  {
    name: 'Harika L.',
    rating: 4,
    when: 'August 2025',
    text: 'Well organised from the first email to the last transfer. Bring comfortable shoes, because you will walk a lot.',
  },
];

const hash = (s) => [...s].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0, 7);

export function reviewsFor(packageId, count = 3) {
  const start = hash(packageId) % REVIEWS.length;
  return Array.from({ length: count }, (_, i) => REVIEWS[(start + i * 3) % REVIEWS.length]);
}

const HOTEL_REVIEWS = [
  { name: 'Lakshmi P.', rating: 5, when: 'April 2026', text: 'Spotless room, warm staff and a breakfast spread we did not expect. Easy to reach the main sights from here.' },
  { name: 'Venkat R.', rating: 4, when: 'March 2026', text: 'Comfortable stay with good Wi-Fi. Check-in was quick, though the lift was busy at peak hours.' },
  { name: 'Divya S.', rating: 5, when: 'February 2026', text: 'We travelled with family and the rooms were roomy. Staff helped arrange a local driver without fuss.' },
  { name: 'Mohan T.', rating: 4, when: 'January 2026', text: 'Great location and a peaceful night. Food at the restaurant was fresh and reasonably priced.' },
  { name: 'Pooja K.', rating: 4, when: 'December 2025', text: 'Clean, quiet and good value. I would book again for a longer weekend.' },
];

export function hotelReviewsFor(hotelId, count = 3) {
  const start = hash(hotelId) % HOTEL_REVIEWS.length;
  return Array.from({ length: count }, (_, i) => HOTEL_REVIEWS[(start + i) % HOTEL_REVIEWS.length]);
}
