const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// User Model
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'user' }
}, { tableName: 'users', timestamps: true });

// Research Assistant
const Research = sequelize.define('Research', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  query: { type: DataTypes.TEXT, allowNull: false },
  summary: { type: DataTypes.TEXT },
  sources: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  category: { type: DataTypes.STRING },
  tags: { type: DataTypes.STRING }
}, { tableName: 'researches', timestamps: true });

// Auto-fill Templates
const AutoFill = sequelize.define('AutoFill', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  formType: { type: DataTypes.STRING, allowNull: false },
  fieldMappings: { type: DataTypes.TEXT },
  websiteUrl: { type: DataTypes.STRING },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  usageCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  category: { type: DataTypes.STRING }
}, { tableName: 'autofills', timestamps: true });

// Content Summarizer
const Summary = sequelize.define('Summary', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  originalUrl: { type: DataTypes.STRING },
  originalContent: { type: DataTypes.TEXT, allowNull: false },
  summary: { type: DataTypes.TEXT },
  keyPoints: { type: DataTypes.TEXT },
  wordCount: { type: DataTypes.INTEGER },
  readTime: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING }
}, { tableName: 'summaries', timestamps: true });

// Tab Manager
const TabGroup = sequelize.define('TabGroup', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  tabs: { type: DataTypes.TEXT },
  tabCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  color: { type: DataTypes.STRING, defaultValue: '#4F46E5' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  category: { type: DataTypes.STRING }
}, { tableName: 'tab_groups', timestamps: true });

// Bookmark Organizer
const Bookmark = sequelize.define('Bookmark', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  url: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  folder: { type: DataTypes.STRING },
  tags: { type: DataTypes.STRING },
  favicon: { type: DataTypes.STRING },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'bookmarks', timestamps: true });

// Password Manager
const PasswordEntry = sequelize.define('PasswordEntry', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  siteName: { type: DataTypes.STRING, allowNull: false },
  siteUrl: { type: DataTypes.STRING, allowNull: false },
  username: { type: DataTypes.STRING, allowNull: false },
  encryptedPassword: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING },
  strength: { type: DataTypes.STRING },
  lastUsed: { type: DataTypes.DATE },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'password_entries', timestamps: true });

// Ad Blocker Rules
const AdBlockRule = sequelize.define('AdBlockRule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  pattern: { type: DataTypes.STRING, allowNull: false },
  ruleType: { type: DataTypes.STRING, allowNull: false },
  domain: { type: DataTypes.STRING },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  blockedCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  category: { type: DataTypes.STRING }
}, { tableName: 'ad_block_rules', timestamps: true });

// Reading List
const ReadingItem = sequelize.define('ReadingItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  url: { type: DataTypes.STRING, allowNull: false },
  excerpt: { type: DataTypes.TEXT },
  author: { type: DataTypes.STRING },
  estimatedReadTime: { type: DataTypes.STRING },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  priority: { type: DataTypes.STRING, defaultValue: 'medium' },
  category: { type: DataTypes.STRING },
  tags: { type: DataTypes.STRING }
}, { tableName: 'reading_items', timestamps: true });

// Translation Helper
const Translation = sequelize.define('Translation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  originalText: { type: DataTypes.TEXT, allowNull: false },
  translatedText: { type: DataTypes.TEXT },
  sourceLang: { type: DataTypes.STRING, allowNull: false },
  targetLang: { type: DataTypes.STRING, allowNull: false },
  sourceUrl: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING },
  isFavorite: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'translations', timestamps: true });

// Screenshot Annotator
const Screenshot = sequelize.define('Screenshot', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  sourceUrl: { type: DataTypes.STRING },
  annotations: { type: DataTypes.TEXT },
  tags: { type: DataTypes.STRING },
  format: { type: DataTypes.STRING, defaultValue: 'png' },
  category: { type: DataTypes.STRING }
}, { tableName: 'screenshots', timestamps: true });

// Email Templates
const EmailTemplate = sequelize.define('EmailTemplate', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  subject: { type: DataTypes.STRING, allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.STRING },
  tone: { type: DataTypes.STRING },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  usageCount: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'email_templates', timestamps: true });

