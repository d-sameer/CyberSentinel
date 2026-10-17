import {
  AlertTriangle,
  CheckCircle2,
  File,
  FileCheck2,
  FileWarning,
  Search,
  ShieldAlert,
} from 'lucide-react'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

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
  fileType?: string
  permissions?: string
  signer?: string
  detection?: string
  networkActivity?: string
}

const API_URL =
  'http://127.0.0.1:8001/api/file-integrity'

function FileIntegrity() {
  const [files, setFiles] = useState<FileData[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<'ALL' | FileStatus>('ALL')

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    let cancelled = false

    const loadFiles = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(API_URL)

        if (!response.ok) {
          throw new Error(
            `Backend returned ${response.status}`,
          )
        }

        const data = await response.json()

        if (!Array.isArray(data)) {
          throw new Error(
            'Invalid file integrity data received',
          )
        }

        if (cancelled) {
          return
        }

        const normalizeStatus = (value: unknown): FileStatus => {
          const status = String(value ?? 'CLEAN')
            .trim()
            .toUpperCase()
            .replace(/[ -]+/g, '_')

          if (status === 'MODIFIED' || status === 'CREATED' || status === 'DELETED') {
            return status
          }

          return 'CLEAN'
        }

        const read = (item: Record<string, unknown>, camel: string, snake: string) =>
          item[camel] ?? item[snake]

        const normalized: FileData[] = data.map(
          (rawItem: Record<string, unknown>, index: number) => ({
            id: String(rawItem.id ?? rawItem.file_id ?? `FILE-${String(index + 1).padStart(3, '0')}`),
            fileName: String(read(rawItem, 'fileName', 'file_name') ?? rawItem.name ?? 'Unknown'),
            path: String(rawItem.path ?? rawItem.file_path ?? 'Unknown'),
            endpoint: String(read(rawItem, 'endpoint', 'endpoint_name') ?? rawItem.host ?? 'Unknown'),
            user: String(rawItem.user ?? rawItem.username ?? 'Unknown'),
            process: String(rawItem.process ?? rawItem.process_name ?? 'Unknown'),
            status: normalizeStatus(rawItem.status ?? rawItem.change_status),
            hashBefore: String(read(rawItem, 'hashBefore', 'hash_before') ?? rawItem.previous_hash ?? '-'),
            hashAfter: String(read(rawItem, 'hashAfter', 'hash_after') ?? rawItem.current_hash ?? rawItem.hash ?? '-'),
            lastModified: String(read(rawItem, 'lastModified', 'last_modified') ?? rawItem.modified_at ?? rawItem.timestamp ?? 'Unknown'),
            size: String(rawItem.size ?? rawItem.file_size ?? 'Unknown'),
            fileType: String(read(rawItem, 'fileType', 'file_type') ?? ''),
            permissions: String(rawItem.permissions ?? rawItem.file_permissions ?? ''),
            signer: String(rawItem.signer ?? rawItem.signature_status ?? ''),
            detection: String(rawItem.detection ?? rawItem.detection_reason ?? ''),
            networkActivity: String(read(rawItem, 'networkActivity', 'network_activity') ?? ''),
          }),
        )

        setFiles(normalized)
      } catch (err) {
        console.error(
          'Failed to load file integrity data:',
          err,
        )

        if (!cancelled) {
          setError(
            'Unable to load file integrity telemetry from backend.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadFiles()

    return () => {
      cancelled = true
    }
  }, [])

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
    const query =
      search.toLowerCase().trim()

    return files.filter((file) => {
      const matchesSearch =
        !query ||
        file.fileName
          .toLowerCase()
          .includes(query) ||
        file.path
          .toLowerCase()
          .includes(query) ||
        file.endpoint
          .toLowerCase()
          .includes(query) ||
        file.user
          .toLowerCase()
          .includes(query) ||
        file.process
          .toLowerCase()
          .includes(query) ||
        file.id
          .toLowerCase()
          .includes(query)

      const matchesStatus =
        statusFilter === 'ALL' ||
        file.status === statusFilter

      return (
        matchesSearch &&
        matchesStatus
      )
    })
  }, [files, search, statusFilter])

  const threatFiles = files.filter(
    (file) =>
      file.status === 'MODIFIED' ||
      file.status === 'CREATED' ||
      file.status === 'DELETED',
  )

  const activityBars = files.map(
    (file) => {
      const height =
        file.status === 'CLEAN'
          ? 38
          : file.status === 'MODIFIED'
            ? 62
            : file.status === 'CREATED'
              ? 78
              : 90

      return {
        id: file.id,
        status: file.status,
        height,
      }
    },
  )

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

          <h1>
            File Integrity
          </h1>

          <p>
            Monitor protected files, detect
            unauthorized changes, and investigate
            file activity across endpoints.
          </p>

        </div>

        <div className="page-status page-file-status">
          <span />
          FILE INTEGRITY MONITORING ACTIVE
        </div>

      </div>

      {/* =========================================
          ERROR
          ========================================= */}

      {error && (
        <div
          style={{
            marginBottom: '18px',
            padding: '14px 16px',
            border:
              '1px solid rgba(239, 68, 68, 0.35)',
            background:
              'rgba(239, 68, 68, 0.08)',
            color: '#fca5a5',
            borderRadius: '8px',
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}

      {/* =========================================
          SUMMARY
          ========================================= */}

      <section className="file-summary-grid">

        <div className="file-summary-card">

          <div className="file-summary-top">
            <span>
              MONITORED FILES
            </span>

            <FileCheck2 size={17} />
          </div>

          <strong>
            {loading
              ? '--'
              : String(files.length).padStart(
                  2,
                  '0',
                )}
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
            {loading
              ? '--'
              : String(cleanFiles).padStart(
                  2,
                  '0',
                )}
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
            {loading
              ? '--'
              : String(modifiedFiles).padStart(
                  2,
                  '0',
                )}
          </strong>

          <p>
            Baseline changes detected
          </p>

        </div>

        <div className="file-summary-card file-summary-danger">

          <div className="file-summary-top">
            <span>
              CREATED / DELETED
            </span>

            <AlertTriangle size={17} />
          </div>

          <strong>
            {loading
              ? '--'
              : String(
                  createdFiles +
                    deletedFiles,
                ).padStart(2, '0')}
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

        {/* ACTIVITY */}

        <div className="file-panel">

          <div className="file-panel-header">

            <div>

              <div className="file-panel-title">
                Integrity Activity
              </div>

              <div className="file-panel-subtitle">
                File events detected across
                monitored endpoints
              </div>

            </div>

            <FileCheck2 size={18} />

          </div>

          <div className="file-activity">

            <div className="file-activity-bars">

              {loading ? (
                <>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(
                    (item) => (
                      <div
                        key={item}
                        className="file-activity-bar"
                        style={{
                          height: '35%',
                        }}
                      />
                    ),
                  )}
                </>
              ) : (
                activityBars.map((bar) => (
                  <div
                    key={bar.id}
                    className={`file-activity-bar ${
                      bar.status === 'CLEAN'
                        ? 'file-activity-clean'
                        : bar.status === 'MODIFIED'
                          ? 'file-activity-warning'
                          : 'file-activity-danger'
                    }`}
                    style={{
                      height: `${bar.height}%`,
                    }}
                    title={`${bar.id}: ${bar.status}`}
                  />
                ))
              )}

            </div>

            <div className="file-activity-labels">
              <span>08:00</span>
              <span>09:00</span>
              <span>10:00</span>
              <span>11:00</span>
            </div>

          </div>

        </div>

        {/* ALERTS */}

        <div className="file-panel">

          <div className="file-panel-header">

            <div>

              <div className="file-panel-title">
                Integrity Alerts
              </div>

              <div className="file-panel-subtitle">
                Changes requiring analyst
                attention
              </div>

            </div>

            <ShieldAlert size={18} />

          </div>

          <div className="file-alert-list">

            {loading ? (
              <div
                style={{
                  padding: '20px 0',
                  color:
                    'rgba(255,255,255,0.45)',
                  fontSize: '13px',
                }}
              >
                Loading integrity telemetry...
              </div>
            ) : threatFiles.length === 0 ? (
              <div
                style={{
                  padding: '20px 0',
                  color:
                    'rgba(255,255,255,0.45)',
                  fontSize: '13px',
                }}
              >
                No active integrity alerts.
              </div>
            ) : (
              threatFiles
                .slice(0, 3)
                .map((file) => (
                  <Link
                    key={file.id}
                    to={`/file-integrity/${file.id}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >

                    <div className="file-alert-item">

                      <div
                        className={
                          file.status === 'MODIFIED'
                            ? 'file-alert-icon file-alert-warning'
                            : 'file-alert-icon file-alert-danger'
                        }
                      >
                        {file.status ===
                        'MODIFIED' ? (
                          <FileWarning
                            size={15}
                          />
                        ) : (
                          <AlertTriangle
                            size={15}
                          />
                        )}
                      </div>

                      <div>

                        <strong>
                          {file.fileName}
                        </strong>

                        <span>
                          {file.status} on{' '}
                          {file.endpoint}
                        </span>

                      </div>

                    </div>

                  </Link>
                ))
            )}

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
              onClick={() =>
                setStatusFilter(status)
              }
            >
              {status}
            </button>

          ))}

        </div>

        <div className="file-result-count">

          {loading
            ? 'Loading events...'
            : `${filteredFiles.length} events`}

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
              Integrity changes and baseline
              comparisons
            </div>

          </div>

          <File size={18} />

        </div>

        <div className="file-table-wrapper">

          {loading ? (
            <div
              style={{
                padding: '50px 20px',
                textAlign: 'center',
                color:
                  'rgba(255,255,255,0.45)',
                fontSize: '13px',
              }}
            >
              Loading file integrity telemetry...
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="file-empty-state">

              <Search size={22} />

              <strong>
                No matching file events
              </strong>

              <span>
                Try changing the search or
                status filter.
              </span>

            </div>
          ) : (
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
          )}

        </div>

      </section>

    </div>
  )
}

export default FileIntegrity