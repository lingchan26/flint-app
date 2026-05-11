import { useState, useRef } from 'react';
import {
  GripVertical, Plus, X, Cpu, ChevronDown, ChevronUp, FileText,
  Upload, Copy, ExternalLink, Download, Sparkles, Mail, AlertCircle,
} from 'lucide-react';

/* ─── Brief sections for the Creative Brief template ─── */
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

/* ─── Default form fields for Form Builder ─── */
const defaultFields = [
  { id: 1, label: 'Full Name', type: 'text', required: true },
  { id: 2, label: 'Email', type: 'email', required: true },
  { id: 3, label: 'Phone', type: 'tel', required: false },
  { id: 4, label: 'Company', type: 'text', required: false },
  { id: 5, label: 'Message', type: 'textarea', required: true },
  { id: 6, label: 'How did you hear about us?', type: 'select', required: false },
];

/* ─── Simulated AI output ─── */
const AI_REVERSE_BRIEF = {
  brand: `The brand operates in a competitive category with a strong heritage but is facing pressure from newer, more digitally-native competitors. The core brand equity rests on quality and trust, but the visual identity has not kept pace with the evolving market landscape. A strategic refresh is needed to modernise the brand while preserving its foundational strengths.`,
  today: `Current brand expression is conservative and traditional. The colour palette is dated, typography lacks personality, and digital touchpoints (website, social) are inconsistent with print materials. There is no clear ownable visual language that differentiates the brand in feed or shelf environments.`,
  challenge: `The brand is losing relevance with younger demographic segments (25–35) while simultaneously maintaining loyalty with its existing base (40+). The core challenge is to evolve the brand's visual language in a way that attracts new audiences without alienating current loyal customers.`,
  objective: `To develop a refreshed brand identity system that is modern, cohesive, and adaptable across both digital and physical touchpoints. The identity should be distinctive enough to own its space in market while remaining approachable and trustworthy to the core audience.`,
  deliverables: `Logo system (primary, secondary, icon mark), colour palette, typography system, brand pattern/texture, brand guidelines document (PDF), application files for social, print, and packaging templates.`,
  market: `The category is growing 8% YoY driven by digital-first challenger brands. Premiumisation is a key trend — consumers are willing to pay more for brands with a strong story and aesthetic. Sustainability and transparency are table-stakes in this category.`,
  competitors: `Competitor A: strong digital presence, millennial-focused, playful visual identity. Competitor B: heritage brand, conservative, strong retail distribution. Competitor C: new entrant, premium positioning, strong packaging.`,
  consumer: `Primary audience: 25–40, urban professionals, health-conscious, digitally engaged. Secondary: 40–55, brand loyalists, value quality and reliability. Research indicates that visual credibility is the #1 purchase driver in this category.`,
  creative: `The creative direction should feel premium but not exclusive. Avoid visual clichés of the category. Explore custom typography as a brand asset. The colour palette should work in both digital (RGB) and print (CMYK/Pantone) environments. All assets must be supplied in editable source files.`,
};

const AI_QUESTIONS_EMAIL = `Hi {{Client Name}},

Thank you for sharing the brief for {{Project Name}} — I've reviewed it thoroughly and I'm excited about the direction.

Before I begin, I have a few targeted questions to make sure we're fully aligned:

1. **Brand Heritage vs. Refresh** — How far are you willing to push the visual evolution? Are you looking for a subtle refinement of what exists, or are you open to a bolder departure from the current identity?

2. **Primary Deliverable Priority** — If we had to prioritise one output above all others for launch day, which would it be? (e.g. packaging, digital/social, or the core logo system)

3. **Competitors to Avoid** — Are there any competitor brands whose aesthetic direction we should consciously avoid, even if they're executing it well?

4. **Tone & Personality** — Can you describe the brand in 3 words as you'd like it to feel after the refresh? (e.g. "confident, warm, modern")

5. **Approval Process** — Who are the key stakeholders in the approval chain, and how many rounds of revisions are included in the scope?

6. **Asset Delivery** — Do you require source files in a specific format (Adobe suite, Figma, or both)? And do you need print-ready files with bleed/crop marks?

7. **Reference Brands** — Outside of your own category, are there any brands whose visual identity you admire and could serve as creative inspiration?

I'll incorporate your answers before our kick-off call to ensure we make the most of our time together.

Looking forward to collaborating,
{{Your Name}}`;

