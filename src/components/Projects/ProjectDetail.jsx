import { useState, useRef } from 'react';
import { ArrowLeft, Cpu, Paperclip, Upload, ChevronDown, ChevronUp, X, CheckCircle } from 'lucide-react';

const QUESTIONS = [
  'What does success look like for this project?',
  'Who is the target audience?',
  'Are there existing brand guidelines?',
  'What is the timeline and key milestones?',
  'Who are the key stakeholders and decision makers?',
  'What is the budget range?',
  'What are the key deliverable formats and channels?',
  'Are there any creative restrictions or mandatories?',
];

const AI_SUMMARY = `This project focuses on a comprehensive creative engagement with the client. Based on the provided context, the scope covers brand development, strategic positioning, and execution across key deliverable formats. The client is in a growth phase, targeting a broad yet defined audience, with an emphasis on visual consistency and market differentiation. Key milestones include a discovery workshop, concept presentation, and final delivery. Budget and timeline are aligned to support a full-cycle creative output with room for two rounds of revisions.`;

export default function ProjectDetail({ project, onBack, onUpdate }) {
  const [desc, setDesc] = useState(project.description || '');
  const [attachments, setAttachments] = useState([
    { name: 'Creative Brief v1.pdf', size: '2.4 MB', date: '28 Mar 2026' },
    { name: 'Brand Guidelines.zip', size: '14.8 MB', date: '30 Mar 2026' },
  ]);
  const [aiSummary, setAiSummary] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [showFillPrompt, setShowFillPrompt] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const [toast, setToast] = useState('');
  const fileRef = useRef();

  const generateAI = () => {
    setLoadingAI(true);
    setTimeout(() => {
      setAiSummary(AI_SUMMARY);
      setLoadingAI(false);
      setShowFillPrompt(true);
    }, 1500);
  };

  const fillDescription = () => {
    setDesc(AI_SUMMARY);
    setShowFillPrompt(false);
    onUpdate({ ...project, description: AI_SUMMARY });
    showToast('Description updated with AI summary.');
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(f => {
      setAttachments(a => [...a, {
        name: f.name,
        size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      }]);
    });
  };

  const saveDesc = () => {
    onUpdate({ ...project, description: desc });
    showToast('Description saved.');
  };

  return (
    <div className="page-content">
      {/* Back */}
      <button className="btn btn-ghost" style={{ marginBottom: 16, padding: '6px 0' }} onClick={onBack}>
        <ArrowLeft size={16} /> Back to Projects
      </button>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">{project.name}</h1>
          <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            {project.client} · {project.stage} · S${Number(project.value).toLocaleString()}
          </div>
        </div>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        {/* Left Column */}
        <div>
          {/* AI Summary */}
          {aiSummary && (
            <div className="card" style={{ marginBottom: 20, background: '#fffbeb', border: '1px solid #fde68a' }}>
              <div className="card-header" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14 }}>
                  <Cpu size={16} color="#f59e0b" /> AI Summary
                </div>
                <button className="close-btn" onClick={() => { setAiSummary(''); setShowFillPrompt(false); }}>
                  <X size={14} />
                </button>
              </div>
              <p style={{ fontSize: 13, color: '#1a1a1a', lineHeight: 1.6 }}>{aiSummary}</p>
              {showFillPrompt && (
                <div style={{ marginTop: 12, padding: '10px 12px', background: '#fff', borderRadius: 8, border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>Auto-fill Description with this summary?</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowFillPrompt(false)}>Skip</button>
                    <button className="btn btn-primary btn-sm" onClick={fillDescription}>Yes, fill it</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <div className="card-title">Description</div>
              <button className="btn btn-primary btn-sm" onClick={saveDesc}>Save</button>
            </div>
            <textarea
              className="form-textarea"
              style={{ minHeight: 140, fontSize: 14 }}
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Add a project description, brief, or notes…"
            />
          </div>

          {/* Recommended Questions */}
          <div className="card" style={{ marginBottom: 20 }}>
            <button
              style={{
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0,
              }}
              onClick={() => setShowQuestions(s => !s)}
            >
              <div className="card-title">Recommended Questions to Ask the Client</div>
              {showQuestions ? <ChevronUp size={18} color="#9ca3af" /> : <ChevronDown size={18} color="#9ca3af" />}
            </button>
            {showQuestions && (
              <div style={{ marginTop: 16 }}>
                {QUESTIONS.map((q, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    padding: '10px 0',
                    borderBottom: i < QUESTIONS.length - 1 ? '1px solid #f0ece4' : 'none',
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', background: '#fef3c7',
                      color: '#92400e', fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      marginTop: 1,
                    }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 13, color: '#1a1a1a', lineHeight: 1.5 }}>{q}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Project Info */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 16 }}>Project Info</div>
            <div className="info-row"><span className="info-label">Client</span><span className="info-value">{project.client}</span></div>
            <div className="info-row"><span className="info-label">Stage</span><span className="info-value">{project.stage}</span></div>
            <div className="info-row"><span className="info-label">Value</span><span className="info-value">S${Number(project.value).toLocaleString()}</span></div>
            <div className="info-row"><span className="info-label">Due Date</span><span className="info-value">{project.date}</span></div>
            <div className="info-row">
              <span className="info-label">Tags</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {project.tags.map(t => (
                  <span key={t} className={`pill ${t === 'Warm' ? 'pill-amber' : t === 'Cold' ? 'pill-grey' : 'pill-red'}`} style={{ cursor: 'default' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Attachments</div>
              <button className="btn btn-primary btn-sm" onClick={() => fileRef.current.click()}>
                <Upload size={14} /> Upload
              </button>
              <input ref={fileRef} type="file" multiple style={{ display: 'none' }} onChange={handleUpload} />
            </div>

            {attachments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#9ca3af', fontSize: 13 }}>
                No attachments yet
              </div>
            ) : (
              <div>
                {attachments.map((a, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 0',
                    borderBottom: i < attachments.length - 1 ? '1px solid #f0ece4' : 'none',
                  }}>
                    <Paperclip size={14} color="#9ca3af" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{a.size} · {a.date}</div>
                    </div>
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                      onClick={() => setAttachments(att => att.filter((_, idx) => idx !== i))}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast">
          <CheckCircle size={16} color="#10b981" />
          {toast}
        </div>
      )}
    </div>
  );
}
