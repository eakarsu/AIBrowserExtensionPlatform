# Operations and trust boundary

`start.sh` starts only this repository's already-installed processes and stops only the PIDs it created. It never installs packages, creates databases, migrates, seeds, or kills port owners. Use `scripts/bootstrap.sh`, `scripts/migrate.sh`, and the explicitly guarded `scripts/seed-demo.sh` separately.

The checked-in Manifest V3 extension is local-first, runs page code only after a toolbar click, requests `activeTab` instead of broad host access, and keeps telemetry disabled until explicit consent. Store signing/publication, managed-browser policy, identity-provider setup, and cross-browser certification require external accounts and are not claimed here. Store requests are durably queued with idempotency and failure state; a separately deployed credentialed worker must execute them.

Run `npm test` in `backend`. CI validates policy rules, the manifest, backend tests, and frontend build. Hostile-page, CSP, store-update, and browser-version matrices should be executed in isolated browser test infrastructure before release approval.
