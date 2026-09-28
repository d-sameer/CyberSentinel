import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Clock3,
  ExternalLink,
  FileSearch,
  Globe,
  LockKeyhole,
  Network,
  Server,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  UserRound,
} from 'lucide-react'

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO'

type EventDetail = {
  id: string
  title: string
  description: string
  severity: Severity
  status: string
  timestamp: string
  date: string
  asset: string
  source: string
  category: string
  confidence: number
  rule: string
  ruleId: string
  mitre: string
  mitreId: string
  sourceIp: string
  destinationIp: string
  destinationPort: string
  protocol: string
  process: string
  processPath: string
  user: string
  parentProcess: string
  alertId: string | null
  incidentId: string | null
  timeline: {
    time: string
    title: string
    description: string
  }[]
  assessment: string
}

type ApiEvent = {
  id: number
  event_id: string
  title: string
  description: string
  severity: Severity
  status: string
  category: string
  asset: string
  source: string
  confidence: number
  timestamp: string
}

type ResponseAction = {
  id: number
  action_id: string
  event_id: string
  action: string
  status: string
  analyst: string
  created_at: string
}

const eventDetails: Record<string, EventDetail> = {
  'EVT-1048': {
    id: 'EVT-1048',
    title: 'Malicious outbound connection detected',
    description:
      'A suspicious outbound HTTPS connection was detected from an endpoint running PowerShell. The connection was correlated with process telemetry and a high-confidence detection rule.',
    severity: 'CRITICAL',
    status: 'INVESTIGATING',
    timestamp: '22:41:08',
    date: '2026-09-27',
    asset: 'WIN-01',
    source: 'Network Sensor',
    category: 'Network',
    confidence: 98,
    rule: 'Suspicious Outbound Connection',
    ruleId: 'DET-005',
    mitre: 'Application Layer Protocol',
    mitreId: 'T1071.001',
    sourceIp: '192.168.1.101',
    destinationIp: '185.199.108.153',
    destinationPort: '443',
    protocol: 'HTTPS',
    process: 'powershell.exe',
    processPath:
      'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
    user: 'sameer',
    parentProcess: 'explorer.exe',
    alertId: 'ALT-018',
    incidentId: 'INC-003',
    timeline: [
      {
        time: '22:40:58',
        title: 'Process started',
        description: 'powershell.exe was launched by explorer.exe.',
      },
      {
        time: '22:41:02',
        title: 'Outbound connection observed',
        description:
          'The endpoint initiated an HTTPS connection to the external destination.',
      },
      {
        time: '22:41:05',
        title: 'Detection rule matched',
        description:
          'Suspicious outbound communication matched detection rule DET-005.',
      },
      {
        time: '22:41:08',
        title: 'SOC event generated',
        description:
          'The event was promoted to critical severity for analyst investigation.',
      },
    ],
    assessment:
      'The event contains multiple correlated indicators: PowerShell execution, external HTTPS communication, and a high-confidence detection match. Analyst review is required to determine whether the connection represents malicious command-and-control activity.',
  },

  'EVT-1047': {
    id: 'EVT-1047',
    title: 'PowerShell execution policy bypass',
    description:
      'PowerShell execution was observed with indicators consistent with an execution policy bypass.',
    severity: 'HIGH',
    status: 'ALERTED',
    timestamp: '22:41:05',
    date: '2026-09-27',
    asset: 'WIN-02',
    source: 'Endpoint Agent',
    category: 'Execution',
    confidence: 94,
    rule: 'PowerShell Execution Policy Bypass',
    ruleId: 'DET-001',
    mitre: 'PowerShell',
    mitreId: 'T1059.001',
    sourceIp: '192.168.1.102',
    destinationIp: '10.0.0.25',
    destinationPort: '443',
    protocol: 'HTTPS',
    process: 'powershell.exe',
    processPath:
      'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
    user: 'sameer',
    parentProcess: 'cmd.exe',
    alertId: 'ALT-021',
    incidentId: 'INC-001',
    timeline: [
      {
        time: '22:40:57',
        title: 'Command shell activity detected',
        description: 'cmd.exe initiated PowerShell execution.',
      },
      {
        time: '22:41:01',
        title: 'Policy bypass observed',
        description: 'PowerShell execution contained policy bypass indicators.',
      },
      {
        time: '22:41:05',
        title: 'Security event generated',
        description: 'Endpoint telemetry generated a high-severity event.',
      },
    ],
    assessment:
      'The PowerShell execution contains behavior associated with bypassing normal execution restrictions. The command line and parent-child process relationship should be reviewed.',
  },

  'EVT-1046': {
    id: 'EVT-1046',
    title: 'Multiple authentication failures',
    description:
      'Repeated authentication failures were detected against an RDP service.',
    severity: 'MEDIUM',
    status: 'BLOCKED',
    timestamp: '22:40:59',
    date: '2026-09-27',
    asset: 'WIN-02',
    source: 'Identity Monitor',
    category: 'Identity',
    confidence: 91,
    rule: 'Multiple Authentication Failures',
    ruleId: 'DET-003',
    mitre: 'Brute Force',
    mitreId: 'T1110',
    sourceIp: '10.0.0.45',
    destinationIp: '192.168.1.102',
    destinationPort: '3389',
    protocol: 'RDP',
    process: 'svchost.exe',
    processPath: 'C:\\Windows\\System32\\svchost.exe',
    user: 'admin',
    parentProcess: 'services.exe',
    alertId: 'ALT-007',
    incidentId: 'INC-002',
    timeline: [
      {
        time: '22:40:45',
        title: 'Authentication failures detected',
        description: 'Repeated failed RDP authentication attempts were recorded.',
      },
      {
        time: '22:40:52',
        title: 'Threshold reached',
        description:
          'The number of authentication failures exceeded the detection threshold.',
      },
      {
        time: '22:40:59',
        title: 'Connection blocked',
        description:
          'Security controls blocked the suspicious authentication source.',
      },
    ],
    assessment:
      'The repeated authentication failures are consistent with password-guessing activity. The source system and authentication logs should be reviewed for additional attempts.',
  },

  'EVT-1045': {
    id: 'EVT-1045',
    title: 'Unsigned process execution detected',
    description:
      'An unsigned executable was observed running from a non-standard location.',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    timestamp: '22:40:54',
    date: '2026-09-27',
    asset: 'WIN-04',
    source: 'EDR Sensor',
    category: 'Process',
    confidence: 89,
    rule: 'Unsigned Process Execution',
    ruleId: 'DET-008',
    mitre: 'Masquerading',
    mitreId: 'T1036',
    sourceIp: '192.168.1.104',
    destinationIp: '203.0.113.77',
    destinationPort: '443',
    protocol: 'HTTPS',
    process: 'svchost-helper.exe',
    processPath: 'C:\\Users\\Public\\svchost-helper.exe',
    user: 'john.doe',
    parentProcess: 'explorer.exe',
    alertId: 'ALT-031',
    incidentId: 'INC-006',
    timeline: [
      {
        time: '22:40:42',
        title: 'Executable created',
        description: 'A new executable appeared in the Public directory.',
      },
      {
        time: '22:40:48',
        title: 'Unsigned binary executed',
        description: 'EDR telemetry detected execution of the unsigned file.',
      },
      {
        time: '22:40:54',
        title: 'SOC event generated',
        description: 'The event was escalated for analyst investigation.',
      },
    ],
    assessment:
      'The executable uses a system-like process name while running from a non-standard location. File reputation, hash information, and parent process activity should be investigated.',
  },

  'EVT-1044': {
    id: 'EVT-1044',
    title: 'Endpoint heartbeat received',
    description:
      'A normal endpoint heartbeat was received from the CyberSentinel agent.',
    severity: 'INFO',
    status: 'NORMAL',
    timestamp: '22:40:48',
    date: '2026-09-27',
    asset: 'WIN-03',
    source: 'Endpoint Agent',
    category: 'System',
    confidence: 100,
    rule: 'Endpoint Heartbeat',
    ruleId: 'SYS-001',
    mitre: 'System Monitoring',
    mitreId: 'N/A',
    sourceIp: '192.168.1.103',
    destinationIp: '192.168.1.10',
    destinationPort: '443',
    protocol: 'HTTPS',
    process: 'CyberSentinelAgent.exe',
    processPath: 'C:\\Program Files\\CyberSentinel\\Agent.exe',
    user: 'SYSTEM',
    parentProcess: 'services.exe',
    alertId: null,
    incidentId: null,
    timeline: [
      {
        time: '22:40:48',
        title: 'Heartbeat received',
        description: 'CyberSentinelAgent reported healthy endpoint status.',
      },
    ],
    assessment:
      'No suspicious indicators were identified. The event represents normal endpoint telemetry.',
  },

  'EVT-1043': {
    id: 'EVT-1043',
    title: 'Security file deletion attempt',
    description:
      'A protected security-related file deletion attempt was detected and blocked.',
    severity: 'HIGH',
    status: 'BLOCKED',
    timestamp: '22:40:42',
    date: '2026-09-27',
    asset: 'WIN-02',
    source: 'File Integrity',
    category: 'Defense Evasion',
    confidence: 96,
    rule: 'Protected File Deletion',
    ruleId: 'DET-011',
    mitre: 'Indicator Removal',
    mitreId: 'T1070',
    sourceIp: '192.168.1.102',
    destinationIp: '192.168.1.102',
    destinationPort: 'N/A',
    protocol: 'Local',
    process: 'cmd.exe',
    processPath: 'C:\\Windows\\System32\\cmd.exe',
    user: 'sameer',
    parentProcess: 'explorer.exe',
    alertId: 'ALT-034',
    incidentId: 'INC-007',
    timeline: [
      {
        time: '22:40:35',
        title: 'Deletion request observed',
        description: 'A protected file deletion operation was attempted.',
      },
      {
        time: '22:40:42',
        title: 'Operation blocked',
        description: 'File integrity controls prevented the deletion.',
      },
    ],
    assessment:
      'The blocked deletion attempt may indicate an attempt to remove security-related artifacts. Review the affected file and surrounding process activity.',
  },

  'EVT-1042': {
    id: 'EVT-1042',
    title: 'New administrative group membership',
    description:
      'A user account was added to an administrative security group.',
    severity: 'MEDIUM',
    status: 'REVIEW',
    timestamp: '22:40:36',
    date: '2026-09-27',
    asset: 'WIN-03',
    source: 'Identity Monitor',
    category: 'Privilege',
    confidence: 87,
    rule: 'Administrative Group Change',
    ruleId: 'DET-014',
    mitre: 'Account Manipulation',
    mitreId: 'T1098',
    sourceIp: '192.168.1.103',
    destinationIp: '192.168.1.103',
    destinationPort: 'N/A',
    protocol: 'Local',
    process: 'net.exe',
    processPath: 'C:\\Windows\\System32\\net.exe',
    user: 'administrator',
    parentProcess: 'cmd.exe',
    alertId: 'ALT-037',
    incidentId: null,
    timeline: [
      {
        time: '22:40:29',
        title: 'Group membership changed',
        description: 'An account was added to an administrative group.',
      },
      {
        time: '22:40:36',
        title: 'Identity event generated',
        description: 'The privilege change was sent to the SOC.',
      },
    ],
    assessment:
      'Administrative group changes should be validated against an approved access request or administrative activity.',
  },

  'EVT-1041': {
    id: 'EVT-1041',
    title: 'New external DNS request observed',
    description:
      'A new external DNS request was observed from a Linux endpoint.',
    severity: 'MEDIUM',
    status: 'MONITORED',
    timestamp: '22:40:31',
    date: '2026-09-27',
    asset: 'LINUX-01',
    source: 'Network Sensor',
    category: 'Network',
    confidence: 82,
    rule: 'New External DNS Request',
    ruleId: 'NET-004',
    mitre: 'Application Layer Protocol',
    mitreId: 'T1071',
    sourceIp: '192.168.1.110',
    destinationIp: '8.8.8.8',
    destinationPort: '53',
    protocol: 'DNS',
    process: 'systemd-resolved',
    processPath: '/usr/lib/systemd/systemd-resolved',
    user: 'root',
    parentProcess: 'systemd',
    alertId: null,
    incidentId: null,
    timeline: [
      {
        time: '22:40:31',
        title: 'DNS request observed',
        description: 'An external DNS request was detected from the endpoint.',
      },
    ],
    assessment:
      'The DNS activity is currently being monitored. Additional correlation is required before determining whether the destination is suspicious.',
  },
}

