import { useState } from 'react';
import {
  Plus, MoreVertical, Calendar, Clock, Archive, Cpu, Trash2, X, FolderKanban
} from 'lucide-react';
import ProjectDetail from './ProjectDetail';

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

const initialProjects = [
  { id: 1, name: 'Brand Refresh – Lumen Co', client: 'Lumen Co', stage: 'Delivery', tags: ['On Track'], date: '10 Apr 2026', value: 8500, hours: 24, description: '' },
  { id: 2, name: 'Annual Report – Vertex Inc', client: 'Vertex Inc', stage: 'Planning', tags: ['In Review'], date: '18 Apr 2026', value: 12000, hours: 32, description: '' },
  { id: 3, name: 'Packaging Design – Bloom Foods', client: 'Bloom Foods', stage: 'Proposal', tags: ['Sent'], date: '22 Apr 2026', value: 4200, hours: 8, description: '' },
  { id: 4, name: 'Social Media Kit – Kova Studio', client: 'Kova Studio', stage: 'Kick Off', tags: ['Active'], date: '28 Apr 2026', value: 3600, hours: 12, description: '' },
  { id: 5, name: 'Website Redesign – Novu Tech', client: 'Novu Tech', stage: 'Discovery', tags: ['Met'], date: '5 May 2026', value: 15000, hours: 6, description: '' },
  { id: 6, name: 'Motion Graphics – Arko', client: 'Arko Media', stage: 'Contract Signed', tags: ['Active'], date: '12 May 2026', value: 7800, hours: 18, description: '' },
  { id: 7, name: 'Catalogue – Hiro Furniture', client: 'Hiro Co', stage: 'Onboarding', tags: ['In Progress'], date: '20 May 2026', value: 5500, hours: 10, description: '' },
  { id: 8, name: 'CGI Renders – Prism', client: 'Prism Labs', stage: 'New', tags: ['Warm Lead'], date: '1 Jun 2026', value: 9200, hours: 0, description: '' },
  { id: 9, name: 'Campaign – Nuri Coffee', client: 'Nuri Coffee', stage: 'Completed', tags: ['Great Experience'], date: '15 Mar 2026', value: 6400, hours: 38, description: '' },
  { id: 10, name: 'Pitch Deck – Slate VC', client: 'Slate VC', stage: 'Proposal', tags: ['Under Review'], date: '28 Mar 2026', value: 3200, hours: 5, description: '' },
];

const existingContacts = [
  'Sarah Kim', 'James Tan', 'Mia Ng', 'Ryan Loh', 'Chloe Park', 'Dave Chen', 'Priya Rajan',
];

const emptyNewProject = {
  name: '', assignContacts: [], stage: 'New', serviceType: '', startDate: '', endDate: '',
  timezone: 'SGT (UTC+8)', leadSource: '', notes: '', tags: [],
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

function NewProjectPanel({ onClose, onSave }) {
  const [form, setForm] = useState(emptyNewProject);
  const [contactSearch, setContactSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  const save = () => {
    if (!form.name) return;
    onSave(form);
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
            <label className="form-label">Assign Contacts</label>
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
                  background: '#fff', border: '1px solid #e5e0d8', borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden',
                }}>
                  {filteredContacts.map(c => (
                    <button key={c} onClick={() => addContact(c)} style={{
                      display: 'block', width: '100%', padding: '9px 12px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      textAlign: 'left', fontSize: 13, color: '#1a1a1a',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#faf8f4'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      {c}
                    </button>
                  ))}
                  <button onClick={() => addContact(contactSearch)} style={{
                    display: 'block', width: '100%', padding: '9px 12px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left', fontSize: 13, color: '#f59e0b', fontWeight: 500,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fffbeb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    ➕ Create new contact: {contactSearch}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Service Type</label>
            <select className="form-select" value={form.serviceType} onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))}>
              <option value="">Select service type…</option>
              {SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}
            </select>
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
            <select className="form-select" value={form.leadSource} onChange={e => setForm(f => ({ ...f, leadSource: e.target.value }))}>
              <option value="">Select lead source…</option>
              {LEAD_SOURCES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes about this project…" style={{ minHeight: 100 }} />
          </div>
        </div>
        <div className="slide-panel-footer" style={{ justifyContent: 'stretch' }}>
          <button className="btn btn-primary" onClick={save} style={{ width: '100%', justifyContent: 'center', fontSize: 15 }}>
            Create Project
          </button>
        </div>
      </div>
    </>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState(initialProjects);
  const [openMenu, setOpenMenu] = useState(null);
  const [openStage, setOpenStage] = useState(null);
  const [openTag, setOpenTag] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const updateStage = (id, stage) => {
    setProjects(p => p.map(pr => pr.id === id ? { ...pr, stage, tags: [] } : pr));
    setOpenStage(null);
  };

  const deleteProject = (id) => {
    setProjects(p => p.filter(pr => pr.id !== id));
    setOpenMenu(null);
  };

  const archiveProject = (id) => {
    setProjects(p => p.map(pr => pr.id === id ? { ...pr, stage: 'Completed' } : pr));
    setOpenMenu(null);
  };

  const toggleTag = (id, tag) => {
    setProjects(p => p.map(pr => {
      if (pr.id !== id) return pr;
      const tags = pr.tags.includes(tag) ? pr.tags.filter(t => t !== tag) : [...pr.tags, tag];
      return { ...pr, tags };
    }));
    setOpenTag(null);
  };

  const saveNew = (form) => {
    setProjects(p => [...p, {
      ...form,
      id: Date.now(),
      client: form.assignContacts.join(', ') || '',
      date: form.endDate || '',
      value: 0,
      hours: 0,
      description: form.notes || '',
      tags: [],
    }]);
  };

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

      {projects.length === 0 ? (
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
                        style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 500, color: '#1a1a1a', fontSize: 14, padding: 0 }}
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

                    <td style={{ color: '#6b7280' }}>{p.client}</td>
                    <td style={{ color: '#6b7280', fontSize: 13 }}>{p.date}</td>
                    <td style={{ fontWeight: 500 }}>S${Number(p.value).toLocaleString()}</td>
                    <td style={{ color: '#6b7280', fontSize: 13 }}>{p.hours > 0 ? `${p.hours}h` : '—'}</td>
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
        />
      )}
    </div>
  );
}
