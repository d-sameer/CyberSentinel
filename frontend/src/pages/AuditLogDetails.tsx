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
type AuditStatus = 'SUCCESS' | 'REVIEW' | 'BLOCKED' | 'REVIEWED'

type AuditDetailsData = {
  id: string
  timestamp: string
  action: string
  category: string
  severity: AuditSeverity
  status: AuditStatus
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

const auditDetails: Record<string, AuditDetailsData> = {
  'LOG-001': {
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
    eventSource: 'Windows PowerShell Operational Log',
    process: 'powershell.exe',
    pid: '7348',
    command:
      'powershell.exe -ExecutionPolicy Bypass -File update.ps1',
    relatedFile: 'update.ps1',
    networkActivity:
      'Outbound HTTPS connection observed after execution',
    eventCode: '4104',
    assessment:
      'The event requires investigation because PowerShell was executed with an ExecutionPolicy Bypass argument and launched a script.',
  },

  'LOG-002': {
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
    eventSource: 'Windows Security Event Log',
    process: 'winlogon.exe',
    pid: '1184',
    command: 'Interactive logon session',
    relatedFile: 'Security.evtx',
    networkActivity: 'Local authentication session',
    eventCode: '4624',
    assessment:
      'The authentication event was successful and currently has no additional suspicious indicators.',
  },

  'LOG-003': {
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
    eventSource: 'Network Security Telemetry',
    process: 'powershell.exe',
    pid: '7348',
    command:
      'powershell.exe -ExecutionPolicy Bypass -File update.ps1',
    relatedFile: 'update.ps1',
    networkActivity:
      'WIN-01 → 203.0.113.45:443 / HTTPS',
    eventCode: 'NET-HTTPS-443',
    assessment:
      'The connection occurred shortly after suspicious PowerShell activity and should be correlated with the process and file timeline.',
  },

  'LOG-004': {
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
    eventSource: 'Linux Authentication and Audit Logs',
    process: 'usermod',
    pid: '2281',
    command: 'usermod -aG sudo admin',
    relatedFile: '/etc/group',
    networkActivity: 'SSH session from 192.168.1.104',
    eventCode: 'USERMOD-ADMIN',
    assessment:
      'The privilege change should be validated against the expected administrative workflow for this endpoint.',
  },

  'LOG-005': {
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
    eventSource: 'Endpoint Process Telemetry',
    process: 'unknown_update.exe',
    pid: '9124',
    command:
      'C:\\Users\\Sameer\\AppData\\Local\\Temp\\unknown_update.exe',
    relatedFile: 'unknown_update.exe',
    networkActivity:
      'Outbound connection associated with process',
    eventCode: 'PROC-EXEC-UNSIGNED',
    assessment:
      'Execution from a temporary directory combined with an unsigned binary requires additional endpoint investigation.',
  },

  'LOG-006': {
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
    eventSource: 'File Integrity Monitoring',
    process: 'services.exe',
    pid: '1180',
    command:
      'services.exe -k security-monitor',
    relatedFile:
      'C:\\ProgramData\\Security\\temp_rules.xml',
    networkActivity: 'No related network activity',
    eventCode: 'FIM-DELETE-BLOCK',
    assessment:
      'The deletion attempt was blocked by file integrity controls. The originating process should still be reviewed.',
  },

  'LOG-007': {
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
    eventSource: 'Windows Security Event Log',
    process: 'winlogon.exe',
    pid: '1224',
    command: 'Interactive authentication',
    relatedFile: 'Security.evtx',
    networkActivity:
      'Authentication requests from 10.0.0.45',
    eventCode: '4625',
    assessment:
      'Repeated authentication failures from the same source should be correlated with account activity and network telemetry.',
  },

  'LOG-008': {
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
    eventSource: 'Linux Audit Telemetry',
    process: 'sshd',
    pid: '2441',
    command:
      'ssh admin@192.168.1.104',
    relatedFile:
      '/home/admin/.ssh/authorized_keys',
    networkActivity:
      'SSH connection over TCP/22',
    eventCode: 'SSH-KEY-MOD',
    assessment:
      'The change was recorded successfully and should be validated against the expected SSH administration activity.',
  },

  'LOG-009': {
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
    eventSource: 'CyberSentinel Management Console',
    process: 'CyberSentinelAgent.exe',
    pid: '4512',
    command:
      'CyberSentinelAgent.exe --policy-update',
    relatedFile: 'endpoint-policy.json',
    networkActivity:
      'Management API connection',
    eventCode: 'POLICY-UPDATE',
    assessment:
      'The policy update was successfully applied through the security management workflow.',
  },

  'LOG-010': {
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
    eventSource: 'Windows System Event Log',
    process: 'services.exe',
    pid: '1180',
    command:
      'services.exe -start SecurityMonitor',
    relatedFile: 'SecurityMonitor.exe',
    networkActivity:
      'No immediate network activity',
    eventCode: 'SERVICE-START',
    assessment:
      'The service start event is consistent with normal endpoint monitoring activity.',
  },
}


const API_BASE_URL = 'http://127.0.0.1:8000'

type AuditApiAction = {
  id: number
  action_id: string
  log_id: string
  action: string
  status: string
  analyst: string
  created_at: string
}

const AUDIT_ACTIONS = [
  {
    action: 'START_INVESTIGATION',
    title: 'Start Investigation',
    description: 'Create a persistent analyst investigation record for this audit event.',
    icon: Activity,
  },
  {
    action: 'PRESERVE_EVENT',
    title: 'Preserve Event Data',
    description: 'Record that the original audit event metadata should be retained.',
    icon: CheckCircle2,
  },
  {
    action: 'CORRELATE_ACTIVITY',
    title: 'Correlate Activity',
    description: 'Record analyst correlation of process, file, and network telemetry.',
    icon: Network,
  },
  {
    action: 'MARK_REVIEWED',
    title: 'Mark Reviewed',
    description: 'Mark the audit event as reviewed and close the current review step.',
    icon: ShieldAlert,
  },
] as const

function formatActionDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function AuditLogDetails() {
  const { logId } = useParams()

  const log = logId
    ? auditDetails[logId]
    : undefined

  const [apiLog, setApiLog] = useState<AuditDetailsData | null>(null)
  const [actions, setActions] = useState<AuditApiAction[]>([])
  const [loadingActions, setLoadingActions] = useState(true)
  const [submittingAction, setSubmittingAction] = useState<string | null>(null)
  const [backendStatus, setBackendStatus] = useState<'BACKEND CONNECTED' | 'DEMO DATA'>('DEMO DATA')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (!logId) return

    let cancelled = false

    async function loadBackendData() {
      setLoadingActions(true)

      try {
        const [detailResponse, actionResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/audit-logs/${logId}`),
          fetch(`${API_BASE_URL}/api/audit-logs/${logId}/actions`),
        ])

        if (!detailResponse.ok || !actionResponse.ok) {
          throw new Error('Audit API request failed')
        }

        const detailData: AuditDetailsData = await detailResponse.json()
        const actionData: AuditApiAction[] = await actionResponse.json()

        if (!cancelled) {
          setApiLog(detailData)
          setActions(actionData)
          setBackendStatus('BACKEND CONNECTED')
        }
      } catch (error) {
        console.error('Audit log backend request failed:', error)

        if (!cancelled) {
          setBackendStatus('DEMO DATA')
          setActions([])
        }
      } finally {
        if (!cancelled) setLoadingActions(false)
      }
    }

    loadBackendData()

    return () => {
      cancelled = true
    }
  }, [logId])

  async function executeAuditAction(action: string) {
    if (!logId || submittingAction) return

    setSubmittingAction(action)
    setActionError('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/audit-logs/${logId}/actions`,
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
        throw new Error(errorText || `Action failed with status ${response.status}`)
      }

      const created: AuditApiAction = await response.json()

      setActions((current) => [created, ...current])
      setBackendStatus('BACKEND CONNECTED')

      if (action === 'MARK_REVIEWED') {
        setApiLog((current) =>
          current ? { ...current, status: 'REVIEWED' } : current,
        )
      }
    } catch (error) {
      console.error('Audit response action failed:', error)
      setActionError('Response action failed. Check the CyberSentinel API.')
    } finally {
      setSubmittingAction(null)
    }
  }

  if (!log) {
    return (
      <div className="page-container">

        <div className="audit-detail-not-found">

          <ShieldAlert size={30} />

          <h2>Audit Event Not Found</h2>

          <p>
            The requested audit event does not exist in the
            current investigation dataset.
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

  const currentLog = apiLog ?? log
  const severityClass = currentLog.severity.toLowerCase()
  const statusClass = currentLog.status.toLowerCase()

  return (
    <div className="page-container">

      {/* =========================================
          HEADER
          ========================================= */}

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

          <h1>{currentLog.action}</h1>

          <p>
            Detailed investigation of audit event {currentLog.id}.
          </p>

        </div>

        <div
          className={`audit-detail-status audit-detail-status-${statusClass}`}
        >
          <span />
          {currentLog.status}
        </div>

      </div>

      {/* =========================================
          EVENT HERO
          ========================================= */}

      <section className="audit-detail-hero">

        <div className="audit-detail-identity">

          <div className="audit-detail-icon">
            <FileText size={23} />
          </div>

          <div>

            <div className="audit-detail-name">
              {currentLog.action}
            </div>

            <div className="audit-detail-id">
              {currentLog.id} · {currentLog.category}
            </div>

          </div>

        </div>

        <div className="audit-detail-endpoint">

          <span>ENDPOINT</span>

          <strong>
            {currentLog.endpoint}
          </strong>

        </div>

        <div className="audit-detail-endpoint">

          <span>USER</span>

          <strong>
            {currentLog.user}
          </strong>

        </div>

      </section>

      {/* =========================================
          METRICS
          ========================================= */}

      <section className="audit-detail-metrics">

        <div className="audit-detail-metric">

          <Clock3 size={17} />

          <span>EVENT TIME</span>

          <strong>
            {currentLog.timestamp}
          </strong>

        </div>

        <div className="audit-detail-metric">

          <ShieldAlert size={17} />

          <span>SEVERITY</span>

          <strong className={`audit-detail-value-${severityClass}`}>
            {currentLog.severity}
          </strong>

        </div>

        <div className="audit-detail-metric">

          <Globe size={17} />

          <span>SOURCE IP</span>

          <strong>
            {currentLog.sourceIp}
          </strong>

        </div>

        <div className="audit-detail-metric">

          <Hash size={17} />

          <span>EVENT CODE</span>

          <strong>
            {currentLog.eventCode}
          </strong>

        </div>

      </section>

      {/* =========================================
          EVENT CONTEXT
          ========================================= */}

      <section className="audit-detail-grid">

        <div className="audit-detail-panel">

          <div className="audit-detail-panel-header">

            <div>

              <strong>
                Event Context
              </strong>

              <span>
                Identity and source information
              </span>

            </div>

            <FileText size={18} />

          </div>

          <div className="audit-detail-fields">

            <div>
              <span>EVENT ID</span>
              <strong>{currentLog.id}</strong>
            </div>

            <div>
              <span>CATEGORY</span>
              <strong>{currentLog.category}</strong>
            </div>

            <div>
              <span>USER</span>
              <strong>{currentLog.user}</strong>
            </div>

            <div>
              <span>ENDPOINT</span>
              <strong>{currentLog.endpoint}</strong>
            </div>

            <div>
              <span>SOURCE IP</span>
              <strong>{currentLog.sourceIp}</strong>
            </div>

            <div>
              <span>EVENT SOURCE</span>
              <strong>{currentLog.eventSource}</strong>
            </div>

            <div className="audit-detail-field-wide">

              <span>DESCRIPTION</span>

              <strong>
                {currentLog.description}
              </strong>

            </div>

          </div>

        </div>

        {/* Analyst Assessment */}

        <div className="audit-detail-panel">

          <div className="audit-detail-panel-header">

            <div>

              <strong>
                Analyst Assessment
              </strong>

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

              {currentLog.severity === 'INFO' ? (
                <CheckCircle2 size={17} />
              ) : (
                <AlertTriangle size={17} />
              )}

              <div>

                <strong>
                  {currentLog.severity} SEVERITY
                </strong>

                <span>
                  Event classification
                </span>

              </div>

            </div>

            <div className="audit-assessment-row">

              <span>
                Assessment
              </span>

              <strong>
                {currentLog.assessment}
              </strong>

            </div>

            <div className="audit-assessment-row">

              <span>
                Status
              </span>

              <strong>
                {currentLog.status}
              </strong>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          PROCESS + FILE + NETWORK CORRELATION
          ========================================= */}

      <section className="audit-detail-panel audit-correlation-panel">

        <div className="audit-detail-panel-header">

          <div>

            <strong>
              Activity Correlation
            </strong>

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

            <strong>
              {currentLog.process}
            </strong>

            <small>
              PID {currentLog.pid}
            </small>

          </div>

          <div className="audit-correlation-card">

            <div className="audit-correlation-icon">
              <FileText size={16} />
            </div>

            <span>RELATED FILE</span>

            <strong>
              {currentLog.relatedFile}
            </strong>

          </div>

          <div className="audit-correlation-card">

            <div className="audit-correlation-icon">
              <Network size={16} />
            </div>

            <span>NETWORK ACTIVITY</span>

            <strong>
              {currentLog.networkActivity}
            </strong>

          </div>

        </div>

      </section>

      {/* =========================================
          COMMAND / EVENT DETAILS
          ========================================= */}

      <section className="audit-detail-grid">

        <div className="audit-detail-panel">

          <div className="audit-detail-panel-header">

            <div>

              <strong>
                Execution Details
              </strong>

              <span>
                Process and command context
              </span>

            </div>

            <Terminal size={18} />

          </div>

          <div className="audit-execution">

            <div className="audit-execution-row">

              <span>PROCESS</span>

              <strong>
                {currentLog.process}
              </strong>

            </div>

            <div className="audit-execution-row">

              <span>PID</span>

              <strong>
                {currentLog.pid}
              </strong>

            </div>

            <div className="audit-execution-command">

              <span>
                COMMAND / ACTIVITY
              </span>

              <code>
                {currentLog.command}
              </code>

            </div>

          </div>

        </div>

        {/* User / Endpoint */}

        <div className="audit-detail-panel">

          <div className="audit-detail-panel-header">

            <div>

              <strong>
                User & Endpoint Context
              </strong>

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

                <strong>
                  {currentLog.user}
                </strong>

              </div>

            </div>

            <div className="audit-context-item">

              <div className="audit-context-icon">
                <Monitor size={15} />
              </div>

              <div>

                <span>ENDPOINT</span>

                <strong>
                  {currentLog.endpoint}
                </strong>

              </div>

            </div>

            <div className="audit-context-item">

              <div className="audit-context-icon">
                <Globe size={15} />
              </div>

              <div>

                <span>SOURCE IP</span>

                <strong>
                  {currentLog.sourceIp}
                </strong>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          TIMELINE
          ========================================= */}

      <section className="audit-detail-grid">
        <div className="audit-detail-panel">
          <div className="audit-detail-panel-header">
            <div>
              <strong>Event Timeline</strong>
              <span>Activity surrounding the audit event</span>
            </div>
            <Clock3 size={18} />
          </div>

          <div className="audit-detail-timeline">
            <div className="audit-detail-timeline-item">
              <span />
              <div>
                <strong>User / system activity detected</strong>
                <small>{currentLog.timestamp}</small>
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
                <strong>Related telemetry correlated</strong>
                <small>+14 seconds</small>
              </div>
            </div>

            <div className="audit-detail-timeline-item">
              <span />
              <div>
                <strong>Event assigned for analyst review</strong>
                <small>+31 seconds</small>
              </div>
            </div>
          </div>
        </div>

        <div className="audit-detail-panel">
          <div className="audit-detail-panel-header">
            <div>
              <strong>Investigation Actions</strong>
              <span>Backend-persistent analyst workflow</span>
            </div>
            <Activity size={18} />
          </div>

          <div className="audit-action-list">
            {AUDIT_ACTIONS.map((item) => {
              const Icon = item.icon
              const isSubmitting = submittingAction === item.action

              return (
                <button
                  key={item.action}
                  type="button"
                  className="audit-action-item"
                  onClick={() => executeAuditAction(item.action)}
                  disabled={Boolean(submittingAction)}
                  style={{
                    width: '100%',
                    border: 'none',
                    textAlign: 'left',
                    background: 'transparent',
                    color: 'inherit',
                    font: 'inherit',
                    cursor: submittingAction ? 'wait' : 'pointer',
                    opacity: submittingAction && !isSubmitting ? 0.55 : 1,
                  }}
                >
                  <div className="audit-action-icon">
                    <Icon size={15} />
                  </div>

                  <div>
                    <strong>
                      {isSubmitting ? 'Processing...' : item.title}
                    </strong>
                    <span>{item.description}</span>
                  </div>
                </button>
              )
            })}
          </div>

          <div
            style={{
              marginTop: '18px',
              padding: '12px 14px',
              borderTop: '1px solid rgba(148, 163, 184, 0.12)',
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
              <span style={{ color: '#64748b', letterSpacing: '0.08em' }}>
                RESPONSE STATUS
              </span>
              <strong
                style={{
                  color:
                    backendStatus === 'BACKEND CONNECTED'
                      ? '#22d3ee'
                      : '#f59e0b',
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                }}
              >
                {backendStatus}
              </strong>
            </div>

            {actionError && (
              <div style={{ color: '#f87171', marginTop: '10px' }}>
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
                      <strong>{item.action.replaceAll('_', ' ')}</strong>
                      <span style={{ color: '#22d3ee' }}>
                        {item.status.replaceAll('_', ' ')}
                      </span>
                    </div>
                    <small style={{ color: '#64748b' }}>
                      {item.action_id} · {item.analyst} ·{' '}
                      {formatActionDate(item.created_at)}
                    </small>
                  </div>
                ))
              ) : (
                <div style={{ color: '#64748b' }}>
                  No response actions recorded for this audit event.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          NOTES
          ========================================= */}

      <section className="audit-detail-panel audit-notes-panel">

        <div className="audit-detail-panel-header">

          <div>

            <strong>
              Investigation Notes
            </strong>

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

            Event correlation helps establish the sequence
            of actions surrounding the recorded activity.
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