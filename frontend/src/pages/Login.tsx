
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Activity, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import './Login.css'

function Login() {
  const { user, login, loading } = useAuth()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/dashboard'

  if (loading) {
    return <div className="login-loading">Checking secure session...</div>
  }

  if (user) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(username.trim(), password)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to sign in. Try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-brand">
          <div className="login-brand-icon"><ShieldCheck size={25} /></div>
          <div>
            <strong>CyberSentinel</strong>
            <span>SECURITY OPERATIONS PLATFORM</span>
          </div>
        </div>

        <div className="login-hero">
          <div className="login-eyebrow">
            <Activity size={15} /> SECURITY OPERATIONS CENTER
          </div>
          <h1>See threats.<br />Secure what matters.</h1>
          <p>
            A unified command environment for security monitoring,
            investigation, and response.
          </p>
          <div className="login-status">
            <span className="login-status-dot" />
            AUTHENTICATED ACCESS REQUIRED
          </div>
        </div>

        <div className="login-visual-footer">
          <span>CYBERSENTINEL</span>
          <span>SECURITY • VISIBILITY • CONTROL</span>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <div className="login-mobile-brand">
            <ShieldCheck size={24} /> CyberSentinel
          </div>

          <div className="login-heading">
            <span className="login-overline">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Enter your credentials to access the security console.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="login-username">Username or email</label>
            <input
              id="login-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter your username or email"
              required
              maxLength={254}
            />

            <div className="login-password-label">
              <label htmlFor="login-password">Password</label>
            </div>
            <div className="login-password-wrap">
              <LockKeyhole size={17} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                maxLength={128}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div className="login-error" role="alert">{error}</div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={submitting || !username.trim() || !password}
            >
              {submitting ? 'Authenticating...' : 'Sign in securely'}
            </button>
          </form>

          <div className="login-security-note">
            <ShieldCheck size={17} />
            <span>Your session is verified by the CyberSentinel authentication service.</span>
          </div>

          <footer className="login-copyright">
            © {new Date().getFullYear()} CyberSentinel
          </footer>
        </div>
      </section>
    </main>
  )
}

export default Login