// Price Tracker
const PriceTracker = sequelize.define('PriceTracker', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productName: { type: DataTypes.STRING, allowNull: false },
  productUrl: { type: DataTypes.STRING, allowNull: false },
  currentPrice: { type: DataTypes.DECIMAL(10, 2) },
  targetPrice: { type: DataTypes.DECIMAL(10, 2) },
  priceHistory: { type: DataTypes.TEXT },
  store: { type: DataTypes.STRING },
  isTracking: { type: DataTypes.BOOLEAN, defaultValue: true },
  category: { type: DataTypes.STRING }
}, { tableName: 'price_trackers', timestamps: true });

// Grammar Checker
const GrammarCheck = sequelize.define('GrammarCheck', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  originalText: { type: DataTypes.TEXT, allowNull: false },
  correctedText: { type: DataTypes.TEXT },
  corrections: { type: DataTypes.TEXT },
  errorCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  sourceUrl: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING }
}, { tableName: 'grammar_checks', timestamps: true });

// Citation Generator
const Citation = sequelize.define('Citation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  authors: { type: DataTypes.STRING },
  sourceUrl: { type: DataTypes.STRING },
  publicationDate: { type: DataTypes.STRING },
  publisher: { type: DataTypes.STRING },
  citationType: { type: DataTypes.STRING, defaultValue: 'APA' },
  formattedCitation: { type: DataTypes.TEXT },
  category: { type: DataTypes.STRING }
}, { tableName: 'citations', timestamps: true });

// Dark Mode Manager
const DarkModeRule = sequelize.define('DarkModeRule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  siteName: { type: DataTypes.STRING, allowNull: false },
  siteUrl: { type: DataTypes.STRING, allowNull: false },
  isEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  theme: { type: DataTypes.STRING, defaultValue: 'dark' },
  brightness: { type: DataTypes.INTEGER, defaultValue: 100 },
  contrast: { type: DataTypes.INTEGER, defaultValue: 100 },
  customCss: { type: DataTypes.TEXT },
  category: { type: DataTypes.STRING }
}, { tableName: 'dark_mode_rules', timestamps: true });

// ==================== NON-AI FEATURES ====================

// Notes
const Note = sequelize.define('Note', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT },
  folder: { type: DataTypes.STRING, defaultValue: 'General' },
  tags: { type: DataTypes.STRING },
  isPinned: { type: DataTypes.BOOLEAN, defaultValue: false },
  color: { type: DataTypes.STRING, defaultValue: '#1e293b' },
  category: { type: DataTypes.STRING }
}, { tableName: 'notes', timestamps: true });

// Todo List
const Todo = sequelize.define('Todo', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  priority: { type: DataTypes.STRING, defaultValue: 'medium' },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  dueDate: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING },
  tags: { type: DataTypes.STRING },
  isCompleted: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'todos', timestamps: true });

// Pomodoro Timer
const PomodoroSession = sequelize.define('PomodoroSession', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  taskName: { type: DataTypes.STRING, allowNull: false },
  workDuration: { type: DataTypes.INTEGER, defaultValue: 25 },
  breakDuration: { type: DataTypes.INTEGER, defaultValue: 5 },
  sessionsCompleted: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalMinutes: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  category: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'pomodoro_sessions', timestamps: true });

// Habit Tracker
const Habit = sequelize.define('Habit', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  frequency: { type: DataTypes.STRING, defaultValue: 'daily' },
  currentStreak: { type: DataTypes.INTEGER, defaultValue: 0 },
  longestStreak: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalCompletions: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  category: { type: DataTypes.STRING },
  color: { type: DataTypes.STRING, defaultValue: '#6366f1' }
}, { tableName: 'habits', timestamps: true });

// Expense Tracker
const Expense = sequelize.define('Expense', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  description: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  category: { type: DataTypes.STRING },
  paymentMethod: { type: DataTypes.STRING },
  date: { type: DataTypes.STRING },
  isRecurring: { type: DataTypes.BOOLEAN, defaultValue: false },
  tags: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'expenses', timestamps: true });

// Clipboard History
const ClipboardEntry = sequelize.define('ClipboardEntry', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  contentType: { type: DataTypes.STRING, defaultValue: 'text' },
  sourceUrl: { type: DataTypes.STRING },
  isFavorite: { type: DataTypes.BOOLEAN, defaultValue: false },
  category: { type: DataTypes.STRING },
  tags: { type: DataTypes.STRING }
}, { tableName: 'clipboard_entries', timestamps: true });

