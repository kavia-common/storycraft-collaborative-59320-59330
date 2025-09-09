import React from 'react';
import { StoriesAPI } from '../api/endpoints';
import { useAuth } from '../state/AuthContext';

// PUBLIC_INTERFACE
export function LibraryPage() {
  /** Community library with sharing, remixing, and rating. */
  const [items, setItems] = React.useState([]);
  const { token } = useAuth();

  const load = React.useCallback(() => {
    StoriesAPI.listCommunity().then(setItems).catch(()=>setItems([]));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const onRate = async (id, rating) => {
    try { await StoriesAPI.rate(id, rating, token); load(); } catch {}
  };

  const onRemix = async (id) => {
    try { await StoriesAPI.remix(id, token); alert('Remix created! Check your sessions.'); } catch { alert('Remix failed'); }
  };

  return (
    <div className="card">
      <div className="title">Community Library</div>
      <div className="grid cols-3" style={{marginTop:12}}>
        {items?.length ? items.map(it => (
          <div key={it.id} className="card">
            <div className="title">{it.title || it.genre || 'Untitled'}</div>
            <small className="muted">{it.author || 'Anonymous'}</small>
            <div className="row" style={{marginTop:8}}>
              <span className="pill">⭐ {it.rating ?? 0}</span>
              <span className="pill">🔁 {it.remixes ?? 0}</span>
              <div className="space" />
              <button className="btn ghost" onClick={() => onRate(it.id, Math.min(5, (it.rating || 0)+1))}>+ Rate</button>
              <button className="btn secondary" onClick={() => onRemix(it.id)}>Remix</button>
            </div>
          </div>
        )) : <div className="text-dim">No community stories yet.</div>}
      </div>
    </div>
  );
}
