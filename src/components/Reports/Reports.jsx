import { useState, useEffect } from 'react';
import {
  Zap, Play, Pause, Plus, X, CheckCircle, Clock, Mail, FileText, Calendar,
  Bell, Edit2, List, Trash2, Copy, Loader, AlertCircle, Sparkles,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ICON_MAP = { CheckCircle, Bell, FileText, Mail, Clock };

/* ─── Starter Templates ─────────────────────────────────────────────────
 * These are suggestions a brand-new user can adopt. They live in this file,
 * not in the database. When the user clicks "Add to my playbooks", a row
 * is created in the playbooks table with these defaults.
 */

const STARTER_TEMPLATES = [
  {
    name: 'New Client Onboarding',
    trigger: 'Contract Signed',
    actions: ['Send welcome email', 'Send intake questionnaire', 'Create kick-off task', 'Schedule intro call'],
    description: 'Automatically welcome new clients and kick off the project the moment a contract is signed.',
    color: '#10b981',
    icon: 'CheckCircle',
  },
  {
    name: 'Invoice Chase',
    trigger: 'Invoice Overdue',
    actions: ['Send reminder D+3', 'Send reminder D+7', 'Send reminder D+14', 'Send final notice D+30'],
    description: 'Chase unpaid invoices automatically so you never have to awkwardly ask for money.',
    color: '#f59e0b',
    icon: 'Bell',
  },
  {
    name: 'Project Wrap-Up',
    trigger: 'Project Completed',
    actions: ['Send thank you email', 'Request testimonial', 'Create 90-day follow-up task'],
    description: 'Leave a lasting impression and keep relationships warm after every project ends.',
    color: '#3b82f6',
    icon: 'FileText',
  },
  {
    name: 'Lead Nurture',
    trigger: 'Lead Form Submitted',
    actions: ['Send acknowledgement email', 'Create project in Discovery', 'Assign follow-up task'],
    description: 'Turn every inquiry into a warm conversation without lifting a finger.',
    color: '#8b5cf6',
    icon: 'Mail',
  },
  {
    name: 'Proposal Follow-Up',
    trigger: 'Proposal Sent — No Response After 5 Days',
    actions: ['Send check-in email', 'Add Pipeline Nudge to dashboard'],
    description: 'Never let a warm proposal go cold. Automatically follow up when prospects go quiet.',
    color: '#f59e0b',
    icon: 'Clock',
  },
  {
    name: 'Payment Received',
    trigger: 'Invoice Paid',
    actions: ['Send payment receipt', 'Move project to next stage', 'Log to P&L'],
    description: 'Celebrate every payment with an instant receipt and automatic project progression.',
    color: '#10b981',
    icon: 'CheckCircle',
  },
];

const TRIGGER_OPTIONS = [
  'Contract Signed', 'Invoice Sent', 'Invoice Overdue', 'Invoice Paid',
  'Project Created', 'Project Completed', 'Proposal Sent', 'Lead Form Submitted', 'Task Completed',
];

const ACTION_OPTIONS = [
  'Send Email', 'Send Form', 'Create Task', 'Schedule Meeting',
  'Move Project Stage', 'Send Notification',
];

const PLAYBOOK_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#f97316', '#06b6d4'];

/* ─── Email draft templates (unchanged from original) ──────────────── */
function getDraft(action, tone) {
  const templates = {
    'Send welcome email': {
      subject: 'Welcome aboard, {{Client Name}}! 🎉',
      professional: `Hi {{Client Name}},\n\nThank you for confirming our engagement — I'm delighted to be working on {{Project Name}} with you.\n\nHere's what to expect:\n• An intake questionnaire will follow shortly\n• We'll schedule a kick-off call this week\n• You'll receive your first project update within 48 hours\n\nPlease don't hesitate to reach out with any questions.\n\nWarm regards,\n{{Your Name}}`,
      friendly: `Hey {{Client Name}} 👋\n\nSo excited to have you on board! {{Project Name}} is going to be great — I just know it.\n\nHere's the plan:\n• I'll send you a quick questionnaire to get your creative juices flowing\n• We'll hop on a kick-off call this week\n• You'll hear from me within 48 hours with your first update\n\nHave questions? Just hit reply — I'm all ears.\n\nCheers,\n{{Your Name}}`,
      urgent: `Hi {{Client Name}},\n\nContract confirmed — let's move fast.\n\nAction items:\n→ Intake questionnaire incoming (please complete within 24 hrs)\n→ Kick-off call: this week\n→ First update: 48 hrs\n\n{{Your Name}}`,
    },
    'Send reminder D+3': {
      subject: 'Friendly reminder — Invoice #{{Invoice No}} ({{Amount}})',
      professional: `Hi {{Client Name}},\n\nThis is a gentle reminder that Invoice #{{Invoice No}} for {{Amount}} was due on {{Due Date}}.\n\nIf payment has already been sent, please disregard this message.\n\nPayment options: [Payment Link]\n\nThank you,\n{{Your Name}}`,
      friendly: `Hey {{Client Name}},\n\nJust a quick nudge — Invoice #{{Invoice No}} for {{Amount}} was due a few days ago. No stress, just making sure it didn't slip through the cracks!\n\nYou can pay here: [Payment Link]\n\nThanks so much,\n{{Your Name}}`,
      urgent: `Hi {{Client Name}},\n\nInvoice #{{Invoice No}} for {{Amount}} is now 3 days overdue.\n\nPlease process payment today: [Payment Link]\n\n{{Your Name}}`,
    },
    'Send thank you email': {
      subject: "It's been a pleasure — {{Project Name}} ✨",
      professional: `Hi {{Client Name}},\n\nNow that {{Project Name}} is complete, I wanted to take a moment to express my sincere gratitude.\n\nIt was a pleasure collaborating with you. I hope the deliverables meet and exceed your expectations.\n\nWarm regards,\n{{Your Name}}`,
      friendly: `Hey {{Client Name}} 🎉\n\nWe did it! {{Project Name}} is officially a wrap — I loved every bit of it.\n\nYou were brilliant to work with. If there's anything else I can ever do, you know where to find me!\n\nUntil next time,\n{{Your Name}}`,
      urgent: `Hi {{Client Name}},\n\n{{Project Name}} is complete. Thank you for your business.\n\n{{Your Name}}`,
    },
    'Request testimonial': {
      subject: 'Would you share a quick review? (2 mins)',
      professional: `Hi {{Client Name}},\n\nIf you're satisfied with {{Project Name}}, I'd be deeply grateful if you could share a brief testimonial — it makes a real difference for independent professionals.\n\n→ [Testimonial Link]\n\nThank you,\n{{Your Name}}`,
      friendly: `Hey {{Client Name}}!\n\nIf you're happy with how {{Project Name}} turned out, a quick review would mean the world. Takes 2 minutes:\n\n→ [Testimonial Link]\n\nThanks so much!\n{{Your Name}}`,
      urgent: `Hi {{Client Name}},\n\nQuick ask — a testimonial would help immensely.\n\n→ [Testimonial Link]\n\nThank you!\n{{Your Name}}`,
    },
    'Send acknowledgement email': {
      subject: "Got your enquiry — I'll be in touch shortly",
      professional: `Hi {{Client Name}},\n\nThank you for reaching out. I've received your enquiry and will respond within 24–48 hours.\n\nRegards,\n{{Your Name}}`,
      friendly: `Hey {{Client Name}} 👋\n\nThanks for getting in touch! I'm excited to learn more — I'll be in touch within a day or two.\n\n{{Your Name}}`,
      urgent: `Hi {{Client Name}},\n\nEnquiry received. I'll respond within 24 hours.\n\n{{Your Name}}`,
    },
    'Send check-in email': {
      subject: 'Checking in on our proposal — {{Project Name}}',
      professional: `Hi {{Client Name}},\n\nI wanted to follow up on the proposal for {{Project Name}}. Happy to clarify anything if useful.\n\nLooking forward to hearing your thoughts.\n\n{{Your Name}}`,
      friendly: `Hey {{Client Name}}!\n\nJust checking in on the proposal for {{Project Name}}. If you'd like to talk through anything, I'm always happy to jump on a quick call!\n\n{{Your Name}}`,
      urgent: `Hi {{Client Name}},\n\nFollowing up on the proposal sent 5 days ago. Are you still interested?\n\n{{Your Name}}`,
    },
    'Send payment receipt': {
      subject: 'Payment received — Receipt for INV-{{Invoice No}}',
      professional: `Hi {{Client Name}},\n\nThis confirms your payment of {{Amount}} for Invoice #{{Invoice No}}.\n\nThank you for your prompt payment.\n\n{{Your Name}}`,
      friendly: `Hey {{Client Name}}!\n\nPayment received — thank you! 🙏 Receipt for {{Amount}} (INV-{{Invoice No}}).\n\n{{Your Name}}`,
      urgent: `{{Client Name}},\n\nPayment of {{Amount}} confirmed for INV-{{Invoice No}}.\n\n{{Your Name}}`,
    },
  };
  const t = templates[action];
  if (!t) {
    return {
      subject: 'Re: {{Project Name}}',
      body: `Hi {{Client Name}},\n\n[Your message here]\n\nBest,\n{{Your Name}}`,
    };
  }
  const toneKey = tone === 'Professional' ? 'professional' : tone === 'Friendly' ? 'friendly' : 'urgent';
  return { subject: t.subject, body: t[toneKey] || t.professional };
}

const isEmailAction = (action) =>
  action.toLowerCase().includes('send') ||
  action.toLowerCase().includes('request') ||
  action.toLowerCase().includes('email');

function rowToPlaybook(r) {
  return {
    id: r.id,
    name: r.name,
    trigger: r.trigger,
    actions: Array.isArray(r.actions) ? r.actions : [],
    description: r.description || '',
    color: r.color || '#f59e0b',
    icon: 'CheckCircle',
    active: !!r.active,
    runsThisMonth: r.runs_this_month || 0,
    lastRun: r.last_run ? new Date(r.last_run).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' }) : 'Never',
    isCustom: !!r.is_custom,
  };
}

/* ─── Main component ───────────────────────────────────────────────────── */

export default function Autopilot() {
  const [playbooks, setPlaybooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);
  const [adoptingId, setAdoptingId] = useState(null);

  const [builderTrigger, setBuilderTrigger] = useState('Contract Signed');
  const [builderActions, setBuilderActions] = useState(['Send Email']);
  const [builderName, setBuilderName] = useState('');

  const [emailPanel, setEmailPanel] = useState(null);
  const [emailTo, setEmailTo] = useState('');
  const [emailTone, setEmailTone] = useState('Friendly');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('playbooks')
          .select('*')
          .order('created_at', { ascending: true });
        if (cancelled) return;
        if (error) throw error;
        setPlaybooks((data || []).map(rowToPlaybook));
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load playbooks');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  /* ─── Adopt a starter template ──────────────────────────────────── */
  async function adoptTemplate(template) {
    if (playbooks.some(p => p.name === template.name)) {
      showToast('You already have this playbook');
      return;
    }
    setAdoptingId(template.name);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');
      const payload = {
        user_id: user.id,
        name: template.name,
        trigger: template.trigger,
        actions: template.actions,
        description: template.description,
        color: template.color,
        active: false,
        is_custom: false,
      };
      const { data, error } = await supabase.from('playbooks').insert(payload).select().single();
      if (error) throw error;
      setPlaybooks(prev => [...prev, rowToPlaybook(data)]);
      showToast(`"${template.name}" added to your playbooks`);
    } catch (e) {
      setError(e.message || 'Could not add playbook');
    } finally {
      setAdoptingId(null);
    }
  }

  /* ─── Toggle / delete / update ──────────────────────────────────── */
  async function togglePlaybook(p) {
    const next = !p.active;
    setPlaybooks(prev => prev.map(x => x.id === p.id ? { ...x, active: next } : x)); // optimistic
    try {
      const { error } = await supabase.from('playbooks').update({ active: next }).eq('id', p.id);
      if (error) throw error;
      showToast(next ? `"${p.name}" activated` : `"${p.name}" paused`);
    } catch (e) {
      setPlaybooks(prev => prev.map(x => x.id === p.id ? { ...x, active: p.active } : x)); // rollback
      setError(e.message || 'Could not update playbook');
    }
  }

  async function deletePlaybook(id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('playbooks').delete().eq('id', id);
      if (error) throw error;
      setPlaybooks(prev => prev.filter(p => p.id !== id));
      setEditingId(null);
      showToast('Playbook deleted');
    } catch (e) {
      setError(e.message || 'Could not delete playbook');
    }
  }

  async function saveEdit() {
    if (!editForm) return;
    setSaving(true);
    try {
      const payload = {
        name: editForm.name?.trim(),
        trigger: editForm.trigger,
        actions: editForm.actions,
        description: editForm.description?.trim() || null,
        color: editForm.color,
      };
      const { data, error } = await supabase
        .from('playbooks')
        .update(payload)
        .eq('id', editForm.id)
        .select()
        .single();
      if (error) throw error;
      setPlaybooks(prev => prev.map(p => p.id === editForm.id ? rowToPlaybook(data) : p));
      setEditingId(null);
      setEditForm(null);
      showToast('Playbook updated');
    } catch (e) {
      setError(e.message || 'Could not save playbook');
    } finally {
      setSaving(false);
    }
  }

  const openEdit = (p) => {
    setEditForm({ ...p, actions: [...p.actions] });
    setEditingId(p.id);
    setEmailPanel(null);
  };

  /* ─── Custom playbook builder ───────────────────────────────────── */
  async function createCustomPlaybook() {
    if (!builderName.trim() || builderActions.length === 0) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');
      const payload = {
        user_id: user.id,
        name: builderName.trim(),
        trigger: builderTrigger,
        actions: builderActions,
        description: 'Custom playbook',
        color: PLAYBOOK_COLORS[playbooks.length % PLAYBOOK_COLORS.length],
        active: false,
        is_custom: true,
      };
      const { data, error } = await supabase.from('playbooks').insert(payload).select().single();
      if (error) throw error;
      setPlaybooks(prev => [...prev, rowToPlaybook(data)]);
      setBuilderName('');
      setBuilderTrigger('Contract Signed');
      setBuilderActions(['Send Email']);
      showToast('Custom playbook created');
    } catch (e) {
      setError(e.message || 'Could not create playbook');
    } finally {
      setSaving(false);
    }
  }

  /* ─── Email panel handlers ──────────────────────────────────────── */
  const openEmail = (action, playbook) => {
    if (emailPanel?.action === action && emailPanel?.playbook?.id === playbook.id) {
      setEmailPanel(null);
    } else {
      setEmailPanel({ action, playbook });
      setEmailTo('');
      setEditingId(null);
    }
  };

  const draft = emailPanel ? getDraft(emailPanel.action, emailTone) : null;

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Loader size={28} color="var(--slate-400)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Filter starter templates to only those the user hasn't already adopted
  const adoptedNames = new Set(playbooks.map(p => p.name));
  const availableTemplates = STARTER_TEMPLATES.filter(t => !adoptedNames.has(t.name));

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Autopilot</h1>
        <span style={{
          background: '#fef3c7', color: '#92400e',
          padding: '4px 12px', borderRadius: 20,
          fontSize: 12, fontWeight: 600,
        }}>
          <Zap size={12} style={{ display: 'inline', marginRight: 4 }} />
          {playbooks.filter(p => p.active).length} active
        </span>
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

      {/* ── Heads-up: not actually running ────────────────────────── */}
      <div style={{
        background: '#fffbeb', border: '1px solid #fde68a',
        borderLeft: '4px solid #f59e0b', borderRadius: 10,
        padding: 14, marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <Zap size={18} color="#92400e" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ flex: 1, fontSize: 13, color: '#78350f' }}>
          <strong>Heads up:</strong> Autopilot is in preview. You can configure playbooks,
          activate them, and draft emails — but the triggers don't actually fire yet.
          We're connecting them up next. Use the email composer to copy-paste drafts in the meantime.
        </div>
      </div>

      {/* ── My Playbooks ──────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>My Playbooks</h2>
          <span style={{ fontSize: 13, color: '#9ca3af' }}>
            {playbooks.length} playbook{playbooks.length !== 1 ? 's' : ''}
          </span>
        </div>

        {playbooks.length === 0 ? (
          <div style={{
            padding: '24px 16px', textAlign: 'center',
            background: '#faf8f4', borderRadius: 10,
            border: '1px dashed #e5e0d8',
          }}>
            <Sparkles size={24} color="#9ca3af" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No playbooks yet</div>
            <div style={{ fontSize: 13, color: '#9ca3af', maxWidth: 360, margin: '0 auto' }}>
              Pick a starter template below to get started, or build your own custom playbook.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {playbooks.map(p => {
              const Icon = ICON_MAP[p.icon] || CheckCircle;
              return (
                <div
                  key={p.id}
                  style={{
                    background: '#faf8f4', borderRadius: 10,
                    border: `1px solid ${p.active ? p.color + '40' : '#e5e0d8'}`,
                    padding: 16, transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: p.color + '20',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={18} color={p.color} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div>
                        {p.isCustom && (
                          <span style={{
                            background: '#ede9fe', color: '#5b21b6',
                            padding: '1px 6px', borderRadius: 20,
                            fontSize: 10, fontWeight: 700,
                          }}>
                            Custom
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>
                        Triggered when: <strong style={{ color: '#6b7280' }}>{p.trigger}</strong>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {p.actions.map((action, ai) => (
                          <button
                            key={ai}
                            onClick={() => isEmailAction(action) && openEmail(action, p)}
                            disabled={!isEmailAction(action)}
                            style={{
                              fontSize: 11, padding: '3px 10px', borderRadius: 20,
                              background: isEmailAction(action)
                                ? (emailPanel?.action === action && emailPanel?.playbook?.id === p.id ? p.color : p.color + '15')
                                : '#f3f4f6',
                              color: isEmailAction(action)
                                ? (emailPanel?.action === action && emailPanel?.playbook?.id === p.id ? '#fff' : p.color)
                                : '#6b7280',
                              border: 'none',
                              cursor: isEmailAction(action) ? 'pointer' : 'default',
                              fontWeight: 500,
                            }}
                          >
                            {isEmailAction(action) && <Mail size={10} style={{ display: 'inline', marginRight: 3 }} />}
                            {action}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                      <label className="toggle">
                        <input type="checkbox" checked={p.active} onChange={() => togglePlaybook(p)} />
                        <span className="toggle-slider" />
                      </label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => openEdit(p)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '4px 8px', fontSize: 11 }}
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Email composer panel */}
                  {emailPanel?.action && emailPanel?.playbook?.id === p.id && (
                    <div style={{ marginTop: 14, padding: 14, background: '#fff', borderRadius: 8, border: '1px solid #e5e0d8' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>Email draft: {emailPanel.action}</div>
                        <button
                          onClick={() => setEmailPanel(null)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                        {['Friendly', 'Professional', 'Urgent'].map(t => (
                          <button
                            key={t}
                            onClick={() => setEmailTone(t)}
                            style={{
                              padding: '4px 12px', borderRadius: 20,
                              border: `1.5px solid ${emailTone === t ? p.color : '#e5e0d8'}`,
                              background: emailTone === t ? p.color + '18' : '#fff',
                              color: emailTone === t ? p.color : '#6b7280',
                              cursor: 'pointer', fontSize: 12, fontWeight: 500,
                            }}
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      <div className="form-group" style={{ marginBottom: 8 }}>
                        <label className="form-label" style={{ fontSize: 11 }}>To</label>
                        <input
                          className="form-input"
                          type="email"
                          placeholder="client@example.com"
                          value={emailTo}
                          onChange={e => setEmailTo(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 8 }}>
                        <label className="form-label" style={{ fontSize: 11 }}>Subject</label>
                        <input className="form-input" type="text" value={draft?.subject || ''} readOnly />
                      </div>
                      <div className="form-group" style={{ marginBottom: 8 }}>
                        <label className="form-label" style={{ fontSize: 11 }}>Body</label>
                        <textarea
                          className="form-textarea"
                          style={{ minHeight: 140, fontSize: 13, fontFamily: 'inherit' }}
                          value={draft?.body || ''}
                          readOnly
                        />
                      </div>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`);
                          showToast('Email draft copied to clipboard');
                        }}
                      >
                        <Copy size={12} /> Copy draft
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Starter Templates Gallery ───────────────────────────── */}
      {availableTemplates.length > 0 && (
        <div className="card" style={{ marginBottom: 28 }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a', margin: 0, marginBottom: 4 }}>
              Starter Templates
            </h2>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>
              Pre-built playbooks freelancers often need. Click "Add" to copy into your account.
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {availableTemplates.map(t => {
              const Icon = ICON_MAP[t.icon] || CheckCircle;
              const adopting = adoptingId === t.name;
              return (
                <div
                  key={t.name}
                  style={{
                    border: '1px solid #e5e0d8',
                    borderRadius: 10, padding: 14,
                    background: '#fff', display: 'flex', flexDirection: 'column',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: t.color + '20',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={15} color={t.color} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10, lineHeight: 1.5, flex: 1 }}>
                    {t.description}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>
                    Trigger: <strong>{t.trigger}</strong> · {t.actions.length} actions
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => adoptTemplate(t)}
                    disabled={adopting}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    {adopting ? 'Adding…' : <><Plus size={12} /> Add to my playbooks</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Custom builder ──────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a', margin: 0, marginBottom: 4 }}>
            Build a custom playbook
          </h2>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>
            Combine a trigger with one or more actions to create your own automation.
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Playbook name</label>
          <input
            className="form-input"
            value={builderName}
            onChange={e => setBuilderName(e.target.value)}
            placeholder="e.g. New retainer onboarding"
          />
        </div>

        <div className="form-group">
          <label className="form-label">When this happens (trigger)</label>
          <select
            className="form-select"
            value={builderTrigger}
            onChange={e => setBuilderTrigger(e.target.value)}
          >
            {TRIGGER_OPTIONS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Do this (actions, in order)</label>
          {builderActions.map((action, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <select
                className="form-select"
                style={{ flex: 1 }}
                value={action}
                onChange={e => setBuilderActions(prev => prev.map((a, j) => j === i ? e.target.value : a))}
              >
                {ACTION_OPTIONS.map(a => <option key={a}>{a}</option>)}
              </select>
              {builderActions.length > 1 && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setBuilderActions(prev => prev.filter((_, j) => j !== i))}
                  style={{ color: '#991b1b' }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setBuilderActions(prev => [...prev, 'Send Email'])}
          >
            <Plus size={14} /> Add another action
          </button>
        </div>

        <button
          className="btn btn-primary"
          onClick={createCustomPlaybook}
          disabled={saving || !builderName.trim() || builderActions.length === 0}
        >
          {saving ? 'Creating…' : 'Create playbook'}
        </button>
      </div>

      {/* ── Edit modal ──────────────────────────────────────────── */}
      {editForm && (
        <>
          <div className="overlay" onClick={() => !saving && setEditingId(null)} />
          <div className="slide-panel">
            <div className="slide-panel-header">
              <span className="slide-panel-title">Edit Playbook</span>
              <button className="close-btn" onClick={() => setEditingId(null)}><X size={16} /></button>
            </div>
            <div className="slide-panel-body">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  className="form-input"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Trigger</label>
                <select
                  className="form-select"
                  value={editForm.trigger}
                  onChange={e => setEditForm(f => ({ ...f, trigger: e.target.value }))}
                >
                  {TRIGGER_OPTIONS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={editForm.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Actions</label>
                {editForm.actions.map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <input
                      className="form-input"
                      style={{ flex: 1 }}
                      value={a}
                      onChange={e => setEditForm(f => ({ ...f, actions: f.actions.map((x, j) => j === i ? e.target.value : x) }))}
                    />
                    {editForm.actions.length > 1 && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setEditForm(f => ({ ...f, actions: f.actions.filter((_, j) => j !== i) }))}
                        style={{ color: '#991b1b' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditForm(f => ({ ...f, actions: [...f.actions, 'New action'] }))}
                >
                  <Plus size={14} /> Add action
                </button>
              </div>
              <div className="form-group">
                <label className="form-label">Colour</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {PLAYBOOK_COLORS.map(c => (
                    <div
                      key={c}
                      onClick={() => setEditForm(f => ({ ...f, color: c }))}
                      style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: c, cursor: 'pointer',
                        border: editForm.color === c ? '3px solid #1a1a1a' : '3px solid transparent',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="slide-panel-footer" style={{ justifyContent: 'space-between' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => deletePlaybook(editForm.id, editForm.name)}
                disabled={saving}
                style={{ color: '#991b1b' }}
              >
                <Trash2 size={14} /> Delete
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => setEditingId(null)} disabled={saving}>Cancel</button>
                <button className="btn btn-primary" onClick={saveEdit} disabled={saving || !editForm.name?.trim()}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
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
