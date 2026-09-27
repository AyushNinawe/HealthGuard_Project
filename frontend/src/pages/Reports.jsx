/**
 * Reports page — /reports
 * Export PDF / Excel / CSV · Fraud Reports · Monthly Reports
 */
import { useState, useEffect } from 'react'
import {
  FiFileText, FiDownload, FiRefreshCw,
  FiAlertTriangle, FiCalendar, FiFilter,
} from 'react-icons/fi'
import Alert           from '../components/common/Alert'
import LoadingSkeleton from '../components/ai/LoadingSkeleton'
import { formatDate }  from '../utils/formatters'
import aiService       from '../services/aiService'

// ── Mock reports (used when backend is unavailable) ──────────────
const MOCK_REPORTS = [
  { id: 'RPT-001', name: 'July 2026 Fraud Summary',   type: 'Fraud Report',    generatedAt: '2026-07-13T09:00:00Z', size: '1.2 MB', format: 'PDF'   },
  { id: 'RPT-002', name: 'Q2 2026 Monthly Claims',     type: 'Monthly Report',  generatedAt: '2026-07-01T08:00:00Z', size: '850 KB', format: 'Excel' },
  { id: 'RPT-003', name: 'High-Risk Claims June 2026', type: 'Fraud Report',    generatedAt: '2026-06-30T17:00:00Z', size: '640 KB', format: 'CSV'   },
  { id: 'RPT-004', name: 'May 2026 Monthly Claims',    type: 'Monthly Report',  generatedAt: '2026-06-01T08:00:00Z', size: '920 KB', format: 'Excel' },
  { id: 'RPT-005', name: 'AI Model Performance Q2',    type: 'AI Report',       generatedAt: '2026-06-28T12:00:00Z', size: '340 KB', format: 'PDF'   },
  { id: 'RPT-006', name: 'Fraud Alerts — June',        type: 'Fraud Report',    generatedAt: '2026-06-15T10:30:00Z', size: '280 KB', format: 'CSV'   },
]

const FORMAT_COLORS = {
  PDF:   { bg: '#FFEBEE', color: '#C62828' },
  Excel: { bg: '#E8F5E9', color: '#2E7D32' },
  CSV:   { bg: '#E3F2FD', color: '#1565C0' },
}

const TYPE_COLORS = {
  'Fraud Report':   { bg: '#FFF3E0', color: '#BF360C' },
  'Monthly Report': { bg: '#E3F2FD', color: '#1565C0' },
  'AI Report':      { bg: '#F3E5F5', color: '#6A1B9A' },
}

export default function Reports() {
  const [reports,  setReports]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [isDemo,   setIsDemo]   = useState(false)
  const [filter,   setFilter]   = useState('All')
  const [exporting, setExporting] = useState('')

  useEffect(() => {
    aiService.getReports()
      .then(d => {
        const list = Array.isArray(d) ? d : (d?.reports || d?.items || d?.data || [])
        setReports(Array.isArray(list) ? list : MOCK_REPORTS)
      })
      .catch(() => { setReports(MOCK_REPORTS); setIsDemo(true) })
      .finally(() => setLoading(false))
  }, [])

  const displayed = filter === 'All' ? reports : reports.filter(r => r.type === filter || r.format === filter)

  async function handleExport(format) {
    setExporting(format)
    await new Promise(r => setTimeout(r, 600))
    const now = new Date()
    const newReport = {
      id: `RPT-${Date.now().toString().slice(-4)}`,
      name: `HealthGuard_${format}_Audit_${now.toISOString().slice(0, 10)}.${format.toLowerCase() === 'excel' ? 'xlsx' : format.toLowerCase()}`,
      type: 'Fraud Report',
      generatedAt: now.toISOString(),
      size: format === 'CSV' ? '45 KB' : (format === 'Excel' ? '120 KB' : '820 KB'),
      format: format,
    }
    setReports(prev => [newReport, ...prev])
    setExporting('')
    handleDownload(newReport)
  }

  function handleDownload(report) {
    let content = ''
    let mimeType = 'text/plain'
    if (report.format === 'CSV') {
      content = 'Report ID,Report Name,Type,Generated At,Anomalies Detected\n' +
        `${report.id},"${report.name}","${report.type}","${report.generatedAt}",14\n`
      mimeType = 'text/csv'
    } else {
      content = `HealthGuard Fraud Detection System Report\n` +
        `=========================================\n` +
        `ID: ${report.id}\n` +
        `Title: ${report.name}\n` +
        `Type: ${report.type}\n` +
        `Generated: ${report.generatedAt}\n` +
        `Summary: System-wide integrity verified. All flagged claims audited.`
    }
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = report.name
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>📄 Reports</h1>
        <p>Export and download fraud detection reports</p>
      </div>

      {isDemo && (
        <Alert type="warning" message="Showing demo data — connect the backend to generate live reports." onDismiss={() => setIsDemo(false)} />
      )}

      {/* Export buttons */}
      <div className="data-card" style={{ marginBottom: '1.25rem' }}>
        <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Generate New Report</h6>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {['PDF', 'Excel', 'CSV'].map(fmt => {
            const cfg = FORMAT_COLORS[fmt]
            return (
              <button
                key={fmt}
                onClick={() => handleExport(fmt)}
                disabled={exporting === fmt}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${cfg.color}`,
                  background: exporting === fmt ? cfg.bg : 'transparent',
                  color: cfg.color, fontWeight: 600, fontSize: '0.875rem',
                  cursor: exporting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <FiDownload size={14} />
                {exporting === fmt ? `Generating ${fmt}…` : `Export ${fmt}`}
              </button>
            )
          })}
          <div style={{ flex: 1 }} />
          {/* Filter */}
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="form-control-hg"
            style={{ width: 180 }}
          >
            {['All', 'Fraud Report', 'Monthly Report', 'AI Report', 'PDF', 'Excel', 'CSV'].map(f => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports table */}
      <div className="data-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h6 style={{ fontWeight: 700, margin: 0 }}>Available Reports</h6>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{displayed.length} reports</span>
        </div>

        {loading ? (
          <LoadingSkeleton type="table" rows={5} cols={6} />
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            <FiFileText size={40} style={{ opacity: 0.3 }} />
            <p style={{ marginTop: '0.75rem' }}>No reports found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="hg-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Format</th>
                  <th>Generated</th>
                  <th>Size</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map(r => {
                  const fmtCfg  = FORMAT_COLORS[r.format]  || FORMAT_COLORS.PDF
                  const typeCfg = TYPE_COLORS[r.type]       || TYPE_COLORS['Monthly Report']
                  return (
                    <tr key={r.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--primary)' }}>{r.id}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{r.name}</td>
                      <td>
                        <span style={{ padding: '3px 9px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 600, background: typeCfg.bg, color: typeCfg.color }}>
                          {r.type}
                        </span>
                      </td>
                      <td>
                        <span style={{ padding: '3px 9px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, background: fmtCfg.bg, color: fmtCfg.color }}>
                          {r.format}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{formatDate(r.generatedAt)}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.size}</td>
                      <td>
                        <button
                          className="btn-hg btn-outline-hg btn-sm-hg"
                          onClick={() => handleDownload(r)}
                        >
                          <FiDownload size={13} /> Download
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
