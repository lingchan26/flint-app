import { useState } from 'react';
import { Plus, X, Briefcase, CheckCircle, Image } from 'lucide-react';

const initialServices = [
  { id: 1, name: 'Brand Identity', category: 'Branding', rate: 280, unit: 'hour', qty: 1, description: 'Full brand identity including logo, colour palette, and typography.', active: true },
  { id: 2, name: 'Packaging Design', category: 'Print', rate: 4500, unit: 'project', qty: 1, description: 'End-to-end packaging design for FMCG and consumer products.', active: true },
  { id: 3, name: 'Social Media Kit', category: 'Digital', rate: 1800, unit: 'project', qty: 1, description: 'Templates and assets for Instagram, LinkedIn, and Facebook.', active: true },
  { id: 4, name: 'Annual Report', category: 'Corporate', rate: 8000, unit: 'project', qty: 1, description: 'Designed annual report with data visualisation and editorial layout.', active: true },
  { id: 5, name: 'CGI & 3D Render', category: 'CGI', rate: 350, unit: 'hour', qty: 1, description: 'Photorealistic product renders and scene visualisation.', active: true },
  { id: 6, name: 'Motion Graphics', category: 'Motion', rate: 3200, unit: 'project', qty: 1, description: 'Animated explainers and brand videos up to 90 seconds.', active: false },
  { id: 7, name: 'Food Stylist — Photography Day', category: 'Photography', rate: 2000, unit: 'day', qty: 1, description: '8 hours of Food Stylist at the photography studio. This service includes food preparation and sourcing, prop selection and arrangement, on-set food presentation and plating, colour correction guidance, up to 3 hero shots, and post-shoot clean-up. Perfect for brand campaigns, editorial shoots, and e-commerce product photography.', active: true },
];

const CATEGORIES = ['Branding', 'Print', 'Digital', 'Corporate', 'CGI', 'Motion', 'Photography', 'Advertising', 'Other'];
const UNITS = ['Hour', 'Day', 'Week', 'Project', 'Month', 'Session', 'Word', 'Image'];

