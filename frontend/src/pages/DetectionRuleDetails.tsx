import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  Globe,
  Hash,
  Info,
  Network,
  Search,
  ShieldAlert,
  ShieldCheck,
  Terminal,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

type RuleSeverity = 'INFO' | 'WARNING' | 'HIGH'
type RuleStatus = 'ENABLED' | 'DISABLED'

type DetectionRuleDetailsData = {
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
  logic: string
  condition: string
  response: string
  falsePositive: string
  createdBy: string
  createdAt: string
  updatedAt: string
  recentMatches: {
    time: string
    endpoint: string
    user: string
    source: string
    result: string
  }[]
}

const detectionRuleDetails: Record<
  string,
  DetectionRuleDetailsData
> = {
  'DET-001': {
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
    logic:
      'Trigger when powershell.exe or pwsh.exe is executed with an argument associated with execution policy bypass.',
    condition:
      'process.name IN [powershell.exe, pwsh.exe] AND command_line CONTAINS "-ExecutionPolicy Bypass"',
    response:
      'Create a high-severity detection and correlate the process with user, endpoint, file, and network telemetry.',
    falsePositive:
      'Administrative scripts and approved automation may legitimately use execution policy bypass. Validate against the approved software and administrative workflow.',
    createdBy: 'Security Engineering',
    createdAt: '2026-09-01',
    updatedAt: '2026-09-24',
    recentMatches: [
      {
        time: 'Today, 10:06:14',
        endpoint: 'WIN-01',
        user: 'Sameer',
        source: 'Process Telemetry',
        result: 'REVIEW',
      },
      {
        time: 'Today, 09:42:08',
        endpoint: 'WIN-03',
        user: 'admin',
        source: 'Process Telemetry',
        result: 'REVIEW',
      },
      {
        time: 'Yesterday, 17:21:33',
        endpoint: 'WIN-01',
        user: 'admin',
        source: 'Process Telemetry',
        result: 'RESOLVED',
      },
    ],
  },

  'DET-002': {
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
    logic:
      'Trigger when an executable is launched from a temporary or user-writable directory.',
    condition:
      'process.path MATCHES [*\\Temp\\*, *\\AppData\\Local\\Temp\\*, /tmp/*]',
    response:
      'Generate a high-severity detection and collect process, file, hash, user, and network context.',
    falsePositive:
      'Software installers and legitimate update utilities may execute from temporary directories.',
    createdBy: 'Security Engineering',
    createdAt: '2026-09-03',
    updatedAt: '2026-09-23',
    recentMatches: [
      {
        time: 'Today, 10:25:11',
        endpoint: 'WIN-02',
        user: 'Sameer',
        source: 'Endpoint Telemetry',
        result: 'REVIEW',
      },
      {
        time: 'Yesterday, 15:18:44',
        endpoint: 'WIN-04',
        user: 'user01',
        source: 'Endpoint Telemetry',
        result: 'RESOLVED',
      },
    ],
  },

  'DET-003': {
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
    logic:
      'Trigger when multiple failed authentication events are observed for the same account or source within a defined time window.',
    condition:
      'FAILED_LOGINS >= 5 FROM SAME_SOURCE WITHIN 5_MINUTES',
    response:
      'Correlate source IP, account, endpoint, and authentication events for investigation.',
    falsePositive:
      'Incorrect passwords, expired credentials, or automated services can create repeated authentication failures.',
    createdBy: 'SOC Engineering',
    createdAt: '2026-09-02',
    updatedAt: '2026-09-20',
    recentMatches: [
      {
        time: 'Today, 10:27:12',
        endpoint: 'WIN-02',
        user: 'unknown',
        source: '10.0.0.45',
        result: 'REVIEW',
      },
      {
        time: 'Today, 09:11:29',
        endpoint: 'WIN-05',
        user: 'user02',
        source: '10.0.0.22',
        result: 'RESOLVED',
      },
    ],
  },

  'DET-004': {
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
    logic:
      'Trigger when a user account is added to a local privileged administrator group.',
    condition:
      'GROUP_MEMBERSHIP_CHANGE AND TARGET_GROUP = "Administrators"',
    response:
      'Create a high-severity detection and validate the account change against the approved administration workflow.',
    falsePositive:
      'Approved IT administration and endpoint provisioning may create legitimate administrator changes.',
    createdBy: 'Identity Security',
    createdAt: '2026-09-04',
    updatedAt: '2026-09-21',
    recentMatches: [
      {
        time: 'Today, 10:18:33',
        endpoint: 'LINUX-01',
        user: 'admin',
        source: 'Security Logs',
        result: 'REVIEW',
      },
    ],
  },

  'DET-005': {
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
    logic:
      'Trigger when a monitored process establishes an outbound connection that matches suspicious process or destination conditions.',
    condition:
      'OUTBOUND_CONNECTION AND PROCESS_RISK >= HIGH',
    response:
      'Correlate the destination, process, endpoint, user, and associated file telemetry.',
    falsePositive:
      'Browsers, update agents, and approved enterprise applications regularly create outbound connections.',
    createdBy: 'Network Security',
    createdAt: '2026-09-05',
    updatedAt: '2026-09-24',
    recentMatches: [
      {
        time: 'Today, 10:06:42',
        endpoint: 'WIN-01',
        user: 'Sameer',
        source: '203.0.113.45:443',
        result: 'REVIEW',
      },
      {
        time: 'Today, 08:31:12',
        endpoint: 'WIN-03',
        user: 'admin',
        source: '198.51.100.24:443',
        result: 'RESOLVED',
      },
    ],
  },

  'DET-006': {
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
    logic:
      'Trigger when a protected security file is deleted or an attempt to delete it is observed.',
    condition:
      'FILE_DELETE AND FILE_PATH IN PROTECTED_SECURITY_PATHS',
    response:
      'Preserve the event and correlate the originating process with endpoint and user telemetry.',
    falsePositive:
      'Security software upgrades and approved configuration maintenance can modify protected files.',
    createdBy: 'Endpoint Security',
    createdAt: '2026-09-06',
    updatedAt: '2026-09-22',
    recentMatches: [
      {
        time: 'Today, 10:26:39',
        endpoint: 'WIN-02',
        user: 'SYSTEM',
        source: 'File Integrity Monitoring',
        result: 'BLOCKED',
      },
    ],
  },

  'DET-007': {
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
    logic:
      'Trigger when an authorized_keys file is created, modified, or replaced.',
    condition:
      'FILE_WRITE AND PATH ENDS_WITH ".ssh/authorized_keys"',
    response:
      'Correlate the modifying process, account, source IP, and SSH session.',
    falsePositive:
      'Legitimate SSH administration and key rotation can modify authorized_keys.',
    createdBy: 'Linux Security',
    createdAt: '2026-09-07',
    updatedAt: '2026-09-23',
    recentMatches: [
      {
        time: 'Today, 10:31:04',
        endpoint: 'LINUX-01',
        user: 'admin',
        source: '192.168.1.104',
        result: 'REVIEW',
      },
    ],
  },

  'DET-008': {
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
    logic:
      'Trigger when a binary without a trusted digital signature is executed on a monitored endpoint.',
    condition:
      'PROCESS_START AND SIGNATURE_STATUS = UNSIGNED',
    response:
      'Collect file hash, signer information, path, parent process, and network activity.',
    falsePositive:
      'Internal utilities and unsigned development tools may be legitimate.',
    createdBy: 'Endpoint Security',
    createdAt: '2026-09-08',
    updatedAt: '2026-09-23',
    recentMatches: [
      {
        time: 'Today, 10:25:11',
        endpoint: 'WIN-02',
        user: 'Sameer',
        source: 'unknown_update.exe',
        result: 'REVIEW',
      },
    ],
  },

  'DET-009': {
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
    logic:
      'Trigger when a new Windows service is created and the initiating account or binary is outside an approved workflow.',
    condition:
      'SERVICE_CREATE AND INITIATOR NOT_IN APPROVED_ADMIN_WORKFLOW',
    response:
      'Record the service name, executable path, initiating user, and parent process.',
    falsePositive:
      'Software installation and legitimate system administration may create services.',
    createdBy: 'SOC Engineering',
    createdAt: '2026-09-09',
    updatedAt: '2026-09-19',
    recentMatches: [],
  },

  'DET-010': {
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
    logic:
      'Trigger when a monitored process attempts to terminate a protected security process.',
    condition:
      'PROCESS_TERMINATION AND TARGET_PROCESS IN SECURITY_PROCESS_LIST',
    response:
      'Generate a high-severity detection and preserve process tree and endpoint telemetry.',
    falsePositive:
      'Security agent upgrades or controlled endpoint maintenance may stop protected processes.',
    createdBy: 'Endpoint Security',
    createdAt: '2026-09-10',
    updatedAt: '2026-09-24',
    recentMatches: [
      {
        time: 'Today, 09:48:22',
        endpoint: 'WIN-04',
        user: 'SYSTEM',
        source: 'Endpoint Telemetry',
        result: 'REVIEW',
      },
    ],
  },
}

