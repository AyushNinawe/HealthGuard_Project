/**
 * RecommendationPanel — AI recommendation action card
 */
import { FiCheckCircle, FiSearch, FiAlertTriangle, FiXCircle } from 'react-icons/fi'
import { RECOMMENDATION_CONFIG } from '../../utils/aiMockData'

const ICONS = {
  approve:     FiCheckCircle,
  investigate: FiSearch,
  high_risk:   FiAlertTriangle,
  reject:      FiXCircle,
}

export default function RecommendationPanel({ recommendation = 'investigate', recommendedAction }) {
  const cfg  = RECOMMENDATION_CONFIG[recommendation] || RECOMMENDATION_CONFIG.investigate
  const Icon = ICONS[recommendation] || FiAlertTriangle

  const DESC = {
    approve:     'The AI model has determined this claim meets all standard criteria and can be processed automatically.',
    investigate: 'Several risk factors were detected. A human reviewer should examine this claim before proceeding.',
    high_risk:   'Multiple high-risk indicators detected. This claim requires senior review before any action.',
    reject:      'Strong indicators of fraudulent activity detected. This claim should be rejected pending investigation.',
  }

  return (
    <div style={{
      border: `1.5px solid ${cfg.border}`,
      background: cfg.bg,
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 'var(--radius-md)',
          background: cfg.color + '20',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={20} color={cfg.color} />
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: cfg.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            AI Recommendation
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: cfg.color }}>
            {recommendedAction || cfg.label}
          </div>
        </div>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
        {DESC[recommendation] || DESC.investigate}
      </p>
    </div>
  )
}
