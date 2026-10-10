
import { useState } from 'react';
import {
  Plus,
  Globe,
  ExternalLink,
  Eye,
  MoreHorizontal,
  LayoutTemplate,
  ArrowUpRight,
  Sparkles,
  Search,
  CheckCircle2,
} from 'lucide-react';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import WebsitePreview from '../components/WebsitePreview';

import '../styles/Websites.css';

type Website = {
  id: number;
  name: string;
  domain: string;
  description: string;
  status: 'Published' | 'Draft';
  updated: string;
  accentColor: string;
};

const initialWebsites: Website[] = [
  {
    id: 1,
    name: 'Nexus Studio',
    domain: 'nexus-studio.example',
    description: 'A modern website for a creative digital agency.',
    status: 'Published',
    updated: 'Updated today',
    accentColor: '#8b76ff',
  },
  {
    id: 2,
    name: 'LaunchPad',
    domain: 'launchpad.example',
    description: 'A landing page for a new product launch.',
    status: 'Draft',
    updated: 'Updated yesterday',
    accentColor: '#46c7a5',
  },
];

function Websites() {
  const [websites, setWebsites] = useState(initialWebsites);
  const [search, setSearch] = useState('');
  const [selectedWebsite, setSelectedWebsite] =
    useState<Website | null>(null);

  const filteredWebsites = websites.filter((website) =>
    `${website.name} ${website.domain}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function createWebsite() {
    const newWebsite: Website = {
      id: Date.now(),
      name: 'Untitled Website',
      domain: 'not-published.example',
      description: 'Your new website draft is ready to customize.',
      status: 'Draft',
      updated: 'Created just now',
      accentColor: '#a995ff',
    };

    setWebsites((current) => [newWebsite, ...current]);
    setSelectedWebsite(newWebsite);
  }

  return (
    <div className="websites-layout">
      <Sidebar />

      <main className="websites-main">
        <Topbar title="Websites" />

        <section className="websites-content">
          <div className="websites-heading">
            <div>
              <div className="websites-eyebrow">
                <Globe size={14} />
                YOUR DIGITAL PRESENCE
              </div>

              <h2>Websites</h2>

              <p>
                Create, manage, and preview your business websites
                from one workspace.
              </p>
            </div>

            <button
              type="button"
              className="websites-create-button"
              onClick={createWebsite}
            >
              <Plus size={17} />
              Create website
            </button>
          </div>

          <div className="websites-stats">
            <div className="websites-stat-card">
              <span className="websites-stat-icon purple">
                <Globe size={19} />
              </span>

              <div>
                <p>Total websites</p>
                <h3>{websites.length}</h3>
              </div>
            </div>

            <div className="websites-stat-card">
              <span className="websites-stat-icon green">
                <CheckCircle2 size={19} />
              </span>

              <div>
                <p>Published</p>
                <h3>
                  {websites.filter(
                    (website) => website.status === 'Published'
                  ).length}
                </h3>
              </div>
            </div>

            <div className="websites-stat-card">
              <span className="websites-stat-icon orange">
                <LayoutTemplate size={19} />
              </span>

              <div>
                <p>Drafts</p>
                <h3>
                  {websites.filter(
                    (website) => website.status === 'Draft'
                  ).length}
                </h3>
              </div>
            </div>
          </div>

          <div className="websites-toolbar">
            <div>
              <h3>Your projects</h3>
              <p>Manage your website projects.</p>
            </div>

            <label className="websites-search">
              <Search size={16} />

              <input
                type="search"
                placeholder="Search websites..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>

          <div className="websites-grid">
            {filteredWebsites.map((website) => (
              <article className="website-card" key={website.id}>
                <div className="website-card-preview">
                  <div className="website-browser-bar">
                    <div className="website-browser-dots">
                      <span />
                      <span />
                      <span />
                    </div>

                    <div className="website-browser-address">
                      <Globe size={11} />
                      {website.domain}
                    </div>

                    <MoreHorizontal size={16} />
                  </div>

                  <div
                    className="website-mini-preview"
                    style={{
                      '--website-accent': website.accentColor,
                    } as React.CSSProperties}
                  >
                    <div className="website-mini-nav">
                      <span>{website.name}</span>
                      <span className="website-mini-menu">☰</span>
                    </div>

                    <div className="website-mini-hero">
                      <span className="website-mini-label">
                        YOUR NEXT CHAPTER
                      </span>

                      <h4>
                        Build something
                        <br />
                        extraordinary.
                      </h4>

                      <p>
                        {website.description}
                      </p>

                      <span className="website-mini-button">
                        Discover more <ArrowUpRight size={11} />
                      </span>
                    </div>

                    <div className="website-mini-bottom">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>

                <div className="website-card-body">
                  <div className="website-card-title-row">
                    <div>
                      <h3>{website.name}</h3>

                      <p className="website-domain">
                        {website.domain}
                      </p>
                    </div>

                    <span
                      className={`website-status ${
                        website.status === 'Published'
                          ? 'published'
                          : 'draft'
                      }`}
                    >
                      {website.status}
                    </span>
                  </div>

                  <p className="website-description">
                    {website.description}
                  </p>

                  <div className="website-card-footer">
                    <span className="website-updated">
                      {website.updated}
                    </span>

                    <div className="website-card-actions">
                      <button
                        type="button"
                        className="website-preview-button"
                        onClick={() => setSelectedWebsite(website)}
                      >
                        <Eye size={15} />
                        Preview
                      </button>

                      <button
                        type="button"
                        className="website-icon-button"
                        title="Open website details"
                        aria-label={`Open ${website.name} details`}
                        onClick={() => setSelectedWebsite(website)}
                      >
                        <ExternalLink size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            <button
              type="button"
              className="website-add-card"
              onClick={createWebsite}
            >
              <span className="website-add-icon">
                <Plus size={23} />
              </span>

              <strong>Create a new website</strong>

              <span>
                Start with a fresh draft and customize it later.
              </span>
            </button>
          </div>

          {filteredWebsites.length === 0 && (
            <div className="websites-empty">
              <Search size={25} />
              <h3>No websites found</h3>
              <p>Try another search term.</p>
            </div>
          )}
        </section>
      </main>

      {selectedWebsite && (
        <div
          className="websites-modal-backdrop"
          onClick={() => setSelectedWebsite(null)}
        >
          <section
            className="websites-preview-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedWebsite.name} preview`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="websites-modal-header">
              <div>
                <span className="websites-eyebrow">
                  <Sparkles size={13} />
                  WEBSITE PREVIEW
                </span>

                <h2>{selectedWebsite.name}</h2>
              </div>

              <button
                type="button"
                className="website-icon-button"
                onClick={() => setSelectedWebsite(null)}
                aria-label="Close preview"
              >
                ×
              </button>
            </div>

            <WebsitePreview
              title="Build something extraordinary."
              description={selectedWebsite.description}
              buttonText="Discover more"
              brandName={selectedWebsite.name}
              accentColor={selectedWebsite.accentColor}
            />

            <div className="websites-modal-footer">
              <span className="website-status draft">
                Preview only
              </span>

              <button
                type="button"
                className="websites-create-button"
                onClick={() => setSelectedWebsite(null)}
              >
                Done
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Websites;
