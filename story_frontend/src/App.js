import React from 'react';
import './App.css';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { HomePage } from './pages/HomePage';
import { CreatePage } from './pages/CreatePage';
import { PlayPage } from './pages/PlayPage';
import { LibraryPage } from './pages/LibraryPage';
import { AuthPage } from './pages/AuthPage';
import { useAuth } from './state/AuthContext';
import { NarrationModal } from './components/modals/NarrationModal';
import { BrowseModal } from './components/modals/BrowseModal';
import { CreationModal } from './components/modals/CreationModal';
import { useUI } from './state/UIContext';

// PUBLIC_INTERFACE
function App() {
  /**
   * Main application entry that wires layout, routes, and modal overlays.
   * Routes:
   * - / -> Home
   * - /create -> Genre/Theme + Character creation
   * - /play/:sessionId? -> Story play with branching choices and multiplayer voting
   * - /library -> Community library browse/share/remix
   * - /auth -> Sign in / Sign up
   */
  const { user } = useAuth();
  const location = useLocation();
  const { theme } = useUI();

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const showSidebar = location.pathname.startsWith('/play') || location.pathname.startsWith('/create');

  return (
    <div className="app-root">
      <Header />
      <main className="app-main">
        {showSidebar && <aside className="app-sidebar"><Sidebar /></aside>}
        <section className="app-content" role="main" aria-live="polite">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={user ? <CreatePage /> : <Navigate to="/auth" replace />} />
            <Route path="/play" element={<PlayPage />} />
            <Route path="/play/:sessionId" element={<PlayPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </section>
      </main>
      <StatusBar />
      {/* Global Modals */}
      <CreationModal />
      <NarrationModal />
      <BrowseModal />
    </div>
  );
}

export default App;
