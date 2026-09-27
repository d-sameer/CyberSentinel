import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bug,
  CheckCircle2,
  Clock3,
  Cpu,
  Globe,
  LockKeyhole,
  Network,
  Server,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  UserRound,
  Wifi,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'

type SecurityEvent = {
  id: string
  time: string
  severity: Severity
  event: string
  source: string
  asset: string
  category: string
  status: string
}

const events: SecurityEvent[] = [
  {
    id: 'EVT-1048',
    time: '22:41:08',
    severity: 'CRITICAL',
    event: 'Malicious outbound connection detected',
    source: 'Network Sensor',
    asset: 'WIN-01',
    category: 'Network',
    status: 'INVESTIGATING',
  },
  {
    id: 'EVT-1047',
    time: '22:41:05',
    severity: 'HIGH',
    event: 'PowerShell execution policy bypass',
    source: 'Endpoint Agent',
    asset: 'WIN-02',
    category: 'Execution',
    status: 'ALERTED',
  },
  {
    id: 'EVT-1046',
    time: '22:40:59',
    severity: 'MEDIUM',
    event: 'Multiple authentication failures',
    source: 'Identity Monitor',
    asset: 'WIN-02',
    category: 'Identity',
    status: 'BLOCKED',
  },
  {
    id: 'EVT-1045',
    time: '22:40:54',
    severity: 'HIGH',
    event: 'Unsigned process execution detected',
    source: 'EDR Sensor',
    asset: 'WIN-04',
    category: 'Process',
    status: 'INVESTIGATING',
  },
  {
    id: 'EVT-1044',
    time: '22:40:48',
    severity: 'INFO',
    event: 'Endpoint heartbeat received',
    source: 'Endpoint Agent',
    asset: 'WIN-03',
    category: 'System',
    status: 'NORMAL',
  },
  {
    id: 'EVT-1043',
    time: '22:40:42',
    severity: 'HIGH',
    event: 'Security file deletion attempt',
    source: 'File Integrity',
    asset: 'WIN-02',
    category: 'Defense Evasion',
    status: 'BLOCKED',
  },
  {
    id: 'EVT-1042',
    time: '22:40:36',
    severity: 'MEDIUM',
    event: 'New administrative group membership',
    source: 'Identity Monitor',
    asset: 'WIN-03',
    category: 'Privilege',
    status: 'REVIEW',
  },
  {
    id: 'EVT-1041',
    time: '22:40:31',
    severity: 'LOW',
    event: 'New external DNS request observed',
    source: 'Network Sensor',
    asset: 'LINUX-01',
    category: 'Network',
    status: 'MONITORED',
  },
]

const severityClass = (severity: Severity) => {
  switch (severity) {
    case 'CRITICAL':
      return 'soc-severity critical'
    case 'HIGH':
      return 'soc-severity high'
    case 'MEDIUM':
      return 'soc-severity medium'
    case 'LOW':
      return 'soc-severity low'
    default:
      return 'soc-severity info'
  }
}

const statusClass = (status: string) => {
  switch (status) {
    case 'INVESTIGATING':
      return 'soc-status investigating'
    case 'ALERTED':
      return 'soc-status alerted'
    case 'BLOCKED':
      return 'soc-status blocked'
    case 'REVIEW':
      return 'soc-status review'
    case 'NORMAL':
      return 'soc-status normal'
    default:
      return 'soc-status monitored'
  }
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  detail: string
  tone: string
}) {
  return (
    <div className={`soc-metric-card ${tone}`}>
      <div className="soc-metric-top">
        <div className="soc-metric-icon">{icon}</div>
        <span className="soc-live-dot" />
      </div>

      <div className="soc-metric-value">{value}</div>
      <div className="soc-metric-label">{label}</div>
      <div className="soc-metric-detail">{detail}</div>
    </div>
  )
}

function ActivityBar({
  label,
  value,
  width,
}: {
  label: string
  value: string
  width: string
}) {
  return (
    <div className="soc-activity-row">
      <div className="soc-activity-label">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <div className="soc-bar-track">
        <div className="soc-bar-fill" style={{ width }} />
      </div>
    </div>
  )
}

