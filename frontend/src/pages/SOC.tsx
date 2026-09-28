import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Clock3,
  Globe,
  Monitor,
  Network,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Users,
} from 'lucide-react'

type SecurityEvent = {
  id: number
  event_id: string
  title: string
  description: string
  severity: string
  status: string
  category: string
  asset: string
  source: string
  confidence: number
  timestamp: string
}

const fallbackEvents: SecurityEvent[] = [
  {
    id: 1,
    event_id: 'EVT-1048',
    title: 'Malicious outbound connection detected',
    description:
      'A suspicious outbound HTTPS connection was detected from an endpoint running PowerShell.',
    severity: 'CRITICAL',
    status: 'INVESTIGATING',
    category: 'Network',
    asset: 'WIN-01',
    source: 'Network Sensor',
    confidence: 98,
    timestamp: '2026-09-27T22:41:08',
  },
  {
    id: 2,
    event_id: 'EVT-1047',
    title: 'PowerShell execution policy bypass',
    description:
      'PowerShell execution was observed with indicators consistent with an execution policy bypass.',
    severity: 'HIGH',
    status: 'ALERTED',
    category: 'Execution',
    asset: 'WIN-02',
    source: 'Endpoint Agent',
    confidence: 94,
    timestamp: '2026-09-27T22:41:05',
  },
  {
    id: 3,
    event_id: 'EVT-1046',
    title: 'Multiple authentication failures',
    description:
      'Repeated authentication failures were detected against an RDP service.',
    severity: 'MEDIUM',
    status: 'BLOCKED',
    category: 'Identity',
    asset: 'WIN-02',
    source: 'Identity Monitor',
    confidence: 91,
    timestamp: '2026-09-27T22:40:59',
  },
  {
    id: 4,
    event_id: 'EVT-1045',
    title: 'Unsigned process execution detected',
    description:
      'An unsigned executable was observed running from a non-standard location.',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    category: 'Process',
    asset: 'WIN-04',
    source: 'EDR Sensor',
    confidence: 89,
    timestamp: '2026-09-27T22:40:54',
  },
  {
    id: 5,
    event_id: 'EVT-1044',
    title: 'Endpoint heartbeat received',
    description:
      'A normal endpoint heartbeat was received from the CyberSentinel agent.',
    severity: 'INFO',
    status: 'NORMAL',
    category: 'System',
    asset: 'WIN-03',
    source: 'Endpoint Agent',
    confidence: 100,
    timestamp: '2026-09-27T22:40:48',
  },
  {
    id: 6,
    event_id: 'EVT-1043',
    title: 'Security file deletion attempt',
    description:
      'A protected security-related file deletion attempt was detected and blocked.',
    severity: 'HIGH',
    status: 'BLOCKED',
    category: 'Defense Evasion',
    asset: 'WIN-02',
    source: 'File Integrity',
    confidence: 96,
    timestamp: '2026-09-27T22:40:42',
  },
  {
    id: 7,
    event_id: 'EVT-1042',
    title: 'New administrative group membership',
    description:
      'A user account was added to an administrative security group.',
    severity: 'MEDIUM',
    status: 'REVIEW',
    category: 'Privilege',
    asset: 'WIN-03',
    source: 'Identity Monitor',
    confidence: 87,
    timestamp: '2026-09-27T22:40:36',
  },
  {
    id: 8,
    event_id: 'EVT-1041',
    title: 'New external DNS request observed',
    description:
      'A new external DNS request was observed from a Linux endpoint.',
    severity: 'LOW',
    status: 'MONITORED',
    category: 'Network',
    asset: 'LINUX-01',
    source: 'Network Sensor',
    confidence: 82,
    timestamp: '2026-09-27T22:40:31',
  },
]

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function severityClass(severity: string) {
  return `soc-severity soc-severity-${severity.toLowerCase()}`
}

function statusClass(status: string) {
  const value = status.toLowerCase()

  if (value === 'normal' || value === 'monitored') {
    return 'soc-status soc-status-normal'
  }

  if (value === 'blocked') {
    return 'soc-status soc-status-blocked'
  }

  if (value === 'investigating') {
    return 'soc-status soc-status-investigating'
  }

  if (value === 'alerted') {
    return 'soc-status soc-status-alerted'
  }

  return 'soc-status'
}

