import {
  AlertTriangle,
  CheckCircle2,
  File,
  FileCheck2,
  FileWarning,
  Search,
  ShieldAlert,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type FileStatus =
  | 'CLEAN'
  | 'MODIFIED'
  | 'CREATED'
  | 'DELETED'

type FileData = {
  id: string
  fileName: string
  path: string
  endpoint: string
  user: string
  process: string
  status: FileStatus
  hashBefore: string
  hashAfter: string
  lastModified: string
  size: string
}

const files: FileData[] = [
  {
    id: 'FILE-001',
    fileName: 'hosts',
    path: 'C:\\Windows\\System32\\drivers\\etc\\hosts',
    endpoint: 'WIN-01',
    user: 'SYSTEM',
    process: 'svchost.exe',
    status: 'CLEAN',
    hashBefore: '7f3a...91bc',
    hashAfter: '7f3a...91bc',
    lastModified: 'Today, 08:42:12',
    size: '1.2 KB',
  },
  {
    id: 'FILE-002',
    fileName: 'update.ps1',
    path: 'C:\\Users\\Sameer\\Downloads\\update.ps1',
    endpoint: 'WIN-01',
    user: 'Sameer',
    process: 'powershell.exe',
    status: 'MODIFIED',
    hashBefore: '81c4...2fa1',
    hashAfter: 'd92a...71e4',
    lastModified: 'Today, 10:04:29',
    size: '8.4 KB',
  },
  {
    id: 'FILE-003',
    fileName: 'config.json',
    path: 'C:\\ProgramData\\CyberSentinel\\config.json',
    endpoint: 'WIN-02',
    user: 'SYSTEM',
    process: 'unknown_update.exe',
    status: 'MODIFIED',
    hashBefore: '12ab...9d20',
    hashAfter: '83fe...4c11',
    lastModified: 'Today, 10:24:03',
    size: '4.8 KB',
  },
  {
    id: 'FILE-004',
    fileName: 'payload.bin',
    path: 'C:\\Users\\Sameer\\AppData\\Local\\Temp\\payload.bin',
    endpoint: 'WIN-02',
    user: 'Sameer',
    process: 'unknown_update.exe',
    status: 'CREATED',
    hashBefore: '-',
    hashAfter: 'a91e...5f02',
    lastModified: 'Today, 10:24:09',
    size: '182 KB',
  },
  {
    id: 'FILE-005',
    fileName: 'sshd_config',
    path: '/etc/ssh/sshd_config',
    endpoint: 'LINUX-01',
    user: 'root',
    process: 'sshd',
    status: 'CLEAN',
    hashBefore: 'a72c...44e1',
    hashAfter: 'a72c...44e1',
    lastModified: 'Today, 08:43:17',
    size: '3.1 KB',
  },
  {
    id: 'FILE-006',
    fileName: 'authorized_keys',
    path: '/home/admin/.ssh/authorized_keys',
    endpoint: 'LINUX-01',
    user: 'admin',
    process: 'sshd',
    status: 'MODIFIED',
    hashBefore: '3ab1...a918',
    hashAfter: '8fe4...c220',
    lastModified: 'Today, 09:58:42',
    size: '1.7 KB',
  },
  {
    id: 'FILE-007',
    fileName: 'startup.cmd',
    path: 'C:\\Users\\Public\\startup.cmd',
    endpoint: 'DEV-01',
    user: 'Sameer',
    process: 'cmd.exe',
    status: 'CREATED',
    hashBefore: '-',
    hashAfter: 'c812...b991',
    lastModified: 'Today, 10:17:31',
    size: '2.2 KB',
  },
  {
    id: 'FILE-008',
    fileName: 'temp_rules.xml',
    path: 'C:\\ProgramData\\Security\\temp_rules.xml',
    endpoint: 'WIN-02',
    user: 'SYSTEM',
    process: 'services.exe',
    status: 'DELETED',
    hashBefore: 'c901...21fa',
    hashAfter: '-',
    lastModified: 'Today, 10:26:15',
    size: '12.6 KB',
  },
]

function FileIntegrity() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | FileStatus>(
    'ALL',
  )

  const cleanFiles = files.filter(
    (file) => file.status === 'CLEAN',
  ).length

  const modifiedFiles = files.filter(
    (file) => file.status === 'MODIFIED',
  ).length

  const createdFiles = files.filter(
    (file) => file.status === 'CREATED',
  ).length

  const deletedFiles = files.filter(
    (file) => file.status === 'DELETED',
  ).length

  const filteredFiles = useMemo(() => {
    const query = search.toLowerCase().trim()

    return files.filter((file) => {
      const matchesSearch =
        !query ||
        file.fileName.toLowerCase().includes(query) ||
        file.path.toLowerCase().includes(query) ||
        file.endpoint.toLowerCase().includes(query) ||
        file.user.toLowerCase().includes(query) ||
        file.process.toLowerCase().includes(query) ||
        file.id.toLowerCase().includes(query)

      const matchesStatus =
        statusFilter === 'ALL' ||
        file.status === statusFilter

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
            ENDPOINT SECURITY MONITORING
          </div>

          <h1>File Integrity</h1>

          <p>
            Monitor protected files, detect unauthorized changes,
            and investigate file activity across endpoints.
          </p>
        </div>

        <div className="page-status page-file-status">
          <span />
          FILE INTEGRITY MONITORING ACTIVE
        </div>

      </div>

      {/* =========================================
          SUMMARY
          ========================================= */}

      <section className="file-summary-grid">

        <div className="file-summary-card">
          <div className="file-summary-top">
            <span>MONITORED FILES</span>
            <FileCheck2 size={17} />
          </div>

          <strong>
            {String(files.length).padStart(2, '0')}
          </strong>

          <p>
            Files currently monitored
          </p>
        </div>

        <div className="file-summary-card file-summary-clean">
          <div className="file-summary-top">
            <span>CLEAN</span>
            <CheckCircle2 size={17} />
          </div>

          <strong>
            {String(cleanFiles).padStart(2, '0')}
          </strong>

          <p>
            Hash matches baseline
          </p>
        </div>

        <div className="file-summary-card file-summary-warning">
          <div className="file-summary-top">
            <span>MODIFIED</span>
            <FileWarning size={17} />
          </div>

          <strong>
            {String(modifiedFiles).padStart(2, '0')}
          </strong>

          <p>
            Baseline changes detected
          </p>
        </div>

        <div className="file-summary-card file-summary-danger">
          <div className="file-summary-top">
            <span>CREATED / DELETED</span>
            <AlertTriangle size={17} />
          </div>

          <strong>
            {String(createdFiles + deletedFiles).padStart(2, '0')}
          </strong>

          <p>
            File lifecycle changes
          </p>
        </div>

      </section>

      {/* =========================================
          INTEGRITY OVERVIEW
          ========================================= */}

      <section className="file-overview-grid">

        <div className="file-panel">

          <div className="file-panel-header">

            <div>
              <div className="file-panel-title">
                Integrity Activity
              </div>

              <div className="file-panel-subtitle">
                File events detected across monitored endpoints
              </div>
            </div>

            <FileCheck2 size={18} />

          </div>

          <div className="file-activity">

            <div className="file-activity-bars">

              <div
                className="file-activity-bar file-activity-clean"
                style={{ height: '76%' }}
              />

              <div
                className="file-activity-bar file-activity-warning"
                style={{ height: '46%' }}
              />

              <div
                className="file-activity-bar file-activity-danger"
                style={{ height: '82%' }}
              />

              <div
                className="file-activity-bar file-activity-warning"
                style={{ height: '58%' }}
              />

              <div
                className="file-activity-bar file-activity-clean"
                style={{ height: '38%' }}
              />

              <div
                className="file-activity-bar file-activity-danger"
                style={{ height: '68%' }}
              />

              <div
                className="file-activity-bar file-activity-warning"
                style={{ height: '52%' }}
              />

              <div
                className="file-activity-bar file-activity-danger"
                style={{ height: '88%' }}
              />

            </div>

            <div className="file-activity-labels">
              <span>08:00</span>
              <span>09:00</span>
              <span>10:00</span>
              <span>11:00</span>
            </div>

          </div>

        </div>

        <div className="file-panel">

          <div className="file-panel-header">

            <div>
              <div className="file-panel-title">
                Integrity Alerts
              </div>

              <div className="file-panel-subtitle">
                Changes requiring analyst attention
              </div>
            </div>

            <ShieldAlert size={18} />

          </div>

          <div className="file-alert-list">

            <div className="file-alert-item">

              <div className="file-alert-icon file-alert-danger">
                <AlertTriangle size={15} />
              </div>

              <div>
                <strong>
                  Suspicious Script Modified
                </strong>

                <span>
                  update.ps1 on WIN-01
                </span>
              </div>

            </div>

            <div className="file-alert-item">

              <div className="file-alert-icon file-alert-danger">
                <AlertTriangle size={15} />
              </div>

              <div>
                <strong>
                  New Binary Created
                </strong>

                <span>
                  payload.bin on WIN-02
                </span>
              </div>

            </div>

            <div className="file-alert-item">

              <div className="file-alert-icon file-alert-warning">
                <FileWarning size={15} />
              </div>

              <div>
                <strong>
                  SSH Configuration Changed
                </strong>

                <span>
                  authorized_keys on LINUX-01
                </span>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          FILTER TOOLBAR
          ========================================= */}

      <div className="file-toolbar">

        <div className="file-search">

          <Search size={15} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search file, path, endpoint, process..."
          />

        </div>

        <div className="file-filter-group">

          {(
            [
              'ALL',
              'CLEAN',
              'MODIFIED',
              'CREATED',
              'DELETED',
            ] as const
          ).map((status) => (

            <button
              key={status}
              type="button"
              className={
                statusFilter === status
                  ? 'file-filter-button file-filter-active'
                  : 'file-filter-button'
              }
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>

          ))}

        </div>

        <div className="file-result-count">
          {filteredFiles.length} events
        </div>

      </div>

      {/* =========================================
          FILE TABLE
          ========================================= */}

      <section className="file-panel file-table-panel">

        <div className="file-panel-header">

          <div>
            <div className="file-panel-title">
              Monitored File Events
            </div>

            <div className="file-panel-subtitle">
              Integrity changes and baseline comparisons
            </div>
          </div>

          <File size={18} />

        </div>

        <div className="file-table-wrapper">

          <table className="file-table">

            <thead>

              <tr>
                <th>FILE</th>
                <th>ENDPOINT</th>
                <th>USER</th>
                <th>PROCESS</th>
                <th>CHANGE</th>
                <th>LAST MODIFIED</th>
                <th>SIZE</th>
              </tr>

            </thead>

            <tbody>

              {filteredFiles.map((file) => (

                <tr key={file.id}>

                  <td>

                    <Link
                      to={`/file-integrity/${file.id}`}
                      className="file-row-link"
                    >

                      <div className="file-name-cell">

                        <div className="file-name-icon">
                          <File size={14} />
                        </div>

                        <div>
                          <strong>
                            {file.fileName}
                          </strong>

                          <span>
                            {file.id}
                          </span>
                        </div>

                      </div>

                    </Link>

                  </td>

                  <td>
                    <div className="file-endpoint-cell">
                      <strong>
                        {file.endpoint}
                      </strong>

                      <span>
                        {file.path}
                      </span>
                    </div>
                  </td>

                  <td className="file-mono">
                    {file.user}
                  </td>

                  <td className="file-mono">
                    {file.process}
                  </td>

                  <td>

                    <span
                      className={`file-status file-status-${file.status.toLowerCase()}`}
                    >
                      <span />
                      {file.status}
                    </span>

                  </td>

                  <td className="file-mono">
                    {file.lastModified}
                  </td>

                  <td className="file-mono">
                    {file.size}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {filteredFiles.length === 0 && (
            <div className="file-empty-state">
              <Search size={22} />

              <strong>
                No matching file events
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

export default FileIntegrity