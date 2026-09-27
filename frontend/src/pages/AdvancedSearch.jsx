/**
 * AdvancedSearch page — /search
 * Search by Claim ID, Customer Name, Policy Number, Hospital, etc.
 * with Date, Status, Risk Level, Claim Type filters
 */
import { useState } from 'react'
import { Link }     from 'react-router-dom'
import { FiSearch, FiX, FiEye, FiSliders } from 'react-icons/fi'
import { claimService }   from '../services/api'
import LoadingSpinner     from '../components/common/LoadingSpinner'
import { formatCurrency, formatDate, statusClass, riskLevelClass, predictionClass } from '../utils/formatters'
import { CLAIM_TYPES, CLAIM_STATUSES } from '../utils/constants'

// ── Mock fallback claims ─────────────────────────────────────────
const MOCK_CLAIMS = [
  { id: 'CLM-001', customerName: 'Sarah Johnson', policyNumber: 'POL-10021', hospital: 'City General',   claimType: 'Medical',  claimAmount: 12500, status: 'Approved',     riskLevel: 'Low',      prediction: { prediction: 'Genuine' }, createdAt: '2026-07-10' },
  { id: 'CLM-002', customerName: 'Mike Chen',     policyNumber: 'POL-10034', hospital: 'Metro Health',   claimType: 'Vehicle',  claimAmount: 8200,  status: 'Rejected',     riskLevel: 'Critical', prediction: { prediction: 'Fraud'   }, createdAt: '2026-07-09' },
  { id: 'CLM-003', customerName: 'Priya Patel',   policyNumber: 'POL-10047', hospital: 'Valley Medical', claimType: 'Medical',  claimAmount: 5600,  status: 'Pending',      riskLevel: 'Medium',   prediction: null, createdAt: '2026-07-08' },
  { id: 'CLM-004', customerName: 'James Wilson',  policyNumber: 'POL-10059', hospital: 'Sunrise Clinic', claimType: 'Life',     claimAmount: 35000, status: 'Under Review', riskLevel: 'High',     prediction: { prediction: 'Fraud'   }, createdAt: '2026-07-07' },
  { id: 'CLM-005', customerName: 'Amara Osei',    policyNumber: 'POL-10061', hospital: 'Bay Area Hosp.', claimType: 'Property', claimAmount: 7100,  status: 'Approved',     riskLevel: 'Low',      prediction: { prediction: 'Genuine' }, createdAt: '2026-07-06' },
  { id: 'CLM-006', customerName: 'Tom Baker',     policyNumber: 'POL-10072', hospital: 'City General',   claimType: 'Medical',  claimAmount: 22000, status: 'Pending',      riskLevel: 'High',     prediction: { prediction: 'Fraud'   }, createdAt: '2026-07-05' },
  { id: 'CLM-007', customerName: 'Lisa Nguyen',   policyNumber: 'POL-10085', hospital: 'Metro Health',   claimType: 'Vehicle',  claimAmount: 3400,  status: 'Approved',     riskLevel: 'Low',      prediction: { prediction: 'Genuine' }, createdAt: '2026-07-04' },
  { id: 'CLM-008', customerName: 'Robert Kim',    policyNumber: 'POL-10093', hospital: 'Valley Medical', claimType: 'Life',     claimAmount: 15600, status: 'Under Review', riskLevel: 'Medium',   prediction: { prediction: 'Fraud'   }, createdAt: '2026-07-03' },
]

const RISK_LEVELS = ['Low', 'Medium', 'High', 'Critical']
const INITIAL_FILTERS = { query: '', claimType: '', status: '', riskLevel: '', dateFrom: '', dateTo: '', amountMin: '', amountMax: '' }

