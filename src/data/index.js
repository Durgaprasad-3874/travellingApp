import { destinations, CATEGORIES, DEFAULT_ORIGIN, ORIGIN_CITIES, REGIONS } from './destinations.js';
import { packages } from './packages.js';

export { destinations, packages, CATEGORIES, DEFAULT_ORIGIN, ORIGIN_CITIES, REGIONS };

export const getDestination = (id) => destinations.find((d) => d.id === id);
export const getPackage = (id) => packages.find((p) => p.id === id);
export const packagesFor = (destinationId) => packages.filter((p) => p.destinationId === destinationId);

/** Lowest adult price among a destination's packages (Infinity if it has none). */
export const minPriceFor = (destinationId) =>
  packagesFor(destinationId).reduce((min, p) => Math.min(min, p.price), Infinity);

/** Whole-hundred bounds for the budget slider. */
export const PRICE_BOUNDS = (() => {
  const prices = packages.map((p) => p.price);
  return {
    min: Math.floor(Math.min(...prices) / 100) * 100,
    max: Math.ceil(Math.max(...prices) / 100) * 100,
  };
})();
