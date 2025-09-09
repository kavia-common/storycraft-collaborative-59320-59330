import React from 'react';
import { useUI } from '../../state/UIContext';
import { narrateText } from '../story/Narrator';

// PUBLIC_INTERFACE
export function NarrationModal() {
  /** Modal for AI or user voice narration of text. */
  const { narrationOpen, closeNarration, narrationText, setNarrationText } = useUI();

  const speak = () => {
    narrateText(narrationText);
  };

  return (
    <div className={`modal-backdrop ${narrationOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Narration">
      <div className="modal">
        <div className="row">
          <div className="title">Narration</div>
          <div className="space" />
          <button className="btn ghost" onClick={closeNarration} aria-label="Close">✕</button>
        </div>
        <textarea className="textarea" rows={10} value={narrationText} onChange={e=>setNarrationText(e.target.value)} placeholder="Paste or generate text to narrate..." />
        <div className="row" style={{marginTop:12}}>
          <div className="space" />
          <button className="btn secondary" onClick={speak}>Play</button>
        </div>
      </div>
    </div>
  );
}
