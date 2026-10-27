# Mana Yatra — Andhra Pradesh Travel Planner

A travel-booking demo built with React 18, React Router 6, Tailwind CSS 3 and Vite. Search illustrative domestic flight fares, or explore and book guided trips across Andhra Pradesh. Bookings are stored locally in the browser; there is no backend, live airline inventory or payment processing.

## Run it

Requires Node 18 or newer.

```bash
npm install
npm run dev
npm test
npm run build
```

## Included

- Ten Andhra Pradesh destinations, including Visakhapatnam, Araku Valley, Tirupati, Vijayawada and Gandikota.
- A domestic flight search with one-way and return trips, passenger counts, cabin and fare options, sample results, and local booking confirmation.
- A separate hotel search with named sample stays across all ten Andhra Pradesh destinations, date/guest/room filters, an estimated stay total, and local reservation history.
- From/To destination search, destination filters and package itineraries.
- Sample prices displayed in Indian Rupees (INR).
- A booking form with date and traveler selection, optional extras, and an itemized total.
- Tour and sample flight bookings saved to browser `localStorage`.
- Responsive desktop and mobile layouts.

Hotel names, ratings, amenities, prices and availability, flight fares and schedules, trip itineraries, photos, reviews, dates and booking flows are sample content. Hotel searches do not check availability or reserve rooms, and flight searches do not check airline inventory or issue tickets. Destination visits and permits should be checked with local operators and official sources. Account sign-in is a visual demo; no account is created and credentials are not sent or stored.

## Sign-in (demo OTP)

Every page load or refresh opens on **Inspiration** (`/inspiration`). Browsing is open; searching and booking flights, hotels and tours, and My trips, require a mobile-number OTP sign-in, after which you return to the action you chose. This is a demo: **no SMS is sent**; the 6-digit code is shown on screen (5-minute expiry, 5 attempts, 30s resend). The session is kept in localStorage (`mana-yatra:session:v1`).

## Project layout

```text
src/
├── App.jsx
├── components/
│   ├── cards/
│   ├── layout/
│   └── ui/
├── context/
├── data/       # Destinations, packages, sample hotels and flights, and reviews
├── hooks/
├── lib/        # Currency formatting, flight quotes, booking logic, dates and validation
└── pages/
tests/
└── logic.test.mjs
```
