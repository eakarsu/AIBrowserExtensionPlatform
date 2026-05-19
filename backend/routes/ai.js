const express = require('express');
const https = require('https');
const { DataTypes } = require('sequelize');
const router = express.Router();
const { validate, schemas } = require('../middleware/validate');

// =====================================================
// parseAIJson — robust JSON extraction from AI output
// =====================================================
function parseAIJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch (e) {}
  const stripped = text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
  try { return JSON.parse(stripped); } catch (e) {}
  const start = text.indexOf('{'); const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) { try { return JSON.parse(text.slice(start, end + 1)); } catch (e) {} }
  // Try array fallback
  const aStart = text.indexOf('['); const aEnd = text.lastIndexOf(']');
  if (aStart !== -1 && aEnd !== -1) { try { return JSON.parse(text.slice(aStart, aEnd + 1)); } catch (e) {} }
  return null;
}

// =====================================================
// ai_results table — persist all AI analysis results
// =====================================================
let AiResult = null;

async function getAiResultModel() {
  if (AiResult) return AiResult;
  const { sequelize } = require('../models');
  AiResult = sequelize.define('AiResult', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    endpoint: { type: DataTypes.STRING, allowNull: false },
    inputSummary: { type: DataTypes.TEXT },
    rawResult: { type: DataTypes.TEXT },
    parsedResult: { type: DataTypes.TEXT },
    model: { type: DataTypes.STRING },
    tokensUsed: { type: DataTypes.INTEGER, defaultValue: 0 },
    estimatedCostUsd: { type: DataTypes.FLOAT, defaultValue: 0 },
  }, { tableName: 'ai_results', timestamps: true });
  try { await AiResult.sync(); } catch (e) { console.error('ai_results sync error:', e.message); }
  return AiResult;
}

// Initialize on startup
getAiResultModel().catch(() => {});

// =====================================================
// Quota check middleware
// =====================================================
async function checkQuota(req, res, next) {
  if (req.path === '/private-analyze') return next();
  try {
    const { sequelize } = require('../models');
    const userId = req.user.id;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let dailyLimit = 50, monthlyLimit = 500;
    try {
      const [quotaRow] = await sequelize.query(
        `SELECT "dailyLimit", "monthlyLimit" FROM user_quotas WHERE "userId" = :userId LIMIT 1`,
        { replacements: { userId }, type: sequelize.QueryTypes.SELECT }
      );
      if (quotaRow) { dailyLimit = quotaRow.dailyLimit; monthlyLimit = quotaRow.monthlyLimit; }
    } catch (e) {}

    let dailyUsed = 0, monthlyUsed = 0;
    try {
      const [dayRow] = await sequelize.query(
        `SELECT COUNT(*) as count FROM ai_usage_logs WHERE "userId" = :userId AND "createdAt" >= :start`,
        { replacements: { userId, start: startOfDay }, type: sequelize.QueryTypes.SELECT }
      );
      const [monthRow] = await sequelize.query(
        `SELECT COUNT(*) as count FROM ai_usage_logs WHERE "userId" = :userId AND "createdAt" >= :start`,
        { replacements: { userId, start: startOfMonth }, type: sequelize.QueryTypes.SELECT }
      );
      dailyUsed = parseInt(dayRow.count) || 0;
      monthlyUsed = parseInt(monthRow.count) || 0;
    } catch (e) {}

    if (dailyUsed >= dailyLimit) {
      const tomorrow = new Date(startOfDay);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return res.status(429).json({
        error: 'Daily AI quota exceeded',
        daily_limit: dailyLimit,
        daily_used: dailyUsed,
        resets_at: tomorrow.toISOString(),
      });
    }
    if (monthlyUsed >= monthlyLimit) {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return res.status(429).json({
        error: 'Monthly AI quota exceeded',
        monthly_limit: monthlyLimit,
        monthly_used: monthlyUsed,
        resets_at: nextMonth.toISOString(),
      });
    }

    // Log usage after response
    res.on('finish', async () => {
      if (res.statusCode < 500) {
        try {
          const { sequelize: sq } = require('../models');
          const tokens = res.locals.tokensUsed || 0;
          const cost = tokens * 0.000003;
          await sq.query(
            `INSERT INTO ai_usage_logs ("userId", endpoint, "tokensUsed", "estimatedCostUsd", "createdAt", "updatedAt")
             VALUES (:userId, :endpoint, :tokens, :cost, NOW(), NOW())`,
            { replacements: { userId, endpoint: req.path, tokens, cost } }
          );
        } catch (e) {}
      }
    });

    next();
  } catch (err) {
    next();
  }
}

