import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Filter,
  Search,
  ShieldAlert,
  ShieldCheck,
  User,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
type IncidentStatus =
  | 'OPEN'
  | 'INVESTIGATING'
  | 'CONTAINED'
  | 'RESOLVED'

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
}

const incidents: Incident[] = [
  {
    id: 'INC-001',
    title: 'Suspicious PowerShell Activity',
    description:
      'PowerShell execution with ExecutionPolicy Bypass was detected on a monitored endpoint.',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    endpoint: 'WIN-01',
    analyst: 'SOC Analyst',
    source: 'DET-001',
    technique: 'T1059.001',
    techniqueName: 'PowerShell',
    evidenceCount: 8,
    created: 'Today, 10:06:14',
    updated: 'Today, 10:18:42',
  },
  {
    id: 'INC-002',
    title: 'Repeated Authentication Failures',
    description:
      'Multiple failed authentication attempts were observed from the same source.',
    severity: 'MEDIUM',
    status: 'OPEN',
    endpoint: 'WIN-02',
    analyst: 'Unassigned',
    source: 'DET-003',
    technique: 'T1110',
    techniqueName: 'Brute Force',
    evidenceCount: 5,
    created: 'Today, 10:27:12',
    updated: 'Today, 10:27:12',
  },
  {
    id: 'INC-003',
    title: 'Suspicious Outbound Connection',
    description:
      'A monitored process established an outbound HTTPS connection following suspicious execution.',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    endpoint: 'WIN-01',
    analyst: 'SOC Analyst',
    source: 'DET-005',
    technique: 'T1071.001',
    techniqueName: 'Web Protocols',
    evidenceCount: 11,
    created: 'Today, 10:06:42',
    updated: 'Today, 10:21:07',
  },
  {
    id: 'INC-004',
    title: 'Security File Deletion Attempt',
    description:
      'An attempt to delete a protected security configuration file was blocked.',
    severity: 'CRITICAL',
    status: 'CONTAINED',
    endpoint: 'WIN-02',
    analyst: 'SOC Analyst',
    source: 'DET-006',
    technique: 'T1070.004',
    techniqueName: 'File Deletion',
    evidenceCount: 14,
    created: 'Today, 10:26:39',
    updated: 'Today, 10:32:15',
  },
  {
    id: 'INC-005',
    title: 'SSH Key Modification',
    description:
      'The SSH authorized_keys configuration was modified on a Linux endpoint.',
    severity: 'MEDIUM',
    status: 'OPEN',
    endpoint: 'LINUX-01',
    analyst: 'Unassigned',
    source: 'DET-007',
    technique: 'T1098.004',
    techniqueName: 'SSH Authorized Keys',
    evidenceCount: 4,
    created: 'Today, 10:31:04',
    updated: 'Today, 10:31:04',
  },
  {
    id: 'INC-006',
    title: 'Unsigned Binary Execution',
    description:
      'An unsigned executable was launched from a user temporary directory.',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    endpoint: 'WIN-02',
    analyst: 'SOC Analyst',
    source: 'DET-008',
    technique: 'T1036',
    techniqueName: 'Masquerading',
    evidenceCount: 7,
    created: 'Today, 10:25:11',
    updated: 'Today, 10:34:51',
  },
  {
    id: 'INC-007',
    title: 'New Local Administrator',
    description:
      'A user account was added to a privileged administrator group.',
    severity: 'HIGH',
    status: 'RESOLVED',
    endpoint: 'WIN-03',
    analyst: 'SOC Analyst',
    source: 'DET-004',
    technique: 'T1098',
    techniqueName: 'Account Manipulation',
    evidenceCount: 6,
    created: 'Yesterday, 16:44:18',
    updated: 'Yesterday, 17:12:03',
  },
  {
    id: 'INC-008',
    title: 'Security Process Termination',
    description:
      'An attempt to terminate a protected security monitoring process was detected.',
    severity: 'CRITICAL',
    status: 'CONTAINED',
    endpoint: 'WIN-04',
    analyst: 'SOC Analyst',
    source: 'DET-010',
    technique: 'T1562.001',
    techniqueName: 'Impair Defenses',
    evidenceCount: 12,
    created: 'Today, 09:48:22',
    updated: 'Today, 10:02:18',
  },
]

