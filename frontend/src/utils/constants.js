export const CLAIM_STATUSES = ['Pending', 'Approved', 'Rejected', 'Under Review']
export const CLAIM_TYPES    = ['Medical', 'Vehicle', 'Life', 'Property']
export const GENDERS        = ['Male', 'Female', 'Other']
export const LANGUAGES      = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
]
export const ITEMS_PER_PAGE = 10

// ── AI Module additions ──────────────────────────────────────────
export const RISK_LEVELS = ['Low', 'Medium', 'High', 'Critical']

export const RISK_COLORS = {
  Low:      { color: '#2E7D32', bg: '#E8F5E9' },
  Medium:   { color: '#E65100', bg: '#FFF3E0' },
  High:     { color: '#BF360C', bg: '#FFF3E0' },
  Critical: { color: '#B71C1C', bg: '#FFEBEE' },
}

export const INPUT_MODES = { ID: 'id', MANUAL: 'manual' }

export const EXPORT_FORMATS = ['PDF', 'Excel', 'CSV']

export const NOTIFICATION_TYPES = {
  fraud_alert:    { label: 'Fraud Alert',     color: '#C62828' },
  claim_update:   { label: 'Claim Update',    color: '#1565C0' },
  system:         { label: 'System',          color: '#6B7280' },
  info:           { label: 'Info',            color: '#0277BD' },
}
