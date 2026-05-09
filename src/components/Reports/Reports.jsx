import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, ComposedChart, ReferenceLine,
} from 'recharts';
import { Download } from 'lucide-react';

const monthlySales = [
  { month: 'Oct', bookings: 3, revenue: 18200 },
  { month: 'Nov', bookings: 4, revenue: 22400 },
  { month: 'Dec', bookings: 2, revenue: 14800 },
  { month: 'Jan', bookings: 5, revenue: 28600 },
  { month: 'Feb', bookings: 6, revenue: 31200 },
  { month: 'Mar', bookings: 4, revenue: 26800 },
];

const stageTime = [
  { stage: 'New', days: 2 },
  { stage: 'Discovery', days: 5 },
  { stage: 'Proposal', days: 8 },
  { stage: 'Contract Signed', days: 3 },
  { stage: 'Kick Off', days: 4 },
  { stage: 'Onboarding', days: 6 },
  { stage: 'Planning', days: 10 },
  { stage: 'Delivery', days: 21 },
];

const leadSources = [
  { name: 'Referral', value: 42, color: '#f59e0b' },
  { name: 'Instagram', value: 22, color: '#3b82f6' },
  { name: 'LinkedIn', value: 18, color: '#8b5cf6' },
  { name: 'Website', value: 12, color: '#10b981' },
  { name: 'Other', value: 6, color: '#9ca3af' },
];

const marginData = [
  { service: 'Brand Identity', revenue: 12400, hours: 18, effectiveRate: 689, margin: 82 },
  { service: 'Annual Report', revenue: 8000, hours: 28, effectiveRate: 286, margin: 74 },
  { service: 'Packaging', revenue: 8200, hours: 22, effectiveRate: 373, margin: 61 },
  { service: 'Social Media', revenue: 5400, hours: 16, effectiveRate: 338, margin: 58 },
  { service: 'CGI / 3D', revenue: 9200, hours: 38, effectiveRate: 242, margin: 49 },
  { service: 'Motion', revenue: 4800, hours: 38, effectiveRate: 126, margin: 34 },
];

const clientMargin = [
  { client: 'Lumen Co', billed: 28500, estHours: 72, effectiveRate: 396, margin: 78, status: 'profitable' },
  { client: 'Vertex Inc', billed: 22000, estHours: 88, effectiveRate: 250, margin: 62, status: 'profitable' },
  { client: 'Novu Tech', billed: 15000, estHours: 68, effectiveRate: 221, margin: 54, status: 'marginal' },
  { client: 'Kova Studio', billed: 9200, estHours: 46, effectiveRate: 200, margin: 48, status: 'marginal' },
  { client: 'Bloom Foods', billed: 4200, estHours: 30, effectiveRate: 140, margin: 28, status: 'loss-risk' },
  { client: 'Arko Media', billed: 7800, estHours: 62, effectiveRate: 126, margin: 22, status: 'loss-risk' },
];

const forecastData = [
  { month: 'Oct', income: 18200, expenses: 4200, profit: 14000, projected: false },
  { month: 'Nov', income: 22400, expenses: 5100, profit: 17300, projected: false },
  { month: 'Dec', income: 14800, expenses: 3800, profit: 11000, projected: false },
  { month: 'Jan', income: 28600, expenses: 6200, profit: 22400, projected: false },
  { month: 'Feb', income: 31200, expenses: 7400, profit: 23800, projected: false },
  { month: 'Mar', income: 26800, expenses: 5900, profit: 20900, projected: false },
  { month: 'Apr', income: 24000, expenses: 5500, profit: 18500, projected: true },
  { month: 'May', income: 28400, expenses: 6000, profit: 22400, projected: true },
  { month: 'Jun', income: 31000, expenses: 6200, profit: 24800, projected: true },
];

const projectMargin = [
  { project: 'Brand Refresh – Lumen Co', client: 'Lumen Co', value: 8500, hrs: 22, estHrs: 20, rate: 386, scopeCreep: 10 },
  { project: 'Annual Report – Vertex', client: 'Vertex Inc', value: 12000, hrs: 41, estHrs: 35, rate: 293, scopeCreep: 17 },
  { project: 'Social Media Kit – Kova', client: 'Kova Studio', value: 3600, hrs: 14, estHrs: 16, rate: 257, scopeCreep: -13 },
  { project: 'Motion Graphics – Arko', client: 'Arko Media', value: 7800, hrs: 68, estHrs: 45, rate: 115, scopeCreep: 51 },
  { project: 'Website Redesign – Novu', client: 'Novu Tech', value: 15000, hrs: 58, estHrs: 55, rate: 259, scopeCreep: 5 },
  { project: 'Packaging – Bloom', client: 'Bloom Foods', value: 4200, hrs: 28, estHrs: 20, rate: 150, scopeCreep: 40 },
];