function Incidents() {
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredIncidents = useMemo(() => {
    const query = search.trim().toLowerCase()

    return incidents.filter((incident) => {
      const matchesSearch =
        !query ||
        incident.id.toLowerCase().includes(query) ||
        incident.title.toLowerCase().includes(query) ||
        incident.endpoint.toLowerCase().includes(query) ||
        incident.analyst.toLowerCase().includes(query) ||
        incident.source.toLowerCase().includes(query) ||
        incident.technique.toLowerCase().includes(query) ||
        incident.techniqueName.toLowerCase().includes(query)

      const matchesSeverity =
        severityFilter === 'ALL' ||
        incident.severity === severityFilter

      const matchesStatus =
        statusFilter === 'ALL' ||
        incident.status === statusFilter

      return (
        matchesSearch &&
        matchesSeverity &&
        matchesStatus
      )
    })
  }, [search, severityFilter, statusFilter])

  const totalIncidents = incidents.length

  const activeIncidents = incidents.filter(
    (incident) =>
      incident.status === 'OPEN' ||
      incident.status === 'INVESTIGATING',
  ).length

  const criticalIncidents = incidents.filter(
    (incident) => incident.severity === 'CRITICAL',
  ).length

  const evidenceTotal = incidents.reduce(
    (sum, incident) => sum + incident.evidenceCount,
    0,
  )

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            INCIDENT RESPONSE
          </div>

          <h1>Incident Center</h1>

          <p>
            Centralize security investigations, evidence,
            analysts, and response activity.
          </p>
        </div>

        <div className="incident-engine-status">
          <span />
          RESPONSE CENTER ONLINE
        </div>
      </div>

      <section className="incident-summary-grid">
        <div className="incident-summary-card">
          <div className="incident-summary-icon">
            <ShieldCheck size={19} />
          </div>

          <div>
            <span>TOTAL INCIDENTS</span>
            <strong>{totalIncidents}</strong>
          </div>
        </div>

        <div className="incident-summary-card">
          <div className="incident-summary-icon">
            <Clock3 size={19} />
          </div>

          <div>
            <span>ACTIVE CASES</span>
            <strong>{activeIncidents}</strong>
          </div>
        </div>

        <div className="incident-summary-card">
          <div className="incident-summary-icon incident-summary-icon-critical">
            <ShieldAlert size={19} />
          </div>

          <div>
            <span>CRITICAL</span>
            <strong>{criticalIncidents}</strong>
          </div>
        </div>

        <div className="incident-summary-card">
          <div className="incident-summary-icon">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>LINKED EVIDENCE</span>
            <strong>{evidenceTotal}</strong>
          </div>
        </div>
      </section>

      <section className="incident-toolbar">
        <div className="incident-search">
          <Search size={17} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search incidents..."
          />
        </div>

        <div className="incident-filter">
          <Filter size={15} />

          <select
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(event.target.value)
            }
          >
            <option value="ALL">All Severity</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div className="incident-filter">
          <Filter size={15} />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="INVESTIGATING">
              Investigating
            </option>
            <option value="CONTAINED">Contained</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </section>

      <section className="incident-table-panel">
        <div className="incident-table-header">
          <div>
            <strong>Active Investigation Cases</strong>

            <span>
              {filteredIncidents.length} incidents matching
              current filters
            </span>
          </div>

          <ShieldAlert size={18} />
        </div>

        <div className="incident-table-wrap">
          <table className="incident-table">
            <thead>
              <tr>
                <th>INCIDENT</th>
                <th>SEVERITY</th>
                <th>STATUS</th>
                <th>ENDPOINT</th>
                <th>ANALYST</th>
                <th>DETECTION</th>
                <th>MITRE ATT&CK</th>
                <th>EVIDENCE</th>
              </tr>
            </thead>

            <tbody>
              {filteredIncidents.map((incident) => (
                <tr key={incident.id}>
                  <td>
                    <Link
                      to={`/incidents/${incident.id}`}
                      className="incident-link"
                    >
                      <strong>{incident.title}</strong>
                      <span>{incident.id}</span>
                    </Link>
                  </td>

                  <td>
                    <span
                      className={`incident-severity incident-severity-${incident.severity.toLowerCase()}`}
                    >
                      <AlertTriangle size={13} />
                      {incident.severity}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`incident-status incident-status-${incident.status.toLowerCase()}`}
                    >
                      <span />
                      {incident.status}
                    </span>
                  </td>

                  <td>
                    <strong className="incident-endpoint">
                      {incident.endpoint}
                    </strong>
                  </td>

                  <td>
                    <div className="incident-analyst">
                      <User size={13} />
                      <span>{incident.analyst}</span>
                    </div>
                  </td>

                  <td>
                    <span className="incident-source">
                      {incident.source}
                    </span>
                  </td>

                  <td>
                    <div className="incident-technique">
                      <strong>{incident.technique}</strong>
                      <span>{incident.techniqueName}</span>
                    </div>
                  </td>

                  <td>
                    <strong className="incident-evidence-count">
                      {incident.evidenceCount}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredIncidents.length === 0 && (
            <div className="incident-empty">
              <ShieldAlert size={25} />

              <strong>No incidents found</strong>

              <span>
                Try changing the search or filter criteria.
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Incidents