import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || '';

/**
 * Initialize a namespaced socket connection and register event handlers.
 */
export function createSessionSocket(sessionId, token, handlers = {}) {
  const socket = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: { token },
    query: { sessionId }
  });

  // Default event bindings
  socket.on('connect', () => handlers.onConnect && handlers.onConnect(socket.id));
  socket.on('disconnect', (reason) => handlers.onDisconnect && handlers.onDisconnect(reason));
  socket.on('session:update', (payload) => handlers.onSessionUpdate && handlers.onSessionUpdate(payload));
  socket.on('vote:update', (payload) => handlers.onVoteUpdate && handlers.onVoteUpdate(payload));
  socket.on('error', (err) => handlers.onError && handlers.onError(err));

  return socket;
}
