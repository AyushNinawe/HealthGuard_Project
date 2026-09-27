/** Full-page or inline loading spinner */
export default function LoadingSpinner({ size = 'md', fullPage = false, text = '' }) {
  const sizes = { sm: 20, md: 36, lg: 56 }
  const px = sizes[size] || 36

  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <svg width={px} height={px} viewBox="0 0 50 50" style={{ animation: 'spin 0.8s linear infinite' }}>
        <circle cx="25" cy="25" r="20" fill="none" stroke="#E3F2FD" strokeWidth="5" />
        <circle cx="25" cy="25" r="20" fill="none" stroke="#1565C0" strokeWidth="5"
          strokeDasharray="80 40" strokeLinecap="round" />
      </svg>
      {text && <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>{text}</span>}
    </div>
  )

  if (fullPage) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
      }}>
        {spinner}
      </div>
    )
  }
  return spinner
}
