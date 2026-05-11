import { useState } from 'react';
import {
  Plus, X, Eye, Code2, Edit2, GripVertical, Trash2, Copy, CheckCircle,
  Link, Settings, ChevronRight, Users, FileText, Zap, ExternalLink,
  ToggleLeft, AlignLeft, Hash, Mail, Phone, Calendar, List, Type,
} from 'lucide-react';

/* ─── Constants ─── */
const FIELD_TYPES = [
  { type: 'text', label: 'Short Text', icon: Type },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'phone', label: 'Phone', icon: Phone },
  { type: 'textarea', label: 'Long Text', icon: AlignLeft },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'dropdown', label: 'Dropdown', icon: List },
  { type: 'number', label: 'Number', icon: Hash },
];

const defaultFields = [
  { id: 1, name: 'Full Name', type: 'text', required: true },
  { id: 2, name: 'Email Address', type: 'email', required: true },
  { id: 3, name: 'Phone Number', type: 'phone', required: false },
  { id: 4, name: 'What type of project are you looking for?', type: 'dropdown', required: true, options: ['Brand Identity', 'Packaging Design', 'Digital Marketing', 'Photography', 'Motion / Video', 'Other'] },
  { id: 5, name: 'Approximate budget range', type: 'dropdown', required: false, options: ['Under S$5,000', 'S$5,000 – 15,000', 'S$15,000 – 50,000', 'S$50,000+', 'Not sure yet'] },
  { id: 6, name: 'Tell me more about your project', type: 'textarea', required: false },
  { id: 7, name: 'Preferred timeline to start', type: 'date', required: false },
];

const defaultFormSettings = {
  heading: 'Work with me',
  subheading: 'Fill in your details and I\'ll be in touch within 24 hours.',
  brandColor: '#f59e0b',
  thankYouMessage: 'Thanks for reaching out! I\'ll reply within 24 hours.',
  redirectUrl: '',
  notifyEmail: '',
  autoProject: true,
  autoContact: true,
  autoFollowUp: false,
};

const demoForms = [
  {
    id: 1,
    name: 'New Client Inquiry',
    status: 'Active',
    submissions: 14,
    lastSubmission: '2 days ago',
    conversionRate: 62,
    fields: defaultFields,
    settings: { ...defaultFormSettings, brandColor: '#f59e0b' },
    createdAt: '12 Mar 2026',
  },
  {
    id: 2,
    name: 'Photography Enquiry',
    status: 'Active',
    submissions: 7,
    lastSubmission: '5 days ago',
    conversionRate: 44,
    fields: defaultFields.slice(0, 5),
    settings: { ...defaultFormSettings, heading: 'Book a shoot', brandColor: '#8b5cf6' },
    createdAt: '28 Feb 2026',
  },
  {
    id: 3,
    name: 'Brand Refresh Waitlist',
    status: 'Inactive',
    submissions: 31,
    lastSubmission: '3 weeks ago',
    conversionRate: 88,
    fields: defaultFields.slice(0, 3),
    settings: { ...defaultFormSettings, heading: 'Join the waitlist', brandColor: '#3b82f6' },
    createdAt: '15 Jan 2026',
  },
];

const demoSubmissions = [
  { id: 1, formId: 1, name: 'Sarah Wong', email: 'sarah@lumeco.sg', project: 'Brand Identity', budget: 'S$15,000 – 50,000', date: '9 May 2026', status: 'New' },
  { id: 2, formId: 1, name: 'James Teo', email: 'james@vertexinc.com', project: 'Packaging Design', budget: 'S$5,000 – 15,000', date: '7 May 2026', status: 'Contacted' },
  { id: 3, formId: 1, name: 'Mei Lin', email: 'meilin@bloom.co', project: 'Digital Marketing', budget: 'Under S$5,000', date: '5 May 2026', status: 'Converted' },
  { id: 4, formId: 1, name: 'Arjun Sharma', email: 'arjun@novutech.io', project: 'Motion / Video', budget: 'S$15,000 – 50,000', date: '4 May 2026', status: 'New' },
];

