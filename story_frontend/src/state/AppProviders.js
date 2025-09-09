import React from 'react';
import { AuthProvider } from './AuthContext';
import { UIProvider } from './UIContext';

// PUBLIC_INTERFACE
export function AppProviders({ children }) {
  /** Compose application-level providers. */
  return (
    <AuthProvider>
      <UIProvider>
        {children}
      </UIProvider>
    </AuthProvider>
  );
}
