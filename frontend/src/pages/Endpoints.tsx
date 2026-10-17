import { useEffect, useMemo, useState } from 'react'

import {

  CheckCircle2,

  ChevronDown,

  Monitor,

  Search,

  Server,

  ShieldAlert,

  ShieldOff,

  RefreshCw,

} from 'lucide-react'

import { Link } from 'react-router-dom'

type EndpointStatus = 'ONLINE' | 'WARNING' | 'OFFLINE'

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

type Endpoint = {

  name: string

  os: string

  ip: string

  status: EndpointStatus

  lastSeen: string

  type: string

}

const fallbackEndpoints: Endpoint[] = [

  {

    name: 'WIN-01',

    os: 'Windows 11',

    ip: '192.168.1.101',

    status: 'ONLINE',

    lastSeen: 'Just now',

    type: 'Workstation',

  },

  {

    name: 'WIN-02',

    os: 'Windows 11',

    ip: '192.168.1.102',

    status: 'ONLINE',

    lastSeen: 'Just now',

    type: 'Workstation',

  },

  {

    name: 'WIN-03',

    os: 'Windows 10',

    ip: '192.168.1.103',

    status: 'ONLINE',

    lastSeen: 'Just now',

    type: 'Workstation',

  },

  {

    name: 'WIN-04',

    os: 'Windows 11',

    ip: '192.168.1.104',

    status: 'ONLINE',

    lastSeen: 'Just now',

    type: 'Workstation',

  },

  {

    name: 'LINUX-01',

    os: 'Ubuntu 24.04',

    ip: '192.168.1.105',

    status: 'ONLINE',

    lastSeen: 'Just now',

    type: 'Server',

  },

  {

    name: 'SRV-DC01',

    os: 'Windows Server 2022',

    ip: '192.168.1.10',

    status: 'ONLINE',

    lastSeen: 'Just now',

    type: 'Server',

  },

]

function mapEndpointType(

  hostname: string,

  operatingSystem: string,

) {

  if (

    hostname.startsWith('SRV-') ||

    hostname.startsWith('LINUX-') ||

    operatingSystem.toLowerCase().includes('server')

  ) {

    return 'Server'

  }

  return 'Workstation'

}

function mapEndpointStatus(

  status: string,

): EndpointStatus {

  const normalized = status.toUpperCase()

  if (normalized === 'OFFLINE') {

    return 'OFFLINE'

  }

  if (normalized === 'WARNING') {

    return 'WARNING'

  }

  return 'ONLINE'

}

function formatLastSeen(value: string) {

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {

    return value

  }

  return date.toLocaleTimeString('en-IN', {

    hour: '2-digit',

    minute: '2-digit',

    second: '2-digit',

    hour12: false,

  })

}

function convertApiEndpoint(

  endpoint: ApiEndpoint,

): Endpoint {

  return {

    name: endpoint.hostname || endpoint.endpoint_id,

    os: endpoint.operating_system,

    ip: endpoint.ip_address,

    status: mapEndpointStatus(endpoint.status),

    lastSeen: formatLastSeen(endpoint.last_seen),

    type: mapEndpointType(

      endpoint.hostname,

      endpoint.operating_system,

    ),

  }

}

