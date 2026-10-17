import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileSearch,
  Globe,
  Hash,
  Network,
  Search,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

type IocType = 'IP' | 'DOMAIN' | 'HASH' | 'URL'
type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
type IocStatus = 'MALICIOUS' | 'SUSPICIOUS' | 'MONITORED' | 'CLEAN'

type CorrelationItem = {
  type: string
  value: string
  context: string
  time: string
  severity: ThreatLevel
}

type TimelineItem = {
  time: string
  title: string
  description: string
  source: string
}

type ApiCorrelationItem = {
  type: string
  value: string
  context: string
  time: string
  severity: ThreatLevel
}

type ApiThreatIndicatorResponse = {
  indicator_id: string
  correlation_source: string
  correlations: ApiCorrelationItem[]
}

type ThreatIndicator = {
  id: string
  value: string
  type: IocType
  threatLevel: ThreatLevel
  status: IocStatus
  confidence: number
  source: string
  firstSeen: string
  lastSeen: string
  sightings: number
  relatedAlerts: number
  relatedIncidents: number
  affectedEndpoints: number
  description: string
  category: string
  tags: string[]
  correlations: CorrelationItem[]
  timeline: TimelineItem[]
}

const indicators: ThreatIndicator[] = [
  {
    id: 'IOC-001',
    value: '185.199.108.153',
    type: 'IP',
    threatLevel: 'CRITICAL',
    status: 'MALICIOUS',
    confidence: 98,
    source: 'Internal Telemetry',
    firstSeen: '2026-09-24 14:22:17',
    lastSeen: '2026-09-27 10:31:52',
    sightings: 47,
    relatedAlerts: 8,
    relatedIncidents: 3,
    affectedEndpoints: 4,
    category: 'Command and Control',
    tags: ['C2', 'Outbound', 'External IP', 'High Frequency'],
    description:
      'External IPv4 address associated with repeated suspicious outbound connections and command-and-control indicators.',
    correlations: [
      {
        type: 'INCIDENT',
        value: 'INC-001',
        context: 'Suspicious PowerShell Activity',
        time: '2026-09-27 10:31:52',
        severity: 'HIGH',
      },
      {
        type: 'INCIDENT',
        value: 'INC-003',
        context: 'Suspicious Outbound Connection',
        time: '2026-09-27 09:57:11',
        severity: 'HIGH',
      },
      {
        type: 'ALERT',
        value: 'ALT-003',
        context: 'Suspicious outbound HTTPS connection',
        time: '2026-09-27 09:54:26',
        severity: 'HIGH',
      },
      {
        type: 'ENDPOINT',
        value: 'WIN-01',
        context: '47 network sightings',
        time: '2026-09-27 10:31:52',
        severity: 'CRITICAL',
      },
    ],
    timeline: [
      {
        time: '2026-09-24 14:22:17',
        title: 'First Seen',
        description:
          'Indicator appeared in outbound network telemetry from a monitored endpoint.',
        source: 'Network Sensor',
      },
      {
        time: '2026-09-26 17:42:08',
        title: 'Threat Correlation',
        description:
          'Indicator was correlated with suspicious process activity.',
        source: 'Correlation Engine',
      },
      {
        time: '2026-09-27 09:54:26',
        title: 'Alert Generated',
        description:
          'High-severity security alert was generated after repeated outbound connections.',
        source: 'Detection Engine',
      },
      {
        time: '2026-09-27 10:31:52',
        title: 'Latest Sighting',
        description:
          'Latest connection was observed from WIN-01 during active investigation.',
        source: 'Network Sensor',
      },
    ],
  },
  {
    id: 'IOC-002',
    value: 'cdn-update.example',
    type: 'DOMAIN',
    threatLevel: 'HIGH',
    status: 'SUSPICIOUS',
    confidence: 91,
    source: 'Network Sensor',
    firstSeen: '2026-09-25 09:17:43',
    lastSeen: '2026-09-27 09:57:11',
    sightings: 29,
    relatedAlerts: 5,
    relatedIncidents: 2,
    affectedEndpoints: 3,
    category: 'Suspicious Domain',
    tags: ['DNS', 'HTTPS', 'External Domain'],
    description:
      'Domain observed in suspicious DNS and HTTPS activity originating from monitored endpoints.',
    correlations: [
      {
        type: 'INCIDENT',
        value: 'INC-003',
        context: 'Suspicious Outbound Connection',
        time: '2026-09-27 09:57:11',
        severity: 'HIGH',
      },
      {
        type: 'ALERT',
        value: 'ALT-006',
        context: 'Suspicious DNS resolution',
        time: '2026-09-27 09:44:20',
        severity: 'MEDIUM',
      },
      {
        type: 'ENDPOINT',
        value: 'WIN-01',
        context: 'Repeated DNS requests',
        time: '2026-09-27 09:57:11',
        severity: 'HIGH',
      },
    ],
    timeline: [
      {
        time: '2026-09-25 09:17:43',
        title: 'First Seen',
        description:
          'DNS telemetry recorded a query for the suspicious domain.',
        source: 'DNS Sensor',
      },
      {
        time: '2026-09-26 15:42:11',
        title: 'Repeated Activity',
        description:
          'Multiple monitored endpoints resolved the same domain.',
        source: 'Network Sensor',
      },
      {
        time: '2026-09-27 09:57:11',
        title: 'Latest Sighting',
        description:
          'Domain activity was correlated with an active network investigation.',
        source: 'Correlation Engine',
      },
    ],
  },
  {
    id: 'IOC-003',
    value: '7a4d9f2c1b8e55a12f4e9c3d8a7b6e10',
    type: 'HASH',
    threatLevel: 'HIGH',
    status: 'MALICIOUS',
    confidence: 96,
    source: 'File Integrity',
    firstSeen: '2026-09-26 17:21:02',
    lastSeen: '2026-09-27 08:14:38',
    sightings: 16,
    relatedAlerts: 4,
    relatedIncidents: 2,
    affectedEndpoints: 2,
    category: 'Malicious File',
    tags: ['SHA-256', 'Unsigned', 'Executable'],
    description:
      'SHA-256 file indicator linked to an unsigned executable discovered during endpoint investigation.',
    correlations: [
      {
        type: 'INCIDENT',
        value: 'INC-006',
        context: 'Unsigned Binary Execution',
        time: '2026-09-27 08:14:38',
        severity: 'HIGH',
      },
      {
        type: 'FILE',
        value: 'update-helper.exe',
        context: 'Unsigned executable',
        time: '2026-09-27 08:14:38',
        severity: 'HIGH',
      },
      {
        type: 'ENDPOINT',
        value: 'WIN-02',
        context: 'File execution detected',
        time: '2026-09-27 08:14:38',
        severity: 'HIGH',
      },
    ],
    timeline: [
      {
        time: '2026-09-26 17:21:02',
        title: 'File Observed',
        description:
          'Hash was recorded when a new executable appeared on the endpoint.',
        source: 'File Integrity',
      },
      {
        time: '2026-09-26 17:25:41',
        title: 'Hash Correlated',
        description:
          'Hash matched an internally tracked malicious file indicator.',
        source: 'Threat Intelligence',
      },
      {
        time: '2026-09-27 08:14:38',
        title: 'Execution Detected',
        description:
          'The executable was observed running on WIN-02.',
        source: 'Process Monitor',
      },
    ],
  },
  {
    id: 'IOC-004',
    value: 'https://update-check.example/api/v1',
    type: 'URL',
    threatLevel: 'MEDIUM',
    status: 'SUSPICIOUS',
    confidence: 79,
    source: 'Network Telemetry',
    firstSeen: '2026-09-26 11:04:27',
    lastSeen: '2026-09-27 07:42:16',
    sightings: 12,
    relatedAlerts: 2,
    relatedIncidents: 1,
    affectedEndpoints: 2,
    category: 'Suspicious URL',
    tags: ['HTTPS', 'API', 'External'],
    description:
      'Suspicious HTTP endpoint observed during process and network correlation.',
    correlations: [
      {
        type: 'INCIDENT',
        value: 'INC-003',
        context: 'Suspicious Outbound Connection',
        time: '2026-09-27 07:42:16',
        severity: 'MEDIUM',
      },
      {
        type: 'NETWORK',
        value: 'CONN-014',
        context: 'Repeated HTTPS requests',
        time: '2026-09-27 07:42:16',
        severity: 'MEDIUM',
      },
    ],
    timeline: [
      {
        time: '2026-09-26 11:04:27',
        title: 'URL Observed',
        description:
          'Endpoint requested the suspicious URL during outbound activity.',
        source: 'Network Telemetry',
      },
      {
        time: '2026-09-27 07:42:16',
        title: 'Latest Sighting',
        description:
          'URL was observed again during a correlated investigation.',
        source: 'Network Sensor',
      },
    ],
  },
  {
    id: 'IOC-005',
    value: '91.212.44.17',
    type: 'IP',
    threatLevel: 'HIGH',
    status: 'MALICIOUS',
    confidence: 93,
    source: 'Threat Feed',
    firstSeen: '2026-09-22 18:32:10',
    lastSeen: '2026-09-26 22:41:53',
    sightings: 21,
    relatedAlerts: 4,
    relatedIncidents: 2,
    affectedEndpoints: 3,
    category: 'External Threat',
    tags: ['Threat Feed', 'IP Reputation', 'Network'],
    description:
      'Threat intelligence feed indicator correlated with suspicious authentication and network activity.',
    correlations: [
      {
        type: 'ALERT',
        value: 'ALT-011',
        context: 'Connection to known malicious IP',
        time: '2026-09-26 22:41:53',
        severity: 'HIGH',
      },
      {
        type: 'ENDPOINT',
        value: 'WIN-02',
        context: 'Outbound connection',
        time: '2026-09-26 22:41:53',
        severity: 'HIGH',
      },
    ],
    timeline: [
      {
        time: '2026-09-22 18:32:10',
        title: 'Threat Feed Import',
        description:
          'Indicator entered CyberSentinel through a threat intelligence source.',
        source: 'Threat Feed',
      },
      {
        time: '2026-09-26 22:41:53',
        title: 'Internal Correlation',
        description:
          'Endpoint telemetry matched the external threat indicator.',
        source: 'Correlation Engine',
      },
    ],
  },
]

