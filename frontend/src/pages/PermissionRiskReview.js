import React, { useState } from 'react';
import api from '../services/api';

const starter = JSON.stringify({
  permissions: ['tabs', 'storage', '<all_urls>', 'history'],
  host_count: 3,
  data_classes: ['page_content', 'reading_history']
}, null, 2);

export default function PermissionRiskReview() {
  const [payload, setPayload] = useState(starter);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const run = async () => {
    setError('');
    try {
      const response = await api.post('/permission-risk/review', JSON.parse(payload));
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Permission review failed');
    }
  };

  return (
    <div className="page">
      <div className="page-header"><h1>Permission Risk Review</h1><p>Review extension permissions and store-listing disclosure risk before publishing.</p></div>
      <div className="feature-grid">
        <div className="feature-card">
          <textarea className="form-textarea" rows={16} value={payload} onChange={(event) => setPayload(event.target.value)} />
          <button className="btn btn-primary" onClick={run}>Review Permissions</button>
          {error && <p className="error-message">{error}</p>}
        </div>
        <div className="feature-card">
          {!result ? <p className="muted">Risk review appears here.</p> : (
            <>
              <div className="stats-grid">
                <div className="stat-card"><span>Score</span><strong>{result.score}</strong></div>
                <div className="stat-card"><span>Tier</span><strong>{result.tier}</strong></div>
                <div className="stat-card"><span>Permissions</span><strong>{result.permissionCount}</strong></div>
              </div>
              <ul className="result-list">
                {result.requiredMitigations.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
