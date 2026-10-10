
import { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Users,
  UserRound,
  TrendingUp,
  CircleDollarSign,
  Mail,
  X,
} from 'lucide-react';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

import '../styles/CRM.css';

type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted';

type Lead = {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  value: number;
  createdAt: string;
};

const statusOptions: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Converted',
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function CRM() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('Website');
  const [value, setValue] = useState('');

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        `${lead.name} ${lead.company} ${lead.email}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  const convertedCount = leads.filter(
    (lead) => lead.status === 'Converted'
  ).length;

  const pipelineValue = leads
    .filter((lead) => lead.status !== 'Converted')
    .reduce((total, lead) => total + lead.value, 0);

  function addLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newLead: Lead = {
      id: Date.now(),
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      source,
      status: 'New',
      value: Number(value) || 0,
      createdAt: 'Just now',
    };

    setLeads((current) => [newLead, ...current]);

    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setSource('Website');
    setValue('');
    setShowForm(false);
    setStatusFilter('All');
    setSearch('');
  }

  function updateLeadStatus(id: number, status: LeadStatus) {
    setLeads((current) =>
      current.map((lead) =>
        lead.id === id ? { ...lead, status } : lead
      )
    );
  }

  return (
    <div className="crm-layout">
      <Sidebar />

      <main className="crm-main">
        <Topbar title="CRM" />

        <section
          className="crm-content"
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            event.currentTarget.style.setProperty('--cursor-x', `${event.clientX - rect.left}px`);
            event.currentTarget.style.setProperty('--cursor-y', `${event.clientY - rect.top}px`);
          }}
        >
          <div className="nexus-ambient-layer" aria-hidden="true" />
          <div className="nexus-floating-agent" aria-hidden="true">
            <video autoPlay muted loop playsInline>
              <source src="/videos/nexus-robot.mp4" type="video/mp4" />
            </video>
            <span>NEXUS AI</span>
          </div>
          <div className="crm-heading">
            <div>
              <span className="crm-eyebrow">
                <Users size={14} />
                CUSTOMER RELATIONSHIPS
              </span>

              <h2>Manage your leads</h2>

              <p>
                Keep track of prospects, follow-ups, and potential
                business opportunities.
              </p>
            </div>

            <button
              type="button"
              className="crm-primary-button"
              onClick={() => setShowForm(true)}
            >
              <Plus size={17} />
              Add lead
            </button>
          </div>

          <div className="crm-stats">
            <article className="crm-stat-card">
              <div className="crm-stat-top">
                <span>Total leads</span>
                <span className="crm-stat-icon purple">
                  <Users size={18} />
                </span>
              </div>

              <h3>{leads.length}</h3>
              <p>People in your pipeline</p>
            </article>

            <article className="crm-stat-card">
              <div className="crm-stat-top">
                <span>Qualified leads</span>
                <span className="crm-stat-icon blue">
                  <TrendingUp size={18} />
                </span>
              </div>

              <h3>
                {leads.filter((lead) => lead.status === 'Qualified').length}
              </h3>

              <p>Ready for the next step</p>
            </article>

            <article className="crm-stat-card">
              <div className="crm-stat-top">
                <span>Converted</span>
                <span className="crm-stat-icon green">
                  <UserRound size={18} />
                </span>
              </div>

              <h3>{convertedCount}</h3>
              <p>Successful conversions</p>
            </article>

            <article className="crm-stat-card">
              <div className="crm-stat-top">
                <span>Pipeline value</span>
                <span className="crm-stat-icon orange">
                  <CircleDollarSign size={18} />
                </span>
              </div>

              <h3 className="crm-money">
                {formatCurrency(pipelineValue)}
              </h3>

              <p>Excludes converted leads</p>
            </article>
          </div>

          <section className="crm-leads-panel">
            <div className="crm-panel-heading">
              <div>
                <h3>All leads</h3>
                <p>View and update your customer prospects.</p>
              </div>

              <span className="crm-result-count">
                {filteredLeads.length} results
              </span>
            </div>

            <div className="crm-toolbar">
              <label className="crm-search">
                <Search size={16} />

                <input
                  type="search"
                  placeholder="Search name, company, or email..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              <select
                className="crm-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter leads by status"
              >
                <option value="All">All statuses</option>

                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="crm-table-wrap">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>CONTACT</th>
                    <th>SOURCE</th>
                    <th>VALUE</th>
                    <th>STATUS</th>
                    <th>ADDED</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <div className="crm-contact">
                          <span className="crm-contact-avatar">
                            {lead.name
                              .split(' ')
                              .map((part) => part[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>

                          <div className="crm-contact-info">
                            <strong>{lead.name}</strong>
                            <span>{lead.company}</span>

                            <span className="crm-contact-email">
                              <Mail size={11} />
                              {lead.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="crm-source">
                          {lead.source}
                        </span>
                      </td>

                      <td className="crm-value">
                        {formatCurrency(lead.value)}
                      </td>

                      <td>
                        <select
                          className={`crm-status-select status-${lead.status.toLowerCase()}`}
                          value={lead.status}
                          onChange={(event) =>
                            updateLeadStatus(
                              lead.id,
                              event.target.value as LeadStatus
                            )
                          }
                          aria-label={`Change status for ${lead.name}`}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="crm-date">{lead.createdAt}</td>

                      <td>
                        <span className="crm-row-action-placeholder" aria-hidden="true" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLeads.length === 0 && (
                <div className="crm-empty">
                  <Users size={24} />
                  <h3>No matching leads</h3>
                  <p>Try changing your search or status filter.</p>
                </div>
              )}
            </div>
          </section>
        </section>
      </main>

      {showForm && (
        <div
          className="crm-modal-backdrop"
          onClick={() => setShowForm(false)}
        >
          <section
            className="crm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="crm-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="crm-modal-header">
              <div>
                <span className="crm-eyebrow">NEW CONTACT</span>
                <h2 id="crm-modal-title">Add a lead</h2>
                <p>Add a prospect to your sales pipeline.</p>
              </div>

              <button
                type="button"
                className="crm-close-button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            <form className="crm-form" onSubmit={addLead}>
              <label>
                Full name
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Aisha Khan"
                />
              </label>

              <label>
                Company
                <input
                  required
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="e.g. NovaTech"
                />
              </label>

              <label>
                Email address
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@company.com"
                />
              </label>

              <label>
                Phone number
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+91 ..."
                />
              </label>

              <label>
                Lead source
                <select
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                >
                  <option>Website</option>
                  <option>Referral</option>
                  <option>Campaign</option>
                  <option>LinkedIn</option>
                  <option>Other</option>
                </select>
              </label>

              <label>
                Potential value (₹)
                <input
                  type="number"
                  min="0"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  placeholder="e.g. 25000"
                />
              </label>

              <div className="crm-form-actions">
                <button
                  type="button"
                  className="crm-secondary-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="crm-primary-button">
                  <Plus size={16} />
                  Save lead
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default CRM;
