import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line,
} from 'recharts';

const sparkData = {
  revenue:   [{ v: 18200 }, { v: 22400 }, { v: 14800 }, { v: 28600 }, { v: 31200 }, { v: 26800 }],
  projects:  [{ v: 8 }, { v: 9 }, { v: 11 }, { v: 10 }, { v: 12 }, { v: 12 }],
  collected: [{ v: 12000 }, { v: 15000 }, { v: 11000 }, { v: 17000 }, { v: 20000 }, { v: 18400 }],
  clients:   [{ v: 5 }, { v: 6 }, { v: 7 }, { v: 7 }, { v: 8 }, { v: 9 }],
};

function TrendBadge({ trend, dir }) {
  const up = dir === 'up';
  const neutral = dir === 'neutral';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 10, borderRadius: 20, padding: '2px 8px', fontWeight: 600,
      background: neutral ? '#f3f4f6' : up ? '#dcfce7' : '#fee2e2',
      color: neutral ? '#6b7280' : up ? '#166534' : '#991b1b',
    }}>
      {neutral ? '→' : up ? '↑' : '↓'} {trend}
    </span>
  );
}

function Sparkline({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
import {
  TrendingUp, FolderKanban, DollarSign, Users, ArrowUpRight,
  Settings, CalendarDays, Plus, X, CheckCircle, Zap, AlertTriangle,
  Bell, Mail
} from 'lucide-react';

const monthlyData = [
  { month: 'Oct', income: 18200, expenses: 4200 },
  { month: 'Nov', income: 22400, expenses: 5100 },
  { month: 'Dec', income: 14800, expenses: 3800 },
  { month: 'Jan', income: 28600, expenses: 6200 },
  { month: 'Feb', income: 31200, expenses: 7400 },
  { month: 'Mar', income: 26800, expenses: 5900 },
];

const recentProjects = [
  { name: 'Brand Refresh – Lumen Co', client: 'Lumen Co', stage: 'Delivery', value: 8500, due: '10 Apr 2026' },
  { name: 'Annual Report – Vertex', client: 'Vertex Inc', stage: 'Planning', value: 12000, due: '18 Apr 2026' },
  { name: 'Packaging Design – Bloom', client: 'Bloom Foods', stage: 'Proposal', value: 4200, due: '22 Apr 2026' },
  { name: 'Social Media Kit – Kova', client: 'Kova Studio', stage: 'Kick Off', value: 3600, due: '28 Apr 2026' },
  { name: 'Website Redesign – Novu', client: 'Novu Tech', stage: 'Discovery', value: 15000, due: '5 May 2026' },
];

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

const upcomingDeadlines = [
  { project: 'Brand Refresh – Lumen Co', days: 5, color: '#f59e0b' },
  { project: 'Annual Report – Vertex', days: 7, color: '#f59e0b' },
  { project: 'Packaging Design – Bloom', days: 12, color: '#10b981' },
  { project: 'Social Media Kit – Kova', days: 18, color: '#10b981' },
];

const pipelineStages = [
  { name: 'New', count: 12 },
  { name: 'Discovery', count: 9 },
  { name: 'Proposal', count: 7 },
  { name: 'Contract Signed', count: 5 },
  { name: 'Kick Off', count: 4 },
  { name: 'Onboarding', count: 4 },
  { name: 'Planning', count: 3 },
  { name: 'Delivery', count: 3 },
  { name: 'Completed', count: 0 },
];

const weekItems = [
  { day: 'Mon', title: 'Brand Refresh kickoff call', type: 'Meeting' },
  { day: 'Wed', title: 'Annual Report draft due', type: 'Deadline' },
  { day: 'Fri', title: 'Invoice #027 — Bloom Foods', type: 'Invoice' },
];

const typeColor = {
  Meeting: { bg: '#dbeafe', color: '#1e40af' },
  Deadline: { bg: '#fef3c7', color: '#92400e' },
  Invoice: { bg: '#d1fae5', color: '#065f46' },
};

const ALL_WIDGETS = [
  { id: 'stats', label: 'Revenue Stats' },
  { id: 'headspace', label: 'Headspace' },
  { id: 'pipeline', label: 'Pipeline Overview' },
  { id: 'payments', label: 'Payments Bar' },
  { id: 'chart', label: 'Income vs Expenses Chart' },
  { id: 'target', label: 'Revenue Target' },
  { id: 'week', label: 'This Week' },
  { id: 'projects', label: 'Recent Projects' },
  { id: 'activity', label: 'Activity Feed' },
  { id: 'deadlines', label: 'Upcoming Deadlines' },
  { id: 'brief', label: 'Flint Brief' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h <= 11) return 'Good morning, Ling 🌤';
  if (h >= 12 && h <= 16) return 'Good afternoon, Ling ☀️';
  if (h >= 17 && h <= 20) return 'Good evening, Ling 🌅';
  if (h >= 21 && h <= 23) return "It's a little late, Ling 🌙";
  return "What's happening, Ling 👋";
}

function formatDate(d) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(d) {
  let h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${ampm}`;
}

export default function Dashboard({ onNavigate }) {
  const [now, setNow] = useState(new Date());
  const [showCustomise, setShowCustomise] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState(
    Object.fromEntries(ALL_WIDGETS.map(w => [w.id, true]))
  );
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', client: '', stage: 'New', dueDate: '', value: '' });
  const [showRiskPulse, setShowRiskPulse] = useState(true);
  const [showNudge, setShowNudge] = useState(true);
  const [showRateCheck, setShowRateCheck] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const toggleWidget = (id) => {
    setVisibleWidgets(w => ({ ...w, [id]: !w[id] }));
  };

  const show = (id) => visibleWidgets[id];

  const daysLeftInWeek = () => {
    const day = new Date().getDay();
    return day === 0 ? 1 : 7 - day;
  };

  return (
    <div className="page-content">
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.5px', marginBottom: 4 }}>
            {getGreeting()}
          </h1>
          <div style={{ fontSize: 13, color: '#6b7280' }}>{formatDate(now)}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>{formatTime(now)}</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>{formatDate(now)}</div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowCustomise(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Settings size={14} /> Customise
          </button>
        </div>
      </div>

      {/* Stats */}
      {show('stats') && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7' }}>
              <DollarSign size={20} color="#f59e0b" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="stat-label">Revenue (MTD)</div>
              <div className="stat-value">S$26,800</div>
              <Sparkline data={sparkData.revenue} color="#f59e0b" />
              <TrendBadge trend="12%" dir="up" />
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe' }}>
              <FolderKanban size={20} color="#3b82f6" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="stat-label">Active Projects</div>
              <div className="stat-value">12</div>
              <Sparkline data={sparkData.projects} color="#3b82f6" />
              <TrendBadge trend="+2" dir="up" />
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#d1fae5' }}>
              <TrendingUp size={20} color="#10b981" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="stat-label">Collected</div>
              <div className="stat-value">S$18,400</div>
              <Sparkline data={sparkData.collected} color="#10b981" />
              <TrendBadge trend="8%" dir="up" />
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ede9fe' }}>
              <Users size={20} color="#8b5cf6" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="stat-label">Active Clients</div>
              <div className="stat-value">9</div>
              <Sparkline data={sparkData.clients} color="#8b5cf6" />
              <TrendBadge trend="+2" dir="up" />
            </div>
          </div>
        </div>
      )}

      {/* Headspace Widget */}
      {show('headspace') && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Headspace</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Your capacity at a glance</div>
            </div>
          </div>

          {/* This Week */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>This Week</span>
              <span style={{ fontSize: 12, color: '#6b7280' }}>28 of 40 hrs · 70%</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: '#f0ece4', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '70%', background: '#f59e0b', borderRadius: 999 }} />
            </div>
          </div>

          {/* This Month */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>This Month</span>
              <span style={{ fontSize: 12, color: '#6b7280' }}>112 of 160 hrs · 70%</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: '#f0ece4', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '70%', background: '#f59e0b', borderRadius: 999 }} />
            </div>
          </div>

          {/* Hours by service */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {[
              { label: 'Brand Identity', hrs: '12h' },
              { label: 'Packaging', hrs: '8h' },
              { label: 'Social', hrs: '4h' },
              { label: 'CGI', hrs: '4h' },
            ].map(item => (
              <span key={item.label} style={{
                background: '#fef3c7', color: '#92400e',
                padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                {item.label} <span style={{ opacity: 0.7 }}>· {item.hrs}</span>
              </span>
            ))}
          </div>

          {/* AI commentary */}
          <div style={{
            background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10,
            padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <Zap size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 13, color: '#78350f', lineHeight: 1.5 }}>
              At 70% capacity, you have room for 1 more small project this week.
            </span>
          </div>
        </div>
      )}

      {/* Risk Pulse Banner */}
      {show('pipeline') && showRiskPulse && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#fffbeb', border: '1px solid #fde68a',
          borderLeft: '4px solid #f59e0b',
          borderRadius: 10, padding: '12px 16px', marginBottom: 12,
        }}>
          <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#78350f', flex: 1, lineHeight: 1.5 }}>
            <strong>Risk Pulse</strong> — 68% of your revenue this quarter came from Vertex Inc. Consider diversifying.
          </span>
          <button
            onClick={() => setShowRiskPulse(false)}
            style={{
              background: 'none', border: '1px solid #d1d5db', borderRadius: 6,
              padding: '3px 10px', fontSize: 12, color: '#6b7280', cursor: 'pointer',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Pipeline Nudge Banner */}
      {show('pipeline') && showNudge && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#eff6ff', border: '1px solid #bfdbfe',
          borderLeft: '4px solid #3b82f6',
          borderRadius: 10, padding: '12px 16px', marginBottom: 12,
        }}>
          <Bell size={16} color="#2563eb" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#1e3a8a', flex: 1, lineHeight: 1.5 }}>
            <strong>Pipeline Nudge</strong> — 3 proposals have had no movement in 14+ days. Time to follow up?
          </span>
          <button
            onClick={() => setShowNudge(false)}
            style={{
              background: '#f59e0b', border: 'none', borderRadius: 6,
              padding: '3px 10px', fontSize: 12, color: '#fff', cursor: 'pointer',
              fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            View Proposals
          </button>
        </div>
      )}

      {/* Pipeline Overview */}
      {show('pipeline') && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div className="card-title">Pipeline overview</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {pipelineStages.map(s => {
              const isCompleted = s.name === 'Completed' && s.count === 0;
              return (
                <div
                  key={s.name}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: isCompleted ? '#f3f4f6' : '#fef3c7',
                    borderRadius: 999,
                    padding: '6px 12px 6px 14px',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 500, color: isCompleted ? '#6b7280' : '#92400e' }}>
                    {s.name}
                  </span>
                  <span style={{
                    background: isCompleted ? '#9ca3af' : '#f59e0b',
                    color: '#fff',
                    borderRadius: '50%',
                    width: 20, height: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>
                    {s.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rate Check Banner */}
      {showRateCheck && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#f5f3ff', border: '1px solid #ddd6fe',
          borderLeft: '4px solid #8b5cf6',
          borderRadius: 10, padding: '12px 16px', marginBottom: 24,
        }}>
          <TrendingUp size={16} color="#7c3aed" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#3b0764', flex: 1, lineHeight: 1.5 }}>
            <strong>Rate Check</strong> — You've charged Lumen Co the same day rate for 22 months. Consider a rate conversation.
          </span>
          <button
            onClick={() => setShowRateCheck(false)}
            style={{
              background: 'none', border: '1px solid #d1d5db', borderRadius: 6,
              padding: '3px 10px', fontSize: 12, color: '#6b7280', cursor: 'pointer',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Payments Bar + This Week */}
      <div className="two-col-grid" style={{ marginBottom: 24 }}>
        {/* Payments Bar */}
        {show('payments') && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">Payments</div>
            </div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a' }}>S$11,640</span>
              <span style={{ fontSize: 13, color: '#9ca3af', marginLeft: 8 }}>April gross</span>
            </div>
            {/* Segmented bar */}
            <div style={{
              display: 'flex', height: 12, borderRadius: 999,
              overflow: 'hidden', marginBottom: 16, marginTop: 12,
            }}>
              <div style={{ width: '53%', background: '#3d9970', borderRadius: '999px 0 0 999px' }} />
              <div style={{ width: '24%', background: '#f59e0b' }} />
              <div style={{ width: '16%', background: '#d1d5db' }} />
              <div style={{ width: '7%', background: '#e03e3e', borderRadius: '0 999px 999px 0' }} />
            </div>
            {/* Legend */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 12 }}>
              {[
                { color: '#3d9970', label: 'Deposited', amount: 'S$6,200' },
                { color: '#f59e0b', label: 'Processing', amount: 'S$2,800' },
                { color: '#d1d5db', label: 'Upcoming', amount: 'S$1,840' },
                { color: '#e03e3e', label: 'Overdue', amount: 'S$800' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#6b7280', flex: 1 }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>{item.amount}</span>
                </div>
              ))}
            </div>
            <div style={{ height: 1, background: '#e5e0d8', marginBottom: 12 }} />
            <div style={{ fontSize: 13, color: '#e03e3e', fontWeight: 500 }}>
              Overdue 30+ days &nbsp; S$480
            </div>
          </div>
        )}

        {/* This Week */}
        {show('week') && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">This Week</div>
            </div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>
              {daysLeftInWeek()} days left in this week
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {weekItems.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 8, background: '#faf8f4',
                }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: '#f59e0b',
                    background: '#fef3c7', borderRadius: 6, padding: '3px 8px',
                    minWidth: 36, textAlign: 'center',
                  }}>
                    {item.day}
                  </div>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{item.title}</div>
                  <span style={{
                    fontSize: 11, fontWeight: 500,
                    background: typeColor[item.type]?.bg || '#f3f4f6',
                    color: typeColor[item.type]?.color || '#6b7280',
                    padding: '2px 8px', borderRadius: 20,
                  }}>
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                onClick={() => onNavigate('calendar')}
                style={{
                  background: '#fef3c7', border: 'none', borderRadius: 8,
                  padding: '7px 10px', cursor: 'pointer', color: '#f59e0b',
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 12, fontWeight: 500,
                }}
              >
                <CalendarDays size={15} /> View Calendar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="two-col-grid" style={{ marginBottom: 24 }}>
        {/* Revenue Chart */}
        {show('chart') && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">Income vs Expenses</div>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>Last 6 months</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value, name) => [`S$${value.toLocaleString()}`, name === 'income' ? 'Income' : 'Expenses']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e0d8', fontSize: 13 }}
                />
                <Bar dataKey="income" fill="#f59e0b" radius={[4,4,0,0]} />
                <Bar dataKey="expenses" fill="#e5e0d8" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Revenue Target */}
        {show('target') && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">Revenue Target 2026</div>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>28.5%</span>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Collected</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>S$34,200</span>
              </div>
              <div className="progress-bar" style={{ height: 12 }}>
                <div className="progress-fill" style={{ width: '28.5%' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Target: S$120,000</span>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>S$85,800 remaining</span>
              </div>
            </div>

            {show('deadlines') && (
              <>
                <div className="section-divider" style={{ margin: '16px 0' }} />
                <div className="section-heading" style={{ marginBottom: 12 }}>Upcoming Deadlines</div>
                {upcomingDeadlines.map((d, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: i < upcomingDeadlines.length - 1 ? '1px solid #f0ece4' : 'none',
                  }}>
                    <span style={{ fontSize: 13, color: '#1a1a1a' }}>{d.project}</span>
                    <span style={{
                      fontSize: 12, fontWeight: 500, color: d.color,
                      background: d.color + '20', padding: '2px 8px', borderRadius: 10,
                    }}>
                      {d.days}d
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Recent Projects */}
      {show('projects') && (
        <>
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="section-heading" style={{ marginBottom: 0 }}>Recent Projects</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowNewProject(true)}>
                <Plus size={14} /> Create Project
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('projects')}>
                View all <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
          <div className="table-container" style={{ marginBottom: 24 }}>
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Stage</th>
                  <th>Value</th>
                  <th>Due</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td style={{ color: '#6b7280' }}>{p.client}</td>
                    <td>
                      <span style={{
                        background: stageBg[p.stage] || '#f3f4f6',
                        color: stageColor[p.stage] || '#6b7280',
                        padding: '3px 10px', borderRadius: 20,
                        fontSize: 12, fontWeight: 500,
                      }}>
                        {p.stage}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>S${p.value.toLocaleString()}</td>
                    <td style={{ color: '#6b7280', fontSize: 13 }}>{p.due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Activity Feed */}
      {show('activity') && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div className="card-title">Activity</div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowNewProject(true)}
            style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }}
          >
            <Plus size={16} /> Create new project
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { text: 'Logged 3.5h on brand guidelines review', time: 'Today, 2:15 PM' },
              { text: 'Submitted Q2 strategy deck', time: 'Today, 10:00 AM' },
              { text: 'Invoice #027 sent — S$2,800', time: 'Yesterday, 4:30 PM' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 0',
                borderBottom: i < 2 ? '1px solid #f0ece4' : 'none',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#f59e0b', marginTop: 5, flexShrink: 0,
                }} />
                <div style={{ flex: 1, fontSize: 13, color: '#1a1a1a' }}>{item.text}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flint Brief */}
      {show('brief') && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Flint Brief</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Your daily PA — delivered to your inbox at 7am</div>
            </div>
            <Mail size={18} color="#f59e0b" />
          </div>

          {/* Preview box */}
          <div style={{
            background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10,
            padding: 16, marginBottom: 16,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#78350f', marginBottom: 10 }}>
              Good morning, Ling ☀️ — Here's your Monday
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 13, color: '#78350f', display: 'flex', gap: 8 }}>
                <span style={{ flexShrink: 0 }}>•</span>
                <span><strong>Today:</strong> Discovery call with Bloom Foods at 10am · Proposal for Novu Tech due today</span>
              </div>
              <div style={{ fontSize: 13, color: '#78350f', display: 'flex', gap: 8 }}>
                <span style={{ flexShrink: 0 }}>•</span>
                <span><strong>This week:</strong> 28 hrs booked of your 40hr capacity · S$12,400 in payments expected</span>
              </div>
              <div style={{ fontSize: 13, color: '#78350f', display: 'flex', gap: 8 }}>
                <span style={{ flexShrink: 0 }}>•</span>
                <span><strong>Action:</strong> You haven't followed up with Kova Studio in 34 days — they're a repeat client</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>Flint Brief is sent daily at 7:00 AM SGT</span>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onNavigate('setup')}
            >
              Configure in Setup →
            </button>
          </div>
        </div>
      )}

      {/* Customise Dashboard Modal */}
      {showCustomise && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }}
            onClick={() => setShowCustomise(false)}
          />
          <div style={{
            position: 'fixed',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff',
            borderRadius: 16,
            width: 440,
            maxHeight: '80vh',
            zIndex: 101,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: '1px solid #e5e0d8',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Customise Dashboard</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Toggle which cards to show</div>
              </div>
              <button className="close-btn" onClick={() => setShowCustomise(false)}><X size={16} /></button>
            </div>
            <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
              {ALL_WIDGETS.map(w => (
                <div key={w.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0', borderBottom: '1px solid #f0ece4',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle size={15} color={visibleWidgets[w.id] ? '#10b981' : '#d1d5db'} />
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>{w.label}</span>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={!!visibleWidgets[w.id]} onChange={() => toggleWidget(w.id)} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e0d8', textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={() => setShowCustomise(false)}>Done</button>
            </div>
          </div>
        </>
      )}

      {/* New Project Slide Panel */}
      {showNewProject && (
        <>
          <div className="overlay" onClick={() => setShowNewProject(false)} />
          <div className="slide-panel">
            <div className="slide-panel-header">
              <span className="slide-panel-title">New Project</span>
              <button className="close-btn" onClick={() => setShowNewProject(false)}><X size={16} /></button>
            </div>
            <div className="slide-panel-body">
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input className="form-input" value={newProject.name} onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Brand Refresh – Acme Corp" />
              </div>
              <div className="form-group">
                <label className="form-label">Client</label>
                <input className="form-input" value={newProject.client} onChange={e => setNewProject(p => ({ ...p, client: e.target.value }))} placeholder="Client name" />
              </div>
              <div className="form-group">
                <label className="form-label">Stage</label>
                <select className="form-select" value={newProject.stage} onChange={e => setNewProject(p => ({ ...p, stage: e.target.value }))}>
                  {['New','Discovery','Proposal','Contract Signed','Kick Off','Onboarding','Planning','Delivery','Completed'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={newProject.dueDate} onChange={e => setNewProject(p => ({ ...p, dueDate: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Value (SGD)</label>
                <input className="form-input" type="number" value={newProject.value} onChange={e => setNewProject(p => ({ ...p, value: e.target.value }))} placeholder="0" />
              </div>
            </div>
            <div className="slide-panel-footer">
              <button className="btn btn-secondary" onClick={() => setShowNewProject(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { setShowNewProject(false); }}>Create Project</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
