import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'

type Alert = {
  id: number
  alert_id: string
  title: string
  description: string
  severity: string
  status: string
  category: string
  source: string
  asset: string
  rule_id: string
  confidence: number
  created_at: string
}

const fallbackAlerts: Alert[] = [
  {
    id: 1,
    alert_id: 'ALT-018',
    title: 'Malicious outbound connection detected',
    description:
      'Suspicious outbound HTTPS communication was detected from WIN-01 and correlated with PowerShell activity.',
    severity: 'CRITICAL',
    status: 'INVESTIGATING',
    category: 'Network',
    source: 'Network Sensor',
    asset: 'WIN-01',
    rule_id: 'DET-005',
    confidence: 98,
    created_at: '2026-09-27T22:41:08',
  },
  {
    id: 2,
    alert_id: 'ALT-021',
    title: 'PowerShell execution policy bypass',
    description:
      'PowerShell execution with policy bypass indicators was detected on WIN-02.',
    severity: 'HIGH',
    status: 'ALERTED',
    category: 'Execution',
    source: 'Endpoint Agent',
    asset: 'WIN-02',
    rule_id: 'DET-001',
    confidence: 94,
    created_at: '2026-09-27T22:41:05',
  },
  {
    id: 3,
    alert_id: 'ALT-007',
    title: 'Multiple authentication failures',
    description:
      'Repeated failed RDP authentication attempts were detected against WIN-02.',
    severity: 'MEDIUM',
    status: 'BLOCKED',
    category: 'Identity',
    source: 'Identity Monitor',
    asset: 'WIN-02',
    rule_id: 'DET-003',
    confidence: 91,
    created_at: '2026-09-27T22:40:59',
  },
  {
    id: 4,
    alert_id: 'ALT-031',
    title: 'Unsigned process execution detected',
    description:
      'An unsigned executable was observed running from a non-standard location on WIN-04.',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    category: 'Process',
    source: 'EDR Sensor',
    asset: 'WIN-04',
    rule_id: 'DET-008',
    confidence: 89,
    created_at: '2026-09-27T22:40:54',
  },
  {
    id: 5,
    alert_id: 'ALT-034',
    title: 'Security file deletion attempt',
    description:
      'A protected security-related file deletion attempt was detected and blocked.',
    severity: 'HIGH',
    status: 'BLOCKED',
    category: 'Defense Evasion',
    source: 'File Integrity',
    asset: 'WIN-02',
    rule_id: 'DET-011',
    confidence: 96,
    created_at: '2026-09-27T22:40:42',
  },
  {
    id: 6,
    alert_id: 'ALT-037',
    title: 'New administrative group membership',
    description:
      'A user account was added to an administrative security group on WIN-03.',
    severity: 'MEDIUM',
    status: 'REVIEW',
    category: 'Privilege',
    source: 'Identity Monitor',
    asset: 'WIN-03',
    rule_id: 'DET-014',
    confidence: 87,
    created_at: '2026-09-27T22:40:36',
  },
]

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function severityClass(severity: string) {
  return `alerts-severity alerts-severity-${severity.toLowerCase()}`
}

function statusClass(status: string) {
  const value = status.toLowerCase()

  if (value === 'investigating') {
    return 'alerts-status alerts-status-investigating'
  }

  if (value === 'alerted') {
    return 'alerts-status alerts-status-alerted'
  }

  if (value === 'blocked') {
    return 'alerts-status alerts-status-blocked'
  }

  return 'alerts-status alerts-status-review'
}

