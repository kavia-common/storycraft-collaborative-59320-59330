/**
 * High-level API wrapper. Replace paths as per backend OpenAPI once available.
 * All methods return JSON.
 *
 * NOTE:
 * - All paths here are resource paths (e.g., "/sessions"). The actual base and route prefix
 *   must be provided via REACT_APP_API_BASE (e.g., "/api" or "https://backend/app/api").
 * - If REACT_APP_API_BASE is not set, the client defaults to "/api" to avoid 404s on common setups.
 */
import { apiGet, apiPost, apiPut, apiDelete } from './client';

// PUBLIC_INTERFACE
export const AuthAPI = {
  /** email/password auth; replace with actual backend paths */
  login: (email, password) => apiPost('/auth/login', { email, password }),
  signup: (email, password, displayName) => apiPost('/auth/signup', { email, password, displayName }),
  me: (token) => apiGet('/auth/me', token),
  logout: (token) => apiPost('/auth/logout', {}, token)
};

// PUBLIC_INTERFACE
export const StoriesAPI = {
  genres: () => apiGet('/stories/genres'),
  createSession: (payload, token) => apiPost('/sessions', payload, token),
  getSession: (sessionId, token) => apiGet(`/sessions/${sessionId}`, token),
  progress: (sessionId, choiceId, token) => apiPost(`/sessions/${sessionId}/progress`, { choiceId }, token),
  saveBookmark: (sessionId, nodeId, token) => apiPost(`/sessions/${sessionId}/bookmark`, { nodeId }, token),
  replayFrom: (sessionId, nodeId, token) => apiPost(`/sessions/${sessionId}/replay`, { nodeId }, token),
  listCommunity: (params) => apiGet('/community', null, params),
  shareToCommunity: (sessionId, token) => apiPost(`/sessions/${sessionId}/share`, {}, token),
  remix: (communityId, token) => apiPost(`/community/${communityId}/remix`, {}, token),
  rate: (communityId, rating, token) => apiPost(`/community/${communityId}/rate`, { rating }, token),
};

// PUBLIC_INTERFACE
export const CharactersAPI = {
  create: (payload, token) => apiPost('/characters', payload, token),
  listMine: (token) => apiGet('/characters', token)
};
