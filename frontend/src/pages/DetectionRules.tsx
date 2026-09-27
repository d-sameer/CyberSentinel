import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Filter,
  Search,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  XCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type RuleSeverity = 'INFO' | 'WARNING' | 'HIGH'
type RuleStatus = 'ENABLED' | 'DISABLED'

type DetectionRule = {
  id: string
  name: string
  description: string
  category: string
  severity: RuleSeverity
  status: RuleStatus
  technique: string
  techniqueName: string
  triggerCount: number
  lastTriggered: string
  source: string
}

const detectionRules: DetectionRule[] = [
  {
    id: 'DET-001',
    name: 'PowerShell Execution Policy Bypass',
    description:
      'Detects PowerShell execution using arguments that bypass the configured execution policy.',
    category: 'EXECUTION',
    severity: 'HIGH',
    status: 'ENABLED',
    technique: 'T1059.001',
    techniqueName: 'PowerShell',
    triggerCount: 18,
    lastTriggered: 'Today, 10:06:14',
    source: 'Process Telemetry',
  },
  {
    id: 'DET-002',
    name: 'Suspicious Temporary Directory Execution',
    description:
      'Detects executable files launched from user temporary directories.',
    category: 'EXECUTION',
    severity: 'HIGH',
    status: 'ENABLED',
    technique: 'T1204.002',
    techniqueName: 'Malicious File',
    triggerCount: 7,
    lastTriggered: 'Today, 10:25:11',
    source: 'Endpoint Telemetry',
  },
  {
    id: 'DET-003',
    name: 'Multiple Authentication Failures',
    description:
      'Detects repeated authentication failures from the same source within a short period.',
    category: 'CREDENTIAL ACCESS',
    severity: 'WARNING',
    status: 'ENABLED',
    technique: 'T1110',
    techniqueName: 'Brute Force',
    triggerCount: 31,
    lastTriggered: 'Today, 10:27:12',
    source: 'Authentication Logs',
  },
  {
    id: 'DET-004',
    name: 'New Local Administrator',
    description:
      'Detects accounts being added to privileged local administrator groups.',
    category: 'PRIVILEGE',
    severity: 'HIGH',
    status: 'ENABLED',
    technique: 'T1098',
    techniqueName: 'Account Manipulation',
    triggerCount: 5,
    lastTriggered: 'Today, 10:18:33',
    source: 'Windows Security Logs',
  },
  {
    id: 'DET-005',
    name: 'Suspicious Outbound Connection',
    description:
      'Detects outbound network connections associated with suspicious endpoint processes.',
    category: 'COMMAND AND CONTROL',
    severity: 'HIGH',
    status: 'ENABLED',
    technique: 'T1071.001',
    techniqueName: 'Web Protocols',
    triggerCount: 12,
    lastTriggered: 'Today, 10:06:42',
    source: 'Network Telemetry',
  },
  {
    id: 'DET-006',
    name: 'Security File Deletion',
    description:
      'Detects attempts to delete protected security monitoring or configuration files.',
    category: 'DEFENSE EVASION',
    severity: 'HIGH',
    status: 'ENABLED',
    technique: 'T1070.004',
    techniqueName: 'File Deletion',
    triggerCount: 3,
    lastTriggered: 'Today, 10:26:39',
    source: 'File Integrity Monitoring',
  },
  {
    id: 'DET-007',
    name: 'SSH Authorized Keys Modification',
    description:
      'Detects changes to SSH authorized_keys configuration files.',
    category: 'PERSISTENCE',
    severity: 'WARNING',
    status: 'ENABLED',
    technique: 'T1098.004',
    techniqueName: 'SSH Authorized Keys',
    triggerCount: 4,
    lastTriggered: 'Today, 10:31:04',
    source: 'Linux Audit Logs',
  },
  {
    id: 'DET-008',
    name: 'Unsigned Binary Execution',
    description:
      'Detects execution of unsigned binaries on monitored endpoints.',
    category: 'EXECUTION',
    severity: 'WARNING',
    status: 'ENABLED',
    technique: 'T1036',
    techniqueName: 'Masquerading',
    triggerCount: 9,
    lastTriggered: 'Today, 10:25:11',
    source: 'Endpoint Telemetry',
  },
  {
    id: 'DET-009',
    name: 'Suspicious Service Creation',
    description:
      'Detects creation of new services outside approved administrative workflows.',
    category: 'PERSISTENCE',
    severity: 'WARNING',
    status: 'DISABLED',
    technique: 'T1543.003',
    techniqueName: 'Windows Service',
    triggerCount: 0,
    lastTriggered: 'Never',
    source: 'Windows System Logs',
  },
  {
    id: 'DET-010',
    name: 'Security Tool Process Termination',
    description:
      'Detects attempts to terminate endpoint security or monitoring processes.',
    category: 'DEFENSE EVASION',
    severity: 'HIGH',
    status: 'ENABLED',
    technique: 'T1562.001',
    techniqueName: 'Impair Defenses',
    triggerCount: 6,
    lastTriggered: 'Today, 09:48:22',
    source: 'Endpoint Telemetry',
  },
]

