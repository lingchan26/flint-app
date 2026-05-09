import { useState } from 'react';
import { Plus, X, Eye, Code2, Edit2, GripVertical, Trash2, Copy, CheckCircle } from 'lucide-react';

const defaultFields = [
  { id: 1, name: 'Full Name', type: 'text', required: true },
  { id: 2, name: 'Email Address', type: 'email', required: true },
  { id: 3, name: 'Schedule an introductory and inquiry call', type: 'datetime', required: true },
  { id: 4, name: 'Budget', type: 'text', required: false },
  { id: 5, name: 'Please share any further information', type: 'textarea', required: false },
];

const FIELD_TYPES = ['text', 'email', 'phone', 'textarea', 'datetime', 'date', 'number', 'url', 'dropdown'];

const defaultForms = [
  {
    id: 1,
    name: 'New Client Inquiry Form',
    status: 'Active',
    submissions: 0,
    fields: defaultFields,
  },
];

function EditFormPanel({ form, onClose, onSave }) {
  const [fields, setFields] = useState(form.fields);
  const [copied, setCopied] = useState('');
  const shareLink = 'https://flint.app/form/abc123';
  const embedCode = `<iframe src="${shareLink}" width="100%" height="600" frameborder="0" />`;

  const toggleRequired = (id) => {
    setFields(f => f.map(field => field.id === id ? { ...field, required: !field.required } : field));
  };

  const deleteField = (id) => {
    setFields(f => f.filter(field => field.id !== id));
  };

  const addField = () => {
    setFields(f => [...f, { id: Date.now(), name: 'New Field', type: 'text', required: false }]);
  };

  const updateField = (id, key, val) => {
    setFields(f => f.map(field => field.id === id ? { ...field, [key]: val } : field));
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="slide-panel slide-panel-wide">
        <div className="slide-panel-header">
          <span className="slide-panel-title">Edit Form — {form.name}</span>
          <button className="close-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="slide-panel-body">
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Form Fields</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fields.map((field, i) => (
                <div key={field.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#faf8f4', border: '1px solid #e5e0d8',
                  borderRadius: 8, padding: '10px 12px',
                }}>
                  <GripVertical size={14} color="#9ca3af" style={{ cursor: 'grab', flexShrink: 0 }} />
                  <input
                    className="form-input"
                    value={field.name}
                    onChange={e => updateField(field.id, 'name', e.target.value)}
                    style={{ flex: 1, fontSize: 13 }}
                  />
                  <select
                    className="form-select"
                    value={field.type}
                    onChange={e => updateField(field.id, 'type', e.target.value)}
                    style={{ width: 110, fontSize: 12 }}
                  >
                    {FIELD_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <label className="toggle" style={{ gap: 4 }}>
                    <input type="checkbox" checked={field.required} onChange={() => toggleRequired(field.id)} />
                    <span className="toggle-slider" />
                    <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>Required</span>
                  </label>
                  <button
                    onClick={() => deleteField(field.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 2 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addField}
              style={{
                marginTop: 10, background: 'none', border: '1px dashed #e5e0d8',
                borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
                color: '#f59e0b', fontWeight: 500, fontSize: 13, width: '100%',
              }}
            >
              + Add Field
            </button>
          </div>

          {/* Share / Embed */}
          <div style={{ borderTop: '1px solid #e5e0d8', paddingTop: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Share / Embed</div>

            <div className="form-group">
              <label className="form-label">Shareable Link</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" value={shareLink} readOnly style={{ flex: 1, background: '#faf8f4' }} />
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => copyToClipboard(shareLink, 'link')}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {copied === 'link' ? <CheckCircle size={14} color="#10b981" /> : <Copy size={14} />}
                  {copied === 'link' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Embed Code</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <textarea
                  className="form-textarea"
                  value={embedCode}
                  readOnly
                  style={{ flex: 1, background: '#faf8f4', fontSize: 12, fontFamily: 'monospace', minHeight: 60 }}
                />
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => copyToClipboard(embedCode, 'embed')}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {copied === 'embed' ? <CheckCircle size={14} color="#10b981" /> : <Copy size={14} />}
                  {copied === 'embed' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="slide-panel-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { onSave({ ...form, fields }); onClose(); }}>
            Save Form
          </button>
        </div>
      </div>
    </>
  );
}

function SettingsTab() {
  const [settings, setSettings] = useState({
    autoProject: true,
    notifyEmail: true,
    autoFollowUp: false,
    autoContact: true,
    followUpContent: '',
  });

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {[
          { key: 'autoProject', label: 'Auto-create Project when form is submitted' },
          { key: 'notifyEmail', label: 'Send notification email' },
          { key: 'autoFollowUp', label: 'Auto-send follow-up email' },
          { key: 'autoContact', label: 'Auto-create Contact from submission' },
        ].map(item => (
          <div key={item.key}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 0', borderBottom: '1px solid #f0ece4',
            }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14, color: '#1a1a1a' }}>{item.label}</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={settings[item.key]} onChange={() => toggle(item.key)} />
                <span className="toggle-slider" />
              </label>
            </div>
            {item.key === 'autoFollowUp' && settings.autoFollowUp && (
              <div className="form-group" style={{ marginTop: 8, marginBottom: 8 }}>
                <label className="form-label">Follow-up email content</label>
                <textarea
                  className="form-textarea"
                  value={settings.followUpContent}
                  onChange={e => setSettings(s => ({ ...s, followUpContent: e.target.value }))}
                  placeholder="Hi [Name], thanks for reaching out! I'll get back to you within 24 hours…"
                  style={{ minHeight: 100 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 24, background: '#fffbeb', border: '1px solid #fde68a',
        borderRadius: 10, padding: 16,
      }}>
        <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
          When a lead submits this form, Flint will automatically create a new Project and Contact. You'll receive an in-app and email notification.
        </div>
      </div>
    </div>
  );
}

export default function LeadForms() {
  const [tab, setTab] = useState('forms');
  const [forms, setForms] = useState(defaultForms);
  const [editForm, setEditForm] = useState(null);

  const saveForm = (updated) => {
    setForms(f => f.map(frm => frm.id === updated.id ? updated : frm));
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Lead Forms</h1>
        <button className="btn btn-primary" onClick={() => {}}>
          <Plus size={16} /> New Form
        </button>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'forms' ? 'active' : ''}`} onClick={() => setTab('forms')}>Forms</button>
        <button className={`tab ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>Settings</button>
      </div>

      {tab === 'forms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {forms.map(frm => (
            <div key={frm.id} className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a' }}>{frm.name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{frm.submissions} submissions</div>
                  </div>
                  <span style={{
                    background: '#d1fae5', color: '#065f46',
                    padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  }}>
                    {frm.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm">
                    <Eye size={14} /> Preview
                  </button>
                  <button className="btn btn-secondary btn-sm">
                    <Code2 size={14} /> Embed
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => setEditForm(frm)}>
                    <Edit2 size={14} /> Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'settings' && <SettingsTab />}

      {editForm && (
        <EditFormPanel
          form={editForm}
          onClose={() => setEditForm(null)}
          onSave={saveForm}
        />
      )}
    </div>
  );
}
