import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Clock3,
  Cpu,
  FileCode2,
  Network,
  ShieldAlert,
  Terminal,
  User,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

type ProcessStatus = 'NORMAL' | 'SUSPICIOUS' | 'HIGH RISK'

type ProcessDetailsData = {
  id: string
  name: string
  pid: number
  endpoint: string
  user: string
  cpu: string
  memory: string
  parent: string
  commandLine: string
  status: ProcessStatus
  executable: string
  started: string
  integrity: string
  signer: string
  hash: string
  detection: string
  networkActivity: string
}

const processData: Record<string, ProcessDetailsData> = {
  'PROC-001': {
    id: 'PROC-001',
    name: 'explorer.exe',
    pid: 2148,
    endpoint: 'WIN-01',
    user: 'SYSTEM',
    cpu: '2.4%',
    memory: '82 MB',
    parent: 'userinit.exe',
    commandLine: 'C:\\Windows\\explorer.exe',
    status: 'NORMAL',
    executable: 'C:\\Windows\\explorer.exe',
    started: 'Today, 09:12:41',
    integrity: 'Medium',
    signer: 'Microsoft Windows',
    hash: '9f3a...a821',
    detection: 'No suspicious indicators detected.',
    networkActivity: 'No abnormal network activity',
  },

  'PROC-002': {
    id: 'PROC-002',
    name: 'chrome.exe',
    pid: 5840,
    endpoint: 'WIN-01',
    user: 'Sameer',
    cpu: '8.7%',
    memory: '412 MB',
    parent: 'explorer.exe',
    commandLine:
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    status: 'NORMAL',
    executable:
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    started: 'Today, 09:18:22',
    integrity: 'Medium',
    signer: 'Google LLC',
    hash: '1c42...8d17',
    detection: 'No suspicious indicators detected.',
    networkActivity: 'Normal HTTPS browser traffic',
  },

  'PROC-003': {
    id: 'PROC-003',
    name: 'powershell.exe',
    pid: 7348,
    endpoint: 'WIN-01',
    user: 'Sameer',
    cpu: '18.9%',
    memory: '96 MB',
    parent: 'explorer.exe',
    commandLine:
      'powershell.exe -ExecutionPolicy Bypass -File update.ps1',
    status: 'HIGH RISK',
    executable: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
    started: 'Today, 10:04:17',
    integrity: 'Medium',
    signer: 'Microsoft Windows',
    hash: '72c1...4f90',
    detection:
      'ExecutionPolicy Bypass detected with script-based execution.',
    networkActivity: 'Outbound HTTPS activity observed',
  },

  'PROC-004': {
    id: 'PROC-004',
    name: 'curl',
    pid: 2217,
    endpoint: 'KALI-01',
    user: 'root',
    cpu: '4.2%',
    memory: '14 MB',
    parent: 'bash',
    commandLine:
      'curl https://example-security-endpoint.test/api',
    status: 'SUSPICIOUS',
    executable: '/usr/bin/curl',
    started: 'Today, 10:11:08',
    integrity: 'Root',
    signer: 'Ubuntu/Debian Package',
    hash: '6bd1...2c44',
    detection:
      'External network utility communicating with an unusual endpoint.',
    networkActivity: 'HTTPS connection to external endpoint',
  },

  'PROC-005': {
    id: 'PROC-005',
    name: 'systemd',
    pid: 1,
    endpoint: 'LINUX-01',
    user: 'root',
    cpu: '0.2%',
    memory: '11 MB',
    parent: 'init',
    commandLine: '/sbin/init',
    status: 'NORMAL',
    executable: '/usr/lib/systemd/systemd',
    started: 'Today, 08:41:03',
    integrity: 'Root',
    signer: 'Ubuntu System Package',
    hash: '44a2...9bc0',
    detection: 'Expected system initialization process.',
    networkActivity: 'No abnormal network activity',
  },

  'PROC-006': {
    id: 'PROC-006',
    name: 'svchost.exe',
    pid: 1180,
    endpoint: 'WIN-02',
    user: 'SYSTEM',
    cpu: '3.1%',
    memory: '64 MB',
    parent: 'services.exe',
    commandLine:
      'C:\\Windows\\System32\\svchost.exe -k netsvcs',
    status: 'NORMAL',
    executable: 'C:\\Windows\\System32\\svchost.exe',
    started: 'Today, 08:55:19',
    integrity: 'System',
    signer: 'Microsoft Windows',
    hash: 'ac91...13e2',
    detection: 'Expected Windows service host activity.',
    networkActivity: 'Normal Windows service traffic',
  },

  'PROC-007': {
    id: 'PROC-007',
    name: 'unknown_update.exe',
    pid: 9124,
    endpoint: 'WIN-02',
    user: 'Sameer',
    cpu: '31.6%',
    memory: '174 MB',
    parent: 'explorer.exe',
    commandLine:
      'C:\\Users\\Sameer\\AppData\\Local\\Temp\\unknown_update.exe',
    status: 'HIGH RISK',
    executable:
      'C:\\Users\\Sameer\\AppData\\Local\\Temp\\unknown_update.exe',
    started: 'Today, 10:23:44',
    integrity: 'Medium',
    signer: 'Unsigned',
    hash: 'e8a4...71bd',
    detection:
      'Executable launched from a temporary directory and is unsigned.',
    networkActivity: 'Outbound connection observed after execution',
  },

  'PROC-008': {
    id: 'PROC-008',
    name: 'Code.exe',
    pid: 6432,
    endpoint: 'DEV-01',
    user: 'Sameer',
    cpu: '11.3%',
    memory: '356 MB',
    parent: 'explorer.exe',
    commandLine:
      'C:\\Users\\Sameer\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe',
    status: 'NORMAL',
    executable:
      'C:\\Users\\Sameer\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe',
    started: 'Today, 09:36:51',
    integrity: 'Medium',
    signer: 'Microsoft Corporation',
    hash: 'b18c...d442',
    detection: 'No suspicious indicators detected.',
    networkActivity: 'Normal development-related HTTPS traffic',
  },
}

