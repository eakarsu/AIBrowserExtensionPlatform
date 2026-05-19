import axios from 'axios';

const API_BASE = (process.env.REACT_APP_API_BASE || 'http://localhost:3001') + '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email, password) => axios.post(`${API_BASE}/auth/login`, { email, password });
export const register = (email, password, name) => axios.post(`${API_BASE}/auth/register`, { email, password, name });

// Generic CRUD — supports pagination
export const getAll = (resource, page = 1, limit = 20) =>
  api.get(`/${resource}`, { params: { page, limit } });
export const getOne = (resource, id) => api.get(`/${resource}/${id}`);
export const create = (resource, data) => api.post(`/${resource}`, data);
export const update = (resource, id, data) => api.put(`/${resource}/${id}`, data);
export const remove = (resource, id) => api.delete(`/${resource}/${id}`);

// AI endpoints
export const aiResearch = (query) => api.post('/ai/research', { query });
export const aiSummarize = (content, url) => api.post('/ai/summarize', { content, url });
export const aiAutoFillSuggest = (formType, fields) => api.post('/ai/autofill-suggest', { formType, fields });
export const aiOrganizeTabs = (tabs) => api.post('/ai/organize-tabs', { tabs });
export const aiCategorizeBookmark = (title, url, description) => api.post('/ai/categorize-bookmark', { title, url, description });
export const aiPasswordAnalyze = (requirements) => api.post('/ai/password-analyze', { requirements });
export const aiSuggestAdBlock = (website) => api.post('/ai/suggest-adblock', { website });
export const aiTranslate = (text, sourceLang, targetLang) => api.post('/ai/translate', { text, sourceLang, targetLang });
export const aiAnnotate = (description, context) => api.post('/ai/annotate', { description, context });
export const aiGenerateEmail = (purpose, tone, context) => api.post('/ai/generate-email', { purpose, tone, context });
export const aiAnalyzePrice = (product, currentPrice, priceHistory) => api.post('/ai/analyze-price', { product, currentPrice, priceHistory });
export const aiCheckGrammar = (text) => api.post('/ai/check-grammar', { text });
export const aiGenerateCitation = (title, authors, url, publicationDate, citationType) =>
  api.post('/ai/generate-citation', { title, authors, url, publicationDate, citationType });
export const aiReadingSuggest = (interests, currentList) => api.post('/ai/reading-suggest', { interests, currentList });
export const aiDarkModeSuggest = (website, issues) => api.post('/ai/darkmode-suggest', { website, issues });

// New (proposed) AI features
export const aiScanEmail = (subject, sender, headers, body) =>
  api.post('/ai/scan-email', { subject, sender, headers, body });
export const aiAnalyzeInvoice = (rawText, knownVendors) =>
  api.post('/ai/analyze-invoice', { rawText, knownVendors });
export const aiSummarizeMeeting = (transcript, participants, title) =>
  api.post('/ai/summarize-meeting', { transcript, participants, title });
export const aiExplainCode = (code, language) =>
  api.post('/ai/explain-code', { code, language });
export const aiEnhanceResume = (resumeText, jobDescription, targetRole) =>
  api.post('/ai/enhance-resume', { resumeText, jobDescription, targetRole });
export const aiReviewContract = (contractText, contractType, partyName) =>
  api.post('/ai/review-contract', { contractText, contractType, partyName });
export const aiValidateHealth = (claimText, sourceUrl) =>
  api.post('/ai/validate-health', { claimText, sourceUrl });
export const aiMonitorCompetitor = (productName, competitorName, ourPrice, competitorPrice, priceHistory) =>
  api.post('/ai/monitor-competitor', { productName, competitorName, ourPrice, competitorPrice, priceHistory });

// AI Results history
export const getAIResults = (page = 1, limit = 20, endpoint = null) =>
  api.get('/ai/results', { params: { page, limit, ...(endpoint ? { endpoint } : {}) } });

// User
export const getUsageStats = () => api.get('/user/usage-stats');
export const getQuota = () => api.get('/user/quota');
export const generateApiKey = () => api.post('/user/api-key');
export const getApiKeys = () => api.get('/user/api-key');
export const revokeApiKey = (id) => api.delete(`/user/api-key/${id}`);

// Bookmark special actions
export const autoCategorizeBookmarks = (bookmark_ids) =>
  api.post('/bookmarks/auto-categorize', { bookmark_ids });
export const exportBookmarksHtml = () =>
  api.get('/bookmarks/export/html', { responseType: 'blob' });

// Summary export
export const exportSummariesCsv = () =>
  api.get('/summaries/export/csv', { responseType: 'blob' });

// ── Apply pass 5 — extensions backlog (multi-agent, RAG, white-label) ──
export const extAgentRun = (goal) => api.post('/extensions/agent/run', { goal });
export const extAgentList = () => api.get('/extensions/agent/runs');
export const extAgentGet = (id) => api.get(`/extensions/agent/runs/${id}`);

export const extRagIndex = (data) => api.post('/extensions/rag/index', data);
export const extRagQuery = (query, top_k = 3) => api.post('/extensions/rag/query', { query, top_k });
export const extRagDocs = () => api.get('/extensions/rag/docs');
export const extRagDelete = (id) => api.delete(`/extensions/rag/docs/${id}`);

export const extTenantsList = () => api.get('/extensions/tenants');
export const extTenantCreate = (data) => api.post('/extensions/tenants', data);
export const extTenantUpdate = (id, data) => api.put(`/extensions/tenants/${id}`, data);
export const extTenantDelete = (id) => api.delete(`/extensions/tenants/${id}`);

// ── Custom Views — Extension Views (install heatmap by region/version, version adoption stacked area, store-listing PDF, extension configs CRUD) ──
export const cvInstallHeatmap = () => api.get('/custom-views/install-heatmap');
export const cvVersionAdoption = () => api.get('/custom-views/version-adoption');
export const cvStoreListingPdfUrl = (name = 'AI Browser Sidekick', version = '3.4.1') =>
  `${API_BASE}/custom-views/store-listing-pdf?name=${encodeURIComponent(name)}&version=${encodeURIComponent(version)}`;
export const cvListExtensionConfigs = () => api.get('/custom-views/extension-configs');
export const cvGetExtensionConfig = (id) => api.get(`/custom-views/extension-configs/${id}`);
export const cvCreateExtensionConfig = (data) => api.post('/custom-views/extension-configs', data);
export const cvUpdateExtensionConfig = (id, data) => api.put(`/custom-views/extension-configs/${id}`, data);
export const cvDeleteExtensionConfig = (id) => api.delete(`/custom-views/extension-configs/${id}`);

export default api;
