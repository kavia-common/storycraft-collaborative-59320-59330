import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LibraryPage } from './LibraryPage';
import { AppProviders } from '../state/AppProviders';

// Mock endpoints module
jest.mock('../api/endpoints', () => {
  return {
    StoriesAPI: {
      listCommunity: jest.fn(),
      rate: jest.fn(),
      remix: jest.fn(),
    },
    // export other named APIs if needed by providers (no-ops)
    AuthAPI: {
      me: jest.fn().mockResolvedValue({ id: 'u1', name: 'Tester' }),
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
    }
  };
});

describe('LibraryPage', () => {
  const { StoriesAPI } = require('../api/endpoints');

  const renderWithProviders = (ui) => {
    return render(<AppProviders>{ui}</AppProviders>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders empty state when no community stories', async () => {
    StoriesAPI.listCommunity.mockResolvedValueOnce([]);

    renderWithProviders(<LibraryPage />);

    // title renders
    expect(screen.getByText(/Community Library/i)).toBeInTheDocument();

    // await empty state
    await waitFor(() =>
      expect(screen.getByText(/No community stories yet/i)).toBeInTheDocument()
    );
  });

  test('renders community stories returned by API', async () => {
    const items = [
      { id: 'c1', title: 'Haunted Forest', author: 'Riley', rating: 3, remixes: 2 },
      { id: 'c2', genre: 'Sci-Fi', author: 'Casey', rating: 5, remixes: 10 }, // no title -> uses genre
    ];
    StoriesAPI.listCommunity.mockResolvedValueOnce(items);

    renderWithProviders(<LibraryPage />);

    // Wait for both cards to render
    const card1 = await screen.findByText('Haunted Forest');
    expect(card1).toBeInTheDocument();

    // Second card should use genre as title fallback
    expect(screen.getByText('Sci-Fi')).toBeInTheDocument();

    // Verify author text and rating/remix pills are present
    expect(screen.getByText(/Riley/)).toBeInTheDocument();
    expect(screen.getByText(/Casey/)).toBeInTheDocument();

    // rating pills: "⭐ 3" and "⭐ 5"
    expect(screen.getByText(/⭐ 3/)).toBeInTheDocument();
    expect(screen.getByText(/⭐ 5/)).toBeInTheDocument();

    // remix pills: "🔁 2" and "🔁 10"
    expect(screen.getByText(/🔁 2/)).toBeInTheDocument();
    expect(screen.getByText(/🔁 10/)).toBeInTheDocument();

    // Each card should have "+ Rate" and "Remix" buttons
    const rateButtons = screen.getAllByRole('button', { name: /\+ Rate/i });
    const remixButtons = screen.getAllByRole('button', { name: /Remix/i });
    expect(rateButtons.length).toBe(2);
    expect(remixButtons.length).toBe(2);
  });

  test('clicking + Rate calls StoriesAPI.rate with incremented rating and triggers reload', async () => {
    const items = [{ id: 'c1', title: 'Test Story', author: 'A', rating: 2, remixes: 0 }];
    // The first load returns one item
    StoriesAPI.listCommunity.mockResolvedValueOnce(items);
    // After rating, second load occurs; simulate updated rating
    StoriesAPI.listCommunity.mockResolvedValueOnce([{ ...items[0], rating: 3 }]);

    StoriesAPI.rate.mockResolvedValueOnce({ ok: true });

    renderWithProviders(<LibraryPage />);

    // Wait for story to appear
    const title = await screen.findByText('Test Story');
    expect(title).toBeInTheDocument();

    const card = title.closest('.card');
    const rateBtn = within(card).getByRole('button', { name: /\+ Rate/i });

    await userEvent.click(rateBtn);

    // rate called with id 'c1' and rating incremented to 3; token may be null during tests
    await waitFor(() => {
      expect(StoriesAPI.rate).toHaveBeenCalledWith('c1', 3, null);
    });

    // After reload, updated rating pill should be visible
    await waitFor(() => {
      expect(screen.getByText(/⭐ 3/)).toBeInTheDocument();
    });
  });

  test('clicking Remix calls StoriesAPI.remix and shows alert on success', async () => {
    const items = [{ id: 'c1', title: 'Remixable', author: 'B', rating: 4, remixes: 1 }];
    StoriesAPI.listCommunity.mockResolvedValueOnce(items);
    StoriesAPI.remix.mockResolvedValueOnce({ ok: true });

    // Mock window.alert since component uses alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    renderWithProviders(<LibraryPage />);

    const title = await screen.findByText('Remixable');
    const card = title.closest('.card');
    const remixBtn = within(card).getByRole('button', { name: /Remix/i });

    await userEvent.click(remixBtn);

    await waitFor(() => {
      expect(StoriesAPI.remix).toHaveBeenCalledWith('c1', null);
    });

    expect(alertSpy).toHaveBeenCalledWith('Remix created! Check your sessions.');
    alertSpy.mockRestore();
  });
});
