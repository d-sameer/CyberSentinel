import {

  Activity,

  ArrowDown,

  ArrowDownRight,

  ArrowUp,

  ArrowUpRight,

  CheckCircle2,

  Clock3,

  Globe,

  Network as NetworkIcon,

  RefreshCw,

  RotateCcw,

  Search,

  ShieldAlert,

  ShieldCheck,

  Wifi,

  XCircle,

  Zap,

} from 'lucide-react'

import { useCallback, useEffect, useMemo, useState } from 'react'

import type { CSSProperties } from 'react'

import { Link } from 'react-router-dom'



type ConnectionStatus = 'ESTABLISHED' | 'BLOCKED' | 'SUSPICIOUS'



type NetworkConnection = {

  id: string

  source: string

  destination: string

  protocol: string

  port: number

  status: ConnectionStatus

  bytes: string

  endpoint: string

  direction: string

  threatLevel: string

}



type TrafficSnapshot = {

  id?: number

  captured_at?: string

  capturedAt?: string

  timestamp?: string

  ingress_mb?: number

  ingressMb?: number

  egress_mb?: number

  egressMb?: number

  total_connections?: number

  totalConnections?: number

  source?: string

}



type ProtocolSummary = {

  protocol: string

  port: number

  percentage: number

}



type NetworkSummary = {

  totalConnections: number

  activeConnections: number

  suspiciousConnections: number

  blockedConnections: number

  securityEvents: number

  ingressTraffic: string

  egressTraffic: string

  protocols: ProtocolSummary[]

}



const API_URL = 'http://127.0.0.1:8001/api/network'

const SUMMARY_URL = 'http://127.0.0.1:8001/api/network/summary'

const TRAFFIC_HISTORY_URL =

  'http://127.0.0.1:8001/api/network/traffic/history'



const controlStyle: CSSProperties = {

  width: '100%',

  minWidth: 0,

  padding: '11px 12px',

  borderRadius: 9,

  border: '1px solid #263449',

  background: '#0b1220',

  color: '#e2e8f0',

  outline: 'none',

  fontSize: 13,

  boxSizing: 'border-box',

}



const buttonStyle: CSSProperties = {

  display: 'inline-flex',

  alignItems: 'center',

  justifyContent: 'center',

  gap: 8,

  padding: '10px 13px',

  borderRadius: 9,

  border: '1px solid rgba(34, 211, 238, 0.25)',

  background: 'rgba(34, 211, 238, 0.07)',

  color: '#67e8f9',

  cursor: 'pointer',

  fontSize: 12,

  fontWeight: 600,

}



function formatCount(value: number) {

  return new Intl.NumberFormat('en-US').format(value)

}



function getThreatColor(level: string) {

  switch (level.toUpperCase()) {

    case 'CRITICAL':

      return '#fb7185'

    case 'HIGH':

      return '#f97316'

    case 'MEDIUM':

      return '#fbbf24'

    case 'LOW':

      return '#34d399'

    default:

      return '#94a3b8'

  }

}



function getStatusColor(status: ConnectionStatus) {

  switch (status) {

    case 'ESTABLISHED':

      return '#34d399'

    case 'SUSPICIOUS':

      return '#fb7185'

    case 'BLOCKED':

      return '#fbbf24'

  }

}



function normalizeConnection(

  item: Record<string, unknown>,

): NetworkConnection {

  const rawStatus = String(item.status ?? 'ESTABLISHED').toUpperCase()



  const status: ConnectionStatus =

    rawStatus === 'BLOCKED' || rawStatus === 'SUSPICIOUS'

      ? rawStatus

      : 'ESTABLISHED'



  const id = String(

    item.id ?? item.connection_id ?? item.connectionId ?? 'UNKNOWN',

  )



  return {

    id,

    source: String(item.source ?? item.source_ip ?? item.sourceIp ?? 'Unknown'),

    destination: String(

      item.destination ?? item.destination_ip ?? item.destinationIp ?? 'Unknown',

    ),

    protocol: String(item.protocol ?? 'Unknown').toUpperCase(),

    port: Number(item.port ?? item.destination_port ?? 0),

    status,

    bytes: String(item.bytes ?? item.traffic ?? item.data_transferred ?? '—'),

    endpoint: String(item.endpoint ?? item.endpoint_name ?? 'Unknown endpoint'),

    direction: String(item.direction ?? 'Unknown'),

    threatLevel: String(item.threatLevel ?? item.threat_level ?? 'LOW'),

  }

}



function snapshotTime(snapshot: TrafficSnapshot) {

  const value =

    snapshot.captured_at ?? snapshot.capturedAt ?? snapshot.timestamp



  if (!value) return '—'



  const date = new Date(value)



  return Number.isNaN(date.getTime())

    ? '—'

    : date.toLocaleTimeString([], {

        hour: '2-digit',

        minute: '2-digit',

      })

}



function snapshotIngress(snapshot: TrafficSnapshot) {

  return Number(snapshot.ingress_mb ?? snapshot.ingressMb ?? 0)

}



function snapshotEgress(snapshot: TrafficSnapshot) {

  return Number(snapshot.egress_mb ?? snapshot.egressMb ?? 0)

}



