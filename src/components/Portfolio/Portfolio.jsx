import { useState } from 'react';
import { Link2, Edit2, Plus, Copy, CheckCircle, ExternalLink, X } from 'lucide-react';

const initialItems = [
  { id: 1, title: 'Brand Identity — Lumen Co', category: 'Branding', description: 'Full brand identity for Lumen Co including logo and guidelines.', imageUrl: '', videoUrl: '' },
  { id: 2, title: 'Annual Report — Vertex', category: 'Corporate', description: 'Annual report with data visualisation and editorial layout.', imageUrl: '', videoUrl: '' },
  { id: 3, title: 'Packaging — Bloom Foods', category: 'Print', description: 'Premium packaging design for Bloom Foods product range.', imageUrl: '', videoUrl: '' },
  { id: 4, title: 'Social Media Kit — Kova', category: 'Digital', description: 'Social media templates and assets for Kova Studio.', imageUrl: '', videoUrl: '' },
  { id: 5, title: 'CGI Renders — Prism', category: 'CGI', description: 'Photorealistic product renders for Prism Labs.', imageUrl: '', videoUrl: '' },
  { id: 6, title: 'Motion Reel — Arko', category: 'Motion', description: 'Brand motion reel for Arko Media campaign.', imageUrl: '', videoUrl: '' },
];

const categoryColor = {
  Branding: { bg: '#fef3c7', color: '#92400e' },
  Corporate: { bg: '#dbeafe', color: '#1e40af' },
  Print: { bg: '#d1fae5', color: '#065f46' },
  Digital: { bg: '#ede9fe', color: '#5b21b6' },
  CGI: { bg: '#cffafe', color: '#155e75' },
  Motion: { bg: '#fce7f3', color: '#9d174d' },
};

const analyticsData = [
  { location: 'Singapore', device: 'Mobile', time: 'Today 3:42 PM', duration: '3m 12s' },
  { location: 'Australia', device: 'Desktop', time: 'Today 11:20 AM', duration: '1m 45s' },
  { location: 'United Kingdom', device: 'Desktop', time: 'Yesterday', duration: '4m 08s' },
];

