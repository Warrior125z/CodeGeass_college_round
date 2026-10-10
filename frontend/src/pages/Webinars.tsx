
import { useMemo, useState } from 'react';
import {
  Plus,
  Video,
  CalendarDays,
  Users,
  Clock3,
  Search,
  X,
  Radio,
  MoreHorizontal,
  CalendarCheck,
} from 'lucide-react';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

import '../styles/Webinars.css';

type WebinarStatus = 'Upcoming' | 'Live' | 'Completed' | 'Draft';

type Webinar = {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  host: string;
  registrations: number;
  status: WebinarStatus;
  category: string;
};

const initialWebinars: Webinar[] = [
  {
    id: 1,
    title: 'Building Your First AI Product',
    description:
      'Learn how to turn an idea into a practical AI-powered product.',
    date: '2026-10-15',
    time: '17:00',
    duration: 60,
    host: 'Nexus AI Team',
    registrations: 128,
    status: 'Upcoming',
    category: 'Artificial Intelligence',
  },
  {
    id: 2,
    title: 'Marketing That Converts',
    description:
      'Understand customer journeys and build better marketing campaigns.',
    date: '2026-10-18',
    time: '16:00',
    duration: 45,
    host: 'Growth Team',
    registrations: 86,
    status: 'Upcoming',
    category: 'Marketing',
  },
  {
    id: 3,
    title: 'Getting Started with Automation',
    description:
      'Discover practical ways to automate repetitive business tasks.',
    date: '2026-10-05',
    time: '15:00',
    duration: 50,
    host: 'Product Team',
    registrations: 204,
    status: 'Completed',
    category: 'Automation',
  },
];

const webinarStatuses: WebinarStatus[] = [
  'Upcoming',
  'Live',
  'Completed',
  'Draft',
];

