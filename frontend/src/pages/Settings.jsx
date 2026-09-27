import { FiMoon, FiBell, FiGlobe, FiSun } from 'react-icons/fi'
import { useSettings } from '../context/SettingsContext'
import { LANGUAGES } from '../utils/constants'
import Alert from '../components/common/Alert'
import { useState } from 'react'

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      width: 48, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer',
      background: checked ? '#1565C0' : '#D1D5DB',
      position: 'relative', transition: 'background 0.3s', flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 3, left: checked ? 24 : 3,
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        transition: 'left 0.3s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

function SettingRow({ label, description, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1rem 0', borderBottom: '1px solid var(--border)',
    }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{label}</div>
        {description && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>{description}</div>}
      </div>
      {children}
    </div>
  )
}

export default function Settings() {
  const { settings, toggleDarkMode, updateNotification, updateSettings } = useSettings()
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: 660, margin: '0 auto' }}>
      <div className="page-header"><h1>Settings</h1><p>Customize your experience.</p></div>

      {saved && <Alert type="success" message="Settings saved!" autoClose={3000} onDismiss={() => setSaved(false)} />}

      {/* Appearance */}
      <div className="data-card" style={{ marginBottom: '1.25rem' }}>
        <h6 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {settings.darkMode ? <FiMoon size={16} color="#1565C0" /> : <FiSun size={16} color="#1565C0" />} Appearance
        </h6>
        <SettingRow
          label="Dark Mode"
          description="Switch to dark theme for reduced eye strain.">
          <Toggle checked={settings.darkMode} onChange={toggleDarkMode} />
        </SettingRow>
      </div>

      {/* Notifications */}
      <div className="data-card" style={{ marginBottom: '1.25rem' }}>
        <h6 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiBell size={16} color="#1565C0" /> Notifications
        </h6>
        <SettingRow label="Email Notifications" description="Receive claim status updates via email.">
          <Toggle checked={settings.notifications.email} onChange={v => updateNotification('email', v)} />
        </SettingRow>
        <SettingRow label="Browser Notifications" description="Get real-time alerts in your browser.">
          <Toggle checked={settings.notifications.browser} onChange={v => updateNotification('browser', v)} />
        </SettingRow>
        <SettingRow label="SMS Notifications" description="Receive alerts via text message.">
          <Toggle checked={settings.notifications.sms} onChange={v => updateNotification('sms', v)} />
        </SettingRow>
      </div>

      {/* Language */}
      <div className="data-card" style={{ marginBottom: '1.25rem' }}>
        <h6 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiGlobe size={16} color="#1565C0" /> Language
        </h6>
        <div style={{ padding: '1rem 0' }}>
          <label className="form-label-hg">Display Language</label>
          <select className="form-control-hg" style={{ maxWidth: 280 }}
            value={settings.language}
            onChange={e => updateSettings({ language: e.target.value })}>
            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
      </div>

      <button className="btn-hg btn-primary-hg" onClick={handleSave}>Save Settings</button>
    </div>
  )
}
