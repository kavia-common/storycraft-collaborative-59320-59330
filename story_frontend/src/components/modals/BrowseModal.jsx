import React from 'react';
import { useUI } from '../../state/UIContext';
import { StoriesAPI } from '../../api/endpoints';
import { useNavigate } from 'react-router-dom';

// PUBLIC_INTERFACE
export function BrowseModal() {
  /** Modal overlay to quickly browse community stories. */
  const { browseOpen, closeBrowse } = useUI();
  const [items, setItems] = React.useState([]);
  const [q, setQ] = React.useState('');
  const navigate = useNavigate();

  const load = React.useCallback(() => {
    StoriesAPI.listCommunity(q ? { q } : undefined).then(setItems).catch(()=>setItems([]));
  }, [q]);

  React.useEffect(() => { if (browseOpen) load(); }, [browseOpen, load]);

  return (
    <div className={`modal-backdrop ${browseOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Browse community">
      <div className="modal">
        <div className="row">
          <div className="title">Community Library</div>
          <div className="space" />
          <input className="input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." />
          <button className="btn ghost" onClick={load}>Search</button>
          <button className="btn ghost" onClick={closeBrowse} aria-label="Close">✕</button>
        </div>
        <div className="grid cols-3" style={{marginTop:12}}>
          {items?.length ? items.map(it => (
            <div key={it.id} className="card">
              <div className="title">{it.title || it.genre || 'Untitled'}</div>
              <small className="muted">{it.author || 'Anonymous'}</small>
              <div className="row" style={{marginTop:8}}>
                <span className="pill">⭐ {it.rating ?? 0}</span>
                <span className="pill">🔁 {it.remixes ?? 0}</span>
                <div className="space" />
                <button className="btn secondary" onClick={() => { closeBrowse(); navigate(`/play/${it.sessionId || it.id}`); }}>Play</button>
              </div>
            </div>
          )) : <div className="text-dim">No items found.</div>}
        </div>
      </div>
    </div>
  );
}
