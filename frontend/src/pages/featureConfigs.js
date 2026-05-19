import React from 'react';
import {
  aiResearch, aiSummarize, aiAutoFillSuggest, aiOrganizeTabs,
  aiCategorizeBookmark, aiPasswordAnalyze, aiSuggestAdBlock,
  aiTranslate, aiAnnotate, aiGenerateEmail, aiAnalyzePrice,
  aiCheckGrammar, aiGenerateCitation, aiReadingSuggest, aiDarkModeSuggest,
  // New proposed features
  aiScanEmail, aiAnalyzeInvoice, aiSummarizeMeeting, aiExplainCode,
  aiEnhanceResume, aiReviewContract, aiValidateHealth, aiMonitorCompetitor
} from '../services/api';

const StatusBadge = ({ value }) => (
  <span className={`status-badge status-${(value || '').replace(/\s/g, '_').toLowerCase()}`}>{value}</span>
);

const BoolBadge = ({ value }) => (
  <span className={`status-badge status-${value}`}>{value ? 'Active' : 'Inactive'}</span>
);

const PriorityBadge = ({ value }) => {
  const colors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
  return <span className={`status-badge`} style={{ background: `${colors[value] || '#64748b'}20`, color: colors[value] || '#64748b' }}>{value}</span>;
};

