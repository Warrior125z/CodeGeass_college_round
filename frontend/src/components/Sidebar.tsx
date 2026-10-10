import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
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
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { clearLocalSession } from '../services/auth';
import '../styles/Sidebar.css';

const navigationItems = [
  { label: 'Dashboard', path: '/app', icon: LayoutDashboard },
  { label: 'AI Workspace', path: '/app/workspace', icon: MessageSquare },
  { label: 'Websites', path: '/app/websites', icon: Globe },
  { label: 'CRM', path: '/app/crm', icon: Users },
  { label: 'Webinars', path: '/app/webinars', icon: CalendarDays },
  { label: 'Analytics', path: '/app/analytics', icon: ChartNoAxesCombined },
];

const tips = [
  { title: 'Have an idea?', text: 'Describe it to your AI assistant and start building.' },
  { title: 'Find anything fast', text: 'Press Ctrl or ⌘ + K to jump to any page or action.' },
  { title: 'More room to work', text: 'Press [ to collapse or expand this sidebar.' },
];

const STORAGE_KEY = 'nexus-sidebar-collapsed';

function Sidebar() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const logoutTimer = useRef<number>(0);

  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const activeIndex = navigationItems.findIndex((item) =>
    item.path === '/app' ? pathname === '/app' || pathname === '/app/' : pathname.startsWith(item.path),
  );

  /* ---- sliding pills (active + hover). Positions are written straight to CSS
         variables, so moving the pointer never re-renders React. ---- */
  const placePill = useCallback((name: '--active' | '--hover', index: number) => {
    const nav = navRef.current;
    const el = linkRefs.current[index];
    if (!nav || !el) return;
    nav.style.setProperty(`${name}-y`, `${el.offsetTop}px`);
    nav.style.setProperty(`${name}-h`, `${el.offsetHeight}px`);
  }, []);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    if (activeIndex >= 0) {
      placePill('--active', activeIndex);
      nav.classList.add('has-active');
    } else {
      nav.classList.remove('has-active');
    }
    // enable transitions only after the first paint so the pill doesn't fly in from the top
    const id = requestAnimationFrame(() => nav.classList.add('is-ready'));
    return () => cancelAnimationFrame(id);
  }, [activeIndex, collapsed, placePill]);

  const hoverItem = (index: number) => {
    placePill('--hover', index);
    navRef.current?.classList.add('has-hover');
  };
  const leaveNav = () => navRef.current?.classList.remove('has-hover');

  /* ---- remember collapsed state ---- */
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
    } catch {
      /* storage unavailable: ignore */
    }
  }, [collapsed]);

  /* ---- "[" toggles the sidebar ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if (e.key === '[' && !typing && !e.metaKey && !e.ctrlKey) setCollapsed((c) => !c);
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ---- mobile drawer: lock page scroll while open ---- */
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  /* ---- rotating tip ---- */
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setTipIndex((i) => (i + 1) % tips.length), 7000);
    return () => window.clearInterval(id);
  }, [reduced]);

  useEffect(() => () => window.clearTimeout(logoutTimer.current), []);

  function handleLogout() {
    if (leaving) return;
    setLeaving(true);
    logoutTimer.current = window.setTimeout(() => {
      clearLocalSession();
      navigate('/login');
    }, reduced ? 0 : 380);
  }

  const onTipMove = (e: ReactMouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--px', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--py', `${e.clientY - r.top}px`);
  };

  const tip = tips[tipIndex];

  return (
    <>
      <button
        type="button"
        className={`sidebar-mobile-toggle ${mobileOpen ? 'is-open' : ''}`}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={mobileOpen}
      >
        <Menu size={21} className="sidebar-toggle-menu" />
        <X size={21} className="sidebar-toggle-close" />
      </button>

      <button
        type="button"
        className={`sidebar-mobile-overlay ${mobileOpen ? 'is-open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-label="Close navigation overlay"
        tabIndex={mobileOpen ? 0 : -1}
      />

      <aside
        className={[
          'nexus-sidebar',
          collapsed ? 'nexus-sidebar-collapsed' : '',
          mobileOpen ? 'nexus-sidebar-mobile-open' : '',
          leaving ? 'nexus-sidebar-leaving' : '',
        ].join(' ')}
      >
        <div className="sidebar-brand-row">
          <NavLink to="/app" className="sidebar-brand" onClick={() => setMobileOpen(false)}>
            <span className="sidebar-brand-icon">
              <BrainCircuit size={22} />
            </span>

            <span className="sidebar-label sidebar-brand-text">
              NEXUS<span className="sidebar-brand-highlight">AI</span>
            </span>
          </NavLink>

          <button
            type="button"
            className="sidebar-collapse-button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar  [' : 'Collapse sidebar  ['}
          >
            <ChevronLeft size={17} className={collapsed ? 'sidebar-chevron-rotated' : ''} />
          </button>
        </div>

        <div className="sidebar-workspace-label">
          <span className="sidebar-workspace-dot" />
          <span className="sidebar-label">BUSINESS WORKSPACE</span>
        </div>

        <nav className="sidebar-navigation" aria-label="Main navigation" ref={navRef} onMouseLeave={leaveNav}>
          <span className="sidebar-pill sidebar-pill-hover" aria-hidden="true" />
          <span className="sidebar-pill sidebar-pill-active" aria-hidden="true" />

          {navigationItems.map((item, i) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/app'}
                ref={(el) => {
                  linkRefs.current[i] = el;
                }}
                aria-label={item.label}
                data-tip={item.label}
                style={{ '--i': i } as CSSProperties}
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'sidebar-nav-link-active' : ''}`}
                onClick={() => setMobileOpen(false)}
                onMouseEnter={() => hoverItem(i)}
                onFocus={() => hoverItem(i)}
              >
                <Icon size={19} className="sidebar-nav-icon" />
                <span className="sidebar-label">{item.label}</span>
                {item.label === 'AI Workspace' && <span className="sidebar-ai-badge sidebar-label">AI</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip-card" onMouseMove={onTipMove}>
            <span className="sidebar-tip-icon">
              <Activity size={18} />
            </span>

            <div className="sidebar-tip-body" key={tipIndex}>
              <strong>{tip.title}</strong>
              <p>{tip.text}</p>
            </div>

            <NavLink to="/app/workspace" onClick={() => setMobileOpen(false)}>
              Open workspace <span aria-hidden="true">→</span>
            </NavLink>

            <div className="sidebar-tip-dots" aria-hidden="true">
              {tips.map((_, i) => (
                <span key={i} className={i === tipIndex ? 'is-active' : ''} />
              ))}
            </div>
          </div>

          <button
            type="button"
            className="sidebar-logout-button"
            onClick={handleLogout}
            aria-label="Log out"
            data-tip="Log out"
          >
            <LogOut size={18} />
            <span className="sidebar-label">{leaving ? 'Logging out…' : 'Log out'}</span>
          </button>

          <div className="sidebar-version">
            <span className="sidebar-version-dot" />
            <span className="sidebar-label">Nexus AI · Workspace</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;