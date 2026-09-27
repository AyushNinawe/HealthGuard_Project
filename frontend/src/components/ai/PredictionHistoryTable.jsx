/**
 * PredictionHistoryTable — sortable, filterable, paginated AI prediction history
 */
import { useState, useMemo } from 'react'
import { FiRefreshCw, FiChevronUp, FiChevronDown } from 'react-icons/fi'
import Pagination from '../common/Pagination'
import LoadingSkeleton from './LoadingSkeleton'
import { formatCurrency, formatDate, riskLevelClass, predictionClass } from '../../utils/formatters'
import { ITEMS_PER_PAGE, CLAIM_TYPES } from '../../utils/constants'
import { useDebounce } from '../../hooks/useDebounce'

const RISK_LEVELS = ['Low', 'Medium', 'High', 'Critical']

export default function PredictionHistoryTable({ data = [], loading = false, onRefresh }) {
  const [sortField, setSortField]           = useState('createdAt')
  const [sortDir,   setSortDir]             = useState('desc')
  const [searchQuery, setSearchQuery]       = useState('')
  const [filterPrediction, setFilterPred]   = useState('')
  const [filterRisk, setFilterRisk]         = useState('')
  const [currentPage, setCurrentPage]       = useState(1)

  const debouncedSearch = useDebounce(searchQuery, 300)

  function handleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
    setCurrentPage(1)
  }

  const rawList = Array.isArray(data)
    ? data
    : (Array.isArray(data?.data)
      ? data.data
      : (Array.isArray(data?.items) ? data.items : []))

  const filtered = useMemo(() => {
    let rows = [...rawList]
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      rows = rows.filter(r =>
        r.predictionId?.toLowerCase().includes(q) ||
        r.customerName?.toLowerCase().includes(q)
      )
    }
    if (filterPrediction) rows = rows.filter(r => r.prediction === filterPrediction)
    if (filterRisk)       rows = rows.filter(r => r.riskLevel   === filterRisk)
    rows.sort((a, b) => {
      let va = a[sortField], vb = b[sortField]
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return rows
  }, [rawList, debouncedSearch, filterPrediction, filterRisk, sortField, sortDir])

  const totalPages  = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage    = Math.min(currentPage, totalPages)
  const start       = (safePage - 1) * ITEMS_PER_PAGE
  const pageRows    = filtered.slice(start, start + ITEMS_PER_PAGE)

  function SortIcon({ field }) {
    if (sortField !== field) return <span style={{ opacity: 0.3, fontSize: '0.7rem' }}>↕</span>
    return sortDir === 'asc' ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />
  }

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="form-control-hg" placeholder="Search by ID or customer…"
          value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
          style={{ flex: '1 1 200px', maxWidth: 280 }}
        />
        <select
          className="form-control-hg" value={filterPrediction}
          onChange={e => { setFilterPred(e.target.value); setCurrentPage(1) }}
          style={{ width: 140 }}
        >
          <option value="">All Predictions</option>
          <option value="Fraud">Fraud</option>
          <option value="Genuine">Genuine</option>
        </select>
        <select
          className="form-control-hg" value={filterRisk}
          onChange={e => { setFilterRisk(e.target.value); setCurrentPage(1) }}
          style={{ width: 140 }}
        >
          <option value="">All Risk Levels</option>
          {RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button onClick={onRefresh} className="btn-hg btn-outline-hg btn-sm-hg" disabled={loading}>
          <FiRefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton type="table" rows={5} cols={7} />
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          <p>No predictions match your filters.</p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="hg-table">
              <thead>
                <tr>
                  {[
                    { key: 'predictionId', label: 'Pred. ID' },
                    { key: 'customerName', label: 'Customer' },
                    { key: 'claimType',    label: 'Type' },
                    { key: 'claimAmount',  label: 'Amount' },
                    { key: 'riskLevel',    label: 'Risk' },
                    { key: 'prediction',   label: 'Result' },
                    { key: 'createdAt',    label: 'Date' },
                  ].map(col => (
                    <th key={col.key} onClick={() => handleSort(col.key)} style={{ cursor: 'pointer' }}>
                      {col.label} <SortIcon field={col.key} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map(row => (
                  <tr key={row.predictionId}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--primary)' }}>{row.predictionId}</span></td>
                    <td style={{ fontWeight: 600 }}>{row.customerName}</td>
                    <td>{row.claimType}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(row.claimAmount)}</td>
                    <td><span className={riskLevelClass(row.riskLevel)}>{row.riskLevel}</span></td>
                    <td><span className={predictionClass(row.prediction)}>{row.prediction}</span></td>
                    <td>{formatDate(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem 0' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing {start + 1}–{Math.min(start + ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={p => setCurrentPage(p)} />
          </div>
        </>
      )}
    </div>
  )
}
