/**
 * AIPredictionCard — verdict banner + key prediction metrics
 */
import { FiCpu, FiShield, FiClock } from 'react-icons/fi'
import { formatDateTime } from '../../utils/formatters'
import { computeRiskLevel, riskLevelClass } from '../../utils/formatters'

export default function AIPredictionCard({
  prediction, fraudProbability, confidenceScore,
  riskLevel, modelName, modelVersion, timestamp,
}) {
  const isFraud   = prediction === 'Fraud'
  const riskLabel = riskLevel || computeRiskLevel(fraudProbability || 0)

  return (
    <div>
      {/* Verdict banner */}
      <div className={`verdict-banner ${isFraud ? 'verdict-fraud' : 'verdict-genuine'}`}>
        <div className="verdict-title">{prediction?.toUpperCase() ?? 'UNKNOWN'}</div>
        <div className="verdict-subtitle">
          {isFraud ? '⚠️ This claim has been flagged as potentially fraudulent' : '✅ This claim appears genuine based on AI analysis'}
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '0.5rem' }}>
        {/* Fraud probability */}
        <div className="data-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: isFraud ? '#C62828' : '#2E7D32' }}>
            {fraudProbability != null ? `${Math.round(fraudProbability * 100)}%` : '—'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Fraud Prob.
          </div>
        </div>
        {/* Confidence score */}
        <div className="data-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' }}>
            {confidenceScore != null ? `${Math.round(confidenceScore * 100)}%` : '—'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Confidence
          </div>
        </div>
        {/* Risk level */}
        <div className="data-card" style={{ padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <span className={riskLevelClass(riskLabel)} style={{ fontSize: '0.8rem' }}>{riskLabel}</span>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Risk Level
          </div>
        </div>
      </div>

      {/* Model info footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--border-light)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <FiCpu size={13} /> {modelName || 'AI Model'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <FiShield size={13} /> {modelVersion || 'v1.0'}
        </span>
        {timestamp && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <FiClock size={13} /> {formatDateTime(timestamp)}
          </span>
        )}
      </div>
    </div>
  )
}
