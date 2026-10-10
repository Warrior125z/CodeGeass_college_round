
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BrainCircuit,
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react';
import '../styles/Signup.css';
import { createLocalAccount } from '../services/auth';

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    createLocalAccount({
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      password,
    });

    setSuccess('Account created locally. Opening your workspace...');
    navigate('/app');
  }

  return (
    <main className="signup-page">
      <div className="signup-glow signup-glow-one" />
      <div className="signup-glow signup-glow-two" />

      <Link to="/" className="signup-brand">
        <span className="signup-brand-icon">
          <BrainCircuit size={23} />
        </span>
        <span>
          NEXUS<span className="signup-brand-highlight">AI</span>
        </span>
      </Link>

      <section className="signup-card">
        <div className="signup-heading">
          <span className="signup-heading-icon">
            <UserRound size={22} />
          </span>

          <h1>Create your account</h1>
          <p>Start building with your AI-powered business workspace.</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <label htmlFor="signup-name">Full name</label>

          <div className="signup-input-wrapper">
            <UserRound size={18} />
            <input
              id="signup-name"
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <label htmlFor="signup-company">Company or institution</label>

          <div className="signup-input-wrapper">
            <Building2 size={18} />
            <input
              id="signup-company"
              type="text"
              placeholder="Your company name"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              autoComplete="organization"
              required
            />
          </div>

          <label htmlFor="signup-email">Email address</label>

          <div className="signup-input-wrapper">
            <Mail size={18} />
            <input
              id="signup-email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <label htmlFor="signup-password">Password</label>

          <div className="signup-input-wrapper">
            <LockKeyhole size={18} />
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />

            <button
              type="button"
              className="signup-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <label htmlFor="signup-confirm-password">Confirm password</label>

          <div className="signup-input-wrapper">
            <LockKeyhole size={18} />
            <input
              id="signup-confirm-password"
              type="password"
              placeholder="Enter your password again"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {error && <p className="signup-message signup-error">{error}</p>}

          {success && (
            <p className="signup-message signup-success">{success}</p>
          )}

          <button className="signup-submit-button" type="submit">
            Create account <ArrowRight size={18} />
          </button>
        </form>

        <p className="signup-login-prompt">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>

      <p className="signup-footer">
        Your workspace starts with one idea.
      </p>
    </main>
  );
}

export default Signup;
