import { useState, useEffect } from 'react';
import {
  Link2, Edit2, Plus, Copy, CheckCircle, ExternalLink, X,
  Image as ImageIcon, Trash2, Loader, AlertCircle, BarChart3,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const CATEGORIES = ['Branding', 'Corporate', 'Print', 'Digital', 'CGI', 'Motion', 'Photography', 'Other'];

const categoryColor = {
  Branding:    { bg: '#fef3c7', color: '#92400e' },
  Corporate:   { bg: '#dbeafe', color: '#1e40af' },
  Print:       { bg: '#d1fae5', color: '#065f46' },
  Digital:     { bg: '#ede9fe', color: '#5b21b6' },
  CGI:         { bg: '#cffafe', color: '#155e75' },
  Motion:      { bg: '#fce7f3', color: '#9d174d' },
  Photography: { bg: '#fee2e2', color: '#991b1b' },
  Other:       { bg: '#f3f4f6', color: '#4b5563' },
};

function rowToItem(r) {
  return {
    id: r.id,
    title: r.title,
    category: r.category || 'Other',
    description: r.description || '',
    imageUrl: r.image_url || '',
    videoUrl: r.video_url || '',
    sortOrder: r.sort_order || 0,
  };
}

function CardPlaceholder({ category, imageUrl }) {
  const bg = (categoryColor[category] || categoryColor.Other).bg;
  if (imageUrl) {
    return (
      <div style={{
        width: '100%', paddingTop: '75%', position: 'relative',
        backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover',
        backgroundPosition: 'center', borderRadius: '8px 8px 0 0',
      }} />
    );
  }
  return (
    <div style={{
      width: '100%', paddingTop: '75%', position: 'relative',
      background: bg, borderRadius: '8px 8px 0 0', overflow: 'hidden',
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

export default function Portfolio({ session }) {
  const [tab, setTab] = useState('portfolio');
  const [editMode, setEditMode] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Best-effort: portfolio "link" is a friendly hint for now — there is no public
  // /portfolio/:slug route yet. We compose a placeholder based on the user's email.
  const slug = (session?.user?.email?.split('@')[0]) || 'me';
  const shareLink = `https://flint.app/portfolio/${slug}`;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('portfolio_items')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });
        if (cancelled) return;
        if (error) throw error;
        setItems((data || []).map(rowToItem));
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load portfolio');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ─── CRUD ────────────────────────────────────────────────────────── */

  async function addItem() {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');
      const payload = {
        user_id: user.id,
        title: 'New Work',
        category: 'Branding',
        description: '',
        image_url: null,
        video_url: null,
        sort_order: items.length,
      };
      const { data, error } = await supabase.from('portfolio_items').insert(payload).select().single();
      if (error) throw error;
      const newItem = rowToItem(data);
      setItems(i => [...i, newItem]);
      setEditItem(newItem); // open the modal so user can fill it
    } catch (e) {
      setError(e.message || 'Could not add portfolio item');
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(updated) {
    setSaving(true);
    try {
      const payload = {
        title: updated.title?.trim() || 'Untitled',
        category: updated.category,
        description: updated.description?.trim() || null,
        image_url: updated.imageUrl?.trim() || null,
        video_url: updated.videoUrl?.trim() || null,
      };
      const { data, error } = await supabase
        .from('portfolio_items')
        .update(payload)
        .eq('id', updated.id)
        .select()
        .single();
      if (error) throw error;
      setItems(i => i.map(item => item.id === updated.id ? rowToItem(data) : item));
      setEditItem(null);
    } catch (e) {
      setError(e.message || 'Could not save portfolio item');
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id) {
    if (!confirm('Delete this portfolio item? This cannot be undone.')) return;
    try {
      const { error } = await supabase.from('portfolio_items').delete().eq('id', id);
      if (error) throw error;
      setItems(i => i.filter(item => item.id !== id));
      setEditItem(null);
    } catch (e) {
      setError(e.message || 'Could not delete portfolio item');
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
        <h1 className="page-title">Portfolio</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {items.length > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={copyLink}>
              {copied ? <CheckCircle size={14} color="#10b981" /> : <Link2 size={14} />}
              {copied ? 'Copied!' : 'Share Link'}
            </button>
          )}
          <button
            className={editMode ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            onClick={() => setEditMode(m => !m)}
          >
            <Edit2 size={14} /> {editMode ? 'Done Editing' : 'Edit Portfolio'}
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
          <button
            onClick={() => setError(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7f1d1d' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${tab === 'portfolio' ? 'active' : ''}`} onClick={() => setTab('portfolio')}>Portfolio</button>
        <button className={`tab ${tab === 'analytics' ? 'active' : ''}`} onClick={() => setTab('analytics')}>Analytics</button>
      </div>

      {tab === 'portfolio' && (
        <>
          {items.length === 0 && !editMode ? (
            <div className="card" style={{ padding: 48, textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 56, height: 56, margin: '0 auto 16px', borderRadius: 14,
                background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ImageIcon size={26} color="#f59e0b" />
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No portfolio items yet</div>
              <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 18, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
                Showcase your best work to share with prospects. Click "Edit Portfolio" to add your first piece.
              </div>
              <button className="btn btn-primary" onClick={() => setEditMode(true)}>
                <Edit2 size={16} /> Edit Portfolio
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
              {items.map(item => (
                <div key={item.id} style={{ position: 'relative' }}>
                  <div className="card" style={{ padding: 0, overflow: 'hidden', cursor: editMode ? 'pointer' : 'default' }}
                    onClick={() => editMode && setEditItem(item)}
                  >
                    <CardPlaceholder category={item.category} imageUrl={item.imageUrl} />
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a', marginBottom: 4 }}>{item.title}</div>
                      <span style={{
                        background: (categoryColor[item.category] || categoryColor.Other).bg,
                        color: (categoryColor[item.category] || categoryColor.Other).color,
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
                  disabled={saving}
                  style={{
                    background: 'transparent', border: '2px dashed #e5e0d8',
                    borderRadius: 12, cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 8, color: '#9ca3af', minHeight: 180,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!saving) { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.color = '#f59e0b'; } }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e0d8'; e.currentTarget.style.color = '#9ca3af'; }}
                  onClick={addItem}
                >
                  <Plus size={24} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{saving ? 'Adding…' : 'Add New Work'}</span>
                </button>
              )}
            </div>
          )}

          {items.length > 0 && (
            <>
              {/* Connect External */}
              <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>Connect External</div>
                <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12 }}>
                  Coming soon — pull in work from Behance, Vimeo or YouTube.
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Behance', color: '#1769FF' },
                    { label: 'Vimeo', color: '#1AB7EA' },
                    { label: 'YouTube', color: '#FF0000' },
                  ].map(ext => (
                    <button
                      key={ext.label}
                      disabled
                      style={{
                        background: ext.color, color: '#fff', border: 'none',
                        borderRadius: 8, padding: '8px 16px', cursor: 'not-allowed',
                        fontWeight: 500, fontSize: 13, display: 'flex',
                        alignItems: 'center', gap: 6, opacity: 0.5,
                      }}
                    >
                      <ExternalLink size={13} /> {ext.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shareable link */}
              <div className="card">
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Your Portfolio Link</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 10 }}>
                  Public portfolio pages coming soon. For now, share screenshots from this page.
                </div>
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
        </>
      )}

      {tab === 'analytics' && (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, margin: '0 auto 16px', borderRadius: 14,
            background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BarChart3 size={26} color="#3b82f6" />
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Analytics coming soon</div>
          <div style={{ fontSize: 13, color: '#9ca3af', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
            Once your public portfolio page is live, you'll see visitor counts, time spent,
            and where viewers are coming from. Stay tuned.
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editItem && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }} onClick={() => !saving && setEditItem(null)} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff', borderRadius: 16, width: 480, maxWidth: '95vw',
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
            <div style={{ padding: 24, maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" value={editItem.title} onChange={e => setEditItem(i => ({ ...i, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={editItem.category} onChange={e => setEditItem(i => ({ ...i, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={editItem.description} onChange={e => setEditItem(i => ({ ...i, description: e.target.value }))} placeholder="Tell the story of this project…" />
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
              display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center',
            }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => deleteItem(editItem.id)}
                disabled={saving}
                style={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Trash2 size={14} /> Delete
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => setEditItem(null)} disabled={saving}>Cancel</button>
                <button className="btn btn-primary" onClick={() => saveEdit(editItem)} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
