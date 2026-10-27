export const MAX_TRAVELERS = 10;

const NAME_RE = /^\p{L}[\p{L} '.-]*$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS_RE = /^\+?[\d\s().-]+$/;

/** Most travelers one booking can hold for this package. */
export const travelerLimit = (pkg) => Math.min(MAX_TRAVELERS, pkg.groupSize);

/**
 * Validate the booking form. Returns an object of { field: message }.
 * An empty object means the form is valid.
 */
export function validateBooking(values, { departures, maxTravelers }) {
  const errors = {};

  const name = values.fullName.trim();
  if (!name) errors.fullName = 'Enter your full name.';
  else if (name.length < 2 || !NAME_RE.test(name)) errors.fullName = 'Use letters only, for example Priya Nair.';
  else if (!/\s/.test(name)) errors.fullName = 'Enter your first and last name.';

  const email = values.email.trim();
  if (!email) errors.email = 'Enter your email address.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter an email like name@example.com.';

  const phone = values.phone.trim();
  const digits = phone.replace(/\D/g, '');
  if (!phone) errors.phone = 'Enter a phone number.';
  else if (!PHONE_CHARS_RE.test(phone) || digits.length < 7 || digits.length > 15) {
    errors.phone = 'Enter a phone number with 7 to 15 digits.';
  }

  if (!values.departure) errors.departure = 'Choose a departure date.';
  else if (!departures.includes(values.departure)) {
    errors.departure = 'That departure is no longer available. Choose another date.';
  }

  const adults = Number(values.adults);
  const children = Number(values.children);
  if (!Number.isInteger(adults) || adults < 1) errors.adults = 'At least one adult must travel.';
  if (!Number.isInteger(children) || children < 0) errors.children = 'Children cannot be a negative number.';
  if (!errors.adults && !errors.children && adults + children > maxTravelers) {
    errors.adults = `This trip takes up to ${maxTravelers} travelers per booking.`;
  }

  if (!values.terms) errors.terms = 'Confirm your details are correct to continue.';

  return errors;
}