function severityClass(severity: Severity) {
  return `soc-event-badge soc-event-badge-${severity.toLowerCase()}`
}

function responseActionTone(action: string) {
  const normalized = action.toUpperCase()

  if (normalized === 'MARK_REVIEWED') {
    return {
      color: '#22c55e',
      background: 'rgba(34, 197, 94, 0.08)',
      border: 'rgba(34, 197, 94, 0.18)',
    }
  }

  if (normalized === 'ESCALATE') {
    return {
      color: '#f59e0b',
      background: 'rgba(245, 158, 11, 0.08)',
      border: 'rgba(245, 158, 11, 0.18)',
    }
  }

  if (normalized === 'ISOLATE_ASSET') {
    return {
      color: '#ef4444',
      background: 'rgba(239, 68, 68, 0.08)',
      border: 'rgba(239, 68, 68, 0.18)',
    }
  }

  return {
    color: '#38bdf8',
    background: 'rgba(56, 189, 248, 0.08)',
    border: 'rgba(56, 189, 248, 0.18)',
  }
}

function formatActionTimestamp(timestamp: string) {
  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return timestamp
  }

  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function statusClass(status: string) {
  const normalized = status.toLowerCase()

  if (normalized === 'normal' || normalized === 'monitored') {
    return 'soc-event-badge soc-event-badge-normal'
  }

  if (normalized === 'blocked') {
    return 'soc-event-badge soc-event-badge-normal'
  }

  if (normalized === 'investigating' || normalized === 'alerted') {
    return 'soc-event-badge soc-event-badge-high'
  }

  return 'soc-event-badge soc-event-badge-info'
}

