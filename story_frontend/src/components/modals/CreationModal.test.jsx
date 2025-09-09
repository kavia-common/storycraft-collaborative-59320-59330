import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// We will mock the hooks that CreationModal relies on to control modal visibility and auth token.
jest.mock('../../state/UIContext', () => {
  return {
    useUI: jest.fn(),
  };
});

jest.mock('../../state/AuthContext', () => {
  return {
    useAuth: jest.fn(),
  };
});

// Mock the API layer used by CreationModal
jest.mock('../../api/endpoints', () => {
  return {
    StoriesAPI: {
      genres: jest.fn(),
      createSession: jest.fn(),
    },
    CharactersAPI: {
      create: jest.fn(),
    }
  };
});

import { useUI } from '../../state/UIContext';
import { useAuth } from '../../state/AuthContext';
import { StoriesAPI, CharactersAPI } from '../../api/endpoints';
import { CreationModal } from './CreationModal';

function renderWithRouter(ui, initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        {/* Render the modal on all paths to capture navigation calls */}
        <Route path="*" element={ui} />
        {/* destination route for navigate after success */}
        <Route path="/play/:sessionId" element={<div>Play Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CreationModal', () => {
  const closeCreation = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks
    useUI.mockReturnValue({
      creationOpen: true,
      closeCreation,
    });
    useAuth.mockReturnValue({
      token: 'fake-token',
    });

    // Default API mocks
    StoriesAPI.genres.mockResolvedValue(['Fantasy', 'Sci-Fi']); // may be ignored by component if empty handling
  });

  test('selecting "Other..." shows custom genre input and disables create until filled', async () => {
    const user = userEvent.setup();

    renderWithRouter(<CreationModal />);

    // Ensure modal is open and genre select is present
    const genreSelect = await screen.findByLabelText(/Select a genre/i);
    expect(genreSelect).toBeInTheDocument();

    // Choose Other...
    await user.selectOptions(genreSelect, '__OTHER__');

    // Custom genre field should appear
    const customGenre = await screen.findByLabelText(/Custom genre/i);
    expect(customGenre).toBeInTheDocument();

    // Create button should be disabled while custom genre empty
    const createBtn = screen.getByRole('button', { name: /Create & Start/i });
    expect(createBtn).toBeDisabled();

    // Fill custom genre
    await user.type(customGenre, 'Steampunk Mystery');

    // Now button should be enabled
    expect(createBtn).not.toBeDisabled();
  });

  test('onCreate success: creates character, creates session, closes modal, and navigates', async () => {
    const user = userEvent.setup();

    // Mock successful character creation and session creation
    CharactersAPI.create.mockResolvedValueOnce({ id: 'char-1' });
    StoriesAPI.createSession.mockResolvedValueOnce({ id: 'sess-42' });

    renderWithRouter(<CreationModal />);

    // Select "Other..." to also test custom genre path enables
    const genreSelect = await screen.findByLabelText(/Select a genre/i);
    await user.selectOptions(genreSelect, '__OTHER__');
    const customGenre = await screen.findByLabelText(/Custom genre/i);
    await user.type(customGenre, 'Cozy Noir');

    // Click Create
    await user.click(screen.getByRole('button', { name: /Create & Start/i }));

    // API calls should be made with expected payloads
    await waitFor(() => {
      expect(CharactersAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.any(String),
          traits: expect.any(String),
        }),
        'fake-token'
      );
    });

    await waitFor(() => {
      expect(StoriesAPI.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          genre: 'Cozy Noir',
          theme: expect.any(String),
          characterId: 'char-1',
        }),
        'fake-token'
      );
    });

    // Should close modal
    expect(closeCreation).toHaveBeenCalled();

    // Should navigate to /play/sess-42
    expect(await screen.findByText('Play Page')).toBeInTheDocument();
  });

  test('onCreate success with no character (character API fails silently) still navigates after session create', async () => {
    const user = userEvent.setup();

    // Character creation fails: component ignores and proceeds
    CharactersAPI.create.mockRejectedValueOnce(new Error('char failed'));
    StoriesAPI.createSession.mockResolvedValueOnce({ sessionId: 'SID-999' });

    renderWithRouter(<CreationModal />);

    // Keep default genre (Fantasy), just create
    await user.click(await screen.findByRole('button', { name: /Create & Start/i }));

    await waitFor(() => {
      expect(StoriesAPI.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          genre: 'Fantasy',
          theme: expect.any(String),
          characterId: null,
        }),
        'fake-token'
      );
    });

    // Close and navigate
    expect(closeCreation).toHaveBeenCalled();
    expect(await screen.findByText('Play Page')).toBeInTheDocument();
  });

  test('onCreate failure: shows error and does not navigate', async () => {
    const user = userEvent.setup();

    CharactersAPI.create.mockResolvedValueOnce({ id: 'char-2' });
    StoriesAPI.createSession.mockRejectedValueOnce(new Error('Failed to create session.'));

    renderWithRouter(<CreationModal />);

    // Create with defaults
    await user.click(await screen.findByRole('button', { name: /Create & Start/i }));

    // Error should show
    expect(await screen.findByText(/Failed to create session\\./i)).toBeInTheDocument();

    // Should not navigate (Play Page absent) and should not close modal
    expect(screen.queryByText('Play Page')).not.toBeInTheDocument();
    expect(closeCreation).not.toHaveBeenCalled();
  });
});
