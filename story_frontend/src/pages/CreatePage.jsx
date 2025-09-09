import React from 'react';
import { CreationModal } from '../components/modals/CreationModal';

// PUBLIC_INTERFACE
export function CreatePage() {
  /** Page that focuses user on the creation modal flow. */
  React.useEffect(()=>{ /* No-op: could pre-open modal */ },[]);
  return (
    <div className="card">
      <div className="title">Creator</div>
      <p className="text-dim">Use New Story to configure your session. You can also manage characters here.</p>
      <CreationModal />
      <div className="grid cols-2" style={{marginTop:12}}>
        <div className="card">
          <div className="title">Tips</div>
          <ul>
            <li>Combine genres for unique twists.</li>
            <li>Character traits influence AI decisions.</li>
            <li>Invite friends to vote on choices.</li>
          </ul>
        </div>
        <div className="card">
          <div className="title">Recent Characters</div>
          <div className="text-dim">No characters yet.</div>
        </div>
      </div>
    </div>
  );
}
