export function hotelQuote(hotel, search) {
  const checkIn = new Date(`${search.checkIn}T00:00:00`);
  const checkOut = new Date(`${search.checkOut}T00:00:00`);
  const nights = Math.round((checkOut - checkIn) / 86400000);
  const roomTotal = hotel.price * nights * search.rooms;
  const taxes = Math.round(roomTotal * 0.12);
  return { nights, roomTotal, taxes, total: roomTotal + taxes };
}
