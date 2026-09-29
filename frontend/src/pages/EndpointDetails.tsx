import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Cpu,
  HardDrive,
  Laptop,
  Network,
  Shield,
  ShieldAlert,
  Wifi,
} from 'lucide-react'

import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

type EndpointStatus = 'ONLINE' | 'WARNING' | 'OFFLINE'

type EndpointData = {
  name: string
  os: string
  ip: string
  type: string
  status: EndpointStatus
  lastSeen: string
  risk: string
  cpu: string
  memory: string
  disk: string
  gateway: string
  dns: string
  agent: string
}

type ApiEndpoint = {
  id?: number | string
  endpoint_id?: string
  name?: string
  os?: string
  ip?: string
  type?: string
  status?: string
  last_seen?: string
  lastSeen?: string
  risk?: string
  cpu?: string | number
  memory?: string | number
  disk?: string | number
  gateway?: string
  dns?: string
  agent?: string
}

type ApiEvent = {
  id?: number
  event_id: string
  title: string
  description: string
  severity: string
  status: string
  category: string
  asset: string
  source: string
  confidence: number
  alert_id?: string | null
  incident_id?: string | null
  timestamp: string
}

type ApiAlert = {
  id?: number
  alert_id: string
  title: string
  description?: string
  severity: string
  status: string
  category?: string
  source?: string
  asset?: string
  rule_id?: string
  confidence?: number
  created_at: string
  event_id?: string | null
  incident_id?: string | null
}

type ApiIncident = {
  id?: number
  incident_id: string
  title: string
  description?: string
  severity: string
  status: string
  analyst?: string
  primary_asset?: string
  related_event_ids?: string[]
  related_alert_ids?: string[]
  created_at: string
  updated_at: string
}

const API_BASE = 'http://127.0.0.1:8000'

const fallbackEndpointData: Record<string, EndpointData> = {
  'WIN-01': {
    name: 'WIN-01',
    os: 'Windows 11',
    ip: '192.168.1.101',
    type: 'Workstation',
    status: 'ONLINE',
    lastSeen: 'Just now',
    risk: 'LOW',
    cpu: '24%',
    memory: '58%',
    disk: '41%',
    gateway: '192.168.1.1',
    dns: '192.168.1.1',
    agent: 'Running',
  },

  'KALI-01': {
    name: 'KALI-01',
    os: 'Kali Linux',
    ip: '192.168.1.102',
    type: 'Security Lab',
    status: 'ONLINE',
    lastSeen: 'Just now',
    risk: 'LOW',
    cpu: '31%',
    memory: '64%',
    disk: '37%',
    gateway: '192.168.1.1',
    dns: '192.168.1.1',
    agent: 'Running',
  },

  'WIN-02': {
    name: 'WIN-02',
    os: 'Windows 10',
    ip: '192.168.1.103',
    type: 'Workstation',
    status: 'WARNING',
    lastSeen: '2 min ago',
    risk: 'MEDIUM',
    cpu: '72%',
    memory: '81%',
    disk: '78%',
    gateway: '192.168.1.1',
    dns: '192.168.1.1',
    agent: 'Running',
  },

  'LINUX-01': {
    name: 'LINUX-01',
    os: 'Ubuntu Linux',
    ip: '192.168.1.104',
    type: 'Server',
    status: 'ONLINE',
    lastSeen: 'Just now',
    risk: 'LOW',
    cpu: '18%',
    memory: '46%',
    disk: '52%',
    gateway: '192.168.1.1',
    dns: '192.168.1.1',
    agent: 'Running',
  },

  'DEV-01': {
    name: 'DEV-01',
    os: 'Windows 11',
    ip: '192.168.1.105',
    type: 'Developer Workstation',
    status: 'OFFLINE',
    lastSeen: '18 min ago',
    risk: 'HIGH',
    cpu: '—',
    memory: '—',
    disk: '67%',
    gateway: '192.168.1.1',
    dns: '192.168.1.1',
    agent: 'Disconnected',
  },
}

function formatDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function formatLastSeen(value?: string) {
  if (!value) {
    return 'Unknown'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return formatDateTime(value)
}

function normalizePercentage(value: string | number | undefined) {
  if (value === undefined || value === null || value === '') {
    return '—'
  }

  const text = String(value)

  if (text.includes('%')) {
    return text
  }

  return `${text}%`
}

function normalizeEndpoint(
  endpoint: ApiEndpoint,
  fallback: EndpointData,
): EndpointData {
  const rawStatus = String(
    endpoint.status ?? fallback.status,
  ).toUpperCase()

  const status: EndpointStatus =
    rawStatus === 'WARNING' || rawStatus === 'OFFLINE'
      ? rawStatus
      : 'ONLINE'

  return {
    name: endpoint.name ?? endpoint.endpoint_id ?? fallback.name,
    os: endpoint.os ?? fallback.os,
    ip: endpoint.ip ?? fallback.ip,
    type: endpoint.type ?? fallback.type,
    status,
    lastSeen:
      endpoint.last_seen ??
      endpoint.lastSeen ??
      fallback.lastSeen,
    risk: String(endpoint.risk ?? fallback.risk).toUpperCase(),
    cpu: normalizePercentage(endpoint.cpu ?? fallback.cpu),
    memory: normalizePercentage(
      endpoint.memory ?? fallback.memory,
    ),
    disk: normalizePercentage(endpoint.disk ?? fallback.disk),
    gateway: endpoint.gateway ?? fallback.gateway,
    dns: endpoint.dns ?? fallback.dns,
    agent: endpoint.agent ?? fallback.agent,
  }
}

function severityClass(severity: string) {
  const value = severity.toUpperCase()

  if (value === 'CRITICAL') {
    return 'endpoint-correlation-severity critical'
  }

  if (value === 'HIGH') {
    return 'endpoint-correlation-severity high'
  }

  if (value === 'MEDIUM') {
    return 'endpoint-correlation-severity medium'
  }

  return 'endpoint-correlation-severity low'
}

function statusClass(status: string) {
  const value = status.toUpperCase()

  if (
    value === 'INVESTIGATING' ||
    value === 'ALERTED'
  ) {
    return 'endpoint-correlation-status investigating'
  }

  if (
    value === 'BLOCKED' ||
    value === 'RESOLVED' ||
    value === 'CONTAINED'
  ) {
    return 'endpoint-correlation-status resolved'
  }

  return 'endpoint-correlation-status monitored'
}

function EndpointDetails() {
  const { endpointId } = useParams()

  const fallback = endpointId
    ? fallbackEndpointData[endpointId]
    : undefined

  const [endpoint, setEndpoint] =
    useState<EndpointData | undefined>(fallback)

  const [events, setEvents] = useState<ApiEvent[]>([])
  const [alerts, setAlerts] = useState<ApiAlert[]>([])
  const [incidents, setIncidents] =
    useState<ApiIncident[]>([])

  const [loading, setLoading] = useState(true)
  const [apiConnected, setApiConnected] = useState(false)

  useEffect(() => {
    if (!endpointId) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadEndpointData() {
      setLoading(true)

      const results = await Promise.allSettled([
        fetch(
          `${API_BASE}/api/endpoints/${endpointId}`,
        ).then(async (response) => {
          if (!response.ok) {
            throw new Error('Endpoint API request failed')
          }

          return (await response.json()) as ApiEndpoint
        }),

        fetch(`${API_BASE}/api/events`).then(
          async (response) => {
            if (!response.ok) {
              throw new Error('Events API request failed')
            }

            return (await response.json()) as ApiEvent[]
          },
        ),

        fetch(`${API_BASE}/api/alerts`).then(
          async (response) => {
            if (!response.ok) {
              throw new Error('Alerts API request failed')
            }

            return (await response.json()) as ApiAlert[]
          },
        ),

        fetch(`${API_BASE}/api/incidents`).then(
          async (response) => {
            if (!response.ok) {
              throw new Error(
                'Incidents API request failed',
              )
            }

            return (await response.json()) as ApiIncident[]
          },
        ),
      ])

      if (cancelled) {
        return
      }

      const endpointResult = results[0]
      const eventsResult = results[1]
      const alertsResult = results[2]
      const incidentsResult = results[3]

      let successfulRequests = 0

      if (endpointResult.status === 'fulfilled') {
        successfulRequests += 1

        setEndpoint(
          normalizeEndpoint(
            endpointResult.value,
            fallback ?? {
              name: endpointId ?? 'Unknown Endpoint',
              os: 'Unknown',
              ip: '—',
              type: 'Endpoint',
              status: 'OFFLINE',
              lastSeen: 'Unknown',
              risk: 'UNKNOWN',
              cpu: '—',
              memory: '—',
              disk: '—',
              gateway: '—',
              dns: '—',
              agent: 'Unknown',
            },
          ),
        )
      } else {
        setEndpoint(fallback)
      }

      if (eventsResult.status === 'fulfilled') {
        successfulRequests += 1
        setEvents(eventsResult.value)
      } else {
        setEvents([])
      }

      if (alertsResult.status === 'fulfilled') {
        successfulRequests += 1
        setAlerts(alertsResult.value)
      } else {
        setAlerts([])
      }

      if (incidentsResult.status === 'fulfilled') {
        successfulRequests += 1
        setIncidents(incidentsResult.value)
      } else {
        setIncidents([])
      }

      setApiConnected(successfulRequests > 0)
      setLoading(false)
    }

    loadEndpointData()

    return () => {
      cancelled = true
    }
  }, [endpointId])

  const relatedEvents = useMemo(() => {
    if (!endpointId) {
      return []
    }

    return events
      .filter(
        (event) =>
          event.asset?.toUpperCase() ===
          endpointId.toUpperCase(),
      )
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime(),
      )
  }, [events, endpointId])

  const relatedAlerts = useMemo(() => {
    if (!endpointId) {
      return []
    }

    const eventAlertIds = new Set(
      relatedEvents
        .map((event) => event.alert_id)
        .filter(Boolean),
    )

    return alerts
      .filter((alert) => {
        const sameAsset =
          alert.asset?.toUpperCase() ===
          endpointId.toUpperCase()

        const correlated =
          eventAlertIds.has(alert.alert_id)

        return sameAsset || correlated
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime(),
      )
  }, [alerts, relatedEvents, endpointId])

  const relatedIncidents = useMemo(() => {
    if (!endpointId) {
      return []
    }

    const eventIncidentIds = new Set(
      relatedEvents
        .map((event) => event.incident_id)
        .filter(Boolean),
    )

    const alertIncidentIds = new Set(
      relatedAlerts
        .map((alert) => alert.incident_id)
        .filter(Boolean),
    )

    return incidents
      .filter((incident) => {
        const sameAsset =
          incident.primary_asset?.toUpperCase() ===
          endpointId.toUpperCase()

        const correlated =
          eventIncidentIds.has(incident.incident_id) ||
          alertIncidentIds.has(incident.incident_id)

        const explicitlyRelated =
          incident.related_event_ids?.some(
            (id) =>
              relatedEvents.some(
                (event) => event.event_id === id,
              ),
          ) ||
          incident.related_alert_ids?.some(
            (id) =>
              relatedAlerts.some(
                (alert) => alert.alert_id === id,
              ),
          )

        return (
          sameAsset ||
          correlated ||
          explicitlyRelated
        )
      })
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() -
          new Date(a.updated_at).getTime(),
      )
  }, [
    incidents,
    relatedEvents,
    relatedAlerts,
    endpointId,
  ])

  if (loading && !endpoint) {
    return (
      <div className="page-container">
        <div className="endpoint-not-found">
          <Activity size={30} />

          <h1>Loading Endpoint</h1>

          <p>
            Loading endpoint security profile...
          </p>
        </div>
      </div>
    )
  }

  if (!endpoint) {
    return (
      <div className="page-container">
        <div className="endpoint-not-found">
          <ShieldAlert size={30} />

          <h1>Endpoint Not Found</h1>

          <p>
            The requested endpoint does not exist in
            CyberSentinel.
          </p>

          <Link
            to="/endpoints"
            className="back-to-endpoints"
          >
            <ArrowLeft size={15} />
            Back to Endpoints
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container endpoint-details-page">

      <Link
        to="/endpoints"
        className="endpoint-back-link"
      >
        <ArrowLeft size={15} />
        Back to Endpoints
      </Link>

      <div className="endpoint-details-header">
        <div className="endpoint-details-identity">
          <div className="endpoint-details-icon">
            <Laptop size={25} />
          </div>

          <div>
            <div className="page-eyebrow">
              ENDPOINT SECURITY PROFILE
            </div>

            <h1>{endpoint.name}</h1>

            <div className="endpoint-details-subtitle">
              {endpoint.os} • {endpoint.type}
            </div>
          </div>
        </div>

        <div
          className={`endpoint-main-status endpoint-status-${endpoint.status.toLowerCase()}`}
        >
          <span />
          {endpoint.status}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '14px',
          fontSize: '12px',
          color: apiConnected ? '#22c55e' : '#94a3b8',
        }}
      >
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background:
              apiConnected ? '#22c55e' : '#64748b',
            marginRight: '7px',
            marginTop: '5px',
          }}
        />

        {apiConnected
          ? 'BACKEND CONNECTED'
          : 'DEMO DATA'}
      </div>

      <section className="endpoint-details-grid">

        <div className="endpoint-detail-card">
          <div className="endpoint-detail-card-header">
            <span>SYSTEM</span>
            <Laptop size={17} />
          </div>

          <div className="endpoint-detail-main">
            {endpoint.os}
          </div>

          <div className="endpoint-detail-muted">
            Operating system
          </div>
        </div>

        <div className="endpoint-detail-card">
          <div className="endpoint-detail-card-header">
            <span>NETWORK</span>
            <Network size={17} />
          </div>

          <div className="endpoint-detail-main endpoint-mono">
            {endpoint.ip}
          </div>

          <div className="endpoint-detail-muted">
            IPv4 address
          </div>
        </div>

        <div className="endpoint-detail-card">
          <div className="endpoint-detail-card-header">
            <span>RISK LEVEL</span>
            <Shield size={17} />
          </div>

          <div
            className={`endpoint-detail-main endpoint-risk-${endpoint.risk.toLowerCase()}`}
          >
            {endpoint.risk}
          </div>

          <div className="endpoint-detail-muted">
            Current endpoint risk
          </div>
        </div>

        <div className="endpoint-detail-card">
          <div className="endpoint-detail-card-header">
            <span>AGENT</span>
            <Wifi size={17} />
          </div>

          <div className="endpoint-detail-main">
            {endpoint.agent}
          </div>

          <div className="endpoint-detail-muted">
            Last seen: {formatLastSeen(endpoint.lastSeen)}
          </div>
        </div>

      </section>

      <section className="endpoint-details-columns">

        <div className="endpoint-panel">
          <div className="endpoint-panel-header">
            <div>
              <div className="endpoint-panel-title">
                System Resources
              </div>

              <div className="endpoint-panel-subtitle">
                Current endpoint resource utilization
              </div>
            </div>

            <Activity size={18} />
          </div>

          <div className="resource-list">

            <div className="resource-row">
              <div className="resource-label">
                <Cpu size={15} />
                CPU Usage
              </div>

              <div className="resource-value">
                {endpoint.cpu}
              </div>
            </div>

            <div className="resource-bar">
              <span
                style={{
                  width:
                    endpoint.cpu === '—'
                      ? '0%'
                      : endpoint.cpu,
                }}
              />
            </div>

            <div className="resource-row">
              <div className="resource-label">
                <Activity size={15} />
                Memory Usage
              </div>

              <div className="resource-value">
                {endpoint.memory}
              </div>
            </div>

            <div className="resource-bar">
              <span
                style={{
                  width:
                    endpoint.memory === '—'
                      ? '0%'
                      : endpoint.memory,
                }}
              />
            </div>

            <div className="resource-row">
              <div className="resource-label">
                <HardDrive size={15} />
                Disk Usage
              </div>

              <div className="resource-value">
                {endpoint.disk}
              </div>
            </div>

            <div className="resource-bar">
              <span
                style={{
                  width:
                    endpoint.disk === '—'
                      ? '0%'
                      : endpoint.disk,
                }}
              />
            </div>

          </div>
        </div>

        <div className="endpoint-panel">
          <div className="endpoint-panel-header">
            <div>
              <div className="endpoint-panel-title">
                Network Information
              </div>

              <div className="endpoint-panel-subtitle">
                Endpoint connectivity information
              </div>
            </div>

            <Network size={18} />
          </div>

          <div className="network-info-list">

            <div className="network-info-row">
              <span>IPv4 Address</span>
              <strong>{endpoint.ip}</strong>
            </div>

            <div className="network-info-row">
              <span>Default Gateway</span>
              <strong>{endpoint.gateway}</strong>
            </div>

            <div className="network-info-row">
              <span>DNS Server</span>
              <strong>{endpoint.dns}</strong>
            </div>

            <div className="network-info-row">
              <span>Connection</span>

              <strong
                className={
                  endpoint.status === 'OFFLINE'
                    ? 'network-offline'
                    : 'network-online'
                }
              >
                {endpoint.status === 'OFFLINE'
                  ? 'Disconnected'
                  : 'Connected'}
              </strong>
            </div>

          </div>
        </div>

      </section>

      {/* CORRELATION CENTER */}

      <section className="endpoint-panel endpoint-activity-panel">

        <div className="endpoint-panel-header">
          <div>
            <div className="endpoint-panel-title">
              Security Correlation
            </div>

            <div className="endpoint-panel-subtitle">
              Connected security objects associated with{' '}
              {endpoint.name}
            </div>
          </div>

          <ShieldAlert size={18} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
          }}
        >

          <div className="endpoint-detail-card">
            <div className="endpoint-detail-card-header">
              <span>EVENTS</span>
              <Activity size={16} />
            </div>

            <div className="endpoint-detail-main">
              {relatedEvents.length}
            </div>

            <div className="endpoint-detail-muted">
              Related security events
            </div>
          </div>

          <div className="endpoint-detail-card">
            <div className="endpoint-detail-card-header">
              <span>ALERTS</span>
              <ShieldAlert size={16} />
            </div>

            <div className="endpoint-detail-main">
              {relatedAlerts.length}
            </div>

            <div className="endpoint-detail-muted">
              Related security alerts
            </div>
          </div>

          <div className="endpoint-detail-card">
            <div className="endpoint-detail-card-header">
              <span>INCIDENTS</span>
              <AlertTriangle size={16} />
            </div>

            <div className="endpoint-detail-main">
              {relatedIncidents.length}
            </div>

            <div className="endpoint-detail-muted">
              Related investigation cases
            </div>
          </div>

        </div>

        {/* EVENTS */}

        <div style={{ marginBottom: '20px' }}>

          <div
            className="endpoint-panel-title"
            style={{ marginBottom: '10px' }}
          >
            Related Security Events
          </div>

          {relatedEvents.length === 0 ? (
            <div className="endpoint-detail-muted">
              No correlated security events found.
            </div>
          ) : (
            <div className="endpoint-activity-list">

              {relatedEvents.map((event) => (
                <div
                  className="endpoint-activity-row"
                  key={event.event_id}
                >
                  <div
                    className={`activity-indicator ${
                      event.severity === 'CRITICAL' ||
                      event.severity === 'HIGH'
                        ? 'activity-high'
                        : event.severity === 'MEDIUM'
                          ? 'activity-medium'
                          : 'activity-low'
                    }`}
                  />

                  <div className="activity-content">
                    <strong>
                      <Link
                        to={`/soc/events/${event.event_id}`}
                        style={{
                          color: 'inherit',
                          textDecoration: 'none',
                        }}
                      >
                        {event.event_id} · {event.title}
                      </Link>
                    </strong>

                    <span>
                      {event.category} · {event.source}
                    </span>
                  </div>

                  <div
                    className={severityClass(
                      event.severity,
                    )}
                  >
                    {event.severity}
                  </div>

                  <div className="activity-time">
                    {formatDateTime(event.timestamp)}
                  </div>
                </div>
              ))}

            </div>
          )}

        </div>

        {/* ALERTS */}

        <div style={{ marginBottom: '20px' }}>

          <div
            className="endpoint-panel-title"
            style={{ marginBottom: '10px' }}
          >
            Related Alerts
          </div>

          {relatedAlerts.length === 0 ? (
            <div className="endpoint-detail-muted">
              No correlated alerts found.
            </div>
          ) : (
            <div className="endpoint-activity-list">

              {relatedAlerts.map((alert) => (
                <div
                  className="endpoint-activity-row"
                  key={alert.alert_id}
                >
                  <div
                    className={`activity-indicator ${
                      alert.severity === 'CRITICAL' ||
                      alert.severity === 'HIGH'
                        ? 'activity-high'
                        : alert.severity === 'MEDIUM'
                          ? 'activity-medium'
                          : 'activity-low'
                    }`}
                  />

                  <div className="activity-content">
                    <strong>
                      <Link
                        to={`/alerts/${alert.alert_id}`}
                        style={{
                          color: 'inherit',
                          textDecoration: 'none',
                        }}
                      >
                        {alert.alert_id} · {alert.title}
                      </Link>
                    </strong>

                    <span>
                      {alert.category ?? 'Security Alert'} ·{' '}
                      {alert.source ?? 'Security Engine'}
                    </span>
                  </div>

                  <div
                    className={severityClass(
                      alert.severity,
                    )}
                  >
                    {alert.severity}
                  </div>

                  <div
                    className={statusClass(
                      alert.status,
                    )}
                  >
                    {alert.status}
                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

        {/* INCIDENTS */}

        <div>

          <div
            className="endpoint-panel-title"
            style={{ marginBottom: '10px' }}
          >
            Related Incidents
          </div>

          {relatedIncidents.length === 0 ? (
            <div className="endpoint-detail-muted">
              No correlated incidents found.
            </div>
          ) : (
            <div className="endpoint-activity-list">

              {relatedIncidents.map((incident) => (
                <div
                  className="endpoint-activity-row"
                  key={incident.incident_id}
                >
                  <div
                    className={`activity-indicator ${
                      incident.severity === 'CRITICAL' ||
                      incident.severity === 'HIGH'
                        ? 'activity-high'
                        : incident.severity === 'MEDIUM'
                          ? 'activity-medium'
                          : 'activity-low'
                    }`}
                  />

                  <div className="activity-content">
                    <strong>
                      <Link
                        to={`/incidents/${incident.incident_id}`}
                        style={{
                          color: 'inherit',
                          textDecoration: 'none',
                        }}
                      >
                        {incident.incident_id} ·{' '}
                        {incident.title}
                      </Link>
                    </strong>

                    <span>
                      Asset: {incident.primary_asset ?? '—'} ·{' '}
                      Analyst: {incident.analyst ?? 'SOC Analyst'}
                    </span>
                  </div>

                  <div
                    className={severityClass(
                      incident.severity,
                    )}
                  >
                    {incident.severity}
                  </div>

                  <div
                    className={statusClass(
                      incident.status,
                    )}
                  >
                    {incident.status}
                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </section>

      {/* SECURITY ACTIVITY */}

      <section className="endpoint-panel endpoint-activity-panel">

        <div className="endpoint-panel-header">
          <div>
            <div className="endpoint-panel-title">
              Recent Security Activity
            </div>

            <div className="endpoint-panel-subtitle">
              Recent events observed on {endpoint.name}
            </div>
          </div>

          <ShieldAlert size={18} />
        </div>

        <div className="endpoint-activity-list">

          {relatedEvents.length === 0 ? (

            <>
              <div className="endpoint-activity-row">
                <div className="activity-indicator activity-high" />

                <div className="activity-content">
                  <strong>
                    Authentication event detected
                  </strong>

                  <span>
                    New authentication activity observed
                    on endpoint
                  </span>
                </div>

                <div className="activity-time">
                  Recent
                </div>
              </div>

              <div className="endpoint-activity-row">
                <div className="activity-indicator activity-medium" />

                <div className="activity-content">
                  <strong>
                    Process activity recorded
                  </strong>

                  <span>
                    New process execution recorded by
                    endpoint agent
                  </span>
                </div>

                <div className="activity-time">
                  Recent
                </div>
              </div>

              <div className="endpoint-activity-row">
                <div className="activity-indicator activity-low" />

                <div className="activity-content">
                  <strong>
                    Network connection observed
                  </strong>

                  <span>
                    Endpoint established an outbound
                    network connection
                  </span>
                </div>

                <div className="activity-time">
                  Recent
                </div>
              </div>
            </>

          ) : (

            relatedEvents.slice(0, 5).map((event) => (
              <div
                className="endpoint-activity-row"
                key={`activity-${event.event_id}`}
              >
                <div
                  className={`activity-indicator ${
                    event.severity === 'CRITICAL' ||
                    event.severity === 'HIGH'
                      ? 'activity-high'
                      : event.severity === 'MEDIUM'
                        ? 'activity-medium'
                        : 'activity-low'
                  }`}
                />

                <div className="activity-content">
                  <strong>
                    <Link
                      to={`/soc/events/${event.event_id}`}
                      style={{
                        color: 'inherit',
                        textDecoration: 'none',
                      }}
                    >
                      {event.title}
                    </Link>
                  </strong>

                  <span>
                    {event.event_id} · {event.source}
                  </span>
                </div>

                <div className="activity-time">
                  {formatDateTime(event.timestamp)}
                </div>
              </div>
            ))

          )}

        </div>

      </section>

    </div>
  )
}

export default EndpointDetails