function SOCEventDetails() {
  const { eventId } = useParams()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [apiConnected, setApiConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [responseActions, setResponseActions] = useState<ResponseAction[]>([])

  useEffect(() => {
    let cancelled = false

    async function loadEvent() {
      if (!eventId) {
        setEvent(null)
        setApiConnected(false)
        setLoading(false)
        return
      }

      const fallbackEvent = eventDetails[eventId]

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/events/${eventId}`,
        )

        if (!response.ok) {
          throw new Error('SOC event API request failed')
        }

        const apiEvent: ApiEvent = await response.json()

        if (cancelled) {
          return
        }

        const apiDate = new Date(apiEvent.timestamp)
        const time = Number.isNaN(apiDate.getTime())
          ? fallbackEvent?.timestamp ?? 'N/A'
          : apiDate.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            })

        const date = Number.isNaN(apiDate.getTime())
          ? fallbackEvent?.date ?? 'N/A'
          : apiEvent.timestamp.slice(0, 10)

        const mergedEvent: EventDetail = {
          ...(fallbackEvent ?? {
            id: apiEvent.event_id,
            title: apiEvent.title,
            description: apiEvent.description,
            severity: apiEvent.severity,
            status: apiEvent.status,
            timestamp: time,
            date,
            asset: apiEvent.asset,
            source: apiEvent.source,
            category: apiEvent.category,
            confidence: apiEvent.confidence,
            rule: 'Backend Event',
            ruleId: 'N/A',
            mitre: 'Not available',
            mitreId: 'N/A',
            sourceIp: 'N/A',
            destinationIp: 'N/A',
            destinationPort: 'N/A',
            protocol: 'N/A',
            process: 'N/A',
            processPath: 'N/A',
            user: 'N/A',
            parentProcess: 'N/A',
            alertId: null,
            incidentId: null,
            timeline: [],
            assessment:
              'Detailed investigation context is not available from the backend for this event yet.',
          }),
          id: apiEvent.event_id,
          title: apiEvent.title,
          description: apiEvent.description,
          severity: apiEvent.severity,
          status: apiEvent.status,
          timestamp: time,
          date,
          asset: apiEvent.asset,
          source: apiEvent.source,
          category: apiEvent.category,
          confidence: apiEvent.confidence,
        }

        setEvent(mergedEvent)
        setApiConnected(true)
      } catch {
        if (cancelled) {
          return
        }

        setEvent(fallbackEvent ?? null)
        setApiConnected(false)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadEvent()

    return () => {
      cancelled = true
    }
  }, [eventId])

  useEffect(() => {
    if (eventId) {
      loadResponseActions(eventId)
    } else {
      setResponseActions([])
    }
  }, [eventId])

  async function loadResponseActions(currentEventId: string) {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/events/${currentEventId}/actions`,
      )

      if (!response.ok) {
        throw new Error('Response action API request failed')
      }

      const actions: ResponseAction[] = await response.json()
      setResponseActions(actions)
    } catch {
      setResponseActions([])
    }
  }

  if (loading) {
    return (
      <div className="soc-event-page">
        <Link to="/soc" className="soc-event-back">
          <ArrowLeft size={16} />
          Back to SOC Command Center
        </Link>

        <div className="soc-event-card">
          <div className="soc-event-card-body">
            <div className="soc-event-empty">
              Loading SOC event...
            </div>
          </div>
        </div>
      </div>
    )
  }

  async function runResponseAction(action: string) {
    if (!eventId || actionLoading) {
      return
    }

    setActionLoading(true)
    setActionMessage('')
    setActionError('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/events/${eventId}/actions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action,
            analyst: 'SOC Analyst',
          }),
        },
      )

      if (!response.ok) {
        throw new Error('Response action failed')
      }

      const result: ResponseAction = await response.json()
      setActionMessage(
        `${result.action.replaceAll('_', ' ')} logged successfully · ${result.status}`,
      )
      await loadResponseActions(eventId)
    } catch {
      setActionError(
        'Unable to submit the response action. Make sure the backend API is running.',
      )
    } finally {
      setActionLoading(false)
    }
  }

  if (!event) {
    return (
      <div className="soc-event-page">
        <Link to="/soc" className="soc-event-back">
          <ArrowLeft size={16} />
          Back to SOC Command Center
        </Link>

        <div className="soc-event-card">
          <div className="soc-event-card-body">
            <div className="soc-event-empty">
              SOC event not found.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="soc-event-page">

      <Link to="/soc" className="soc-event-back">
        <ArrowLeft size={16} />
        Back to SOC Command Center
      </Link>

      {/* HERO */}
      <section className="soc-event-hero">
        <div className="soc-event-hero-main">

          <div className="soc-event-title-wrap">
            <div className="soc-event-icon">
              {event.category === 'Network' ? (
                <Globe size={23} />
              ) : event.category === 'Identity' ? (
                <UserRound size={23} />
              ) : event.category === 'Process' ||
                event.category === 'Execution' ? (
                <Terminal size={23} />
              ) : event.category === 'Defense Evasion' ? (
                <ShieldAlert size={23} />
              ) : (
                <Activity size={23} />
              )}
            </div>

            <div>
              <div className="soc-event-eyebrow">
                SOC EVENT INVESTIGATION · {event.id}
                <span
                  className={
                    apiConnected
                      ? 'soc-event-api-status'
                      : 'soc-event-api-status soc-event-api-status-demo'
                  }
                >
                  <span />
                  {apiConnected ? 'API CONNECTED' : 'DEMO DATA'}
                </span>
              </div>

              <h1 className="soc-event-title">
                {event.title}
              </h1>

              <p className="soc-event-description">
                {event.description}
              </p>
            </div>
          </div>

          <div className="soc-event-badges">
            <span className={severityClass(event.severity)}>
              {event.severity}
            </span>

            <span className={statusClass(event.status)}>
              {event.status}
            </span>
          </div>
        </div>

        <div className="soc-event-metrics">

          <div className="soc-event-metric">
            <div className="soc-event-metric-label">
              Event Time
            </div>
            <div className="soc-event-metric-value">
              {event.timestamp} · {event.date}
            </div>
          </div>

          <div className="soc-event-metric">
            <div className="soc-event-metric-label">
              Affected Asset
            </div>
            <div className="soc-event-metric-value">
              {event.asset}
            </div>
          </div>

          <div className="soc-event-metric">
            <div className="soc-event-metric-label">
              Detection Confidence
            </div>
            <div className="soc-event-metric-value">
              {event.confidence}%
            </div>
          </div>

          <div className="soc-event-metric">
            <div className="soc-event-metric-label">
              Category
            </div>
            <div className="soc-event-metric-value">
              {event.category}
            </div>
          </div>

        </div>
      </section>

      <div className="soc-event-grid">

        {/* LEFT */}
        <div className="soc-event-column">

          {/* NETWORK */}
          <section className="soc-event-card">
            <div className="soc-event-card-header">
              <h2 className="soc-event-card-title">
                <Network size={16} />
                Network Context
              </h2>
            </div>

            <div className="soc-event-card-body">
              <div className="soc-event-detail-grid">

                <div className="soc-event-detail-item">
                  <div className="soc-event-detail-label">
                    Source IP
                  </div>
                  <div className="soc-event-detail-value">
                    {event.sourceIp}
                  </div>
                </div>

                <div className="soc-event-detail-item">
                  <div className="soc-event-detail-label">
                    Destination IP
                  </div>
                  <div className="soc-event-detail-value">
                    {event.destinationIp}
                  </div>
                </div>

                <div className="soc-event-detail-item">
                  <div className="soc-event-detail-label">
                    Destination Port
                  </div>
                  <div className="soc-event-detail-value">
                    {event.destinationPort}
                  </div>
                </div>

                <div className="soc-event-detail-item">
                  <div className="soc-event-detail-label">
                    Protocol
                  </div>
                  <div className="soc-event-detail-value">
                    {event.protocol}
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* PROCESS */}
          <section className="soc-event-card">
            <div className="soc-event-card-header">
              <h2 className="soc-event-card-title">
                <Terminal size={16} />
                Process Telemetry
              </h2>
            </div>

            <div className="soc-event-card-body">

              <div className="soc-event-detail-grid">

                <div className="soc-event-detail-item">
                  <div className="soc-event-detail-label">
                    Process
                  </div>
                  <div className="soc-event-detail-value">
                    {event.process}
                  </div>
                </div>

                <div className="soc-event-detail-item">
                  <div className="soc-event-detail-label">
                    User
                  </div>
                  <div className="soc-event-detail-value">
                    {event.user}
                  </div>
                </div>

                <div className="soc-event-detail-item">
                  <div className="soc-event-detail-label">
                    Parent Process
                  </div>
                  <div className="soc-event-detail-value">
                    {event.parentProcess}
                  </div>
                </div>

                <div className="soc-event-detail-item">
                  <div className="soc-event-detail-label">
                    Process Path
                  </div>
                  <div className="soc-event-detail-value">
                    {event.processPath}
                  </div>
                </div>

              </div>

              <div style={{ marginTop: '14px' }}>
                <code className="soc-event-code">
                  {event.process}
                </code>
              </div>

            </div>
          </section>

          {/* DETECTION */}
          <section className="soc-event-card">
            <div className="soc-event-card-header">
              <h2 className="soc-event-card-title">
                <ShieldCheck size={16} />
                Detection Context
              </h2>
            </div>

            <div className="soc-event-card-body">

              <div className="soc-event-detail-grid">

                <div className="soc-event-detail-item">
                  <div className="soc-event-detail-label">
                    Detection Rule
                  </div>
                  <div className="soc-event-detail-value">
                    {event.rule}
                  </div>
                </div>

                <div className="soc-event-detail-item">
                  <div className="soc-event-detail-label">
                    Rule ID
                  </div>
                  <div className="soc-event-detail-value">
                    {event.ruleId}
                  </div>
                </div>

                <div className="soc-event-detail-item">
                  <div className="soc-event-detail-label">
                    MITRE ATT&CK
                  </div>
                  <div className="soc-event-detail-value">
                    {event.mitre}
                  </div>
                </div>

                <div className="soc-event-detail-item">
                  <div className="soc-event-detail-label">
                    Technique ID
                  </div>
                  <div className="soc-event-detail-value">
                    {event.mitreId}
                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* TIMELINE */}
          <section className="soc-event-card">
            <div className="soc-event-card-header">
              <h2 className="soc-event-card-title">
                <Clock3 size={16} />
                Investigation Timeline
              </h2>
            </div>

            <div className="soc-event-card-body">
              <div className="soc-event-timeline">

                {event.timeline.map((item) => (
                  <div
                    className="soc-event-timeline-item"
                    key={`${event.id}-${item.time}`}
                  >
                    <div className="soc-event-timeline-track">
                      <div className="soc-event-timeline-dot" />
                    </div>

                    <div className="soc-event-timeline-content">
                      <div className="soc-event-timeline-time">
                        {item.time}
                      </div>

                      <div className="soc-event-timeline-title">
                        {item.title}
                      </div>

                      <div className="soc-event-timeline-description">
                        {item.description}
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </section>

        </div>

        {/* RIGHT */}
        <div className="soc-event-column">

          {/* SECURITY CONTEXT */}
          <section className="soc-event-card">
            <div className="soc-event-card-header">
              <h2 className="soc-event-card-title">
                <LockKeyhole size={16} />
                Security Context
              </h2>
            </div>

            <div className="soc-event-card-body">

              <div className="soc-event-related-list">

                {event.alertId && (
                  <div className="soc-event-related-item">
                    <div className="soc-event-related-type">
                      Alert
                    </div>

                    <Link
                      to={`/alerts/${event.alertId}`}
                      className="soc-event-related-value"
                    >
                      {event.alertId}
                      <ExternalLink
                        size={11}
                        style={{ marginLeft: '4px' }}
                      />
                    </Link>
                  </div>
                )}

                {event.incidentId && (
                  <div className="soc-event-related-item">
                    <div className="soc-event-related-type">
                      Incident
                    </div>

                    <Link
                      to={`/incidents/${event.incidentId}`}
                      className="soc-event-related-value"
                    >
                      {event.incidentId}
                      <ExternalLink
                        size={11}
                        style={{ marginLeft: '4px' }}
                      />
                    </Link>
                  </div>
                )}

                <div className="soc-event-related-item">
                  <div className="soc-event-related-type">
                    Endpoint
                  </div>

                  <Link
                    to={`/endpoints/${event.asset}`}
                    className="soc-event-related-value"
                  >
                    {event.asset}
                  </Link>
                </div>

                <div className="soc-event-related-item">
                  <div className="soc-event-related-type">
                    Detection Rule
                  </div>

                  <Link
                    to={`/detection-rules/${event.ruleId}`}
                    className="soc-event-related-value"
                  >
                    {event.ruleId}
                  </Link>
                </div>

              </div>

            </div>
          </section>

          {/* RISK */}
          <section className="soc-event-card">
            <div className="soc-event-card-header">
              <h2 className="soc-event-card-title">
                <AlertTriangle size={16} />
                Risk Indicators
              </h2>
            </div>

            <div className="soc-event-card-body">

              <div className="soc-event-timeline">

                <div className="soc-event-timeline-item">
                  <div className="soc-event-timeline-track">
                    <div className="soc-event-timeline-dot" />
                  </div>

                  <div className="soc-event-timeline-content">
                    <div className="soc-event-timeline-title">
                      Telemetry successfully correlated
                    </div>
                  </div>
                </div>

                <div className="soc-event-timeline-item">
                  <div className="soc-event-timeline-track">
                    <div className="soc-event-timeline-dot" />
                  </div>

                  <div className="soc-event-timeline-content">
                    <div className="soc-event-timeline-title">
                      Detection confidence is {event.confidence}%
                    </div>
                  </div>
                </div>

                <div className="soc-event-timeline-item">
                  <div className="soc-event-timeline-track">
                    <div className="soc-event-timeline-dot" />
                  </div>

                  <div className="soc-event-timeline-content">
                    <div className="soc-event-timeline-title">
                      {event.category} activity observed
                    </div>
                  </div>
                </div>

                <div className="soc-event-timeline-item">
                  <div className="soc-event-timeline-track">
                    <div className="soc-event-timeline-dot" />
                  </div>

                  <div className="soc-event-timeline-content">
                    <div className="soc-event-timeline-title">
                      Event requires analyst review
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* ASSESSMENT */}
          <section className="soc-event-card">
            <div className="soc-event-card-header">
              <h2 className="soc-event-card-title">
                <FileSearch size={16} />
                Analyst Assessment
              </h2>
            </div>

            <div className="soc-event-card-body">
              <div className="soc-event-assessment">
                <div className="soc-event-assessment-title">
                  Analyst Assessment
                </div>

                <p className="soc-event-assessment-text">
                  {event.assessment}
                </p>
              </div>
            </div>
          </section>

          {/* WORKFLOW */}
          <section className="soc-event-card">
            <div className="soc-event-card-header">
              <h2 className="soc-event-card-title">
                <Server size={16} />
                Response Workflow
              </h2>
            </div>

            <div className="soc-event-card-body">

              <div
                className="soc-event-actions"
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  gap: '12px',
                  flexWrap: 'wrap',
                  width: '100%',
                }}
              >

                <button
                  className="soc-event-action soc-event-action-primary"
                  type="button"
                  disabled={actionLoading}
                  onClick={() => runResponseAction('MARK_REVIEWED')}
                  style={{
                    minWidth: '160px',
                    minHeight: '42px',
                    padding: '0 16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                    flex: '0 0 auto',
                    borderRadius: '8px',
                  }}
                >
                  <ShieldCheck size={15} />
                  {actionLoading ? 'Submitting...' : 'Mark Reviewed'}
                </button>

                <button
                  className="soc-event-action"
                  type="button"
                  disabled={actionLoading}
                  onClick={() => runResponseAction('ESCALATE')}
                  style={{
                    minWidth: '125px',
                    minHeight: '42px',
                    padding: '0 16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                    flex: '0 0 auto',
                    borderRadius: '8px',
                    borderColor: 'rgba(245, 158, 11, 0.28)',
                    background: 'rgba(245, 158, 11, 0.06)',
                    color: '#f59e0b',
                  }}
                >
                  <Activity size={15} />
                  Escalate
                </button>

                <button
                  className="soc-event-action soc-event-action-danger"
                  type="button"
                  disabled={actionLoading}
                  onClick={() => runResponseAction('ISOLATE_ASSET')}
                  style={{
                    minWidth: '155px',
                    minHeight: '42px',
                    padding: '0 16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                    flex: '0 0 auto',
                    borderRadius: '8px',
                  }}
                >
                  <AlertTriangle size={15} />
                  Isolate Asset
                </button>

              </div>

              {actionMessage && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '14px',
                    padding: '10px 12px',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    borderRadius: '8px',
                    background: 'rgba(34, 197, 94, 0.06)',
                    color: '#22c55e',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  <ShieldCheck size={14} />
                  {actionMessage}
                </div>
              )}

              {actionError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '14px',
                    padding: '10px 12px',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.06)',
                    color: '#ef4444',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  <AlertTriangle size={14} />
                  {actionError}
                </div>
              )}

              {responseActions.length > 0 && (
                <div
                  style={{
                    marginTop: '18px',
                    borderTop: '1px solid rgba(148, 163, 184, 0.12)',
                    paddingTop: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      marginBottom: '12px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: '#e2e8f0',
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Response Action History
                      </div>
                      <div
                        style={{
                          marginTop: '3px',
                          color: '#64748b',
                          fontSize: '10px',
                        }}
                      >
                        Latest persisted SOC response actions
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '4px 7px',
                        border: '1px solid rgba(56, 189, 248, 0.18)',
                        borderRadius: '999px',
                        background: 'rgba(56, 189, 248, 0.06)',
                        color: '#38bdf8',
                        fontSize: '9px',
                        fontWeight: 700,
                      }}
                    >
                      {responseActions.length} TOTAL
                    </span>
                  </div>

                  {responseActions.slice(0, 5).map((item) => {
                    const tone = responseActionTone(item.action)

                    return (
                      <div
                        key={item.action_id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '30px minmax(0, 1fr)',
                          columnGap: '10px',
                          rowGap: '8px',
                          alignItems: 'start',
                          padding: '12px',
                          marginBottom: '8px',
                          border: '1px solid rgba(148, 163, 184, 0.10)',
                          borderRadius: '9px',
                          background: 'rgba(15, 23, 42, 0.45)',
                        }}
                      >
                        <div
                          style={{
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: '0 0 auto',
                            border: `1px solid ${tone.border}`,
                            borderRadius: '8px',
                            background: tone.background,
                            color: tone.color,
                            gridColumn: '1',
                            gridRow: '1',
                          }}
                        >
                          {item.action === 'MARK_REVIEWED' ? (
                            <ShieldCheck size={14} />
                          ) : item.action === 'ESCALATE' ? (
                            <Activity size={14} />
                          ) : (
                            <AlertTriangle size={14} />
                          )}
                        </div>

                        <div
                          style={{
                            minWidth: 0,
                            gridColumn: '2',
                            gridRow: '1',
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                color: '#e2e8f0',
                                fontSize: '11px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.action.replaceAll('_', ' ')}
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '3px',
                                marginTop: '5px',
                                color: '#64748b',
                                fontSize: '10px',
                                lineHeight: 1.45,
                              }}
                            >
                              <span>{item.analyst}</span>
                              <span>{formatActionTimestamp(item.created_at)}</span>
                              <span style={{ color: '#475569' }}>{item.action_id}</span>
                            </div>
                          </div>
                        </div>

                        <span
                          style={{
                            gridColumn: '2',
                            gridRow: '2',
                            justifySelf: 'start',
                            display: 'inline-flex',
                            alignItems: 'center',
                            width: 'fit-content',
                            padding: '5px 8px',
                            border: `1px solid ${tone.border}`,
                            borderRadius: '999px',
                            background: tone.background,
                            color: tone.color,
                            fontSize: '9px',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

            </div>
          </section>

        </div>

      </div>
    </div>
  )
}

export default SOCEventDetails