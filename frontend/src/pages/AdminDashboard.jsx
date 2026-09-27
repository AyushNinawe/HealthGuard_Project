import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import { FiUsers, FiFileText, FiCheckCircle, FiXCircle, FiAlertTriangle, FiTrash2, FiEye, FiBarChart2, FiSearch } from 'react-icons/fi'
import { adminService, claimService } from '../services/api'
import { formatCurrency, formatDate, statusClass, predictionClass } from '../utils/formatters'
import { useDebounce } from '../hooks/useDebounce'
import Pagination from '../components/common/Pagination'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Alert from '../components/common/Alert'
import Modal from '../components/common/Modal'

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const TABS = ['Overview', 'Claims', 'Users']

const MOCK_CLAIMS = Array.from({ length: 24 }, (_, i) => ({
  id: `CLM-${String(i + 1).padStart(3, '0')}`,
  customerName: ['Alice Brown','Bob Smith','Carol Davis','Dan Wilson','Eve Martinez'][i % 5],
  claimType: ['Medical','Vehicle','Life','Property'][i % 4],
  claimAmount: [9800, 14200, 6100, 22000, 5500][i % 5],
  status: ['Pending','Approved','Rejected','Under Review'][i % 4],
  prediction: { prediction: i % 4 === 0 ? 'Fraud' : 'Genuine' },
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  userId: `USR-0${i % 5 + 1}`,
}))

const MOCK_USERS = Array.from({ length: 12 }, (_, i) => ({
  id: `USR-0${i + 1}`,
  name: ['Alice Brown','Bob Smith','Carol Davis','Dan Wilson','Eve Martinez','Frank Lee','Grace Kim','Henry Park'][i % 8],
  email: `user${i + 1}@example.com`,
  phone: `+1 555-010${i}`,
  role: i === 0 ? 'admin' : 'user',
  createdAt: new Date(Date.now() - i * 7 * 86400000).toISOString(),
}))

const MOCK_STATS = {
  totalClaims: 284, approvedClaims: 132, rejectedClaims: 58, fraudDetected: 47, pendingClaims: 47, totalUsers: 28,
  fraudVsGenuine: { fraud: 47, genuine: 237 },
  claimsPerMonth: [
    { month: 'Feb', count: 33 }, { month: 'Mar', count: 27 }, { month: 'Apr', count: 36 },
    { month: 'May', count: 29 }, { month: 'Jun', count: 21 }, { month: 'Jul', count: 16 },
  ],
}

