import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  KeyRound,
  LockKeyhole,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'

type AuthStatus = 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'LOCKED'
type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

type IdentityEvent = {
  id: string
  timestamp: string
  user: string
  event: string
  status: AuthStatus
  risk: RiskLevel
  sourceIp: string
  endpoint: string
  method: string
  location: string
  attempts: number
  mfa: string
}

const identityEvents: IdentityEvent[] = [
  {
    id: 'IAM-001',
    timestamp: '2026-09-27 21:42:18',
    user: 'sameer',
    event: 'Successful Interactive Login',
    status: 'SUCCESS',
    risk: 'LOW',
    sourceIp: '192.168.1.101',
    endpoint: 'WIN-01',
    method: 'Password + MFA',
    location: 'Hyderabad, IN',
    attempts: 1,
    mfa: 'PASSED',
  },
  {
    id: 'IAM-002',
    timestamp: '2026-09-27 21:37:04',
    user: 'admin',
    event: 'Multiple Authentication Failures',
    status: 'FAILED',
    risk: 'HIGH',
    sourceIp: '10.0.0.45',
    endpoint: 'WIN-02',
    method: 'Password',
    location: 'Unknown',
    attempts: 17,
    mfa: 'NOT TRIGGERED',
  },
  {
    id: 'IAM-003',
    timestamp: '2026-09-27 21:31:52',
    user: 'svc-backup',
    event: 'Service Account Login',
    status: 'SUCCESS',
    risk: 'MEDIUM',
    sourceIp: '192.168.1.120',
    endpoint: 'WIN-03',
    method: 'Service Credential',
    location: 'Internal',
    attempts: 1,
    mfa: 'EXEMPT',
  },
  {
    id: 'IAM-004',
    timestamp: '2026-09-27 21:24:11',
    user: 'unknown',
    event: 'Brute Force Authentication Attempt',
    status: 'BLOCKED',
    risk: 'CRITICAL',
    sourceIp: '203.0.113.77',
    endpoint: 'WIN-01',
    method: 'Password',
    location: 'External',
    attempts: 43,
    mfa: 'NOT TRIGGERED',
  },
  {
    id: 'IAM-005',
    timestamp: '2026-09-27 21:15:36',
    user: 'john.doe',
    event: 'Privilege Group Membership Change',
    status: 'SUCCESS',
    risk: 'HIGH',
    sourceIp: '192.168.1.110',
    endpoint: 'WIN-02',
    method: 'Administrator',
    location: 'Internal',
    attempts: 1,
    mfa: 'PASSED',
  },
  {
    id: 'IAM-006',
    timestamp: '2026-09-27 21:08:44',
    user: 'alice',
    event: 'New User Account Created',
    status: 'SUCCESS',
    risk: 'MEDIUM',
    sourceIp: '192.168.1.115',
    endpoint: 'WIN-03',
    method: 'Administrator',
    location: 'Internal',
    attempts: 1,
    mfa: 'PASSED',
  },
  {
    id: 'IAM-007',
    timestamp: '2026-09-27 20:56:29',
    user: 'bob',
    event: 'Account Lockout',
    status: 'LOCKED',
    risk: 'HIGH',
    sourceIp: '10.0.0.52',
    endpoint: 'WIN-04',
    method: 'Password',
    location: 'Internal',
    attempts: 9,
    mfa: 'NOT TRIGGERED',
  },
  {
    id: 'IAM-008',
    timestamp: '2026-09-27 20:44:02',
    user: 'soc-analyst',
    event: 'Privileged Console Login',
    status: 'SUCCESS',
    risk: 'LOW',
    sourceIp: '192.168.1.105',
    endpoint: 'SOC-CONSOLE',
    method: 'Password + MFA',
    location: 'Hyderabad, IN',
    attempts: 1,
    mfa: 'PASSED',
  },
  {
    id: 'IAM-009',
    timestamp: '2026-09-27 20:31:47',
    user: 'test-user',
    event: 'Login From New Source',
    status: 'FAILED',
    risk: 'MEDIUM',
    sourceIp: '198.51.100.24',
    endpoint: 'WIN-01',
    method: 'Password',
    location: 'External',
    attempts: 4,
    mfa: 'NOT TRIGGERED',
  },
  {
    id: 'IAM-010',
    timestamp: '2026-09-27 20:17:15',
    user: 'administrator',
    event: 'Administrative Login',
    status: 'SUCCESS',
    risk: 'MEDIUM',
    sourceIp: '192.168.1.1',
    endpoint: 'WIN-02',
    method: 'Password + MFA',
    location: 'Internal',
    attempts: 1,
    mfa: 'PASSED',
  },
]