const pitchWinRate = [
  { month: 'Oct', rate: 28 },
  { month: 'Nov', rate: 33 },
  { month: 'Dec', rate: 40 },
  { month: 'Jan', rate: 31 },
  { month: 'Feb', rate: 38 },
  { month: 'Mar', rate: 34 },
];

const SERVICE_TYPES = [
  'All Service Types', 'Advertising', 'Corporate', 'Marketing', 'Packaging',
  'Photoshoot', 'Social Media', 'Print', 'Digital', 'Production',
  'Visualisation', 'CGI', 'Motion', 'Others',
];

const MARGIN_TABS = ['By Service', 'By Client', 'Forecast', 'By Project'];

const marginColor = (pct) => {
  if (pct >= 70) return '#10b981';
  if (pct >= 50) return '#f59e0b';
  return '#ef4444';
};

const statusBadge = (status) => {
  if (status === 'profitable') return { bg: '#d1fae5', color: '#065f46', label: 'Profitable' };
  if (status === 'marginal') return { bg: '#fef3c7', color: '#92400e', label: 'Marginal' };
  return { bg: '#fee2e2', color: '#991b1b', label: 'Loss Risk' };
};

const bookingStats = [
  { label: 'Number of Bookings', value: '24', sub: 'All time', trend: '+4 vs last period', trendDir: 'up' },
  { label: 'Outstanding Payments', value: 'S$22,200', sub: 'Pending', trend: '-S$3,200 vs last period', trendDir: 'up' },
  { label: 'Gross Booked Amount', value: 'S$141,700', sub: 'All time', trend: '+S$18,400 vs last period', trendDir: 'up' },
  { label: 'Refunded Payments', value: 'S$1,200', sub: '1 refund', trend: 'Same as last period', trendDir: 'neutral' },
  { label: 'Collected Payments', value: 'S$34,200', sub: 'Received', trend: '+S$8,200 vs last period', trendDir: 'up' },
];

const BookingsReport = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
    {bookingStats.map(item => (
      <div key={item.label} style={{
        background: '#faf8f4', borderRadius: 10, padding: '16px',
        border: '1px solid #e5e0d8',
      }}>
        <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{item.label}</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{item.value}</div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>{item.sub}</div>
        <div style={{
          fontSize: 11, fontWeight: 600,
          color: item.trendDir === 'up' ? '#166534' : item.trendDir === 'down' ? '#991b1b' : '#6b7280',
          background: item.trendDir === 'up' ? '#dcfce7' : item.trendDir === 'down' ? '#fee2e2' : '#f3f4f6',
          display: 'inline-block', padding: '2px 8px', borderRadius: 20,
        }}>
          {item.trend}
        </div>
      </div>
    ))}
  </div>
);

// Custom bar fill based on projected
const CustomBar = (props) => {
  const { x, y, width, height, projected } = props;
  return (
    <rect
      x={x} y={y} width={width} height={height}
      fill={projected ? '#fde68a' : '#f59e0b'}
      rx={4} ry={4}
      opacity={projected ? 0.75 : 1}
    />
  );
};

