import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpenCheck,
  Bug,
  Cable,
  ClipboardList,
  Database,
  FileBarChart,
  FileSearch,
  FileText,
  FolderSearch,
  KeyRound,
  LayoutDashboard,
  Network,
  Scale,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Users,
} from 'lucide-react'

import { NavLink } from 'react-router-dom'

const navigationItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    label: 'Security Posture',
    icon: ShieldAlert,
    path: '/security-posture',
  },
  {
    label: 'Security Metrics',
    icon: FileBarChart,
    path: '/security-metrics',
  },
  {
    label: 'Security Reports',
    icon: FileText,
    path: '/reports',
  },
  {
    label: 'Risk Management',
    icon: ShieldAlert,
    path: '/risks',
  },
  {
    label: 'Policy Management',
    icon: BookOpenCheck,
    path: '/policies',
  },
  {
    label: 'Security Exceptions',
    icon: ShieldAlert,
    path: '/exceptions',
  },
  {
    label: 'Security Automation',
    path: '/automation',
    icon: Activity,
  },
  {
    label: 'Security Integrations',
    icon: Cable,
    path: '/integrations',
  },
  {
    label: 'Compliance',
    icon: Scale,
    path: '/compliance',
  },
  {
    label: 'Endpoints',
    icon: Users,
    path: '/endpoints',
  },
  {
    label: 'Alerts',
    icon: AlertTriangle,
    path: '/alerts',
    badge: 3,
  },
  {
    label: 'Network',
    icon: Network,
    path: '/network',
  },
  {
    label: 'Processes',
    icon: Activity,
    path: '/processes',
  },
  {
    label: 'File Integrity',
    icon: FolderSearch,
    path: '/file-integrity',
  },
  {
    label: 'Forensics',
    icon: FileSearch,
    path: '/forensics',
  },
  {
    label: 'Audit Logs',
    icon: BarChart3,
    path: '/audit-logs',
  },
  {
    label: 'Detection Rules',
    icon: ShieldCheck,
    path: '/detection-rules',
  },
  {
    label: 'Incidents',
    icon: ClipboardList,
    path: '/incidents',
  },
  {
    label: 'Threat Intelligence',
    icon: Database,
    path: '/threat-intelligence',
  },
  {
    label: 'Identity',
    path: '/identity',
    icon: KeyRound,
  },
  {
    label: 'Vulnerabilities',
    path: '/vulnerabilities',
    icon: Bug,
  },
  {
    label: 'SOC',
    path: '/soc',
    icon: Activity,
  },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Shield size={22} />
        </div>

        <div>
          <div className="brand-name">
            CyberSentinel
          </div>

          <div className="brand-subtitle">
            SECURITY PLATFORM
          </div>
        </div>
      </div>

      <div className="sidebar-section-label">
        OPERATIONS
      </div>

      <nav className="sidebar-navigation">
        {navigationItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />

              <span>{item.label}</span>

              {item.badge && (
                <span className="sidebar-badge">
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-section-label">
          SYSTEM
        </div>

        <button className="sidebar-item">
          <Terminal size={18} />
          <span>Command Center</span>
        </button>

        <button className="sidebar-item">
          <Settings size={18} />
          <span>Settings</span>
        </button>

        <div className="system-status">
          <span className="status-dot" />

          <div>
            <div className="status-title">
              System Operational
            </div>

            <div className="status-subtitle">
              All services online
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar