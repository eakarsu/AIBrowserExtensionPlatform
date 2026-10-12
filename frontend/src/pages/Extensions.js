// Apply pass 5 — frontend surface for backlog endpoints.
// Three tabs: Agent (multi-agent orchestration), RAG, White-label tenants.

import React, { useEffect, useState } from 'react';
import FullFieldPresets from '../components/FullFieldPresets';
import AIReport from '../components/AIReport';
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
      <FullFieldPresets value={{ goal }} disabled={busy} presets={[
        { label: 'Research example', values: { goal: 'Compare three accessible reading tools for a small school and summarize tradeoffs.' } },
        { label: 'Travel example', values: { goal: 'Plan a two day museum visit in Boston with transit and a modest budget.' } },
        { label: 'Project example', values: { goal: 'Outline a website accessibility review with tasks, owners, and a two week timeline.' } },
      ]} onChange={({ goal: example }) => { setGoal(example); setOut(null); }} />
      <textarea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Describe a multi-step goal" rows={3} style={{ width: '100%' }} />
      <button onClick={run} disabled={busy || !goal} className="btn primary">
        {busy ? 'Running…' : 'Run agent'}
      </button>
      {err && <div style={{ color: 'crimson' }}>{err}</div>}
      {out && <AIReport response={{ plan: out.plan, steps: out.steps }} title="Agent plan" />}
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
      <FullFieldPresets value={{ title, content }} presets={[
        { label: 'Project note', values: { title: 'Launch review', content: 'Design is complete. Documentation needs review by Friday. Support training is scheduled for Monday.' } },
        { label: 'Policy note', values: { title: 'Access policy', content: 'Staff use multifactor authentication. Access requests require manager approval and quarterly review.' } },
        { label: 'Meeting note', values: { title: 'Customer feedback', content: 'Customers requested clearer navigation and faster search. The team will review prototypes next week.' } },
      ]} onChange={(example) => { setTitle(example.title); setContent(example.content); }} />
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" rows={4} style={{ width: '100%' }} />
      <button onClick={index} className="btn primary">Index</button>

      <h3 style={{ marginTop: 24 }}>Indexed ({docs.length})</h3>
      <ul>{docs.map((d) => <li key={d.id}>{d.title || '(untitled)'} <button onClick={() => del(d.id)}>x</button></li>)}</ul>

      <h3 style={{ marginTop: 24 }}>Query</h3>
      <FullFieldPresets value={{ q }} presets={[
        { label: 'Deadline question', values: { q: 'Which work is due this week?' } },
        { label: 'Policy question', values: { q: 'What approval is required for access?' } },
        { label: 'Feedback question', values: { q: 'What improvements did customers request?' } },
      ]} onChange={({ q: example }) => { setQ(example); setMatches(null); }} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask a question" style={{ width: '60%' }} />
      <button onClick={query} className="btn primary">Search</button>
      {err && <div style={{ color: 'crimson' }}>{err}</div>}
      {matches && <AIReport response={matches} title="Search results" />}
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
