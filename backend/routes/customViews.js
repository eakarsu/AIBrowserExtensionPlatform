// customViews.js — Extension Views (re-done)
// 4 endpoints, mounted at /api/custom-views BEFORE 404:
//   GET  /api/custom-views/install-heatmap      (VIZ — region x version grid)
//   GET  /api/custom-views/version-adoption     (VIZ — weekly time series, stacked area)
//   GET  /api/custom-views/store-listing-pdf    (NON-VIZ — printable HTML)
//   *    /api/custom-views/extension-configs    (NON-VIZ — full CRUD)
//        GET /extension-configs        list
//        GET /extension-configs/:id    one
//        POST /extension-configs       create
//        PUT /extension-configs/:id    update
//        DELETE /extension-configs/:id remove

const express = require('express');
const router = express.Router();

// Deterministic pseudo-random helper
function seeded(n, salt = 1) {
  return ((Math.sin((n + 1) * 9301 * salt + 49297) + 1) / 2);
}

// 1) VIZ — Install heatmap by REGION × VERSION
router.get('/install-heatmap', (req, res) => {
  const regions = [
    { code: 'NA', label: 'North America', weight: 1.4 },
    { code: 'EU', label: 'Europe', weight: 1.25 },
    { code: 'APAC', label: 'Asia Pacific', weight: 1.55 },
    { code: 'LATAM', label: 'Latin America', weight: 0.75 },
    { code: 'MEA', label: 'Middle East & Africa', weight: 0.55 },
    { code: 'OC', label: 'Oceania', weight: 0.45 },
  ];
  const versions = ['3.5.0-beta', '3.4.1', '3.4.0', '3.3.2', '3.3.0', '3.2.5'];
  // Channel weights — newest stable dominates
  const versionWeights = [0.06, 0.5, 0.22, 0.12, 0.06, 0.04];

  const cells = [];
  let total = 0;
  let peak = { region: 'NA', region_label: 'North America', version: '3.4.1', count: 0 };

  for (let r = 0; r < regions.length; r++) {
    for (let v = 0; v < versions.length; v++) {
      const noise = seeded(r * 100 + v, 7);
      const base = 14000 * regions[r].weight * versionWeights[v];
      const count = Math.round(base * (0.7 + noise * 0.6));
      total += count;
      if (count > peak.count) {
        peak = {
          region: regions[r].code,
          region_label: regions[r].label,
          version: versions[v],
          count,
        };
      }
      cells.push({
        region: regions[r].code,
        region_label: regions[r].label,
        version: versions[v],
        count,
      });
    }
  }
  res.json({
    regions: regions.map((r) => ({ code: r.code, label: r.label })),
    versions,
    cells,
    total_installs: total,
    peak,
    generated_at: new Date().toISOString(),
  });
});

// 2) VIZ — Version adoption stacked area chart (12-week time series)
router.get('/version-adoption', (req, res) => {
  const versions = [
    { version: '3.5.0-beta', channel: 'beta' },
    { version: '3.4.1', channel: 'stable' },
    { version: '3.4.0', channel: 'stable' },
    { version: '3.3.2', channel: 'stable' },
    { version: '3.3.0', channel: 'stable' },
    { version: '3.2.5', channel: 'legacy' },
  ];
  const WEEKS = 12;
  const baseUsers = 184230;

  // Simulate adoption ramp: newest stable grows, older versions decay
  // Linear interpolation between two distribution endpoints over 12 weeks.
  const startWeights = [0.01, 0.10, 0.20, 0.22, 0.22, 0.25];
  const endWeights   = [0.06, 0.50, 0.22, 0.12, 0.06, 0.04];

  const series = [];
  for (let w = 0; w < WEEKS; w++) {
    const t = w / (WEEKS - 1);
    const date = new Date();
    date.setDate(date.getDate() - (WEEKS - 1 - w) * 7);
    const weekUsers = Math.round(baseUsers * (0.78 + 0.22 * t)); // gentle growth
    const point = {
      week: w,
      date: date.toISOString().slice(0, 10),
      total: weekUsers,
    };
    for (let v = 0; v < versions.length; v++) {
      const weight = startWeights[v] * (1 - t) + endWeights[v] * t;
      point[versions[v].version] = Math.round(weight * weekUsers);
    }
    series.push(point);
  }

  // Current snapshot summary (latest week)
  const latest = series[series.length - 1];
  const snapshot = versions.map((v) => ({
    version: v.version,
    channel: v.channel,
    users: latest[v.version],
    share_pct: Math.round((latest[v.version] / latest.total) * 1000) / 10,
  }));

  res.json({
    versions: versions.map((v) => v.version),
    channels: versions.reduce((acc, v) => { acc[v.version] = v.channel; return acc; }, {}),
    series,
    snapshot,
    total_active_users: latest.total,
    latest_stable: '3.4.1',
    generated_at: new Date().toISOString(),
  });
});