function Endpoints() {

  const [endpoints, setEndpoints] =

    useState<Endpoint[]>(fallbackEndpoints)

  const [searchTerm, setSearchTerm] =

    useState('')

  const [statusFilter, setStatusFilter] =

    useState('ALL')

  const [loading, setLoading] =

    useState(true)

  const [apiOnline, setApiOnline] =

    useState(false)

  const loadEndpoints = async () => {

    setLoading(true)

    try {

      const response = await fetch(

        'http://127.0.0.1:8001/api/endpoints',

      )

      if (!response.ok) {

        throw new Error(

          'Failed to fetch endpoints',

        )

      }

      const data: ApiEndpoint[] =

        await response.json()

      setEndpoints(

        data.map(convertApiEndpoint),

      )

      setApiOnline(true)

    } catch {

      setEndpoints(fallbackEndpoints)

      setApiOnline(false)

    } finally {

      setLoading(false)

    }

  }

  useEffect(() => {

    loadEndpoints()

  }, [])

  const totalEndpoints =

    endpoints.length

  const onlineEndpoints =

    endpoints.filter(

      (endpoint) =>

        endpoint.status === 'ONLINE',

    ).length

  const warningEndpoints =

    endpoints.filter(

      (endpoint) =>

        endpoint.status === 'WARNING',

    ).length

  const offlineEndpoints =

    endpoints.filter(

      (endpoint) =>

        endpoint.status === 'OFFLINE',

    ).length

  const filteredEndpoints =

    useMemo(() => {

      return endpoints.filter(

        (endpoint) => {

          const search =

            searchTerm

              .toLowerCase()

              .trim()

          const matchesSearch =

            endpoint.name

              .toLowerCase()

              .includes(search) ||

            endpoint.os

              .toLowerCase()

              .includes(search) ||

            endpoint.ip

              .toLowerCase()

              .includes(search)

          const matchesStatus =

            statusFilter === 'ALL' ||

            endpoint.status ===

              statusFilter

          return (

            matchesSearch &&

            matchesStatus

          )

        },

      )

    }, [

      endpoints,

      searchTerm,

      statusFilter,

    ])

  const getStatusIcon = (

    status: EndpointStatus,

  ) => {

    if (status === 'ONLINE') {

      return (

        <CheckCircle2 size={15} />

      )

    }

    if (status === 'WARNING') {

      return (

        <ShieldAlert size={15} />

      )

    }

    return (

      <ShieldOff size={15} />

    )

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

          <h1>

            Endpoints

          </h1>

          <p>

            Monitor systems connected to the

            CyberSentinel security platform.

          </p>

        </div>

        <div

          className={

            apiOnline

              ? 'page-status'

              : 'page-status endpoint-api-offline'

          }

        >

          <span />

              {apiOnline

            ? `${onlineEndpoints} ONLINE`

            : 'DEMO DATA'}

        </div>

      </div>

      {/* =========================================

          API STATUS

          ========================================= */}

      <div className="endpoint-api-toolbar">

        <div

          className={

            apiOnline

              ? 'endpoint-api-status endpoint-api-online'

              : 'endpoint-api-status endpoint-api-demo'

          }

        >

          <span />

          {apiOnline

            ? 'API CONNECTED'

            : 'DEMO DATA'}

        </div>

        <div className="endpoint-api-source">

          {apiOnline

            ? 'FastAPI /api/endpoints'

            : 'LOCAL FALLBACK'}

        </div>

        <button

          type="button"

          className="endpoint-refresh-button"

          onClick={loadEndpoints}

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

      {/* =========================================

          ENDPOINT SUMMARY

          ========================================= */}

      <section className="endpoint-summary-grid">

        <div className="endpoint-summary-card">

          <div className="endpoint-summary-label">

            TOTAL ENDPOINTS

          </div>

          <div className="endpoint-summary-value">

            {String(totalEndpoints).padStart(

              2,

              '0',

            )}

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

            {String(onlineEndpoints).padStart(

              2,

              '0',

            )}

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

            {String(warningEndpoints).padStart(

              2,

              '0',

            )}

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

            {String(offlineEndpoints).padStart(

              2,

              '0',

            )}

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

              setSearchTerm(

                event.target.value,

              )

            }

          />

        </div>

        <div className="endpoint-filter">

          <ChevronDown size={15} />

          <select

            value={statusFilter}

            onChange={(event) =>

              setStatusFilter(

                event.target.value,

              )

            }

          >

            <option value="ALL">

              All Status

            </option>

            <option value="ONLINE">

              Online

            </option>

            <option value="WARNING">

              Warning

            </option>

            <option value="OFFLINE">

              Offline

            </option>

          </select>

        </div>

      </div>

      {/* =========================================

          RESULT COUNT

          ========================================= */}

      <div className="endpoint-result-count">

        {loading

          ? 'Loading endpoint telemetry...'

          : `Showing ${filteredEndpoints.length} of ${totalEndpoints} endpoints`}

      </div>

      {/* =========================================

          ENDPOINT TABLE

          ========================================= */}

      <div className="endpoint-table">

        {/* TABLE HEADER */}

        <div className="endpoint-table-header">

          <span>

            ENDPOINT

          </span>

          <span>

            OPERATING SYSTEM

          </span>

          <span>

            IP ADDRESS

          </span>

          <span>

            STATUS

          </span>

          <span>

            LAST SEEN

          </span>

        </div>

        {/* TABLE ROWS */}

        {filteredEndpoints.length > 0 ? (

          filteredEndpoints.map(

            (endpoint) => (

              <Link

                to={`/endpoints/${endpoint.name}`}

                className="endpoint-table-row endpoint-table-link"

                key={endpoint.name}

              >

                {/* ENDPOINT NAME */}

                <div className="endpoint-table-name">

                  <div className="endpoint-table-icon">

                    {endpoint.type ===

                    'Server' ? (

                      <Server

                        size={17}

                      />

                    ) : (

                      <Monitor

                        size={17}

                      />

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

                  {getStatusIcon(

                    endpoint.status,

                  )}

                  <span>

                    {endpoint.status}

                  </span>

                </div>

                {/* LAST SEEN */}

                <div className="endpoint-table-last-seen">

                  {endpoint.lastSeen}

                </div>

              </Link>

            ),

          )

        ) : (

          <div className="endpoint-empty-state">

            <ShieldOff size={24} />

            <div>

              <strong>

                No endpoints found

              </strong>

              <p>

                Try changing your search

                or status filter.

              </p>

            </div>

          </div>

        )}

      </div>

    </div>

  )

}

export default Endpoints
