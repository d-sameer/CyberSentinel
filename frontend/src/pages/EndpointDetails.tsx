import {
  Activity,
  ArrowLeft,
  Cpu,
  HardDrive,
  Laptop,
  Network,
  Shield,
  ShieldAlert,
  Wifi,
} from 'lucide-react'

import { Link, useParams } from 'react-router-dom'

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
}

const endpointData: Record<string, EndpointData> = {
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

function EndpointDetails() {
  const { endpointId } = useParams()

  const endpoint = endpointId
    ? endpointData[endpointId]
    : undefined

  if (!endpoint) {
    return (
      <div className="page-container">
        <div className="endpoint-not-found">
          <ShieldAlert size={30} />

          <h1>Endpoint Not Found</h1>

          <p>
            The requested endpoint does not exist in CyberSentinel.
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
          <div className="endpoint-activity-row">
            <div className="activity-indicator activity-high" />

            <div className="activity-content">
              <strong>
                Authentication event detected
              </strong>

              <span>
                New authentication activity observed on endpoint
              </span>
            </div>

            <div className="activity-time">
              2 min ago
            </div>
          </div>

          <div className="endpoint-activity-row">
            <div className="activity-indicator activity-medium" />

            <div className="activity-content">
              <strong>
                Process activity recorded
              </strong>

              <span>
                New process execution recorded by endpoint agent
              </span>
            </div>

            <div className="activity-time">
              8 min ago
            </div>
          </div>

          <div className="endpoint-activity-row">
            <div className="activity-indicator activity-low" />

            <div className="activity-content">
              <strong>
                Network connection observed
              </strong>

              <span>
                Endpoint established an outbound network connection
              </span>
            </div>

            <div className="activity-time">
              14 min ago
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default EndpointDetails