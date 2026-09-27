/** Format a number as USD currency */
export function formatCurrency(amount) {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

/** Format ISO date string to readable format */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: '2-digit',
  })
}

/** Format ISO date + time */
export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

/** Compute risk level from fraud probability */
export function computeRiskLevel(fraudProbability) {
  if (fraudProbability < 0.25) return 'Low'
  if (fraudProbability < 0.50) return 'Medium'
  if (fraudProbability < 0.75) return 'High'
  return 'Critical'
}

/** Map risk level to CSS class */
export function riskLevelClass(level) {
  const map = { Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high', Critical: 'badge-critical' }
  return map[level] || 'badge-pending'
}

/** Map prediction to badge class */
export function predictionClass(prediction) {
  return prediction === 'Fraud' ? 'badge-fraud' : 'badge-genuine'
}

/** Map claim status to badge class */
export function statusClass(status) {
  const map = {
    Pending: 'badge-pending',
    Approved: 'badge-approved',
    Rejected: 'badge-rejected',
    'Under Review': 'badge-review',
  }
  return map[status] || 'badge-pending'
}

/** Truncate string */
export function truncate(str, len = 40) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '…' : str
}
