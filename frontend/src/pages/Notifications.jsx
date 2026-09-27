/**
 * Notifications page — /notifications
 * Full notification center with fraud alerts, claim updates, system messages
 */
import { useState } from 'react'
import { FiBell, FiFilter } from 'react-icons/fi'
import NotificationPanel from '../components/ai/NotificationPanel'

// ── Mock notifications ───────────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  { id: 'N-001', type: 'fraud_alert',  title: 'Fraud Detected — CLM-2026-042',    message: 'AI model flagged claim CLM-2026-042 with 94% fraud probability. Immediate review required.', read: false, createdAt: new Date(Date.now() - 5 * 60000).toISOString(), link: '/claims/CLM-2026-042' },
  { id: 'N-002', type: 'claim_update', title: 'Claim CLM-2026-039 Approved',       message: 'Claim submitted by Sarah Johnson has been approved and payment initiated.', read: false, createdAt: new Date(Date.now() - 18 * 60000).toISOString(), link: '/claims/CLM-2026-039' },
  { id: 'N-003', type: 'fraud_alert',  title: 'High-Risk Claim Submitted',         message: 'New claim from Mike Chen classified as High Risk. Policy was purchased 7 days before incident.', read: false, createdAt: new Date(Date.now() - 45 * 60000).toISOString(), link: '/claims/CLM-2026-040' },
  { id: 'N-004', type: 'system',       title: 'AI Model Updated to v2.4.2',        message: 'The Random Forest model has been retrained with 2,400 new samples. Accuracy improved to 97.8%.', read: true, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), link: null },
  { id: 'N-005', type: 'claim_update', title: 'Claim CLM-2026-035 Under Review',   message: 'Admin has placed claim CLM-2026-035 under manual review pending additional documentation.', read: true, createdAt: new Date(Date.now() - 4 * 3600000).toISOString(), link: '/claims/CLM-2026-035' },
  { id: 'N-006', type: 'info',         title: 'Monthly Report Ready',              message: 'The July 2026 fraud detection report has been generated and is ready for download.', read: true, createdAt: new Date(Date.now() - 6 * 3600000).toISOString(), link: '/reports' },
  { id: 'N-007', type: 'fraud_alert',  title: 'Fraud Detected — CLM-2026-031',    message: 'Claim CLM-2026-031 flagged with 87% fraud probability. Hospital appears in prior fraud cases.', read: true, createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), link: '/claims/CLM-2026-031' },
  { id: 'N-008', type: 'claim_update', title: '3 New Claims Submitted Today',      message: 'Three new insurance claims were submitted and are awaiting initial AI screening.', read: true, createdAt: new Date(Date.now() - 26 * 3600000).toISOString(), link: '/claims' },
]

const TYPE_FILTERS = ['All', 'Fraud Alerts', 'Claim Updates', 'System', 'Info']
const TYPE_MAP = {
  'Fraud Alerts':  'fraud_alert',
  'Claim Updates': 'claim_update',
  'System':        'system',
  'Info':          'info',
}

export default function Notifications() {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('hg_notifications')
      return saved ? JSON.parse(saved) : MOCK_NOTIFICATIONS
    } catch {
      return MOCK_NOTIFICATIONS
    }
  })
  const [activeFilter,  setActiveFilter]  = useState('All')

  function save(newList) {
    setNotifications(newList)
    try {
      localStorage.setItem('hg_notifications', JSON.stringify(newList))
    } catch {}
  }

  function markRead(id) {
    save(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  function markAllRead() {
    save(notifications.map(n => ({ ...n, read: true })))
  }

  function dismiss(id) {
    save(notifications.filter(n => n.id !== id))
  }

  const filtered = activeFilter === 'All'
    ? notifications
    : notifications.filter(n => n.type === TYPE_MAP[activeFilter])

  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🔔 Notifications
            {unread > 0 && (
              <span style={{ background: '#EF5350', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                {unread} new
              </span>
            )}
          </h1>
          <p>Stay updated on fraud alerts, claim changes, and system events</p>
        </div>
        {unread > 0 && (
          <button className="btn-hg btn-outline-hg" onClick={markAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {TYPE_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`btn-hg btn-sm-hg ${activeFilter === f ? 'btn-primary-hg' : 'btn-secondary-hg'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <NotificationPanel
        notifications={filtered}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        onDismiss={dismiss}
      />
    </div>
  )
}
