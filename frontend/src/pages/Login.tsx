
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    // Backend authentication will be connected here.
    setError('Login API is not connected yet.');
  }

  return (
    <main className="login-page">
      <div className="login-background-glow login-glow-one" />
      <div className="login-background-glow login-glow-two" />

      <Link to="/" className="login-brand">
        <span className="login-brand-icon">
          <BrainCircuit size={23} />
        </span>
        <span>NEXUS<span className="login-brand-highlight">AI</span></span>
      </Link>

      <section className="login-card">
        <div className="login-card-heading">
          <span className="login-heading-icon">
            <LockKeyhole size={22} />
          </span>

          <h1>Welcome back</h1>
          <p>Sign in to continue to your workspace.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email address</label>

          <div className="login-input-wrapper">
            <Mail size={18} />
            <input
              id="login-email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="login-password-label">
            <label htmlFor="login-password">Password</label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <div className="login-input-wrapper">
            <LockKeyhole size={18} />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            <button
              className="login-password-toggle"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="login-submit-button" type="submit">
            Sign in <ArrowRight size={18} />
          </button>
        </form>

        <div className="login-divider">
          <span>YOUR BUSINESS WORKSPACE</span>
        </div>

        <p className="login-signup-prompt">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </section>

      <p className="login-footer">
        Built for people who want to turn ideas into action.
      </p>
    </main>
  );
}

export default Login;
