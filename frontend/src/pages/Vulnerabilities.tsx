import {
  AlertTriangle,
  ArrowUpRight,
  Bug,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Search,
  ShieldAlert,
  ShieldCheck,
  Server,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
type Status = 'OPEN' | 'PATCH AVAILABLE' | 'MITIGATED' | 'ACCEPTED'

type Vulnerability = {
  id: string
  cve: string
  title: string
  severity: Severity
  cvss: number
  status: Status
  asset: string
  assetType: string
  discovered: string
  lastSeen: string
  exploitAvailable: boolean
  patch: string
  category: string
}

const vulnerabilities: Vulnerability[] = [
  {
    id: 'VULN-001',
    cve: 'CVE-2024-21413',
    title: 'Microsoft Outlook Remote Code Execution',
    severity: 'CRITICAL',
    cvss: 9.8,
    status: 'OPEN',
    asset: 'WIN-01',
    assetType: 'Windows Endpoint',
    discovered: '2026-09-18',
    lastSeen: '2026-09-27 21:40',
    exploitAvailable: true,
    patch: 'KB5036893',
    category: 'Remote Code Execution',
  },
  {
    id: 'VULN-002',
    cve: 'CVE-2023-23397',
    title: 'Microsoft Outlook Privilege Escalation',
    severity: 'CRITICAL',
    cvss: 9.8,
    status: 'PATCH AVAILABLE',
    asset: 'WIN-02',
    assetType: 'Windows Endpoint',
    discovered: '2026-09-17',
    lastSeen: '2026-09-27 21:32',
    exploitAvailable: true,
    patch: 'KB5029847',
    category: 'Privilege Escalation',
  },
  {
    id: 'VULN-003',
    cve: 'CVE-2021-44228',
    title: 'Apache Log4j2 JNDI Injection',
    severity: 'CRITICAL',
    cvss: 10.0,
    status: 'MITIGATED',
    asset: 'APP-SRV-01',
    assetType: 'Application Server',
    discovered: '2026-09-11',
    lastSeen: '2026-09-26 18:20',
    exploitAvailable: true,
    patch: 'Log4j 2.17.1+',
    category: 'Remote Code Execution',
  },
  {
    id: 'VULN-004',
    cve: 'CVE-2022-30190',
    title: 'Microsoft Support Diagnostic Tool RCE',
    severity: 'HIGH',
    cvss: 7.8,
    status: 'OPEN',
    asset: 'WIN-03',
    assetType: 'Windows Endpoint',
    discovered: '2026-09-20',
    lastSeen: '2026-09-27 20:44',
    exploitAvailable: true,
    patch: 'KB5014699',
    category: 'Remote Code Execution',
  },
  {
    id: 'VULN-005',
    cve: 'CVE-2023-4863',
    title: 'WebP Heap Buffer Overflow',
    severity: 'HIGH',
    cvss: 8.8,
    status: 'PATCH AVAILABLE',
    asset: 'WIN-04',
    assetType: 'Windows Endpoint',
    discovered: '2026-09-19',
    lastSeen: '2026-09-27 19:52',
    exploitAvailable: false,
    patch: 'Chrome 116.0.5845.187+',
    category: 'Memory Corruption',
  },
  {
    id: 'VULN-006',
    cve: 'CVE-2023-34362',
    title: 'MOVEit Transfer SQL Injection',
    severity: 'HIGH',
    cvss: 9.8,
    status: 'MITIGATED',
    asset: 'FILE-SRV-01',
    assetType: 'File Server',
    discovered: '2026-09-09',
    lastSeen: '2026-09-25 16:31',
    exploitAvailable: true,
    patch: 'MOVEit 2023.0.4+',
    category: 'SQL Injection',
  },
  {
    id: 'VULN-007',
    cve: 'CVE-2024-3094',
    title: 'XZ Utils Backdoor',
    severity: 'HIGH',
    cvss: 10.0,
    status: 'OPEN',
    asset: 'LINUX-01',
    assetType: 'Linux Server',
    discovered: '2026-09-22',
    lastSeen: '2026-09-27 18:44',
    exploitAvailable: true,
    patch: 'xz-utils 5.6.2+',
    category: 'Supply Chain',
  },
  {
    id: 'VULN-008',
    cve: 'CVE-2022-22965',
    title: 'Spring Framework Data Binding RCE',
    severity: 'HIGH',
    cvss: 9.8,
    status: 'PATCH AVAILABLE',
    asset: 'APP-SRV-02',
    assetType: 'Application Server',
    discovered: '2026-09-16',
    lastSeen: '2026-09-26 14:12',
    exploitAvailable: true,
    patch: 'Spring Framework 5.3.18+',
    category: 'Remote Code Execution',
  },
  {
    id: 'VULN-009',
    cve: 'CVE-2023-0286',
    title: 'OpenSSL X.400 Address Type Confusion',
    severity: 'MEDIUM',
    cvss: 7.4,
    status: 'OPEN',
    asset: 'LINUX-02',
    assetType: 'Linux Server',
    discovered: '2026-09-21',
    lastSeen: '2026-09-27 17:22',
    exploitAvailable: false,
    patch: 'OpenSSL 3.0.8+',
    category: 'Cryptographic',
  },
  {
    id: 'VULN-010',
    cve: 'CVE-2023-34363',
    title: 'MOVEit Transfer Authentication Bypass',
    severity: 'MEDIUM',
    cvss: 6.5,
    status: 'ACCEPTED',
    asset: 'FILE-SRV-02',
    assetType: 'File Server',
    discovered: '2026-09-13',
    lastSeen: '2026-09-24 12:40',
    exploitAvailable: false,
    patch: 'MOVEit Security Update',
    category: 'Authentication Bypass',
  },
]

const severityOptions = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
const statusOptions = [
  'ALL',
  'OPEN',
  'PATCH AVAILABLE',
  'MITIGATED',
  'ACCEPTED',
]

function severityClass(severity: Severity) {
  return `vuln-severity vuln-severity-${severity.toLowerCase()}`
}

function statusClass(status: Status) {
  return `vuln-status vuln-status-${status
    .toLowerCase()
    .replaceAll(' ', '-')}`
}

export default function Vulnerabilities() {
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredVulnerabilities = useMemo(() => {
    const query = search.toLowerCase().trim()

    return vulnerabilities.filter((item) => {
      const matchesSearch =
        !query ||
        item.id.toLowerCase().includes(query) ||
        item.cve.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query) ||
        item.asset.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)

      const matchesSeverity =
        severityFilter === 'ALL' || item.severity === severityFilter

      const matchesStatus =
        statusFilter === 'ALL' || item.status === statusFilter

      return matchesSearch && matchesSeverity && matchesStatus
    })
  }, [search, severityFilter, statusFilter])

  const total = vulnerabilities.length
  const critical = vulnerabilities.filter(
    (item) => item.severity === 'CRITICAL',
  ).length
  const high = vulnerabilities.filter(
    (item) => item.severity === 'HIGH',
  ).length
  const exploitable = vulnerabilities.filter(
    (item) => item.exploitAvailable,
  ).length

  const openCount = vulnerabilities.filter(
    (item) => item.status === 'OPEN',
  ).length

  const mitigatedCount = vulnerabilities.filter(
    (item) => item.status === 'MITIGATED',
  ).length

  return (
    <div className="page-shell vulnerability-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">VULNERABILITY MANAGEMENT</div>
          <h1>Vulnerability Center</h1>
          <p>
            Monitor CVEs, CVSS risk, exploitable weaknesses, affected assets,
            and remediation status across the environment.
          </p>
        </div>

        <div className="page-header-status">
          <ShieldCheck size={18} />
          VULNERABILITY SCANNING ACTIVE
        </div>
      </div>

      <div className="vuln-stat-grid">
        <div className="vuln-stat-card">
          <div className="vuln-stat-icon">
            <Bug size={19} />
          </div>

          <div>
            <span>TOTAL FINDINGS</span>
            <strong>{total}</strong>
          </div>

          <div className="vuln-stat-trend positive">
            <ArrowUpRight size={14} />
            9%
          </div>
        </div>

        <div className="vuln-stat-card">
          <div className="vuln-stat-icon critical">
            <ShieldAlert size={19} />
          </div>

          <div>
            <span>CRITICAL</span>
            <strong>{critical}</strong>
          </div>

          <div className="vuln-stat-trend negative">
            <ArrowUpRight size={14} />
            18%
          </div>
        </div>

        <div className="vuln-stat-card">
          <div className="vuln-stat-icon warning">
            <AlertTriangle size={19} />
          </div>

          <div>
            <span>HIGH SEVERITY</span>
            <strong>{high}</strong>
          </div>

          <div className="vuln-stat-trend negative">
            <ArrowUpRight size={14} />
            11%
          </div>
        </div>

        <div className="vuln-stat-card">
          <div className="vuln-stat-icon danger">
            <CircleAlert size={19} />
          </div>

          <div>
            <span>EXPLOIT AVAILABLE</span>
            <strong>{exploitable}</strong>
          </div>

          <div className="vuln-stat-trend negative">
            <ArrowUpRight size={14} />
            22%
          </div>
        </div>
      </div>

      <div className="vuln-overview-grid">
        <section className="vuln-panel">
          <div className="vuln-panel-header">
            <div>
              <span className="panel-kicker">REMEDIATION OVERVIEW</span>
              <h2>Vulnerability Lifecycle</h2>
            </div>

            <Clock3 size={19} />
          </div>

          <div className="vuln-lifecycle">
            <div className="vuln-lifecycle-row">
              <div>
                <span>Open findings</span>
                <small>Require investigation or remediation</small>
              </div>
              <strong className="vuln-text-danger">{openCount}</strong>
            </div>

            <div className="vuln-lifecycle-row">
              <div>
                <span>Patch available</span>
                <small>Vendor remediation is available</small>
              </div>
              <strong className="vuln-text-warning">
                {
                  vulnerabilities.filter(
                    (item) => item.status === 'PATCH AVAILABLE',
                  ).length
                }
              </strong>
            </div>

            <div className="vuln-lifecycle-row">
              <div>
                <span>Mitigated</span>
                <small>Controls or patches applied</small>
              </div>
              <strong className="vuln-text-good">{mitigatedCount}</strong>
            </div>

            <div className="vuln-lifecycle-row">
              <div>
                <span>Accepted risk</span>
                <small>Risk accepted by security management</small>
              </div>
              <strong>{vulnerabilities.filter(
                (item) => item.status === 'ACCEPTED',
              ).length}</strong>
            </div>
          </div>
        </section>

        <section className="vuln-panel">
          <div className="vuln-panel-header">
            <div>
              <span className="panel-kicker">ASSET EXPOSURE</span>
              <h2>Security Coverage</h2>
            </div>

            <Server size={19} />
          </div>

          <div className="vuln-coverage-grid">
            <div className="vuln-coverage-card">
              <Server size={17} />
              <span>AFFECTED ASSETS</span>
              <strong>10</strong>
            </div>

            <div className="vuln-coverage-card">
              <ShieldAlert size={17} />
              <span>EXPLOITABLE CVEs</span>
              <strong>{exploitable}</strong>
            </div>

            <div className="vuln-coverage-card">
              <CheckCircle2 size={17} />
              <span>PATCHED / MITIGATED</span>
              <strong>{mitigatedCount}</strong>
            </div>

            <div className="vuln-coverage-card">
              <CircleAlert size={17} />
              <span>CVSS ≥ 9.0</span>
              <strong>
                {vulnerabilities.filter((item) => item.cvss >= 9).length}
              </strong>
            </div>
          </div>
        </section>
      </div>

      <section className="vuln-events-panel">
        <div className="vuln-panel-header">
          <div>
            <span className="panel-kicker">VULNERABILITY TELEMETRY</span>
            <h2>Detected Vulnerabilities</h2>
          </div>

          <span className="vuln-result-count">
            {filteredVulnerabilities.length} FINDINGS
          </span>
        </div>

        <div className="vuln-filters">
          <div className="vuln-search">
            <Search size={17} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search CVE, vulnerability, asset..."
            />
          </div>

          <select
            value={severityFilter}
            onChange={(event) => setSeverityFilter(event.target.value)}
          >
            {severityOptions.map((option) => (
              <option key={option} value={option}>
                SEVERITY: {option}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                STATUS: {option}
              </option>
            ))}
          </select>
        </div>

        <div className="vuln-table-wrap">
          <table className="vuln-table">
            <thead>
              <tr>
                <th>CVE</th>
                <th>VULNERABILITY</th>
                <th>SEVERITY</th>
                <th>CVSS</th>
                <th>ASSET</th>
                <th>STATUS</th>
                <th>EXPLOIT</th>
                <th>LAST SEEN</th>
              </tr>
            </thead>

            <tbody>
              {filteredVulnerabilities.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link
                      to={`/vulnerabilities/${item.id}`}
                      className="vuln-cve-link"
                    >
                      <strong>{item.cve}</strong>
                      <span>{item.id}</span>
                    </Link>
                  </td>

                  <td>
                    <div className="vuln-title-cell">
                      <strong>{item.title}</strong>
                      <span>{item.category}</span>
                    </div>
                  </td>

                  <td>
                    <span className={severityClass(item.severity)}>
                      {item.severity}
                    </span>
                  </td>

                  <td>
                    <span className="vuln-cvss">{item.cvss.toFixed(1)}</span>
                  </td>

                  <td>
                    <div className="vuln-asset">
                      <strong>{item.asset}</strong>
                      <span>{item.assetType}</span>
                    </div>
                  </td>

                  <td>
                    <span className={statusClass(item.status)}>
                      {item.status}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        item.exploitAvailable
                          ? 'vuln-exploit yes'
                          : 'vuln-exploit no'
                      }
                    >
                      {item.exploitAvailable ? 'AVAILABLE' : 'NONE'}
                    </span>
                  </td>

                  <td>
                    <span className="vuln-time">{item.lastSeen}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredVulnerabilities.length === 0 && (
            <div className="vuln-empty">
              <Search size={22} />
              <strong>No vulnerabilities found</strong>
              <span>Try changing the search or filter criteria.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}