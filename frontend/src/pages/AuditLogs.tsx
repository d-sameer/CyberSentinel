import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  Filter,
  KeyRound,
  Monitor,
  Search,
  ShieldAlert,
  User,
  UserCog,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type AuditCategory =
  | 'AUTH'
  | 'ADMIN'
  | 'SECURITY'
  | 'SYSTEM'

type AuditSeverity =
  | 'INFO'
  | 'WARNING'
  | 'HIGH'

type AuditStatus =
  | 'SUCCESS'
  | 'REVIEW'
  | 'BLOCKED'

type AuditLog = {
  id: string
  timestamp: string
  action: string
  category: AuditCategory
  severity: AuditSeverity
  status: AuditStatus
  user: string
  endpoint: string
  sourceIp: string
  description: string
}

const auditLogs: AuditLog[] = [
  {
    id: 'LOG-001',
    timestamp: 'Today, 10:06:14',
    action: 'PowerShell Execution',
    category: 'SECURITY',
    severity: 'HIGH',
    status: 'REVIEW',
    user: 'Sameer',
    endpoint: 'WIN-01',
    sourceIp: '192.168.1.101',
    description:
      'PowerShell launched with ExecutionPolicy Bypass and executed update.ps1.',
  },
  {
    id: 'LOG-002',
    timestamp: 'Today, 10:05:58',
    action: 'User Login',
    category: 'AUTH',
    severity: 'INFO',
    status: 'SUCCESS',
    user: 'Sameer',
    endpoint: 'WIN-01',
    sourceIp: '192.168.1.101',
    description:
      'Interactive user authentication completed successfully.',
  },
  {
    id: 'LOG-003',
    timestamp: 'Today, 10:06:42',
    action: 'Outbound Connection',
    category: 'SECURITY',
    severity: 'HIGH',
    status: 'REVIEW',
    user: 'Sameer',
    endpoint: 'WIN-01',
    sourceIp: '192.168.1.101',
    description:
      'Outbound HTTPS connection observed after suspicious process execution.',
  },
  {
    id: 'LOG-004',
    timestamp: 'Today, 10:18:33',
    action: 'Privilege Change',
    category: 'ADMIN',
    severity: 'WARNING',
    status: 'REVIEW',
    user: 'admin',
    endpoint: 'LINUX-01',
    sourceIp: '192.168.1.104',
    description:
      'Administrative privileges were assigned to an existing account.',
  },
  {
    id: 'LOG-005',
    timestamp: 'Today, 10:25:11',
    action: 'Unknown Binary Execution',
    category: 'SECURITY',
    severity: 'HIGH',
    status: 'REVIEW',
    user: 'Sameer',
    endpoint: 'WIN-02',
    sourceIp: '192.168.1.103',
    description:
      'Unsigned executable launched from the user temporary directory.',
  },
  {
    id: 'LOG-006',
    timestamp: 'Today, 10:26:39',
    action: 'Security File Deletion',
    category: 'SECURITY',
    severity: 'HIGH',
    status: 'BLOCKED',
    user: 'SYSTEM',
    endpoint: 'WIN-02',
    sourceIp: '192.168.1.103',
    description:
      'Protected security configuration file deletion was blocked.',
  },
  {
    id: 'LOG-007',
    timestamp: 'Today, 10:27:12',
    action: 'Authentication Failure',
    category: 'AUTH',
    severity: 'WARNING',
    status: 'REVIEW',
    user: 'unknown',
    endpoint: 'WIN-02',
    sourceIp: '10.0.0.45',
    description:
      'Multiple failed authentication attempts were recorded.',
  },
  {
    id: 'LOG-008',
    timestamp: 'Today, 10:31:04',
    action: 'SSH Key Modification',
    category: 'ADMIN',
    severity: 'WARNING',
    status: 'SUCCESS',
    user: 'admin',
    endpoint: 'LINUX-01',
    sourceIp: '192.168.1.104',
    description:
      'authorized_keys configuration was modified during an SSH session.',
  },
  {
    id: 'LOG-009',
    timestamp: 'Today, 10:42:18',
    action: 'Endpoint Policy Update',
    category: 'ADMIN',
    severity: 'INFO',
    status: 'SUCCESS',
    user: 'SOC Analyst',
    endpoint: 'WIN-01',
    sourceIp: '192.168.1.10',
    description:
      'Endpoint monitoring policy was updated successfully.',
  },
  {
    id: 'LOG-010',
    timestamp: 'Today, 10:48:51',
    action: 'System Service Start',
    category: 'SYSTEM',
    severity: 'INFO',
    status: 'SUCCESS',
    user: 'SYSTEM',
    endpoint: 'WIN-02',
    sourceIp: '192.168.1.103',
    description:
      'Windows security monitoring service started successfully.',
  },
]

