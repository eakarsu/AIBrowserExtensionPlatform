// Extension Views — synthesized analytics & utilities page
import React from 'react';
import InstallHeatmap from '../components/InstallHeatmap';
import VersionAdoptionChart from '../components/VersionAdoptionChart';
import StoreListingPdf from '../components/StoreListingPdf';
import ExtensionConfigEditor from '../components/ExtensionConfigEditor';

export default function CustomViewsPage() {
  return (
    <div className="page" data-testid="custom-views-page" style={{ padding: 24 }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ color: '#e2e8f0', marginBottom: 6 }}>Extension Views</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>
          Synthesized analytics &amp; ops surfaces for the browser extension —
          install timing, version adoption, store listing exports, and live config.
        </p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <InstallHeatmap />
        <VersionAdoptionChart />
        <StoreListingPdf />
        <ExtensionConfigEditor />
      </section>
    </div>
  );
}