export default function Reports() {
  const [serviceFilter, setServiceFilter] = useState('All Service Types');
  const [dateRange, setDateRange] = useState({ from: '2026-01-01', to: '2026-03-31' });
  const [marginTab, setMarginTab] = useState('By Service');

  const dl = (format) => alert(`Downloading report as ${format}... (simulated)`);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <select
          className="form-select"
          style={{ width: 200 }}
          value={serviceFilter}
          onChange={e => setServiceFilter(e.target.value)}
        >
          {SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Bookings Report */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">Bookings Report</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                className="form-input"
                type="date"
                style={{ width: 150 }}
                value={dateRange.from}
                onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))}
              />
              <span style={{ color: '#9ca3af' }}>–</span>
              <input
                className="form-input"
                type="date"
                style={{ width: 150 }}
                value={dateRange.to}
                onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
              />
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => dl('save')}>
              <Download size={14} /> Save Report
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => dl('PDF')}>
              <Download size={14} /> PDF
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => dl('CSV')}>
              <Download size={14} /> CSV
            </button>
          </div>
        </div>
        <BookingsReport />
      </div>

      {/* Monthly Sales + Lead Source */}
      <div className="two-col-grid" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Monthly Sales Report</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => dl('save')}>
                <Download size={14} /> Save Report
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => dl('PDF')}>
                <Download size={14} /> PDF
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => dl('CSV')}>
                <Download size={14} /> CSV
              </button>
            </div>
          </div>
          {/* Inline stat pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <span style={{
              background: '#dcfce7', color: '#166534',
              padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              Avg Revenue/Mo: S$23,500 ↑
            </span>
            <span style={{
              background: '#fef3c7', color: '#92400e',
              padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            }}>
              Best Month: Feb S$31,200
            </span>
            <span style={{
              background: '#dbeafe', color: '#1e40af',
              padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            }}>
              Bookings This Month: 4
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlySales} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e0d8', fontSize: 13 }} />
              <Bar yAxisId="left" dataKey="revenue" fill="#f59e0b" radius={[4,4,0,0]} name="Revenue" />
              <Bar yAxisId="right" dataKey="bookings" fill="#1a1a1a" radius={[4,4,0,0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <span style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, background: '#f59e0b', borderRadius: 2 }} /> Revenue
            </span>
            <span style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, background: '#1a1a1a', borderRadius: 2 }} /> Bookings
            </span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Lead Source Breakdown</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => dl('save')}>
                <Download size={14} /> Save Report
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => dl('PDF')}>
                <Download size={14} /> PDF
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => dl('CSV')}>
                <Download size={14} /> CSV
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ResponsiveContainer width={160} height={200}>
              <PieChart>
                <Pie data={leadSources} cx="50%" cy="50%" outerRadius={75} dataKey="value" paddingAngle={2}>
                  {leadSources.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {leadSources.map(s => (
                <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
                    <span style={{ fontSize: 13, color: '#6b7280' }}>{s.name}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Time per Stage */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">Average Time per Pipeline Stage</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => dl('save')}>
              <Download size={14} /> Save Report
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => dl('PDF')}>
              <Download size={14} /> PDF
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => dl('CSV')}>
              <Download size={14} /> CSV
            </button>
          </div>
        </div>
        <div style={{ padding: '8px 0' }}>
          {stageTime.map(s => (
            <div key={s.stage} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 130, fontSize: 13, color: '#6b7280', textAlign: 'right', flexShrink: 0 }}>{s.stage}</div>
              <div style={{ flex: 1, background: '#f0ece4', borderRadius: 4, height: 20, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(s.days / 25) * 100}%`,
                  background: '#f59e0b',
                  borderRadius: 4,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <div style={{ width: 60, fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{s.days} days</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── MARGIN MAP PRO ─── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header" style={{ marginBottom: 0 }}>
          <div>
            <div className="card-title">Margin Map Pro</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Deep profitability intelligence</div>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 4, marginTop: 16, marginBottom: 20, background: '#f0ece4', borderRadius: 999, padding: '4px', width: 'fit-content' }}>
          {MARGIN_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setMarginTab(tab)}
              style={{
                padding: '5px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 500,
                background: marginTab === tab ? '#f59e0b' : 'transparent',
                color: marginTab === tab ? '#fff' : '#6b7280',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Tab 1: By Service ── */}
        {marginTab === 'By Service' && (
          <>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={marginData}
                layout="vertical"
                margin={{ left: 10, right: 40, top: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="service"
                  width={110}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Profit Margin']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e0d8', fontSize: 13 }}
                />
                <Bar dataKey="margin" fill="#f59e0b" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* By Service data table */}
            <div style={{ marginTop: 20, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e0d8' }}>
                    {['Service', 'Revenue', 'Avg Hours', 'Effective Rate', 'Margin %'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: '#9ca3af', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {marginData.map((row, i) => (
                    <tr
                      key={row.service}
                      style={{
                        background: i % 2 === 0 ? '#fff' : '#faf8f4',
                        borderBottom: '1px solid #f0ece4',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fef3c7'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#faf8f4'}
                    >
                      <td style={{ padding: '9px 10px', fontWeight: 500, color: '#1a1a1a' }}>{row.service}</td>
                      <td style={{ padding: '9px 10px', color: '#4b5563' }}>S${row.revenue.toLocaleString()}</td>
                      <td style={{ padding: '9px 10px', color: '#6b7280' }}>{row.hours}h</td>
                      <td style={{ padding: '9px 10px', color: '#4b5563' }}>S${row.effectiveRate}/hr</td>
                      <td style={{ padding: '9px 10px' }}>
                        <span style={{ fontWeight: 700, color: marginColor(row.margin) }}>
                          {row.margin}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AI insight */}
            <div style={{
              background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10,
              padding: '12px 16px', marginTop: 16, display: 'flex', gap: 10,
            }}>
              <span style={{ color: '#f59e0b', fontWeight: 700, flexShrink: 0 }}>✦</span>
              <span style={{ fontSize: 13, color: '#78350f', lineHeight: 1.5 }}>
                Brand Identity is your most profitable service at 82% margin — 2.4× more than Motion. Consider raising Motion rates or de-prioritising it.
              </span>
            </div>
          </>
        )}

        {/* ── Tab 2: By Client ── */}
        {marginTab === 'By Client' && (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e0d8' }}>
                    {['Client', 'Total Billed', 'Est. Hours', 'Eff. Rate/hr', 'Margin %', 'Risk'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: '#9ca3af', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clientMargin.map((row, i) => {
                    const badge = statusBadge(row.status);
                    return (
                      <tr
                        key={row.client}
                        style={{
                          background: i % 2 === 0 ? '#fff' : '#faf8f4',
                          borderBottom: '1px solid #f0ece4',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fef3c7'}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#faf8f4'}
                      >
                        <td style={{ padding: '9px 10px', fontWeight: 600, color: '#1a1a1a' }}>{row.client}</td>
                        <td style={{ padding: '9px 10px', color: '#4b5563' }}>S${row.billed.toLocaleString()}</td>
                        <td style={{ padding: '9px 10px', color: '#6b7280' }}>{row.estHours}h</td>
                        <td style={{ padding: '9px 10px', color: '#4b5563' }}>S${row.effectiveRate}/hr</td>
                        <td style={{ padding: '9px 10px' }}>
                          <span style={{ fontWeight: 700, color: marginColor(row.margin) }}>
                            {row.margin}%
                          </span>
                        </td>
                        <td style={{ padding: '9px 10px' }}>
                          <span style={{
                            background: badge.bg, color: badge.color,
                            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                          }}>
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* AI insight — red tint for loss-risk */}
            <div style={{
              background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10,
              padding: '12px 16px', marginTop: 16, display: 'flex', gap: 10,
            }}>
              <span style={{ color: '#ef4444', fontWeight: 700, flexShrink: 0 }}>✦</span>
              <span style={{ fontSize: 13, color: '#991b1b', lineHeight: 1.5 }}>
                Bloom Foods and Arko Media are running at under 30% margin. Accounting for revision cycles, you may be billing below your effective cost rate. Consider a rate review or scope-tightening clause.
              </span>
            </div>
          </>
        )}

        {/* ── Tab 3: Forecast ── */}
        {marginTab === 'Forecast' && (
          <>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={forecastData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value, name) => [`S$${value.toLocaleString()}`, name === 'income' ? 'Income' : 'Profit']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e0d8', fontSize: 13 }}
                  labelFormatter={(label, payload) => {
                    const d = forecastData.find(x => x.month === label);
                    return `${label}${d && d.projected ? ' (Projected)' : ''}`;
                  }}
                />
                <ReferenceLine x="Apr" stroke="#9ca3af" strokeDasharray="4 3" label={{ value: 'Forecast', position: 'top', fontSize: 11, fill: '#9ca3af' }} />
                <Bar dataKey="income" radius={[4,4,0,0]} name="income">
                  {forecastData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.projected ? '#fde68a' : '#f59e0b'} opacity={entry.projected ? 0.8 : 1} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} name="profit" />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginTop: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 10, background: '#f59e0b', borderRadius: 2 }} /> Actual Income
              </span>
              <span style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 10, background: '#fde68a', borderRadius: 2 }} /> Projected Income
              </span>
              <span style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 10, background: '#10b981', borderRadius: 2 }} /> Profit Trend
              </span>
            </div>

            {/* Forecast stat boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Projected May Income', value: 'S$28,400' },
                { label: 'Projected Q2 Profit', value: 'S$65,700' },
                { label: 'Annual Target Progress', value: '52% of S$120,000' },
              ].map(s => (
                <div key={s.label} style={{
                  background: '#faf8f4', borderRadius: 10, padding: '14px 16px',
                  border: '1px solid #e5e0d8',
                }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* AI insight */}
            <div style={{
              background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10,
              padding: '12px 16px', display: 'flex', gap: 10,
            }}>
              <span style={{ color: '#f59e0b', fontWeight: 700, flexShrink: 0 }}>✦</span>
              <span style={{ fontSize: 13, color: '#78350f', lineHeight: 1.5 }}>
                Based on your current pipeline and close rate, you're on track to exceed your Q2 target. Your strongest month historically is February — consider front-loading new proposals in January.
              </span>
            </div>
          </>
        )}

        {/* ── Tab 4: By Project ── */}
        {marginTab === 'By Project' && (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e0d8' }}>
                    {['Project', 'Client', 'Contract Value', 'Hrs Logged', 'Eff. Rate', 'vs. Estimate', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: '#9ca3af', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projectMargin.map((row, i) => (
                    <tr
                      key={row.project}
                      style={{
                        background: i % 2 === 0 ? '#fff' : '#faf8f4',
                        borderBottom: '1px solid #f0ece4',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fef3c7'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#faf8f4'}
                    >
                      <td style={{ padding: '9px 10px', fontWeight: 500, color: '#1a1a1a', maxWidth: 200 }}>{row.project}</td>
                      <td style={{ padding: '9px 10px', color: '#6b7280' }}>{row.client}</td>
                      <td style={{ padding: '9px 10px', color: '#4b5563', fontWeight: 500 }}>S${row.value.toLocaleString()}</td>
                      <td style={{ padding: '9px 10px', color: '#6b7280' }}>{row.hrs}h</td>
                      <td style={{ padding: '9px 10px', color: '#4b5563' }}>S${row.rate}/hr</td>
                      <td style={{ padding: '9px 10px' }}>
                        <span style={{ fontWeight: 700, color: row.scopeCreep > 0 ? '#ef4444' : '#10b981' }}>
                          {row.scopeCreep > 0 ? `+${row.scopeCreep}%` : `${row.scopeCreep}%`}
                        </span>
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        {row.scopeCreep > 20 ? (
                          <span style={{ background: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                            ⚠ Scope Creep
                          </span>
                        ) : (
                          <span style={{ background: '#d1fae5', color: '#065f46', padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                            On Track
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AI insight */}
            <div style={{
              background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10,
              padding: '12px 16px', marginTop: 16, display: 'flex', gap: 10,
            }}>
              <span style={{ color: '#f59e0b', fontWeight: 700, flexShrink: 0 }}>✦</span>
              <span style={{ fontSize: 13, color: '#78350f', lineHeight: 1.5 }}>
                Motion Graphics – Arko ran 51% over estimated hours. Two projects (Packaging, Annual Report) are showing scope creep patterns. Consider adding a revision clause to your contracts.
              </span>
            </div>
          </>
        )}
      </div>

      {/* Pitch Score */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Pitch Score</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Your proposal win rate</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Win Rate', value: '34%', large: true },
            { label: 'Proposals Sent', value: '18' },
            { label: 'Converted', value: '6' },
            { label: 'Avg Close Time', value: '6.2 days' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', background: '#faf8f4', borderRadius: 10, padding: '14px' }}>
              <div style={{ fontSize: s.large ? 32 : 22, fontWeight: 700, color: '#1a1a1a' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={pitchWinRate}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${v}%`} domain={[0, 50]} />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Win Rate']}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e0d8', fontSize: 13 }}
            />
            <Line type="monotone" dataKey="rate" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b' }} />
          </LineChart>
        </ResponsiveContainer>

        {/* AI insight */}
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10,
          padding: '12px 16px', marginTop: 16, display: 'flex', gap: 10,
        }}>
          <span style={{ color: '#f59e0b', fontWeight: 700, flexShrink: 0 }}>✦</span>
          <span style={{ fontSize: 13, color: '#78350f', lineHeight: 1.5 }}>
            Proposals sent within 48 hours of inquiry convert at 71%. After 72 hours, conversion drops to 22%. Speed is your edge.
          </span>
        </div>
      </div>
    </div>
  );
}