function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>(fallbackAlerts)
  const [loading, setLoading] = useState(true)
  const [apiOnline, setApiOnline] = useState(false)
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const loadAlerts = async () => {
    setLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/alerts',
      )

      if (!response.ok) {
        throw new Error('Failed to fetch alerts')
      }

      const data: Alert[] = await response.json()

      setAlerts(data)
      setApiOnline(true)
    } catch {
      setAlerts(fallbackAlerts)
      setApiOnline(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  const filteredAlerts = alerts.filter((alert) => {
    const query = search.toLowerCase().trim()

    const matchesSearch =
      !query ||
      alert.alert_id.toLowerCase().includes(query) ||
      alert.title.toLowerCase().includes(query) ||
      alert.asset.toLowerCase().includes(query) ||
      alert.category.toLowerCase().includes(query) ||
      alert.source.toLowerCase().includes(query)

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

  const criticalCount = alerts.filter(
    (alert) => alert.severity === 'CRITICAL',
  ).length

  const highCount = alerts.filter(
    (alert) => alert.severity === 'HIGH',
  ).length

  const investigatingCount = alerts.filter(
    (alert) => alert.status === 'INVESTIGATING',
  ).length

  const blockedCount = alerts.filter(
    (alert) => alert.status === 'BLOCKED',
  ).length

  return (
    <div className="alerts-api-page">

      {/* HEADER */}
      <div className="alerts-api-header">

        <div>
          <div className="alerts-api-eyebrow">
            SECURITY MONITORING
          </div>

          <h1 className="alerts-api-title">
            Alert Center
          </h1>

          <p className="alerts-api-subtitle">
            Investigate, filter and track security alerts across the environment.
          </p>
        </div>

        <div className="alerts-api-header-actions">

          <div
            className={
              apiOnline
                ? 'alerts-api-connection'
                : 'alerts-api-connection alerts-api-connection-offline'
            }
          >
            <span />
            {apiOnline ? 'API CONNECTED' : 'DEMO DATA'}
          </div>

          <button
            className="alerts-api-refresh"
            type="button"
            onClick={loadAlerts}
            disabled={loading}
          >
            <RefreshCw
              size={14}
              className={loading ? 'alerts-api-spin' : ''}
            />
            Refresh
          </button>

        </div>

      </div>

      {/* METRICS */}
      <div className="alerts-api-metrics">

        <div className="alerts-api-metric">
          <div className="alerts-api-metric-icon critical">
            <ShieldAlert size={18} />
          </div>

          <div>
            <span>Critical Alerts</span>
            <strong>{criticalCount}</strong>
          </div>
        </div>

        <div className="alerts-api-metric">
          <div className="alerts-api-metric-icon high">
            <AlertTriangle size={18} />
          </div>

          <div>
            <span>High Severity</span>
            <strong>{highCount}</strong>
          </div>
        </div>

        <div className="alerts-api-metric">
          <div className="alerts-api-metric-icon investigating">
            <Clock3 size={18} />
          </div>

          <div>
            <span>Investigating</span>
            <strong>{investigatingCount}</strong>
          </div>
        </div>

        <div className="alerts-api-metric">
          <div className="alerts-api-metric-icon blocked">
            <ShieldCheck size={18} />
          </div>

          <div>
            <span>Blocked</span>
            <strong>{blockedCount}</strong>
          </div>
        </div>

      </div>

      {/* FILTER BAR */}
      <div className="alerts-api-toolbar">

        <div className="alerts-api-search">
          <Search size={15} />

          <input
            type="text"
            placeholder="Search alerts, assets, categories..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          value={severityFilter}
          onChange={(event) =>
            setSeverityFilter(event.target.value)
          }
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="ALL">All Statuses</option>
          <option value="INVESTIGATING">Investigating</option>
          <option value="ALERTED">Alerted</option>
          <option value="BLOCKED">Blocked</option>
          <option value="REVIEW">Review</option>
        </select>

      </div>

      {/* TABLE */}
      <section className="alerts-api-panel">

        <div className="alerts-api-panel-header">

          <div>
            <h2>
              Security Alerts
            </h2>

            <p>
              {loading
                ? 'Loading alert telemetry...'
                : `${filteredAlerts.length} of ${alerts.length} alerts`}
            </p>
          </div>

          <div className="alerts-api-source">
            {apiOnline
              ? 'FASTAPI /api/alerts'
              : 'LOCAL FALLBACK'}
          </div>

        </div>

        <div className="alerts-api-table-wrapper">

          <table className="alerts-api-table">

            <thead>
              <tr>
                <th>Alert</th>
                <th>Severity</th>
                <th>Category</th>
                <th>Asset</th>
                <th>Source</th>
                <th>Confidence</th>
                <th>Status</th>
                <th>Time</th>
                <th />
              </tr>
            </thead>

            <tbody>

              {filteredAlerts.map((alert) => (
                <tr key={alert.alert_id}>

                  <td>
                    <div className="alerts-api-alert-cell">
                      
                      <Link
                        to={`/alerts/${alert.alert_id}`}
                        className="alerts-api-alert-link"
                      >
                        <span className="alerts-api-alert-id">
                          {alert.alert_id}
                        </span>
                        
                        <strong>
                          {alert.title}
                        </strong>
                      </Link>
                      
                      <small>
                        {alert.rule_id}
                      </small>
                      
                    </div>
                  </td>

                  <td>
                    <span
                      className={severityClass(
                        alert.severity,
                      )}
                    >
                      {alert.severity}
                    </span>
                  </td>

                  <td>
                    <span className="alerts-api-category">
                      {alert.category}
                    </span>
                  </td>

                  <td>
                    <span className="alerts-api-asset">
                      {alert.asset}
                    </span>
                  </td>

                  <td>
                    <span className="alerts-api-source">
                      {alert.source}
                    </span>
                  </td>

                  <td>
                    <div className="alerts-api-confidence">
                      <div className="alerts-api-confidence-bar">
                        <span
                          style={{
                            width: `${alert.confidence}%`,
                          }}
                        />
                      </div>

                      <strong>
                        {alert.confidence}%
                      </strong>
                    </div>
                  </td>

                  <td>
                    <span
                      className={statusClass(
                        alert.status,
                      )}
                    >
                      {alert.status}
                    </span>
                  </td>

                  <td>
                    <span className="alerts-api-time">
                      {formatTime(alert.created_at)}
                    </span>
                  </td>

                  <td>
                    <Link
                      to={`/alerts/${alert.alert_id}`}
                      className="alerts-api-view"
                      title="Investigate alert"
                    >
                      <ArrowUpRight size={15} />
                    </Link>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

          {filteredAlerts.length === 0 && (
            <div className="alerts-api-empty">
              <CheckCircle2 size={20} />
              <span>No alerts match the current filters.</span>
            </div>
          )}

        </div>

      </section>

    </div>
  )
}

export default Alerts