function formatDate(date: string) {
  if (!date) return 'Date not set';

  return new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function Webinars() {
  const [webinars, setWebinars] = useState<Webinar[]>(initialWebinars);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [selectedWebinar, setSelectedWebinar] =
    useState<Webinar | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('17:00');
  const [duration, setDuration] = useState('60');
  const [host, setHost] = useState('');
  const [category, setCategory] = useState('Artificial Intelligence');

  const filteredWebinars = useMemo(() => {
    return webinars.filter((webinar) => {
      const matchesSearch =
        `${webinar.title} ${webinar.description} ${webinar.host}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' || webinar.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [webinars, search, statusFilter]);

  const totalRegistrations = webinars.reduce(
    (total, webinar) => total + webinar.registrations,
    0
  );

  const upcomingCount = webinars.filter(
    (webinar) => webinar.status === 'Upcoming'
  ).length;

  function createWebinar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newWebinar: Webinar = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      duration: Number(duration),
      host: host.trim(),
      registrations: 0,
      status: 'Draft',
      category,
    };

    setWebinars((current) => [newWebinar, ...current]);

    setTitle('');
    setDescription('');
    setDate('');
    setTime('17:00');
    setDuration('60');
    setHost('');
    setCategory('Artificial Intelligence');
    setStatusFilter('All');
    setSearch('');
    setShowForm(false);
  }

  function updateStatus(id: number, status: WebinarStatus) {
    setWebinars((current) =>
      current.map((webinar) =>
        webinar.id === id ? { ...webinar, status } : webinar
      )
    );

    setSelectedWebinar((current) =>
      current?.id === id ? { ...current, status } : current
    );
  }

  return (
    <div className="webinars-layout">
      <Sidebar />

      <main className="webinars-main">
        <Topbar title="Webinars" />

        <section className="webinars-content">
          <div className="webinars-heading">
            <div>
              <span className="webinars-eyebrow">
                <Video size={14} />
                EVENTS & ENGAGEMENT
              </span>

              <h2>Webinars</h2>

              <p>
                Plan online events, manage registrations, and bring
                your audience together.
              </p>
            </div>

            <button
              type="button"
              className="webinars-primary-button"
              onClick={() => setShowForm(true)}
            >
              <Plus size={17} />
              Create webinar
            </button>
          </div>

          <div className="webinars-stats">
            <article className="webinars-stat-card">
              <span className="webinars-stat-icon purple">
                <Video size={19} />
              </span>

              <div>
                <p>Total webinars</p>
                <h3>{webinars.length}</h3>
              </div>
            </article>

            <article className="webinars-stat-card">
              <span className="webinars-stat-icon blue">
                <CalendarDays size={19} />
              </span>

              <div>
                <p>Upcoming</p>
                <h3>{upcomingCount}</h3>
              </div>
            </article>

            <article className="webinars-stat-card">
              <span className="webinars-stat-icon green">
                <Users size={19} />
              </span>

              <div>
                <p>Total registrations</p>
                <h3>{totalRegistrations.toLocaleString('en-IN')}</h3>
              </div>
            </article>
          </div>

          <div className="webinars-toolbar">
            <div>
              <h3>Your events</h3>
              <p>Manage your webinar schedule.</p>
            </div>

            <div className="webinars-filters">
              <label className="webinars-search">
                <Search size={16} />

                <input
                  type="search"
                  placeholder="Search webinars..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              <select
                className="webinars-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter webinars by status"
              >
                <option value="All">All statuses</option>

                {webinarStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="webinars-grid">
            {filteredWebinars.map((webinar, index) => (
              <article className="webinar-card" key={webinar.id}>
                <div className={`webinar-card-cover cover-${index % 3}`}>
                  <div className="webinar-cover-top">
                    <span className="webinar-cover-category">
                      {webinar.category}
                    </span>

                    <button
                      type="button"
                      className="webinar-more-button"
                      aria-label={`View ${webinar.title} details`}
                      onClick={() => setSelectedWebinar(webinar)}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  <div className="webinar-cover-art">
                    <span className="webinar-cover-orbit orbit-one" />
                    <span className="webinar-cover-orbit orbit-two" />

                    <span className="webinar-cover-icon">
                      {webinar.status === 'Live' ? (
                        <Radio size={28} />
                      ) : (
                        <Video size={28} />
                      )}
                    </span>
                  </div>

                  <span
                    className={`webinar-status-badge ${webinar.status.toLowerCase()}`}
                  >
                    {webinar.status === 'Live' && (
                      <span className="webinar-live-dot" />
                    )}
                    {webinar.status}
                  </span>
                </div>

                <div className="webinar-card-body">
                  <h3>{webinar.title}</h3>

                  <p className="webinar-description">
                    {webinar.description}
                  </p>

                  <div className="webinar-meta">
                    <span>
                      <CalendarDays size={14} />
                      {formatDate(webinar.date)}
                    </span>

                    <span>
                      <Clock3 size={14} />
                      {webinar.time} · {webinar.duration} min
                    </span>
                  </div>

                  <div className="webinar-card-footer">
                    <div className="webinar-host">
                      <span className="webinar-host-avatar">
                        {webinar.host.slice(0, 1).toUpperCase() || 'N'}
                      </span>

                      <span>{webinar.host}</span>
                    </div>

                    <span className="webinar-registrations">
                      <Users size={14} />
                      {webinar.registrations}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="webinar-manage-button"
                    onClick={() => setSelectedWebinar(webinar)}
                  >
                    Manage webinar
                  </button>
                </div>
              </article>
            ))}

            <button
              type="button"
              className="webinar-add-card"
              onClick={() => setShowForm(true)}
            >
              <span className="webinar-add-icon">
                <Plus size={24} />
              </span>

              <strong>Create a webinar</strong>

              <span>
                Schedule your next event and start planning.
              </span>
            </button>
          </div>

          {filteredWebinars.length === 0 && (
            <div className="webinars-empty">
              <Video size={26} />
              <h3>No webinars found</h3>
              <p>Try a different search or status filter.</p>
            </div>
          )}
        </section>
      </main>

      {showForm && (
        <div
          className="webinars-modal-backdrop"
          onClick={() => setShowForm(false)}
        >
          <section
            className="webinars-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="webinars-form-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="webinars-modal-header">
              <div>
                <span className="webinars-eyebrow">
                  <CalendarCheck size={13} />
                  EVENT SETUP
                </span>

                <h2 id="webinars-form-title">Create webinar</h2>

                <p>Enter the basic details for your event.</p>
              </div>

              <button
                type="button"
                className="webinars-close-button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            <form className="webinars-form" onSubmit={createWebinar}>
              <label className="webinars-full-field">
                Webinar title
                <input
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Introduction to AI"
                />
              </label>

              <label className="webinars-full-field">
                Description
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What will attendees learn?"
                />
              </label>

              <label>
                Date
                <input
                  required
                  type="date"
                  min={new Date().toLocaleDateString('en-CA')}
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </label>

              <label>
                Start time
                <input
                  required
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                />
              </label>

              <label>
                Duration (minutes)
                <input
                  required
                  type="number"
                  min="15"
                  max="480"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                />
              </label>

              <label>
                Host name
                <input
                  required
                  value={host}
                  onChange={(event) => setHost(event.target.value)}
                  placeholder="e.g. Product Team"
                />
              </label>

              <label className="webinars-full-field">
                Category
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option>Artificial Intelligence</option>
                  <option>Marketing</option>
                  <option>Technology</option>
                  <option>Business</option>
                  <option>Automation</option>
                  <option>Other</option>
                </select>
              </label>

              <div className="webinars-form-actions">
                <button
                  type="button"
                  className="webinars-secondary-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="webinars-primary-button"
                >
                  <Plus size={16} />
                  Save draft
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedWebinar && (
        <div
          className="webinars-modal-backdrop"
          onClick={() => setSelectedWebinar(null)}
        >
          <section
            className="webinars-modal webinar-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="webinar-details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="webinars-modal-header">
              <div>
                <span className="webinars-eyebrow">WEBINAR DETAILS</span>
                <h2 id="webinar-details-title">
                  {selectedWebinar.title}
                </h2>
                <p>{selectedWebinar.description}</p>
              </div>

              <button
                type="button"
                className="webinars-close-button"
                onClick={() => setSelectedWebinar(null)}
                aria-label="Close details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="webinar-detail-list">
              <div>
                <span>Date</span>
                <strong>{formatDate(selectedWebinar.date)}</strong>
              </div>

              <div>
                <span>Time</span>
                <strong>{selectedWebinar.time}</strong>
              </div>

              <div>
                <span>Duration</span>
                <strong>{selectedWebinar.duration} minutes</strong>
              </div>

              <div>
                <span>Registrations</span>
                <strong>{selectedWebinar.registrations}</strong>
              </div>
            </div>

            <label className="webinar-edit-status">
              Webinar status

              <select
                value={selectedWebinar.status}
                onChange={(event) =>
                  updateStatus(
                    selectedWebinar.id,
                    event.target.value as WebinarStatus
                  )
                }
              >
                {webinarStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <div className="webinars-form-actions">
              <button
                type="button"
                className="webinars-secondary-button"
                onClick={() => setSelectedWebinar(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Webinars;
