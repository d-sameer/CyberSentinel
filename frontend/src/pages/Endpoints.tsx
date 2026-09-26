import { useMemo, useState } from 'react'

import {
  CheckCircle2,
  ChevronDown,
  Monitor,
  Search,
  Server,
  ShieldAlert,
  ShieldOff,
} from 'lucide-react'

import { Link } from 'react-router-dom'

type EndpointStatus = 'ONLINE' | 'WARNING' | 'OFFLINE'

type Endpoint = {
  name: string
  os: string
  ip: string
  status: EndpointStatus
  lastSeen: string
  type: string
}

const endpoints: Endpoint[] = [
  {
    name: 'WIN-01',
    os: 'Windows 11',
    ip: '192.168.1.101',
    status: 'ONLINE',
    lastSeen: 'Just now',
    type: 'Workstation',
  },
  {
    name: 'KALI-01',
    os: 'Kali Linux',
    ip: '192.168.1.102',
    status: 'ONLINE',
    lastSeen: 'Just now',
    type: 'Security Lab',
  },
  {
    name: 'WIN-02',
    os: 'Windows 10',
    ip: '192.168.1.103',
    status: 'WARNING',
    lastSeen: '2 min ago',
    type: 'Workstation',
  },
  {
    name: 'LINUX-01',
    os: 'Ubuntu Linux',
    ip: '192.168.1.104',
    status: 'ONLINE',
    lastSeen: 'Just now',
    type: 'Server',
  },
  {
    name: 'DEV-01',
    os: 'Windows 11',
    ip: '192.168.1.105',
    status: 'OFFLINE',
    lastSeen: '18 min ago',
    type: 'Developer Workstation',
  },
]

function Endpoints() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const totalEndpoints = endpoints.length

  const onlineEndpoints = endpoints.filter(
    (endpoint) => endpoint.status === 'ONLINE',
  ).length

  const warningEndpoints = endpoints.filter(
    (endpoint) => endpoint.status === 'WARNING',
  ).length

  const offlineEndpoints = endpoints.filter(
    (endpoint) => endpoint.status === 'OFFLINE',
  ).length

  const filteredEndpoints = useMemo(() => {
    return endpoints.filter((endpoint) => {
      const search = searchTerm.toLowerCase()

      const matchesSearch =
        endpoint.name.toLowerCase().includes(search) ||
        endpoint.os.toLowerCase().includes(search) ||
        endpoint.ip.toLowerCase().includes(search)

      const matchesStatus =
        statusFilter === 'ALL' ||
        endpoint.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter])

  const getStatusIcon = (status: EndpointStatus) => {
    if (status === 'ONLINE') {
      return <CheckCircle2 size={15} />
    }

    if (status === 'WARNING') {
      return <ShieldAlert size={15} />
    }

    return <ShieldOff size={15} />
  }

  return (
    <div className="page-container">

      {/* =========================================
          PAGE HEADER
          ========================================= */}

      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            ENDPOINT MANAGEMENT
          </div>

          <h1>Endpoints</h1>

          <p>
            Monitor systems connected to the CyberSentinel
            security platform.
          </p>
        </div>

        <div className="page-status">
          <span />
          {onlineEndpoints} ONLINE
        </div>
      </div>

      {/* =========================================
          ENDPOINT SUMMARY
          ========================================= */}

      <section className="endpoint-summary-grid">

        <div className="endpoint-summary-card">
          <div className="endpoint-summary-label">
            TOTAL ENDPOINTS
          </div>

          <div className="endpoint-summary-value">
            {String(totalEndpoints).padStart(2, '0')}
          </div>

          <div className="endpoint-summary-description">
            Monitored systems
          </div>
        </div>

        <div className="endpoint-summary-card endpoint-summary-online">
          <div className="endpoint-summary-label">
            ONLINE
          </div>

          <div className="endpoint-summary-value">
            {String(onlineEndpoints).padStart(2, '0')}
          </div>

          <div className="endpoint-summary-description">
            Active connections
          </div>
        </div>

        <div className="endpoint-summary-card endpoint-summary-warning">
          <div className="endpoint-summary-label">
            WARNING
          </div>

          <div className="endpoint-summary-value">
            {String(warningEndpoints).padStart(2, '0')}
          </div>

          <div className="endpoint-summary-description">
            Requires attention
          </div>
        </div>

        <div className="endpoint-summary-card endpoint-summary-offline">
          <div className="endpoint-summary-label">
            OFFLINE
          </div>

          <div className="endpoint-summary-value">
            {String(offlineEndpoints).padStart(2, '0')}
          </div>

          <div className="endpoint-summary-description">
            No recent heartbeat
          </div>
        </div>

      </section>

      {/* =========================================
          SEARCH + FILTER TOOLBAR
          ========================================= */}

      <div className="endpoint-toolbar">

        <div className="page-search">
          <Search size={16} />

          <input
            type="text"
            placeholder="Search hostname, OS or IP address..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <div className="endpoint-filter">
          <ChevronDown size={15} />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="ALL">All Status</option>
            <option value="ONLINE">Online</option>
            <option value="WARNING">Warning</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>

      </div>

      {/* =========================================
          RESULT COUNT
          ========================================= */}

      <div className="endpoint-result-count">
        Showing {filteredEndpoints.length} of {totalEndpoints}{' '}
        endpoints
      </div>

      {/* =========================================
          ENDPOINT TABLE
          ========================================= */}

      <div className="endpoint-table">

        {/* TABLE HEADER */}

        <div className="endpoint-table-header">
          <span>ENDPOINT</span>
          <span>OPERATING SYSTEM</span>
          <span>IP ADDRESS</span>
          <span>STATUS</span>
          <span>LAST SEEN</span>
        </div>

        {/* TABLE ROWS */}

        {filteredEndpoints.length > 0 ? (

          filteredEndpoints.map((endpoint) => (

            <Link
              to={`/endpoints/${endpoint.name}`}
              className="endpoint-table-row endpoint-table-link"
              key={endpoint.name}
            >

              {/* ENDPOINT NAME */}

              <div className="endpoint-table-name">

                <div className="endpoint-table-icon">
                  {endpoint.type === 'Server' ? (
                    <Server size={17} />
                  ) : (
                    <Monitor size={17} />
                  )}
                </div>

                <div>
                  <div className="endpoint-hostname">
                    {endpoint.name}
                  </div>

                  <div className="endpoint-type">
                    {endpoint.type}
                  </div>
                </div>

              </div>

              {/* OPERATING SYSTEM */}

              <div className="endpoint-table-os">
                {endpoint.os}
              </div>

              {/* IP ADDRESS */}

              <div className="endpoint-table-ip">
                {endpoint.ip}
              </div>

              {/* STATUS */}

              <div
                className={`endpoint-table-status status-${endpoint.status.toLowerCase()}`}
              >
                {getStatusIcon(endpoint.status)}

                <span>
                  {endpoint.status}
                </span>
              </div>

              {/* LAST SEEN */}

              <div className="endpoint-table-last-seen">
                {endpoint.lastSeen}
              </div>

            </Link>

          ))

        ) : (

          /* EMPTY STATE */

          <div className="endpoint-empty-state">

            <ShieldOff size={24} />

            <div>
              <strong>
                No endpoints found
              </strong>

              <p>
                Try changing your search or status filter.
              </p>
            </div>

          </div>

        )}

      </div>

    </div>
  )
}

export default Endpoints