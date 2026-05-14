import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import Extensions from './pages/Extensions'; // Apply pass 5
import { featureConfigs } from './pages/featureConfigs';

const navItems = [
  { path: '/', icon: '🏠', label: 'Dashboard' },
  { path: '/researches', icon: '🔬', label: 'Research Assistant' },
  { path: '/autofills', icon: '📝', label: 'Auto-Fill Forms' },
  { path: '/summaries', icon: '📄', label: 'Content Summarizer' },
  { path: '/tab-groups', icon: '📑', label: 'Tab Manager' },
  { path: '/bookmarks', icon: '🔖', label: 'Bookmark Organizer' },
  { path: '/passwords', icon: '🔒', label: 'Password Manager' },
  { path: '/adblock-rules', icon: '🛡️', label: 'Ad Blocker Rules' },
  { path: '/reading-items', icon: '📚', label: 'Reading List' },
  { path: '/translations', icon: '🌐', label: 'Translation Helper' },
  { path: '/screenshots', icon: '📸', label: 'Screenshot Annotator' },
  { path: '/email-templates', icon: '✉️', label: 'Email Templates' },
  { path: '/price-trackers', icon: '💰', label: 'Price Tracker' },
  { path: '/grammar-checks', icon: '✏️', label: 'Grammar Checker' },
  { path: '/citations', icon: '📖', label: 'Citation Generator' },
  { path: '/darkmode-rules', icon: '🌙', label: 'Dark Mode Manager' },
  // Non-AI Features
  { path: '/notes', icon: '🗒️', label: 'Notes' },
  { path: '/todos', icon: '✅', label: 'Todo List' },
  { path: '/pomodoro-sessions', icon: '🍅', label: 'Pomodoro Timer' },
  { path: '/habits', icon: '🎯', label: 'Habit Tracker' },
  { path: '/expenses', icon: '💳', label: 'Expense Tracker' },
  { path: '/clipboard-entries', icon: '📋', label: 'Clipboard History' },
  { path: '/blocked-sites', icon: '🚫', label: 'Site Blocker' },
  { path: '/quick-links', icon: '🔗', label: 'Quick Links' },
  { path: '/saved-sessions', icon: '💾', label: 'Session Saver' },
  { path: '/countdowns', icon: '⏳', label: 'Countdown Timer' },
  { path: '/color-palettes', icon: '🎨', label: 'Color Palette' },
  { path: '/snippets', icon: '💻', label: 'Snippet Manager' },
  { path: '/rss-feeds', icon: '📡', label: 'RSS Feed Reader' },
  { path: '/contacts', icon: '👤', label: 'Contact Manager' },
  { path: '/workouts', icon: '🏋️', label: 'Workout Tracker' },
  // ===== NEW (Proposed) AI Features =====
  { path: '/email-scans', icon: '🛡️', label: 'Email Security Scanner' },
  { path: '/invoice-scans', icon: '🧾', label: 'Invoice OCR Analyzer' },
  { path: '/meeting-transcripts', icon: '🎙️', label: 'Meeting Summarizer' },
  { path: '/code-snippets', icon: '💡', label: 'Code Explainer' },
  { path: '/resume-reviews', icon: '📄', label: 'Resume Enhancer' },
  { path: '/contract-reviews', icon: '⚖️', label: 'Contract Reviewer' },
  { path: '/health-claims', icon: '🩺', label: 'Health Claim Validator' },
  { path: '/competitor-monitors', icon: '📈', label: 'Competitor Monitor' },
  // Apply pass 5
  { path: '/extensions', icon: '🧩', label: 'Extensions (agent / RAG / white-label)' },
];

function AppLayout({ onLogout }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">AI</div>
          <div>
            <h2>AI Browser Ext</h2>
            <p>Extension Platform</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="sidebar-user-avatar">
              {(user.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="sidebar-user-name">{user.name || 'User'}</div>
              <div className="sidebar-user-email">{user.email || ''}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Sign Out">
            ⏻
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/extensions" element={<Extensions />} />{/* Apply pass 5 */}
          {Object.entries(featureConfigs).map(([key, config]) => (
            <Route
              key={key}
              path={`/${key}`}
              element={<FeaturePage config={config} />}
            />
          ))}
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('user');
    if (token && saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <AppLayout onLogout={() => setUser(null)} />
    </Router>
  );
}
