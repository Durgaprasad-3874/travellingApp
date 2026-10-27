import { destinations } from './destinations.js';
import { todayISO, toISODate } from '../lib/format.js';

export const HOTELS = [
  { id: 'vizag-harbor-view', destinationId: 'visakhapatnam', name: 'Harbor View Visakhapatnam', area: 'Beach Road', rating: 4.7, reviews: 987, price: 5790, amenities: ['Sea view', 'Breakfast included', 'Free Wi-Fi'] },
  { id: 'vizag-blue-bay', destinationId: 'visakhapatnam', name: 'Blue Bay Residency', area: 'Rushikonda', rating: 4.5, reviews: 703, price: 4380, amenities: ['Beach access', 'Free Wi-Fi', 'Restaurant'] },
  { id: 'araku-coffee-grove', destinationId: 'araku-valley', name: 'Coffee Grove Retreat', area: 'Araku Valley', rating: 4.8, reviews: 426, price: 5290, amenities: ['Mountain views', 'Breakfast included', 'Garden'] },
  { id: 'araku-eastern-ghats-lodge', destinationId: 'araku-valley', name: 'Eastern Ghats Lodge', area: 'Ananthagiri Hills', rating: 4.5, reviews: 318, price: 3890, amenities: ['Valley views', 'Free Wi-Fi', 'Restaurant'] },
  { id: 'tirupati-hill-shrine', destinationId: 'tirupati', name: 'Hill Shrine Residency', area: 'Tirupati', rating: 4.6, reviews: 1120, price: 4190, amenities: ['Temple transfers', 'Breakfast included', 'Free Wi-Fi'] },
  { id: 'tirupati-temple-view', destinationId: 'tirupati', name: 'Temple View Suites', area: 'Tiruchanur Road', rating: 4.4, reviews: 860, price: 3290, amenities: ['Family rooms', 'Free Wi-Fi', 'Restaurant'] },
  { id: 'vijayawada-river-garden', destinationId: 'vijayawada', name: 'River Garden Vijayawada', area: 'Benz Circle', rating: 4.5, reviews: 680, price: 3890, amenities: ['Breakfast included', 'Free Wi-Fi', 'Restaurant'] },
  { id: 'vijayawada-grand-residency', destinationId: 'vijayawada', name: 'Grand Residency', area: 'Governorpet', rating: 4.3, reviews: 514, price: 2990, amenities: ['Free Wi-Fi', 'Family rooms', 'Air conditioning'] },
  { id: 'gandikota-pennar-canyon', destinationId: 'gandikota', name: 'Pennar Canyon Camp', area: 'Gandikota Fort Road', rating: 4.6, reviews: 354, price: 4690, amenities: ['Canyon views', 'Guided walks', 'Outdoor dining'] },
  { id: 'gandikota-fortside', destinationId: 'gandikota', name: 'Fortside Guesthouse', area: 'Gandikota Village', rating: 4.3, reviews: 247, price: 2890, amenities: ['Breakfast included', 'Free parking', 'Garden'] },
  { id: 'lepakshi-stone-carving', destinationId: 'lepakshi', name: 'Stone Carving Inn', area: 'Lepakshi Temple Road', rating: 4.5, reviews: 288, price: 3190, amenities: ['Heritage walks', 'Breakfast included', 'Free parking'] },
  { id: 'lepakshi-nandi-courtyard', destinationId: 'lepakshi', name: 'Nandi Courtyard Stay', area: 'Lepakshi', rating: 4.2, reviews: 196, price: 2490, amenities: ['Garden', 'Family rooms', 'Local dining'] },
  { id: 'rajahmundry-godavari-riverside', destinationId: 'rajahmundry', name: 'Godavari Riverside Lodge', area: 'Godavari Bund', rating: 4.7, reviews: 812, price: 4590, amenities: ['River views', 'Breakfast included', 'Free Wi-Fi'] },
  { id: 'rajahmundry-bridgeview', destinationId: 'rajahmundry', name: 'Bridgeview Residency', area: 'Dowleswaram', rating: 4.4, reviews: 492, price: 3290, amenities: ['Free Wi-Fi', 'Restaurant', 'Air conditioning'] },
  { id: 'srisailam-nallamala-retreat', destinationId: 'srisailam', name: 'Nallamala Forest Retreat', area: 'Srisailam', rating: 4.6, reviews: 429, price: 5290, amenities: ['Forest views', 'Breakfast included', 'Guided walks'] },
  { id: 'srisailam-krishna-hill', destinationId: 'srisailam', name: 'Krishna Hill Stay', area: 'Srisailam Dam Road', rating: 4.3, reviews: 311, price: 3790, amenities: ['River views', 'Free parking', 'Restaurant'] },
  { id: 'kakinada-coringa-mangrove', destinationId: 'kakinada', name: 'Coringa Mangrove Lodge', area: 'Coringa', rating: 4.5, reviews: 380, price: 4190, amenities: ['Nature walks', 'Breakfast included', 'Garden'] },
  { id: 'kakinada-bayfront', destinationId: 'kakinada', name: 'Bayfront Residency', area: 'Kakinada Beach Road', rating: 4.4, reviews: 529, price: 3490, amenities: ['Sea view', 'Free Wi-Fi', 'Restaurant'] },
  { id: 'horsley-misty-hills', destinationId: 'horsley-hills', name: 'Misty Hills Retreat', area: 'Horsley Hills', rating: 4.7, reviews: 501, price: 4890, amenities: ['Hill views', 'Breakfast included', 'Garden'] },
  { id: 'horsley-cedar-ridge', destinationId: 'horsley-hills', name: 'Cedar Ridge Stay', area: 'Horsley Hills Road', rating: 4.3, reviews: 326, price: 3490, amenities: ['Forest views', 'Free Wi-Fi', 'Restaurant'] },
];

export const getHotel = (id) => HOTELS.find((hotel) => hotel.id === id);

export const getHotelDestination = (id) => destinations.find((destination) => destination.id === id);

export const getHotels = (destinationId) =>
  HOTELS.filter((hotel) => hotel.destinationId === destinationId);

export function hotelSearchFromParams(params) {
  const destination = getHotelDestination(params.get('destination'));
  const checkIn = params.get('checkIn') || '';
  const checkOut = params.get('checkOut') || '';
  const guests = Number(params.get('guests') || 2);
  const rooms = Number(params.get('rooms') || 1);
  const isDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00`);
    return Number.isFinite(date.getTime()) && toISODate(date) === value;
  };
  if (!destination || !isDate(checkIn) || !isDate(checkOut) || checkIn < todayISO() || checkOut <= checkIn) return null;
  if (!Number.isInteger(guests) || guests < 1 || guests > 10) return null;
  if (!Number.isInteger(rooms) || rooms < 1 || rooms > 5) return null;
  if (guests > rooms * 4) return null;
  return { destination, checkIn, checkOut, guests, rooms };
}

export function hotelSearchParams(search) {
  return new URLSearchParams({
    destination: search.destination.id,
    checkIn: search.checkIn,
    checkOut: search.checkOut,
    guests: String(search.guests),
    rooms: String(search.rooms),
  });
}
