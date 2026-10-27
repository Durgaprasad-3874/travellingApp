// Demo-only OTP logic. No SMS is sent; the code is shown on screen.
export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_MS = 30 * 1000;

export function normalizeMobile(value) {
  return String(value ?? '').replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '');
}

export function isValidMobile(value) {
  return /^[6-9]\d{9}$/.test(normalizeMobile(value));
}

export function maskMobile(mobile) {
  const m = normalizeMobile(mobile);
  return m.length === 10 ? `+91 ${m.slice(0, 2)}******${m.slice(-2)}` : '';
}

export function createChallenge(mobile, now = Date.now(), random = Math.random) {
  const code = String(100000 + Math.floor(random() * 900000));
  return { mobile: normalizeMobile(mobile), code, expiresAt: now + OTP_TTL_MS, resendAt: now + OTP_RESEND_MS, attempts: 0 };
}

export function verifyChallenge(challenge, input, now = Date.now()) {
  if (!challenge) return { ok: false, error: 'Request an OTP first.' };
  if (now > challenge.expiresAt) return { ok: false, expired: true, error: 'This OTP has expired. Please request a new one.' };
  if (challenge.attempts >= OTP_MAX_ATTEMPTS) return { ok: false, locked: true, error: 'Too many wrong attempts. Please request a new OTP.' };
  if (String(input).trim() === challenge.code) return { ok: true };
  const next = { ...challenge, attempts: challenge.attempts + 1 };
  const left = OTP_MAX_ATTEMPTS - next.attempts;
  return {
    ok: false,
    challenge: next,
    locked: left === 0,
    error: left === 0 ? 'Too many wrong attempts. Please request a new OTP.' : `Incorrect OTP. ${left} attempt${left === 1 ? '' : 's'} left.`,
  };
}