function AuditLogs() {
  const [search, setSearch] = useState('')

  const [categoryFilter, setCategoryFilter] = useState<
    'ALL' | AuditCategory
  >('ALL')

  const [severityFilter, setSeverityFilter] = useState<
    'ALL' | AuditSeverity
  >('ALL')

  const infoCount = auditLogs.filter(
    (log) => log.severity === 'INFO',
  ).length

  const warningCount = auditLogs.filter(
    (log) => log.severity === 'WARNING',
  ).length

  const highCount = auditLogs.filter(
    (log) => log.severity === 'HIGH',
  ).length

  const reviewCount = auditLogs.filter(
    (log) => log.status === 'REVIEW',
  ).length

  const filteredLogs = useMemo(() => {
    const query = search.toLowerCase().trim()

    return auditLogs.filter((log) => {
      const matchesSearch =
        !query ||
        log.id.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.category.toLowerCase().includes(query) ||
        log.user.toLowerCase().includes(query) ||
        log.endpoint.toLowerCase().includes(query) ||
        log.sourceIp.toLowerCase().includes(query) ||
        log.description.toLowerCase().includes(query)

      const matchesCategory =
        categoryFilter === 'ALL' ||
        log.category === categoryFilter

      const matchesSeverity =
        severityFilter === 'ALL' ||
        log.severity === severityFilter

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSeverity
      )
    })
  }, [search, categoryFilter, severityFilter])

  return (
    <div className="page-container">

      {/* =========================================
          PAGE HEADER
          ========================================= */}

      <div className="page-header">

        <div>

          <div className="page-eyebrow">
            SECURITY AUDITING & EVENT CORRELATION
          </div>

          <h1>Audit Logs</h1>

          <p>
            Review authentication, administrative, security,
            and system activity across monitored endpoints.
          </p>

        </div>

        <div className="page-status page-audit-status">
          <span />
          AUDIT COLLECTION ACTIVE
        </div>

      </div>

      {/* =========================================
          SUMMARY
          ========================================= */}

      <section className="audit-summary-grid">

        <div className="audit-summary-card">

          <div className="audit-summary-top">
            <span>TOTAL EVENTS</span>
            <Activity size={17} />
          </div>

          <strong>
            {String(auditLogs.length).padStart(2, '0')}
          </strong>

          <p>
            Audit events collected
          </p>

        </div>

        <div className="audit-summary-card">

          <div className="audit-summary-top">
            <span>INFORMATION</span>
            <CheckCircle2 size={17} />
          </div>

          <strong>
            {String(infoCount).padStart(2, '0')}
          </strong>

          <p>
            Routine activity
          </p>

        </div>

        <div className="audit-summary-card audit-summary-warning">

          <div className="audit-summary-top">
            <span>WARNING</span>
            <AlertTriangle size={17} />
          </div>

          <strong>
            {String(warningCount).padStart(2, '0')}
          </strong>

          <p>
            Requires review
          </p>

        </div>

        <div className="audit-summary-card audit-summary-danger">

          <div className="audit-summary-top">
            <span>HIGH RISK</span>
            <ShieldAlert size={17} />
          </div>

          <strong>
            {String(highCount).padStart(2, '0')}
          </strong>

          <p>
            Security investigation
          </p>

        </div>

      </section>

      {/* =========================================
          ACTIVITY OVERVIEW
          ========================================= */}

      <section className="audit-overview-grid">

        <div className="audit-panel">

          <div className="audit-panel-header">

            <div>

              <div className="audit-panel-title">
                Audit Activity
              </div>

              <div className="audit-panel-subtitle">
                Event volume across the current monitoring
                window
              </div>

            </div>

            <Activity size={18} />

          </div>

          <div className="audit-activity-chart">

            <div className="audit-chart-grid">
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="audit-activity-bars">

              <div style={{ height: '34%' }} />
              <div style={{ height: '51%' }} />
              <div style={{ height: '43%' }} />
              <div style={{ height: '72%' }} />
              <div style={{ height: '57%' }} />
              <div style={{ height: '88%' }} />
              <div style={{ height: '62%' }} />
              <div style={{ height: '76%' }} />
              <div style={{ height: '48%' }} />
              <div style={{ height: '68%' }} />

            </div>

            <div className="audit-time-labels">
              <span>08:00</span>
              <span>09:00</span>
              <span>10:00</span>
              <span>11:00</span>
            </div>

          </div>

        </div>

        <div className="audit-panel">

          <div className="audit-panel-header">

            <div>

              <div className="audit-panel-title">
                Event Categories
              </div>

              <div className="audit-panel-subtitle">
                Distribution of recorded audit activity
              </div>

            </div>

            <Filter size={18} />

          </div>

          <div className="audit-category-list">

            <div className="audit-category-item">

              <div className="audit-category-icon">
                <KeyRound size={15} />
              </div>

              <div>
                <strong>Authentication</strong>
                <span>
                  Login and authentication activity
                </span>
              </div>

              <b>02</b>

            </div>

            <div className="audit-category-item">

              <div className="audit-category-icon">
                <UserCog size={15} />
              </div>

              <div>
                <strong>Administrative</strong>
                <span>
                  Privilege and configuration changes
                </span>
              </div>

              <b>03</b>

            </div>

            <div className="audit-category-item">

              <div className="audit-category-icon">
                <ShieldAlert size={15} />
              </div>

              <div>
                <strong>Security</strong>
                <span>
                  Threat-related security events
                </span>
              </div>

              <b>04</b>

            </div>

            <div className="audit-category-item">

              <div className="audit-category-icon">
                <Monitor size={15} />
              </div>

              <div>
                <strong>System</strong>
                <span>
                  Operating system activity
                </span>
              </div>

              <b>01</b>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          MONITORING SOURCES
          ========================================= */}

      <section className="audit-source-panel">

        <div className="audit-source-header">

          <div>

            <div className="audit-panel-title">
              Audit Collection Sources
            </div>

            <div className="audit-panel-subtitle">
              Security telemetry sources currently reporting
            </div>

          </div>

          <FileText size={18} />

        </div>

        <div className="audit-source-grid">

          <div className="audit-source-card">

            <div className="audit-source-icon">
              <KeyRound size={16} />
            </div>

            <div>
              <strong>Authentication Logs</strong>
              <span>Windows / Linux</span>
            </div>

            <b>ACTIVE</b>

          </div>

          <div className="audit-source-card">

            <div className="audit-source-icon">
              <UserCog size={16} />
            </div>

            <div>
              <strong>Administrative Events</strong>
              <span>Privilege / Policy changes</span>
            </div>

            <b>ACTIVE</b>

          </div>

          <div className="audit-source-card">

            <div className="audit-source-icon">
              <ShieldAlert size={16} />
            </div>

            <div>
              <strong>Security Events</strong>
              <span>Threat and detection telemetry</span>
            </div>

            <b>ACTIVE</b>

          </div>

          <div className="audit-source-card">

            <div className="audit-source-icon">
              <Monitor size={16} />
            </div>

            <div>
              <strong>System Events</strong>
              <span>Endpoint operating system logs</span>
            </div>

            <b>ACTIVE</b>

          </div>

        </div>

      </section>

      {/* =========================================
          FILTERS
          ========================================= */}

      <div className="audit-toolbar">

        <div className="audit-search">

          <Search size={15} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search event, user, endpoint, IP..."
          />

        </div>

        <div className="audit-filter-group">

          {(
            [
              'ALL',
              'AUTH',
              'ADMIN',
              'SECURITY',
              'SYSTEM',
            ] as const
          ).map((category) => (

            <button
              key={category}
              type="button"
              className={
                categoryFilter === category
                  ? 'audit-filter-button audit-filter-active'
                  : 'audit-filter-button'
              }
              onClick={() =>
                setCategoryFilter(category)
              }
            >
              {category}
            </button>

          ))}

        </div>

        <div className="audit-severity-group">

          {(
            [
              'ALL',
              'INFO',
              'WARNING',
              'HIGH',
            ] as const
          ).map((severity) => (

            <button
              key={severity}
              type="button"
              className={
                severityFilter === severity
                  ? 'audit-severity-button audit-severity-active'
                  : 'audit-severity-button'
              }
              onClick={() =>
                setSeverityFilter(severity)
              }
            >
              {severity}
            </button>

          ))}

        </div>

        <div className="audit-result-count">
          {filteredLogs.length} events
        </div>

      </div>

      {/* =========================================
          REVIEW INDICATOR
          ========================================= */}

      <div className="audit-review-strip">

        <div className="audit-review-icon">
          <Clock3 size={15} />
        </div>

        <div>

          <strong>
            {reviewCount} events require analyst review
          </strong>

          <span>
            Review high-risk activity and unusual
            authentication or administrative events.
          </span>

        </div>

        <ShieldAlert size={16} />

      </div>

      {/* =========================================
          AUDIT EVENT TABLE
          ========================================= */}

      <section className="audit-panel audit-table-panel">

        <div className="audit-panel-header">

          <div>

            <div className="audit-panel-title">
              Audit Event Repository
            </div>

            <div className="audit-panel-subtitle">
              Detailed endpoint activity and security events
            </div>

          </div>

          <FileText size={18} />

        </div>

        <div className="audit-table-wrapper">

          <table className="audit-table">

            <thead>

              <tr>
                <th>EVENT</th>
                <th>CATEGORY</th>
                <th>USER</th>
                <th>ENDPOINT</th>
                <th>SOURCE IP</th>
                <th>TIME</th>
                <th>SEVERITY</th>
                <th>STATUS</th>
              </tr>

            </thead>

            <tbody>

              {filteredLogs.map((log) => (

                <tr
                  key={log.id}
                  className="audit-clickable-row"
                >

                  <td>

                    <Link
                      to={`/audit-logs/${log.id}`}
                      className="audit-event-link"
                    >

                      <div className="audit-event-cell">

                        <div className="audit-event-icon">
                          <FileText size={14} />
                        </div>

                        <div>

                          <strong>
                            {log.action}
                          </strong>

                          <span>
                            {log.id}
                          </span>

                        </div>

                      </div>

                    </Link>

                  </td>

                  <td>

                    <span className="audit-category">
                      {log.category}
                    </span>

                  </td>

                  <td>

                    <div className="audit-user-cell">

                      <User size={12} />

                      <span>
                        {log.user}
                      </span>

                    </div>

                  </td>

                  <td className="audit-mono">
                    {log.endpoint}
                  </td>

                  <td className="audit-mono">
                    {log.sourceIp}
                  </td>

                  <td className="audit-mono">
                    {log.timestamp}
                  </td>

                  <td>

                    <span
                      className={`audit-severity audit-severity-${log.severity.toLowerCase()}`}
                    >
                      <span />
                      {log.severity}
                    </span>

                  </td>

                  <td>

                    <span
                      className={`audit-event-status audit-event-status-${log.status.toLowerCase()}`}
                    >
                      <span />
                      {log.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {filteredLogs.length === 0 && (
            <div className="audit-empty-state">

              <Search size={22} />

              <strong>
                No matching audit events
              </strong>

              <span>
                Try changing the search or event filters.
              </span>

            </div>
          )}

        </div>

      </section>

    </div>
  )
}

export default AuditLogs