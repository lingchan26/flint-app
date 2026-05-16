import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ComposedChart, Line, ReferenceLine,
} from 'recharts';
import { Download, Loader, AlertCircle, X, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const MONTH_LABEL = (date) => date.toLocaleString('en-SG', { month: 'short' });

function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function addMonths(d, n) { return new Date(d.getFullYear(), d.getMonth() + n, 1); }

const SGD = (n) => `S$${(Number(n) || 0).toLocaleString('en-SG', { maximumFractionDigits: 0 })}`;

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Date range filter
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    return {
      from: from.toISOString().slice(0, 10),
      to: now.toISOString().slice(0, 10),
    };
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [projectsRes, invoicesRes, expensesRes] = await Promise.all([
          supabase.from('projects').select('*'),
          supabase.from('invoices').select('*'),
          supabase.from('expenses').select('*'),
        ]);
        if (cancelled) return;
        if (projectsRes.error) throw projectsRes.error;
        if (invoicesRes.error) throw invoicesRes.error;
        if (expensesRes.error) throw expensesRes.error;
        setProjects(projectsRes.data || []);
        setInvoices(invoicesRes.data || []);
        setExpenses(expensesRes.data || []);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load reports');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const fromDate = new Date(dateRange.from);
  const toDate = new Date(dateRange.to);

  // ── Bookings stats ─────────────────────────────────────────────────
  const bookingStats = useMemo(() => {
    const inRange = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d >= fromDate && d <= toDate;
    };

    const projectsInRange = projects.filter(p => inRange(p.created_at));
    const invoicesInRange = invoices.filter(i => inRange(i.created_at));

    const outstanding = invoicesInRange
      .filter(i => i.status !== 'Paid' && i.status !== 'Refunded')
      .reduce((s, i) => s + (Number(i.amount) || 0), 0);

    const grossBooked = invoicesInRange
      .filter(i => i.status !== 'Refunded')
      .reduce((s, i) => s + (Number(i.amount) || 0), 0);

    const collected = invoicesInRange
      .filter(i => i.status === 'Paid')
      .reduce((s, i) => s + (Number(i.amount) || 0), 0);

    const refunded = invoicesInRange
      .filter(i => i.status === 'Refunded')
      .reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const refundedCount = invoicesInRange.filter(i => i.status === 'Refunded').length;

    return [
      { label: 'Number of Projects', value: projectsInRange.length, sub: 'In range' },
      { label: 'Outstanding Payments', value: SGD(outstanding), sub: 'Pending or Overdue' },
      { label: 'Gross Booked Amount', value: SGD(grossBooked), sub: 'In range' },
      { label: 'Refunded Payments', value: SGD(refunded), sub: refundedCount === 1 ? '1 refund' : `${refundedCount} refunds` },
      { label: 'Collected Payments', value: SGD(collected), sub: 'Paid in range' },
    ];
  }, [projects, invoices, fromDate, toDate]);

  // ── Monthly Sales (last 6 months) ──────────────────────────────────
  const monthlySales = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const start = addMonths(startOfMonth(now), -i);
      const end = addMonths(start, 1);
      months.push({
        label: MONTH_LABEL(start),
        start, end,
        revenue: 0, bookings: 0,
      });
    }
    invoices.forEach(inv => {
      if (inv.status !== 'Paid') return;
      const ref = inv.paid_at ? new Date(inv.paid_at) : null;
      if (!ref) return;
      const m = months.find(x => ref >= x.start && ref < x.end);
      if (m) m.revenue += Number(inv.amount) || 0;
    });
    projects.forEach(p => {
      if (!p.created_at) return;
      const ref = new Date(p.created_at);
      const m = months.find(x => ref >= x.start && ref < x.end);
      if (m) m.bookings += 1;
    });
    return months.map(m => ({ month: m.label, revenue: m.revenue, bookings: m.bookings }));
  }, [invoices, projects]);

  const totalRevenue6mo = monthlySales.reduce((s, m) => s + m.revenue, 0);
  const avgRevenue = monthlySales.length > 0 ? Math.round(totalRevenue6mo / monthlySales.length) : 0;
  const bestMonth = monthlySales.reduce((best, m) => m.revenue > (best?.revenue || 0) ? m : best, null);
  const thisMonthBookings = monthlySales[monthlySales.length - 1]?.bookings || 0;
  const hasMonthlyData = totalRevenue6mo > 0 || monthlySales.some(m => m.bookings > 0);

  // ── P&L Forecast (history + simple extrapolation) ──────────────────
  const forecast = useMemo(() => {
    const now = new Date();
    const history = [];
    for (let i = 5; i >= 0; i--) {
      const start = addMonths(startOfMonth(now), -i);
      const end = addMonths(start, 1);
      let income = 0, exp = 0;
      invoices.forEach(inv => {
        if (inv.status !== 'Paid') return;
        const ref = inv.paid_at ? new Date(inv.paid_at) : null;
        if (ref && ref >= start && ref < end) income += Number(inv.amount) || 0;
      });
      expenses.forEach(e => {
        if (!e.date) return;
        const ref = new Date(e.date);
        if (ref >= start && ref < end) exp += Number(e.amount) || 0;
      });
      history.push({
        month: MONTH_LABEL(start),
        income, expenses: exp, profit: income - exp,
        projected: false,
      });
    }

    // Project the next 3 months using simple 3-month average
    const recent3 = history.slice(-3);
    if (recent3.length > 0) {
      const avgInc = recent3.reduce((s, m) => s + m.income, 0) / recent3.length;
      const avgExp = recent3.reduce((s, m) => s + m.expenses, 0) / recent3.length;
      for (let i = 1; i <= 3; i++) {
        const start = addMonths(startOfMonth(now), i);
        history.push({
          month: MONTH_LABEL(start),
          income: Math.round(avgInc),
          expenses: Math.round(avgExp),
          profit: Math.round(avgInc - avgExp),
          projected: true,
        });
      }
    }
    return history;
  }, [invoices, expenses]);

  const hasForecastData = forecast.some(m => !m.projected && (m.income > 0 || m.expenses > 0));

  const dl = (format) => alert(`Export as ${format} — coming soon. For now, screenshot the chart or copy the underlying data.`);

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
        <h1 className="page-title">Reports</h1>
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

      {/* Bookings Report */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">Activity in range</div>
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
            <button className="btn btn-secondary btn-sm" onClick={() => dl('CSV')}>
              <Download size={14} /> Export
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
          {bookingStats.map(item => (
            <div key={item.label} style={{
              background: '#faf8f4', borderRadius: 10, padding: '16px',
              border: '1px solid #e5e0d8',
            }}>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{item.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{item.value}</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Sales */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Monthly Sales Report</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Last 6 months — revenue from paid invoices, project count by created date</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => dl('CSV')}>
            <Download size={14} /> Export
          </button>
        </div>
        {!hasMonthlyData ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
            No revenue or projects yet in the last 6 months. The chart populates once you mark
            invoices as paid or create projects.
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                Avg Revenue/mo: {SGD(avgRevenue)}
              </span>
              {bestMonth && bestMonth.revenue > 0 && (
                <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                  Best month: {bestMonth.month} {SGD(bestMonth.revenue)}
                </span>
              )}
              <span style={{ background: '#dbeafe', color: '#1e40af', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                Projects this month: {thisMonthBookings}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlySales} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e0d8', fontSize: 13 }} />
                <Bar yAxisId="left" dataKey="revenue" fill="#f59e0b" radius={[4,4,0,0]} name="Revenue" />
                <Bar yAxisId="right" dataKey="bookings" fill="#1a1a1a" radius={[4,4,0,0]} name="Projects" />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <span style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 10, background: '#f59e0b', borderRadius: 2 }} /> Revenue
              </span>
              <span style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 10, background: '#1a1a1a', borderRadius: 2 }} /> Projects
              </span>
            </div>
          </>
        )}
      </div>

      {/* P&L Forecast */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <div className="card-title">P&L Forecast</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>6 months actual + 3 months projected (based on 3-month rolling average)</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => dl('CSV')}>
            <Download size={14} /> Export
          </button>
        </div>
        {!hasForecastData ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
            No income or expenses recorded yet. The forecast needs at least one month of data
            to project forward.
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={forecast} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value, name) => [SGD(value), name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Profit']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e0d8', fontSize: 13 }}
                  labelFormatter={(label, payload) => {
                    const projected = payload?.[0]?.payload?.projected;
                    return projected ? `${label} (projected)` : label;
                  }}
                />
                <ReferenceLine
                  x={forecast.findIndex(m => m.projected) > 0 ? forecast[forecast.findIndex(m => m.projected) - 1].month : null}
                  stroke="#d4cdc2"
                  strokeDasharray="2 2"
                />
                <Bar dataKey="income" fill="#f59e0b" radius={[4,4,0,0]} name="income" fillOpacity={1} />
                <Bar dataKey="expenses" fill="#e5e0d8" radius={[4,4,0,0]} name="expenses" />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} name="profit" />
              </ComposedChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
              {[
                { color: '#f59e0b', label: 'Income (paid invoices)' },
                { color: '#e5e0d8', label: 'Expenses' },
                { color: '#10b981', label: 'Profit' },
              ].map(l => (
                <span key={l.label} style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 10, height: 10, background: l.color, borderRadius: 2 }} /> {l.label}
                </span>
              ))}
              <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>
                Faded bars after the dashed line = projected
              </span>
            </div>
          </>
        )}
      </div>

      {/* Coming-soon sections — honest about what's needed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <ComingSoonCard
          title="Lead Source Breakdown"
          description="See where your best clients come from — Referral, Instagram, LinkedIn, etc."
          requires="Adding a 'source' field to your contacts or projects"
        />
        <ComingSoonCard
          title="Average Time per Pipeline Stage"
          description="Spot bottlenecks in your sales pipeline by tracking how long projects spend in each stage."
          requires="Stage-transition timestamps (tracked automatically once active for a month)"
        />
        <ComingSoonCard
          title="Margin Map Pro"
          description="Profitability per service, client, and project. See which work earns you the highest effective hourly rate."
          requires="Time-tracking — logging hours against projects"
        />
        <ComingSoonCard
          title="Pitch Win Rate"
          description="How many proposals you win vs lose, by month."
          requires="A 'Lost' or 'Rejected' stage to track unsuccessful pitches alongside wins"
        />
      </div>
    </div>
  );
}

function ComingSoonCard({ title, description, requires }) {
  return (
    <div className="card" style={{ background: '#faf8f4', borderStyle: 'dashed' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <TrendingUp size={16} color="#9ca3af" />
        <div style={{ fontWeight: 600, fontSize: 14, color: '#6b7280' }}>{title}</div>
        <span style={{
          marginLeft: 'auto', background: '#fef3c7', color: '#92400e',
          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
          textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>
          Coming soon
        </span>
      </div>
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 10, lineHeight: 1.5 }}>{description}</div>
      <div style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic' }}>
        Needs: {requires}
      </div>
    </div>
  );
}
