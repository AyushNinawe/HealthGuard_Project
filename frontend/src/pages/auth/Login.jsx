import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiShield, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import Alert from '../../components/common/Alert'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm]     = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [showPass, setShowPass] = useState(false)

  function validate() {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true); setApiError('')
    try {
      await login(form)
      navigate(from, { replace: true })
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon"><FiShield /></div>
          <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>
            Health<span style={{ color: '#1565C0' }}>Guard</span>
          </span>
        </div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {apiError && <Alert type="error" message={apiError} onDismiss={() => setApiError('')} />}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label-hg">Email address</label>
            <div style={{ position: 'relative' }}>
              <FiMail size={16} style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)', color: '#9CA3AF',
              }} />
              <input
                type="email"
                className={`form-control-hg${errors.email ? ' is-invalid' : ''}`}
                style={{ paddingLeft: '2.25rem' }}
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
              <label className="form-label-hg" style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: '#1565C0' }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <FiLock size={16} style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)', color: '#9CA3AF',
              }} />
              <input
                type={showPass ? 'text' : 'password'}
                className={`form-control-hg${errors.password ? ' is-invalid' : ''}`}
                style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{
                position: 'absolute', right: 12, top: '50%',
                transform: 'translateY(-50%)', background: 'none', border: 'none',
                cursor: 'pointer', color: '#9CA3AF', display: 'flex',
              }}>
                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          <button type="submit" className="btn-hg btn-primary-hg btn-lg-hg"
            style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#1565C0', fontWeight: 600 }}>Create one</Link>
        </p>

        {/* Demo hint */}
        <div style={{
          marginTop: '1.25rem', padding: '0.75rem', background: '#E3F2FD',
          borderRadius: '0.625rem', fontSize: '0.8rem', color: '#1565C0',
          textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem',
        }}>
          <span style={{ fontWeight: 600 }}>Quick Demo Accounts (Click to Fill):</span>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => setForm({ email: 'admin@healthguard.com', password: 'admin123' })}
              style={{
                background: '#1565C0', color: '#fff', border: 'none',
                borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem',
                cursor: 'pointer', fontWeight: 600
              }}
            >
              Fill Admin
            </button>
            <button
              type="button"
              onClick={() => setForm({ email: 'user@healthguard.com', password: 'user123' })}
              style={{
                background: '#1E88E5', color: '#fff', border: 'none',
                borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem',
                cursor: 'pointer', fontWeight: 600
              }}
            >
              Fill User
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
