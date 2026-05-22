// VIZ — Install heatmap by REGION × VERSION
import React, { useEffect, useState } from 'react';
import { cvInstallHeatmap } from '../services/api';

function colorFor(count, max) {
  if (!max) return '#1e293b';
  const t = Math.min(1, count / max);
  const hue = 220 - t * 220; // cyan -> red
  const light = 22 + t * 38;
  return `hsl(${hue}, 78%, ${light}%)`;
}

export default function InstallHeatmap() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    cvInstallHeatmap()
      .then((r) => setData(r.data))
      .catch((e) => setErr(e.message || 'Failed to load heatmap'));
  }, []);

  if (err) return <div style={{ color: '#f87171' }}>Heatmap error: {err}</div>;
  if (!data) return <div>Loading install heatmap…</div>;

  const max = data.cells.reduce((m, c) => Math.max(m, c.count), 0);

  return (
    <div data-testid="install-heatmap" style={{
      background: 'rgba(30,41,59,0.7)', padding: 18, borderRadius: 12,
      border: '1px solid rgba(99,102,241,0.25)', marginBottom: 18
    }}>
      <h3 style={{ marginBottom: 4, color: '#a5b4fc' }}>Install Heatmap (region × version)</h3>
      <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>
        Total installs: <strong>{data.total_installs.toLocaleString()}</strong> ·
        Peak: <strong>{data.peak.region_label} → {data.peak.version}</strong> ({data.peak.count.toLocaleString()})
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 4 }}>
          <thead>
            <tr>
              <th style={{ color: '#94a3b8', fontSize: 11, padding: '0 8px', textAlign: 'left' }}>Region</th>
              {data.versions.map((v) => (
                <th key={v} style={{ color: '#cbd5e1', fontSize: 11, fontWeight: 600, padding: '0 6px' }}>
                  {v}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.regions.map((r) => (
              <tr key={r.code}>
                <td style={{ color: '#e2e8f0', fontSize: 12, paddingRight: 8 }} title={r.label}>
                  {r.code}
                </td>
                {data.versions.map((v) => {
                  const cell = data.cells.find((c) => c.region === r.code && c.version === v);
                  const count = cell ? cell.count : 0;
                  return (
                    <td
                      key={v}
                      title={`${r.label} · ${v} — ${count.toLocaleString()} installs`}
                      style={{
                        width: 64, height: 36, background: colorFor(count, max),
                        borderRadius: 4, cursor: 'pointer', textAlign: 'center',
                        color: '#0f172a', fontWeight: 700, fontSize: 11
                      }}
                    >
                      {count >= 1000 ? `${Math.round(count / 100) / 10}k` : count}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 11, color: '#64748b' }}>
        <span>Less</span>
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t, i) => (
          <span key={i} style={{
            width: 16, height: 16, background: colorFor(t * max, max),
            borderRadius: 3, display: 'inline-block'
          }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
