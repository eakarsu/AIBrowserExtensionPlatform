const express = require('express');
const https = require('https');
const router = express.Router();

function callOpenRouter(messages, res) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
      messages: messages,
      max_tokens: 2000
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Browser Extension Platform'
      }
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

// Research Assistant AI
router.post('/research', async (req, res) => {
  try {
    const { query } = req.body;
    const result = await callOpenRouter([
      { role: 'system', content: 'You are a research assistant. Provide comprehensive research results with sources, key findings, and analysis. Format your response with clear sections: Summary, Key Findings (as bullet points), Detailed Analysis, and Recommended Sources.' },
      { role: 'user', content: `Research the following topic thoroughly: ${query}` }
    ]);
    const content = result.choices?.[0]?.message?.content || 'No response generated';
    res.json({
      success: true,
      result: content,
      model: result.model,
      usage: result.usage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Content Summarizer AI
router.post('/summarize', async (req, res) => {
  try {
    const { content, url } = req.body;
    const result = await callOpenRouter([
      { role: 'system', content: 'You are a content summarizer. Provide a concise summary with key points. Format: Brief Summary (2-3 sentences), Key Points (bullet list), Main Takeaways, and Reading Time estimate.' },
      { role: 'user', content: `Summarize the following content${url ? ' from ' + url : ''}:\n\n${content}` }
    ]);
    const aiContent = result.choices?.[0]?.message?.content || 'No summary generated';
    res.json({
      success: true,
      result: aiContent,
      model: result.model,
      usage: result.usage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auto-fill AI
router.post('/autofill-suggest', async (req, res) => {
  try {
    const { formType, fields } = req.body;
    const result = await callOpenRouter([
      { role: 'system', content: 'You are a smart form auto-fill assistant. Given a form type and fields, suggest appropriate field mappings and smart fill values. Provide suggestions in a clear, organized format.' },
      { role: 'user', content: `Suggest auto-fill mappings for a ${formType} form with these fields: ${fields}` }
    ]);
    const content = result.choices?.[0]?.message?.content || 'No suggestions generated';
    res.json({
      success: true,
      result: content,
      model: result.model,
      usage: result.usage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tab Manager AI - Organize tabs
router.post('/organize-tabs', async (req, res) => {
  try {
    const { tabs } = req.body;
    const result = await callOpenRouter([
      { role: 'system', content: 'You are a tab organization assistant. Analyze the given tabs and suggest optimal groupings by category, project, or topic. Provide group names, colors, and reasoning.' },
      { role: 'user', content: `Organize these browser tabs into logical groups: ${tabs}` }
    ]);
    const content = result.choices?.[0]?.message?.content || 'No suggestions generated';
    res.json({
      success: true,
      result: content,
      model: result.model,
      usage: result.usage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bookmark AI - Categorize
router.post('/categorize-bookmark', async (req, res) => {
  try {
    const { title, url, description } = req.body;
    const result = await callOpenRouter([
      { role: 'system', content: 'You are a bookmark organization assistant. Analyze the bookmark and suggest the best folder, tags, and a brief description. Format clearly with Folder, Tags, and Description sections.' },
      { role: 'user', content: `Categorize this bookmark - Title: ${title}, URL: ${url}, Description: ${description || 'N/A'}` }
    ]);
    const content = result.choices?.[0]?.message?.content || 'No categorization generated';
    res.json({
      success: true,
      result: content,
      model: result.model,
      usage: result.usage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Password AI - Generate & Analyze
router.post('/password-analyze', async (req, res) => {
  try {
    const { requirements } = req.body;
    const result = await callOpenRouter([
      { role: 'system', content: 'You are a password security advisor. Analyze password requirements and provide security recommendations, strength analysis, and best practices. Never generate actual passwords.' },
      { role: 'user', content: `Provide password security advice for: ${requirements}` }
    ]);
    const content = result.choices?.[0]?.message?.content || 'No analysis generated';
    res.json({
      success: true,
      result: content,
      model: result.model,
      usage: result.usage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ad Blocker AI - Suggest Rules
router.post('/suggest-adblock', async (req, res) => {
  try {
    const { website } = req.body;
    const result = await callOpenRouter([
      { role: 'system', content: 'You are an ad blocking expert. Suggest ad blocking rules and patterns for websites. Provide rule patterns, element selectors, and explanation of what each rule blocks.' },
      { role: 'user', content: `Suggest ad blocking rules for: ${website}` }
    ]);
    const content = result.choices?.[0]?.message?.content || 'No rules generated';
    res.json({
      success: true,
      result: content,
      model: result.model,
      usage: result.usage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Translation AI
router.post('/translate', async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body;
    const result = await callOpenRouter([
      { role: 'system', content: 'You are a professional translator. Provide accurate translations with context notes, alternative translations where applicable, and cultural considerations. Format with: Translation, Alternative Translations, and Notes sections.' },
      { role: 'user', content: `Translate from ${sourceLang} to ${targetLang}: "${text}"` }
    ]);
    const content = result.choices?.[0]?.message?.content || 'No translation generated';
    res.json({
      success: true,
      result: content,
      model: result.model,
      usage: result.usage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Screenshot Annotator AI
router.post('/annotate', async (req, res) => {
  try {
    const { description, context } = req.body;
    const result = await callOpenRouter([
      { role: 'system', content: 'You are a screenshot annotation assistant. Suggest annotations, labels, callouts, and notes for screenshots. Provide structured annotation suggestions with positions, types, and content.' },
      { role: 'user', content: `Suggest annotations for a screenshot: ${description}. Context: ${context || 'General web page'}` }
    ]);
    const content = result.choices?.[0]?.message?.content || 'No annotations generated';
    res.json({
      success: true,
      result: content,
      model: result.model,
      usage: result.usage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Email Template AI
router.post('/generate-email', async (req, res) => {
  try {
    const { purpose, tone, context } = req.body;
    const result = await callOpenRouter([
      { role: 'system', content: 'You are an email writing assistant. Generate professional email templates with subject lines and body text. Format with: Subject Line, Email Body, and Tone Notes sections.' },
      { role: 'user', content: `Generate an email template for: ${purpose}. Tone: ${tone || 'professional'}. Context: ${context || 'General business'}` }
    ]);
    const content = result.choices?.[0]?.message?.content || 'No email generated';
    res.json({
      success: true,
      result: content,
      model: result.model,
      usage: result.usage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Price Tracker AI - Analyze prices
router.post('/analyze-price', async (req, res) => {
  try {
    const { product, currentPrice, priceHistory } = req.body;
    const result = await callOpenRouter([
      { role: 'system', content: 'You are a price analysis expert. Analyze product prices, trends, and provide buying recommendations. Format with: Price Analysis, Trend, Recommendation, and Best Time to Buy sections.' },
      { role: 'user', content: `Analyze pricing for: ${product}. Current price: $${currentPrice}. Price history: ${priceHistory || 'Not available'}` }
    ]);
    const content = result.choices?.[0]?.message?.content || 'No analysis generated';
    res.json({
      success: true,
      result: content,
      model: result.model,
      usage: result.usage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Grammar Checker AI
router.post('/check-grammar', async (req, res) => {
  try {
    const { text } = req.body;
    const result = await callOpenRouter([
      { role: 'system', content: 'You are a grammar and writing expert. Check the text for grammar, spelling, punctuation, and style issues. Format with: Corrected Text, Errors Found (numbered list with explanations), Style Suggestions, and Overall Assessment sections.' },
      { role: 'user', content: `Check the grammar and writing quality of: "${text}"` }
    ]);
    const content = result.choices?.[0]?.message?.content || 'No corrections generated';
    res.json({
      success: true,
      result: content,
      model: result.model,
      usage: result.usage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Citation Generator AI
router.post('/generate-citation', async (req, res) => {
  try {
    const { title, authors, url, publicationDate, citationType } = req.body;
    const result = await callOpenRouter([
      { role: 'system', content: 'You are a citation formatting expert. Generate properly formatted citations in the requested style. Format with: Formatted Citation, In-Text Citation, and Notes sections.' },
      { role: 'user', content: `Generate a ${citationType || 'APA'} citation for: Title: "${title}", Authors: ${authors || 'Unknown'}, URL: ${url || 'N/A'}, Date: ${publicationDate || 'N/A'}` }
    ]);
    const content = result.choices?.[0]?.message?.content || 'No citation generated';
    res.json({
      success: true,
      result: content,
      model: result.model,
      usage: result.usage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reading List AI - Suggest
router.post('/reading-suggest', async (req, res) => {
  try {
    const { interests, currentList } = req.body;
    const result = await callOpenRouter([
      { role: 'system', content: 'You are a reading recommendation assistant. Based on interests and current reading list, suggest articles, prioritize reading order, and provide reading time estimates. Format with: Recommendations, Priority Order, and Reading Schedule sections.' },
      { role: 'user', content: `Suggest readings based on interests: ${interests}. Current reading list: ${currentList || 'Empty'}` }
    ]);
    const content = result.choices?.[0]?.message?.content || 'No suggestions generated';
    res.json({
      success: true,
      result: content,
      model: result.model,
      usage: result.usage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dark Mode AI - Suggest CSS
router.post('/darkmode-suggest', async (req, res) => {
  try {
    const { website, issues } = req.body;
    const result = await callOpenRouter([
      { role: 'system', content: 'You are a dark mode CSS expert. Suggest custom CSS rules for implementing or fixing dark mode on websites. Format with: CSS Rules, Explanation, and Compatibility Notes sections.' },
      { role: 'user', content: `Suggest dark mode CSS for: ${website}. Known issues: ${issues || 'None specified'}` }
    ]);
    const content = result.choices?.[0]?.message?.content || 'No suggestions generated';
    res.json({
      success: true,
      result: content,
      model: result.model,
      usage: result.usage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
