import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileSearch,
  Flag,
  Network,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  User,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED'

type TimelineEvent = {
  time: string
  title: string
  description: string
  actor: string
  type: 'detection' | 'investigation' | 'containment' | 'resolution'
}

type EvidenceItem = {
  id: string
  type: string
  name: string
  source: string
  status: 'COLLECTED' | 'VERIFIED' | 'PENDING'
}

type ApiIncident = {
  id: number
  incident_id: string
  title: string
  description: string
  severity: string
  status: string
  analyst: string
  primary_asset: string
  related_event_ids: string[]
  related_alert_ids: string[]
  created_at: string
  updated_at: string
}

type IncidentAction = {
  id: number
  action_id: string
  incident_id: string
  action: string
  status: string
  analyst: string
  created_at: string
}

type InvestigationTimelineItem = {
  time: string
  title: string
  description: string
  actor: string
  source: 'EVENT' | 'EVENT_ACTION' | 'INCIDENT' | 'INCIDENT_ACTION'
  reference_id: string
}

type InvestigationResponse = {
  incident: ApiIncident
  events: Array<{
    event_id: string
    title: string
    description: string
    severity: string
    status: string
    category: string
    asset: string
    source: string
    confidence: number
    alert_id: string | null
    incident_id: string | null
    timestamp: string
  }>
  alerts: string[]
  event_actions: Array<{
    action_id: string
    event_id: string
    action: string
    status: string
    analyst: string
    created_at: string
  }>
  incident_actions: IncidentAction[]
  timeline: InvestigationTimelineItem[]
}

type Incident = {
  id: string
  title: string
  description: string
  severity: IncidentSeverity
  status: IncidentStatus
  endpoint: string
  analyst: string
  source: string
  technique: string
  techniqueName: string
  evidenceCount: number
  created: string
  updated: string
  detectionRule: string
  category: string
  confidence: number
  firstObserved: string
  lastObserved: string
  timeline: TimelineEvent[]
  evidence: EvidenceItem[]
  relatedEventIds: string[]
  relatedAlertIds: string[]
}

const API_BASE_URL = 'http://127.0.0.1:8000'

const incidentContext: Record<
  string,
  {
    technique: string
    techniqueName: string
    detectionRule: string
    category: string
    confidence: number
    firstObserved: string
    lastObserved: string
    timeline: TimelineEvent[]
    evidence: EvidenceItem[]
  }
