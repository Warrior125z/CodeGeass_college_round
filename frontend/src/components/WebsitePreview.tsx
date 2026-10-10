
import { ExternalLink, Globe, Monitor, Smartphone } from 'lucide-react';
import { useState } from 'react';
import '../styles/WebsitePreview.css';

type WebsitePreviewProps = {
  title?: string;
  description?: string;
  buttonText?: string;
  brandName?: string;
  accentColor?: string;
};

function WebsitePreview({
  title = 'Build something extraordinary.',
  description = 'Bring your ideas to life with a beautiful digital experience designed for your audience.',
  buttonText = 'Get Started',
  brandName = 'Your Brand',
  accentColor = '#8065f5',
}: WebsitePreviewProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <section className="website-preview">
      <header className="website-preview-toolbar">
        <div className="website-preview-heading">
          <span className="website-preview-globe">
            <Globe size={17} />
          </span>

          <div>
            <h3>Website Preview</h3>
            <p>Preview your website design</p>
          </div>
        </div>

        <div className="website-preview-controls">
          <button
            type="button"
            className={device === 'desktop' ? 'active' : ''}
            onClick={() => setDevice('desktop')}
            aria-label="Desktop preview"
            aria-pressed={device === 'desktop'}
          >
            <Monitor size={16} />
          </button>

          <button
            type="button"
            className={device === 'mobile' ? 'active' : ''}
            onClick={() => setDevice('mobile')}
            aria-label="Mobile preview"
            aria-pressed={device === 'mobile'}
          >
            <Smartphone size={16} />
          </button>
        </div>
      </header>

      <div className="website-preview-browser">
        <div className="website-preview-browser-bar">
          <div className="website-preview-browser-dots">
            <span />
            <span />
            <span />
          </div>

          <div className="website-preview-address">
            <Globe size={11} />
            <span>your-website.preview</span>
          </div>

          <ExternalLink size={13} />
        </div>

        <div
          className={`website-preview-viewport website-preview-${device}`}
        >
          <div className="website-preview-page">
            <nav className="website-demo-nav">
              <span
                className="website-demo-brand"
                style={{ color: accentColor }}
              >
                {brandName}
              </span>

              <div className="website-demo-links">
                <span>Home</span>
                <span>About</span>
                <span>Contact</span>
              </div>

              <button
                type="button"
                style={{ backgroundColor: accentColor }}
              >
                Let's Talk
              </button>
            </nav>

            <main className="website-demo-hero">
              <span
                className="website-demo-badge"
                style={{
                  color: accentColor,
                  borderColor: `${accentColor}55`,
                  backgroundColor: `${accentColor}12`,
                }}
              >
                <span
                  className="website-demo-badge-dot"
                  style={{ backgroundColor: accentColor }}
                />
                MADE FOR WHAT'S NEXT
              </span>

              <h2>{title}</h2>

              <p>{description}</p>

              <button
                type="button"
                className="website-demo-cta"
                style={{ backgroundColor: accentColor }}
              >
                {buttonText}
              </button>

              <div className="website-demo-decoration">
                <div
                  className="website-demo-decoration-card"
                  style={{ borderColor: `${accentColor}44` }}
                >
                  <div
                    className="website-demo-decoration-icon"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <Globe size={22} color={accentColor} />
                  </div>

                  <span>Thoughtful design</span>
                  <small>Every detail matters.</small>
                </div>

                <div
                  className="website-demo-decoration-card website-demo-decoration-offset"
                  style={{ borderColor: `${accentColor}44` }}
                >
                  <div
                    className="website-demo-decoration-icon"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <Monitor size={22} color={accentColor} />
                  </div>

                  <span>Built to grow</span>
                  <small>Ready for your next idea.</small>
                </div>
              </div>
            </main>

            <footer className="website-demo-footer">
              © {new Date().getFullYear()} {brandName}. All rights reserved.
            </footer>
          </div>
        </div>
      </div>

      <p className="website-preview-note">
        This is a design preview, not a published website.
      </p>
    </section>
  );
}

export default WebsitePreview;
