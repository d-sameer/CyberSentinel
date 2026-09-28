import {
  Activity,
  ArrowLeft,
  Cpu,
  HardDrive,
  Laptop,
  Network,
  RefreshCw,
  Shield,
  ShieldAlert,
  Wifi,
} from 'lucide-react'

import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

type ApiEndpoint = {
  id: number
  endpoint_id: string
  hostname: string
  ip_address: string
  operating_system: string
  status: string
  risk_level: string
  agent_status: string
  last_seen: string
  open_alerts: number
  open_incidents: number
  description: string
}

type ApiTelemetry = {
  id: number
  endpoint_id: string
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  gateway: string
  dns_server: string
  network_status: string
  collected_at: string
}

type ApiActivity = {
  id: number
  activity_id: string
  endpoint_id: string
  title: string
  description: string
  severity: string
  category: string
  status: string
  observed_at: string
}

type EndpointData = {
  name: string
  os: string
  ip: string
  type: string
  status: 'ONLINE' | 'WARNING' | 'OFFLINE'
  lastSeen: string
  risk: string
  cpu: string
  memory: string
  disk: string
  gateway: string
  dns: string
  agent: string
  openAlerts: number
  openIncidents: number
  description: string
}

const fallbackEndpointData: Record<string, EndpointData> = {
  'WIN-01': {
    name: 'WIN-01',
    os: 'Windows 11',
    ip: '192.168.1.101',
    type: 'Workstation',
    status: 'ONLINE',
    lastSeen: 'Just now',
    risk: 'CRITICAL',
    cpu: '24%',
    memory: '58%',
    disk: '41%',
    gateway: '192.168.1.1',
    dns: '192.168.1.1',
    agent: 'Running',
    openAlerts: 3,
    openIncidents: 1,
    description:
      'Primary Windows workstation monitored by CyberSentinel.',
  },

  'WIN-02': {
    name: 'WIN-02',
    os: 'Windows 11',
    ip: '192.168.1.102',
    type: 'Workstation',
    status: 'ONLINE',
    lastSeen: 'Just now',
    risk: 'HIGH',
    cpu: '72%',
    memory: '81%',
    disk: '78%',
    gateway: '192.168.1.1',
    dns: '192.168.1.1',
    agent: 'Running',
    openAlerts: 4,
    openIncidents: 2,
    description:
      'Windows workstation with elevated security activity.',
  },

  'WIN-03': {
    name: 'WIN-03',
    os: 'Windows 10',
    ip: '192.168.1.103',
    type: 'Workstation',
    status: 'ONLINE',
    lastSeen: 'Just now',
    risk: 'MEDIUM',
    cpu: '42%',
    memory: '61%',
    disk: '55%',
    gateway: '192.168.1.1',
    dns: '192.168.1.1',
    agent: 'Running',
    openAlerts: 1,
    openIncidents: 0,
    description:
      'Windows workstation monitored by the endpoint agent.',
  },

  'WIN-04': {
    name: 'WIN-04',
    os: 'Windows 11',
    ip: '192.168.1.104',
    type: 'Workstation',
    status: 'ONLINE',
    lastSeen: 'Just now',
    risk: 'HIGH',
    cpu: '64%',
    memory: '73%',
    disk: '69%',
    gateway: '192.168.1.1',
    dns: '192.168.1.1',
    agent: 'Warning',
    openAlerts: 2,
    openIncidents: 1,
    description:
      'Windows workstation with endpoint agent warnings.',
  },

  'LINUX-01': {
    name: 'LINUX-01',
    os: 'Ubuntu 24.04',
    ip: '192.168.1.105',
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
    openAlerts: 0,
    openIncidents: 0,
    description:
      'Linux server monitored by CyberSentinel.',
  },

  'SRV-DC01': {
    name: 'SRV-DC01',
    os: 'Windows Server 2022',
    ip: '192.168.1.10',
    type: 'Domain Controller',
    status: 'ONLINE',
    lastSeen: 'Just now',
    risk: 'MEDIUM',
    cpu: '37%',
    memory: '64%',
    disk: '48%',
    gateway: '192.168.1.1',
    dns: '192.168.1.10',
    agent: 'Running',
    openAlerts: 1,
    openIncidents: 0,
    description:
      'Windows Server domain controller monitored by CyberSentinel.',
  },
}

