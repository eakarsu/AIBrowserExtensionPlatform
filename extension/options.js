'use strict';
const checkbox = document.querySelector('#telemetry');
const status = document.querySelector('#status');
chrome.storage.local.get('telemetryConsent').then(({ telemetryConsent }) => { checkbox.checked = telemetryConsent === true; });
document.querySelector('#save').addEventListener('click', async () => {
  await chrome.storage.local.set({ telemetryConsent: checkbox.checked === true });
  status.textContent = 'Saved locally.';
});
