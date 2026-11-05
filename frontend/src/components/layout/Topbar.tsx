
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronDown,
  CircleUserRound,
  LogOut,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'

function Topbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const handleLogout = () => {
    setProfileMenuOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="breadcrumb">
          <span className="breadcrumb-muted">Security</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Operations Center</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-search">
          <Search size={16} />
          <input type="text" placeholder="Search..." aria-label="Search" />
          <span className="search-shortcut">Ctrl K</span>
        </div>

        <div className="system-indicator">
          <span className="system-indicator-dot" />
          <span>Operational</span>
        </div>

        <button className="icon-button" type="button" aria-label="Notifications">
          <Bell size={18} />
          <span className="notification-dot" />
        </button>

        <div style={{ position: 'relative' }}>
          <button
            className="profile-button"
            type="button"
            aria-expanded={profileMenuOpen}
            onClick={() => setProfileMenuOpen((open) => !open)}
          >
            <div className="profile-avatar">
              <CircleUserRound size={18} />
            </div>
            <div className="profile-info">
              <span className="profile-name">
                {user?.username ?? 'User'}
              </span>
              <span className="profile-role">
                {user?.role ?? 'Account'}
              </span>
            </div>
            <ChevronDown size={15} />
          </button>

          {profileMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                zIndex: 1000,
                width: 230,
                padding: 12,
                background: '#111827',
                border: '1px solid #293548',
                borderRadius: 10,
                boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
              }}
            >
              <div style={{ padding: '6px 8px 12px' }}>
                <div style={{ color: '#f3f4f6', fontSize: 13, fontWeight: 600 }}>
                  {user?.username ?? 'User'}
                </div>
                <div
                  style={{
                    color: '#9ca3af',
                    fontSize: 12,
                    marginTop: 4,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {user?.email ?? ''}
                </div>
                <div style={{ color: '#60a5fa', fontSize: 12, marginTop: 5 }}>
                  {user?.role ?? 'Account'}
                </div>
              </div>

              <div style={{ height: 1, background: '#293548', marginBottom: 8 }} />

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  width: '100%',
                  padding: '10px 8px',
                  border: 0,
                  borderRadius: 6,
                  background: 'transparent',
                  color: '#fca5a5',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 13,
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>

        <div className="security-badge">
          <ShieldCheck size={16} />
        </div>
      </div>
    </header>
  )
}

export default Topbar