> = {
  'INC-003': {
    technique: 'T1071.001',
    techniqueName: 'Web Protocols',
    detectionRule: 'Suspicious Outbound Connection',
    category: 'Command and Control',
    confidence: 91,
    firstObserved: '2026-09-26 22:15:39',
    lastObserved: '2026-09-27 09:57:11',
    timeline: [
      {
        time: '22:15:39',
        title: 'Network Detection',
        description:
          'Outbound traffic matched a suspicious communication pattern.',
        actor: 'Network Sensor',
        type: 'detection',
      },
      {
        time: '22:17:04',
        title: 'Incident Created',
        description:
          'A high-severity investigation case was opened.',
        actor: 'CyberSentinel',
        type: 'detection',
      },
      {
        time: '23:06:19',
        title: 'Connection Correlated',
        description:
          'Network activity was correlated with endpoint process telemetry.',
        actor: 'SOC Analyst',
        type: 'investigation',
      },
      {
        time: '09:58:42',
        title: 'Investigation Active',
        description:
          'Analyst is reviewing destination reputation and process ancestry.',
        actor: 'SOC Analyst',
        type: 'investigation',
      },
    ],
    evidence: [
      {
        id: 'EVD-201',
        type: 'NETWORK',
        name: '185.199.108.153:443',
        source: 'Network Sensor',
        status: 'VERIFIED',
      },
      {
        id: 'EVD-202',
        type: 'PROCESS',
        name: 'svchost.exe',
        source: 'WIN-01',
        status: 'COLLECTED',
      },
      {
        id: 'EVD-203',
        type: 'DNS',
        name: 'cdn-update.example',
        source: 'DNS Telemetry',
        status: 'PENDING',
      },
    ],
  },

  'INC-001': {
    technique: 'T1059.001',
    techniqueName: 'PowerShell',
    detectionRule: 'PowerShell Execution Policy Bypass',
    category: 'Execution',
    confidence: 94,
    firstObserved: '2026-09-27 09:12:44',
    lastObserved: '2026-09-27 10:31:52',
    timeline: [
      {
        time: '09:12:44',
        title: 'Detection Triggered',
        description:
          'A PowerShell process launched with execution policy bypass parameters.',
        actor: 'Detection Engine',
        type: 'detection',
      },
      {
        time: '09:14:22',
        title: 'Incident Created',
        description:
          'Detection DET-001 generated a new high-severity investigation case.',
        actor: 'CyberSentinel',
        type: 'detection',
      },
      {
        time: '09:21:07',
        title: 'Analyst Assigned',
        description:
          'Case assigned to the SOC Analyst for investigation.',
        actor: 'SOC Manager',
        type: 'investigation',
      },
      {
        time: '09:46:31',
        title: 'Process Investigation',
        description:
          'PowerShell parent-child process relationships and command-line activity were reviewed.',
        actor: 'SOC Analyst',
        type: 'investigation',
      },
      {
        time: '10:18:14',
        title: 'Evidence Collected',
        description:
          'Process metadata, command-line arguments, network indicators, and file hashes were collected.',
        actor: 'SOC Analyst',
        type: 'investigation',
      },
      {
        time: '10:31:52',
        title: 'Containment Pending',
        description:
          'Endpoint isolation is pending confirmation from the response workflow.',
        actor: 'SOC Analyst',
        type: 'containment',
      },
    ],
    evidence: [
      {
        id: 'EVD-001',
        type: 'PROCESS',
        name: 'powershell.exe',
        source: 'WIN-01',
        status: 'VERIFIED',
      },
      {
        id: 'EVD-002',
        type: 'COMMAND',
        name: '-ExecutionPolicy Bypass',
        source: 'Process Telemetry',
        status: 'VERIFIED',
      },
      {
        id: 'EVD-003',
        type: 'NETWORK',
        name: '185.199.108.153:443',
        source: 'Network Telemetry',
        status: 'COLLECTED',
      },
      {
        id: 'EVD-004',
        type: 'FILE',
        name: 'update-helper.ps1',
        source: 'File Integrity',
        status: 'VERIFIED',
      },
    ],
  },

  'INC-002': {
    technique: 'T1110',
    techniqueName: 'Brute Force',
    detectionRule: 'Multiple Authentication Failures',
    category: 'Credential Access',
    confidence: 82,
    firstObserved: '2026-09-27 08:39:02',
    lastObserved: '2026-09-27 08:44:51',
    timeline: [
      {
        time: '08:39:02',
        title: 'Authentication Failures Detected',
        description:
          'Multiple unsuccessful login attempts were recorded.',
        actor: 'Authentication Monitor',
        type: 'detection',
      },
      {
        time: '08:41:18',
        title: 'Incident Created',
        description:
          'The authentication detection generated an incident.',
        actor: 'CyberSentinel',
        type: 'detection',
      },
      {
        time: '08:45:12',
        title: 'Awaiting Assignment',
        description:
          'Incident remains open and requires analyst investigation.',
        actor: 'CyberSentinel',
        type: 'investigation',
      },
    ],
    evidence: [
      {
        id: 'EVD-101',
        type: 'AUTH',
        name: '18 failed login attempts',
        source: 'WIN-02',
        status: 'COLLECTED',
      },
      {
        id: 'EVD-102',
        type: 'IP',
        name: '10.0.0.45',
        source: 'Authentication Logs',
        status: 'VERIFIED',
      },
    ],
  },

  'INC-004': {
    technique: 'T1070.004',
    techniqueName: 'File Deletion',
    detectionRule: 'Security File Deletion',
    category: 'Defense Evasion',
    confidence: 98,
    firstObserved: '2026-09-26 17:20:11',
    lastObserved: '2026-09-26 17:58:04',
    timeline: [
      {
        time: '17:20:11',
        title: 'Deletion Attempt Detected',
        description:
          'A process attempted to remove security telemetry files.',
        actor: 'File Integrity Monitor',
        type: 'detection',
      },
      {
        time: '17:21:41',
        title: 'Critical Incident Created',
        description:
          'CyberSentinel classified the activity as critical severity.',
        actor: 'CyberSentinel',
        type: 'detection',
      },
      {
        time: '17:36:52',
        title: 'Endpoint Contained',
        description:
          'Network access from the affected endpoint was restricted.',
        actor: 'SOC Analyst',
        type: 'containment',
      },
      {
        time: '18:03:14',
        title: 'Evidence Preserved',
        description:
          'Relevant process, file, and event data was preserved for investigation.',
        actor: 'SOC Analyst',
        type: 'containment',
      },
    ],
    evidence: [
      {
        id: 'EVD-301',
        type: 'FILE',
        name: 'Security.evtx',
        source: 'WIN-02',
        status: 'VERIFIED',
      },
      {
        id: 'EVD-302',
        type: 'PROCESS',
        name: 'cmd.exe',
        source: 'Process Telemetry',
        status: 'VERIFIED',
      },
      {
        id: 'EVD-303',
        type: 'COMMAND',
        name: 'wevtutil cl Security',
        source: 'Command Telemetry',
        status: 'VERIFIED',
      },
    ],
  },
}