// 3) NON-VIZ — Store listing PDF (printable HTML)
router.get('/store-listing-pdf', (req, res) => {
  const extName = req.query.name || 'AI Browser Sidekick';
  const version = req.query.version || '3.4.1';
  const html = `<!doctype html>
<html><head><meta charset="utf-8" /><title>Store Listing — ${extName}</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,Arial,sans-serif;margin:40px;color:#1a1a1a;line-height:1.55}
  h1{color:#4f46e5;border-bottom:3px solid #4f46e5;padding-bottom:10px;margin-bottom:0}
  h2{color:#312e81;margin-top:28px}
  .meta{color:#666;margin-top:6px}
  .badge{display:inline-block;background:#eef2ff;color:#4338ca;padding:4px 10px;border-radius:12px;font-size:12px;margin-right:6px}
  table{border-collapse:collapse;width:100%;margin-top:10px}
  td,th{border:1px solid #d4d4d8;padding:8px 12px;text-align:left;font-size:14px}
  th{background:#f4f4f5}
  .stars{color:#f59e0b;font-size:18px}
  .print{position:fixed;top:20px;right:20px;padding:8px 14px;background:#4f46e5;color:#fff;border:0;border-radius:6px;cursor:pointer;font-weight:600}
  @media print{.print{display:none}}
</style></head><body>
<button class="print" onclick="window.print()">Download / Print PDF</button>
<h1>${extName}</h1>
<div class="meta">Chrome Web Store listing snapshot — Version ${version} — Generated ${new Date().toLocaleString()}</div>
<div style="margin-top:12px">
  <span class="badge">Productivity</span>
  <span class="badge">AI</span>
  <span class="badge">Featured</span>
  <span class="badge">Editor's Pick</span>
</div>

<h2>Summary</h2>
<p>${extName} brings AI-powered research, summarization, and tab management directly into your browser. Runs locally where possible, with optional cloud LLM for advanced reasoning.</p>

<h2>Listing metrics</h2>
<table>
  <tr><th>Metric</th><th>Value</th></tr>
  <tr><td>Active users</td><td>184,230</td></tr>
  <tr><td>Rating</td><td><span class="stars">★★★★★</span> 4.7 (12,840 reviews)</td></tr>
  <tr><td>Last updated</td><td>2026-05-02</td></tr>
  <tr><td>Size</td><td>3.2 MB</td></tr>
  <tr><td>Languages</td><td>English, Spanish, French, German, Japanese</td></tr>
  <tr><td>Permissions</td><td>activeTab, storage, scripting, tabs</td></tr>
</table>

<h2>Top user feedback</h2>
<ul>
  <li>"Saves me hours on research tasks every week." — Verified user</li>
  <li>"Tab grouping is uncanny — it just gets my workflow." — Power user</li>
  <li>"On-device summaries means I trust it for sensitive pages." — Privacy advocate</li>
</ul>

<h2>Release notes (v${version})</h2>
<ul>
  <li>Faster on-device summarization (35% speedup on M-series)</li>
  <li>New: Multi-tab agentic flow templates</li>
  <li>Fix: Auto-fill no longer fires inside iframes</li>
</ul>

</body></html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// 4) NON-VIZ — Extension config / manifest editor (full CRUD, in-memory)
let nextConfigId = 4;
let extensionConfigs = [
  {
    id: 1,
    manifest_version: 3,
    name: 'AI Browser Sidekick',
    version: '3.4.1',
    description: 'AI-powered research, summarization, and tab management.',
    permissions: ['activeTab', 'storage', 'scripting', 'tabs'],
    host_permissions: ['<all_urls>'],
    default_locale: 'en',
    background: { service_worker: 'background.js', type: 'module' },
    action: { default_title: 'AI Sidekick', default_popup: 'popup.html' },
    content_scripts: [
      { matches: ['<all_urls>'], js: ['content.js'], run_at: 'document_idle' },
    ],
    options: {
      ai_provider: 'openrouter',
      default_model: 'anthropic/claude-3.5-sonnet',
      on_device_threshold_tokens: 2000,
      telemetry_opt_in: false,
      theme: 'auto',
    },
    channel: 'stable',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    manifest_version: 3,
    name: 'AI Browser Sidekick — Beta',
    version: '3.5.0-beta',
    description: 'Bleeding-edge build with multi-tab agentic flows.',
    permissions: ['activeTab', 'storage', 'scripting', 'tabs', 'webNavigation'],
    host_permissions: ['<all_urls>'],
    default_locale: 'en',
    background: { service_worker: 'background.js', type: 'module' },
    action: { default_title: 'AI Sidekick (Beta)', default_popup: 'popup.html' },
    content_scripts: [
      { matches: ['<all_urls>'], js: ['content.js'], run_at: 'document_idle' },
    ],
    options: {
      ai_provider: 'openrouter',
      default_model: 'anthropic/claude-3.5-sonnet',
      on_device_threshold_tokens: 2500,
      telemetry_opt_in: true,
      theme: 'dark',
    },
    channel: 'beta',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    manifest_version: 3,
    name: 'AI Browser Sidekick — Enterprise',
    version: '3.4.1-ent',
    description: 'Enterprise build with SSO, audit logs, and policy controls.',
    permissions: ['activeTab', 'storage', 'scripting', 'tabs', 'identity'],
    host_permissions: ['<all_urls>'],
    default_locale: 'en',
    background: { service_worker: 'background.js', type: 'module' },
    action: { default_title: 'AI Sidekick (Ent)', default_popup: 'popup.html' },
    content_scripts: [
      { matches: ['<all_urls>'], js: ['content.js'], run_at: 'document_idle' },
    ],
    options: {
      ai_provider: 'private-llm',
      default_model: 'on-device/llama-3-8b',
      on_device_threshold_tokens: 8000,
      telemetry_opt_in: false,
      theme: 'auto',
    },
    channel: 'enterprise',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const ALLOWED = ['name', 'version', 'description', 'permissions',
  'host_permissions', 'default_locale', 'background', 'action',
  'content_scripts', 'options', 'channel', 'manifest_version'];

// List
router.get('/extension-configs', (req, res) => {
  res.json({ items: extensionConfigs, total: extensionConfigs.length });
});

// Read one
router.get('/extension-configs/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const cfg = extensionConfigs.find((c) => c.id === id);
  if (!cfg) return res.status(404).json({ error: 'Config not found' });
  res.json(cfg);
});

// Create
router.post('/extension-configs', (req, res) => {
  const body = req.body || {};
  if (!body.name || !body.version) {
    return res.status(400).json({ error: 'name and version are required' });
  }
  const cfg = {
    id: nextConfigId++,
    manifest_version: 3,
    name: body.name,
    version: body.version,
    description: body.description || '',
    permissions: body.permissions || ['activeTab', 'storage'],
    host_permissions: body.host_permissions || ['<all_urls>'],
    default_locale: body.default_locale || 'en',
    background: body.background || { service_worker: 'background.js', type: 'module' },
    action: body.action || { default_title: body.name, default_popup: 'popup.html' },
    content_scripts: body.content_scripts || [
      { matches: ['<all_urls>'], js: ['content.js'], run_at: 'document_idle' },
    ],
    options: body.options || {
      ai_provider: 'openrouter',
      default_model: 'anthropic/claude-3.5-sonnet',
      on_device_threshold_tokens: 2000,
      telemetry_opt_in: false,
      theme: 'auto',
    },
    channel: body.channel || 'stable',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  extensionConfigs.push(cfg);
  res.status(201).json(cfg);
});

// Update
router.put('/extension-configs/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const cfg = extensionConfigs.find((c) => c.id === id);
  if (!cfg) return res.status(404).json({ error: 'Config not found' });
  const updates = req.body || {};
  for (const k of ALLOWED) {
    if (updates[k] !== undefined) cfg[k] = updates[k];
  }
  cfg.updated_at = new Date().toISOString();
  res.json(cfg);
});

// Delete
router.delete('/extension-configs/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = extensionConfigs.findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Config not found' });
  const [removed] = extensionConfigs.splice(idx, 1);
  res.json({ ok: true, removed_id: removed.id });
});

module.exports = router;
