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

import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

type IncidentSeverity =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'

type IncidentStatus =
  | 'OPEN'
  | 'INVESTIGATING'
  | 'CONTAINED'
  | 'RESOLVED'

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

type InvestigationEvent = {
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
}

type InvestigationEventAction = {
  action_id: string
  event_id: string
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
  source:
    | 'EVENT'
    | 'EVENT_ACTION'
    | 'INCIDENT'
    | 'INCIDENT_ACTION'
  reference_id: string
}

type InvestigationResponse = {
  incident: ApiIncident
  events: InvestigationEvent[]
  alerts: string[]
  event_actions: InvestigationEventAction[]
  incident_actions: IncidentAction[]
  timeline: InvestigationTimelineItem[]
}

type EvidenceItem = {
  id: string
  type: string
  name: string
  source: string
  status: 'COLLECTED' | 'VERIFIED' | 'PENDING'
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
  evidenceCount: number
  created: string
  updated: string
  relatedEventIds: string[]
  relatedAlertIds: string[]
}

const API_BASE_URL = 'http://127.0.0.1:8001'

function normalizeSeverity(
  value: string,
): IncidentSeverity {
  const severity = String(value ?? 'MEDIUM').toUpperCase()

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

function normalizeStatus(
  value: string,
): IncidentStatus {
  const status = String(value ?? 'OPEN').toUpperCase()

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
  if (!value) return 'N/A'
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

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {}
}

function unwrapObject(value: unknown): Record<string, any> {
  const record = asRecord(value)
  const nested = record.data ?? record.item ?? record.result ?? record.incident ?? value
  return asRecord(nested)
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : []
}

function normalizeIncidentPayload(value: unknown): ApiIncident {
  const item = unwrapObject(value)
  return {
    id: Number(item.id ?? 0),
    incident_id: String(item.incident_id ?? item.incidentId ?? item.case_id ?? item.id ?? ''),
    title: String(item.title ?? item.name ?? 'Untitled incident'),
    description: String(item.description ?? item.summary ?? 'No description provided.'),
    severity: String(item.severity ?? 'MEDIUM'),
    status: String(item.status ?? 'OPEN'),
    analyst: String(item.analyst ?? item.assigned_analyst ?? item.assignedAnalyst ?? 'Unassigned'),
    primary_asset: String(item.primary_asset ?? item.primaryAsset ?? item.endpoint ?? item.asset ?? 'Unknown asset'),
    related_event_ids: asStringArray(item.related_event_ids ?? item.relatedEventIds),
    related_alert_ids: asStringArray(item.related_alert_ids ?? item.relatedAlertIds),
    created_at: String(item.created_at ?? item.createdAt ?? item.created ?? ''),
    updated_at: String(item.updated_at ?? item.updatedAt ?? item.updated ?? item.created_at ?? item.createdAt ?? ''),
  }
}

function normalizeActionList(value: unknown): IncidentAction[] {
  const record = asRecord(value)
  const list = Array.isArray(value) ? value : record.data ?? record.items ?? record.results ?? record.actions ?? []
  if (!Array.isArray(list)) return []
  return list.map((raw: unknown, index: number) => {
    const item = asRecord(raw)
    return {
      id: Number(item.id ?? index),
      action_id: String(item.action_id ?? item.actionId ?? item.id ?? `ACTION-${index + 1}`),
      incident_id: String(item.incident_id ?? item.incidentId ?? ''),
      action: String(item.action ?? item.action_type ?? item.actionType ?? 'UNKNOWN_ACTION'),
      status: String(item.status ?? 'RECORDED'),
      analyst: String(item.analyst ?? 'SOC Analyst'),
      created_at: String(item.created_at ?? item.createdAt ?? ''),
    }
  })
}

function normalizeInvestigationPayload(value: unknown): InvestigationResponse {
  const root = unwrapObject(value)
  const incident = normalizeIncidentPayload(root.incident ?? root)
  const eventsRaw = root.events ?? root.related_events ?? root.relatedEvents ?? []
  const alertsRaw = root.alerts ?? root.related_alerts ?? root.relatedAlerts ?? []
  const eventActionsRaw = root.event_actions ?? root.eventActions ?? []
  const timelineRaw = root.timeline ?? root.activity_timeline ?? root.activityTimeline ?? []
  const events = (Array.isArray(eventsRaw) ? eventsRaw : []).map((raw: unknown, index: number) => {
    const item = asRecord(raw)
    return {
      event_id: String(item.event_id ?? item.eventId ?? item.id ?? `EVENT-${index + 1}`),
      title: String(item.title ?? item.name ?? 'Security event'),
      description: String(item.description ?? item.summary ?? ''),
      severity: String(item.severity ?? 'MEDIUM'),
      status: String(item.status ?? 'OPEN'),
      category: String(item.category ?? 'Security Investigation'),
      asset: String(item.asset ?? item.endpoint ?? item.host ?? ''),
      source: String(item.source ?? 'Security Event'),
      confidence: Number(item.confidence ?? 0),
      alert_id: item.alert_id == null && item.alertId == null ? null : String(item.alert_id ?? item.alertId),
      incident_id: item.incident_id == null && item.incidentId == null ? null : String(item.incident_id ?? item.incidentId),
      timestamp: String(item.timestamp ?? item.created_at ?? item.createdAt ?? ''),
    }
  })
  const event_actions = (Array.isArray(eventActionsRaw) ? eventActionsRaw : []).map((raw: unknown, index: number) => {
    const item = asRecord(raw)
    return {
      action_id: String(item.action_id ?? item.actionId ?? item.id ?? `EVENT-ACTION-${index + 1}`),
      event_id: String(item.event_id ?? item.eventId ?? ''),
      action: String(item.action ?? item.action_type ?? 'UNKNOWN_ACTION'),
      status: String(item.status ?? 'RECORDED'),
      analyst: String(item.analyst ?? 'SOC Analyst'),
      created_at: String(item.created_at ?? item.createdAt ?? ''),
    }
  })
  const timeline = (Array.isArray(timelineRaw) ? timelineRaw : []).map((raw: unknown, index: number) => {
    const item = asRecord(raw)
    const source = String(item.source ?? item.type ?? 'INCIDENT').toUpperCase()
    const allowedSource = ['EVENT', 'EVENT_ACTION', 'INCIDENT', 'INCIDENT_ACTION'].includes(source)
      ? source as InvestigationTimelineItem['source'] : 'INCIDENT'
    return {
      time: String(item.time ?? item.timestamp ?? item.created_at ?? item.createdAt ?? ''),
      title: String(item.title ?? item.action ?? 'Investigation activity'),
      description: String(item.description ?? item.details ?? ''),
      actor: String(item.actor ?? item.analyst ?? 'System'),
      source: allowedSource,
      reference_id: String(item.reference_id ?? item.referenceId ?? item.action_id ?? item.event_id ?? `TIMELINE-${index + 1}`),
    }
  })
  const rawAlerts = Array.isArray(alertsRaw) ? alertsRaw : []
  const alerts = rawAlerts.map((item: unknown) => typeof item === 'string' ? item : String(asRecord(item).alert_id ?? asRecord(item).alertId ?? asRecord(item).id ?? '')) .filter(Boolean)
  return {
    incident,
    events,
    alerts,
    event_actions,
    incident_actions: normalizeActionList(root.incident_actions ?? root.incidentActions ?? []),
    timeline,
  }
}

function buildIncident(
  item: ApiIncident,
): Incident {
  const evidenceCount =
    (item.related_event_ids?.length ?? 0) +
    (item.related_alert_ids?.length ?? 0)

  const source =
    item.related_alert_ids?.length > 0
      ? item.related_alert_ids.join(', ')
      : item.related_event_ids?.length > 0
        ? item.related_event_ids.join(', ')
        : 'Incident API'

  return {
    id: item.incident_id || String(item.id),
    title: item.title || 'Untitled incident',
    description: item.description || 'No description provided.',
    severity: normalizeSeverity(item.severity),
    status: normalizeStatus(item.status),
    endpoint: item.primary_asset || 'Unknown asset',
    analyst: item.analyst || 'Unassigned',
    source,
    evidenceCount,
    created: formatDate(item.created_at),
    updated: formatDate(item.updated_at),
    relatedEventIds:
      item.related_event_ids ?? [],
    relatedAlertIds:
      item.related_alert_ids ?? [],
  }
}

function severityClass(
  severity: IncidentSeverity,
) {
  return `incident-detail-severity incident-detail-severity-${severity.toLowerCase()}`
}

function statusClass(
  status: IncidentStatus,
) {
  return `incident-detail-status incident-detail-status-${status.toLowerCase()}`
}

function timelineIcon(
  source: InvestigationTimelineItem['source'],
  title: string,
) {
  if (source === 'INCIDENT_ACTION') {
    if (
      title.toUpperCase().includes('MARK RESOLVED')
    ) {
      return <CheckCircle2 size={15} />
    }

    if (
      title.toUpperCase().includes('CONTAIN')
    ) {
      return <ShieldCheck size={15} />
    }
  }

  if (source === 'EVENT') {
    return <ShieldAlert size={15} />
  }

  if (source === 'EVENT_ACTION') {
    return <ShieldCheck size={15} />
  }

  return <FileSearch size={15} />
}

function evidenceFromInvestigation(
  investigation: InvestigationResponse,
): EvidenceItem[] {
  const evidence: EvidenceItem[] = []

  investigation.events.forEach(
    (event) => {
      evidence.push({
        id: event.event_id,
        type: 'SECURITY EVENT',
        name: event.title,
        source:
          event.asset ||
          event.source ||
          'Security Event',
        status: 'VERIFIED',
      })
    },
  )

  investigation.event_actions.forEach(
    (action) => {
      evidence.push({
        id: action.action_id,
        type: 'EVENT ACTION',
        name: action.action.replaceAll(
          '_',
          ' ',
        ),
        source: action.event_id,
        status: 'COLLECTED',
      })
    },
  )

  investigation.alerts.forEach(
    (alertId) => {
      evidence.push({
        id: alertId,
        type: 'ALERT',
        name: alertId,
        source: 'Alert Correlation',
        status: 'VERIFIED',
      })
    },
  )

  return evidence
}

export default function IncidentDetails() {
  const { incidentId } =
    useParams<{ incidentId: string }>()

  const [incident, setIncident] =
    useState<Incident | null>(null)

  const [investigation, setInvestigation] =
    useState<InvestigationResponse | null>(
      null,
    )

  const [incidentActions, setIncidentActions] =
    useState<IncidentAction[]>([])

  const [loading, setLoading] =
    useState(true)

  const [investigationLoading, setInvestigationLoading] =
    useState(false)

  const [apiError, setApiError] =
    useState('')

  const [investigationError, setInvestigationError] =
    useState('')

  const [actionLoading, setActionLoading] =
    useState(false)

  const [actionMessage, setActionMessage] =
    useState('')

  const [actionError, setActionError] =
    useState('')

  async function loadIncidentActions() {
    if (!incidentId) {
      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/incidents/${encodeURIComponent(incidentId)}/actions`,
      )

      if (!response.ok) {
        throw new Error(
          `Incident action API returned ${response.status}`,
        )
      }

      const data: unknown = await response.json()
      setIncidentActions(normalizeActionList(data))
    } catch (error) {
      console.error(
        'Failed to load incident actions:',
        error,
      )
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
        `${API_BASE_URL}/api/incidents/${encodeURIComponent(incidentId)}/investigation`,
      )

      if (!response.ok) {
        throw new Error(
          `Investigation API returned ${response.status}`,
        )
      }

      const payload: unknown = await response.json()
      const data = normalizeInvestigationPayload(payload)

      setInvestigation(data)
      setIncidentActions(data.incident_actions)
    } catch (error) {
      console.error(
        'Failed to load investigation:',
        error,
      )

      setInvestigation(null)

      setInvestigationError(
        error instanceof Error
          ? error.message
          : 'Unable to load investigation data.',
      )
    } finally {
      setInvestigationLoading(false)
    }
  }

  async function loadIncident() {
    if (!incidentId) {
      setApiError(
        'No incident ID was provided.',
      )
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setApiError('')

      const response = await fetch(
        `${API_BASE_URL}/api/incidents/${encodeURIComponent(incidentId)}`,
      )

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            'Incident not found.',
          )
        }

        throw new Error(
          `Incident API returned ${response.status}`,
        )
      }

      const payload: unknown = await response.json()
      const data = normalizeIncidentPayload(payload)
      if (!data.incident_id) {
        throw new Error('The incident response did not include an incident ID.')
      }
      setIncident(buildIncident(data))
    } catch (error) {
      console.error(
        'Failed to load incident:',
        error,
      )

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
    loadIncidentActions()
    loadInvestigation()
  }, [incidentId])

  async function executeIncidentAction(
    action: string,
    successMessage: string,
  ) {
    if (!incidentId || actionLoading) {
      return
    }

    try {
      setActionLoading(true)
      setActionMessage('')
      setActionError('')

      const response = await fetch(
        `${API_BASE_URL}/api/incidents/${encodeURIComponent(incidentId)}/actions`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            action,
            analyst:
              incident?.analyst ||
              'SOC Analyst',
          }),
        },
      )

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => null)

        throw new Error(
          errorData?.detail ||
            `Incident action failed with status ${response.status}`,
        )
      }

      const createdPayload: unknown = await response.json()
      const createdAction = normalizeActionList([unwrapObject(createdPayload)])[0]

      if (createdAction) {
        setIncidentActions((current) => [createdAction, ...current.filter((item) => item.action_id !== createdAction.action_id)])
      }

      setActionMessage(successMessage)

      await loadIncident()
      await loadIncidentActions()
      await loadInvestigation()
    } catch (error) {
      console.error(
        'Failed to execute incident action:',
        error,
      )

      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to execute incident response action.',
      )
    } finally {
      setActionLoading(false)
    }
  }

  const investigationEvents =
    investigation?.events ?? []

  const investigationAlerts =
    investigation?.alerts ?? []

  const investigationTimeline =
    investigation?.timeline ?? []

  const evidence = useMemo(() => {
    if (!investigation) {
      return []
    }

    return evidenceFromInvestigation(
      investigation,
    )
  }, [investigation])

  const confidence = useMemo(() => {
    if (
      investigationEvents.length === 0
    ) {
      return null
    }

    const values =
      investigationEvents
        .map((event) => event.confidence)
        .filter(
          (value) => typeof value === 'number' && Number.isFinite(value),
        )

    if (values.length === 0) {
      return null
    }

    return Math.max(...values)
  }, [investigationEvents])

  const primaryEvent =
    investigationEvents[0]

  const category =
    primaryEvent?.category ||
    'Security Investigation'

  const detectionSource =
    incident?.source ||
    'Incident API'

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

          <span
            style={{
              fontSize: '12px',
            }}
          >
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
            border:
              '1px solid rgba(239, 68, 68, 0.22)',
            background:
              'rgba(239, 68, 68, 0.06)',
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

            <strong>
              Unable to load incident
            </strong>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: '13px',
            }}
          >
            {apiError ||
              'The requested incident could not be found.'}
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
            Investigate incident activity,
            correlate evidence, review response
            actions, and track case resolution.
          </p>
        </div>

        <div className="incident-detail-header-actions">
          <Link
            to="/incidents"
            className="incident-detail-back"
          >
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
          <strong>{detectionSource}</strong>
        </div>

        <div>
          <span>ENDPOINT</span>
          <strong>{incident.endpoint}</strong>
        </div>

        <div>
          <span>ANALYST</span>
          <strong>{incident.analyst}</strong>
        </div>

        <div
          className={severityClass(
            incident.severity,
          )}
        >
          <AlertTriangle size={14} />
          {incident.severity}
        </div>

        <div
          className={statusClass(
            incident.status,
          )}
        >
          <span />
          {incident.status}
        </div>
      </div>

      <div className="incident-detail-metrics">
        <div className="incident-detail-metric">
          <span>CONFIDENCE</span>
          <strong>
            {confidence !== null
              ? `${confidence}%`
              : 'N/A'}
          </strong>
        </div>

        <div className="incident-detail-metric">
          <span>EVIDENCE ITEMS</span>
          <strong>
            {evidence.length}
          </strong>
        </div>

        <div className="incident-detail-metric">
          <span>RELATED EVENTS</span>
          <strong>
            {investigationEvents.length}
          </strong>
        </div>

        <div className="incident-detail-metric">
          <span>RELATED ALERTS</span>
          <strong>
            {investigationAlerts.length}
          </strong>
        </div>

        <div className="incident-detail-metric">
          <span>CATEGORY</span>
          <strong>{category}</strong>
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
            border:
              '1px solid rgba(34, 197, 94, 0.2)',
            background:
              'rgba(34, 197, 94, 0.06)',
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
            border:
              '1px solid rgba(239, 68, 68, 0.22)',
            background:
              'rgba(239, 68, 68, 0.06)',
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
                <span>CASE SOURCE</span>
                <strong>
                  {detectionSource}
                </strong>
              </div>

              <div>
                <span>PRIMARY ASSET</span>
                <strong>
                  {incident.endpoint}
                </strong>
              </div>

              <div>
                <span>CATEGORY</span>
                <strong>{category}</strong>
              </div>

              <div>
                <span>CREATED</span>
                <strong>
                  {incident.created}
                </strong>
              </div>

              <div>
                <span>LAST UPDATED</span>
                <strong>
                  {incident.updated}
                </strong>
              </div>

              <div>
                <span>ANALYST</span>
                <strong>
                  {incident.analyst}
                </strong>
              </div>
            </div>
          </section>

          <section className="incident-detail-panel">
            <div className="incident-detail-panel-header">
              <div>
                <span className="incident-detail-panel-kicker">
                  SECURITY CORRELATION
                </span>

                <h2>
                  Related Investigations
                </h2>
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
                  {incident.relatedEventIds.length >
                  0 ? (
                    incident.relatedEventIds.map(
                      (eventId) => (
                        <Link
                          key={eventId}
                          to={`/soc/events/${eventId}`}
                          style={{
                            display:
                              'inline-flex',
                            alignItems:
                              'center',
                            gap: '5px',
                            color: '#67e8f9',
                            fontSize: '12px',
                            textDecoration:
                              'none',
                          }}
                        >
                          {eventId}
                          <ExternalLink
                            size={11}
                          />
                        </Link>
                      ),
                    )
                  ) : (
                    <span
                      style={{
                        color: '#64748b',
                        fontSize: '12px',
                      }}
                    >
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
                  {incident.relatedAlertIds.length >
                  0 ? (
                    incident.relatedAlertIds.map(
                      (alertId) => (
                        <Link
                          key={alertId}
                          to={`/alerts/${alertId}`}
                          style={{
                            display:
                              'inline-flex',
                            alignItems:
                              'center',
                            gap: '5px',
                            color: '#fbbf24',
                            fontSize: '12px',
                            textDecoration:
                              'none',
                          }}
                        >
                          {alertId}
                          <ExternalLink
                            size={11}
                          />
                        </Link>
                      ),
                    )
                  ) : (
                    <span
                      style={{
                        color: '#64748b',
                        fontSize: '12px',
                      }}
                    >
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

                <h2>
                  Investigation Graph
                </h2>
              </div>

              <Network size={17} />
            </div>

            {investigationLoading ? (
              <div
                style={{
                  padding: '20px 0',
                  color: '#64748b',
                  fontSize: '13px',
                }}
              >
                Loading correlated event,
                alert, and response data...
              </div>
            ) : investigation ? (
              <>
                <div className="incident-detail-context-grid">
                  <div>
                    <span>RELATED EVENTS</span>
                    <strong>
                      {
                        investigation.events
                          .length
                      }
                    </strong>
                  </div>

                  <div>
                    <span>RELATED ALERTS</span>
                    <strong>
                      {
                        investigation.alerts
                          .length
                      }
                    </strong>
                  </div>

                  <div>
                    <span>EVENT ACTIONS</span>
                    <strong>
                      {
                        investigation
                          .event_actions
                          .length
                      }
                    </strong>
                  </div>

                  <div>
                    <span>INCIDENT ACTIONS</span>
                    <strong>
                      {
                        investigation
                          .incident_actions
                          .length
                      }
                    </strong>
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
                  {investigation.events.map(
                    (event) => (
                      <Link
                        key={event.event_id}
                        to={`/soc/events/${event.event_id}`}
                        style={{
                          display:
                            'inline-flex',
                          alignItems:
                            'center',
                          gap: '6px',
                          padding:
                            '7px 10px',
                          borderRadius: '7px',
                          border:
                            '1px solid rgba(34, 211, 238, 0.2)',
                          background:
                            'rgba(34, 211, 238, 0.05)',
                          color: '#67e8f9',
                          fontSize: '11px',
                          textDecoration:
                            'none',
                        }}
                      >
                        EVENT ·{' '}
                        {event.event_id}

                        <ExternalLink
                          size={10}
                        />
                      </Link>
                    ),
                  )}

                  {investigation.alerts.map(
                    (alertId) => (
                      <Link
                        key={alertId}
                        to={`/alerts/${alertId}`}
                        style={{
                          display:
                            'inline-flex',
                          alignItems:
                            'center',
                          gap: '6px',
                          padding:
                            '7px 10px',
                          borderRadius: '7px',
                          border:
                            '1px solid rgba(251, 191, 36, 0.2)',
                          background:
                            'rgba(251, 191, 36, 0.05)',
                          color: '#fbbf24',
                          fontSize: '11px',
                          textDecoration:
                            'none',
                        }}
                      >
                        ALERT · {alertId}

                        <ExternalLink
                          size={10}
                        />
                      </Link>
                    ),
                  )}
                </div>
              </>
            ) : (
              <div
                style={{
                  padding: '20px 0',
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
                <div
                  style={{
                    padding: '20px 0',
                    color: '#64748b',
                    fontSize: '13px',
                  }}
                >
                  Loading investigation
                  timeline...
                </div>
              ) : investigationError ? (
                <div
                  style={{
                    padding: '20px 0',
                    color: '#fca5a5',
                    fontSize: '13px',
                  }}
                >
                  Unable to load
                  investigation timeline:{' '}
                  {investigationError}
                </div>
              ) : investigationTimeline.length >
                0 ? (
                investigationTimeline.map(
                  (event, index) => (
                    <div
                      className="incident-detail-timeline-item"
                      key={`${event.reference_id}-${event.time}-${index}`}
                    >
                      <div
                        className={`incident-detail-timeline-icon incident-detail-timeline-${event.source === 'EVENT' ? 'detection' : event.source === 'INCIDENT_ACTION' ? 'containment' : 'investigation'}`}
                      >
                        {timelineIcon(
                          event.source,
                          event.title,
                        )}
                      </div>

                      <div className="incident-detail-timeline-line" />

                      <div className="incident-detail-timeline-content">
                        <div className="incident-detail-timeline-top">
                          <strong>
                            {event.title}
                          </strong>

                          <span>
                            {formatDate(
                              event.time,
                            )}
                          </span>
                        </div>

                        <p>
                          {event.description}
                        </p>

                        <div className="incident-detail-timeline-actor">
                          <User size={12} />

                          {event.actor}

                          <span
                            style={{
                              marginLeft:
                                '8px',
                              color:
                                '#475569',
                            }}
                          >
                            {event.reference_id}
                          </span>
                        </div>
                      </div>
                    </div>
                  ),
                )
              ) : (
                <div
                  style={{
                    padding: '20px 0',
                    color: '#64748b',
                    fontSize: '13px',
                  }}
                >
                  No investigation timeline
                  events have been recorded.
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
                disabled={
                  actionLoading ||
                  incident.status ===
                    'CONTAINED'
                }
                onClick={() =>
                  executeIncidentAction(
                    'CONTAIN_ENDPOINT',
                    'Endpoint containment action recorded successfully.',
                  )
                }
              >
                <ShieldAlert size={15} />

                {incident.status ===
                'CONTAINED'
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

                {actionLoading
                  ? 'PROCESSING...'
                  : 'COLLECT LIVE DATA'}
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

                {actionLoading
                  ? 'PROCESSING...'
                  : 'PRESERVE EVIDENCE'}
              </button>

              <button
                type="button"
                disabled={
                  actionLoading ||
                  incident.status ===
                    'RESOLVED'
                }
                onClick={() =>
                  executeIncidentAction(
                    'MARK_RESOLVED',
                    'Incident status updated to RESOLVED.',
                  )
                }
              >
                <CheckCircle2 size={15} />

                {incident.status ===
                'RESOLVED'
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

                <h2>
                  Recorded Actions
                </h2>
              </div>

              <Clock3 size={17} />
            </div>

            {incidentActions.length >
            0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection:
                    'column',
                  gap: '10px',
                }}
              >
                {incidentActions.map(
                  (item) => (
                    <div
                      key={item.action_id}
                      style={{
                        display: 'flex',
                        alignItems:
                          'center',
                        justifyContent:
                          'space-between',
                        gap: '14px',
                        padding:
                          '11px 12px',
                        borderRadius:
                          '8px',
                        border:
                          '1px solid rgba(51, 65, 85, 0.55)',
                        background:
                          'rgba(15, 23, 42, 0.42)',
                      }}
                    >
                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >
                        <strong
                          style={{
                            display:
                              'block',
                            color:
                              '#cbd5e1',
                            fontSize:
                              '12px',
                            letterSpacing:
                              '0.03em',
                          }}
                        >
                          {item.action.replaceAll(
                            '_',
                            ' ',
                          )}
                        </strong>

                        <span
                          style={{
                            display:
                              'block',
                            marginTop:
                              '4px',
                            color:
                              '#64748b',
                            fontSize:
                              '11px',
                          }}
                        >
                          {item.action_id}
                          {' · '}
                          {item.analyst}
                        </span>
                      </div>

                      <div
                        style={{
                          textAlign:
                            'right',
                          flexShrink: 0,
                        }}
                      >
                        <strong
                          style={{
                            display:
                              'block',
                            color:
                              '#67e8f9',
                            fontSize:
                              '11px',
                          }}
                        >
                          {item.status.replaceAll(
                            '_',
                            ' ',
                          )}
                        </strong>

                        <span
                          style={{
                            display:
                              'block',
                            marginTop:
                              '4px',
                            color:
                              '#64748b',
                            fontSize:
                              '10px',
                          }}
                        >
                          {formatDate(
                            item.created_at,
                          )}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div
                style={{
                  padding: '8px 0',
                  color: '#64748b',
                  fontSize: '13px',
                }}
              >
                No response actions have
                been recorded for this
                incident.
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

                <h2>
                  Assigned Analyst
                </h2>
              </div>

              <User size={17} />
            </div>

            <div className="incident-detail-owner">
              <div className="incident-detail-owner-avatar">
                <User size={18} />
              </div>

              <div>
                <strong>
                  {incident.analyst}
                </strong>

                <span>
                  Security Operations
                </span>
              </div>
            </div>
          </section>

          <section className="incident-detail-panel">
            <div className="incident-detail-panel-header">
              <div>
                <span className="incident-detail-panel-kicker">
                  AFFECTED ASSET
                </span>

                <h2>
                  {incident.endpoint}
                </h2>
              </div>

              <Network size={17} />
            </div>

            <div className="incident-detail-asset">
              <div>
                <span>HOST STATUS</span>

                <strong>
                  {incident.status ===
                  'CONTAINED'
                    ? 'CONTAINED'
                    : 'MONITORED'}
                </strong>
              </div>

              <div>
                <span>LAST TELEMETRY</span>

                <strong>
                  {incident.updated}
                </strong>
              </div>

              <div>
                <span>CASE SOURCE</span>

                <strong>
                  {detectionSource}
                </strong>
              </div>
            </div>
          </section>

          <section className="incident-detail-panel">
            <div className="incident-detail-panel-header">
              <div>
                <span className="incident-detail-panel-kicker">
                  EVENT CORRELATION
                </span>

                <h2>
                  Backend Evidence
                </h2>
              </div>

              <ShieldAlert size={17} />
            </div>

            <div className="incident-detail-technique">
              <strong>
                {investigationEvents.length >
                0
                  ? `${investigationEvents.length} correlated event${investigationEvents.length === 1 ? '' : 's'}`
                  : 'No correlated events'}
              </strong>

              <span>
                {investigationAlerts.length >
                0
                  ? `${investigationAlerts.length} related alert${investigationAlerts.length === 1 ? '' : 's'}`
                  : 'No related alerts'}
              </span>

              <p>
                Investigation context shown
                here is generated from the
                CyberSentinel backend
                correlation data.
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

            <h2>
              Collected Evidence
            </h2>
          </div>

          <FileSearch size={17} />
        </div>

        <div className="incident-detail-evidence-grid">
          {evidence.length > 0 ? (
            evidence.map((item) => (
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
              No detailed evidence has
              been returned by the backend
              investigation API.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}