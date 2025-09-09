import React from 'react';
import { ChoiceButtons } from './choices/ChoiceButtons';

// PUBLIC_INTERFACE
export function StoryPanel({ text, choices, onChoose, onNarrate }) {
  /** Central story text area and choices. */
  return (
    <div className="story-panel">
      <div className="row">
        <div className="title">Story</div>
        <div className="space" />
        <button className="btn ghost" onClick={onNarrate} aria-label="Narrate this text">🔊 Narrate</button>
      </div>
      <div className="story-text" aria-live="polite">
        {text || <span className="text-dim">Your adventure begins...</span>}
      </div>
      <div className="choices">
        <ChoiceButtons choices={choices} onChoose={onChoose} />
      </div>
    </div>
  );
}
