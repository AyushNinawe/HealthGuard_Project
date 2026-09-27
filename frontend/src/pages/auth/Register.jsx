import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiShield, FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/api'
import Alert from '../../components/common/Alert'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function Register() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [form, setForm]     = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [showPass, setShowPass] = useState(false)

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.phone) e.phone = 'Phone is required'
    else if (!/^\+?[\d\s\-()]{10,15}$/.test(form.phone)) e.phone = 'Enter a valid phone number'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'At least 6 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true); setApiError('')
    try {
      const data = await authService.register({
        name: form.name, email: form.email, phone: form.phone, password: form.password,
      })
      localStorage.setItem('jwt_token', data.token)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ name, label, type = 'text', icon: Icon, placeholder }) => (
    <div style={{ marginBottom: '0.875rem' }}>
      <label className="form-label-hg">{label}</label>
      <div style={{ position: 'relative' }}>
        <Icon size={15} style={{
          position: 'absolute', left: 11, top: '50%',
          transform: 'translateY(-50%)', color: '#9CA3AF',
        }} />
        <input type={type} className={`form-control-hg${errors[name] ? ' is-invalid' : ''}`}
          style={{ paddingLeft: '2.2rem' }}
          placeholder={placeholder}
          value={form[name]}
          onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        />
      </div>
      {errors[name] && <div className="form-error">{errors[name]}</div>}
    </div>
  )

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><FiShield /></div>
          <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>
            Health<span style={{ color: '#1565C0' }}>Guard</span>
          </span>
        </div>
        <h2 className="auth-title">Create account</h2>
        <p className="auth-subtitle">Start detecting insurance fraud today</p>

        {apiError && <Alert type="error" message={apiError} onDismiss={() => setApiError('')} />}

        <form onSubmit={handleSubmit} noValidate>
          <Field name="name"  label="Full Name"  icon={FiUser}  placeholder="John Doe" />
          <Field name="email" label="Email"       icon={FiMail}  type="email" placeholder="you@example.com" />
          <Field name="phone" label="Phone"       icon={FiPhone} placeholder="+1 234 567 8900" />

          {/* Password with show/hide */}
          <div style={{ marginBottom: '0.875rem' }}>
            <label className="form-label-hg">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input type={showPass ? 'text' : 'password'}
                className={`form-control-hg${errors.password ? ' is-invalid' : ''}`}
                style={{ paddingLeft: '2.2rem', paddingRight: '2.5rem' }}
                placeholder="Min 6 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{
                position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex',
              }}>
                {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label-hg">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input type="password"
                className={`form-control-hg${errors.confirm ? ' is-invalid' : ''}`}
                style={{ paddingLeft: '2.2rem' }}
                placeholder="••••••••"
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              />
            </div>
            {errors.confirm && <div className="form-error">{errors.confirm}</div>}
          </div>

          <button type="submit" className="btn-hg btn-primary-hg btn-lg-hg"
            style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1565C0', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
