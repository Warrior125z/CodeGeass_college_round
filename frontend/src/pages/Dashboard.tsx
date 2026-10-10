
import {
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  ChartNoAxesCombined,
  Globe,
  Plus,
  Users,
  Zap,
  Clock3,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import '../styles/Dashboard.css';

const stats = [
  {
    title: 'Total Websites',
    value: '0',
    description: 'Your published websites',
    icon: Globe,
    color: 'purple',
    link: '/app/websites',
  },
  {
    title: 'CRM Leads',
    value: '0',
    description: 'Customers and prospects',
    icon: Users,
    color: 'blue',
    link: '/app/crm',
  },
  {
    title: 'Webinars',
    value: '0',
    description: 'Events you have created',
    icon: CalendarDays,
    color: 'orange',
    link: '/app/webinars',
  },
  {
    title: 'Business Insights',
    value: '—',
    description: 'Analytics overview',
    icon: ChartNoAxesCombined,
    color: 'green',
    link: '/app/analytics',
  },
];

const quickActions = [
  {
    title: 'Build a website',
    description: 'Turn your idea into a website.',
    icon: Globe,
    link: '/app/websites',
  },
  {
    title: 'Add a customer',
    description: 'Save a new lead in your CRM.',
    icon: Users,
    link: '/app/crm',
  },
  {
    title: 'Create a webinar',
    description: 'Plan your next online event.',
    icon: CalendarDays,
    link: '/app/webinars',
  },
];

function Dashboard() {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Topbar title="Dashboard" />

        <main className="dashboard-content">
          <section className="dashboard-welcome">
            <div>
              <span className="dashboard-eyebrow">
                <span className="dashboard-live-dot" />
                YOUR BUSINESS WORKSPACE
              </span>

              <h1>Turn your ideas into action.</h1>

              <p>
                Welcome to Nexus AI. What would you like to work on today?
              </p>

              <Link to="/app/workspace" className="dashboard-ai-button">
                <BrainCircuit size={18} />
                Open AI Workspace
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="dashboard-welcome-art">
              <div className="dashboard-orbit dashboard-orbit-one" />
              <div className="dashboard-orbit dashboard-orbit-two" />
              <div className="dashboard-orbit-core">
                <BrainCircuit size={42} />
              </div>
              <span className="dashboard-orbit-icon dashboard-orbit-globe">
                <Globe size={19} />
              </span>
              <span className="dashboard-orbit-icon dashboard-orbit-users">
                <Users size={19} />
              </span>
              <span className="dashboard-orbit-icon dashboard-orbit-chart">
                <ChartNoAxesCombined size={19} />
              </span>
            </div>
          </section>

          <section className="dashboard-section">
            <div className="dashboard-section-heading">
              <div>
                <h2>Workspace overview</h2>
                <p>A quick look at your business resources.</p>
              </div>

              <span className="dashboard-period-label">
                <Clock3 size={14} />
                All time
              </span>
            </div>

            <div className="dashboard-stats-grid">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <Link
                    to={stat.link}
                    className="dashboard-stat-card"
                    key={stat.title}
                  >
                    <div className="dashboard-stat-top">
                      <span className={`dashboard-stat-icon ${stat.color}`}>
                        <Icon size={20} />
                      </span>
                      <ArrowRight
                        className="dashboard-stat-arrow"
                        size={16}
                      />
                    </div>

                    <p>{stat.title}</p>
                    <strong>{stat.value}</strong>
                    <span className="dashboard-stat-description">
                      {stat.description}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="dashboard-lower-grid">
            <div className="dashboard-panel dashboard-quick-panel">
              <div className="dashboard-panel-heading">
                <div>
                  <h2>Quick actions</h2>
                  <p>Get started with a new task.</p>
                </div>
                <Zap size={19} />
              </div>

              <div className="dashboard-quick-list">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <Link
                      to={action.link}
                      className="dashboard-quick-item"
                      key={action.title}
                    >
                      <span className="dashboard-quick-icon">
                        <Icon size={19} />
                      </span>

                      <span className="dashboard-quick-text">
                        <strong>{action.title}</strong>
                        <span>{action.description}</span>
                      </span>

                      <ArrowRight size={17} />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="dashboard-panel dashboard-activity-panel">
              <div className="dashboard-panel-heading">
                <div>
                  <h2>Recent activity</h2>
                  <p>Your latest workspace updates.</p>
                </div>

                <Clock3 size={19} />
              </div>

              <div className="dashboard-empty-state">
                <span className="dashboard-empty-icon">
                  <Plus size={23} />
                </span>

                <strong>Nothing here yet</strong>

                <p>
                  Your website, CRM, and webinar activities will appear here
                  once you start creating resources.
                </p>

                <Link to="/app/workspace">
                  Start with AI <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </section>

          <footer className="dashboard-footer">
            <span>Nexus AI Workspace</span>
            <span>One workspace. More possibilities.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
