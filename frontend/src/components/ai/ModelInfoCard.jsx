/**
 * ModelInfoCard — AI model metadata display
 * Props: modelInfo (ModelInfo object)
 */
import { FiCpu, FiDatabase, FiCalendar, FiActivity } from 'react-icons/fi'
import { formatDate } from '../../utils/formatters'

export default function ModelInfoCard({ modelInfo }) {
  if (!modelInfo) return null

  const metrics = [
    { label: 'Accuracy',  value: modelInfo.trainingAccuracy },
    { label: 'Precision', value: modelInfo.precision },
    { label: 'Recall',    value: modelInfo.recall },
    { label: 'F1 Score',  value: modelInfo.f1Score },
    { label: 'ROC-AUC',   value: modelInfo.rocAuc },
  ]

  const statusColor = {
    Active:   { color: '#2E7D32', bg: '#E8F5E9' },
    Training: { color: '#E65100', bg: '#FFF3E0' },
    Inactive: { color: '#6B7280', bg: '#F3F4F6' },
  }[modelInfo.status] || { color: '#6B7280', bg: '#F3F4F6' }

  return (
    <div className="data-card" style={{ height: '100%' }}>
      <h6 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiCpu size={17} color="var(--primary)" /> AI Model Information
      </h6>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Left: identity */}
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {modelInfo.currentModel}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            {modelInfo.modelVersion}
          </div>
          <span style={{
            padding: '3px 10px', borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem', fontWeight: 700,
            background: statusColor.bg, color: statusColor.color,
          }}>
            ● {modelInfo.status}
          </span>
        </div>

        {/* Right: performance metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {metrics.map(m => (
            <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{m.label}</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                {m.value != null ? `${(m.value * 100).toFixed(1)}%` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer stats */}
      <div style={{
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
        padding: '0.75rem', background: 'var(--border-light)',
        borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--text-muted)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <FiDatabase size={13} /> {modelInfo.datasetSize?.toLocaleString()} samples
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <FiActivity size={13} /> {modelInfo.features} features
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <FiCalendar size={13} /> Trained {formatDate(modelInfo.lastTrained)}
        </span>
      </div>
    </div>
  )
}