function normalizeSeverity(value: string): IncidentSeverity {
  const severity = value.toUpperCase()

  if (
    severity === 'CRITICAL' ||
    severity === 'HIGH' ||
    severity === 'MEDIUM' ||
    severity === 'LOW'
  ) {
    return severity
  }

  return 'MEDIUM'
}

function normalizeStatus(value: string): IncidentStatus {
  const status = value.toUpperCase()

  if (
    status === 'OPEN' ||
    status === 'INVESTIGATING' ||
    status === 'CONTAINED' ||
    status === 'RESOLVED'
  ) {
    return status
  }

  return 'OPEN'
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function buildIncident(item: ApiIncident): Incident {
  const context = incidentContext[item.incident_id]

  const relatedEvidence = [
    ...(item.related_event_ids ?? []),
    ...(item.related_alert_ids ?? []),
  ]

  const fallbackContext = {
    technique: 'N/A',
    techniqueName: 'No technique mapped',
    detectionRule: 'Incident API',
    category: 'Security Investigation',
    confidence: 0,
    firstObserved: item.created_at,
    lastObserved: item.updated_at,
    timeline: [],
    evidence: [],
  }

  const selectedContext = context ?? fallbackContext

  return {
    id: item.incident_id,
    title: item.title,
    description: item.description,
    severity: normalizeSeverity(item.severity),
    status: normalizeStatus(item.status),
    endpoint: item.primary_asset,
    analyst: item.analyst || 'Unassigned',
    source:
      item.related_alert_ids?.length > 0
        ? item.related_alert_ids.join(', ')
        : item.related_event_ids?.length > 0
          ? item.related_event_ids.join(', ')
          : 'Incident API',
    technique: selectedContext.technique,
    techniqueName: selectedContext.techniqueName,
    evidenceCount:
      selectedContext.evidence.length > 0
        ? selectedContext.evidence.length
        : relatedEvidence.length,
    created: formatDate(item.created_at),
    updated: formatDate(item.updated_at),
    detectionRule: selectedContext.detectionRule,
    category: selectedContext.category,
    confidence: selectedContext.confidence,
    firstObserved: selectedContext.firstObserved,
    lastObserved: selectedContext.lastObserved,
    timeline: selectedContext.timeline,
    evidence: selectedContext.evidence,
    relatedEventIds: item.related_event_ids ?? [],
    relatedAlertIds: item.related_alert_ids ?? [],
  }
}

const severityClass = (severity: IncidentSeverity) => {
  return `incident-detail-severity incident-detail-severity-${severity.toLowerCase()}`
}

const statusClass = (status: IncidentStatus) => {
  return `incident-detail-status incident-detail-status-${status.toLowerCase()}`
}

const timelineIcon = (type: TimelineEvent['type']) => {
  if (type === 'detection') {
    return <ShieldAlert size={15} />
  }

  if (type === 'containment') {
    return <ShieldCheck size={15} />
  }

  if (type === 'resolution') {
    return <CheckCircle2 size={15} />
  }

  return <FileSearch size={15} />
}

function investigationTimelineType(
  item: InvestigationTimelineItem,
): TimelineEvent['type'] {
  if (item.source === 'EVENT') return 'detection'

  if (item.source === 'INCIDENT_ACTION') {
    const action = item.title.toUpperCase()
    if (action.includes('MARK RESOLVED')) return 'resolution'
    if (action.includes('CONTAIN')) return 'containment'
  }

  if (item.source === 'EVENT_ACTION' && item.title.toUpperCase().includes('ISOLATE')) {
    return 'containment'
  }

  return 'investigation'
}

export default function IncidentDetails() {
  const { incidentId } = useParams<{ incidentId: string }>()

  const [incident, setIncident] = useState<Incident | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [incidentActions, setIncidentActions] = useState<IncidentAction[]>([])
  const [investigation, setInvestigation] =
    useState<InvestigationResponse | null>(null)
  const [investigationLoading, setInvestigationLoading] = useState(false)
  const [investigationError, setInvestigationError] = useState('')

  async function loadIncidentActions() {
    if (!incidentId) {
      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/incidents/${incidentId}/actions`,
      )

      if (!response.ok) {
        throw new Error(`Incident action API returned ${response.status}`)
      }

      const data: IncidentAction[] = await response.json()
      setIncidentActions(data)
    } catch (error) {
      console.error('Failed to load incident actions:', error)
    }
  }

  async function loadInvestigation() {
    if (!incidentId) {
      return
    }

    try {
      setInvestigationLoading(true)
      setInvestigationError('')

      const response = await fetch(
        `${API_BASE_URL}/api/incidents/${incidentId}/investigation`,
      )

      if (!response.ok) {
        throw new Error(
          `Investigation API returned ${response.status}`,
        )
      }

      const data: InvestigationResponse = await response.json()
      setInvestigation(data)
    } catch (error) {
      console.error('Failed to load unified investigation:', error)
      setInvestigation(null)
      setInvestigationError(
        error instanceof Error
          ? error.message
          : 'Unable to load unified investigation data.',
      )
    } finally {
      setInvestigationLoading(false)
    }
  }

  async function loadIncident() {
    if (!incidentId) {
      setApiError('No incident ID was provided.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setApiError('')

      const response = await fetch(
        `${API_BASE_URL}/api/incidents/${incidentId}`,
      )

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Incident not found.')
        }

        throw new Error(`Incident API returned ${response.status}`)
      }

      const data: ApiIncident = await response.json()

      setIncident(buildIncident(data))
      await loadIncidentActions()
    } catch (error) {
      console.error('Failed to load incident:', error)

      setIncident(null)

      setApiError(
        error instanceof Error
          ? error.message
          : 'Unable to load incident data.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIncident()
    loadInvestigation()
  }, [incidentId])

  async function executeIncidentAction(
    action: string,
    successMessage: string,
    nextStatus?: IncidentStatus,
  ) {
    if (!incidentId || actionLoading) {
      return
    }

    try {
      setActionLoading(true)
      setActionMessage('')
      setActionError('')

      const actionResponse = await fetch(
        `${API_BASE_URL}/api/incidents/${incidentId}/actions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action,
            analyst: incident?.analyst || 'SOC Analyst',
          }),
        },
      )

      if (!actionResponse.ok) {
        const errorData = await actionResponse.json().catch(() => null)

        throw new Error(
          errorData?.detail ||
            `Incident action failed with status ${actionResponse.status}`,
        )
      }

      const createdAction: IncidentAction = await actionResponse.json()

      setIncidentActions((current) => [createdAction, ...current])
      setActionMessage(successMessage)

      if (nextStatus) {
        const statusResponse = await fetch(
          `${API_BASE_URL}/api/incidents/${incidentId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: nextStatus,
              analyst: incident?.analyst || 'SOC Analyst',
            }),
          },
        )

        if (!statusResponse.ok) {
          const errorData = await statusResponse.json().catch(() => null)

          throw new Error(
            errorData?.detail ||
              `Incident status update failed with status ${statusResponse.status}`,
          )
        }

        const updatedIncident: ApiIncident = await statusResponse.json()
        setIncident(buildIncident(updatedIncident))
      }

      await loadInvestigation()
    } catch (error) {
      console.error('Failed to execute incident action:', error)

      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to execute incident response action.',
      )
    } finally {
      setActionLoading(false)
    }
  }


  if (loading) {
    return (
      <div className="page-shell">
        <div
          style={{
            minHeight: '420px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: '#94a3b8',
          }}
        >
          <Clock3 size={28} />

          <strong
            style={{
              color: '#cbd5e1',
              fontSize: '15px',
            }}
          >
            Loading incident investigation
          </strong>

          <span style={{ fontSize: '12px' }}>
            Connecting to CyberSentinel Incident API...
          </span>
        </div>
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="page-shell">
        <div
          style={{
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid rgba(239, 68, 68, 0.22)',
            background: 'rgba(239, 68, 68, 0.06)',
            color: '#fca5a5',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '10px',
            }}
          >
            <AlertTriangle size={19} />
            <strong>Unable to load incident</strong>
          </div>

          <p style={{ margin: 0, fontSize: '13px' }}>
            {apiError || 'The requested incident could not be found.'}
          </p>

          <Link
            to="/incidents"
            className="incident-detail-back"
            style={{
              display: 'inline-flex',
              marginTop: '18px',
            }}
          >
            <ArrowLeft size={15} />
            INCIDENT CENTER
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <div className="page-kicker">
            INCIDENT RESPONSE / CASE INVESTIGATION
          </div>

          <h1>{incident.title}</h1>

          <p>
            Investigate incident activity, correlate evidence, review response
            actions, and track case resolution.
          </p>
        </div>

        <div className="incident-detail-header-actions">
          <Link to="/incidents" className="incident-detail-back">
            <ArrowLeft size={15} />
            INCIDENT CENTER
          </Link>

          <div className="incident-detail-online">
            <span />
            API CONNECTED
          </div>
        </div>
      </div>

      <div className="incident-detail-identity">
        <div>
          <span>CASE ID</span>
          <strong>{incident.id}</strong>
        </div>

        <div>
          <span>DETECTION</span>
          <strong>{incident.source}</strong>
        </div>

        <div>
          <span>ENDPOINT</span>
          <strong>{incident.endpoint}</strong>
        </div>

        <div>
          <span>ANALYST</span>
          <strong>{incident.analyst}</strong>
        </div>

        <div className={severityClass(incident.severity)}>
          <AlertTriangle size={14} />
          {incident.severity}
        </div>

        <div className={statusClass(incident.status)}>
          <span />
          {incident.status}
        </div>
      </div>

      <div className="incident-detail-metrics">
        <div className="incident-detail-metric">
          <span>CONFIDENCE</span>
          <strong>
            {incident.confidence > 0 ? `${incident.confidence}%` : 'N/A'}
          </strong>
        </div>

        <div className="incident-detail-metric">
          <span>EVIDENCE ITEMS</span>
          <strong>{incident.evidenceCount}</strong>
        </div>

        <div className="incident-detail-metric">
          <span>MITRE TECHNIQUE</span>
          <strong>{incident.technique}</strong>
        </div>

        <div className="incident-detail-metric">
          <span>CATEGORY</span>
          <strong>{incident.category}</strong>
        </div>

        <div className="incident-detail-metric">
          <span>FIRST OBSERVED</span>
          <strong>{incident.firstObserved}</strong>
        </div>

        <div className="incident-detail-metric">
          <span>LAST UPDATED</span>
          <strong>{incident.updated}</strong>
        </div>
      </div>

      {actionMessage && (
        <div
          style={{
            marginBottom: '18px',
            padding: '12px 15px',
            borderRadius: '9px',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            background: 'rgba(34, 197, 94, 0.06)',
            color: '#86efac',
            fontSize: '13px',
          }}
        >
          <CheckCircle2
            size={15}
            style={{
              verticalAlign: 'middle',
              marginRight: '8px',
            }}
          />
          {actionMessage}
        </div>
      )}

      {actionError && (
        <div
          style={{
            marginBottom: '18px',
            padding: '12px 15px',
            borderRadius: '9px',
            border: '1px solid rgba(239, 68, 68, 0.22)',
            background: 'rgba(239, 68, 68, 0.06)',
            color: '#fca5a5',
            fontSize: '13px',
          }}
        >
          <AlertTriangle
            size={15}
            style={{
              verticalAlign: 'middle',
              marginRight: '8px',
            }}
          />
          {actionError}
        </div>
      )}

      <div className="incident-detail-main-grid">
        <div className="incident-detail-primary">
          <section className="incident-detail-panel">
            <div className="incident-detail-panel-header">
              <div>
                <span className="incident-detail-panel-kicker">
                  CASE OVERVIEW
                </span>
                <h2>{incident.title}</h2>
              </div>

              <Flag size={17} />
            </div>

            <p className="incident-detail-description">
              {incident.description}
            </p>

            <div className="incident-detail-context-grid">
              <div>
                <span>DETECTION RULE</span>
                <strong>{incident.detectionRule}</strong>
              </div>

              <div>
                <span>MITRE ATT&CK</span>
                <strong>
                  {incident.technique} · {incident.techniqueName}
                </strong>
              </div>

              <div>
                <span>CREATED</span>
                <strong>{incident.created}</strong>
              </div>

              <div>
                <span>LAST UPDATED</span>
                <strong>{incident.updated}</strong>
              </div>
            </div>
          </section>

          <section className="incident-detail-panel">
            <div className="incident-detail-panel-header">
              <div>
                <span className="incident-detail-panel-kicker">
                  SECURITY CORRELATION
                </span>
                <h2>Related Investigations</h2>
              </div>

              <Network size={17} />
            </div>

            <div className="incident-detail-context-grid">
              <div>
                <span>RELATED EVENTS</span>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginTop: '6px',
                  }}
                >
                  {incident.relatedEventIds.length > 0 ? (
                    incident.relatedEventIds.map((eventId) => (
                      <Link
                        key={eventId}
                        to={`/soc/events/${eventId}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: '#67e8f9',
                          fontSize: '12px',
                          textDecoration: 'none',
                        }}
                      >
                        {eventId}
                        <ExternalLink size={11} />
                      </Link>
                    ))
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '12px' }}>
                      No related events
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span>RELATED ALERTS</span>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginTop: '6px',
                  }}
                >
                  {incident.relatedAlertIds.length > 0 ? (
                    incident.relatedAlertIds.map((alertId) => (
                      <Link
                        key={alertId}
                        to={`/alerts/${alertId}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: '#67e8f9',
                          fontSize: '12px',
                          textDecoration: 'none',
                        }}
                      >
                        {alertId}
                        <ExternalLink size={11} />
                      </Link>
                    ))
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '12px' }}>
                      No related alerts
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="incident-detail-panel">
            <div className="incident-detail-panel-header">
              <div>
                <span className="incident-detail-panel-kicker">
                  UNIFIED CASE CORRELATION
                </span>
                <h2>Investigation Graph</h2>
              </div>

              <Network size={17} />
            </div>

            {investigationLoading ? (
              <div
                style={{
                  padding: '18px 0',
                  color: '#64748b',
                  fontSize: '13px',
                }}
              >
                Loading correlated event, alert, and response data...
              </div>
            ) : investigation ? (
              <>
                <div className="incident-detail-context-grid">
                  <div>
                    <span>RELATED EVENTS</span>
                    <strong>{investigation.events.length}</strong>
                  </div>

                  <div>
                    <span>RELATED ALERTS</span>
                    <strong>{investigation.alerts.length}</strong>
                  </div>

                  <div>
                    <span>EVENT ACTIONS</span>
                    <strong>{investigation.event_actions.length}</strong>
                  </div>

                  <div>
                    <span>INCIDENT ACTIONS</span>
                    <strong>{investigation.incident_actions.length}</strong>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '18px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '9px',
                  }}
                >
                  {investigation.events.map((event) => (
                    <Link
                      key={event.event_id}
                      to={`/soc/events/${event.event_id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 10px',
                        borderRadius: '7px',
                        border: '1px solid rgba(34, 211, 238, 0.2)',
                        background: 'rgba(34, 211, 238, 0.05)',
                        color: '#67e8f9',
                        fontSize: '11px',
                        textDecoration: 'none',
                      }}
                    >
                      EVENT · {event.event_id}
                      <ExternalLink size={10} />
                    </Link>
                  ))}

                  {investigation.alerts.map((alertId) => (
                    <Link
                      key={alertId}
                      to={`/alerts/${alertId}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 10px',
                        borderRadius: '7px',
                        border: '1px solid rgba(251, 191, 36, 0.2)',
                        background: 'rgba(251, 191, 36, 0.05)',
                        color: '#fbbf24',
                        fontSize: '11px',
                        textDecoration: 'none',
                      }}
                    >
                      ALERT · {alertId}
                      <ExternalLink size={10} />
                    </Link>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: '18px',
                    borderTop: '1px solid rgba(51, 65, 85, 0.45)',
                    paddingTop: '14px',
                  }}
                >
                  <span
                    className="incident-detail-panel-kicker"
                    style={{ fontSize: '10px' }}
                  >
                    BACKEND INVESTIGATION TIMELINE
                  </span>

                  {investigation.timeline.length > 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        marginTop: '10px',
                      }}
                    >
                      {investigation.timeline.slice(0, 10).map((item, index) => (
                        <div
                          key={`${item.reference_id}-${item.time}-${index}`}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '86px minmax(0, 1fr)',
                            gap: '12px',
                            padding: '9px 0',
                            borderBottom:
                              '1px solid rgba(51, 65, 85, 0.28)',
                          }}
                        >
                          <span
                            style={{
                              color: '#64748b',
                              fontSize: '10px',
                              fontFamily: 'monospace',
                            }}
                          >
                            {formatDate(item.time)}
                          </span>

                          <div>
                            <strong
                              style={{
                                display: 'block',
                                color: '#cbd5e1',
                                fontSize: '12px',
                              }}
                            >
                              {item.title}
                            </strong>

                            <span
                              style={{
                                display: 'block',
                                marginTop: '3px',
                                color: '#64748b',
                                fontSize: '11px',
                                lineHeight: 1.5,
                              }}
                            >
                              {item.description}
                            </span>

                            <span
                              style={{
                                display: 'block',
                                marginTop: '4px',
                                color: '#67e8f9',
                                fontSize: '10px',
                              }}
                            >
                              {item.actor} · {item.reference_id}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '12px 0',
                        color: '#64748b',
                        fontSize: '12px',
                      }}
                    >
                      No correlated activity has been recorded yet.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div
                style={{
                  padding: '18px 0',
                  color: '#64748b',
                  fontSize: '13px',
                }}
              >
                {investigationError ||
                  'Unified investigation data is not available.'}
              </div>
            )}
          </section>

          <section className="incident-detail-panel">
            <div className="incident-detail-panel-header">
              <div>
                <span className="incident-detail-panel-kicker">
                  INVESTIGATION TIMELINE
                </span>
                <h2>Case Activity</h2>
              </div>

              <Clock3 size={17} />
            </div>

            <div className="incident-detail-timeline">
              {investigationLoading ? (
                <div style={{ padding: '20px 0', color: '#64748b', fontSize: '13px' }}>
                  Loading unified investigation timeline...
                </div>
              ) : investigationError ? (
                <div style={{ padding: '20px 0', color: '#fca5a5', fontSize: '13px' }}>
                  Unable to load investigation timeline: {investigationError}
                </div>
              ) : investigation?.timeline?.length ? (
                investigation.timeline.map((event, index) => {
                  const eventType = investigationTimelineType(event)
                  return (
                    <div
                      className="incident-detail-timeline-item"
                      key={`${event.reference_id}-${event.time}-${index}`}
                    >
                      <div className={`incident-detail-timeline-icon incident-detail-timeline-${eventType}`}>
                        {timelineIcon(eventType)}
                      </div>
                      <div className="incident-detail-timeline-line" />
                      <div className="incident-detail-timeline-content">
                        <div className="incident-detail-timeline-top">
                          <strong>{event.title}</strong>
                          <span>{formatDate(event.time)}</span>
                        </div>
                        <p>{event.description}</p>
                        <div className="incident-detail-timeline-actor">
                          <User size={12} />
                          {event.actor}
                          <span style={{ marginLeft: '8px', color: '#475569' }}>
                            {event.reference_id}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div style={{ padding: '20px 0', color: '#64748b', fontSize: '13px' }}>
                  No investigation timeline events have been recorded.
                </div>
              )}
            </div>
          </section>

          <section className="incident-detail-panel">
            <div className="incident-detail-panel-header">
              <div>
                <span className="incident-detail-panel-kicker">
                  RESPONSE WORKFLOW
                </span>
                <h2>Case Actions</h2>
              </div>

              <ShieldCheck size={17} />
            </div>

            <div className="incident-detail-actions">
              <button
                type="button"
                disabled={actionLoading || incident.status === 'CONTAINED'}
                onClick={() =>
                  executeIncidentAction(
                    'CONTAIN_ENDPOINT',
                    'Endpoint containment action recorded successfully.',
                    'CONTAINED',
                  )
                }
              >
                <ShieldAlert size={15} />
                {incident.status === 'CONTAINED'
                  ? 'ENDPOINT CONTAINED'
                  : actionLoading
                    ? 'PROCESSING...'
                    : 'CONTAIN ENDPOINT'}
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() =>
                  executeIncidentAction(
                    'COLLECT_LIVE_DATA',
                    'Live data collection action recorded successfully.',
                  )
                }
              >
                <Terminal size={15} />
                {actionLoading ? 'PROCESSING...' : 'COLLECT LIVE DATA'}
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() =>
                  executeIncidentAction(
                    'PRESERVE_EVIDENCE',
                    'Evidence preservation action recorded successfully.',
                  )
                }
              >
                <FileSearch size={15} />
                {actionLoading ? 'PROCESSING...' : 'PRESERVE EVIDENCE'}
              </button>

              <button
                type="button"
                disabled={actionLoading || incident.status === 'RESOLVED'}
                onClick={() =>
                  executeIncidentAction(
                    'MARK_RESOLVED',
                    'Incident status updated to RESOLVED.',
                    'RESOLVED',
                  )
                }
              >
                <CheckCircle2 size={15} />
                {incident.status === 'RESOLVED'
                  ? 'ALREADY RESOLVED'
                  : actionLoading
                    ? 'PROCESSING...'
                    : 'MARK RESOLVED'}
              </button>
            </div>
          </section>

          <section className="incident-detail-panel">
            <div className="incident-detail-panel-header">
              <div>
                <span className="incident-detail-panel-kicker">
                  RESPONSE HISTORY
                </span>
                <h2>Recorded Actions</h2>
              </div>

              <Clock3 size={17} />
            </div>

            {incidentActions.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {incidentActions.map((item) => (
                  <div
                    key={item.action_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '14px',
                      padding: '11px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(51, 65, 85, 0.55)',
                      background: 'rgba(15, 23, 42, 0.42)',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <strong
                        style={{
                          display: 'block',
                          color: '#cbd5e1',
                          fontSize: '12px',
                          letterSpacing: '0.03em',
                        }}
                      >
                        {item.action.replaceAll('_', ' ')}
                      </strong>
                      <span
                        style={{
                          display: 'block',
                          marginTop: '4px',
                          color: '#64748b',
                          fontSize: '11px',
                        }}
                      >
                        {item.action_id} · {item.analyst}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <strong
                        style={{
                          display: 'block',
                          color: '#67e8f9',
                          fontSize: '11px',
                        }}
                      >
                        {item.status.replaceAll('_', ' ')}
                      </strong>
                      <span
                        style={{
                          display: 'block',
                          marginTop: '4px',
                          color: '#64748b',
                          fontSize: '10px',
                        }}
                      >
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '8px 0',
                  color: '#64748b',
                  fontSize: '13px',
                }}
              >
                No response actions have been recorded for this incident.
              </div>
            )}
          </section>
        </div>

        <aside className="incident-detail-sidebar">
          <section className="incident-detail-panel">
            <div className="incident-detail-panel-header">
              <div>
                <span className="incident-detail-panel-kicker">
                  CASE OWNER
                </span>
                <h2>Assigned Analyst</h2>
              </div>

              <User size={17} />
            </div>

            <div className="incident-detail-owner">
              <div className="incident-detail-owner-avatar">
                <User size={18} />
              </div>

              <div>
                <strong>{incident.analyst}</strong>
                <span>Security Operations</span>
              </div>
            </div>
          </section>

          <section className="incident-detail-panel">
            <div className="incident-detail-panel-header">
              <div>
                <span className="incident-detail-panel-kicker">
                  AFFECTED ASSET
                </span>
                <h2>{incident.endpoint}</h2>
              </div>

              <Network size={17} />
            </div>

            <div className="incident-detail-asset">
              <div>
                <span>HOST STATUS</span>
                <strong>
                  {incident.status === 'CONTAINED'
                    ? 'CONTAINED'
                    : 'MONITORED'}
                </strong>
              </div>

              <div>
                <span>LAST TELEMETRY</span>
                <strong>{incident.lastObserved}</strong>
              </div>

              <div>
                <span>CASE SOURCE</span>
                <strong>{incident.source}</strong>
              </div>
            </div>
          </section>

          <section className="incident-detail-panel">
            <div className="incident-detail-panel-header">
              <div>
                <span className="incident-detail-panel-kicker">
                  MITRE ATT&CK
                </span>
                <h2>Technique Mapping</h2>
              </div>

              <ShieldAlert size={17} />
            </div>

            <div className="incident-detail-technique">
              <strong>{incident.technique}</strong>
              <span>{incident.techniqueName}</span>

              <p>
                Activity associated with this case has been mapped to the
                corresponding MITRE ATT&CK technique for investigation context.
              </p>
            </div>
          </section>
        </aside>
      </div>

      <section className="incident-detail-panel incident-detail-evidence-panel">
        <div className="incident-detail-panel-header">
          <div>
            <span className="incident-detail-panel-kicker">
              DIGITAL EVIDENCE
            </span>
            <h2>Collected Evidence</h2>
          </div>

          <FileSearch size={17} />
        </div>

        <div className="incident-detail-evidence-grid">
          {incident.evidence.length > 0 ? (
            incident.evidence.map((item) => (
              <div
                className="incident-detail-evidence-card"
                key={item.id}
              >
                <div className="incident-detail-evidence-top">
                  <span>{item.type}</span>

                  <strong
                    className={`incident-detail-evidence-status incident-detail-evidence-${item.status.toLowerCase()}`}
                  >
                    {item.status}
                  </strong>
                </div>

                <h3>{item.name}</h3>

                <div className="incident-detail-evidence-meta">
                  <span>{item.id}</span>
                  <span>{item.source}</span>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: '20px 0',
                color: '#64748b',
                fontSize: '13px',
              }}
            >
              Detailed evidence is not available from the current Incident
              API.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}