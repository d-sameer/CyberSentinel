import {
  Activity,
  ArrowLeft,
  Clock3,
  Globe,
  Laptop,
  Network as NetworkIcon,
  Server,
  Shield,
  ShieldAlert,
  Terminal,
} from 'lucide-react'

import { Link, useParams } from 'react-router-dom'

type ConnectionStatus =
  | 'ESTABLISHED'
  | 'BLOCKED'
  | 'SUSPICIOUS'

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
  connectionCount: string
}

const connectionData: Record<string, ConnectionData> = {
  'CONN-001': {
    id: 'CONN-001',
    source: '192.168.1.101',
    destination: '142.250.183.14',
    protocol: 'HTTPS',
    port: 443,
    status: 'ESTABLISHED',
    bytes: '18.4 MB',
    endpoint: 'WIN-01',
    operatingSystem: 'Windows 11',
    process: 'chrome.exe',
    parentProcess: 'explorer.exe',
    direction: 'OUTBOUND',
    firstObserved: '10:12:04',
    lastObserved: '10:58:41',
    connectionCount: '42',
  },

  'CONN-002': {
    id: 'CONN-002',
    source: '192.168.1.102',
    destination: '203.0.113.45',
    protocol: 'HTTPS',
    port: 443,
    status: 'SUSPICIOUS',
    bytes: '4.7 MB',
    endpoint: 'KALI-01',
    operatingSystem: 'Kali Linux',
    process: 'curl',
    parentProcess: 'bash',
    direction: 'OUTBOUND',
    firstObserved: '10:31:22',
    lastObserved: '11:02:17',
    connectionCount: '17',
  },

  'CONN-003': {
    id: 'CONN-003',
    source: '192.168.1.104',
    destination: '192.168.1.1',
    protocol: 'DNS',
    port: 53,
    status: 'ESTABLISHED',
    bytes: '824 KB',
    endpoint: 'LINUX-01',
    operatingSystem: 'Ubuntu Linux',
    process: 'systemd-resolved',
    parentProcess: 'systemd',
    direction: 'OUTBOUND',
    firstObserved: '10:05:10',
    lastObserved: '11:03:02',
    connectionCount: '86',
  },

  'CONN-004': {
    id: 'CONN-004',
    source: '192.168.1.103',
    destination: '10.0.0.12',
    protocol: 'SMB',
    port: 445,
    status: 'BLOCKED',
    bytes: '1.2 MB',
    endpoint: 'WIN-02',
    operatingSystem: 'Windows 10',
    process: 'svchost.exe',
    parentProcess: 'services.exe',
    direction: 'OUTBOUND',
    firstObserved: '10:44:31',
    lastObserved: '10:44:49',
    connectionCount: '3',
  },

  'CONN-005': {
    id: 'CONN-005',
    source: '192.168.1.105',
    destination: '52.96.148.10',
    protocol: 'HTTPS',
    port: 443,
    status: 'ESTABLISHED',
    bytes: '9.6 MB',
    endpoint: 'DEV-01',
    operatingSystem: 'Windows 11',
    process: 'Code.exe',
    parentProcess: 'explorer.exe',
    direction: 'OUTBOUND',
    firstObserved: '10:21:09',
    lastObserved: '11:01:54',
    connectionCount: '29',
  },
}

