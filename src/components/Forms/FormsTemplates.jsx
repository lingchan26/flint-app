import { useState } from 'react';
import { GripVertical, Plus, X, Cpu, ChevronDown, ChevronUp, FileText } from 'lucide-react';

const defaultFields = [
  { id: 1, label: 'Full Name', type: 'text', required: true },
  { id: 2, label: 'Email', type: 'email', required: true },
  { id: 3, label: 'Phone', type: 'tel', required: false },
  { id: 4, label: 'Company', type: 'text', required: false },
  { id: 5, label: 'Message', type: 'textarea', required: true },
  { id: 6, label: 'How did you hear about us?', type: 'select', required: false },
];

const briefSections = [
  { id: 'project', title: 'Project Details', fields: ['Project Name', 'Client', 'Start Date', 'End Date', 'Review Date', 'Timeline'] },
  { id: 'brand', title: 'Brand Background & Context', content: '' },
  { id: 'today', title: 'What does the brand look like today?', content: '' },
  { id: 'challenge', title: 'What is the brand challenge or opportunity?', content: '' },
  { id: 'objective', title: 'Project Objective', content: '' },
  { id: 'deliverables', title: 'Creative Deliverables', content: '' },
  { id: 'market', title: 'Market Insights', content: '' },
  { id: 'competitors', title: 'Key Direct Competitors', content: '' },
  { id: 'category', title: 'Category Insights', content: '' },
  { id: 'consumer', title: 'Consumer Insights', content: '' },
  { id: 'creative', title: 'Creative Considerations', content: '' },
];

const AI_BRIEF_SUMMARY = `This creative brief outlines a strategic brand engagement with the client, focused on addressing key market challenges and unlocking growth opportunities. The project spans discovery through delivery, with clearly defined creative deliverables aligned to the brand's positioning objectives. Stakeholders have been identified, and the timeline allows for collaborative iteration. The target audience is well-researched, with consumer insights informing both the creative direction and channel strategy. The brief encourages bold, differentiated creative thinking grounded in the brand's existing equity and future ambitions.`;

