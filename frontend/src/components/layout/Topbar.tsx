import {
  Bell,
  ChevronDown,
  CircleUserRound,
  Search,
  ShieldCheck,
} from 'lucide-react'

function Topbar() {
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
          <input
            type="text"
            placeholder="Search..."
            aria-label="Search"
          />
          <span className="search-shortcut">⌘ K</span>
        </div>

        <div className="system-indicator">
          <span className="system-indicator-dot" />
          <span>Operational</span>
        </div>

        <button className="icon-button" aria-label="Notifications">
          <Bell size={18} />
          <span className="notification-dot" />
        </button>

        <button className="profile-button">
          <div className="profile-avatar">
            <CircleUserRound size={18} />
          </div>

          <div className="profile-info">
            <span className="profile-name">Security Admin</span>
            <span className="profile-role">Administrator</span>
          </div>

          <ChevronDown size={15} />
        </button>

        <div className="security-badge">
          <ShieldCheck size={16} />
        </div>
      </div>
    </header>
  )
}

export default Topbar