const fallbackIndicator = indicators[0]

const typeIcon = (type: IocType) => {
  if (type === 'IP') return <Network size={16} />
  if (type === 'DOMAIN') return <Globe size={16} />
  if (type === 'HASH') return <Hash size={16} />
  return <Search size={16} />
}

const severityClass = (level: ThreatLevel) =>
  `ti-detail-severity ti-detail-severity-${level.toLowerCase()}`

const statusClass = (status: IocStatus) =>
  `ti-detail-status ti-detail-status-${status.toLowerCase()}`

export default function ThreatIntelligenceDetails() {
  const { indicatorId } = useParams<{ indicatorId: string }>()
  const [apiCorrelations, setApiCorrelations] = useState<ApiCorrelationItem[] | null>(null)
  const [apiConnected, setApiConnected] = useState(false)

  const indicator =
    indicators.find((item) => item.id === indicatorId) ?? fallbackIndicator

  useEffect(() => {
    let cancelled = false

    const loadCorrelation = async () => {
      if (!indicatorId) {
        return
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:8001/api/threat-intelligence/${indicatorId}`,
        )

        if (!response.ok) {
          throw new Error('Threat intelligence API request failed')
        }

        const data: ApiThreatIndicatorResponse = await response.json()

        if (!cancelled) {
          setApiCorrelations(data.correlations)
          setApiConnected(true)
        }
      } catch {
        if (!cancelled) {
          setApiCorrelations(null)
          setApiConnected(false)
        }
      }
    }

    loadCorrelation()

    return () => {
      cancelled = true
    }
  }, [indicatorId])

  const correlations: (CorrelationItem | ApiCorrelationItem)[] =
    apiCorrelations ?? indicator.correlations

  const correlationLink = (item: CorrelationItem | ApiCorrelationItem) => {
    if (item.type === 'EVENT') {
      return `/soc/events/${item.value}`
    }

    if (item.type === 'ALERT') {
      return `/alerts/${item.value}`
    }

    if (item.type === 'INCIDENT') {
      return `/incidents/${item.value}`
    }

    if (item.type === 'ENDPOINT') {
      return `/endpoints/${item.value}`
    }

    return null
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <div className="page-kicker">
            SECURITY OPERATIONS / THREAT INTELLIGENCE / IOC INVESTIGATION
          </div>
          <h1>IOC Investigation</h1>
          <p>
            Analyze indicator reputation, telemetry correlations, affected
            assets, and historical threat activity.
          </p>
        </div>

        <div className="ti-detail-header-actions">
          <Link to="/threat-intelligence" className="ti-detail-back">
            <ArrowLeft size={15} />
            THREAT INTELLIGENCE
          </Link>

          <div className="ti-detail-online">
            <span />
            IOC ANALYSIS ONLINE
          </div>
        </div>
      </div>

      <section className="ti-detail-identity">
        <div className="ti-detail-indicator-icon">
          {typeIcon(indicator.type)}
        </div>

        <div className="ti-detail-indicator-value">
          <span>{indicator.type} INDICATOR</span>
          <strong>{indicator.value}</strong>
          <small>{indicator.id}</small>
        </div>

        <div className={severityClass(indicator.threatLevel)}>
          <AlertTriangle size={14} />
          {indicator.threatLevel}
        </div>

        <div className={statusClass(indicator.status)}>
          {indicator.status}
        </div>
      </section>

      <div className="ti-detail-metrics">
        <div className="ti-detail-metric">
          <span>CONFIDENCE</span>
          <strong>{indicator.confidence}%</strong>
        </div>

        <div className="ti-detail-metric">
          <span>SIGHTINGS</span>
          <strong>{indicator.sightings}</strong>
        </div>

        <div className="ti-detail-metric">
          <span>RELATED ALERTS</span>
          <strong>{indicator.relatedAlerts}</strong>
        </div>

        <div className="ti-detail-metric">
          <span>RELATED INCIDENTS</span>
          <strong>{indicator.relatedIncidents}</strong>
        </div>

        <div className="ti-detail-metric">
          <span>AFFECTED ENDPOINTS</span>
          <strong>{indicator.affectedEndpoints}</strong>
        </div>

        <div className="ti-detail-metric">
          <span>CATEGORY</span>
          <strong>{indicator.category}</strong>
        </div>
      </div>

      <div className="ti-detail-main-grid">
        <div className="ti-detail-primary">
          <section className="ti-detail-panel">
            <div className="ti-detail-panel-header">
              <div>
                <span>THREAT ASSESSMENT</span>
                <h2>Indicator Analysis</h2>
              </div>

              <ShieldAlert size={17} />
            </div>

            <div className="ti-detail-assessment">
              <p>{indicator.description}</p>

              <div className="ti-detail-tags">
                {indicator.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              <div className="ti-detail-assessment-grid">
                <div>
                  <span>INTELLIGENCE SOURCE</span>
                  <strong>{indicator.source}</strong>
                </div>

                <div>
                  <span>FIRST SEEN</span>
                  <strong>{indicator.firstSeen}</strong>
                </div>

                <div>
                  <span>LAST SEEN</span>
                  <strong>{indicator.lastSeen}</strong>
                </div>

                <div>
                  <span>IOC TYPE</span>
                  <strong>{indicator.type}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="ti-detail-panel">
            <div className="ti-detail-panel-header">
              <div>
                <span>TELEMETRY CORRELATION</span>
                <h2>Related Security Activity</h2>
              </div>

              <Network size={17} />
            </div>

            <div className="ti-detail-correlation">
              {correlations.map((item, index) => {
                const link = correlationLink(item)

                return (
                  <div
                    className="ti-detail-correlation-row"
                    key={`${item.value}-${index}`}
                  >
                    <div className="ti-detail-correlation-type">
                      {item.type === 'INCIDENT' && <ShieldAlert size={14} />}
                      {item.type === 'ALERT' && <AlertTriangle size={14} />}
                      {item.type === 'EVENT' && <Network size={14} />}
                      {item.type === 'ENDPOINT' && <Network size={14} />}
                      {item.type === 'FILE' && <Hash size={14} />}
                      {item.type === 'NETWORK' && <Network size={14} />}

                      <span>{item.type}</span>
                    </div>

                    <div className="ti-detail-correlation-main">
                      {link ? (
                        <Link to={link}>
                          <strong>{item.value}</strong>
                        </Link>
                      ) : (
                        <strong>{item.value}</strong>
                      )}
                      <span>{item.context}</span>
                    </div>

                    <div className={severityClass(item.severity)}>
                      {item.severity}
                    </div>

                    <time>{item.time}</time>
                  </div>
                )
              })}
            </div>

            <div
              className="ti-detail-correlation-source"
              style={{
                marginTop: '14px',
                padding: '10px 12px',
                border: '1px solid rgba(71, 85, 105, 0.35)',
                borderRadius: '10px',
                color: '#64748b',
                fontSize: '12px',
              }}
            >
              {apiConnected
                ? 'BACKEND CONNECTED — correlation data is loaded from the CyberSentinel API.'
                : 'DEMO DATA — backend correlation data is unavailable.'}
            </div>
          </section>

          <section className="ti-detail-panel">
            <div className="ti-detail-panel-header">
              <div>
                <span>INTELLIGENCE TIMELINE</span>
                <h2>Indicator Activity</h2>
              </div>

              <Clock3 size={17} />
            </div>

            <div className="ti-detail-timeline">
              {indicator.timeline.map((event, index) => (
                <div
                  className="ti-detail-timeline-item"
                  key={`${event.time}-${index}`}
                >
                  <div className="ti-detail-timeline-dot">
                    <span />
                  </div>

                  <div className="ti-detail-timeline-content">
                    <div className="ti-detail-timeline-top">
                      <strong>{event.title}</strong>
                      <time>{event.time}</time>
                    </div>

                    <p>{event.description}</p>

                    <span className="ti-detail-timeline-source">
                      {event.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="ti-detail-sidebar">
          <section className="ti-detail-panel">
            <div className="ti-detail-panel-header">
              <div>
                <span>REPUTATION</span>
                <h2>Threat Score</h2>
              </div>

              <ShieldCheck size={17} />
            </div>

            <div className="ti-detail-score">
              <strong>{indicator.confidence}%</strong>
              <span>CONFIDENCE</span>

              <div className="ti-detail-score-bar">
                <span style={{ width: `${indicator.confidence}%` }} />
              </div>

              <p>
                Confidence reflects the strength of available telemetry and
                intelligence correlations for this indicator.
              </p>
            </div>
          </section>

          <section className="ti-detail-panel">
            <div className="ti-detail-panel-header">
              <div>
                <span>CORRELATION SUMMARY</span>
                <h2>Security Impact</h2>
              </div>

              <CircleAlert size={17} />
            </div>

            <div className="ti-detail-impact-list">
              <div>
                <span>ALERTS</span>
                <strong>{indicator.relatedAlerts}</strong>
              </div>

              <div>
                <span>INCIDENTS</span>
                <strong>{indicator.relatedIncidents}</strong>
              </div>

              <div>
                <span>ENDPOINTS</span>
                <strong>{indicator.affectedEndpoints}</strong>
              </div>

              <div>
                <span>SIGHTINGS</span>
                <strong>{indicator.sightings}</strong>
              </div>
            </div>
          </section>

          <section className="ti-detail-panel">
            <div className="ti-detail-panel-header">
              <div>
                <span>ANALYST ACTIONS</span>
                <h2>Investigation Tools</h2>
              </div>

              <FileSearch size={17} />
            </div>

            <div className="ti-detail-actions">
              <button type="button">
                <Search size={14} />
                SEARCH TELEMETRY
              </button>

              <button type="button">
                <Network size={14} />
                CORRELATE NETWORK
              </button>

              <button type="button">
                <ShieldAlert size={14} />
                CREATE ALERT
              </button>

              <button type="button">
                <CheckCircle2 size={14} />
                MARK REVIEWED
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}