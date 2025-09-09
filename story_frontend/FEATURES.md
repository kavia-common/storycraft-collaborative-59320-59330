# Story Frontend Features

- User authentication (email/password placeholders)
- Genre and theme selection
- Character creation
- AI-driven story progression via REST (fallback simulated)
- Branching choices UI
- Multiplayer session updates and voting via Socket.IO (client)
- Narration using Web Speech API with Howler fallback
- Save/bookmark/replay UI stubs
- Community library (browse, share, remix, rate UI)
- Responsive desktop and tablet layout

Environment:
- REACT_APP_API_BASE (required; set to API route prefix or full URL, e.g., /api or https://api.example.com/api)
- REACT_APP_SOCKET_URL
- REACT_APP_SITE_URL

Configuration notes:
- The frontend builds URLs as `${REACT_APP_API_BASE}/${resource}`. If your backend routes are served under a prefix (e.g., /api),
  set REACT_APP_API_BASE to that prefix to avoid 404 errors (e.g., POST /api/sessions).
- If your backend exposes routes at root (no prefix), set REACT_APP_API_BASE=/ to target /sessions, /auth/*, etc.

Replace endpoint paths in src/api/endpoints.js with your backend's routes if they differ. 
