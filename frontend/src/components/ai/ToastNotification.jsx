/**
 * ToastNotification — fixed bottom-right toast stack
 * Rendered by ToastProvider; do not use directly.
 */
import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi'

const TYPE_CFG = {
  success: { bg: '#2E7D32', icon: FiCheckCircle },
  error:   { bg: '#C62828', icon: FiAlertCircle },
  warning: { bg: '#E65100', icon: FiAlertTriangle },
  info:    { bg: '#1565C0', icon: FiInfo },
}

export default function ToastNotification({ toasts = [], onDismiss }) {
  if (!toasts.length) return null

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem',
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.625rem',
      pointerEvents: 'none',
    }}>
      {toasts.map(t => {
        const cfg = TYPE_CFG[t.type] || TYPE_CFG.info
        const Icon = cfg.icon
        return (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: cfg.bg, color: '#fff',
            borderRadius: '0.75rem', padding: '0.75rem 1rem',
            minWidth: 280, maxWidth: 380,
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            animation: 'fadeInUp 0.25s ease',
            pointerEvents: 'all',
          }}>
            <Icon size={18} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{t.message}</span>
            <button onClick={() => onDismiss(t.id)} style={{
              background: 'rgba(255,255,255,0.2)', border: 'none',
              borderRadius: '50%', width: 24, height: 24,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff', flexShrink: 0,
            }}>
              <FiX size={13} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