function NetworkConnectionDetails() {
  const { connectionId } = useParams()

  const connection = connectionId
    ? connectionData[connectionId]
    : undefined

  if (!connection) {
    return (
      <div className="page-container">
        <div className="network-connection-not-found">

          <ShieldAlert size={32} />

          <h1>Connection Not Found</h1>

          <p>
            The requested network connection does not
            exist in CyberSentinel.
          </p>

          <Link
            to="/network"
            className="network-back-link"
          >
            <ArrowLeft size={15} />
            Back to Network
          </Link>

        </div>
      </div>
    )
  }

  const isSuspicious =
    connection.status === 'SUSPICIOUS'

  const isBlocked =
    connection.status === 'BLOCKED'

  return (
    <div className="page-container network-connection-page">

      {/* =========================================
          BACK
          ========================================= */}

      <Link
        to="/network"
        className="network-back-link"
      >
        <ArrowLeft size={15} />
        Back to Network
      </Link>

      {/* =========================================
          HEADER
          ========================================= */}

      <div className="network-connection-header">

        <div className="network-connection-identity">

          <div
            className={`network-connection-icon ${
              isSuspicious
                ? 'connection-icon-warning'
                : isBlocked
                  ? 'connection-icon-danger'
                  : 'connection-icon-normal'
            }`}
          >
            <NetworkIcon size={24} />
          </div>

          <div>

            <div className="page-eyebrow">
              NETWORK CONNECTION INVESTIGATION
            </div>

            <h1>
              {connection.source}
              <span className="connection-arrow">
                →
              </span>
              {connection.destination}
            </h1>

            <div className="network-connection-subtitle">
              {connection.id} • Last observed{' '}
              {connection.lastObserved}
            </div>

          </div>

        </div>

        <div
          className={`connection-detail-status connection-detail-${connection.status.toLowerCase()}`}
        >
          <span />
          {connection.status}
        </div>

      </div>

      {/* =========================================
          SUMMARY
          ========================================= */}

      <section className="network-connection-summary">

        <div className="network-connection-summary-card">

          <div className="network-connection-summary-label">
            SOURCE
          </div>

          <strong className="network-detail-mono">
            {connection.source}
          </strong>

          <span>
            Internal endpoint
          </span>

        </div>

        <div className="network-connection-summary-card">

          <div className="network-connection-summary-label">
            DESTINATION
          </div>

          <strong className="network-detail-mono">
            {connection.destination}
          </strong>

          <span>
            Remote destination
          </span>

        </div>

        <div className="network-connection-summary-card">

          <div className="network-connection-summary-label">
            PROTOCOL
          </div>

          <strong>
            {connection.protocol}
          </strong>

          <span>
            Port {connection.port}
          </span>

        </div>

        <div className="network-connection-summary-card">

          <div className="network-connection-summary-label">
            TRAFFIC
          </div>

          <strong>
            {connection.bytes}
          </strong>

          <span>
            Observed transfer
          </span>

        </div>

      </section>

      {/* =========================================
          CONNECTION OVERVIEW
          ========================================= */}

      <section className="network-investigation-grid">

        <div className="network-investigation-panel">

          <div className="network-investigation-header">

            <div>
              <div className="network-investigation-title">
                Connection Details
              </div>

              <div className="network-investigation-subtitle">
                Core network session information
              </div>
            </div>

            <Globe size={18} />

          </div>

          <div className="network-detail-list">

            <div className="network-detail-row">
              <span>Source Address</span>
              <strong>
                {connection.source}
              </strong>
            </div>

            <div className="network-detail-row">
              <span>Destination Address</span>
              <strong>
                {connection.destination}
              </strong>
            </div>

            <div className="network-detail-row">
              <span>Protocol</span>
              <strong>
                {connection.protocol}
              </strong>
            </div>

            <div className="network-detail-row">
              <span>Destination Port</span>
              <strong>
                {connection.port}
              </strong>
            </div>

            <div className="network-detail-row">
              <span>Direction</span>
              <strong>
                {connection.direction}
              </strong>
            </div>

            <div className="network-detail-row">
              <span>Connection Count</span>
              <strong>
                {connection.connectionCount}
              </strong>
            </div>

          </div>

        </div>

        <div className="network-investigation-panel">

          <div className="network-investigation-header">

            <div>
              <div className="network-investigation-title">
                Endpoint Context
              </div>

              <div className="network-investigation-subtitle">
                Host and process information
              </div>
            </div>

            <Laptop size={18} />

          </div>

          <div className="network-detail-list">

            <div className="network-detail-row">
              <span>Endpoint</span>
              <strong>
                {connection.endpoint}
              </strong>
            </div>

            <div className="network-detail-row">
              <span>Operating System</span>
              <strong>
                {connection.operatingSystem}
              </strong>
            </div>

            <div className="network-detail-row">
              <span>Process</span>
              <strong>
                {connection.process}
              </strong>
            </div>

            <div className="network-detail-row">
              <span>Parent Process</span>
              <strong>
                {connection.parentProcess}
              </strong>
            </div>

            <div className="network-detail-row">
              <span>Network Interface</span>
              <strong>
                eth0
              </strong>
            </div>

            <div className="network-detail-row">
              <span>Agent</span>
              <strong>
                CyberSentinel Agent
              </strong>
            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          RISK ANALYSIS
          ========================================= */}

      <section className="network-investigation-panel network-risk-panel">

        <div className="network-investigation-header">

          <div>
            <div className="network-investigation-title">
              Security Assessment
            </div>

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
                : isBlocked
                  ? 'network-risk-danger'
                  : 'network-risk-normal'
            }`}
          >

            {isSuspicious ? (
              <ShieldAlert size={22} />
            ) : (
              <Shield size={22} />
            )}

            <div>

              <strong>
                {isSuspicious
                  ? 'Suspicious network activity'
                  : isBlocked
                    ? 'Connection blocked by policy'
                    : 'Normal network activity'}
              </strong>

              <p>
                {isSuspicious
                  ? 'The destination is outside the monitored internal network and the connection requires analyst review.'
                  : isBlocked
                    ? 'The connection was prevented by a network security control.'
                    : 'The connection matches currently observed network behavior.'}
              </p>

            </div>

          </div>

          <div className="network-risk-indicators">

            <div>
              <span>Destination</span>
              <strong>
                External
              </strong>
            </div>

            <div>
              <span>Port</span>
              <strong>
                {connection.port}
              </strong>
            </div>

            <div>
              <span>Protocol</span>
              <strong>
                {connection.protocol}
              </strong>
            </div>

            <div>
              <span>Direction</span>
              <strong>
                {connection.direction}
              </strong>
            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          TIMELINE
          ========================================= */}

      <section className="network-investigation-panel network-timeline-panel">

        <div className="network-investigation-header">

          <div>
            <div className="network-investigation-title">
              Connection Timeline
            </div>

            <div className="network-investigation-subtitle">
              Observed activity associated with this session
            </div>
          </div>

          <Clock3 size={18} />

        </div>

        <div className="network-timeline">

          <div className="network-timeline-item">

            <div className="network-timeline-marker" />

            <div className="network-timeline-content">

              <strong>
                Connection observed
              </strong>

              <span>
                CyberSentinel detected the network session
                from the monitored endpoint.
              </span>

            </div>

            <time>
              {connection.firstObserved}
            </time>

          </div>

          <div className="network-timeline-item">

            <div className="network-timeline-marker" />

            <div className="network-timeline-content">

              <strong>
                Traffic transferred
              </strong>

              <span>
                Network telemetry recorded{' '}
                {connection.bytes} of traffic.
              </span>

            </div>

            <time>
              10:42:18
            </time>

          </div>

          <div className="network-timeline-item">

            <div
              className={`network-timeline-marker ${
                isSuspicious
                  ? 'network-marker-warning'
                  : isBlocked
                    ? 'network-marker-danger'
                    : ''
              }`}
            />

            <div className="network-timeline-content">

              <strong>
                Security state recorded
              </strong>

              <span>
                Connection status recorded as{' '}
                {connection.status}.
              </span>

            </div>

            <time>
              {connection.lastObserved}
            </time>

          </div>

        </div>

      </section>

      {/* =========================================
          PROCESS CONTEXT
          ========================================= */}

      <section className="network-investigation-panel network-process-panel">

        <div className="network-investigation-header">

          <div>
            <div className="network-investigation-title">
              Process Context
            </div>

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
              <strong>
                {connection.process}
              </strong>
            </div>

          </div>

          <div className="network-process-item">

            <Server size={17} />

            <div>
              <span>Parent Process</span>
              <strong>
                {connection.parentProcess}
              </strong>
            </div>

          </div>

          <div className="network-process-item">

            <NetworkIcon size={17} />

            <div>
              <span>Network Interface</span>
              <strong>
                eth0
              </strong>
            </div>

          </div>

        </div>

      </section>

    </div>
  )
}

export default NetworkConnectionDetails