/* ─── Live Form Preview ─── */
function FormPreview({ fields, settings }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.10)', maxWidth: 440,
      fontFamily: 'var(--font-body)',
    }}>
      {/* Colored header */}
      <div style={{ background: settings.brandColor, padding: '28px 28px 24px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{settings.heading}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{settings.subheading}</div>
      </div>
      {/* Fields */}
      <div style={{ padding: 24 }}>
        {fields.map(f => (
          <div key={f.id} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
              {f.name}
              {f.required && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
            </label>
            {f.type === 'textarea' ? (
              <textarea disabled placeholder="Type here…" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, minHeight: 80, resize: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }} />
            ) : f.type === 'dropdown' ? (
              <select disabled style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, boxSizing: 'border-box', background: '#fff' }}>
                <option>Select an option…</option>
                {(f.options || []).map(o => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input disabled type={f.type} placeholder={`Enter ${f.name.toLowerCase()}`} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, boxSizing: 'border-box' }} />
            )}
          </div>
        ))}
        <button disabled style={{
          width: '100%', padding: '12px', borderRadius: 10, border: 'none',
          background: settings.brandColor, color: '#fff', fontSize: 14, fontWeight: 700,
          cursor: 'not-allowed', fontFamily: 'var(--font-body)', marginTop: 8,
        }}>
          Submit →
        </button>
        <div style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 12 }}>
          Powered by <span style={{ fontWeight: 700 }}>Flint</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Form Builder (full-page) ─── */
