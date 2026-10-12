import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAll, create, update, remove } from '../services/api';
import DetailModal from '../components/DetailModal';
import FormModal from '../components/FormModal';
import AIResultDisplay from '../components/AIResultDisplay';
import FullFieldPresets from '../components/FullFieldPresets';
import { reportText, reportValue } from '../components/AIReport';

const promptExamples = {
  researches: ['Compare browser extension privacy practices for a small school.', 'Research accessible reading tools for students with dyslexia.', 'Summarize current browser extension security review practices.'],
  autofills: ['Job application with name, email, experience, and resume text.', 'Customer support form with order number, issue, and preferred contact method.', 'Conference registration with attendee, accessibility needs, and dietary notes.'],
  summaries: ['Our team met on Tuesday to review a two week launch. Design is complete, documentation needs review, and support training is scheduled for Friday.', 'The quarterly update reports faster response times, two open accessibility issues, and a planned customer survey.', 'A policy memo proposes a 30 day pilot, weekly feedback, and a review before expansion.'],
  'tab-groups': ['Open tabs: project plan, issue tracker, API docs, and team chat.', 'Open tabs: train options, hotel listings, city map, and museum hours.', 'Open tabs: recipe, grocery list, nutrition guide, and cooking video.'],
  bookmarks: ['Bookmark: Web Accessibility Initiative at https://www.w3.org/WAI/.', 'Bookmark: MDN JavaScript guide at https://developer.mozilla.org/docs/Web/JavaScript.', 'Bookmark: National Park Service at https://www.nps.gov/.'],
  passwords: ['Review a password policy requiring 14 characters and a password manager.', 'Explain how to protect a shared account with multifactor authentication.', 'Recommend a recovery process for a lost password manager device.'],
  'adblock-rules': ['Suggest a rule for intrusive autoplay ads on a news site.', 'Review a cosmetic rule for a persistent newsletter popup.', 'Identify how to block a third party tracking domain without breaking checkout.'],
  'reading-items': ['Recommend introductory articles on web accessibility and inclusive design.', 'Suggest reading on browser security for a new developer.', 'Recommend practical guides to digital privacy for families.'],
  translations: ['Translate to Spanish: Your appointment is confirmed for Tuesday at 10 am.', 'Translate to Spanish: Please send the revised document by Friday.', 'Translate to Spanish: The library will close early during the holiday.'],
  screenshots: ['Annotate a screenshot of a checkout page with a confusing shipping field.', 'Annotate a dashboard screenshot with unreadable chart labels.', 'Annotate a mobile menu screenshot where the close button is hard to find.'],
  'email-templates': ['Write a courteous follow up after a product demo with next steps.', 'Write a concise appointment reminder for a client.', 'Write a professional reply acknowledging a support request.'],
  'price-trackers': ['Analyze a wireless keyboard listed at $69 with a prior price of $79.', 'Review a monitor listed at $249 and a competitor option at $229.', 'Compare a desk lamp at $45 against a typical $50 budget.'],
  'grammar-checks': ['Please review: The team have finished their report and it are ready.', 'Please review: We was planning to launch on friday.', 'Please review: Their is three options for the client to chose.'],
  citations: ['Cite an article titled Accessible Web Design by Alex Rivera, published in 2022.', 'Create an APA citation for a 2023 report titled Digital Inclusion by City Library.', 'Cite a book titled Practical UX Research by Morgan Lee, published in 2021.'],
  'darkmode-rules': ['Suggest dark mode CSS for a blog with white cards and dark text.', 'Improve contrast for a dashboard with pale blue chart labels.', 'Suggest dark mode colors for a documentation site with code blocks.'],
  'email-scans': ['Subject: Urgent account review. Please click an unfamiliar link and enter your password today.', 'Subject: Invoice update. The sender asks for payment to a new bank account without prior notice.', 'Subject: Meeting notes. A known colleague shares an ordinary document link and no payment request.'],
  'invoice-scans': ['Invoice from North Studio dated 2026-09-30: design services $800, tax $64, total $864, due 2026-10-30.', 'Invoice from Bright Print: 200 brochures at $2 each, shipping $25, total $425.', 'Invoice from City Office: monthly workspace $350, equipment rental $40, total $390.'],
  'meeting-transcripts': ['Alex: Documentation is ready. Priya: I will review it by Friday. Sam: Launch remains next Tuesday.', 'Mia: The pilot needs ten volunteers. Lee: I will send invitations tomorrow. Team: Review results in two weeks.', 'Nora: Support tickets increased. Omar: I will categorize them. Team: Decide on fixes at Monday meeting.'],
  'code-snippets': ['Explain and review: function add(a, b) { return a + b; }', 'Explain and review: const unique = [...new Set(items)];', 'Explain and review: async function load(url) { const response = await fetch(url); return response.json(); }'],
  'resume-reviews': ['Resume: Product designer with three years of experience; led accessibility audits and improved task completion.', 'Resume: Support specialist with five years of customer service and ticket triage experience.', 'Resume: Frontend developer experienced with React, testing, and performance improvements.'],
  'contract-reviews': ['Review: The vendor will deliver the site by December 1. Payment is due on acceptance. Changes require written approval.', 'Review: The consultant will provide monthly reports. Either party may terminate with 30 days notice.', 'Review: The client owns final deliverables after payment. Confidential information remains protected for two years.'],
  'health-claims': ['Evaluate the claim: Drinking water alone cures every headache.', 'Evaluate the claim: Regular walking may improve cardiovascular fitness.', 'Evaluate the claim: A supplement eliminates the need for all vaccines.'],
  'competitor-monitors': ['Compare a $29 monthly plan with a competitor plan at $25 and similar features.', 'Analyze a $99 annual plan against two alternatives at $89 and $119.', 'Review a $15 entry tier with a competitor offering a free basic tier.'],
};

