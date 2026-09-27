import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiShield, FiMail, FiArrowLeft } from 'react-icons/fi'
import { authService } from '../../services/api'
import Alert from '../../components/common/Alert'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function ForgotPassword() {
  const [email, setEmail]       = useState('')
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) { setError('Email is required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email'); return }
    setLoading(true); setError(''); setSuccess('')
    try {
      await authService.forgotPassword({ email })
      setSuccess('Password reset link sent! Check your inbox.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email.')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><FiShield /></div>
          <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>
            Health<span style={{ color: '#1565C0' }}>Guard</span>
          </span>
        </div>
        <h2 className="auth-title">Forgot password?</h2>
        <p className="auth-subtitle">Enter your email and we'll send you a reset link</p>

        {error   && <Alert type="error"   message={error}   onDismiss={() => setError('')} />}
        {success && <Alert type="success" message={success} />}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label-hg">Email address</label>
              <div style={{ position: 'relative' }}>
                <FiMail size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input type="email" className="form-control-hg"
                  style={{ paddingLeft: '2.2rem' }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn-hg btn-primary-hg btn-lg-hg"
              style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : 'Send Reset Link'}
            </button>
          </form>
        )}

        <Link to="/login" style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center',
          marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)',
          textDecoration: 'none',
        }}>
          <FiArrowLeft size={14} /> Back to login
        </Link>
      </div>
    </div>
  )
}
