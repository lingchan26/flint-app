import { useState, useEffect, useMemo } from 'react';
import { Plus, X, MoreVertical, CheckCircle, Users, Search, Loader, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const STATUSES = ['Active', 'Inactive', 'Lead'];

const emptyForm = {
  name: '', company: '', email: '', phone: '', industry: '',
  status: 'Active', project_count: '', total_value: '',
};

function rowToClient(r) {
  return {
    id: r.id,
    name: r.name || '',
    company: r.company || '',
    email: r.email || '',
    phone: r.phone || '',
    industry: r.industry || '',
    status: r.status || 'Active',
    project_count: r.project_count || 0,
    total_value: Number(r.total_value) || 0,
  };
}

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showPanel, setShowPanel] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [openMenu, setOpenMenu] = useState(null);
  const [toast, setToast] = useState('');

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterIndustry, setFilterIndustry] = useState('All');

  /* ─── load ────────────────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });
        if (cancelled) return;
        if (error) throw error;
        setClients((data || []).map(rowToClient));
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load clients');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  /* ─── CRUD ────────────────────────────────────────────────────────── */

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowPanel(true);
  };

  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({
      name: c.name || '',
      company: c.company || '',
      email: c.email || '',
      phone: c.phone || '',
      industry: c.industry || '',
      status: c.status || 'Active',
      project_count: c.project_count === 0 ? '' : String(c.project_count),
      total_value: c.total_value === 0 ? '' : String(c.total_value),
    });
    setOpenMenu(null);
    setShowPanel(true);
  };

  const closePanel = () => {
    setShowPanel(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  async function saveForm() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const payload = {
        name: form.name.trim(),
        company: form.company.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        industry: form.industry.trim() || null,
        status: form.status,
        project_count: form.project_count === '' ? 0 : Number(form.project_count),
        total_value: form.total_value === '' ? 0 : Number(form.total_value),
      };

      if (editingId) {
        const { data, error } = await supabase
          .from('clients')
          .update(payload)
          .eq('id', editingId)
          .select()
          .single();
        if (error) throw error;
        setClients(cs => cs.map(c => c.id === editingId ? rowToClient(data) : c));
        showToast('Client updated');
      } else {
        const { data, error } = await supabase
          .from('clients')
          .insert({ ...payload, user_id: user.id })
          .select()
          .single();
        if (error) throw error;
        setClients(cs => [rowToClient(data), ...cs]);
        showToast('Client added');
      }
      closePanel();
    } catch (e) {
      setError(e.message || 'Could not save client');
    } finally {
      setSaving(false);
    }
  }

  async function deleteClient(id) {
    if (!confirm('Delete this client? This cannot be undone.')) return;
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      setClients(cs => cs.filter(c => c.id !== id));
      setOpenMenu(null);
      showToast('Client deleted');
    } catch (e) {
      setError(e.message || 'Could not delete client');
    }
  }

  /* ─── derived ─────────────────────────────────────────────────────── */

  const industries = useMemo(
    () => ['All', ...Array.from(new Set(clients.map(c => c.industry).filter(Boolean)))],
    [clients]
  );

  const filtered = useMemo(() => {
    return clients.filter(c => {
      const q = search.toLowerCase();
      if (q && !c.name.toLowerCase().includes(q) && !(c.company || '').toLowerCase().includes(q)) return false;
      if (filterStatus !== 'All' && c.status !== filterStatus) return false;
      if (filterIndustry !== 'All' && c.industry !== filterIndustry) return false;
      return true;
    });
  }, [clients, search, filterStatus, filterIndustry]);

  const totalProjects = clients.reduce((s, c) => s + (c.project_count || 0), 0);
  const totalValue = clients.reduce((s, c) => s + (c.total_value || 0), 0);

  /* ─── render ──────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Loader size={28} color="var(--slate-400)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Clients</h1>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> New Client
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

      {/* Summary */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>
            <Users size={20} color="#3b82f6" />
          </div>
          <div>
            <div className="stat-label">Total Clients</div>
            <div className="stat-value">{clients.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5' }}>
            <Users size={20} color="#10b981" />
          </div>
          <div>
            <div className="stat-label">Active</div>
            <div className="stat-value">{clients.filter(c => c.status === 'Active').length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            <Users size={20} color="#f59e0b" />
          </div>
          <div>
            <div className="stat-label">Total Projects</div>
            <div className="stat-value">{totalProjects}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe' }}>
            <Users size={20} color="#8b5cf6" />
          </div>
          <div>
            <div className="stat-label">Total Value</div>
            <div className="stat-value" style={{ fontSize: 18 }}>
              {clients.length === 0 ? '—' : `S$${totalValue.toLocaleString()}`}
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filter row (only show when there's data) */}
      {clients.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 32 }}
              placeholder="Search clients or companies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="form-select" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="form-select" style={{ width: 160 }} value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)}>
            {industries.map(ind => <option key={ind}>{ind === 'All' ? 'All Industries' : ind}</option>)}
          </select>
          <span style={{ fontSize: 13, color: '#9ca3af', whiteSpace: 'nowrap' }}>
            {filtered.length} client{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {clients.length === 0 ? (
        <div className="table-container">
          <div className="empty-state">
            <div className="empty-state-icon"><Users size={48} /></div>
            <h3>No clients yet</h3>
            <p>Add your first client to start tracking relationships.</p>
            <button className="btn btn-primary" onClick={openNew}>
              <Plus size={16} /> New Client
            </button>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Industry</th>
                <th>Projects</th>
                <th>Total Value</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td style={{ color: '#6b7280' }}>{c.company}</td>
                  <td style={{ color: '#6b7280', fontSize: 13 }}>{c.email}</td>
                  <td style={{ color: '#6b7280', fontSize: 13 }}>{c.phone}</td>
                  <td style={{ color: '#6b7280', fontSize: 13 }}>{c.industry}</td>
                  <td style={{ textAlign: 'center' }}>{c.project_count || '—'}</td>
                  <td style={{ fontWeight: 500 }}>
                    {c.total_value > 0 ? `S$${c.total_value.toLocaleString()}` : '—'}
                  </td>
                  <td>
                    <span style={{
                      background: c.status === 'Active' ? '#d1fae5' : c.status === 'Lead' ? '#fef3c7' : '#f3f4f6',
                      color: c.status === 'Active' ? '#065f46' : c.status === 'Lead' ? '#92400e' : '#4b5563',
                      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ position: 'relative' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '4px 6px' }}
                      onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}
                    >
                      <MoreVertical size={15} />
                    </button>
                    {openMenu === c.id && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 48 }} onClick={() => setOpenMenu(null)} />
                        <div className="dropdown-menu" style={{ position: 'absolute', right: 0, top: 32, zIndex: 49 }}>
                          <button className="dropdown-item" onClick={() => openEdit(c)}>Edit</button>
                          <button className="dropdown-item danger" onClick={() => deleteClient(c.id)}>Delete</button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>
                    No clients match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide panel for new/edit */}
      {showPanel && (
        <>
          <div className="overlay" onClick={closePanel} />
          <div className="slide-panel">
            <div className="slide-panel-header">
              <span className="slide-panel-title">{editingId ? 'Edit Client' : 'New Client'}</span>
              <button className="close-btn" onClick={closePanel}><X size={16} /></button>
            </div>
            <div className="slide-panel-body">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Contact full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Company</label>
                <input className="form-input" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Company or organisation" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+65 9123 4567" />
                </div>
                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <input className="form-input" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} placeholder="e.g. Finance" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Project count</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    value={form.project_count}
                    onChange={e => setForm(f => ({ ...f, project_count: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Total value (S$)</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    value={form.total_value}
                    onChange={e => setForm(f => ({ ...f, total_value: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="slide-panel-footer">
              <button className="btn btn-secondary" onClick={closePanel} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={saveForm} disabled={saving || !form.name.trim()}>
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add Client'}
              </button>
            </div>
          </div>
        </>
      )}

      {toast && (
        <div className="toast">
          <CheckCircle size={16} color="#10b981" />
          {toast}
        </div>
      )}
    </div>
  );
}
