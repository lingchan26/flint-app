import { useState, useEffect } from 'react';
import { Plus, X, Briefcase, CheckCircle, Image, Loader, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const CATEGORIES = ['Branding', 'Print', 'Digital', 'Corporate', 'CGI', 'Motion', 'Photography', 'Advertising', 'Other'];
const UNITS = ['Hour', 'Day', 'Week', 'Project', 'Month', 'Session', 'Word', 'Image'];

const emptyForm = {
  name: '', category: 'Branding', rate: '', unit: 'project',
  qty: 1, description: '', active: true,
};

function rowToService(r) {
  return {
    id: r.id,
    name: r.name,
    category: r.category || 'Other',
    rate: Number(r.rate) || 0,
    unit: r.unit || 'project',
    qty: r.qty || 1,
    description: r.description || '',
    active: r.active !== false,
  };
}

function EditServiceModal({ service, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    name: service.name,
    description: service.description || '',
    qty: service.qty || 1,
    unit: service.unit || 'project',
    rate: service.rate,
    category: service.category || 'Other',
    active: service.active !== false,
  });

  const total = (Number(form.qty) || 0) * (Number(form.rate) || 0);

  const handleSave = () => {
    onSave({
      ...service,
      ...form,
      rate: Number(form.rate),
      qty: Number(form.qty),
    });
  };

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
      }} onClick={onClose} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#fff', borderRadius: 16, width: 600,
        maxWidth: '95vw', maxHeight: '90vh', zIndex: 201,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
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
            Update the details, pricing or status of this service.
          </div>
        </div>

        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 80px 120px 100px 100px',
            gap: 12, marginBottom: 8,
          }}>
            {['Service Info', 'Qty', 'Unit', 'Price', 'Total'].map(label => (
              <div key={label} style={{
                fontSize: 11, fontWeight: 600, color: '#9ca3af',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                {label}
              </div>
            ))}
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 80px 120px 100px 100px',
            gap: 12, alignItems: 'start',
          }}>
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

            <div>
              <input
                className="form-input"
                type="number"
                value={form.qty}
                min={1}
                onChange={e => setForm(f => ({ ...f, qty: e.target.value }))}
              />
            </div>

            <div>
              <select
                className="form-select"
                value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
              >
                {UNITS.map(u => <option key={u} value={u.toLowerCase()}>{u}</option>)}
              </select>
            </div>

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

            <div style={{ paddingTop: 9 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>
                S${total.toLocaleString()}
              </span>
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <label className="toggle" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                <span className="toggle-slider" />
                <span style={{ fontSize: 13, color: '#6b7280' }}>Active</span>
              </label>
            </div>
          </div>
        </div>

        <div style={{
          padding: '16px 24px', borderTop: '1px solid #e5e0d8',
          display: 'flex', gap: 10, justifyContent: 'flex-end',
        }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || !form.name?.trim()}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </>
  );
}

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showNew, setShowNew] = useState(false);
  const [editService, setEditService] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: false });
        if (cancelled) return;
        if (error) throw error;
        setServices((data || []).map(rowToService));
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load services');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  async function saveNew() {
    if (!form.name?.trim() || !form.rate) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const payload = {
        user_id: user.id,
        name: form.name.trim(),
        category: form.category,
        rate: Number(form.rate),
        unit: form.unit,
        qty: Number(form.qty) || 1,
        description: form.description.trim() || null,
        active: form.active,
      };
      const { data, error } = await supabase.from('services').insert(payload).select().single();
      if (error) throw error;
      setServices(s => [rowToService(data), ...s]);
      setShowNew(false);
      setForm(emptyForm);
      showToast('Service added');
    } catch (e) {
      setError(e.message || 'Could not save service');
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(updated) {
    setSaving(true);
    try {
      const payload = {
        name: updated.name?.trim(),
        category: updated.category,
        rate: Number(updated.rate),
        unit: updated.unit,
        qty: Number(updated.qty) || 1,
        description: updated.description?.trim() || null,
        active: updated.active,
      };
      const { data, error } = await supabase
        .from('services')
        .update(payload)
        .eq('id', updated.id)
        .select()
        .single();
      if (error) throw error;
      setServices(s => s.map(sv => sv.id === updated.id ? rowToService(data) : sv));
      setEditService(null);
      showToast('Service updated');
    } catch (e) {
      setError(e.message || 'Could not update service');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id, currentActive) {
    // Optimistic update
    setServices(s => s.map(sv => sv.id === id ? { ...sv, active: !currentActive } : sv));
    try {
      const { error } = await supabase
        .from('services')
        .update({ active: !currentActive })
        .eq('id', id);
      if (error) throw error;
    } catch (e) {
      // Roll back on error
      setServices(s => s.map(sv => sv.id === id ? { ...sv, active: currentActive } : sv));
      setError(e.message || 'Could not toggle service');
    }
  }

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
        <h1 className="page-title">Services</h1>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          <Plus size={16} /> Add Service
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

      {services.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, margin: '0 auto 16px', borderRadius: 14,
            background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Briefcase size={26} color="#f59e0b" />
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No services yet</div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 18, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
            Add the services you offer — they'll be reusable across invoices, proposals and brochures.
          </div>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}>
            <Plus size={16} /> Add your first service
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
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
                    <input type="checkbox" checked={s.active} onChange={() => toggleActive(s.id, s.active)} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>{s.category}</div>
              {s.description && (
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.5 }}>{s.description}</div>
              )}
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
      )}

      {editService && (
        <EditServiceModal
          service={editService}
          onClose={() => !saving && setEditService(null)}
          onSave={saveEdit}
          saving={saving}
        />
      )}

      {showNew && (
        <>
          <div className="overlay" onClick={() => !saving && setShowNew(false)} />
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
              <button className="btn btn-secondary" onClick={() => setShowNew(false)} disabled={saving}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={saveNew}
                disabled={saving || !form.name?.trim() || !form.rate}
              >
                {saving ? 'Saving…' : 'Add Service'}
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
