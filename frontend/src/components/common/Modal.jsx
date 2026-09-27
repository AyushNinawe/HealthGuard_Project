import { useEffect } from 'react'
import { FiX } from 'react-icons/fi'

const SIZE_MAP = { sm: '400px', md: '560px', lg: '720px', xl: '920px' }

export default function Modal({ isOpen, onClose, title, size = 'md', children, footer }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1050, padding: '1rem', animation: 'fadeIn 0.2s ease',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: '1rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        width: '100%', maxWidth: SIZE_MAP[size] || SIZE_MAP.md,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        animation: 'fadeInUp 0.25s ease',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem', borderBottom: '1px solid #E5E7EB',
        }}>
          <h5 style={{ margin: 0, fontWeight: 700, color: '#1A1A2E', fontSize: '1.05rem' }}>{title}</h5>
          <button onClick={onClose} style={{
            background: '#F3F4F6', border: 'none', borderRadius: '50%',
            width: 32, height: 32, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}><FiX size={16} /></button>
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>{children}</div>
        {/* Footer */}
        {footer && (
          <div style={{
            padding: '1rem 1.5rem', borderTop: '1px solid #E5E7EB',
            display: 'flex', gap: '0.75rem', justifyContent: 'flex-end',
          }}>{footer}</div>
        )}
      </div>
    </div>
  )
}
