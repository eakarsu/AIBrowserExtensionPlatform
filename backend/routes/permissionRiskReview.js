const express = require('express');
const router = express.Router();

const weights = {
  '<all_urls>': 30,
  tabs: 16,
  history: 22,
  cookies: 24,
  webRequest: 20,
  scripting: 14,
  storage: 8,
  clipboardRead: 18,
  downloads: 16,
};

router.post('/review', (req, res) => {
  const permissions = Array.isArray(req.body?.permissions) ? req.body.permissions : ['tabs', 'storage', '<all_urls>', 'history'];
  const hostCount = Number(req.body?.host_count ?? req.body?.hostCount ?? 3);
  const dataClasses = Array.isArray(req.body?.data_classes) ? req.body.data_classes : ['page_content', 'reading_history'];
  const base = permissions.reduce((sum, permission) => sum + (weights[permission] || 6), 0);
  const score = Math.min(100, Math.round(base + hostCount * 4 + dataClasses.length * 7));
  const tier = score >= 75 ? 'store_review_risk' : score >= 55 ? 'needs_privacy_note' : score >= 35 ? 'moderate' : 'low';
  res.json({
    score,
    tier,
    permissionCount: permissions.length,
    requiredMitigations: [
      ...(permissions.includes('<all_urls>') ? ['Replace <all_urls> with explicit host permissions where possible.'] : []),
      ...(permissions.includes('history') ? ['Gate history access behind a visible opt-in and retention window.'] : []),
      ...(dataClasses.length ? ['Map each collected data class to a store listing disclosure.'] : []),
      score >= 55 ? 'Prepare reviewer notes explaining user-triggered access and local processing boundaries.' : 'Keep permission copy concise in onboarding.'
    ],
  });
});

module.exports = router;
