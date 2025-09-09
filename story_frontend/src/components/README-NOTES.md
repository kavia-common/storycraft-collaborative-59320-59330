WebSocket usage notes:
- Client connects using REACT_APP_SOCKET_URL with query param sessionId and auth token.
- Events expected:
  - 'session:update' { text, choices }
  - 'vote:update' [ { id, text, votes }, ... ]
- Client emits:
  - 'vote' { sessionId, choiceId }

Ensure backend broadcasts on these channels per session room.
