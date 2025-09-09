import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../state/UIContext';

// PUBLIC_INTERFACE
export function HomePage() {
  /** Landing page with quick actions. */
  const navigate = useNavigate();
  const { openCreation, openBrowse } = useUI();

  return (
    <div className="card">
      <div className="grid cols-2">
        <div className="card" style={{background:'linear-gradient(135deg, rgba(108,99,255,0.12), transparent)'}}>
          <div className="title">Create a Story</div>
          <p className="text-dim">Pick a genre and theme, design your character, and begin a branching adventure.</p>
          <div className="row">
            <button className="btn" onClick={openCreation}>New Story</button>
            <button className="btn ghost" onClick={() => navigate('/create')}>Open Creator</button>
          </div>
        </div>
        <div className="card" style={{background:'linear-gradient(135deg, rgba(0,191,174,0.12), transparent)'}}>
          <div className="title">Join or Play</div>
          <p className="text-dim">Collaborate in multiplayer sessions with voting to steer the plot.</p>
          <div className="row">
            <button className="btn secondary" onClick={() => navigate('/play')}>Start Playing</button>
            <button className="btn ghost" onClick={openBrowse}>Browse Library</button>
          </div>
        </div>
      </div>
    </div>
  );
}
