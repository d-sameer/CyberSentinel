import {
  Activity,
  Bug,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Cpu,
  Globe,
  LockKeyhole,
  Network,
  Server,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  UserRound,
  Wifi,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'

type SecurityEvent = {
  id: string
  time: string
  severity: Severity
  event: string
  source: string
  asset: string
  category: string
  status: string
}

type ApiEvent = {
  id?: number
  event_id: string
  title: string
  description?: string
  severity: Severity
  status: string
  category: string
  asset: string
  source: string
  confidence?: number
  timestamp: string
}

type ApiAlert = {
  id?: number
  alert_id: string
  title: string
  severity: Severity
  status: string
  category?: string
  source?: string
  asset?: string
  rule_id?: string
  confidence?: number
  created_at: string
}

type ApiEndpoint = {
  id?: number | string
  endpoint_id?: string
  name?: string
  os?: string
  status?: string
  risk?: string
  agent?: string
  last_seen?: string
  lastSeen?: string
}

type ApiIncident = {
  id?: number
  incident_id: string
  title: string
  description?: string
  severity: Severity
  status: string
  analyst?: string
  primary_asset?: string
  related_event_ids?: string[]
  related_alert_ids?: string[]
  created_at: string
  updated_at: string
}

const API_BASE = 'http://127.0.0.1:8001'

function getNetworkCollection(payload: unknown): unknown[] | undefined {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return undefined

  const record = payload as Record<string, unknown>
  for (const key of ['connections', 'items', 'results', 'data']) {
    const candidate = record[key]
    const collection = getNetworkCollection(candidate)
    if (collection) return collection
  }

  return undefined
}

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function normalizeEvent(event: ApiEvent): SecurityEvent {
  return {
    id: event.event_id,
    time: formatTime(event.timestamp),
    severity: event.severity,
    event: event.title,
    source: event.source,
    asset: event.asset,
    category: event.category,
    status: event.status,
  }
}

function isEndpointAtRisk(endpoint: ApiEndpoint) {
  const risk = String(endpoint.risk ?? '').toUpperCase()
  const status = String(endpoint.status ?? '').toUpperCase()

  return (
    risk === 'HIGH' ||
    risk === 'CRITICAL' ||
    status === 'WARNING' ||
    status === 'OFFLINE' ||
    status === 'CRITICAL'
  )
}

const severityClass = (severity: Severity) => {
  switch (severity) {
    case 'CRITICAL':
      return 'soc-severity critical'
    case 'HIGH':
      return 'soc-severity high'
    case 'MEDIUM':
      return 'soc-severity medium'
    case 'LOW':
      return 'soc-severity low'
    default:
      return 'soc-severity info'
  }
}

const statusClass = (status: string) => {
  switch (status) {
    case 'INVESTIGATING':
      return 'soc-status investigating'
    case 'ALERTED':
      return 'soc-status alerted'
    case 'BLOCKED':
      return 'soc-status blocked'
    case 'REVIEW':
      return 'soc-status review'
    case 'NORMAL':
      return 'soc-status normal'
    default:
      return 'soc-status monitored'
  }
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  tone,
  to,
}: {
  icon: React.ReactNode
  label: string
  value: string
  detail: string
  tone: string
  to: string
}) {
  return (
    <Link
      to={to}
      className={`soc-metric-card ${tone} soc-metric-link`}
      style={{ color: "inherit", textDecoration: "none" }}
      aria-label={`${label}: ${value}. ${detail}. Open related section`}
    >
      <div className="soc-metric-top">
        <div className="soc-metric-icon">{icon}</div>
        <span className="soc-live-dot" />
      </div>

      <div className="soc-metric-value">{value}</div>
      <div className="soc-metric-label">{label}</div>
      <div className="soc-metric-detail">{detail}</div>
    </Link>
  )
}

function ActivityBar({
  label,
  value,
  width,
}: {
  label: string
  value: string
  width: string
}) {
  return (
    <div className="soc-activity-row">
      <div className="soc-activity-label">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <div className="soc-bar-track">
        <div className="soc-bar-fill" style={{ width }} />
      </div>
    </div>
  )
}

