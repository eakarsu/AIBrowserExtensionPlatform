import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function AIResultDisplay({ result, loading, model, usage }) {
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

  return (
    <div className="ai-result-container">
      <div className="ai-result-header">
        <h3>
          <span style={{ fontSize: '18px' }}>✨</span>
          AI Response
        </h3>
        <div className="ai-result-meta">
          {model && <span>Model: {model}</span>}
          {usage && (
            <span style={{ marginLeft: '12px' }}>
              Tokens: {usage.prompt_tokens + usage.completion_tokens}
            </span>
          )}
        </div>
      </div>
      <div className="ai-result-body">
        <ReactMarkdown>{result}</ReactMarkdown>
      </div>
    </div>
  );
}
