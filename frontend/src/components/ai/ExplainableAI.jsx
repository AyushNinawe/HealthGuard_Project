/**
 * ExplainableAI — displays AI reasons/explanation
 * Props: reasons (string[]), title (string)
 */
import { FiAlertCircle } from 'react-icons/fi'

export default function ExplainableAI({ reasons = [], title = 'Why this prediction?' }) {
  if (!reasons || reasons.length === 0) {
    return (
      <div className="data-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        <FiAlertCircle size={32} style={{ opacity: 0.4 }} />
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>No explanation available</p>
      </div>
    )
  }

  return (
    <div className="data-card">
      <h6 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiAlertCircle size={17} color="var(--warning)" /> {title}
      </h6>
      <ol style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {reasons.map((reason, i) => (
          <li key={i} style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
            <span style={{
              display: 'inline-block', background: 'var(--danger-bg)',
              color: 'var(--danger)', borderRadius: 'var(--radius-sm)',
              padding: '0.1rem 0.4rem', fontSize: '0.75rem', fontWeight: 600,
              marginRight: '0.5rem', verticalAlign: 'middle',
            }}>!</span>
            {reason}
          </li>
        ))}
      </ol>
    </div>
  )
}
