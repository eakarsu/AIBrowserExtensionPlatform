import React, { useState, useEffect } from 'react';

export default function FormModal({ item, formFields, onClose, onSave, title }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    } else {
      const defaults = {};
      formFields.forEach(f => {
        defaults[f.key] = f.default || '';
      });
      setFormData(defaults);
    }
  }, [item, formFields]);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title || (item ? 'Edit Item' : 'New Item')}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {formFields.map(f => (
              <div key={f.key} className="form-group">
                <label>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea
                    value={formData[f.key] || ''}
                    onChange={e => handleChange(f.key, e.target.value)}
                    placeholder={f.placeholder || ''}
                    required={f.required}
                  />
                ) : f.type === 'select' ? (
                  <select
                    value={formData[f.key] || ''}
                    onChange={e => handleChange(f.key, e.target.value)}
                    required={f.required}
                  >
                    <option value="">Select...</option>
                    {f.options.map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                ) : f.type === 'checkbox' ? (
                  <div style={{ padding: '8px 0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textTransform: 'none', fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        checked={!!formData[f.key]}
                        onChange={e => handleChange(f.key, e.target.checked)}
                        style={{ width: 'auto' }}
                      />
                      {f.checkLabel || 'Enabled'}
                    </label>
                  </div>
                ) : (
                  <input
                    type={f.type || 'text'}
                    value={formData[f.key] || ''}
                    onChange={e => handleChange(f.key, e.target.value)}
                    placeholder={f.placeholder || ''}
                    required={f.required}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary btn-sm">
              {item ? 'Update' : 'Create'}
            </button>
            <button type="button" className="btn btn-sm" style={{ color: '#94a3b8' }} onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
