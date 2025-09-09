import React from 'react';
import { useAuth } from '../../state/AuthContext';

// PUBLIC_INTERFACE
export function Sidebar() {
  /** Character and session helpers sidebar. */
  const { user } = useAuth();
  return (
    <div className="card" aria-label="Character and Session Sidebar">
      <div className="title">Character</div>
      <div className="grid">
        <div className="row"><strong>Name</strong><div className="space" /> <span className="text-dim">Unnamed Hero</span></div>
        <div className="row"><strong>Traits</strong><div className="space" /> <span className="text-dim">Curious, Bold</span></div>
        <div className="row"><strong>Companions</strong><div className="space" /> <span className="text-dim">None</span></div>
      </div>
      <hr style={{border:'0', borderTop:'1px solid var(--border)', margin:'12px 0'}}/>
      <div className="title">Session</div>
      <div className="grid">
        <div className="row"><strong>Status</strong><div className="space" /> <span className="text-dim">Idle</span></div>
        <div className="row"><strong>Players</strong><div className="space" /> <span className="text-dim">1</span></div>
      </div>
      <hr style={{border:'0', borderTop:'1px solid var(--border)', margin:'12px 0'}}/>
      <div className="grid">
        <button className="btn">Save Bookmark</button>
        <button className="btn ghost">Replay from Bookmark</button>
        {user ? <button className="btn accent">Share to Community</button> : null}
      </div>
    </div>
  );
}
