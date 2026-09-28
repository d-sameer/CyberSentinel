import { useEffect, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileSearch,
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

      {/* BACK */}
      <Link
        to="/alerts"
        className="alert-detail-back"
      >
        <ArrowLeft size={15} />
        Back to Alert Center
      </Link>

      {/* HEADER */}
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

      {/* OVERVIEW */}
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

      {/* TWO COLUMN */}
      <div className="alert-detail-grid">

        {/* LEFT */}
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

        {/* RIGHT */}
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

      {/* RESPONSE */}
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

          <button type="button">
            <ShieldAlert size={15} />
            Investigate
          </button>

          <button type="button">
            <CheckCircle2 size={15} />
            Mark Reviewed
          </button>

          <button type="button">
            <ExternalLink size={15} />
            Open Related Context
          </button>

        </div>

      </section>

    </div>
  )
}

export default AlertDetails