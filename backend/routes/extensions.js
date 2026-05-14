// Apply pass 5 — backlog implementations for AIBrowserExtensionPlatform.
//
// Backlog from _AUDIT_NOTE.md:
//   1. Multi-agent orchestration  (NEEDS-PRODUCT-DECISION)
//   2. RAG over user data         (NEEDS-PRODUCT-DECISION)
//   3. Real-time streaming many endpoints (TOO-RISKY) — additive SSE on demand
//   4. White-label / reseller     (NEEDS-PRODUCT-DECISION)
//
// All endpoints additive. AI calls gated on OPENROUTER_API_KEY (503 + missing).
// Tables created with CREATE TABLE IF NOT EXISTS via sequelize.sync().
//
// PRODUCT-DECISION (multi-agent topology): single-orchestrator, no inter-agent
// chat — orchestrator splits a goal into sub-tasks dispatched sequentially to
// specialist roles {researcher, summarizer, critic}, each call uses the
// existing /api/ai stack. No new long-running daemon.
//
// PRODUCT-DECISION (RAG vector store): in-memory cosine on hashed-bag-of-words
// vectors over the caller's prior summaries/research/notes. No new heavy deps,
// no external vector DB. Quality is approximate; flagged in response.
//
// PRODUCT-DECISION (white-label tenants): row-scoped Tenant table linked to
// User via tenantId; logo/name/primary_color overrides persisted but only
// rendered if FE wires them. No billing.

const express = require('express');
const https = require('https');
const { DataTypes } = require('sequelize');
const router = express.Router();

// ──────────────────────────────────────────────────────────────────────
// Models — additive
// ──────────────────────────────────────────────────────────────────────
let _models = null;
async function getModels() {
  if (_models) return _models;
  const { sequelize } = require('../models');

  const AgentRun = sequelize.define('AgentRun', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    goal: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
    plan: { type: DataTypes.TEXT },
    steps: { type: DataTypes.TEXT }, // JSON
    finalAnswer: { type: DataTypes.TEXT },
    tokensUsed: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, { tableName: 'agent_runs', timestamps: true });

  const RagDoc = sequelize.define('RagDoc', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING },
    content: { type: DataTypes.TEXT },
    source: { type: DataTypes.STRING },
    vector: { type: DataTypes.TEXT }, // JSON array
  }, { tableName: 'rag_docs', timestamps: true });

  const Tenant = sequelize.define('Tenant', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ownerUserId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, unique: true },
    logoUrl: { type: DataTypes.STRING },
    primaryColor: { type: DataTypes.STRING, defaultValue: '#3b82f6' },
    plan: { type: DataTypes.STRING, defaultValue: 'free' },
  }, { tableName: 'tenants', timestamps: true });

  try { await AgentRun.sync(); } catch (e) { console.error('agent_runs sync:', e.message); }
  try { await RagDoc.sync(); } catch (e) { console.error('rag_docs sync:', e.message); }
  try { await Tenant.sync(); } catch (e) { console.error('tenants sync:', e.message); }

  _models = { AgentRun, RagDoc, Tenant };
  return _models;
}
getModels().catch(() => {});

// ──────────────────────────────────────────────────────────────────────
// OpenRouter helper (mirrors ai.js so this file is independent)
// ──────────────────────────────────────────────────────────────────────
function callOpenRouter(messages, maxTokens = 1500) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
      messages, max_tokens: maxTokens,
    });
    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
        'X-Title': 'AI Browser Extension Platform',
      },
    };
    const req = https.request(options, (response) => {
      let body = '';
      response.on('data', (c) => { body += c; });
      response.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.error) return reject(new Error(parsed.error.message || 'OpenRouter error'));
          resolve(parsed);
        } catch (e) { reject(new Error('parse error')); }
      });
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

function require503(res) {
  if (!process.env.OPENROUTER_API_KEY) {
    res.status(503).json({ error: 'AI service unavailable', missing: 'OPENROUTER_API_KEY' });
    return true;
  }
  return false;
}

