const express = require('express');
const router = express.Router();
const models = require('../models');

// Allowed fields per model — prevents mass-assignment of internal/system fields
const allowedFields = {
  researches: ['title', 'query', 'summary', 'sources', 'status', 'category', 'tags'],
  autofills: ['name', 'formType', 'fieldMappings', 'websiteUrl', 'isActive', 'usageCount', 'category'],
  summaries: ['title', 'originalUrl', 'originalContent', 'summary', 'keyPoints', 'wordCount', 'readTime', 'category'],
  'tab-groups': ['name', 'description', 'tabs', 'tabCount', 'color', 'isActive', 'category'],
  bookmarks: ['title', 'url', 'description', 'folder', 'tags', 'favicon', 'isActive'],
  passwords: ['siteName', 'siteUrl', 'username', 'encryptedPassword', 'category', 'strength', 'lastUsed', 'notes'],
  'adblock-rules': ['name', 'pattern', 'ruleType', 'domain', 'isActive', 'blockedCount', 'category'],
  'reading-items': ['title', 'url', 'excerpt', 'author', 'estimatedReadTime', 'isRead', 'priority', 'category', 'tags'],
  translations: ['originalText', 'translatedText', 'sourceLang', 'targetLang', 'sourceUrl', 'category', 'isFavorite'],
  screenshots: ['title', 'description', 'sourceUrl', 'annotations', 'tags', 'format', 'category'],
  'email-templates': ['name', 'subject', 'body', 'category', 'tone', 'isActive', 'usageCount'],
  'price-trackers': ['productName', 'productUrl', 'currentPrice', 'targetPrice', 'priceHistory', 'store', 'isTracking', 'category'],
  'grammar-checks': ['title', 'originalText', 'correctedText', 'corrections', 'errorCount', 'sourceUrl', 'category'],
  citations: ['title', 'authors', 'sourceUrl', 'publicationDate', 'publisher', 'citationType', 'formattedCitation', 'category'],
  'darkmode-rules': ['siteName', 'siteUrl', 'isEnabled', 'theme', 'brightness', 'contrast', 'customCss', 'category'],
  notes: ['title', 'content', 'folder', 'tags', 'isPinned', 'color', 'category'],
  todos: ['title', 'description', 'priority', 'status', 'dueDate', 'category', 'tags', 'isCompleted'],
  'pomodoro-sessions': ['taskName', 'workDuration', 'breakDuration', 'sessionsCompleted', 'totalMinutes', 'status', 'category', 'notes'],
  habits: ['name', 'description', 'frequency', 'currentStreak', 'longestStreak', 'totalCompletions', 'isActive', 'category', 'color'],
  expenses: ['description', 'amount', 'category', 'paymentMethod', 'date', 'isRecurring', 'tags', 'notes'],
  'clipboard-entries': ['content', 'contentType', 'sourceUrl', 'isFavorite', 'category', 'tags'],
  'blocked-sites': ['siteName', 'url', 'reason', 'schedule', 'isActive', 'blockedCount', 'category'],
  'quick-links': ['title', 'url', 'description', 'icon', 'folder', 'clickCount', 'isPinned', 'category'],
  'saved-sessions': ['name', 'description', 'tabs', 'tabCount', 'windowCount', 'isAutoSaved', 'category'],
  countdowns: ['title', 'targetDate', 'description', 'color', 'isActive', 'notifyBefore', 'category'],
  'color-palettes': ['name', 'colors', 'description', 'sourceUrl', 'isFavorite', 'tags', 'category'],
  snippets: ['title', 'code', 'language', 'description', 'tags', 'usageCount', 'isFavorite', 'category'],
  'rss-feeds': ['title', 'feedUrl', 'siteUrl', 'description', 'lastFetched', 'itemCount', 'isActive', 'category'],
  contacts: ['name', 'email', 'phone', 'company', 'role', 'notes', 'isFavorite', 'category'],
  workouts: ['name', 'exerciseType', 'duration', 'sets', 'reps', 'weight', 'calories', 'notes', 'date', 'category'],
  'email-scans': ['subject', 'sender', 'headers', 'bodySnippet', 'riskScore', 'riskLevel', 'flags', 'analysis', 'status'],
  'invoice-scans': ['vendor', 'invoiceNumber', 'amount', 'invoiceDate', 'dueDate', 'category', 'rawText', 'extractedData', 'taxDeductible', 'duplicateFlag', 'notes', 'status'],
  'meeting-transcripts': ['title', 'meetingDate', 'participants', 'transcript', 'summary', 'actionItems', 'decisions', 'followUps', 'category', 'status'],
  'code-snippets': ['title', 'language', 'code', 'explanation', 'optimizations', 'securityIssues', 'tags', 'status'],
  'resume-reviews': ['candidateName', 'targetRole', 'jobDescription', 'resumeText', 'feedback', 'keywords', 'matchScore', 'status'],
  'contract-reviews': ['contractTitle', 'partyName', 'contractType', 'contractText', 'riskyClauses', 'missingProvisions', 'amendments', 'riskScore', 'status'],
  'health-claims': ['title', 'sourceUrl', 'claimText', 'credibilityScore', 'rating', 'validationNotes', 'citedSources', 'status'],
  'competitor-monitors': ['productName', 'competitorName', 'competitorUrl', 'ourPrice', 'competitorPrice', 'priceHistory', 'alertThreshold', 'recommendation', 'lastChecked', 'status'],
};

