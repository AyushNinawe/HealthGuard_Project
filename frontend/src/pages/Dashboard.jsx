import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  BarElement, CategoryScale, LinearScale,
} from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import {
  FiFileText, FiCheckCircle, FiXCircle,
  FiAlertTriangle, FiClock, FiEye,
} from 'react-icons/fi'
import { dashboardService } from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Alert from '../components/common/Alert'
import { formatCurrency, formatDate, statusClass, predictionClass } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

// ── Mock data (used as fallback when backend isn't connected) ──
const MOCK = {
  stats: { totalClaims: 284, approvedClaims: 132, rejectedClaims: 58, fraudDetected: 47, pendingClaims: 47 },
  fraudVsGenuine: { fraud: 47, genuine: 237 },
  claimsPerMonth: [
    { month: 'Aug', count: 18 }, { month: 'Sep', count: 24 }, { month: 'Oct', count: 31 },
    { month: 'Nov', count: 22 }, { month: 'Dec', count: 19 }, { month: 'Jan', count: 28 },
    { month: 'Feb', count: 33 }, { month: 'Mar', count: 27 }, { month: 'Apr', count: 36 },
    { month: 'May', count: 29 }, { month: 'Jun', count: 21 }, { month: 'Jul', count: 16 },
  ],
  recentClaims: [
    { id: 'CLM-001', customerName: 'Sarah Johnson', claimType: 'Medical', claimAmount: 12500, status: 'Approved', prediction: { prediction: 'Genuine' }, createdAt: '2026-07-10' },
    { id: 'CLM-002', customerName: 'Mike Chen',     claimType: 'Vehicle', claimAmount: 8200,  status: 'Rejected', prediction: { prediction: 'Fraud'   }, createdAt: '2026-07-09' },
    { id: 'CLM-003', customerName: 'Priya Patel',   claimType: 'Medical', claimAmount: 5600,  status: 'Pending',  prediction: null, createdAt: '2026-07-08' },
    { id: 'CLM-004', customerName: 'James Wilson',  claimType: 'Life',    claimAmount: 35000, status: 'Under Review', prediction: { prediction: 'Fraud' }, createdAt: '2026-07-07' },
    { id: 'CLM-005', customerName: 'Amara Osei',    claimType: 'Property',claimAmount: 7100,  status: 'Approved', prediction: { prediction: 'Genuine' }, createdAt: '2026-07-06' },
  ],
}

const METRIC_CFG = [
  { key: 'totalClaims',    label: 'Total Claims',    icon: FiFileText,     color: '#1565C0', bg: '#E3F2FD' },
  { key: 'approvedClaims', label: 'Approved',        icon: FiCheckCircle,  color: '#2E7D32', bg: '#E8F5E9' },
  { key: 'rejectedClaims', label: 'Rejected',        icon: FiXCircle,      color: '#C62828', bg: '#FFEBEE' },
  { key: 'fraudDetected',  label: 'Fraud Detected',  icon: FiAlertTriangle,color: '#E65100', bg: '#FFF3E0' },
  { key: 'pendingClaims',  label: 'Pending',         icon: FiClock,        color: '#F57F17', bg: '#FFF8E1' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    dashboardService.getDashboard()
      .then(setData)
      .catch(() => setData(MOCK))  // fallback to mock when no backend
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <LoadingSpinner size="lg" text="Loading dashboard..." />
    </div>
  )

  const stats = {
    ...MOCK.stats,
    ...(data?.stats || {}),
    ...(data?.summary ? {
      totalClaims: data.summary.total_claims ?? data.stats?.totalClaims ?? MOCK.stats.totalClaims,
      approvedClaims: data.summary.approved_claims ?? data.stats?.approvedClaims ?? MOCK.stats.approvedClaims,
      rejectedClaims: data.summary.rejected_claims ?? data.stats?.rejectedClaims ?? MOCK.stats.rejectedClaims,
      fraudDetected: data.stats?.fraudDetected ?? data.summary.flagged_claims ?? MOCK.stats.fraudDetected,
      pendingClaims: data.summary.pending_claims ?? data.stats?.pendingClaims ?? MOCK.stats.pendingClaims,
    } : {})
  }

  const fraudVsGenuine = data?.fraudVsGenuine || {
    fraud: stats.fraudDetected ?? MOCK.fraudVsGenuine.fraud,
    genuine: Math.max(0, (stats.totalClaims ?? MOCK.stats.totalClaims) - (stats.fraudDetected ?? MOCK.fraudVsGenuine.fraud))
  }

  const claimsPerMonth = (data?.claimsPerMonth && data.claimsPerMonth.length > 0)
    ? data.claimsPerMonth
    : MOCK.claimsPerMonth

  const recentClaims = (data?.recentClaims && data.recentClaims.length > 0)
    ? data.recentClaims
    : MOCK.recentClaims

  const d = {
    stats,
    fraudVsGenuine,
    claimsPerMonth,
    recentClaims
  }

  const doughnutData = {
    labels: ['Fraud', 'Genuine'],
    datasets: [{
      data: [fraudVsGenuine?.fraud ?? 0, fraudVsGenuine?.genuine ?? 0],
      backgroundColor: ['#EF5350', '#42A5F5'],
      borderColor: ['#fff', '#fff'],
      borderWidth: 3,
    }],
  }

  const barData = {
    labels: (claimsPerMonth || []).map(m => m.month),
    datasets: [{
      label: 'Claims',
      data: (claimsPerMonth || []).map(m => m.count),
      backgroundColor: '#1565C0',
      borderRadius: 6,
      borderSkipped: false,
    }],
  }

  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: '#F3F4F6' }, ticks: { font: { size: 11 } } },
    },
  }

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name || 'User'} — here's what's happening today.</p>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {METRIC_CFG.map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className="metric-card">
            <div className="metric-icon" style={{ background: bg, color }}>
              <Icon size={22} />
            </div>
            <div className="metric-body">
              <div className="metric-value" style={{ color }}>{(stats[key] ?? 0)?.toLocaleString()}</div>
              <div className="metric-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Doughnut */}
        <div className="data-card">
          <h6 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Fraud vs Genuine
          </h6>
          <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>
        {/* Bar */}
        <div className="data-card">
          <h6 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Claims Per Month
          </h6>
          <div style={{ height: 220 }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Recent claims table */}
      <div className="data-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h6 style={{ fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Recent Claims</h6>
          <Link to="/claims" className="btn-hg btn-outline-hg btn-sm-hg">View All</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="hg-table">
            <thead>
              <tr>
                <th>Claim ID</th><th>Customer</th><th>Type</th>
                <th>Amount</th><th>Date</th><th>Status</th>
                <th>Prediction</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {d.recentClaims.map(c => (
                <tr key={c.id}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#1565C0' }}>{c.id}</span></td>
                  <td><span style={{ fontWeight: 600 }}>{c.customerName}</span></td>
                  <td>{c.claimType}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(c.claimAmount)}</td>
                  <td>{formatDate(c.createdAt)}</td>
                  <td><span className={statusClass(c.status)}>{c.status}</span></td>
                  <td>
                    {c.prediction
                      ? <span className={predictionClass(c.prediction.prediction)}>{c.prediction.prediction}</span>
                      : <span style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Pending</span>}
                  </td>
                  <td>
                    <Link to={`/claims/${c.id}`} className="btn-hg btn-outline-hg btn-sm-hg">
                      <FiEye size={13} /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
