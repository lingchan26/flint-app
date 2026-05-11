import { useState, useEffect } from 'react';
import {
  Plus, MoreVertical, Calendar, Clock, Archive, Cpu, Trash2, X, FolderKanban, Loader
} from 'lucide-react';
import ProjectDetail from './ProjectDetail';
import { supabase } from '../../lib/supabase';

const STAGES = ['New', 'Discovery', 'Proposal', 'Contract Signed', 'Kick Off', 'Onboarding', 'Planning', 'Delivery', 'Completed'];
const SERVICE_TYPES = ['Advertising', 'Corporate', 'Marketing', 'Packaging', 'Photoshoot', 'Social Media', 'Print', 'Digital', 'Production', 'Visualisation', 'CGI', 'Motion', 'Others'];
const TIMEZONES = ['SGT (UTC+8)', 'AEST (UTC+10)', 'MYT (UTC+8)', 'ICT (UTC+7)', 'BST (UTC+1)', 'GMT (UTC+0)', 'EST (UTC-5)', 'PST (UTC-8)'];
const LEAD_SOURCES = ['Client Referral', 'Industry Referral', 'Google', 'Behance', 'LinkedIn', 'Personal Website', 'Facebook', 'Instagram', 'Unknown', 'Others'];

const STAGE_TAGS = {
  'New':             ['Hot Lead', 'Warm Lead', 'Cold Lead', 'Referred'],
  'Discovery':       ['Needs Follow-up', 'Met', 'Contacted', 'Ghosted'],
  'Proposal':        ['Sent', 'Viewed', 'Under Review', 'Revision Needed'],
  'Contract Signed': ['Active', 'On Hold', 'Urgent'],
  'Kick Off':        ['Active', 'Delayed', 'Rescheduled'],
  'Onboarding':      ['In Progress', 'Stalled', 'On Track'],
  'Planning':        ['In Review', 'Blocked', 'On Track'],
  'Delivery':        ['On Track', 'At Risk', 'Behind Schedule'],
  'Completed':       ['Repeat Potential', 'Great Experience', 'Closed'],
};

const stageColor = {
  'New': '#9ca3af', 'Discovery': '#3b82f6', 'Proposal': '#f59e0b',
  'Contract Signed': '#8b5cf6', 'Kick Off': '#f59e0b',
  'Onboarding': '#06b6d4', 'Planning': '#3b82f6',
  'Delivery': '#10b981', 'Completed': '#6b7280',
};
const stageBg = {
  'New': '#f3f4f6', 'Discovery': '#dbeafe', 'Proposal': '#fef3c7',
  'Contract Signed': '#ede9fe', 'Kick Off': '#fef3c7',
  'Onboarding': '#cffafe', 'Planning': '#dbeafe',
  'Delivery': '#d1fae5', 'Completed': '#f3f4f6',
};

const AMBER_TAGS = new Set(['Hot Lead', 'Active', 'On Track', 'Great Experience', 'Repeat Potential', 'Sent', 'Viewed', 'Met', 'Contacted', 'In Progress']);
const RED_TAGS = new Set(['Ghosted', 'At Risk', 'Behind Schedule', 'Rejected', 'Stalled', 'Blocked', 'Revision Needed']);

function getTagStyle(tag) {
  if (AMBER_TAGS.has(tag)) return { background: '#fef3c7', color: '#92400e' };
  if (RED_TAGS.has(tag)) return { background: '#fee2e2', color: '#991b1b' };
  return { background: '#f3f4f6', color: '#4b5563' };
}

// Map Supabase row → component shape
function rowToProject(row) {
  return {
    id: row.id,
    name: row.name,
    client: row.client || '',
    stage: row.stage || 'New',
    tags: row.tags || [],
    date: row.end_date || '',
    startDate: row.start_date || '',
    value: Number(row.value) || 0,
    hours: Number(row.hours_sold) || 0,
    serviceType: row.service_type || '',
    timezone: row.timezone || 'SGT (UTC+8)',
    leadSource: row.lead_source || '',
    description: row.description || '',
    notes: row.notes || '',
    archived: row.archived || false,
    riskLevel: row.risk_level || 10,
  };
}

