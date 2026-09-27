import {
  AlertTriangle,
  Bug,
  ChevronRight,
  CircleAlert,
  Database,
  FileSearch,
  Globe,
  Hash,
  Network,
  Search,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type IocType = 'IP' | 'DOMAIN' | 'HASH' | 'URL'
type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
type IocStatus = 'MALICIOUS' | 'SUSPICIOUS' | 'MONITORED' | 'CLEAN'

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
    description:
      'External IPv4 address associated with repeated suspicious outbound connections and command-and-control indicators.',
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
    description:
      'Domain observed in suspicious DNS and HTTPS activity originating from monitored endpoints.',
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
    description:
      'SHA-256 file indicator linked to an unsigned executable discovered during endpoint investigation.',
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
    description:
      'Suspicious HTTP endpoint observed during process and network correlation.',
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
    description:
      'Threat intelligence feed indicator correlated with suspicious authentication and network activity.',
  },
  {
    id: 'IOC-006',
    value: 'powershell-helper.local',
    type: 'DOMAIN',
    threatLevel: 'MEDIUM',
    status: 'MONITORED',
    confidence: 71,
    source: 'Detection Engine',
    firstSeen: '2026-09-23 13:18:41',
    lastSeen: '2026-09-27 08:21:14',
    sightings: 9,
    relatedAlerts: 2,
    relatedIncidents: 1,
    affectedEndpoints: 1,
    description:
      'Internal domain observed alongside PowerShell execution telemetry and scheduled task activity.',
  },
  {
    id: 'IOC-007',
    value: 'd3c4e5f60718293a4b5c6d7e8f901234',
    type: 'HASH',
    threatLevel: 'LOW',
    status: 'MONITORED',
    confidence: 62,
    source: 'Endpoint Telemetry',
    firstSeen: '2026-09-20 10:12:54',
    lastSeen: '2026-09-26 16:45:22',
    sightings: 5,
    relatedAlerts: 1,
    relatedIncidents: 0,
    affectedEndpoints: 1,
    description:
      'File hash retained for monitoring because of unusual execution context.',
  },
  {
    id: 'IOC-008',
    value: 'https://telemetry-check.example/ping',
    type: 'URL',
    threatLevel: 'LOW',
    status: 'CLEAN',
    confidence: 88,
    source: 'Internal Allowlist',
    firstSeen: '2026-09-18 09:15:44',
    lastSeen: '2026-09-27 09:12:02',
    sightings: 64,
    relatedAlerts: 0,
    relatedIncidents: 0,
    affectedEndpoints: 8,
    description:
      'Known internal telemetry endpoint with no active security findings.',
  },
  {
    id: 'IOC-009',
    value: '203.0.113.77',
    type: 'IP',
    threatLevel: 'MEDIUM',
    status: 'SUSPICIOUS',
    confidence: 76,
    source: 'Network Sensor',
    firstSeen: '2026-09-26 19:03:31',
    lastSeen: '2026-09-27 08:44:29',
    sightings: 7,
    relatedAlerts: 2,
    relatedIncidents: 1,
    affectedEndpoints: 1,
    description:
      'External address associated with repeated connection attempts against a monitored endpoint.',
  },
  {
    id: 'IOC-010',
    value: 'malware-loader.example',
    type: 'DOMAIN',
    threatLevel: 'CRITICAL',
    status: 'MALICIOUS',
    confidence: 99,
    source: 'Threat Feed',
    firstSeen: '2026-09-21 12:14:05',
    lastSeen: '2026-09-27 10:04:33',
    sightings: 38,
    relatedAlerts: 7,
    relatedIncidents: 3,
    affectedEndpoints: 5,
    description:
      'Domain classified as malicious by an external threat intelligence source and correlated internally.',
  },
]

const typeIcon = (type: IocType) => {
  if (type === 'IP') return <Network size={15} />
  if (type === 'DOMAIN') return <Globe size={15} />
  if (type === 'HASH') return <Hash size={15} />
  return <Globe size={15} />
}

const threatClass = (level: ThreatLevel) =>
  `threat-intel-level threat-intel-level-${level.toLowerCase()}`

const statusClass = (status: IocStatus) =>
  `threat-intel-status threat-intel-status-${status.toLowerCase()}`

