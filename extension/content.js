'use strict';

// Runs only after an explicit toolbar click and never injects remote HTML.
const selected = window.getSelection()?.toString().slice(0, 12000) || '';
chrome.runtime.sendMessage({ type: 'USER_SELECTED_TEXT', text: selected, pageOrigin: location.origin });
