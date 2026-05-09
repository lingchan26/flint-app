import { useState } from 'react';
import { CheckCircle, Circle, Clock, ChevronRight, Mail } from 'lucide-react';

const initialSteps = [
  { id: 1, title: 'Add your business name and logo', status: 'complete', description: 'Personalise your workspace with your brand identity.' },
  { id: 2, title: 'Set your default timezone and currency', status: 'complete', description: 'Ensure all dates and amounts display correctly for your region.' },
  { id: 3, title: 'Add your first contact', status: 'in-progress', description: 'Import or add clients and leads to your contact list.' },
  { id: 4, title: 'Create your first project', status: 'not-started', description: 'Set up a project to start tracking deliverables and milestones.' },
  { id: 5, title: 'Set your monthly revenue target', status: 'not-started', description: 'Define your income goals so Flint can track your progress.' },
  { id: 6, title: 'Connect your calendar (Google, Apple, or Outlook)', status: 'not-started', description: 'Sync your external calendar to avoid double-booking.' },
  { id: 7, title: 'Customise your contact form', status: 'not-started', description: 'Configure your public-facing intake form to capture new leads.' },
];

const statusConfig = {
  'complete': { icon: CheckCircle, color: '#10b981', bg: '#d1fae5', label: 'Complete' },
  'in-progress': { icon: Clock, color: '#f59e0b', bg: '#fef3c7', label: 'In Progress' },
  'not-started': { icon: Circle, color: '#9ca3af', bg: '#f3f4f6', label: 'Not started' },
};

const NEXT_STATUS = {
  'not-started': 'in-progress',
  'in-progress': 'complete',
  'complete': 'not-started',
};

const initialNotifPrefs = {
  invoiceOverdue:   { inApp: true, email: true },
  paymentReceived:  { inApp: true, email: false },
  projectDeadline:  { inApp: true, email: true },
  newLead:          { inApp: true, email: true },
  discoveryReminder:{ inApp: false, email: true },
  flintBrief:       { inApp: false, email: true },
};

const notifItems = [
  { key: 'invoiceOverdue',    label: 'Invoice overdue',                description: 'Notify when an invoice is past due date' },
  { key: 'paymentReceived',   label: 'Payment received',               description: 'Notify when a client payment is confirmed' },
  { key: 'projectDeadline',   label: 'Project deadline in 7 days',     description: 'Advance warning before project due dates' },
  { key: 'newLead',           label: 'New lead form submission',        description: 'Alert when someone fills out your lead form' },
  { key: 'discoveryReminder', label: 'Discovery call reminder',         description: 'Remind you before a scheduled discovery call' },
  { key: 'flintBrief',        label: 'Flint Brief daily email',         description: 'Your daily business digest at 7:00 AM SGT' },
];

