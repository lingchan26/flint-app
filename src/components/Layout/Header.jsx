import { useState } from 'react';
import { Bell, X } from 'lucide-react';

const notifications = [
  { id: 1, type: 'payment', color: '#10b981', message: 'Payment received from Acme Corp — S$3,500', time: '2 min ago' },
  { id: 2, type: 'overdue', color: '#ef4444', message: 'Invoice #INV-2024-089 is overdue by 3 days', time: '1 hr ago' },
  { id: 3, type: 'deadline', color: '#f59e0b', message: 'Project "Brand Refresh – Lumen" due in 5 days', time: '3 hr ago' },
  { id: 4, type: 'message', color: '#3b82f6', message: 'New message from Sarah Kim re: Packaging brief', time: 'Yesterday' },
  { id: 5, type: 'deadline', color: '#f59e0b', message: 'Project "Annual Report – Vertex" due in 7 days', time: 'Yesterday' },
];

export default function Header({ page }) {
  const [showNotif, setShowNotif] = useState(false);
  const [readIds, setReadIds] = useState([]);

  const unread = notifications.filter(n => !readIds.includes(n.id)).length;

  const markAllRead = () => setReadIds(notifications.map(n => n.id));

  return (
    <header style={{
      background: '#fff',
      borderBottom: '1px solid #e5e0d8',
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
          onClick={() => setShowNotif(s => !s)}
          style={{
            position: 'relative',
            background: 'transparent',
            border: '1px solid #e5e0d8',
            borderRadius: 8,
            padding: '6px 8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: '#6b7280',
          }}
        >
          <Bell size={18} />
          {unread > 0 && (
            <span style={{
              position: 'absolute',
              top: -4, right: -4,
              background: '#ef4444',
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
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 48 }}
              onClick={() => setShowNotif(false)}
            />
            <div style={{
              position: 'absolute',
              top: 44,
              right: 0,
              width: 340,
              background: '#fff',
              border: '1px solid #e5e0d8',
              borderRadius: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 49,
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid #e5e0d8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {unread > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 12, color: '#f59e0b', fontWeight: 500,
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setShowNotif(false)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#6b7280', display: 'flex',
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
                    borderBottom: '1px solid #f5f5f5',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    background: readIds.includes(n.id) ? 'transparent' : '#fffbeb',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#faf8f4'}
                  onMouseLeave={e => e.currentTarget.style.background = readIds.includes(n.id) ? 'transparent' : '#fffbeb'}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: n.color,
                    marginTop: 5, flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#1a1a1a', lineHeight: 1.4 }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{n.time}</div>
                  </div>
                </div>
              ))}

              <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>You're all caught up</span>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