// Site Blocker
const BlockedSite = sequelize.define('BlockedSite', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  siteName: { type: DataTypes.STRING, allowNull: false },
  url: { type: DataTypes.STRING, allowNull: false },
  reason: { type: DataTypes.STRING },
  schedule: { type: DataTypes.STRING },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  blockedCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  category: { type: DataTypes.STRING }
}, { tableName: 'blocked_sites', timestamps: true });

// Quick Links
const QuickLink = sequelize.define('QuickLink', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  url: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  icon: { type: DataTypes.STRING },
  folder: { type: DataTypes.STRING, defaultValue: 'General' },
  clickCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isPinned: { type: DataTypes.BOOLEAN, defaultValue: false },
  category: { type: DataTypes.STRING }
}, { tableName: 'quick_links', timestamps: true });

// Session Saver
const SavedSession = sequelize.define('SavedSession', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  tabs: { type: DataTypes.TEXT },
  tabCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  windowCount: { type: DataTypes.INTEGER, defaultValue: 1 },
  isAutoSaved: { type: DataTypes.BOOLEAN, defaultValue: false },
  category: { type: DataTypes.STRING }
}, { tableName: 'saved_sessions', timestamps: true });

// Countdown Timer
const Countdown = sequelize.define('Countdown', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  targetDate: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  color: { type: DataTypes.STRING, defaultValue: '#6366f1' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  notifyBefore: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING }
}, { tableName: 'countdowns', timestamps: true });

// Color Palette
const ColorPalette = sequelize.define('ColorPalette', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  colors: { type: DataTypes.TEXT, allowNull: false },
  description: { type: DataTypes.TEXT },
  sourceUrl: { type: DataTypes.STRING },
  isFavorite: { type: DataTypes.BOOLEAN, defaultValue: false },
  tags: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING }
}, { tableName: 'color_palettes', timestamps: true });

// Snippet Manager
const Snippet = sequelize.define('Snippet', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  code: { type: DataTypes.TEXT, allowNull: false },
  language: { type: DataTypes.STRING, defaultValue: 'javascript' },
  description: { type: DataTypes.TEXT },
  tags: { type: DataTypes.STRING },
  usageCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isFavorite: { type: DataTypes.BOOLEAN, defaultValue: false },
  category: { type: DataTypes.STRING }
}, { tableName: 'snippets', timestamps: true });

// RSS Feed Reader
const RSSFeed = sequelize.define('RSSFeed', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  feedUrl: { type: DataTypes.STRING, allowNull: false },
  siteUrl: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  lastFetched: { type: DataTypes.STRING },
  itemCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  category: { type: DataTypes.STRING }
}, { tableName: 'rss_feeds', timestamps: true });

// Contact Manager
const Contact = sequelize.define('Contact', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  company: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
  isFavorite: { type: DataTypes.BOOLEAN, defaultValue: false },
  category: { type: DataTypes.STRING }
}, { tableName: 'contacts', timestamps: true });

// Workout Tracker
const Workout = sequelize.define('Workout', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  exerciseType: { type: DataTypes.STRING, allowNull: false },
  duration: { type: DataTypes.INTEGER },
  sets: { type: DataTypes.INTEGER },
  reps: { type: DataTypes.INTEGER },
  weight: { type: DataTypes.DECIMAL(10, 2) },
  calories: { type: DataTypes.INTEGER },
  notes: { type: DataTypes.TEXT },
  date: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING }
}, { tableName: 'workouts', timestamps: true });

module.exports = {
  sequelize,
  User,
  Research,
  AutoFill,
  Summary,
  TabGroup,
  Bookmark,
  PasswordEntry,
  AdBlockRule,
  ReadingItem,
  Translation,
  Screenshot,
  EmailTemplate,
  PriceTracker,
  GrammarCheck,
  Citation,
  DarkModeRule,
  Note,
  Todo,
  PomodoroSession,
  Habit,
  Expense,
  ClipboardEntry,
  BlockedSite,
  QuickLink,
  SavedSession,
  Countdown,
  ColorPalette,
  Snippet,
  RSSFeed,
  Contact,
  Workout
};
