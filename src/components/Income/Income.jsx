import { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, Legend,
} from 'recharts';
import { Plus, X, CheckCircle, DollarSign, Search, Zap, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Map Supabase row → component invoice shape
function rowToInvoice(row) {
  return {
    id: row.id,
    invoice: row.invoice_number,
    client: row.client,
    project: row.project || '',
    amount: Number(row.amount),
    due: row.due_date ? new Date(row.due_date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
    dueRaw: row.due_date || '',
    status: row.status,
    currency: row.currency || 'SGD',
    month: row.month || '',
    type: row.service_type || '',
    chase_active: row.chase_active || false,
  };
}

// Map Supabase row → component expense shape
function rowToExpense(row) {
  return {
    id: row.id,
    merchant: row.merchant,
    date: row.date ? new Date(row.date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
    dateRaw: row.date || '',
    amount: Number(row.amount),
    currency: row.currency || 'SGD',
    client: row.client || 'Internal',
    category: row.category || '',
    recurring: row.recurring || false,
    recurrence: row.recurrence || '',
  };
}

const monthlyPL = [
  { month: 'Oct', income: 18200, expenses: 4200 },
  { month: 'Nov', income: 22400, expenses: 5100 },
  { month: 'Dec', income: 14800, expenses: 3800 },
  { month: 'Jan', income: 28600, expenses: 6200 },
  { month: 'Feb', income: 31200, expenses: 7400 },
  { month: 'Mar', income: 26800, expenses: 5900 },
].map(d => ({ ...d, profit: d.income - d.expenses }));

const CLIENTS = ['Internal', 'Lumen Co', 'Vertex Inc', 'Bloom Foods', 'Kova Studio', 'Arko Media', 'Novu Tech'];
const CATEGORIES = [
  'Advertising & Marketing', 'Bank & Transaction Fees', 'Client Gifts',
  'Commission & Fees', 'Training & Development', 'Gas & Fuel',
  'Home Office', 'Legal & Professional Services', 'Licenses',
  'Meals & Transport', 'Utilities',
];

const statusColor = {
  Paid: { bg: '#d1fae5', color: '#065f46' },
  Processing: { bg: '#fef3c7', color: '#92400e' },
  Upcoming: { bg: '#f3f4f6', color: '#4b5563' },
  Overdue: { bg: '#fee2e2', color: '#991b1b' },
};

const TABS = ['Overview', 'Invoices', 'Expenses', 'Profit & Loss'];
const PAGE_SIZE = 20;
const MONTHS = ['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const TYPES = ['All', 'Branding', 'Digital', 'Print', 'CGI', 'Motion', 'Corporate', 'Social', 'Packaging'];
const PL_PERIODS = ['This Month', 'This Quarter', 'This Year'];

const defaultReminders = [
  { id: 1, label: '3 days before due date', timing: 'before', days: 3, subject: 'Upcoming invoice — just a heads up', on: true, sent: false },
  { id: 2, label: 'On due date', timing: 'due', days: 0, subject: 'Invoice due today', on: true, sent: true },
  { id: 3, label: '7 days overdue', timing: 'after', days: 7, subject: 'Following up on your invoice', on: true, sent: true },
  { id: 4, label: '14 days overdue', timing: 'after', days: 14, subject: 'Action required — overdue invoice', on: true, sent: false },
  { id: 5, label: '30 days overdue', timing: 'after', days: 30, subject: 'Final notice', on: false, sent: false },
];

function nextDueDate(recurrence) {
  const now = new Date();
  if (recurrence === 'Weekly') {
    const d = new Date(now);
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  if (recurrence === 'Monthly') {
    const d = new Date(now);
    d.setMonth(d.getMonth() + 1);
    return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  if (recurrence === 'Yearly') {
    const d = new Date(now);
    d.setFullYear(d.getFullYear() + 1);
    return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return '';
}

export default function Income({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loadingInv, setLoadingInv] = useState(true);
  const [loadingExp, setLoadingExp] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ client: '', project: '', amount: '', currency: 'SGD', due: '', status: 'Upcoming', month: '', type: '' });
  const [expForm, setExpForm] = useState({
    merchant: '', date: '', amount: '', currency: 'SGD', client: 'Internal', category: 'Licenses',
    recurring: false, recurrence: 'Monthly',
  });

  // Chase state
  const [chaseInvoice, setChaseInvoice] = useState(null);
  const [reminders, setReminders] = useState(defaultReminders);
  const [expandedReminder, setExpandedReminder] = useState(null);
  const [emailBodies, setEmailBodies] = useState({});

  // Invoice filters
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterClient, setFilterClient] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [page, setPage] = useState(1);

  // P&L period
  const [plPeriod, setPlPeriod] = useState('This Month');
  const [taxRate, setTaxRate] = useState(22);

  useEffect(() => { fetchInvoices(); fetchExpenses(); }, []);

  async function fetchInvoices() {
    setLoadingInv(true);
    const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    if (!error && data) setInvoices(data.map(rowToInvoice));
    setLoadingInv(false);
  }

  async function fetchExpenses() {
    setLoadingExp(true);
    const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    if (!error && data) setExpenses(data.map(rowToExpense));
    setLoadingExp(false);
  }

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const openChase = (inv) => {
    setChaseInvoice(inv);
    setReminders(defaultReminders.map(r => ({ ...r })));
    setExpandedReminder(null);
  };

  const closeChase = () => {
    setChaseInvoice(null);
    setExpandedReminder(null);
  };

  const toggleReminder = (id) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, on: !r.on } : r));
  };

  const updateSubject = (id, val) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, subject: val } : r));
  };

  const markStatus = async (id, status) => {
    setInvoices(inv => inv.map(i => i.id === id ? { ...i, status } : i));
    const update = { status, ...(status === 'Paid' ? { paid_at: new Date().toISOString() } : {}) };
    await supabase.from('invoices').update(update).eq('id', id);
    setOpenMenu(null);
    if (status === 'Paid') showToast('Payment received!');
  };

  const saveNew = async () => {
    if (!form.client || !form.amount) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const year = new Date().getFullYear();
    const num = String(invoices.length + 1).padStart(3, '0');
    const invoiceNum = `INV-${year}-${num}`;
    const monthName = form.due ? new Date(form.due).toLocaleString('en', { month: 'short' }) : '';
    const insert = {
      user_id: user.id,
      invoice_number: invoiceNum,
      client: form.client,
      project: form.project || null,
      amount: Number(form.amount),
      currency: form.currency,
      due_date: form.due || null,
      status: form.status,
      month: monthName,
      service_type: form.type || null,
    };
    const { data, error } = await supabase.from('invoices').insert(insert).select().single();
    if (!error && data) {
      setInvoices(inv => [rowToInvoice(data), ...inv]);
      showToast('Invoice created!');
    }
    setSaving(false);
    setShowNew(false);
    setForm({ client: '', project: '', amount: '', currency: 'SGD', due: '', status: 'Upcoming', month: '', type: '' });
  };

  const saveExpense = async () => {
    if (!expForm.merchant || !expForm.amount) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const insert = {
      user_id: user.id,
      merchant: expForm.merchant,
      date: expForm.date || new Date().toISOString().split('T')[0],
      amount: Number(expForm.amount),
      currency: expForm.currency,
      client: expForm.client,
      category: expForm.category,
      recurring: expForm.recurring,
      recurrence: expForm.recurring ? expForm.recurrence : null,
    };
    const { data, error } = await supabase.from('expenses').insert(insert).select().single();
    if (!error && data) {
      setExpenses(e => [rowToExpense(data), ...e]);
      showToast('Expense added!');
    }
    setSaving(false);
    setShowExpense(false);
    setExpForm({ merchant: '', date: '', amount: '', currency: 'SGD', client: 'Internal', category: 'Licenses', recurring: false, recurrence: 'Monthly' });
  };

  const deleteExpense = async (id) => {
    setExpenses(e => e.filter(ex => ex.id !== id));
    await supabase.from('expenses').delete().eq('id', id);
  };

  const totals = {
    paid: invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0),
    processing: invoices.filter(i => i.status === 'Processing').reduce((s, i) => s + i.amount, 0),
    upcoming: invoices.filter(i => i.status === 'Upcoming').reduce((s, i) => s + i.amount, 0),
    overdue: invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0),
  };

  const uniqueClients = ['All', ...Array.from(new Set(invoices.map(i => i.client)))];

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (search && !inv.client.toLowerCase().includes(search.toLowerCase()) && !inv.invoice.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterMonth !== 'All' && inv.month !== filterMonth) return false;
      if (filterClient !== 'All' && inv.client !== filterClient) return false;
      if (filterType !== 'All' && inv.type !== filterType) return false;
      if (filterStatus !== 'All' && inv.status !== filterStatus) return false;
      return true;
    });
  }, [invoices, search, filterMonth, filterClient, filterType, filterStatus]);

  const paginatedInvoices = filteredInvoices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filteredInvoices.length / PAGE_SIZE);

  const clearFilters = () => {
    setSearch(''); setFilterMonth('All'); setFilterClient('All');
    setFilterType('All'); setFilterStatus('All'); setPage(1);
  };

  const totalIncome = monthlyPL.reduce((s, d) => s + d.income, 0);
  const totalExpensesPL = monthlyPL.reduce((s, d) => s + d.expenses, 0);
  const netProfit = totalIncome - totalExpensesPL;
  const profitMargin = ((netProfit / totalIncome) * 100).toFixed(1);
  const taxReserve = Math.round(34200 * (taxRate / 100));
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Finance</h1>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          <Plus size={16} /> New Invoice
        </button>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: '#f0ece4', borderRadius: 999, padding: '4px', width: 'fit-content' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '6px 18px', borderRadius: 999, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 500,
              background: activeTab === tab ? '#f59e0b' : 'transparent',
              color: activeTab === tab ? '#fff' : '#6b7280',
              transition: 'all 0.15s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB: Overview */}
      {activeTab === 'Overview' && (
        <>
          {/* Chase Active Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '1px solid #fde68a',
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Zap size={16} color="#fff" fill="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>
                Chase active on{' '}
                <button onClick={() => setActiveTab('Invoices')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', fontWeight: 700, textDecoration: 'underline', padding: 0, fontSize: 13 }}>2 invoices</button>
                {' '}—{' '}
                <button onClick={() => setActiveTab('Invoices')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', fontWeight: 700, textDecoration: 'underline', padding: 0, fontSize: 13 }}>S$16,700 outstanding</button>
              </div>
              <div style={{ fontSize: 12, color: '#b45309', marginTop: 1 }}>
                Next reminder sends in{' '}
                <button onClick={() => setActiveTab('Invoices')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b45309', fontWeight: 700, textDecoration: 'underline', padding: 0, fontSize: 12 }}>4 days</button>
                {' '}· Bloom Foods + Arko Media
              </div>
            </div>
            <button
              className="btn btn-sm"
              onClick={() => setActiveTab('Invoices')}
              style={{
                background: 'transparent', border: '1px solid #f59e0b',
                color: '#92400e', fontSize: 12, fontWeight: 500,
                padding: '4px 12px', borderRadius: 6, cursor: 'pointer', flexShrink: 0,
              }}
            >
              Manage
            </button>
          </div>

          <div className="stats-grid" style={{ marginBottom: 24 }}>
            {[
              { label: 'Paid', value: totals.paid, color: '#10b981', bg: '#d1fae5' },
              { label: 'Processing', value: totals.processing, color: '#f59e0b', bg: '#fef3c7' },
              { label: 'Upcoming', value: totals.upcoming, color: '#6b7280', bg: '#f3f4f6' },
              { label: 'Overdue', value: totals.overdue, color: '#ef4444', bg: '#fee2e2' },
            ].map(c => (
              <div key={c.label} className="stat-card">
                <div className="stat-icon" style={{ background: c.bg }}>
                  <DollarSign size={20} color={c.color} />
                </div>
                <div>
                  <div className="stat-label">{c.label}</div>
                  <div className="stat-value" style={{ fontSize: 20 }}>S${c.value.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Payments bar */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <div className="card-title">Payments</div>
            </div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a' }}>
                S${(totals.paid + totals.processing + totals.upcoming + totals.overdue).toLocaleString()}
              </span>
              <span style={{ fontSize: 13, color: '#9ca3af', marginLeft: 8 }}>Total gross</span>
            </div>
            <div style={{ display: 'flex', height: 12, borderRadius: 999, overflow: 'hidden', marginBottom: 16, marginTop: 12 }}>
              {[
                { pct: (totals.paid / (totals.paid + totals.processing + totals.upcoming + totals.overdue) * 100), color: '#3d9970' },
                { pct: (totals.processing / (totals.paid + totals.processing + totals.upcoming + totals.overdue) * 100), color: '#f59e0b' },
                { pct: (totals.upcoming / (totals.paid + totals.processing + totals.upcoming + totals.overdue) * 100), color: '#d1d5db' },
                { pct: (totals.overdue / (totals.paid + totals.processing + totals.upcoming + totals.overdue) * 100), color: '#e03e3e' },
              ].map((seg, i) => (
                <div key={i} style={{ width: `${seg.pct}%`, background: seg.color }} />
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              {[
                { color: '#3d9970', label: 'Paid', amount: `S$${totals.paid.toLocaleString()}` },
                { color: '#f59e0b', label: 'Processing', amount: `S$${totals.processing.toLocaleString()}` },
                { color: '#d1d5db', label: 'Upcoming', amount: `S$${totals.upcoming.toLocaleString()}` },
                { color: '#e03e3e', label: 'Overdue', amount: `S$${totals.overdue.toLocaleString()}` },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#6b7280', flex: 1 }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>{item.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly P&L mini chart */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <div className="card-title">Monthly P&L</div>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>Last 6 months</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={monthlyPL} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value, name) => [`S$${value.toLocaleString()}`, name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Profit']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e0d8', fontSize: 13 }}
                />
                <Bar dataKey="income" fill="#f59e0b" radius={[4,4,0,0]} name="income" />
                <Bar dataKey="expenses" fill="#e5e0d8" radius={[4,4,0,0]} name="expenses" />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="profit" />
              </ComposedChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              {[
                { color: '#f59e0b', label: 'Income' },
                { color: '#e5e0d8', label: 'Expenses' },
                { color: '#10b981', label: 'Profit' },
              ].map(l => (
                <span key={l.label} style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 10, height: 10, background: l.color, borderRadius: 2 }} /> {l.label}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* TAB: Invoices */}
      {activeTab === 'Invoices' && (
        <>
          {/* Filter row */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 160 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 32 }}
                placeholder="Search client or invoice…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select className="form-select" style={{ width: 130 }} value={filterMonth} onChange={e => { setFilterMonth(e.target.value); setPage(1); }}>
              {MONTHS.map(m => <option key={m}>{m === 'All' ? 'All Months' : m}</option>)}
            </select>
            <select className="form-select" style={{ width: 140 }} value={filterClient} onChange={e => { setFilterClient(e.target.value); setPage(1); }}>
              {uniqueClients.map(c => <option key={c}>{c === 'All' ? 'All Clients' : c}</option>)}
            </select>
            <select className="form-select" style={{ width: 130 }} value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}>
              {TYPES.map(t => <option key={t}>{t === 'All' ? 'All Types' : t}</option>)}
            </select>
            <select className="form-select" style={{ width: 130 }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
              {['All', 'Paid', 'Processing', 'Upcoming', 'Overdue'].map(s => <option key={s}>{s === 'All' ? 'All Status' : s}</option>)}
            </select>
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear filters</button>
          </div>

          <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12 }}>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filteredInvoices.length)}–{Math.min(page * PAGE_SIZE, filteredInvoices.length)} of {filteredInvoices.length} invoices
          </div>

          <div className="table-container" style={{ marginBottom: 16 }}>
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Project</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 500, fontSize: 13 }}>{inv.invoice}</td>
                    <td>{inv.client}</td>
                    <td style={{ color: '#6b7280' }}>{inv.project}</td>
                    <td style={{ fontWeight: 500 }}>S${inv.amount.toLocaleString()}</td>
                    <td style={{ color: '#6b7280', fontSize: 13 }}>{inv.due}</td>
                    <td>
                      <span style={{
                        ...statusColor[inv.status],
                        padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      }}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {inv.status !== 'Paid' && (
                          <>
                            {/* Mark as Paid — prominent green button */}
                            <button
                              onClick={() => markStatus(inv.id, 'Paid')}
                              style={{
                                padding: '5px 12px', borderRadius: 6, border: 'none',
                                background: '#10b981', color: '#fff',
                                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 4,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <CheckCircle size={12} /> Mark Paid
                            </button>
                            {/* Chase button */}
                            <button
                              onClick={() => openChase(inv)}
                              style={{
                                padding: '4px 10px', borderRadius: 6, border: '1px solid #f59e0b',
                                background: 'transparent', color: '#f59e0b',
                                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 4,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <Zap size={11} /> Chase
                            </button>
                            {/* Other options dropdown */}
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === inv.id ? null : inv.id); }}
                              style={{ fontSize: 16, padding: '2px 6px', lineHeight: 1 }}
                              title="More options"
                            >
                              ···
                            </button>
                            {openMenu === inv.id && (
                              <>
                                <div style={{ position: 'fixed', inset: 0, zIndex: 48 }} onClick={() => setOpenMenu(null)} />
                                <div className="dropdown-menu" style={{ position: 'absolute', right: 0, top: 36, zIndex: 49 }}>
                                  {['Paid via Stripe', 'Paid via Google Pay', 'Paid via Bank Transfer'].map(opt => (
                                    <button key={opt} className="dropdown-item" onClick={() => markStatus(inv.id, 'Paid')}>
                                      {opt}
                                    </button>
                                  ))}
                                  <button className="dropdown-item" onClick={() => markStatus(inv.id, 'Processing')}>
                                    Mark as Processing
                                  </button>
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedInvoices.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>
                      No invoices match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                style={{ opacity: page === 1 ? 0.4 : 1 }}
              >
                ← Prev
              </button>
              <span style={{ fontSize: 13, color: '#6b7280' }}>Page {page} of {totalPages}</span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{ opacity: page === totalPages ? 0.4 : 1 }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* TAB: Expenses */}
      {activeTab === 'Expenses' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Business Expenses</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Total: S${totalExpenses.toFixed(2)}</div>
            </div>
            <button className="btn btn-primary" onClick={() => setShowExpense(true)}>
              <Plus size={16} /> Add Expense
            </button>
          </div>

          <div className="table-container" style={{ marginBottom: 24 }}>
            <table>
              <thead>
                <tr>
                  <th>Merchant</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Currency</th>
                  <th>Client</th>
                  <th>Category</th>
                  <th>Recurring</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(ex => (
                  <tr key={ex.id}>
                    <td style={{ fontWeight: 500 }}>{ex.merchant}</td>
                    <td style={{ color: '#6b7280', fontSize: 13 }}>{ex.date}</td>
                    <td style={{ fontWeight: 500 }}>{ex.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>
                      <span style={{ background: '#f3f4f6', color: '#4b5563', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                        {ex.currency}
                      </span>
                    </td>
                    <td style={{ color: '#6b7280', fontSize: 13 }}>{ex.client}</td>
                    <td>
                      <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>
                        {ex.category}
                      </span>
                    </td>
                    <td>
                      {ex.recurring ? (
                        <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500 }}>
                          {ex.recurrence}
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#ef4444', padding: '4px 8px' }}
                        onClick={() => deleteExpense(ex.id)}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* TAB: Profit & Loss */}
      {activeTab === 'Profit & Loss' && (
        <>
          {/* Period selector */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: '#f0ece4', borderRadius: 999, padding: '4px', width: 'fit-content' }}>
            {PL_PERIODS.map(period => (
              <button
                key={period}
                onClick={() => setPlPeriod(period)}
                style={{
                  padding: '6px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 500,
                  background: plPeriod === period ? '#f59e0b' : 'transparent',
                  color: plPeriod === period ? '#fff' : '#6b7280',
                  transition: 'all 0.15s',
                }}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Summary row */}
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            {[
              { label: 'Total Income', value: `S$${totalIncome.toLocaleString()}`, color: '#f59e0b', bg: '#fef3c7' },
              { label: 'Total Expenses', value: `S$${totalExpensesPL.toLocaleString()}`, color: '#ef4444', bg: '#fee2e2' },
              { label: 'Net Profit', value: `S$${netProfit.toLocaleString()}`, color: '#10b981', bg: '#d1fae5' },
              { label: 'Profit Margin', value: `${profitMargin}%`, color: '#8b5cf6', bg: '#ede9fe' },
            ].map(c => (
              <div key={c.label} className="stat-card">
                <div className="stat-icon" style={{ background: c.bg }}>
                  <DollarSign size={20} color={c.color} />
                </div>
                <div>
                  <div className="stat-label">{c.label}</div>
                  <div className="stat-value" style={{ fontSize: 18 }}>{c.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* P&L Chart */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <div className="card-title">Income vs Expenses vs Profit</div>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>Last 6 months</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={monthlyPL} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value, name) => [`S$${value.toLocaleString()}`, name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Profit']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e0d8', fontSize: 13 }}
                />
                <Bar dataKey="income" fill="#f59e0b" radius={[4,4,0,0]} name="income" />
                <Bar dataKey="expenses" fill="#e5e0d8" radius={[4,4,0,0]} name="expenses" />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} name="profit" />
              </ComposedChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              {[
                { color: '#f59e0b', label: 'Income' },
                { color: '#e5e0d8', label: 'Expenses' },
                { color: '#10b981', label: 'Profit' },
              ].map(l => (
                <span key={l.label} style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 10, height: 10, background: l.color, borderRadius: 2 }} /> {l.label}
                </span>
              ))}
            </div>
          </div>

          {/* Tax Pocket */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Tax Pocket</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
              Set aside a % of each payment as a tax reserve
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
              <label style={{ fontSize: 13, color: '#1a1a1a', fontWeight: 500 }}>Tax rate:</label>
              <input
                type="range" min={5} max={40} value={taxRate}
                onChange={e => setTaxRate(Number(e.target.value))}
                style={{ width: 160, accentColor: '#f59e0b' }}
              />
              <span style={{
                background: '#fef3c7', color: '#92400e', fontWeight: 700,
                padding: '4px 12px', borderRadius: 20, fontSize: 14,
              }}>
                {taxRate}%
              </span>
            </div>
            <div style={{
              background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10,
              padding: '12px 16px', marginBottom: 12,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#92400e' }}>
                Estimated tax reserve: S${taxReserve.toLocaleString()}
              </div>
              <div style={{ fontSize: 13, color: '#78350f', marginTop: 4 }}>
                Based on S$34,200 collected this year
              </div>
            </div>
            <div style={{
              background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 10,
              padding: '12px 16px',
            }}>
              <div style={{ fontSize: 13, color: '#065f46', fontWeight: 500 }}>
                Break-even: You crossed your monthly break-even of S$2,400 on the 8th of this month
              </div>
            </div>
          </div>
        </>
      )}

      {/* New Invoice Panel */}
      {showNew && (
        <>
          <div className="overlay" onClick={() => setShowNew(false)} />
          <div className="slide-panel">
            <div className="slide-panel-header">
              <span className="slide-panel-title">New Invoice</span>
              <button className="close-btn" onClick={() => setShowNew(false)}><X size={16} /></button>
            </div>
            <div className="slide-panel-body">
              <div className="form-group">
                <label className="form-label">Client *</label>
                <input className="form-input" value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} placeholder="Client name" />
              </div>
              <div className="form-group">
                <label className="form-label">Project</label>
                <input className="form-input" value={form.project} onChange={e => setForm(f => ({ ...f, project: e.target.value }))} placeholder="Project name" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Amount *</label>
                  <input className="form-input" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select className="form-select" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                    {['SGD','AUD','USD','GBP','VND','MYR','THB'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={form.due} onChange={e => setForm(f => ({ ...f, due: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {['Upcoming','Processing','Paid','Overdue'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {TYPES.filter(t => t !== 'All').map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="slide-panel-footer">
              <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveNew}>Create Invoice</button>
            </div>
          </div>
        </>
      )}

      {/* Add Expense Panel */}
      {showExpense && (
        <>
          <div className="overlay" onClick={() => setShowExpense(false)} />
          <div className="slide-panel">
            <div className="slide-panel-header">
              <span className="slide-panel-title">Add Expense</span>
              <button className="close-btn" onClick={() => setShowExpense(false)}><X size={16} /></button>
            </div>
            <div className="slide-panel-body">
              <div className="form-group">
                <label className="form-label">Merchant Name *</label>
                <input className="form-input" value={expForm.merchant} onChange={e => setExpForm(f => ({ ...f, merchant: e.target.value }))} placeholder="e.g. Adobe Creative Cloud" />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={expForm.date} onChange={e => setExpForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Amount *</label>
                  <input className="form-input" type="number" step="0.01" value={expForm.amount} onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select className="form-select" value={expForm.currency} onChange={e => setExpForm(f => ({ ...f, currency: e.target.value }))}>
                    {['SGD','AUD','USD','GBP','VND','MYR','THB'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Client</label>
                <select className="form-select" value={expForm.client} onChange={e => setExpForm(f => ({ ...f, client: e.target.value }))}>
                  {CLIENTS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={expForm.category} onChange={e => setExpForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Recurring section */}
              <div style={{ borderTop: '1px solid #f0ece4', paddingTop: 16, marginTop: 8 }}>
                <div style={{ fontWeight: 500, fontSize: 13, color: '#1a1a1a', marginBottom: 12 }}>Recurring</div>
                <div className="form-group">
                  <label className="toggle" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={expForm.recurring}
                      onChange={e => setExpForm(f => ({ ...f, recurring: e.target.checked }))}
                    />
                    <span className="toggle-slider" />
                    <span style={{ fontSize: 13, color: '#6b7280' }}>This is a recurring expense</span>
                  </label>
                </div>
                {expForm.recurring && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Frequency</label>
                      <select className="form-select" value={expForm.recurrence} onChange={e => setExpForm(f => ({ ...f, recurrence: e.target.value }))}>
                        {['Weekly', 'Monthly', 'Yearly'].map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div style={{
                      background: '#f0ece4', borderRadius: 8, padding: '10px 14px',
                      fontSize: 13, color: '#6b7280',
                    }}>
                      Next due: <strong style={{ color: '#1a1a1a' }}>{nextDueDate(expForm.recurrence)}</strong>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="slide-panel-footer">
              <button className="btn btn-secondary" onClick={() => setShowExpense(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveExpense}>Add Expense</button>
            </div>
          </div>
        </>
      )}

      {/* Chase Panel */}
      {chaseInvoice && (
        <>
          <div className="overlay" onClick={closeChase} />
          <div className="slide-panel" style={{ width: 480 }}>
            <div className="slide-panel-header">
              <div>
                <span className="slide-panel-title">Chase — {chaseInvoice.invoice}</span>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                  Automate payment follow-up for this invoice
                </div>
              </div>
              <button className="close-btn" onClick={closeChase}><X size={16} /></button>
            </div>

            <div className="slide-panel-body">
              {/* Status bar */}
              <div style={{
                background: '#faf8f4', border: '1px solid #e5e0d8', borderRadius: 10,
                padding: '12px 14px', marginBottom: 20,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>
                      S${chaseInvoice.amount.toLocaleString()} · {chaseInvoice.status} · {chaseInvoice.client}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                    <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>
                      {chaseInvoice.status === 'Overdue' ? 'Overdue 23 days' : chaseInvoice.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reminder schedule */}
              <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a', marginBottom: 12 }}>
                Reminder Schedule
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {reminders.map(r => (
                  <div key={r.id} style={{
                    border: '1px solid #e5e0d8', borderRadius: 10,
                    background: r.on ? '#fff' : '#faf8f4',
                    overflow: 'hidden',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
                      {/* Toggle */}
                      <div
                        onClick={() => toggleReminder(r.id)}
                        style={{
                          width: 36, height: 20, borderRadius: 10, cursor: 'pointer', flexShrink: 0,
                          background: r.on ? '#f59e0b' : '#d1d5db',
                          position: 'relative', transition: 'background 0.2s',
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: 2, left: r.on ? 18 : 2,
                          width: 16, height: 16, borderRadius: '50%', background: '#fff',
                          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }} />
                      </div>

                      {/* Label + subject */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: r.on ? '#1a1a1a' : '#9ca3af' }}>
                          {r.label}
                        </div>
                        <input
                          value={r.subject}
                          onChange={e => updateSubject(r.id, e.target.value)}
                          onClick={e => e.stopPropagation()}
                          style={{
                            fontSize: 11, color: '#6b7280', border: 'none', background: 'transparent',
                            outline: 'none', width: '100%', padding: 0, marginTop: 2,
                            cursor: 'text',
                          }}
                          placeholder="Subject line…"
                        />
                      </div>

                      {/* Status badge */}
                      <div style={{ flexShrink: 0 }}>
                        {!r.on ? (
                          <span style={{ background: '#f3f4f6', color: '#9ca3af', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                            Off
                          </span>
                        ) : r.sent ? (
                          <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                            Sent ✓
                          </span>
                        ) : (
                          <span style={{ background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                            Scheduled
                          </span>
                        )}
                      </div>

                      {/* Chevron */}
                      <button
                        onClick={() => setExpandedReminder(expandedReminder === r.id ? null : r.id)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2, flexShrink: 0 }}
                      >
                        {expandedReminder === r.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>

                    {/* Expanded email preview */}
                    {expandedReminder === r.id && (
                      <div style={{ borderTop: '1px solid #f0ece4', padding: '10px 12px', background: '#faf8f4' }}>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6, fontWeight: 500 }}>
                          Email body preview
                        </div>
                        <textarea
                          value={emailBodies[r.id] || `Hi {client_name},\n\nThis is a reminder that invoice ${chaseInvoice.invoice} for {amount} is due on {due_date}.\n\nPlease use the link below to pay:\n{invoice_link}\n\nThank you!`}
                          onChange={e => setEmailBodies(prev => ({ ...prev, [r.id]: e.target.value }))}
                          rows={5}
                          style={{
                            width: '100%', fontSize: 12, color: '#4b5563',
                            border: '1px solid #e5e0d8', borderRadius: 6,
                            padding: '8px 10px', resize: 'vertical',
                            fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box',
                            background: '#fff',
                          }}
                        />
                        <div style={{ fontSize: 11, color: '#b45309', marginTop: 6 }}>
                          Use {'{client_name}'}, {'{amount}'}, {'{due_date}'}, {'{invoice_link}'}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bank details */}
              <div style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
                padding: '12px 14px', marginBottom: 8,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#166534', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  Bank Transfer Details
                  <a
                    href="#setup"
                    onClick={e => { e.preventDefault(); }}
                    style={{ fontSize: 11, color: '#15803d', textDecoration: 'underline', fontWeight: 400 }}
                  >
                    Update in Setup →
                  </a>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {[
                    { label: 'Bank', value: 'DBS Bank Singapore' },
                    { label: 'Account No.', value: '***-****-3421' },
                    { label: 'Account Name', value: 'Your Business Name' },
                    { label: 'Swift Code', value: 'DBSSSGSG' },
                    { label: 'BSB (AUS)', value: '062-000 · CBA' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                      <span style={{ color: '#6b7280', minWidth: 110, flexShrink: 0 }}>{label}</span>
                      <span style={{ color: '#166534', fontWeight: 600 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                Chase emails include these bank details + a secure payment link (via Stripe if connected).
              </div>
            </div>

            <div className="slide-panel-footer">
              <button
                className="btn btn-secondary"
                onClick={closeChase}
                style={{ flex: '0 0 auto' }}
              >
                Pause Chase
              </button>
              <button
                className="btn btn-primary"
                onClick={() => { showToast(`Chase activated for ${chaseInvoice.invoice}`); closeChase(); }}
                style={{ flex: 1 }}
              >
                Activate Chase
              </button>
            </div>
          </div>
        </>
      )}

      {toast && (
        <div className="toast" style={{ borderLeft: '4px solid #10b981' }}>
          <CheckCircle size={16} color="#10b981" />
          {toast}
        </div>
      )}
    </div>
  );
}
