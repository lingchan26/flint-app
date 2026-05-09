import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, CheckCircle, Mail } from 'lucide-react';

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

const INITIAL_EVENTS = [
  { id: 1, date: '2026-04-07', name: 'Brand Refresh Kickoff', type: 'Booked Project', color: '#f59e0b' },
  { id: 2, date: '2026-04-10', name: 'Client Meeting – Vertex', type: 'Meeting', color: '#3b82f6' },
  { id: 3, date: '2026-04-15', name: 'Invoice Due – Bloom Foods', type: 'Invoice Due', color: '#ef4444' },
  { id: 4, date: '2026-04-18', name: 'Novu Tech Discovery Call', type: 'Meeting', color: '#3b82f6' },
  { id: 5, date: '2026-04-22', name: 'Social Media Kit Delivery', type: 'Booked Project', color: '#f59e0b' },
  { id: 6, date: '2026-04-25', name: 'Tentative: Arko Campaign', type: 'Tentative', color: '#9ca3af' },
  { id: 7, date: '2026-04-28', name: 'Invoice Due – Kova Studio', type: 'Invoice Due', color: '#ef4444' },
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function CalendarView() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(2026, 3, 1)); // April 2026
  const [viewMode, setViewMode] = useState('month');
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [selectedCountry, setSelectedCountry] = useState('Singapore');
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState('');
  const [form, setForm] = useState({
    name: '', type: 'Booked Project', timezone: 'SGT',
    duration: '60', date: '', color: '#f59e0b', notes: '', emailClient: false,
  });
  const [toast, setToast] = useState('');

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

  const getEvents = (d) => {
    const ds = dateStr(d);
    return events.filter(e => e.date === ds);
  };

  const getHolidays = (d) => {
    const ds = dateStr(d);
    return (HOLIDAYS[selectedCountry] || []).filter(h => h.date === ds);
  };

  const handleDblClick = (d) => {
    if (!d) return;
    const ds = dateStr(d);
    setFormDate(ds);
    setForm(f => ({ ...f, date: ds }));
    setShowForm(true);
  };

  const saveEvent = () => {
    if (!form.name) return;
    setEvents(e => [...e, { id: Date.now(), date: form.date, name: form.name, type: form.type, color: form.color }]);
    setShowForm(false);
    setForm({ name: '', type: 'Booked Project', timezone: 'SGT', duration: '60', date: '', color: '#f59e0b', notes: '', emailClient: false });
    showToast('Session created!');
  };

  const isToday = (d) => {
    if (!d) return false;
    const t = new Date();
    return d === t.getDate() && month === t.getMonth() && year === t.getFullYear();
  };

  // Yearly view
  const renderYearly = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
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
        <h1 className="page-title">Calendar</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Holiday filter */}
          <select
            className="form-select"
            style={{ width: 160 }}
            value={selectedCountry}
            onChange={e => setSelectedCountry(e.target.value)}
          >
            <option>Singapore</option>
            <option>Australia</option>
            <option>Malaysia</option>
            <option>Vietnam</option>
            <option>Thailand</option>
            <option>United Kingdom</option>
          </select>

          {/* View toggle */}
          <div className="tabs" style={{ margin: 0 }}>
            <button className={`tab ${viewMode === 'month' ? 'active' : ''}`} onClick={() => setViewMode('month')}>Month</button>
            <button className={`tab ${viewMode === 'year' ? 'active' : ''}`} onClick={() => setViewMode('year')}>Year</button>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={goToday}>Today</button>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={prevMonth}><ChevronLeft size={18} /></button>
        <h2 style={{ fontSize: 20, fontWeight: 700, minWidth: 200, textAlign: 'center' }}>
          {MONTHS[month]} {year}
        </h2>
        <button className="btn btn-ghost btn-sm" onClick={nextMonth}><ChevronRight size={18} /></button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
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
        <div style={{ marginLeft: 8, fontSize: 12, color: '#9ca3af' }}>Double-click a date to add a session</div>
        {/* Calendar source buttons */}
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', alignItems: 'center' }}>
          {[
            { label: 'Google', color: '#4285F4' },
            { label: 'Apple', color: '#1a1a1a' },
          ].map(cal => (
            <button key={cal.label} style={{
              background: '#fff', border: '1px solid #e5e0d8', borderRadius: 8,
              padding: '4px 12px', fontSize: 12, fontWeight: 500,
              color: cal.color, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {cal.label}
            </button>
          ))}
          <button style={{
            background: '#fff', border: '1px solid #e5e0d8', borderRadius: 8,
            padding: '4px 12px', fontSize: 12, fontWeight: 500,
            color: '#0078D4', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Mail size={12} color="#0078D4" /> Outlook
          </button>
        </div>
      </div>

      {viewMode === 'year' ? renderYearly() : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Day headers */}
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

          {/* Cells */}
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
                        <div key={ei} style={{
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
                        }}>
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

      {/* Session Form Panel */}
      {showForm && (
        <>
          <div className="overlay" onClick={() => setShowForm(false)} />
          <div className="slide-panel">
            <div className="slide-panel-header">
              <span className="slide-panel-title">New Session</span>
              <button className="close-btn" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <div className="slide-panel-body">
              <div className="form-group">
                <label className="form-label">Session Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Discovery Call with Acme" />
              </div>
              <div className="form-group">
                <label className="form-label">Session Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="Booked Project">Booked Project</option>
                  <option value="Meeting">In-person Meeting</option>
                  <option value="Meeting">Video Call</option>
                  <option value="Meeting">Phone Call</option>
                  <option value="Invoice Due">Invoice Due</option>
                  <option value="Tentative">Tentative</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Timezone</label>
                  <select className="form-select" value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}>
                    <option value="SGT">SGT (UTC+8)</option>
                    <option value="AEST">AEST (UTC+10)</option>
                    <option value="MYT">MYT (UTC+8)</option>
                    <option value="GMT">GMT (UTC+0)</option>
                    <option value="ICT">ICT (UTC+7)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (min)</label>
                  <input className="form-input" type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
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
            <div className="slide-panel-footer">
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEvent}>Create Session</button>
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
