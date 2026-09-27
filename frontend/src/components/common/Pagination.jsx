import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const delta = 2
  const left  = Math.max(2, currentPage - delta)
  const right = Math.min(totalPages - 1, currentPage + delta)

  pages.push(1)
  if (left > 2) pages.push('...')
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < totalPages - 1) pages.push('...')
  if (totalPages > 1) pages.push(totalPages)

  const btnStyle = (active) => ({
    width: 36, height: 36, borderRadius: '8px',
    border: active ? 'none' : '1.5px solid #E5E7EB',
    background: active ? '#1565C0' : '#fff',
    color: active ? '#fff' : '#1A1A2E',
    fontWeight: active ? 700 : 400,
    cursor: 'pointer',
    fontSize: '0.875rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s',
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', justifyContent: 'center', padding: '1rem 0' }}>
      <button style={btnStyle(false)} onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}>
        <FiChevronLeft size={16} />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dot-${i}`} style={{ padding: '0 4px', color: '#6B7280' }}>…</span>
        ) : (
          <button key={p} style={btnStyle(p === currentPage)} onClick={() => onPageChange(p)}>
            {p}
          </button>
        )
      )}
      <button style={btnStyle(false)} onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}>
        <FiChevronRight size={16} />
      </button>
    </div>
  )
}
