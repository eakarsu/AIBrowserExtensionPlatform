// NON-VIZ — Extension config / manifest editor with full CRUD
import React, { useEffect, useState } from 'react';
import {
  cvListExtensionConfigs,
  cvCreateExtensionConfig,
  cvUpdateExtensionConfig,
  cvDeleteExtensionConfig,
} from '../services/api';

const EMPTY = {
  name: '',
  version: '1.0.0',
  description: '',
  channel: 'stable',
};

export default function ExtensionConfigEditor() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setErr('');
    try {
      const r = await cvListExtensionConfigs();
      setItems(r.data.items || []);
      if (r.data.items && r.data.items.length && !selected) {
        setSelected(r.data.items[0].id);
        setDraft(JSON.stringify(r.data.items[0], null, 2));
      }
    } catch (e) {
      setErr(e.message || 'Failed to load configs');
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const pick = (id) => {
    setSelected(id);
    const cfg = items.find((c) => c.id === id);
    if (cfg) setDraft(JSON.stringify(cfg, null, 2));
    setStatus('');
    setErr('');
  };

  const handleCreate = async () => {
    setStatus(''); setErr(''); setBusy(true);
    try {
      if (!form.name || !form.version) {
        setErr('Name and version are required');
        setBusy(false);
        return;
      }
      const r = await cvCreateExtensionConfig(form);
      setStatus(`Created config #${r.data.id} (${r.data.name})`);
      setForm(EMPTY);
      await load();
      setSelected(r.data.id);
      setDraft(JSON.stringify(r.data, null, 2));
    } catch (e) {
      setErr(e.response?.data?.error || e.message || 'Create failed');
    } finally { setBusy(false); }
  };

  const handleSave = async () => {
    setStatus(''); setErr(''); setBusy(true);
    try {
      const parsed = JSON.parse(draft);
      const r = await cvUpdateExtensionConfig(selected, parsed);
      setStatus(`Saved config #${r.data.id}`);
      await load();
      setDraft(JSON.stringify(r.data, null, 2));
    } catch (e) {
      setErr(e.message || 'Invalid JSON or save failed');
    } finally { setBusy(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!window.confirm('Delete this extension config?')) return;
    setStatus(''); setErr(''); setBusy(true);
    try {
      await cvDeleteExtensionConfig(selected);
      setStatus(`Deleted config #${selected}`);
      setSelected(null);
      setDraft('');
      await load();
    } catch (e) {
      setErr(e.response?.data?.error || e.message || 'Delete failed');
    } finally { setBusy(false); }
  };

  return (
    <div data-testid="extension-config-editor" style={{
      background: 'rgba(30,41,59,0.7)', padding: 18, borderRadius: 12,
      border: '1px solid rgba(16,185,129,0.25)', marginBottom: 18,
      gridColumn: '1 / span 2'
    }}>
      <h3 style={{ marginBottom: 8, color: '#6ee7b7' }}>Extension Config / Manifest Editor (CRUD)</h3>
      <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>
        Manage multiple manifest + runtime option sets — stable, beta, enterprise. JSON validated on save.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 14 }}>
        {/* LEFT — list + create */}
        <div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
            Configs ({items.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
            {items.map((c) => (
              <button
                key={c.id}
                data-testid={`cfg-row-${c.id}`}
                onClick={() => pick(c.id)}
                style={{
                  textAlign: 'left', padding: '8px 10px', borderRadius: 6, border: 0,
                  background: selected === c.id ? 'rgba(16,185,129,0.20)' : '#0f172a',
                  color: '#e2e8f0', cursor: 'pointer', fontSize: 12
                }}
              >
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div style={{ color: '#94a3b8', fontSize: 11 }}>
                  v{c.version} · {c.channel}
                </div>
              </button>
            ))}
          </div>

          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
            New config
          </div>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            data-testid="cfg-new-name"
            style={inp}
          />
          <input
            placeholder="Version (e.g. 1.0.0)"
            value={form.version}
            onChange={(e) => setForm({ ...form, version: e.target.value })}
            data-testid="cfg-new-version"
            style={inp}
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={inp}
          />
          <select
            value={form.channel}
            onChange={(e) => setForm({ ...form, channel: e.target.value })}
            style={inp}
          >
            <option value="stable">stable</option>
            <option value="beta">beta</option>
            <option value="legacy">legacy</option>
            <option value="enterprise">enterprise</option>
          </select>
          <button
            onClick={handleCreate}
            disabled={busy}
            data-testid="cfg-create-btn"
            style={btnPrimary}
          >
            + Create
          </button>
        </div>

        {/* RIGHT — editor */}
        <div>
          {selected ? (
            <>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                spellCheck={false}
                data-testid="cfg-editor-textarea"
                style={{
                  width: '100%', minHeight: 320, fontFamily: 'monospace',
                  fontSize: 12, background: '#0f172a', color: '#e2e8f0',
                  border: '1px solid #334155', borderRadius: 6, padding: 10
                }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={handleSave} disabled={busy} style={btnPrimary}>
                  Save
                </button>
                <button onClick={handleDelete} disabled={busy} style={btnDanger}>
                  Delete
                </button>
              </div>
            </>
          ) : (
            <div style={{ color: '#94a3b8', padding: 24, textAlign: 'center' }}>
              Select a config from the left, or create a new one.
            </div>
          )}
          {status && <div style={{ color: '#6ee7b7', marginTop: 10, fontSize: 13 }}>{status}</div>}
          {err && <div style={{ color: '#f87171', marginTop: 10, fontSize: 13 }}>{err}</div>}
        </div>
      </div>
    </div>
  );
}

const inp = {
  display: 'block', width: '100%', marginBottom: 6,
  background: '#0f172a', color: '#e2e8f0',
  border: '1px solid #334155', padding: '6px 10px',
  borderRadius: 6, fontSize: 12
};
const btnPrimary = {
  padding: '8px 14px',
  background: 'linear-gradient(90deg,#10b981,#06b6d4)',
  color: '#0f172a', borderRadius: 6, border: 'none',
  fontWeight: 700, cursor: 'pointer'
};
const btnDanger = {
  padding: '8px 14px',
  background: '#7f1d1d', color: '#fecaca',
  borderRadius: 6, border: 'none',
  fontWeight: 600, cursor: 'pointer'
};
