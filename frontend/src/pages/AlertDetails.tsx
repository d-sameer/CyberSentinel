import { useEffect, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileSearch,
  Link2,
  LockKeyhole,
  Network,
  Server,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  UserRound,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

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
  event_id: string | null
  incident_id: string | null
}

type AlertAction = {
  id: number
  action_id: string
  alert_id: string
  action: string
  status: string
  analyst: string
  created_at: string
}

const fallbackAlerts: Record<string, Alert> = {
  'ALT-018': {
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
    event_id: 'EVT-1048',
    incident_id: 'INC-003',
  },
  'ALT-021': {
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
    event_id: 'EVT-1047',
    incident_id: 'INC-001',
  },
  'ALT-007': {
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
    event_id: 'EVT-1046',
    incident_id: 'INC-002',
  },
  'ALT-031': {
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
    event_id: 'EVT-1045',
    incident_id: 'INC-006',
  },
  'ALT-034': {
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
    event_id: 'EVT-1043',
    incident_id: 'INC-007',
  },
  'ALT-037': {
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
    event_id: 'EVT-1042',
    incident_id: null,
  },
}

function severityClass(severity: string) {
  return `alert-detail-severity alert-detail-${severity.toLowerCase()}`
}

function statusClass(status: string) {
  const value = status.toLowerCase()

  if (value === 'investigating') {
    return 'alert-detail-status alert-detail-status-cyan'
  }

  if (value === 'alerted') {
    return 'alert-detail-status alert-detail-status-orange'
  }

  if (value === 'blocked') {
    return 'alert-detail-status alert-detail-status-green'
  }

  return 'alert-detail-status alert-detail-status-slate'
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function AlertDetails() {
  const { alertId } = useParams()

  const [alert, setAlert] = useState<Alert | null>(
    alertId ? fallbackAlerts[alertId] ?? null : null,
  )

  const [loading, setLoading] = useState(true)
  const [apiOnline, setApiOnline] = useState(false)
  const [alertActions, setAlertActions] = useState<AlertAction[]>([])
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    const loadAlert = async () => {
      if (!alertId) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/alerts/${alertId}`,
        )

        if (!response.ok) {
          throw new Error('Alert request failed')
        }

        const data: Alert = await response.json()

        setAlert(data)
        setApiOnline(true)
      } catch {
        setAlert(fallbackAlerts[alertId] ?? null)
        setApiOnline(false)
      } finally {
        setLoading(false)
      }
    }

    loadAlert()
  }, [alertId])

  useEffect(() => {
    const loadAlertActions = async () => {
      if (!alertId) {
        return
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/alerts/${alertId}/actions`,
        )

        if (!response.ok) {
          throw new Error('Alert actions request failed')
        }

        const data: AlertAction[] = await response.json()
        setAlertActions(data)
      } catch (error) {
        console.error('Failed to load alert actions:', error)
      }
    }

    loadAlertActions()
  }, [alertId])

  async function executeAlertAction(
    action: string,
    successMessage: string,
  ) {
    if (!alertId || actionLoading) {
      return
    }

    try {
      setActionLoading(true)
      setActionMessage('')
      setActionError('')

      const response = await fetch(
        `http://127.0.0.1:8000/api/alerts/${alertId}/actions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action,
            analyst: 'SOC Analyst',
          }),
        },
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)

        throw new Error(
          errorData?.detail ||
            `Alert action failed with status ${response.status}`,
        )
      }

      const createdAction: AlertAction = await response.json()

      setAlertActions((current) => [createdAction, ...current])
      setActionMessage(successMessage)

      if (action === 'INVESTIGATE' || action === 'MARK_REVIEWED') {
        setAlert((current) =>
          current
            ? {
                ...current,
                status:
                  action === 'INVESTIGATE'
                    ? 'INVESTIGATING'
                    : 'REVIEWED',
              }
            : current,
        )
      }
    } catch (error) {
      console.error('Failed to execute alert action:', error)

      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to execute alert response action.',
      )
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="alert-detail-loading">
        <Activity size={18} />
        Loading alert investigation...
      </div>
    )
  }

  if (!alert) {
    return (
      <div className="alert-detail-not-found">
        <AlertTriangle size={22} />

        <h2>Alert not found</h2>

        <p>
          The requested security alert could not be found.
        </p>

        <Link to="/alerts">
          <ArrowLeft size={15} />
          Back to Alert Center
        </Link>
      </div>
    )
  }

  return (
    <div className="alert-detail-page">

      <Link
        to="/alerts"
        className="alert-detail-back"
      >
        <ArrowLeft size={15} />
        Back to Alert Center
      </Link>

      <section className="alert-detail-hero">

        <div className="alert-detail-hero-icon">
          <ShieldAlert size={28} />
        </div>

        <div className="alert-detail-hero-main">

          <div className="alert-detail-eyebrow">
            ALERT INVESTIGATION
          </div>

          <div className="alert-detail-id">
            {alert.alert_id}
          </div>

          <h1>
            {alert.title}
          </h1>

          <p>
            {alert.description}
          </p>

          <div className="alert-detail-tags">

            <span className={severityClass(alert.severity)}>
              {alert.severity}
            </span>

            <span className={statusClass(alert.status)}>
              {alert.status}
            </span>

            <span className="alert-detail-category">
              {alert.category}
            </span>

          </div>

        </div>

        <div className="alert-detail-api-status">
          <span className={apiOnline ? 'online' : 'offline'} />
          {apiOnline ? 'API CONNECTED' : 'DEMO DATA'}
        </div>

      </section>

      <section className="alert-detail-metrics">

        <div>
          <Clock3 size={17} />

          <span>EVENT TIME</span>

          <strong>
            {formatDate(alert.created_at)}
          </strong>
        </div>

        <div>
          <Server size={17} />

          <span>AFFECTED ASSET</span>

          <strong>
            {alert.asset}
          </strong>
        </div>

        <div>
          <ShieldCheck size={17} />

          <span>CONFIDENCE</span>

          <strong>
            {alert.confidence}%
          </strong>
        </div>

        <div>
          <FileSearch size={17} />

          <span>DETECTION RULE</span>

          <strong>
            {alert.rule_id}
          </strong>
        </div>

      </section>

      <div className="alert-detail-grid">

        <div className="alert-detail-column">

          <section className="alert-detail-panel">

            <div className="alert-detail-panel-heading">
              <Network size={17} />

              <div>
                <span>TELEMETRY CONTEXT</span>
                <h2>Security Activity</h2>
              </div>
            </div>

            <div className="alert-detail-list">

              <div>
                <span>Source</span>
                <strong>{alert.source}</strong>
              </div>

              <div>
                <span>Category</span>
                <strong>{alert.category}</strong>
              </div>

              <div>
                <span>Asset</span>
                <strong>{alert.asset}</strong>
              </div>

              <div>
                <span>Detection Rule</span>
                <strong>{alert.rule_id}</strong>
              </div>

            </div>

          </section>

          <section className="alert-detail-panel">

            <div className="alert-detail-panel-heading">
              <Terminal size={17} />

              <div>
                <span>DETECTION CONTEXT</span>
                <h2>Rule Evaluation</h2>
              </div>
            </div>

            <div className="alert-detail-rule">

              <div>
                <span>Rule Identifier</span>
                <strong>{alert.rule_id}</strong>
              </div>

              <div>
                <span>Detection Confidence</span>

                <div className="alert-detail-confidence">
                  <div>
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
              </div>

              <div>
                <span>Evaluation Result</span>

                <strong className="alert-detail-positive">
                  Detection confirmed
                </strong>
              </div>

            </div>

          </section>

        </div>

        <div className="alert-detail-column">

          <section className="alert-detail-panel">

            <div className="alert-detail-panel-heading">
              <ShieldCheck size={17} />

              <div>
                <span>SECURITY CONTEXT</span>
                <h2>Investigation Status</h2>
              </div>
            </div>

            <div className="alert-detail-status-card">

              <div className="alert-detail-status-icon">
                {alert.status === 'BLOCKED'
                  ? <CheckCircle2 size={22} />
                  : <AlertTriangle size={22} />}
              </div>

              <div>
                <strong>
                  {alert.status}
                </strong>

                <p>
                  Alert is currently tracked by the
                  CyberSentinel investigation workflow.
                </p>
              </div>

            </div>

          </section>

          <section className="alert-detail-panel">

            <div className="alert-detail-panel-heading">
              <Link2 size={17} />

              <div>
                <span>CORRELATION CONTEXT</span>
                <h2>Related Security Objects</h2>
              </div>
            </div>

            <div className="alert-detail-list">

              <div>
                <span>Related Event</span>

                {alert.event_id ? (
                  <Link
                    to={`/soc/events/${alert.event_id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#67e8f9',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    {alert.event_id}
                    <ExternalLink size={13} />
                  </Link>
                ) : (
                  <strong>Not correlated</strong>
                )}
              </div>

              <div>
                <span>Related Incident</span>

                {alert.incident_id ? (
                  <Link
                    to={`/incidents/${alert.incident_id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#67e8f9',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    {alert.incident_id}
                    <ExternalLink size={13} />
                  </Link>
                ) : (
                  <strong>Not correlated</strong>
                )}
              </div>

              <div>
                <span>Correlation Source</span>
                <strong>
                  {apiOnline
                    ? 'Backend Security Event correlation'
                    : 'Fallback demo correlation'}
                </strong>
              </div>

            </div>

          </section>

          <section className="alert-detail-panel">

            <div className="alert-detail-panel-heading">
              <UserRound size={17} />

              <div>
                <span>ANALYST CONTEXT</span>
                <h2>Investigation Notes</h2>
              </div>
            </div>

            <div className="alert-detail-notes">

              <p>
                This alert has been correlated with
                endpoint and security telemetry for
                further investigation.
              </p>

              <div className="alert-detail-note">
                <CheckCircle2 size={15} />
                Detection telemetry successfully correlated.
              </div>

              <div className="alert-detail-note">
                <CheckCircle2 size={15} />
                Asset context identified.
              </div>

              <div className="alert-detail-note">
                <AlertTriangle size={15} />
                Analyst review remains recommended.
              </div>

            </div>

          </section>

        </div>

      </div>

      <section className="alert-detail-response">

        <div>
          <div className="alert-detail-response-icon">
            <LockKeyhole size={19} />
          </div>

          <div>
            <span>RESPONSE WORKFLOW</span>
            <h2>Investigation Actions</h2>
          </div>
        </div>

        <div className="alert-detail-actions">

          <button
            type="button"
            disabled={actionLoading}
            onClick={() =>
              executeAlertAction(
                'INVESTIGATE',
                'Alert marked as INVESTIGATING.',
              )
            }
          >
            <ShieldAlert size={15} />
            {actionLoading ? 'Processing...' : 'Investigate'}
          </button>

          <button
            type="button"
            disabled={actionLoading}
            onClick={() =>
              executeAlertAction(
                'MARK_REVIEWED',
                'Alert marked as REVIEWED.',
              )
            }
          >
            <CheckCircle2 size={15} />
            Mark Reviewed
          </button>

          <button
            type="button"
            disabled={actionLoading}
            onClick={() => {
              if (alert.event_id) {
                window.location.href = `/soc/events/${alert.event_id}`
                return
              }

              if (alert.incident_id) {
                window.location.href = `/incidents/${alert.incident_id}`
                return
              }

              void executeAlertAction(
                'OPEN_RELATED_CONTEXT',
                'No related event or incident is currently available.',
              )
            }}
          >
            <ExternalLink size={15} />
            Open Related Context
          </button>

        </div>

        {(actionMessage || actionError) && (
          <div
            style={{
              marginTop: '14px',
              padding: '10px 12px',
              borderRadius: '8px',
              border: actionError
                ? '1px solid rgba(239, 68, 68, 0.25)'
                : '1px solid rgba(34, 211, 238, 0.2)',
              background: actionError
                ? 'rgba(239, 68, 68, 0.06)'
                : 'rgba(34, 211, 238, 0.05)',
              color: actionError ? '#fca5a5' : '#67e8f9',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {actionError || actionMessage}
          </div>
        )}

        {alertActions.length > 0 && (
          <div
            style={{
              marginTop: '18px',
              borderTop: '1px solid rgba(148, 163, 184, 0.12)',
              paddingTop: '14px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                letterSpacing: '0.08em',
                color: '#64748b',
                fontWeight: 800,
                marginBottom: '10px',
              }}
            >
              RESPONSE HISTORY
            </div>

            <div
              style={{
                display: 'grid',
                gap: '8px',
              }}
            >
              {alertActions.map((item) => (
                <div
                  key={item.action_id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '9px 10px',
                    borderRadius: '7px',
                    background: 'rgba(15, 23, 42, 0.55)',
                    border: '1px solid rgba(148, 163, 184, 0.08)',
                    fontSize: '12px',
                  }}
                >
                  <div>
                    <strong style={{ color: '#cbd5e1' }}>
                      {item.action.replaceAll('_', ' ')}
                    </strong>
                    <div style={{ color: '#64748b', marginTop: '3px' }}>
                      {item.analyst}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ color: '#67e8f9' }}>
                      {item.status}
                    </strong>
                    <div style={{ color: '#64748b', marginTop: '3px' }}>
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </section>

    </div>
  )
}

export default AlertDetails
