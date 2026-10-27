import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { TextField } from '../components/ui/Field.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { createChallenge, isValidMobile, maskMobile, normalizeMobile, verifyChallenge } from '../lib/otp.js';

const PHOTO_URL =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85';

export default function Login() {
  const { mobile: signedIn, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const target = location.state?.from || '/';

  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [challenge, setChallenge] = useState(null);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());

  useDocumentTitle('Sign in with mobile OTP');

  useEffect(() => {
    if (!challenge) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [challenge]);

  if (signedIn) return <Navigate to={target} replace />;

  const sendOtp = (event) => {
    event?.preventDefault();
    if (!isValidMobile(mobile)) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    setError('');
    setOtp('');
    setNow(Date.now());
    setChallenge(createChallenge(mobile));
  };

  const verify = (event) => {
    event.preventDefault();
    const result = verifyChallenge(challenge, otp);
    if (result.ok) {
      signIn(challenge.mobile);
      navigate(target, { replace: true });
      return;
    }
    if (result.challenge) setChallenge(result.challenge);
    setError(result.error);
  };

  const resendIn = challenge ? Math.max(0, Math.ceil((challenge.resendAt - now) / 1000)) : 0;
  const expired = challenge && now > challenge.expiresAt;

  return (
    <section className="container-page py-8 sm:py-12">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[24px] border border-line bg-white shadow-[0_24px_70px_-40px_rgba(14,27,44,0.5)] lg:min-h-[560px] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative min-h-[220px] overflow-hidden bg-ink lg:order-2 lg:min-h-full">
          <img src={PHOTO_URL} alt="Sunlight over a tropical coastline" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E1B2C]/85 via-[#0E1B2C]/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-9">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">Mana Yatra · Andhra Pradesh</p>
            <h2 className="mt-3 max-w-[15ch] font-display text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl">
              Find your next story close to home.
            </h2>
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-10 lg:order-1 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-action">Sign in to continue</p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight tracking-[-0.035em] text-ink sm:text-4xl">
            {challenge ? 'Enter the OTP' : 'Login with mobile number'}
          </h1>
          <p className="mt-3 text-[15px] text-ink-2">
            {challenge
              ? `We generated a 6-digit code for ${maskMobile(challenge.mobile)}.`
              : 'Browsing is open to everyone. Searching and booking need a quick OTP sign-in.'}
          </p>

          {!challenge ? (
            <form className="mt-8 space-y-5" onSubmit={sendOtp} noValidate>
              <TextField
                id="mobile"
                label="Mobile number"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="98765 43210"
                maxLength={14}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                error={error}
                hint="+91 India numbers only"
              />
              <button type="submit" className="btn btn-primary w-full">Send OTP</button>
            </form>
          ) : (
            <form className="mt-8 space-y-5" onSubmit={verify} noValidate>
              <p role="status" className="rounded-xl border border-action/20 bg-action-soft px-4 py-3 text-sm text-ink">
                Demo mode: no SMS is sent. Your OTP is <strong data-testid="demo-otp" className="tracking-[0.2em]">{challenge.code}</strong>
              </p>
              <TextField
                id="otp"
                label="6-digit OTP"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="------"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                error={expired ? 'This OTP has expired. Please request a new one.' : error}
              />
              <button type="submit" className="btn btn-primary w-full" disabled={otp.length !== 6 || expired}>
                Verify &amp; continue
              </button>
              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  className="font-semibold text-action disabled:text-mute"
                  disabled={resendIn > 0}
                  onClick={sendOtp}
                >
                  {resendIn > 0 ? `Resend OTP in ${resendIn}s` : 'Resend OTP'}
                </button>
                <button
                  type="button"
                  className="font-semibold text-action"
                  onClick={() => { setChallenge(null); setError(''); setMobile(normalizeMobile(challenge.mobile)); }}
                >
                  Change number
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