// Required fields per model for creation
const requiredOnCreate = {
  researches: ['title', 'query'],
  autofills: ['name', 'formType'],
  summaries: ['title', 'originalContent'],
  'tab-groups': ['name'],
  bookmarks: ['title', 'url'],
  passwords: ['siteName', 'siteUrl', 'username', 'encryptedPassword'],
  'adblock-rules': ['name', 'pattern', 'ruleType'],
  'reading-items': ['title', 'url'],
  translations: ['originalText', 'sourceLang', 'targetLang'],
  screenshots: ['title'],
  'email-templates': ['name', 'subject', 'body'],
  'price-trackers': ['productName', 'productUrl'],
  'grammar-checks': ['title', 'originalText'],
  citations: ['title'],
  'darkmode-rules': ['siteName', 'siteUrl'],
  notes: ['title'],
  todos: ['title'],
  'pomodoro-sessions': ['taskName'],
  habits: ['name'],
  expenses: ['description', 'amount'],
  'clipboard-entries': ['content'],
  'blocked-sites': ['siteName', 'url'],
  'quick-links': ['title', 'url'],
  'saved-sessions': ['name'],
  countdowns: ['title', 'targetDate'],
  'color-palettes': ['name', 'colors'],
  snippets: ['title', 'code'],
  'rss-feeds': ['title', 'feedUrl'],
  contacts: ['name'],
  workouts: ['name', 'exerciseType'],
  'email-scans': ['subject'],
  'invoice-scans': ['rawText'],
  'meeting-transcripts': ['title', 'transcript'],
  'code-snippets': ['title', 'code'],
  'resume-reviews': ['resumeText'],
  'contract-reviews': ['contractTitle', 'contractText'],
  'health-claims': ['title', 'claimText'],
  'competitor-monitors': ['productName'],
};

function filterBody(modelName, body) {
  const allowed = allowedFields[modelName] || Object.keys(body);
  const filtered = {};
  for (const key of allowed) {
    if (body[key] !== undefined) filtered[key] = body[key];
  }
  return filtered;
}

function validateRequired(modelName, body) {
  const required = requiredOnCreate[modelName] || [];
  const missing = required.filter(f => body[f] === undefined || body[f] === null || body[f] === '');
  return missing;
}

// Generic CRUD factory
function createCrudRoutes(modelName, model) {
  const base = `/${modelName}`;

  // GET all (with pagination: ?page=1&limit=20)
  router.get(base, async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
      const offset = (page - 1) * limit;
      const { count, rows } = await model.findAndCountAll({
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });
      res.json({
        data: rows,
        pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET by id
  router.get(`${base}/:id`, async (req, res) => {
    try {
      const item = await model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create — filter allowed fields + validate required
  router.post(base, async (req, res) => {
    try {
      const filtered = filterBody(modelName, req.body);
      const missing = validateRequired(modelName, filtered);
      if (missing.length > 0) {
        return res.status(400).json({ error: 'Validation failed', missing_fields: missing });
      }
      const item = await model.create(filtered);
      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update — filter allowed fields
  router.put(`${base}/:id`, async (req, res) => {
    try {
      const item = await model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      const filtered = filterBody(modelName, req.body);
      if (Object.keys(filtered).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }
      await item.update(filtered);
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE
  router.delete(`${base}/:id`, async (req, res) => {
    try {
      const item = await model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      await item.destroy();
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// Create CRUD routes for all models
createCrudRoutes('researches', models.Research);
createCrudRoutes('autofills', models.AutoFill);
createCrudRoutes('summaries', models.Summary);
createCrudRoutes('tab-groups', models.TabGroup);
createCrudRoutes('bookmarks', models.Bookmark);
createCrudRoutes('passwords', models.PasswordEntry);
createCrudRoutes('adblock-rules', models.AdBlockRule);
createCrudRoutes('reading-items', models.ReadingItem);
createCrudRoutes('translations', models.Translation);
createCrudRoutes('screenshots', models.Screenshot);
createCrudRoutes('email-templates', models.EmailTemplate);
createCrudRoutes('price-trackers', models.PriceTracker);
createCrudRoutes('grammar-checks', models.GrammarCheck);
createCrudRoutes('citations', models.Citation);
createCrudRoutes('darkmode-rules', models.DarkModeRule);

// Non-AI Features
createCrudRoutes('notes', models.Note);
createCrudRoutes('todos', models.Todo);
createCrudRoutes('pomodoro-sessions', models.PomodoroSession);
createCrudRoutes('habits', models.Habit);
createCrudRoutes('expenses', models.Expense);
createCrudRoutes('clipboard-entries', models.ClipboardEntry);
createCrudRoutes('blocked-sites', models.BlockedSite);
createCrudRoutes('quick-links', models.QuickLink);
createCrudRoutes('saved-sessions', models.SavedSession);
createCrudRoutes('countdowns', models.Countdown);
createCrudRoutes('color-palettes', models.ColorPalette);
createCrudRoutes('snippets', models.Snippet);
createCrudRoutes('rss-feeds', models.RSSFeed);
createCrudRoutes('contacts', models.Contact);
createCrudRoutes('workouts', models.Workout);

// New (proposed) AI features
createCrudRoutes('email-scans', models.EmailScan);
createCrudRoutes('invoice-scans', models.InvoiceScan);
createCrudRoutes('meeting-transcripts', models.MeetingTranscript);
createCrudRoutes('code-snippets', models.CodeSnippet);
createCrudRoutes('resume-reviews', models.ResumeReview);
createCrudRoutes('contract-reviews', models.ContractReview);
createCrudRoutes('health-claims', models.HealthClaim);
createCrudRoutes('competitor-monitors', models.CompetitorMonitor);

module.exports = router;
