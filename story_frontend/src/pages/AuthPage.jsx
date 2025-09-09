import React from 'react';
import { useAuth } from '../state/AuthContext';
import { useNavigate } from 'react-router-dom';

// PUBLIC_INTERFACE
export function AuthPage() {
  /** Email/password auth UI for login and signup. */
  const { login, signup } = useAuth();
  const [mode, setMode] = React.useState('login');
  const [email, setEmail] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password, displayName);
      }
      navigate('/');
    } catch (e2) {
      setError(e2.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{maxWidth: 520, margin: '0 auto'}}>
      <div className="title">{mode === 'login' ? 'Welcome back' : 'Create your account'}</div>
      <form onSubmit={onSubmit} className="grid">
        {mode === 'signup' && (
          <label>Display name
            <input className="input" value={displayName} onChange={e=>setDisplayName(e.target.value)} required />
          </label>
        )}
        <label>Email
          <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </label>
        <label>Password
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </label>
        {error && <div className="card" style={{borderColor:'tomato', color:'tomato'}}>{error}</div>}
        <div className="row">
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}</button>
          <button className="btn ghost" type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Create account' : 'Have an account? Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
}
