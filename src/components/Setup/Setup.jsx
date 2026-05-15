import { useState, useEffect, useMemo } from 'react';
import { CheckCircle, Circle, ChevronRight, Loader, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

/* ─── default preferences (used when profile has none yet) ─────────────── */

const DEFAULT_NOTIF_PREFS = {
  invoiceOverdue:    { inApp: true,  email: true },
  paymentReceived:   { inApp: true,  email: false },
  projectDeadline:   { inApp: true,  email: true },
  newLead:           { inApp: true,  email: true },
  discoveryReminder: { inApp: false, email: true },
  flintBrief:        { inApp: false, email: true },
};

const DEFAULT_BRIEF_SECTIONS = {
  schedule: true, financial: true, pipeline: true, actions: true,
};

const NOTIF_ITEMS = [
  { key: 'invoiceOverdue',    label: 'Invoice overdue',             description: 'Notify when an invoice is past due date' },
  { key: 'paymentReceived',   label: 'Payment received',            description: 'Notify when a client payment is confirmed' },
  { key: 'projectDeadline',   label: 'Project deadline in 7 days',  description: 'Advance warning before project due dates' },
  { key: 'newLead',           label: 'New lead form submission',    description: 'Alert when someone fills out your lead form' },
  { key: 'discoveryReminder', label: 'Discovery call reminder',     description: 'Remind you before a scheduled discovery call' },
  { key: 'flintBrief',        label: 'Flint Brief daily email',     description: 'Your daily business digest, scheduled below' },
];

const BRIEF_SECTION_LIST = [
  { key: 'schedule',  label: "Today's schedule" },
  { key: 'financial', label: 'Financial pulse' },
  { key: 'pipeline',  label: 'Pipeline nudges' },
  { key: 'actions',   label: 'Recommended actions' },
];

/* ─── component ────────────────────────────────────────────────────────── */

export default function Setup({ onNavigate, session }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real counts that drive step completion
  const [counts, setCounts] = useState({ contacts: 0, projects: 0 });

  // Profile fields
  const [profile, setProfile] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [timezone, setTimezone] = useState('Asia/Singapore');
  const [currency, setCurrency] = useState('SGD');
  const [revenueTarget, setRevenueTarget] = useState('');

  // Flint Brief settings
  const [briefEnabled, setBriefEnabled] = useState(true);
  const [briefTime, setBriefTime] = useState('07:00');
  const [briefTimezone, setBriefTimezone] = useState('SGT');
  const [briefSections, setBriefSections] = useState(DEFAULT_BRIEF_SECTIONS);

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState(DEFAULT_NOTIF_PREFS);

  // Save state per card
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [savingBrief, setSavingBrief] = useState(false);
  const [savedBrief, setSavedBrief] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [savedNotifs, setSavedNotifs] = useState(false);

  /* ─── load profile + counts on mount ──────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const userId = session?.user?.id;
        if (!userId) {
          throw new Error('Not signed in');
        }

        const [profileRes, contactsRes, projectsRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
          supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('archived', false),
          supabase.from('projects').select('id', { count: 'exact', head: true }).eq('archived', false),
        ]);

        if (cancelled) return;
        if (profileRes.error) throw profileRes.error;

        const p = profileRes.data || {};
        setProfile(p);
        setBusinessName(p.business_name || '');
        setLogoUrl(p.logo_url || '');
        setTimezone(p.timezone || 'Asia/Singapore');
        setCurrency(p.currency || 'SGD');
        setRevenueTarget(p.monthly_revenue_target != null ? String(p.monthly_revenue_target) : '');
        setBriefEnabled(p.flint_brief_enabled !== false);
        setBriefTime((p.flint_brief_time || '07:00:00').slice(0, 5));
        setBriefTimezone(p.flint_brief_timezone || 'SGT');

        const sections = (p.flint_brief_sections && Object.keys(p.flint_brief_sections).length > 0)
          ? { ...DEFAULT_BRIEF_SECTIONS, ...p.flint_brief_sections }
          : DEFAULT_BRIEF_SECTIONS;
        setBriefSections(sections);

        const np = (p.notification_prefs && Object.keys(p.notification_prefs).length > 0)
          ? { ...DEFAULT_NOTIF_PREFS, ...p.notification_prefs }
          : DEFAULT_NOTIF_PREFS;
        setNotifPrefs(np);

        setCounts({
          contacts: contactsRes.count || 0,
          projects: projectsRes.count || 0,
        });
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load your setup');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  /* ─── computed step status from real data ─────────────────────────── */
  const steps = useMemo(() => {
    const stepDefs = [
      {
        id: 'business',
        title: 'Add your business name and logo',
        description: 'Personalise your workspace with your brand identity.',
        complete: Boolean(profile?.business_name),
        dest: null, // handled inline in the Profile card below
      },
      {
        id: 'regional',
        title: 'Confirm your timezone and currency',
        description: 'Ensure dates and amounts display correctly for your region.',
        complete: Boolean(profile?.timezone && profile?.currency),
        dest: null,
      },
      {
        id: 'contact',
        title: 'Add your first contact',
        description: 'Import or add clients and leads to your contact list.',
        complete: counts.contacts > 0,
        dest: 'contacts',
      },
      {
        id: 'project',
        title: 'Create your first project',
        description: 'Set up a project to start tracking deliverables and milestones.',
        complete: counts.projects > 0,
        dest: 'projects',
      },
      {
        id: 'target',
        title: 'Set your monthly revenue target',
        description: 'Define your income goal so Flint can track your progress.',
        // "complete" if user has changed it from the default 120000
        complete: profile?.monthly_revenue_target != null
          && Number(profile.monthly_revenue_target) > 0
          && Number(profile.monthly_revenue_target) !== 120000,
        dest: null,
      },
    ];
    return stepDefs;
  }, [profile, counts]);

  const completedCount = steps.filter(s => s.complete).length;
  const progress = steps.length === 0 ? 0 : (completedCount / steps.length) * 100;

  /* ─── save handlers ───────────────────────────────────────────────── */

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const userId = session?.user?.id;
      const payload = {
        id: userId,
        business_name: businessName.trim() || null,
        logo_url: logoUrl.trim() || null,
        timezone,
        currency,
        monthly_revenue_target: revenueTarget === '' ? null : Number(revenueTarget),
      };
      const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      setProfile(p => ({ ...(p || {}), ...payload }));
      setSavedProfile(true);
      setTimeout(() => setSavedProfile(false), 2000);
    } catch (e) {
      setError(e.message || 'Could not save profile');
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveBrief() {
    setSavingBrief(true);
    try {
      const userId = session?.user?.id;
      const payload = {
        id: userId,
        flint_brief_enabled: briefEnabled,
        flint_brief_time: briefTime + ':00',
        flint_brief_timezone: briefTimezone,
        flint_brief_sections: briefSections,
      };
      const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      setProfile(p => ({ ...(p || {}), ...payload }));
      setSavedBrief(true);
      setTimeout(() => setSavedBrief(false), 2000);
    } catch (e) {
      setError(e.message || 'Could not save Flint Brief preferences');
    } finally {
      setSavingBrief(false);
    }
  }

  async function saveNotifs() {
    setSavingNotifs(true);
    try {
      const userId = session?.user?.id;
      const payload = { id: userId, notification_prefs: notifPrefs };
      const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      setProfile(p => ({ ...(p || {}), ...payload }));
      setSavedNotifs(true);
      setTimeout(() => setSavedNotifs(false), 2000);
    } catch (e) {
      setError(e.message || 'Could not save notification preferences');
    } finally {
      setSavingNotifs(false);
    }
  }

  const toggleNotif = (key, type) => {
    setNotifPrefs(p => ({
      ...p,
      [key]: { ...(p[key] || { inApp: false, email: false }), [type]: !p[key]?.[type] },
    }));
  };

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
        <h1 className="page-title">Setup</h1>
        <span style={{ fontSize: 14, color: '#6b7280' }}>{completedCount} of {steps.length} complete</span>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 10, padding: 14, marginBottom: 16,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <AlertCircle size={18} color="#991b1b" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 13, color: '#7f1d1d' }}>{error}</div>
        </div>
      )}

      {/* Progress */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Onboarding progress</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#f59e0b' }}>{Math.round(progress)}%</div>
        </div>
        <div className="progress-bar" style={{ height: 12, marginBottom: 8 }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div style={{ fontSize: 13, color: '#9ca3af' }}>
          {completedCount === steps.length
            ? "You're all set! Flint is ready to go."
            : `${steps.length - completedCount} step${steps.length - completedCount !== 1 ? 's' : ''} remaining.`}
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {steps.map((step, i) => {
          const Icon = step.complete ? CheckCircle : Circle;
          const color = step.complete ? '#10b981' : '#9ca3af';
          const bg = step.complete ? '#d1fae5' : '#f3f4f6';
          return (
            <div
              key={step.id}
              className="card"
              style={{
                padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
                opacity: step.complete ? 0.7 : 1,
              }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={17} color={color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 600, fontSize: 14,
                  textDecoration: step.complete ? 'line-through' : 'none',
                  color: step.complete ? '#9ca3af' : '#1a1a1a',
                  marginBottom: 2,
                }}>
                  {i + 1}. {step.title}
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{step.description}</div>
              </div>
              {step.dest && !step.complete && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onNavigate(step.dest)}
                  style={{ flexShrink: 0 }}
                >
                  Go <ChevronRight size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Profile / Business card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Business profile</div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>The basics — your name on invoices, your timezone, your currency.</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Business name</label>
            <input
              className="form-input"
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              placeholder="e.g. Ling Studio"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Logo URL <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
            <input
              className="form-input"
              type="url"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
              <label className="form-label">Timezone</label>
              <select className="form-select" value={timezone} onChange={e => setTimezone(e.target.value)}>
                {[
                  'Asia/Singapore', 'Asia/Kuala_Lumpur', 'Asia/Bangkok', 'Asia/Hong_Kong',
                  'Asia/Tokyo', 'Australia/Sydney', 'Europe/London', 'America/New_York',
                  'America/Los_Angeles',
                ].map(tz => <option key={tz}>{tz}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
              <label className="form-label">Currency</label>
              <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
                {['SGD', 'USD', 'EUR', 'GBP', 'AUD', 'MYR', 'JPY'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Monthly revenue target</label>
            <input
              className="form-input"
              type="number"
              min="0"
              value={revenueTarget}
              onChange={e => setRevenueTarget(e.target.value)}
              placeholder="e.g. 12000"
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={saveProfile}
            disabled={savingProfile}
            style={{ alignSelf: 'flex-start' }}
          >
            {savingProfile ? 'Saving…' : savedProfile ? '✓ Saved' : 'Save profile'}
          </button>
        </div>
      </div>

      {/* Flint Brief */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Flint Brief</div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>Your daily business digest, delivered like a PA.</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
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
              {BRIEF_SECTION_LIST.map(item => (
                <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={briefSections[item.key] || false}
                    onChange={e => setBriefSections(s => ({ ...s, [item.key]: e.target.checked }))}
                    style={{ accentColor: '#f59e0b', width: 15, height: 15 }}
                  />
                  <span style={{ fontSize: 13, color: '#4b5563' }}>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', background: '#faf8f4', borderRadius: 10,
          }}>
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
          onClick={saveBrief}
          disabled={savingBrief}
        >
          {savingBrief ? 'Saving…' : savedBrief ? '✓ Saved' : 'Save Flint Brief preferences'}
        </button>
      </div>

      {/* Notifications */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Notifications</div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>Control when and how Flint notifies you.</div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center',
          paddingBottom: 10, borderBottom: '1px solid #e5e0d8', marginBottom: 4,
        }}>
          <div style={{ flex: 1, fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Notification
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <span style={{ width: 60, textAlign: 'center' }}>In-app</span>
            <span style={{ width: 60, textAlign: 'center' }}>Email</span>
          </div>
        </div>

        {NOTIF_ITEMS.map((item, i) => (
          <div
            key={item.key}
            style={{
              display: 'flex', alignItems: 'center', padding: '14px 0',
              borderBottom: i < NOTIF_ITEMS.length - 1 ? '1px solid #f0ece4' : 'none',
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

        <button
          className="btn btn-primary"
          onClick={saveNotifs}
          disabled={savingNotifs}
          style={{ marginTop: 18 }}
        >
          {savingNotifs ? 'Saving…' : savedNotifs ? '✓ Saved' : 'Save notification preferences'}
        </button>
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
