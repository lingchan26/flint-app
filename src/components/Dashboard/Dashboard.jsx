import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import {
  FolderKanban, DollarSign, BookUser,
  Calendar as CalendarIcon, ArrowRight, AlertCircle, Loader,
  Receipt, Wallet,
} from 'lucide-react';

/* ─── helpers ──────────────────────────────────────────────────────────── */

function getGreeting(name) {
  const h = new Date().getHours();
  const n = name || 'there';
  if (h >= 5 && h <= 11) return `Good morning, ${n}`;
  if (h >= 12 && h <= 16) return `Good afternoon, ${n}`;
  if (h >= 17 && h <= 20) return `Good evening, ${n}`;
  if (h >= 21 && h <= 23) return `Working late, ${n}?`;
  return `Hi ${n}`;
}

function formatLongDate(d) {
  return d.toLocaleDateString('en-SG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatTime(d) {
  let h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${ampm}`;
}

function formatShortDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntil(iso) {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

const SGD = (n) => `S$${(Number(n) || 0).toLocaleString('en-SG', { maximumFractionDigits: 0 })}`;

const stageColor = {
  'New': '#9ca3af', 'Discovery': '#3b82f6', 'Proposal': '#f59e0b',
  'Contract Signed': '#8b5cf6', 'Kick Off': '#f59e0b',
  'Onboarding': '#06b6d4', 'Planning': '#3b82f6',
  'Delivery': '#10b981', 'Completed': '#6b7280',
};
const stageBg = {
  'New': '#f3f4f6', 'Discovery': '#dbeafe', 'Proposal': '#fef3c7',
  'Contract Signed': '#ede9fe', 'Kick Off': '#fef3c7',
  'Onboarding': '#cffafe', 'Planning': '#dbeafe',
  'Delivery': '#d1fae5', 'Completed': '#f3f4f6',
};
const STAGE_ORDER = ['New', 'Discovery', 'Proposal', 'Contract Signed', 'Kick Off', 'Onboarding', 'Planning', 'Delivery', 'Completed'];

/* ─── component ────────────────────────────────────────────────────────── */

export default function Dashboard({ onNavigate, session }) {
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [contactsCount, setContactsCount] = useState(0);

  const firstName = (session?.user?.user_metadata?.full_name?.split(' ')[0])
    || (session?.user?.email?.split('@')[0])
    || null;

  // Ticking clock (1s)
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Load data once on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [projectsRes, invoicesRes, expensesRes, contactsRes] = await Promise.all([
          supabase.from('projects').select('*').eq('archived', false),
          supabase.from('invoices').select('*'),
          supabase.from('expenses').select('*'),
          supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('archived', false),
        ]);
        if (cancelled) return;
        if (projectsRes.error) throw projectsRes.error;
        if (invoicesRes.error) throw invoicesRes.error;
        if (expensesRes.error) throw expensesRes.error;
        // contactsRes.error tolerated — leaves count at 0
        setProjects(projectsRes.data || []);
        setInvoices(invoicesRes.data || []);
        setExpenses(expensesRes.data || []);
        setContactsCount(contactsRes.count || 0);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load dashboard data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  /* ─── derived metrics ─────────────────────────────────────────────── */

  const monthStart = useMemo(() => new Date(now.getFullYear(), now.getMonth(), 1), [now]);

  const activeProjects = useMemo(
    () => projects.filter(p => p.stage !== 'Completed'),
    [projects]
  );

  const thisMonthInvoiced = useMemo(() =>
    invoices
      .filter(i => i.created_at && new Date(i.created_at) >= monthStart)
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0),
    [invoices, monthStart]
  );

  const thisMonthPaid = useMemo(() =>
    invoices
      .filter(i => i.status === 'Paid' && i.paid_at && new Date(i.paid_at) >= monthStart)
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0),
    [invoices, monthStart]
  );

  const thisMonthExpenses = useMemo(() =>
    expenses
      .filter(e => e.date && new Date(e.date) >= monthStart)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    [expenses, monthStart]
  );

  const overdueInvoiceCount = useMemo(
    () => invoices.filter(i =>
      i.status === 'Overdue'
      || (i.status !== 'Paid' && i.due_date && new Date(i.due_date) < now)
    ).length,
    [invoices, now]
  );

  const upcomingDeadlines = useMemo(() => {
    const in14days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    return projects
      .filter(p => p.end_date && p.stage !== 'Completed')
      .filter(p => {
        const d = new Date(p.end_date);
        return d >= now && d <= in14days;
      })
      .sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
      .slice(0, 5);
  }, [projects, now]);

  const recentProjects = useMemo(() =>
    [...projects]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5),
    [projects]
  );

  const pipelineCounts = useMemo(() => {
    const counts = {};
    projects.forEach(p => {
      const s = p.stage || 'New';
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [projects]);

  const hasAnyData = projects.length > 0 || invoices.length > 0 || expenses.length > 0 || contactsCount > 0;
  const showPipeline = projects.length > 0;

  /* ─── render ──────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Loader size={28} color="var(--slate-400)" className="spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 12, padding: 20, display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <AlertCircle size={20} color="#991b1b" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>
              Could not load your dashboard
            </div>
            <div style={{ fontSize: 13, color: '#7f1d1d' }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* ─── Top bar: greeting + clock ──────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 28, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.5px', marginBottom: 4 }}>
            {getGreeting(firstName)}
          </h1>
          <div style={{ fontSize: 13, color: '#6b7280' }}>{formatLongDate(now)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 20, fontWeight: 700, color: '#1a1a1a',
            letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums',
          }}>
            {formatTime(now)}
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>Singapore time</div>
        </div>
      </div>

      {/* ─── New-user welcome (only when truly empty) ────────────────── */}
      {!hasAnyData && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a',
          borderLeft: '4px solid #f59e0b', borderRadius: 12,
          padding: 20, marginBottom: 24,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#78350f', marginBottom: 8 }}>
            Welcome to Flint 👋
          </div>
          <div style={{ fontSize: 13, color: '#78350f', marginBottom: 14, lineHeight: 1.6 }}>
            Your workspace is empty for now. The fastest way to make Flint useful is to add a
            contact, set up a project, and log your first expense or invoice. Setup will walk you
            through it.
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate('setup')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            Go to Setup <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ─── Stat cards ──────────────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 14, marginBottom: 28,
      }}>
        <StatCard
          icon={FolderKanban}
          label="Active projects"
          value={activeProjects.length}
          tone="emerald"
          onClick={() => onNavigate('projects')}
        />
        <StatCard
          icon={Receipt}
          label="Invoiced this month"
          value={invoices.length === 0 ? '—' : SGD(thisMonthInvoiced)}
          tone="amber"
          onClick={() => onNavigate('income')}
        />
        <StatCard
          icon={DollarSign}
          label="Paid this month"
          value={invoices.length === 0 ? '—' : SGD(thisMonthPaid)}
          tone="emerald"
          sub={overdueInvoiceCount > 0 ? `${overdueInvoiceCount} overdue` : null}
          onClick={() => onNavigate('income')}
        />
        <StatCard
          icon={Wallet}
          label="Expenses this month"
          value={expenses.length === 0 ? '—' : SGD(thisMonthExpenses)}
          tone="slate"
          onClick={() => onNavigate('income')}
        />
        <StatCard
          icon={BookUser}
          label="Contacts"
          value={contactsCount}
          tone="blue"
          onClick={() => onNavigate('contacts')}
        />
      </div>

      {/* ─── Create new (limited to v0.1 routes) ─────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontSize: 12, fontWeight: 700, color: 'var(--slate-400)',
          textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10,
        }}>
          Create new
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'Contact', icon: '👤', page: 'contacts', color: '#dbeafe', text: '#1e40af' },
            { label: 'Project', icon: '📁', page: 'projects', color: '#d1fae5', text: '#065f46' },
            { label: 'Invoice', icon: '💳', page: 'income', color: '#fef3c7', text: '#92400e' },
            { label: 'Expense', icon: '🧾', page: 'income', color: '#f3f4f6', text: '#374151' },
            { label: 'Calendar event', icon: '📅', page: 'calendar', color: '#ede9fe', text: '#5b21b6' },
          ].map(({ label, icon, page, color, text }) => (
            <button
              key={label}
              onClick={() => onNavigate(page)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 14px', borderRadius: 9,
                background: color, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, color: text,
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Two columns: deadlines + recent projects ────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 18, marginBottom: 28,
      }}>
        <Panel title="Upcoming deadlines" subtitle="Projects due in the next 14 days">
          {upcomingDeadlines.length === 0 ? (
            <EmptyMini
              icon={CalendarIcon}
              text={projects.length === 0
                ? 'No projects yet'
                : 'Nothing due in the next 14 days'}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upcomingDeadlines.map(p => {
                const d = daysUntil(p.end_date);
                const tone = d <= 3 ? '#ef4444' : d <= 7 ? '#f59e0b' : '#10b981';
                return (
                  <div
                    key={p.id}
                    onClick={() => onNavigate('projects')}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 12px', borderRadius: 8,
                      background: '#fafaf7', cursor: 'pointer',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                        {p.client || 'No client'} · Due {formatShortDate(p.end_date)}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 700, color: tone,
                      whiteSpace: 'nowrap', marginLeft: 10,
                    }}>
                      {d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `${d}d`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel title="Recent projects" subtitle="Your 5 most recently created">
          {recentProjects.length === 0 ? (
            <EmptyMini
              icon={FolderKanban}
              text="No projects yet"
              cta={{ label: 'Create your first', onClick: () => onNavigate('projects') }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentProjects.map(p => (
                <div
                  key={p.id}
                  onClick={() => onNavigate('projects')}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', borderRadius: 8,
                    background: '#fafaf7', cursor: 'pointer',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                      {p.client || 'No client'}
                      {p.value ? ` · ${SGD(p.value)}` : ''}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    padding: '3px 8px', borderRadius: 20,
                    background: stageBg[p.stage] || '#f3f4f6',
                    color: stageColor[p.stage] || '#6b7280',
                    whiteSpace: 'nowrap', marginLeft: 10,
                  }}>
                    {p.stage || 'New'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* ─── Pipeline overview (only if there are projects) ──────────── */}
      {showPipeline && (
        <Panel title="Pipeline" subtitle="Projects by stage">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: 8,
          }}>
            {STAGE_ORDER.map(stage => {
              const count = pipelineCounts[stage] || 0;
              return (
                <div
                  key={stage}
                  onClick={() => onNavigate('projects')}
                  style={{
                    padding: '12px 10px', borderRadius: 8,
                    background: count > 0 ? (stageBg[stage] || '#f3f4f6') : '#fafaf7',
                    cursor: 'pointer', textAlign: 'center',
                    opacity: count > 0 ? 1 : 0.5,
                  }}
                >
                  <div style={{
                    fontSize: 22, fontWeight: 700,
                    color: count > 0 ? (stageColor[stage] || '#6b7280') : '#9ca3af',
                    lineHeight: 1,
                  }}>
                    {count}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', marginTop: 6 }}>
                    {stage}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/* ─── small sub-components ─────────────────────────────────────────────── */

function StatCard({ icon: Icon, label, value, sub, tone = 'slate', onClick }) {
  const toneMap = {
    emerald: { bg: '#d1fae5', fg: '#065f46' },
    amber:   { bg: '#fef3c7', fg: '#92400e' },
    blue:    { bg: '#dbeafe', fg: '#1e40af' },
    slate:   { bg: '#f3f4f6', fg: '#374151' },
  };
  const t = toneMap[tone] || toneMap.slate;
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff', borderRadius: 12,
        border: '1px solid #e5e0d8', padding: '16px 18px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.1s',
      }}
      onMouseEnter={(e) => { if (onClick) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
      onMouseLeave={(e) => { if (onClick) e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={t.fg} />
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>{label}</div>
      </div>
      <div style={{
        fontSize: 24, fontWeight: 700, color: '#1a1a1a',
        letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12,
      border: '1px solid #e5e0d8', padding: 18,
    }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function EmptyMini({ icon: Icon, text, cta }) {
  return (
    <div style={{
      padding: '24px 12px', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    }}>
      <Icon size={22} color="#cbd5e1" />
      <div style={{ fontSize: 12, color: '#9ca3af' }}>{text}</div>
      {cta && (
        <button
          onClick={cta.onClick}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, color: '#f59e0b',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}
        >
          {cta.label} <ArrowRight size={12} />
        </button>
      )}
    </div>
  );
}
