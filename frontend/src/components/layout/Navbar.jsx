import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiShield, FiBell, FiMenu, FiUser, FiSettings,
  FiLogOut, FiChevronDown, FiMoon, FiSun,
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useSettings } from '../../context/SettingsContext'

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const { settings, toggleDarkMode } = useSettings()
  const navigate = useNavigate()
  const [dropOpen, setDropOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header style={{
      position: 'fixed', top: 0, right: 0, left: 0,
      height: 'var(--navbar-height)',
      background: settings.darkMode ? '#161B22' : '#fff',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 1.5rem', gap: '1rem',
      zIndex: 100, boxShadow: '0 1px 4px rgba(21,101,192,0.06)',
      transition: 'background var(--transition)',
    }}>
      {/* Hamburger */}
      <button onClick={onToggleSidebar} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-secondary)', padding: '6px',
        borderRadius: '8px', display: 'flex',
      }}>
        <FiMenu size={22} />
      </button>

      {/* Brand */}
      <Link to="/dashboard" style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        textDecoration: 'none', color: 'var(--text-primary)',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '8px',
          background: 'linear-gradient(135deg, #1565C0, #42A5F5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', flexShrink: 0,
        }}>
          <FiShield size={18} />
        </div>
        <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>
          Health<span style={{ color: '#1565C0' }}>Guard</span>
        </span>
      </Link>

      <div style={{ flex: 1 }} />

      {/* Dark mode toggle */}
      <button onClick={toggleDarkMode} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-secondary)', padding: '6px',
        borderRadius: '8px', display: 'flex', transition: 'color 0.2s',
      }}>
        {settings.darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
      </button>

      {/* Notifications bell */}
      <button style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-secondary)', padding: '6px',
        borderRadius: '8px', display: 'flex', position: 'relative',
      }}>
        <FiBell size={20} />
        <span style={{
          position: 'absolute', top: 4, right: 4,
          width: 8, height: 8, background: '#EF5350',
          borderRadius: '50%', border: '2px solid #fff',
        }} />
      </button>

      {/* Avatar dropdown */}
      <div style={{ position: 'relative' }}>
        <button onClick={() => setDropOpen(v => !v)} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '4px 8px', borderRadius: '8px',
          color: 'var(--text-primary)',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1565C0, #42A5F5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.875rem',
          }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={{ textAlign: 'left', display: window.innerWidth > 640 ? 'block' : 'none' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.2 }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1 }}>{user?.role || 'user'}</div>
          </div>
          <FiChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
        </button>

        {dropOpen && (
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: '0.75rem', boxShadow: 'var(--shadow)',
            minWidth: 180, zIndex: 200, overflow: 'hidden',
            animation: 'fadeInUp 0.2s ease',
          }} onMouseLeave={() => setDropOpen(false)}>
            {[
              { icon: FiUser, label: 'Profile', to: '/profile' },
              { icon: FiSettings, label: 'Settings', to: '/settings' },
            ].map(({ icon: Icon, label, to }) => (
              <Link key={to} to={to} onClick={() => setDropOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.75rem 1rem', color: 'var(--text-primary)',
                fontSize: '0.875rem', textDecoration: 'none',
                transition: 'background 0.15s',
              }} onMouseEnter={e => e.currentTarget.style.background='#F3F4F6'}
                 onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <Icon size={16} />{label}
              </Link>
            ))}
            <div style={{ borderTop: '1px solid var(--border)' }}>
              <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.75rem 1rem', color: '#C62828',
                fontSize: '0.875rem', background: 'none', border: 'none',
                cursor: 'pointer', width: '100%', textAlign: 'left',
              }}>
                <FiLogOut size={16} />Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
