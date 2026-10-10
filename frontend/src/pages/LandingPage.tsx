
import { ArrowRight, BrainCircuit, Globe, Users, CalendarDays, ChartNoAxesCombined, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const features = [
  {
    icon: Globe,
    title: 'AI Website Builder',
    description: 'Create professional business websites using simple prompts.',
    number: '01',
  },
  {
    icon: Users,
    title: 'Smart CRM',
    description: 'Manage leads and customer information in one workspace.',
    number: '02',
  },
  {
    icon: CalendarDays,
    title: 'Webinar Manager',
    description: 'Create webinars and organize registrations effortlessly.',
    number: '03',
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Business Analytics',
    description: 'Understand your business using meaningful insights.',
    number: '04',
  },
];

function LandingPage() {
  return (
    <main className="landing-page">
      <nav className="landing-navbar">
        <Link to="/" className="landing-brand">
          <span className="landing-brand-icon">
            <BrainCircuit size={23} />
          </span>
          <span>NEXUS<span className="landing-brand-highlight">AI</span></span>
        </Link>

        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
        </div>

        <div className="landing-nav-actions">
          <Link to="/login" className="landing-login-link">
            Log in
          </Link>
          <Link to="/signup" className="landing-nav-cta">
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-glow landing-glow-one" />
        <div className="landing-glow landing-glow-two" />

        <div className="landing-hero-content">
          <div className="landing-eyebrow">
            <span className="landing-status-dot" />
            YOUR BUSINESS, REIMAGINED WITH AI
          </div>

          <h1>
            Turn your ideas into
            <span className="landing-gradient-text"> real business actions.</span>
          </h1>

          <p className="landing-hero-description">
            Meet your AI-powered business workspace. Build websites, manage
            customers, organize webinars, and understand your business —
            all from one place.
          </p>

          <div className="landing-hero-actions">
            <Link to="/signup" className="landing-primary-button">
              Start building <ArrowRight size={18} />
            </Link>

            <a href="#how-it-works" className="landing-secondary-button">
              Explore Nexus <span>↓</span>
            </a>
          </div>

          <div className="landing-trust-note">
            <span className="landing-trust-icon">
              <Zap size={15} />
            </span>
            From a simple prompt to a real business workflow.
          </div>
        </div>

        <div className="landing-preview">
          <div className="landing-preview-window">
            <div className="landing-preview-topbar">
              <div className="landing-window-dots">
                <span />
                <span />
                <span />
              </div>
              <span className="landing-preview-label">Nexus AI Workspace</span>
              <span className="landing-live-indicator">Workspace preview</span>
            </div>

            <div className="landing-preview-body">
              <div className="landing-preview-sidebar">
                <div className="landing-mini-brand">
                  <BrainCircuit size={18} />
                </div>
                <div className="landing-mini-item landing-mini-active">⌂</div>
                <div className="landing-mini-item">◇</div>
                <div className="landing-mini-item">♧</div>
                <div className="landing-mini-item">▦</div>
              </div>

              <div className="landing-preview-main">
                <span className="landing-preview-kicker">YOUR WORKSPACE</span>
                <h3>Good ideas start here.</h3>
                <p>What would you like to build today?</p>

                <div className="landing-prompt-box">
                  <span>Create a website for my coding institute...</span>
                  <span className="landing-prompt-send">
                    <ArrowRight size={15} />
                  </span>
                </div>

                <div className="landing-preview-cards">
                  <div className="landing-mini-card">
                    <Globe size={18} />
                    <strong>Websites</strong>
                    <span>Build your presence</span>
                  </div>

                  <div className="landing-mini-card">
                    <Users size={18} />
                    <strong>Customer CRM</strong>
                    <span>Grow relationships</span>
                  </div>

                  <div className="landing-mini-card">
                    <ChartNoAxesCombined size={18} />
                    <strong>Analytics</strong>
                    <span>Track your progress</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="landing-floating-note">
            <span className="landing-floating-check">✓</span>
            <div>
              <strong>One connected workspace</strong>
              <span>Your tools, working together</span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features" id="features">
        <div className="landing-section-heading">
          <span className="landing-section-kicker">BUILT FOR BUILDERS</span>
          <h2>Everything your business needs.</h2>
          <p>Less switching between tools. More time getting things done.</p>
        </div>

        <div className="landing-feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article className="landing-feature-card" key={feature.number}>
                <div className="landing-feature-card-top">
                  <span className="landing-feature-icon">
                    <Icon size={22} />
                  </span>
                  <span className="landing-feature-number">
                    {feature.number}
                  </span>
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="landing-feature-arrow">
                  <ArrowRight size={18} />
                </span>
              </article>
            );
          })}
        </div>
      </section>

      <section className="landing-how" id="how-it-works">
        <span className="landing-section-kicker">SIMPLE BY DESIGN</span>
        <h2>Describe it. Build it. Use it.</h2>

        <div className="landing-steps">
          <div className="landing-step">
            <span>01</span>
            <h3>Describe</h3>
            <p>Tell Nexus what your business needs in plain English.</p>
          </div>

          <div className="landing-step">
            <span>02</span>
            <h3>Review</h3>
            <p>Review the proposed changes before important actions run.</p>
          </div>

          <div className="landing-step">
            <span>03</span>
            <h3>Launch</h3>
            <p>Turn approved plans into real, connected business resources.</p>
          </div>
        </div>

        <Link to="/signup" className="landing-primary-button landing-bottom-cta">
          Create your workspace <ArrowRight size={18} />
        </Link>
      </section>

      <footer className="landing-footer">
        <Link to="/" className="landing-brand">
          <span className="landing-brand-icon">
            <BrainCircuit size={19} />
          </span>
          <span>NEXUS<span className="landing-brand-highlight">AI</span></span>
        </Link>

        <span>One workspace. More possibilities.</span>
      </footer>
    </main>
  );
}

export default LandingPage;
