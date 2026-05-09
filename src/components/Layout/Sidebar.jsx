import { useState } from 'react';
import {
  LayoutDashboard, FolderKanban, Calendar, DollarSign, Users,
  Briefcase, FileText, BarChart3, BookUser, Settings, ChevronLeft,
  ChevronRight, Zap, ClipboardList, Image, FolderOpen, Tag
} from 'lucide-react';

const navItems = [
  { id: 'setup', label: 'Setup', icon: Settings },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'autopilot', label: 'Autopilot', icon: Zap },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'income', label: 'Income', icon: DollarSign },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'services', label: 'Services', icon: Briefcase },
  { id: 'forms', label: 'Forms & Templates', icon: FileText },
  { id: 'lead-forms', label: 'Lead Forms', icon: ClipboardList },
  { id: 'portfolio', label: 'Portfolio', icon: Image },
  { id: 'files', label: 'Files & Templates', icon: FolderOpen },
  { id: 'contacts', label: 'Contacts', icon: BookUser },
  { id: 'finance', label: 'Finance', icon: BarChart3 },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'pricing', label: 'Pricing', icon: Tag },
];

export default function Sidebar({ active, onNavigate, collapsed, onToggle }) {
  return (
    <aside
      className="sidebar"
      style={{
        width: collapsed ? 64 : 240,
        background: '#1a1a1a',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        transition: 'width 0.3s ease',
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
        borderBottom: '1px solid #2d2d2d',
        minHeight: 64,
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: '#f59e0b', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
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
            background: '#f59e0b', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#6b7280', padding: 4, borderRadius: 6, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
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
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? '#f59e0b' : 'transparent',
                color: isActive ? '#fff' : '#9ca3af',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                marginBottom: 2,
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = '#2d2d2d';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#9ca3af';
                }
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle at bottom */}
      {collapsed && (
        <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'center', borderTop: '1px solid #2d2d2d' }}>
          <button
            onClick={onToggle}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#6b7280', padding: 6, borderRadius: 6, display: 'flex',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Footer */}
      {!collapsed && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid #2d2d2d' }}>
          <div style={{ fontSize: 12, color: '#4b5563' }}>Flint v1.0</div>
        </div>
      )}
    </aside>
  );
}
