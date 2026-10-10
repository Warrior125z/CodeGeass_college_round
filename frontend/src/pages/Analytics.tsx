
import { useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Download,
  Globe,
  MousePointer2,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import '../styles/Analytics.css';

const trafficData = [
  { day: 'Mon', visitors: 420, leads: 24 },
  { day: 'Tue', visitors: 610, leads: 36 },
  { day: 'Wed', visitors: 520, leads: 29 },
  { day: 'Thu', visitors: 780, leads: 48 },
  { day: 'Fri', visitors: 690, leads: 41 },
  { day: 'Sat', visitors: 910, leads: 57 },
  { day: 'Sun', visitors: 740, leads: 45 },
];

const sourceData = [
  { name: 'Direct', visitors: 1240, percentage: 42 },
  { name: 'Social media', visitors: 890, percentage: 30 },
  { name: 'Search engines', visitors: 530, percentage: 18 },
  { name: 'Referrals', visitors: 300, percentage: 10 },
];

const recentEvents = [
  {
    title: 'New lead captured',
    description: 'A visitor submitted the contact form.',
    time: '10 minutes ago',
    icon: Users,
  },
  {
    title: 'Website traffic increased',
    description: 'Visitor activity was higher than the previous period.',
    time: '35 minutes ago',
    icon: TrendingUp,
  },
  {
    title: 'Campaign link clicked',
    description: 'A visitor opened a campaign link.',
    time: '1 hour ago',
    icon: MousePointer2,
  },
  {
    title: 'Website page viewed',
    description: 'A visitor opened the home page.',
    time: '2 hours ago',
    icon: Globe,
  },
];

function Analytics() {
  const [period, setPeriod] = useState('7 days');
  const [showDemoNotice, setShowDemoNotice] = useState(true);

  const metrics = [
    {
      label: 'Total visitors',
      value: '4,280',
      change: '+12.8%',
      positive: true,
      icon: Users,
    },
    {
      label: 'New leads',
      value: '184',
      change: '+8.4%',
      positive: true,
      icon: Target,
    },
    {
      label: 'Conversion rate',
      value: '4.3%',
      change: '+1.2%',
      positive: true,
      icon: TrendingUp,
    },
    {
      label: 'Page views',
      value: '8,642',
      change: '-2.1%',
      positive: false,
      icon: BarChart3,
    },
  ];

  const maxVisitors = Math.max(...trafficData.map((item) => item.visitors));

  return (
    <div className="analytics-layout">
      <Sidebar />

      <main className="analytics-main">
        <Topbar title="Analytics" />

        <section className="analytics-content">
          <div className="analytics-heading">
            <div>
              <span className="analytics-eyebrow">
                <Activity size={14} />
                PERFORMANCE OVERVIEW
              </span>
              <h2>Understand your growth.</h2>
              <p>
                See how your website and business activities are performing.
              </p>
            </div>

            <div className="analytics-heading-actions">
              <label className="analytics-period">
                <CalendarDays size={16} />
                <select
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  aria-label="Analytics time period"
                >
                  <option value="7 days">Last 7 days</option>
                  <option value="30 days">Last 30 days</option>
                  <option value="90 days">Last 90 days</option>
                </select>
              </label>

              <button
                className="analytics-export-button"
                type="button"
                onClick={() => window.print()}
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          {showDemoNotice && (
            <div className="analytics-demo-notice">
              <span>
                <Activity size={17} />
              </span>
              <p>
                <strong>Preview data</strong>
                These sample metrics are for demonstration and are not live
                business analytics yet.
              </p>
              <button
                type="button"
                onClick={() => setShowDemoNotice(false)}
                aria-label="Dismiss demo data notice"
              >
                ×
              </button>
            </div>
          )}

          <div className="analytics-metrics-grid">
            {metrics.map((metric) => {
              const Icon = metric.icon;

              return (
                <article className="analytics-metric-card" key={metric.label}>
                  <div className="analytics-metric-top">
                    <span>{metric.label}</span>
                    <span className="analytics-metric-icon">
                      <Icon size={18} />
                    </span>
                  </div>

                  <strong className="analytics-metric-value">
                    {metric.value}
                  </strong>

                  <div className="analytics-metric-bottom">
                    <span
                      className={
                        metric.positive
                          ? 'analytics-change positive'
                          : 'analytics-change negative'
                      }
                    >
                      {metric.positive ? (
                        <ArrowUpRight size={14} />
                      ) : (
                        <ArrowDownRight size={14} />
                      )}
                      {metric.change}
                    </span>
                    <span>vs. previous period</span>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="analytics-main-grid">
            <section className="analytics-panel analytics-traffic-panel">
              <div className="analytics-panel-heading">
                <div>
                  <h3>Traffic overview</h3>
                  <p>Visitors throughout the selected week</p>
                </div>
                <span className="analytics-live-label">
                  <span />
                  Demo
                </span>
              </div>

              <div className="analytics-chart-legend">
                <span>
                  <i className="legend-visitors" />
                  Visitors
                </span>
                <span>
                  <i className="legend-leads" />
                  Leads
                </span>
              </div>

              <div className="analytics-chart">
                <div className="analytics-y-labels">
                  <span>1,000</span>
                  <span>750</span>
                  <span>500</span>
                  <span>250</span>
                  <span>0</span>
                </div>

                <div className="analytics-chart-area">
                  <div className="analytics-grid-lines">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="analytics-bars">
                    {trafficData.map((item) => (
                      <div className="analytics-bar-group" key={item.day}>
                        <div className="analytics-bar-pair">
                          <div
                            className="analytics-bar visitors-bar"
                            style={{
                              height: `${(item.visitors / maxVisitors) * 100}%`,
                            }}
                            title={`${item.visitors} visitors`}
                          />
                          <div
                            className="analytics-bar leads-bar"
                            style={{
                              height: `${(item.leads / maxVisitors) * 100}%`,
                            }}
                            title={`${item.leads} leads`}
                          />
                        </div>
                        <span className="analytics-bar-day">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="analytics-chart-footer">
                <div>
                  <span>Total visitors</span>
                  <strong>4,670</strong>
                </div>
                <div>
                  <span>Total leads</span>
                  <strong>280</strong>
                </div>
                <div>
                  <span>Selected period</span>
                  <strong>{period}</strong>
                </div>
              </div>
            </section>

            <section className="analytics-panel analytics-sources-panel">
              <div className="analytics-panel-heading">
                <div>
                  <h3>Traffic sources</h3>
                  <p>Where visitors come from</p>
                </div>
                <Globe size={18} />
              </div>

              <div className="analytics-source-list">
                {sourceData.map((source) => (
                  <div className="analytics-source" key={source.name}>
                    <div className="analytics-source-top">
                      <span>{source.name}</span>
                      <strong>{source.percentage}%</strong>
                    </div>

                    <div className="analytics-source-track">
                      <div
                        className="analytics-source-fill"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>

                    <span className="analytics-source-visitors">
                      {source.visitors.toLocaleString()} visitors
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="analytics-panel analytics-events-panel">
            <div className="analytics-panel-heading">
              <div>
                <h3>Recent activity</h3>
                <p>Example events from across your workspace</p>
              </div>
              <button
                className="analytics-text-button"
                type="button"
                onClick={() => setShowDemoNotice(true)}
              >
                View demo notice
              </button>
            </div>

            <div className="analytics-event-list">
              {recentEvents.map((event) => {
                const Icon = event.icon;

                return (
                  <div className="analytics-event" key={event.title}>
                    <span className="analytics-event-icon">
                      <Icon size={17} />
                    </span>
                    <div className="analytics-event-copy">
                      <strong>{event.title}</strong>
                      <p>{event.description}</p>
                    </div>
                    <span className="analytics-event-time">{event.time}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default Analytics;
