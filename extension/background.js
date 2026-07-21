'use strict';

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(['telemetryConsent', 'backendOrigin']);
  await chrome.storage.local.set({
    telemetryConsent: existing.telemetryConsent === true,
    backendOrigin: existing.backendOrigin || '',
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !/^https?:/.test(tab.url || '')) return;
  await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
});
