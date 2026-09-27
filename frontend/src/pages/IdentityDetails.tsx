import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Globe,
  KeyRound,
  LockKeyhole,
  Network,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

type AuthStatus = 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'LOCKED'
type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

type IdentityDetail = {
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
  accountType: string
  authenticationProvider: string
  sessionId: string
  relatedAlert: string
  relatedIncident: string
  assessment: string
}

const identityDetails: IdentityDetail[] = [
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
    accountType: 'Standard User',
    authenticationProvider: 'Windows Active Directory',
    sessionId: 'SES-7F91A2',
    relatedAlert: 'None',
    relatedIncident: 'None',
    assessment:
      'Authentication completed successfully with valid credentials and MFA verification. No anomalous identity behavior was observed.',
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
    accountType: 'Privileged User',
    authenticationProvider: 'Windows Active Directory',
    sessionId: 'NO SESSION',
    relatedAlert: 'ALT-003',
    relatedIncident: 'INC-002',
    assessment:
      'Repeated authentication failures were observed against a privileged account. The activity requires investigation for possible credential abuse or brute-force behavior.',
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
    accountType: 'Service Account',
    authenticationProvider: 'Windows Active Directory',
    sessionId: 'SES-81C44E',
    relatedAlert: 'ALT-008',
    relatedIncident: 'None',
    assessment:
      'A service account authenticated from an internal endpoint. The account is configured as MFA exempt because it is used for automated backup operations.',
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
    accountType: 'Unknown',
    authenticationProvider: 'Windows Active Directory',
    sessionId: 'NO SESSION',
    relatedAlert: 'ALT-011',
    relatedIncident: 'INC-003',
    assessment:
      'A high-volume authentication attempt was blocked after repeated failures from an external source. The event is consistent with automated credential attack behavior.',
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
    accountType: 'Standard User',
    authenticationProvider: 'Windows Active Directory',
    sessionId: 'SES-29A6D0',
    relatedAlert: 'ALT-014',
    relatedIncident: 'INC-006',
    assessment:
      'A user was added to a privileged security group. The change was authenticated successfully but should be validated against an approved access request.',
  },
]

const fallback: IdentityDetail = identityDetails[0]

function statusClass(status: AuthStatus) {
  return `identity-detail-status identity-detail-status-${status.toLowerCase()}`
}

function riskClass(risk: RiskLevel) {
  return `identity-detail-risk identity-detail-risk-${risk.toLowerCase()}`
}

