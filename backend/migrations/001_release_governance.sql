BEGIN;
CREATE TABLE IF NOT EXISTS extension_releases (
  id BIGSERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  extension_id TEXT NOT NULL,
  version TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('draft','security_review','approved','published','suspended')),
  policy JSONB NOT NULL,
  artifact_digest TEXT,
  idempotency_key TEXT NOT NULL,
  version_lock INTEGER NOT NULL DEFAULT 1,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, extension_id, version),
  UNIQUE (tenant_id, idempotency_key)
);
CREATE TABLE IF NOT EXISTS extension_release_events (
  id BIGSERIAL PRIMARY KEY,
  release_id BIGINT NOT NULL REFERENCES extension_releases(id),
  tenant_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  from_state TEXT,
  to_state TEXT,
  idempotency_key TEXT,
  evidence_digest TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (release_id, idempotency_key)
);
CREATE TABLE IF NOT EXISTS extension_store_sync_jobs (
  id BIGSERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('chrome_web_store','firefox_addons','edge_addons')),
  idempotency_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','succeeded','failed','cancelled')),
  requested_by TEXT NOT NULL,
  request JSONB NOT NULL,
  response JSONB,
  failure_code TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, provider, idempotency_key)
);
CREATE INDEX IF NOT EXISTS idx_extension_releases_tenant_state ON extension_releases (tenant_id, state);
CREATE INDEX IF NOT EXISTS idx_extension_events_release ON extension_release_events (release_id, created_at);
COMMIT;