type RuleAction = {
  id: number
  action_id: string
  rule_id: string
  action: string
  status: string
  analyst: string
  created_at: string
}

type RuleState = {
  rule_id: string
  status: RuleStatus
  source: string
}

const API_BASE_URL = 'http://127.0.0.1:8000'

const RESPONSE_ACTIONS = [
  { key: 'ENABLE_RULE', label: 'Enable Rule' },
  { key: 'DISABLE_RULE', label: 'Disable Rule' },
  { key: 'TEST_RULE', label: 'Test Rule' },
  { key: 'REVIEW_RULE', label: 'Review Rule' },
] as const

function DetectionRuleDetails() {
  const { ruleId } = useParams()
  const [backendState, setBackendState] = useState<RuleState | null>(null)
  const [actions, setActions] = useState<RuleAction[]>([])
  const [actionMessage, setActionMessage] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [backendConnected, setBackendConnected] = useState(false)

  const loadBackendData = async () => {
    if (!ruleId) return

    try {
      const [stateResponse, actionsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/detection-rule-actions/${ruleId}/state`),
        fetch(`${API_BASE_URL}/api/detection-rule-actions/${ruleId}/actions`),
      ])

      if (!stateResponse.ok || !actionsResponse.ok) {
        throw new Error('Detection rule backend unavailable')
      }

      const stateData = (await stateResponse.json()) as RuleState
      const actionsData = (await actionsResponse.json()) as RuleAction[]

      setBackendState(stateData)
      setActions(actionsData)
      setBackendConnected(true)
    } catch {
      setBackendConnected(false)
    }
  }

  useEffect(() => {
    void loadBackendData()
  }, [ruleId])

  const executeAction = async (action: string) => {
    if (!ruleId) return

    setActionLoading(true)
    setActionMessage('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/detection-rule-actions/${ruleId}/actions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            analyst: 'SOC Analyst',
          }),
        },
      )

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.detail ?? 'Detection rule action failed')
      }

      const created = (await response.json()) as RuleAction
      setActionMessage(`${action.replaceAll('_', ' ')} completed — ${created.status}`)
      await loadBackendData()
    } catch (error) {
      setActionMessage(
        error instanceof Error ? error.message : 'Detection rule action failed',
      )
    } finally {
      setActionLoading(false)
    }
  }

  const rule = ruleId
    ? detectionRuleDetails[ruleId]
    : undefined

  if (!rule) {
    return (
      <div className="page-container">
        <div className="detection-detail-not-found">
          <ShieldAlert size={30} />

          <h2>Detection Rule Not Found</h2>

          <p>
            The requested detection rule does not exist in
            the current detection engine dataset.
          </p>

          <Link
            to="/detection-rules"
            className="detection-detail-back"
          >
            <ArrowLeft size={14} />
            BACK TO DETECTION RULES
          </Link>
        </div>
      </div>
    )
  }

  const effectiveStatus = backendState?.status ?? rule.status
  const severityClass = rule.severity.toLowerCase()
  const statusClass = effectiveStatus.toLowerCase()

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <Link
            to="/detection-rules"
            className="detection-detail-back"
          >
            <ArrowLeft size={14} />
            DETECTION ENGINE
          </Link>

          <div className="page-eyebrow">
            DETECTION RULE INVESTIGATION
          </div>

          <h1>{rule.name}</h1>

          <p>
            Investigate detection logic, ATT&CK mapping,
            telemetry sources, and recent rule matches.
          </p>
        </div>

        <div
          className={`detection-rule-detail-status detection-rule-detail-status-${statusClass}`}
        >
          {effectiveStatus === 'ENABLED' ? (
            <CheckCircle2 size={14} />
          ) : (
            <AlertTriangle size={14} />
          )}

          {effectiveStatus}
        </div>
      </div>

      <section className="detection-detail-hero">
        <div className="detection-detail-identity">
          <div className="detection-detail-icon">
            <ShieldCheck size={24} />
          </div>

          <div>
            <div className="detection-detail-name">
              {rule.name}
            </div>

            <div className="detection-detail-id">
              {rule.id} · {rule.category}
            </div>
          </div>
        </div>

        <div className="detection-detail-hero-item">
          <span>MITRE ATT&CK</span>
          <strong>{rule.technique}</strong>
          <small>{rule.techniqueName}</small>
        </div>

        <div className="detection-detail-hero-item">
          <span>DATA SOURCE</span>
          <strong>{rule.source}</strong>
        </div>
      </section>

      <section className="detection-detail-metrics">
        <div className="detection-detail-metric">
          <ShieldAlert size={17} />

          <span>SEVERITY</span>

          <strong
            className={`detection-detail-severity-${severityClass}`}
          >
            {rule.severity}
          </strong>
        </div>

        <div className="detection-detail-metric">
          <Activity size={17} />

          <span>TOTAL TRIGGERS</span>

          <strong>{rule.triggerCount}</strong>
        </div>

        <div className="detection-detail-metric">
          <Clock3 size={17} />

          <span>LAST TRIGGERED</span>

          <strong>{rule.lastTriggered}</strong>
        </div>

        <div className="detection-detail-metric">
          <Hash size={17} />

          <span>RULE ID</span>

          <strong>{rule.id}</strong>
        </div>
      </section>

      <section className="detection-detail-grid">
        <div className="detection-detail-panel">
          <div className="detection-detail-panel-header">
            <div>
              <strong>Rule Overview</strong>
              <span>Detection identity and ownership</span>
            </div>

            <FileText size={18} />
          </div>

          <div className="detection-detail-fields">
            <div>
              <span>RULE ID</span>
              <strong>{rule.id}</strong>
            </div>

            <div>
              <span>CATEGORY</span>
              <strong>{rule.category}</strong>
            </div>

            <div>
              <span>CREATED BY</span>
              <strong>{rule.createdBy}</strong>
            </div>

            <div>
              <span>DATA SOURCE</span>
              <strong>{rule.source}</strong>
            </div>

            <div>
              <span>CREATED</span>
              <strong>{rule.createdAt}</strong>
            </div>

            <div>
              <span>LAST UPDATED</span>
              <strong>{rule.updatedAt}</strong>
            </div>

            <div className="detection-detail-field-wide">
              <span>DESCRIPTION</span>
              <strong>{rule.description}</strong>
            </div>
          </div>
        </div>

        <div className="detection-detail-panel">
          <div className="detection-detail-panel-header">
            <div>
              <strong>ATT&CK Mapping</strong>
              <span>Associated adversary technique</span>
            </div>

            <ShieldAlert size={18} />
          </div>

          <div className="detection-attack-card">
            <div className="detection-attack-icon">
              <ShieldAlert size={20} />
            </div>

            <div>
              <span>MITRE ATT&CK TECHNIQUE</span>

              <strong>{rule.technique}</strong>

              <small>{rule.techniqueName}</small>
            </div>
          </div>

          <div className="detection-info-row">
            <Info size={15} />

            <span>
              This rule maps observed endpoint or security
              behavior to an ATT&CK technique for investigation
              and correlation.
            </span>
          </div>
        </div>
      </section>

      <section className="detection-detail-panel">
        <div className="detection-detail-panel-header">
          <div>
            <strong>Detection Logic</strong>
            <span>How the rule identifies suspicious activity</span>
          </div>

          <Terminal size={18} />
        </div>

        <div className="detection-logic">
          <div className="detection-logic-block">
            <span>LOGIC</span>

            <p>{rule.logic}</p>
          </div>

          <div className="detection-condition">
            <div>
              <Terminal size={15} />
              <span>DETECTION CONDITION</span>
            </div>

            <code>{rule.condition}</code>
          </div>
        </div>
      </section>

      <section className="detection-detail-grid">
        <div className="detection-detail-panel">
          <div className="detection-detail-panel-header">
            <div>
              <strong>Response Workflow</strong>
              <span>Action taken after a rule match</span>
            </div>

            <Activity size={18} />
          </div>

          <div className="detection-response">
            <div className="detection-response-icon">
              <ShieldCheck size={17} />
            </div>

            <p>{rule.response}</p>
          </div>
        </div>

        <div className="detection-detail-panel">
          <div className="detection-detail-panel-header">
            <div>
              <strong>False Positive Guidance</strong>
              <span>Conditions requiring analyst validation</span>
            </div>

            <AlertTriangle size={18} />
          </div>

          <div className="detection-false-positive">
            <AlertTriangle size={16} />

            <p>{rule.falsePositive}</p>
          </div>
        </div>
      </section>

      <section className="detection-detail-panel">
        <div className="detection-detail-panel-header">
          <div>
            <strong>Recent Rule Matches</strong>
            <span>
              Latest telemetry events associated with this rule
            </span>
          </div>

          <Search size={18} />
        </div>

        {rule.recentMatches.length > 0 ? (
          <div className="detection-match-table-wrap">
            <table className="detection-match-table">
              <thead>
                <tr>
                  <th>TIME</th>
                  <th>ENDPOINT</th>
                  <th>USER</th>
                  <th>SOURCE</th>
                  <th>RESULT</th>
                </tr>
              </thead>

              <tbody>
                {rule.recentMatches.map((match, index) => (
                  <tr key={`${rule.id}-${index}`}>
                    <td>
                      <span className="detection-match-time">
                        {match.time}
                      </span>
                    </td>

                    <td>
                      <strong>{match.endpoint}</strong>
                    </td>

                    <td>
                      <span className="detection-match-user">
                        {match.user}
                      </span>
                    </td>

                    <td>
                      <span className="detection-match-source">
                        {match.source}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`detection-match-result detection-match-result-${match.result.toLowerCase()}`}
                      >
                        {match.result === 'REVIEW' && (
                          <AlertTriangle size={13} />
                        )}

                        {match.result === 'RESOLVED' && (
                          <CheckCircle2 size={13} />
                        )}

                        {match.result === 'BLOCKED' && (
                          <ShieldAlert size={13} />
                        )}

                        {match.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="detection-no-matches">
            <Network size={20} />

            <strong>No recent matches</strong>

            <span>
              This rule has not produced a recent detection
              event.
            </span>
          </div>
        )}
      </section>


      <section className="detection-detail-panel">
        <div className="detection-detail-panel-header">
          <div>
            <strong>Rule Response Controls</strong>
            <span>Persistent SOC actions recorded by the CyberSentinel API</span>
          </div>

          <ShieldCheck size={18} />
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {RESPONSE_ACTIONS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => void executeAction(item.key)}
                disabled={actionLoading}
                style={{
                  border: '1px solid rgba(34, 211, 238, 0.25)',
                  background: 'rgba(8, 18, 35, 0.9)',
                  color: '#cbd5e1',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  cursor: actionLoading ? 'wait' : 'pointer',
                  fontWeight: 700,
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {actionMessage && (
            <div style={{
              border: '1px solid rgba(34, 211, 238, 0.25)',
              background: 'rgba(8, 25, 40, 0.8)',
              borderRadius: '8px',
              padding: '12px 14px',
              color: '#67e8f9',
            }}>
              {actionMessage}
            </div>
          )}

          <div style={{
            border: '1px solid rgba(148, 163, 184, 0.12)',
            borderRadius: '10px',
            padding: '14px',
          }}>
            <div style={{ fontSize: '12px', letterSpacing: '0.08em', color: '#64748b', marginBottom: '8px' }}>
              BACKEND STATUS
            </div>
            <div style={{ color: backendConnected ? '#67e8f9' : '#94a3b8', fontWeight: 700 }}>
              {backendConnected ? 'BACKEND CONNECTED' : 'BACKEND UNAVAILABLE — STATIC DATA'}
            </div>
          </div>

          {actions.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', letterSpacing: '0.08em', color: '#64748b', marginBottom: '10px' }}>
                RESPONSE HISTORY
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {actions.map((item) => (
                  <div
                    key={item.action_id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '10px 12px',
                      border: '1px solid rgba(148, 163, 184, 0.10)',
                      borderRadius: '8px',
                    }}
                  >
                    <div>
                      <strong>{item.action.replaceAll('_', ' ')}</strong>
                      <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
                        {item.action_id} · {item.analyst}
                      </div>
                    </div>
                    <span style={{ color: '#67e8f9', fontWeight: 700 }}>
                      {item.status.replaceAll('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="detection-detail-grid">
        <div className="detection-detail-panel">
          <div className="detection-detail-panel-header">
            <div>
              <strong>Telemetry Sources</strong>
              <span>Security data used by this rule</span>
            </div>

            <Globe size={18} />
          </div>

          <div className="detection-source-list">
            <div>
              <Terminal size={15} />
              <span>Process Telemetry</span>
              <CheckCircle2 size={14} />
            </div>

            <div>
              <FileText size={15} />
              <span>File Telemetry</span>
              <CheckCircle2 size={14} />
            </div>

            <div>
              <Network size={15} />
              <span>Network Telemetry</span>
              <CheckCircle2 size={14} />
            </div>

            <div>
              <ShieldAlert size={15} />
              <span>Security Events</span>
              <CheckCircle2 size={14} />
            </div>
          </div>
        </div>

        <div className="detection-detail-panel">
          <div className="detection-detail-panel-header">
            <div>
              <strong>Investigation Guidance</strong>
              <span>Analyst correlation workflow</span>
            </div>

            <Activity size={18} />
          </div>

          <div className="detection-guidance">
            <div>
              <span>01</span>
              <p>Validate the original detection event.</p>
            </div>

            <div>
              <span>02</span>
              <p>Review the process and parent process.</p>
            </div>

            <div>
              <span>03</span>
              <p>Correlate file and network activity.</p>
            </div>

            <div>
              <span>04</span>
              <p>Validate user and endpoint context.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DetectionRuleDetails