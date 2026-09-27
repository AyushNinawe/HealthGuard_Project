import { NavLink } from 'react-router-dom'
import {
  FiHome, FiFilePlus, FiList, FiUser, FiSettings,
  FiShield, FiChevronLeft, FiChevronRight,
  FiCpu, FiActivity, FiFileText, FiBell, FiFolder, FiSearch,
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { label: 'Dashboard',          icon: FiHome,     path: '/dashboard' },
  { label: 'Submit Claim',       icon: FiFilePlus, path: '/submit-claim' },
  { label: 'Claim History',      icon: FiList,     path: '/claims' },
  // ── AI Module ────────────────────────────────────────────────
  { label: 'AI Fraud Detection', icon: FiCpu,      path: '/ai/fraud-detection', dividerBefore: true },
  { label: 'AI Analytics',       icon: FiActivity, path: '/ai/analytics' },
  // ── Other ────────────────────────────────────────────────────
  { label: 'Reports',            icon: FiFileText, path: '/reports',       dividerBefore: true },
  { label: 'Notifications',      icon: FiBell,     path: '/notifications' },
  { label: 'Documents',          icon: FiFolder,   path: '/documents' },
  { label: 'Search',             icon: FiSearch,   path: '/search' },
  // ── Account ──────────────────────────────────────────────────
  { label: 'Profile',            icon: FiUser,     path: '/profile',       dividerBefore: true },
  { label: 'Settings',           icon: FiSettings, path: '/settings' },
]

export default function Sidebar({ isCollapsed, onToggle }) {
  const { user } = useAuth()

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex', alignItems: 'center',
    gap: '0.875rem',
    padding: '0.7rem 1.25rem',
    margin: '0.1rem 0.5rem',
    borderRadius: '0.625rem',
    textDecoration: 'none',
    color: isActive ? '#1565C0' : 'var(--text-secondary)',
    background: isActive ? 'var(--primary-bg)' : 'transparent',
    fontWeight: isActive ? 700 : 500,
    fontSize: '0.875rem',
    borderLeft: isActive ? '3px solid #1565C0' : '3px solid transparent',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  })

  const adminLinkStyle = ({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: '0.875rem',
    padding: '0.7rem 1.25rem', margin: '0.1rem 0.5rem',
    borderRadius: '0.625rem', textDecoration: 'none',
    color: isActive ? '#C62828' : 'var(--text-secondary)',
    background: isActive ? '#FFEBEE' : 'transparent',
    fontWeight: isActive ? 700 : 500, fontSize: '0.875rem',
    borderLeft: isActive ? '3px solid #C62828' : '3px solid transparent',
    transition: 'all 0.2s', whiteSpace: 'nowrap',
  })

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: isCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
      background: '#fff',
      borderRight: '1px solid var(--border)',
      zIndex: 99,
      display: 'flex', flexDirection: 'column',
      transition: 'width var(--transition)',
      overflow: 'hidden',
    }}>
      {/* Logo area */}
      <div style={{
        height: 'var(--navbar-height)',
        display: 'flex', alignItems: 'center',
        padding: isCollapsed ? '0 1rem' : '0 1.25rem',
        borderBottom: '1px solid var(--border)',
        gap: '0.75rem', flexShrink: 0,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
          background: 'linear-gradient(135deg, #1565C0, #42A5F5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
        }}>
          <FiShield size={20} />
        </div>
        {!isCollapsed && (
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2, color: 'var(--text-primary)' }}>
              Health<span style={{ color: '#1565C0' }}>Guard</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Fraud Detection
            </div>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {navItems.map(({ label, icon: Icon, path, dividerBefore }) => (
          <div key={path}>
            {dividerBefore && !isCollapsed && (
              <div style={{ height: 1, background: 'var(--border)', margin: '0.5rem 1rem' }} />
            )}
            {dividerBefore && isCollapsed && <div style={{ height: 8 }} />}
            <NavLink to={path} style={navLinkStyle}>
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!isCollapsed && <span>{label}</span>}
            </NavLink>
          </div>
        ))}

        {/* Admin links */}
        {user?.role === 'admin' && (
          <>
            <div style={{ height: 1, background: 'var(--border)', margin: isCollapsed ? '0.5rem 0.75rem' : '0.5rem 1rem' }} />
            <NavLink to="/admin" end style={adminLinkStyle}>
              <FiShield size={18} style={{ flexShrink: 0 }} />
              {!isCollapsed && <span>Admin Panel</span>}
            </NavLink>
            <NavLink to="/admin/ai-tools" style={adminLinkStyle}>
              <FiCpu size={18} style={{ flexShrink: 0 }} />
              {!isCollapsed && <span>Admin AI Tools</span>}
            </NavLink>
          </>
        )}
      </nav>

      {/* Collapse toggle */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
        <button onClick={onToggle} style={{
          display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start',
          gap: '0.625rem', width: '100%',
          background: 'var(--primary-bg)', border: 'none', borderRadius: '0.5rem',
          padding: '0.5rem 0.75rem', cursor: 'pointer',
          color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600,
        }}>
          {isCollapsed ? <FiChevronRight size={18} /> : <><FiChevronLeft size={18} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  )
}