export default function IdentityDetails() {
  const { eventId } = useParams()

  const item =
    identityDetails.find((identityEvent) => identityEvent.id === eventId) ??
    fallback

  const timeline = [
    {
      time: item.timestamp,
      title: 'Identity event observed',
      detail: `${item.event} recorded for ${item.user}.`,
      type: 'event',
    },
    {
      time: '21:37:06',
      title: 'Authentication telemetry correlated',
      detail: `Source ${item.sourceIp} mapped to ${item.endpoint}.`,
      type: 'telemetry',
    },
    {
      time: '21:37:11',
      title: 'Risk assessment completed',
      detail: `Identity risk classified as ${item.risk}.`,
      type: item.risk === 'LOW' ? 'success' : 'warning',
    },
    {
      time: '21:37:19',
      title: 'SOC review state updated',
      detail:
        item.relatedAlert !== 'None'
          ? `Correlated alert ${item.relatedAlert} is available for investigation.`
          : 'No related alert was generated.',
      type: item.relatedAlert !== 'None' ? 'warning' : 'success',
    },
  ]

  return (
    <div className="page-shell identity-detail-page">
      <div className="identity-detail-back">
        <Link to="/identity">
          <ArrowLeft size={16} />
          Back to Identity Security
        </Link>
      </div>

      <section className="identity-detail-hero">
        <div className="identity-detail-hero-main">
          <div className="identity-detail-icon">
            <KeyRound size={24} />
          </div>

          <div>
            <div className="eyebrow">IDENTITY EVENT INVESTIGATION</div>
            <h1>{item.event}</h1>
            <div className="identity-detail-id">
              {item.id} · {item.timestamp}
            </div>
          </div>
        </div>

        <div className="identity-detail-hero-status">
          <span className={statusClass(item.status)}>{item.status}</span>
          <span className={riskClass(item.risk)}>{item.risk} RISK</span>
        </div>
      </section>

      <div className="identity-detail-metrics">
        <div className="identity-detail-metric">
          <span>USER</span>
          <strong>{item.user}</strong>
          <small>{item.accountType}</small>
        </div>

        <div className="identity-detail-metric">
          <span>SOURCE IP</span>
          <strong className="mono">{item.sourceIp}</strong>
          <small>{item.location}</small>
        </div>

        <div className="identity-detail-metric">
          <span>AUTHENTICATION</span>
          <strong>{item.method}</strong>
          <small>MFA: {item.mfa}</small>
        </div>

        <div className="identity-detail-metric">
          <span>ATTEMPTS</span>
          <strong>{item.attempts}</strong>
          <small>Observed authentication attempts</small>
        </div>
      </div>

      <div className="identity-detail-grid">
        <section className="identity-detail-panel">
          <div className="identity-detail-panel-header">
            <div>
              <span className="panel-kicker">EVENT CONTEXT</span>
              <h2>Authentication Context</h2>
            </div>
            <User size={19} />
          </div>

          <div className="identity-context-grid">
            <div>
              <span>USER ACCOUNT</span>
              <strong>{item.user}</strong>
            </div>

            <div>
              <span>ACCOUNT TYPE</span>
              <strong>{item.accountType}</strong>
            </div>

            <div>
              <span>AUTH PROVIDER</span>
              <strong>{item.authenticationProvider}</strong>
            </div>

            <div>
              <span>ENDPOINT</span>
              <strong>{item.endpoint}</strong>
            </div>

            <div>
              <span>SOURCE LOCATION</span>
              <strong>{item.location}</strong>
            </div>

            <div>
              <span>SESSION</span>
              <strong className="mono">{item.sessionId}</strong>
            </div>
          </div>
        </section>

        <section className="identity-detail-panel">
          <div className="identity-detail-panel-header">
            <div>
              <span className="panel-kicker">SECURITY ASSESSMENT</span>
              <h2>Threat Assessment</h2>
            </div>

            {item.risk === 'LOW' ? (
              <ShieldCheck size={19} />
            ) : (
              <ShieldAlert size={19} />
            )}
          </div>

          <div className="identity-assessment">
            <div className={riskClass(item.risk)}>
              {item.risk} RISK
            </div>

            <p>{item.assessment}</p>
          </div>

          <div className="identity-assessment-footer">
            <div>
              <span>RELATED ALERT</span>
              <strong>{item.relatedAlert}</strong>
            </div>

            <div>
              <span>RELATED INCIDENT</span>
              <strong>{item.relatedIncident}</strong>
            </div>
          </div>
        </section>
      </div>

      <div className="identity-detail-grid">
        <section className="identity-detail-panel">
          <div className="identity-detail-panel-header">
            <div>
              <span className="panel-kicker">IDENTITY TELEMETRY</span>
              <h2>Security Signals</h2>
            </div>
            <Network size={19} />
          </div>

          <div className="identity-signal-list">
            <div className="identity-signal">
              <div className="identity-signal-icon">
                <Globe size={16} />
              </div>
              <div>
                <strong>Source Network</strong>
                <span>{item.sourceIp}</span>
              </div>
              <small>{item.location}</small>
            </div>

            <div className="identity-signal">
              <div className="identity-signal-icon">
                <LockKeyhole size={16} />
              </div>
              <div>
                <strong>MFA Verification</strong>
                <span>{item.mfa}</span>
              </div>
              <small>
                {item.mfa === 'PASSED' ? 'Verified' : 'Review'}
              </small>
            </div>

            <div className="identity-signal">
              <div className="identity-signal-icon">
                <Users size={16} />
              </div>
              <div>
                <strong>Account Privilege</strong>
                <span>{item.accountType}</span>
              </div>
              <small>
                {item.accountType.includes('Privileged')
                  ? 'Privileged'
                  : 'Standard'}
              </small>
            </div>
          </div>
        </section>

        <section className="identity-detail-panel">
          <div className="identity-detail-panel-header">
            <div>
              <span className="panel-kicker">CORRELATION</span>
              <h2>Related Security Objects</h2>
            </div>
            <CircleAlert size={19} />
          </div>

          <div className="identity-correlation-list">
            <div>
              <span>ALERT</span>
              <strong>{item.relatedAlert}</strong>
            </div>

            <div>
              <span>INCIDENT</span>
              <strong>{item.relatedIncident}</strong>
            </div>

            <div>
              <span>ENDPOINT</span>
              <strong>{item.endpoint}</strong>
            </div>

            <div>
              <span>SESSION</span>
              <strong className="mono">{item.sessionId}</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="identity-detail-panel identity-timeline-panel">
        <div className="identity-detail-panel-header">
          <div>
            <span className="panel-kicker">EVENT HISTORY</span>
            <h2>Identity Investigation Timeline</h2>
          </div>
          <Clock3 size={19} />
        </div>

        <div className="identity-timeline">
          {timeline.map((entry, index) => (
            <div className="identity-timeline-item" key={`${entry.time}-${index}`}>
              <div className={`identity-timeline-marker ${entry.type}`}>
                {entry.type === 'success' ? (
                  <CheckCircle2 size={14} />
                ) : entry.type === 'warning' ? (
                  <AlertTriangle size={14} />
                ) : (
                  <CircleAlert size={14} />
                )}
              </div>

              <div className="identity-timeline-content">
                <div>
                  <strong>{entry.title}</strong>
                  <span>{entry.time}</span>
                </div>
                <p>{entry.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="identity-response-panel">
        <div>
          <span className="panel-kicker">SOC RESPONSE</span>
          <h2>Investigation Actions</h2>
          <p>
            Review the identity event, validate the account activity, and
            correlate related security telemetry before taking response
            actions.
          </p>
        </div>

        <div className="identity-response-actions">
          <button type="button">
            <ShieldAlert size={16} />
            Create Alert
          </button>

          <button type="button">
            <Users size={16} />
            Review Account
          </button>

          <button type="button">
            <LockKeyhole size={16} />
            Lock Account
          </button>
        </div>
      </section>
    </div>
  )
}