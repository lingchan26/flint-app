import { useState } from 'react';
import {
  Zap, Play, Pause, Settings, Plus, X, ChevronRight, CheckCircle,
  Clock, Mail, FileText, Calendar, Bell, ArrowRight,
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

export default function Autopilot() {
  const [playbooks, setPlaybooks] = useState(initialPlaybooks);
  const [toast, setToast] = useState('');

  // Custom builder state
  const [builderTrigger, setBuilderTrigger] = useState('Contract Signed');
  const [builderActions, setBuilderActions] = useState(['Send Email']);
  const [builderName, setBuilderName] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const togglePlaybook = (id) => {
    setPlaybooks(prev => prev.map(p => {
      if (p.id !== id) return p;
      const next = { ...p, active: !p.active };
      showToast(next.active ? `"${p.name}" activated` : `"${p.name}" paused`);
      return next;
    }));
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
            const visibleActions = p.actions.slice(0, 3);
            const extraActions = p.actions.length - 3;
            return (
              <div
                key={p.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e5e0d8',
                  borderRadius: 14,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  display: 'flex',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'}
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

                      {/* Action pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                        {visibleActions.map((action, ai) => (
                          <span key={ai} style={{
                            background: '#f3f4f6', color: '#4b5563',
                            padding: '3px 10px', borderRadius: 20, fontSize: 11,
                          }}>
                            {action}
                          </span>
                        ))}
                        {extraActions > 0 && (
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>+{extraActions} more</span>
                        )}
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
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>Edit</button>
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>View Log</button>
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
              {/* Colored dot */}
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>{item.playbook}</span>
                  <span style={{ fontSize: 13, color: '#1a1a1a' }}>{item.action}</span>
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{item.detail}</div>
              </div>

              {/* Time */}
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
          {/* Playbook name */}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Playbook Name</label>
            <input
              className="form-input"
              placeholder="e.g. My Custom Automation"
              value={builderName}
              onChange={e => setBuilderName(e.target.value)}
            />
          </div>

          {/* When: trigger */}
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

          {/* Then do: actions */}
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

          {/* Save button */}
          <button
            className="btn btn-primary"
            onClick={savePlaybook}
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          >
            Save Playbook
          </button>

          {/* Note */}
          <div style={{
            marginTop: 14, padding: '10px 14px',
            background: '#faf8f4', border: '1px solid #e5e0d8', borderRadius: 8,
            fontSize: 12, color: '#6b7280', lineHeight: 1.5,
          }}>
            In production, Autopilot connects to your email (Gmail/Outlook), calendar (Google/Outlook), and Flint's notification system.
          </div>
        </div>
      </div>

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
