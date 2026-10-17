import { useCallback, useEffect, useState } from 'react'

import {

  Activity,

  ArrowLeft,

  CheckCircle2,

  Clock3,

  Globe,

  Laptop,

  Network as NetworkIcon,

  Server,

  Shield,

  ShieldAlert,

  Terminal,

  ClipboardCheck,

  FileSearch,

  MessageSquare,

  AlertTriangle,

  RefreshCw,

} from 'lucide-react'

import { Link, useParams } from 'react-router-dom'

type ConnectionStatus = 'ESTABLISHED' | 'BLOCKED' | 'SUSPICIOUS'

type ConnectionData = {

  id: string

  source: string

  destination: string

  protocol: string

  port: number

  status: ConnectionStatus

  bytes: string

  endpoint: string

  operatingSystem: string

  process: string

  parentProcess: string

  direction: string

  firstObserved: string

  lastObserved: string

  connectionCount: number

  threatLevel: string

}

type AnalystActivity = {

  id: number

  action: string

  details: string

  time: string

  created_at?: string | null

  analyst?: string

}

type ActionName =

  | 'Connection reviewed'

  | 'Evidence collection requested'

  | 'Escalation recorded'

  | 'Analyst note added'

const API_URL = 'http://127.0.0.1:8001/api/network'

const actionButtonStyle: React.CSSProperties = {

  display: 'inline-flex',

  alignItems: 'center',

  justifyContent: 'center',

  gap: 9,

  padding: '11px 14px',

  borderRadius: 9,

  border: '1px solid #26364b',

  background: '#111d2e',

  color: '#dbeafe',

  cursor: 'pointer',

  fontSize: 13,

  fontWeight: 600,

}

const panelStyle: React.CSSProperties = {

  background: 'var(--panel, #0d1524)',

  border: '1px solid var(--border, #1d293b)',

  borderRadius: 16,

  overflow: 'hidden',

  minWidth: 0,

}

const panelHeaderStyle: React.CSSProperties = {

  padding: '20px 24px',

  borderBottom: '1px solid var(--border, #1d293b)',

  display: 'flex',

  alignItems: 'center',

  justifyContent: 'space-between',

  gap: 12,

}

function safeText(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return fallback
}

function formatTime(value?: string | null) {

  if (!value) return ''

  const date = new Date(value)

  return Number.isNaN(date.getTime())

    ? value

    : date.toLocaleTimeString()

}

/\*\* Normalize API action records so React only receives renderable values. \*/

function normalizeActivity(value: unknown, index = 0): AnalystActivity | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const outer = value as Record<string, unknown>
  // Some API versions wrap a saved activity inside `action`; only unwrap it
  // when the nested value is an activity-shaped object.
  const nestedCandidate = outer.action
  const nested =
    nestedCandidate &&
    typeof nestedCandidate === 'object' &&
    !Array.isArray(nestedCandidate)
      ? (nestedCandidate as Record<string, unknown>)
      : outer

  const actionValue =
    safeText(nested.action) ||
    safeText(nested.action_name) ||
    safeText(outer.action_name) ||
    (nestedCandidate && typeof nestedCandidate === 'object'
      ? safeText((nestedCandidate as Record<string, unknown>).name)
      : '') ||
    'Investigation action'

  const createdAtValue =
    nested.created_at ??
    nested.createdAt ??
    outer.created_at ??
    outer.createdAt

  const idValue = nested.id ?? outer.id
  const detailsValue =
    nested.details ??
    nested.message ??
    outer.details ??
    outer.message

  const timeValue = nested.time ?? outer.time

  return {
    id: typeof idValue === 'number' ? idValue : Number(idValue) || -(index + 1),
    action: actionValue,
    details: safeText(detailsValue),
    time:
      safeText(timeValue) ||
      (typeof createdAtValue === 'string' ? formatTime(createdAtValue) : ''),
    created_at: typeof createdAtValue === 'string' ? createdAtValue : null,
    analyst: safeText(nested.analyst ?? outer.analyst) || undefined,
  }
}

