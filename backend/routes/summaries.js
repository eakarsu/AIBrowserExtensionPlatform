const express = require('express');
const router = express.Router();
const { Summary } = require('../models');

// GET /api/summaries/export/csv - export all summaries as CSV
router.get('/export/csv', async (req, res) => {
  try {
    const summaries = await Summary.findAll({ order: [['createdAt', 'DESC']] });

    const headers = ['id', 'title', 'originalUrl', 'wordCount', 'readTime', 'category', 'createdAt', 'summary', 'keyPoints'];

    const csvRows = [headers.join(',')];
    for (const s of summaries) {
      const row = headers.map(h => {
        const val = s[h] !== undefined && s[h] !== null ? String(s[h]) : '';
        // Escape CSV: wrap in quotes, double any internal quotes
        const escaped = val.replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, '');
        return `"${escaped}"`;
      });
      csvRows.push(row.join(','));
    }

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="summaries.csv"');
    res.send(csv);
  } catch (err) {
    console.error('Summary CSV export error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
