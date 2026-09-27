import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileSearch,
  Flag,
  Network,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  User,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED'

type TimelineEvent = {
  time: string
  title: string
  description: string
  actor: string
  type: 'detection' | 'investigation' | 'containment' | 'resolution'
}

type EvidenceItem = {
  id: string
  type: string
  name: string
  source: string
  status: 'COLLECTED' | 'VERIFIED' | 'PENDING'
}

type Incident = {
  id: string
  title: string
  description: string
  severity: IncidentSeverity
  status: IncidentStatus
  endpoint: string
  analyst: string
  source: string
  technique: string
  techniqueName: string
  evidenceCount: number
  created: string
  updated: string
  detectionRule: string
  category: string
  confidence: number
  firstObserved: string
  lastObserved: string
  timeline: TimelineEvent[]
  evidence: EvidenceItem[]
}

const incidents: Incident[] = [
  {
    id: 'INC-001',
    title: 'Suspicious PowerShell Activity',
    description:
      'PowerShell execution with policy bypass indicators was detected on a monitored Windows endpoint.',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    endpoint: 'WIN-01',
    analyst: 'SOC Analyst',
    source: 'DET-001',
    technique: 'T1059.001',
    techniqueName: 'PowerShell',
    evidenceCount: 8,
    created: '2026-09-27 09:14:22',
    updated: '2026-09-27 10:32:08',
    detectionRule: 'PowerShell Execution Policy Bypass',
    category: 'Execution',
    confidence: 94,
    firstObserved: '2026-09-27 09:12:44',
    lastObserved: '2026-09-27 10:31:52',
    timeline: [
      {
        time: '09:12:44',
        title: 'Detection Triggered',
        description:
          'A PowerShell process launched with execution policy bypass parameters.',
        actor: 'Detection Engine',
        type: 'detection',
      },
      {
        time: '09:14:22',
        title: 'Incident Created',
        description:
          'Detection DET-001 generated a new high-severity investigation case.',
        actor: 'CyberSentinel',
        type: 'detection',
      },
      {
        time: '09:21:07',
        title: 'Analyst Assigned',
        description:
          'Case assigned to the SOC Analyst for investigation.',
        actor: 'SOC Manager',
        type: 'investigation',
      },
      {
        time: '09:46:31',
        title: 'Process Investigation',
        description:
          'PowerShell parent-child process relationships and command-line activity were reviewed.',
        actor: 'SOC Analyst',
        type: 'investigation',
      },
      {
        time: '10:18:14',
        title: 'Evidence Collected',
        description:
          'Process metadata, command-line arguments, network indicators, and file hashes were collected.',
        actor: 'SOC Analyst',
        type: 'investigation',
      },
      {
        time: '10:31:52',
        title: 'Containment Pending',
        description:
          'Endpoint isolation is pending confirmation from the response workflow.',
        actor: 'SOC Analyst',
        type: 'containment',
      },
    ],
    evidence: [
      {
        id: 'EVD-001',
        type: 'PROCESS',
        name: 'powershell.exe',
        source: 'WIN-01',
        status: 'VERIFIED',
      },
      {
        id: 'EVD-002',
        type: 'COMMAND',
        name: '-ExecutionPolicy Bypass',
        source: 'Process Telemetry',
        status: 'VERIFIED',
      },
      {
        id: 'EVD-003',
        type: 'NETWORK',
        name: '185.199.108.153:443',
        source: 'Network Telemetry',
        status: 'COLLECTED',
      },
      {
        id: 'EVD-004',
        type: 'FILE',
        name: 'update-helper.ps1',
        source: 'File Integrity',
        status: 'VERIFIED',
      },
    ],
  },
  {
    id: 'INC-002',
    title: 'Repeated Authentication Failures',
    description:
      'Multiple failed authentication attempts were observed against a monitored endpoint.',
    severity: 'MEDIUM',
    status: 'OPEN',
    endpoint: 'WIN-02',
    analyst: 'Unassigned',
    source: 'DET-003',
    technique: 'T1110',
    techniqueName: 'Brute Force',
    evidenceCount: 5,
    created: '2026-09-27 08:41:18',
    updated: '2026-09-27 08:45:12',
    detectionRule: 'Multiple Authentication Failures',
    category: 'Credential Access',
    confidence: 82,
    firstObserved: '2026-09-27 08:39:02',
    lastObserved: '2026-09-27 08:44:51',
    timeline: [
      {
        time: '08:39:02',
        title: 'Authentication Failures Detected',
        description:
          'Multiple unsuccessful login attempts were recorded.',
        actor: 'Authentication Monitor',
        type: 'detection',
      },
      {
        time: '08:41:18',
        title: 'Incident Created',
        description:
          'The authentication detection generated an incident.',
        actor: 'CyberSentinel',
        type: 'detection',
      },
      {
        time: '08:45:12',
        title: 'Awaiting Assignment',
        description:
          'Incident remains open and requires analyst investigation.',
        actor: 'CyberSentinel',
        type: 'investigation',
      },
    ],
    evidence: [
      {
        id: 'EVD-101',
        type: 'AUTH',
        name: '18 failed login attempts',
        source: 'WIN-02',
        status: 'COLLECTED',
      },
      {
        id: 'EVD-102',
        type: 'IP',
        name: '10.0.0.45',
        source: 'Authentication Logs',
        status: 'VERIFIED',
      },
    ],
  },
  {
    id: 'INC-003',
    title: 'Suspicious Outbound Connection',
    description:
      'An endpoint established an outbound connection matching a suspicious communication pattern.',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    endpoint: 'WIN-01',
    analyst: 'SOC Analyst',
    source: 'DET-005',
    technique: 'T1071.001',
    techniqueName: 'Web Protocols',
    evidenceCount: 11,
    created: '2026-09-26 22:17:04',
    updated: '2026-09-27 09:58:42',
    detectionRule: 'Suspicious Outbound Connection',
    category: 'Command and Control',
    confidence: 91,
    firstObserved: '2026-09-26 22:15:39',
    lastObserved: '2026-09-27 09:57:11',
    timeline: [
      {
        time: '22:15:39',
        title: 'Network Detection',
        description:
          'Outbound traffic matched a suspicious communication pattern.',
        actor: 'Network Sensor',
        type: 'detection',
      },
      {
        time: '22:17:04',
        title: 'Incident Created',
        description:
          'A high-severity investigation case was opened.',
        actor: 'CyberSentinel',
        type: 'detection',
      },
      {
        time: '23:06:19',
        title: 'Connection Correlated',
        description:
          'Network activity was correlated with endpoint process telemetry.',
        actor: 'SOC Analyst',
        type: 'investigation',
      },
      {
        time: '09:58:42',
        title: 'Investigation Active',
        description:
          'Analyst is reviewing destination reputation and process ancestry.',
        actor: 'SOC Analyst',
        type: 'investigation',
      },
    ],
    evidence: [
      {
        id: 'EVD-201',
        type: 'NETWORK',
        name: '185.199.108.153:443',
        source: 'Network Sensor',
        status: 'VERIFIED',
      },
      {
        id: 'EVD-202',
        type: 'PROCESS',
        name: 'svchost.exe',
        source: 'WIN-01',
        status: 'COLLECTED',
      },
      {
        id: 'EVD-203',
        type: 'DNS',
        name: 'cdn-update.example',
        source: 'DNS Telemetry',
        status: 'PENDING',
      },
    ],
  },
  {
    id: 'INC-004',
    title: 'Security File Deletion Attempt',
    description:
      'A monitored endpoint attempted to delete security-related files and logs.',
    severity: 'CRITICAL',
    status: 'CONTAINED',
    endpoint: 'WIN-02',
    analyst: 'SOC Analyst',
    source: 'DET-006',
    technique: 'T1070.004',
    techniqueName: 'File Deletion',
    evidenceCount: 14,
    created: '2026-09-26 17:21:41',
    updated: '2026-09-26 18:03:14',
    detectionRule: 'Security File Deletion',
    category: 'Defense Evasion',
    confidence: 98,
    firstObserved: '2026-09-26 17:20:11',
    lastObserved: '2026-09-26 17:58:04',
    timeline: [
      {
        time: '17:20:11',
        title: 'Deletion Attempt Detected',
        description:
          'A process attempted to remove security telemetry files.',
        actor: 'File Integrity Monitor',
        type: 'detection',
      },
      {
        time: '17:21:41',
        title: 'Critical Incident Created',
        description:
          'CyberSentinel classified the activity as critical severity.',
        actor: 'CyberSentinel',
        type: 'detection',
      },
      {
        time: '17:36:52',
        title: 'Endpoint Contained',
        description:
          'Network access from the affected endpoint was restricted.',
        actor: 'SOC Analyst',
        type: 'containment',
      },
      {
        time: '18:03:14',
        title: 'Evidence Preserved',
        description:
          'Relevant process, file, and event data was preserved for investigation.',
        actor: 'SOC Analyst',
        type: 'containment',
      },
    ],
    evidence: [
      {
        id: 'EVD-301',
        type: 'FILE',
        name: 'Security.evtx',
        source: 'WIN-02',
        status: 'VERIFIED',
      },
      {
        id: 'EVD-302',
        type: 'PROCESS',
        name: 'cmd.exe',
        source: 'Process Telemetry',
        status: 'VERIFIED',
      },
      {
        id: 'EVD-303',
        type: 'COMMAND',
        name: 'wevtutil cl Security',
        source: 'Command Telemetry',
        status: 'VERIFIED',
      },
    ],
  },
]

