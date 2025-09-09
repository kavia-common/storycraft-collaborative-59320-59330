import React from 'react';

// PUBLIC_INTERFACE
export function ChoiceButtons({ choices = [], onChoose }) {
  /** Render branching choices as buttons with vote counts. */
  if (!choices.length) {
    return <span className="text-dim">No choices yet. Generate to continue.</span>;
  }
  return choices.map((c) => (
    <button
      key={c.id}
      className="btn ghost"
      onClick={() => onChoose(c.id)}
      aria-label={`Choose: ${c.text}. Votes ${c.votes ?? 0}`}
      title={`Votes: ${c.votes ?? 0}`}
    >
      {c.text} {typeof c.votes === 'number' ? `(${c.votes})` : ''}
    </button>
  ));
}