export default function Setup({ onNavigate }) {
  const [steps, setSteps] = useState(initialSteps);
  const [briefEnabled, setBriefEnabled] = useState(true);
  const [briefTime, setBriefTime] = useState('07:00');
  const [briefTimezone, setBriefTimezone] = useState('SGT');
  const [briefSections, setBriefSections] = useState({
    schedule: true, financial: true, pipeline: true, actions: true,
  });
  const [notifPrefs, setNotifPrefs] = useState(initialNotifPrefs);
  const [savedBrief, setSavedBrief] = useState(false);

  const completed = steps.filter(s => s.status === 'complete').length;
  const progress = (completed / steps.length) * 100;

  const cycleStatus = (id) => {
    setSteps(ss => ss.map(s => s.id === id ? { ...s, status: NEXT_STATUS[s.status] } : s));
  };

  const navForStep = (id) => {
    const navMap = { 3: 'contacts', 4: 'projects', 5: 'finance', 7: 'forms' };
    return navMap[id];
  };

  const toggleNotif = (key, type) => {
    setNotifPrefs(p => ({
      ...p,
      [key]: { ...p[key], [type]: !p[key][type] },
    }));
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Setup</h1>
        <span style={{ fontSize: 14, color: '#6b7280' }}>{completed} of {steps.length} complete</span>
      </div>

      {/* Progress */}
      <div className="card" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Onboarding Progress</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#f59e0b' }}>{Math.round(progress)}%</div>
        </div>
        <div className="progress-bar" style={{ height: 12, marginBottom: 8 }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div style={{ fontSize: 13, color: '#9ca3af' }}>
          {completed === steps.length
            ? "You're all set! Flint is ready to go."
            : `${steps.length - completed} step${steps.length - completed !== 1 ? 's' : ''} remaining to complete your setup.`}
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {steps.map((step, i) => {
          const cfg = statusConfig[step.status];
          const Icon = cfg.icon;
          const dest = navForStep(step.id);
          return (
            <div
              key={step.id}
              className="card"
              style={{
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                opacity: step.status === 'complete' ? 0.75 : 1,
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: cfg.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={18} color={cfg.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 600, fontSize: 14,
                  textDecoration: step.status === 'complete' ? 'line-through' : 'none',
                  color: step.status === 'complete' ? '#9ca3af' : '#1a1a1a',
                  marginBottom: 3,
                }}>
                  {i + 1}. {step.title}
                </div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>{step.description}</div>
              </div>
              <div
                onClick={() => cycleStatus(step.id)}
                style={{
                  background: cfg.bg, color: cfg.color,
                  padding: '4px 12px', borderRadius: 20,
                  fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none', flexShrink: 0,
                }}
                title="Click to cycle status"
              >
                {cfg.label}
              </div>
              {dest && step.status !== 'complete' && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onNavigate(dest)}
                  style={{ flexShrink: 0 }}
                >
                  Go <ChevronRight size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Calendar Connections */}
      <div className="card" style={{ marginBottom: 32 }}>
        <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Calendar Connections</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            {
              name: 'Google Calendar',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect width="24" height="24" rx="4" fill="#fff" stroke="#e5e0d8" />
                  <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fill="#4285F4">G</text>
                </svg>
              ),
              color: '#4285F4',
            },
            {
              name: 'Apple Calendar',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect width="24" height="24" rx="4" fill="#fff" stroke="#e5e0d8" />
                  <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1a1a1a"></text>
                </svg>
              ),
              color: '#1a1a1a',
            },
            {
              name: 'Microsoft Outlook / Office 365',
              iconComponent: Mail,
              color: '#0078D4',
            },
          ].map((cal, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', border: '1px solid #e5e0d8', borderRadius: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: cal.color + '15',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {cal.iconComponent
                    ? <cal.iconComponent size={18} color={cal.color} />
                    : cal.icon}
                </div>
                <span style={{ fontWeight: 500, fontSize: 14 }}>{cal.name}</span>
              </div>
              <button className="btn btn-secondary btn-sm">Connect</button>
            </div>
          ))}
        </div>
      </div>

      {/* Flint Brief Configuration */}
      <div className="card" style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Flint Brief</div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>Your daily business digest, delivered like a PA</div>
        </div>

        {/* Preview */}
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10,
          padding: 16, marginBottom: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#78350f', marginBottom: 10 }}>
            Good morning, Ling ☀️ — Here's your Monday
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { bold: 'Today', text: 'Discovery call with Bloom Foods at 10am · Proposal for Novu Tech due today' },
              { bold: 'This week', text: '28 hrs booked of your 40hr capacity · S$12,400 in payments expected' },
              { bold: 'Action', text: "You haven't followed up with Kova Studio in 34 days — they're a repeat client" },
            ].map((item, i) => (
              <div key={i} style={{ fontSize: 13, color: '#78350f', display: 'flex', gap: 8 }}>
                <span style={{ flexShrink: 0 }}>•</span>
                <span><strong>{item.bold}:</strong> {item.text}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 10, fontStyle: 'italic' }}>
            Preview of your Flint Brief email
          </div>
        </div>

        {/* Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
              <label className="form-label">Send time</label>
              <input
                className="form-input"
                type="time"
                value={briefTime}
                onChange={e => setBriefTime(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
              <label className="form-label">Timezone</label>
              <select className="form-select" value={briefTimezone} onChange={e => setBriefTimezone(e.target.value)}>
                {['SGT', 'AEST', 'MYT', 'ICT', 'GMT', 'EST', 'PST'].map(tz => <option key={tz}>{tz}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', marginBottom: 10 }}>Include sections</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { key: 'schedule', label: "Today's schedule" },
                { key: 'financial', label: 'Financial pulse' },
                { key: 'pipeline', label: 'Pipeline nudges' },
                { key: 'actions', label: 'Recommended actions' },
              ].map(item => (
                <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={briefSections[item.key]}
                    onChange={e => setBriefSections(s => ({ ...s, [item.key]: e.target.checked }))}
                    style={{ accentColor: '#f59e0b', width: 15, height: 15 }}
                  />
                  <span style={{ fontSize: 13, color: '#4b5563' }}>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#faf8f4', borderRadius: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>Enable Flint Brief</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>Receive your daily email digest</div>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={briefEnabled} onChange={e => setBriefEnabled(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => { setSavedBrief(true); setTimeout(() => setSavedBrief(false), 2000); }}
        >
          {savedBrief ? '✓ Saved!' : 'Save preferences'}
        </button>
      </div>

      {/* Notification Settings */}
      <div className="card" style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Notifications</div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>Control when and how Flint notifies you</div>
        </div>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid #e5e0d8', marginBottom: 4 }}>
          <div style={{ flex: 1, fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notification</div>
          <div style={{ display: 'flex', gap: 24, fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <span style={{ width: 60, textAlign: 'center' }}>In-app</span>
            <span style={{ width: 60, textAlign: 'center' }}>Email</span>
          </div>
        </div>

        {notifItems.map((item, i) => (
          <div
            key={item.key}
            style={{
              display: 'flex', alignItems: 'center', padding: '14px 0',
              borderBottom: i < notifItems.length - 1 ? '1px solid #f0ece4' : 'none',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>{item.label}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{item.description}</div>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ width: 60, display: 'flex', justifyContent: 'center' }}>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notifPrefs[item.key]?.inApp || false}
                    onChange={() => toggleNotif(item.key, 'inApp')}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div style={{ width: 60, display: 'flex', justifyContent: 'center' }}>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notifPrefs[item.key]?.email || false}
                    onChange={() => toggleNotif(item.key, 'email')}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="card" style={{ marginBottom: 32, background: '#faf8f4', border: '1px dashed #e5e0d8' }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>Getting started tips</div>
        {[
          'You can return to this page at any time from the sidebar.',
          'Use Projects to manage all your client deliverables in one place.',
          'Finance tracks income vs expenses — great for tax season.',
          'The Calendar syncs your project deadlines and meetings.',
          'Flint Brief is your AI-powered PA — configure it above.',
        ].map((tip, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 13, color: '#6b7280' }}>
            <span style={{ color: '#f59e0b', fontWeight: 700, flexShrink: 0 }}>→</span>
            {tip}
          </div>
        ))}
      </div>
    </div>
  );
}
