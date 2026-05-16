import { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, X, CheckCircle, Mail, Circle,
  Trash2, CalendarDays, CheckSquare, Loader, AlertCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const HOLIDAYS = {
  Singapore: [
    { date: '2026-01-01', name: "New Year's Day" },
    { date: '2026-01-29', name: 'Chinese New Year' },
    { date: '2026-01-30', name: 'Chinese New Year (Day 2)' },
    { date: '2026-04-03', name: 'Good Friday' },
    { date: '2026-05-01', name: 'Labour Day' },
    { date: '2026-05-12', name: 'Vesak Day' },
    { date: '2026-06-02', name: 'Hari Raya Haji' },
    { date: '2026-08-09', name: 'National Day' },
    { date: '2026-10-27', name: 'Deepavali' },
    { date: '2026-12-25', name: 'Christmas Day' },
  ],
  Australia: [
    { date: '2026-01-01', name: "New Year's Day" },
    { date: '2026-01-26', name: 'Australia Day' },
    { date: '2026-04-03', name: 'Good Friday' },
    { date: '2026-04-06', name: 'Easter Monday' },
    { date: '2026-04-25', name: 'ANZAC Day' },
    { date: '2026-12-25', name: 'Christmas Day' },
    { date: '2026-12-26', name: 'Boxing Day' },
  ],
  Malaysia: [
    { date: '2026-01-01', name: "New Year's Day" },
    { date: '2026-01-29', name: 'Chinese New Year' },
    { date: '2026-05-01', name: 'Labour Day' },
    { date: '2026-08-31', name: 'National Day' },
    { date: '2026-09-16', name: 'Malaysia Day' },
    { date: '2026-12-25', name: 'Christmas Day' },
  ],
};

const EVENT_COLORS = [
  '#f59e0b', '#3b82f6', '#ef4444', '#9ca3af',
  '#10b981', '#8b5cf6', '#f97316', '#06b6d4',
  '#ec4899', '#6b7280',
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function rowToEvent(r) {
  return {
    id: r.id,
    date: r.event_date,
    name: r.session_name,
    type: r.event_category || 'Meeting',
    sessionType: r.session_type || 'Video call',
    timezone: r.timezone || 'Asia/Singapore',
    duration: r.duration || '60',
    color: r.color || '#f59e0b',
    notes: r.notes || '',
    emailClient: !!r.email_client,
  };
}

function rowToTask(r) {
  return {
    id: r.id,
    title: r.title,
    project: r.project || '',
    dueDate: r.due_date || '',
    dueTime: r.due_time ? r.due_time.slice(0, 5) : '',
    reminder: r.reminder || 'At due time',
    done: !!r.done,
  };
}

/* ─── Tasks subcomponent ───────────────────────────────────────────────── */

function TaskView() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: '', project: '',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '', reminder: 'At due time',
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('due_date', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });
        if (cancelled) return;
        if (error) throw error;
        setTasks((data || []).map(rowToTask));
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load tasks');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const open = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);

  async function toggleDone(id, currentDone) {
    setTasks(t => t.map(task => task.id === id ? { ...task, done: !currentDone } : task)); // optimistic
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ done: !currentDone, done_at: !currentDone ? new Date().toISOString() : null })
        .eq('id', id);
      if (error) throw error;
    } catch (e) {
      setTasks(t => t.map(task => task.id === id ? { ...task, done: currentDone } : task)); // rollback
      setError(e.message || 'Could not update task');
    }
  }

  async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      setTasks(t => t.filter(task => task.id !== id));
    } catch (e) {
      setError(e.message || 'Could not delete task');
    }
  }

  async function addTask() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');
      const payload = {
        user_id: user.id,
        title: form.title.trim(),
        project: form.project.trim() || null,
        due_date: form.dueDate || null,
        due_time: form.dueTime ? `${form.dueTime}:00` : null,
        reminder: form.reminder,
        done: false,
      };
      const { data, error } = await supabase.from('tasks').insert(payload).select().single();
      if (error) throw error;
      setTasks(t => [rowToTask(data), ...t]);
      setForm({
        title: '', project: '',
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: '', reminder: 'At due time',
      });
      setShowAdd(false);
    } catch (e) {
      setError(e.message || 'Could not add task');
    } finally {
      setSaving(false);
    }
  }

  const isOverdue = (t) => !t.done && t.dueDate && new Date(t.dueDate) < new Date()
    && new Date(t.dueDate).toDateString() !== new Date().toDateString();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Loader size={24} color="var(--slate-400)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--slate-900)' }}>Task Management</div>
          <div style={{ fontSize: 13, color: 'var(--slate-400)', marginTop: 2 }}>View and track your tasks</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            background: 'var(--slate-900)', color: '#fff',
            padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          }}>Open tasks {open.length}</span>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Add task
          </button>
        </div>
      </div>

      <div className="table-container" style={{ marginBottom: 24 }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th>Title</th>
              <th>Due date</th>
              <th>Due time</th>
              <th>Project</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {open.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--slate-400)' }}>
                  {tasks.length === 0
                    ? 'No tasks yet — click "Add task" to create your first one.'
                    : "No open tasks — you're all caught up! 🎉"}
                </td>
              </tr>
            ) : open.map(task => {
              const overdue = isOverdue(task);
              return (
                <tr key={task.id}>
                  <td>
                    <button onClick={() => toggleDone(task.id, task.done)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: 'var(--slate-300)' }}>
                      <Circle size={18} />
                    </button>
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--slate-900)' }}>{task.title}</td>
                  <td>
                    {task.dueDate && (
                      <span style={{
                        fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                        background: overdue ? 'var(--danger-bg)' : 'var(--slate-100)',
                        color: overdue ? 'var(--danger)' : 'var(--slate-600)',
                      }}>
                        {overdue ? 'OVERDUE · ' : ''}
                        {new Date(task.dueDate).toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </td>
                  <td style={{ color: 'var(--slate-500)', fontSize: 13 }}>
                    {task.dueTime || <span style={{ color: 'var(--slate-300)' }}>—</span>}
                  </td>
                  <td style={{ color: 'var(--slate-500)', fontSize: 13 }}>{task.project || <span style={{ color: 'var(--slate-300)' }}>No project</span>}</td>
                  <td>
                    <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-300)', display: 'flex' }}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {done.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate-400)', marginBottom: 10 }}>Completed ({done.length})</div>
          <div className="table-container">
            <table>
              <tbody>
                {done.map(task => (
                  <tr key={task.id} style={{ opacity: 0.5 }}>
                    <td style={{ width: 40 }}>
                      <button onClick={() => toggleDone(task.id, task.done)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: 'var(--success)' }}>
                        <CheckCircle size={18} />
                      </button>
                    </td>
                    <td style={{ textDecoration: 'line-through', color: 'var(--slate-400)' }}>{task.title}</td>
                    <td style={{ color: 'var(--slate-400)', fontSize: 13 }}>{task.dueDate}</td>
                    <td></td>
                    <td style={{ color: 'var(--slate-400)', fontSize: 13 }}>{task.project}</td>
                    <td>
                      <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-300)', display: 'flex' }}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100 }} onClick={() => !saving && setShowAdd(false)} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff', borderRadius: 16, width: 420, maxWidth: '95vw',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 101,
            overflow: 'hidden',
          }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Add task</div>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '20px 20px' }}>
              <div className="form-group">
                <label className="form-label">Task description * <span style={{ fontSize: 11, color: 'var(--slate-400)', float: 'right' }}>{form.title.length}/100</span></label>
                <textarea
                  className="form-textarea"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value.slice(0, 100) }))}
                  placeholder="Write a task description"
                  style={{ minHeight: 80, resize: 'none' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Project</label>
                <input className="form-input" value={form.project} onChange={e => setForm(f => ({ ...f, project: e.target.value }))} placeholder="Related project (optional)" />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Due date</label>
                  <input className="form-input" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Due time</label>
                  <input className="form-input" type="time" value={form.dueTime} onChange={e => setForm(f => ({ ...f, dueTime: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Reminder</label>
                <select className="form-select" value={form.reminder} onChange={e => setForm(f => ({ ...f, reminder: e.target.value }))}>
                  {['At due time', '15 min before', '1 hour before', '1 day before'].map(r => <option key={r}>{r}</option>)}
                </select>
                <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 4 }}>Reminders are saved with the task.</div>
              </div>
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary"
                onClick={addTask}
                disabled={saving || !form.title.trim()}
                style={{ padding: '10px 24px', fontSize: 15, fontWeight: 700 }}
              >
                {saving ? 'Saving…' : 'Create task'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Main calendar ──────────────────────────────────────────────────── */

export default function CalendarView() {
  const today = new Date();
  const [mainView, setMainView] = useState('calendar');
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [viewMode, setViewMode] = useState('month');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('Singapore');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({
    name: '', type: 'Booked Project', sessionType: 'Video call', timezone: 'Asia/Singapore',
    duration: '60', date: '', color: '#f59e0b', notes: '', emailClient: false,
  });
  const [toast, setToast] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .order('event_date', { ascending: true });
        if (cancelled) return;
        if (error) throw error;
        setEvents((data || []).map(rowToEvent));
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load calendar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday = () => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const dateStr = (d) => `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const getEvents = (d) => events.filter(e => e.date === dateStr(d));
  const getHolidays = (d) => (HOLIDAYS[selectedCountry] || []).filter(h => h.date === dateStr(d));

  const openNewEventModal = (ds) => {
    setEditingEvent(null);
    setFormFresh(ds);
    setShowForm(true);
  };

  const openEditEventModal = (ev) => {
    setEditingEvent(ev);
    setForm({
      name: ev.name,
      type: ev.type,
      sessionType: ev.sessionType,
      timezone: ev.timezone,
      duration: ev.duration,
      date: ev.date,
      color: ev.color,
      notes: ev.notes,
      emailClient: ev.emailClient,
    });
    setShowForm(true);
  };

  const setFormFresh = (ds) => {
    setForm({
      name: '', type: 'Booked Project', sessionType: 'Video call',
      timezone: 'Asia/Singapore', duration: '60',
      date: ds || new Date().toISOString().split('T')[0],
      color: '#f59e0b', notes: '', emailClient: false,
    });
  };

  const handleDblClick = (d) => {
    if (!d) return;
    openNewEventModal(dateStr(d));
  };

  async function saveEvent() {
    if (!form.name.trim() || !form.date) return;
    setSaving(true);
    try {
      const payload = {
        session_name: form.name.trim(),
        session_type: form.sessionType,
        event_category: form.type,
        timezone: form.timezone,
        duration: form.duration,
        event_date: form.date,
        color: form.color,
        notes: form.notes?.trim() || null,
        email_client: form.emailClient,
      };

      if (editingEvent) {
        const { data, error } = await supabase
          .from('calendar_events')
          .update(payload)
          .eq('id', editingEvent.id)
          .select()
          .single();
        if (error) throw error;
        setEvents(es => es.map(e => e.id === editingEvent.id ? rowToEvent(data) : e));
        showToast('Session updated');
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not signed in');
        const { data, error } = await supabase
          .from('calendar_events')
          .insert({ ...payload, user_id: user.id })
          .select()
          .single();
        if (error) throw error;
        setEvents(es => [...es, rowToEvent(data)]);
        showToast('Session created');
      }
      closeForm();
    } catch (e) {
      setError(e.message || 'Could not save session');
    } finally {
      setSaving(false);
    }
  }

  async function deleteEvent() {
    if (!editingEvent) return;
    if (!confirm('Delete this session?')) return;
    try {
      const { error } = await supabase.from('calendar_events').delete().eq('id', editingEvent.id);
      if (error) throw error;
      setEvents(es => es.filter(e => e.id !== editingEvent.id));
      closeForm();
      showToast('Session deleted');
    } catch (e) {
      setError(e.message || 'Could not delete session');
    }
  }

  const closeForm = () => {
    setShowForm(false);
    setEditingEvent(null);
    setFormFresh('');
  };

  const isToday = (d) => {
    if (!d) return false;
    const t = new Date();
    return d === t.getDate() && month === t.getMonth() && year === t.getFullYear();
  };

  const renderYearly = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
      {Array.from({ length: 12 }, (_, mi) => {
        const mFirst = new Date(year, mi, 1).getDay();
        const mDays = new Date(year, mi + 1, 0).getDate();
        const mCells = [];
        for (let i = 0; i < mFirst; i++) mCells.push(null);
        for (let d = 1; d <= mDays; d++) mCells.push(d);
        return (
          <div key={mi} className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: '#1a1a1a' }}>{MONTHS[mi]}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {DAYS.map(d => <div key={d} style={{ fontSize: 9, color: '#9ca3af', textAlign: 'center', paddingBottom: 2 }}>{d[0]}</div>)}
              {mCells.map((d, i) => {
                if (!d) return <div key={i} />;
                const ds = `${year}-${String(mi+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                const hasEvent = events.some(e => e.date === ds);
                const t = new Date();
                const tod = d === t.getDate() && mi === t.getMonth() && year === t.getFullYear();
                return (
                  <div key={i} style={{
                    textAlign: 'center', fontSize: 10,
                    borderRadius: 4, padding: '2px 0',
                    background: tod ? '#f59e0b' : 'transparent',
                    color: tod ? '#fff' : hasEvent ? '#f59e0b' : '#6b7280',
                    fontWeight: tod ? 700 : 400,
                    cursor: 'pointer',
                  }}>
                    {d}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <h1 className="page-title" style={{ margin: 0 }}>
            {mainView === 'tasks' ? 'Tasks' : 'Calendar'}
          </h1>
          <div className="tabs" style={{ margin: 0 }}>
            <button
              className={`tab ${mainView === 'calendar' ? 'active' : ''}`}
              onClick={() => setMainView('calendar')}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <CalendarDays size={14} /> Calendar
            </button>
            <button
              className={`tab ${mainView === 'tasks' ? 'active' : ''}`}
              onClick={() => setMainView('tasks')}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <CheckSquare size={14} /> Tasks
            </button>
          </div>
        </div>

        {mainView === 'calendar' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              style={{ width: 160 }}
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
            >
              {Object.keys(HOLIDAYS).map(c => <option key={c}>{c}</option>)}
            </select>

            <div className="tabs" style={{ margin: 0 }}>
              <button className={`tab ${viewMode === 'month' ? 'active' : ''}`} onClick={() => setViewMode('month')}>Month</button>
              <button className={`tab ${viewMode === 'year' ? 'active' : ''}`} onClick={() => setViewMode('year')}>Year</button>
            </div>

            <button className="btn btn-secondary btn-sm" onClick={goToday}>Today</button>
            <button className="btn btn-primary btn-sm" onClick={() => openNewEventModal(dateStr(today.getDate()))}>
              <Plus size={14} /> New session
            </button>
          </div>
        )}
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

      {mainView === 'tasks' && <TaskView />}

      {mainView === 'calendar' && (
        <>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <Loader size={28} color="var(--slate-400)" style={{ animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <button className="btn btn-ghost btn-sm" onClick={prevMonth}><ChevronLeft size={18} /></button>
                <h2 style={{ fontSize: 20, fontWeight: 700, minWidth: 200, textAlign: 'center' }}>
                  {MONTHS[month]} {year}
                </h2>
                <button className="btn btn-ghost btn-sm" onClick={nextMonth}><ChevronRight size={18} /></button>
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { label: 'Booked Projects', color: '#f59e0b' },
                  { label: 'Meetings', color: '#3b82f6' },
                  { label: 'Invoice Due', color: '#ef4444' },
                  { label: 'Tentative', color: '#9ca3af', dashed: true },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                    <div style={{
                      width: 12, height: 12, borderRadius: 3, background: l.color,
                      border: l.dashed ? '2px dashed #9ca3af' : 'none',
                      boxSizing: 'border-box',
                    }} />
                    {l.label}
                  </div>
                ))}
                <div style={{ marginLeft: 8, fontSize: 12, color: '#9ca3af' }}>
                  Double-click a date to add a session
                </div>
              </div>

              {viewMode === 'year' ? renderYearly() : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                    background: '#faf8f4', borderBottom: '1px solid #e5e0d8',
                  }}>
                    {DAYS.map(d => (
                      <div key={d} style={{
                        padding: '10px 0', textAlign: 'center',
                        fontSize: 12, fontWeight: 600, color: '#9ca3af',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                      }}>
                        {d}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                    {cells.map((d, i) => {
                      const dayEvents = d ? getEvents(d) : [];
                      const holidays = d ? getHolidays(d) : [];
                      return (
                        <div
                          key={i}
                          onDoubleClick={() => handleDblClick(d)}
                          style={{
                            minHeight: 100,
                            border: '1px solid #f0ece4',
                            padding: '6px 8px',
                            cursor: d ? 'pointer' : 'default',
                            background: d ? '#fff' : '#faf8f4',
                            transition: 'background 0.1s',
                          }}
                          onMouseEnter={e => { if (d) e.currentTarget.style.background = '#fffbeb'; }}
                          onMouseLeave={e => { if (d) e.currentTarget.style.background = '#fff'; }}
                        >
                          {d && (
                            <>
                              <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: isToday(d) ? '#f59e0b' : 'transparent',
                                color: isToday(d) ? '#fff' : '#1a1a1a',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 13, fontWeight: isToday(d) ? 700 : 400,
                                marginBottom: 4,
                              }}>
                                {d}
                              </div>

                              {holidays.map((h, hi) => (
                                <div key={hi} style={{
                                  fontSize: 10, color: '#ef4444', fontWeight: 500,
                                  marginBottom: 2, lineHeight: 1.3,
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                  🗓 {h.name}
                                </div>
                              ))}

                              {dayEvents.slice(0, 3).map((ev, ei) => (
                                <div
                                  key={ei}
                                  onClick={(e) => { e.stopPropagation(); openEditEventModal(ev); }}
                                  style={{
                                    background: ev.color + '22',
                                    borderLeft: `3px solid ${ev.color}`,
                                    borderRadius: '0 4px 4px 0',
                                    padding: '2px 6px',
                                    marginBottom: 2,
                                    fontSize: 11,
                                    color: '#1a1a1a',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    borderStyle: ev.type === 'Tentative' ? 'dashed' : 'solid',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {ev.name}
                                </div>
                              ))}
                              {dayEvents.length > 3 && (
                                <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>+{dayEvents.length - 3} more</div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {showForm && (
        <>
          <div className="overlay" onClick={() => !saving && closeForm()} />
          <div className="slide-panel">
            <div className="slide-panel-header">
              <span className="slide-panel-title">
                {editingEvent ? 'Edit Session' : 'New Session'}
              </span>
              <button className="close-btn" onClick={closeForm}><X size={16} /></button>
            </div>
            <div className="slide-panel-body">
              <div className="form-group">
                <label className="form-label">Session Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Discovery Call with Acme" />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="Booked Project">Booked Project</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Invoice Due">Invoice Due</option>
                  <option value="Tentative">Tentative</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Session Type</label>
                <select className="form-select" value={form.sessionType} onChange={e => setForm(f => ({ ...f, sessionType: e.target.value }))}>
                  <option>Video call</option>
                  <option>Phone call</option>
                  <option>In-person</option>
                  <option>Email</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Timezone</label>
                  <select className="form-select" value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}>
                    <option value="Asia/Singapore">SGT (Singapore)</option>
                    <option value="Australia/Sydney">AEST (Sydney)</option>
                    <option value="Asia/Kuala_Lumpur">MYT (KL)</option>
                    <option value="Europe/London">GMT (London)</option>
                    <option value="Asia/Bangkok">ICT (Bangkok)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (min)</label>
                  <input className="form-input" type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input className="form-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Colour</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {EVENT_COLORS.map(c => (
                    <div
                      key={c}
                      className={`color-swatch ${form.color === c ? 'selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                    />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes or agenda…" />
              </div>
              <div className="form-group">
                <label className="toggle">
                  <input type="checkbox" checked={form.emailClient} onChange={e => setForm(f => ({ ...f, emailClient: e.target.checked }))} />
                  <span className="toggle-slider" />
                  <span style={{ fontSize: 13, color: '#6b7280' }}>Email to client</span>
                </label>
              </div>
            </div>
            <div className="slide-panel-footer" style={{ justifyContent: 'space-between' }}>
              {editingEvent ? (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={deleteEvent}
                  disabled={saving}
                  style={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              ) : <div />}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={closeForm} disabled={saving}>Cancel</button>
                <button
                  className="btn btn-primary"
                  onClick={saveEvent}
                  disabled={saving || !form.name.trim() || !form.date}
                >
                  {saving ? 'Saving…' : editingEvent ? 'Save changes' : 'Create Session'}
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
