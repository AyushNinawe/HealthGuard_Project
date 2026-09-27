import { Link } from 'react-router-dom'
import { FiAlertCircle, FiHome } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #E3F2FD 0%, #fff 100%)',
      padding: '2rem', textAlign: 'center',
    }}>
      <FiAlertCircle size={64} color="#1565C0" style={{ marginBottom: '1.5rem', opacity: 0.6 }} />
      <h1 style={{ fontSize: '4rem', fontWeight: 900, color: '#1565C0', lineHeight: 1 }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A1A2E', margin: '0.75rem 0' }}>
        Page Not Found
      </h2>
      <p style={{ color: '#6B7280', maxWidth: 420, marginBottom: '2rem' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/dashboard" className="btn-hg btn-primary-hg btn-lg-hg">
        <FiHome size={16} /> Go to Dashboard
      </Link>
    </div>
  )
}