function NetworkConnectionDetails() {

  const { connectionId } = useParams()

  const [connection, setConnection] = useState<ConnectionData | null>(null)

  const [loading, setLoading] = useState(true)

  const [refreshing, setRefreshing] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const [analystNote, setAnalystNote] = useState('')

  const [activities, setActivities] = useState<AnalystActivity[]>([])

  const [actionMessage, setActionMessage] = useState('')

  const [savingAction, setSavingAction] = useState(false)

  const normalizedId = connectionId?.trim().toUpperCase()

  const loadConnection = useCallback(async (showRefresh = false) => {

    if (!normalizedId) {

      setError('Network connection ID is missing.')

      setLoading(false)

      return

    }

    const controller = new AbortController()

    const timeoutId = window.setTimeout(() => controller.abort(), 8000)

    try {

      if (showRefresh) {

        setRefreshing(true)

      } else {

        setLoading(true)

      }

      setError(null)

      const response = await fetch(

        `${API_URL}/${encodeURIComponent(normalizedId)}`,

        { signal: controller.signal },

      )

      if (!response.ok) {

        if (response.status === 404) {

          throw new Error(

            'The requested network connection does not exist in CyberSentinel.',

          )

        }

        throw new Error(

          `Unable to load network connection. Server returned ${response.status}.`,

        )

      }

      const data = await response.json()

      const normalizedConnection: ConnectionData = {

        id: String(data.id ?? data.connection_id ?? normalizedId),

        source: safeText(data.source ?? data.source_ip, 'Unknown'),

        destination: safeText(data.destination ?? data.destination_ip, 'Unknown'),

        protocol: safeText(data.protocol, 'Unknown'),

        port: Number(data.port ?? 0),

        status: String(data.status ?? 'ESTABLISHED').toUpperCase() as ConnectionStatus,

        bytes: safeText(data.bytes ?? data.traffic, '0 B'),

        endpoint: safeText(data.endpoint, 'Unknown'),

        operatingSystem:

          safeText(data.operatingSystem ?? data.operating_system ?? data.os, 'Unknown'),

        process: safeText(data.process, 'Unknown'),

        parentProcess: safeText(data.parentProcess ?? data.parent_process, 'Unknown'),

        direction: safeText(data.direction, 'UNKNOWN'),

        firstObserved:

          safeText(data.firstObserved ?? data.first_observed ?? data.timestamp, 'Unknown'),

        lastObserved:

          safeText(data.lastObserved ?? data.last_observed ?? data.timestamp, 'Unknown'),

        connectionCount: Number(data.connectionCount ?? data.connection_count ?? 0),

        threatLevel: String(

          data.threatLevel ?? data.threat_level ?? 'LOW',

        ).toUpperCase(),

      }

      setConnection(normalizedConnection)

    } catch (err) {

      console.error('Failed to load network connection:', err)

      setError(

        err instanceof DOMException && err.name === 'AbortError'

          ? 'The CyberSentinel network backend did not respond within 8 seconds.'

          : err instanceof Error

            ? err.message

            : 'Unable to connect to the CyberSentinel backend.',

      )

      setConnection(null)

    } finally {

      window.clearTimeout(timeoutId)

      setLoading(false)

      setRefreshing(false)

    }

  }, [normalizedId])

  const loadActivities = useCallback(async () => {

    if (!normalizedId) return

    try {

      const response = await fetch(

        `${API_URL}/${encodeURIComponent(normalizedId)}/actions`,

      )

      if (!response.ok) {

        const result = await response.json().catch(() => null)

        throw new Error(

          result?.detail ?? `Unable to load investigation actions (${response.status}).`,

        )

      }

      const payload: unknown = await response.json()

      // The API returns { connection_id, total, actions: [...] }.

      // Also accept a direct array and common wrapper formats.

      const data: AnalystActivity[] = Array.isArray(payload)

        ? (payload as AnalystActivity[])

        : payload !== null && typeof payload === 'object'

          ? (() => {

              const result = payload as {

                actions?: unknown

                items?: unknown

                results?: unknown

              }

              if (Array.isArray(result.actions)) {

                return result.actions as AnalystActivity[]

              }

              if (Array.isArray(result.items)) {

                return result.items as AnalystActivity[]

              }

              if (Array.isArray(result.results)) {

                return result.results as AnalystActivity[]

              }

              return []

            })()

          : []

      setActivities(

        data

          .map((item, index) => normalizeActivity(item, index))

          .filter((item): item is AnalystActivity => item !== null),

      )

    } catch (err) {

      console.error('Failed to load network investigation actions:', err)

      setActionMessage(

        err instanceof Error

          ? `Could not load saved actions: ${err.message}`

          : 'Could not load saved investigation actions.',

      )

    }

  }, [normalizedId])

  useEffect(() => {

    void loadConnection()

    void loadActivities()

  }, [loadConnection, loadActivities])

  const recordActivity = async (

    action: ActionName,

    details: string,

  ): Promise<boolean> => {

    if (!normalizedId || savingAction) return false

    setSavingAction(true)

    setActionMessage('Saving investigation action...')

    try {

      const response = await fetch(

        `${API_URL}/${encodeURIComponent(normalizedId)}/actions`,

        {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({

            action,

            details,

            analyst: 'SOC Analyst',

          }),

        },

      )

      const result = await response.json().catch(() => null)

      if (!response.ok) {

        throw new Error(

          result?.detail ?? `Unable to save action (${response.status}).`,

        )

      }

      const savedPayload =
        result && typeof result === 'object' && !Array.isArray(result) &&
        'activity' in result
          ? (result as { activity: unknown }).activity
          : result
      const savedActivity = normalizeActivity(savedPayload, 0)

      if (!savedActivity) {

        throw new Error('The server returned an unexpected saved-action response.')

      }

      setActivities((previous) => [

        savedActivity,

        ...previous.filter((item) => item.id !== savedActivity.id),

      ])

      setActionMessage('Investigation action saved to the database.')

      return true

    } catch (err) {

      console.error('Failed to save network investigation action:', err)

      setActionMessage(

        err instanceof Error

          ? err.message

          : 'Failed to save investigation action.',

      )

      return false

    } finally {

      setSavingAction(false)

    }

  }

  const handleSaveNote = async () => {

    const note = analystNote.trim()

    if (!note) {

      setActionMessage('Enter an analyst note before saving.')

      return

    }

    const saved = await recordActivity('Analyst note added', note)

    if (saved) setAnalystNote('')

  }

  if (loading) {

    return (

      <div className="page-container">

        <div className="network-connection-not-found">

          <NetworkIcon size={32} className="network-loading-icon" />

          <h1>Loading Connection</h1>

          <p>Retrieving network connection details from CyberSentinel...</p>

        </div>

      </div>

    )

  }

  if (!connection || error) {

    return (

      <div className="page-container">

        <div className="network-connection-not-found">

          <ShieldAlert size={32} />

          <h1>Connection Not Found</h1>

          <p>{error ?? 'The requested network connection does not exist.'}</p>

          <Link to="/network" className="network-back-link">

            <ArrowLeft size={15} />

            Back to Network

          </Link>

          <button

            type="button"

            onClick={() => void loadConnection()}

            className="network-action-button"

          >

            <RefreshCw size={15} />

            Try again

          </button>

        </div>

      </div>

    )

  }

  const isSuspicious = connection.status === 'SUSPICIOUS'

  const isBlocked = connection.status === 'BLOCKED'

  const isCritical = connection.threatLevel === 'CRITICAL'

  const isHigh = connection.threatLevel === 'HIGH'

  const statusClass = connection.status.toLowerCase()

  const riskTitle = isBlocked

    ? 'Connection blocked by policy'

    : isCritical

      ? 'Critical-risk connection'

      : isSuspicious

        ? 'Suspicious network activity'

        : isHigh

          ? 'High-risk connection'

          : 'Normal network activity'

  const riskDescription = isBlocked

    ? 'A network security control recorded this connection as blocked. Review the policy and determine whether any follow-up investigation is needed.'

    : isCritical

      ? 'This connection is marked critical. Review the endpoint, process context, destination, and related telemetry before deciding on containment or escalation.'

      : isSuspicious

        ? 'This connection is marked suspicious and requires analyst review. Validate the destination, initiating process, and expected business activity.'

        : isHigh

          ? 'This connection is marked high risk. Validate the process, destination, and observed traffic against expected endpoint behavior.'

          : 'No suspicious status is currently recorded for this connection. Continue to review it in the context of normal network activity.'

  return (

    <div className="page-container network-connection-page">

      <Link to="/network" className="network-back-link">

        <ArrowLeft size={15} />

        Back to Network

      </Link>

      <div className="network-connection-header">

        <div className="network-connection-identity">

          <div

            className={`network-connection-icon ${

              isSuspicious

                ? 'connection-icon-warning'

                : isBlocked || isCritical

                  ? 'connection-icon-danger'

                  : 'connection-icon-normal'

            }`}

          >

            <NetworkIcon size={24} />

          </div>

          <div>

            <div className="page-eyebrow">NETWORK CONNECTION INVESTIGATION</div>

            <h1>

              {connection.source}{' '}

              <span className="connection-arrow">→</span>{' '}

              {connection.destination}

            </h1>

            <div className="network-connection-subtitle">

              {connection.id} · Last observed {connection.lastObserved}

            </div>

          </div>

        </div>

        <div className={`connection-detail-status connection-detail-${statusClass}`}>

          <span />

          {connection.status}

        </div>

      </div>

      <section className="network-connection-summary">

        <div className="network-connection-summary-card">

          <div className="network-connection-summary-label">SOURCE</div>

          <strong className="network-detail-mono">{connection.source}</strong>

          <span>Internal endpoint</span>

        </div>

        <div className="network-connection-summary-card">

          <div className="network-connection-summary-label">DESTINATION</div>

          <strong className="network-detail-mono">{connection.destination}</strong>

          <span>Remote destination</span>

        </div>

        <div className="network-connection-summary-card">

          <div className="network-connection-summary-label">PROTOCOL</div>

          <strong>{connection.protocol}</strong>

          <span>Port {connection.port}</span>

        </div>

        <div className="network-connection-summary-card">

          <div className="network-connection-summary-label">TRAFFIC</div>

          <strong>{connection.bytes}</strong>

          <span>Observed transfer</span>

        </div>

      </section>

      <section className="network-investigation-grid">

        <div className="network-investigation-panel">

          <div className="network-investigation-header">

            <div>

              <div className="network-investigation-title">Connection Details</div>

              <div className="network-investigation-subtitle">

                Core network session information

              </div>

            </div>

            <Globe size={18} />

          </div>

          <div className="network-detail-list">

            {[

              ['Connection ID', connection.id],

              ['Source Address', connection.source],

              ['Destination Address', connection.destination],

              ['Protocol', connection.protocol],

              ['Destination Port', String(connection.port)],

              ['Direction', connection.direction],

              ['Connection Count', String(connection.connectionCount)],

            ].map(([label, value]) => (

              <div className="network-detail-row" key={label}>

                <span>{label}</span>

                <strong>{value}</strong>

              </div>

            ))}

          </div>

        </div>

        <div className="network-investigation-panel">

          <div className="network-investigation-header">

            <div>

              <div className="network-investigation-title">Endpoint Context</div>

              <div className="network-investigation-subtitle">

                Host and process information

              </div>

            </div>

            <Laptop size={18} />

          </div>

          <div className="network-detail-list">

            {[

              ['Endpoint', connection.endpoint],

              ['Operating System', connection.operatingSystem],

              ['Process', connection.process],

              ['Parent Process', connection.parentProcess],

              ['Network Interface', 'eth0'],

              ['Agent', 'CyberSentinel Agent'],

            ].map(([label, value]) => (

              <div className="network-detail-row" key={label}>

                <span>{label}</span>

                <strong>{value}</strong>

              </div>

            ))}

          </div>

        </div>

      </section>

      <section className="network-investigation-panel network-risk-panel">

        <div className="network-investigation-header">

          <div>

            <div className="network-investigation-title">Security Assessment</div>

            <div className="network-investigation-subtitle">

              Contextual analysis of the observed connection

            </div>

          </div>

          <Shield size={18} />

        </div>

        <div className="network-risk-content">

          <div

            className={`network-risk-banner ${

              isSuspicious

                ? 'network-risk-warning'

                : isBlocked || isCritical

                  ? 'network-risk-danger'

                  : 'network-risk-normal'

            }`}

          >

            {isSuspicious || isBlocked || isCritical || isHigh ? (

              <ShieldAlert size={22} />

            ) : (

              <Shield size={22} />

            )}

            <div>

              <strong>{riskTitle}</strong>

              <p>{riskDescription}</p>

            </div>

          </div>

          <div className="network-risk-indicators">

            {[

              ['Threat Level', connection.threatLevel],

              ['Status', connection.status],

              ['Port', String(connection.port)],

              ['Protocol', connection.protocol],

              ['Direction', connection.direction],

            ].map(([label, value]) => (

              <div key={label}>

                <span>{label}</span>

                <strong>{value}</strong>

              </div>

            ))}

          </div>

        </div>

      </section>

      <section style={{ ...panelStyle, marginTop: 20 }}>

        <div style={panelHeaderStyle}>

          <div>

            <div className="network-investigation-title">Investigation Actions</div>

            <div className="network-investigation-subtitle">

              Record analyst decisions for this connection

            </div>

          </div>

          <ClipboardCheck size={20} color="#22d3ee" />

        </div>

        <div style={{ padding: 24 }}>

          <div

            style={{

              display: 'flex',

              alignItems: 'flex-start',

              gap: 12,

              padding: 16,

              borderRadius: 10,

              background: '#101d2c',

              border: '1px solid #26364b',

              marginBottom: 20,

            }}

          >

            <AlertTriangle

              size={20}

              color={isBlocked || isCritical ? '#fb7185' : '#fbbf24'}

              style={{ flexShrink: 0, marginTop: 2 }}

            />

            <div>

              <strong style={{ color: '#e2e8f0', fontSize: 14 }}>

                Recommended analyst checks

              </strong>

              <ul

                style={{

                  color: '#91a4bf',

                  fontSize: 13,

                  lineHeight: 1.9,

                  paddingLeft: 20,

                  margin: '8px 0 0',

                }}

              >

                <li>Verify whether the destination is expected for this endpoint.</li>

                <li>Review the initiating process and its parent process.</li>

                <li>Correlate the connection with related alerts and endpoint events.</li>

                <li>Follow your organization's incident-response procedure before containment.</li>

              </ul>

            </div>

          </div>

          <div

            style={{

              display: 'flex',

              flexWrap: 'wrap',

              gap: 10,

              marginBottom: 20,

            }}

          >

            <button

              type="button"

              style={{

                ...actionButtonStyle,

                opacity: savingAction ? 0.6 : 1,

              }}

              disabled={savingAction}

              onClick={() =>

                void recordActivity(

                  'Connection reviewed',

                  `Reviewed ${connection.id}: ${connection.source} → ${connection.destination}.`,

                )

              }

            >

              <CheckCircle2 size={16} />

              Mark Reviewed

            </button>

            <button

              type="button"

              style={{

                ...actionButtonStyle,

                opacity: savingAction ? 0.6 : 1,

              }}

              disabled={savingAction}

              onClick={() =>

                void recordActivity(

                  'Evidence collection requested',

                  `Analyst requested evidence review for endpoint ${connection.endpoint} and process ${connection.process}.`,

                )

              }

            >

              <FileSearch size={16} />

              Record Evidence Request

            </button>

            <button

              type="button"

              style={{

                ...actionButtonStyle,

                opacity: savingAction ? 0.6 : 1,

              }}

              disabled={savingAction}

              onClick={() =>

                void recordActivity(

                  'Escalation recorded',

                  `Analyst recorded an escalation recommendation for ${connection.id} (${connection.threatLevel} risk).`,

                )

              }

            >

              <ShieldAlert size={16} />

              Record Escalation

            </button>

          </div>

          <div style={{ display: 'grid', gap: 10 }}>

            <label

              htmlFor="network-analyst-note"

              style={{ color: '#cbd5e1', fontWeight: 600, fontSize: 13 }}

            >

              Analyst investigation note

            </label>

            <textarea

              id="network-analyst-note"

              value={analystNote}

              onChange={(event) => setAnalystNote(event.target.value)}

              placeholder="Document findings, validation steps, or the reason for escalation..."

              rows={4}

              maxLength={5000}

              style={{

                width: '100%',

                boxSizing: 'border-box',

                resize: 'vertical',

                border: '1px solid #26364b',

                borderRadius: 10,

                background: '#080f1b',

                color: '#e2e8f0',

                padding: 14,

                font: 'inherit',

                fontSize: 13,

                outlineColor: '#22d3ee',

              }}

            />

            <div>

              <button

                type="button"

                style={{

                  ...actionButtonStyle,

                  background: '#083344',

                  borderColor: '#155e75',

                  color: '#a5f3fc',

                  opacity: savingAction ? 0.6 : 1,

                }}

                disabled={savingAction}

                onClick={() => void handleSaveNote()}

              >

                <MessageSquare size={16} />

                {savingAction ? 'Saving...' : 'Add Note to Activity Log'}

              </button>

            </div>

            {actionMessage && (

              <p role="status" style={{ color: '#67e8f9', fontSize: 13 }}>

                {actionMessage}

              </p>

            )}

          </div>

          <div

            style={{

              marginTop: 18,

              color: '#91a4bf',

              fontSize: 12,

              lineHeight: 1.6,

            }}

          >

            Analyst actions and notes are saved to the CyberSentinel database

            and remain available when this investigation is reopened. These

            records document analyst decisions; they do not independently block

            network traffic or isolate endpoints.

          </div>

        </div>

      </section>

      <section style={{ ...panelStyle, marginTop: 20 }}>

        <div style={panelHeaderStyle}>

          <div>

            <div className="network-investigation-title">Connection Timeline</div>

            <div className="network-investigation-subtitle">

              Observed connection activity and persisted analyst actions

            </div>

          </div>

          <Clock3 size={20} color="#22d3ee" />

        </div>

        <div className="network-timeline" style={{ padding: '20px 24px' }}>

          <div className="network-timeline-item">

            <div className="network-timeline-marker" />

            <div className="network-timeline-content">

              <strong>Connection observed</strong>

              <span>

                CyberSentinel detected the network session from the monitored endpoint.

              </span>

            </div>

            <time>{connection.firstObserved}</time>

          </div>

          <div className="network-timeline-item">

            <div className="network-timeline-marker" />

            <div className="network-timeline-content">

              <strong>Traffic transferred</strong>

              <span>Network telemetry recorded {connection.bytes} of traffic.</span>

            </div>

            <time>{connection.lastObserved}</time>

          </div>

          <div className="network-timeline-item">

            <div

              className={`network-timeline-marker ${

                isSuspicious

                  ? 'network-marker-warning'

                  : isBlocked || isCritical

                    ? 'network-marker-danger'

                    : ''

              }`}

            />

            <div className="network-timeline-content">

              <strong>Security state recorded</strong>

              <span>Connection status recorded as {connection.status}.</span>

            </div>

            <time>{connection.lastObserved}</time>

          </div>

          {activities.map((activity, index) => (

            <div className="network-timeline-item" key={`${activity.id}-${index}`}>

              <div className="network-timeline-marker" />

              <div className="network-timeline-content">

                <strong>{safeText(activity.action, 'Investigation action')}</strong>

                <span>{safeText(activity.details)}</span>

                {activity.analyst && (

                  <span>Analyst: {safeText(activity.analyst)}</span>

                )}

              </div>

              <time>{safeText(activity.time)}</time>

            </div>

          ))}

          {activities.length === 0 && (

            <p style={{ color: '#64748b', fontSize: 12, marginTop: 20 }}>

              No analyst actions have been recorded for this connection yet.

            </p>

          )}

          <div style={{ marginTop: 14 }}>

            <button

              type="button"

              style={{

                ...actionButtonStyle,

                opacity: refreshing ? 0.6 : 1,

              }}

              disabled={refreshing}

              onClick={async () => {

                await loadConnection(true)

                await loadActivities()

              }}

            >

              <RefreshCw size={15} />

              {refreshing ? 'Refreshing...' : 'Refresh Investigation'}

            </button>

          </div>

        </div>

      </section>

      <section className="network-investigation-panel network-process-panel">

        <div className="network-investigation-header">

          <div>

            <div className="network-investigation-title">Process Context</div>

            <div className="network-investigation-subtitle">

              Process responsible for the network activity

            </div>

          </div>

          <Terminal size={18} />

        </div>

        <div className="network-process-grid">

          <div className="network-process-item">

            <Activity size={17} />

            <div>

              <span>Process</span>

              <strong>{connection.process}</strong>

            </div>

          </div>

          <div className="network-process-item">

            <Server size={17} />

            <div>

              <span>Parent Process</span>

              <strong>{connection.parentProcess}</strong>

            </div>

          </div>

          <div className="network-process-item">

            <NetworkIcon size={17} />

            <div>

              <span>Network Interface</span>

              <strong>eth0</strong>

            </div>

          </div>

        </div>

      </section>

    </div>

  )

}

export default NetworkConnectionDetails
