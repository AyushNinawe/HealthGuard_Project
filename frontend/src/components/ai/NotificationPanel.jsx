/**
 * NotificationPanel — list of notifications with read/unread state
 */
import { FiAlertTriangle, FiFileText, FiSettings, FiInfo, FiX, FiCheck } from 'react-icons/fi'

const TYPE_ICON = {
  fraud_alert:  { icon: FiAlertTriangle, color: '#C62828' },
  claim_update: { icon: FiFileText,      color: '#1565C0' },
  system:       { icon: FiSettings,      color: '#6B7280' },
  info:         { icon: FiInfo,          color: '#0277BD' },
}

function relativeTime(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function NotificationPanel({ notifications = [], onMarkRead, onMarkAllRead, onDismiss }) {
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="data-card" style={{ padding: 0 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h6 style={{ margin: 0, fontWeight: 700 }}>Notifications</h6>
          {unreadCount > 0 && (
            <span style={{
              background: '#EF5350', color: '#fff', fontSize: '0.7rem', fontWeight: 700,
              padding: '1px 7px', borderRadius: 'var(--radius-full)',
            }}>{unreadCount}</span>
          )}
        </div>
        {onMarkAllRead && (
          <button onClick={onMarkAllRead} className="btn-hg btn-outline-hg btn-sm-hg">
            <FiCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
          <FiInfo size={36} style={{ opacity: 0.3 }} />
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>No notifications</p>
        </div>
      ) : (
        <div style={{ maxHeight: 420, overflowY: 'auto' }}>
          {notifications.map(n => {
            const cfg  = TYPE_ICON[n.type] || TYPE_ICON.info
            const Icon = cfg.icon
            return (
              <div key={n.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                padding: '0.875rem 1.25rem',
                background: n.read ? 'transparent' : 'var(--primary-bg)',
                borderBottom: '1px solid var(--border-light)',
                transition: 'background 0.2s',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-md)', flexShrink: 0,
                  background: cfg.color + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} color={cfg.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.15rem' }}>{n.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    {n.message?.slice(0, 80)}{n.message?.length > 80 ? '…' : ''}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{relativeTime(n.createdAt)}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                  {!n.read && onMarkRead && (
                    <button onClick={() => onMarkRead(n.id)} title="Mark read" style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--primary)', padding: '2px',
                    }}><FiCheck size={14} /></button>
                  )}
                  {onDismiss && (
                    <button onClick={() => onDismiss(n.id)} title="Dismiss" style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', padding: '2px',
                    }}><FiX size={14} /></button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
