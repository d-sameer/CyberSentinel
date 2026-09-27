import {
  Activity,
  ArrowDown,
  ArrowUp,
  Globe,
  Network as NetworkIcon,
  ShieldAlert,
  Wifi,
} from 'lucide-react'

import { Link } from 'react-router-dom'

type NetworkConnection = {
  id: string
  source: string
  destination: string
  protocol: string
  port: number
  status: 'ESTABLISHED' | 'BLOCKED' | 'SUSPICIOUS'
  bytes: string
  endpoint: string
}

const connections: NetworkConnection[] = [
  {
    id: 'CONN-001',
    source: '192.168.1.101',
    destination: '142.250.183.14',
    protocol: 'HTTPS',
    port: 443,
    status: 'ESTABLISHED',
    bytes: '18.4 MB',
    endpoint: 'WIN-01',
  },
  {
    id: 'CONN-002',
    source: '192.168.1.102',
    destination: '203.0.113.45',
    protocol: 'HTTPS',
    port: 443,
    status: 'SUSPICIOUS',
    bytes: '4.7 MB',
    endpoint: 'KALI-01',
  },
  {
    id: 'CONN-003',
    source: '192.168.1.104',
    destination: '192.168.1.1',
    protocol: 'DNS',
    port: 53,
    status: 'ESTABLISHED',
    bytes: '824 KB',
    endpoint: 'LINUX-01',
  },
  {
    id: 'CONN-004',
    source: '192.168.1.103',
    destination: '10.0.0.12',
    protocol: 'SMB',
    port: 445,
    status: 'BLOCKED',
    bytes: '1.2 MB',
    endpoint: 'WIN-02',
  },
  {
    id: 'CONN-005',
    source: '192.168.1.105',
    destination: '52.96.148.10',
    protocol: 'HTTPS',
    port: 443,
    status: 'ESTABLISHED',
    bytes: '9.6 MB',
    endpoint: 'DEV-01',
  },
]

