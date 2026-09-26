import { useMemo, useState } from 'react'

import {
  AlertTriangle,
  ChevronDown,
  Clock3,
  Search,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'

import { Link } from 'react-router-dom'

type AlertSeverity = 'HIGH' | 'MEDIUM' | 'LOW'

type AlertStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED'

type SecurityAlert = {
  id: string
  title: string
  description: string
  severity: AlertSeverity
  status: AlertStatus
  endpoint: string
  process: string
  detectedAt: string
}

const alerts: SecurityAlert[] = [
  {
    id: 'ALERT-001',
    title: 'Suspicious Process Detected',
    description:
      'Unknown executable activity triggered a behavioral detection rule.',
    severity: 'HIGH',
    status: 'OPEN',
    endpoint: 'WIN-01',
    process: 'powershell.exe',
    detectedAt: '2 min ago',
  },
  {
    id: 'ALERT-002',
    title: 'Outbound Connection Detected',
    description:
      'An unexpected outbound connection was observed from a monitored endpoint.',
    severity: 'MEDIUM',
    status: 'INVESTIGATING',
    endpoint: 'KALI-01',
    process: 'curl',
    detectedAt: '7 min ago',
  },
  {
    id: 'ALERT-003',
    title: 'File Integrity Change',
    description:
      'A protected system file was modified on a monitored endpoint.',
    severity: 'LOW',
    status: 'OPEN',
    endpoint: 'LINUX-01',
    process: 'systemd',
    detectedAt: '14 min ago',
  },
  {
    id: 'ALERT-004',
    title: 'Authentication Activity',
    description:
      'New authentication activity was observed on an endpoint.',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    endpoint: 'WIN-02',
    process: 'winlogon.exe',
    detectedAt: '31 min ago',
  },
]

function Alerts() {
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const highAlerts = alerts.filter(
    (alert) => alert.severity === 'HIGH',
  ).length

  const mediumAlerts = alerts.filter(
    (alert) => alert.severity === 'MEDIUM',
  ).length

  const lowAlerts = alerts.filter(
    (alert) => alert.severity === 'LOW',
  ).length

  const activeAlerts = alerts.filter(
    (alert) => alert.status !== 'RESOLVED',
  ).length

  const filteredAlerts = useMemo(() => {
    const search = searchTerm.toLowerCase()

    return alerts.filter((alert) => {
      const matchesSearch =
        alert.id.toLowerCase().includes(search) ||
        alert.title.toLowerCase().includes(search) ||
        alert.endpoint.toLowerCase().includes(search) ||
        alert.process.toLowerCase().includes(search)

      const matchesSeverity =
        severityFilter === 'ALL' ||
        alert.severity === severityFilter

      const matchesStatus =
        statusFilter === 'ALL' ||
        alert.status === statusFilter

      return (
        matchesSearch &&
        matchesSeverity &&
        matchesStatus
      )
    })
  }, [searchTerm, severityFilter, statusFilter])

  return (
    <div className="page-container">

      {/* =========================================
          PAGE HEADER
          ========================================= */}

      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            SECURITY MONITORING
          </div>

          <h1>Alerts</h1>

          <p>
            Detect, triage, and investigate security events
            across monitored endpoints.
          </p>
        </div>

        <div className="page-status page-alert-status">
          <span />
          {activeAlerts} ACTIVE ALERTS
        </div>
      </div>

      {/* =========================================
          ALERT SUMMARY
          ========================================= */}

      <section className="alert-summary-grid">

        <div className="alert-summary-card">
          <div className="alert-summary-label">
            ACTIVE ALERTS
          </div>

          <div className="alert-summary-value">
            {String(activeAlerts).padStart(2, '0')}
          </div>

          <div className="alert-summary-description">
            Require analyst review
          </div>
        </div>

        <div className="alert-summary-card alert-summary-high">
          <div className="alert-summary-label">
            HIGH
          </div>

          <div className="alert-summary-value">
            {String(highAlerts).padStart(2, '0')}
          </div>

          <div className="alert-summary-description">
            Critical attention
          </div>
        </div>

        <div className="alert-summary-card alert-summary-medium">
          <div className="alert-summary-label">
            MEDIUM
          </div>

          <div className="alert-summary-value">
            {String(mediumAlerts).padStart(2, '0')}
          </div>

          <div className="alert-summary-description">
            Investigation required
          </div>
        </div>

        <div className="alert-summary-card alert-summary-low">
          <div className="alert-summary-label">
            LOW
          </div>

          <div className="alert-summary-value">
            {String(lowAlerts).padStart(2, '0')}
          </div>

          <div className="alert-summary-description">
            Lower priority events
          </div>
        </div>

      </section>

      {/* =========================================
          FILTER BAR
          ========================================= */}

      <div className="alert-toolbar">

        <div className="page-search">
          <Search size={16} />

          <input
            type="text"
            placeholder="Search alert, endpoint or process..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <div className="alert-filter">

          <ShieldAlert size={15} />

          <select
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(event.target.value)
            }
          >
            <option value="ALL">All Severity</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

        </div>

        <div className="alert-filter">

          <ChevronDown size={15} />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="INVESTIGATING">
              Investigating
            </option>
            <option value="RESOLVED">Resolved</option>
          </select>

        </div>

      </div>

      {/* =========================================
          RESULT COUNT
          ========================================= */}

      <div className="alert-result-count">
        Showing {filteredAlerts.length} of {alerts.length}{' '}
        alerts
      </div>

      {/* =========================================
          ALERT LIST
          ========================================= */}

      <div className="alert-list">

        {filteredAlerts.length > 0 ? (

          filteredAlerts.map((alert) => (

            <Link
              key={alert.id}
              to={`/alerts/${alert.id}`}
              className="alert-list-item"
            >

              {/* SEVERITY ICON */}

              <div
                className={`alert-list-icon alert-list-${alert.severity.toLowerCase()}`}
              >
                <AlertTriangle size={19} />
              </div>

              {/* MAIN CONTENT */}

              <div className="alert-list-content">

                <div className="alert-list-title-row">

                  <h3>
                    {alert.title}
                  </h3>

                  <span
                    className={`alert-list-severity alert-list-severity-${alert.severity.toLowerCase()}`}
                  >
                    {alert.severity}
                  </span>

                </div>

                <p>
                  {alert.description}
                </p>

                <div className="alert-list-meta">

                  <span>
                    {alert.id}
                  </span>

                  <span>
                    {alert.endpoint}
                  </span>

                  <span>
                    {alert.process}
                  </span>

                </div>

              </div>

              {/* RIGHT SIDE */}

              <div className="alert-list-right">

                <div
                  className={`alert-list-status alert-status-${alert.status.toLowerCase()}`}
                >
                  {alert.status === 'RESOLVED' ? (
                    <ShieldCheck size={14} />
                  ) : (
                    <ShieldAlert size={14} />
                  )}

                  {alert.status}
                </div>

                <div className="alert-list-time">
                  <Clock3 size={12} />
                  {alert.detectedAt}
                </div>

              </div>

            </Link>

          ))

        ) : (

          <div className="alert-empty-state">

            <ShieldCheck size={28} />

            <strong>
              No alerts found
            </strong>

            <p>
              Try changing your search or filters.
            </p>

          </div>

        )}

      </div>

    </div>
  )
}

export default Alerts