router.use(checkQuota);

// =====================================================
// OpenRouter API call — upgraded to claude-3-5-sonnet
// =====================================================
function callOpenRouter(messages, maxTokens = 3000) {
  return new Promise((resolve, reject) => {
    const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';
    const data = JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
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
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.error) {
            reject(new Error(parsed.error.message || 'OpenRouter API error'));
          } else {
            resolve(parsed);
          }
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

// =====================================================
// Helper: call AI, track tokens, persist result
// =====================================================
async function runAI(req, res, { endpoint, messages, maxTokens, inputSummary }) {
  const result = await callOpenRouter(messages, maxTokens || 3000);
  const content = result.choices?.[0]?.message?.content || '';
  const tokens = result.usage?.total_tokens || 0;
  res.locals.tokensUsed = tokens;

  // Attempt structured JSON parse
  const parsed = parseAIJson(content);

  // Persist to ai_results
  try {
    const model = getAiResultModel();
    const AiResultModel = await model;
    await AiResultModel.create({
      userId: req.user.id,
      endpoint,
      inputSummary: (inputSummary || '').slice(0, 500),
      rawResult: content,
      parsedResult: parsed ? JSON.stringify(parsed) : null,
      model: result.model,
      tokensUsed: tokens,
      estimatedCostUsd: tokens * 0.000003,
    });
  } catch (e) {
    // Non-fatal — persist failure should not block response
  }

  return { content, parsed, model: result.model, usage: result.usage };
}

// =====================================================
// GET /api/ai/summarize/stream — SSE streaming
// =====================================================
router.get('/summarize/stream', async (req, res) => {
  const content = req.query.content;
  const url = req.query.url;

  if (!content) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.write('data: {"error":"content query param is required"}\n\n');
    return res.end();
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const body = JSON.stringify({
    model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
    messages: [
      { role: 'system', content: 'You are a content summarizer. Provide a concise summary with key points. Format: Brief Summary (2-3 sentences), Key Points (bullet list), Main Takeaways.' },
      { role: 'user', content: `Summarize the following content${url ? ' from ' + url : ''}:\n\n${content.slice(0, 8000)}` },
    ],
    stream: true,
    max_tokens: 1500,
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

  const apiReq = https.request(options, (apiRes) => {
    let buffer = '';
    apiRes.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') {
          if (trimmed === 'data: [DONE]') res.write('data: [DONE]\n\n');
          continue;
        }
        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const token = json.choices?.[0]?.delta?.content || '';
            if (token) res.write(`data: ${JSON.stringify({ token })}\n\n`);
          } catch (e) {}
        }
      }
    });
    apiRes.on('end', () => { res.write('data: [DONE]\n\n'); res.end(); });
  });

  apiReq.on('error', (err) => { res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`); res.end(); });
  apiReq.write(body);
  apiReq.end();
  req.on('close', () => { apiReq.destroy(); });
});

// =====================================================
// POST /api/ai/private-analyze — no persistence
// =====================================================
router.post('/private-analyze', validate(schemas.privateAnalyze), async (req, res) => {
  try {
    const { content, analysis_type } = req.body;
    const systemPrompts = {
      summarize: 'You are a content summarizer. Summarize concisely with key points.',
      analyze: 'You are a content analyst. Analyze the content for themes, sentiment, and key insights.',
      grammar: 'You are a grammar checker. Check for grammar, spelling, and style issues.',
      translate: 'You are a translator. Translate the content to English if not already in English.',
      default: 'You are an AI assistant. Analyze and respond to the provided content helpfully.',
    };
    const result = await callOpenRouter([
      { role: 'system', content: systemPrompts[analysis_type] || systemPrompts.default },
      { role: 'user', content: String(content).slice(0, 10000) },
    ]);
    const aiContent = result.choices?.[0]?.message?.content || 'No response generated';
    res.json({ success: true, result: aiContent, private: true, saved_to_db: false, model: result.model });
  } catch (err) {
    console.error('Private analyze error:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// Research Assistant
// =====================================================
router.post('/research', validate(schemas.research), async (req, res) => {
  try {
    const { query } = req.body;
    const { content, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/research',
      inputSummary: query,
      messages: [
        {
          role: 'system',
          content: `You are a research assistant. Provide comprehensive research results.
Respond ONLY with valid JSON in this exact structure:
{
  "summary": "3-5 sentence executive summary",
  "key_findings": ["finding 1", "finding 2", "finding 3"],
  "detailed_analysis": "detailed analysis text",
  "recommended_sources": ["source 1", "source 2"],
  "confidence": "high|medium|low"
}`
        },
        { role: 'user', content: `Research this topic thoroughly: ${query}` },
      ],
    });
    res.json({ success: true, result: content, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// Content Summarizer
// =====================================================
router.post('/summarize', validate(schemas.summarize), async (req, res) => {
  try {
    const { content, url } = req.body;
    const { content: aiContent, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/summarize',
      inputSummary: url || content.slice(0, 100),
      messages: [
        {
          role: 'system',
          content: `You are a content summarizer.
Respond ONLY with valid JSON:
{
  "brief_summary": "2-3 sentence summary",
  "key_points": ["point 1", "point 2", "point 3"],
  "main_takeaways": ["takeaway 1", "takeaway 2"],
  "reading_time": "X min read",
  "sentiment": "positive|neutral|negative"
}`
        },
        { role: 'user', content: `Summarize the following content${url ? ' from ' + url : ''}:\n\n${content.slice(0, 8000)}` },
      ],
    });
    res.json({ success: true, result: aiContent, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// Auto-fill AI
// =====================================================
router.post('/autofill-suggest', validate(schemas.autofill), async (req, res) => {
  try {
    const { formType, fields } = req.body;
    const { content, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/autofill-suggest',
      inputSummary: formType,
      messages: [
        {
          role: 'system',
          content: `You are a smart form auto-fill assistant.
Respond ONLY with valid JSON:
{
  "form_type": "detected form type",
  "field_mappings": [{"field": "fieldname", "suggested_value": "value", "reasoning": "why"}],
  "recommendations": ["tip 1", "tip 2"],
  "privacy_notes": "notes on sensitive fields"
}`
        },
        { role: 'user', content: `Suggest auto-fill mappings for a ${formType} form with these fields: ${Array.isArray(fields) ? fields.join(', ') : fields}` },
      ],
    });
    res.json({ success: true, result: content, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// Tab Manager — Organize tabs
// =====================================================
router.post('/organize-tabs', validate(schemas.organizeTabs), async (req, res) => {
  try {
    const { tabs } = req.body;
    const { content, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/organize-tabs',
      inputSummary: Array.isArray(tabs) ? tabs.slice(0, 3).join(', ') : String(tabs).slice(0, 100),
      messages: [
        {
          role: 'system',
          content: `You are a tab organization assistant.
Respond ONLY with valid JSON:
{
  "groups": [
    {
      "name": "Group Name",
      "color": "#hexcolor",
      "category": "category",
      "tabs": ["tab title 1", "tab title 2"],
      "reasoning": "why these tabs belong together"
    }
  ],
  "productivity_score": 0-100,
  "tips": ["tip 1", "tip 2"]
}`
        },
        { role: 'user', content: `Organize these browser tabs into logical groups: ${Array.isArray(tabs) ? tabs.join(', ') : tabs}` },
      ],
    });
    res.json({ success: true, result: content, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// Bookmark — Categorize
// =====================================================
router.post('/categorize-bookmark', validate(schemas.categorizeBookmark), async (req, res) => {
  try {
    const { title, url, description } = req.body;
    const { content, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/categorize-bookmark',
      inputSummary: title,
      messages: [
        {
          role: 'system',
          content: `You are a bookmark organization assistant.
Respond ONLY with valid JSON:
{
  "folder": "Suggested Folder",
  "tags": ["tag1", "tag2", "tag3"],
  "description": "brief description of the bookmark",
  "priority": "high|medium|low",
  "category": "category name"
}`
        },
        { role: 'user', content: `Categorize this bookmark - Title: ${title}, URL: ${url}, Description: ${description || 'N/A'}` },
      ],
    });
    res.json({ success: true, result: content, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// Password — Analyze
// =====================================================
router.post('/password-analyze', validate(schemas.passwordAnalyze), async (req, res) => {
  try {
    const { requirements } = req.body;
    const { content, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/password-analyze',
      inputSummary: requirements.slice(0, 100),
      messages: [
        {
          role: 'system',
          content: `You are a password security advisor. Never generate actual passwords.
Respond ONLY with valid JSON:
{
  "strength_level": "weak|medium|strong|very_strong",
  "strength_score": 0-100,
  "requirements_met": ["req 1", "req 2"],
  "requirements_missing": ["missing 1"],
  "best_practices": ["practice 1", "practice 2"],
  "breach_risk": "low|medium|high",
  "recommendations": "actionable advice"
}`
        },
        { role: 'user', content: `Provide password security advice for: ${requirements}` },
      ],
    });
    res.json({ success: true, result: content, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// Ad Blocker — Suggest Rules
// =====================================================
router.post('/suggest-adblock', validate(schemas.adblock), async (req, res) => {
  try {
    const { website } = req.body;
    const { content, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/suggest-adblock',
      inputSummary: website,
      messages: [
        {
          role: 'system',
          content: `You are an ad blocking expert.
Respond ONLY with valid JSON:
{
  "rules": [
    {"pattern": "##.ad-selector", "type": "element", "description": "what it blocks"},
    {"pattern": "||ads.example.com", "type": "network", "description": "what it blocks"}
  ],
  "tracking_domains": ["domain1.com"],
  "effectiveness_score": 0-100,
  "notes": "additional context"
}`
        },
        { role: 'user', content: `Suggest ad blocking rules for: ${website}` },
      ],
    });
    res.json({ success: true, result: content, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// Translation AI
// =====================================================
router.post('/translate', validate(schemas.translate), async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body;
    const { content, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/translate',
      inputSummary: `${sourceLang}->${targetLang}: ${text.slice(0, 50)}`,
      messages: [
        {
          role: 'system',
          content: `You are a professional translator.
Respond ONLY with valid JSON:
{
  "translation": "primary translation",
  "alternative_translations": ["alt 1", "alt 2"],
  "notes": "cultural or contextual notes",
  "formality": "formal|informal|neutral",
  "detected_source_lang": "language detected"
}`
        },
        { role: 'user', content: `Translate from ${sourceLang} to ${targetLang}: "${text}"` },
      ],
    });
    res.json({ success: true, result: content, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// Screenshot Annotator
// =====================================================
router.post('/annotate', validate(schemas.annotate), async (req, res) => {
  try {
    const { description, context } = req.body;
    const { content, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/annotate',
      inputSummary: description.slice(0, 100),
      messages: [
        {
          role: 'system',
          content: `You are a screenshot annotation assistant.
Respond ONLY with valid JSON:
{
  "annotations": [
    {"type": "note|arrow|highlight|callout", "text": "annotation text", "position": "top-left|center|bottom-right", "priority": "high|medium|low"}
  ],
  "overall_notes": "general observations",
  "suggested_improvements": ["improvement 1"]
}`
        },
        { role: 'user', content: `Suggest annotations for a screenshot: ${description}. Context: ${context || 'General web page'}` },
      ],
    });
    res.json({ success: true, result: content, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// Email Template AI
// =====================================================
router.post('/generate-email', validate(schemas.generateEmail), async (req, res) => {
  try {
    const { purpose, tone, context } = req.body;
    const { content, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/generate-email',
      inputSummary: purpose.slice(0, 100),
      messages: [
        {
          role: 'system',
          content: `You are an email writing assistant.
Respond ONLY with valid JSON:
{
  "subject_line": "email subject",
  "email_body": "full email body text",
  "tone_used": "${tone || 'professional'}",
  "word_count": 0,
  "suggested_cta": "call to action text",
  "tone_notes": "notes on tone and style"
}`
        },
        { role: 'user', content: `Generate an email template for: ${purpose}. Tone: ${tone || 'professional'}. Context: ${context || 'General business'}` },
      ],
    });
    res.json({ success: true, result: content, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// Price Tracker — Analyze
// =====================================================
router.post('/analyze-price', validate(schemas.analyzePrice), async (req, res) => {
  try {
    const { product, currentPrice, priceHistory } = req.body;
    const { content, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/analyze-price',
      inputSummary: product,
      messages: [
        {
          role: 'system',
          content: `You are a price analysis expert.
Respond ONLY with valid JSON:
{
  "price_analysis": "analysis text",
  "trend": "rising|falling|stable",
  "recommendation": "buy_now|wait|avoid",
  "best_time_to_buy": "timing advice",
  "fair_price_estimate": "estimated fair price",
  "savings_potential": "% savings possible",
  "confidence": "high|medium|low"
}`
        },
        { role: 'user', content: `Analyze pricing for: ${product}. Current price: $${currentPrice || 'unknown'}. Price history: ${priceHistory || 'Not available'}` },
      ],
    });
    res.json({ success: true, result: content, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// Grammar Checker
// =====================================================
router.post('/check-grammar', validate(schemas.checkGrammar), async (req, res) => {
  try {
    const { text } = req.body;
    const { content, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/check-grammar',
      inputSummary: text.slice(0, 100),
      messages: [
        {
          role: 'system',
          content: `You are a grammar and writing expert.
Respond ONLY with valid JSON:
{
  "corrected_text": "full corrected version",
  "errors": [
    {"original": "wrong text", "corrected": "right text", "type": "grammar|spelling|punctuation|style", "explanation": "why"}
  ],
  "error_count": 0,
  "style_suggestions": ["suggestion 1"],
  "overall_assessment": "excellent|good|needs_work|poor",
  "readability_score": 0-100
}`
        },
        { role: 'user', content: `Check the grammar and writing quality of: "${text.slice(0, 8000)}"` },
      ],
    });
    res.json({ success: true, result: content, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// Citation Generator
// =====================================================
router.post('/generate-citation', validate(schemas.generateCitation), async (req, res) => {
  try {
    const { title, authors, url, publicationDate, citationType } = req.body;
    const { content, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/generate-citation',
      inputSummary: title,
      messages: [
        {
          role: 'system',
          content: `You are a citation formatting expert.
Respond ONLY with valid JSON:
{
  "formatted_citation": "full citation in requested style",
  "in_text_citation": "(Author, Year) or [1] format",
  "citation_style": "${citationType || 'APA'}",
  "notes": "any issues or assumptions made",
  "doi": "DOI if detectable"
}`
        },
        { role: 'user', content: `Generate a ${citationType || 'APA'} citation for: Title: "${title}", Authors: ${authors || 'Unknown'}, URL: ${url || 'N/A'}, Date: ${publicationDate || 'N/A'}` },
      ],
    });
    res.json({ success: true, result: content, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// Reading List — Suggest
// =====================================================
router.post('/reading-suggest', validate(schemas.readingSuggest), async (req, res) => {
  try {
    const { interests, currentList } = req.body;
    const { content, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/reading-suggest',
      inputSummary: interests.slice(0, 100),
      messages: [
        {
          role: 'system',
          content: `You are a reading recommendation assistant.
Respond ONLY with valid JSON:
{
  "recommendations": [
    {"title": "article title", "topic": "topic", "estimated_read_time": "X min", "reason": "why recommended", "priority": "high|medium|low"}
  ],
  "priority_order": ["title 1", "title 2"],
  "reading_schedule": "suggested schedule",
  "total_reading_time": "X hours"
}`
        },
        { role: 'user', content: `Suggest readings based on interests: ${interests}. Current reading list: ${currentList || 'Empty'}` },
      ],
    });
    res.json({ success: true, result: content, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// Dark Mode — Suggest CSS
// =====================================================
router.post('/darkmode-suggest', validate(schemas.darkModeSuggest), async (req, res) => {
  try {
    const { website, issues } = req.body;
    const { content, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/darkmode-suggest',
      inputSummary: website,
      messages: [
        {
          role: 'system',
          content: `You are a dark mode CSS expert.
Respond ONLY with valid JSON:
{
  "css_rules": "/* CSS here */",
  "selectors_targeted": ["selector1", "selector2"],
  "explanation": "what each rule does",
  "compatibility_notes": "browser compatibility info",
  "known_issues": ["issue 1"]
}`
        },
        { role: 'user', content: `Suggest dark mode CSS for: ${website}. Known issues: ${issues || 'None specified'}` },
      ],
    });
    res.json({ success: true, result: content, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// NEW PROPOSED FEATURES
// =====================================================

// 1. Email Security Scanner
router.post('/scan-email', validate(schemas.scanEmail), async (req, res) => {
  try {
    const { subject, sender, headers, body } = req.body;
    const { content, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/scan-email',
      inputSummary: `Subject: ${subject} | Sender: ${sender || 'unknown'}`,
      messages: [
        {
          role: 'system',
          content: `You are an email security analyst. Inspect for phishing, social engineering, and scam tactics.
Respond ONLY with valid JSON:
{
  "risk_score": 0-100,
  "risk_level": "low|medium|high|critical",
  "red_flags": ["flag 1", "flag 2"],
  "authentication_status": {"spf": "pass|fail|none", "dkim": "pass|fail|none", "dmarc": "pass|fail|none"},
  "recommended_actions": ["action 1", "action 2"],
  "phishing_indicators": ["indicator 1"],
  "verdict": "safe|suspicious|phishing|scam"
}`
        },
        { role: 'user', content: `Subject: ${subject}\nSender: ${sender || 'unknown'}\nHeaders:\n${headers || 'n/a'}\n\nBody:\n${(body || '').slice(0, 6000)}` },
      ],
    });
    res.json({ success: true, result: content, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Invoice OCR & Analysis
router.post('/analyze-invoice', validate(schemas.analyzeInvoice), async (req, res) => {
  try {
    const { rawText, knownVendors } = req.body;
    const { content, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/analyze-invoice',
      inputSummary: rawText.slice(0, 100),
      messages: [
        {
          role: 'system',
          content: `You are an invoice analyst. Extract and analyze invoice data.
Respond ONLY with valid JSON:
{
  "extracted_fields": {
    "invoice_number": "INV-XXX",
    "vendor": "vendor name",
    "invoice_date": "YYYY-MM-DD",
    "due_date": "YYYY-MM-DD",
    "total_amount": 0.00,
    "currency": "USD",
    "line_items": [{"description": "item", "quantity": 1, "unit_price": 0.00, "total": 0.00}]
  },
  "suggested_category": "IT Equipment|Software|Services|etc",
  "tax_deductible": true,
  "tax_deductible_reasoning": "explanation",
  "duplicate_risk": "low|medium|high",
  "duplicate_flags": ["flag if any"],
  "notes": "additional observations"
}`
        },
        { role: 'user', content: `Known recent vendors: ${knownVendors || 'none'}\n\nInvoice OCR text:\n${(rawText || '').slice(0, 8000)}` },
      ],
      maxTokens: 4000,
    });
    res.json({ success: true, result: content, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Meeting Transcription Summarizer
router.post('/summarize-meeting', validate(schemas.summarizeMeeting), async (req, res) => {
  try {
    const { transcript, participants, title } = req.body;
    const { content, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/summarize-meeting',
      inputSummary: `Meeting: ${title || 'Untitled'}`,
      messages: [
        {
          role: 'system',
          content: `You are a meeting summarization assistant.
Respond ONLY with valid JSON:
{
  "executive_summary": "3-5 sentence summary",
  "key_discussion_points": ["point 1", "point 2"],
  "decisions_made": ["decision 1"],
  "action_items": [{"task": "task description", "assignee": "name or unknown", "due_date": "date or TBD"}],
  "open_questions": ["question 1"],
  "follow_ups": ["follow-up 1"],
  "sentiment": "positive|neutral|negative|mixed",
  "meeting_effectiveness": "high|medium|low"
}`
        },
        { role: 'user', content: `Meeting: ${title || 'Untitled'}\nParticipants: ${participants || 'unknown'}\n\nTranscript:\n${(transcript || '').slice(0, 10000)}` },
      ],
      maxTokens: 4000,
    });
    res.json({ success: true, result: content, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Code Snippet Explainer
router.post('/explain-code', validate(schemas.explainCode), async (req, res) => {
  try {
    const { code, language } = req.body;
    const { content, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/explain-code',
      inputSummary: `${language || 'unknown'} code (${code.length} chars)`,
      messages: [
        {
          role: 'system',
          content: `You are a senior engineer who reviews code.
Respond ONLY with valid JSON:
{
  "language_detected": "language name",
  "plain_english_explanation": "what the code does",
  "complexity": "simple|moderate|complex",
  "optimizations": [{"issue": "description", "suggestion": "improved code or approach"}],
  "security_issues": [{"severity": "low|medium|high|critical", "issue": "description", "fix": "how to fix"}],
  "test_recommendations": ["test case 1", "test case 2"],
  "overall_quality": "excellent|good|fair|poor",
  "estimated_bugs": 0
}`
        },
        { role: 'user', content: `Language: ${language || 'auto'}\n\nCode:\n${(code || '').slice(0, 8000)}` },
      ],
      maxTokens: 4000,
    });
    res.json({ success: true, result: content, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Resume Enhancement
router.post('/enhance-resume', validate(schemas.enhanceResume), async (req, res) => {
  try {
    const { resumeText, jobDescription, targetRole } = req.body;
    const { content, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/enhance-resume',
      inputSummary: `Role: ${targetRole || 'unknown'}`,
      messages: [
        {
          role: 'system',
          content: `You are an executive career coach and ATS expert.
Respond ONLY with valid JSON:
{
  "match_score": 0-100,
  "missing_keywords": ["keyword 1", "keyword 2"],
  "strengths": ["strength 1", "strength 2"],
  "weak_phrases": [{"original": "generic phrase", "improved": "stronger version"}],
  "quantified_impact_suggestions": ["suggestion 1"],
  "formatting_improvements": ["improvement 1"],
  "ats_compatibility": "high|medium|low",
  "top_recommendation": "most important single change"
}`
        },
        { role: 'user', content: `Target role: ${targetRole || 'not specified'}\n\nJob description:\n${(jobDescription || 'n/a').slice(0, 4000)}\n\nResume:\n${(resumeText || '').slice(0, 6000)}` },
      ],
      maxTokens: 4000,
    });
    res.json({ success: true, result: content, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Contract Review Assistant
router.post('/review-contract', validate(schemas.reviewContract), async (req, res) => {
  try {
    const { contractText, contractType, partyName } = req.body;
    const { content, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/review-contract',
      inputSummary: `Type: ${contractType || 'unspecified'} | Party: ${partyName || 'unspecified'}`,
      messages: [
        {
          role: 'system',
          content: `You are a contracts attorney. Review agreements for risk. Note: This is informational only, not legal advice.
Respond ONLY with valid JSON:
{
  "risk_score": 0-100,
  "executive_summary": "one paragraph summary",
  "risky_clauses": [{"excerpt": "quoted text", "risk": "why risky", "severity": "low|medium|high"}],
  "missing_provisions": ["missing provision 1"],
  "suggested_amendments": ["amendment 1"],
  "glossary": [{"term": "legal term", "definition": "plain English"}],
  "overall_risk": "low|medium|high|very_high",
  "recommended_action": "sign|negotiate|reject|seek_counsel"
}`
        },
        { role: 'user', content: `Contract type: ${contractType || 'unspecified'}\nCounterparty: ${partyName || 'unspecified'}\n\nContract text:\n${(contractText || '').slice(0, 10000)}` },
      ],
      maxTokens: 5000,
    });
    res.json({ success: true, result: content, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Health Article Validator
router.post('/validate-health', validate(schemas.validateHealth), async (req, res) => {
  try {
    const { claimText, sourceUrl } = req.body;
    const { content, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/validate-health',
      inputSummary: claimText.slice(0, 100),
      messages: [
        {
          role: 'system',
          content: `You are a medical research validator. This is not medical advice.
Respond ONLY with valid JSON:
{
  "credibility_score": 0-100,
  "rating": "debunked|unsupported|mixed|supported|established",
  "key_issues": ["issue 1", "issue 2"],
  "cited_reputable_sources": ["PubMed/WHO/CDC reference 1"],
  "misinformation_patterns": ["pattern if any"],
  "scientific_consensus": "summary of what science says",
  "disclaimer": "This is not medical advice. Consult a healthcare professional."
}`
        },
        { role: 'user', content: `Source URL: ${sourceUrl || 'n/a'}\n\nClaim:\n${(claimText || '').slice(0, 6000)}` },
      ],
    });
    res.json({ success: true, result: content, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Competitor Price Monitor
router.post('/monitor-competitor', validate(schemas.monitorCompetitor), async (req, res) => {
  try {
    const { productName, competitorName, ourPrice, competitorPrice, priceHistory } = req.body;
    const { content, parsed, model, usage } = await runAI(req, res, {
      endpoint: '/monitor-competitor',
      inputSummary: `${productName} vs ${competitorName || 'competitor'}`,
      messages: [
        {
          role: 'system',
          content: `You are a pricing strategist.
Respond ONLY with valid JSON:
{
  "price_gap_analysis": "analysis text",
  "price_gap_percent": 0.0,
  "trend_insights": "trend description",
  "positioning_strategy": "strategy text",
  "recommended_action": "raise|hold|lower|promo",
  "recommended_action_reasoning": "why",
  "alert_headline": "one sentence alert if meaningful change",
  "competitive_advantage": "our advantage or disadvantage",
  "confidence": "high|medium|low"
}`
        },
        { role: 'user', content: `Product: ${productName}\nCompetitor: ${competitorName || 'unknown'}\nOur price: $${ourPrice || 'n/a'}\nCompetitor price: $${competitorPrice || 'n/a'}\nHistory: ${priceHistory || 'none'}` },
      ],
    });
    res.json({ success: true, result: content, parsed, model, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// GET /api/ai/results — retrieve persisted AI results
// =====================================================
router.get('/results', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const endpoint = req.query.endpoint || null;

    const AiResultModel = await getAiResultModel();
    const where = { userId: req.user.id };
    if (endpoint) where.endpoint = endpoint;

    const { count, rows } = await AiResultModel.findAndCountAll({
      where,
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

module.exports = router;
