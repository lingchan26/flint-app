import { useState } from 'react';
import {
  Zap, Play, Pause, Settings, Plus, X, ChevronRight, CheckCircle,
  Clock, Mail, FileText, Calendar, Bell, ArrowRight, Copy, ExternalLink,
  Send, Edit2, List, Trash2,
} from 'lucide-react';

const ICON_MAP = { CheckCircle, Bell, FileText, Mail, Clock };

const initialPlaybooks = [
  {
    id: 1, name: 'New Client Onboarding', active: true,
    trigger: 'Contract Signed',
    actions: ['Send welcome email', 'Send intake questionnaire', 'Create kick-off task', 'Schedule intro call'],
    runsThisMonth: 4, lastRun: '2 days ago',
    description: 'Automatically welcome new clients and kick off the project the moment a contract is signed.',
    color: '#10b981',
    icon: 'CheckCircle',
  },
  {
    id: 2, name: 'Invoice Chase', active: true,
    trigger: 'Invoice Overdue',
    actions: ['Send reminder D+3', 'Send reminder D+7', 'Send reminder D+14', 'Send final notice D+30'],
    runsThisMonth: 3, lastRun: '4 hours ago',
    description: 'Chase unpaid invoices automatically so you never have to awkwardly ask for money.',
    color: '#f59e0b',
    icon: 'Bell',
  },
  {
    id: 3, name: 'Project Wrap-Up', active: false,
    trigger: 'Project Completed',
    actions: ['Send thank you email', 'Request testimonial', 'Create 90-day follow-up task'],
    runsThisMonth: 0, lastRun: 'Never',
    description: 'Leave a lasting impression and keep relationships warm after every project ends.',
    color: '#3b82f6',
    icon: 'FileText',
  },
  {
    id: 4, name: 'Lead Nurture', active: false,
    trigger: 'Lead Form Submitted',
    actions: ['Send acknowledgement email', 'Create project in Discovery', 'Assign follow-up task'],
    runsThisMonth: 0, lastRun: 'Never',
    description: 'Turn every inquiry into a warm conversation without lifting a finger.',
    color: '#8b5cf6',
    icon: 'Mail',
  },
  {
    id: 5, name: 'Proposal Follow-Up', active: false,
    trigger: 'Proposal Sent — No Response After 5 Days',
    actions: ['Send check-in email', 'Add Pipeline Nudge to dashboard'],
    runsThisMonth: 0, lastRun: 'Never',
    description: 'Never let a warm proposal go cold. Automatically follow up when prospects go quiet.',
    color: '#f59e0b',
    icon: 'Clock',
  },
  {
    id: 6, name: 'Payment Received', active: true,
    trigger: 'Invoice Paid',
    actions: ['Send payment receipt', 'Move project to next stage', 'Log to P&L'],
    runsThisMonth: 6, lastRun: 'Yesterday',
    description: 'Celebrate every payment with an instant receipt and automatic project progression.',
    color: '#10b981',
    icon: 'CheckCircle',
  },
];