function EditServiceModal({ service, onClose, onSave }) {
  const [form, setForm] = useState({
    name: service.name,
    description: service.description || '',
    qty: service.qty || 1,
    unit: service.unit || 'project',
    rate: service.rate,
  });

  const total = (Number(form.qty) || 0) * (Number(form.rate) || 0);

  const handleSave = () => {
    onSave({ ...service, ...form, rate: Number(form.rate), qty: Number(form.qty) });
    onClose();
  };

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }} onClick={onClose} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#fff', borderRadius: 16, width: 600,
        maxHeight: '90vh', zIndex: 201,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #e5e0d8',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          position: 'relative',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', right: 16, top: 16,
              background: '#f3f4f6', border: 'none', borderRadius: 8,
              width: 32, height: 32, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: '#6b7280',
            }}
          >
            <X size={16} />
          </button>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#1a1a1a', marginBottom: 4 }}>Edit service</div>
          <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center' }}>
            Add a service to reuse it later in invoices, proposals and brochures.
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          {/* Column headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 80px 120px 100px 100px',
            gap: 12, marginBottom: 8,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Service Info</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Qty</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unit</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</div>
          </div>

          {/* Main row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 80px 120px 100px 100px',
            gap: 12, alignItems: 'start',
          }}>
            {/* Left: image + name + desc */}
            <div>
              <div style={{
                width: 80, height: 80, background: '#f3f4f6', borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10, border: '1px dashed #d1d5db',
              }}>
                <Image size={28} color="#9ca3af" />
              </div>
              <input
                className="form-input"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Service name"
                style={{ marginBottom: 8 }}
              />
              <textarea
                className="form-textarea"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Give clients more info about your service…"
                style={{ minHeight: 80, fontSize: 13 }}
              />
            </div>

            {/* Qty */}
            <div>
              <input
                className="form-input"
                type="number"
                value={form.qty}
                min={1}
                onChange={e => setForm(f => ({ ...f, qty: e.target.value }))}
              />
            </div>

            {/* Unit */}
            <div>
              <select
                className="form-select"
                value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
              >
                {UNITS.map(u => <option key={u} value={u.toLowerCase()}>{u}</option>)}
              </select>
            </div>

            {/* Price */}
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                color: '#9ca3af', fontSize: 14,
              }}>$</span>
              <input
                className="form-input"
                type="number"
                value={form.rate}
                onChange={e => setForm(f => ({ ...f, rate: e.target.value }))}
                style={{ paddingLeft: 24 }}
              />
            </div>

            {/* Total */}
            <div style={{ paddingTop: 9 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>
                S${total.toLocaleString()}
              </span>
            </div>
          </div>

          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#3b82f6', fontSize: 13, fontWeight: 500,
            marginTop: 12, padding: 0, display: 'flex', alignItems: 'center', gap: 4,
          }}>
            + Add sub item
          </button>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid #e5e0d8',
          display: 'flex', gap: 10, justifyContent: 'flex-end',
        }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            onClick={handleSave}
            style={{
              background: '#1a1a1a', color: '#fff', border: 'none',
              borderRadius: 8, padding: '8px 20px', cursor: 'pointer',
              fontWeight: 600, fontSize: 14,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}

export default function Services() {
  const [services, setServices] = useState(initialServices);
  const [showNew, setShowNew] = useState(false);
  const [editService, setEditService] = useState(null);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ name: '', category: 'Branding', rate: '', unit: 'project', qty: 1, description: '', active: true });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const saveNew = () => {
    if (!form.name || !form.rate) return;
    setServices(s => [...s, { id: Date.now(), ...form, rate: Number(form.rate), qty: Number(form.qty) || 1 }]);
    setShowNew(false);
    setForm({ name: '', category: 'Branding', rate: '', unit: 'project', qty: 1, description: '', active: true });
    showToast('Service added!');
  };

  const toggleActive = (id) => {
    setServices(s => s.map(sv => sv.id === id ? { ...sv, active: !sv.active } : sv));
  };

  const saveEdit = (updated) => {
    setServices(s => s.map(sv => sv.id === updated.id ? updated : sv));
    showToast('Service updated!');
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Services</h1>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          <Plus size={16} /> Add Service
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {services.map(s => (
          <div key={s.id} className="card" style={{ opacity: s.active ? 1 : 0.6, transition: 'opacity 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: '#fef3c7', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Briefcase size={18} color="#f59e0b" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setEditService(s)}
                  style={{
                    background: '#f3f4f6', border: 'none', borderRadius: 6,
                    padding: '4px 10px', cursor: 'pointer', fontSize: 12,
                    color: '#6b7280', fontWeight: 500,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e5e0d8'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
                >
                  Edit
                </button>
                <label className="toggle">
                  <input type="checkbox" checked={s.active} onChange={() => toggleActive(s.id)} />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{s.name}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>{s.category}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.5 }}>{s.description}</div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: 12, borderTop: '1px solid #f0ece4',
            }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>
                S${s.rate.toLocaleString()}
              </span>
              <span style={{
                fontSize: 12, color: '#9ca3af',
                background: '#f3f4f6', padding: '3px 8px', borderRadius: 6,
              }}>
                per {s.unit}
              </span>
            </div>
          </div>
        ))}

        {/* Add new card */}
        <button
          onClick={() => setShowNew(true)}
          style={{
            background: 'transparent',
            border: '2px dashed #e5e0d8',
            borderRadius: 12,
            padding: 24,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: '#9ca3af',
            transition: 'all 0.15s',
            minHeight: 160,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.color = '#f59e0b'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e0d8'; e.currentTarget.style.color = '#9ca3af'; }}
        >
          <Plus size={24} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>Add Service</span>
        </button>
      </div>

      {/* Edit Service Modal */}
      {editService && (
        <EditServiceModal
          service={editService}
          onClose={() => setEditService(null)}
          onSave={saveEdit}
        />
      )}

      {showNew && (
        <>
          <div className="overlay" onClick={() => setShowNew(false)} />
          <div className="slide-panel">
            <div className="slide-panel-header">
              <span className="slide-panel-title">Add Service</span>
              <button className="close-btn" onClick={() => setShowNew(false)}><X size={16} /></button>
            </div>
            <div className="slide-panel-body">
              <div className="form-group">
                <label className="form-label">Service Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Brand Identity Design" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Billing Unit</label>
                  <select className="form-select" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                    <option value="project">Per Project</option>
                    <option value="hour">Per Hour</option>
                    <option value="day">Per Day</option>
                    <option value="month">Per Month</option>
                    <option value="session">Per Session</option>
                    <option value="word">Per Word</option>
                    <option value="image">Per Image</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Rate (SGD) *</label>
                <input className="form-input" type="number" value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of this service…" />
              </div>
              <div className="form-group">
                <label className="toggle">
                  <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                  <span className="toggle-slider" />
                  <span style={{ fontSize: 13, color: '#6b7280' }}>Active</span>
                </label>
              </div>
            </div>
            <div className="slide-panel-footer">
              <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveNew}>Add Service</button>
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
