/**
 * RiskMeter — colored progress bar showing fraud probability
 * Props: value (0–1), size ("sm"|"md"|"lg")
 */
import { computeRiskLevel } from '../../utils/formatters'

const SIZE_CFG = {
  sm: { height: 8,  fontSize: '0.75rem' },
  md: { height: 12, fontSize: '0.85rem' },
  lg: { height: 18, fontSize: '1rem'    },
}

function getColor(value) {
  if (value <= 0.25) return '#4CAF50'
  if (value <= 0.50) return '#FF9800'
  if (value <= 0.75) return '#BF360C'
  return '#B71C1C'
}

export default function RiskMeter({ value = 0, size = 'md' }) {
  const cfg    = SIZE_CFG[size] || SIZE_CFG.md
  const pct    = Math.round(value * 100)
  const color  = getColor(value)
  const label  = computeRiskLevel(value)

  return (
    <div style={{ width: '100%' }}>
      {/* Labels row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', alignItems: 'center' }}>
        <span style={{ fontSize: cfg.fontSize, fontWeight: 700, color }}>
          {label}
        </span>
        <span style={{ fontSize: cfg.fontSize, fontWeight: 800, color }}>
          {pct}%
        </span>
      </div>

      {/* Track */}
      <div style={{
        width: '100%', height: cfg.height, background: 'var(--border)',
        borderRadius: 'var(--radius-full)', overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: color,
          borderRadius: 'var(--radius-full)',
          transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>

      {/* Zone labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
        {['Low', 'Medium', 'High', 'Critical'].map(z => (
          <span key={z} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>{z}</span>
        ))}
      </div>
    </div>
  )
}
