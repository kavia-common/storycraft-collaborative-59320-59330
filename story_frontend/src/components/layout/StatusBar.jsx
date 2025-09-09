import React from 'react';
import { useLocation } from 'react-router-dom';

// PUBLIC_INTERFACE
export function StatusBar() {
  /** Bottom status bar providing multiplayer info and quick actions. */
  const location = useLocation();
  const inPlay = location.pathname.startsWith('/play');

  return (
    <div className="statusbar" role="contentinfo" aria-live="polite">
      <div className="row">
        <span>🧭 {inPlay ? 'In session' : 'Browsing'}</span>
        <span className="pill">Players: 1</span>
        <span className="pill">Votes: 0</span>
        <span className="pill">Latency: ~40ms</span>
      </div>
      <div className="row">
        <button className="btn ghost">Invite</button>
        <button className="btn ghost">Copy Link</button>
        <button className="btn secondary">Start</button>
      </div>
    </div>
  );
}
