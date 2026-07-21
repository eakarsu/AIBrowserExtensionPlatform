'use strict';
const assert = require('assert');
const test = require('node:test');
const policy = require('../domain/releasePolicy');

const valid = { extensionId: 'private-assistant', version: '1.2.3', manifestVersion: 3, permissions: ['storage', 'activeTab'], hostPermissions: [], collectionDisclosure: 'No page content telemetry.', telemetryEnabled: false };
test('normalizes a least-privilege manifest declaration', () => assert.equal(policy.normalizeRelease(valid).manifestVersion, 3));
test('rejects broad host access', () => assert.throws(() => policy.normalizeRelease({ ...valid, hostPermissions: ['<all_urls>'] }), /Forbidden permission/));
test('requires security evidence before review', () => assert.throws(() => policy.validateTransition('draft', 'security_review', { role: 'developer' }, {}), /evidence/));
test('requires a release manager and store evidence to publish', () => {
  assert.doesNotThrow(() => policy.validateTransition('approved', 'published', { role: 'release_manager' }, { store: 'chrome_web_store', storeVersionId: 'v123' }));
  assert.throws(() => policy.validateTransition('approved', 'published', { role: 'developer' }, { store: 'chrome_web_store', storeVersionId: 'v123' }), /cannot perform/);
});
