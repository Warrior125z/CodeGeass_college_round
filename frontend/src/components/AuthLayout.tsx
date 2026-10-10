
import type { ReactNode } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/AuthLayout.css';

type AuthLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;
};

function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkTo,
}: AuthLayoutProps) {
  return (
    <main className="auth-layout">
      <section className="auth-layout-brand-panel">
        <Link to="/" className="auth-layout-brand">
          <span className="auth-layout-brand-icon">
            <Sparkles size={21} />
          </span>
          <span>Nexus<span className="auth-layout-brand-ai">AI</span></span>
        </Link>

        <div className="auth-layout-message">
          <span className="auth-layout-eyebrow">
            YOUR BUSINESS. ONE WORKSPACE.
          </span>

          <h1>
            Turn your ideas into
            <span> real progress.</span>
          </h1>

          <p>
            Bring your website, customers, campaigns, and business
            workflows together with one AI-powered workspace.
          </p>

          <div className="auth-layout-decoration">
            <div className="auth-decoration-orb auth-decoration-orb-one" />
            <div className="auth-decoration-orb auth-decoration-orb-two" />
            <div className="auth-decoration-card">
              <div className="auth-decoration-card-top">
                <span className="auth-decoration-dot" />
                <span>YOUR AI WORKSPACE</span>
              </div>

              <div className="auth-decoration-line auth-decoration-line-long" />
              <div className="auth-decoration-line auth-decoration-line-medium" />

              <div className="auth-decoration-task">
                <span className="auth-decoration-check">✓</span>
                <span>Workflow organized</span>
                <span className="auth-decoration-done">Ready</span>
              </div>
            </div>
          </div>
        </div>

        <p className="auth-layout-copyright">
          © {new Date().getFullYear()} Nexus AI. Built for ambitious ideas.
        </p>
      </section>

      <section className="auth-layout-form-panel">
        <Link to="/" className="auth-layout-back">
          <ArrowLeft size={15} />
          Back to home
        </Link>

        <div className="auth-layout-form-container">
          <div className="auth-layout-form-heading">
            <span className="auth-layout-mobile-brand">
              <Sparkles size={18} />
              Nexus AI
            </span>

            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          {children}

          <p className="auth-layout-footer">
            {footerText}{' '}
            <Link to={footerLinkTo}>{footerLinkText}</Link>
          </p>

          <p className="auth-layout-security-note">
            Your workspace is designed with privacy in mind.
          </p>
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