function CardPlaceholder({ category }) {
  const colors = {
    Branding: '#fef3c7', Corporate: '#dbeafe', Print: '#d1fae5',
    Digital: '#ede9fe', CGI: '#cffafe', Motion: '#fce7f3',
  };
  return (
    <div style={{
      width: '100%', paddingTop: '75%', position: 'relative',
      background: colors[category] || '#f3f4f6', borderRadius: '8px 8px 0 0',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 12, color: '#9ca3af', fontWeight: 500,
      }}>
        {category}
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [tab, setTab] = useState('portfolio');
  const [editMode, setEditMode] = useState(false);
  const [items, setItems] = useState(initialItems);
  const [editItem, setEditItem] = useState(null);
  const [notifToggle, setNotifToggle] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareLink = 'https://flint.app/portfolio/ling';

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveEdit = (updated) => {
    setItems(i => i.map(item => item.id === updated.id ? updated : item));
    setEditItem(null);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Portfolio</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={copyLink}>
            {copied ? <CheckCircle size={14} color="#10b981" /> : <Link2 size={14} />}
            {copied ? 'Copied!' : 'Share Link'}
          </button>
          <button
            className={editMode ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            onClick={() => setEditMode(m => !m)}
          >
            <Edit2 size={14} /> {editMode ? 'Done Editing' : 'Edit Portfolio'}
          </button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'portfolio' ? 'active' : ''}`} onClick={() => setTab('portfolio')}>Portfolio</button>
        <button className={`tab ${tab === 'analytics' ? 'active' : ''}`} onClick={() => setTab('analytics')}>Analytics</button>
      </div>

      {tab === 'portfolio' && (
        <>
          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            {items.map(item => (
              <div key={item.id} style={{ position: 'relative' }}>
                <div className="card" style={{ padding: 0, overflow: 'hidden', cursor: editMode ? 'pointer' : 'default' }}
                  onClick={() => editMode && setEditItem(item)}
                >
                  <CardPlaceholder category={item.category} />
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a', marginBottom: 4 }}>{item.title}</div>
                    <span style={{
                      ...(categoryColor[item.category] || { bg: '#f3f4f6', color: '#4b5563' }),
                      background: (categoryColor[item.category] || {}).bg || '#f3f4f6',
                      fontSize: 11, fontWeight: 500,
                      padding: '2px 8px', borderRadius: 20,
                    }}>
                      {item.category}
                    </span>
                  </div>
                  {editMode && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 12,
                    }}>
                      <div style={{
                        background: '#fff', borderRadius: 8, padding: '8px 14px',
                        fontSize: 13, fontWeight: 600, color: '#1a1a1a',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        <Edit2 size={13} /> Edit
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {editMode && (
              <button
                style={{
                  background: 'transparent', border: '2px dashed #e5e0d8',
                  borderRadius: 12, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 8, color: '#9ca3af', minHeight: 180,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.color = '#f59e0b'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e0d8'; e.currentTarget.style.color = '#9ca3af'; }}
                onClick={() => setItems(i => [...i, { id: Date.now(), title: 'New Work', category: 'Branding', description: '', imageUrl: '', videoUrl: '' }])}
              >
                <Plus size={24} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>Add New Work</span>
              </button>
            )}
          </div>

          {/* Connect External */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Connect External</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { label: 'Behance', color: '#1769FF' },
                { label: 'Vimeo', color: '#1AB7EA' },
                { label: 'YouTube', color: '#FF0000' },
              ].map(ext => (
                <button key={ext.label} style={{
                  background: ext.color, color: '#fff', border: 'none',
                  borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
                  fontWeight: 500, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <ExternalLink size={13} /> {ext.label}
                </button>
              ))}
            </div>
          </div>

          {/* Shareable link */}
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Your Portfolio Link</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-input" value={shareLink} readOnly style={{ flex: 1, background: '#faf8f4' }} />
              <button className="btn btn-secondary btn-sm" onClick={copyLink}>
                {copied ? <CheckCircle size={14} color="#10b981" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </>
      )}

      {tab === 'analytics' && (
        <>
          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            {[
              { label: 'Total Views', value: '1,284' },
              { label: 'Avg. Time', value: '2m 14s' },
              { label: 'Link Clicks', value: '47' },
              { label: 'Unique Visitors', value: '891' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value">{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Visitor Activity */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <div className="card-title">Visitor Activity</div>
            </div>
            <div className="table-container" style={{ boxShadow: 'none', border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Device</th>
                    <th>Timestamp</th>
                    <th>Time on Page</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.map((row, i) => (
                    <tr key={i}>
                      <td>{row.location}</td>
                      <td>{row.device}</td>
                      <td style={{ color: '#6b7280', fontSize: 13 }}>{row.time}</td>
                      <td style={{ color: '#6b7280', fontSize: 13 }}>{row.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-time notifications */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Real-time notifications</div>
              <label className="toggle">
                <input type="checkbox" checked={notifToggle} onChange={() => setNotifToggle(n => !n)} />
                <span className="toggle-slider" />
              </label>
            </div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Receive an alert when someone views your portfolio.</div>
            <div style={{ marginTop: 12, fontSize: 12, color: '#9ca3af', background: '#f3f4f6', padding: '8px 12px', borderRadius: 8 }}>
              Analytics update every 24 hours for free plan users.
            </div>
          </div>
        </>
      )}

      {/* Edit Item Modal */}
      {editItem && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }} onClick={() => setEditItem(null)} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff', borderRadius: 16, width: 480,
            zIndex: 101, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #e5e0d8',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Edit Portfolio Item</div>
              <button className="close-btn" onClick={() => setEditItem(null)}><X size={16} /></button>
            </div>
            <div style={{ padding: 24 }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" value={editItem.title} onChange={e => setEditItem(i => ({ ...i, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={editItem.category} onChange={e => setEditItem(i => ({ ...i, category: e.target.value }))}>
                  {Object.keys(categoryColor).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={editItem.description} onChange={e => setEditItem(i => ({ ...i, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input className="form-input" value={editItem.imageUrl} onChange={e => setEditItem(i => ({ ...i, imageUrl: e.target.value }))} placeholder="https://…" />
              </div>
              <div className="form-group">
                <label className="form-label">Video URL</label>
                <input className="form-input" value={editItem.videoUrl} onChange={e => setEditItem(i => ({ ...i, videoUrl: e.target.value }))} placeholder="https://vimeo.com/…" />
              </div>
            </div>
            <div style={{
              padding: '16px 24px', borderTop: '1px solid #e5e0d8',
              display: 'flex', gap: 10, justifyContent: 'flex-end',
            }}>
              <button className="btn btn-secondary" onClick={() => setEditItem(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => saveEdit(editItem)}>Save</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

