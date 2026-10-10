
import { useState } from 'react';
import {
  Activity,
  BrainCircuit,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronLeft,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Users,
  X,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

const navigationItems = [
  {
    label: 'Dashboard',
    path: '/app',
    icon: LayoutDashboard,
  },
  {
    label: 'AI Workspace',
    path: '/app/workspace',
    icon: MessageSquare,
  },
  {
    label: 'Websites',
    path: '/app/websites',
    icon: Globe,
  },
  {
    label: 'CRM',
    path: '/app/crm',
    icon: Users,
  },
  {
    label: 'Webinars',
    path: '/app/webinars',
    icon: CalendarDays,
  },
  {
    label: 'Analytics',
    path: '/app/analytics',
    icon: ChartNoAxesCombined,
  },
];

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    // We'll connect this to the backend logout endpoint later.
    navigate('/login');
  }

  return (
    <>
      <button
        type="button"
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
      >
        {mobileOpen ? <X size={21} /> : <Menu size={21} />}
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="sidebar-mobile-overlay"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}

      <aside
        className={[
          'nexus-sidebar',
          collapsed ? 'nexus-sidebar-collapsed' : '',
          mobileOpen ? 'nexus-sidebar-mobile-open' : '',
        ].join(' ')}
      >
        <div className="sidebar-brand-row">
          <NavLink
            to="/app"
            className="sidebar-brand"
            onClick={() => setMobileOpen(false)}
          >
            <span className="sidebar-brand-icon">
              <BrainCircuit size={22} />
            </span>

            {!collapsed && (
              <span>
                NEXUS<span className="sidebar-brand-highlight">AI</span>
              </span>
            )}
          </NavLink>

          <button
            type="button"
            className="sidebar-collapse-button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              size={17}
              className={collapsed ? 'sidebar-chevron-rotated' : ''}
            />
          </button>
        </div>

        {!collapsed && (
          <div className="sidebar-workspace-label">
            <span className="sidebar-workspace-dot" />
            BUSINESS WORKSPACE
          </div>
        )}

        <nav className="sidebar-navigation" aria-label="Main navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/app'}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `sidebar-nav-link ${isActive ? 'sidebar-nav-link-active' : ''}`
                }
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={19} />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.label === 'AI Workspace' && (
                  <span className="sidebar-ai-badge">AI</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          {!collapsed && (
            <div className="sidebar-tip-card">
              <span className="sidebar-tip-icon">
                <Activity size={18} />
              </span>

              <strong>Have an idea?</strong>

              <p>Describe it to your AI assistant and start building.</p>

              <NavLink
                to="/app/workspace"
                onClick={() => setMobileOpen(false)}
              >
                Open workspace →
              </NavLink>
            </div>
          )}

          <button
            type="button"
            className="sidebar-logout-button"
            onClick={handleLogout}
            title={collapsed ? 'Log out' : undefined}
          >
            <LogOut size={18} />
            {!collapsed && <span>Log out</span>}
          </button>

          {!collapsed && (
            <div className="sidebar-version">
              <span className="sidebar-version-dot" />
              Nexus AI · Workspace
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
