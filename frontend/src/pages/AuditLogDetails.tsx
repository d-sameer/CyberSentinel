import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  Globe,
  Hash,
  Monitor,
  Network,
  ShieldAlert,
  Terminal,
  User,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

type AuditSeverity = 'INFO' | 'WARNING' | 'HIGH'

type AuditStatus =
  | 'SUCCESS'
  | 'REVIEW'
  | 'BLOCKED'
  | 'REVIEWED'

type AuditDetailsData = {
  id: string
  timestamp: string
  action: string
  category: string
  severity: AuditSeverity
  status: AuditStatus | string
  user: string
  endpoint: string
  sourceIp: string
  description: string
  eventSource: string
  process: string
  pid: string
  command: string
  relatedFile: string
  networkActivity: string
  eventCode: string
  assessment: string
}

type AuditApiAction = {
  id: number
  action_id: string
  log_id: string
  action: string
  status: string
  analyst: string
  created_at: string
}

const API_BASE_URL = 'http://127.0.0.1:8001'

const AUDIT_ACTIONS = [
  {
    action: 'START_INVESTIGATION',
    title: 'Start Investigation',
    description:
      'Create a persistent analyst investigation record for this audit event.',
    icon: Activity,
  },
  {
    action: 'PRESERVE_EVENT',
    title: 'Preserve Event Data',
    description:
      'Record that the original audit event metadata should be retained.',
    icon: CheckCircle2,
  },
  {
    action: 'CORRELATE_ACTIVITY',
    title: 'Correlate Activity',
    description:
      'Record analyst correlation of process, file, and network telemetry.',
    icon: Network,
  },
  {
    action: 'MARK_REVIEWED',
    title: 'Mark Reviewed',
    description:
      'Mark the audit event as reviewed and close the current review step.',
    icon: ShieldAlert,
  },
] as const


type RawRecord = Record<string, unknown>

function asText(value: unknown, fallback = '—'): string {
  if (value === null || value === undefined || value === '') return fallback
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  return fallback
}

function firstValue(record: RawRecord, keys: string[], fallback = '—'): string {
  for (const key of keys) {
    const value = record[key]
    if (value !== null && value !== undefined && value !== '') return asText(value, fallback)
  }
  return fallback
}

function unwrapRecord(value: unknown): RawRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const record = value as RawRecord
  for (const key of ['item', 'result', 'audit_log', 'auditLog', 'data']) {
    const nested = record[key]
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) return nested as RawRecord
  }
  return record
}

function normalizeAuditDetail(value: unknown, requestedId: string): AuditDetailsData {
  const raw = unwrapRecord(value)
  const severityValue = firstValue(raw, ['severity', 'level', 'risk_level'], 'INFO').toUpperCase()
  const severity: AuditSeverity = severityValue === 'HIGH' || severityValue === 'CRITICAL' ? 'HIGH' : severityValue === 'WARNING' || severityValue === 'MEDIUM' ? 'WARNING' : 'INFO'
  const statusValue = firstValue(raw, ['status', 'result', 'outcome'], 'REVIEW').toUpperCase().replaceAll(' ', '_')
  return {
    id: firstValue(raw, ['id', 'log_id', 'logId', 'event_id', 'eventId', 'audit_id', 'auditId'], requestedId),
    timestamp: firstValue(raw, ['timestamp', 'created_at', 'createdAt', 'event_time', 'eventTime', 'time'], 'Time unavailable'),
    action: firstValue(raw, ['action', 'event', 'event_name', 'eventName', 'title', 'activity'], 'Audit Event'),
    category: firstValue(raw, ['category', 'event_category', 'eventCategory', 'type'], 'SYSTEM').toUpperCase(),
    severity,
    status: statusValue,
    user: firstValue(raw, ['user', 'username', 'user_name', 'userName', 'actor', 'analyst'], 'Unknown user'),
    endpoint: firstValue(raw, ['endpoint', 'host', 'hostname', 'device', 'endpoint_name', 'endpointName'], 'Unknown endpoint'),
    sourceIp: firstValue(raw, ['sourceIp', 'source_ip', 'src_ip', 'srcIp', 'ip_address', 'ipAddress', 'ip'], '—'),
    description: firstValue(raw, ['description', 'message', 'details', 'summary'], 'No event description provided.'),
    eventSource: firstValue(raw, ['eventSource', 'event_source', 'source', 'provider', 'log_source', 'logSource'], 'Unknown source'),
    process: firstValue(raw, ['process', 'process_name', 'processName', 'image'], '—'),
    pid: firstValue(raw, ['pid', 'process_id', 'processId'], '—'),
    command: firstValue(raw, ['command', 'command_line', 'commandLine', 'cmdline', 'activity'], 'No command details available.'),
    relatedFile: firstValue(raw, ['relatedFile', 'related_file', 'file_path', 'filePath', 'file'], '—'),
    networkActivity: firstValue(raw, ['networkActivity', 'network_activity', 'network', 'connection'], 'No related network activity recorded.'),
    eventCode: firstValue(raw, ['eventCode', 'event_code', 'event_id_code', 'eventIdCode', 'code'], '—'),
    assessment: firstValue(raw, ['assessment', 'analyst_assessment', 'analystAssessment', 'interpretation'], 'No analyst assessment has been recorded.'),
  }
}

function unwrapArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object') {
    const raw = value as RawRecord
    for (const key of ['items', 'results', 'actions', 'audit_actions', 'auditActions', 'data']) {
      if (Array.isArray(raw[key])) return raw[key] as unknown[]
    }
  }
  return []
}

function normalizeAuditAction(value: unknown, index: number, logId: string): AuditApiAction {
  const raw = value && typeof value === 'object' ? value as RawRecord : {}
  return {
    id: Number(raw.id ?? index + 1),
    action_id: firstValue(raw, ['action_id', 'actionId', 'id'], `ACTION-${index + 1}`),
    log_id: firstValue(raw, ['log_id', 'logId', 'audit_log_id', 'auditLogId'], logId),
    action: firstValue(raw, ['action', 'type', 'name'], 'UNKNOWN_ACTION').toUpperCase().replaceAll(' ', '_'),
    status: firstValue(raw, ['status', 'result', 'state'], 'RECORDED').toUpperCase().replaceAll(' ', '_'),
    analyst: firstValue(raw, ['analyst', 'user', 'username', 'actor'], 'SOC Analyst'),
    created_at: firstValue(raw, ['created_at', 'createdAt', 'timestamp', 'time'], ''),
  }
}

function formatActionDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

function AuditLogDetails() {
  const { logId } = useParams()

  const [log, setLog] = useState<AuditDetailsData | null>(null)
  const [actions, setActions] = useState<AuditApiAction[]>([])

  const [loading, setLoading] = useState(true)
  const [loadingActions, setLoadingActions] = useState(true)

  const [submittingAction, setSubmittingAction] =
    useState<string | null>(null)

  const [actionError, setActionError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [backendConnected, setBackendConnected] = useState(false)

  useEffect(() => {
    if (!logId) {
      setLoading(false)
      setLoadingActions(false)
      return
    }

    const currentLogId = logId

    let cancelled = false

    async function loadAuditData() {
      setLoading(true)
      setLoadingActions(true)
      setLoadError('')

      try {
        const [detailResponse, actionResponse] =
          await Promise.all([
            fetch(
              `${API_BASE_URL}/api/audit-logs/${encodeURIComponent(
                currentLogId,
              )}`,
            ),
            fetch(
              `${API_BASE_URL}/api/audit-logs/${encodeURIComponent(
                currentLogId,
              )}/actions`,
            ),
          ])

        if (!detailResponse.ok) {
          throw new Error(
            `Audit detail request failed with status ${detailResponse.status}`,
          )
        }

        const detailPayload: unknown = await detailResponse.json()
        const detailData = normalizeAuditDetail(detailPayload, currentLogId)

        let actionData: AuditApiAction[] = []

        if (actionResponse.ok) {
          const actionPayload: unknown = await actionResponse.json()
          actionData = unwrapArray(actionPayload).map((item, index) => normalizeAuditAction(item, index, currentLogId))
        }

        if (!cancelled) {
          setLog(detailData)
          setActions(actionData)
          setBackendConnected(true)
        }
      } catch (error) {
        console.error(
          'Audit log detail request failed:',
          error,
        )

        if (!cancelled) {
          setLog(null)
          setActions([])
          setBackendConnected(false)
          setLoadError(
            'Unable to load this audit event from the CyberSentinel API.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          setLoadingActions(false)
        }
      }
    }

    loadAuditData()

    return () => {
      cancelled = true
    }
  }, [logId])

  async function executeAuditAction(action: string) {
    if (!logId || submittingAction) {
      return
    }

    setSubmittingAction(action)
    setActionError('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/audit-logs/${encodeURIComponent(
          logId,
        )}/actions`,
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
        const errorText = await response.text()

        throw new Error(
          errorText ||
            `Action failed with status ${response.status}`,
        )
      }

      const createdPayload: unknown = await response.json()
      const created = normalizeAuditAction(createdPayload, actions.length, logId)

      setActions((current) => [created, ...current])
      setBackendConnected(true)

      if (action === 'MARK_REVIEWED') {
        setLog((current) =>
          current
            ? {
                ...current,
                status: 'REVIEWED',
              }
            : current,
        )
      }
    } catch (error) {
      console.error(
        'Audit response action failed:',
        error,
      )

      setActionError(
        'Response action failed. Check that the CyberSentinel API is running.',
      )
    } finally {
      setSubmittingAction(null)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          Loading audit event...
        </div>
      </div>
    )
  }

  if (!log) {
    return (
      <div className="page-container">
        <div className="audit-detail-not-found">
          <ShieldAlert size={30} />

          <h2>Audit Event Not Found</h2>

          <p>
            {loadError ||
              'The requested audit event does not exist in the CyberSentinel backend.'}
          </p>

          <Link
            to="/audit-logs"
            className="audit-back-link"
          >
            <ArrowLeft size={14} />
            Back to Audit Logs
          </Link>
        </div>
      </div>
    )
  }

  const severityClass = log.severity.toLowerCase()
  const statusClass = log.status.toLowerCase()

  return (
    <div className="page-container">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="page-header">
        <div>
          <Link
            to="/audit-logs"
            className="audit-detail-back"
          >
            <ArrowLeft size={14} />
            AUDIT LOG CENTER
          </Link>

          <div className="page-eyebrow">
            AUDIT EVENT INVESTIGATION
          </div>

          <h1>{log.action}</h1>

          <p>
            Detailed investigation of audit event {log.id}.
          </p>
        </div>

        <div
          className={`audit-detail-status audit-detail-status-${statusClass}`}
        >
          <span />
          {log.status}
        </div>
      </div>

      {/* =====================================================
          EVENT HERO
      ===================================================== */}

      <section className="audit-detail-hero">
        <div className="audit-detail-identity">
          <div className="audit-detail-icon">
            <FileText size={23} />
          </div>

          <div>
            <div className="audit-detail-name">
              {log.action}
            </div>

            <div className="audit-detail-id">
              {log.id} · {log.category}
            </div>
          </div>
        </div>

        <div className="audit-detail-endpoint">
          <span>ENDPOINT</span>
          <strong>{log.endpoint}</strong>
        </div>

        <div className="audit-detail-endpoint">
          <span>USER</span>
          <strong>{log.user}</strong>
        </div>
      </section>

      {/* =====================================================
          METRICS
      ===================================================== */}

      <section className="audit-detail-metrics">
        <div className="audit-detail-metric">
          <Clock3 size={17} />
          <span>EVENT TIME</span>
          <strong>{log.timestamp}</strong>
        </div>

        <div className="audit-detail-metric">
          <ShieldAlert size={17} />
          <span>SEVERITY</span>
          <strong
            className={`audit-detail-value-${severityClass}`}
          >
            {log.severity}
          </strong>
        </div>

        <div className="audit-detail-metric">
          <Globe size={17} />
          <span>SOURCE IP</span>
          <strong>{log.sourceIp}</strong>
        </div>

        <div className="audit-detail-metric">
          <Hash size={17} />
          <span>EVENT CODE</span>
          <strong>{log.eventCode}</strong>
        </div>
      </section>

      {/* =====================================================
          EVENT CONTEXT + ASSESSMENT
      ===================================================== */}

      <section className="audit-detail-grid">
        <div className="audit-detail-panel">
          <div className="audit-detail-panel-header">
            <div>
              <strong>Event Context</strong>
              <span>
                Identity and source information
              </span>
            </div>

            <FileText size={18} />
          </div>

          <div className="audit-detail-fields">
            <div>
              <span>EVENT ID</span>
              <strong>{log.id}</strong>
            </div>

            <div>
              <span>CATEGORY</span>
              <strong>{log.category}</strong>
            </div>

            <div>
              <span>USER</span>
              <strong>{log.user}</strong>
            </div>

            <div>
              <span>ENDPOINT</span>
              <strong>{log.endpoint}</strong>
            </div>

            <div>
              <span>SOURCE IP</span>
              <strong>{log.sourceIp}</strong>
            </div>

            <div>
              <span>EVENT SOURCE</span>
              <strong>{log.eventSource}</strong>
            </div>

            <div className="audit-detail-field-wide">
              <span>DESCRIPTION</span>
              <strong>{log.description}</strong>
            </div>
          </div>
        </div>

        <div className="audit-detail-panel">
          <div className="audit-detail-panel-header">
            <div>
              <strong>Analyst Assessment</strong>
              <span>
                Current security interpretation
              </span>
            </div>

            <ShieldAlert size={18} />
          </div>

          <div className="audit-assessment">
            <div
              className={`audit-assessment-banner audit-assessment-${severityClass}`}
            >
              {log.severity === 'INFO' ? (
                <CheckCircle2 size={17} />
              ) : (
                <AlertTriangle size={17} />
              )}

              <div>
                <strong>
                  {log.severity} SEVERITY
                </strong>

                <span>Event classification</span>
              </div>
            </div>

            <div className="audit-assessment-row">
              <span>Assessment</span>
              <strong>{log.assessment}</strong>
            </div>

            <div className="audit-assessment-row">
              <span>Status</span>
              <strong>{log.status}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ACTIVITY CORRELATION
      ===================================================== */}

      <section className="audit-detail-panel audit-correlation-panel">
        <div className="audit-detail-panel-header">
          <div>
            <strong>Activity Correlation</strong>
            <span>
              Related telemetry identified around this event
            </span>
          </div>

          <Activity size={18} />
        </div>

        <div className="audit-correlation-grid">
          <div className="audit-correlation-card">
            <div className="audit-correlation-icon">
              <Terminal size={16} />
            </div>

            <span>PROCESS</span>

            <strong>{log.process}</strong>

            <small>PID {log.pid}</small>
          </div>

          <div className="audit-correlation-card">
            <div className="audit-correlation-icon">
              <FileText size={16} />
            </div>

            <span>RELATED FILE</span>

            <strong>{log.relatedFile}</strong>
          </div>

          <div className="audit-correlation-card">
            <div className="audit-correlation-icon">
              <Network size={16} />
            </div>

            <span>NETWORK ACTIVITY</span>

            <strong>{log.networkActivity}</strong>
          </div>
        </div>
      </section>

      {/* =====================================================
          EXECUTION + USER CONTEXT
      ===================================================== */}

      <section className="audit-detail-grid">
        <div className="audit-detail-panel">
          <div className="audit-detail-panel-header">
            <div>
              <strong>Execution Details</strong>
              <span>
                Process and command context
              </span>
            </div>

            <Terminal size={18} />
          </div>

          <div className="audit-execution">
            <div className="audit-execution-row">
              <span>PROCESS</span>
              <strong>{log.process}</strong>
            </div>

            <div className="audit-execution-row">
              <span>PID</span>
              <strong>{log.pid}</strong>
            </div>

            <div className="audit-execution-command">
              <span>COMMAND / ACTIVITY</span>
              <code>{log.command}</code>
            </div>
          </div>
        </div>

        <div className="audit-detail-panel">
          <div className="audit-detail-panel-header">
            <div>
              <strong>User & Endpoint Context</strong>
              <span>
                Account and system information
              </span>
            </div>

            <User size={18} />
          </div>

          <div className="audit-user-context">
            <div className="audit-context-item">
              <div className="audit-context-icon">
                <User size={15} />
              </div>

              <div>
                <span>USER</span>
                <strong>{log.user}</strong>
              </div>
            </div>

            <div className="audit-context-item">
              <div className="audit-context-icon">
                <Monitor size={15} />
              </div>

              <div>
                <span>ENDPOINT</span>
                <strong>{log.endpoint}</strong>
              </div>
            </div>

            <div className="audit-context-item">
              <div className="audit-context-icon">
                <Globe size={15} />
              </div>

              <div>
                <span>SOURCE IP</span>
                <strong>{log.sourceIp}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TIMELINE + ACTIONS
      ===================================================== */}

      <section className="audit-detail-grid">
        <div className="audit-detail-panel">
          <div className="audit-detail-panel-header">
            <div>
              <strong>Event Timeline</strong>
              <span>
                Activity surrounding the audit event
              </span>
            </div>

            <Clock3 size={18} />
          </div>

          <div className="audit-detail-timeline">
            <div className="audit-detail-timeline-item">
              <span />

              <div>
                <strong>
                  User / system activity detected
                </strong>

                <small>{log.timestamp}</small>
              </div>
            </div>

            <div className="audit-detail-timeline-item">
              <span />

              <div>
                <strong>Audit event recorded</strong>
                <small>+02 seconds</small>
              </div>
            </div>

            <div className="audit-detail-timeline-item">
              <span />

              <div>
                <strong>
                  Related telemetry correlated
                </strong>

                <small>+14 seconds</small>
              </div>
            </div>

            <div className="audit-detail-timeline-item">
              <span />

              <div>
                <strong>
                  Event assigned for analyst review
                </strong>

                <small>+31 seconds</small>
              </div>
            </div>
          </div>
        </div>

        <div className="audit-detail-panel">
          <div className="audit-detail-panel-header">
            <div>
              <strong>Investigation Actions</strong>
              <span>
                Backend-persistent analyst workflow
              </span>
            </div>

            <Activity size={18} />
          </div>

          <div className="audit-action-list">
            {AUDIT_ACTIONS.map((item) => {
              const Icon = item.icon

              const isSubmitting =
                submittingAction === item.action

              return (
                <button
                  key={item.action}
                  type="button"
                  className="audit-action-item"
                  onClick={() =>
                    executeAuditAction(item.action)
                  }
                  disabled={Boolean(submittingAction)}
                  style={{
                    width: '100%',
                    border: 'none',
                    textAlign: 'left',
                    background: 'transparent',
                    color: 'inherit',
                    font: 'inherit',
                    cursor: submittingAction
                      ? 'wait'
                      : 'pointer',
                    opacity:
                      submittingAction &&
                      !isSubmitting
                        ? 0.55
                        : 1,
                  }}
                >
                  <div className="audit-action-icon">
                    <Icon size={15} />
                  </div>

                  <div>
                    <strong>
                      {isSubmitting
                        ? 'Processing...'
                        : item.title}
                    </strong>

                    <span>
                      {item.description}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          <div
            style={{
              marginTop: '18px',
              padding: '12px 14px',
              borderTop:
                '1px solid rgba(148, 163, 184, 0.12)',
              fontSize: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span
                style={{
                  color: '#64748b',
                  letterSpacing: '0.08em',
                }}
              >
                RESPONSE STATUS
              </span>

              <strong
                style={{
                  color: '#22d3ee',
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                }}
              >
                {backendConnected ? 'BACKEND CONNECTED' : 'API UNAVAILABLE'}
              </strong>
            </div>

            {actionError && (
              <div
                style={{
                  color: '#f87171',
                  marginTop: '10px',
                }}
              >
                {actionError}
              </div>
            )}

            <div style={{ marginTop: '14px' }}>
              <div
                style={{
                  color: '#64748b',
                  letterSpacing: '0.08em',
                  marginBottom: '8px',
                }}
              >
                RESPONSE HISTORY
              </div>

              {loadingActions ? (
                <div style={{ color: '#64748b' }}>
                  Loading response history...
                </div>
              ) : actions.length > 0 ? (
                actions.map((item) => (
                  <div
                    key={item.action_id}
                    style={{
                      padding: '9px 0',
                      borderBottom:
                        '1px solid rgba(148, 163, 184, 0.08)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <strong>
                        {item.action.replaceAll(
                          '_',
                          ' ',
                        )}
                      </strong>

                      <span
                        style={{
                          color: '#22d3ee',
                        }}
                      >
                        {item.status.replaceAll(
                          '_',
                          ' ',
                        )}
                      </span>
                    </div>

                    <small
                      style={{
                        color: '#64748b',
                      }}
                    >
                      {item.action_id} ·{' '}
                      {item.analyst} ·{' '}
                      {formatActionDate(
                        item.created_at,
                      )}
                    </small>
                  </div>
                ))
              ) : (
                <div style={{ color: '#64748b' }}>
                  No response actions recorded for
                  this audit event.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          NOTES
      ===================================================== */}

      <section className="audit-detail-panel audit-notes-panel">
        <div className="audit-detail-panel-header">
          <div>
            <strong>Investigation Notes</strong>

            <span>
              Initial analyst observations
            </span>
          </div>

          <FileText size={18} />
        </div>

        <div className="audit-notes">
          <p>
            <AlertTriangle size={14} />
            Review this event together with endpoint,
            process, file, and network telemetry.
          </p>

          <p>
            <Activity size={14} />
            Event correlation helps establish the
            sequence of actions surrounding the recorded
            activity.
          </p>

          <p>
            <ShieldAlert size={14} />
            Preserve relevant audit records before taking
            containment or remediation actions.
          </p>
        </div>
      </section>
    </div>
  )
}

export default AuditLogDetails