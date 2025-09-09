import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProviders } from '../state/AppProviders';
import { PlayPage } from './PlayPage';

// Mock socket.io-client used by createSessionSocket
jest.mock('../api/socket', () => {
  const handlersStore = {};
  const fakeSocket = {
    emit: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn((event, handler) => {
      handlersStore[event] = handler; // allow tests to trigger later
    }),
    _trigger(event, payload) {
      if (handlersStore[event]) handlersStore[event](payload);
    }
  };
  return {
    createSessionSocket: jest.fn(() => fakeSocket),
    __socket: fakeSocket // exported for tests to access
  };
});

// Mock StoriesAPI endpoints used by PlayPage
jest.mock('../api/endpoints', () => {
  return {
    StoriesAPI: {
      getSession: jest.fn(),
      progress: jest.fn()
    }
  };
});

function renderWithRoute(initialPath) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppProviders>
        <Routes>
          <Route path="/play" element={<PlayPage />} />
          <Route path="/play/:sessionId" element={<PlayPage />} />
        </Routes>
      </AppProviders>
    </MemoryRouter>
  );
}

describe('PlayPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes without sessionId using local mock data', async () => {
    renderWithRoute('/play');

    // Initial text and choices should appear (local mock)
    await waitFor(() => {
      expect(
        screen.getByText(/You awaken in a forest as dawn breaks/i)
      ).toBeInTheDocument();
    });

    // There should be two choices
    const choice1 = screen.getByRole('button', { name: /Follow the sunlit path/i });
    const choice2 = screen.getByRole('button', { name: /Venture into the shadows/i });
    expect(choice1).toBeInTheDocument();
    expect(choice2).toBeInTheDocument();
  });

  test('initializes with sessionId and shows server-provided story and choices', async () => {
    const { StoriesAPI } = require('../api/endpoints');
    // Mock getSession result
    StoriesAPI.getSession.mockResolvedValueOnce({
      current: {
        text: 'At the cliff edge, the wind howls.',
        choices: [
          { id: 'a', text: 'Climb down', votes: 2 },
          { id: 'b', text: 'Call for help', votes: 1 }
        ]
      }
    });

    renderWithRoute('/play/abc123');

    // Expect server-provided text and choices
    expect(await screen.findByText(/At the cliff edge, the wind howls/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Climb down/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Call for help/i })).toBeInTheDocument();
  });

  test('user makes a choice -> emits socket vote and updates UI from progress API', async () => {
    const { StoriesAPI } = require('../api/endpoints');
    const { __socket } = require('../api/socket');

    // Setup initial session via API
    StoriesAPI.getSession.mockResolvedValueOnce({
      current: {
        text: 'You stand at a crossroads.',
        choices: [
          { id: 'left', text: 'Go left', votes: 0 },
          { id: 'right', text: 'Go right', votes: 0 }
        ]
      }
    });

    // Progress returns next text and choices
    StoriesAPI.progress.mockResolvedValueOnce({
      text: 'You chose left. The forest thickens.',
      choices: [
        { id: 'n1', text: 'Press on bravely', votes: 0 },
        { id: 'n2', text: 'Take a cautious detour', votes: 0 }
      ]
    });

    renderWithRoute('/play/sid-789');

    // Wait for initial state
    expect(await screen.findByText(/You stand at a crossroads/i)).toBeInTheDocument();

    // Click a choice
    await userEvent.click(screen.getByRole('button', { name: /Go left/i }));

    // Socket should emit vote with the given sessionId and choiceId
    await waitFor(() => {
      expect(__socket.emit).toHaveBeenCalledWith('vote', { sessionId: 'sid-789', choiceId: 'left' });
    });

    // UI should reflect progress response
    expect(await screen.findByText(/You chose left\. The forest thickens\./i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Press on bravely/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Take a cautious detour/i })).toBeInTheDocument();
  });

  test('socket vote:update updates choice button vote counts', async () => {
    const { StoriesAPI } = require('../api/endpoints');
    const { __socket } = require('../api/socket');

    // Initial session
    StoriesAPI.getSession.mockResolvedValueOnce({
      current: {
        text: 'A river blocks your path.',
        choices: [
          { id: 'wade', text: 'Wade through', votes: 0 },
          { id: 'bridge', text: 'Look for a bridge', votes: 0 }
        ]
      }
    });

    renderWithRoute('/play/river-1');

    // Wait for initial render
    expect(await screen.findByText(/A river blocks your path/i)).toBeInTheDocument();

    // Initially no vote counts shown (0)
    expect(screen.getByRole('button', { name: /Wade through/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Look for a bridge/i })).toBeInTheDocument();

    // Simulate server pushing vote update via socket
    // ChoiceButtons renders "text (votes)" if number; ensure numbers are shown after update
    __socket._trigger('vote:update', [
      { id: 'wade', text: 'Wade through', votes: 3 },
      { id: 'bridge', text: 'Look for a bridge', votes: 1 }
    ]);

    // Verify the UI updates with new vote counts
    expect(await screen.findByRole('button', { name: /Wade through/i })).toHaveTextContent(/Wade through \(3\)/i);
    expect(screen.getByRole('button', { name: /Look for a bridge/i })).toHaveTextContent(/Look for a bridge \(1\)/i);
  });

  test('narrate button is present and callable', async () => {
    renderWithRoute('/play');

    // Wait local text to load
    expect(await screen.findByText(/You awaken in a forest/i)).toBeInTheDocument();

    // Narrate button should be present from StoryPanel
    const narrate = screen.getByRole('button', { name: /Narrate/i });
    expect(narrate).toBeInTheDocument();

    // Clicking it should not throw and should remain in the document
    await userEvent.click(narrate);
    expect(narrate).toBeInTheDocument();
  });
});
