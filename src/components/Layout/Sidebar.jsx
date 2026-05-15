import { useState } from 'react';
import {
  LayoutDashboard, FolderKanban, Calendar, DollarSign, Users,
  Briefcase, FileText, BarChart3, BookUser, Settings, ChevronLeft,
  ChevronRight, Zap, ClipboardList, Image, FolderOpen, Tag, LogOut,
  Radar, CheckSquare,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// v0.1 scope: only Setup, Dashboard, Projects, Calendar, Finance (Income), Contacts.
// Hidden items below are unwired or show fake data — kept in the codebase, removed from nav.
// To re-enable any item once it's properly wired, just uncomment its line.
const navItems = [
  { id: 'setup',      label: 'Setup',            icon: Settings },
  { id: 'dashboard',  label: 'Dashboard',         icon: LayoutDashboard },
  // { id: 'autopilot',  label: 'Autopilot',         icon: Zap },              // v0.2 — speculative feature
  { id: 'projects',   label: 'Projects',          icon: FolderKanban },
  { id: 'calendar',   label: 'Calendar',          icon: Calendar },
  { id: 'income',     label: 'Finance',           icon: DollarSign },
  { id: 'contacts',   label: 'Contacts',          icon: BookUser },
  // { id: 'radar',      label: 'Radar',             icon: Radar },            // v0.2 — speculative feature
  // { id: 'services',   label: 'Services',          icon: Briefcase },        // hidden until wired to services table
  // { id: 'forms',      label: 'Forms & Templates', icon: FileText },         // hidden until persistence wired
  // { id: 'lead-forms', label: 'Lead Forms',        icon: ClipboardList },    // hidden until submission endpoint wired
  // { id: 'portfolio',  label: 'Portfolio',         icon: Image },            // hidden until wired to portfolio_items
  // { id: 'files',      label: 'Files & Templates', icon: FolderOpen },       // hidden until storage wired
  // { id: 'reports',    label: 'Reports',           icon: BarChart3 },        // hidden until enough real data exists
  // { id: 'pricing',    label: 'Pricing',           icon: Tag },              // hidden — fake data
];

export default function Sidebar({ active, onNavigate, collapsed, onToggle, session }) {
  const displayName = session?.user?.user_metadata?.full_name
    || session?.user?.email?.split('@')[0]
    || 'Freelancer';

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
    <aside
      className="sidebar"
      style={{
        width: collapsed ? 64 : 240,
        background: 'var(--sidebar-bg)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        transition: 'width 0.25s ease',
        flexShrink: 0,
        overflow: 'hidden',
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        minHeight: 64,
        flexShrink: 0,
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--amber)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={18} color="#fff" fill="#fff" />
            </div>
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>
              Flint
            </span>
          </div>
        )}
        {collapsed && (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--amber)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)', padding: 4, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color 150ms',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          // Highlight Radar with a special indicator
          const isRadar = id === 'radar';
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              title={collapsed ? label : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? 0 : 10,
                padding: collapsed ? '10px 0' : '9px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'var(--amber)' : 'transparent',
                color: isActive ? '#fff' : isRadar ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.45)',
                fontSize: 13,
                fontWeight: isActive ? 600 : isRadar ? 500 : 400,
                marginBottom: 2,
                transition: 'background 150ms, color 150ms',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = isRadar ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.45)';
                }
              }}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                  {label}
                  {isRadar && !isActive && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.5px',
                      background: 'var(--amber)', color: '#1a1a1a',
                      padding: '1px 5px', borderRadius: 3,
                      marginLeft: 'auto',
                    }}>AI</span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom: collapse toggle + user */}
      <div style={{ flexShrink: 0 }}>
        {collapsed && (
          <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <button
              onClick={onToggle}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.3)', padding: 6, borderRadius: 6, display: 'flex',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* User strip */}
        <div style={{
          padding: collapsed ? '12px 0' : '12px 12px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 7,
              background: 'var(--amber)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'var(--slate-900)',
              flexShrink: 0,
            }}>
              {initials}
            </div>
            {!collapsed && (
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: 600, color: '#fff',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  maxWidth: 120,
                }}>
                  {displayName}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                  Free plan
                </div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Sign out"
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.3)', padding: 4, borderRadius: 6,
                display: 'flex', flexShrink: 0, transition: 'color 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
