import React from 'react';

export default function DetailModal({ item, fields, onClose, onEdit, onDelete }) {
  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Item Details</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            {fields.map(f => (
              <div key={f.key} className={`detail-item ${f.fullWidth ? 'full-width' : ''}`}>
                <label>{f.label}</label>
                <div className="value">
                  {f.render ? f.render(item[f.key], item) : (
                    typeof item[f.key] === 'boolean'
                      ? (item[f.key] ? 'Yes' : 'No')
                      : (item[f.key] || 'N/A')
                  )}
                </div>
              </div>
            ))}
            <div className="detail-item">
              <label>Created</label>
              <div className="value">{new Date(item.createdAt).toLocaleString()}</div>
            </div>
            <div className="detail-item">
              <label>Updated</label>
              <div className="value">{new Date(item.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={() => onEdit(item)}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(item.id)}>Delete</button>
          <button className="btn btn-sm" style={{ color: '#94a3b8' }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