export default function AdminDashboard() {
  const [tab, setTab]           = useState('Overview')
  const [claims, setClaims]     = useState([])
  const [users, setUsers]       = useState([])
  const [stats, setStats]       = useState(MOCK_STATS)
  const [loading, setLoading]   = useState(false)
  const [alert, setAlert]       = useState(null)
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')
  const [confirmModal, setConfirmModal] = useState(null)
  const debounced = useDebounce(search, 400)
  const LIMIT = 8

  const fetchClaims = useCallback(() => {
    setLoading(true)
    adminService.getAllClaims({ page, limit: LIMIT, search: debounced })
      .then(d => {
        const list = Array.isArray(d?.claims) ? d.claims : (Array.isArray(d) ? d : [])
        setClaims(list.length ? list : MOCK_CLAIMS)
      })
      .catch(() => {
        let filtered = MOCK_CLAIMS.filter(c =>
          !debounced || c.customerName.toLowerCase().includes(debounced.toLowerCase()) ||
          c.id.toLowerCase().includes(debounced.toLowerCase())
        )
        const start = (page - 1) * LIMIT
        setClaims(filtered.slice(start, start + LIMIT))
      })
      .finally(() => setLoading(false))
  }, [page, debounced])

  const fetchUsers = useCallback(() => {
    adminService.getAllUsers({})
      .then(res => {
        const list = Array.isArray(res?.users) ? res.users : (Array.isArray(res) ? res : [])
        setUsers(list.length ? list : MOCK_USERS)
      })
      .catch(() => setUsers(MOCK_USERS))
  }, [])

  useEffect(() => {
    adminService.getDashboard()
      .then(res => {
        if (res?.stats || res?.summary) {
          setStats({
            ...MOCK_STATS,
            ...(res.stats || {}),
            totalClaims: res.stats?.totalClaims ?? res.summary?.total_claims ?? MOCK_STATS.totalClaims,
            approvedClaims: res.stats?.approvedClaims ?? res.summary?.approved_claims ?? MOCK_STATS.approvedClaims,
            rejectedClaims: res.stats?.rejectedClaims ?? res.summary?.rejected_claims ?? MOCK_STATS.rejectedClaims,
            fraudDetected: res.stats?.fraudDetected ?? res.summary?.flagged_claims ?? MOCK_STATS.fraudDetected,
            pendingClaims: res.stats?.pendingClaims ?? res.summary?.pending_claims ?? MOCK_STATS.pendingClaims,
            totalUsers: res.stats?.totalUsers ?? res.summary?.total_users ?? MOCK_STATS.totalUsers,
            fraudVsGenuine: res.fraudVsGenuine || MOCK_STATS.fraudVsGenuine,
            claimsPerMonth: res.claimsPerMonth || MOCK_STATS.claimsPerMonth,
          })
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => { if (tab === 'Claims')   fetchClaims() }, [tab, fetchClaims])
  useEffect(() => { if (tab === 'Users')    fetchUsers()  }, [tab, fetchUsers])

  async function handleApprove(id) {
    try {
      await adminService.approveClaim(id)
      fetchClaims()
      setAlert({ type: 'success', msg: `Claim ${id} approved.` })
    } catch {
      setClaims(cs => cs.map(c => c.id === id ? { ...c, status: 'Approved' } : c))
      setAlert({ type: 'success', msg: `Claim ${id} approved (demo).` })
    }
  }

  async function handleReject(id) {
    try {
      await adminService.rejectClaim(id, 'Rejected by admin')
      fetchClaims()
      setAlert({ type: 'info', msg: `Claim ${id} rejected.` })
    } catch {
      setClaims(cs => cs.map(c => c.id === id ? { ...c, status: 'Rejected' } : c))
      setAlert({ type: 'info', msg: `Claim ${id} rejected (demo).` })
    }
  }

  async function handleDelete(id) {
    try {
      await claimService.deleteClaim(id)
    } catch {}
    setClaims(cs => cs.filter(c => c.id !== id))
    setAlert({ type: 'warning', msg: `Claim ${id} deleted.` })
    setConfirmModal(null)
  }

  const doughnutData = {
    labels: ['Fraud', 'Genuine'],
    datasets: [{
      data: [
        stats?.fraudVsGenuine?.fraud ?? MOCK_STATS.fraudVsGenuine.fraud,
        stats?.fraudVsGenuine?.genuine ?? MOCK_STATS.fraudVsGenuine.genuine
      ],
      backgroundColor: ['#EF5350','#42A5F5'],
      borderWidth: 3,
      borderColor: '#fff'
    }],
  }
  const barData = {
    labels: (stats?.claimsPerMonth || MOCK_STATS.claimsPerMonth).map(m => m.month),
    datasets: [{
      label: 'Claims',
      data: (stats?.claimsPerMonth || MOCK_STATS.claimsPerMonth).map(m => m.count),
      backgroundColor: '#1565C0',
      borderRadius: 6
    }],
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header"><h1>Admin Dashboard</h1><p>System-wide oversight and management.</p></div>

      {alert && <Alert type={alert.type} message={alert.msg} onDismiss={() => setAlert(null)} autoClose={4000} />}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: '#F3F4F6', borderRadius: '0.625rem', padding: '0.25rem', width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none',
            background: tab === t ? '#fff' : 'transparent',
            color: tab === t ? '#1565C0' : '#6B7280',
            fontWeight: tab === t ? 700 : 500, fontSize: '0.875rem',
            cursor: 'pointer', boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.2s',
          }}>{t}</button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === 'Overview' && (
        <div className="animate-fade-in-up">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Claims', value: stats.totalClaims,    icon: FiFileText,     color: '#1565C0', bg: '#E3F2FD' },
              { label: 'Approved',     value: stats.approvedClaims,  icon: FiCheckCircle,  color: '#2E7D32', bg: '#E8F5E9' },
              { label: 'Rejected',     value: stats.rejectedClaims,  icon: FiXCircle,      color: '#C62828', bg: '#FFEBEE' },
              { label: 'Fraud Cases',  value: stats.fraudDetected,   icon: FiAlertTriangle,color: '#E65100', bg: '#FFF3E0' },
              { label: 'Total Users',  value: stats.totalUsers,      icon: FiUsers,        color: '#0277BD', bg: '#E1F5FE' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="metric-card">
                <div className="metric-icon" style={{ background: bg, color }}><Icon size={20} /></div>
                <div className="metric-body">
                  <div className="metric-value" style={{ color }}>{value}</div>
                  <div className="metric-label">{label}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }}>
            <div className="data-card">
              <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Fraud vs Genuine</h6>
              <div style={{ height: 200 }}><Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} /></div>
            </div>
            <div className="data-card">
              <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Claims Per Month</h6>
              <div style={{ height: 200 }}><Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#F3F4F6' } } } }} /></div>
            </div>
          </div>
        </div>
      )}

      {/* Claims tab */}
      {tab === 'Claims' && (
        <div className="animate-fade-in-up">
          <div className="data-card">
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <FiSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input className="form-control-hg" style={{ paddingLeft: '2rem' }}
                  placeholder="Search claims…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><LoadingSpinner size="md" /></div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="hg-table">
                  <thead><tr>
                    <th>Claim ID</th><th>Customer</th><th>Type</th><th>Amount</th>
                    <th>Status</th><th>Prediction</th><th>Date</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {claims.map(c => (
                      <tr key={c.id}>
                        <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#1565C0' }}>{c.id}</span></td>
                        <td><span style={{ fontWeight: 600 }}>{c.customerName}</span></td>
                        <td>{c.claimType}</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(c.claimAmount)}</td>
                        <td><span className={statusClass(c.status)}>{c.status}</span></td>
                        <td>{c.prediction ? <span className={predictionClass(c.prediction.prediction)}>{c.prediction.prediction}</span> : '—'}</td>
                        <td>{formatDate(c.createdAt)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <Link to={`/claims/${c.id}`} className="btn-hg btn-outline-hg btn-sm-hg" title="View"><FiEye size={12} /></Link>
                            {c.prediction && <Link to={`/claims/${c.id}/prediction`} className="btn-hg btn-secondary-hg btn-sm-hg" title="Prediction"><FiBarChart2 size={12} /></Link>}
                            {c.status === 'Pending' && <>
                              <button className="btn-hg btn-success-hg btn-sm-hg" onClick={() => handleApprove(c.id)} title="Approve"><FiCheckCircle size={12} /></button>
                              <button className="btn-hg btn-danger-hg btn-sm-hg"  onClick={() => handleReject(c.id)}  title="Reject"><FiXCircle size={12} /></button>
                            </>}
                            <button className="btn-hg btn-secondary-hg btn-sm-hg"
                              onClick={() => setConfirmModal(c.id)} title="Delete">
                              <FiTrash2 size={12} color="#C62828" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination currentPage={page} totalPages={Math.ceil(MOCK_CLAIMS.length / LIMIT)} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* Users tab */}
      {tab === 'Users' && (
        <div className="animate-fade-in-up data-card">
          <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>All Users</h6>
          <div style={{ overflowX: 'auto' }}>
            <table className="hg-table">
              <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead>
              <tbody>
                {(users.length ? users : MOCK_USERS).map(u => (
                  <tr key={u.id}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#1565C0' }}>{u.id}</span></td>
                    <td><span style={{ fontWeight: 600 }}>{u.name}</span></td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>
                      <span style={{
                        padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700,
                        background: u.role === 'admin' ? '#E3F2FD' : '#F3F4F6',
                        color: u.role === 'admin' ? '#1565C0' : '#6B7280',
                      }}>{u.role}</span>
                    </td>
                    <td>{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      <Modal isOpen={!!confirmModal} onClose={() => setConfirmModal(null)} title="Confirm Deletion" size="sm"
        footer={<>
          <button className="btn-hg btn-secondary-hg" onClick={() => setConfirmModal(null)}>Cancel</button>
          <button className="btn-hg btn-danger-hg" onClick={() => handleDelete(confirmModal)}>Delete</button>
        </>}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Are you sure you want to delete claim <strong>{confirmModal}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