const statusOptions = ['ALL', 'SUCCESS', 'FAILED', 'BLOCKED', 'LOCKED']
const riskOptions = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

function statusClass(status: AuthStatus) {
  return `identity-status identity-status-${status.toLowerCase()}`
}

function riskClass(risk: RiskLevel) {
  return `identity-risk identity-risk-${risk.toLowerCase()}`
}

export default function Identity() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [riskFilter, setRiskFilter] = useState('ALL')

  const filteredEvents = useMemo(() => {
    const query = search.toLowerCase().trim()

    return identityEvents.filter((item) => {
      const matchesSearch =
        !query ||
        item.id.toLowerCase().includes(query) ||
        item.user.toLowerCase().includes(query) ||
        item.event.toLowerCase().includes(query) ||
        item.sourceIp.toLowerCase().includes(query) ||
        item.endpoint.toLowerCase().includes(query)

      const matchesStatus =
        statusFilter === 'ALL' || item.status === statusFilter

      const matchesRisk =
        riskFilter === 'ALL' || item.risk === riskFilter

      return matchesSearch && matchesStatus && matchesRisk
    })
  }, [search, statusFilter, riskFilter])

  const totalEvents = identityEvents.length
  const failedEvents = identityEvents.filter(
    (item) => item.status === 'FAILED',
  ).length
  const blockedEvents = identityEvents.filter(
    (item) => item.status === 'BLOCKED',
  ).length
  const highRiskEvents = identityEvents.filter(
    (item) => item.risk === 'HIGH' || item.risk === 'CRITICAL',
  ).length

  return (
    <div className="page-shell identity-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">IDENTITY & ACCESS SECURITY</div>
          <h1>Identity Security Center</h1>
          <p>
            Monitor authentication activity, account changes, privilege
            events, and identity-based threats across the environment.
          </p>
        </div>

        <div className="page-header-status">
          <ShieldCheck size={18} />
          IDENTITY MONITORING ACTIVE
        </div>
      </div>

      <div className="identity-stat-grid">
        <div className="identity-stat-card">
          <div className="identity-stat-icon">
            <Users size={19} />
          </div>
          <div>
            <span>TOTAL EVENTS</span>
            <strong>{totalEvents}</strong>
          </div>
          <div className="identity-stat-trend positive">
            <ArrowUpRight size={14} />
            12%
          </div>
        </div>

        <div className="identity-stat-card">
          <div className="identity-stat-icon warning">
            <CircleAlert size={19} />
          </div>
          <div>
            <span>FAILED AUTH</span>
            <strong>{failedEvents}</strong>
          </div>
          <div className="identity-stat-trend negative">
            <ArrowUpRight size={14} />
            8%
          </div>
        </div>

        <div className="identity-stat-card">
          <div className="identity-stat-icon danger">
            <LockKeyhole size={19} />
          </div>
          <div>
            <span>BLOCKED</span>
            <strong>{blockedEvents}</strong>
          </div>
          <div className="identity-stat-trend positive">
            <ArrowDownRight size={14} />
            4%
          </div>
        </div>

        <div className="identity-stat-card">
          <div className="identity-stat-icon critical">
            <AlertTriangle size={19} />
          </div>
          <div>
            <span>HIGH RISK</span>
            <strong>{highRiskEvents}</strong>
          </div>
          <div className="identity-stat-trend negative">
            <ArrowUpRight size={14} />
            15%
          </div>
        </div>
      </div>

      <div className="identity-overview-grid">
        <section className="identity-panel">
          <div className="identity-panel-header">
            <div>
              <span className="panel-kicker">AUTHENTICATION HEALTH</span>
              <h2>Identity Activity</h2>
            </div>
            <KeyRound size={19} />
          </div>

          <div className="identity-health-list">
            <div className="identity-health-row">
              <div>
                <span>Successful authentication</span>
                <small>Valid credentials and policy checks passed</small>
              </div>
              <strong className="identity-good">6</strong>
            </div>

            <div className="identity-health-row">
              <div>
                <span>Failed authentication</span>
                <small>Credentials rejected by authentication service</small>
              </div>
              <strong className="identity-warning">2</strong>
            </div>

            <div className="identity-health-row">
              <div>
                <span>Blocked authentication</span>
                <small>Security control prevented access</small>
              </div>
              <strong className="identity-danger">1</strong>
            </div>

            <div className="identity-health-row">
              <div>
                <span>Account lockouts</span>
                <small>Accounts temporarily restricted</small>
              </div>
              <strong className="identity-danger">1</strong>
            </div>
          </div>
        </section>

        <section className="identity-panel">
          <div className="identity-panel-header">
            <div>
              <span className="panel-kicker">IDENTITY CONTROLS</span>
              <h2>Security Coverage</h2>
            </div>
            <ShieldCheck size={19} />
          </div>

          <div className="identity-control-grid">
            <div className="identity-control-card">
              <CheckCircle2 size={17} />
              <span>MFA COVERAGE</span>
              <strong>86%</strong>
            </div>

            <div className="identity-control-card">
              <CheckCircle2 size={17} />
              <span>PRIVILEGED USERS</span>
              <strong>12</strong>
            </div>

            <div className="identity-control-card">
              <UserPlus size={17} />
              <span>NEW USERS / 24H</span>
              <strong>3</strong>
            </div>

            <div className="identity-control-card">
              <LockKeyhole size={17} />
              <span>LOCKOUTS / 24H</span>
              <strong>4</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="identity-events-panel">
        <div className="identity-panel-header">
          <div>
            <span className="panel-kicker">IDENTITY TELEMETRY</span>
            <h2>Authentication & Access Events</h2>
          </div>

          <span className="identity-result-count">
            {filteredEvents.length} EVENTS
          </span>
        </div>

        <div className="identity-filters">
          <div className="identity-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search user, event, IP, endpoint..."
            />
          </div>

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

          <select
            value={riskFilter}
            onChange={(event) => setRiskFilter(event.target.value)}
          >
            {riskOptions.map((option) => (
              <option key={option} value={option}>
                RISK: {option}
              </option>
            ))}
          </select>
        </div>

        <div className="identity-table-wrap">
          <table className="identity-table">
            <thead>
              <tr>
                <th>EVENT</th>
                <th>USER</th>
                <th>STATUS</th>
                <th>RISK</th>
                <th>SOURCE</th>
                <th>ENDPOINT</th>
                <th>METHOD</th>
                <th>TIME</th>
              </tr>
            </thead>

            <tbody>
              {filteredEvents.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link
                      to={`/identity/${item.id}`}
                      className="identity-event-link"
                    >
                      <strong>{item.event}</strong>
                      <span>{item.id}</span>
                    </Link>
                  </td>

                  <td>
                    <span className="identity-user">{item.user}</span>
                  </td>

                  <td>
                    <span className={statusClass(item.status)}>
                      {item.status}
                    </span>
                  </td>

                  <td>
                    <span className={riskClass(item.risk)}>{item.risk}</span>
                  </td>

                  <td>
                    <span className="identity-mono">{item.sourceIp}</span>
                  </td>

                  <td>{item.endpoint}</td>

                  <td>{item.method}</td>

                  <td>
                    <span className="identity-time">{item.timestamp}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEvents.length === 0 && (
            <div className="identity-empty">
              <Search size={22} />
              <strong>No identity events found</strong>
              <span>Try changing the search or filter criteria.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}