import { useState, useMemo } from 'react';
import { Plus, X, MoreVertical, CheckCircle, Users, Search } from 'lucide-react';

const initialClients = [
  { id: 1, name: 'Sarah Kim', company: 'Lumen Co', email: 'sarah@lumenco.com', phone: '+65 9123 4567', industry: 'Design', projects: 3, value: 28500, status: 'Active' },
  { id: 2, name: 'James Tan', company: 'Vertex Inc', email: 'james@vertex.com', phone: '+65 9234 5678', industry: 'Finance', projects: 2, value: 22000, status: 'Active' },
  { id: 3, name: 'Mia Ng', company: 'Bloom Foods', email: 'mia@bloomfoods.sg', phone: '+65 9345 6789', industry: 'Food & Bev', projects: 1, value: 4200, status: 'Active' },
  { id: 4, name: 'Ryan Loh', company: 'Kova Studio', email: 'ryan@kova.io', phone: '+65 9456 7890', industry: 'Creative', projects: 2, value: 9200, status: 'Active' },
  { id: 5, name: 'Chloe Park', company: 'Arko Media', email: 'chloe@arko.media', phone: '+82 10 1234 5678', industry: 'Media', projects: 1, value: 7800, status: 'Inactive' },
  { id: 6, name: 'Dave Chen', company: 'Novu Tech', email: 'dave@novu.tech', phone: '+65 9567 8901', industry: 'Tech', projects: 1, value: 15000, status: 'Active' },
];

export default function Clients() {
  const [clients, setClients] = useState(initialClients);
  const [showNew, setShowNew] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', industry: '', status: 'Active' });
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterIndustry, setFilterIndustry] = useState('All');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const saveNew = () => {
    if (!form.name) return;
    setClients(c => [...c, { id: Date.now(), ...form, projects: 0, value: 0 }]);
    setShowNew(false);
    setForm({ name: '', company: '', email: '', phone: '', industry: '', status: 'Active' });
    showToast('Client added!');
  };

  const deleteClient = (id) => {
    setClients(c => c.filter(cl => cl.id !== id));
    setOpenMenu(null);
  };

  const industries = ['All', ...Array.from(new Set(clients.map(c => c.industry).filter(Boolean)))];

  const filtered = useMemo(() => {
    return clients.filter(c => {
      const q = search.toLowerCase();
      if (q && !c.name.toLowerCase().includes(q) && !c.company.toLowerCase().includes(q)) return false;
      if (filterStatus !== 'All' && c.status !== filterStatus) return false;
      if (filterIndustry !== 'All' && c.industry !== filterIndustry) return false;
      return true;
    });
  }, [clients, search, filterStatus, filterIndustry]);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Clients</h1>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          <Plus size={16} /> New Client
        </button>
      </div>

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
            <div className="stat-value">{clients.reduce((s,c) => s + c.projects, 0)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe' }}>
            <Users size={20} color="#8b5cf6" />
          </div>
          <div>
            <div className="stat-label">Total Value</div>
            <div className="stat-value" style={{ fontSize: 18 }}>S${clients.reduce((s,c) => s + c.value, 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Search + Filter row */}
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
          <option>Active</option>
          <option>Inactive</option>
          <option>Lead</option>
        </select>
        <select className="form-select" style={{ width: 160 }} value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)}>
          {industries.map(ind => <option key={ind}>{ind === 'All' ? 'All Industries' : ind}</option>)}
        </select>
        <span style={{ fontSize: 13, color: '#9ca3af', whiteSpace: 'nowrap' }}>{filtered.length} client{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {clients.length === 0 ? (
        <div className="table-container">
          <div className="empty-state">
            <div className="empty-state-icon"><Users size={48} /></div>
            <h3>No clients yet</h3>
            <p>Add your first client to start tracking relationships.</p>
            <button className="btn btn-primary" onClick={() => setShowNew(true)}>
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
                  <td style={{ textAlign: 'center' }}>{c.projects}</td>
                  <td style={{ fontWeight: 500 }}>S${c.value.toLocaleString()}</td>
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
                          <button className="dropdown-item">View</button>
                          <button className="dropdown-item">Edit</button>
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

      {/* New Client Panel */}
      {showNew && (
        <>
          <div className="overlay" onClick={() => setShowNew(false)} />
          <div className="slide-panel">
            <div className="slide-panel-header">
              <span className="slide-panel-title">New Client</span>
              <button className="close-btn" onClick={() => setShowNew(false)}><X size={16} /></button>
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
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Lead</option>
                </select>
              </div>
            </div>
            <div className="slide-panel-footer">
              <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveNew}>Add Client</button>
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
