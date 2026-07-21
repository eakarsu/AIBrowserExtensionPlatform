'use strict';

const crypto = require('crypto');

const STATES = Object.freeze(['draft', 'security_review', 'approved', 'published', 'suspended']);
const TRANSITIONS = Object.freeze({
  draft: ['security_review'],
  security_review: ['draft', 'approved'],
  approved: ['published', 'draft'],
  published: ['suspended'],
  suspended: ['security_review'],
});
const ROLE_TRANSITIONS = Object.freeze({
  security_review: ['developer', 'security_reviewer', 'admin'],
  approved: ['security_reviewer', 'admin'],
  published: ['release_manager', 'admin'],
  suspended: ['security_reviewer', 'release_manager', 'admin'],
  draft: ['developer', 'security_reviewer', 'admin'],
});
const STORE_PROVIDERS = Object.freeze(['chrome_web_store', 'firefox_addons', 'edge_addons']);

class PolicyError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function tenantFor(user) {
  if (!user || !user.id) throw new PolicyError('AUTH_REQUIRED', 'Authenticated actor required', 401);
  return String(user.tenant_id || user.tenantId || `personal:${user.id}`);
}

function assertRole(user, allowed) {
  if (!allowed.includes(user.role)) throw new PolicyError('ROLE_FORBIDDEN', `Role ${user.role || 'unknown'} cannot perform this action`, 403);
}

function normalizeRelease(input = {}) {
  const required = ['extensionId', 'version', 'manifestVersion', 'permissions', 'hostPermissions', 'collectionDisclosure'];
  const missing = required.filter((key) => input[key] === undefined || input[key] === null || input[key] === '');
  if (missing.length) throw new PolicyError('INVALID_RELEASE', `Missing: ${missing.join(', ')}`);
  if (!/^[a-z0-9][a-z0-9._-]{2,127}$/i.test(input.extensionId)) throw new PolicyError('INVALID_EXTENSION_ID', 'extensionId format is invalid');
  if (!/^\d+\.\d+\.\d+(?:\.\d+)?$/.test(input.version)) throw new PolicyError('INVALID_VERSION', 'version must be numeric dotted notation');
  if (input.manifestVersion !== 3) throw new PolicyError('UNSUPPORTED_MANIFEST', 'Only Manifest V3 releases are accepted');
  if (!Array.isArray(input.permissions) || !Array.isArray(input.hostPermissions)) throw new PolicyError('INVALID_PERMISSIONS', 'Permission fields must be arrays');
  const forbidden = ['debugger', 'proxy', 'webRequestBlocking', '<all_urls>'];
  const requested = [...input.permissions, ...input.hostPermissions];
  const excessive = requested.filter((permission) => forbidden.includes(permission));
  if (excessive.length) throw new PolicyError('EXCESSIVE_PERMISSION', `Forbidden permission: ${excessive.join(', ')}`);
  if (input.telemetryEnabled && !input.telemetryConsentRequired) throw new PolicyError('CONSENT_REQUIRED', 'Telemetry requires explicit opt-in consent');
  return {
    extensionId: input.extensionId,
    version: input.version,
    manifestVersion: 3,
    permissions: [...new Set(input.permissions)].sort(),
    hostPermissions: [...new Set(input.hostPermissions)].sort(),
    telemetryEnabled: Boolean(input.telemetryEnabled),
    telemetryConsentRequired: Boolean(input.telemetryConsentRequired),
    collectionDisclosure: String(input.collectionDisclosure).trim(),
    artifactDigest: input.artifactDigest || null,
    browserTargets: Array.isArray(input.browserTargets) ? [...new Set(input.browserTargets)].sort() : [],
  };
}

function validateTransition(current, next, user, evidence = {}) {
  if (!STATES.includes(next) || !(TRANSITIONS[current] || []).includes(next)) {
    throw new PolicyError('INVALID_TRANSITION', `Cannot move release from ${current} to ${next}`, 409);
  }
  assertRole(user, ROLE_TRANSITIONS[next]);
  if (next === 'security_review' && (!evidence.hostilePageTest || !evidence.permissionTest)) {
    throw new PolicyError('EVIDENCE_REQUIRED', 'Hostile-page and permission test evidence are required');
  }
  if (next === 'published' && (!evidence.store || !STORE_PROVIDERS.includes(evidence.store) || !evidence.storeVersionId)) {
    throw new PolicyError('STORE_EVIDENCE_REQUIRED', 'A supported store and storeVersionId are required');
  }
}

function assertIdempotencyKey(value) {
  if (!value || !/^[A-Za-z0-9._:-]{8,128}$/.test(value)) throw new PolicyError('IDEMPOTENCY_REQUIRED', 'A valid Idempotency-Key is required');
  return value;
}

function digest(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

module.exports = { STATES, STORE_PROVIDERS, PolicyError, tenantFor, assertRole, normalizeRelease, validateTransition, assertIdempotencyKey, digest };
