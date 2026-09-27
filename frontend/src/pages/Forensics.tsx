import {
  Activity,
  AlertTriangle,
  Archive,
  CalendarClock,
  Database,
  FileSearch,
  FolderSearch,
  HardDrive,
  Search,
  ShieldAlert,
  Terminal,
  User,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type EvidenceStatus =
  | 'COLLECTED'
  | 'ANALYZING'
  | 'FLAGGED'
  | 'VERIFIED'

type EvidenceType =
  | 'PROCESS'
  | 'FILE'
  | 'NETWORK'
  | 'USER ACTIVITY'
  | 'SYSTEM'

type EvidenceItem = {
  id: string
  name: string
  type: EvidenceType
  endpoint: string
  collected: string
  analyst: string
  status: EvidenceStatus
  source: string
  description: string
}

const evidenceItems: EvidenceItem[] = [
  {
    id: 'EVD-001',
    name: 'powershell.exe execution trace',
    type: 'PROCESS',
    endpoint: 'WIN-01',
    collected: 'Today, 10:06:14',
    analyst: 'SOC Analyst',
    status: 'FLAGGED',
    source: 'Process Telemetry',
    description:
      'Execution trace associated with an ExecutionPolicy Bypass command.',
  },
  {
    id: 'EVD-002',
    name: 'update.ps1 file artifact',
    type: 'FILE',
    endpoint: 'WIN-01',
    collected: 'Today, 10:06:28',
    analyst: 'SOC Analyst',
    status: 'ANALYZING',
    source: 'File Integrity',
    description:
      'PowerShell script whose integrity baseline changed after execution.',
  },
  {
    id: 'EVD-003',
    name: 'Outbound HTTPS connection',
    type: 'NETWORK',
    endpoint: 'WIN-01',
    collected: 'Today, 10:06:42',
    analyst: 'SOC Analyst',
    status: 'FLAGGED',
    source: 'Network Telemetry',
    description:
      'Outbound connection associated with suspicious process activity.',
  },
  {
    id: 'EVD-004',
    name: 'unknown_update.exe execution',
    type: 'PROCESS',
    endpoint: 'WIN-02',
    collected: 'Today, 10:25:11',
    analyst: 'SOC Analyst',
    status: 'FLAGGED',
    source: 'Process Telemetry',
    description:
      'Unsigned executable launched from a temporary directory.',
  },
  {
    id: 'EVD-005',
    name: 'payload.bin creation',
    type: 'FILE',
    endpoint: 'WIN-02',
    collected: 'Today, 10:25:23',
    analyst: 'SOC Analyst',
    status: 'ANALYZING',
    source: 'File Integrity',
    description:
      'New binary created shortly after suspicious process execution.',
  },
  {
    id: 'EVD-006',
    name: 'SSH authorization change',
    type: 'USER ACTIVITY',
    endpoint: 'LINUX-01',
    collected: 'Today, 09:59:03',
    analyst: 'SOC Analyst',
    status: 'VERIFIED',
    source: 'Authentication Logs',
    description:
      'Change to the authorized_keys file associated with an SSH session.',
  },
  {
    id: 'EVD-007',
    name: 'Windows security rules deletion',
    type: 'SYSTEM',
    endpoint: 'WIN-02',
    collected: 'Today, 10:26:39',
    analyst: 'SOC Analyst',
    status: 'FLAGGED',
    source: 'File Integrity',
    description:
      'Protected security rules file was deleted from the endpoint.',
  },
  {
    id: 'EVD-008',
    name: 'Endpoint authentication events',
    type: 'USER ACTIVITY',
    endpoint: 'WIN-02',
    collected: 'Today, 10:27:12',
    analyst: 'SOC Analyst',
    status: 'COLLECTED',
    source: 'Windows Event Logs',
    description:
      'Authentication activity collected for timeline correlation.',
  },
]

function Forensics() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | EvidenceStatus
  >('ALL')

  const collectedCount = evidenceItems.filter(
    (item) => item.status === 'COLLECTED',
  ).length

  const analyzingCount = evidenceItems.filter(
    (item) => item.status === 'ANALYZING',
  ).length

  const flaggedCount = evidenceItems.filter(
    (item) => item.status === 'FLAGGED',
  ).length

  const filteredEvidence = useMemo(() => {
    const query = search.toLowerCase().trim()

    return evidenceItems.filter((item) => {
      const matchesSearch =
        !query ||
        item.id.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.endpoint.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)

      const matchesStatus =
        statusFilter === 'ALL' ||
        item.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter])

  return (
    <div className="page-container">

      {/* =========================================
          PAGE HEADER
          ========================================= */}

      <div className="page-header">

        <div>
          <div className="page-eyebrow">
            DIGITAL FORENSICS & INCIDENT RESPONSE
          </div>

          <h1>Forensics</h1>

          <p>
            Collect, correlate, and investigate digital evidence
            from monitored endpoints and security telemetry.
          </p>
        </div>

        <div className="page-status page-forensics-status">
          <span />
          FORENSIC COLLECTION ACTIVE
        </div>

      </div>

      {/* =========================================
          EVIDENCE SUMMARY
          ========================================= */}

      <section className="forensics-summary-grid">

        <div className="forensics-summary-card">

          <div className="forensics-summary-top">
            <span>TOTAL EVIDENCE</span>
            <Database size={17} />
          </div>

          <strong>
            {String(evidenceItems.length).padStart(2, '0')}
          </strong>

          <p>
            Evidence items collected
          </p>

        </div>

        <div className="forensics-summary-card">

          <div className="forensics-summary-top">
            <span>COLLECTED</span>
            <Archive size={17} />
          </div>

          <strong>
            {String(collectedCount).padStart(2, '0')}
          </strong>

          <p>
            Awaiting analysis
          </p>

        </div>

        <div className="forensics-summary-card forensics-summary-warning">

          <div className="forensics-summary-top">
            <span>ANALYZING</span>
            <FileSearch size={17} />
          </div>

          <strong>
            {String(analyzingCount).padStart(2, '0')}
          </strong>

          <p>
            Under investigation
          </p>

        </div>

        <div className="forensics-summary-card forensics-summary-danger">

          <div className="forensics-summary-top">
            <span>FLAGGED</span>
            <AlertTriangle size={17} />
          </div>

          <strong>
            {String(flaggedCount).padStart(2, '0')}
          </strong>

          <p>
            Requires analyst attention
          </p>

        </div>

      </section>

      {/* =========================================
          FORENSIC OVERVIEW
          ========================================= */}

      <section className="forensics-overview-grid">

        <div className="forensics-panel">

          <div className="forensics-panel-header">

            <div>
              <div className="forensics-panel-title">
                Investigation Timeline
              </div>

              <div className="forensics-panel-subtitle">
                Evidence activity correlated across the current
                investigation window
              </div>
            </div>

            <CalendarClock size={18} />

          </div>

          <div className="forensics-timeline-chart">

            <div className="forensics-chart-grid">
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="forensics-timeline-line">

              <div className="forensics-event-dot" />
              <div className="forensics-event-dot" />
              <div className="forensics-event-dot" />
              <div className="forensics-event-dot" />
              <div className="forensics-event-dot" />
              <div className="forensics-event-dot" />
              <div className="forensics-event-dot" />

            </div>

            <div className="forensics-time-labels">
              <span>08:00</span>
              <span>09:00</span>
              <span>10:00</span>
              <span>11:00</span>
            </div>

          </div>

        </div>

        <div className="forensics-panel">

          <div className="forensics-panel-header">

            <div>
              <div className="forensics-panel-title">
                Evidence Categories
              </div>

              <div className="forensics-panel-subtitle">
                Distribution of collected forensic artifacts
              </div>
            </div>

            <FolderSearch size={18} />

          </div>

          <div className="forensics-category-list">

            <div className="forensics-category-item">

              <div className="forensics-category-icon">
                <Terminal size={15} />
              </div>

              <div className="forensics-category-content">

                <strong>Process Evidence</strong>

                <span>
                  Execution and parent-child relationships
                </span>

              </div>

              <b>02</b>

            </div>

            <div className="forensics-category-item">

              <div className="forensics-category-icon">
                <FileSearch size={15} />
              </div>

              <div className="forensics-category-content">

                <strong>File Evidence</strong>

                <span>
                  File changes and integrity artifacts
                </span>

              </div>

              <b>02</b>

            </div>

            <div className="forensics-category-item">

              <div className="forensics-category-icon">
                <Activity size={15} />
              </div>

              <div className="forensics-category-content">

                <strong>Network Evidence</strong>

                <span>
                  Connections and communication artifacts
                </span>

              </div>

              <b>01</b>

            </div>

            <div className="forensics-category-item">

              <div className="forensics-category-icon">
                <User size={15} />
              </div>

              <div className="forensics-category-content">

                <strong>User Activity</strong>

                <span>
                  Authentication and account activity
                </span>

              </div>

              <b>02</b>

            </div>

            <div className="forensics-category-item">

              <div className="forensics-category-icon">
                <HardDrive size={15} />
              </div>

              <div className="forensics-category-content">

                <strong>System Evidence</strong>

                <span>
                  OS and security configuration artifacts
                </span>

              </div>

              <b>01</b>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          COLLECTION STATUS
          ========================================= */}

      <section className="forensics-collection-panel">

        <div className="forensics-collection-header">

          <div>

            <div className="forensics-panel-title">
              Evidence Collection Status
            </div>

            <div className="forensics-panel-subtitle">
              Endpoint evidence sources currently available
            </div>

          </div>

          <ShieldAlert size={18} />

        </div>

        <div className="forensics-collection-grid">

          <div className="forensics-source-card">

            <div className="forensics-source-icon">
              <Terminal size={17} />
            </div>

            <div>
              <strong>Process Telemetry</strong>
              <span>WIN-01 / WIN-02</span>
            </div>

            <b>ACTIVE</b>

          </div>

          <div className="forensics-source-card">

            <div className="forensics-source-icon">
              <FileSearch size={17} />
            </div>

            <div>
              <strong>File Integrity</strong>
              <span>WIN-01 / WIN-02 / LINUX-01</span>
            </div>

            <b>ACTIVE</b>

          </div>

          <div className="forensics-source-card">

            <div className="forensics-source-icon">
              <Activity size={17} />
            </div>

            <div>
              <strong>Network Telemetry</strong>
              <span>5 active connection records</span>
            </div>

            <b>ACTIVE</b>

          </div>

          <div className="forensics-source-card">

            <div className="forensics-source-icon">
              <Database size={17} />
            </div>

            <div>
              <strong>Event Logs</strong>
              <span>Windows / Linux telemetry</span>
            </div>

            <b>ACTIVE</b>

          </div>

        </div>

      </section>

      {/* =========================================
          SEARCH / FILTER
          ========================================= */}

      <div className="forensics-toolbar">

        <div className="forensics-search">

          <Search size={15} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search evidence, endpoint, source..."
          />

        </div>

        <div className="forensics-filter-group">

          {(
            [
              'ALL',
              'COLLECTED',
              'ANALYZING',
              'FLAGGED',
              'VERIFIED',
            ] as const
          ).map((status) => (

            <button
              key={status}
              type="button"
              className={
                statusFilter === status
                  ? 'forensics-filter-button forensics-filter-active'
                  : 'forensics-filter-button'
              }
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>

          ))}

        </div>

        <div className="forensics-result-count">
          {filteredEvidence.length} evidence items
        </div>

      </div>

      {/* =========================================
          EVIDENCE TABLE
          ========================================= */}

      <section className="forensics-panel forensics-table-panel">

        <div className="forensics-panel-header">

          <div>

            <div className="forensics-panel-title">
              Evidence Repository
            </div>

            <div className="forensics-panel-subtitle">
              Digital artifacts collected for investigation
            </div>

          </div>

          <FolderSearch size={18} />

        </div>

        <div className="forensics-table-wrapper">

          <table className="forensics-table">

            <thead>

              <tr>
                <th>EVIDENCE</th>
                <th>TYPE</th>
                <th>ENDPOINT</th>
                <th>SOURCE</th>
                <th>COLLECTED</th>
                <th>STATUS</th>
              </tr>

            </thead>

            <tbody>

              {filteredEvidence.map((item) => (
                
                <tr
                key={item.id}
                className="forensics-clickable-row"
                >

                  <td>
                    
                    <Link
                    to={`/forensics/${item.id}`}
                    className="forensics-evidence-link"
                    >
                      
                      <div className="forensics-evidence-cell">
                        
                        <div className="forensics-evidence-icon">
                          <FileSearch size={14} />
                        </div>
                        
                        <div>
                          
                          <strong>
                            {item.name}
                          </strong>
                          
                          <span>
                            {item.id}
                          </span>

                        </div>
                        
                      </div>
                      
                    </Link>
                    
                  </td>

                  <td>

                    <span className="forensics-type">
                      {item.type}
                    </span>

                  </td>

                  <td className="forensics-mono">
                    {item.endpoint}
                  </td>

                  <td>

                    <div className="forensics-source-cell">

                      <strong>
                        {item.source}
                      </strong>

                      <span>
                        {item.description}
                      </span>

                    </div>

                  </td>

                  <td className="forensics-mono">
                    {item.collected}
                  </td>

                  <td>

                    <span
                      className={`forensics-status forensics-status-${item.status.toLowerCase()}`}
                    >
                      <span />
                      {item.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {filteredEvidence.length === 0 && (
            <div className="forensics-empty-state">

              <Search size={22} />

              <strong>
                No matching evidence
              </strong>

              <span>
                Try changing the search or status filter.
              </span>

            </div>
          )}

        </div>

      </section>

    </div>
  )
}

export default Forensics