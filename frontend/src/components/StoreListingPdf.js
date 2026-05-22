// NON-VIZ — Store listing PDF preview / download
import React, { useEffect, useState } from 'react';
import api, { cvStoreListingPdfUrl } from '../services/api';

export default function StoreListingPdf() {
  const [name, setName] = useState('AI Browser Sidekick');
  const [version, setVersion] = useState('3.4.1');
  const [html, setHtml] = useState('');
  const url = cvStoreListingPdfUrl(name, version);

  useEffect(() => {
    let live = true;
    api.get(`/custom-views/store-listing-pdf?name=${encodeURIComponent(name)}&version=${encodeURIComponent(version)}`,
      { transformResponse: (r) => r })
      .then((r) => { if (live) setHtml(typeof r.data === 'string' ? r.data : ''); })
      .catch(() => { if (live) setHtml('<p style="font-family:sans-serif;padding:20px">Failed to load preview.</p>'); });
    return () => { live = false; };
  }, [name, version]);

  const handleOpen = () => {
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  };

  return (
    <div data-testid="store-listing-pdf" style={{
      background: 'rgba(30,41,59,0.7)', padding: 18, borderRadius: 12,
      border: '1px solid rgba(236,72,153,0.25)', marginBottom: 18
    }}>
      <h3 style={{ marginBottom: 8, color: '#f9a8d4' }}>Store Listing PDF</h3>
      <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>
        Generate a printable Chrome Web Store listing snapshot. Open in a new tab and use the print button to save as PDF.
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12, color: '#94a3b8' }}>
          Extension name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155',
              padding: '6px 10px', borderRadius: 6, minWidth: 240
            }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12, color: '#94a3b8' }}>
          Version
          <input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            style={{
              background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155',
              padding: '6px 10px', borderRadius: 6, width: 120
            }}
          />
        </label>
      </div>
      <button
        onClick={handleOpen}
        style={{
          display: 'inline-block', padding: '8px 16px', border: 0,
          background: 'linear-gradient(90deg,#ec4899,#8b5cf6)',
          color: '#fff', borderRadius: 6, fontWeight: 600, cursor: 'pointer'
        }}
      >
        Open Listing PDF
      </button>
      <div style={{ marginTop: 14, border: '1px solid #334155', borderRadius: 8, overflow: 'hidden' }}>
        <iframe
          title="Listing preview"
          srcDoc={html}
          style={{ width: '100%', height: 320, background: '#fff', border: 0 }}
        />
      </div>
      <div style={{ display: 'none' }}>{url}</div>
    </div>
  );
}