export const featureConfigs = {
  // 1. Research Assistant
  researches: {
    resource: 'researches',
    title: 'Research Assistant',
    icon: '🔬',
    itemName: 'Research',
    aiAction: (q) => aiResearch(q),
    aiLabel: 'AI Research Assistant',
    aiPlaceholder: 'Enter a research topic (e.g., "AI in healthcare 2024")...',
    aiButtonLabel: 'Research',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'status', label: 'Status', render: (v) => <StatusBadge value={v} /> },
      { key: 'tags', label: 'Tags' },
    ],
    detailFields: [
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'status', label: 'Status' },
      { key: 'tags', label: 'Tags' },
      { key: 'query', label: 'Research Query', fullWidth: true },
      { key: 'summary', label: 'Summary', fullWidth: true },
      { key: 'sources', label: 'Sources', fullWidth: true },
    ],
    formFields: [
      { key: 'title', label: 'Title', required: true, placeholder: 'Research title' },
      { key: 'query', label: 'Research Query', type: 'textarea', required: true, placeholder: 'What to research?' },
      { key: 'category', label: 'Category', type: 'select', options: ['Technology', 'Science', 'Business', 'Health', 'Finance', 'Education', 'Environment', 'Security', 'Automotive', 'Agriculture'] },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'in_progress', 'completed'], default: 'pending' },
      { key: 'tags', label: 'Tags', placeholder: 'Comma-separated tags' },
      { key: 'summary', label: 'Summary', type: 'textarea' },
      { key: 'sources', label: 'Sources', type: 'textarea' },
    ]
  },

  // 2. Auto-Fill
  autofills: {
    resource: 'autofills',
    title: 'Auto-Fill Forms',
    icon: '📝',
    itemName: 'Template',
    aiAction: (q) => aiAutoFillSuggest(q, q),
    aiLabel: 'AI Auto-Fill Suggestions',
    aiPlaceholder: 'Describe the form type and fields (e.g., "job application with name, email, resume")...',
    aiButtonLabel: 'Suggest',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'formType', label: 'Form Type' },
      { key: 'websiteUrl', label: 'Website' },
      { key: 'usageCount', label: 'Uses' },
      { key: 'isActive', label: 'Status', render: (v) => <BoolBadge value={v} /> },
    ],
    detailFields: [
      { key: 'name', label: 'Name' },
      { key: 'formType', label: 'Form Type' },
      { key: 'websiteUrl', label: 'Website URL' },
      { key: 'category', label: 'Category' },
      { key: 'usageCount', label: 'Usage Count' },
      { key: 'isActive', label: 'Active' },
      { key: 'fieldMappings', label: 'Field Mappings', fullWidth: true },
    ],
    formFields: [
      { key: 'name', label: 'Template Name', required: true },
      { key: 'formType', label: 'Form Type', required: true, type: 'select', options: ['employment', 'commerce', 'contact', 'subscription', 'profile', 'booking', 'insurance', 'medical', 'event', 'support', 'housing', 'education', 'survey'] },
      { key: 'websiteUrl', label: 'Website URL' },
      { key: 'category', label: 'Category' },
      { key: 'fieldMappings', label: 'Field Mappings (JSON)', type: 'textarea', placeholder: '{"field": "value"}' },
      { key: 'isActive', label: 'Active', type: 'checkbox', checkLabel: 'Template is active', default: true },
    ]
  },

  // 3. Content Summarizer
  summaries: {
    resource: 'summaries',
    title: 'Content Summarizer',
    icon: '📄',
    itemName: 'Summary',
    aiAction: (q) => aiSummarize(q),
    aiLabel: 'AI Content Summarizer',
    aiPlaceholder: 'Paste content to summarize...',
    aiButtonLabel: 'Summarize',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'wordCount', label: 'Words' },
      { key: 'readTime', label: 'Read Time' },
    ],
    detailFields: [
      { key: 'title', label: 'Title' },
      { key: 'originalUrl', label: 'Source URL' },
      { key: 'category', label: 'Category' },
      { key: 'wordCount', label: 'Word Count' },
      { key: 'readTime', label: 'Read Time' },
      { key: 'summary', label: 'Summary', fullWidth: true },
      { key: 'keyPoints', label: 'Key Points', fullWidth: true },
      { key: 'originalContent', label: 'Original Content', fullWidth: true },
    ],
    formFields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'originalUrl', label: 'Source URL' },
      { key: 'originalContent', label: 'Original Content', type: 'textarea', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Technology', 'Development', 'Economy', 'Science', 'Design', 'DevOps', 'Finance', 'Business', 'Data Science', 'Energy', 'Privacy', 'Environment'] },
      { key: 'summary', label: 'Summary', type: 'textarea' },
      { key: 'keyPoints', label: 'Key Points', type: 'textarea' },
      { key: 'wordCount', label: 'Word Count', type: 'number' },
      { key: 'readTime', label: 'Read Time' },
    ]
  },

  // 4. Tab Manager
  'tab-groups': {
    resource: 'tab-groups',
    title: 'Tab Manager',
    icon: '📑',
    itemName: 'Tab Group',
    aiAction: (q) => aiOrganizeTabs(q),
    aiLabel: 'AI Tab Organizer',
    aiPlaceholder: 'List your open tabs to organize (e.g., "GitHub, Jira, Slack, YouTube, Netflix")...',
    aiButtonLabel: 'Organize',
    columns: [
      { key: 'name', label: 'Group Name' },
      { key: 'category', label: 'Category' },
      { key: 'tabCount', label: 'Tabs' },
      { key: 'color', label: 'Color', render: (v) => <span style={{ display: 'inline-block', width: 20, height: 20, borderRadius: 6, background: v, verticalAlign: 'middle' }}></span> },
      { key: 'isActive', label: 'Status', render: (v) => <BoolBadge value={v} /> },
    ],
    detailFields: [
      { key: 'name', label: 'Group Name' },
      { key: 'description', label: 'Description' },
      { key: 'category', label: 'Category' },
      { key: 'tabCount', label: 'Tab Count' },
      { key: 'color', label: 'Color' },
      { key: 'isActive', label: 'Active' },
      { key: 'tabs', label: 'Tabs (JSON)', fullWidth: true },
    ],
    formFields: [
      { key: 'name', label: 'Group Name', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'category', label: 'Category', type: 'select', options: ['Work', 'Research', 'Social', 'News', 'Education', 'Shopping', 'DevOps', 'Design', 'Development', 'Finance', 'Communication', 'Travel', 'Health', 'Entertainment', 'Career'] },
      { key: 'tabs', label: 'Tabs (JSON)', type: 'textarea', placeholder: '[{"title":"Example","url":"https://example.com"}]' },
      { key: 'tabCount', label: 'Tab Count', type: 'number' },
      { key: 'color', label: 'Color', placeholder: '#6366f1' },
      { key: 'isActive', label: 'Active', type: 'checkbox', checkLabel: 'Group is active', default: true },
    ]
  },

  // 5. Bookmark Organizer
  bookmarks: {
    resource: 'bookmarks',
    title: 'Bookmark Organizer',
    icon: '🔖',
    itemName: 'Bookmark',
    aiAction: (q) => aiCategorizeBookmark(q, q, ''),
    aiLabel: 'AI Bookmark Categorizer',
    aiPlaceholder: 'Enter a bookmark title and URL to categorize...',
    aiButtonLabel: 'Categorize',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'url', label: 'URL' },
      { key: 'folder', label: 'Folder' },
      { key: 'tags', label: 'Tags' },
    ],
    detailFields: [
      { key: 'title', label: 'Title' },
      { key: 'url', label: 'URL' },
      { key: 'description', label: 'Description', fullWidth: true },
      { key: 'folder', label: 'Folder' },
      { key: 'tags', label: 'Tags' },
      { key: 'isActive', label: 'Active' },
    ],
    formFields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'url', label: 'URL', required: true, placeholder: 'https://...' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'folder', label: 'Folder', type: 'select', options: ['Development', 'News', 'Reading', 'Cloud', 'Design', 'AI Tools', 'DevOps', 'Entertainment', 'Productivity', 'Social'] },
      { key: 'tags', label: 'Tags', placeholder: 'Comma-separated' },
      { key: 'isActive', label: 'Active', type: 'checkbox', checkLabel: 'Bookmark is active', default: true },
    ]
  },

  // 6. Password Manager
  passwords: {
    resource: 'passwords',
    title: 'Password Manager',
    icon: '🔒',
    itemName: 'Password Entry',
    aiAction: (q) => aiPasswordAnalyze(q),
    aiLabel: 'AI Password Security Advisor',
    aiPlaceholder: 'Describe your password requirements or ask for security advice...',
    aiButtonLabel: 'Analyze',
    columns: [
      { key: 'siteName', label: 'Site' },
      { key: 'username', label: 'Username' },
      { key: 'category', label: 'Category' },
      { key: 'strength', label: 'Strength', render: (v) => <span className={`status-badge status-${(v || '').toLowerCase().replace(/\s/g, '-')}`}>{v}</span> },
    ],
    detailFields: [
      { key: 'siteName', label: 'Site Name' },
      { key: 'siteUrl', label: 'Site URL' },
      { key: 'username', label: 'Username' },
      { key: 'category', label: 'Category' },
      { key: 'strength', label: 'Password Strength' },
      { key: 'notes', label: 'Notes', fullWidth: true },
    ],
    formFields: [
      { key: 'siteName', label: 'Site Name', required: true },
      { key: 'siteUrl', label: 'Site URL', required: true },
      { key: 'username', label: 'Username', required: true },
      { key: 'encryptedPassword', label: 'Password', required: true, type: 'password' },
      { key: 'category', label: 'Category', type: 'select', options: ['Email', 'Social', 'Development', 'Cloud', 'Entertainment', 'Work', 'Shopping', 'Finance', 'Design', 'Productivity'] },
      { key: 'strength', label: 'Strength', type: 'select', options: ['Weak', 'Medium', 'Strong', 'Very Strong'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },

  // 7. Ad Blocker Rules
  'adblock-rules': {
    resource: 'adblock-rules',
    title: 'Ad Blocker Rules',
    icon: '🛡️',
    itemName: 'Rule',
    aiAction: (q) => aiSuggestAdBlock(q),
    aiLabel: 'AI Ad Block Rule Suggester',
    aiPlaceholder: 'Enter a website to get ad blocking suggestions (e.g., "news websites")...',
    aiButtonLabel: 'Suggest Rules',
    columns: [
      { key: 'name', label: 'Rule Name' },
      { key: 'ruleType', label: 'Type' },
      { key: 'domain', label: 'Domain' },
      { key: 'blockedCount', label: 'Blocked' },
      { key: 'isActive', label: 'Status', render: (v) => <BoolBadge value={v} /> },
    ],
    detailFields: [
      { key: 'name', label: 'Rule Name' },
      { key: 'pattern', label: 'Pattern', fullWidth: true },
      { key: 'ruleType', label: 'Type' },
      { key: 'domain', label: 'Domain' },
      { key: 'category', label: 'Category' },
      { key: 'blockedCount', label: 'Times Blocked' },
      { key: 'isActive', label: 'Active' },
    ],
    formFields: [
      { key: 'name', label: 'Rule Name', required: true },
      { key: 'pattern', label: 'Pattern', required: true, placeholder: '##.ad-banner or ||ads.example.com' },
      { key: 'ruleType', label: 'Rule Type', required: true, type: 'select', options: ['element', 'network'] },
      { key: 'domain', label: 'Domain', placeholder: '* for all sites' },
      { key: 'category', label: 'Category', type: 'select', options: ['Advertising', 'Video Ads', 'Social Ads', 'Popups', 'Annoyances', 'Tracking', 'Shopping Ads', 'Paywalls'] },
      { key: 'isActive', label: 'Active', type: 'checkbox', checkLabel: 'Rule is active', default: true },
    ]
  },

  // 8. Reading List
  'reading-items': {
    resource: 'reading-items',
    title: 'Reading List',
    icon: '📚',
    itemName: 'Article',
    aiAction: (q) => aiReadingSuggest(q, ''),
    aiLabel: 'AI Reading Recommender',
    aiPlaceholder: 'Describe your interests for reading recommendations...',
    aiButtonLabel: 'Recommend',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'author', label: 'Author' },
      { key: 'estimatedReadTime', label: 'Read Time' },
      { key: 'priority', label: 'Priority', render: (v) => <StatusBadge value={v} /> },
      { key: 'isRead', label: 'Read', render: (v) => <span className={`status-badge ${v ? 'status-completed' : 'status-pending'}`}>{v ? 'Read' : 'Unread'}</span> },
    ],
    detailFields: [
      { key: 'title', label: 'Title' },
      { key: 'url', label: 'URL' },
      { key: 'author', label: 'Author' },
      { key: 'estimatedReadTime', label: 'Read Time' },
      { key: 'priority', label: 'Priority' },
      { key: 'isRead', label: 'Read Status' },
      { key: 'category', label: 'Category' },
      { key: 'tags', label: 'Tags' },
      { key: 'excerpt', label: 'Excerpt', fullWidth: true },
    ],
    formFields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'url', label: 'URL', required: true },
      { key: 'author', label: 'Author' },
      { key: 'excerpt', label: 'Excerpt', type: 'textarea' },
      { key: 'estimatedReadTime', label: 'Read Time', placeholder: '15 min' },
      { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high'], default: 'medium' },
      { key: 'category', label: 'Category' },
      { key: 'tags', label: 'Tags' },
      { key: 'isRead', label: 'Read Status', type: 'checkbox', checkLabel: 'Mark as read' },
    ]
  },

  // 9. Translation Helper
  translations: {
    resource: 'translations',
    title: 'Translation Helper',
    icon: '🌐',
    itemName: 'Translation',
    aiAction: (q) => aiTranslate(q, 'English', 'Spanish'),
    aiLabel: 'AI Translator',
    aiPlaceholder: 'Enter text to translate (e.g., "Hello, how are you? - translate to Spanish")...',
    aiButtonLabel: 'Translate',
    columns: [
      { key: 'originalText', label: 'Original' },
      { key: 'translatedText', label: 'Translation' },
      { key: 'sourceLang', label: 'From' },
      { key: 'targetLang', label: 'To' },
      { key: 'category', label: 'Category' },
    ],
    detailFields: [
      { key: 'sourceLang', label: 'Source Language' },
      { key: 'targetLang', label: 'Target Language' },
      { key: 'category', label: 'Category' },
      { key: 'isFavorite', label: 'Favorite' },
      { key: 'sourceUrl', label: 'Source URL' },
      { key: 'originalText', label: 'Original Text', fullWidth: true },
      { key: 'translatedText', label: 'Translated Text', fullWidth: true },
    ],
    formFields: [
      { key: 'originalText', label: 'Original Text', type: 'textarea', required: true },
      { key: 'translatedText', label: 'Translated Text', type: 'textarea' },
      { key: 'sourceLang', label: 'Source Language', required: true, type: 'select', options: ['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Korean', 'Italian', 'Portuguese', 'Russian', 'Dutch', 'Swedish', 'Turkish', 'Polish'] },
      { key: 'targetLang', label: 'Target Language', required: true, type: 'select', options: ['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Korean', 'Italian', 'Portuguese', 'Russian', 'Dutch', 'Swedish', 'Turkish', 'Polish'] },
      { key: 'sourceUrl', label: 'Source URL' },
      { key: 'category', label: 'Category', type: 'select', options: ['Greetings', 'General', 'Travel', 'Business', 'Emergency', 'Courtesy', 'Personal', 'Weather', 'Shopping', 'Celebrations'] },
      { key: 'isFavorite', label: 'Favorite', type: 'checkbox', checkLabel: 'Mark as favorite' },
    ]
  },

  // 10. Screenshot Annotator
  screenshots: {
    resource: 'screenshots',
    title: 'Screenshot Annotator',
    icon: '📸',
    itemName: 'Screenshot',
    aiAction: (q) => aiAnnotate(q, ''),
    aiLabel: 'AI Annotation Suggester',
    aiPlaceholder: 'Describe the screenshot for AI annotation suggestions...',
    aiButtonLabel: 'Annotate',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'format', label: 'Format' },
      { key: 'tags', label: 'Tags' },
    ],
    detailFields: [
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description', fullWidth: true },
      { key: 'sourceUrl', label: 'Source URL' },
      { key: 'category', label: 'Category' },
      { key: 'format', label: 'Format' },
      { key: 'tags', label: 'Tags' },
      { key: 'annotations', label: 'Annotations (JSON)', fullWidth: true },
    ],
    formFields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'sourceUrl', label: 'Source URL' },
      { key: 'category', label: 'Category', type: 'select', options: ['Design', 'Bugs', 'Documentation', 'DevOps', 'UX', 'Debugging', 'Business', 'Architecture', 'Analytics', 'QA', 'Performance', 'Feature'] },
      { key: 'format', label: 'Format', type: 'select', options: ['png', 'jpg', 'gif', 'webp'], default: 'png' },
      { key: 'tags', label: 'Tags' },
      { key: 'annotations', label: 'Annotations (JSON)', type: 'textarea', placeholder: '[{"type":"note","text":"..."}]' },
    ]
  },

  // 11. Email Templates
  'email-templates': {
    resource: 'email-templates',
    title: 'Email Templates',
    icon: '✉️',
    itemName: 'Template',
    aiAction: (q) => aiGenerateEmail(q, 'professional', ''),
    aiLabel: 'AI Email Generator',
    aiPlaceholder: 'Describe the email purpose (e.g., "follow-up after a job interview")...',
    aiButtonLabel: 'Generate',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'subject', label: 'Subject' },
      { key: 'category', label: 'Category' },
      { key: 'tone', label: 'Tone' },
      { key: 'usageCount', label: 'Uses' },
    ],
    detailFields: [
      { key: 'name', label: 'Template Name' },
      { key: 'subject', label: 'Subject Line' },
      { key: 'category', label: 'Category' },
      { key: 'tone', label: 'Tone' },
      { key: 'usageCount', label: 'Usage Count' },
      { key: 'isActive', label: 'Active' },
      { key: 'body', label: 'Email Body', fullWidth: true },
    ],
    formFields: [
      { key: 'name', label: 'Template Name', required: true },
      { key: 'subject', label: 'Subject Line', required: true },
      { key: 'body', label: 'Email Body', type: 'textarea', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Onboarding', 'Business', 'Career', 'Development', 'Management', 'Support', 'Finance', 'Marketing', 'Personal', 'Product', 'Events', 'HR'] },
      { key: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Friendly', 'Formal', 'Casual', 'Technical', 'Empathetic'] },
      { key: 'isActive', label: 'Active', type: 'checkbox', checkLabel: 'Template is active', default: true },
    ]
  },

  // 12. Price Tracker
  'price-trackers': {
    resource: 'price-trackers',
    title: 'Price Tracker',
    icon: '💰',
    itemName: 'Product',
    aiAction: (q) => aiAnalyzePrice(q, '0', ''),
    aiLabel: 'AI Price Analyzer',
    aiPlaceholder: 'Enter a product name for price analysis...',
    aiButtonLabel: 'Analyze',
    columns: [
      { key: 'productName', label: 'Product' },
      { key: 'store', label: 'Store' },
      { key: 'currentPrice', label: 'Current Price', render: (v) => `$${Number(v).toFixed(2)}` },
      { key: 'targetPrice', label: 'Target Price', render: (v) => `$${Number(v).toFixed(2)}` },
      { key: 'isTracking', label: 'Tracking', render: (v) => <BoolBadge value={v} /> },
    ],
    detailFields: [
      { key: 'productName', label: 'Product Name' },
      { key: 'productUrl', label: 'Product URL' },
      { key: 'store', label: 'Store' },
      { key: 'category', label: 'Category' },
      { key: 'currentPrice', label: 'Current Price', render: (v) => `$${Number(v).toFixed(2)}` },
      { key: 'targetPrice', label: 'Target Price', render: (v) => `$${Number(v).toFixed(2)}` },
      { key: 'isTracking', label: 'Tracking' },
      { key: 'priceHistory', label: 'Price History (JSON)', fullWidth: true },
    ],
    formFields: [
      { key: 'productName', label: 'Product Name', required: true },
      { key: 'productUrl', label: 'Product URL', required: true },
      { key: 'currentPrice', label: 'Current Price', type: 'number', required: true },
      { key: 'targetPrice', label: 'Target Price', type: 'number' },
      { key: 'store', label: 'Store' },
      { key: 'category', label: 'Category', type: 'select', options: ['Electronics', 'Furniture', 'Home', 'Footwear', 'Toys', 'Kitchen', 'Gaming', 'Fitness'] },
      { key: 'isTracking', label: 'Tracking', type: 'checkbox', checkLabel: 'Actively tracking', default: true },
      { key: 'priceHistory', label: 'Price History (JSON)', type: 'textarea' },
    ]
  },

  // 13. Grammar Checker
  'grammar-checks': {
    resource: 'grammar-checks',
    title: 'Grammar Checker',
    icon: '✏️',
    itemName: 'Check',
    aiAction: (q) => aiCheckGrammar(q),
    aiLabel: 'AI Grammar Checker',
    aiPlaceholder: 'Paste text to check grammar and writing quality...',
    aiButtonLabel: 'Check Grammar',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'errorCount', label: 'Errors' },
    ],
    detailFields: [
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'errorCount', label: 'Error Count' },
      { key: 'sourceUrl', label: 'Source URL' },
      { key: 'originalText', label: 'Original Text', fullWidth: true },
      { key: 'correctedText', label: 'Corrected Text', fullWidth: true },
      { key: 'corrections', label: 'Corrections (JSON)', fullWidth: true },
    ],
    formFields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'originalText', label: 'Original Text', type: 'textarea', required: true },
      { key: 'correctedText', label: 'Corrected Text', type: 'textarea' },
      { key: 'category', label: 'Category', type: 'select', options: ['Email', 'Blog', 'Resume', 'Marketing', 'Academic', 'Social Media', 'Business', 'Support', 'Notes', 'Development', 'HR', 'Documentation', 'Personal', 'Presentation'] },
      { key: 'errorCount', label: 'Error Count', type: 'number' },
      { key: 'sourceUrl', label: 'Source URL' },
    ]
  },

  // 14. Citation Generator
  citations: {
    resource: 'citations',
    title: 'Citation Generator',
    icon: '📖',
    itemName: 'Citation',
    aiAction: (q) => aiGenerateCitation(q, '', '', '', 'APA'),
    aiLabel: 'AI Citation Generator',
    aiPlaceholder: 'Enter a title or source to generate a citation...',
    aiButtonLabel: 'Generate Citation',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'authors', label: 'Authors' },
      { key: 'citationType', label: 'Style' },
      { key: 'publicationDate', label: 'Year' },
      { key: 'category', label: 'Category' },
    ],
    detailFields: [
      { key: 'title', label: 'Title' },
      { key: 'authors', label: 'Authors' },
      { key: 'sourceUrl', label: 'Source URL' },
      { key: 'publicationDate', label: 'Publication Date' },
      { key: 'publisher', label: 'Publisher' },
      { key: 'citationType', label: 'Citation Style' },
      { key: 'category', label: 'Category' },
      { key: 'formattedCitation', label: 'Formatted Citation', fullWidth: true },
    ],
    formFields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'authors', label: 'Authors' },
      { key: 'sourceUrl', label: 'Source URL' },
      { key: 'publicationDate', label: 'Publication Date' },
      { key: 'publisher', label: 'Publisher' },
      { key: 'citationType', label: 'Citation Style', type: 'select', options: ['APA', 'MLA', 'Chicago', 'IEEE', 'Harvard', 'Vancouver'], default: 'APA' },
      { key: 'category', label: 'Category', type: 'select', options: ['AI/ML', 'Software Engineering', 'Computer Science', 'NLP', 'Computer Vision', 'Psychology', 'Networking', 'Web Development', 'Project Management', 'Distributed Systems'] },
      { key: 'formattedCitation', label: 'Formatted Citation', type: 'textarea' },
    ]
  },

  // 15. Dark Mode Manager
  'darkmode-rules': {
    resource: 'darkmode-rules',
    title: 'Dark Mode Manager',
    icon: '🌙',
    itemName: 'Rule',
    aiAction: (q) => aiDarkModeSuggest(q, ''),
    aiLabel: 'AI Dark Mode CSS Suggester',
    aiPlaceholder: 'Enter a website for dark mode CSS suggestions...',
    aiButtonLabel: 'Suggest CSS',
    columns: [
      { key: 'siteName', label: 'Site' },
      { key: 'theme', label: 'Theme' },
      { key: 'brightness', label: 'Brightness' },
      { key: 'contrast', label: 'Contrast' },
      { key: 'isEnabled', label: 'Enabled', render: (v) => <BoolBadge value={v} /> },
    ],
    detailFields: [
      { key: 'siteName', label: 'Site Name' },
      { key: 'siteUrl', label: 'Site URL' },
      { key: 'theme', label: 'Theme' },
      { key: 'brightness', label: 'Brightness' },
      { key: 'contrast', label: 'Contrast' },
      { key: 'category', label: 'Category' },
      { key: 'isEnabled', label: 'Enabled' },
      { key: 'customCss', label: 'Custom CSS', fullWidth: true },
    ],
    formFields: [
      { key: 'siteName', label: 'Site Name', required: true },
      { key: 'siteUrl', label: 'Site URL', required: true },
      { key: 'theme', label: 'Theme', type: 'select', options: ['dark', 'dim', 'sepia'], default: 'dark' },
      { key: 'brightness', label: 'Brightness (0-100)', type: 'number' },
      { key: 'contrast', label: 'Contrast (0-200)', type: 'number' },
      { key: 'category', label: 'Category', type: 'select', options: ['Search', 'Development', 'Reference', 'Social', 'Reading', 'Video', 'News', 'Shopping', 'Professional', 'Entertainment', 'Documentation', 'Email'] },
      { key: 'customCss', label: 'Custom CSS', type: 'textarea' },
      { key: 'isEnabled', label: 'Enabled', type: 'checkbox', checkLabel: 'Dark mode enabled', default: true },
    ]
  },

  // ==================== NON-AI FEATURES ====================

  // 16. Notes
  notes: {
    resource: 'notes',
    title: 'Notes',
    icon: '🗒️',
    itemName: 'Note',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'folder', label: 'Folder' },
      { key: 'tags', label: 'Tags' },
      { key: 'isPinned', label: 'Pinned', render: (v) => v ? <span className="status-badge status-completed">Pinned</span> : '' },
      { key: 'color', label: 'Color', render: (v) => <span style={{ display: 'inline-block', width: 20, height: 20, borderRadius: 6, background: v, verticalAlign: 'middle' }}></span> },
    ],
    detailFields: [
      { key: 'title', label: 'Title' },
      { key: 'folder', label: 'Folder' },
      { key: 'category', label: 'Category' },
      { key: 'tags', label: 'Tags' },
      { key: 'isPinned', label: 'Pinned' },
      { key: 'color', label: 'Color' },
      { key: 'content', label: 'Content', fullWidth: true },
    ],
    formFields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'content', label: 'Content', type: 'textarea', required: true },
      { key: 'folder', label: 'Folder', type: 'select', options: ['General', 'Work', 'Personal', 'Ideas', 'Meeting Notes', 'Journal', 'Reference', 'Archive'] },
      { key: 'category', label: 'Category' },
      { key: 'tags', label: 'Tags', placeholder: 'Comma-separated tags' },
      { key: 'color', label: 'Color', placeholder: '#1e293b' },
      { key: 'isPinned', label: 'Pinned', type: 'checkbox', checkLabel: 'Pin this note' },
    ]
  },

  // 17. Todo List
  todos: {
    resource: 'todos',
    title: 'Todo List',
    icon: '✅',
    itemName: 'Task',
    columns: [
      { key: 'title', label: 'Task' },
      { key: 'priority', label: 'Priority', render: (v) => <PriorityBadge value={v} /> },
      { key: 'status', label: 'Status', render: (v) => <StatusBadge value={v} /> },
      { key: 'dueDate', label: 'Due Date' },
      { key: 'isCompleted', label: 'Done', render: (v) => <span className={`status-badge ${v ? 'status-completed' : 'status-pending'}`}>{v ? 'Done' : 'Pending'}</span> },
    ],
    detailFields: [
      { key: 'title', label: 'Task' },
      { key: 'priority', label: 'Priority' },
      { key: 'status', label: 'Status' },
      { key: 'dueDate', label: 'Due Date' },
      { key: 'category', label: 'Category' },
      { key: 'tags', label: 'Tags' },
      { key: 'isCompleted', label: 'Completed' },
      { key: 'description', label: 'Description', fullWidth: true },
    ],
    formFields: [
      { key: 'title', label: 'Task Title', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high'], default: 'medium' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
      { key: 'dueDate', label: 'Due Date', placeholder: 'YYYY-MM-DD' },
      { key: 'category', label: 'Category', type: 'select', options: ['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Learning', 'Home', 'Errands'] },
      { key: 'tags', label: 'Tags', placeholder: 'Comma-separated' },
      { key: 'isCompleted', label: 'Completed', type: 'checkbox', checkLabel: 'Mark as completed' },
    ]
  },

  // 18. Pomodoro Timer
  'pomodoro-sessions': {
    resource: 'pomodoro-sessions',
    title: 'Pomodoro Timer',
    icon: '🍅',
    itemName: 'Session',
    columns: [
      { key: 'taskName', label: 'Task' },
      { key: 'workDuration', label: 'Work (min)' },
      { key: 'breakDuration', label: 'Break (min)' },
      { key: 'sessionsCompleted', label: 'Sessions' },
      { key: 'totalMinutes', label: 'Total Min' },
      { key: 'status', label: 'Status', render: (v) => <StatusBadge value={v} /> },
    ],
    detailFields: [
      { key: 'taskName', label: 'Task Name' },
      { key: 'workDuration', label: 'Work Duration (min)' },
      { key: 'breakDuration', label: 'Break Duration (min)' },
      { key: 'sessionsCompleted', label: 'Sessions Completed' },
      { key: 'totalMinutes', label: 'Total Minutes' },
      { key: 'status', label: 'Status' },
      { key: 'category', label: 'Category' },
      { key: 'notes', label: 'Notes', fullWidth: true },
    ],
    formFields: [
      { key: 'taskName', label: 'Task Name', required: true },
      { key: 'workDuration', label: 'Work Duration (min)', type: 'number', default: 25 },
      { key: 'breakDuration', label: 'Break Duration (min)', type: 'number', default: 5 },
      { key: 'sessionsCompleted', label: 'Sessions Completed', type: 'number' },
      { key: 'totalMinutes', label: 'Total Minutes', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'in_progress', 'completed', 'paused'], default: 'pending' },
      { key: 'category', label: 'Category', type: 'select', options: ['Development', 'Writing', 'Study', 'Design', 'Research', 'Planning', 'Admin', 'Creative'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },

  // 19. Habit Tracker
  habits: {
    resource: 'habits',
    title: 'Habit Tracker',
    icon: '🎯',
    itemName: 'Habit',
    columns: [
      { key: 'name', label: 'Habit' },
      { key: 'frequency', label: 'Frequency' },
      { key: 'currentStreak', label: 'Streak' },
      { key: 'longestStreak', label: 'Best Streak' },
      { key: 'totalCompletions', label: 'Total' },
      { key: 'isActive', label: 'Active', render: (v) => <BoolBadge value={v} /> },
    ],
    detailFields: [
      { key: 'name', label: 'Habit Name' },
      { key: 'frequency', label: 'Frequency' },
      { key: 'currentStreak', label: 'Current Streak' },
      { key: 'longestStreak', label: 'Longest Streak' },
      { key: 'totalCompletions', label: 'Total Completions' },
      { key: 'category', label: 'Category' },
      { key: 'isActive', label: 'Active' },
      { key: 'color', label: 'Color' },
      { key: 'description', label: 'Description', fullWidth: true },
    ],
    formFields: [
      { key: 'name', label: 'Habit Name', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'frequency', label: 'Frequency', type: 'select', options: ['daily', 'weekly', 'monthly', '3x per week', '5x per week'], default: 'daily' },
      { key: 'currentStreak', label: 'Current Streak', type: 'number' },
      { key: 'longestStreak', label: 'Longest Streak', type: 'number' },
      { key: 'totalCompletions', label: 'Total Completions', type: 'number' },
      { key: 'category', label: 'Category', type: 'select', options: ['Health', 'Fitness', 'Mindfulness', 'Learning', 'Productivity', 'Social', 'Creative', 'Finance'] },
      { key: 'color', label: 'Color', placeholder: '#6366f1' },
      { key: 'isActive', label: 'Active', type: 'checkbox', checkLabel: 'Habit is active', default: true },
    ]
  },

  // 20. Expense Tracker
  expenses: {
    resource: 'expenses',
    title: 'Expense Tracker',
    icon: '💳',
    itemName: 'Expense',
    columns: [
      { key: 'description', label: 'Description' },
      { key: 'amount', label: 'Amount', render: (v) => `$${Number(v).toFixed(2)}` },
      { key: 'category', label: 'Category' },
      { key: 'paymentMethod', label: 'Payment' },
      { key: 'date', label: 'Date' },
      { key: 'isRecurring', label: 'Recurring', render: (v) => v ? <span className="status-badge status-true">Recurring</span> : '' },
    ],
    detailFields: [
      { key: 'description', label: 'Description' },
      { key: 'amount', label: 'Amount', render: (v) => `$${Number(v).toFixed(2)}` },
      { key: 'category', label: 'Category' },
      { key: 'paymentMethod', label: 'Payment Method' },
      { key: 'date', label: 'Date' },
      { key: 'isRecurring', label: 'Recurring' },
      { key: 'tags', label: 'Tags' },
      { key: 'notes', label: 'Notes', fullWidth: true },
    ],
    formFields: [
      { key: 'description', label: 'Description', required: true },
      { key: 'amount', label: 'Amount ($)', type: 'number', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Food', 'Transport', 'Housing', 'Entertainment', 'Shopping', 'Health', 'Education', 'Utilities', 'Subscriptions', 'Travel', 'Insurance', 'Other'] },
      { key: 'paymentMethod', label: 'Payment Method', type: 'select', options: ['Credit Card', 'Debit Card', 'Cash', 'PayPal', 'Bank Transfer', 'Crypto'] },
      { key: 'date', label: 'Date', placeholder: 'YYYY-MM-DD' },
      { key: 'tags', label: 'Tags', placeholder: 'Comma-separated' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
      { key: 'isRecurring', label: 'Recurring', type: 'checkbox', checkLabel: 'This is a recurring expense' },
    ]
  },

  // 21. Clipboard History
  'clipboard-entries': {
    resource: 'clipboard-entries',
    title: 'Clipboard History',
    icon: '📋',
    itemName: 'Entry',
    columns: [
      { key: 'content', label: 'Content' },
      { key: 'contentType', label: 'Type' },
      { key: 'sourceUrl', label: 'Source' },
      { key: 'isFavorite', label: 'Favorite', render: (v) => v ? <span className="status-badge status-completed">Fav</span> : '' },
    ],
    detailFields: [
      { key: 'contentType', label: 'Content Type' },
      { key: 'sourceUrl', label: 'Source URL' },
      { key: 'category', label: 'Category' },
      { key: 'tags', label: 'Tags' },
      { key: 'isFavorite', label: 'Favorite' },
      { key: 'content', label: 'Content', fullWidth: true },
    ],
    formFields: [
      { key: 'content', label: 'Content', type: 'textarea', required: true },
      { key: 'contentType', label: 'Content Type', type: 'select', options: ['text', 'code', 'url', 'email', 'phone', 'address', 'other'], default: 'text' },
      { key: 'sourceUrl', label: 'Source URL' },
      { key: 'category', label: 'Category' },
      { key: 'tags', label: 'Tags', placeholder: 'Comma-separated' },
      { key: 'isFavorite', label: 'Favorite', type: 'checkbox', checkLabel: 'Mark as favorite' },
    ]
  },

  // 22. Site Blocker
  'blocked-sites': {
    resource: 'blocked-sites',
    title: 'Site Blocker',
    icon: '🚫',
    itemName: 'Blocked Site',
    columns: [
      { key: 'siteName', label: 'Site' },
      { key: 'url', label: 'URL' },
      { key: 'reason', label: 'Reason' },
      { key: 'blockedCount', label: 'Blocked' },
      { key: 'isActive', label: 'Active', render: (v) => <BoolBadge value={v} /> },
    ],
    detailFields: [
      { key: 'siteName', label: 'Site Name' },
      { key: 'url', label: 'URL' },
      { key: 'reason', label: 'Reason' },
      { key: 'schedule', label: 'Schedule' },
      { key: 'blockedCount', label: 'Times Blocked' },
      { key: 'category', label: 'Category' },
      { key: 'isActive', label: 'Active' },
    ],
    formFields: [
      { key: 'siteName', label: 'Site Name', required: true },
      { key: 'url', label: 'URL', required: true, placeholder: 'https://...' },
      { key: 'reason', label: 'Reason', type: 'select', options: ['Distraction', 'Time Waster', 'Productivity', 'Focus Mode', 'Parental Control', 'Security', 'Other'] },
      { key: 'schedule', label: 'Schedule', placeholder: 'e.g., Weekdays 9-5' },
      { key: 'category', label: 'Category', type: 'select', options: ['Social Media', 'Entertainment', 'News', 'Gaming', 'Shopping', 'Video', 'Forums', 'Other'] },
      { key: 'isActive', label: 'Active', type: 'checkbox', checkLabel: 'Block is active', default: true },
    ]
  },

  // 23. Quick Links
  'quick-links': {
    resource: 'quick-links',
    title: 'Quick Links',
    icon: '🔗',
    itemName: 'Link',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'url', label: 'URL' },
      { key: 'folder', label: 'Folder' },
      { key: 'clickCount', label: 'Clicks' },
      { key: 'isPinned', label: 'Pinned', render: (v) => v ? <span className="status-badge status-completed">Pinned</span> : '' },
    ],
    detailFields: [
      { key: 'title', label: 'Title' },
      { key: 'url', label: 'URL' },
      { key: 'folder', label: 'Folder' },
      { key: 'icon', label: 'Icon' },
      { key: 'clickCount', label: 'Click Count' },
      { key: 'category', label: 'Category' },
      { key: 'isPinned', label: 'Pinned' },
      { key: 'description', label: 'Description', fullWidth: true },
    ],
    formFields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'url', label: 'URL', required: true, placeholder: 'https://...' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'folder', label: 'Folder', type: 'select', options: ['General', 'Work', 'Dev Tools', 'Social', 'News', 'Entertainment', 'Shopping', 'Reference', 'Finance', 'Learning'] },
      { key: 'icon', label: 'Icon/Emoji', placeholder: 'e.g., 🌐' },
      { key: 'category', label: 'Category' },
      { key: 'isPinned', label: 'Pinned', type: 'checkbox', checkLabel: 'Pin this link' },
    ]
  },

  // 24. Session Saver
  'saved-sessions': {
    resource: 'saved-sessions',
    title: 'Session Saver',
    icon: '💾',
    itemName: 'Session',
    columns: [
      { key: 'name', label: 'Session Name' },
      { key: 'tabCount', label: 'Tabs' },
      { key: 'windowCount', label: 'Windows' },
      { key: 'isAutoSaved', label: 'Auto-saved', render: (v) => v ? <span className="status-badge status-true">Auto</span> : <span className="status-badge status-false">Manual</span> },
      { key: 'category', label: 'Category' },
    ],
    detailFields: [
      { key: 'name', label: 'Session Name' },
      { key: 'tabCount', label: 'Tab Count' },
      { key: 'windowCount', label: 'Window Count' },
      { key: 'isAutoSaved', label: 'Auto-saved' },
      { key: 'category', label: 'Category' },
      { key: 'description', label: 'Description', fullWidth: true },
      { key: 'tabs', label: 'Tabs (JSON)', fullWidth: true },
    ],
    formFields: [
      { key: 'name', label: 'Session Name', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'tabs', label: 'Tabs (JSON)', type: 'textarea', placeholder: '[{"title":"Tab","url":"https://..."}]' },
      { key: 'tabCount', label: 'Tab Count', type: 'number' },
      { key: 'windowCount', label: 'Window Count', type: 'number', default: 1 },
      { key: 'category', label: 'Category', type: 'select', options: ['Work', 'Research', 'Personal', 'Project', 'Daily', 'Meeting', 'Development', 'Design'] },
      { key: 'isAutoSaved', label: 'Auto-saved', type: 'checkbox', checkLabel: 'Auto-saved session' },
    ]
  },

  // 25. Countdown Timer
  countdowns: {
    resource: 'countdowns',
    title: 'Countdown Timer',
    icon: '⏳',
    itemName: 'Countdown',
    columns: [
      { key: 'title', label: 'Event' },
      { key: 'targetDate', label: 'Target Date' },
      { key: 'category', label: 'Category' },
      { key: 'isActive', label: 'Active', render: (v) => <BoolBadge value={v} /> },
      { key: 'color', label: 'Color', render: (v) => <span style={{ display: 'inline-block', width: 20, height: 20, borderRadius: 6, background: v, verticalAlign: 'middle' }}></span> },
    ],
    detailFields: [
      { key: 'title', label: 'Event Title' },
      { key: 'targetDate', label: 'Target Date' },
      { key: 'category', label: 'Category' },
      { key: 'color', label: 'Color' },
      { key: 'notifyBefore', label: 'Notify Before' },
      { key: 'isActive', label: 'Active' },
      { key: 'description', label: 'Description', fullWidth: true },
    ],
    formFields: [
      { key: 'title', label: 'Event Title', required: true },
      { key: 'targetDate', label: 'Target Date', required: true, placeholder: 'YYYY-MM-DD' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'color', label: 'Color', placeholder: '#6366f1' },
      { key: 'notifyBefore', label: 'Notify Before', type: 'select', options: ['1 hour', '1 day', '3 days', '1 week', '2 weeks', '1 month'] },
      { key: 'category', label: 'Category', type: 'select', options: ['Birthday', 'Holiday', 'Deadline', 'Launch', 'Meeting', 'Travel', 'Event', 'Personal', 'Work'] },
      { key: 'isActive', label: 'Active', type: 'checkbox', checkLabel: 'Countdown is active', default: true },
    ]
  },

  // 26. Color Palette
  'color-palettes': {
    resource: 'color-palettes',
    title: 'Color Palette',
    icon: '🎨',
    itemName: 'Palette',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'colors', label: 'Colors' },
      { key: 'category', label: 'Category' },
      { key: 'isFavorite', label: 'Favorite', render: (v) => v ? <span className="status-badge status-completed">Fav</span> : '' },
    ],
    detailFields: [
      { key: 'name', label: 'Palette Name' },
      { key: 'colors', label: 'Colors', fullWidth: true },
      { key: 'sourceUrl', label: 'Source URL' },
      { key: 'category', label: 'Category' },
      { key: 'tags', label: 'Tags' },
      { key: 'isFavorite', label: 'Favorite' },
      { key: 'description', label: 'Description', fullWidth: true },
    ],
    formFields: [
      { key: 'name', label: 'Palette Name', required: true },
      { key: 'colors', label: 'Colors', type: 'textarea', required: true, placeholder: '#ff6384, #36a2eb, #ffce56, #4bc0c0' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'sourceUrl', label: 'Source URL' },
      { key: 'category', label: 'Category', type: 'select', options: ['Web Design', 'UI/UX', 'Branding', 'Nature', 'Minimal', 'Vibrant', 'Pastel', 'Dark', 'Gradient', 'Retro'] },
      { key: 'tags', label: 'Tags', placeholder: 'Comma-separated' },
      { key: 'isFavorite', label: 'Favorite', type: 'checkbox', checkLabel: 'Mark as favorite' },
    ]
  },

  // 27. Snippet Manager
  snippets: {
    resource: 'snippets',
    title: 'Snippet Manager',
    icon: '💻',
    itemName: 'Snippet',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'language', label: 'Language' },
      { key: 'category', label: 'Category' },
      { key: 'usageCount', label: 'Uses' },
      { key: 'isFavorite', label: 'Favorite', render: (v) => v ? <span className="status-badge status-completed">Fav</span> : '' },
    ],
    detailFields: [
      { key: 'title', label: 'Title' },
      { key: 'language', label: 'Language' },
      { key: 'category', label: 'Category' },
      { key: 'tags', label: 'Tags' },
      { key: 'usageCount', label: 'Usage Count' },
      { key: 'isFavorite', label: 'Favorite' },
      { key: 'description', label: 'Description', fullWidth: true },
      { key: 'code', label: 'Code', fullWidth: true },
    ],
    formFields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'code', label: 'Code', type: 'textarea', required: true },
      { key: 'language', label: 'Language', type: 'select', options: ['javascript', 'typescript', 'python', 'html', 'css', 'sql', 'bash', 'go', 'rust', 'java', 'ruby', 'php', 'c', 'cpp', 'swift', 'kotlin'], default: 'javascript' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'category', label: 'Category', type: 'select', options: ['Utility', 'Algorithm', 'API', 'UI Component', 'Database', 'Auth', 'Testing', 'Config', 'DevOps', 'Other'] },
      { key: 'tags', label: 'Tags', placeholder: 'Comma-separated' },
      { key: 'isFavorite', label: 'Favorite', type: 'checkbox', checkLabel: 'Mark as favorite' },
    ]
  },

  // 28. RSS Feed Reader
  'rss-feeds': {
    resource: 'rss-feeds',
    title: 'RSS Feed Reader',
    icon: '📡',
    itemName: 'Feed',
    columns: [
      { key: 'title', label: 'Feed' },
      { key: 'feedUrl', label: 'Feed URL' },
      { key: 'itemCount', label: 'Items' },
      { key: 'category', label: 'Category' },
      { key: 'isActive', label: 'Active', render: (v) => <BoolBadge value={v} /> },
    ],
    detailFields: [
      { key: 'title', label: 'Feed Title' },
      { key: 'feedUrl', label: 'Feed URL' },
      { key: 'siteUrl', label: 'Site URL' },
      { key: 'category', label: 'Category' },
      { key: 'itemCount', label: 'Item Count' },
      { key: 'lastFetched', label: 'Last Fetched' },
      { key: 'isActive', label: 'Active' },
      { key: 'description', label: 'Description', fullWidth: true },
    ],
    formFields: [
      { key: 'title', label: 'Feed Title', required: true },
      { key: 'feedUrl', label: 'Feed URL', required: true, placeholder: 'https://example.com/rss' },
      { key: 'siteUrl', label: 'Site URL' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'category', label: 'Category', type: 'select', options: ['Tech', 'News', 'Science', 'Business', 'Design', 'Development', 'Gaming', 'Sports', 'Entertainment', 'Finance'] },
      { key: 'itemCount', label: 'Item Count', type: 'number' },
      { key: 'lastFetched', label: 'Last Fetched', placeholder: 'YYYY-MM-DD' },
      { key: 'isActive', label: 'Active', type: 'checkbox', checkLabel: 'Feed is active', default: true },
    ]
  },

  // 29. Contact Manager
  contacts: {
    resource: 'contacts',
    title: 'Contact Manager',
    icon: '👤',
    itemName: 'Contact',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'company', label: 'Company' },
      { key: 'role', label: 'Role' },
      { key: 'isFavorite', label: 'Favorite', render: (v) => v ? <span className="status-badge status-completed">Fav</span> : '' },
    ],
    detailFields: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'company', label: 'Company' },
      { key: 'role', label: 'Role' },
      { key: 'category', label: 'Category' },
      { key: 'isFavorite', label: 'Favorite' },
      { key: 'notes', label: 'Notes', fullWidth: true },
    ],
    formFields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'company', label: 'Company' },
      { key: 'role', label: 'Role' },
      { key: 'category', label: 'Category', type: 'select', options: ['Work', 'Personal', 'Client', 'Vendor', 'Partner', 'Family', 'Friend', 'Networking'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
      { key: 'isFavorite', label: 'Favorite', type: 'checkbox', checkLabel: 'Mark as favorite' },
    ]
  },

  // 30. Workout Tracker
  workouts: {
    resource: 'workouts',
    title: 'Workout Tracker',
    icon: '🏋️',
    itemName: 'Workout',
    columns: [
      { key: 'name', label: 'Exercise' },
      { key: 'exerciseType', label: 'Type' },
      { key: 'duration', label: 'Duration (min)' },
      { key: 'calories', label: 'Calories' },
      { key: 'date', label: 'Date' },
    ],
    detailFields: [
      { key: 'name', label: 'Exercise Name' },
      { key: 'exerciseType', label: 'Exercise Type' },
      { key: 'duration', label: 'Duration (min)' },
      { key: 'sets', label: 'Sets' },
      { key: 'reps', label: 'Reps' },
      { key: 'weight', label: 'Weight (lbs)' },
      { key: 'calories', label: 'Calories Burned' },
      { key: 'date', label: 'Date' },
      { key: 'category', label: 'Category' },
      { key: 'notes', label: 'Notes', fullWidth: true },
    ],
    formFields: [
      { key: 'name', label: 'Exercise Name', required: true },
      { key: 'exerciseType', label: 'Exercise Type', required: true, type: 'select', options: ['Strength', 'Cardio', 'Flexibility', 'HIIT', 'Yoga', 'Swimming', 'Cycling', 'Running', 'Walking', 'Sports', 'Other'] },
      { key: 'duration', label: 'Duration (min)', type: 'number' },
      { key: 'sets', label: 'Sets', type: 'number' },
      { key: 'reps', label: 'Reps', type: 'number' },
      { key: 'weight', label: 'Weight (lbs)', type: 'number' },
      { key: 'calories', label: 'Calories Burned', type: 'number' },
      { key: 'date', label: 'Date', placeholder: 'YYYY-MM-DD' },
      { key: 'category', label: 'Category', type: 'select', options: ['Upper Body', 'Lower Body', 'Core', 'Full Body', 'Cardio', 'Recovery', 'Mobility'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },

  // ====== NEW PROPOSED FEATURES ======

  // 1. Email Security Scanner
  'email-scans': {
    resource: 'email-scans',
    title: 'Email Security Scanner',
    icon: '🛡️',
    itemName: 'Email Scan',
    aiAction: (q) => aiScanEmail('Manual scan', '', '', q),
    aiLabel: 'AI Email Phishing Scanner',
    aiPlaceholder: 'Paste email body or full message text to scan for phishing...',
    aiButtonLabel: 'Scan Email',
    columns: [
      { key: 'subject', label: 'Subject' },
      { key: 'sender', label: 'Sender' },
      { key: 'riskLevel', label: 'Risk', render: (v) => <PriorityBadge value={v} /> },
      { key: 'riskScore', label: 'Score' },
      { key: 'status', label: 'Status', render: (v) => <StatusBadge value={v} /> },
    ],
    detailFields: [
      { key: 'subject', label: 'Subject' },
      { key: 'sender', label: 'Sender' },
      { key: 'riskLevel', label: 'Risk Level' },
      { key: 'riskScore', label: 'Risk Score' },
      { key: 'status', label: 'Status' },
      { key: 'flags', label: 'Red Flags', fullWidth: true },
      { key: 'headers', label: 'Headers', fullWidth: true },
      { key: 'bodySnippet', label: 'Body Snippet', fullWidth: true },
      { key: 'analysis', label: 'AI Analysis', fullWidth: true },
    ],
    formFields: [
      { key: 'subject', label: 'Subject', required: true },
      { key: 'sender', label: 'Sender Email' },
      { key: 'headers', label: 'Email Headers', type: 'textarea' },
      { key: 'bodySnippet', label: 'Body Snippet', type: 'textarea' },
      { key: 'riskLevel', label: 'Risk Level', type: 'select', options: ['low', 'medium', 'high', 'critical', 'unknown'], default: 'unknown' },
      { key: 'riskScore', label: 'Risk Score (0-100)', type: 'number' },
      { key: 'flags', label: 'Red Flags', type: 'textarea' },
      { key: 'analysis', label: 'Analysis Notes', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'flagged', 'safe', 'reported'], default: 'pending' },
    ]
  },

  // 2. Invoice OCR & Analysis
  'invoice-scans': {
    resource: 'invoice-scans',
    title: 'Invoice OCR & Analysis',
    icon: '🧾',
    itemName: 'Invoice',
    aiAction: (q) => aiAnalyzeInvoice(q, ''),
    aiLabel: 'AI Invoice Extractor',
    aiPlaceholder: 'Paste OCR text from an invoice (vendor, line items, amounts)...',
    aiButtonLabel: 'Extract & Analyze',
    columns: [
      { key: 'vendor', label: 'Vendor' },
      { key: 'invoiceNumber', label: 'Invoice #' },
      { key: 'amount', label: 'Amount' },
      { key: 'category', label: 'Category' },
      { key: 'duplicateFlag', label: 'Duplicate', render: (v) => <BoolBadge value={v} /> },
      { key: 'status', label: 'Status', render: (v) => <StatusBadge value={v} /> },
    ],
    detailFields: [
      { key: 'vendor', label: 'Vendor' },
      { key: 'invoiceNumber', label: 'Invoice Number' },
      { key: 'amount', label: 'Amount' },
      { key: 'invoiceDate', label: 'Invoice Date' },
      { key: 'dueDate', label: 'Due Date' },
      { key: 'category', label: 'Category' },
      { key: 'taxDeductible', label: 'Tax Deductible' },
      { key: 'duplicateFlag', label: 'Duplicate Flag' },
      { key: 'rawText', label: 'Raw OCR Text', fullWidth: true },
      { key: 'extractedData', label: 'Extracted Data', fullWidth: true },
      { key: 'notes', label: 'Notes', fullWidth: true },
    ],
    formFields: [
      { key: 'vendor', label: 'Vendor' },
      { key: 'invoiceNumber', label: 'Invoice Number' },
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'invoiceDate', label: 'Invoice Date', placeholder: 'YYYY-MM-DD' },
      { key: 'dueDate', label: 'Due Date', placeholder: 'YYYY-MM-DD' },
      { key: 'category', label: 'Category', type: 'select', options: ['IT Equipment', 'Software', 'Services', 'Supplies', 'Travel', 'Marketing', 'Utilities', 'Other'] },
      { key: 'rawText', label: 'OCR Raw Text', type: 'textarea', required: true },
      { key: 'extractedData', label: 'Extracted Data', type: 'textarea' },
      { key: 'taxDeductible', label: 'Tax Deductible', type: 'checkbox', checkLabel: 'Likely tax-deductible' },
      { key: 'duplicateFlag', label: 'Duplicate', type: 'checkbox', checkLabel: 'Possible duplicate' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'reviewed', 'approved', 'rejected'], default: 'pending' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },

  // 3. Meeting Transcription Summarizer
  'meeting-transcripts': {
    resource: 'meeting-transcripts',
    title: 'Meeting Transcription Summarizer',
    icon: '🎙️',
    itemName: 'Transcript',
    aiAction: (q) => aiSummarizeMeeting(q, '', 'Meeting'),
    aiLabel: 'AI Meeting Summarizer',
    aiPlaceholder: 'Paste a meeting transcript to extract action items, decisions, follow-ups...',
    aiButtonLabel: 'Summarize',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'meetingDate', label: 'Date' },
      { key: 'participants', label: 'Participants' },
      { key: 'category', label: 'Category' },
      { key: 'status', label: 'Status', render: (v) => <StatusBadge value={v} /> },
    ],
    detailFields: [
      { key: 'title', label: 'Title' },
      { key: 'meetingDate', label: 'Meeting Date' },
      { key: 'participants', label: 'Participants' },
      { key: 'category', label: 'Category' },
      { key: 'status', label: 'Status' },
      { key: 'transcript', label: 'Transcript', fullWidth: true },
      { key: 'summary', label: 'Summary', fullWidth: true },
      { key: 'actionItems', label: 'Action Items', fullWidth: true },
      { key: 'decisions', label: 'Decisions', fullWidth: true },
      { key: 'followUps', label: 'Follow-ups', fullWidth: true },
    ],
    formFields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'meetingDate', label: 'Meeting Date', placeholder: 'YYYY-MM-DD' },
      { key: 'participants', label: 'Participants (comma-separated)' },
      { key: 'category', label: 'Category', type: 'select', options: ['Standup', 'Planning', 'Review', '1on1', 'Client Call', 'Interview', 'All Hands', 'Other'] },
      { key: 'transcript', label: 'Transcript', type: 'textarea', required: true },
      { key: 'summary', label: 'Summary', type: 'textarea' },
      { key: 'actionItems', label: 'Action Items', type: 'textarea' },
      { key: 'decisions', label: 'Decisions', type: 'textarea' },
      { key: 'followUps', label: 'Follow-ups', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'summarized', 'archived'], default: 'pending' },
    ]
  },

  // 4. Code Snippet Explainer
  'code-snippets': {
    resource: 'code-snippets',
    title: 'Code Snippet Explainer',
    icon: '💡',
    itemName: 'Snippet',
    aiAction: (q) => aiExplainCode(q, 'auto'),
    aiLabel: 'AI Code Explainer',
    aiPlaceholder: 'Paste a code snippet to explain, optimize, and security-review...',
    aiButtonLabel: 'Explain',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'language', label: 'Language' },
      { key: 'tags', label: 'Tags' },
      { key: 'status', label: 'Status', render: (v) => <StatusBadge value={v} /> },
    ],
    detailFields: [
      { key: 'title', label: 'Title' },
      { key: 'language', label: 'Language' },
      { key: 'tags', label: 'Tags' },
      { key: 'status', label: 'Status' },
      { key: 'code', label: 'Code', fullWidth: true },
      { key: 'explanation', label: 'Explanation', fullWidth: true },
      { key: 'optimizations', label: 'Optimizations', fullWidth: true },
      { key: 'securityIssues', label: 'Security Issues', fullWidth: true },
    ],
    formFields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'language', label: 'Language', type: 'select', options: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#', 'Ruby', 'PHP', 'SQL', 'Bash', 'Other'] },
      { key: 'code', label: 'Source Code', type: 'textarea', required: true },
      { key: 'tags', label: 'Tags' },
      { key: 'explanation', label: 'AI Explanation', type: 'textarea' },
      { key: 'optimizations', label: 'Optimizations', type: 'textarea' },
      { key: 'securityIssues', label: 'Security Issues', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'reviewed', 'fixed'], default: 'pending' },
    ]
  },

  // 5. Resume Enhancement
  'resume-reviews': {
    resource: 'resume-reviews',
    title: 'Resume Enhancement',
    icon: '📄',
    itemName: 'Resume Review',
    aiAction: (q) => aiEnhanceResume(q, '', 'Not specified'),
    aiLabel: 'AI Resume Enhancer',
    aiPlaceholder: 'Paste your resume text — AI will suggest keywords, ATS fixes, impact metrics...',
    aiButtonLabel: 'Enhance',
    columns: [
      { key: 'candidateName', label: 'Candidate' },
      { key: 'targetRole', label: 'Target Role' },
      { key: 'matchScore', label: 'Match' },
      { key: 'status', label: 'Status', render: (v) => <StatusBadge value={v} /> },
    ],
    detailFields: [
      { key: 'candidateName', label: 'Candidate Name' },
      { key: 'targetRole', label: 'Target Role' },
      { key: 'matchScore', label: 'Match Score (0-100)' },
      { key: 'status', label: 'Status' },
      { key: 'jobDescription', label: 'Job Description', fullWidth: true },
      { key: 'resumeText', label: 'Resume', fullWidth: true },
      { key: 'feedback', label: 'AI Feedback', fullWidth: true },
      { key: 'keywords', label: 'Recommended Keywords', fullWidth: true },
    ],
    formFields: [
      { key: 'candidateName', label: 'Candidate Name' },
      { key: 'targetRole', label: 'Target Role / Title' },
      { key: 'jobDescription', label: 'Job Description', type: 'textarea' },
      { key: 'resumeText', label: 'Resume Text', type: 'textarea', required: true },
      { key: 'matchScore', label: 'Match Score (0-100)', type: 'number' },
      { key: 'feedback', label: 'AI Feedback', type: 'textarea' },
      { key: 'keywords', label: 'Recommended Keywords', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'reviewed', 'sent'], default: 'pending' },
    ]
  },

  // 6. Contract Review Assistant
  'contract-reviews': {
    resource: 'contract-reviews',
    title: 'Contract Review Assistant',
    icon: '⚖️',
    itemName: 'Contract Review',
    aiAction: (q) => aiReviewContract(q, '', ''),
    aiLabel: 'AI Contract Reviewer',
    aiPlaceholder: 'Paste contract text — AI flags risky clauses and missing provisions...',
    aiButtonLabel: 'Review',
    columns: [
      { key: 'contractTitle', label: 'Contract' },
      { key: 'partyName', label: 'Counterparty' },
      { key: 'contractType', label: 'Type' },
      { key: 'riskScore', label: 'Risk' },
      { key: 'status', label: 'Status', render: (v) => <StatusBadge value={v} /> },
    ],
    detailFields: [
      { key: 'contractTitle', label: 'Contract Title' },
      { key: 'partyName', label: 'Counterparty' },
      { key: 'contractType', label: 'Type' },
      { key: 'riskScore', label: 'Risk Score (0-100)' },
      { key: 'status', label: 'Status' },
      { key: 'contractText', label: 'Contract Text', fullWidth: true },
      { key: 'riskyClauses', label: 'Risky Clauses', fullWidth: true },
      { key: 'missingProvisions', label: 'Missing Provisions', fullWidth: true },
      { key: 'amendments', label: 'Suggested Amendments', fullWidth: true },
    ],
    formFields: [
      { key: 'contractTitle', label: 'Contract Title', required: true },
      { key: 'partyName', label: 'Counterparty Name' },
      { key: 'contractType', label: 'Contract Type', type: 'select', options: ['Service', 'NDA', 'Lease', 'Employment', 'Partnership', 'Vendor', 'Consulting', 'License', 'Other'] },
      { key: 'contractText', label: 'Contract Text', type: 'textarea', required: true },
      { key: 'riskScore', label: 'Risk Score (0-100)', type: 'number' },
      { key: 'riskyClauses', label: 'Risky Clauses', type: 'textarea' },
      { key: 'missingProvisions', label: 'Missing Provisions', type: 'textarea' },
      { key: 'amendments', label: 'Suggested Amendments', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'reviewed', 'flagged', 'approved'], default: 'pending' },
    ]
  },

  // 7. Health Article Validator
  'health-claims': {
    resource: 'health-claims',
    title: 'Health Article Validator',
    icon: '🩺',
    itemName: 'Health Claim',
    aiAction: (q) => aiValidateHealth(q, ''),
    aiLabel: 'AI Medical Claim Validator',
    aiPlaceholder: 'Paste a health claim or article excerpt — AI checks credibility and cites sources...',
    aiButtonLabel: 'Validate',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'rating', label: 'Rating', render: (v) => <PriorityBadge value={v} /> },
      { key: 'credibilityScore', label: 'Score' },
      { key: 'status', label: 'Status', render: (v) => <StatusBadge value={v} /> },
    ],
    detailFields: [
      { key: 'title', label: 'Title' },
      { key: 'sourceUrl', label: 'Source URL' },
      { key: 'rating', label: 'Rating' },
      { key: 'credibilityScore', label: 'Credibility Score' },
      { key: 'status', label: 'Status' },
      { key: 'claimText', label: 'Claim', fullWidth: true },
      { key: 'validationNotes', label: 'Validation Notes', fullWidth: true },
      { key: 'citedSources', label: 'Cited Sources', fullWidth: true },
    ],
    formFields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'sourceUrl', label: 'Source URL' },
      { key: 'claimText', label: 'Claim Text', type: 'textarea', required: true },
      { key: 'rating', label: 'Rating', type: 'select', options: ['debunked', 'unsupported', 'mixed', 'supported', 'established', 'unknown'], default: 'unknown' },
      { key: 'credibilityScore', label: 'Credibility Score (0-100)', type: 'number' },
      { key: 'validationNotes', label: 'Validation Notes', type: 'textarea' },
      { key: 'citedSources', label: 'Cited Sources', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'validated', 'archived'], default: 'pending' },
    ]
  },

  // 8. Competitor Price Monitor
  'competitor-monitors': {
    resource: 'competitor-monitors',
    title: 'Competitor Price Monitor',
    icon: '📈',
    itemName: 'Monitor',
    aiAction: (q) => aiMonitorCompetitor(q, '', '', '', ''),
    aiLabel: 'AI Pricing Strategist',
    aiPlaceholder: 'Describe a product/competitor (or paste data) for pricing recommendations...',
    aiButtonLabel: 'Analyze',
    columns: [
      { key: 'productName', label: 'Product' },
      { key: 'competitorName', label: 'Competitor' },
      { key: 'ourPrice', label: 'Our Price' },
      { key: 'competitorPrice', label: 'Competitor Price' },
      { key: 'lastChecked', label: 'Last Checked' },
      { key: 'status', label: 'Status', render: (v) => <StatusBadge value={v} /> },
    ],
    detailFields: [
      { key: 'productName', label: 'Product' },
      { key: 'competitorName', label: 'Competitor' },
      { key: 'competitorUrl', label: 'Competitor URL' },
      { key: 'ourPrice', label: 'Our Price' },
      { key: 'competitorPrice', label: 'Competitor Price' },
      { key: 'alertThreshold', label: 'Alert Threshold (%)' },
      { key: 'lastChecked', label: 'Last Checked' },
      { key: 'status', label: 'Status' },
      { key: 'priceHistory', label: 'Price History', fullWidth: true },
      { key: 'recommendation', label: 'AI Recommendation', fullWidth: true },
    ],
    formFields: [
      { key: 'productName', label: 'Product Name', required: true },
      { key: 'competitorName', label: 'Competitor Name' },
      { key: 'competitorUrl', label: 'Competitor URL' },
      { key: 'ourPrice', label: 'Our Price', type: 'number' },
      { key: 'competitorPrice', label: 'Competitor Price', type: 'number' },
      { key: 'alertThreshold', label: 'Alert Threshold (%)', type: 'number' },
      { key: 'priceHistory', label: 'Price History (CSV/JSON)', type: 'textarea' },
      { key: 'recommendation', label: 'Recommendation', type: 'textarea' },
      { key: 'lastChecked', label: 'Last Checked', placeholder: 'YYYY-MM-DD' },
      { key: 'status', label: 'Status', type: 'select', options: ['monitoring', 'alert', 'paused'], default: 'monitoring' },
    ]
  },
};