export default function AdvancedSearch() {
  const [filters,     setFilters]     = useState(INITIAL_FILTERS)
  const [results,     setResults]     = useState([])
  const [loading,     setLoading]     = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  function setField(key, val) {
    setFilters(prev => ({ ...prev, [key]: val }))
  }

  function clearFilters() {
    setFilters(INITIAL_FILTERS)
    setResults([])
    setHasSearched(false)
  }

  async function handleSearch() {
    setLoading(true)
    try {
      const data = await claimService.getClaims({ search: filters.query, ...filters })
      const list = Array.isArray(data) ? data : (data?.claims || data?.items || data?.data || [])
      setResults(Array.isArray(list) ? list : [])
    } catch {
      // Fallback: filter mock data locally
      let r = [...MOCK_CLAIMS]
      const q = filters.query.toLowerCase()
      if (q) r = r.filter(c =>
        c.id.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q) ||
        c.policyNumber.toLowerCase().includes(q) ||
        c.hospital.toLowerCase().includes(q)
      )
      if (filters.claimType)  r = r.filter(c => c.claimType  === filters.claimType)
      if (filters.status)     r = r.filter(c => c.status     === filters.status)
      if (filters.riskLevel)  r = r.filter(c => c.riskLevel  === filters.riskLevel)
      if (filters.dateFrom)   r = r.filter(c => c.createdAt  >= filters.dateFrom)
      if (filters.dateTo)     r = r.filter(c => c.createdAt  <= filters.dateTo)
      if (filters.amountMin)  r = r.filter(c => c.claimAmount >= Number(filters.amountMin))
      if (filters.amountMax)  r = r.filter(c => c.claimAmount <= Number(filters.amountMax))
      setResults(r)
    } finally {
      setLoading(false)
      setHasSearched(true)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>🔍 Advanced Search</h1>
        <p>Search and filter claims by any combination of criteria</p>
      </div>

      {/* Filters panel */}
      <div className="data-card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <FiSliders size={16} color="var(--primary)" />
          <h6 style={{ margin: 0, fontWeight: 700 }}>Search Filters</h6>
        </div>

        {/* Main query */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <FiSearch size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-control-hg"
            placeholder="Search by Claim ID, Customer Name, Policy Number, or Hospital…"
            value={filters.query}
            onChange={e => setField('query', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>

        {/* Filter grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem', marginBottom: '1rem' }}>
          <div>
            <label className="form-label-hg">Claim Type</label>
            <select className="form-control-hg" value={filters.claimType} onChange={e => setField('claimType', e.target.value)}>
              <option value="">All Types</option>
              {CLAIM_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label-hg">Status</label>
            <select className="form-control-hg" value={filters.status} onChange={e => setField('status', e.target.value)}>
              <option value="">All Statuses</option>
              {CLAIM_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label-hg">Risk Level</label>
            <select className="form-control-hg" value={filters.riskLevel} onChange={e => setField('riskLevel', e.target.value)}>
              <option value="">All Risk Levels</option>
              {RISK_LEVELS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label-hg">Date From</label>
            <input type="date" className="form-control-hg" value={filters.dateFrom} onChange={e => setField('dateFrom', e.target.value)} />
          </div>
          <div>
            <label className="form-label-hg">Date To</label>
            <input type="date" className="form-control-hg" value={filters.dateTo} onChange={e => setField('dateTo', e.target.value)} />
          </div>
          <div>
            <label className="form-label-hg">Min Amount ($)</label>
            <input type="number" min="0" className="form-control-hg" value={filters.amountMin} onChange={e => setField('amountMin', e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className="form-label-hg">Max Amount ($)</label>
            <input type="number" min="0" className="form-control-hg" value={filters.amountMax} onChange={e => setField('amountMax', e.target.value)} placeholder="any" />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-hg btn-primary-hg" onClick={handleSearch} disabled={loading}>
            {loading ? <><span style={{ fontSize: '0.8rem' }}>Searching…</span></> : <><FiSearch size={14} /> Search</>}
          </button>
          <button className="btn-hg btn-secondary-hg" onClick={clearFilters}>
            <FiX size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <LoadingSpinner size="lg" text="Searching claims…" />
        </div>
      ) : hasSearched ? (
        <div className="data-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h6 style={{ margin: 0, fontWeight: 700 }}>
              Results <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.875rem' }}>({results.length} found)</span>
            </h6>
          </div>

          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
              <FiSearch size={40} style={{ opacity: 0.3 }} />
              <p style={{ marginTop: '0.75rem' }}>No claims match your search criteria</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="hg-table">
                <thead>
                  <tr>
                    <th>Claim ID</th><th>Customer</th><th>Policy No.</th>
                    <th>Hospital</th><th>Type</th><th>Amount</th>
                    <th>Status</th><th>Risk</th><th>Date</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(c => (
                    <tr key={c.id}>
                      <td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--primary)' }}>{c.id}</span></td>
                      <td style={{ fontWeight: 600 }}>{c.customerName}</td>
                      <td style={{ fontSize: '0.82rem' }}>{c.policyNumber}</td>
                      <td style={{ fontSize: '0.82rem' }}>{c.hospital}</td>
                      <td>{c.claimType}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(c.claimAmount)}</td>
                      <td><span className={statusClass(c.status)}>{c.status}</span></td>
                      <td><span className={riskLevelClass(c.riskLevel)}>{c.riskLevel}</span></td>
                      <td>{formatDate(c.createdAt)}</td>
                      <td>
                        <Link to={`/claims/${c.id}`} className="btn-hg btn-outline-hg btn-sm-hg">
                          <FiEye size={12} /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="data-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <FiSearch size={48} style={{ opacity: 0.2 }} />
          <p style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>
            Use the filters above to search for claims
          </p>
        </div>
      )}
    </div>
  )
}
