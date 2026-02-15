import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import "./App.css";

import HomePage from "./pages/HomePage";
import DirectoryPage from "./pages/DirectoryPage";
import EventsPage from "./pages/EventsPage";
import ReferencePage from "./pages/ReferencePage";
import ResourceDetailPage from "./pages/ResourceDetailPage";
import EventDetailPage from "./pages/EventDetailPage";
import LoginPage from "./pages/LoginPage";
import LeaderDashboard from "./pages/LeaderDashboard";
import AboutPage from "./pages/AboutPage";

function NavBarContent() {
  const { user, logout, theme, toggleTheme } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string): string =>
    location.pathname === path ? "nav-link active" : "nav-link";

  const SunIcon = () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );

  const MoonIcon = () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );

  return (
    <>
      <nav className={`nav${scrolled ? " nav--scrolled" : ""}`}>
        <div className="nav__inner">
          <Link to="/" className="nav__logo">
            Cypress<span>Hub</span>
          </Link>

          <div className="nav__links">
            <Link to="/" className={isActive("/")}>
              Home
            </Link>
            <Link to="/directory" className={isActive("/directory")}>
              Directory
            </Link>
            <Link to="/events" className={isActive("/events")}>
              Events
            </Link>
            {user?.role === "leader" && (
              <Link to="/dashboard" className={isActive("/dashboard")}>
                Admin
              </Link>
            )}
            <Link to="/references" className={isActive("/references")}>
              References
            </Link>
            <Link to="/about" className={isActive("/about")}>
              About
            </Link>
          </div>

          <div className="nav__right">
            {user && <span className="nav__badge">{user.role}</span>}
            <button
              onClick={toggleTheme}
              className="nav__icon-btn"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? <MoonIcon /> : <SunIcon />}
            </button>
            {user ? (
              <button onClick={logout} className="nav__btn nav__btn--logout">
                Logout
              </button>
            ) : (
              <Link to="/login" className="nav__btn nav__btn--login">
                Login
              </Link>
            )}
            <button
              className="nav__hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <div className={`nav__hamb-lines ${menuOpen ? "active" : ""}`}>
                <span />
                <span />
                <span />
              </div>
            </button>
          </div>
        </div>
      </nav>

      <div className={`nav__drawer ${menuOpen ? "nav__drawer--open" : ""}`}>
        <Link
          to="/"
          className={isActive("/")}
          onClick={() => setMenuOpen(false)}
        >
          Home
        </Link>
        <Link
          to="/directory"
          className={isActive("/directory")}
          onClick={() => setMenuOpen(false)}
        >
          Directory
        </Link>
        <Link
          to="/events"
          className={isActive("/events")}
          onClick={() => setMenuOpen(false)}
        >
          Events
        </Link>
        {user?.role === "leader" && (
          <Link
            to="/dashboard"
            className={isActive("/dashboard")}
            onClick={() => setMenuOpen(false)}
          >
            Admin
          </Link>
        )}
        <Link
          to="/references"
          className={isActive("/references")}
          onClick={() => setMenuOpen(false)}
        >
          References
        </Link>
        <Link
          to="/about"
          className={isActive("/about")}
          onClick={() => setMenuOpen(false)}
        >
          About
        </Link>
      </div>
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const { loading, theme } = useAuth();

  useEffect(() => {
    document.documentElement.className =
      theme === "dark" ? "dark-mode" : "light-mode";
  }, [theme]);

  if (loading) return null;

  return (
    <Router>
      <ScrollToTop />
      <div className="site-wrapper">
        <NavBarContent />
        <main className="content-area">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/directory" element={<DirectoryPage />} />
            <Route path="/resource/:id" element={<ResourceDetailPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/event/:id" element={<EventDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<LeaderDashboard />} />
            <Route path="/references" element={<ReferencePage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
