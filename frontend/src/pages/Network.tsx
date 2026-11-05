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



type LiveWindowsConnection = {
  source: string
  observed_at: string
  protocol: string
  local: { ip: string; port: number } | null
  remote: { ip: string; port: number } | null
  status: string
  pid: number | null
  process: string | null
}

type LiveWindowsResponse = {
  source: string
  observed_at: string
  total_observed: number
  limit: number
  permission_limited: boolean
  connections: LiveWindowsConnection[]
}
type LiveThreatFinding = {
  rule: string
  severity: string
  reason: string
}

type LiveThreatConnection = LiveWindowsConnection & {
  security_analysis: {
    risk_score: number
    risk_level: string
    findings: LiveThreatFinding[]
    review_required: boolean
  }
}

type LiveThreatResponse = {
  source: string
  observed_at: string
  total_observed: number
  limit: number
  permission_limited: boolean
  connections: LiveThreatConnection[]
  flagged_count: number
  flagged_connections: LiveThreatConnection[]
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



  const [liveConnections, setLiveConnections] = useState<LiveWindowsConnection[]>([])
  const [liveObservedAt, setLiveObservedAt] = useState<string | null>(null)
  const [liveLoading, setLiveLoading] = useState(true)
  const [liveError, setLiveError] = useState<string | null>(null)
  const [livePermissionLimited, setLivePermissionLimited] = useState(false)
  const [liveThreatData, setLiveThreatData] = useState<LiveThreatResponse | null>(null)
  const [liveThreatLoading, setLiveThreatLoading] = useState(true)
  const [liveThreatError, setLiveThreatError] = useState<string | null>(null)
  const [liveSearch, setLiveSearch] = useState('')
  const [liveProtocolFilter, setLiveProtocolFilter] = useState('ALL')
  const [liveStatusFilter, setLiveStatusFilter] = useState('ALL')
  const [liveSortKey, setLiveSortKey] = useState('protocol')
  const [liveSortDirection, setLiveSortDirection] = useState<'asc' | 'desc'>('asc')
  const [liveHistoryRecords, setLiveHistoryRecords] = useState<any[]>([])
  const [liveHistoryTotal, setLiveHistoryTotal] = useState(0)
  const [liveHistorySearch, setLiveHistorySearch] = useState('')
  const [liveHistoryStatusFilter, setLiveHistoryStatusFilter] = useState('ALL')

  const filteredLiveHistory = liveHistoryRecords.filter((record) => {
    const search = liveHistorySearch.trim().toLowerCase()
    const matchesSearch = !search || [
      record.protocol,
      record.local_ip,
      record.local_port,
      record.remote_ip,
      record.remote_port,
      record.process,
      record.pid,
      record.analyst,
      record.status,
    ].some((value) => String(value ?? '').toLowerCase().includes(search))

    const matchesStatus =
      liveHistoryStatusFilter === 'ALL' ||
      record.status === liveHistoryStatusFilter

    return matchesSearch && matchesStatus
  })
  const [liveHistoryLoading, setLiveHistoryLoading] = useState(false)
  const [liveHistoryError, setLiveHistoryError] = useState<string | null>(null)

  const loadLiveHistory = useCallback(async () => {
    setLiveHistoryLoading(true)
    setLiveHistoryError(null)
    try {
      const response = await fetch(`${API_URL}/live/investigations?limit=100&offset=0`)
      if (!response.ok) throw new Error(`History request failed: ${response.status}`)
      const payload = await response.json()
      setLiveHistoryRecords(payload.investigations ?? [])
      setLiveHistoryTotal(payload.total ?? 0)
    } catch (error) {
      setLiveHistoryError(error instanceof Error ? error.message : 'Unable to load investigation history.')
    } finally {
      setLiveHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadLiveHistory()
  }, [loadLiveHistory])
  const [selectedLiveConnection, setSelectedLiveConnection] =
    useState<LiveWindowsConnection | null>(null)
  const [liveInvestigationStatus, setLiveInvestigationStatus] = useState('Under Investigation')
  const [liveInvestigationNotes, setLiveInvestigationNotes] = useState('')
  const [liveInvestigationAnalyst, setLiveInvestigationAnalyst] = useState('SOC Analyst')
  const [liveInvestigationLoading, setLiveInvestigationLoading] = useState(false)
  const [liveInvestigationSaving, setLiveInvestigationSaving] = useState(false)
  const [liveInvestigationError, setLiveInvestigationError] = useState<string | null>(null)
  const [liveInvestigationFound, setLiveInvestigationFound] = useState(false)
  const [liveInvestigationSavedAt, setLiveInvestigationSavedAt] = useState<string | null>(null)
  const [liveInvestigationCreatedAt, setLiveInvestigationCreatedAt] = useState<string | null>(null)
  const [liveInvestigationUpdatedAt, setLiveInvestigationUpdatedAt] = useState<string | null>(null)
  const [liveInvestigationId, setLiveInvestigationId] = useState<number | null>(null)
  const [liveAuditEvents, setLiveAuditEvents] = useState<Array<{
    id: number
    event_type: string
    previous_status: string | null
    new_status: string
    analyst: string
    notes: string
    created_at: string
  }>>([])
  const [liveAuditLoading, setLiveAuditLoading] = useState(false)
  const [liveAuditError, setLiveAuditError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedLiveConnection) return

    document.getElementById('live-connection-investigation')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })

    let cancelled = false
    const connection = selectedLiveConnection

    const loadInvestigation = async () => {
      setLiveInvestigationLoading(true)
      setLiveInvestigationError(null)
      setLiveInvestigationFound(false)
      setLiveInvestigationId(null)
      setLiveAuditEvents([])
      setLiveAuditError(null)
      setLiveInvestigationCreatedAt(null)
      setLiveInvestigationUpdatedAt(null)
      setLiveInvestigationStatus('Under Investigation')
      setLiveInvestigationNotes('')
      setLiveInvestigationAnalyst('SOC Analyst')

      const body = {
        protocol: connection.protocol,
        local_ip: connection.local?.ip ?? '',
        local_port: connection.local?.port ?? null,
        remote_ip: connection.remote?.ip ?? '',
        remote_port: connection.remote?.port ?? null,
        process: connection.process ?? '',
        pid: connection.pid,
      }

      try {
        const response = await fetch(`${API_URL}/live/investigations/lookup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!response.ok) throw new Error(`Lookup failed: ${response.status}`)

        const payload = await response.json()
        if (cancelled) return

        if (payload.found && payload.investigation) {
          setLiveInvestigationFound(true)
          setLiveInvestigationId(payload.investigation.id)
          setLiveInvestigationCreatedAt(payload.investigation.created_at ?? null)
          setLiveInvestigationUpdatedAt(payload.investigation.updated_at ?? null)
          setLiveInvestigationStatus(payload.investigation.status)
          setLiveInvestigationNotes(payload.investigation.notes ?? '')
          setLiveInvestigationAnalyst(payload.investigation.analyst ?? 'SOC Analyst')
        }
      } catch (error) {
        if (!cancelled) {
          setLiveInvestigationError(
            error instanceof Error ? error.message : 'Unable to load investigation.',
          )
        }
      } finally {
        if (!cancelled) setLiveInvestigationLoading(false)
      }
    }

    void loadInvestigation()
    return () => { cancelled = true }
  }, [selectedLiveConnection])

  useEffect(() => {
    if (!liveInvestigationId) {
      setLiveAuditEvents([])
      return
    }

    let cancelled = false

    const loadAuditEvents = async () => {
      setLiveAuditLoading(true)
      setLiveAuditError(null)

      try {
        const response = await fetch(
          `${API_URL}/live/investigations/${liveInvestigationId}/events`,
        )
        if (!response.ok) {
          throw new Error(`Audit history request failed: ${response.status}`)
        }

        const payload = await response.json()
        if (!cancelled) {
          setLiveAuditEvents(payload.events ?? [])
        }
      } catch (error) {
        if (!cancelled) {
          setLiveAuditError(
            error instanceof Error ? error.message : 'Unable to load audit history.',
          )
        }
      } finally {
        if (!cancelled) setLiveAuditLoading(false)
      }
    }

    void loadAuditEvents()
    return () => { cancelled = true }
  }, [liveInvestigationId])

  const liveAnalytics = useMemo(() => {
    const established = liveConnections.filter(
      (connection) => connection.status.toUpperCase() === 'ESTABLISHED',
    ).length

    const listening = liveConnections.filter(
      (connection) => connection.status.toUpperCase() === 'LISTEN',
    ).length

    const external = liveConnections.filter((connection) => {
      const ip = connection.remote?.ip
      if (!ip) return false

      return !(
        ip === '127.0.0.1' ||
        ip === '::1' ||
        ip.startsWith('10.') ||
        ip.startsWith('192.168.') ||
        /^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip) ||
        ip.startsWith('fe80:') ||
        ip.startsWith('fc') ||
        ip.startsWith('fd')
      )
    }).length

    const processes = new Set(
      liveConnections
        .map((connection) => connection.process)
        .filter((process): process is string => Boolean(process)),
    ).size

    return {
      total: liveConnections.length,
      established,
      listening,
      external,
      processes,
    }
  }, [liveConnections])
  const filteredLiveConnections = useMemo(() => {
    const query = liveSearch.trim().toLowerCase()

    return liveConnections.filter((connection) => {
      const searchable = [
        connection.local?.ip,
        connection.local?.port,
        connection.remote?.ip,
        connection.remote?.port,
        connection.process,
        connection.pid,
      ].some((value) => String(value ?? '').toLowerCase().includes(query))

      const protocolMatch =
        liveProtocolFilter === 'ALL' ||
        connection.protocol.toUpperCase() === liveProtocolFilter

      const statusMatch =
        liveStatusFilter === 'ALL' ||
        connection.status.toUpperCase() === liveStatusFilter

      return (!query || searchable) && protocolMatch && statusMatch
    })
  }, [liveConnections, liveSearch, liveProtocolFilter, liveStatusFilter])
  const sortedLiveConnections = useMemo(() => {
    const getValue = (connection: LiveWindowsConnection, key: string) => {
      switch (key) {
        case 'protocol': return connection.protocol
        case 'localPort': return connection.local?.port ?? -1
        case 'remotePort': return connection.remote?.port ?? -1
        case 'status': return connection.status
        case 'process': return connection.process ?? ''
        case 'pid': return connection.pid ?? -1
        default: return ''
      }
    }

    return [...filteredLiveConnections].sort((a, b) => {
      const first = getValue(a, liveSortKey)
      const second = getValue(b, liveSortKey)

      const result =
        typeof first === 'number' && typeof second === 'number'
          ? first - second
          : String(first).localeCompare(String(second), undefined, {
              numeric: true,
              sensitivity: 'base',
            })

      return liveSortDirection === 'asc' ? result : -result
    })
  }, [filteredLiveConnections, liveSortKey, liveSortDirection])
  const [trafficHistory, setTrafficHistory] = useState<TrafficSnapshot[]>([])

  const [trafficLoading, setTrafficLoading] = useState(true)

  const [trafficError, setTrafficError] = useState<string | null>(null)



  const [searchTerm, setSearchTerm] = useState('')

  const [statusFilter, setStatusFilter] = useState('ALL')

  const [protocolFilter, setProtocolFilter] = useState('ALL')

  const [threatFilter, setThreatFilter] = useState('ALL')



  const loadLiveConnections = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/live?limit=200`)
      if (!response.ok) {
        throw new Error(`Live connection API returned ${response.status}`)
      }

      const payload = await response.json() as LiveWindowsResponse
      setLiveConnections(Array.isArray(payload.connections) ? payload.connections : [])
      setLiveObservedAt(payload.observed_at ?? null)
      setLivePermissionLimited(Boolean(payload.permission_limited))
      setLiveError(null)
    } catch (err) {
      setLiveError(
        err instanceof Error ? err.message : 'Unable to load live Windows connections.',
      )
    } finally {
      setLiveLoading(false)
    }
  }, [])
  const loadLiveThreats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/live/threats?limit=200`)
      if (!response.ok) {
        throw new Error(`Threat detection API returned ${response.status}`)
      }
      const payload = await response.json() as LiveThreatResponse
      setLiveThreatData(payload)
      setLiveThreatError(null)
    } catch (err) {
      setLiveThreatError(
        err instanceof Error ? err.message : 'Unable to load threat detection results.',
      )
    } finally {
      setLiveThreatLoading(false)
    }
  }, [])
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
    void loadLiveConnections()

    const interval = window.setInterval(() => {
      void loadNetwork(true)
      void loadTrafficHistory()
    }, 60_000)

    const liveInterval = window.setInterval(() => {
      void loadLiveConnections()
      void loadLiveThreats()
    }, 30_000)

    return () => {
      window.clearInterval(interval)
      window.clearInterval(liveInterval)
    }
  }, [loadNetwork, loadTrafficHistory, loadLiveConnections, loadLiveThreats])



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



      <section className="network-panel" style={{ marginBottom: 24 }}>
        <div className="network-panel-header">
          <div>
            <div className="network-panel-title">
              Live Windows Connections
            </div>
            <div className="network-panel-subtitle">
              Actual connection-table observations collected from this Windows machine
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              color: '#34d399',
              fontSize: 11,
              fontWeight: 700,
              padding: '5px 9px',
              borderRadius: 6,
              background: 'rgba(52, 211, 153, 0.10)',
            }}>
              LIVE
            </span>
            <button
              type="button"
              onClick={() => void loadLiveConnections()}
              disabled={liveLoading}
              style={buttonStyle}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
          padding: '16px 20px',
        }}>
          {[
            { label: 'Total Connections', value: liveAnalytics.total, color: '#67e8f9' },
            { label: 'Established', value: liveAnalytics.established, color: '#34d399' },
            { label: 'Listening Ports', value: liveAnalytics.listening, color: '#a78bfa' },
            { label: 'External Remotes', value: liveAnalytics.external, color: '#fbbf24' },
            { label: 'Unique Processes', value: liveAnalytics.processes, color: '#60a5fa' },
          ].map((metric) => (
            <div
              key={metric.label}
              style={{
                padding: '16px',
                borderRadius: 10,
                background: 'rgba(148, 163, 184, 0.06)',
                border: '1px solid rgba(148, 163, 184, 0.12)',
              }}
            >
              <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 9 }}>
                {metric.label}
              </div>
              <div style={{
                color: metric.color,
                fontSize: 25,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {formatCount(metric.value)}
              </div>
            </div>
          ))}
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 12,
          padding: '14px 20px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.10)',
        }}>
          <div style={{ color: '#cbd5e1', fontSize: 13 }}>
            Observed connections: <strong style={{ color: '#67e8f9' }}>
              {formatCount(liveConnections.length)}
            </strong>
          </div>
          <div style={{ color: '#94a3b8', fontSize: 12 }}>
            Last collected: {liveObservedAt
              ? new Date(liveObservedAt).toLocaleTimeString()
              : 'Waiting for data'}
          </div>
        </div>

        {livePermissionLimited && (
          <div style={{ padding: '12px 20px', color: '#fbbf24', fontSize: 12 }}>
            Windows permissions limited the connection information available.
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 2fr) repeat(2, minmax(150px, 1fr)) auto',
          gap: 12,
          padding: '16px 20px',
          alignItems: 'center',
          borderBottom: '1px solid rgba(148, 163, 184, 0.10)',
        }}>
          <input
            type="text"
            value={liveSearch}
            onChange={(event) => setLiveSearch(event.target.value)}
            placeholder="Search IP, port, process or PID..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '11px 13px',
              borderRadius: 8,
              border: '1px solid rgba(148, 163, 184, 0.20)',
              background: 'rgba(15, 23, 42, 0.75)',
              color: '#e2e8f0',
            }}
          />
          <select
            value={liveProtocolFilter}
            onChange={(event) => setLiveProtocolFilter(event.target.value)}
            style={{
              padding: '11px 12px',
              borderRadius: 8,
              border: '1px solid rgba(148, 163, 184, 0.20)',
              background: '#111c2e',
              color: '#e2e8f0',
            }}
          >
            <option value="ALL">All Protocols</option>
            <option value="TCP">TCP</option>
            <option value="UDP">UDP</option>
          </select>
          <select
            value={liveStatusFilter}
            onChange={(event) => setLiveStatusFilter(event.target.value)}
            style={{
              padding: '11px 12px',
              borderRadius: 8,
              border: '1px solid rgba(148, 163, 184, 0.20)',
              background: '#111c2e',
              color: '#e2e8f0',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ESTABLISHED">Established</option>
            <option value="LISTEN">Listening</option>
            <option value="TIME_WAIT">Time Wait</option>
            <option value="CLOSE_WAIT">Close Wait</option>
            <option value="NONE">None (UDP)</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setLiveSearch('')
              setLiveProtocolFilter('ALL')
              setLiveStatusFilter('ALL')
            }}
            style={{
              padding: '11px 14px',
              borderRadius: 8,
              border: '1px solid rgba(103, 232, 249, 0.25)',
              background: 'rgba(103, 232, 249, 0.08)',
              color: '#67e8f9',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Clear Filters
          </button>
        </div>

        <div style={{
          padding: '11px 20px',
          color: '#94a3b8',
          fontSize: 12,
          borderBottom: '1px solid rgba(148, 163, 184, 0.10)',
        }}>
          Showing <strong style={{ color: '#67e8f9' }}>
            {formatCount(filteredLiveConnections.length)}
          </strong> of {formatCount(liveConnections.length)} live connections
        </div>
      {selectedLiveConnection && (
        <div
          id="live-connection-investigation"
          style={{
          scrollMarginTop: 24,
          margin: '16px 20px',
          padding: 20,
          borderRadius: 12,
          border: '1px solid rgba(103, 232, 249, 0.25)',
          background: 'rgba(15, 23, 42, 0.85)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            marginBottom: 18,
          }}>
            <div>
              <div style={{ color: '#67e8f9', fontSize: 11, fontWeight: 700 }}>
                LIVE CONNECTION DETAILS
              </div>
              <div style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700, marginTop: 5 }}>
                {selectedLiveConnection.process || 'Unknown process'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedLiveConnection(null)}
              style={{
                padding: '8px 13px',
                borderRadius: 7,
                border: '1px solid rgba(148, 163, 184, 0.25)',
                background: 'rgba(148, 163, 184, 0.08)',
                color: '#cbd5e1',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
          }}>
            {[
              { label: 'PROTOCOL', value: selectedLiveConnection.protocol },
              { label: 'STATUS', value: selectedLiveConnection.status || 'UNKNOWN' },
              { label: 'LOCAL IP', value: selectedLiveConnection.local?.ip ?? '—' },
              { label: 'LOCAL PORT', value: selectedLiveConnection.local?.port ?? '—' },
              { label: 'REMOTE IP', value: selectedLiveConnection.remote?.ip ?? '—' },
              { label: 'REMOTE PORT', value: selectedLiveConnection.remote?.port ?? '—' },
              { label: 'PROCESS', value: selectedLiveConnection.process ?? 'Unknown' },
              { label: 'PROCESS ID (PID)', value: selectedLiveConnection.pid ?? 'Unavailable' },
              { label: 'SOURCE', value: selectedLiveConnection.source },
              {
                label: 'OBSERVED AT',
                value: new Date(selectedLiveConnection.observed_at).toLocaleString(),
              },
            ].map((item) => (
              <div key={item.label} style={{
                padding: 12,
                borderRadius: 8,
                background: 'rgba(30, 41, 59, 0.65)',
                minWidth: 0,
              }}>
                <div style={{
                  color: '#94a3b8',
                  fontSize: 10,
                  fontWeight: 700,
                  marginBottom: 7,
                }}>
                  {item.label}
                </div>
                <div style={{
                  color: '#e2e8f0',
                  fontSize: 13,
                  overflowWrap: 'anywhere',
                }}>
                  {String(item.value)}
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 10,
            border: '1px solid rgba(103, 232, 249, 0.20)',
            background: 'rgba(8, 15, 30, 0.75)',
          }}>
            <div style={{ color: '#67e8f9', fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
              LIVE CONNECTION INVESTIGATION
            </div>

            {liveInvestigationLoading ? (
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Checking saved investigation...</div>
            ) : (
              <>
                <div style={{
                  color: liveInvestigationFound ? '#4ade80' : '#94a3b8',
                  fontSize: 12,
                  marginBottom: 14,
                }}>
                  {liveInvestigationFound ? 'Existing investigation loaded' : 'No saved investigation for this connection yet'}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 7, color: '#94a3b8', fontSize: 11, fontWeight: 700 }}>
                    INVESTIGATION STATUS
                    <select
                      value={liveInvestigationStatus}
                      onChange={(event) => setLiveInvestigationStatus(event.target.value)}
                      style={{ padding: 10, borderRadius: 7, border: '1px solid rgba(148, 163, 184, 0.25)', background: '#0f172a', color: '#e2e8f0' }}
                    >
                      <option value="Open">Open</option>
                      <option value="Under Investigation">Under Investigation</option>
                      <option value="Resolved">Resolved</option>
                      <option value="False Positive">False Positive</option>
                    </select>
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 7, color: '#94a3b8', fontSize: 11, fontWeight: 700 }}>
                    ANALYST
                    <input
                      value={liveInvestigationAnalyst}
                      onChange={(event) => setLiveInvestigationAnalyst(event.target.value)}
                      maxLength={100}
                      placeholder="Analyst name"
                      style={{ padding: 10, borderRadius: 7, border: '1px solid rgba(148, 163, 184, 0.25)', background: '#0f172a', color: '#e2e8f0' }}
                    />
                  </label>
                </div>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 7, color: '#94a3b8', fontSize: 11, fontWeight: 700, marginTop: 14 }}>
                  ANALYST NOTES
                  <textarea
                    value={liveInvestigationNotes}
                    onChange={(event) => setLiveInvestigationNotes(event.target.value)}
                    maxLength={10000}
                    rows={4}
                    placeholder="Record investigation findings, observations and actions..."
                    style={{ width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 7, border: '1px solid rgba(148, 163, 184, 0.25)', background: '#0f172a', color: '#e2e8f0', resize: 'vertical', font: 'inherit', fontSize: 13 }}
                  />
                </label>

                <div style={{
                  marginTop: 16,
                  padding: 14,
                  borderRadius: 8,
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(103, 232, 249, 0.2)',
                }}>
                  <div style={{ color: '#67e8f9', fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                    Investigation Timeline
                  </div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ color: '#4ade80', fontSize: 16 }}>●</div>
                      <div>
                        <div style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 600 }}>
                          Investigation Created
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 3 }}>
                          {liveInvestigationCreatedAt
                            ? new Date(liveInvestigationCreatedAt).toLocaleString()
                            : 'Not available'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ color: '#38bdf8', fontSize: 16 }}>●</div>
                      <div>
                        <div style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 600 }}>
                          Last Updated
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 3 }}>
                          {liveInvestigationUpdatedAt
                            ? new Date(liveInvestigationUpdatedAt).toLocaleString()
                            : 'Not available'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{
                  marginTop: 16,
                  padding: 14,
                  borderRadius: 8,
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(103, 232, 249, 0.2)',
                }}>
                  <div style={{
                    color: '#67e8f9',
                    fontSize: 13,
                    fontWeight: 700,
                    marginBottom: 12,
                  }}>
                    Investigation Audit Event History
                  </div>

                  {liveAuditLoading ? (
                    <div style={{ color: '#94a3b8', fontSize: 12 }}>
                      Loading audit events...
                    </div>
                  ) : liveAuditError ? (
                    <div style={{ color: '#f87171', fontSize: 12 }}>
                      {liveAuditError}
                    </div>
                  ) : liveAuditEvents.length === 0 ? (
                    <div style={{ color: '#94a3b8', fontSize: 12 }}>
                      No audit events recorded yet. The first event will appear after saving this investigation.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                      {liveAuditEvents.map((event) => (
                        <div key={event.id} style={{
                          padding: 12,
                          borderRadius: 7,
                          background: 'rgba(30, 41, 59, 0.55)',
                          border: '1px solid rgba(148, 163, 184, 0.14)',
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 8,
                          }}>
                            <span style={{
                              color: event.event_type === 'Created' ? '#4ade80' : '#38bdf8',
                              fontSize: 12,
                              fontWeight: 700,
                            }}>
                              {event.event_type === 'Created' ? '● CREATED' : '● UPDATED'}
                            </span>
                            <span style={{ color: '#94a3b8', fontSize: 11 }}>
                              {new Date(event.created_at).toLocaleString()}
                            </span>
                          </div>

                          <div style={{
                            color: '#e2e8f0',
                            fontSize: 12,
                            marginTop: 9,
                          }}>
                            Status: {event.previous_status
                              ? `${event.previous_status} → ${event.new_status}`
                              : event.new_status}
                          </div>

                          <div style={{
                            color: '#cbd5e1',
                            fontSize: 12,
                            marginTop: 5,
                          }}>
                            Analyst: {event.analyst}
                          </div>

                          <div style={{
                            color: '#94a3b8',
                            fontSize: 12,
                            marginTop: 7,
                            whiteSpace: 'pre-wrap',
                            overflowWrap: 'anywhere',
                          }}>
                            Notes: {event.notes || 'No notes recorded'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {liveInvestigationSavedAt && (
                  <div style={{
                    marginTop: 12,
                    padding: 11,
                    borderRadius: 7,
                    background: 'rgba(34, 197, 94, 0.10)',
                    border: '1px solid rgba(34, 197, 94, 0.25)',
                    color: '#4ade80',
                    fontSize: 12,
                  }}>
                    Investigation saved successfully at {new Date(liveInvestigationSavedAt).toLocaleTimeString()}.
                  </div>
                )}
                {liveInvestigationError && (
                  <div style={{ color: '#f87171', fontSize: 12, marginTop: 12 }}>
                    {liveInvestigationError}
                  </div>
                )}

                <button
                  type="button"
                  disabled={liveInvestigationSaving || !liveInvestigationAnalyst.trim()}
                  onClick={async () => {
                    const connection = selectedLiveConnection
                    setLiveInvestigationSaving(true)
                    setLiveInvestigationError(null)

                    try {
                      const response = await fetch(`${API_URL}/live/investigations`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          protocol: connection.protocol,
                          local_ip: connection.local?.ip ?? '',
                          local_port: connection.local?.port ?? null,
                          remote_ip: connection.remote?.ip ?? '',
                          remote_port: connection.remote?.port ?? null,
                          process: connection.process ?? '',
                          pid: connection.pid,
                          status: liveInvestigationStatus,
                          analyst: liveInvestigationAnalyst.trim(),
                          notes: liveInvestigationNotes,
                        }),
                      })

                      if (!response.ok) {
                        const detail = await response.json().catch(() => null)
                        throw new Error(detail?.detail ?? `Save failed: ${response.status}`)
                      }

                      const savedPayload = await response.json()
                      const savedAt = new Date().toISOString()
                      setLiveInvestigationId(savedPayload.investigation.id)
                      setLiveInvestigationFound(true)
                      setLiveInvestigationCreatedAt((current) => current ?? savedAt)
                      setLiveInvestigationUpdatedAt(savedAt)
                      setLiveInvestigationSavedAt(savedAt)
                      void loadLiveHistory()
                    } catch (error) {
                      setLiveInvestigationError(
                        error instanceof Error ? error.message : 'Unable to save investigation.',
                      )
                    } finally {
                      setLiveInvestigationSaving(false)
                    }
                  }}
                  style={{ marginTop: 14, padding: '10px 16px', borderRadius: 7, border: '1px solid rgba(103, 232, 249, 0.35)', background: 'rgba(8, 145, 178, 0.20)', color: '#67e8f9', fontWeight: 700, cursor: 'pointer' }}
                >
                  {liveInvestigationSaving ? 'Saving...' : 'Save Investigation'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
        {liveError ? (
          <div style={{ padding: 20, color: '#f87171', fontSize: 13 }}>
            Unable to load live connections: {liveError}
          </div>
        ) : liveLoading && liveConnections.length === 0 ? (
          <div style={{ padding: 24, color: '#94a3b8', fontSize: 13 }}>
            Collecting live Windows connections...
          </div>
        ) : liveConnections.length === 0 ? (
          <div style={{ padding: 24, color: '#94a3b8', fontSize: 13 }}>
            No live connection observations are currently available.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              minWidth: 850,
              borderCollapse: 'collapse',
              textAlign: 'left',
            }}>
              <thead>
                <tr style={{
                  color: '#94a3b8',
                  fontSize: 11,
                  borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
                }}>
                  {[
                    { label: 'PROTOCOL', key: 'protocol' },
                    { label: 'LOCAL ADDRESS', key: 'localPort' },
                    { label: 'REMOTE ADDRESS', key: 'remotePort' },
                    { label: 'STATUS', key: 'status' },
                    { label: 'PROCESS', key: 'process' },
                    { label: 'PID', key: 'pid' },
                  ].map(({ label, key }) => (
                    <th
                      key={key}
                      onClick={() => {
                        if (liveSortKey === key) {
                          setLiveSortDirection((current) => current === 'asc' ? 'desc' : 'asc')
                        } else {
                          setLiveSortKey(key)
                          setLiveSortDirection('asc')
                        }
                      }}
                      title="Click to sort"
                      style={{
                        padding: '13px 16px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      {label} {liveSortKey === key ? (liveSortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </th>
                  ))}

                </tr>
              </thead>
              <tbody>
                {sortedLiveConnections.map((connection, index) => (
                  <tr
                    key={`${connection.pid}-${connection.protocol}-${connection.local?.port}-${connection.remote?.ip}-${index}`}
                    onClick={() => setSelectedLiveConnection(connection)}
                    title="Click to view connection details"
                    style={{
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
                      color: '#cbd5e1',
                      fontSize: 12,
                    }}
                  >
                    <td style={{ padding: '13px 16px', fontWeight: 700, color: '#67e8f9' }}>
                      {connection.protocol}
                    </td>
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                      {connection.local
                        ? `${connection.local.ip}:${connection.local.port}`
                        : '—'}
                    </td>
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                      {connection.remote
                        ? `${connection.remote.ip}:${connection.remote.port}`
                        : '—'}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      {connection.status || 'UNKNOWN'}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      {connection.process || 'Unknown'}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      {connection.pid ?? '�'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="network-panel" style={{ marginBottom: 24, overflow: 'hidden' }}>
        <div className="network-panel-header">
          <div>
            <div className="network-panel-title">Live Threat Detection</div>
            <div className="network-panel-subtitle">
              Evidence-based analysis of live Windows network observations
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadLiveThreats()}
            disabled={liveThreatLoading}
            style={{
              padding: '9px 14px',
              borderRadius: 7,
              border: '1px solid rgba(103,232,249,0.3)',
              background: 'rgba(8,145,178,0.15)',
              color: '#67e8f9',
              cursor: liveThreatLoading ? 'wait' : 'pointer',
            }}
          >
            {liveThreatLoading ? 'Scanning...' : 'Refresh Threat Scan'}
          </button>
        </div>

        {liveThreatError ? (
          <div style={{ padding: 20, color: '#f87171', fontSize: 13 }}>
            Unable to load threat detection: {liveThreatError}
          </div>
        ) : liveThreatLoading && !liveThreatData ? (
          <div style={{ padding: 24, color: '#94a3b8', fontSize: 13 }}>
            Analysing live Windows connections...
          </div>
        ) : liveThreatData ? (
          <div style={{ padding: 20 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
              gap: 12,
              marginBottom: 20,
            }}>
              {[
                { label: 'Connections Scanned', value: liveThreatData.total_observed, color: '#e2e8f0' },
                { label: 'Flagged for Review', value: liveThreatData.flagged_count, color: '#fbbf24' },
                { label: 'High Risk', value: liveThreatData.flagged_connections.filter(item => item.security_analysis.risk_level === 'HIGH').length, color: '#f87171' },
                { label: 'Medium Risk', value: liveThreatData.flagged_connections.filter(item => item.security_analysis.risk_level === 'MEDIUM').length, color: '#fbbf24' },
                { label: 'Low Risk', value: liveThreatData.flagged_connections.filter(item => item.security_analysis.risk_level === 'LOW').length, color: '#60a5fa' },
              ].map(metric => (
                <div key={metric.label} style={{ padding: 15, borderRadius: 9, background: '#111c2e', border: '1px solid #263449' }}>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>{metric.label}</div>
                  <div style={{ color: metric.color, fontSize: 25, fontWeight: 700, marginTop: 5 }}>{metric.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              <div style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>Detection Findings</div>
              <div style={{ color: '#64748b', fontSize: 11 }}>
                Last scan: {new Date(liveThreatData.observed_at).toLocaleString()}
              </div>
            </div>

            {liveThreatData.flagged_connections.length === 0 ? (
              <div style={{ padding: 22, borderRadius: 9, border: '1px solid rgba(52,211,153,0.2)', background: 'rgba(16,185,129,0.06)', color: '#6ee7b7', fontSize: 13 }}>
                No connections currently require review under the configured detection rules.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760, fontSize: 12 }}>
                  <thead>
                    <tr style={{ color: '#94a3b8', textAlign: 'left', borderBottom: '1px solid #263449' }}>
                      {['Risk', 'Score', 'Process', 'Protocol', 'Local Address', 'Remote Address', 'Detection Reason'].map(header => (
                        <th key={header} style={{ padding: '12px 10px', fontWeight: 600 }}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {liveThreatData.flagged_connections.map((item, index) => {
                      const risk = item.security_analysis.risk_level
                      const riskColor = risk === 'HIGH' ? '#f87171' : risk === 'MEDIUM' ? '#fbbf24' : '#60a5fa'
                      return (
                        <tr key={`${item.pid ?? 'unknown'}-${item.protocol}-${item.local?.port ?? 0}-${item.remote?.ip ?? 'none'}-${index}`} style={{ borderBottom: '1px solid #1e293b' }}>
                          <td style={{ padding: '13px 10px' }}>
                            <span style={{ color: riskColor, background: `${riskColor}18`, border: `1px solid ${riskColor}55`, padding: '4px 8px', borderRadius: 5, fontWeight: 700, fontSize: 10 }}>{risk}</span>
                          </td>
                          <td style={{ padding: '13px 10px', color: '#e2e8f0', fontWeight: 700 }}>{item.security_analysis.risk_score}</td>
                          <td style={{ padding: '13px 10px', color: '#cbd5e1' }}>{item.process || 'Unknown'}</td>
                          <td style={{ padding: '13px 10px', color: '#cbd5e1' }}>{item.protocol}</td>
                          <td style={{ padding: '13px 10px', color: '#94a3b8' }}>{item.local ? `${item.local.ip}:${item.local.port}` : '—'}</td>
                          <td style={{ padding: '13px 10px', color: '#94a3b8' }}>{item.remote ? `${item.remote.ip}:${item.remote.port}` : '—'}</td>
                          <td style={{ padding: '13px 10px', color: '#cbd5e1', maxWidth: 320 }}>
                            {item.security_analysis.findings.map(finding => (
                              <div key={finding.rule} style={{ marginBottom: 5 }}>
                                <span style={{ color: '#67e8f9', fontWeight: 600 }}>{finding.rule}: </span>
                                {finding.reason}
                              </div>
                            ))}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: 14, color: '#64748b', fontSize: 11, lineHeight: 1.6 }}>
              Detection results are review prompts based on configured rules, not proof of malicious activity. No connections are blocked or modified automatically.
            </div>
          </div>
        ) : null}
      </section>
      <section className="network-panel" style={{ marginBottom: 24, overflow: 'hidden' }}>
        <div className="network-panel-header">
          <div>
            <div className="network-panel-title">Live Investigation History</div>
            <div className="network-panel-subtitle">
              {liveHistoryTotal} saved investigations
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadLiveHistory()}
            disabled={liveHistoryLoading}
            style={{ padding: '9px 14px', borderRadius: 7, border: '1px solid rgba(103,232,249,0.3)', background: 'rgba(8,145,178,0.15)', color: '#67e8f9', cursor: 'pointer' }}
          >
            {liveHistoryLoading ? 'Refreshing...' : 'Refresh History'}
          </button>
        </div>

        {liveHistoryError && (
          <div style={{ padding: 16, color: '#f87171', fontSize: 13 }}>
            {liveHistoryError}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, padding: '14px 16px', borderBottom: '1px solid rgba(148,163,184,0.10)' }}>
          <input
            type="text"
            value={liveHistorySearch}
            onChange={(event) => setLiveHistorySearch(event.target.value)}
            placeholder="Search IP, process, PID or analyst..."
            aria-label="Search investigation history"
            style={{ width: '100%', boxSizing: 'border-box', padding: 11, borderRadius: 8, border: '1px solid rgba(148,163,184,0.25)', background: '#0b1220', color: '#e2e8f0' }}
          />
          <select
            value={liveHistoryStatusFilter}
            onChange={(event) => setLiveHistoryStatusFilter(event.target.value)}
            aria-label="Filter investigation history by status"
            style={{ width: '100%', padding: 11, borderRadius: 8, border: '1px solid rgba(148,163,184,0.25)', background: '#0b1220', color: '#e2e8f0' }}
          >
            <option value="ALL">All investigation statuses</option>
            <option value="Open">Open</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Resolved">Resolved</option>
            <option value="False Positive">False Positive</option>
          </select>
        </div>

        <div style={{ padding: '10px 16px', color: '#94a3b8', fontSize: 12 }}>
          Showing {filteredLiveHistory.length} of {liveHistoryTotal} investigations. Select a row to reopen it.
        </div>
        {liveHistoryLoading && filteredLiveHistory.length === 0 ? (
          <div style={{ padding: 20, color: '#94a3b8', fontSize: 13 }}>Loading investigation history...</div>
        ) : filteredLiveHistory.length === 0 ? (
          <div style={{ padding: 20, color: '#94a3b8', fontSize: 13 }}>No saved investigations yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 850 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: 10, letterSpacing: 1 }}>
                  {['PROTOCOL', 'LOCAL ADDRESS', 'REMOTE ADDRESS', 'PROCESS', 'PID', 'STATUS', 'ANALYST', 'LAST UPDATED'].map((heading) => (
                    <th key={heading} style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLiveHistory.map((record) => (
                  <tr
                    key={record.id}
                    onClick={() => setSelectedLiveConnection({
                      source: 'windows_psutil',
                      observed_at: record.updated_at ?? record.created_at ?? '',
                      protocol: record.protocol,
                      local: record.local_ip ? { ip: record.local_ip, port: record.local_port ?? 0 } : null,
                      remote: record.remote_ip ? { ip: record.remote_ip, port: record.remote_port ?? 0 } : null,
                      status: 'UNKNOWN',
                      pid: record.pid,
                      process: record.process,
                    })}
                    title="Click to reopen this investigation"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        setSelectedLiveConnection({
                          source: 'windows_psutil',
                          observed_at: record.updated_at ?? record.created_at ?? '',
                          protocol: record.protocol,
                          local: record.local_ip ? { ip: record.local_ip, port: record.local_port ?? 0 } : null,
                          remote: record.remote_ip ? { ip: record.remote_ip, port: record.remote_port ?? 0 } : null,
                          status: 'UNKNOWN',
                          pid: record.pid,
                          process: record.process,
                        })
                      }
                    }}
                    style={{ borderTop: '1px solid rgba(148,163,184,0.10)', color: '#cbd5e1', fontSize: 12, cursor: 'pointer' }}
                  >
                    <td style={{ padding: '13px 14px', color: '#67e8f9', fontWeight: 700 }}>{record.protocol}</td>
                    <td style={{ padding: '13px 14px', whiteSpace: 'nowrap' }}>{record.local_ip || '—'}:{record.local_port ?? '—'}</td>
                    <td style={{ padding: '13px 14px', whiteSpace: 'nowrap' }}>{record.remote_ip || '—'}:{record.remote_port ?? '—'}</td>
                    <td style={{ padding: '13px 14px' }}>{record.process || 'Unknown'}</td>
                    <td style={{ padding: '13px 14px' }}>{record.pid ?? '—'}</td>
                    <td style={{ padding: '13px 14px', whiteSpace: 'nowrap' }}>{record.status}</td>
                    <td style={{ padding: '13px 14px' }}>{record.analyst}</td>
                    <td style={{ padding: '13px 14px', whiteSpace: 'nowrap' }}>{record.updated_at ? new Date(record.updated_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
