const express = require('express');
const router = express.Router();
const models = require('../models');

// Generic CRUD factory
function createCrudRoutes(modelName, model) {
  const base = `/${modelName}`;

  // GET all
  router.get(base, async (req, res) => {
    try {
      const items = await model.findAll({ order: [['createdAt', 'DESC']] });
      res.json(items);
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

  // POST create
  router.post(base, async (req, res) => {
    try {
      const item = await model.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update
  router.put(`${base}/:id`, async (req, res) => {
    try {
      const item = await model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      await item.update(req.body);
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

module.exports = router;
