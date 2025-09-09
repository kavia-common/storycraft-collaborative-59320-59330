import React from 'react';
import { useParams } from 'react-router-dom';
import { StoryPanel } from '../components/story/StoryPanel';
import { useUI } from '../state/UIContext';
import { useAuth } from '../state/AuthContext';
import { StoriesAPI } from '../api/endpoints';
import { createSessionSocket } from '../api/socket';

// PUBLIC_INTERFACE
export function PlayPage() {
  /** Story play page with AI-driven progression, choices, and multiplayer voting. */
  const { sessionId } = useParams();
  const { openNarration, setNarrationText } = useUI();
  const { token } = useAuth();

  const [storyText, setStoryText] = React.useState('');
  const [choices, setChoices] = React.useState([]);
  const [socket, setSocket] = React.useState(null);

  const loadSession = React.useCallback(async () => {
    if (!sessionId) {
      // Local mock session
      setStoryText('You awaken in a forest as dawn breaks. A path splits ahead: one bathed in sunlight, the other shadowed by ancient trees.');
      setChoices([
        { id: 'c1', text: 'Follow the sunlit path', votes: 0 },
        { id: 'c2', text: 'Venture into the shadows', votes: 0 }
      ]);
      return;
    }
    try {
      const s = await StoriesAPI.getSession(sessionId, token);
      setStoryText(s.current?.text || 'The story awaits your first choice.');
      setChoices(s.current?.choices || []);
    } catch {
      setStoryText('Failed to load session. Try again later.');
      setChoices([]);
    }
  }, [sessionId, token]);

  React.useEffect(() => { loadSession(); }, [loadSession]);

  React.useEffect(() => {
    const sock = createSessionSocket(sessionId || 'local', token, {
      onSessionUpdate: (payload) => {
        if (payload.text) setStoryText(payload.text);
        if (payload.choices) setChoices(payload.choices);
      },
      onVoteUpdate: (payload) => {
        if (Array.isArray(payload)) setChoices(payload);
      }
    });
    setSocket(sock);
    return () => { try { sock.disconnect(); } catch {} };
  }, [sessionId, token]);

  const onChoose = async (choiceId) => {
    // Emit vote locally and via socket
    if (socket) socket.emit('vote', { sessionId: sessionId || 'local', choiceId });
    try {
      const res = await StoriesAPI.progress(sessionId || 'local', choiceId, token);
      setStoryText(res.text || storyText);
      setChoices(res.choices || []);
    } catch {
      // If backend not available, simulate progress
      setStoryText(prev => `${prev}\n\nYou chose: ${choices.find(c=>c.id===choiceId)?.text}. The adventure twists...`);
      setChoices([
        { id: 'n1', text: 'Press on bravely', votes: 0 },
        { id: 'n2', text: 'Take a cautious detour', votes: 0 }
      ]);
    }
  };

  const onNarrate = () => {
    setNarrationText(storyText);
    openNarration(storyText);
  };

  return (
    <div className="card">
      <StoryPanel text={storyText} choices={choices} onChoose={onChoose} onNarrate={onNarrate} />
    </div>
  );
}