function FormBuilder({ form, onSave, onBack }) {
  const [fields, setFields] = useState(form.fields);
  const [settings, setSettings] = useState(form.settings);
  const [formName, setFormName] = useState(form.name);
  const [rightTab, setRightTab] = useState('preview'); // 'preview' | 'settings' | 'share'
  const [copied, setCopied] = useState(false);
  const shareLink = `https://flint.app/f/${form.id}`;

  const addField = (type) => {
    const TypeMeta = FIELD_TYPES.find(t => t.type === type);
    setFields(f => [...f, {
      id: Date.now(), name: TypeMeta?.label || 'New Field', type, required: false,
    }]);
  };

  const removeField = (id) => setFields(f => f.filter(fi => fi.id !== id));
  const updateField = (id, key, val) => setFields(f => f.map(fi => fi.id === id ? { ...fi, [key]: val } : fi));
  const toggleRequired = (id) => setFields(f => f.map(fi => fi.id === id ? { ...fi, required: !fi.required } : fi));

  const copyLink = () => {
    navigator.clipboard?.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSave({ ...form, name: formName, fields, settings });
    onBack();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Builder header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 0 20px', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ padding: '6px 0' }}>← Back</button>
        <input
          value={formName}
          onChange={e => setFormName(e.target.value)}
          style={{
            fontSize: 18, fontWeight: 700, border: 'none', background: 'transparent',
            outline: 'none', color: 'var(--slate-900)', flex: 1,
            fontFamily: 'var(--font-body)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
          <button className="btn btn-secondary btn-sm" onClick={copyLink} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {copied ? <CheckCircle size={13} color="#10b981" /> : <Link size={13} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setRightTab('preview')}>
            <Eye size={13} /> Preview
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save & Publish
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 380px', gap: 24, flex: 1 }}>
        {/* ── Left: field palette + current fields ── */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Add Field</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
            {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => addField(type)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)',
                  background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--slate-700)',
                  textAlign: 'left', fontFamily: 'var(--font-body)',
                  transition: 'border-color 0.1s, background 0.1s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.background = '#fffbeb'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#fff'; }}
              >
                <Icon size={14} color="#9ca3af" /> {label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Form Fields</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {fields.map((f, i) => {
              const Icon = FIELD_TYPES.find(t => t.type === f.type)?.icon || Type;
              return (
                <div key={f.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', borderRadius: 8, background: '#fff',
                  border: '1px solid var(--border)',
                }}>
                  <GripVertical size={14} color="#d1d5db" style={{ cursor: 'grab', flexShrink: 0 }} />
                  <Icon size={13} color="#9ca3af" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 12, flex: 1, color: 'var(--slate-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                  {f.required && <span style={{ fontSize: 10, color: '#ef4444', flexShrink: 0 }}>*</span>}
                  <button onClick={() => removeField(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', display: 'flex', padding: 0, flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}>
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Center: field editor ── */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Field Settings</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {fields.map((f, i) => (
              <div key={f.id} style={{
                padding: '14px 16px', background: '#fff', border: '1px solid var(--border)', borderRadius: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate-400)', width: 20 }}>{i + 1}</div>
                  <input
                    className="form-input"
                    value={f.name}
                    onChange={e => updateField(f.id, 'name', e.target.value)}
                    style={{ flex: 1, fontSize: 13 }}
                    placeholder="Field label"
                  />
                  <select
                    className="form-select"
                    value={f.type}
                    onChange={e => updateField(f.id, 'type', e.target.value)}
                    style={{ width: 120, fontSize: 12 }}
                  >
                    {FIELD_TYPES.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
                  </select>
                  <label className="toggle" style={{ gap: 4, flexShrink: 0 }}>
                    <input type="checkbox" checked={f.required} onChange={() => toggleRequired(f.id)} />
                    <span className="toggle-slider" />
                    <span style={{ fontSize: 11, color: '#6b7280' }}>Req</span>
                  </label>
                  <button onClick={() => removeField(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', display: 'flex', padding: 2, flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}>
                    <Trash2 size={14} />
                  </button>
                </div>
                {f.type === 'dropdown' && (
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--slate-400)', marginBottom: 4 }}>Options (one per line)</div>
                    <textarea
                      className="form-textarea"
                      value={(f.options || []).join('\n')}
                      onChange={e => updateField(f.id, 'options', e.target.value.split('\n'))}
                      style={{ minHeight: 60, fontSize: 12, resize: 'none' }}
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: preview / settings / share ── */}
        <div>
          <div className="tabs" style={{ margin: '0 0 16px' }}>
            <button className={`tab ${rightTab === 'preview' ? 'active' : ''}`} onClick={() => setRightTab('preview')} style={{ fontSize: 12 }}>Preview</button>
            <button className={`tab ${rightTab === 'settings' ? 'active' : ''}`} onClick={() => setRightTab('settings')} style={{ fontSize: 12 }}>Settings</button>
            <button className={`tab ${rightTab === 'share' ? 'active' : ''}`} onClick={() => setRightTab('share')} style={{ fontSize: 12 }}>Share</button>
          </div>

          {rightTab === 'preview' && (
            <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
              <FormPreview fields={fields} settings={settings} />
            </div>
          )}

          {rightTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Form Heading</label>
                <input className="form-input" value={settings.heading} onChange={e => setSettings(s => ({ ...s, heading: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Subheading</label>
                <textarea className="form-textarea" value={settings.subheading} onChange={e => setSettings(s => ({ ...s, subheading: e.target.value }))} style={{ minHeight: 60, resize: 'none' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Brand Colour</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f97316', '#ec4899', '#1a1a1a'].map(c => (
                    <div
                      key={c}
                      onClick={() => setSettings(s => ({ ...s, brandColor: c }))}
                      style={{
                        width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer',
                        border: settings.brandColor === c ? '3px solid var(--slate-900)' : '3px solid transparent',
                        boxSizing: 'border-box',
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Thank You Message</label>
                <textarea className="form-textarea" value={settings.thankYouMessage} onChange={e => setSettings(s => ({ ...s, thankYouMessage: e.target.value }))} style={{ minHeight: 60, resize: 'none' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Notification Email</label>
                <input className="form-input" type="email" value={settings.notifyEmail} onChange={e => setSettings(s => ({ ...s, notifyEmail: e.target.value }))} placeholder="your@email.com" />
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                {[
                  { key: 'autoProject', label: 'Auto-create Project' },
                  { key: 'autoContact', label: 'Auto-create Contact' },
                  { key: 'autoFollowUp', label: 'Send follow-up email' },
                ].map(({ key, label }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, color: 'var(--slate-700)' }}>{label}</span>
                    <label className="toggle">
                      <input type="checkbox" checked={settings[key] || false} onChange={() => setSettings(s => ({ ...s, [key]: !s[key] }))} />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rightTab === 'share' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Shareable Link</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" value={shareLink} readOnly style={{ flex: 1, background: 'var(--slate-50)', fontSize: 12 }} />
                  <button className="btn btn-secondary btn-sm" onClick={copyLink}>
                    {copied ? <CheckCircle size={13} color="#10b981" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Embed Code</label>
                <textarea
                  className="form-textarea"
                  value={`<iframe src="${shareLink}" width="100%" height="700" frameborder="0" style="border-radius:12px;" />`}
                  readOnly
                  style={{ fontSize: 11, fontFamily: 'monospace', minHeight: 80, background: 'var(--slate-50)' }}
                />
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Copy size={12} /> Copy Embed
                </button>
              </div>
              <a href={shareLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontWeight: 600 }}>
                <ExternalLink size={13} /> Open public form
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Submissions view ─── */
function SubmissionsView({ form, onBack }) {
  const subs = demoSubmissions.filter(s => s.formId === form.id);
  const statusColor = {
    New: { bg: '#dbeafe', color: '#1e40af' },
    Contacted: { bg: '#fef3c7', color: '#92400e' },
    Converted: { bg: '#d1fae5', color: '#065f46' },
  };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ padding: '6px 0' }}>← Back</button>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{form.name} — Submissions</h2>
        <span style={{ fontSize: 13, color: 'var(--slate-400)' }}>{subs.length} total</span>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Project Type</th>
              <th>Budget</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--slate-400)' }}>
                  No submissions yet — share your form to start collecting leads.
                </td>
              </tr>
            ) : subs.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 500 }}>{s.name}</td>
                <td style={{ color: 'var(--slate-500)', fontSize: 13 }}>{s.email}</td>
                <td style={{ fontSize: 13 }}>{s.project}</td>
                <td style={{ fontSize: 13 }}>{s.budget}</td>
                <td style={{ fontSize: 12, color: 'var(--slate-400)' }}>{s.date}</td>
                <td>
                  <span style={{ ...statusColor[s.status], padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                    {s.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>View</button>
                    <button className="btn btn-primary btn-sm" style={{ fontSize: 12 }}>→ Contact</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function LeadForms() {
  const [view, setView] = useState('list'); // 'list' | 'builder' | 'submissions' | 'preview'
  const [forms, setForms] = useState(demoForms);
  const [activeForm, setActiveForm] = useState(null);
  const [previewForm, setPreviewForm] = useState(null);

  const saveForm = (updated) => {
    setForms(f => {
      const exists = f.find(x => x.id === updated.id);
      if (exists) return f.map(x => x.id === updated.id ? updated : x);
      return [...f, { ...updated, id: Date.now(), submissions: 0, lastSubmission: '—', conversionRate: 0, createdAt: new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' }) }];
    });
  };

  const newForm = () => {
    const blankForm = {
      id: Date.now(),
      name: 'Untitled Form',
      status: 'Draft',
      submissions: 0,
      lastSubmission: '—',
      conversionRate: 0,
      fields: defaultFields,
      settings: { ...defaultFormSettings },
      createdAt: '',
    };
    setActiveForm(blankForm);
    setView('builder');
  };

  if (view === 'builder' && activeForm) {
    return (
      <div className="page-content">
        <FormBuilder form={activeForm} onSave={saveForm} onBack={() => { setView('list'); setActiveForm(null); }} />
      </div>
    );
  }

  if (view === 'submissions' && activeForm) {
    return (
      <div className="page-content">
        <SubmissionsView form={activeForm} onBack={() => { setView('list'); setActiveForm(null); }} />
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Lead Forms</h1>
          <div style={{ fontSize: 13, color: 'var(--slate-400)', marginTop: 2 }}>
            Capture leads from your website or share a direct link
          </div>
        </div>
        <button className="btn btn-primary" onClick={newForm}>
          <Plus size={16} /> New Form
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Submissions', value: forms.reduce((s, f) => s + f.submissions, 0), color: '#3b82f6', bg: '#dbeafe' },
          { label: 'Active Forms', value: forms.filter(f => f.status === 'Active').length, color: '#10b981', bg: '#d1fae5' },
          { label: 'Avg. Conversion', value: `${Math.round(forms.reduce((s, f) => s + f.conversionRate, 0) / forms.length)}%`, color: '#f59e0b', bg: '#fef3c7' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <Users size={18} color={s.color} />
            </div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Forms grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {forms.map(frm => (
          <div
            key={frm.id}
            className="card"
            style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            {/* Colored header */}
            <div style={{
              background: frm.settings.brandColor, padding: '20px 20px 16px',
              position: 'relative',
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{frm.settings.heading}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{frm.fields.length} fields</div>
              <span style={{
                position: 'absolute', top: 14, right: 14,
                background: frm.status === 'Active' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
                color: '#fff', fontSize: 11, fontWeight: 600,
                padding: '2px 8px', borderRadius: 20,
              }}>
                {frm.status}
              </span>
            </div>

            {/* Stats */}
            <div style={{ padding: '14px 20px', flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10, color: 'var(--slate-900)' }}>{frm.name}</div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                {[
                  { label: 'Submissions', value: frm.submissions },
                  { label: 'Conversion', value: `${frm.conversionRate}%` },
                  { label: 'Last submission', value: frm.lastSubmission },
                ].map(stat => (
                  <div key={stat.label}>
                    <div style={{ fontSize: 11, color: 'var(--slate-400)', marginBottom: 2 }}>{stat.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--slate-900)' }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 6 }}>
              <button
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 12, flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => { setPreviewForm(frm); }}
              >
                <Eye size={12} /> Preview
              </button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 12, flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => { setActiveForm(frm); setView('submissions'); }}
              >
                <Users size={12} /> {frm.submissions}
              </button>
              <button
                className="btn btn-primary btn-sm"
                style={{ fontSize: 12, flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => { setActiveForm(frm); setView('builder'); }}
              >
                <Edit2 size={12} /> Edit
              </button>
            </div>
          </div>
        ))}

        {/* Add new form card */}
        <button
          onClick={newForm}
          style={{
            border: '2px dashed #e5e0d8', borderRadius: 14, background: '#fff',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: 220, cursor: 'pointer', gap: 12, color: 'var(--slate-400)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.color = '#f59e0b'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e0d8'; e.currentTarget.style.color = 'var(--slate-400)'; }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={22} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Create New Form</div>
          <div style={{ fontSize: 12 }}>Drag fields, set branding, share link</div>
        </button>
      </div>

      {/* Form preview modal */}
      {previewForm && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} onClick={() => setPreviewForm(null)} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            zIndex: 101, maxHeight: '90vh', overflowY: 'auto',
          }}>
            <button
              onClick={() => setPreviewForm(null)}
              style={{
                position: 'absolute', top: -12, right: -12, width: 28, height: 28, borderRadius: '50%',
                background: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)', zIndex: 1,
              }}
            >
              <X size={14} />
            </button>
            <FormPreview fields={previewForm.fields} settings={previewForm.settings} />
          </div>
        </>
      )}
    </div>
  );
}
