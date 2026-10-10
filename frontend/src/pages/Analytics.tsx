
import { useState } from 'react';
import {
  Activity,
  BarChart3,
  CalendarDays,
  Download,
  Globe,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import '../styles/Analytics.css';

function Analytics() {
  const [period, setPeriod] = useState('7 days');

  return (
    <div className="analytics-layout">
      <Sidebar />

      <main className="analytics-main">
        <Topbar title="Analytics" />

        <section
          className="analytics-content"
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            event.currentTarget.style.setProperty('--cursor-x', `${event.clientX - rect.left}px`);
            event.currentTarget.style.setProperty('--cursor-y', `${event.clientY - rect.top}px`);
          }}
        >
          <div className="analytics-ambient-layer" aria-hidden="true" />
          <div className="nexus-floating-agent" aria-hidden="true">
            <video autoPlay muted loop playsInline>
              <source src="/videos/nexus-robot.mp4" type="video/mp4" />
            </video>
            <span>NEXUS AI</span>
          </div>
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

          <div className="analytics-metrics-grid">
            {[
              { label: 'Total visitors', icon: Users },
              { label: 'New leads', icon: Target },
              { label: 'Conversion rate', icon: TrendingUp },
              { label: 'Page views', icon: BarChart3 },
            ].map(({ label, icon: Icon }) => {
              return (
                <article className="analytics-metric-card" key={label}>
                  <div className="analytics-metric-top">
                    <span>{label}</span>
                    <span className="analytics-metric-icon">
                      <Icon size={18} />
                    </span>
                  </div>

                  <strong className="analytics-metric-value">
                    —
                  </strong>

                  <div className="analytics-metric-bottom">
                    <span className="analytics-change">No data yet</span>
                    <span>{period}</span>
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
                    <div className="analytics-empty-chart">
                      Analytics will appear when your workspace receives activity.
                    </div>
                  </div>
                </div>
              </div>

              <div className="analytics-chart-footer">
                <div>
                  <span>Total visitors</span>
                  <strong>—</strong>
                </div>
                <div>
                  <span>Total leads</span>
                  <strong>—</strong>
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
                <div className="analytics-empty-chart">
                  Traffic sources will appear when visitor data is available.
                </div>
              </div>
            </section>
          </div>

          <section className="analytics-panel analytics-events-panel">
            <div className="analytics-panel-heading">
              <div>
                <h3>Recent activity</h3>
                <p>Activity from across your workspace</p>
              </div>
            </div>

            <div className="analytics-event-list">
              <div className="analytics-empty-chart">
                Recent activity will appear here once your workspace is active.
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default Analytics;
