import { useState } from 'react'
import { FiUser, FiEdit2, FiLock, FiSave, FiCamera } from 'react-icons/fi'
import { profileService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Alert from '../components/common/Alert'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [alert, setAlert]     = useState(null)
  const [saving, setSaving]   = useState(false)

  const [profile, setProfile] = useState({
    name:  user?.name  || 'John Doe',
    email: user?.email || 'john@example.com',
    phone: user?.phone || '+1 555-0100',
  })
  const [profileErrors, setProfileErrors] = useState({})

  const [pwForm, setPwForm]   = useState({ current: '', newPw: '', confirm: '' })
  const [pwErrors, setPwErrors] = useState({})
  const [pwSaving, setPwSaving] = useState(false)

  function validateProfile() {
    const e = {}
    if (!profile.name.trim()) e.name = 'Name is required'
    if (!profile.email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) e.email = 'Invalid email'
    setProfileErrors(e)
    return Object.keys(e).length === 0
  }

  async function saveProfile(e) {
    e.preventDefault()
    if (!validateProfile()) return
    setSaving(true)
    try {
      const updated = await profileService.updateProfile(profile)
      updateUser(updated)
      setAlert({ type: 'success', msg: 'Profile updated successfully!' })
    } catch {
      updateUser(profile)
      setAlert({ type: 'success', msg: 'Profile updated (demo mode).' })
    } finally { setSaving(false) }
  }

  function validatePw() {
    const e = {}
    if (!pwForm.current) e.current = 'Current password is required'
    if (!pwForm.newPw)   e.newPw = 'New password is required'
    else if (pwForm.newPw.length < 6) e.newPw = 'At least 6 characters'
    if (pwForm.newPw !== pwForm.confirm) e.confirm = 'Passwords do not match'
    setPwErrors(e)
    return Object.keys(e).length === 0
  }

  async function changePassword(e) {
    e.preventDefault()
    if (!validatePw()) return
    setPwSaving(true)
    try {
      await profileService.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPw })
      setAlert({ type: 'success', msg: 'Password changed successfully!' })
      setPwForm({ current: '', newPw: '', confirm: '' })
    } catch {
      setAlert({ type: 'error', msg: 'Failed to change password. Check your current password.' })
    } finally { setPwSaving(false) }
  }

  const initials = (user?.name || 'U').charAt(0).toUpperCase()

  return (
    <div className="animate-fade-in" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div className="page-header"><h1>Profile</h1><p>Manage your account details.</p></div>

      {alert && <Alert type={alert.type} message={alert.msg} onDismiss={() => setAlert(null)} autoClose={4000} />}

      {/* Avatar card */}
      <div className="data-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1565C0, #42A5F5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '2rem', fontWeight: 800,
          }}>{initials}</div>
          <button style={{
            position: 'absolute', bottom: 0, right: 0,
            background: '#1565C0', border: '2px solid #fff', borderRadius: '50%',
            width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff',
          }}><FiCamera size={12} /></button>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{user?.name || profile.name}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user?.email || profile.email}</div>
          <span style={{
            display: 'inline-block', marginTop: '0.375rem', padding: '2px 10px',
            background: '#E3F2FD', color: '#1565C0', borderRadius: '999px',
            fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
          }}>{user?.role || 'user'}</span>
        </div>
      </div>

      {/* Edit profile */}
      <div className="data-card" style={{ marginBottom: '1.25rem' }}>
        <h6 style={{ fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiEdit2 size={16} color="#1565C0" /> Edit Profile
        </h6>
        <form onSubmit={saveProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            {[
              { key: 'name',  label: 'Full Name',     type: 'text',  placeholder: 'John Doe' },
              { key: 'email', label: 'Email Address',  type: 'email', placeholder: 'you@example.com' },
              { key: 'phone', label: 'Phone Number',   type: 'tel',   placeholder: '+1 555-0100' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key} style={{ marginBottom: '1rem', gridColumn: key === 'phone' ? '1' : 'auto' }}>
                <label className="form-label-hg">{label}</label>
                <input type={type} className={`form-control-hg${profileErrors[key] ? ' is-invalid' : ''}`}
                  placeholder={placeholder} value={profile[key]}
                  onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))} />
                {profileErrors[key] && <div className="form-error">{profileErrors[key]}</div>}
              </div>
            ))}
          </div>
          <button type="submit" className="btn-hg btn-primary-hg" disabled={saving}>
            {saving ? <LoadingSpinner size="sm" /> : <><FiSave size={15} /> Save Changes</>}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="data-card">
        <h6 style={{ fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiLock size={16} color="#1565C0" /> Change Password
        </h6>
        <form onSubmit={changePassword}>
          {[
            { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
            { key: 'newPw',   label: 'New Password',     placeholder: 'Min 6 characters' },
            { key: 'confirm', label: 'Confirm Password', placeholder: 'Repeat new password' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} style={{ marginBottom: '1rem' }}>
              <label className="form-label-hg">{label}</label>
              <input type="password" className={`form-control-hg${pwErrors[key] ? ' is-invalid' : ''}`}
                placeholder={placeholder} value={pwForm[key]}
                onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))} />
              {pwErrors[key] && <div className="form-error">{pwErrors[key]}</div>}
            </div>
          ))}
          <button type="submit" className="btn-hg btn-primary-hg" disabled={pwSaving}>
            {pwSaving ? <LoadingSpinner size="sm" /> : <><FiLock size={15} /> Change Password</>}
          </button>
        </form>
      </div>
    </div>
  )
}