const activityLog = [
  { id: 1, playbook: 'Invoice Chase', action: 'Reminder sent to Bloom Foods', detail: 'S$4,200 overdue · 23 days', time: '4 hours ago', color: '#f59e0b' },
  { id: 2, playbook: 'Payment Received', action: 'Receipt sent to Kova Studio', detail: 'S$3,600 received · INV-2026-004', time: 'Yesterday', color: '#10b981' },
  { id: 3, playbook: 'Payment Received', action: 'Project moved to Delivery', detail: 'Social Media Kit – Kova Studio', time: 'Yesterday', color: '#10b981' },
  { id: 4, playbook: 'New Client Onboarding', action: 'Welcome email sent to Dave Chen', detail: 'Novu Tech · Website Redesign', time: '2 days ago', color: '#10b981' },
  { id: 5, playbook: 'New Client Onboarding', action: 'Intake questionnaire sent', detail: 'Novu Tech · Website Redesign', time: '2 days ago', color: '#10b981' },
  { id: 6, playbook: 'Invoice Chase', action: 'Final notice sent to Arko Media', detail: 'S$7,800 overdue · 31 days', time: '3 days ago', color: '#ef4444' },
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

function getDraft(action, tone) {
  const templates = {
    'Send welcome email': {
      subject: 'Welcome aboard, {{Client Name}}! 🎉',
      professional: `Hi {{Client Name}},\n\nThank you for confirming our engagement — I'm delighted to be working on {{Project Name}} with you.\n\nHere's what to expect:\n• An intake questionnaire will follow shortly\n• We'll schedule a kick-off call this week\n• You'll receive your first project update within 48 hours\n\nPlease don't hesitate to reach out with any questions.\n\nWarm regards,\n{{Your Name}}`,
      friendly: `Hey {{Client Name}} 👋\n\nSo excited to have you on board! {{Project Name}} is going to be great — I just know it.\n\nHere's the plan:\n• I'll send you a quick questionnaire to get your creative juices flowing\n• We'll hop on a kick-off call this week\n• You'll hear from me within 48 hours with your first update\n\nHave questions? Just hit reply — I'm all ears.\n\nCheers,\n{{Your Name}}`,
      urgent: `Hi {{Client Name}},\n\nContract confirmed — let's move fast.\n\nAction items:\n→ Intake questionnaire incoming (please complete within 24 hrs)\n→ Kick-off call: this week\n→ First update: 48 hrs\n\nTime is our most valuable resource. Let's make the most of it.\n\n{{Your Name}}`,
    },
    'Send intake questionnaire': {
      subject: 'Quick questions before we dive in — {{Project Name}}',
      professional: `Hi {{Client Name}},\n\nTo ensure {{Project Name}} is delivered to your exact vision, I'd appreciate your input on a few key questions.\n\nPlease complete this brief questionnaire at your earliest convenience:\n→ [Questionnaire Link]\n\nThis typically takes 5–10 minutes and helps me hit the ground running.\n\nThank you,\n{{Your Name}}`,
      friendly: `Hey {{Client Name}}!\n\nBefore we dive into {{Project Name}}, I'd love to pick your brain a little. 🧠\n\nThis short questionnaire takes about 5 mins and makes sure we're 100% aligned from day one:\n→ [Questionnaire Link]\n\nNo wrong answers — just your honest thoughts!\n\nThanks,\n{{Your Name}}`,
      urgent: `Hi {{Client Name}},\n\nCritical step before we proceed — please complete this questionnaire within 24 hours so we stay on schedule:\n→ [Questionnaire Link]\n\nAny delays here push back the entire timeline.\n\n{{Your Name}}`,
    },
    'Send reminder D+3': {
      subject: 'Friendly reminder — Invoice #{{Invoice No}} ({{Amount}})',
      professional: `Hi {{Client Name}},\n\nThis is a gentle reminder that Invoice #{{Invoice No}} for {{Amount}} was due on {{Due Date}}.\n\nIf payment has already been sent, please disregard this message.\n\nPayment options: [Payment Link]\n\nThank you,\n{{Your Name}}`,
      friendly: `Hey {{Client Name}},\n\nJust a quick nudge — Invoice #{{Invoice No}} for {{Amount}} was due a few days ago. No stress, just making sure it didn't slip through the cracks!\n\nYou can pay here: [Payment Link]\n\nThanks so much,\n{{Your Name}}`,
      urgent: `Hi {{Client Name}},\n\nInvoice #{{Invoice No}} for {{Amount}} is now 3 days overdue.\n\nPlease process payment today: [Payment Link]\n\nLet me know if there are any issues.\n\n{{Your Name}}`,
    },
    'Send reminder D+7': {
      subject: 'Second notice — Invoice #{{Invoice No}} overdue',
      professional: `Hi {{Client Name}},\n\nI wanted to follow up regarding Invoice #{{Invoice No}} for {{Amount}}, which is now 7 days past due.\n\nCould you please confirm a payment date? I'm happy to discuss if there are any concerns.\n\nPayment link: [Payment Link]\n\nThank you,\n{{Your Name}}`,
      friendly: `Hey {{Client Name}},\n\nFollowing up again on Invoice #{{Invoice No}} — it's been a week since the due date. Could you let me know when to expect payment?\n\nHere's the link for convenience: [Payment Link]\n\nThanks!\n{{Your Name}}`,
      urgent: `Hi {{Client Name}},\n\nInvoice #{{Invoice No}} for {{Amount}} is now 7 days overdue. This requires immediate attention.\n\nPlease make payment today: [Payment Link]\n\nIf there's a dispute, reply to this email now.\n\n{{Your Name}}`,
    },
    'Send final notice D+30': {
      subject: '⚠️ Final notice — Invoice #{{Invoice No}} 30 days overdue',
      professional: `Hi {{Client Name}},\n\nDespite previous reminders, Invoice #{{Invoice No}} for {{Amount}} remains unpaid 30 days after the due date.\n\nThis is a final notice. Please arrange payment within 5 business days, or contact me immediately to discuss a resolution.\n\nPayment link: [Payment Link]\n\nRegards,\n{{Your Name}}`,
      friendly: `Hi {{Client Name}},\n\nI really hate to send this, but Invoice #{{Invoice No}} for {{Amount}} is now 30 days overdue. I need to resolve this — can we talk?\n\nPayment: [Payment Link]\n\nPlease reach out if anything is wrong.\n\n{{Your Name}}`,
      urgent: `{{Client Name}},\n\nFinal notice. Invoice #{{Invoice No}} for {{Amount}} is 30 days overdue.\n\nPayment required within 5 business days or this will be escalated.\n\n[Payment Link]\n\n{{Your Name}}`,
    },
    'Send thank you email': {
      subject: "It's been a pleasure — {{Project Name}} ✨",
      professional: `Hi {{Client Name}},\n\nNow that {{Project Name}} is complete, I wanted to take a moment to express my sincere gratitude.\n\nIt was a pleasure collaborating with you. I hope the deliverables meet and exceed your expectations.\n\nShould you ever need support in the future, please don't hesitate to get in touch.\n\nWarm regards,\n{{Your Name}}`,
      friendly: `Hey {{Client Name}} 🎉\n\nWe did it! {{Project Name}} is officially a wrap and honestly — I loved every bit of it.\n\nYou were brilliant to work with. If there's anything else I can ever do, you know where to find me!\n\nUntil next time,\n{{Your Name}}`,
      urgent: `Hi {{Client Name}},\n\n{{Project Name}} is complete. Thank you for your business.\n\nFinal files are delivered. Please reach out within 7 days with any revisions per our agreement.\n\n{{Your Name}}`,
    },
    'Request testimonial': {
      subject: 'Would you share a quick review? (2 mins)',
      professional: `Hi {{Client Name}},\n\nI hope you're enjoying the results of {{Project Name}}.\n\nIf you're satisfied with the work, I'd be deeply grateful if you could take a moment to share a brief testimonial — it truly makes a difference for independent professionals.\n\n→ [Testimonial Link]\n\nThank you in advance.\n\n{{Your Name}}`,
      friendly: `Hey {{Client Name}}!\n\nHope things are going great since we wrapped up {{Project Name}} 😊\n\nIf you're happy with how it turned out, would you be up for leaving a quick review? Takes literally 2 minutes and means the absolute world to me.\n\n→ [Testimonial Link]\n\nNo pressure at all — but I'd love it!\n\n{{Your Name}}`,
      urgent: `Hi {{Client Name}},\n\nQuick ask — if you're happy with {{Project Name}}, a testimonial would help immensely right now.\n\n→ [Testimonial Link] (2 minutes, no account needed)\n\nThank you!\n{{Your Name}}`,
    },
    'Send acknowledgement email': {
      subject: "Got your enquiry — I'll be in touch shortly",
      professional: `Hi {{Client Name}},\n\nThank you for reaching out. I've received your enquiry and will review it carefully.\n\nYou can expect to hear from me within 24–48 business hours.\n\nRegards,\n{{Your Name}}`,
      friendly: `Hey {{Client Name}} 👋\n\nThanks so much for getting in touch! I've received your message and I'm really excited to learn more.\n\nI'll be in touch within a day or two — can't wait to chat!\n\n{{Your Name}}`,
      urgent: `Hi {{Client Name}},\n\nEnquiry received. I'll review and respond within 24 hours.\n\n{{Your Name}}`,
    },
    'Send check-in email': {
      subject: 'Checking in on our proposal — {{Project Name}}',
      professional: `Hi {{Client Name}},\n\nI wanted to follow up on the proposal I sent for {{Project Name}}.\n\nI understand you're likely evaluating options, and I'm happy to answer any questions or clarify anything in the proposal.\n\nLooking forward to hearing your thoughts.\n\n{{Your Name}}`,
      friendly: `Hey {{Client Name}}!\n\nJust wanted to check in on the proposal for {{Project Name}} — totally understand if things are busy!\n\nIf you have any questions or want to talk through anything, I'm always happy to jump on a quick call.\n\nHope to hear from you soon!\n{{Your Name}}`,
      urgent: `Hi {{Client Name}},\n\nFollowing up on the proposal for {{Project Name}} sent 5 days ago.\n\nAre you still interested? I have limited availability this quarter and need to plan accordingly.\n\n{{Your Name}}`,
    },
    'Send payment receipt': {
      subject: 'Payment received — Receipt for INV-{{Invoice No}}',
      professional: `Hi {{Client Name}},\n\nThis is to confirm that your payment of {{Amount}} for Invoice #{{Invoice No}} has been received.\n\nThank you for your prompt payment. A formal receipt is attached.\n\nRegards,\n{{Your Name}}`,
      friendly: `Hey {{Client Name}}!\n\nPayment received — thank you! 🙏\n\nHere's your receipt for {{Amount}} (INV-{{Invoice No}}). All good on our end.\n\nLet me know if you need anything else!\n{{Your Name}}`,
      urgent: `{{Client Name}},\n\nPayment of {{Amount}} confirmed for INV-{{Invoice No}}.\n\nReceipt attached.\n\n{{Your Name}}`,
    },
  };

  const t = templates[action];
  if (!t) {
    return {
      subject: 'Re: {{Project Name}}',
      body: `Hi {{Client Name}},\n\nI wanted to reach out regarding {{Project Name}}.\n\n[Your message here]\n\nBest,\n{{Your Name}}`,
    };
  }
  const toneKey = tone === 'Professional' ? 'professional' : tone === 'Friendly' ? 'friendly' : 'urgent';
  return { subject: t.subject, body: t[toneKey] || t.professional };
}

const isEmailAction = (action) =>
  action.toLowerCase().includes('send') ||
  action.toLowerCase().includes('request') ||
  action.toLowerCase().includes('email');

export default function Autopilot() {
  const [playbooks, setPlaybooks] = useState(initialPlaybooks);
  const [toast, setToast] = useState('');

  // Custom builder state
  const [builderTrigger, setBuilderTrigger] = useState('Contract Signed');
  const [builderActions, setBuilderActions] = useState(['Send Email']);
  const [builderName, setBuilderName] = useState('');

  // Panel state
  const [emailPanel, setEmailPanel] = useState(null); // { action, playbook }
  const [emailTo, setEmailTo] = useState('');
  const [emailTone, setEmailTone] = useState('Friendly');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [viewingLogId, setViewingLogId] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const togglePlaybook = (id) => {
    setPlaybooks(prev => prev.map(p => {
      if (p.id !== id) return p;
      const next = { ...p, active: !p.active };
      showToast(next.active ? `"${p.name}" activated` : `"${p.name}" paused`);
      return next;
    }));
  };

  const openEdit = (p) => {
    setEditForm({ ...p, actions: [...p.actions] });
    setEditingId(p.id);
    setViewingLogId(null);
    setEmailPanel(null);
  };

  const saveEdit = () => {
    setPlaybooks(prev => prev.map(p => p.id === editForm.id ? { ...editForm } : p));
    setEditingId(null);
    setEditForm(null);
    showToast('Playbook updated!');
  };

  const openEmailPanel = (action, playbook) => {
    setEmailPanel({ action, playbook });
    setEmailTo('');
    setEmailTone('Friendly');
    setEditingId(null);
    setViewingLogId(null);
  };

  const copyEmail = () => {
    const d = getDraft(emailPanel.action, emailTone);
    navigator.clipboard?.writeText(`Subject: ${d.subject}\n\n${d.body}`);
    showToast('Email copied to clipboard!');
  };

  const openInGmail = () => {
    const d = getDraft(emailPanel.action, emailTone);
    const url = `https://mail.google.com/mail/?view=cm&su=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(d.body)}${emailTo ? `&to=${encodeURIComponent(emailTo)}` : ''}`;
    window.open(url, '_blank');
  };

  const addBuilderAction = () => {
    if (builderActions.length >= 5) return;
    setBuilderActions(prev => [...prev, 'Send Email']);
  };

  const updateBuilderAction = (index, val) => {
    setBuilderActions(prev => prev.map((a, i) => i === index ? val : a));
  };

  const removeBuilderAction = (index) => {
    setBuilderActions(prev => prev.filter((_, i) => i !== index));
  };

  const savePlaybook = () => {
    if (!builderName.trim()) { showToast('Please enter a playbook name.'); return; }
    const newPb = {
      id: Date.now(),
      name: builderName,
      active: false,
      trigger: builderTrigger,
      actions: builderActions,
      runsThisMonth: 0,
      lastRun: 'Never',
      description: 'Custom playbook.',
      color: '#8b5cf6',
      icon: 'CheckCircle',
    };
    setPlaybooks(prev => [...prev, newPb]);
    setBuilderName('');
    setBuilderActions(['Send Email']);
    showToast(`Playbook "${builderName}" saved!`);
  };

  const activeCount = playbooks.filter(p => p.active).length;
  const totalRuns = playbooks.reduce((s, p) => s + p.runsThisMonth, 0);

  const viewingLogPlaybook = playbooks.find(p => p.id === viewingLogId);
  const filteredLog = viewingLogId
    ? activityLog.filter(l => l.playbook === viewingLogPlaybook?.name)
    : [];

  const panelOpen = !!emailPanel || !!editingId || !!viewingLogId;

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: '#f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={20} color="#fff" fill="#fff" />
            </div>
            Autopilot
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginLeft: 46 }}>
            Your business runs itself
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => document.getElementById('autopilot-builder')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <Plus size={16} /> New Playbook
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Active Playbooks', value: activeCount, color: '#10b981', bg: '#d1fae5', icon: <Zap size={18} color="#10b981" /> },
          { label: 'Runs This Month', value: totalRuns, color: '#f59e0b', bg: '#fef3c7', icon: <Play size={18} color="#f59e0b" /> },
          { label: 'Hours Saved Est.', value: '~4.2 hrs', color: '#8b5cf6', bg: '#ede9fe', icon: <Clock size={18} color="#8b5cf6" /> },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              {s.icon}
            </div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Playbooks Section */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Playbooks</h2>
          <span style={{ fontSize: 13, color: '#9ca3af' }}>{activeCount} of {playbooks.length} active</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {playbooks.map(p => {
            const IconComponent = ICON_MAP[p.icon] || CheckCircle;
            const isEditing = editingId === p.id;
            const isViewingLog = viewingLogId === p.id;
            const isEmailOpen = emailPanel?.playbook?.id === p.id;
            const isHighlighted = isEditing || isViewingLog || isEmailOpen;
            return (
              <div
                key={p.id}
                style={{
                  background: '#fff',
                  border: `1px solid ${isHighlighted ? p.color : '#e5e0d8'}`,
                  borderRadius: 14,
                  boxShadow: isHighlighted
                    ? `0 0 0 3px ${p.color}22`
                    : '0 1px 4px rgba(0,0,0,0.05)',
                  display: 'flex',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => { if (!isHighlighted) e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { if (!isHighlighted) e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; }}
              >
                {/* Left color bar */}
                <div style={{ width: 4, background: p.active ? p.color : '#d1d5db', flexShrink: 0 }} />

                {/* Content */}
                <div style={{ flex: 1, padding: '16px 18px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    {/* Icon */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: p.active ? `${p.color}1a` : '#f3f4f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <IconComponent size={18} color={p.active ? p.color : '#9ca3af'} />
                    </div>

                    {/* Title + desc */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: p.active ? '#1a1a1a' : '#6b7280', marginBottom: 2 }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.4, marginBottom: 10,
                        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                        {p.description}
                      </div>

                      {/* Trigger badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                        <span style={{
                          background: '#1a1a1a', color: '#fff',
                          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          <Zap size={10} fill="#f59e0b" color="#f59e0b" /> {p.trigger}
                        </span>
                      </div>

                      {/* Action chips — clickable */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                        {p.actions.map((action, ai) => {
                          const isEmail = isEmailAction(action);
                          const isActive = emailPanel?.action === action && emailPanel?.playbook?.id === p.id;
                          return (
                            <button
                              key={ai}
                              onClick={() => isEmail ? openEmailPanel(action, p) : undefined}
                              style={{
                                background: isActive ? `${p.color}22` : '#f3f4f6',
                                color: isActive ? p.color : '#4b5563',
                                border: isActive ? `1.5px solid ${p.color}` : '1.5px solid transparent',
                                padding: '3px 10px', borderRadius: 20, fontSize: 11,
                                cursor: isEmail ? 'pointer' : 'default',
                                display: 'flex', alignItems: 'center', gap: 4,
                                fontFamily: 'inherit', fontWeight: 500,
                                transition: 'background 0.15s, border-color 0.15s',
                              }}
                              title={isEmail ? `Open email draft for "${action}"` : action}
                            >
                              {isEmail && <Mail size={10} />}
                              {action}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right: toggle + stats + buttons */}
                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                      {/* Toggle */}
                      <div
                        onClick={() => togglePlaybook(p.id)}
                        title={p.active ? 'Pause playbook' : 'Activate playbook'}
                        style={{
                          width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                          background: p.active ? '#f59e0b' : '#d1d5db',
                          position: 'relative', transition: 'background 0.2s',
                          flexShrink: 0,
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: 3, left: p.active ? 22 : 3,
                          width: 18, height: 18, borderRadius: '50%', background: '#fff',
                          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }} />
                      </div>

                      {/* Stats */}
                      <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'right', lineHeight: 1.5 }}>
                        <div>{p.runsThisMonth} runs this month</div>
                        <div>Last run: {p.lastRun}</div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, background: isEditing ? '#f3f4f6' : undefined }}
                          onClick={() => editingId === p.id ? setEditingId(null) : openEdit(p)}
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, background: isViewingLog ? '#f3f4f6' : undefined }}
                          onClick={() => viewingLogId === p.id ? setViewingLogId(null) : (setViewingLogId(p.id), setEditingId(null), setEmailPanel(null))}
                        >
                          <List size={12} /> View Log
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Log */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">
          <div className="card-title">Autopilot Activity</div>
          <button className="btn btn-ghost btn-sm">View All</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {activityLog.map((item, i) => (
            <div
              key={item.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0',
                borderBottom: i < activityLog.length - 1 ? '1px solid #f0ece4' : 'none',
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>{item.playbook}</span>
                  <span style={{ fontSize: 13, color: '#1a1a1a' }}>{item.action}</span>
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{item.detail}</div>
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0 }}>{item.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Builder */}
      <div id="autopilot-builder" className="card" style={{ marginBottom: 24 }}>
        <div className="card-header" style={{ marginBottom: 4 }}>
          <div>
            <div className="card-title">Build a Custom Playbook</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
              Design your own automation in under a minute
            </div>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: '#ede9fe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Plus size={18} color="#8b5cf6" />
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Playbook Name</label>
            <input
              className="form-input"
              placeholder="e.g. My Custom Automation"
              value={builderName}
              onChange={e => setBuilderName(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={14} color="#f59e0b" fill="#f59e0b" />
              When:
            </label>
            <select
              className="form-select"
              value={builderTrigger}
              onChange={e => setBuilderTrigger(e.target.value)}
            >
              {TRIGGER_OPTIONS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <ArrowRight size={14} color="#6b7280" />
              Then do:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {builderActions.map((action, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', background: '#fef3c7',
                    color: '#92400e', fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <select
                    className="form-select"
                    value={action}
                    onChange={e => updateBuilderAction(i, e.target.value)}
                    style={{ flex: 1 }}
                  >
                    {ACTION_OPTIONS.map(a => <option key={a}>{a}</option>)}
                  </select>
                  {builderActions.length > 1 && (
                    <button
                      onClick={() => removeBuilderAction(i)}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: '#9ca3af', padding: 4, display: 'flex', alignItems: 'center',
                        borderRadius: 4,
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {builderActions.length < 5 && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={addBuilderAction}
                style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Plus size={13} /> Add Action
              </button>
            )}
          </div>

          <button
            className="btn btn-primary"
            onClick={savePlaybook}
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          >
            Save Playbook
          </button>

          <div style={{
            marginTop: 14, padding: '10px 14px',
            background: '#faf8f4', border: '1px solid #e5e0d8', borderRadius: 8,
            fontSize: 12, color: '#6b7280', lineHeight: 1.5,
          }}>
            In production, Autopilot connects to your email (Gmail/Outlook), calendar (Google/Outlook), and Flint's notification system.
          </div>
        </div>
      </div>

      {/* ── Email Draft Panel ── */}
      {emailPanel && (() => {
        const draft = getDraft(emailPanel.action, emailTone);
        return (
          <>
            <div className="overlay" onClick={() => setEmailPanel(null)} />
            <div className="slide-panel" style={{ width: 480 }}>
              <div className="slide-panel-header">
                <div>
                  <div className="slide-panel-title">Draft Email</div>
                  <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>{emailPanel.action}</div>
                </div>
                <button className="close-btn" onClick={() => setEmailPanel(null)}><X size={16} /></button>
              </div>
              <div className="slide-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Tone selector */}
                <div>
                  <label className="form-label" style={{ marginBottom: 6 }}>Tone</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['Professional', 'Friendly', 'Urgent'].map(t => (
                      <button
                        key={t}
                        onClick={() => setEmailTone(t)}
                        style={{
                          padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                          border: `1.5px solid ${emailTone === t ? emailPanel.playbook.color : 'var(--border)'}`,
                          background: emailTone === t ? `${emailPanel.playbook.color}18` : '#fff',
                          color: emailTone === t ? emailPanel.playbook.color : 'var(--slate-500)',
                          cursor: 'pointer',
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* To */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">To</label>
                  <input
                    className="form-input"
                    placeholder="client@email.com"
                    value={emailTo}
                    onChange={e => setEmailTo(e.target.value)}
                  />
                </div>

                {/* Subject */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Subject</label>
                  <input
                    className="form-input"
                    value={draft.subject}
                    readOnly
                    style={{ background: 'var(--slate-50)', color: 'var(--slate-600)' }}
                  />
                </div>

                {/* Body */}
                <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                  <label className="form-label">
                    Body
                    <span style={{ fontSize: 11, color: 'var(--slate-400)', float: 'right', fontWeight: 400 }}>
                      {'{{placeholders}} auto-filled on send'}
                    </span>
                  </label>
                  <textarea
                    className="form-textarea"
                    value={draft.body}
                    readOnly
                    style={{ minHeight: 260, resize: 'none', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.6, background: 'var(--slate-50)' }}
                  />
                </div>

                <div style={{
                  padding: '10px 12px', background: '#fffbeb', border: '1px solid #fde68a',
                  borderRadius: 8, fontSize: 12, color: '#92400e',
                }}>
                  💡 This email runs automatically when the trigger fires. You can also send it manually below.
                </div>
              </div>
              <div className="slide-panel-footer" style={{ gap: 8 }}>
                <button className="btn btn-secondary" onClick={copyEmail} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Copy size={14} /> Copy
                </button>
                <button className="btn btn-secondary" onClick={openInGmail} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ExternalLink size={14} /> Open in Gmail
                </button>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={() => { showToast('Email queued for next trigger run!'); setEmailPanel(null); }}>
                  <Send size={14} /> Queue Send
                </button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Edit Playbook Panel ── */}
      {editingId && editForm && (
        <>
          <div className="overlay" onClick={() => { setEditingId(null); setEditForm(null); }} />
          <div className="slide-panel">
            <div className="slide-panel-header">
              <div className="slide-panel-title">Edit Playbook</div>
              <button className="close-btn" onClick={() => { setEditingId(null); setEditForm(null); }}><X size={16} /></button>
            </div>
            <div className="slide-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Playbook Name</label>
                <input className="form-input" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Trigger</label>
                <select className="form-select" value={editForm.trigger} onChange={e => setEditForm(f => ({ ...f, trigger: e.target.value }))}>
                  {TRIGGER_OPTIONS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={editForm.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  style={{ minHeight: 70, resize: 'none' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: 8 }}>Actions</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {editForm.actions.map((action, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', background: '#fef3c7',
                        color: '#92400e', fontSize: 11, fontWeight: 700, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{i + 1}</div>
                      <input
                        className="form-input"
                        value={action}
                        onChange={e => setEditForm(f => ({ ...f, actions: f.actions.map((a, j) => j === i ? e.target.value : a) }))}
                        style={{ flex: 1 }}
                      />
                      {editForm.actions.length > 1 && (
                        <button
                          onClick={() => setEditForm(f => ({ ...f, actions: f.actions.filter((_, j) => j !== i) }))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', display: 'flex' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  {editForm.actions.length < 8 && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setEditForm(f => ({ ...f, actions: [...f.actions, 'New action'] }))}
                      style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Plus size={13} /> Add action
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: 8 }}>Colour</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {PLAYBOOK_COLORS.map(c => (
                    <div
                      key={c}
                      onClick={() => setEditForm(f => ({ ...f, color: c }))}
                      style={{
                        width: 26, height: 26, borderRadius: '50%', background: c,
                        cursor: 'pointer',
                        border: editForm.color === c ? '3px solid var(--slate-900)' : '3px solid transparent',
                        boxSizing: 'border-box',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--slate-50)', borderRadius: 10 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Active</div>
                  <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>Playbook runs automatically when triggered</div>
                </div>
                <div
                  onClick={() => setEditForm(f => ({ ...f, active: !f.active }))}
                  style={{
                    width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                    background: editForm.active ? '#f59e0b' : '#d1d5db',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 3, left: editForm.active ? 22 : 3,
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </div>
              </div>
            </div>
            <div className="slide-panel-footer">
              <button className="btn btn-secondary" onClick={() => { setEditingId(null); setEditForm(null); }}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </>
      )}

      {/* ── View Log Panel ── */}
      {viewingLogId && viewingLogPlaybook && (
        <>
          <div className="overlay" onClick={() => setViewingLogId(null)} />
          <div className="slide-panel">
            <div className="slide-panel-header">
              <div>
                <div className="slide-panel-title">Activity Log</div>
                <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>{viewingLogPlaybook.name}</div>
              </div>
              <button className="close-btn" onClick={() => setViewingLogId(null)}><X size={16} /></button>
            </div>
            <div className="slide-panel-body">
              {filteredLog.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--slate-400)' }}>
                  <List size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>No activity yet</div>
                  <div style={{ fontSize: 13 }}>This playbook hasn't run yet. Activate it to start logging.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {filteredLog.map((item, i) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                        padding: '14px 0',
                        borderBottom: i < filteredLog.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: `${item.color}22`, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--slate-900)', marginBottom: 2 }}>{item.action}</div>
                        <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>{item.detail}</div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--slate-400)', flexShrink: 0, marginTop: 2 }}>{item.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="slide-panel-footer">
              <button className="btn btn-secondary" onClick={() => setViewingLogId(null)}>Close</button>
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast" style={{ borderLeft: '4px solid #10b981' }}>
          <CheckCircle size={16} color="#10b981" />
          {toast}
        </div>
      )}
    </div>
  );
}
