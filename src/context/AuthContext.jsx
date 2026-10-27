import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { readJSON, writeJSON } from '../lib/storage.js';

const KEY = 'mana-yatra:session:v1';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [mobile, setMobile] = useState(() => readJSON(KEY, null)?.mobile ?? null);

  const signIn = useCallback((value) => {
    writeJSON(KEY, { mobile: value });
    setMobile(value);
  }, []);
  const signOut = useCallback(() => {
    writeJSON(KEY, null);
    setMobile(null);
  }, []);

  const value = useMemo(() => ({ mobile, signIn, signOut }), [mobile, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

// Sends signed-out visitors to OTP sign-in, then back to where they were headed.
export function RequireAuth({ children }) {
  const { mobile } = useAuth();
  const location = useLocation();
  if (!mobile) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}${location.hash}` }} />;
  return children;
}
