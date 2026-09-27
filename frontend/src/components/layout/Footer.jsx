export default function Footer() {
  return (
    <footer style={{
      padding: '1rem 1.75rem',
      borderTop: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontSize: '0.75rem', color: 'var(--text-muted)',
      background: 'var(--white)',
      flexWrap: 'wrap', gap: '0.5rem',
    }}>
      <span>© 2026 HealthGuard. All rights reserved.</span>
      <span>Healthcare Insurance Fraud Detection System v1.0</span>
    </footer>
  )
}
