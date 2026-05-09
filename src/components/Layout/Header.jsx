import { useState } from 'react';
import { Bell, X, LogOut, User, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const notifications = [
  { id: 1, type: 'payment', color: '#10b981', message: 'Payment received from Acme Corp — S$3,500', time: '2 min ago' },
  { id: 2, type: 'overdue', color: '#ef4444', message: 'Invoice #INV-2024-089 is overdue by 3 days', time: '1 hr ago' },
  { id: 3, type: 'deadline', color: '#f59e0b', message: 'Project "Brand Refresh – Lumen" due in 5 days', time: '3 hr ago' },
  { id: 4, type: 'message', color: '#3b82f6', message: 'New message from Sarah Kim re: Packaging brief', time: 'Yesterday' },
  { id: 5, type: 'deadline', color: '#f59e0b', message: 'Project "Annual Report – Vertex" due in 7 days', time: 'Yesterday' },
];

export default function Header({ page, session }) {
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [readIds, setReadIds] = useState([]);

  const unread = notifications.filter(n => !readIds.includes(n.id)).length;
  const markAllRead = () => setReadIds(notifications.map(n => n.id));

  const displayName = session?.user?.user_metadata?.full_name
    || session?.user?.email?.split('@')[0]
    || 'You';

  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <header style={{
      background: 'var(--white)',
      borderBottom: '1px solid var(--border)',
      padding: '0 32px',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      position: 'sticky',
      top: 0,
      zIndex: 9,
      flexShrink: 0,
      gap: 8,
    }}>

      {/* Notifications */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => { setShowNotif(s => !s); setShowUser(false); }}
          style={{
            position: 'relative',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '6px 8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--slate-500)',
            transition: 'border-color 150ms',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--amber)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <Bell size={18} />
          {unread > 0 && (
            <span style={{
              position: 'absolute',
              top: -4, right: -4,
              background: 'var(--danger)',
              color: '#fff',
              borderRadius: '50%',
              width: 16, height: 16,
              fontSize: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700,
            }}>
              {unread}
            </span>
          )}
        </button>

        {showNotif && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 48 }} onClick={() => setShowNotif(false)} />
            <div style={{
              position: 'absolute',
              top: 44, right: 0,
              width: 340,
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              boxShadow: 'var(--shadow-lg)',
              zIndex: 49,
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {unread > 0 && (
                    <button onClick={markAllRead} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 12, color: 'var(--amber)', fontWeight: 500,
                    }}>
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setShowNotif(false)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--slate-400)', display: 'flex',
                  }}>
                    <X size={14} />
                  </button>
                </div>
              </div>

              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => setReadIds(r => [...r, n.id])}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--slate-100)',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    background: readIds.includes(n.id) ? 'transparent' : 'var(--amber-subtle)',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--slate-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = readIds.includes(n.id) ? 'transparent' : 'var(--amber-subtle)'}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: n.color,
                    marginTop: 5, flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: 'var(--slate-900)', lineHeight: 1.4 }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 3 }}>{n.time}</div>
                  </div>
                </div>
              ))}

              <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--slate-400)' }}>You're all caught up</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User avatar + menu */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => { setShowUser(s => !s); setShowNotif(false); }}
          style={{
            width: 34, height: 34,
            borderRadius: 8,
            background: 'var(--amber)',
            border: '2px solid transparent',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700,
            color: 'var(--slate-900)',
            transition: 'border-color 150ms',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--amber-dark)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
        >
          {initials}
        </button>

        {showUser && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 48 }} onClick={() => setShowUser(false)} />
            <div style={{
              position: 'absolute',
              top: 44, right: 0,
              width: 220,
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              boxShadow: 'var(--shadow-lg)',
              zIndex: 49,
              overflow: 'hidden',
            }}>
              {/* User info */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--slate-900)', marginBottom: 2 }}>
                  {displayName}
                </div>
                <div style={{ fontSize: 12, color: 'var(--slate-400)', wordBreak: 'break-all' }}>
                  {session?.user?.email}
                </div>
              </div>

              {/* Menu items */}
              {[
                { icon: User, label: 'My Profile', action: () => {} },
                { icon: Settings, label: 'Settings', action: () => {} },
              ].map(({ icon: Icon, label, action }) => (
                <button key={label} onClick={action} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px', background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 13, color: 'var(--slate-700)',
                  textAlign: 'left', transition: 'background 100ms',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--slate-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <Icon size={15} style={{ color: 'var(--slate-400)' }} />
                  {label}
                </button>
              ))}

              <div style={{ borderTop: '1px solid var(--border)', marginTop: 4 }}>
                <button onClick={handleLogout} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px', background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 13, color: 'var(--danger)',
                  textAlign: 'left', transition: 'background 100ms',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
