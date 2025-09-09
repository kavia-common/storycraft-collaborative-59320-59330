import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { UIProvider, useUI } from './UIContext';

function wrapper({ children }) {
  return <UIProvider>{children}</UIProvider>;
}

describe('UIContext', () => {
  test('provides default theme as light and toggles to dark and back', () => {
    const { result } = renderHook(() => useUI(), { wrapper });

    // initial state
    expect(result.current.theme).toBe('light');

    // toggle once -> dark
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('dark');

    // toggle again -> light
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('light');
  });

  test('controls Creation modal open/close', () => {
    const { result } = renderHook(() => useUI(), { wrapper });

    expect(result.current.creationOpen).toBe(false);

    act(() => {
      result.current.openCreation();
    });
    expect(result.current.creationOpen).toBe(true);

    act(() => {
      result.current.closeCreation();
    });
    expect(result.current.creationOpen).toBe(false);
  });

  test('controls Browse modal open/close', () => {
    const { result } = renderHook(() => useUI(), { wrapper });

    expect(result.current.browseOpen).toBe(false);

    act(() => {
      result.current.openBrowse();
    });
    expect(result.current.browseOpen).toBe(true);

    act(() => {
      result.current.closeBrowse();
    });
    expect(result.current.browseOpen).toBe(false);
  });

  test('controls Narration modal open/close and sets narration text', () => {
    const { result } = renderHook(() => useUI(), { wrapper });

    expect(result.current.narrationOpen).toBe(false);
    expect(result.current.narrationText).toBe('');

    const text = 'Once upon a time...';
    act(() => {
      result.current.openNarration(text);
    });
    expect(result.current.narrationOpen).toBe(true);
    expect(result.current.narrationText).toBe(text);

    act(() => {
      result.current.closeNarration();
    });
    expect(result.current.narrationOpen).toBe(false);

    // Also allow updating narration text directly via setter exposed in context
    const another = 'New narration';
    act(() => {
      result.current.setNarrationText(another);
    });
    expect(result.current.narrationText).toBe(another);
  });
});