const RISK_LEVELS = [
  { value: 10,  label: '10% — Initial interest', desc: 'Client connected, early conversation' },
  { value: 30,  label: '30% — Shared interest',  desc: 'Asked for portfolio/creds, no brief yet' },
  { value: 50,  label: '50% — Exploring',         desc: 'Brief shared, casual cost & timeline discussion' },
  { value: 70,  label: '70% — Shortlisted',       desc: 'Client shortlisting freelancers, formal proposal needed' },
  { value: 90,  label: '90% — Finalising',         desc: 'Freelancer selected, cost agreed verbally/by email' },
  { value: 100, label: '100% — Confirmed',         desc: 'PO sent / contract signed' },
];

const emptyNewProject = {
  name: '', assignContacts: [], stage: 'New', serviceType: '', serviceTypeOther: '',
  startDate: '', endDate: '', timezone: 'SGT (UTC+8)', leadSource: '', leadSourceOther: '',
  notes: '', tags: [], riskLevel: 10,
};

function TagPill({ tag, onClick }) {
  const style = getTagStyle(tag);
  return (
    <button
      className="pill"
      style={{ ...style, marginRight: 4, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer' }}
      onClick={onClick}
    >
      {tag}
    </button>
  );
}

function StageDropdown({ stage, onSelect, onClose }) {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 48 }} onClick={onClose} />
      <div className="dropdown-menu" style={{ position: 'absolute', top: 32, left: 0, zIndex: 49, minWidth: 200 }}>
        {STAGES.map(s => (
          <button
            key={s}
            className="dropdown-item"
            onClick={() => { onSelect(s); onClose(); }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: stageColor[s], flexShrink: 0, display: 'inline-block',
            }} />
            {s}
          </button>
        ))}
      </div>
    </>
  );
}