function FormBuilder({ fields, setFields }) {
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const toggleRequired = (id) => {
    setFields(fs => fs.map(f => f.id === id ? { ...f, required: !f.required } : f));
  };

  const removeField = (id) => {
    setFields(fs => fs.filter(f => f.id !== id));
  };

  const addField = () => {
    setFields(fs => [...fs, { id: Date.now(), label: 'New Field', type: 'text', required: false }]);
  };

  const handleDragStart = (id) => setDragging(id);
  const handleDragOver = (e, id) => { e.preventDefault(); setDragOver(id); };
  const handleDrop = (targetId) => {
    if (dragging === null || dragging === targetId) return;
    const fromIdx = fields.findIndex(f => f.id === dragging);
    const toIdx = fields.findIndex(f => f.id === targetId);
    const newFields = [...fields];
    const [removed] = newFields.splice(fromIdx, 1);
    newFields.splice(toIdx, 0, removed);
    setFields(newFields);
    setDragging(null);
    setDragOver(null);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {/* Builder */}
      <div>
        <div className="section-heading">Form Fields</div>
        {fields.map(f => (
          <div
            key={f.id}
            draggable
            onDragStart={() => handleDragStart(f.id)}
            onDragOver={e => handleDragOver(e, f.id)}
            onDrop={() => handleDrop(f.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              background: dragOver === f.id ? '#fffbeb' : '#fff',
              border: `1px solid ${dragOver === f.id ? '#f59e0b' : '#e5e0d8'}`,
              borderRadius: 8,
              marginBottom: 8,
              cursor: 'grab',
              transition: 'all 0.15s',
            }}
          >
            <GripVertical size={16} color="#9ca3af" style={{ flexShrink: 0, cursor: 'grab' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{f.label}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'capitalize' }}>{f.type}</div>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={f.required} onChange={() => toggleRequired(f.id)} />
              <span className="toggle-slider" />
              <span style={{ fontSize: 12, color: '#6b7280' }}>Required</span>
            </label>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '2px' }}
              onClick={() => removeField(f.id)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button className="btn btn-secondary btn-sm" onClick={addField} style={{ marginTop: 8 }}>
          <Plus size={14} /> Add Field
        </button>
      </div>

      {/* Live Preview */}
      <div>
        <div className="section-heading">Live Preview</div>
        <div style={{
          background: '#faf8f4',
          border: '1px solid #e5e0d8',
          borderRadius: 12,
          padding: 24,
        }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Contact Us</div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>We'd love to hear from you.</div>
          {fields.map(f => (
            <div key={f.id} className="form-group">
              <label className="form-label">
                {f.label}
                {f.required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
              </label>
              {f.type === 'textarea' ? (
                <textarea className="form-textarea" style={{ minHeight: 60 }} disabled placeholder={`Enter ${f.label.toLowerCase()}…`} />
              ) : f.type === 'select' ? (
                <select className="form-select" disabled>
                  <option>Select an option…</option>
                  <option>Referral</option>
                  <option>Instagram</option>
                  <option>LinkedIn</option>
                  <option>Other</option>
                </select>
              ) : (
                <input className="form-input" type={f.type} disabled placeholder={`Enter ${f.label.toLowerCase()}…`} />
              )}
            </div>
          ))}
          <button className="btn btn-primary" disabled style={{ opacity: 0.7 }}>Submit</button>
        </div>
      </div>
    </div>
  );
}

function BriefSection({ section, value, onChange }) {
  const [open, setOpen] = useState(true);

  if (section.fields) {
    return (
      <div style={{ marginBottom: 16, border: '1px solid #e5e0d8', borderRadius: 10, overflow: 'hidden' }}>
        <button
          style={{ width: '100%', background: '#faf8f4', border: 'none', padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          onClick={() => setOpen(o => !o)}
        >
          <span style={{ fontWeight: 600, fontSize: 14 }}>{section.title}</span>
          {open ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
        </button>
        {open && (
          <div style={{ padding: 16 }}>
            <div className="form-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {section.fields.map(field => (
                <div key={field} className="form-group">
                  <label className="form-label">{field}</label>
                  <input className="form-input" placeholder={field} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 12, border: '1px solid #e5e0d8', borderRadius: 10, overflow: 'hidden' }}>
      <button
        style={{ width: '100%', background: '#faf8f4', border: 'none', padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        onClick={() => setOpen(o => !o)}
      >
        <span style={{ fontWeight: 600, fontSize: 14 }}>{section.title}</span>
        {open ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
      </button>
      {open && (
        <div style={{ padding: 16 }}>
          <textarea
            className="form-textarea"
            style={{ minHeight: 80 }}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={`Enter ${section.title.toLowerCase()}…`}
          />
        </div>
      )}
    </div>
  );
}

export default function FormsTemplates() {
  const [tab, setTab] = useState('forms');
  const [fields, setFields] = useState(defaultFields);
  const [briefValues, setBriefValues] = useState({});
  const [showBrief, setShowBrief] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const generateAI = () => {
    setLoadingAI(true);
    setTimeout(() => {
      setAiSummary(AI_BRIEF_SUMMARY);
      setLoadingAI(false);
    }, 1500);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Forms & Templates</h1>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'forms' ? 'active' : ''}`} onClick={() => setTab('forms')}>Forms</button>
        <button className={`tab ${tab === 'templates' ? 'active' : ''}`} onClick={() => setTab('templates')}>Templates</button>
      </div>

      {tab === 'forms' && (
        <div>
          <div style={{ marginBottom: 20, fontSize: 14, color: '#6b7280' }}>
            Build your contact form by dragging and reordering fields. Toggle required fields and preview changes live.
          </div>
          <FormBuilder fields={fields} setFields={setFields} />
        </div>
      )}

      {tab === 'templates' && !showBrief && (
        <div>
          <div style={{ marginBottom: 20, fontSize: 14, color: '#6b7280' }}>
            Use templates to streamline your creative briefs and proposals.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <button
              onClick={() => setShowBrief(true)}
              style={{
                background: '#fff',
                border: '1px solid #e5e0d8',
                borderRadius: 12,
                padding: 24,
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#f59e0b'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#e5e0d8'; }}
            >
              <div style={{
                width: 44, height: 44, background: '#fef3c7', borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
              }}>
                <FileText size={22} color="#f59e0b" />
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Creative Brief</div>
              <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5 }}>
                Full creative brief with expandable sections for brand context, objectives, deliverables, and insights.
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 6 }}>
                {['Brand', 'Strategy', 'Insights'].map(t => (
                  <span key={t} style={{ background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: 6, fontSize: 11 }}>{t}</span>
                ))}
              </div>
            </button>

            {/* More templates (placeholder) */}
            {['Proposal', 'Onboarding Checklist'].map(name => (
              <div key={name} style={{
                background: '#fff',
                border: '2px dashed #e5e0d8',
                borderRadius: 12,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 160,
                color: '#9ca3af',
              }}>
                <FileText size={24} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 14, fontWeight: 500 }}>{name}</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Coming soon</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'templates' && showBrief && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <button className="btn btn-ghost" onClick={() => setShowBrief(false)} style={{ padding: '6px 0' }}>
              ← Back to Templates
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Creative Brief</h2>
            <div style={{ flex: 1 }} />
            <button
              className="btn btn-primary"
              onClick={generateAI}
              disabled={loadingAI}
              style={{ opacity: loadingAI ? 0.7 : 1 }}
            >
              <Cpu size={16} />
              {loadingAI ? 'Generating…' : 'AI Summary'}
            </button>
          </div>

          {aiSummary && (
            <div style={{
              background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: 10, padding: 16, marginBottom: 20,
              fontSize: 13, color: '#1a1a1a', lineHeight: 1.7,
              display: 'flex', gap: 12,
            }}>
              <Cpu size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
              <p>{aiSummary}</p>
            </div>
          )}

          {briefSections.map(s => (
            <BriefSection
              key={s.id}
              section={s}
              value={briefValues[s.id] || ''}
              onChange={v => setBriefValues(bv => ({ ...bv, [s.id]: v }))}
            />
          ))}

          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary">Save Draft</button>
            <button className="btn btn-primary">Export as PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}
