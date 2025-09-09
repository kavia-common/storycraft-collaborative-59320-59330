/**
 * Authentication context to store user and token.
 */
import React from 'react';
import { AuthAPI } from '../api/endpoints';

const AuthContext = React.createContext(null);

// PUBLIC_INTERFACE
export function useAuth() {
  /** Access auth state and actions. */
  return React.useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [token, setToken] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = localStorage.getItem('auth_token');
    if (!t) { setLoading(false); return; }
    AuthAPI.me(t).then(u => {
      setUser(u);
      setToken(t);
    }).catch(() => {
      localStorage.removeItem('auth_token');
    }).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await AuthAPI.login(email, password);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('auth_token', res.token);
  };

  const signup = async (email, password, displayName) => {
    const res = await AuthAPI.signup(email, password, displayName);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('auth_token', res.token);
  };

  const logout = async () => {
    try { if (token) await AuthAPI.logout(token); } catch (e) { /* ignore */ }
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  const value = { user, token, loading, login, signup, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
