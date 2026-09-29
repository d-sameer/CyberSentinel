import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  File,
  FileCode2,
  Hash,
  Network,
  ShieldAlert,
  User,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

type FileStatus =
  | 'CLEAN'
  | 'MODIFIED'
  | 'CREATED'
  | 'DELETED'

type FileDetailsData = {
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
  fileType: string
  permissions: string
  signer: string
  detection: string
  networkActivity: string
}

const fileDetails: Record<string, FileDetailsData> = {
  'FILE-001': {
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
    fileType: 'System configuration',
    permissions: 'SYSTEM / Administrator',
    signer: 'Microsoft Windows',
    detection: 'No integrity deviation detected.',
    networkActivity: 'No related network activity',
  },

  'FILE-002': {
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
    fileType: 'PowerShell Script',
    permissions: 'User',
    signer: 'Unsigned',
    detection:
      'File hash changed shortly after PowerShell execution with ExecutionPolicy Bypass.',
    networkActivity: 'Related outbound HTTPS activity observed',
  },

  'FILE-003': {
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
    fileType: 'JSON Configuration',
    permissions: 'SYSTEM',
    signer: 'Unsigned',
    detection:
      'Configuration file modified by a high-risk executable.',
    networkActivity: 'Outbound connection associated with modifying process',
  },

  'FILE-004': {
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
    fileType: 'Binary',
    permissions: 'User',
    signer: 'Unsigned',
    detection:
      'New binary created in a temporary directory by a high-risk process.',
    networkActivity: 'Network activity observed after file creation',
  },

  'FILE-005': {
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
    fileType: 'SSH Configuration',
    permissions: 'root',
    signer: 'Ubuntu System Package',
    detection: 'Expected baseline configuration.',
    networkActivity: 'Normal SSH service activity',
  },

  'FILE-006': {
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
    fileType: 'SSH Authorization File',
    permissions: 'admin',
    signer: 'N/A',
    detection:
      'SSH authorization file changed and requires administrator review.',
    networkActivity: 'Related SSH session activity detected',
  },

  'FILE-007': {
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
    fileType: 'Windows Command Script',
    permissions: 'User',
    signer: 'Unsigned',
    detection:
      'New command script created in a shared public directory.',
    networkActivity: 'No related network activity detected',
  },

  'FILE-008': {
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
    fileType: 'Security Rules',
    permissions: 'SYSTEM',
    signer: 'Microsoft Windows',
    detection:
      'Protected security rules file was deleted.',
    networkActivity: 'No related network activity detected',
  },
}


type FileAction = {
  id: number
  action_id: string
  file_id: string
  action: string
  status: string
  analyst: string
  created_at: string
}

const FILE_ACTION_LABELS: Record<string, string> = {
  INVESTIGATE: 'INVESTIGATION STARTED',
  PRESERVE_EVIDENCE: 'EVIDENCE PRESERVED',
  QUARANTINE_FILE: 'QUARANTINE REQUESTED',
  MARK_REVIEWED: 'REVIEWED',
}

function formatActionDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function FileIntegrityDetails() {
  const { fileId } = useParams()

  const file = fileId ? fileDetails[fileId] : undefined
  const [actions, setActions] = useState<FileAction[]>([])
  const [loadingActions, setLoadingActions] = useState(true)
  const [submittingAction, setSubmittingAction] = useState<string | null>(null)
  const [backendStatus, setBackendStatus] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (!fileId) return

    let active = true

    async function loadActions() {
      try {
        setLoadingActions(true)
        setActionError(null)

        const response = await fetch(
          `http://127.0.0.1:8000/api/file-integrity/${fileId}/actions`,
        )

        if (!response.ok) {
          throw new Error('Unable to load file response history')
        }

        const data = await response.json()

        if (active) {
          setActions(data)
          setBackendStatus('BACKEND CONNECTED')
        }
      } catch {
        if (active) {
          setActionError('Backend response history is unavailable.')
          setBackendStatus('DEMO DATA')
        }
      } finally {
        if (active) setLoadingActions(false)
      }
    }

    void loadActions()

    return () => {
      active = false
    }
  }, [fileId])

  async function submitAction(action: string) {
    if (!fileId) return

    try {
      setSubmittingAction(action)
      setActionError(null)

      const response = await fetch(
        `http://127.0.0.1:8000/api/file-integrity/${fileId}/actions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action,
            analyst: 'SOC Analyst',
          }),
        },
      )

      if (!response.ok) {
        const detail = await response.text()
        throw new Error(detail || 'Unable to create file response action')
      }

      const created = (await response.json()) as FileAction
      setActions((current) => [created, ...current])
      setBackendStatus('BACKEND CONNECTED')
    } catch {
      setActionError('The response action could not be recorded.')
    } finally {
      setSubmittingAction(null)
    }
  }

  if (!file) {
    return (
      <div className="page-container">

        <div className="file-detail-not-found">

          <ShieldAlert size={30} />

          <h2>File Event Not Found</h2>

          <p>
            The requested file event does not exist in the
            current integrity monitoring dataset.
          </p>

          <Link
            to="/file-integrity"
            className="file-back-link"
          >
            <ArrowLeft size={14} />
            Back to File Integrity
          </Link>

        </div>

      </div>
    )
  }

  const statusClass = file.status.toLowerCase()

  return (
    <div className="page-container">

      {/* =========================================
          HEADER
          ========================================= */}

      <div className="page-header">

        <div>

          <Link
            to="/file-integrity"
            className="file-detail-back"
          >
            <ArrowLeft size={14} />
            FILE INTEGRITY MONITORING
          </Link>

          <div className="page-eyebrow">
            FILE INVESTIGATION
          </div>

          <h1>{file.fileName}</h1>

          <p>
            Detailed integrity investigation for monitored
            file event {file.id}.
          </p>

        </div>

        <div
          className={`file-detail-status file-detail-status-${statusClass}`}
        >
          <span />
          {file.status}
        </div>

      </div>

      {/* =========================================
          FILE IDENTITY
          ========================================= */}

      <section className="file-detail-hero">

        <div className="file-detail-identity">

          <div className="file-detail-icon">
            <File size={23} />
          </div>

          <div>

            <div className="file-detail-name">
              {file.fileName}
            </div>

            <div className="file-detail-id">
              {file.id} · {file.fileType}
            </div>

          </div>

        </div>

        <div className="file-detail-endpoint">
          <span>ENDPOINT</span>
          <strong>{file.endpoint}</strong>
        </div>

        <div className="file-detail-endpoint">
          <span>MODIFIED BY</span>
          <strong>{file.process}</strong>
        </div>

      </section>

      {/* =========================================
          KEY METRICS
          ========================================= */}

      <section className="file-detail-metrics">

        <div className="file-detail-metric">
          <Hash size={17} />

          <span>BASELINE HASH</span>

          <strong>
            {file.hashBefore}
          </strong>
        </div>

        <div className="file-detail-metric">
          <Hash size={17} />

          <span>CURRENT HASH</span>

          <strong>
            {file.hashAfter}
          </strong>
        </div>

        <div className="file-detail-metric">
          <User size={17} />

          <span>USER CONTEXT</span>

          <strong>
            {file.user}
          </strong>
        </div>

        <div className="file-detail-metric">
          <Clock3 size={17} />

          <span>LAST MODIFIED</span>

          <strong>
            {file.lastModified}
          </strong>
        </div>

      </section>

      {/* =========================================
          INVESTIGATION GRID
          ========================================= */}

      <section className="file-detail-grid">

        {/* File Context */}

        <div className="file-detail-panel">

          <div className="file-detail-panel-header">

            <div>
              <strong>File Context</strong>

              <span>
                File identity and endpoint information
              </span>
            </div>

            <FileCode2 size={18} />

          </div>

          <div className="file-detail-fields">

            <div>
              <span>FILE NAME</span>
              <strong>{file.fileName}</strong>
            </div>

            <div>
              <span>FILE TYPE</span>
              <strong>{file.fileType}</strong>
            </div>

            <div>
              <span>ENDPOINT</span>
              <strong>{file.endpoint}</strong>
            </div>

            <div>
              <span>USER</span>
              <strong>{file.user}</strong>
            </div>

            <div>
              <span>MODIFYING PROCESS</span>
              <strong>{file.process}</strong>
            </div>

            <div>
              <span>FILE SIZE</span>
              <strong>{file.size}</strong>
            </div>

            <div>
              <span>PERMISSIONS</span>
              <strong>{file.permissions}</strong>
            </div>

            <div>
              <span>SIGNER</span>
              <strong>{file.signer}</strong>
            </div>

            <div className="file-detail-field-wide">
              <span>FILE PATH</span>

              <code>
                {file.path}
              </code>
            </div>

          </div>

        </div>

        {/* Security Assessment */}

        <div className="file-detail-panel">

          <div className="file-detail-panel-header">

            <div>
              <strong>Integrity Assessment</strong>

              <span>
                Current security assessment for this file
              </span>
            </div>

            <ShieldAlert size={18} />

          </div>

          <div className="file-assessment">

            <div
              className={`file-assessment-banner file-assessment-${statusClass}`}
            >

              {file.status === 'CLEAN' ? (
                <CheckCircle2 size={17} />
              ) : (
                <AlertTriangle size={17} />
              )}

              <div>

                <strong>
                  {file.status} FILE EVENT
                </strong>

                <span>
                  Current integrity classification
                </span>

              </div>

            </div>

            <div className="file-assessment-row">
              <span>Detection</span>

              <strong>
                {file.detection}
              </strong>
            </div>

            <div className="file-assessment-row">
              <span>Baseline Hash</span>

              <code>
                {file.hashBefore}
              </code>
            </div>

            <div className="file-assessment-row">
              <span>Current Hash</span>

              <code>
                {file.hashAfter}
              </code>
            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          HASH COMPARISON
          ========================================= */}

      <section className="file-detail-panel file-hash-panel">

        <div className="file-detail-panel-header">

          <div>
            <strong>Hash Comparison</strong>

            <span>
              Baseline versus current file integrity state
            </span>
          </div>

          <Hash size={18} />

        </div>

        <div className="file-hash-comparison">

          <div className="file-hash-block">

            <span>
              BASELINE HASH
            </span>

            <code>
              {file.hashBefore}
            </code>

          </div>

          <div className="file-hash-arrow">
            →
          </div>

          <div className="file-hash-block">

            <span>
              CURRENT HASH
            </span>

            <code>
              {file.hashAfter}
            </code>

          </div>

        </div>

      </section>

      {/* =========================================
          ACTIVITY
          ========================================= */}

      <section className="file-detail-grid">

        <div className="file-detail-panel">

          <div className="file-detail-panel-header">

            <div>
              <strong>Related Activity</strong>

              <span>
                Process and network context
              </span>
            </div>

            <Network size={18} />

          </div>

          <div className="file-related-list">

            <div className="file-related-item">

              <div className="file-related-icon">
                <FileCode2 size={16} />
              </div>

              <div>

                <strong>
                  Modifying Process
                </strong>

                <span>
                  {file.process}
                </span>

              </div>

            </div>

            <div className="file-related-item">

              <div className="file-related-icon">
                <Network size={16} />
              </div>

              <div>

                <strong>
                  Network Activity
                </strong>

                <span>
                  {file.networkActivity}
                </span>

              </div>

            </div>

          </div>

        </div>

        <div className="file-detail-panel">

          <div className="file-detail-panel-header">

            <div>
              <strong>Integrity Timeline</strong>

              <span>
                Important file events
              </span>
            </div>

            <Clock3 size={18} />

          </div>

          <div className="file-timeline">

            <div className="file-timeline-item">

              <span />

              <div>
                <strong>
                  File telemetry observed
                </strong>

                <small>
                  {file.lastModified}
                </small>
              </div>

            </div>

            <div className="file-timeline-item">

              <span />

              <div>
                <strong>
                  Integrity comparison performed
                </strong>

                <small>
                  +08 seconds
                </small>
              </div>

            </div>

            <div className="file-timeline-item">

              <span />

              <div>
                <strong>
                  Security assessment generated
                </strong>

                <small>
                  +21 seconds
                </small>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          RESPONSE WORKFLOW
          ========================================= */}

      <section className="file-detail-panel file-notes-panel">
        <div className="file-detail-panel-header">
          <div>
            <strong>Response Workflow</strong>
            <span>Record analyst actions against this file event</span>
          </div>
          <ShieldAlert size={18} />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
          <button
            type="button"
            className="file-back-link"
            onClick={() => void submitAction('INVESTIGATE')}
            disabled={submittingAction !== null}
          >
            {submittingAction === 'INVESTIGATE' ? 'Recording...' : 'Investigate File'}
          </button>

          <button
            type="button"
            className="file-back-link"
            onClick={() => void submitAction('PRESERVE_EVIDENCE')}
            disabled={submittingAction !== null}
          >
            {submittingAction === 'PRESERVE_EVIDENCE'
              ? 'Recording...'
              : 'Preserve Evidence'}
          </button>

          <button
            type="button"
            className="file-back-link"
            onClick={() => void submitAction('QUARANTINE_FILE')}
            disabled={submittingAction !== null}
          >
            {submittingAction === 'QUARANTINE_FILE'
              ? 'Recording...'
              : 'Quarantine File'}
          </button>

          <button
            type="button"
            className="file-back-link"
            onClick={() => void submitAction('MARK_REVIEWED')}
            disabled={submittingAction !== null}
          >
            {submittingAction === 'MARK_REVIEWED'
              ? 'Recording...'
              : 'Mark Reviewed'}
          </button>
        </div>

        {backendStatus && (
          <div style={{ marginTop: 14, fontSize: 12, letterSpacing: 1 }}>
            {backendStatus}
          </div>
        )}

        {actionError && (
          <div style={{ marginTop: 12, fontSize: 13 }}>
            {actionError}
          </div>
        )}

        <div className="file-notes" style={{ marginTop: 18 }}>
          <p>
            Response actions are recorded as analyst workflow events. These
            actions do not directly delete, restore, or quarantine files on the
            endpoint.
          </p>
        </div>

        <div style={{ marginTop: 18 }}>
          <div className="file-detail-panel-header" style={{ padding: 0 }}>
            <div>
              <strong>Response History</strong>
              <span>Persistent actions recorded by the CyberSentinel API</span>
            </div>
          </div>

          {loadingActions ? (
            <div style={{ marginTop: 16 }}>Loading response history...</div>
          ) : actions.length === 0 ? (
            <div style={{ marginTop: 16 }}>No response actions recorded yet.</div>
          ) : (
            <div className="file-timeline" style={{ marginTop: 16 }}>
              {actions.map((action) => (
                <div className="file-timeline-item" key={action.action_id}>
                  <span />
                  <div>
                    <strong>
                      {FILE_ACTION_LABELS[action.action] ?? action.status}
                    </strong>
                    <small>
                      {action.action_id} · {action.analyst} ·{' '}
                      {formatActionDate(action.created_at)}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================
          INVESTIGATION NOTES
          ========================================= */}

      <section className="file-detail-panel file-notes-panel">

        <div className="file-detail-panel-header">

          <div>
            <strong>
              Analyst Investigation Notes
            </strong>

            <span>
              Initial observations from file integrity telemetry
            </span>
          </div>

          <ShieldAlert size={18} />

        </div>

        <div className="file-notes">

          {file.status === 'MODIFIED' ? (
            <>
              <p>
                <AlertTriangle size={14} />
                File content differs from the established
                integrity baseline.
              </p>

              <p>
                Review the modifying process, command-line
                activity, user context, and related network
                connections.
              </p>

              <p>
                Confirm whether the change was authorized before
                restoring the known-good baseline.
              </p>
            </>
          ) : file.status === 'CREATED' ? (
            <>
              <p>
                <AlertTriangle size={14} />
                A new file was created on the monitored endpoint.
              </p>

              <p>
                Validate the file origin, parent process,
                signer, hash reputation, and execution history.
              </p>
            </>
          ) : file.status === 'DELETED' ? (
            <>
              <p>
                <AlertTriangle size={14} />
                A monitored file was deleted from the endpoint.
              </p>

              <p>
                Determine whether the deletion was authorized and
                investigate the process responsible for the action.
              </p>
            </>
          ) : (
            <>
              <p>
                <CheckCircle2 size={14} />
                Current file hash matches the established baseline.
              </p>

              <p>
                No immediate integrity deviation was identified
                in the available telemetry.
              </p>
            </>
          )}

        </div>

      </section>

    </div>
  )
}

export default FileIntegrityDetails