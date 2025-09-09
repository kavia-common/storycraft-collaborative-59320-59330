import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUI } from '../../state/UIContext';
import { useAuth } from '../../state/AuthContext';

// PUBLIC_INTERFACE
export function Header() {
  /** Top header with navigation and theme/auth controls. */
  const { toggleTheme, theme, openBrowse, openCreation } = useUI();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="header" role="banner">
      <div className="brand" onClick={() => navigate('/')} style={{cursor:'pointer'}}>
        <div className="brand-logo" aria-hidden />
        <div>
          <div>StoryCraft</div>
          <small className="text-dim">Co-create branching adventures</small>
        </div>
      </div>
      <nav className="nav" aria-label="Primary">
        <NavLink to="/" className={({isActive}) => isActive ? 'active' : undefined}>Home</NavLink>
        <NavLink to="/create" className={({isActive}) => isActive ? 'active' : undefined}>Create</NavLink>
        <NavLink to="/play" className={({isActive}) => isActive ? 'active' : undefined}>Play</NavLink>
        <NavLink to="/library" className={({isActive}) => isActive ? 'active' : undefined}>Library</NavLink>
      </nav>
      <div className="row">
        <button className="btn ghost" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <button className="btn ghost" onClick={openBrowse}>Browse</button>
        <button className="btn" onClick={openCreation}>New Story</button>
        {user ? (
          <>
            <div className="pill">😀 {user.displayName || user.email}</div>
            <button className="btn secondary" onClick={logout}>Logout</button>
          </>
        ) : (
          <button className="btn secondary" onClick={() => navigate('/auth')}>Sign in</button>
        )}
      </div>
    </header>
  );
}
