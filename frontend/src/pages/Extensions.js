// Apply pass 5 — frontend surface for backlog endpoints.
// Three tabs: Agent (multi-agent orchestration), RAG, White-label tenants.

import React, { useEffect, useState } from 'react';
import {
  extAgentRun, extAgentList,
  extRagIndex, extRagQuery, extRagDocs, extRagDelete,
  extTenantsList, extTenantCreate, extTenantDelete,
} from '../services/api';

const tabs = [
  { id: 'agent', label: 'Agent (multi-step)' },
  { id: 'rag', label: 'RAG over my data' },
  { id: 'tenants', label: 'White-label tenants' },
];

export default function Extensions() {
  const [tab, setTab] = useState('agent');
  return (
    <div className="page">
      <h1>Extensions</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={tab === t.id ? 'btn primary' : 'btn'}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'agent' && <AgentTab />}
      {tab === 'rag' && <RagTab />}
      {tab === 'tenants' && <TenantTab />}
    </div>
  );
}

function AgentTab() {
  const [goal, setGoal] = useState('');
  const [out, setOut] = useState(null);
  const [list, setList] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const refresh = () => extAgentList().then((r) => setList(r.data?.data || [])).catch(() => {});
  useEffect(() => { refresh(); }, []);

  const run = async () => {
    setErr(''); setOut(null); setBusy(true);
    try {
      const r = await extAgentRun(goal);
      setOut(r.data); refresh();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
      if (e.response?.data?.missing) setErr(`Missing env: ${e.response.data.missing}`);
    }
    setBusy(false);
  };

  return (
    <div>
      <textarea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Describe a multi-step goal" rows={3} style={{ width: '100%' }} />
      <button onClick={run} disabled={busy || !goal} className="btn primary">
        {busy ? 'Running…' : 'Run agent'}
      </button>
      {err && <div style={{ color: 'crimson' }}>{err}</div>}
      {out && (
        <div style={{ marginTop: 16, padding: 12, background: '#f4f4f5' }}>
          <h3>Plan</h3>
          <pre>{JSON.stringify(out.plan, null, 2)}</pre>
          <h3>Steps</h3>
          {(out.steps || []).map((s, i) => (
            <div key={i} style={{ borderLeft: '3px solid #888', padding: 8, marginBottom: 8 }}>
              <strong>[{s.role}]</strong> {s.task}
              <pre style={{ whiteSpace: 'pre-wrap' }}>{s.output || s.error}</pre>
            </div>
          ))}
        </div>
      )}
      <h3 style={{ marginTop: 24 }}>Recent runs</h3>
      <ul>
        {list.map((r) => (
          <li key={r.id}>#{r.id} • {r.status} • {r.goal.slice(0, 80)}</li>
        ))}
      </ul>
    </div>
  );
}

function RagTab() {
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [q, setQ] = useState('');
  const [matches, setMatches] = useState(null);
  const [err, setErr] = useState('');

  const refresh = () => extRagDocs().then((r) => setDocs(r.data?.data || [])).catch(() => {});
  useEffect(() => { refresh(); }, []);

  const index = async () => {
    setErr('');
    try { await extRagIndex({ title, content, source: 'manual' }); setTitle(''); setContent(''); refresh(); }
    catch (e) { setErr(e.response?.data?.error || e.message); }
  };
  const query = async () => {
    setErr(''); setMatches(null);
    try { const r = await extRagQuery(q, 3); setMatches(r.data); }
    catch (e) { setErr(e.response?.data?.error || e.message); }
  };
  const del = async (id) => { await extRagDelete(id); refresh(); };

  return (
    <div>
      <h3>Index a document</h3>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" rows={4} style={{ width: '100%' }} />
      <button onClick={index} className="btn primary">Index</button>

      <h3 style={{ marginTop: 24 }}>Indexed ({docs.length})</h3>
      <ul>{docs.map((d) => <li key={d.id}>{d.title || '(untitled)'} <button onClick={() => del(d.id)}>x</button></li>)}</ul>

      <h3 style={{ marginTop: 24 }}>Query</h3>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask a question" style={{ width: '60%' }} />
      <button onClick={query} className="btn primary">Search</button>
      {err && <div style={{ color: 'crimson' }}>{err}</div>}
      {matches && (
        <div style={{ marginTop: 12, background: '#f4f4f5', padding: 12 }}>
          {matches.answer && <div><h4>Answer</h4><pre style={{ whiteSpace: 'pre-wrap' }}>{matches.answer}</pre></div>}
          <h4>Matches</h4>
          {(matches.matches || []).map((m, i) => <div key={i}>[{m.id}] score={m.score?.toFixed(3)} • {m.title} — {m.snippet}</div>)}
          <small>{matches.note}</small>
        </div>
      )}
    </div>
  );
}

function TenantTab() {
  const [list, setList] = useState([]);
  const [name, setName] = useState('');
  const [primaryColor, setColor] = useState('#3b82f6');
  const [logoUrl, setLogo] = useState('');
  const [err, setErr] = useState('');

  const refresh = () => extTenantsList().then((r) => setList(r.data?.data || [])).catch(() => {});
  useEffect(() => { refresh(); }, []);

  const add = async () => {
    setErr('');
    try { await extTenantCreate({ name, primaryColor, logoUrl }); setName(''); setLogo(''); refresh(); }
    catch (e) { setErr(e.response?.data?.error || e.message); }
  };
  const del = async (id) => { await extTenantDelete(id); refresh(); };

  return (
    <div>
      <h3>Create tenant</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tenant name" />
      <input type="color" value={primaryColor} onChange={(e) => setColor(e.target.value)} />
      <input value={logoUrl} onChange={(e) => setLogo(e.target.value)} placeholder="Logo URL" />
      <button onClick={add} className="btn primary" disabled={!name}>Add</button>
      {err && <div style={{ color: 'crimson' }}>{err}</div>}
      <ul style={{ marginTop: 16 }}>
        {list.map((t) => (
          <li key={t.id}>
            <span style={{ background: t.primaryColor, padding: '2px 8px', color: '#fff', borderRadius: 4 }}>{t.name}</span>
            {' '}({t.plan}) <button onClick={() => del(t.id)}>x</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
