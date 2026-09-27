import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import Footer from '../components/layout/Footer'

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar isCollapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      <div className={`main-content${collapsed ? ' sidebar-collapsed' : ''}`}>
        <Navbar onToggleSidebar={() => setCollapsed(v => !v)} />
        <main className="page-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
