import React from 'react';
import AIReport from './AIReport';

export default function AIResultDisplay({ result, parsed, loading, model, usage, onSave }) {
  if (!loading && (result === null || result === undefined)) return null;
  return <div className="ai-result-container">
    <AIReport response={parsed ?? result} loading={loading} model={model} tokens={usage} title="AI response" />
    {onSave && !loading && <button type="button" className="btn btn-primary btn-sm" onClick={onSave}>Save to Record</button>}
  </div>;
}
