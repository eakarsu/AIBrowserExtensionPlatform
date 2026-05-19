const express = require('express');
const router = express.Router();
const { Bookmark, sequelize } = require('../models');
const https = require('https');

function callOpenRouter(messages) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
      messages,
      max_tokens: 2000,
    });
    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Browser Extension Platform',
      },
    };
    const req = https.request(options, (response) => {
      let body = '';
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.error) reject(new Error(parsed.error.message || 'OpenRouter error'));
          else resolve(parsed);
        } catch (e) {
          reject(new Error('Failed to parse OpenRouter response'));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// POST /api/bookmarks/auto-categorize - AI auto-categorize bookmarks
router.post('/auto-categorize', async (req, res) => {
  try {
    const { bookmark_ids } = req.body;
    if (!Array.isArray(bookmark_ids) || bookmark_ids.length === 0) {
      return res.status(400).json({ error: 'bookmark_ids must be a non-empty array' });
    }

    // Fetch bookmarks
    const bookmarks = await Bookmark.findAll({
      where: { id: bookmark_ids },
      attributes: ['id', 'title', 'url', 'description'],
    });

    if (bookmarks.length === 0) return res.status(404).json({ error: 'No bookmarks found' });

    const bookmarkList = bookmarks.map(b => `ID:${b.id} | Title: ${b.title} | URL: ${b.url} | Desc: ${b.description || 'N/A'}`).join('\n');

    const result = await callOpenRouter([
      {
        role: 'system',
        content: 'You are a bookmark organization expert. Given a list of bookmarks, assign each a category and tags. Return ONLY valid JSON array: [{"id": 1, "folder": "Technology", "tags": "javascript,web,tutorial"}, ...]. No extra text.',
      },
      {
        role: 'user',
        content: `Categorize these bookmarks:\n${bookmarkList}`,
      },
    ]);

    const aiContent = result.choices?.[0]?.message?.content || '[]';
    let categorizations = [];
    try {
      const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) categorizations = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse AI categorization response', raw: aiContent });
    }

    // Update bookmarks in DB
    const updated = [];
    for (const cat of categorizations) {
      if (!cat.id) continue;
      try {
        const bookmark = await Bookmark.findByPk(cat.id);
        if (bookmark) {
          await bookmark.update({ folder: cat.folder, tags: cat.tags });
          updated.push({ id: cat.id, folder: cat.folder, tags: cat.tags });
        }
      } catch (e) {
        console.error(`Error updating bookmark ${cat.id}:`, e.message);
      }
    }

    res.json({ success: true, updated_count: updated.length, updated });
  } catch (err) {
    console.error('Bookmark auto-categorize error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookmarks/export/html - export as Netscape HTML format
router.get('/export/html', async (req, res) => {
  try {
    const bookmarks = await Bookmark.findAll({ order: [['createdAt', 'ASC']] });

    // Group by folder
    const folders = {};
    for (const bm of bookmarks) {
      const folder = bm.folder || 'Unsorted';
      if (!folders[folder]) folders[folder] = [];
      folders[folder].push(bm);
    }

    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file. -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

    for (const [folderName, items] of Object.entries(folders)) {
      html += `    <DT><H3>${escapeHtml(folderName)}</H3>\n    <DL><p>\n`;
      for (const bm of items) {
        const addDate = Math.floor(new Date(bm.createdAt).getTime() / 1000);
        html += `        <DT><A HREF="${escapeHtml(bm.url)}" ADD_DATE="${addDate}">${escapeHtml(bm.title)}</A>\n`;
        if (bm.description) html += `        <DD>${escapeHtml(bm.description)}\n`;
      }
      html += `    </DL><p>\n`;
    }

    html += `</DL><p>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="bookmarks.html"');
    res.send(html);
  } catch (err) {
    console.error('Bookmark export error:', err);
    res.status(500).json({ error: err.message });
  }
});

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = router;
