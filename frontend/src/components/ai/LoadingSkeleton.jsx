/**
 * LoadingSkeleton — shimmer placeholders
 * Props: type ("card"|"table"|"chart"|"text"), rows, cols
 */
export default function LoadingSkeleton({ type = 'card', rows = 5, cols = 6, height = 240 }) {
  if (type === 'chart') {
    return (
      <div className="skeleton" style={{ height, borderRadius: '0.625rem' }} />
    )
  }

  if (type === 'table') {
    return (
      <div>
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '0.5rem', marginBottom: '0.75rem' }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 18 }} />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '0.5rem', marginBottom: '0.5rem' }}>
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="skeleton" style={{ height: 14 }} />
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (type === 'text') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 14, width: i % 3 === 0 ? '60%' : '100%' }} />
        ))}
      </div>
    )
  }

  // Default: card grid
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div className="skeleton" style={{ width: 52, height: 52, borderRadius: '0.625rem', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="skeleton" style={{ height: 28, width: '60%' }} />
            <div className="skeleton" style={{ height: 12, width: '80%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