export default function SOC() {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [alerts, setAlerts] = useState<ApiAlert[]>([])
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([])
  const [incidents, setIncidents] = useState<ApiIncident[]>([])
  const [networkConnections, setNetworkConnections] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [apiState, setApiState] = useState<'loading' | 'connected' | 'partial' | 'offline'>('loading')
  const [lastUpdated, setLastUpdated] = useState('—')

  useEffect(() => {
    let cancelled = false

    const loadSOCData = async () => {
      const results = await Promise.allSettled([
        fetch(`${API_BASE}/api/events`).then(async (response) => {
          if (!response.ok) throw new Error('Events API request failed')
          return (await response.json()) as ApiEvent[]
        }),
        fetch(`${API_BASE}/api/alerts`).then(async (response) => {
          if (!response.ok) throw new Error('Alerts API request failed')
          return (await response.json()) as ApiAlert[]
        }),
        fetch(`${API_BASE}/api/endpoints`).then(async (response) => {
          if (!response.ok) throw new Error('Endpoints API request failed')
          return (await response.json()) as ApiEndpoint[]
        }),
        fetch(`${API_BASE}/api/incidents`).then(async (response) => {
          if (!response.ok) throw new Error('Incidents API request failed')
          return (await response.json()) as ApiIncident[]
        }),
        fetch(`${API_BASE}/api/network`).then(async (response) => {
          if (!response.ok) throw new Error('Network API request failed')
          return (await response.json()) as unknown
        }),
      ])

      if (cancelled) return

      const eventsResult = results[0]
      const alertsResult = results[1]
      const endpointsResult = results[2]
      const incidentsResult = results[3]
      const networkResult = results[4]
      const successful = results.filter((result) => result.status === 'fulfilled').length

      if (eventsResult.status === 'fulfilled') {
        const sortedEvents = [...eventsResult.value]
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          )
          .map(normalizeEvent)

        setEvents(sortedEvents)
      } else {
        setEvents([])
      }

      if (alertsResult.status === 'fulfilled') {
        setAlerts(alertsResult.value)
      } else {
        setAlerts([])
      }

      if (endpointsResult.status === 'fulfilled') {
        setEndpoints(endpointsResult.value)
      } else {
        setEndpoints([])
      }

      if (incidentsResult.status === 'fulfilled') {
        setIncidents(incidentsResult.value)
      } else {
        setIncidents([])
      }

      if (networkResult.status === 'fulfilled') {
        const collection = getNetworkCollection(networkResult.value)
        setNetworkConnections(collection?.length ?? 0)
      } else {
        setNetworkConnections(0)
      }

      setApiState(
        successful === 5
          ? 'connected'
          : successful > 0
            ? 'partial'
            : 'offline',
      )
      setLastUpdated(formatDateTime(new Date().toISOString()))
    }

    loadSOCData()

    const interval = window.setInterval(loadSOCData, 30000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [refreshKey])

  const activeThreats = useMemo(
    () =>
      events.filter(
        (event) =>
          (event.severity === 'CRITICAL' || event.severity === 'HIGH') &&
          event.status !== 'BLOCKED' &&
          event.status !== 'NORMAL',
      ).length,
    [events],
  )

  const criticalAlerts = useMemo(
    () => alerts.filter((alert) => alert.severity === 'CRITICAL').length,
    [alerts],
  )

  const openIncidents = useMemo(
    () =>
      incidents.filter(
        (incident) =>
          String(incident.status).toUpperCase() !== 'RESOLVED',
      ).length,
    [incidents],
  )

  const endpointsAtRisk = useMemo(
    () => endpoints.filter(isEndpointAtRisk).length,
    [endpoints],
  )

  const endpointHealth = useMemo(() => {
    const healthy = endpoints.filter((endpoint) => {
      const status = String(endpoint.status ?? '').toUpperCase()
      const risk = String(endpoint.risk ?? '').toUpperCase()
      return (
        status === 'ONLINE' ||
        status === 'HEALTHY' ||
        risk === 'LOW'
      )
    }).length

    const critical = endpoints.filter((endpoint) => {
      const status = String(endpoint.status ?? '').toUpperCase()
      const risk = String(endpoint.risk ?? '').toUpperCase()
      return status === 'CRITICAL' || risk === 'CRITICAL'
    }).length

    const atRisk = endpoints.filter((endpoint) => {
      const risk = String(endpoint.risk ?? '').toUpperCase()
      const status = String(endpoint.status ?? '').toUpperCase()
      return (
        risk === 'HIGH' ||
        status === 'WARNING' ||
        status === 'OFFLINE'
      )
    }).length

    const monitored = Math.max(
      endpoints.length - healthy - atRisk - critical,
      0,
    )

    return { healthy, monitored, atRisk, critical }
  }, [endpoints])

  const riskScore = useMemo(() => {
    if (endpoints.length === 0 && events.length === 0) return 0

    const endpointRisk = endpoints.length
      ? Math.round((endpointsAtRisk / endpoints.length) * 40)
      : 0

    const criticalEventRisk = events.length
      ? Math.round(
          (events.filter((event) => event.severity === 'CRITICAL').length /
            events.length) *
            35,
        )
      : 0

    const alertRisk = alerts.length
      ? Math.round(
          (alerts.filter((alert) =>
            alert.severity === 'CRITICAL' || alert.severity === 'HIGH',
          ).length /
            alerts.length) *
            25,
        )
      : 0

    return Math.min(endpointRisk + criticalEventRisk + alertRisk, 100)
  }, [alerts, endpoints, endpointsAtRisk, events])

  const postureLabel =
    riskScore >= 70 ? 'Elevated Risk' : riskScore >= 40 ? 'Guarded' : 'Stable'

  const apiStatusText =
    apiState === 'connected'
      ? 'All SOC data services connected'
      : apiState === 'partial'
        ? 'Some SOC data services unavailable'
        : apiState === 'offline'
          ? 'Backend API unavailable'
          : 'Connecting to SOC backend'

  const latestEvents = events.slice(0, 8)

  const eventCounts = useMemo(() => {
    const critical = events.filter((event) => event.severity === 'CRITICAL').length
    const high = events.filter((event) => event.severity === 'HIGH').length
    const medium = events.filter((event) => event.severity === 'MEDIUM').length
    const info = events.filter(
      (event) => event.severity === 'INFO' || event.severity === 'LOW',
    ).length

    return { critical, high, medium, info }
  }, [events])

  const totalEventCount = Math.max(events.length, 1)
  const threatActivity = [
    Math.round((eventCounts.critical / totalEventCount) * 100),
    Math.round((eventCounts.high / totalEventCount) * 100),
    Math.round((eventCounts.medium / totalEventCount) * 100),
    Math.round((eventCounts.info / totalEventCount) * 100),
  ]

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    events.forEach((event) => {
      counts.set(event.category, (counts.get(event.category) ?? 0) + 1)
    })

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
  }, [events])

  const maxCategoryCount = Math.max(
    ...categoryCounts.map(([, count]) => count),
    1,
  )

  return (
    <div className="soc-page">
      <div className="soc-page-header">
        <div>
          <div className="soc-eyebrow">
            <span className="soc-live-indicator" />
            SECURITY OPERATIONS CENTER
          </div>

          <h1>SOC Command Center</h1>

          <p>
            Real-time security visibility across endpoints, network activity,
            identity events, threats, and active investigations.
          </p>
        </div>

        <div className="soc-header-status">
          <div className={`soc-status-card ${apiState}`}>
            <span className="soc-status-dot" />
            <div>
              <strong>
                {apiState === 'connected'
                  ? 'SOC ONLINE'
                  : apiState === 'partial'
                    ? 'SOC PARTIAL'
                    : apiState === 'offline'
                      ? 'SOC OFFLINE'
                      : 'SOC CONNECTING'}
              </strong>
              <span>{apiStatusText}</span>
            </div>
          </div>

          <div className="soc-time-card">
            <Clock3 size={15} />
            <span>Last updated {lastUpdated}</span>
          </div>
        </div>
      </div>

      <div className="soc-metrics-grid">
        <MetricCard
          icon={<ShieldAlert size={21} />}
          label="Active Threats"
          value={String(activeThreats)}
          detail="Critical and high severity events"
          tone="danger"
          to="/alerts"
        />

        <MetricCard
          icon={<AlertTriangle size={21} />}
          label="Critical Alerts"
          value={String(criticalAlerts)}
          detail="Loaded from alert service"
          tone="critical"
          to="/alerts"
        />

        <MetricCard
          icon={<Server size={21} />}
          label="Endpoints at Risk"
          value={String(endpointsAtRisk)}
          detail="High, critical, warning or offline"
          tone="warning"
          to="/endpoints"
        />

        <MetricCard
          icon={<Activity size={21} />}
          label="Recent Events"
          value={String(events.length)}
          detail="Events in current API snapshot"
          tone="cyan"
          to="/soc"
        />

        <MetricCard
          icon={<Network size={21} />}
          label="Network Connections"
          value={String(networkConnections)}
          detail="Connections from network service"
          tone="blue"
          to="/network"
        />

        <MetricCard
          icon={<Zap size={21} />}
          label="Open Incidents"
          value={String(openIncidents)}
          detail="Loaded from incident service"
          tone="purple"
          to="/incidents"
        />
      </div>

      <div className="soc-main-grid">
        <section className="soc-panel soc-event-panel">
          <div className="soc-panel-header">
            <div>
              <div className="soc-panel-kicker">
                <Activity size={14} />
                LIVE TELEMETRY
              </div>
              <h2>Security Event Stream</h2>
            </div>

            <div className="soc-stream-status">
              <span />
              {apiState === 'offline' ? 'OFFLINE' : 'STREAMING'}
            </div>
          </div>

          <div className="soc-event-list">
            {latestEvents.length === 0 ? (
              <div
                style={{
                  padding: '32px 20px',
                  textAlign: 'center',
                  color: '#64748b',
                }}
              >
                {apiState === 'offline'
                  ? 'Unable to load security events from the backend.'
                  : 'No security events are currently available.'}
              </div>
            ) : (
              latestEvents.map((event) => (
                <div className="soc-event-row" key={event.id}>
                  <div className="soc-event-time">{event.time}</div>

                  <div className={severityClass(event.severity)}>
                    {event.severity}
                  </div>

                  <div className="soc-event-icon">
                    {event.category === 'Network' && <Globe size={16} />}
                    {event.category === 'Execution' && <Terminal size={16} />}
                    {event.category === 'Identity' && <UserRound size={16} />}
                    {event.category === 'Process' && <Cpu size={16} />}
                    {event.category === 'System' && <Server size={16} />}
                    {event.category === 'Defense Evasion' && (
                      <ShieldAlert size={16} />
                    )}
                    {event.category === 'Privilege' && (
                      <LockKeyhole size={16} />
                    )}
                    {![
                      'Network',
                      'Execution',
                      'Identity',
                      'Process',
                      'System',
                      'Defense Evasion',
                      'Privilege',
                    ].includes(event.category) && <Activity size={16} />}
                  </div>

                  <div className="soc-event-content">
                    <strong>{event.event}</strong>
                    <span>
                      {event.source} • {event.asset}
                    </span>
                  </div>

                  <div className={statusClass(event.status)}>
                    {event.status}
                  </div>

                  <Link
                    to={`/soc/events/${event.id}`}
                    className="soc-event-action"
                    title="View event"
                  >
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              ))
            )}
          </div>

          <div className="soc-panel-footer">
            <span>
              Showing latest {latestEvents.length} of {events.length} security
              events
            </span>
            <button
              type="button"
              className="soc-refresh-button"
              onClick={() => setRefreshKey((current) => current + 1)}
              aria-label="Refresh SOC dashboard data"
            >
              Refresh data ↻
            </button>
          </div>
        </section>

        <section className="soc-panel soc-posture-panel">
          <div className="soc-panel-header">
            <div>
              <div className="soc-panel-kicker">
                <ShieldCheck size={14} />
                SECURITY POSTURE
              </div>
              <h2>Current Risk</h2>
            </div>
          </div>

          <div className="soc-risk-score">
            <div className="soc-score-ring">
              <div>
                <strong>{riskScore}</strong>
                <span>/100</span>
              </div>
            </div>

            <div className="soc-score-info">
              <strong>{postureLabel}</strong>
              <span>
                Calculated from current endpoint, event, and alert telemetry.
              </span>
            </div>
          </div>

          <div className="soc-posture-list">
            <div>
              <span>
                <CheckCircle2 size={15} />
                Endpoint Inventory
              </span>
              <strong>{endpoints.length > 0 ? endpoints.length : '—'}</strong>
            </div>

            <div>
              <span>
                <CheckCircle2 size={15} />
                Events In Snapshot
              </span>
              <strong>{events.length > 0 ? events.length : '—'}</strong>
            </div>

            <div>
              <span>
                <AlertTriangle size={15} />
                Open Investigations
              </span>
              <strong>{openIncidents}</strong>
            </div>

            <div>
              <span>
                <AlertTriangle size={15} />
                Identity Risk
              </span>
              <strong>
                {events.filter((event) => event.category === 'Identity').length}
              </strong>
            </div>
          </div>
        </section>
      </div>

      <div className="soc-secondary-grid">
        <section className="soc-panel">
          <div className="soc-panel-header">
            <div>
              <div className="soc-panel-kicker">
                <Network size={14} />
                ACTIVITY
              </div>
              <h2>Threat Activity</h2>
            </div>

            <span className="soc-select">LIVE API SNAPSHOT</span>
          </div>

          <div className="soc-activity-chart">
            <div className="soc-chart-grid">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="soc-chart-bars">
              {threatActivity.map((value, index) => (
                <div className="soc-chart-column" key={index}>
                  <div
                    className="soc-chart-bar"
                    style={{ height: `${Math.max(value, 8)}%` }}
                  />
                  <span>{index + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="soc-chart-legend">
            <span>
              <i className="critical-dot" />
              Critical ({eventCounts.critical})
            </span>
            <span>
              <i className="high-dot" />
              High ({eventCounts.high})
            </span>
            <span>
              <i className="medium-dot" />
              Medium ({eventCounts.medium})
            </span>
            <span>
              <i className="info-dot" />
              Info/Low ({eventCounts.info})
            </span>
          </div>
        </section>

        <section className="soc-panel">
          <div className="soc-panel-header">
            <div>
              <div className="soc-panel-kicker">
                <ShieldAlert size={14} />
                THREAT CATEGORIES
              </div>
              <h2>Detection Distribution</h2>
            </div>
          </div>

          <div className="soc-activity-list">
            {categoryCounts.length === 0 ? (
              <div style={{ color: '#64748b', padding: '12px 0' }}>
                No category telemetry available.
              </div>
            ) : (
              categoryCounts.map(([category, count]) => (
                <ActivityBar
                  key={category}
                  label={category}
                  value={String(count)}
                  width={`${Math.max(
                    Math.round((count / maxCategoryCount) * 100),
                    8,
                  )}%`}
                />
              ))
            )}
          </div>
        </section>
      </div>

      <div className="soc-bottom-grid">
        <section className="soc-panel">
          <div className="soc-panel-header">
            <div>
              <div className="soc-panel-kicker">
                <Server size={14} />
                ATTACK SURFACE
              </div>
              <h2>Endpoint Health</h2>
            </div>

            <span className="soc-panel-count">
              {endpoints.length} endpoints
            </span>
          </div>

          <div className="soc-health-grid">
            <div className="soc-health-card healthy">
              <CheckCircle2 size={18} />
              <strong>{endpointHealth.healthy}</strong>
              <span>Healthy</span>
            </div>

            <div className="soc-health-card monitored">
              <Wifi size={18} />
              <strong>{endpointHealth.monitored}</strong>
              <span>Monitored</span>
            </div>

            <div className="soc-health-card warning">
              <AlertTriangle size={18} />
              <strong>{endpointHealth.atRisk}</strong>
              <span>At Risk</span>
            </div>

            <div className="soc-health-card critical">
              <ShieldAlert size={18} />
              <strong>{endpointHealth.critical}</strong>
              <span>Critical</span>
            </div>
          </div>
        </section>

        <section className="soc-panel">
          <div className="soc-panel-header">
            <div>
              <div className="soc-panel-kicker">
                <UserRound size={14} />
                ANALYST ACTIVITY
              </div>
              <h2>SOC Queue</h2>
            </div>
          </div>

          <div className="soc-queue-list">
            <Link to="/alerts" className="soc-queue-item soc-queue-link" style={{ color: "inherit", textDecoration: "none" }}>
              <div className="soc-queue-icon critical">
                <AlertTriangle size={16} />
              </div>
              <div>
                <strong>{criticalAlerts} critical alerts</strong>
                <span>Loaded from alert service</span>
              </div>
              <b>{String(criticalAlerts).padStart(2, '0')}</b>
            </Link>

            <Link to="/alerts" className="soc-queue-item soc-queue-link" style={{ color: "inherit", textDecoration: "none" }}>
              <div className="soc-queue-icon high">
                <ShieldAlert size={16} />
              </div>
              <div>
                <strong>{activeThreats} active threats</strong>
                <span>High and critical events requiring attention</span>
              </div>
              <b>{String(activeThreats).padStart(2, '0')}</b>
            </Link>

            <Link to="/endpoints" className="soc-queue-item soc-queue-link" style={{ color: "inherit", textDecoration: "none" }}>
              <div className="soc-queue-icon medium">
                <Bug size={16} />
              </div>
              <div>
                <strong>{endpointsAtRisk} endpoints at risk</strong>
                <span>Requires endpoint investigation</span>
              </div>
              <b>{String(endpointsAtRisk).padStart(2, '0')}</b>
            </Link>

            <Link to="/incidents" className="soc-queue-item soc-queue-link" style={{ color: "inherit", textDecoration: "none" }}>
              <div className="soc-queue-icon high">
                <Zap size={16} />
              </div>
              <div>
                <strong>{openIncidents} open incidents</strong>
                <span>Active investigation cases</span>
              </div>
              <b>{String(openIncidents).padStart(2, '0')}</b>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

