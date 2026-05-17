import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Cpu, Paperclip, Upload, ChevronDown, ChevronUp, X,
  CheckCircle, AlertCircle, Loader, Download, Sparkles, FileText,
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

const EXTRACTABLE_FIELDS = [
  { key: 'project_name', label: 'Project name',  projectKey: 'name' },
  { key: 'client',       label: 'Client',         projectKey: 'client' },
  { key: 'service_type', label: 'Service type',  projectKey: 'service_type' },
  { key: 'value',        label: 'Project value', projectKey: 'value',      format: (v) => v ? `S$${Number(v).toLocaleString()}` : '' },
  { key: 'start_date',   label: 'Start date',    projectKey: 'start_date' },
  { key: 'end_date',     label: 'Due date',      projectKey: 'end_date' },
  { key: 'description',  label: 'Description',    projectKey: 'description', long: true },
  { key: 'notes',        label: 'Notes',          projectKey: 'notes',       long: true },
];

const CONFIDENCE_STYLES = {
  high:   { bg: '#d1fae5', color: '#065f46', label: 'High confidence' },
  medium: { bg: '#fef3c7', color: '#92400e', label: 'Medium confidence' },
  low:    { bg: '#fee2e2', color: '#991b1b', label: 'Low confidence — please verify' },
};

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
  // Editable fields — live copies of the project so the user can edit before saving
  const [name, setName] = useState(project.name || '');
  const [client, setClient] = useState(project.client || '');
  const [serviceType, setServiceType] = useState(project.service_type || '');
  const [value, setValue] = useState(project.value || '');
  const [startDate, setStartDate] = useState(project.start_date || '');
  const [endDate, setEndDate] = useState(project.end_date || project.date || '');
  const [desc, setDesc] = useState(project.description || '');
  const [notes, setNotes] = useState(project.notes || '');

  // Attachments
  const [attachments, setAttachments] = useState([]);
  const [loadingAttachments, setLoadingAttachments] = useState(true);
  const [uploading, setUploading] = useState(false);

  // AI brief paste + extraction
  const [briefText, setBriefText] = useState('');
  const [showBriefPanel, setShowBriefPanel] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractResult, setExtractResult] = useState(null); // { project_name, client, ..., confidence }
  const [selectedFields, setSelectedFields] = useState({});  // { project_name: true, client: false, ... }
  const [replaceExisting, setReplaceExisting] = useState(false);

  // Description-only AI summary (the original feature)
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Save state
  const [savingFields, setSavingFields] = useState(false);
  const [dirty, setDirty] = useState(false);

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

  // Mark dirty whenever any editable field changes from the original
  useEffect(() => {
    const changed =
      name !== (project.name || '') ||
      client !== (project.client || '') ||
      serviceType !== (project.service_type || '') ||
      String(value) !== String(project.value || '') ||
      startDate !== (project.start_date || '') ||
      endDate !== (project.end_date || project.date || '') ||
      desc !== (project.description || '') ||
      notes !== (project.notes || '');
    setDirty(changed);
  }, [name, client, serviceType, value, startDate, endDate, desc, notes, project]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  /* ─── persist all editable fields to Supabase ──────────────── */
  async function saveAllFields() {
    setSavingFields(true);
    setError(null);
    try {
      const payload = {
        name: name.trim() || project.name,
        client: client.trim() || null,
        service_type: serviceType.trim() || null,
        value: value === '' ? null : Number(value),
        start_date: startDate || null,
        end_date: endDate || null,
        description: desc.trim() || null,
        notes: notes.trim() || null,
      };
      const { data, error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', project.id)
        .select()
        .single();
      if (error) throw error;
      onUpdate({ ...project, ...data });
      setDirty(false);
      showToast('Project saved.');
    } catch (e) {
      setError(e.message || 'Could not save project');
    } finally {
      setSavingFields(false);
    }
  }

  /* ─── AI: extract structured fields from a pasted brief ──── */
  async function runExtract() {
    if (!briefText.trim()) {
      setError('Paste a brief first — there\'s nothing for the AI to read.');
      return;
    }
    setExtracting(true);
    setError(null);
    setExtractResult(null);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'extract', text: briefText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI request failed');
      setExtractResult(data);

      // Pre-select fields that the AI returned a non-null value for
      const initialSelection = {};
      EXTRACTABLE_FIELDS.forEach(f => {
        const v = data[f.key];
        if (v !== null && v !== undefined && v !== '') {
          initialSelection[f.key] = true;
        }
      });
      setSelectedFields(initialSelection);
    } catch (e) {
      setError(e.message || 'Could not extract fields from brief');
    } finally {
      setExtracting(false);
    }
  }

  /* ─── Apply extracted fields into the form ─────────────────── */
  function applyExtracted() {
    if (!extractResult) return;
    const setters = {
      project_name: setName,
      client: setClient,
      service_type: setServiceType,
      value: setValue,
      start_date: setStartDate,
      end_date: setEndDate,
      description: setDesc,
      notes: setNotes,
    };
    const currentValues = {
      project_name: name,
      client: client,
      service_type: serviceType,
      value: String(value || ''),
      start_date: startDate,
      end_date: endDate,
      description: desc,
      notes: notes,
    };

    let applied = 0;
    EXTRACTABLE_FIELDS.forEach(f => {
      if (!selectedFields[f.key]) return;
      const newVal = extractResult[f.key];
      if (newVal === null || newVal === undefined || newVal === '') return;

      // Only fill blanks by default; replace existing if toggle is on
      if (!replaceExisting && currentValues[f.key]) return;

      setters[f.key](f.key === 'value' ? String(newVal) : newVal);
      applied++;
    });

    setExtractResult(null);
    setSelectedFields({});
    setShowBriefPanel(false);
    setBriefText('');
    showToast(applied === 0
      ? 'No fields applied — toggle "Replace existing" if you want to overwrite.'
      : `Applied ${applied} field${applied === 1 ? '' : 's'}. Click "Save project" to persist.`);
  }

  /* ─── Lighter AI: just summarise the description ─────────── */
  async function generateSummary() {
    const parts = [];
    if (name) parts.push(`Project name: ${name}`);
    if (client) parts.push(`Client: ${client}`);
    if (serviceType) parts.push(`Service type: ${serviceType}`);
    if (value) parts.push(`Project value: S$${Number(value).toLocaleString()}`);
    if (startDate) parts.push(`Start date: ${startDate}`);
    if (endDate) parts.push(`Due date: ${endDate}`);
    if (project.stage) parts.push(`Stage: ${project.stage}`);
    if (project.tags?.length) parts.push(`Tags: ${project.tags.join(', ')}`);
    if (desc?.trim()) parts.push(`\nDescription:\n${desc.trim()}`);
    if (notes?.trim()) parts.push(`\nNotes:\n${notes.trim()}`);
    if (attachments.length > 0) {
      parts.push(`\nAttachments: ${attachments.map(a => a.filename).join(', ')}`);
    }
    const sourceText = parts.join('\n');

    if (!desc?.trim() && !notes?.trim()) {
      setError('Add a description or notes first — the AI needs some written context.');
      return;
    }
    setLoadingSummary(true);
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
    } catch (e) {
      setError(e.message || 'Could not generate summary');
    } finally {
      setLoadingSummary(false);
    }
  }

  /* ─── upload / download / delete attachments ────────────── */
  async function handleUpload(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      for (const f of files) {
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

  // Button state helpers
  const canSummarise = (desc?.trim() || notes?.trim()) && !loadingSummary;
  const canExtract = briefText.trim().length > 30 && !extracting;

  return (
    <div className="page-content">
      <button className="btn btn-ghost" style={{ marginBottom: 16, padding: '6px 0' }} onClick={onBack}>
        <ArrowLeft size={16} /> Back to Projects
      </button>

      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">{name || 'Untitled project'}</h1>
          <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            {client || 'No client'} · {project.stage}
            {value ? ` · S$${Number(value).toLocaleString()}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowBriefPanel(s => !s)}
            disabled={extracting}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 9,
              background: showBriefPanel ? '#1a1a1a' : '#ede9fe',
              color: showBriefPanel ? '#fff' : '#5b21b6',
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            }}
          >
            <Sparkles size={14} />
            {showBriefPanel ? 'Close brief panel' : 'AI: extract from brief'}
          </button>
          <button
            className="btn btn-primary"
            onClick={saveAllFields}
            disabled={!dirty || savingFields}
            style={{
              opacity: dirty ? 1 : 0.4,
              cursor: dirty ? 'pointer' : 'not-allowed',
            }}
          >
            {savingFields ? <><Loader size={14} className="spin" /> Saving…</> : dirty ? 'Save project' : 'Saved'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 10, padding: 14, marginBottom: 16,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <AlertCircle size={18} color="#991b1b" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1, fontSize: 13, color: '#7f1d1d' }}>{error}</div>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7f1d1d' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* AI Brief Extraction Panel */}
      {showBriefPanel && (
        <div className="card" style={{ marginBottom: 20, background: '#faf5ff', border: '1px solid #ddd6fe' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Sparkles size={16} color="#8b5cf6" />
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>Extract project fields from a brief</div>
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 14, lineHeight: 1.5 }}>
            Paste a client email, brief, or rough notes below. The AI will read it and propose values
            for your project fields — you review and approve before anything is saved.
          </div>
          <textarea
            className="form-textarea"
            value={briefText}
            onChange={e => setBriefText(e.target.value)}
            placeholder="Paste the brief here — client email, scope document, anything in plain text. Minimum 30 characters."
            style={{ minHeight: 160, marginBottom: 12 }}
            disabled={extracting}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={replaceExisting}
                onChange={e => setReplaceExisting(e.target.checked)}
                style={{ accentColor: '#8b5cf6' }}
              />
              Replace existing values (otherwise only blank fields get filled)
            </label>
            <button
              onClick={runExtract}
              disabled={!canExtract}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 9,
                background: canExtract ? '#8b5cf6' : '#e5e0d8',
                color: canExtract ? '#fff' : '#9ca3af',
                border: 'none', cursor: canExtract ? 'pointer' : 'not-allowed',
                fontSize: 14, fontWeight: 600,
              }}
            >
              {extracting ? <><Loader size={14} className="spin" /> Reading brief…</> : <><Sparkles size={14} /> Extract fields</>}
            </button>
          </div>

          {/* Extracted-fields review */}
          {extractResult && (
            <div style={{ marginTop: 18, padding: 16, background: '#fff', borderRadius: 10, border: '1px solid #ddd6fe' }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Review extracted values</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 14 }}>
                Untick anything you don't want to apply. Empty fields aren't shown.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {EXTRACTABLE_FIELDS.map(f => {
                  const val = extractResult[f.key];
                  if (val === null || val === undefined || val === '') return null;
                  const conf = extractResult.confidence?.[f.key];
                  const confStyle = CONFIDENCE_STYLES[conf];
                  const display = f.format ? f.format(val) : String(val);
                  return (
                    <label
                      key={f.key}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        padding: 10, background: '#faf8f4', borderRadius: 8,
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!selectedFields[f.key]}
                        onChange={e => setSelectedFields(s => ({ ...s, [f.key]: e.target.checked }))}
                        style={{ accentColor: '#8b5cf6', marginTop: 3, flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>{f.label}</span>
                          {confStyle && (
                            <span style={{
                              fontSize: 10, fontWeight: 700,
                              padding: '2px 7px', borderRadius: 20,
                              background: confStyle.bg, color: confStyle.color,
                            }}>
                              {confStyle.label}
                            </span>
                          )}
                        </div>
                        <div style={{
                          fontSize: 13, color: '#1a1a1a',
                          wordBreak: 'break-word', whiteSpace: f.long ? 'pre-wrap' : 'normal',
                        }}>
                          {display}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
                <button
                  onClick={() => { setExtractResult(null); setSelectedFields({}); }}
                  className="btn btn-secondary btn-sm"
                >
                  Discard
                </button>
                <button
                  onClick={applyExtracted}
                  className="btn btn-primary btn-sm"
                  disabled={Object.values(selectedFields).every(v => !v)}
                  style={{
                    opacity: Object.values(selectedFields).some(v => v) ? 1 : 0.4,
                  }}
                >
                  Apply selected to project
                </button>
              </div>
            </div>
          )}
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
                <button className="close-btn" onClick={() => setAiSummary('')}>
                  <X size={14} />
                </button>
              </div>
              <p style={{ fontSize: 13, color: '#1a1a1a', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>{aiSummary}</p>
            </div>
          )}

          {/* Editable name + client row */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Project name</label>
                <input
                  className="form-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Project name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Client</label>
                <input
                  className="form-input"
                  value={client}
                  onChange={e => setClient(e.target.value)}
                  placeholder="Client name or company"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Service type</label>
                <input
                  className="form-input"
                  value={serviceType}
                  onChange={e => setServiceType(e.target.value)}
                  placeholder="e.g. Branding"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Value (SGD)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start date</label>
                <input
                  className="form-input"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Due date</label>
                <input
                  className="form-input"
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <div className="card-title">Description</div>
              <button
                onClick={generateSummary}
                disabled={!canSummarise}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 7,
                  background: canSummarise ? '#f59e0b' : '#f3f4f6',
                  color: canSummarise ? '#fff' : '#9ca3af',
                  border: 'none', cursor: canSummarise ? 'pointer' : 'not-allowed',
                  fontSize: 12, fontWeight: 600,
                }}
              >
                {loadingSummary ? <><Loader size={12} className="spin" /> Generating…</> : <><Cpu size={12} /> AI summarise</>}
              </button>
            </div>
            <textarea
              className="form-textarea"
              style={{ minHeight: 140, fontSize: 14 }}
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Add a project description, brief, or notes. Use 'AI: extract from brief' above if you have a client brief to paste in."
            />
          </div>

          {/* Notes */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 12 }}>Notes</div>
            <textarea
              className="form-textarea"
              style={{ minHeight: 100, fontSize: 13 }}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Private notes — risks, stakeholder concerns, things to watch out for."
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
            <div className="info-row"><span className="info-label">Stage</span><span className="info-value">{project.stage}</span></div>
            <div className="info-row"><span className="info-label">Win prob.</span><span className="info-value">{project.risk_level != null ? `${project.risk_level}%` : '—'}</span></div>
            {project.lead_source && (
              <div className="info-row"><span className="info-label">Lead source</span><span className="info-value">{project.lead_source}</span></div>
            )}
            {project.tags?.length > 0 && (
              <div className="info-row">
                <span className="info-label">Tags</span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {project.tags.map(t => (
                    <span key={t} className={`pill ${t === 'Warm' ? 'pill-amber' : t === 'Cold' ? 'pill-grey' : 'pill-red'}`} style={{ cursor: 'default' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0ece4' }}>
              Stage, tags, and win probability are set from the Projects list. Other fields are editable here.
            </div>
          </div>

          {/* Attachments */}
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