// ──────────────────────────────────────────────────────────────────────
// Tiny in-memory vector tooling — hashed bag-of-words → fixed-size vec.
// Approximate; documented as such. No external deps.
// ──────────────────────────────────────────────────────────────────────
const VEC_DIM = 256;
function tokenize(text) {
  return (text || '').toLowerCase().match(/[a-z0-9]{3,}/g) || [];
}
function hashStr(s) {
  let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function embed(text) {
  const v = new Array(VEC_DIM).fill(0);
  for (const tok of tokenize(text)) v[hashStr(tok) % VEC_DIM] += 1;
  // L2 normalize
  let n = 0; for (const x of v) n += x * x; n = Math.sqrt(n) || 1;
  return v.map((x) => x / n);
}
function cosine(a, b) {
  let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s;
}

// ──────────────────────────────────────────────────────────────────────
// 1. Multi-agent orchestration
//    POST /api/extensions/agent/run  { goal }
//    GET  /api/extensions/agent/runs
//    GET  /api/extensions/agent/runs/:id
// ──────────────────────────────────────────────────────────────────────
router.post('/agent/run', async (req, res) => {
  if (require503(res)) return;
  const goal = (req.body?.goal || '').toString().slice(0, 4000);
  if (!goal) return res.status(400).json({ error: 'goal required' });
  const { AgentRun } = await getModels();

  // Step 1: planner — produce sub-tasks
  const planMsg = [{
    role: 'system',
    content: 'You are a task planner. Split the user goal into 2-3 ordered sub-tasks each tagged with one role from {researcher, summarizer, critic}. Return STRICT JSON: {steps:[{role,task}]}.',
  }, { role: 'user', content: goal }];

  let plan = null; let totalTokens = 0;
  try {
    const r = await callOpenRouter(planMsg, 700);
    totalTokens += r.usage?.total_tokens || 0;
    const text = r.choices?.[0]?.message?.content || '';
    const m = text.match(/\{[\s\S]*\}/);
    plan = m ? JSON.parse(m[0]) : { steps: [{ role: 'researcher', task: goal }] };
  } catch (e) {
    return res.status(500).json({ error: 'planner failed: ' + e.message });
  }

  const steps = [];
  let context = '';
  for (const step of (plan.steps || []).slice(0, 3)) {
    const sysByRole = {
      researcher: 'You are a researcher. Produce concise factual bullet points.',
      summarizer: 'You are a summarizer. Compress prior context into key takeaways.',
      critic: 'You are a critic. Identify weak points and propose one actionable fix.',
    };
    const sys = sysByRole[step.role] || sysByRole.researcher;
    try {
      const r = await callOpenRouter([
        { role: 'system', content: sys },
        { role: 'user', content: `Goal: ${goal}\n\nPrior context: ${context}\n\nTask: ${step.task}` },
      ], 600);
      totalTokens += r.usage?.total_tokens || 0;
      const out = r.choices?.[0]?.message?.content || '';
      steps.push({ role: step.role, task: step.task, output: out });
      context += `\n[${step.role}] ${out}`;
    } catch (e) {
      steps.push({ role: step.role, task: step.task, error: e.message });
    }
  }

  const final = steps.map((s) => `[${s.role}] ${s.output || s.error || ''}`).join('\n\n');
  let saved = null;
  try {
    saved = await AgentRun.create({
      userId: req.user.id, goal, status: 'completed',
      plan: JSON.stringify(plan), steps: JSON.stringify(steps),
      finalAnswer: final, tokensUsed: totalTokens,
    });
  } catch (e) { /* non-fatal */ }

  res.json({
    id: saved?.id, goal,
    plan, steps, finalAnswer: final, tokensUsed: totalTokens,
  });
});

router.get('/agent/runs', async (req, res) => {
  try {
    const { AgentRun } = await getModels();
    const rows = await AgentRun.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']], limit: 50 });
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/agent/runs/:id', async (req, res) => {
  try {
    const { AgentRun } = await getModels();
    const row = await AgentRun.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ──────────────────────────────────────────────────────────────────────
// 2. RAG over user data
//    POST /api/extensions/rag/index   { title, content, source }
//    POST /api/extensions/rag/query   { query, top_k? }
//    GET  /api/extensions/rag/docs
//    DELETE /api/extensions/rag/docs/:id
// ──────────────────────────────────────────────────────────────────────
router.post('/rag/index', async (req, res) => {
  try {
    const { RagDoc } = await getModels();
    const { title, content, source } = req.body || {};
    if (!content) return res.status(400).json({ error: 'content required' });
    const v = embed(`${title || ''} ${content}`);
    const row = await RagDoc.create({
      userId: req.user.id, title: title || null,
      content: String(content).slice(0, 50000),
      source: source || null, vector: JSON.stringify(v),
    });
    res.status(201).json({ id: row.id, indexed: true, dim: VEC_DIM });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/rag/docs', async (req, res) => {
  try {
    const { RagDoc } = await getModels();
    const rows = await RagDoc.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'title', 'source', 'createdAt'],
      order: [['createdAt', 'DESC']], limit: 200,
    });
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/rag/docs/:id', async (req, res) => {
  try {
    const { RagDoc } = await getModels();
    const n = await RagDoc.destroy({ where: { id: req.params.id, userId: req.user.id } });
    if (!n) return res.status(404).json({ error: 'not found' });
    res.json({ deleted: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/rag/query', async (req, res) => {
  try {
    const { RagDoc } = await getModels();
    const q = (req.body?.query || '').toString();
    const topK = Math.max(1, Math.min(10, parseInt(req.body?.top_k) || 3));
    if (!q) return res.status(400).json({ error: 'query required' });
    const qv = embed(q);
    const docs = await RagDoc.findAll({ where: { userId: req.user.id } });
    const scored = docs.map((d) => {
      let v = []; try { v = JSON.parse(d.vector || '[]'); } catch (e) {}
      return { id: d.id, title: d.title, source: d.source, content: d.content, score: cosine(qv, v) };
    }).sort((a, b) => b.score - a.score).slice(0, topK);

    let answer = null; let model = null; let tokens = 0;
    if (process.env.OPENROUTER_API_KEY && scored.length) {
      try {
        const ctx = scored.map((s, i) => `[Doc ${i + 1} • ${s.title || s.source || 'untitled'}]\n${s.content.slice(0, 1500)}`).join('\n\n');
        const r = await callOpenRouter([
          { role: 'system', content: 'Answer the user query using ONLY the provided documents. Cite each claim like [Doc N]. If the docs do not contain the answer, say so.' },
          { role: 'user', content: `Query: ${q}\n\nDocuments:\n${ctx}` },
        ], 800);
        answer = r.choices?.[0]?.message?.content || null;
        model = r.model; tokens = r.usage?.total_tokens || 0;
      } catch (e) { /* return matches without LLM */ }
    }

    res.json({
      query: q, top_k: topK,
      matches: scored.map((s) => ({ id: s.id, title: s.title, source: s.source, score: s.score, snippet: s.content.slice(0, 240) })),
      answer, model, tokens,
      note: 'Approximate hashed-BoW retrieval (no external vector DB). Quality is heuristic.',
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ──────────────────────────────────────────────────────────────────────
// 3. Real-time streaming additive — generic SSE relay
//    GET /api/extensions/stream/chat?prompt=...   (uses query token via header from FE)
//    Note: existing /api/ai/summarize/stream stays as-is. This generic relay
//    accepts a free-form prompt for any client, gated behind auth like rest.
// ──────────────────────────────────────────────────────────────────────
router.get('/stream/chat', async (req, res) => {
  if (require503(res)) return;
  const prompt = (req.query.prompt || '').toString().slice(0, 4000);
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache', 'Connection': 'keep-alive',
  });

  const data = JSON.stringify({
    model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1500, stream: true,
  });

  const upstream = https.request({
    hostname: 'openrouter.ai', path: '/api/v1/chat/completions', method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
      'X-Title': 'AI Browser Extension Platform',
    },
  }, (r) => {
    r.on('data', (chunk) => res.write(chunk));
    r.on('end', () => res.end());
  });
  upstream.on('error', (err) => {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  });
  upstream.write(data); upstream.end();

  req.on('close', () => { try { upstream.destroy(); } catch (e) {} });
});

// ──────────────────────────────────────────────────────────────────────
// 4. White-label / reseller — Tenant CRUD scoped to current user
//    POST /api/extensions/tenants    { name, slug?, logoUrl?, primaryColor?, plan? }
//    GET  /api/extensions/tenants
//    PUT  /api/extensions/tenants/:id
//    DELETE /api/extensions/tenants/:id
// ──────────────────────────────────────────────────────────────────────
router.post('/tenants', async (req, res) => {
  try {
    const { Tenant } = await getModels();
    const { name, slug, logoUrl, primaryColor, plan } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name required' });
    const row = await Tenant.create({
      ownerUserId: req.user.id,
      name, slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60),
      logoUrl: logoUrl || null, primaryColor: primaryColor || '#3b82f6',
      plan: plan || 'free',
    });
    res.status(201).json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/tenants', async (req, res) => {
  try {
    const { Tenant } = await getModels();
    const rows = await Tenant.findAll({ where: { ownerUserId: req.user.id }, order: [['createdAt', 'DESC']] });
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/tenants/:id', async (req, res) => {
  try {
    const { Tenant } = await getModels();
    const row = await Tenant.findOne({ where: { id: req.params.id, ownerUserId: req.user.id } });
    if (!row) return res.status(404).json({ error: 'not found' });
    const { name, logoUrl, primaryColor, plan } = req.body || {};
    if (name !== undefined) row.name = name;
    if (logoUrl !== undefined) row.logoUrl = logoUrl;
    if (primaryColor !== undefined) row.primaryColor = primaryColor;
    if (plan !== undefined) row.plan = plan;
    await row.save();
    res.json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/tenants/:id', async (req, res) => {
  try {
    const { Tenant } = await getModels();
    const n = await Tenant.destroy({ where: { id: req.params.id, ownerUserId: req.user.id } });
    if (!n) return res.status(404).json({ error: 'not found' });
    res.json({ deleted: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/health', (req, res) => res.json({ status: 'ok', features: ['agent', 'rag', 'stream', 'tenants'] }));

module.exports = router;
