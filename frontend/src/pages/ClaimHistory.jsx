import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiFilter, FiEye, FiBarChart2, FiX } from 'react-icons/fi'
import { claimService } from '../services/api'
import { formatCurrency, formatDate, statusClass, predictionClass } from '../utils/formatters'
import { CLAIM_STATUSES, CLAIM_TYPES } from '../utils/constants'
import { useDebounce } from '../hooks/useDebounce'
import Pagination from '../components/common/Pagination'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Alert from '../components/common/Alert'

// Mock data for demo
const MOCK_CLAIMS = Array.from({ length: 32 }, (_, i) => ({
  id: `CLM-${String(i + 1).padStart(3, '0')}`,
  customerName: ['Sarah Johnson','Mike Chen','Priya Patel','James Wilson','Amara Osei','Tom Baker','Lisa Nguyen','Robert Kim'][i % 8],
  claimType: ['Medical','Vehicle','Life','Property'][i % 4],
  claimAmount: [12500, 8200, 5600, 35000, 7100, 22000, 3400, 15600][i % 8],
  status: ['Pending','Approved','Rejected','Under Review'][i % 4],
  prediction: i % 5 === 0 ? null : { prediction: i % 3 === 0 ? 'Fraud' : 'Genuine' },
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}))

export default function ClaimHistory() {
  const [claims, setClaims]       = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [search, setSearch]       = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters]     = useState({ status: '', claimType: '', prediction: '', dateFrom: '', dateTo: '' })
  const [sort, setSort]           = useState({ key: 'createdAt', order: 'desc' })

  const debouncedSearch = useDebounce(search, 400)
  const LIMIT = 10
  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  const fetchClaims = useCallback(async () => {
    setLoading(true)
    try {
      const data = await claimService.getClaims({
        page, limit: LIMIT, search: debouncedSearch,
        sortBy: sort.key, sortOrder: sort.order, ...filters,
      })
      const list = Array.isArray(data) ? data : (data?.claims || data?.items || data?.data || [])
      setClaims(Array.isArray(list) ? list : [])
      setTotal(data?.total ?? (Array.isArray(list) ? list.length : 0))
    } catch {
      // Demo fallback
      let filtered = MOCK_CLAIMS
      if (debouncedSearch) filtered = filtered.filter(c =>
        c.customerName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.id.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
      if (filters.status)  filtered = filtered.filter(c => c.status === filters.status)
      if (filters.claimType) filtered = filtered.filter(c => c.claimType === filters.claimType)
      setTotal(filtered.length)
      const start = (page - 1) * LIMIT
      setClaims(filtered.slice(start, start + LIMIT))
    } finally { setLoading(false) }
  }, [page, debouncedSearch, sort, filters])

  useEffect(() => { fetchClaims() }, [fetchClaims])
  useEffect(() => { setPage(1) }, [debouncedSearch, filters])

  function toggleSort(key) {
    setSort(s => ({ key, order: s.key === key && s.order === 'asc' ? 'desc' : 'asc' }))
  }

  function clearFilters() {
    setFilters({ status: '', claimType: '', prediction: '', dateFrom: '', dateTo: '' })
    setSearch('')
  }

  const hasFilters = Object.values(filters).some(Boolean) || search

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Claim History</h1>
        <p>View, filter and manage all submitted claims.</p>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}

      <div className="data-card">
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 200 }}>
            <FiSearch size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input className="form-control-hg" style={{ paddingLeft: '2.25rem' }}
              placeholder="Search by customer name or claim ID…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className={`btn-hg ${showFilters ? 'btn-primary-hg' : 'btn-secondary-hg'}`}
            onClick={() => setShowFilters(v => !v)}>
            <FiFilter size={14} /> Filters {hasFilters ? `(active)` : ''}
          </button>
          {hasFilters && (
            <button className="btn-hg btn-secondary-hg btn-sm-hg" onClick={clearFilters}>
              <FiX size={13} /> Clear
            </button>
          )}
          <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {total} claim{total !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '0.75rem', padding: '1rem', background: 'var(--primary-bg)',
            borderRadius: '0.625rem', marginBottom: '1rem', animation: 'fadeInUp 0.2s ease',
          }}>
            <div>
              <label className="form-label-hg">Status</label>
              <select className="form-control-hg" value={filters.status}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                <option value="">All</option>
                {CLAIM_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label-hg">Type</label>
              <select className="form-control-hg" value={filters.claimType}
                onChange={e => setFilters(f => ({ ...f, claimType: e.target.value }))}>
                <option value="">All</option>
                {CLAIM_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label-hg">Prediction</label>
              <select className="form-control-hg" value={filters.prediction}
                onChange={e => setFilters(f => ({ ...f, prediction: e.target.value }))}>
                <option value="">All</option>
                <option value="Fraud">Fraud</option>
                <option value="Genuine">Genuine</option>
              </select>
            </div>
            <div>
              <label className="form-label-hg">Date From</label>
              <input type="date" className="form-control-hg" value={filters.dateFrom}
                onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
            </div>
            <div>
              <label className="form-label-hg">Date To</label>
              <input type="date" className="form-control-hg" value={filters.dateTo}
                onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <LoadingSpinner size="md" text="Loading claims…" />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="hg-table">
              <thead>
                <tr>
                  {[['id','Claim ID'],['customerName','Customer'],['claimType','Type'],
                    ['claimAmount','Amount'],['status','Status'],['prediction','Prediction'],
                    ['createdAt','Date']].map(([key, label]) => (
                    <th key={key} onClick={() => toggleSort(key)}>
                      {label} {sort.key === key ? (sort.order === 'asc' ? '↑' : '↓') : ''}
                    </th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No claims found.
                  </td></tr>
                ) : claims.map(c => (
                  <tr key={c.id}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#1565C0' }}>{c.id}</span></td>
                    <td><span style={{ fontWeight: 600 }}>{c.customerName}</span></td>
                    <td>{c.claimType}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(c.claimAmount)}</td>
                    <td><span className={statusClass(c.status)}>{c.status}</span></td>
                    <td>
                      {c.prediction
                        ? <span className={predictionClass(c.prediction.prediction)}>{c.prediction.prediction}</span>
                        : <span style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>—</span>}
                    </td>
                    <td>{formatDate(c.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <Link to={`/claims/${c.id}`} className="btn-hg btn-outline-hg btn-sm-hg" title="View details">
                          <FiEye size={13} />
                        </Link>
                        {c.prediction && (
                          <Link to={`/claims/${c.id}/prediction`} className="btn-hg btn-secondary-hg btn-sm-hg" title="View prediction">
                            <FiBarChart2 size={13} />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  )
}
