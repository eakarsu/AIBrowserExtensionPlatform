// VIZ — Version adoption stacked area chart (SVG, 12-week time series)
import React, { useEffect, useState } from 'react';
import { cvVersionAdoption } from '../services/api';

const COLORS = ['#f59e0b', '#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export default function VersionAdoptionChart() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [hover, setHover] = useState(null);

  useEffect(() => {
    cvVersionAdoption()
      .then((r) => setData(r.data))
      .catch((e) => setErr(e.message || 'Failed to load adoption'));
  }, []);

  if (err) return <div style={{ color: '#f87171' }}>Adoption error: {err}</div>;
  if (!data) return <div>Loading version adoption…</div>;

  const W = 520;
  const H = 240;
  const PAD_L = 50;
  const PAD_R = 12;
  const PAD_T = 14;
  const PAD_B = 28;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const series = data.series;
  const versions = data.versions;
  const N = series.length;

  // Compute stacked Y values for each week
  const maxTotal = Math.max(...series.map((p) => p.total));

  const xFor = (i) => PAD_L + (i / (N - 1)) * innerW;
  const yFor = (v) => PAD_T + (1 - v / maxTotal) * innerH;

  // Build stacked paths: bottom-up
  const stackedTops = series.map(() => 0); // running cumulative

  const layers = versions.map((vName, vIdx) => {
    // top of this layer at week i is cumulative-after-adding
    const topY = [];
    const bottomY = [];
    for (let i = 0; i < N; i++) {
      const before = stackedTops[i];
      const after = before + (series[i][vName] || 0);
      bottomY.push(yFor(before));
      topY.push(yFor(after));
      stackedTops[i] = after;
    }
    // SVG path: forward across topY, back across bottomY (reversed)
    let d = `M ${xFor(0)} ${topY[0]}`;
    for (let i = 1; i < N; i++) d += ` L ${xFor(i)} ${topY[i]}`;
    for (let i = N - 1; i >= 0; i--) d += ` L ${xFor(i)} ${bottomY[i]}`;
    d += ' Z';
    return { name: vName, color: COLORS[vIdx % COLORS.length], path: d };
  });

  // Y axis ticks
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: yFor(t * maxTotal),
    label: Math.round(t * maxTotal / 1000) + 'k',
  }));

  return (
    <div data-testid="version-adoption" style={{
      background: 'rgba(30,41,59,0.7)', padding: 18, borderRadius: 12,
      border: '1px solid rgba(139,92,246,0.25)', marginBottom: 18
    }}>
      <h3 style={{ marginBottom: 4, color: '#c4b5fd' }}>Version Adoption (12-week stacked area)</h3>
      <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>
        Active users: <strong>{data.total_active_users.toLocaleString()}</strong> ·
        Latest stable: <strong>{data.latest_stable}</strong>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {/* y grid */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={PAD_L} x2={W - PAD_R} y1={t.y} y2={t.y}
                  stroke="#334155" strokeDasharray="3 3" strokeWidth={1} />
            <text x={PAD_L - 6} y={t.y + 3} textAnchor="end" fontSize="10" fill="#94a3b8">
              {t.label}
            </text>
          </g>
        ))}
        {/* layers */}
        {layers.map((l) => (
          <path key={l.name} d={l.path} fill={l.color} fillOpacity="0.78"
                stroke={l.color} strokeWidth="0.5"
                onMouseEnter={() => setHover(l.name)}
                onMouseLeave={() => setHover(null)}
                style={{ opacity: hover && hover !== l.name ? 0.45 : 1, transition: 'opacity .2s' }} />
        ))}
        {/* x axis labels */}
        {series.map((p, i) => (
          (i % 2 === 0) && (
            <text key={i} x={xFor(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="#64748b">
              {p.date.slice(5)}
            </text>
          )
        ))}
      </svg>
      {/* Legend + snapshot */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
        {data.snapshot.map((s, i) => (
          <div key={s.version}
               onMouseEnter={() => setHover(s.version)}
               onMouseLeave={() => setHover(null)}
               style={{
                 display: 'flex', alignItems: 'center', gap: 6,
                 padding: '4px 8px', borderRadius: 6,
                 background: hover === s.version ? 'rgba(99,102,241,0.18)' : 'transparent',
                 cursor: 'pointer'
               }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
            <span style={{ color: '#e2e8f0', fontSize: 12 }}>
              {s.version}
              <span style={{
                marginLeft: 5, fontSize: 9, padding: '1px 5px', borderRadius: 6,
                background: s.channel === 'beta' ? '#7c2d12' :
                            s.channel === 'legacy' ? '#3f3f46' : '#312e81',
                color: '#fde68a'
              }}>{s.channel}</span>
            </span>
            <span style={{ color: '#94a3b8', fontSize: 11 }}>
              {s.share_pct}% · {s.users.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
