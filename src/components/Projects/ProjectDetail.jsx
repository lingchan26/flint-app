import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Cpu, Paperclip, Upload, ChevronDown, ChevronUp, X,
  CheckCircle, AlertCircle, Loader, Download,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

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

const STORAGE_BUCKET = 'project-files';

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatShortDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ProjectDetail({ project, onBack, onUpdate }) {
  const [desc, setDesc] = useState(project.description || '');
  const [attachments, setAttachments] = useState([]);
  const [loadingAttachments, setLoadingAttachments] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [aiSummary, setAiSummary] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [showFillPrompt, setShowFillPrompt] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);

  const [toast, setToast] = useState('');
  const [error, setError] = useState(null);
  const fileRef = useRef();

  /* ─── load attachments ────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingAttachments(true);
      try {
        const { data, error } = await supabase
          .from('project_attachments')
          .select('*')
          .eq('project_id', project.id)
          .order('created_at', { ascending: false });
        if (cancelled) return;
        if (error) throw error;
        setAttachments(data || []);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load attachments');
      } finally {
        if (!cancelled) setLoadingAttachments(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [project.id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  /* ─── AI summary via Netlify Function ─────────────────────────── */
  async function generateAI() {
    const sourceText = desc?.trim();
    if (!sourceText) {
      setError('Add a description first — the AI needs something to summarise.');
      return;
    }
    setLoadingAI(true);
    setError(null);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'summary', text: sourceText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI request failed');
      setAiSummary(data.summary || '');
      setShowFillPrompt(true);
    } catch (e) {
      setError(e.message || 'Could not generate summary');
    } finally {
      setLoadingAI(false);
    }
  }

  const fillDescription = () => {
    setDesc(aiSummary);
    setShowFillPrompt(false);
    onUpdate({ ...project, description: aiSummary });
    showToast('Description updated with AI summary.');
  };

  const saveDesc = () => {
    onUpdate({ ...project, description: desc });
    showToast('Description saved.');
  };

  /* ─── upload to Supabase Storage ─────────────────────────────── */
  async function handleUpload(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      for (const f of files) {
        // 10 MB limit
        if (f.size > 10 * 1024 * 1024) {
          throw new Error(`"${f.name}" is too large (max 10 MB)`);
        }
        const ext = f.name.split('.').pop() || 'bin';
        const path = `${user.id}/${project.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, f, { contentType: f.type || 'application/octet-stream' });
        if (uploadErr) throw uploadErr;

        const { data: row, error: insertErr } = await supabase
          .from('project_attachments')
          .insert({
            user_id: user.id,
            project_id: project.id,
            storage_path: path,
            filename: f.name,
            size_bytes: f.size,
            mime_type: f.type || null,
          })
          .select()
          .single();
        if (insertErr) throw insertErr;

        setAttachments(a => [row, ...a]);
      }
      showToast(`Uploaded ${files.length} file${files.length === 1 ? '' : 's'}`);
    } catch (e) {
      setError(e.message || 'Could not upload file');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function deleteAttachment(att) {
    if (!confirm(`Delete "${att.filename}"?`)) return;
    try {
      // Best-effort: try to remove from storage, then from the table
      await supabase.storage.from(STORAGE_BUCKET).remove([att.storage_path]);
      const { error: dbErr } = await supabase
        .from('project_attachments')
        .delete()
        .eq('id', att.id);
      if (dbErr) throw dbErr;
      setAttachments(a => a.filter(x => x.id !== att.id));
      showToast('Attachment removed');
    } catch (e) {
      setError(e.message || 'Could not delete attachment');
    }
  }

  async function downloadAttachment(att) {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(att.storage_path, 60);
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (e) {
      setError(e.message || 'Could not get download link');
    }
  }

  return (
    <div className="page-content">
      <button className="btn btn-ghost" style={{ marginBottom: 16, padding: '6px 0' }} onClick={onBack}>
        <ArrowLeft size={16} /> Back to Projects
      </button>

      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">{project.name}</h1>
          <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            {project.client || 'No client'} · {project.stage}
            {project.value ? ` · S$${Number(project.value).toLocaleString()}` : ''}
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

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 10, padding: 14, marginBottom: 16,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <AlertCircle size={18} color="#991b1b" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1, fontSize: 13, color: '#7f1d1d' }}>{error}</div>
          <button
            onClick={() => setError(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7f1d1d' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        {/* Left Column */}
        <div>
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
              <p style={{ fontSize: 13, color: '#1a1a1a', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>{aiSummary}</p>
              {showFillPrompt && (
                <div style={{ marginTop: 12, padding: '10px 12px', background: '#fff', borderRadius: 8, border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>Replace Description with this summary?</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowFillPrompt(false)}>Skip</button>
                    <button className="btn btn-primary btn-sm" onClick={fillDescription}>Yes, replace</button>
                  </div>
                </div>
              )}
            </div>
          )}

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
              placeholder="Add a project description, brief, or notes. The 'AI Summary' button above will then summarise what you write here into a clean paragraph."
            />
          </div>

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
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 16 }}>Project Info</div>
            <div className="info-row"><span className="info-label">Client</span><span className="info-value">{project.client || '—'}</span></div>
            <div className="info-row"><span className="info-label">Stage</span><span className="info-value">{project.stage}</span></div>
            <div className="info-row"><span className="info-label">Value</span><span className="info-value">{project.value ? `S$${Number(project.value).toLocaleString()}` : '—'}</span></div>
            <div className="info-row"><span className="info-label">Due Date</span><span className="info-value">{project.date || project.end_date || '—'}</span></div>
            {project.tags?.length > 0 && (
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
            )}
          </div>

          {/* Attachments — real Supabase Storage */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Attachments</div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => fileRef.current.click()}
                disabled={uploading}
              >
                {uploading ? <Loader size={14} className="spin" /> : <Upload size={14} />}
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
              <input ref={fileRef} type="file" multiple style={{ display: 'none' }} onChange={handleUpload} />
            </div>

            {loadingAttachments ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#9ca3af' }}>
                <Loader size={18} className="spin" />
              </div>
            ) : attachments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#9ca3af', fontSize: 13 }}>
                No attachments yet. Drop briefs, mood boards, or anything else here.
              </div>
            ) : (
              <div>
                {attachments.map((a, i) => (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 0',
                    borderBottom: i < attachments.length - 1 ? '1px solid #f0ece4' : 'none',
                  }}>
                    <Paperclip size={14} color="#9ca3af" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.filename}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>
                        {formatSize(a.size_bytes)} · {formatShortDate(a.created_at)}
                      </div>
                    </div>
                    <button
                      title="Download"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}
                      onClick={() => downloadAttachment(a)}
                    >
                      <Download size={13} />
                    </button>
                    <button
                      title="Delete"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}
                      onClick={() => deleteAttachment(a)}
                    >
                      <X size={13} />
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

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
