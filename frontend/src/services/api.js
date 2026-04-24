import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

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

// Generic CRUD
export const getAll = (resource) => api.get(`/${resource}`);
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
export const aiGenerateCitation = (title, authors, url, publicationDate, citationType) => api.post('/ai/generate-citation', { title, authors, url, publicationDate, citationType });
export const aiReadingSuggest = (interests, currentList) => api.post('/ai/reading-suggest', { interests, currentList });
export const aiDarkModeSuggest = (website, issues) => api.post('/ai/darkmode-suggest', { website, issues });

export default api;
