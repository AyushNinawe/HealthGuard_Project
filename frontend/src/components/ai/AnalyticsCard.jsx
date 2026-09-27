/**
 * AnalyticsCard — reusable metric card for analytics pages
 * Props: label, value, icon, color, bg, trend (optional %), format
 */
import { formatCurrency } from '../../utils/formatters'

function formatValue(value, format) {
  if (value == null) return '—'
  switch (format) {
    case 'percent':  return `${(Number(value) * 100).toFixed(1)}%`
    case 'currency': return formatCurrency(value)
    case 'time':     return `${Number(value).toFixed(1)}s`
    default:         return Number(value).toLocaleString()
  }
}

export default function AnalyticsCard({ label, value, icon: Icon, color, bg, trend = null, format = 'number' }) {
  return (
    <div className="metric-card">
      <div className="metric-icon" style={{ background: bg, color }}>
        {Icon && <Icon size={22} />}
      </div>
      <div className="metric-body">
        <div className="metric-value" style={{ color }}>{formatValue(value, format)}</div>
        <div className="metric-label">{label}</div>
        {trend !== null && trend !== undefined && (
          <div style={{
            fontSize: '0.75rem', fontWeight: 600, marginTop: '0.2rem',
            color: trend > 0 ? '#2E7D32' : trend < 0 ? '#C62828' : '#6B7280',
          }}>
            {trend > 0 ? '▲' : trend < 0 ? '▼' : '—'} {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  )
}
