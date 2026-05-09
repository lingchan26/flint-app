import { useState } from 'react';
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

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const renderPage = () => {
    switch (page) {
      case 'setup': return <Setup onNavigate={setPage} />;
      case 'dashboard': return <Dashboard onNavigate={setPage} />;
      case 'projects': return <Projects onNavigate={setPage} />;
      case 'calendar': return <CalendarView />;
      case 'income': return <Income onNavigate={setPage} />;
      case 'clients': return <Clients />;
      case 'services': return <Services />;
      case 'forms': return <FormsTemplates />;
      case 'finance': return <Finance onNavigate={setPage} />;
      case 'reports': return <Reports />;
      case 'contacts': return <Contacts />;
      case 'lead-forms': return <LeadForms />;
      case 'portfolio': return <Portfolio />;
      case 'files': return <FilesTemplates />;
      case 'pricing': return <Pricing />;
      case 'autopilot': return <Autopilot />;
      default: return <Dashboard onNavigate={setPage} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        active={page}
        onNavigate={setPage}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
      />

      <div className="main-content">
        <Header page={page} />
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
              color: page === id ? '#f59e0b' : '#6b7280',
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
