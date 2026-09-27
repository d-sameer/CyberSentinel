import {
  Activity,
  AlertTriangle,
  Cpu,  
  Search,
  ShieldAlert,
  Terminal,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type ProcessStatus =
  | 'NORMAL'
  | 'SUSPICIOUS'
  | 'HIGH RISK'

type ProcessData = {
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
}

const processes: ProcessData[] = [
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
]

function Processes() {
  const navigate = useNavigate()
  const normalProcesses = processes.filter(
    (process) => process.status === 'NORMAL',
  ).length

  const suspiciousProcesses = processes.filter(
    (process) => process.status === 'SUSPICIOUS',
  ).length

  const highRiskProcesses = processes.filter(
    (process) => process.status === 'HIGH RISK',
  ).length

  return (
    <div className="page-container">

      {/* =========================================
          PAGE HEADER
          ========================================= */}

      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            ENDPOINT THREAT HUNTING
          </div>

          <h1>Processes</h1>

          <p>
            Monitor running processes, execution context,
            resource usage, and suspicious activity across
            endpoints.
          </p>
        </div>

        <div className="page-status page-process-status">
          <span />
          PROCESS MONITORING ACTIVE
        </div>
      </div>

      {/* =========================================
          PROCESS SUMMARY
          ========================================= */}

      <section className="process-summary-grid">

        <div className="process-summary-card">
          <div className="process-summary-top">
            <span>TOTAL PROCESSES</span>
            <Activity size={17} />
          </div>

          <strong>
            {String(processes.length).padStart(2, '0')}
          </strong>

          <p>
            Processes currently monitored
          </p>
        </div>

        <div className="process-summary-card">
          <div className="process-summary-top">
            <span>NORMAL</span>
            <Cpu size={17} />
          </div>

          <strong>
            {String(normalProcesses).padStart(2, '0')}
          </strong>

          <p>
            No immediate indicators
          </p>
        </div>

        <div className="process-summary-card process-summary-warning">
          <div className="process-summary-top">
            <span>SUSPICIOUS</span>
            <ShieldAlert size={17} />
          </div>

          <strong>
            {String(suspiciousProcesses).padStart(2, '0')}
          </strong>

          <p>
            Require analyst review
          </p>
        </div>

        <div className="process-summary-card process-summary-danger">
          <div className="process-summary-top">
            <span>HIGH RISK</span>
            <AlertTriangle size={17} />
          </div>

          <strong>
            {String(highRiskProcesses).padStart(2, '0')}
          </strong>

          <p>
            Potential malicious behavior
          </p>
        </div>

      </section>

      {/* =========================================
          HUNTING OVERVIEW
          ========================================= */}

      <section className="process-overview-grid">

        <div className="process-panel">

          <div className="process-panel-header">
            <div>
              <div className="process-panel-title">
                Process Resource Activity
              </div>

              <div className="process-panel-subtitle">
                CPU utilization observed across monitored
                processes
              </div>
            </div>

            <Cpu size={18} />
          </div>

          <div className="process-resource-chart">

            <div className="process-resource-grid">
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="process-resource-bars">

              <div style={{ height: '35%' }} />
              <div style={{ height: '48%' }} />
              <div style={{ height: '72%' }} />
              <div style={{ height: '28%' }} />
              <div style={{ height: '58%' }} />
              <div style={{ height: '84%' }} />
              <div style={{ height: '43%' }} />
              <div style={{ height: '66%' }} />

            </div>

            <div className="process-resource-labels">
              <span>WIN-01</span>
              <span>KALI-01</span>
              <span>LINUX-01</span>
              <span>WIN-02</span>
              <span>DEV-01</span>
            </div>

          </div>

        </div>

        <div className="process-panel">

          <div className="process-panel-header">

            <div>
              <div className="process-panel-title">
                Threat Indicators
              </div>

              <div className="process-panel-subtitle">
                Process behaviors requiring attention
              </div>
            </div>

            <ShieldAlert size={18} />

          </div>

          <div className="process-indicator-list">

            <div className="process-indicator-item">
              <div className="process-indicator-icon process-indicator-danger">
                <AlertTriangle size={15} />
              </div>

              <div>
                <strong>
                  Execution Policy Bypass
                </strong>

                <span>
                  powershell.exe on WIN-01
                </span>
              </div>
            </div>

            <div className="process-indicator-item">
              <div className="process-indicator-icon process-indicator-warning">
                <ShieldAlert size={15} />
              </div>

              <div>
                <strong>
                  External Network Tool
                </strong>

                <span>
                  curl process on KALI-01
                </span>
              </div>
            </div>

            <div className="process-indicator-item">
              <div className="process-indicator-icon process-indicator-danger">
                <AlertTriangle size={15} />
              </div>

              <div>
                <strong>
                  Temp Directory Execution
                </strong>

                <span>
                  unknown_update.exe on WIN-02
                </span>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          SEARCH BAR
          ========================================= */}

      <div className="process-toolbar">

        <div className="process-search">

          <Search size={15} />

          <input
            type="text"
            placeholder="Search process, endpoint, user or PID..."
          />

        </div>

        <div className="process-result-count">
          {processes.length} monitored processes
        </div>

      </div>

      {/* =========================================
          PROCESS TABLE
          ========================================= */}

      <section className="process-panel process-table-panel">

        <div className="process-panel-header">

          <div>
            <div className="process-panel-title">
              Running Processes
            </div>

            <div className="process-panel-subtitle">
              Process execution and endpoint telemetry
            </div>
          </div>

          <Terminal size={18} />

        </div>

        <div className="process-table-wrapper">

          <table className="process-table">

            <thead>
              <tr>
                <th>PROCESS</th>
                <th>PID</th>
                <th>ENDPOINT</th>
                <th>USER</th>
                <th>CPU</th>
                <th>MEMORY</th>
                <th>PARENT</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>

              {processes.map((process) => (

                <tr
                key={process.id}
                onClick={() => navigate(`/processes/${process.id}`)}
                style={{ cursor: 'pointer' }}
                >

                  <td>
                    <div className="process-name-cell">

                      <div className="process-name-icon">
                        <Terminal size={14} />
                      </div>

                      <div>
                        <strong>
                          {process.name}
                        </strong>

                        <span>
                          {process.id}
                        </span>
                      </div>

                    </div>
                  </td>

                  <td className="process-mono">
                    {process.pid}
                  </td>

                  <td>
                    {process.endpoint}
                  </td>

                  <td className="process-mono">
                    {process.user}
                  </td>

                  <td className="process-mono">
                    {process.cpu}
                  </td>

                  <td className="process-mono">
                    {process.memory}
                  </td>

                  <td className="process-mono">
                    {process.parent}
                  </td>

                  <td>

                    <span
                      className={`process-status process-status-${process.status
                        .toLowerCase()
                        .replace(' ', '-')}`}
                    >
                      <span />
                      {process.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  )
}

export default Processes