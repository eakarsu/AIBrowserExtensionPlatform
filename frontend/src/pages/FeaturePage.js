import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAll, create, update, remove } from '../services/api';
import DetailModal from '../components/DetailModal';
import FormModal from '../components/FormModal';
import AIResultDisplay from '../components/AIResultDisplay';

export default function FeaturePage({ config }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModel, setAiModel] = useState(null);
  const [aiUsage, setAiUsage] = useState(null);
  const [aiInput, setAiInput] = useState('');

  const loadData = useCallback(async () => {
    try {
      const res = await getAll(config.resource);
      setItems(res.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }, [config.resource]);

  useEffect(() => {
    loadData();
    setAiResult(null);
    setAiInput('');
  }, [loadData]);

  const handleCreate = async (data) => {
    try {
      await create(config.resource, data);
      setShowForm(false);
      loadData();
    } catch (err) {
      alert('Error creating item: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUpdate = async (data) => {
    try {
      await update(config.resource, data.id, data);
      setShowForm(false);
      setEditItem(null);
      setSelectedItem(null);
      loadData();
    } catch (err) {
      alert('Error updating item: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await remove(config.resource, id);
      setSelectedItem(null);
      loadData();
    } catch (err) {
      alert('Error deleting item: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setSelectedItem(null);
    setShowForm(true);
  };

  const handleAI = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await config.aiAction(aiInput);
      setAiResult(res.data.result);
      setAiModel(res.data.model);
      setAiUsage(res.data.usage);
    } catch (err) {
      setAiResult('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <button className="back-btn" onClick={() => navigate('/')}>←</button>
          <h1>{config.icon} {config.title}</h1>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setShowForm(true); }}>
            + New {config.itemName}
          </button>
        </div>
      </div>

      {/* AI Section */}
      {config.aiAction && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(99, 102, 241, 0.15)',
            borderRadius: '16px',
            padding: '20px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#a5b4fc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🤖</span>
              {config.aiLabel || 'AI Assistant'}
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder={config.aiPlaceholder || 'Enter your query...'}
                onKeyDown={(e) => e.key === 'Enter' && handleAI()}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <button className="btn btn-primary btn-sm" onClick={handleAI} disabled={aiLoading}>
                {aiLoading ? 'Processing...' : config.aiButtonLabel || 'Ask AI'}
              </button>
            </div>
            <AIResultDisplay result={aiResult} loading={aiLoading} model={aiModel} usage={aiUsage} />
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              {config.columns.map(col => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => setSelectedItem(item)}>
                {config.columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(item[col.key], item) : (
                      typeof item[col.key] === 'boolean'
                        ? <span className={`status-badge status-${item[col.key]}`}>{item[col.key] ? 'Yes' : 'No'}</span>
                        : (String(item[col.key] || '').substring(0, 60) + (String(item[col.key] || '').length > 60 ? '...' : ''))
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={config.columns.length} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No items found. Click "New {config.itemName}" to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          fields={config.detailFields}
          onClose={() => setSelectedItem(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <FormModal
          item={editItem}
          formFields={config.formFields}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSave={editItem ? handleUpdate : handleCreate}
          title={editItem ? `Edit ${config.itemName}` : `New ${config.itemName}`}
        />
      )}
    </div>
  );
}
