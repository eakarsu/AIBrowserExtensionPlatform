import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAll } from '../services/api';

const features = [
  { key: 'researches', name: 'Research Assistant', icon: '🔬', desc: 'AI-powered research with source analysis', color: '#6366f1', path: '/researches' },
  { key: 'autofills', name: 'Auto-Fill Forms', icon: '📝', desc: 'Smart form auto-fill with AI suggestions', color: '#8b5cf6', path: '/autofills' },
  { key: 'summaries', name: 'Content Summarizer', icon: '📄', desc: 'Summarize web pages and articles instantly', color: '#06b6d4', path: '/summaries' },
  { key: 'tab-groups', name: 'Tab Manager', icon: '📑', desc: 'AI-organized tab groups and management', color: '#10b981', path: '/tab-groups' },
  { key: 'bookmarks', name: 'Bookmark Organizer', icon: '🔖', desc: 'Smart bookmark categorization and search', color: '#f59e0b', path: '/bookmarks' },
  { key: 'passwords', name: 'Password Manager', icon: '🔒', desc: 'Secure password storage and analysis', color: '#ef4444', path: '/passwords' },
  { key: 'adblock-rules', name: 'Ad Blocker Rules', icon: '🛡️', desc: 'AI-suggested ad blocking patterns', color: '#ec4899', path: '/adblock-rules' },
  { key: 'reading-items', name: 'Reading List', icon: '📚', desc: 'Save, organize and prioritize articles', color: '#14b8a6', path: '/reading-items' },
  { key: 'translations', name: 'Translation Helper', icon: '🌐', desc: 'AI-powered multi-language translation', color: '#3b82f6', path: '/translations' },
  { key: 'screenshots', name: 'Screenshot Annotator', icon: '📸', desc: 'Capture and annotate with AI insights', color: '#d946ef', path: '/screenshots' },
  { key: 'email-templates', name: 'Email Templates', icon: '✉️', desc: 'AI-generated professional email drafts', color: '#f97316', path: '/email-templates' },
  { key: 'price-trackers', name: 'Price Tracker', icon: '💰', desc: 'Track prices and get buying advice', color: '#22c55e', path: '/price-trackers' },
  { key: 'grammar-checks', name: 'Grammar Checker', icon: '✏️', desc: 'AI grammar and writing improvement', color: '#a855f7', path: '/grammar-checks' },
  { key: 'citations', name: 'Citation Generator', icon: '📖', desc: 'Generate formatted academic citations', color: '#0ea5e9', path: '/citations' },
  { key: 'darkmode-rules', name: 'Dark Mode Manager', icon: '🌙', desc: 'Smart dark mode with custom CSS rules', color: '#475569', path: '/darkmode-rules' },
  // Non-AI Features
  { key: 'notes', name: 'Notes', icon: '🗒️', desc: 'Take and organize notes with folders and tags', color: '#f59e0b', path: '/notes' },
  { key: 'todos', name: 'Todo List', icon: '✅', desc: 'Track tasks with priorities and due dates', color: '#10b981', path: '/todos' },
  { key: 'pomodoro-sessions', name: 'Pomodoro Timer', icon: '🍅', desc: 'Focus sessions with work and break intervals', color: '#ef4444', path: '/pomodoro-sessions' },
  { key: 'habits', name: 'Habit Tracker', icon: '🎯', desc: 'Build habits and track daily streaks', color: '#8b5cf6', path: '/habits' },
  { key: 'expenses', name: 'Expense Tracker', icon: '💳', desc: 'Track expenses and manage your budget', color: '#06b6d4', path: '/expenses' },
  { key: 'clipboard-entries', name: 'Clipboard History', icon: '📋', desc: 'Save and search your clipboard history', color: '#64748b', path: '/clipboard-entries' },
  { key: 'blocked-sites', name: 'Site Blocker', icon: '🚫', desc: 'Block distracting websites to stay focused', color: '#dc2626', path: '/blocked-sites' },
  { key: 'quick-links', name: 'Quick Links', icon: '🔗', desc: 'Save and organize frequently used links', color: '#2563eb', path: '/quick-links' },
  { key: 'saved-sessions', name: 'Session Saver', icon: '💾', desc: 'Save and restore browser tab sessions', color: '#7c3aed', path: '/saved-sessions' },
  { key: 'countdowns', name: 'Countdown Timer', icon: '⏳', desc: 'Countdown to important events and deadlines', color: '#e11d48', path: '/countdowns' },
  { key: 'color-palettes', name: 'Color Palette', icon: '🎨', desc: 'Save and organize color palettes for design', color: '#f43f5e', path: '/color-palettes' },
  { key: 'snippets', name: 'Snippet Manager', icon: '💻', desc: 'Store and reuse code snippets', color: '#059669', path: '/snippets' },
  { key: 'rss-feeds', name: 'RSS Feed Reader', icon: '📡', desc: 'Subscribe to and manage RSS feeds', color: '#ea580c', path: '/rss-feeds' },
  { key: 'contacts', name: 'Contact Manager', icon: '👤', desc: 'Store and organize your contacts', color: '#4f46e5', path: '/contacts' },
  { key: 'workouts', name: 'Workout Tracker', icon: '🏋️', desc: 'Log workouts and track fitness progress', color: '#16a34a', path: '/workouts' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    features.forEach(f => {
      getAll(f.key).then(res => {
        setCounts(prev => ({ ...prev, [f.key]: res.data.length }));
      }).catch(() => {});
    });
  }, []);

  const totalItems = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="dashboard-header">
        <h1>Welcome back, {user.name || 'User'}</h1>
        <p>Manage your AI-powered browser extensions</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">🧩</div>
          <div className="stat-value">30</div>
          <div className="stat-label">Active Features</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{totalItems}</div>
          <div className="stat-label">Total Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤖</div>
          <div className="stat-value">15</div>
          <div className="stat-label">AI Endpoints</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔧</div>
          <div className="stat-value">15</div>
          <div className="stat-label">Utility Features</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-value">Active</div>
          <div className="stat-label">System Status</div>
        </div>
      </div>

      <div className="feature-grid">
        {features.map(f => (
          <div
            key={f.key}
            className="feature-card"
            style={{ '--card-color': f.color }}
            onClick={() => navigate(f.path)}
          >
            <div className="card-icon" style={{ background: `${f.color}20` }}>
              {f.icon}
            </div>
            <h3>{f.name}</h3>
            <p>{f.desc}</p>
            <div className="card-count">
              {counts[f.key] !== undefined ? `${counts[f.key]} items` : 'Loading...'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