function aiPromptPresets(config) {
  const examples = promptExamples[config.resource] || [
    `Review a practical ${config.itemName.toLowerCase()} scenario and list assumptions.`,
    `Analyze three observations relevant to ${config.itemName.toLowerCase()} and recommend next steps.`,
    `Prepare a concise ${config.itemName.toLowerCase()} review for a small team.`,
  ];
  return examples.map((prompt, index) => ({ label: ['Scenario example', 'Data example', 'Review example'][index], values: { prompt } }));
}

function recordPreview(value) {
  const text = reportText(reportValue(value)).replace(/\s+/g, ' ');
  return text.length > 60 ? `${text.slice(0, 60)}…` : text;
}

export default function FeaturePage({ config }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiParsed, setAiParsed] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModel, setAiModel] = useState(null);
  const [aiUsage, setAiUsage] = useState(null);
  const [aiInput, setAiInput] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const loadData = useCallback(async (targetPage = 1) => {
    try {
      const res = await getAll(config.resource, targetPage, LIMIT);
      const payload = res.data;
      if (Array.isArray(payload)) {
        setItems(payload);
        setTotalPages(1);
        setTotal(payload.length);
      } else if (payload?.data) {
        setItems(payload.data);
        setTotalPages(payload.pagination?.totalPages || 1);
        setTotal(payload.pagination?.total || payload.data.length);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }, [config.resource]);

  useEffect(() => {
    setPage(1);
    loadData(1);
    setAiResult(null);
    setAiParsed(null);
    setAiInput('');
  }, [loadData]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadData(newPage);
  };

  const handleCreate = async (data) => {
    try {
      await create(config.resource, data);
      setShowForm(false);
      loadData(page);
    } catch (err) {
      alert('Error creating item: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUpdate = async (data) => {
    try {
      await update(config.resource, data.id, data);
      setShowForm(false);
      setEditItem(null);
      setSelectedItem(null);
      loadData(page);
    } catch (err) {
      alert('Error updating item: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await remove(config.resource, id);
      setSelectedItem(null);
      loadData(page);
    } catch (err) {
      alert('Error deleting item: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setSelectedItem(null);
    setShowForm(true);
  };

  const handleAI = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    setAiParsed(null);
    try {
      const res = await config.aiAction(aiInput);
      setAiResult(res.data.result);
      setAiParsed(res.data.parsed || null);
      setAiModel(res.data.model);
      setAiUsage(res.data.usage);
    } catch (err) {
      setAiResult('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setAiLoading(false);
    }
  };

  // Save AI result as a new record in this feature's collection
  const handleSaveAIResult = async () => {
    if (!aiResult) return;
    try {
      // Build a record from the parsed JSON if available, otherwise store raw result
      const baseData = config.aiSaveMapper
        ? config.aiSaveMapper(aiInput, aiResult, aiParsed)
        : buildDefaultSaveData(config, aiInput, aiResult, aiParsed);

      await create(config.resource, baseData);
      alert('AI result saved as a new record!');
      loadData(page);
    } catch (err) {
      alert('Error saving AI result: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <button className="back-btn" onClick={() => navigate('/')}>←</button>
          <h1>{config.icon} {config.title}</h1>
          {total > 0 && (
            <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>
              {total} item{total !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setShowForm(true); }}>
            + New {config.itemName}
          </button>
        </div>
      </div>

      {/* AI Section */}
      {config.aiAction && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(99, 102, 241, 0.15)',
            borderRadius: '16px',
            padding: '20px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#a5b4fc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🤖</span>
              {config.aiLabel || 'AI Assistant'}
            </h3>
            <FullFieldPresets value={{ prompt: aiInput }} presets={aiPromptPresets(config)} disabled={aiLoading} onChange={({ prompt }) => { setAiInput(prompt); setAiResult(null); setAiParsed(null); }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder={config.aiPlaceholder || 'Enter your query...'}
                onKeyDown={(e) => e.key === 'Enter' && handleAI()}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <button className="btn btn-primary btn-sm" onClick={handleAI} disabled={aiLoading}>
                {aiLoading ? 'Processing...' : config.aiButtonLabel || 'Ask AI'}
              </button>
            </div>
            <AIResultDisplay
              result={aiResult}
              parsed={aiParsed}
              loading={aiLoading}
              model={aiModel}
              usage={aiUsage}
              onSave={aiResult ? handleSaveAIResult : null}
            />
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              {config.columns.map(col => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => setSelectedItem(item)}>
                {config.columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(item[col.key], item) : (
                      typeof item[col.key] === 'boolean'
                        ? <span className={`status-badge status-${item[col.key]}`}>{item[col.key] ? 'Yes' : 'No'}</span>
                        : recordPreview(item[col.key])
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={config.columns.length} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No items found. Click "+ New {config.itemName}" to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginTop: 20,
          paddingBottom: 20,
        }}>
          <button
            onClick={() => handlePageChange(1)}
            disabled={page <= 1}
            style={{
              padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)',
              background: 'transparent', color: page <= 1 ? '#374151' : '#a5b4fc',
              cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: 13,
            }}
          >
            «
          </button>
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            style={{
              padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)',
              background: 'transparent', color: page <= 1 ? '#374151' : '#a5b4fc',
              cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: 13,
            }}
          >
            ‹ Prev
          </button>
          <span style={{ color: '#64748b', fontSize: 13, padding: '0 8px' }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            style={{
              padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)',
              background: 'transparent', color: page >= totalPages ? '#374151' : '#a5b4fc',
              cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontSize: 13,
            }}
          >
            Next ›
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={page >= totalPages}
            style={{
              padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)',
              background: 'transparent', color: page >= totalPages ? '#374151' : '#a5b4fc',
              cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontSize: 13,
            }}
          >
            »
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          fields={config.detailFields}
          onClose={() => setSelectedItem(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <FormModal
          item={editItem}
          formFields={config.formFields}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSave={editItem ? handleUpdate : handleCreate}
          title={editItem ? `Edit ${config.itemName}` : `New ${config.itemName}`}
        />
      )}
    </div>
  );
}

// Build a sensible default record from AI result to save into the feature's table
function buildDefaultSaveData(config, input, result, parsed) {
  const resource = config.resource;

  // Feature-specific mappings using parsed JSON when available
  const mappings = {
    researches: () => ({
      title: input.slice(0, 100) || 'AI Research',
      query: input,
      summary: parsed?.summary || result.slice(0, 500),
      sources: parsed?.recommended_sources ? JSON.stringify(parsed.recommended_sources) : '',
      status: 'completed',
      category: 'AI Generated',
    }),
    summaries: () => ({
      title: input.slice(0, 100) || 'AI Summary',
      originalContent: input,
      summary: parsed?.brief_summary || result.slice(0, 500),
      keyPoints: parsed?.key_points ? parsed.key_points.join('\n') : '',
      readTime: parsed?.reading_time || '',
      category: 'AI Generated',
    }),
    translations: () => ({
      originalText: input,
      translatedText: parsed?.translation || result.slice(0, 500),
      sourceLang: 'Unknown',
      targetLang: 'Unknown',
      category: 'AI Generated',
    }),
    'grammar-checks': () => ({
      title: input.slice(0, 80) || 'Grammar Check',
      originalText: input,
      correctedText: parsed?.corrected_text || result.slice(0, 500),
      errorCount: parsed?.error_count || 0,
      category: 'AI Generated',
    }),
    'email-templates': () => ({
      name: input.slice(0, 80) || 'AI Generated Template',
      subject: parsed?.subject_line || 'AI Generated Email',
      body: parsed?.email_body || result,
      tone: parsed?.tone_used || 'professional',
      category: 'AI Generated',
      isActive: true,
    }),
    citations: () => ({
      title: input.slice(0, 100) || 'AI Citation',
      formattedCitation: parsed?.formatted_citation || result.slice(0, 500),
      citationType: parsed?.citation_style || 'APA',
    }),
    'email-scans': () => ({
      subject: input.slice(0, 100) || 'Manual Scan',
      riskScore: parsed?.risk_score || 0,
      riskLevel: parsed?.risk_level || 'unknown',
      flags: parsed?.red_flags ? JSON.stringify(parsed.red_flags) : '',
      analysis: result.slice(0, 1000),
      status: 'pending',
    }),
    'meeting-transcripts': () => ({
      title: input.slice(0, 100) || 'AI Meeting Summary',
      transcript: input,
      summary: parsed?.executive_summary || result.slice(0, 500),
      actionItems: parsed?.action_items ? JSON.stringify(parsed.action_items) : '',
      decisions: parsed?.decisions_made ? JSON.stringify(parsed.decisions_made) : '',
      followUps: parsed?.follow_ups ? JSON.stringify(parsed.follow_ups) : '',
      status: 'summarized',
    }),
    'code-snippets': () => ({
      title: input.slice(0, 80) || 'AI Code Review',
      code: input,
      language: parsed?.language_detected || 'unknown',
      explanation: parsed?.plain_english_explanation || result.slice(0, 500),
      optimizations: parsed?.optimizations ? JSON.stringify(parsed.optimizations) : '',
      securityIssues: parsed?.security_issues ? JSON.stringify(parsed.security_issues) : '',
      status: 'reviewed',
    }),
    'resume-reviews': () => ({
      resumeText: input,
      matchScore: parsed?.match_score || 0,
      feedback: result.slice(0, 1000),
      keywords: parsed?.missing_keywords ? parsed.missing_keywords.join(', ') : '',
      status: 'reviewed',
    }),
    'contract-reviews': () => ({
      contractTitle: input.slice(0, 100) || 'AI Contract Review',
      contractText: input,
      riskScore: parsed?.risk_score || 0,
      riskyClauses: parsed?.risky_clauses ? JSON.stringify(parsed.risky_clauses) : '',
      missingProvisions: parsed?.missing_provisions ? JSON.stringify(parsed.missing_provisions) : '',
      status: 'reviewed',
    }),
    'health-claims': () => ({
      title: input.slice(0, 100) || 'AI Health Claim Check',
      claimText: input,
      credibilityScore: parsed?.credibility_score || 0,
      rating: parsed?.rating || 'unknown',
      validationNotes: result.slice(0, 500),
      citedSources: parsed?.cited_reputable_sources ? JSON.stringify(parsed.cited_reputable_sources) : '',
      status: 'validated',
    }),
  };

  if (mappings[resource]) return mappings[resource]();

  // Generic fallback: use first required-looking field as title
  const titleKey = config.formFields?.find(f => f.required)?.key;
  return {
    [titleKey || 'title']: input.slice(0, 100) || `AI ${config.itemName}`,
    notes: result.slice(0, 500),
  };
}
