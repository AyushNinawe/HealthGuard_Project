import { useState, useEffect } from 'react'
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi'

const CONFIG = {
  success: { icon: FiCheckCircle, bg: '#E8F5E9', color: '#2E7D32', border: '#A5D6A7' },
  error:   { icon: FiAlertCircle, bg: '#FFEBEE', color: '#C62828', border: '#EF9A9A' },
  warning: { icon: FiAlertTriangle, bg: '#FFF8E1', color: '#E65100', border: '#FFE082' },
  info:    { icon: FiInfo,         bg: '#E3F2FD', color: '#1565C0', border: '#90CAF9' },
}

export default function Alert({ type = 'info', message, onDismiss, autoClose = 0 }) {
  const [visible, setVisible] = useState(true)
  const cfg = CONFIG[type] || CONFIG.info
  const Icon = cfg.icon

  useEffect(() => {
    if (autoClose > 0) {
      const t = setTimeout(() => { setVisible(false); onDismiss?.() }, autoClose)
      return () => clearTimeout(t)
    }
  }, [autoClose, onDismiss])

  if (!visible) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: '0.625rem', padding: '0.875rem 1rem',
      marginBottom: '1rem', animation: 'fadeInUp 0.3s ease',
    }}>
      <Icon size={18} color={cfg.color} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
      <span style={{ flex: 1, fontSize: '0.875rem', color: cfg.color }}>{message}</span>
      {onDismiss && (
        <button onClick={() => { setVisible(false); onDismiss() }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: cfg.color, padding: 0 }}>
          <FiX size={16} />
        </button>
      )}
    </div>
  )
}
