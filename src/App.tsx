import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';

// Page Imports
import HomePage from './pages/HomePage';
import DirectoryPage from './pages/DirectoryPage';
import EventsPage from './pages/EventsPage';
import ReferencePage from './pages/ReferencePage';
import ResourceDetailPage from './pages/ResourceDetailPage';
import EventDetailPage from './pages/EventDetailPage';
import LoginPage from './pages/LoginPage';
import LeaderDashboard from './pages/LeaderDashboard';
import AboutPage from './pages/AboutPage';

function App() {
  const { user, loading, logout, theme, toggleTheme, lang, toggleLang } = useAuth();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
  }, [theme]);

  // CRITICAL: Prevent redirect logic until user role is loaded
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Verifying Credentials...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className={`App ${theme === 'dark' ? 'dark-mode' : ''}`}>
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-logo">
              <Link to="/">Cypress<span>Hub</span></Link>
            </div>
            
            <div className="nav-links">
              <Link to="/">{lang === 'en' ? 'Home' : 'Inicio'}</Link>
              <Link to="/directory">{lang === 'en' ? 'Directory' : 'Directorio'}</Link>
              <Link to="/events">{lang === 'en' ? 'Events' : 'Eventos'}</Link>
              {user?.role === 'leader' && (
                <Link to="/dashboard" className="admin-link">
                  {lang === 'en' ? 'Admin Dashboard' : 'Panel de Control'}
                </Link>
              )}
              <Link to="/references">{lang === 'en' ? 'References' : 'Referencias'}</Link>
              <Link to="/about">{lang === 'en' ? 'About' : 'Nosotros'}</Link>
            </div>
            
            <div className="nav-auth">
              <button onClick={toggleLang} className="nav-btn">
                🌐 {lang === 'en' ? 'Español' : 'English'}
              </button>
              <button onClick={toggleTheme} className="nav-btn theme-toggle">
                {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
              </button>

              {user ? (
                <div className="user-status">
                  <span className="user-tag">{user.role}</span>
                  <button onClick={logout} className="logout-btn">
                    {lang === 'en' ? 'Logout' : 'Salir'}
                  </button>
                </div>
              ) : (
                <Link to="/login" className="login-btn">
                  {lang === 'en' ? 'Login' : 'Ingresar'}
                </Link>
              )}
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/directory" element={<DirectoryPage />} />
          <Route path="/resource/:id" element={<ResourceDetailPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/event/:id" element={<EventDetailPage />} />
          
          <Route path="/login" element={
            user ? (user.role === 'leader' ? <Navigate replace to="/dashboard" /> : <Navigate replace to="/" />) : <LoginPage />
          } />

          <Route path="/dashboard" element={
            user?.role === 'leader' ? <LeaderDashboard /> : <Navigate replace to="/login" />
          } />
          
          <Route path="/references" element={<ReferencePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>

        <footer className="footer-modern">
          <div className="footer-content">
            <p>&copy; 2026 Cypress Community Resource Hub | TSA Webmaster Entry</p>
            <div className="footer-decoration"></div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;