const fallbackActivities: ApiActivity[] = [
  {
    id: 1,
    activity_id: 'ACT-DEMO-001',
    endpoint_id: 'WIN-01',
    title: 'Authentication event detected',
    description:
      'New authentication activity observed on endpoint.',
    severity: 'HIGH',
    category: 'Identity',
    status: 'REVIEW',
    observed_at: new Date().toISOString(),
  },
  {
    id: 2,
    activity_id: 'ACT-DEMO-002',
    endpoint_id: 'WIN-01',
    title: 'Process activity recorded',
    description:
      'New process execution recorded by endpoint agent.',
    severity: 'MEDIUM',
    category: 'Process',
    status: 'MONITORED',
    observed_at: new Date().toISOString(),
  },
  {
    id: 3,
    activity_id: 'ACT-DEMO-003',
    endpoint_id: 'WIN-01',
    title: 'Network connection observed',
    description:
      'Endpoint established an outbound network connection.',
    severity: 'LOW',
    category: 'Network',
    status: 'MONITORED',
    observed_at: new Date().toISOString(),
  },
]

function formatLastSeen(value: string) {
  if (!value) {
    return 'Unknown'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

function formatActivityTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.max(
    0,
    Math.floor(diffMs / 60000),
  )

  if (diffMinutes < 1) {
    return 'Just now'
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)

  if (diffHours < 24) {
    return `${diffHours} hr ago`
  }

  const diffDays = Math.floor(diffHours / 24)

  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

function getSeverityClass(severity: string) {
  switch (severity.toUpperCase()) {
    case 'CRITICAL':
    case 'HIGH':
      return 'activity-high'

    case 'MEDIUM':
      return 'activity-medium'

    case 'LOW':
    case 'INFO':
      return 'activity-low'

    default:
      return 'activity-low'
  }
}

function mapApiEndpoint(api: ApiEndpoint): EndpointData {
  const fallback = fallbackEndpointData[api.endpoint_id]

  const normalizedStatus =
    api.status?.toUpperCase() === 'OFFLINE'
      ? 'OFFLINE'
      : api.status?.toUpperCase() === 'WARNING'
        ? 'WARNING'
        : 'ONLINE'

  return {
    name: api.endpoint_id,
    os: api.operating_system,
    ip: api.ip_address,
    type: fallback?.type ?? 'Endpoint',
    status: normalizedStatus,
    lastSeen: formatLastSeen(api.last_seen),
    risk: api.risk_level?.toUpperCase() || 'UNKNOWN',
    cpu: fallback?.cpu ?? '—',
    memory: fallback?.memory ?? '—',
    disk: fallback?.disk ?? '—',
    gateway: fallback?.gateway ?? '192.168.1.1',
    dns: fallback?.dns ?? '192.168.1.1',
    agent:
      api.agent_status?.toUpperCase() === 'HEALTHY'
        ? 'Running'
        : api.agent_status || 'Unknown',
    openAlerts: api.open_alerts,
    openIncidents: api.open_incidents,
    description: api.description,
  }
}

function EndpointDetails() {
  const { endpointId } = useParams()

  const [endpoint, setEndpoint] =
    useState<EndpointData | null>(null)

  const [telemetry, setTelemetry] =
    useState<ApiTelemetry | null>(null)

  const [activities, setActivities] =
    useState<ApiActivity[]>([])

  const [loading, setLoading] = useState(true)
  const [apiConnected, setApiConnected] = useState(false)
  const [telemetryConnected, setTelemetryConnected] =
    useState(false)

  const [activityConnected, setActivityConnected] =
    useState(false)

  const [error, setError] = useState('')

  const loadEndpoint = async () => {
    if (!endpointId) {
      setLoading(false)
      setError('Endpoint ID is missing.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/endpoints/${encodeURIComponent(endpointId)}`,
      )

      if (!response.ok) {
        throw new Error(
          `Endpoint API returned ${response.status}`,
        )
      }

      const data: ApiEndpoint = await response.json()

      setEndpoint(mapApiEndpoint(data))
      setApiConnected(true)

      try {
        const telemetryResponse = await fetch(
          `http://127.0.0.1:8000/api/endpoints/${encodeURIComponent(endpointId)}/telemetry`,
        )

        if (telemetryResponse.ok) {
          const telemetryData: ApiTelemetry =
            await telemetryResponse.json()

          setTelemetry(telemetryData)
          setTelemetryConnected(true)
        } else {
          setTelemetry(null)
          setTelemetryConnected(false)
        }
      } catch (telemetryError) {
        console.error(
          'Failed to load endpoint telemetry:',
          telemetryError,
        )

        setTelemetry(null)
        setTelemetryConnected(false)
      }

      try {
        const activityResponse = await fetch(
          `http://127.0.0.1:8000/api/endpoints/${encodeURIComponent(endpointId)}/activity`,
        )

        if (activityResponse.ok) {
          const activityData: ApiActivity[] =
            await activityResponse.json()

          setActivities(activityData)
          setActivityConnected(true)
        } else {
          setActivities(fallbackActivities)
          setActivityConnected(false)
        }
      } catch (activityError) {
        console.error(
          'Failed to load endpoint activity:',
          activityError,
        )

        setActivities(fallbackActivities)
        setActivityConnected(false)
      }
    } catch (err) {
      console.error(
        'Failed to load endpoint:',
        err,
      )

      const fallback =
        endpointId
          ? fallbackEndpointData[endpointId]
          : undefined

      if (fallback) {
        setEndpoint(fallback)
        setApiConnected(false)
        setTelemetry(null)
        setTelemetryConnected(false)
        setActivities(fallbackActivities)
        setActivityConnected(false)
        setError(
          'Backend unavailable. Showing demo endpoint data.',
        )
      } else {
        setEndpoint(null)
        setApiConnected(false)
        setTelemetry(null)
        setTelemetryConnected(false)
        setActivities([])
        setActivityConnected(false)
        setError('Endpoint could not be loaded.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEndpoint()
  }, [endpointId])

  if (loading) {
    return (
      <div className="page-container">
        <div className="endpoint-not-found">
          <Activity size={30} />

          <h1>Loading Endpoint</h1>

          <p>
            CyberSentinel is retrieving endpoint
            security information...
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
            {error ||
              'The requested endpoint does not exist in CyberSentinel.'}
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

      {/* BACK BUTTON */}

      <Link
        to="/endpoints"
        className="endpoint-back-link"
      >
        <ArrowLeft size={15} />
        Back to Endpoints
      </Link>

      {/* API STATUS */}

      <div className="endpoint-api-detail-toolbar">

        <div
          className={
            apiConnected
              ? 'endpoint-api-status'
              : 'endpoint-api-demo'
          }
        >
          <span />
          {apiConnected
            ? 'API CONNECTED'
            : 'DEMO DATA'}
        </div>

        <div className="endpoint-api-source">
          {activityConnected && telemetryConnected
            ? 'Endpoint + Telemetry + Activity API'
            : 'Endpoint API'}
        </div>

        <button
          type="button"
          className="endpoint-refresh-button"
          onClick={loadEndpoint}
          disabled={loading}
        >
          <RefreshCw
            size={14}
            className={
              loading
                ? 'endpoint-refresh-spin'
                : ''
            }
          />
          Refresh
        </button>

      </div>

      {/* HEADER */}

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

      {/* API FALLBACK MESSAGE */}

      {error && !apiConnected && (
        <div className="endpoint-api-offline">
          <ShieldAlert size={15} />
          {error}
        </div>
      )}

      {/* OVERVIEW CARDS */}

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
            Last seen: {endpoint.lastSeen}
          </div>

        </div>

      </section>

      {/* SECURITY COUNTS */}

      <section className="endpoint-details-grid">

        <div className="endpoint-detail-card">

          <div className="endpoint-detail-card-header">
            <span>OPEN ALERTS</span>
            <ShieldAlert size={17} />
          </div>

          <div className="endpoint-detail-main">
            {endpoint.openAlerts}
          </div>

          <div className="endpoint-detail-muted">
            Active alerts associated with endpoint
          </div>

        </div>

        <div className="endpoint-detail-card">

          <div className="endpoint-detail-card-header">
            <span>OPEN INCIDENTS</span>
            <Activity size={17} />
          </div>

          <div className="endpoint-detail-main">
            {endpoint.openIncidents}
          </div>

          <div className="endpoint-detail-muted">
            Active incidents associated with endpoint
          </div>

        </div>

        <div className="endpoint-detail-card">

          <div className="endpoint-detail-card-header">
            <span>HOSTNAME</span>
            <Laptop size={17} />
          </div>

          <div className="endpoint-detail-main endpoint-mono">
            {endpoint.name}
          </div>

          <div className="endpoint-detail-muted">
            Endpoint identifier
          </div>

        </div>

        <div className="endpoint-detail-card">

          <div className="endpoint-detail-card-header">
            <span>DATA SOURCE</span>
            <Network size={17} />
          </div>

          <div className="endpoint-detail-main">
            {apiConnected
              ? 'Backend API'
              : 'Demo'}
          </div>

          <div className="endpoint-detail-muted">
            Current information source
          </div>

        </div>

      </section>

      {/* SYSTEM RESOURCES + NETWORK */}

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
                {telemetry
                  ? `${telemetry.cpu_usage}%`
                  : endpoint.cpu}
              </div>

            </div>

            <div className="resource-bar">
              <span
                style={{
                  width: telemetry
                    ? `${telemetry.cpu_usage}%`
                    : endpoint.cpu === '—'
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
                {telemetry
                  ? `${telemetry.memory_usage}%`
                  : endpoint.memory}
              </div>

            </div>

            <div className="resource-bar">
              <span
                style={{
                  width: telemetry
                    ? `${telemetry.memory_usage}%`
                    : endpoint.memory === '—'
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
                {telemetry
                  ? `${telemetry.disk_usage}%`
                  : endpoint.disk}
              </div>

            </div>

            <div className="resource-bar">
              <span
                style={{
                  width: telemetry
                    ? `${telemetry.disk_usage}%`
                    : endpoint.disk === '—'
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
              <strong>
                {telemetry?.gateway ??
                  endpoint.gateway}
              </strong>
            </div>

            <div className="network-info-row">
              <span>DNS Server</span>
              <strong>
                {telemetry?.dns_server ??
                  endpoint.dns}
              </strong>
            </div>

            <div className="network-info-row">

              <span>Connection</span>

              <strong
                className={
                  telemetry?.network_status ===
                    'DISCONNECTED' ||
                  endpoint.status === 'OFFLINE'
                    ? 'network-offline'
                    : 'network-online'
                }
              >
                {telemetry
                  ? telemetry.network_status
                  : endpoint.status === 'OFFLINE'
                    ? 'Disconnected'
                    : 'Connected'}
              </strong>

            </div>

          </div>

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

        <div className="endpoint-activity-api-status">

          <span
            className={
              activityConnected
                ? 'activity-api-dot activity-api-online'
                : 'activity-api-dot activity-api-demo'
            }
          />

          {activityConnected
            ? 'LIVE ACTIVITY DATA'
            : 'DEMO ACTIVITY DATA'}

        </div>

        <div className="endpoint-activity-list">

          {activities.length === 0 ? (

            <div className="endpoint-activity-empty">
              <Activity size={20} />

              <span>
                No recent security activity found
                for this endpoint.
              </span>
            </div>

          ) : (

            activities.map((activity) => (

              <div
                className="endpoint-activity-row"
                key={activity.activity_id}
              >

                <div
                  className={`activity-indicator ${getSeverityClass(activity.severity)}`}
                />

                <div className="activity-content">

                  <strong>
                    {activity.title}
                  </strong>

                  <span>
                    {activity.description}
                  </span>

                  <small>
                    {activity.category}
                    {' • '}
                    {activity.status}
                  </small>

                </div>

                <div className="activity-time">
                  {formatActivityTime(
                    activity.observed_at,
                  )}
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