/* ─── Sub-components ─── */
function FormBuilder({ fields, setFields }) {
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const toggleRequired = (id) => setFields(fs => fs.map(f => f.id === id ? { ...f, required: !f.required } : f));
  const removeField = (id) => setFields(fs => fs.filter(f => f.id !== id));
  const addField = () => setFields(fs => [...fs, { id: Date.now(), label: 'New Field', type: 'text', required: false }]);
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
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px',
              background: dragOver === f.id ? '#fffbeb' : '#fff',
              border: `1px solid ${dragOver === f.id ? '#f59e0b' : '#e5e0d8'}`,
              borderRadius: 8, marginBottom: 8, cursor: 'grab', transition: 'all 0.15s',
            }}
          >
            <GripVertical size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{f.label}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'capitalize' }}>{f.type}</div>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={f.required} onChange={() => toggleRequired(f.id)} />
              <span className="toggle-slider" />
              <span style={{ fontSize: 12, color: '#6b7280' }}>Required</span>
            </label>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2 }} onClick={() => removeField(f.id)}>
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
        <div style={{ background: '#faf8f4', border: '1px solid #e5e0d8', borderRadius: 12, padding: 24 }}>
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

/* ─── AI Brief Builder ─── */
function AIBriefBuilder({ onBack }) {
  const [pastedText, setPastedText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // null | 'brief' | 'email' when done
  const [activeResultTab, setActiveResultTab] = useState('brief');
  const [briefValues, setBriefValues] = useState({});
  const [emailBody, setEmailBody] = useState(AI_QUESTIONS_EMAIL);
  const [toast, setToast] = useState('');
  const fileRef = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const analyse = () => {
    if (!pastedText.trim() && !fileName) {
      showToast('Please paste a brief or upload a file first.');
      return;
    }
    setLoading(true);
    // Simulate AI analysis delay
    setTimeout(() => {
      setBriefValues(AI_REVERSE_BRIEF);
      setEmailBody(AI_QUESTIONS_EMAIL);
      setResult(true);
      setLoading(false);
    }, 2200);
  };

  const copyEmail = () => {
    navigator.clipboard?.writeText(emailBody);
    showToast('Email copied to clipboard!');
  };

  const openInGmail = () => {
    const url = `https://mail.google.com/mail/?view=cm&su=${encodeURIComponent('Brief clarification — {{Project Name}}')}&body=${encodeURIComponent(emailBody)}`;
    window.open(url, '_blank');
  };

  const exportPDF = () => {
    window.print();
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ padding: '6px 0' }}>
          ← Back
        </button>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: '#ede9fe',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={16} color="#8b5cf6" />
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>AI Brief Builder</h2>
          <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 1 }}>Upload or paste a brief → get a reverse brief + clarification email</div>
        </div>
      </div>

      {!result ? (
        /* ── Upload / Paste view ── */
        <div style={{ maxWidth: 680 }}>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleFileDrop}
            style={{
              border: `2px dashed ${isDragOver ? '#8b5cf6' : '#e5e0d8'}`,
              borderRadius: 14,
              padding: '32px 24px',
              textAlign: 'center',
              background: isDragOver ? '#faf5ff' : '#faf8f4',
              marginBottom: 20,
              transition: 'all 0.15s',
              cursor: 'pointer',
            }}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.txt,.docx" onChange={handleFileSelect} style={{ display: 'none' }} />
            <div style={{
              width: 52, height: 52, borderRadius: 14, background: '#ede9fe',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
            }}>
              <Upload size={24} color="#8b5cf6" />
            </div>
            {fileName ? (
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>📄 {fileName}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Click to change file</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>
                  Drop a brief, email, or PDF here
                </div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>
                  Supports PDF, PNG, JPG, DOCX, TXT
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: '#e5e0d8' }} />
            <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>or paste brief text</span>
            <div style={{ flex: 1, height: 1, background: '#e5e0d8' }} />
          </div>

          <textarea
            className="form-textarea"
            value={pastedText}
            onChange={e => setPastedText(e.target.value)}
            placeholder="Paste the brief, email, or any text here…"
            style={{ minHeight: 180, marginBottom: 16, fontSize: 13, lineHeight: 1.7, resize: 'vertical' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="btn btn-primary"
              onClick={analyse}
              disabled={loading}
              style={{
                padding: '12px 28px', fontSize: 15, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Sparkles size={16} />
              {loading ? 'Analysing brief…' : 'Analyse with AI'}
            </button>
            {loading && (
              <div style={{ fontSize: 13, color: '#9ca3af' }}>
                Reading structure, extracting insights, drafting questions…
              </div>
            )}
          </div>

          <div style={{
            marginTop: 20, padding: '12px 16px',
            background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
            fontSize: 12, color: '#166534', lineHeight: 1.6,
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            In production, Flint's AI reads your uploaded file (PDF/image OCR or doc text) and generates a structured reverse brief and tailored clarification email. Files are never stored or shared.
          </div>
        </div>
      ) : (
        /* ── Result view ── */
        <div>
          {/* Result tabs + export */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div className="tabs" style={{ margin: 0 }}>
              <button
                className={`tab ${activeResultTab === 'brief' ? 'active' : ''}`}
                onClick={() => setActiveResultTab('brief')}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <FileText size={14} /> Reverse Brief
              </button>
              <button
                className={`tab ${activeResultTab === 'email' ? 'active' : ''}`}
                onClick={() => setActiveResultTab('email')}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Mail size={14} /> Clarification Email
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {activeResultTab === 'brief' ? (
                <>
                  <button className="btn btn-secondary btn-sm" onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Download size={13} /> Export PDF
                  </button>
                  <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Download size={13} /> Export Word
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-secondary btn-sm" onClick={copyEmail} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Copy size={13} /> Copy Email
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={openInGmail} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <ExternalLink size={13} /> Open in Gmail
                  </button>
                </>
              )}
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setResult(null)}
              >
                ← Re-upload
              </button>
            </div>
          </div>

          {/* AI-generated banner */}
          <div style={{
            background: '#faf5ff', border: '1px solid #ddd6fe',
            borderRadius: 10, padding: '10px 14px', marginBottom: 20,
            fontSize: 12, color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Sparkles size={14} />
            AI-generated from your uploaded brief. Review and edit before sending or exporting.
          </div>

          {/* Reverse Brief tab */}
          {activeResultTab === 'brief' && (
            <div>
              {briefSections.map(s => (
                <BriefSection
                  key={s.id}
                  section={s}
                  value={briefValues[s.id] || ''}
                  onChange={v => setBriefValues(bv => ({ ...bv, [s.id]: v }))}
                />
              ))}
            </div>
          )}

          {/* Clarification Email tab */}
          {activeResultTab === 'email' && (
            <div>
              <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--slate-500)', lineHeight: 1.6 }}>
                A tailored email with 7 strategic questions based on gaps found in your brief. Edit before sending.
              </div>
              <textarea
                className="form-textarea"
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                style={{ minHeight: 480, fontSize: 13, lineHeight: 1.8, resize: 'vertical', fontFamily: 'inherit' }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn btn-secondary" onClick={copyEmail} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Copy size={14} /> Copy to Clipboard
                </button>
                <button className="btn btn-primary" onClick={openInGmail} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ExternalLink size={14} /> Open in Gmail
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─── */
export default function FormsTemplates() {
  const [tab, setTab] = useState('templates');
  const [fields, setFields] = useState(defaultFields);
  const [templateView, setTemplateView] = useState('grid'); // 'grid' | 'brief' | 'ai-brief'
  const [briefValues, setBriefValues] = useState({});
  const [aiSummary, setAiSummary] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const generateAI = () => {
    setLoadingAI(true);
    setTimeout(() => {
      setAiSummary(`This creative brief outlines a strategic brand engagement focused on addressing key market challenges and unlocking growth opportunities. The project spans discovery through delivery, with clearly defined creative deliverables aligned to the brand's positioning objectives. The target audience is well-researched, with consumer insights informing both the creative direction and channel strategy.`);
      setLoadingAI(false);
    }, 1500);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Forms & Templates</h1>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'templates' ? 'active' : ''}`} onClick={() => { setTab('templates'); setTemplateView('grid'); }}>Templates</button>
        <button className={`tab ${tab === 'forms' ? 'active' : ''}`} onClick={() => setTab('forms')}>Form Builder</button>
      </div>

      {/* ── FORMS tab ── */}
      {tab === 'forms' && (
        <div>
          <div style={{ marginBottom: 20, fontSize: 14, color: '#6b7280' }}>
            Build your contact form by dragging and reordering fields. Toggle required fields and preview changes live.
          </div>
          <FormBuilder fields={fields} setFields={setFields} />
        </div>
      )}

      {/* ── TEMPLATES tab: grid ── */}
      {tab === 'templates' && templateView === 'grid' && (
        <div>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
            Use templates to streamline your creative briefs, proposals, and client communications.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>

            {/* AI Brief Builder — PROMINENT */}
            <button
              onClick={() => setTemplateView('ai-brief')}
              style={{
                background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)',
                border: '1.5px solid #ddd6fe',
                borderRadius: 14, padding: 24, cursor: 'pointer', textAlign: 'left',
                boxShadow: '0 1px 4px rgba(139,92,246,0.08)',
                transition: 'all 0.15s', gridColumn: '1 / -1',
                display: 'flex', alignItems: 'center', gap: 24,
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(139,92,246,0.15)'; e.currentTarget.style.borderColor = '#8b5cf6'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(139,92,246,0.08)'; e.currentTarget.style.borderColor = '#ddd6fe'; }}
            >
              <div style={{
                width: 56, height: 56, background: '#ede9fe', borderRadius: 14, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={26} color="#8b5cf6" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a' }}>AI Brief Builder</div>
                  <span style={{ background: '#8b5cf6', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>AI</span>
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5, marginBottom: 10 }}>
                  Upload or paste a client brief, email, or PDF screenshot. Flint AI generates a structured reverse brief and a tailored clarification email with targeted questions — ready to export or send.
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['PDF Upload', 'Image OCR', 'Paste Text', 'Export PDF', 'Export Word'].map(t => (
                    <span key={t} style={{ background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: 6, fontSize: 11 }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{
                padding: '10px 18px', borderRadius: 10, background: '#8b5cf6', color: '#fff',
                fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                Try now →
              </div>
            </button>

            {/* Creative Brief */}
            <button
              onClick={() => setTemplateView('brief')}
              style={{
                background: '#fff', border: '1px solid #e5e0d8', borderRadius: 12, padding: 24,
                cursor: 'pointer', textAlign: 'left',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#f59e0b'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#e5e0d8'; }}
            >
              <div style={{ width: 44, height: 44, background: '#fef3c7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <FileText size={22} color="#f59e0b" />
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Creative Brief</div>
              <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5, marginBottom: 14 }}>
                Full creative brief with expandable sections for brand context, objectives, deliverables, and insights.
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['Brand', 'Strategy', 'Insights'].map(t => (
                  <span key={t} style={{ background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: 6, fontSize: 11 }}>{t}</span>
                ))}
              </div>
            </button>

            {/* More templates (placeholder) */}
            {['Proposal Template', 'Onboarding Checklist'].map(name => (
              <div key={name} style={{
                background: '#fff', border: '2px dashed #e5e0d8', borderRadius: 12, padding: 24,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: 160, color: '#9ca3af',
              }}>
                <FileText size={24} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 14, fontWeight: 500 }}>{name}</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Coming soon</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TEMPLATES tab: Creative Brief view ── */}
      {tab === 'templates' && templateView === 'brief' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <button className="btn btn-ghost" onClick={() => setTemplateView('grid')} style={{ padding: '6px 0' }}>
              ← Back to Templates
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Creative Brief</h2>
            <div style={{ flex: 1 }} />
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => window.print()}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={13} /> Export PDF
            </button>
            <button
              className="btn btn-primary"
              onClick={generateAI}
              disabled={loadingAI}
              style={{ opacity: loadingAI ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6 }}
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
              <p style={{ margin: 0 }}>{aiSummary}</p>
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
            <button className="btn btn-primary" onClick={() => window.print()}>
              <Download size={14} /> Export as PDF
            </button>
          </div>
        </div>
      )}

      {/* ── TEMPLATES tab: AI Brief Builder ── */}
      {tab === 'templates' && templateView === 'ai-brief' && (
        <AIBriefBuilder onBack={() => setTemplateView('grid')} />
      )}
    </div>
  );
}