function DetectionRules() {
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredRules = useMemo(() => {
    const query = search.trim().toLowerCase()

    return detectionRules.filter((rule) => {
      const matchesSearch =
        !query ||
        rule.id.toLowerCase().includes(query) ||
        rule.name.toLowerCase().includes(query) ||
        rule.description.toLowerCase().includes(query) ||
        rule.technique.toLowerCase().includes(query) ||
        rule.techniqueName.toLowerCase().includes(query)

      const matchesSeverity =
        severityFilter === 'ALL' ||
        rule.severity === severityFilter

      const matchesCategory =
        categoryFilter === 'ALL' ||
        rule.category === categoryFilter

      const matchesStatus =
        statusFilter === 'ALL' ||
        rule.status === statusFilter

      return (
        matchesSearch &&
        matchesSeverity &&
        matchesCategory &&
        matchesStatus
      )
    })
  }, [
    search,
    severityFilter,
    categoryFilter,
    statusFilter,
  ])

  const totalRules = detectionRules.length

  const enabledRules = detectionRules.filter(
    (rule) => rule.status === 'ENABLED',
  ).length

  const highRules = detectionRules.filter(
    (rule) => rule.severity === 'HIGH',
  ).length

  const totalTriggers = detectionRules.reduce(
    (sum, rule) => sum + rule.triggerCount,
    0,
  )

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            DETECTION ENGINE
          </div>

          <h1>Detection Rules</h1>

          <p>
            Manage behavioral detections, ATT&CK mappings,
            and security analytics rules.
          </p>
        </div>

        <div className="audit-detail-status audit-detail-status-success">
          <span />
          ENGINE ONLINE
        </div>
      </div>

      <section className="detection-summary-grid">
        <div className="detection-summary-card">
          <div className="detection-summary-icon">
            <ShieldCheck size={19} />
          </div>

          <div>
            <span>TOTAL RULES</span>
            <strong>{totalRules}</strong>
          </div>
        </div>

        <div className="detection-summary-card">
          <div className="detection-summary-icon">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>ENABLED</span>
            <strong>{enabledRules}</strong>
          </div>
        </div>

        <div className="detection-summary-card">
          <div className="detection-summary-icon detection-summary-icon-high">
            <ShieldAlert size={19} />
          </div>

          <div>
            <span>HIGH SEVERITY</span>
            <strong>{highRules}</strong>
          </div>
        </div>

        <div className="detection-summary-card">
          <div className="detection-summary-icon">
            <CircleDot size={19} />
          </div>

          <div>
            <span>TOTAL TRIGGERS</span>
            <strong>{totalTriggers}</strong>
          </div>
        </div>
      </section>

      <section className="detection-toolbar">
        <div className="detection-search">
          <Search size={17} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search detection rules..."
          />
        </div>

        <div className="detection-filter">
          <Filter size={15} />

          <select
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(event.target.value)
            }
          >
            <option value="ALL">All Severity</option>
            <option value="HIGH">High</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Info</option>
          </select>
        </div>

        <div className="detection-filter">
          <Filter size={15} />

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
          >
            <option value="ALL">All Categories</option>
            <option value="EXECUTION">Execution</option>
            <option value="CREDENTIAL ACCESS">
              Credential Access
            </option>
            <option value="PRIVILEGE">Privilege</option>
            <option value="COMMAND AND CONTROL">
              Command & Control
            </option>
            <option value="DEFENSE EVASION">
              Defense Evasion
            </option>
            <option value="PERSISTENCE">Persistence</option>
          </select>
        </div>

        <div className="detection-filter">
          <Filter size={15} />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="ALL">All Status</option>
            <option value="ENABLED">Enabled</option>
            <option value="DISABLED">Disabled</option>
          </select>
        </div>
      </section>

      <section className="detection-table-panel">
        <div className="detection-table-header">
          <div>
            <strong>Detection Rule Inventory</strong>
            <span>
              {filteredRules.length} rules matching current filters
            </span>
          </div>

          <Terminal size={18} />
        </div>

        <div className="detection-table-wrap">
          <table className="detection-table">
            <thead>
              <tr>
                <th>RULE</th>
                <th>CATEGORY</th>
                <th>SEVERITY</th>
                <th>MITRE ATT&CK</th>
                <th>TRIGGERS</th>
                <th>LAST TRIGGERED</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {filteredRules.map((rule) => (
                <tr key={rule.id}>
                  <td>
                    <Link
                      to={`/detection-rules/${rule.id}`}
                      className="detection-rule-link"
                    >
                      <strong>{rule.name}</strong>
                      <span>{rule.id}</span>
                    </Link>
                  </td>

                  <td>
                    <span className="detection-category">
                      {rule.category}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`detection-severity detection-severity-${rule.severity.toLowerCase()}`}
                    >
                      {rule.severity === 'HIGH' && (
                        <AlertTriangle size={13} />
                      )}

                      {rule.severity === 'WARNING' && (
                        <AlertTriangle size={13} />
                      )}

                      {rule.severity === 'INFO' && (
                        <CircleDot size={13} />
                      )}

                      {rule.severity}
                    </span>
                  </td>

                  <td>
                    <div className="detection-technique">
                      <strong>{rule.technique}</strong>
                      <span>{rule.techniqueName}</span>
                    </div>
                  </td>

                  <td>
                    <strong className="detection-trigger-count">
                      {rule.triggerCount}
                    </strong>
                  </td>

                  <td>
                    <span className="detection-last-trigger">
                      {rule.lastTriggered}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`detection-rule-status detection-rule-status-${rule.status.toLowerCase()}`}
                    >
                      {rule.status === 'ENABLED' ? (
                        <CheckCircle2 size={13} />
                      ) : (
                        <XCircle size={13} />
                      )}

                      {rule.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRules.length === 0 && (
            <div className="detection-empty">
              <ShieldAlert size={25} />
              <strong>No detection rules found</strong>
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

export default DetectionRules