export default function SOC() {
  return (
    <div className="soc-page">
      <div className="soc-page-header">
        <div>
          <div className="soc-eyebrow">
            <span className="soc-live-indicator" />
            SECURITY OPERATIONS CENTER
          </div>

          <h1>SOC Command Center</h1>

          <p>
            Real-time security visibility across endpoints, network activity,
            identity events, threats, and active investigations.
          </p>
        </div>

        <div className="soc-header-status">
          <div className="soc-status-card">
            <span className="soc-status-dot" />

            <div>
              <strong>SOC ONLINE</strong>
              <span>All monitoring services operational</span>
            </div>
          </div>

          <div className="soc-time-card">
            <Clock3 size={15} />
            <span>Last updated 22:41:08</span>
          </div>
        </div>
      </div>

      <div className="soc-metrics-grid">
        <MetricCard
          icon={<ShieldAlert size={21} />}
          label="Active Threats"
          value="12"
          detail="+3 in the last hour"
          tone="danger"
        />

        <MetricCard
          icon={<AlertTriangle size={21} />}
          label="Critical Alerts"
          value="3"
          detail="2 require immediate review"
          tone="critical"
        />

        <MetricCard
          icon={<Server size={21} />}
          label="Endpoints at Risk"
          value="7"
          detail="3 critical systems"
          tone="warning"
        />

        <MetricCard
          icon={<Activity size={21} />}
          label="Events / Sec"
          value="184"
          detail="+12.6% from baseline"
          tone="cyan"
        />

        <MetricCard
          icon={<Network size={21} />}
          label="Network Connections"
          value="1,284"
          detail="18 suspicious"
          tone="blue"
        />

        <MetricCard
          icon={<Zap size={21} />}
          label="Open Incidents"
          value="5"
          detail="2 critical cases"
          tone="purple"
        />
      </div>

      <div className="soc-main-grid">
        <section className="soc-panel soc-event-panel">
          <div className="soc-panel-header">
            <div>
              <div className="soc-panel-kicker">
                <Activity size={14} />
                LIVE TELEMETRY
              </div>

              <h2>Security Event Stream</h2>
            </div>

            <div className="soc-stream-status">
              <span />
              STREAMING
            </div>
          </div>

          <div className="soc-event-list">
            {events.map((event) => (
              <div className="soc-event-row" key={event.id}>
                <div className="soc-event-time">{event.time}</div>

                <div className={severityClass(event.severity)}>
                  {event.severity}
                </div>

                <div className="soc-event-icon">
                  {event.category === 'Network' && <Globe size={16} />}
                  {event.category === 'Execution' && <Terminal size={16} />}
                  {event.category === 'Identity' && (
                    <UserRound size={16} />
                  )}
                  {event.category === 'Process' && <Cpu size={16} />}
                  {event.category === 'System' && <Server size={16} />}
                  {event.category === 'Defense Evasion' && (
                    <ShieldAlert size={16} />
                  )}
                  {event.category === 'Privilege' && (
                    <LockKeyhole size={16} />
                  )}
                </div>

                <div className="soc-event-content">
                  <strong>{event.event}</strong>

                  <span>
                    {event.source} • {event.asset}
                  </span>
                </div>

                <div className={statusClass(event.status)}>
                  {event.status}
                </div>

                <Link
                  to={`/soc/events/${event.id}`}
                  className="soc-event-action"
                  title="View event"
                >
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            ))}
          </div>

          <div className="soc-panel-footer">
            <span>Showing latest 8 security events</span>
            <button>View Event Stream →</button>
          </div>
        </section>

        <section className="soc-panel soc-posture-panel">
          <div className="soc-panel-header">
            <div>
              <div className="soc-panel-kicker">
                <ShieldCheck size={14} />
                SECURITY POSTURE
              </div>

              <h2>Current Risk</h2>
            </div>
          </div>

          <div className="soc-risk-score">
            <div className="soc-score-ring">
              <div>
                <strong>78</strong>
                <span>/100</span>
              </div>
            </div>

            <div className="soc-score-info">
              <strong>Elevated Risk</strong>

              <span>
                Security posture requires active monitoring and investigation.
              </span>
            </div>
          </div>

          <div className="soc-posture-list">
            <div>
              <span>
                <CheckCircle2 size={15} />
                Endpoint Coverage
              </span>

              <strong>96%</strong>
            </div>

            <div>
              <span>
                <CheckCircle2 size={15} />
                Detection Coverage
              </span>

              <strong>91%</strong>
            </div>

            <div>
              <span>
                <AlertTriangle size={15} />
                Vulnerability Exposure
              </span>

              <strong>68%</strong>
            </div>

            <div>
              <span>
                <AlertTriangle size={15} />
                Identity Risk
              </span>

              <strong>74%</strong>
            </div>
          </div>
        </section>
      </div>

      <div className="soc-secondary-grid">
        <section className="soc-panel">
          <div className="soc-panel-header">
            <div>
              <div className="soc-panel-kicker">
                <Network size={14} />
                ACTIVITY
              </div>

              <h2>Threat Activity</h2>
            </div>

            <select className="soc-select" defaultValue="1h">
              <option value="15m">Last 15 min</option>
              <option value="1h">Last 1 hour</option>
              <option value="24h">Last 24 hours</option>
            </select>
          </div>

          <div className="soc-activity-chart">
            <div className="soc-chart-grid">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="soc-chart-bars">
              {[35, 48, 42, 68, 52, 76, 61, 88, 72, 94, 79, 86].map(
                (height, index) => (
                  <div className="soc-chart-column" key={index}>
                    <div
                      className="soc-chart-bar"
                      style={{ height: `${height}%` }}
                    />

                    <span>{index + 1}</span>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="soc-chart-legend">
            <span>
              <i className="critical-dot" />
              Critical
            </span>

            <span>
              <i className="high-dot" />
              High
            </span>

            <span>
              <i className="medium-dot" />
              Medium
            </span>

            <span>
              <i className="info-dot" />
              Informational
            </span>
          </div>
        </section>

        <section className="soc-panel">
          <div className="soc-panel-header">
            <div>
              <div className="soc-panel-kicker">
                <ShieldAlert size={14} />
                THREAT CATEGORIES
              </div>

              <h2>Detection Distribution</h2>
            </div>
          </div>

          <div className="soc-activity-list">
            <ActivityBar
              label="Credential Attacks"
              value="31"
              width="88%"
            />

            <ActivityBar
              label="Suspicious Execution"
              value="24"
              width="72%"
            />

            <ActivityBar
              label="Network Anomalies"
              value="19"
              width="58%"
            />

            <ActivityBar
              label="Privilege Escalation"
              value="14"
              width="43%"
            />

            <ActivityBar
              label="Defense Evasion"
              value="9"
              width="28%"
            />

            <ActivityBar
              label="Malware Activity"
              value="7"
              width="21%"
            />
          </div>
        </section>
      </div>

      <div className="soc-bottom-grid">
        <section className="soc-panel">
          <div className="soc-panel-header">
            <div>
              <div className="soc-panel-kicker">
                <Server size={14} />
                ATTACK SURFACE
              </div>

              <h2>Endpoint Health</h2>
            </div>

            <span className="soc-panel-count">24 endpoints</span>
          </div>

          <div className="soc-health-grid">
            <div className="soc-health-card healthy">
              <CheckCircle2 size={18} />
              <strong>17</strong>
              <span>Healthy</span>
            </div>

            <div className="soc-health-card monitored">
              <Wifi size={18} />
              <strong>4</strong>
              <span>Monitored</span>
            </div>

            <div className="soc-health-card warning">
              <AlertTriangle size={18} />
              <strong>2</strong>
              <span>At Risk</span>
            </div>

            <div className="soc-health-card critical">
              <ShieldAlert size={18} />
              <strong>1</strong>
              <span>Critical</span>
            </div>
          </div>
        </section>

        <section className="soc-panel">
          <div className="soc-panel-header">
            <div>
              <div className="soc-panel-kicker">
                <UserRound size={14} />
                ANALYST ACTIVITY
              </div>

              <h2>SOC Queue</h2>
            </div>
          </div>

          <div className="soc-queue-list">
            <div className="soc-queue-item">
              <div className="soc-queue-icon critical">
                <AlertTriangle size={16} />
              </div>

              <div>
                <strong>3 critical alerts</strong>
                <span>Awaiting analyst review</span>
              </div>

              <b>03</b>
            </div>

            <div className="soc-queue-item">
              <div className="soc-queue-icon high">
                <ShieldAlert size={16} />
              </div>

              <div>
                <strong>5 active incidents</strong>
                <span>Investigation in progress</span>
              </div>

              <b>05</b>
            </div>

            <div className="soc-queue-item">
              <div className="soc-queue-icon medium">
                <Bug size={16} />
              </div>

              <div>
                <strong>7 vulnerabilities</strong>
                <span>Require remediation</span>
              </div>

              <b>07</b>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}