const severityClass = (severity: IncidentSeverity) => {
  return `incident-detail-severity incident-detail-severity-${severity.toLowerCase()}`
}

const statusClass = (status: IncidentStatus) => {
  return `incident-detail-status incident-detail-status-${status.toLowerCase()}`
}

const timelineIcon = (type: TimelineEvent['type']) => {
  if (type === 'detection') {
    return <ShieldAlert size={15} />
  }

  if (type === 'containment') {
    return <ShieldCheck size={15} />
  }

  if (type === 'resolution') {
    return <CheckCircle2 size={15} />
  }

  return <FileSearch size={15} />
}

export default function IncidentDetails() {
  const { incidentId } = useParams<{ incidentId: string }>()

  const incident =
    incidents.find((item) => item.id === incidentId) ?? incidents[0]

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <div className="page-kicker">INCIDENT RESPONSE / CASE INVESTIGATION</div>
          <h1>{incident.title}</h1>
          <p>
            Investigate incident activity, correlate evidence, review response
            actions, and track case resolution.
          </p>
        </div>

        <div className="incident-detail-header-actions">
          <Link to="/incidents" className="incident-detail-back">
            <ArrowLeft size={15} />
            INCIDENT CENTER
          </Link>

          <div className="incident-detail-online">
            <span />
            CASE ENGINE ONLINE
          </div>
        </div>
      </div>

      <div className="incident-detail-identity">
        <div>
          <span>CASE ID</span>
          <strong>{incident.id}</strong>
        </div>

        <div>
          <span>DETECTION</span>
          <strong>{incident.source}</strong>
        </div>

        <div>
          <span>ENDPOINT</span>
          <strong>{incident.endpoint}</strong>
        </div>

        <div>
          <span>ANALYST</span>
          <strong>{incident.analyst}</strong>
        </div>

        <div className={severityClass(incident.severity)}>
          <AlertTriangle size={14} />
          {incident.severity}
        </div>

        <div className={statusClass(incident.status)}>
          <span />
          {incident.status}
        </div>
      </div>

      <div className="incident-detail-metrics">
        <div className="incident-detail-metric">
          <span>CONFIDENCE</span>
          <strong>{incident.confidence}%</strong>
        </div>

        <div className="incident-detail-metric">
          <span>EVIDENCE ITEMS</span>
          <strong>{incident.evidenceCount}</strong>
        </div>

        <div className="incident-detail-metric">
          <span>MITRE TECHNIQUE</span>
          <strong>{incident.technique}</strong>
        </div>

        <div className="incident-detail-metric">
          <span>CATEGORY</span>
          <strong>{incident.category}</strong>
        </div>

        <div className="incident-detail-metric">
          <span>FIRST OBSERVED</span>
          <strong>{incident.firstObserved}</strong>
        </div>

        <div className="incident-detail-metric">
          <span>LAST UPDATED</span>
          <strong>{incident.updated}</strong>
        </div>
      </div>

      <div className="incident-detail-main-grid">
        <div className="incident-detail-primary">
          <section className="incident-detail-panel">
            <div className="incident-detail-panel-header">
              <div>
                <span className="incident-detail-panel-kicker">
                  CASE OVERVIEW
                </span>
                <h2>{incident.title}</h2>
              </div>

              <Flag size={17} />
            </div>

            <p className="incident-detail-description">
              {incident.description}
            </p>

            <div className="incident-detail-context-grid">
              <div>
                <span>DETECTION RULE</span>
                <strong>{incident.detectionRule}</strong>
              </div>

              <div>
                <span>MITRE ATT&CK</span>
                <strong>
                  {incident.technique} · {incident.techniqueName}
                </strong>
              </div>

              <div>
                <span>CREATED</span>
                <strong>{incident.created}</strong>
              </div>

              <div>
                <span>LAST UPDATED</span>
                <strong>{incident.updated}</strong>
              </div>
            </div>
          </section>

          <section className="incident-detail-panel">
            <div className="incident-detail-panel-header">
              <div>
                <span className="incident-detail-panel-kicker">
                  INVESTIGATION TIMELINE
                </span>
                <h2>Case Activity</h2>
              </div>

              <Clock3 size={17} />
            </div>

            <div className="incident-detail-timeline">
              {incident.timeline.map((event, index) => (
                <div className="incident-detail-timeline-item" key={`${event.time}-${index}`}>
                  <div className={`incident-detail-timeline-icon incident-detail-timeline-${event.type}`}>
                    {timelineIcon(event.type)}
                  </div>

                  <div className="incident-detail-timeline-line" />

                  <div className="incident-detail-timeline-content">
                    <div className="incident-detail-timeline-top">
                      <strong>{event.title}</strong>
                      <span>{event.time}</span>
                    </div>

                    <p>{event.description}</p>

                    <div className="incident-detail-timeline-actor">
                      <User size={12} />
                      {event.actor}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="incident-detail-panel">
            <div className="incident-detail-panel-header">
              <div>
                <span className="incident-detail-panel-kicker">
                  RESPONSE WORKFLOW
                </span>
                <h2>Case Actions</h2>
              </div>

              <ShieldCheck size={17} />
            </div>

            <div className="incident-detail-actions">
              <button type="button">
                <ShieldAlert size={15} />
                CONTAIN ENDPOINT
              </button>

              <button type="button">
                <Terminal size={15} />
                COLLECT LIVE DATA
              </button>

              <button type="button">
                <FileSearch size={15} />
                PRESERVE EVIDENCE
              </button>

              <button type="button">
                <CheckCircle2 size={15} />
                MARK RESOLVED
              </button>
            </div>
          </section>
        </div>

        <aside className="incident-detail-sidebar">
          <section className="incident-detail-panel">
            <div className="incident-detail-panel-header">
              <div>
                <span className="incident-detail-panel-kicker">
                  CASE OWNER
                </span>
                <h2>Assigned Analyst</h2>
              </div>

              <User size={17} />
            </div>

            <div className="incident-detail-owner">
              <div className="incident-detail-owner-avatar">
                <User size={18} />
              </div>

              <div>
                <strong>{incident.analyst}</strong>
                <span>Security Operations</span>
              </div>
            </div>
          </section>

          <section className="incident-detail-panel">
            <div className="incident-detail-panel-header">
              <div>
                <span className="incident-detail-panel-kicker">
                  AFFECTED ASSET
                </span>
                <h2>{incident.endpoint}</h2>
              </div>

              <Network size={17} />
            </div>

            <div className="incident-detail-asset">
              <div>
                <span>HOST STATUS</span>
                <strong>MONITORED</strong>
              </div>

              <div>
                <span>LAST TELEMETRY</span>
                <strong>{incident.lastObserved}</strong>
              </div>

              <div>
                <span>CASE SOURCE</span>
                <strong>{incident.source}</strong>
              </div>
            </div>
          </section>

          <section className="incident-detail-panel">
            <div className="incident-detail-panel-header">
              <div>
                <span className="incident-detail-panel-kicker">
                  MITRE ATT&CK
                </span>
                <h2>Technique Mapping</h2>
              </div>

              <ShieldAlert size={17} />
            </div>

            <div className="incident-detail-technique">
              <strong>{incident.technique}</strong>
              <span>{incident.techniqueName}</span>
              <p>
                Activity associated with this case has been mapped to the
                corresponding MITRE ATT&CK technique for investigation context.
              </p>
            </div>
          </section>
        </aside>
      </div>

      <section className="incident-detail-panel incident-detail-evidence-panel">
        <div className="incident-detail-panel-header">
          <div>
            <span className="incident-detail-panel-kicker">
              DIGITAL EVIDENCE
            </span>
            <h2>Collected Evidence</h2>
          </div>

          <FileSearch size={17} />
        </div>

        <div className="incident-detail-evidence-grid">
          {incident.evidence.map((item) => (
            <div className="incident-detail-evidence-card" key={item.id}>
              <div className="incident-detail-evidence-top">
                <span>{item.type}</span>

                <strong
                  className={`incident-detail-evidence-status incident-detail-evidence-${item.status.toLowerCase()}`}
                >
                  {item.status}
                </strong>
              </div>

              <h3>{item.name}</h3>

              <div className="incident-detail-evidence-meta">
                <span>{item.id}</span>
                <span>{item.source}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}