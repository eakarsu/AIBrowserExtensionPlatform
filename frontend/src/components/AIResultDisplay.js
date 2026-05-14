import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

// Render a structured JSON object as a readable card
function StructuredResult({ data }) {
  if (!data || typeof data !== 'object') return null;

  const renderValue = (val, key) => {
    if (Array.isArray(val)) {
      if (val.length === 0) return <span style={{ color: '#64748b' }}>None</span>;
      // Array of objects
      if (typeof val[0] === 'object' && val[0] !== null) {
        return (
          <div style={{ marginTop: 4 }}>
            {val.map((item, i) => (
              <div key={i} style={{
                background: 'rgba(99,102,241,0.07)',
                border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 6,
                fontSize: 13,
              }}>
                {Object.entries(item).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 2 }}>
                    <span style={{ color: '#a5b4fc', fontWeight: 600, minWidth: 80, textTransform: 'capitalize' }}>
                      {k.replace(/_/g, ' ')}:
                    </span>
                    <span style={{ color: '#e2e8f0' }}>{String(v)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      }
      // Array of primitives
      return (
        <ul style={{ margin: '4px 0 0 0', paddingLeft: 18 }}>
          {val.map((v, i) => (
            <li key={i} style={{ color: '#e2e8f0', marginBottom: 2, fontSize: 13 }}>{String(v)}</li>
          ))}
        </ul>
      );
    }
    if (typeof val === 'object' && val !== null) {
      return (
        <div style={{ marginTop: 4 }}>
          {Object.entries(val).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 2 }}>
              <span style={{ color: '#a5b4fc', fontWeight: 600, textTransform: 'capitalize', minWidth: 80 }}>
                {k.replace(/_/g, ' ')}:
              </span>
              <span style={{ color: '#e2e8f0', fontSize: 13 }}>{String(v)}</span>
            </div>
          ))}
        </div>
      );
    }
    if (typeof val === 'boolean') {
      return <span style={{ color: val ? '#10b981' : '#ef4444', fontWeight: 600 }}>{val ? 'Yes' : 'No'}</span>;
    }
    if (typeof val === 'number') {
      // Score-like values — render with a bar
      if ((key || '').toLowerCase().includes('score') || (key || '').toLowerCase().includes('percent')) {
        const pct = Math.min(100, Math.max(0, val));
        const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{val}</span>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 4, height: 6 }}>
              <div style={{ width: `${pct}%`, background: color, borderRadius: 4, height: 6 }}></div>
            </div>
          </div>
        );
      }
      return <span style={{ color: '#e2e8f0' }}>{val}</span>;
    }
    // Long text — render with markdown
    if (typeof val === 'string' && val.length > 200) {
      return (
        <div style={{ marginTop: 4, color: '#cbd5e1', fontSize: 13, lineHeight: 1.6 }}>
          <ReactMarkdown>{val}</ReactMarkdown>
        </div>
      );
    }
    return <span style={{ color: '#e2e8f0' }}>{String(val)}</span>;
  };

  return (
    <div>
      {Object.entries(data).map(([key, val]) => (
        <div key={key} style={{
          marginBottom: 14,
          paddingBottom: 14,
          borderBottom: '1px solid rgba(99,102,241,0.1)',
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#a5b4fc',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 4,
          }}>
            {key.replace(/_/g, ' ')}
          </div>
          {renderValue(val, key)}
        </div>
      ))}
    </div>
  );
}

export default function AIResultDisplay({ result, parsed, loading, model, usage, onSave }) {
  const [viewMode, setViewMode] = useState('structured'); // 'structured' | 'raw'

  if (loading) {
    return (
      <div className="ai-result-container">
        <div className="ai-loading">
          <div className="spinner"></div>
          <span>AI is thinking...</span>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const hasStructured = parsed && typeof parsed === 'object';

  return (
    <div className="ai-result-container">
      <div className="ai-result-header">
        <h3>
          <span style={{ fontSize: '18px' }}>✨</span>
          AI Response
        </h3>
        <div className="ai-result-meta" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {hasStructured && (
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setViewMode('structured')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: viewMode === 'structured' ? '#6366f1' : 'rgba(99,102,241,0.15)',
                  color: viewMode === 'structured' ? '#fff' : '#a5b4fc',
                }}
              >
                Structured
              </button>
              <button
                onClick={() => setViewMode('raw')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: viewMode === 'raw' ? '#6366f1' : 'rgba(99,102,241,0.15)',
                  color: viewMode === 'raw' ? '#fff' : '#a5b4fc',
                }}
              >
                Raw
              </button>
            </div>
          )}
          {model && <span style={{ fontSize: 11, color: '#64748b' }}>Model: {model.split('/').pop()}</span>}
          {usage && (
            <span style={{ fontSize: 11, color: '#64748b' }}>
              Tokens: {(usage.prompt_tokens || 0) + (usage.completion_tokens || 0)}
            </span>
          )}
          {onSave && (
            <button
              onClick={onSave}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                border: 'none',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                background: '#10b981',
                color: '#fff',
              }}
            >
              Save to Record
            </button>
          )}
        </div>
      </div>
      <div className="ai-result-body">
        {hasStructured && viewMode === 'structured' ? (
          <StructuredResult data={parsed} />
        ) : (
          <ReactMarkdown>{result}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}
