/**
 * UI context to manage theme and modal visibilities.
 */
import React from 'react';

const UIContext = React.createContext(null);

// PUBLIC_INTERFACE
export function useUI() {
  /** Access UI state and actions. */
  return React.useContext(UIContext);
}

export function UIProvider({ children }) {
  const [theme, setTheme] = React.useState('light');

  // Modal states
  const [creationOpen, setCreationOpen] = React.useState(false);
  const [browseOpen, setBrowseOpen] = React.useState(false);
  const [narrationOpen, setNarrationOpen] = React.useState(false);
  const [narrationText, setNarrationText] = React.useState('');

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const openCreation = () => setCreationOpen(true);
  const closeCreation = () => setCreationOpen(false);
  const openBrowse = () => setBrowseOpen(true);
  const closeBrowse = () => setBrowseOpen(false);
  const openNarration = (text='') => { setNarrationText(text); setNarrationOpen(true); };
  const closeNarration = () => setNarrationOpen(false);

  const value = {
    theme, toggleTheme,
    creationOpen, openCreation, closeCreation,
    browseOpen, openBrowse, closeBrowse,
    narrationOpen, openNarration, closeNarration, narrationText, setNarrationText
  };
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
