'use strict';

const express = require('express');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');
const policy = require('../domain/releasePolicy');

const router = express.Router();
const respondError = (res, error) => res.status(error.status || 500).json({ error: error.code || 'INTERNAL_ERROR', message: error.status ? error.message : 'Unexpected server error' });

router.get('/', async (req, res) => {
  try {
    const rows = await sequelize.query('SELECT * FROM extension_releases WHERE tenant_id = :tenant ORDER BY created_at DESC', { replacements: { tenant: policy.tenantFor(req.user) }, type: QueryTypes.SELECT });
    res.json({ releases: rows });
  } catch (error) { respondError(res, error); }
});

router.post('/', async (req, res) => {
  try {
    policy.assertRole(req.user, ['developer', 'security_reviewer', 'release_manager', 'admin', 'user']);
    const release = policy.normalizeRelease(req.body);
    const idempotencyKey = policy.assertIdempotencyKey(req.header('Idempotency-Key'));
    const tenant = policy.tenantFor(req.user);
    const result = await sequelize.transaction(async (transaction) => {
      const existing = await sequelize.query('SELECT * FROM extension_releases WHERE tenant_id = :tenant AND idempotency_key = :key', { replacements: { tenant, key: idempotencyKey }, type: QueryTypes.SELECT, transaction });
      if (existing[0]) return { row: existing[0], replayed: true };
      const [rows] = await sequelize.query(`INSERT INTO extension_releases
        (tenant_id, extension_id, version, state, policy, artifact_digest, idempotency_key, created_by)
        VALUES (:tenant, :extensionId, :version, 'draft', CAST(:release AS jsonb), :digest, :key, :actor)
        RETURNING *`, { replacements: { tenant, extensionId: release.extensionId, version: release.version, release: JSON.stringify(release), digest: release.artifactDigest, key: idempotencyKey, actor: String(req.user.id) }, transaction });
      await sequelize.query(`INSERT INTO extension_release_events (release_id, tenant_id, actor_id, event_type, evidence_digest, details)
        VALUES (:id, :tenant, :actor, 'created', :digest, CAST(:details AS jsonb))`, { replacements: { id: rows[0].id, tenant, actor: String(req.user.id), digest: policy.digest(release), details: JSON.stringify({ extensionId: release.extensionId, version: release.version }) }, transaction });
      return { row: rows[0], replayed: false };
    });
    res.status(result.replayed ? 200 : 201).json({ release: result.row, replayed: result.replayed });
  } catch (error) { respondError(res, error); }
});

router.post('/:id/transition', async (req, res) => {
  try {
    const tenant = policy.tenantFor(req.user);
    const idempotencyKey = policy.assertIdempotencyKey(req.header('Idempotency-Key'));
    const result = await sequelize.transaction(async (transaction) => {
      const [rows] = await sequelize.query('SELECT * FROM extension_releases WHERE id = :id AND tenant_id = :tenant FOR UPDATE', { replacements: { id: req.params.id, tenant }, transaction });
      if (!rows[0]) throw new policy.PolicyError('NOT_FOUND', 'Release not found', 404);
      const existing = await sequelize.query('SELECT details FROM extension_release_events WHERE release_id = :id AND idempotency_key = :key', { replacements: { id: req.params.id, key: idempotencyKey }, type: QueryTypes.SELECT, transaction });
      if (existing[0]) return { row: rows[0], replayed: true };
      policy.validateTransition(rows[0].state, req.body.state, req.user, req.body.evidence);
      const [updated] = await sequelize.query(`UPDATE extension_releases SET state = :state, version_lock = version_lock + 1, updated_at = NOW()
        WHERE id = :id AND tenant_id = :tenant RETURNING *`, { replacements: { state: req.body.state, id: req.params.id, tenant }, transaction });
      await sequelize.query(`INSERT INTO extension_release_events
        (release_id, tenant_id, actor_id, event_type, from_state, to_state, idempotency_key, evidence_digest, details)
        VALUES (:id, :tenant, :actor, 'transition', :fromState, :toState, :key, :digest, CAST(:details AS jsonb))`, { replacements: { id: req.params.id, tenant, actor: String(req.user.id), fromState: rows[0].state, toState: req.body.state, key: idempotencyKey, digest: policy.digest(req.body.evidence || {}), details: JSON.stringify(req.body.evidence || {}) }, transaction });
      return { row: updated[0], replayed: false };
    });
    res.json({ release: result.row, replayed: result.replayed });
  } catch (error) { respondError(res, error); }
});

router.post('/store-sync/:provider', async (req, res) => {
  try {
    const tenant = policy.tenantFor(req.user);
    policy.assertRole(req.user, ['release_manager', 'admin']);
    if (!policy.STORE_PROVIDERS.includes(req.params.provider)) throw new policy.PolicyError('UNSUPPORTED_PROVIDER', 'Unsupported extension store', 400);
    const key = policy.assertIdempotencyKey(req.header('Idempotency-Key'));
    const [rows] = await sequelize.query(`INSERT INTO extension_store_sync_jobs (tenant_id, provider, idempotency_key, requested_by, request)
      VALUES (:tenant, :provider, :key, :actor, CAST(:request AS jsonb)) ON CONFLICT (tenant_id, provider, idempotency_key)
      DO UPDATE SET idempotency_key = EXCLUDED.idempotency_key RETURNING *`, { replacements: { tenant, provider: req.params.provider, key, actor: String(req.user.id), request: JSON.stringify(req.body || {}) } });
    res.status(rows[0].status === 'queued' ? 202 : 200).json({ job: rows[0], externalExecution: 'requires configured store credentials and signed artifact' });
  } catch (error) { respondError(res, error); }
});

module.exports = router;