function Network() {

  const [connections, setConnections] = useState<NetworkConnection[]>([])

  const [summary, setSummary] = useState<NetworkSummary | null>(null)

  const [loading, setLoading] = useState(true)

  const [refreshing, setRefreshing] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)



  const [trafficHistory, setTrafficHistory] = useState<TrafficSnapshot[]>([])

  const [trafficLoading, setTrafficLoading] = useState(true)

  const [trafficError, setTrafficError] = useState<string | null>(null)



  const [searchTerm, setSearchTerm] = useState('')

  const [statusFilter, setStatusFilter] = useState('ALL')

  const [protocolFilter, setProtocolFilter] = useState('ALL')

  const [threatFilter, setThreatFilter] = useState('ALL')



  const loadTrafficHistory = useCallback(async () => {

    setTrafficError(null)



    try {

      const response = await fetch(TRAFFIC_HISTORY_URL)



      if (!response.ok) {

        throw new Error(`Traffic history API returned ${response.status}`)

      }



      const payload: unknown = await response.json()



      const historyRoot = payload && typeof payload === 'object'
        ? payload as { history?: unknown[]; snapshots?: unknown[]; data?: unknown; results?: unknown[] }
        : null
      const nestedHistory = historyRoot?.data && typeof historyRoot.data === 'object'
        ? historyRoot.data as { history?: unknown[]; snapshots?: unknown[]; results?: unknown[] }
        : null
      const historyArray = Array.isArray(payload)
        ? payload
        : Array.isArray(historyRoot?.history)
          ? historyRoot.history
          : Array.isArray(historyRoot?.snapshots)
            ? historyRoot.snapshots
            : Array.isArray(historyRoot?.results)
              ? historyRoot.results
              : Array.isArray(nestedHistory?.history)
                ? nestedHistory.history
                : Array.isArray(nestedHistory?.snapshots)
                  ? nestedHistory.snapshots
                  : Array.isArray(nestedHistory?.results)
                    ? nestedHistory.results
                    : []

      const normalized = historyArray

        .map((item) => item as TrafficSnapshot)

        .sort((a, b) => {

          const timeA = new Date(

            a.captured_at ?? a.capturedAt ?? a.timestamp ?? 0,

          ).getTime()

          const timeB = new Date(

            b.captured_at ?? b.capturedAt ?? b.timestamp ?? 0,

          ).getTime()

          return timeA - timeB

        })



      setTrafficHistory(normalized)

    } catch (err) {

      console.error('Failed to load traffic history:', err)

      setTrafficError(

        err instanceof Error

          ? err.message

          : 'Unable to load network traffic history.',

      )

    } finally {

      setTrafficLoading(false)

    }

  }, [])



  const loadNetwork = useCallback(async (manual = false) => {

    if (manual) {

      setRefreshing(true)

    } else {

      setLoading(true)

    }



    setError(null)



    try {

      const [connectionsResponse, summaryResponse] = await Promise.all([
        fetch(API_URL),
        fetch(SUMMARY_URL).catch(() => null),
      ])



      if (!connectionsResponse.ok) {

        throw new Error(`Network API returned ${connectionsResponse.status}`)

      }

      const rawConnections: unknown = await connectionsResponse.json()
      const summaryPayload: unknown = summaryResponse?.ok
        ? await summaryResponse.json()
        : {}
      const summaryRoot = summaryPayload && typeof summaryPayload === 'object'
        ? summaryPayload as Record<string, unknown>
        : {}
      const nestedSummary = summaryRoot.data && typeof summaryRoot.data === 'object'
        ? summaryRoot.data as Record<string, unknown>
        : {}
      const rawSummary: Record<string, unknown> =
        summaryRoot.summary && typeof summaryRoot.summary === 'object'
          ? summaryRoot.summary as Record<string, unknown>
          : nestedSummary.summary && typeof nestedSummary.summary === 'object'
            ? nestedSummary.summary as Record<string, unknown>
            : Object.keys(nestedSummary).length > 0
              ? nestedSummary
              : summaryRoot

      const connectionRoot = rawConnections && typeof rawConnections === 'object'
        ? rawConnections as { connections?: unknown[]; data?: unknown; items?: unknown[]; results?: unknown[] }
        : null
      const nestedConnections = connectionRoot?.data && typeof connectionRoot.data === 'object'
        ? connectionRoot.data as { connections?: unknown[]; items?: unknown[]; results?: unknown[] }
        : null
      const connectionArray = Array.isArray(rawConnections)
        ? rawConnections
        : Array.isArray(connectionRoot?.connections)
          ? connectionRoot.connections
          : Array.isArray(connectionRoot?.items)
            ? connectionRoot.items
            : Array.isArray(connectionRoot?.results)
              ? connectionRoot.results
              : Array.isArray(nestedConnections?.connections)
                ? nestedConnections.connections
                : Array.isArray(nestedConnections?.items)
                  ? nestedConnections.items
                  : Array.isArray(nestedConnections?.results)
                    ? nestedConnections.results
                    : []

      const normalizedConnections = connectionArray
        .filter((item): item is Record<string, unknown> =>
          item !== null && typeof item === 'object' && !Array.isArray(item),
        )
        .map((item) => normalizeConnection(item))



      const protocols = Array.isArray(rawSummary.protocols)

        ? (rawSummary.protocols as Record<string, unknown>[]).map((item) => ({

            protocol: String(item.protocol ?? 'Unknown'),

            port: Number(item.port ?? 0),

            percentage: Math.max(

              0,

              Math.min(100, Number(item.percentage ?? 0)),

            ),

          }))

        : []



      const normalizedSummary: NetworkSummary = {

        totalConnections: Number(

          rawSummary.totalConnections ??

            rawSummary.total_connections ??

            normalizedConnections.length,

        ),

        activeConnections: Number(
          rawSummary.activeConnections ?? rawSummary.active_connections ??
            normalizedConnections.filter((connection) => connection.status === 'ESTABLISHED').length,
        ),

        suspiciousConnections: Number(
          rawSummary.suspiciousConnections ?? rawSummary.suspicious_connections ??
            normalizedConnections.filter((connection) => connection.status === 'SUSPICIOUS').length,
        ),

        blockedConnections: Number(
          rawSummary.blockedConnections ?? rawSummary.blocked_connections ??
            normalizedConnections.filter((connection) => connection.status === 'BLOCKED').length,
        ),

        securityEvents: Number(
          rawSummary.securityEvents ?? rawSummary.security_events ??
            normalizedConnections.filter((connection) => connection.status === 'SUSPICIOUS' || connection.status === 'BLOCKED').length,
        ),

        ingressTraffic: String(

          rawSummary.ingressTraffic ?? rawSummary.ingress_traffic ?? '0 MB',

        ),

        egressTraffic: String(

          rawSummary.egressTraffic ?? rawSummary.egress_traffic ?? '0 MB',

        ),

        protocols,

      }



      setConnections(normalizedConnections)

      setSummary(normalizedSummary)

      setLastUpdated(new Date())

    } catch (err) {

      console.error('Failed to load network data:', err)

      setError(

        err instanceof Error

          ? err.message

          : 'Unable to connect to the CyberSentinel network backend.',

      )

    } finally {

      setLoading(false)

      setRefreshing(false)

    }

  }, [])



  useEffect(() => {

    void loadNetwork()

    void loadTrafficHistory()



    const interval = window.setInterval(() => {

      void loadNetwork(true)

      void loadTrafficHistory()

    }, 60_000)



    return () => window.clearInterval(interval)

  }, [loadNetwork, loadTrafficHistory])



  const calculatedSummary = useMemo(() => {

    const activeConnections = connections.filter(

      (connection) => connection.status === 'ESTABLISHED',

    ).length



    const suspiciousConnections = connections.filter(

      (connection) => connection.status === 'SUSPICIOUS',

    ).length



    const blockedConnections = connections.filter(

      (connection) => connection.status === 'BLOCKED',

    ).length



    return {

      activeConnections,

      suspiciousConnections,

      blockedConnections,

      securityEvents: suspiciousConnections + blockedConnections,

    }

  }, [connections])



  const effectiveSummary: NetworkSummary = {

    totalConnections: summary?.totalConnections ?? connections.length,

    activeConnections:

      summary?.activeConnections ?? calculatedSummary.activeConnections,

    suspiciousConnections:

      summary?.suspiciousConnections ??

      calculatedSummary.suspiciousConnections,

    blockedConnections:

      summary?.blockedConnections ?? calculatedSummary.blockedConnections,

    securityEvents:

      summary?.securityEvents ?? calculatedSummary.securityEvents,

    ingressTraffic: summary?.ingressTraffic ?? '0 MB',

    egressTraffic: summary?.egressTraffic ?? '0 MB',

    protocols: summary?.protocols ?? [],

  }



  const highRiskConnections = useMemo(

    () =>

      connections.filter((connection) =>

        ['HIGH', 'CRITICAL'].includes(connection.threatLevel.toUpperCase()),

      ),

    [connections],

  )



  const protocolOptions = useMemo(

    () =>

      Array.from(

        new Set(connections.map((connection) => connection.protocol)),

      ).sort(),

    [connections],

  )



  const filteredConnections = useMemo(() => {

    const query = searchTerm.trim().toLowerCase()



    return connections.filter((connection) => {

      const searchableValues = [

        connection.id,

        connection.source,

        connection.destination,

        connection.endpoint,

        connection.protocol,

        String(connection.port),

        connection.status,

        connection.threatLevel,

        connection.direction,

      ]



      const matchesSearch =

        !query ||

        searchableValues.some((value) => value.toLowerCase().includes(query))



      const matchesStatus =

        statusFilter === 'ALL' || connection.status === statusFilter



      const matchesProtocol =

        protocolFilter === 'ALL' || connection.protocol === protocolFilter



      const matchesThreat =

        threatFilter === 'ALL' ||

        connection.threatLevel.toUpperCase() === threatFilter



      return (

        matchesSearch &&

        matchesStatus &&

        matchesProtocol &&

        matchesThreat

      )

    })

  }, [connections, searchTerm, statusFilter, protocolFilter, threatFilter])



  const resetFilters = () => {

    setSearchTerm('')

    setStatusFilter('ALL')

    setProtocolFilter('ALL')

    setThreatFilter('ALL')

  }



  const applyStatusFilter = (status: string) => {

    setSearchTerm('')

    setStatusFilter(status)

    setProtocolFilter('ALL')

    setThreatFilter('ALL')

  }



  const applyHighRiskFilter = () => {

    setSearchTerm('')

    setStatusFilter('ALL')

    setProtocolFilter('ALL')

    setThreatFilter('HIGH')

  }



  const hasActiveFilters =

    searchTerm !== '' ||

    statusFilter !== 'ALL' ||

    protocolFilter !== 'ALL' ||

    threatFilter !== 'ALL'



  const chartData = useMemo(() => {

    return trafficHistory.map((snapshot) => ({

      time: snapshotTime(snapshot),

      ingress: Math.max(0, snapshotIngress(snapshot)),

      egress: Math.max(0, snapshotEgress(snapshot)),

    }))

  }, [trafficHistory])



  const chartMax = Math.max(

    1,

    ...chartData.map((item) => Math.max(item.ingress, item.egress)),

  )



  if (loading) {

    return (

      <div className="page-container">

        <div className="network-panel">

          <div

            className="network-panel-header"

            style={{ minHeight: 220, justifyContent: 'center' }}

          >

            <div>

              <div className="network-panel-title">

                Loading Network Security Center

              </div>

              <div className="network-panel-subtitle">

                Retrieving connection telemetry from CyberSentinel...

              </div>

            </div>

            <NetworkIcon size={24} color="#67e8f9" />

          </div>

        </div>

      </div>

    )

  }



  if (error && connections.length === 0) {

    return (

      <div className="page-container">

        <div className="network-panel">

          <div

            className="network-panel-header"

            style={{ minHeight: 240, justifyContent: 'center' }}

          >

            <div>

              <div

                className="network-panel-title"

                style={{ color: '#f87171' }}

              >

                Network Backend Unavailable

              </div>

              <div className="network-panel-subtitle">{error}</div>

              <button

                type="button"

                onClick={() => void loadNetwork(true)}

                style={{ ...buttonStyle, marginTop: 16 }}

              >

                <RefreshCw size={14} />

                Retry connection

              </button>

            </div>

            <ShieldAlert size={24} color="#f87171" />

          </div>

        </div>

      </div>

    )

  }



    return (

    <div className="page-container">

      <div className="page-header">

        <div>

          <div className="page-eyebrow">SECURITY OPERATIONS / NETWORK</div>

          <h1>Network Security Center</h1>

          <p>

            Monitor network sessions, traffic direction, protocol usage, and

            potentially suspicious connections across your environment.

          </p>

        </div>

        <div

          style={{

            display: 'flex',

            flexWrap: 'wrap',

            alignItems: 'center',

            gap: 12,

          }}

        >

          <div className="page-status page-network-status">

            <span />

            NETWORK MONITORING

          </div>

          <button

            type="button"

            onClick={() => {

              void loadNetwork(true)

              void loadTrafficHistory()

            }}

            disabled={refreshing}

            style={{

              ...buttonStyle,

              opacity: refreshing ? 0.65 : 1,

              cursor: refreshing ? 'wait' : 'pointer',

            }}

          >

            <RefreshCw

              size={14}

              style={{

                animation: refreshing ? 'spin 1s linear infinite' : undefined,

              }}

            />

            {refreshing ? 'Refreshing...' : 'Refresh data'}

          </button>

        </div>

      </div>



      {error && (

        <div

          role="status"

          style={{

            marginBottom: 16,

            padding: '12px 14px',

            borderRadius: 9,

            border: '1px solid rgba(251, 191, 36, 0.25)',

            background: 'rgba(251, 191, 36, 0.06)',

            color: '#fbbf24',

            fontSize: 12,

          }}

        >

          Refresh failed: {error}. Showing the last successfully loaded data.

        </div>

      )}



      <section className="network-summary-grid" aria-label="Network overview">

        <div className="network-summary-card">

          <div className="network-summary-top">

            <span>ACTIVE CONNECTIONS</span>

            <NetworkIcon size={17} color="#67e8f9" />

          </div>

          <strong>{formatCount(effectiveSummary.activeConnections)}</strong>

          <p>Established network sessions</p>

          <div style={{ color: '#34d399', fontSize: 11, marginTop: 8 }}>

            <Activity size={12} style={{ display: 'inline', marginRight: 5 }} />

            Currently established

          </div>

        </div>



        <div className="network-summary-card">

          <div className="network-summary-top">

            <span>INGRESS TRAFFIC</span>

            <ArrowDown size={17} color="#60a5fa" />

          </div>

          <strong>{effectiveSummary.ingressTraffic}</strong>

          <p>Incoming traffic observed</p>

          <div style={{ color: '#60a5fa', fontSize: 11, marginTop: 8 }}>

            <ArrowDownRight

              size={12}

              style={{ display: 'inline', marginRight: 5 }}

            />

            Inbound network flow

          </div>

        </div>



        <div className="network-summary-card">

          <div className="network-summary-top">

            <span>EGRESS TRAFFIC</span>

            <ArrowUp size={17} color="#a78bfa" />

          </div>

          <strong>{effectiveSummary.egressTraffic}</strong>

          <p>Outgoing traffic observed</p>

          <div style={{ color: '#a78bfa', fontSize: 11, marginTop: 8 }}>

            <ArrowUpRight

              size={12}

              style={{ display: 'inline', marginRight: 5 }}

            />

            Outbound network flow

          </div>

        </div>



        <div className="network-summary-card network-summary-alert">

          <div className="network-summary-top">

            <span>SECURITY EVENTS</span>

            <ShieldAlert size={17} color="#fb7185" />

          </div>

          <strong>{formatCount(effectiveSummary.securityEvents)}</strong>

          <p>Suspicious or blocked connections</p>

          <div style={{ color: '#fb7185', fontSize: 11, marginTop: 8 }}>

            Requires analyst awareness

          </div>

        </div>

      </section>



      <section

        className="network-summary-grid"

        aria-label="Threat monitoring"

      >

        <button

          type="button"

          className="network-summary-card network-summary-alert"

          onClick={() => applyStatusFilter('SUSPICIOUS')}

          style={{

            textAlign: 'left',

            cursor: 'pointer',

            width: '100%',

          }}

        >

          <div className="network-summary-top">

            <span>SUSPICIOUS CONNECTIONS</span>

            <ShieldAlert size={17} color="#fb7185" />

          </div>

          <strong>{formatCount(effectiveSummary.suspiciousConnections)}</strong>

          <p>Click to investigate suspicious activity</p>

        </button>



        <button

          type="button"

          className="network-summary-card network-summary-alert"

          onClick={() => applyStatusFilter('BLOCKED')}

          style={{

            textAlign: 'left',

            cursor: 'pointer',

            width: '100%',

          }}

        >

          <div className="network-summary-top">

            <span>BLOCKED CONNECTIONS</span>

            <XCircle size={17} color="#fbbf24" />

          </div>

          <strong>{formatCount(effectiveSummary.blockedConnections)}</strong>

          <p>Click to review blocked network traffic</p>

        </button>



        <button

          type="button"

          className="network-summary-card network-summary-alert"

          onClick={applyHighRiskFilter}

          style={{

            textAlign: 'left',

            cursor: 'pointer',

            width: '100%',

          }}

        >

          <div className="network-summary-top">

            <span>HIGH-RISK CONNECTIONS</span>

            <Zap size={17} color="#fb923c" />

          </div>

          <strong>{formatCount(highRiskConnections.length)}</strong>

          <p>Connections marked high or critical risk</p>

        </button>



        <div className="network-summary-card">

          <div className="network-summary-top">

            <span>TOTAL CONNECTIONS</span>

            <Globe size={17} color="#67e8f9" />

          </div>

          <strong>{formatCount(effectiveSummary.totalConnections)}</strong>

          <p>Total tracked network sessions</p>

        </div>

      </section>



      {/* Historical network traffic chart */}

      <section

        className="network-panel"

        style={{ marginBottom: 20 }}

        aria-label="Historical network traffic"

      >

        <div className="network-panel-header">

          <div>

            <div className="network-panel-title">

              Historical Traffic Overview

            </div>

            <div className="network-panel-subtitle">

              Recorded aggregate ingress and egress totals · latest 60 snapshots

            </div>

          </div>

          <button

            type="button"

            onClick={() => void loadTrafficHistory()}

            style={buttonStyle}

            disabled={trafficLoading}

          >

            <RefreshCw size={13} />

            {trafficLoading ? 'Loading history...' : 'Refresh chart'}

          </button>

        </div>



        <div style={{ padding: '16px 20px 20px' }}>

          <div

            style={{

              display: 'flex',

              gap: 18,

              flexWrap: 'wrap',

              marginBottom: 12,

              fontSize: 12,

              color: '#cbd5e1',

            }}

          >

            <span>

              <span

                style={{

                  display: 'inline-block',

                  width: 8,

                  height: 8,

                  borderRadius: 99,

                  background: '#60a5fa',

                  marginRight: 7,

                }}

              />

              Ingress (MB)

            </span>

            <span>

              <span

                style={{

                  display: 'inline-block',

                  width: 8,

                  height: 8,

                  borderRadius: 99,

                  background: '#a78bfa',

                  marginRight: 7,

                }}

              />

              Egress (MB)

            </span>

            <span style={{ color: '#64748b' }}>Scale: MB per snapshot</span>

          </div>



          {trafficError ? (

            <div

              role="status"

              style={{

                padding: '20px 0',

                color: '#fbbf24',

                fontSize: 12,

              }}

            >

              Traffic history unavailable: {trafficError}

            </div>

          ) : trafficLoading && trafficHistory.length === 0 ? (

            <div

              style={{

                padding: '28px 0',

                color: '#94a3b8',

                fontSize: 12,

                textAlign: 'center',

              }}

            >

              Loading recorded traffic snapshots...

            </div>

          ) : trafficHistory.length === 0 ? (

            <div

              style={{

                padding: '28px 0',

                color: '#94a3b8',

                fontSize: 12,

                textAlign: 'center',

              }}

            >

              No snapshots recorded yet. Ensure the backend snapshot task is

              running, then refresh the chart.

            </div>

          ) : (

            <div style={{ width: '100%', overflowX: 'auto' }}>

              <svg

                viewBox="0 0 760 230"

                role="img"

                aria-label="Line chart showing recorded ingress and egress traffic in megabytes"

                style={{

                  display: 'block',

                  width: '100%',

                  minWidth: 440,

                  height: 'auto',

                  maxHeight: 300,

                }}

              >

                {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {

                  const y = 18 + 180 * fraction

                  const label = (chartMax * (1 - fraction)).toFixed(1)



                  return (

                    <g key={fraction}>

                      <line

                        x1={44}

                        y1={y}

                        x2={746}

                        y2={y}

                        stroke="#263449"

                        strokeDasharray="4 5"

                      />

                      <text

                        x={36}

                        y={y + 4}

                        textAnchor="end"

                        fill="#64748b"

                        fontSize="10"

                      >

                        {label}

                      </text>

                    </g>

                  )

                })}



                <polyline

                  points={chartData

                    .map((item, index) => {

                      const x =

                        44 +

                        (chartData.length <= 1

                          ? 351

                          : (index / (chartData.length - 1)) * 702)

                      const y = 18 + 180 - (item.ingress / chartMax) * 180

                      return `${x},${y}`

                    })

                    .join(' ')}

                  fill="none"

                  stroke="#60a5fa"

                  strokeWidth="2.5"

                  strokeLinejoin="round"

                  strokeLinecap="round"

                />



                <polyline

                  points={chartData

                    .map((item, index) => {

                      const x =

                        44 +

                        (chartData.length <= 1

                          ? 351

                          : (index / (chartData.length - 1)) * 702)

                      const y = 18 + 180 - (item.egress / chartMax) * 180

                      return `${x},${y}`

                    })

                    .join(' ')}

                  fill="none"

                  stroke="#a78bfa"

                  strokeWidth="2.5"

                  strokeLinejoin="round"

                  strokeLinecap="round"

                />



                {chartData.map((item, index) => {

                  const x =

                    44 +

                    (chartData.length <= 1

                      ? 351

                      : (index / (chartData.length - 1)) * 702)

                  const ingressY =

                    18 + 180 - (item.ingress / chartMax) * 180

                  const egressY =

                    18 + 180 - (item.egress / chartMax) * 180



                  return (

                    <g key={`${item.time}-${index}`}>

                      <circle

                        cx={x}

                        cy={ingressY}

                        r="3"

                        fill="#60a5fa"

                      >

                        <title>{`${item.time} · Ingress ${item.ingress.toFixed(2)} MB`}</title>

                      </circle>

                      <circle

                        cx={x}

                        cy={egressY}

                        r="3"

                        fill="#a78bfa"

                      >

                        <title>{`${item.time} · Egress ${item.egress.toFixed(2)} MB`}</title>

                      </circle>

                    </g>

                  )

                })}



                {[0, Math.floor((chartData.length - 1) / 2), chartData.length - 1]

                  .filter(

                    (value, index, array) => array.indexOf(value) === index,

                  )

                  .map((index) => {

                    const x =

                      44 +

                      (chartData.length <= 1

                        ? 351

                        : (index / (chartData.length - 1)) * 702)



                    return (

                      <text

                        key={index}

                        x={x}

                        y={222}

                        textAnchor={

                          index === 0

                            ? 'start'

                            : index === chartData.length - 1

                              ? 'end'

                              : 'middle'

                        }

                        fill="#64748b"

                        fontSize="10"

                      >

                        {chartData[index].time}

                      </text>

                    )

                  })}

              </svg>



              <div

                style={{

                  display: 'flex',

                  gap: 24,

                  flexWrap: 'wrap',

                  marginTop: 10,

                  color: '#94a3b8',

                  fontSize: 11,

                }}

              >

                <span>

                  Snapshots displayed:{' '}

                  <strong style={{ color: '#e2e8f0' }}>

                    {trafficHistory.length}

                  </strong>

                </span>

                <span>

                  Latest capture:{' '}

                  <strong style={{ color: '#e2e8f0' }}>

                    {chartData[chartData.length - 1].time}

                  </strong>

                </span>

                <span>

                  Latest ingress:{' '}

                  <strong style={{ color: '#60a5fa' }}>

                    {chartData[chartData.length - 1].ingress.toFixed(2)} MB

                  </strong>

                </span>

                <span>

                  Latest egress:{' '}

                  <strong style={{ color: '#a78bfa' }}>

                    {chartData[chartData.length - 1].egress.toFixed(2)} MB

                  </strong>

                </span>

              </div>

            </div>

          )}

        </div>

      </section>



      <section className="network-overview-grid">

        <div className="network-panel">

          <div className="network-panel-header">

            <div>

              <div className="network-panel-title">Connection Activity</div>

              <div className="network-panel-subtitle">

                Status distribution across loaded network sessions

              </div>

            </div>

            <Activity size={18} color="#67e8f9" />

          </div>



          <div style={{ padding: 20 }}>

            {connections.length === 0 ? (

              <div

                className="network-panel-subtitle"

                style={{ padding: '28px 0', textAlign: 'center' }}

              >

                No connection telemetry is available.

              </div>

            ) : (

              <>

                <div

                  style={{

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'space-between',

                    gap: 10,

                    marginBottom: 16,

                    fontSize: 12,

                    color: '#94a3b8',

                  }}

                >

                  <span>Tracked sessions</span>

                  <strong style={{ color: '#e2e8f0' }}>

                    {formatCount(connections.length)}

                  </strong>

                </div>



                <div

                  style={{

                    display: 'flex',

                    width: '100%',

                    height: 12,

                    overflow: 'hidden',

                    borderRadius: 99,

                    background: '#1e293b',

                    marginBottom: 20,

                  }}

                  aria-label="Connection status distribution"

                >

                  <div

                    title={`Established: ${calculatedSummary.activeConnections}`}

                    style={{

                      width: `${(calculatedSummary.activeConnections / connections.length) * 100}%`,

                      background: '#34d399',

                      transition: 'width 250ms ease',

                    }}

                  />

                  <div

                    title={`Suspicious: ${calculatedSummary.suspiciousConnections}`}

                    style={{

                      width: `${(calculatedSummary.suspiciousConnections / connections.length) * 100}%`,

                      background: '#fb7185',

                      transition: 'width 250ms ease',

                    }}

                  />

                  <div

                    title={`Blocked: ${calculatedSummary.blockedConnections}`}

                    style={{

                      width: `${(calculatedSummary.blockedConnections / connections.length) * 100}%`,

                      background: '#fbbf24',

                      transition: 'width 250ms ease',

                    }}

                  />

                </div>



                {[

                  {

                    label: 'Established',

                    count: calculatedSummary.activeConnections,

                    color: '#34d399',

                    icon: CheckCircle2,

                  },

                  {

                    label: 'Suspicious',

                    count: calculatedSummary.suspiciousConnections,

                    color: '#fb7185',

                    icon: ShieldAlert,

                  },

                  {

                    label: 'Blocked',

                    count: calculatedSummary.blockedConnections,

                    color: '#fbbf24',

                    icon: XCircle,

                  },

                ].map((item) => {

                  const Icon = item.icon

                  const percentage =

                    connections.length > 0

                      ? Math.round((item.count / connections.length) * 100)

                      : 0



                  return (

                    <div

                      key={item.label}

                      style={{

                        display: 'flex',

                        alignItems: 'center',

                        gap: 10,

                        marginTop: 13,

                      }}

                    >

                      <Icon size={15} color={item.color} />

                      <span

                        style={{

                          flex: 1,

                          color: '#cbd5e1',

                          fontSize: 12,

                        }}

                      >

                        {item.label}

                      </span>

                      <span style={{ color: '#94a3b8', fontSize: 11 }}>

                        {percentage}%

                      </span>

                      <strong

                        style={{

                          color: item.color,

                          minWidth: 34,

                          textAlign: 'right',

                          fontSize: 13,

                        }}

                      >

                        {item.count}

                      </strong>

                    </div>

                  )

                })}

              </>

            )}

          </div>

        </div>



        <div className="network-panel">

          <div className="network-panel-header">

            <div>

              <div className="network-panel-title">Protocol Distribution</div>

              <div className="network-panel-subtitle">

                Protocols reported by the backend

              </div>

            </div>

            <Globe size={18} color="#67e8f9" />

          </div>



          <div className="protocol-list">

            {effectiveSummary.protocols.length === 0 ? (

              <div

                className="network-panel-subtitle"

                style={{ padding: 20 }}

              >

                No protocol distribution data is available.

              </div>

            ) : (

              effectiveSummary.protocols.map((protocol) => (

                <div

                  className="protocol-row"

                  key={`${protocol.protocol}-${protocol.port}`}

                >

                  <div>

                    <span>{protocol.protocol}</span>

                    <small>{protocol.port}</small>

                  </div>

                  <div className="protocol-bar">

                    <span

                      style={{

                        width: `${protocol.percentage}%`,

                      }}

                    />

                  </div>

                  <strong>{protocol.percentage}%</strong>

                </div>

              ))

            )}

          </div>

        </div>

      </section>



      <section className="network-panel network-connections-panel">

        <div className="network-panel-header">

          <div>

            <div className="network-panel-title">Network Connections</div>

            <div className="network-panel-subtitle">

              {formatCount(effectiveSummary.totalConnections)} sessions tracked

              {' · '}

              Showing {formatCount(filteredConnections.length)} results

            </div>

          </div>

          <Wifi size={18} color="#67e8f9" />

        </div>



        <div

          style={{

            display: 'grid',

            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',

            gap: 12,

            padding: '16px 20px',

            borderBottom: '1px solid rgba(148, 163, 184, 0.10)',

          }}

        >

          <div style={{ position: 'relative', minWidth: 0 }}>

            <Search

              size={16}

              style={{

                position: 'absolute',

                left: 12,

                top: '50%',

                transform: 'translateY(-50%)',

                color: '#64748b',

                pointerEvents: 'none',

              }}

            />

            <input

              type="search"

              value={searchTerm}

              onChange={(event) => setSearchTerm(event.target.value)}

              placeholder="Search IP, endpoint, ID..."

              aria-label="Search network connections"

              style={{ ...controlStyle, paddingLeft: 36 }}

            />

          </div>



          <select

            value={statusFilter}

            onChange={(event) => setStatusFilter(event.target.value)}

            aria-label="Filter by status"

            style={controlStyle}

          >

            <option value="ALL">All statuses</option>

            <option value="ESTABLISHED">Established</option>

            <option value="SUSPICIOUS">Suspicious</option>

            <option value="BLOCKED">Blocked</option>

          </select>



          <select

            value={protocolFilter}

            onChange={(event) => setProtocolFilter(event.target.value)}

            aria-label="Filter by protocol"

            style={controlStyle}

          >

            <option value="ALL">All protocols</option>

            {protocolOptions.map((protocol) => (

              <option value={protocol} key={protocol}>

                {protocol}

              </option>

            ))}

          </select>



          <select

            value={threatFilter}

            onChange={(event) => setThreatFilter(event.target.value)}

            aria-label="Filter by threat level"

            style={controlStyle}

          >

            <option value="ALL">All threat levels</option>

            <option value="LOW">Low</option>

            <option value="MEDIUM">Medium</option>

            <option value="HIGH">High</option>

            <option value="CRITICAL">Critical</option>

          </select>

        </div>



        <div

          style={{

            display: 'flex',

            flexWrap: 'wrap',

            alignItems: 'center',

            justifyContent: 'space-between',

            gap: 10,

            padding: '0 20px 14px',

          }}

        >

          <span style={{ color: '#94a3b8', fontSize: 12 }}>

            {hasActiveFilters

              ? 'Filters are active'

              : 'Showing all network connections'}

          </span>

          <button

            type="button"

            onClick={resetFilters}

            style={buttonStyle}

          >

            <RotateCcw size={13} />

            Reset filters

          </button>

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

                <th>THREAT</th>

                <th>STATUS</th>

              </tr>

            </thead>



            <tbody>

              {filteredConnections.map((connection) => {

                const threatColor = getThreatColor(connection.threatLevel)

                const statusColor = getStatusColor(connection.status)



                return (

                  <tr key={connection.id}>

                    <td colSpan={8} className="network-connection-cell">

                      <Link

                        to={`/network/${encodeURIComponent(connection.id)}`}

                        className="network-connection-row"

                        aria-label={`Investigate connection ${connection.id}`}

                        style={{

                          gridTemplateColumns:

                            'minmax(130px, 1fr) minmax(130px, 1fr) minmax(80px, .7fr) minmax(55px, .5fr) minmax(120px, 1fr) minmax(75px, .6fr) minmax(90px, .7fr) minmax(105px, .8fr)',

                        }}

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

                          {connection.port || '—'}

                        </span>



                        <span>{connection.endpoint}</span>



                        <span className="network-mono">

                          {connection.bytes}

                        </span>



                        <span>

                          <span

                            style={{

                              display: 'inline-flex',

                              alignItems: 'center',

                              gap: 6,

                              color: threatColor,

                              fontSize: 11,

                              fontWeight: 700,

                            }}

                          >

                            <span

                              style={{

                                width: 6,

                                height: 6,

                                borderRadius: '50%',

                                background: threatColor,

                                boxShadow: `0 0 8px ${threatColor}66`,

                              }}

                            />

                            {connection.threatLevel.toUpperCase()}

                          </span>

                        </span>



                        <span>

                          <span

                            className={`connection-status connection-${connection.status.toLowerCase()}`}

                            style={{ color: statusColor }}

                          >

                            <span />

                            {connection.status}

                          </span>

                        </span>

                      </Link>

                    </td>

                  </tr>

                )

              })}



              {filteredConnections.length === 0 && (

                <tr>

                  <td

                    colSpan={8}

                    style={{

                      padding: '36px 16px',

                      textAlign: 'center',

                      color: '#94a3b8',

                    }}

                  >

                    <NetworkIcon

                      size={26}

                      style={{ marginBottom: 10, opacity: 0.65 }}

                    />

                    <div>

                      No connections match your search or selected filters.

                    </div>



                    {hasActiveFilters && (

                      <button

                        type="button"

                        onClick={resetFilters}

                        style={{

                          border: 0,

                          background: 'transparent',

                          color: '#67e8f9',

                          cursor: 'pointer',

                          marginTop: 10,

                        }}

                      >

                        Clear filters

                      </button>

                    )}

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>



        <div

          style={{

            display: 'flex',

            flexWrap: 'wrap',

            alignItems: 'center',

            justifyContent: 'space-between',

            gap: 10,

            padding: '14px 20px',

            borderTop: '1px solid rgba(148, 163, 184, 0.10)',

            color: '#64748b',

            fontSize: 11,

          }}

        >

          <span>

            <Clock3

              size={12}

              style={{ display: 'inline', marginRight: 5 }}

            />

            {lastUpdated

              ? `Last updated ${lastUpdated.toLocaleTimeString()}`

              : 'Waiting for telemetry'}

          </span>



          <span>

            <ShieldCheck

              size={12}

              style={{ display: 'inline', marginRight: 5 }}

            />

            Connection details available for each row

          </span>

        </div>

      </section>

    </div>

  )

}



export default Network