function ProcessDetails() {
  const { processId } = useParams()

  const process = processId ? processData[processId] : undefined

  if (!process) {
    return (
      <div className="page-container">
        <div className="process-detail-not-found">
          <ShieldAlert size={30} />

          <h2>Process Not Found</h2>

          <p>
            The requested process does not exist in the current
            investigation dataset.
          </p>

          <Link to="/processes" className="process-back-link">
            <ArrowLeft size={14} />
            Back to Processes
          </Link>
        </div>
      </div>
    )
  }

  const statusClass = process.status
    .toLowerCase()
    .replace(' ', '-')

  return (
    <div className="page-container">

      {/* =========================================
          HEADER
          ========================================= */}

      <div className="page-header">

        <div>

          <Link
            to="/processes"
            className="process-detail-back"
          >
            <ArrowLeft size={14} />
            PROCESS MONITORING
          </Link>

          <div className="page-eyebrow">
            PROCESS INVESTIGATION
          </div>

          <h1>{process.name}</h1>

          <p>
            Detailed execution context and threat investigation
            for monitored process {process.id}.
          </p>

        </div>

        <div
          className={`process-detail-status process-detail-status-${statusClass}`}
        >
          <span />
          {process.status}
        </div>

      </div>

      {/* =========================================
          PROCESS IDENTITY
          ========================================= */}

      <section className="process-detail-hero">

        <div className="process-detail-identity">

          <div className="process-detail-icon">
            <Terminal size={23} />
          </div>

          <div>

            <div className="process-detail-name">
              {process.name}
            </div>

            <div className="process-detail-id">
              {process.id} · PID {process.pid}
            </div>

          </div>

        </div>

        <div className="process-detail-endpoint">
          <span>ENDPOINT</span>
          <strong>{process.endpoint}</strong>
        </div>

        <div className="process-detail-endpoint">
          <span>USER</span>
          <strong>{process.user}</strong>
        </div>

      </section>

      {/* =========================================
          KEY METRICS
          ========================================= */}

      <section className="process-detail-metrics">

        <div className="process-detail-metric">
          <Cpu size={17} />
          <span>CPU USAGE</span>
          <strong>{process.cpu}</strong>
        </div>

        <div className="process-detail-metric">
          <Activity size={17} />
          <span>MEMORY</span>
          <strong>{process.memory}</strong>
        </div>

        <div className="process-detail-metric">
          <User size={17} />
          <span>USER CONTEXT</span>
          <strong>{process.user}</strong>
        </div>

        <div className="process-detail-metric">
          <Clock3 size={17} />
          <span>STARTED</span>
          <strong>{process.started}</strong>
        </div>

      </section>

      {/* =========================================
          INVESTIGATION GRID
          ========================================= */}

      <section className="process-detail-grid">

        {/* Execution Context */}

        <div className="process-detail-panel">

          <div className="process-detail-panel-header">
            <div>
              <strong>Execution Context</strong>
              <span>
                Process execution and parent relationship
              </span>
            </div>

            <Terminal size={18} />
          </div>

          <div className="process-detail-fields">

            <div>
              <span>PROCESS NAME</span>
              <strong>{process.name}</strong>
            </div>

            <div>
              <span>PROCESS ID</span>
              <strong>{process.pid}</strong>
            </div>

            <div>
              <span>PARENT PROCESS</span>
              <strong>{process.parent}</strong>
            </div>

            <div>
              <span>INTEGRITY LEVEL</span>
              <strong>{process.integrity}</strong>
            </div>

            <div className="process-detail-field-wide">
              <span>COMMAND LINE</span>

              <code>
                {process.commandLine}
              </code>
            </div>

            <div className="process-detail-field-wide">
              <span>EXECUTABLE PATH</span>

              <code>
                {process.executable}
              </code>
            </div>

          </div>

        </div>

        {/* Security Assessment */}

        <div className="process-detail-panel">

          <div className="process-detail-panel-header">
            <div>
              <strong>Security Assessment</strong>
              <span>
                Current threat assessment for this process
              </span>
            </div>

            <ShieldAlert size={18} />
          </div>

          <div className="process-assessment">

            <div
              className={`process-assessment-banner process-assessment-${statusClass}`}
            >
              <AlertTriangle size={17} />

              <div>
                <strong>
                  {process.status} PROCESS
                </strong>

                <span>
                  Current monitoring classification
                </span>
              </div>
            </div>

            <div className="process-assessment-row">
              <span>Detection</span>
              <strong>{process.detection}</strong>
            </div>

            <div className="process-assessment-row">
              <span>File Signer</span>
              <strong>{process.signer}</strong>
            </div>

            <div className="process-assessment-row">
              <span>SHA-256</span>
              <code>{process.hash}</code>
            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          ACTIVITY
          ========================================= */}

      <section className="process-detail-grid">

        <div className="process-detail-panel">

          <div className="process-detail-panel-header">
            <div>
              <strong>Network Activity</strong>
              <span>
                Network behavior associated with process
              </span>
            </div>

            <Network size={18} />
          </div>

          <div className="process-network-card">

            <div className="process-network-icon">
              <Network size={18} />
            </div>

            <div>
              <strong>
                Network telemetry
              </strong>

              <span>
                {process.networkActivity}
              </span>
            </div>

          </div>

        </div>

        <div className="process-detail-panel">

          <div className="process-detail-panel-header">
            <div>
              <strong>Investigation Timeline</strong>
              <span>
                Important process events
              </span>
            </div>

            <Clock3 size={18} />
          </div>

          <div className="process-timeline">

            <div className="process-timeline-item">
              <span />
              <div>
                <strong>Process started</strong>
                <small>{process.started}</small>
              </div>
            </div>

            <div className="process-timeline-item">
              <span />
              <div>
                <strong>Process telemetry collected</strong>
                <small>+12 seconds</small>
              </div>
            </div>

            <div className="process-timeline-item">
              <span />
              <div>
                <strong>Security assessment generated</strong>
                <small>+28 seconds</small>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          INVESTIGATION NOTES
          ========================================= */}

      <section className="process-detail-panel process-notes-panel">

        <div className="process-detail-panel-header">
          <div>
            <strong>Analyst Investigation Notes</strong>
            <span>
              Initial observations from endpoint telemetry
            </span>
          </div>

          <FileCode2 size={18} />
        </div>

        <div className="process-notes">

          {process.status === 'HIGH RISK' ? (
            <>
              <p>
                <AlertTriangle size={14} />
                Process requires immediate analyst review.
              </p>

              <p>
                Execution context contains indicators that may
                be associated with suspicious activity.
              </p>

              <p>
                Validate the executable, parent process,
                command-line arguments, file reputation,
                and related network connections.
              </p>
            </>
          ) : process.status === 'SUSPICIOUS' ? (
            <>
              <p>
                <ShieldAlert size={14} />
                Process behavior requires additional review.
              </p>

              <p>
                Investigate the destination, execution context,
                and reason for process initiation.
              </p>
            </>
          ) : (
            <>
              <p>
                <Activity size={14} />
                No immediate threat indicators identified.
              </p>

              <p>
                Process appears consistent with expected endpoint
                activity based on the available telemetry.
              </p>
            </>
          )}

        </div>

      </section>

    </div>
  )
}

export default ProcessDetails