export default function ThreatIntelligence() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | IocType>('ALL')
  const [levelFilter, setLevelFilter] = useState<'ALL' | ThreatLevel>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | IocStatus>('ALL')

  const filteredIndicators = useMemo(() => {
    const search = searchTerm.toLowerCase().trim()

    return indicators.filter((indicator) => {
      const matchesSearch =
        !search ||
        indicator.value.toLowerCase().includes(search) ||
        indicator.id.toLowerCase().includes(search) ||
        indicator.source.toLowerCase().includes(search) ||
        indicator.description.toLowerCase().includes(search)

      const matchesType =
        typeFilter === 'ALL' || indicator.type === typeFilter

      const matchesLevel =
        levelFilter === 'ALL' || indicator.threatLevel === levelFilter

      const matchesStatus =
        statusFilter === 'ALL' || indicator.status === statusFilter

      return matchesSearch && matchesType && matchesLevel && matchesStatus
    })
  }, [searchTerm, typeFilter, levelFilter, statusFilter])

  const criticalCount = indicators.filter(
    (item) => item.threatLevel === 'CRITICAL',
  ).length

  const maliciousCount = indicators.filter(
    (item) => item.status === 'MALICIOUS',
  ).length

  const totalSightings = indicators.reduce(
    (sum, item) => sum + item.sightings,
    0,
  )

  const correlatedIncidents = indicators.reduce(
    (sum, item) => sum + item.relatedIncidents,
    0,
  )

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <div className="page-kicker">SECURITY OPERATIONS / THREAT INTELLIGENCE</div>
          <h1>Threat Intelligence Center</h1>
          <p>
            Investigate indicators of compromise, correlate threat activity,
            and track intelligence across the monitored environment.
          </p>
        </div>

        <div className="threat-intel-engine-status">
          <span />
          INTELLIGENCE ENGINE ONLINE
        </div>
      </div>

      <div className="threat-intel-summary-grid">
        <div className="threat-intel-summary-card">
          <div className="threat-intel-summary-icon">
            <Database size={18} />
          </div>
          <div>
            <span>TOTAL IOCs</span>
            <strong>{indicators.length}</strong>
          </div>
        </div>

        <div className="threat-intel-summary-card">
          <div className="threat-intel-summary-icon threat-intel-critical-icon">
            <ShieldAlert size={18} />
          </div>
          <div>
            <span>CRITICAL IOCs</span>
            <strong>{criticalCount}</strong>
          </div>
        </div>

        <div className="threat-intel-summary-card">
          <div className="threat-intel-summary-icon threat-intel-warning-icon">
            <Bug size={18} />
          </div>
          <div>
            <span>MALICIOUS</span>
            <strong>{maliciousCount}</strong>
          </div>
        </div>

        <div className="threat-intel-summary-card">
          <div className="threat-intel-summary-icon">
            <Network size={18} />
          </div>
          <div>
            <span>TOTAL SIGHTINGS</span>
            <strong>{totalSightings}</strong>
          </div>
        </div>

        <div className="threat-intel-summary-card">
          <div className="threat-intel-summary-icon">
            <CircleAlert size={18} />
          </div>
          <div>
            <span>LINKED INCIDENTS</span>
            <strong>{correlatedIncidents}</strong>
          </div>
        </div>
      </div>

      <div className="threat-intel-toolbar">
        <div className="threat-intel-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search IP, domain, hash, URL, source..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="threat-intel-filter">
          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as 'ALL' | IocType)
            }
          >
            <option value="ALL">All IOC Types</option>
            <option value="IP">IP Address</option>
            <option value="DOMAIN">Domain</option>
            <option value="HASH">File Hash</option>
            <option value="URL">URL</option>
          </select>
        </div>

        <div className="threat-intel-filter">
          <select
            value={levelFilter}
            onChange={(event) =>
              setLevelFilter(event.target.value as 'ALL' | ThreatLevel)
            }
          >
            <option value="ALL">All Threat Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div className="threat-intel-filter">
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as 'ALL' | IocStatus)
            }
          >
            <option value="ALL">All Status</option>
            <option value="MALICIOUS">Malicious</option>
            <option value="SUSPICIOUS">Suspicious</option>
            <option value="MONITORED">Monitored</option>
            <option value="CLEAN">Clean</option>
          </select>
        </div>
      </div>

      <div className="threat-intel-content-grid">
        <section className="threat-intel-table-panel">
          <div className="threat-intel-table-header">
            <div>
              <span className="threat-intel-panel-kicker">
                INDICATORS OF COMPROMISE
              </span>
              <h2>Threat Intelligence Feed</h2>
            </div>

            <div className="threat-intel-result-count">
              {filteredIndicators.length} / {indicators.length}
            </div>
          </div>

          <div className="threat-intel-table-wrap">
            <table className="threat-intel-table">
              <thead>
                <tr>
                  <th>INDICATOR</th>
                  <th>TYPE</th>
                  <th>THREAT</th>
                  <th>STATUS</th>
                  <th>CONFIDENCE</th>
                  <th>SOURCE</th>
                  <th>SIGHTINGS</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {filteredIndicators.map((indicator) => (
                  <tr key={indicator.id}>
                    <td>
                      <Link
                        to={`/threat-intelligence/${indicator.id}`}
                        className="threat-intel-indicator-link"
                      >
                        <div className="threat-intel-indicator-main">
                          {typeIcon(indicator.type)}
                          <div>
                            <strong>{indicator.value}</strong>
                            <span>{indicator.id}</span>
                          </div>
                        </div>
                      </Link>
                    </td>

                    <td>
                      <span className="threat-intel-type">
                        {indicator.type}
                      </span>
                    </td>

                    <td>
                      <span className={threatClass(indicator.threatLevel)}>
                        <span />
                        {indicator.threatLevel}
                      </span>
                    </td>

                    <td>
                      <span className={statusClass(indicator.status)}>
                        {indicator.status}
                      </span>
                    </td>

                    <td>
                      <div className="threat-intel-confidence">
                        <div className="threat-intel-confidence-bar">
                          <span style={{ width: `${indicator.confidence}%` }} />
                        </div>
                        <strong>{indicator.confidence}%</strong>
                      </div>
                    </td>

                    <td>
                      <span className="threat-intel-source">
                        {indicator.source}
                      </span>
                    </td>

                    <td>
                      <span className="threat-intel-sightings">
                        {indicator.sightings}
                      </span>
                    </td>

                    <td>
                      <Link
                        to={`/threat-intelligence/${indicator.id}`}
                        className="threat-intel-open"
                        aria-label={`Investigate ${indicator.id}`}
                      >
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredIndicators.length === 0 && (
              <div className="threat-intel-empty">
                <FileSearch size={28} />
                <strong>No indicators found</strong>
                <span>
                  Try changing the search term or intelligence filters.
                </span>
              </div>
            )}
          </div>
        </section>

        <aside className="threat-intel-side-panel">
          <div className="threat-intel-side-header">
            <div>
              <span className="threat-intel-panel-kicker">
                INTELLIGENCE DISTRIBUTION
              </span>
              <h2>IOC Breakdown</h2>
            </div>

            <ShieldCheck size={17} />
          </div>

          <div className="threat-intel-breakdown">
            {(['IP', 'DOMAIN', 'HASH', 'URL'] as IocType[]).map((type) => {
              const count = indicators.filter(
                (item) => item.type === type,
              ).length

              return (
                <div className="threat-intel-breakdown-row" key={type}>
                  <div>
                    {typeIcon(type)}
                    <span>{type}</span>
                  </div>

                  <strong>{count}</strong>
                </div>
              )
            })}
          </div>

          <div className="threat-intel-side-divider" />

          <div className="threat-intel-risk-list">
            <span className="threat-intel-panel-kicker">RISK DISTRIBUTION</span>

            {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as ThreatLevel[]).map(
              (level) => {
                const count = indicators.filter(
                  (item) => item.threatLevel === level,
                ).length

                return (
                  <div className="threat-intel-risk-row" key={level}>
                    <div>
                      <span
                        className={`threat-intel-risk-dot threat-intel-risk-dot-${level.toLowerCase()}`}
                      />
                      <span>{level}</span>
                    </div>

                    <strong>{count}</strong>
                  </div>
                )
              },
            )}
          </div>

          <div className="threat-intel-side-note">
            <AlertTriangle size={14} />
            <p>
              Indicators are correlated with endpoint, network, alert, and
              incident telemetry for investigation.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}