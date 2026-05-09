import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import AuthPage from './components/Auth/AuthPage';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Projects from './components/Projects/Projects';
import CalendarView from './components/Calendar/CalendarView';
import Income from './components/Income/Income';
import Clients from './components/Clients/Clients';
import Services from './components/Services/Services';
import Finance from './components/Finance/Finance';
import Reports from './components/Reports/Reports';
import Contacts from './components/Contacts/Contacts';
import FormsTemplates from './components/Forms/FormsTemplates';
import Setup from './components/Setup/Setup';
import LeadForms from './components/LeadForms/LeadForms';
import Portfolio from './components/Portfolio/Portfolio';
import FilesTemplates from './components/Files/FilesTemplates';
import Pricing from './components/Pricing/Pricing';
import Autopilot from './components/Autopilot/Autopilot';
import { Zap } from 'lucide-react';
import {
  LayoutDashboard, FolderKanban, Calendar, BarChart3, BookUser,
} from 'lucide-react';

const mobileNav = [
  { id: 'dashboard', icon: LayoutDashboard },
  { id: 'projects', icon: FolderKanban },
  { id: 'calendar', icon: Calendar },
  { id: 'finance', icon: BarChart3 },
  { id: 'contacts', icon: BookUser },
];

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--slate-50)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: 'var(--slate-900)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(28,30,36,0.18)',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}>
        <Zap size={26} fill="var(--amber)" stroke="var(--amber)" />
      </div>
      <div style={{ fontSize: 13, color: 'var(--slate-400)', fontWeight: 500 }}>Loading Flint…</div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.96); }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = no session
  const [page, setPage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Still checking auth
  if (session === undefined) return <LoadingScreen />;

  // Not logged in — show auth page
  if (session === null) {
    return <AuthPage onAuth={(dest) => setPage(dest)} />;
  }

  // Logged in — show app
  const renderPage = () => {
    switch (page) {
      case 'setup':      return <Setup onNavigate={setPage} />;
      case 'dashboard':  return <Dashboard onNavigate={setPage} />;
      case 'projects':   return <Projects onNavigate={setPage} />;
      case 'calendar':   return <CalendarView />;
      case 'income':     return <Income onNavigate={setPage} />;
      case 'clients':    return <Clients />;
      case 'services':   return <Services />;
      case 'forms':      return <FormsTemplates />;
      case 'finance':    return <Finance onNavigate={setPage} />;
      case 'reports':    return <Reports />;
      case 'contacts':   return <Contacts />;
      case 'lead-forms': return <LeadForms />;
      case 'portfolio':  return <Portfolio />;
      case 'files':      return <FilesTemplates />;
      case 'pricing':    return <Pricing />;
      case 'autopilot':  return <Autopilot />;
      default:           return <Dashboard onNavigate={setPage} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        active={page}
        onNavigate={setPage}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        session={session}
      />

      <div className="main-content">
        <Header page={page} session={session} />
        {renderPage()}
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav" style={{ justifyContent: 'space-around', alignItems: 'center' }}>
        {mobileNav.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: page === id ? 'var(--amber)' : 'var(--slate-400)',
              padding: '8px 12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3,
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <Icon size={22} />
          </button>
        ))}
      </nav>
    </div>
  );
}