function NewProjectPanel({ onClose, onSave, existingContacts }) {
  const [form, setForm] = useState(emptyNewProject);
  const [contactSearch, setContactSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);

  const filteredContacts = contactSearch
    ? existingContacts.filter(c => c.toLowerCase().includes(contactSearch.toLowerCase()) && !form.assignContacts.includes(c))
    : [];

  const addContact = (name) => {
    setForm(f => ({ ...f, assignContacts: [...f.assignContacts, name] }));
    setContactSearch('');
    setShowSuggestions(false);
  };

  const removeContact = (name) => {
    setForm(f => ({ ...f, assignContacts: f.assignContacts.filter(c => c !== name) }));
  };

  const save = async () => {
    if (!form.name) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="slide-panel slide-panel-wide">
        <div className="slide-panel-header">
          <span className="slide-panel-title">New Project</span>
          <button className="close-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="slide-panel-body">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Brand Refresh – Acme Corp" />
          </div>

          <div className="form-group">
            <label className="form-label">Client</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
              {form.assignContacts.map(c => (
                <span key={c} style={{
                  background: '#fef3c7', color: '#92400e',
                  padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  {c}
                  <button onClick={() => removeContact(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', padding: 0, display: 'flex' }}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                value={contactSearch}
                onChange={e => { setContactSearch(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search contacts…"
              />
              {showSuggestions && contactSearch && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                  background: '#fff', border: '1px solid var(--border)', borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden',
                }}>
                  {filteredContacts.map(c => (
                    <button key={c} onClick={() => addContact(c)} style={{
                      display: 'block', width: '100%', padding: '9px 12px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      textAlign: 'left', fontSize: 13,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--slate-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      {c}
                    </button>
                  ))}
                  <button onClick={() => addContact(contactSearch)} style={{
                    display: 'block', width: '100%', padding: '9px 12px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left', fontSize: 13, color: 'var(--amber)', fontWeight: 500,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--amber-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    ➕ Add "{contactSearch}"
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Service Type</label>
            <select className="form-select" value={form.serviceType} onChange={e => setForm(f => ({ ...f, serviceType: e.target.value, serviceTypeOther: '' }))}>
              <option value="">Select service type…</option>
              {SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}
            </select>
            {form.serviceType === 'Others' && (
              <input
                className="form-input"
                style={{ marginTop: 8 }}
                value={form.serviceTypeOther}
                onChange={e => setForm(f => ({ ...f, serviceTypeOther: e.target.value }))}
                placeholder="Describe the service type…"
                autoFocus
              />
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input className="form-input" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input className="form-input" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Timezone</label>
            <select className="form-select" value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}>
              {TIMEZONES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Stage</label>
            <select className="form-select" value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Lead Source</label>
            <select className="form-select" value={form.leadSource} onChange={e => setForm(f => ({ ...f, leadSource: e.target.value, leadSourceOther: '' }))}>
              <option value="">Select lead source…</option>
              {LEAD_SOURCES.map(l => <option key={l}>{l}</option>)}
            </select>
            {form.leadSource === 'Others' && (
              <input
                className="form-input"
                style={{ marginTop: 8 }}
                value={form.leadSourceOther}
                onChange={e => setForm(f => ({ ...f, leadSourceOther: e.target.value }))}
                placeholder="Describe where this lead came from…"
              />
            )}
          </div>

          {/* Risk Level */}
          <div className="form-group">
            <label className="form-label">Win Probability</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {RISK_LEVELS.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, riskLevel: r.value }))}
                  style={{
                    padding: '5px 12px', borderRadius: 20, border: '1.5px solid',
                    borderColor: form.riskLevel === r.value ? (r.value >= 70 ? '#10b981' : r.value >= 50 ? '#f59e0b' : '#6b7280') : 'var(--border)',
                    background: form.riskLevel === r.value ? (r.value >= 70 ? '#d1fae5' : r.value >= 50 ? '#fef3c7' : '#f3f4f6') : '#fff',
                    color: form.riskLevel === r.value ? (r.value >= 70 ? '#065f46' : r.value >= 50 ? '#92400e' : '#374151') : 'var(--slate-500)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
                  }}
                >
                  {r.value}%
                </button>
              ))}
            </div>
            {form.riskLevel && (
              <div style={{
                background: 'var(--slate-50)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--slate-600)',
              }}>
                {RISK_LEVELS.find(r => r.value === form.riskLevel)?.desc}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes about this project…" style={{ minHeight: 100 }} />
          </div>
        </div>
        <div className="slide-panel-footer" style={{ justifyContent: 'stretch' }}>
          <button className="btn btn-primary" onClick={save} disabled={saving} style={{ width: '100%', justifyContent: 'center', fontSize: 15 }}>
            {saving ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Creating…</> : 'Create Project'}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const [openStage, setOpenStage] = useState(null);
  const [openTag, setOpenTag] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [contactNames, setContactNames] = useState([]);

  useEffect(() => {
    fetchProjects();
    fetchContactNames();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('archived', false)
      .order('created_at', { ascending: false });

    if (!error && data) setProjects(data.map(rowToProject));
    setLoading(false);
  }

  async function fetchContactNames() {
    const { data } = await supabase.from('contacts').select('name').eq('archived', false).order('name');
    if (data) setContactNames(data.map(c => c.name));
  }

  async function updateStage(id, stage) {
    setProjects(p => p.map(pr => pr.id === id ? { ...pr, stage, tags: [] } : pr));
    await supabase.from('projects').update({ stage, tags: [] }).eq('id', id);
    setOpenStage(null);
  }

  async function deleteProject(id) {
    setProjects(p => p.filter(pr => pr.id !== id));
    await supabase.from('projects').delete().eq('id', id);
    setOpenMenu(null);
  }

  async function archiveProject(id) {
    setProjects(p => p.filter(pr => pr.id !== id));
    await supabase.from('projects').update({ archived: true }).eq('id', id);
    setOpenMenu(null);
  }

  async function toggleTag(id, tag) {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    const tags = project.tags.includes(tag)
      ? project.tags.filter(t => t !== tag)
      : [...project.tags, tag];
    setProjects(p => p.map(pr => pr.id === id ? { ...pr, tags } : pr));
    await supabase.from('projects').update({ tags }).eq('id', id);
    setOpenTag(null);
  }

  async function saveNew(form) {
    const { data: { user } } = await supabase.auth.getUser();
    const insert = {
      user_id: user.id,
      name: form.name,
      client: form.assignContacts.join(', ') || null,
      service_type: (form.serviceType === 'Others' ? form.serviceTypeOther : form.serviceType) || null,
      stage: form.stage,
      start_date: form.startDate || null,
      end_date: form.endDate || null,
      timezone: form.timezone,
      lead_source: (form.leadSource === 'Others' ? form.leadSourceOther : form.leadSource) || null,
      notes: form.notes || null,
      tags: [],
      value: 0,
      hours_sold: 0,
      risk_level: form.riskLevel || 10,
    };
    const { data, error } = await supabase.from('projects').insert(insert).select().single();
    if (!error && data) {
      setProjects(p => [rowToProject(data), ...p]);
    }
  }

  if (selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
        onUpdate={(updated) => {
          setProjects(p => p.map(pr => pr.id === updated.id ? updated : pr));
          setSelectedProject(updated);
        }}
      />
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 12, color: 'var(--slate-400)' }}>
          <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading projects…
        </div>
      ) : projects.length === 0 ? (
        <div className="table-container">
          <div className="empty-state">
            <div className="empty-state-icon"><FolderKanban size={48} /></div>
            <h3>No projects yet — let's change that</h3>
            <p>Create your first project to start tracking clients and deliverables.</p>
            <button className="btn btn-primary" onClick={() => setShowNew(true)}>
              <Plus size={16} /> New Project
            </button>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Project Name</th>
                <th>Stage</th>
                <th>Tags</th>
                <th>Client</th>
                <th>Due Date</th>
                <th>Value</th>
                <th>Hrs Sold</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => {
                const stageTags = STAGE_TAGS[p.stage] || [];
                return (
                  <tr key={p.id}>
                    {/* Three-dot menu */}
                    <td style={{ position: 'relative' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '4px 6px' }}
                        onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === p.id ? null : p.id); }}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenu === p.id && (
                        <>
                          <div style={{ position: 'fixed', inset: 0, zIndex: 48 }} onClick={() => setOpenMenu(null)} />
                          <div className="dropdown-menu" style={{ position: 'absolute', top: 32, left: 0, zIndex: 49 }}>
                            <button className="dropdown-item" onClick={() => setOpenMenu(null)}>
                              <Calendar size={14} /> Calendar
                            </button>
                            <button className="dropdown-item" onClick={() => setOpenMenu(null)}>
                              <Clock size={14} /> Reschedule
                            </button>
                            <button className="dropdown-item" onClick={() => archiveProject(p.id)}>
                              <Archive size={14} /> Archive
                            </button>
                            <button className="dropdown-item" onClick={() => setOpenMenu(null)}>
                              <Cpu size={14} /> AI Summary
                            </button>
                            <button className="dropdown-item danger" onClick={() => deleteProject(p.id)}>
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </td>

                    {/* Project Name */}
                    <td>
                      <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 500, color: 'var(--slate-900)', fontSize: 14, padding: 0 }}
                        onClick={() => setSelectedProject(p)}
                      >
                        {p.name}
                      </button>
                    </td>

                    {/* Stage dropdown pill */}
                    <td style={{ position: 'relative' }}>
                      <button
                        className="pill"
                        style={{
                          background: stageBg[p.stage] || '#f3f4f6',
                          color: stageColor[p.stage] || '#6b7280',
                        }}
                        onClick={e => { e.stopPropagation(); setOpenStage(openStage === p.id ? null : p.id); }}
                      >
                        {p.stage}
                      </button>
                      {openStage === p.id && (
                        <StageDropdown
                          stage={p.stage}
                          onSelect={s => updateStage(p.id, s)}
                          onClose={() => setOpenStage(null)}
                        />
                      )}
                    </td>

                    {/* Tags */}
                    <td style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {p.tags.map(t => (
                          <TagPill key={t} tag={t} onClick={e => { e.stopPropagation(); toggleTag(p.id, t); }} />
                        ))}
                        <button
                          className="pill pill-grey"
                          style={{ fontSize: 11, padding: '2px 8px' }}
                          onClick={e => { e.stopPropagation(); setOpenTag(openTag === p.id ? null : p.id); }}
                        >
                          +
                        </button>
                      </div>
                      {openTag === p.id && (
                        <>
                          <div style={{ position: 'fixed', inset: 0, zIndex: 48 }} onClick={() => setOpenTag(null)} />
                          <div className="dropdown-menu" style={{ position: 'absolute', top: 32, left: 0, zIndex: 49, minWidth: 160 }}>
                            {stageTags.map(t => (
                              <button key={t} className="dropdown-item" onClick={() => toggleTag(p.id, t)}>
                                <span style={{
                                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                  background: AMBER_TAGS.has(t) ? '#f59e0b' : RED_TAGS.has(t) ? '#ef4444' : '#9ca3af',
                                  display: 'inline-block',
                                }} />
                                {p.tags.includes(t) ? '✓ ' : ''}{t}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </td>

                    <td style={{ color: 'var(--slate-500)' }}>{p.client}</td>
                    <td style={{ color: 'var(--slate-500)', fontSize: 13 }}>
                      {p.date ? new Date(p.date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {p.value > 0 ? `S$${Number(p.value).toLocaleString()}` : '—'}
                    </td>
                    <td style={{ color: 'var(--slate-500)', fontSize: 13 }}>{p.hours > 0 ? `${p.hours}h` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showNew && (
        <NewProjectPanel
          onClose={() => setShowNew(false)}
          onSave={saveNew}
          existingContacts={contactNames}
        />
      )}
      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </div>
  );
}