function categoryIcon(category: string) {
  switch (category) {
    case 'Network':
      return <Network size={15} />

    case 'Identity':
    case 'Privilege':
      return <Users size={15} />

    case 'Process':
    case 'Execution':
      return <Terminal size={15} />

    case 'Defense Evasion':
      return <ShieldAlert size={15} />

    case 'System':
      return <Monitor size={15} />

    default:
      return <Activity size={15} />
  }
}

function SOC() {
  const [events, setEvents] = useState<SecurityEvent[]>(fallbackEvents)
  const [loading, setLoading] = useState(true)
  const [apiOnline, setApiOnline] = useState(false)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetch(
          'http://127.0.0.1:8000/api/events',
        )

        if (!response.ok) {
          throw new Error('API request failed')
        }

        const data: SecurityEvent[] = await response.json()

        setEvents(data)
        setApiOnline(true)
      } catch {
        setEvents(fallbackEvents)
        setApiOnline(false)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  const criticalCount = events.filter(
    (event) => event.severity === 'CRITICAL',
  ).length

  const highCount = events.filter(
    (event) => event.severity === 'HIGH',
  ).length

  const mediumCount = events.filter(
    (event) => event.severity === 'MEDIUM',
  ).length

  const activeThreats = events.filter(
    (event) =>
      event.status === 'INVESTIGATING' ||
      event.status === 'ALERTED',
  ).length

  return (
    <div className="soc-page">

      {/* HEADER */}
      <div className="soc-header">
        <div>
          <div className="soc-eyebrow">
            SECURITY OPERATIONS CENTER
          </div>

          <h1 className="soc-title">
            SOC Command Center
          </h1>

          <p className="soc-subtitle">
            Centralized security monitoring, detection and response.
          </p>
        </div>

        <div className="soc-header-status">
          <span
            className={
              apiOnline
                ? 'soc-live-indicator'
                : 'soc-live-indicator soc-live-offline'
            }
          />

          <span>
            {apiOnline ? 'API CONNECTED' : 'DEMO DATA'}
          </span>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="soc-kpi-grid">

        <div className="soc-kpi-card">
          <div className="soc-kpi-icon soc-kpi-red">
            <ShieldAlert size={18} />
          </div>

          <div>
            <div className="soc-kpi-label">
              Active Threats
            </div>

            <div className="soc-kpi-value">
              {activeThreats}
            </div>
          </div>
        </div>

        <div className="soc-kpi-card">
          <div className="soc-kpi-icon soc-kpi-red">
            <AlertTriangle size={18} />
          </div>

          <div>
            <div className="soc-kpi-label">
              Critical Alerts
            </div>

            <div className="soc-kpi-value">
              {criticalCount}
            </div>
          </div>
        </div>

        <div className="soc-kpi-card">
          <div className="soc-kpi-icon soc-kpi-orange">
            <ShieldAlert size={18} />
          </div>

          <div>
            <div className="soc-kpi-label">
              High Severity
            </div>

            <div className="soc-kpi-value">
              {highCount}
            </div>
          </div>
        </div>

        <div className="soc-kpi-card">
          <div className="soc-kpi-icon soc-kpi-yellow">
            <Activity size={18} />
          </div>

          <div>
            <div className="soc-kpi-label">
              Medium Severity
            </div>

            <div className="soc-kpi-value">
              {mediumCount}
            </div>
          </div>
        </div>

      </div>

      {/* MAIN GRID */}
      <div className="soc-main-grid">

        {/* EVENT STREAM */}
        <section className="soc-panel">

          <div className="soc-panel-header">

            <div>
              <h2 className="soc-panel-title">
                Security Event Stream
              </h2>

              <p className="soc-panel-subtitle">
                Live events received from CyberSentinel sensors
              </p>
            </div>

            <div className="soc-panel-meta">
              <Clock3 size={14} />

              {loading
                ? 'Loading...'
                : `${events.length} events`}
            </div>

          </div>

          <div className="soc-event-list">

            {events.map((event) => (
              <div
                className="soc-event-row"
                key={event.event_id}
              >

                <div className="soc-event-category">
                  {categoryIcon(event.category)}
                </div>

                <div className="soc-event-main">

                  <div className="soc-event-topline">

                    <span className="soc-event-id">
                      {event.event_id}
                    </span>

                    <span className={severityClass(event.severity)}>
                      {event.severity}
                    </span>

                  </div>

                  <div className="soc-event-name">
                    {event.title}
                  </div>

                  <div className="soc-event-meta">
                    <span>
                      {event.source}
                    </span>

                    <span>•</span>

                    <span>
                      {event.asset}
                    </span>

                    <span>•</span>

                    <span>
                      {event.category}
                    </span>

                    <span>•</span>

                    <span>
                      {formatTime(event.timestamp)}
                    </span>
                  </div>

                </div>

                <div className="soc-event-right">

                  <span className={statusClass(event.status)}>
                    {event.status}
                  </span>

                  <Link
                    to={`/soc/events/${event.event_id}`}
                    className="soc-event-action"
                    title="View event"
                  >
                    <ArrowUpRight size={16} />
                  </Link>

                </div>

              </div>
            ))}

          </div>

        </section>

        {/* RIGHT SIDE */}
        <div className="soc-side-column">

          {/* SECURITY POSTURE */}
          <section className="soc-panel">

            <div className="soc-panel-header">
              <div>
                <h2 className="soc-panel-title">
                  Security Posture
                </h2>

                <p className="soc-panel-subtitle">
                  Current environment risk
                </p>
              </div>
            </div>

            <div className="soc-posture">

              <div className="soc-posture-score">
                <div className="soc-posture-number">
                  78
                </div>

                <div className="soc-posture-total">
                  /100
                </div>
              </div>

              <div className="soc-posture-status">
                ELEVATED RISK
              </div>

              <div className="soc-posture-bar">
                <div
                  className="soc-posture-fill"
                  style={{ width: '78%' }}
                />
              </div>

              <div className="soc-posture-grid">

                <div>
                  <span>Endpoint Coverage</span>
                  <strong>96%</strong>
                </div>

                <div>
                  <span>Detection Coverage</span>
                  <strong>91%</strong>
                </div>

                <div>
                  <span>Vulnerability Exposure</span>
                  <strong>68%</strong>
                </div>

                <div>
                  <span>Identity Risk</span>
                  <strong>74%</strong>
                </div>

              </div>

            </div>

          </section>

          {/* THREAT CATEGORIES */}
          <section className="soc-panel">

            <div className="soc-panel-header">

              <div>
                <h2 className="soc-panel-title">
                  Threat Categories
                </h2>

                <p className="soc-panel-subtitle">
                  Events by detection domain
                </p>
              </div>

            </div>

            <div className="soc-category-list">

              {[
                ['Network', 34, <Globe size={15} />],
                ['Execution', 27, <Terminal size={15} />],
                ['Identity', 18, <Users size={15} />],
                ['Process', 12, <Monitor size={15} />],
                ['Defense Evasion', 9, <ShieldAlert size={15} />],
              ].map(([name, value, icon]) => (
                <div
                  className="soc-category-row"
                  key={String(name)}
                >

                  <div className="soc-category-name">
                    {icon}
                    <span>{String(name)}</span>
                  </div>

                  <div className="soc-category-bar">
                    <div
                      className="soc-category-fill"
                      style={{
                        width: `${Number(value) * 2}%`,
                      }}
                    />
                  </div>

                  <span className="soc-category-value">
                    {String(value)}
                  </span>

                </div>
              ))}

            </div>

          </section>

          {/* ENDPOINT HEALTH */}
          <section className="soc-panel">

            <div className="soc-panel-header">

              <div>
                <h2 className="soc-panel-title">
                  Endpoint Health
                </h2>

                <p className="soc-panel-subtitle">
                  Current endpoint status
                </p>
              </div>

              <Monitor size={15} />

            </div>

            <div className="soc-endpoint-health">

              <div>
                <strong>42</strong>
                <span>Healthy</span>
              </div>

              <div>
                <strong>7</strong>
                <span>At Risk</span>
              </div>

              <div>
                <strong>3</strong>
                <span>Offline</span>
              </div>

            </div>

          </section>

        </div>

      </div>

      {/* FOOTER */}
      <div className="soc-footer">

        <div>
          <ShieldCheck size={14} />
          CyberSentinel Security Operations Platform
        </div>

        <div>
          <Activity size={14} />
          Event telemetry: {apiOnline ? 'API' : 'LOCAL FALLBACK'}
        </div>

      </div>

    </div>
  )
}

export default SOC