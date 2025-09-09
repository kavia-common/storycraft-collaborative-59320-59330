import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock useUI hook to control modal state and text
jest.mock('../../state/UIContext', () => {
  return {
    useUI: jest.fn(),
  };
});

// Mock Narrator to intercept narrateText calls
jest.mock('../story/Narrator', () => {
  return {
    narrateText: jest.fn(),
  };
});

// Mock howler to avoid actual audio creation in fallback
jest.mock('howler', () => {
  return {
    Howl: jest.fn().mockImplementation(() => ({
      play: jest.fn(),
    })),
  };
});

import { useUI } from '../../state/UIContext';
import { narrateText } from '../story/Narrator';
import { NarrationModal } from './NarrationModal';

describe('NarrationModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default UI state: modal open with some text
    useUI.mockReturnValue({
      narrationOpen: true,
      closeNarration: jest.fn(),
      narrationText: 'Once upon a time in a cozy village...',
      setNarrationText: jest.fn(),
    });

    // Ensure Web Speech API is present but mocked to do nothing
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak: jest.fn(),
        cancel: jest.fn(),
        getVoices: jest.fn(() => []),
      },
    });
    // Provide global constructor mock for utterance
    // Some environments may not have this defined - we stub it.
    // It is not used directly by NarrationModal test since we mock narrateText, but safe to add.
    // eslint-disable-next-line no-undef
    global.SpeechSynthesisUtterance = function (text) {
      this.text = text;
    };
  });

  test('clicking Play calls narrateText with current narrationText', async () => {
    const user = userEvent.setup();

    render(<NarrationModal />);

    // Assert modal content exists
    expect(screen.getByRole('dialog', { name: /Narration/i })).toBeInTheDocument();
    const playButton = screen.getByRole('button', { name: /Play/i });
    expect(playButton).toBeInTheDocument();

    await user.click(playButton);

    expect(narrateText).toHaveBeenCalledTimes(1);
    expect(narrateText).toHaveBeenCalledWith('Once upon a time in a cozy village...');
  });

  test('updates text area and uses updated value when narrating', async () => {
    const user = userEvent.setup();

    // Provide a setter mock to simulate state updates
    const setNarrationText = jest.fn();
    useUI.mockReturnValue({
      narrationOpen: true,
      closeNarration: jest.fn(),
      narrationText: '',
      setNarrationText,
    });

    render(<NarrationModal />);

    const textarea = screen.getByPlaceholderText(/Paste or generate text to narrate/i);
    await user.type(textarea, 'New story line');
    // The component calls setNarrationText on change; we verify setter called with full typed text
    expect(setNarrationText).toHaveBeenLastCalledWith('New story line');

    // For this test, simulate that the UI context now holds the updated text, and click Play.
    // Since the component captured narrationText from hook at render time, we re-render with updated value.
    useUI.mockReturnValue({
      narrationOpen: true,
      closeNarration: jest.fn(),
      narrationText: 'New story line',
      setNarrationText,
    });
    // Re-render with new hook return
    render(<NarrationModal />);

    await user.click(screen.getByRole('button', { name: /Play/i }));

    expect(narrateText).toHaveBeenCalledWith('New story line');
  });

  test('does not throw when Web Speech API is not available (fallback path mocked)', async () => {
    const user = userEvent.setup();

    // Remove speechSynthesis to go down fallback path if narrateText were used directly.
    // We still mock narrateText, so this primarily ensures the modal interaction is safe even without Web Speech.
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: undefined,
    });

    render(<NarrationModal />);

    await user.click(screen.getByRole('button', { name: /Play/i }));

    // We still expect narrateText to be called with current text
    expect(narrateText).toHaveBeenCalledWith('Once upon a time in a cozy village...');
  });
});