function Network() {
  const activeConnections = connections.filter(
    (connection) =>
      connection.status === 'ESTABLISHED',
  ).length

  const suspiciousConnections = connections.filter(
    (connection) =>
      connection.status === 'SUSPICIOUS',
  ).length

  const blockedConnections = connections.filter(
    (connection) =>
      connection.status === 'BLOCKED',
  ).length

  return (
    <div className="page-container">

      {/* =========================================
          PAGE HEADER
          ========================================= */}

      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            NETWORK SECURITY
          </div>

          <h1>Network</h1>

          <p>
            Monitor network activity, connections, protocols,
            and suspicious traffic across the environment.
          </p>
        </div>

        <div className="page-status page-network-status">
          <span />
          NETWORK MONITORING ACTIVE
        </div>
      </div>

      {/* =========================================
          NETWORK SUMMARY
          ========================================= */}

      <section className="network-summary-grid">

        <div className="network-summary-card">
          <div className="network-summary-top">
            <span>ACTIVE CONNECTIONS</span>
            <NetworkIcon size={17} />
          </div>

          <strong>
            {String(activeConnections).padStart(2, '0')}
          </strong>

          <p>
            Established network sessions
          </p>
        </div>

        <div className="network-summary-card">
          <div className="network-summary-top">
            <span>INGRESS TRAFFIC</span>
            <ArrowDown size={17} />
          </div>

          <strong>428.6 MB</strong>

          <p>
            Incoming traffic observed
          </p>
        </div>

        <div className="network-summary-card">
          <div className="network-summary-top">
            <span>EGRESS TRAFFIC</span>
            <ArrowUp size={17} />
          </div>

          <strong>184.2 MB</strong>

          <p>
            Outgoing traffic observed
          </p>
        </div>

        <div className="network-summary-card network-summary-alert">
          <div className="network-summary-top">
            <span>SECURITY EVENTS</span>
            <ShieldAlert size={17} />
          </div>

          <strong>
            {String(
              suspiciousConnections + blockedConnections,
            ).padStart(2, '0')}
          </strong>

          <p>
            Suspicious or blocked connections
          </p>
        </div>

      </section>

      {/* =========================================
          NETWORK ACTIVITY
          ========================================= */}

      <section className="network-overview-grid">

        <div className="network-panel">

          <div className="network-panel-header">
            <div>
              <div className="network-panel-title">
                Network Activity
              </div>

              <div className="network-panel-subtitle">
                Traffic telemetry across monitored endpoints
              </div>
            </div>

            <Activity size={18} />
          </div>

          <div className="network-activity-chart">

            <div className="network-chart-grid">
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="network-chart-line">
              <div className="network-point point-1" />
              <div className="network-point point-2" />
              <div className="network-point point-3" />
              <div className="network-point point-4" />
              <div className="network-point point-5" />
              <div className="network-point point-6" />
              <div className="network-point point-7" />
            </div>

            <div className="network-chart-labels">
              <span>10:00</span>
              <span>10:10</span>
              <span>10:20</span>
              <span>10:30</span>
              <span>10:40</span>
              <span>10:50</span>
              <span>11:00</span>
            </div>

          </div>

        </div>

        <div className="network-panel">

          <div className="network-panel-header">
            <div>
              <div className="network-panel-title">
                Protocol Distribution
              </div>

              <div className="network-panel-subtitle">
                Observed protocols
              </div>
            </div>

            <Globe size={18} />
          </div>

          <div className="protocol-list">

            <div className="protocol-row">
              <div>
                <span>HTTPS</span>
                <small>443</small>
              </div>

              <div className="protocol-bar">
                <span style={{ width: '78%' }} />
              </div>

              <strong>78%</strong>
            </div>

            <div className="protocol-row">
              <div>
                <span>DNS</span>
                <small>53</small>
              </div>

              <div className="protocol-bar">
                <span style={{ width: '12%' }} />
              </div>

              <strong>12%</strong>
            </div>

            <div className="protocol-row">
              <div>
                <span>SSH</span>
                <small>22</small>
              </div>

              <div className="protocol-bar">
                <span style={{ width: '6%' }} />
              </div>

              <strong>6%</strong>
            </div>

            <div className="protocol-row">
              <div>
                <span>SMB</span>
                <small>445</small>
              </div>

              <div className="protocol-bar">
                <span style={{ width: '4%' }} />
              </div>

              <strong>4%</strong>
            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          CONNECTION TABLE
          ========================================= */}

      <section className="network-panel network-connections-panel">

        <div className="network-panel-header">

          <div>
            <div className="network-panel-title">
              Active Connections
            </div>

            <div className="network-panel-subtitle">
              Source and destination network sessions
            </div>
          </div>

          <Wifi size={18} />

        </div>

        <div className="network-table-wrapper">

          <table className="network-table">

            <thead>
              <tr>
                <th>SOURCE</th>
                <th>DESTINATION</th>
                <th>PROTOCOL</th>
                <th>PORT</th>
                <th>ENDPOINT</th>
                <th>TRAFFIC</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>

              {connections.map((connection) => (

                <tr key={connection.id}>

                  <td colSpan={7} className="network-connection-cell">

                    <Link
                      to={`/network/${connection.id}`}
                      className="network-connection-row"
                    >

                      <span className="network-table-source">
                        {connection.source}
                      </span>

                      <span className="network-table-destination">
                        {connection.destination}
                      </span>

                      <span>
                        <span className="protocol-badge">
                          {connection.protocol}
                        </span>
                      </span>

                      <span className="network-mono">
                        {connection.port}
                      </span>

                      <span>
                        {connection.endpoint}
                      </span>

                      <span className="network-mono">
                        {connection.bytes}
                      </span>

                      <span>
                        <span
                          className={`connection-status connection-${connection.status.toLowerCase()}`}
                        >
                          <span />
                          {connection.status}
                        </span>
                      </span>

                    </Link>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  )
}

export default Network