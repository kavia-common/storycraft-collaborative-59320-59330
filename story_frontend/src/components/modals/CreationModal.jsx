import React from 'react';
import { useUI } from '../../state/UIContext';
import { useAuth } from '../../state/AuthContext';
import { StoriesAPI, CharactersAPI } from '../../api/endpoints';
import { useNavigate } from 'react-router-dom';

// PUBLIC_INTERFACE
export function CreationModal() {
  /** Modal for creating a new story session with genre/theme and character. */
  const { creationOpen, closeCreation } = useUI();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [genres, setGenres] = React.useState(['Fantasy','Sci-Fi','Mystery','Romance','Adventure']);
  const [genre, setGenre] = React.useState('Fantasy');
  const [theme, setTheme] = React.useState('Epic quest');
  const [name, setName] = React.useState('Ari');
  const [traits, setTraits] = React.useState('Curious, Brave');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    // Optionally load from backend
    StoriesAPI.genres().then(list => { if (Array.isArray(list)) setGenres(list); }).catch(()=>{});
  }, []);

  const onCreate = async () => {
    setLoading(true);
    setError('');
    try {
      let characterId = null;
      try {
        const c = await CharactersAPI.create({ name, traits }, token);
        characterId = c.id;
      } catch { /* ignore if not required */ }
      const session = await StoriesAPI.createSession({ genre, theme, characterId }, token);
      closeCreation();
      navigate(`/play/${session.id || session.sessionId || 'new'}`);
    } catch (e) {
      setError(e.message || 'Failed to create session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal-backdrop ${creationOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Create a new story">
      <div className="modal">
        <div className="row">
          <div className="title">Create New Story</div>
          <div className="space" />
          <button className="btn ghost" onClick={closeCreation} aria-label="Close">✕</button>
        </div>
        <div className="grid cols-2" style={{marginTop:12}}>
          <div className="card">
            <div className="title">Genre & Theme</div>
            <div className="grid">
              <label>Genre
                <select className="select" value={genre} onChange={e=>setGenre(e.target.value)}>
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </label>
              <label>Theme
                <input className="input" value={theme} onChange={e=>setTheme(e.target.value)} placeholder="e.g., Epic quest" />
              </label>
            </div>
          </div>
          <div className="card">
            <div className="title">Character</div>
            <div className="grid">
              <label>Name
                <input className="input" value={name} onChange={e=>setName(e.target.value)} />
              </label>
              <label>Traits
                <input className="input" value={traits} onChange={e=>setTraits(e.target.value)} placeholder="e.g., Curious, Brave" />
              </label>
            </div>
          </div>
        </div>
        {error && <div className="card" style={{borderColor:'tomato', color:'tomato'}}>{error}</div>}
        <div className="row" style={{marginTop:12}}>
          <div className="space" />
          <button className="btn ghost" onClick={closeCreation}>Cancel</button>
          <button className="btn" onClick={onCreate} disabled={loading}>{loading ? 'Creating...' : 'Create & Start'}</button>
        </div>
      </div>
    </div>
  );
}
