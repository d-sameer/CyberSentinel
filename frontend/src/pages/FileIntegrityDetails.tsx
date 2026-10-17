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


type FileAction = {
  id: number
  action_id: string
  file_id: string
  action: string
  status: string
  analyst: string
  created_at: string
}


type UnknownRecord = Record<string, unknown>

function firstValue(item: UnknownRecord, ...keys: string[]): unknown {
  for (const key of keys) {
    const value = item[key]
    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }
  return undefined
}

function normalizeFileStatus(value: unknown): FileStatus {
  const status = String(value ?? 'CLEAN').trim().toUpperCase().replace(/[ -]+/g, '_')
  if (status === 'MODIFIED' || status === 'CREATED' || status === 'DELETED') {
    return status
  }
  return 'CLEAN'
}

function normalizeFileDetails(raw: unknown, fallbackId: string): FileDetailsData {
  const item = (raw && typeof raw === 'object' ? raw : {}) as UnknownRecord
  return {
    id: String(firstValue(item, 'id', 'file_id', 'fileId') ?? fallbackId),
    fileName: String(firstValue(item, 'fileName', 'file_name', 'name') ?? 'Unknown file'),
    path: String(firstValue(item, 'path', 'file_path', 'filePath') ?? 'Unknown'),
    endpoint: String(firstValue(item, 'endpoint', 'endpoint_name', 'endpointName', 'host') ?? 'Unknown'),
    user: String(firstValue(item, 'user', 'username', 'user_name') ?? 'Unknown'),
    process: String(firstValue(item, 'process', 'process_name', 'processName') ?? 'Unknown'),
    status: normalizeFileStatus(firstValue(item, 'status', 'change_status', 'changeStatus')),
    hashBefore: String(firstValue(item, 'hashBefore', 'hash_before', 'previous_hash', 'baseline_hash') ?? '-'),
    hashAfter: String(firstValue(item, 'hashAfter', 'hash_after', 'current_hash', 'hash') ?? '-'),
    lastModified: String(firstValue(item, 'lastModified', 'last_modified', 'modified_at', 'timestamp') ?? 'Unknown'),
    size: String(firstValue(item, 'size', 'file_size', 'fileSize') ?? 'Unknown'),
    fileType: String(firstValue(item, 'fileType', 'file_type', 'mime_type') ?? 'Unknown'),
    permissions: String(firstValue(item, 'permissions', 'file_permissions') ?? 'Unknown'),
    signer: String(firstValue(item, 'signer', 'signature_status', 'signed_by') ?? 'Unknown'),
    detection: String(firstValue(item, 'detection', 'detection_reason', 'description') ?? 'No detection details provided by the backend.'),
    networkActivity: String(firstValue(item, 'networkActivity', 'network_activity') ?? 'No related network activity reported.'),
  }
}

function normalizeFileAction(raw: unknown, index: number): FileAction {
  const item = (raw && typeof raw === 'object' ? raw : {}) as UnknownRecord
  return {
    id: Number(firstValue(item, 'id') ?? index + 1),
    action_id: String(firstValue(item, 'action_id', 'actionId') ?? `ACTION-${index + 1}`),
    file_id: String(firstValue(item, 'file_id', 'fileId') ?? ''),
    action: String(firstValue(item, 'action') ?? 'UNKNOWN'),
    status: String(firstValue(item, 'status') ?? 'RECORDED'),
    analyst: String(firstValue(item, 'analyst', 'actor') ?? 'Unknown analyst'),
    created_at: String(firstValue(item, 'created_at', 'createdAt', 'timestamp') ?? ''),
  }
}


const FILE_ACTION_LABELS: Record<string, string> = {
  INVESTIGATE: 'INVESTIGATION STARTED',
  PRESERVE_EVIDENCE: 'EVIDENCE PRESERVED',
  QUARANTINE_FILE: 'QUARANTINE REQUESTED',
  MARK_REVIEWED: 'REVIEWED',
}


function formatActionDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}


function FileIntegrityDetails() {
  const { fileId } = useParams()
  // React Router params are optional; normalize once for TypeScript and API calls.
  const resolvedFileId = fileId ?? ''


  // =========================================================
  // FILE DETAILS STATE
  // =========================================================

  const [file, setFile] = useState<FileDetailsData | null>(null)

  const [loadingFile, setLoadingFile] = useState(true)

  const [fileError, setFileError] = useState<string | null>(null)


  // =========================================================
  // RESPONSE ACTION STATE
  // =========================================================

  const [actions, setActions] = useState<FileAction[]>([])

  const [loadingActions, setLoadingActions] = useState(true)

  const [submittingAction, setSubmittingAction] = useState<string | null>(null)

  const [backendStatus, setBackendStatus] = useState<string | null>(null)

  const [actionError, setActionError] = useState<string | null>(null)


  // =========================================================
  // LOAD FILE DETAILS FROM BACKEND
  // =========================================================

  useEffect(() => {
    if (!resolvedFileId) {
      setFile(null)
      setFileError('No file event was specified.')
      setLoadingFile(false)
      return
    }

    let active = true

    const controller = new AbortController()


    async function loadFile() {
      try {
        setLoadingFile(true)
        setFileError(null)

        const response = await fetch(
          `http://127.0.0.1:8001/api/file-integrity/${encodeURIComponent(resolvedFileId)}`,
          {
            signal: controller.signal,
          },
        )

        if (!response.ok) {
          throw new Error(
            'Unable to load file integrity details',
          )
        }

        const data: unknown = await response.json()

        if (active) {
          setFile(normalizeFileDetails(data, resolvedFileId))
          setBackendStatus('BACKEND CONNECTED')
        }
      } catch (error) {
        if (
          active &&
          !(
            error instanceof DOMException &&
            error.name === 'AbortError'
          )
        ) {
          setFile(null)

          setFileError(
            'Unable to load file integrity details from the backend.',
          )

          setBackendStatus('BACKEND UNAVAILABLE')
        }
      } finally {
        if (active) {
          setLoadingFile(false)
        }
      }
    }


    void loadFile()


    return () => {
      active = false
      controller.abort()
    }
  }, [resolvedFileId])


  // =========================================================
  // LOAD RESPONSE ACTION HISTORY
  // =========================================================

  useEffect(() => {
    if (!resolvedFileId) {
      setLoadingActions(false)
      return
    }

    let active = true


    async function loadActions() {
      try {
        setLoadingActions(true)
        setActionError(null)

        const response = await fetch(
          `http://127.0.0.1:8001/api/file-integrity/${encodeURIComponent(resolvedFileId)}/actions`,
        )

        if (!response.ok) {
          throw new Error(
            'Unable to load file response history',
          )
        }

        const data = await response.json()

        if (active) {
          if (!Array.isArray(data)) {
            throw new Error('Invalid response action history')
          }
          setActions(data.map((item, index) => normalizeFileAction(item, index)))
          setBackendStatus('BACKEND CONNECTED')
        }
      } catch {
        if (active) {
          setActionError(
            'Backend response history is unavailable.',
          )

          setBackendStatus('DEMO DATA')
        }
      } finally {
        if (active) {
          setLoadingActions(false)
        }
      }
    }


    void loadActions()


    return () => {
      active = false
    }
  }, [resolvedFileId])


  // =========================================================
  // SUBMIT RESPONSE ACTION
  // =========================================================

  async function submitAction(action: string) {
    if (!resolvedFileId) {
      return
    }

    try {
      setSubmittingAction(action)
      setActionError(null)

      const response = await fetch(
        `http://127.0.0.1:8001/api/file-integrity/${encodeURIComponent(resolvedFileId)}/actions`,
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

        throw new Error(
          detail ||
            'Unable to create file response action',
        )
      }

      const created = normalizeFileAction(await response.json(), actions.length)

      setActions((current) => [
        created,
        ...current,
      ])

      setBackendStatus('BACKEND CONNECTED')
    } catch {
      setActionError(
        'The response action could not be recorded.',
      )
    } finally {
      setSubmittingAction(null)
    }
  }


  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loadingFile) {
    return (
      <div className="page-container">
        <div className="file-detail-not-found">

          <Clock3 size={30} />

          <h2>
            Loading File Event
          </h2>

          <p>
            Loading file integrity details from the
            CyberSentinel backend.
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


  // =========================================================
  // FILE NOT FOUND / API ERROR
  // =========================================================

  if (fileError || !file) {
    return (
      <div className="page-container">

        <div className="file-detail-not-found">

          <ShieldAlert size={30} />

          <h2>
            File Event Not Found
          </h2>

          <p>
            {fileError ??
              'The requested file event does not exist in the current integrity monitoring dataset.'}
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


  const statusClass =
    file.status.toLowerCase()


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

          <h1>
            {file.fileName}
          </h1>

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

          <span>
            ENDPOINT
          </span>

          <strong>
            {file.endpoint}
          </strong>

        </div>


        <div className="file-detail-endpoint">

          <span>
            MODIFIED BY
          </span>

          <strong>
            {file.process}
          </strong>

        </div>

      </section>


      {/* =========================================
          KEY METRICS
          ========================================= */}

      <section className="file-detail-metrics">

        <div className="file-detail-metric">

          <Hash size={17} />

          <span>
            BASELINE HASH
          </span>

          <strong>
            {file.hashBefore}
          </strong>

        </div>


        <div className="file-detail-metric">

          <Hash size={17} />

          <span>
            CURRENT HASH
          </span>

          <strong>
            {file.hashAfter}
          </strong>

        </div>


        <div className="file-detail-metric">

          <User size={17} />

          <span>
            USER CONTEXT
          </span>

          <strong>
            {file.user}
          </strong>

        </div>


        <div className="file-detail-metric">

          <Clock3 size={17} />

          <span>
            LAST MODIFIED
          </span>

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

              <strong>
                File Context
              </strong>

              <span>
                File identity and endpoint information
              </span>

            </div>

            <FileCode2 size={18} />

          </div>


          <div className="file-detail-fields">

            <div>

              <span>
                FILE NAME
              </span>

              <strong>
                {file.fileName}
              </strong>

            </div>


            <div>

              <span>
                FILE TYPE
              </span>

              <strong>
                {file.fileType}
              </strong>

            </div>


            <div>

              <span>
                ENDPOINT
              </span>

              <strong>
                {file.endpoint}
              </strong>

            </div>


            <div>

              <span>
                USER
              </span>

              <strong>
                {file.user}
              </strong>

            </div>


            <div>

              <span>
                MODIFYING PROCESS
              </span>

              <strong>
                {file.process}
              </strong>

            </div>


            <div>

              <span>
                FILE SIZE
              </span>

              <strong>
                {file.size}
              </strong>

            </div>


            <div>

              <span>
                PERMISSIONS
              </span>

              <strong>
                {file.permissions}
              </strong>

            </div>


            <div>

              <span>
                SIGNER
              </span>

              <strong>
                {file.signer}
              </strong>

            </div>


            <div className="file-detail-field-wide">

              <span>
                FILE PATH
              </span>

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

              <strong>
                Integrity Assessment
              </strong>

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

              <span>
                Detection
              </span>

              <strong>
                {file.detection}
              </strong>

            </div>


            <div className="file-assessment-row">

              <span>
                Baseline Hash
              </span>

              <code>
                {file.hashBefore}
              </code>

            </div>


            <div className="file-assessment-row">

              <span>
                Current Hash
              </span>

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

            <strong>
              Hash Comparison
            </strong>

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

              <strong>
                Related Activity
              </strong>

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

              <strong>
                Integrity Timeline
              </strong>

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

            <strong>
              Response Workflow
            </strong>

            <span>
              Record analyst actions against this file event
            </span>

          </div>

          <ShieldAlert size={18} />

        </div>


        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 16,
          }}
        >

          <button
            type="button"
            className="file-back-link"
            onClick={() =>
              void submitAction('INVESTIGATE')
            }
            disabled={submittingAction !== null}
          >
            {submittingAction === 'INVESTIGATE'
              ? 'Recording...'
              : 'Investigate File'}
          </button>


          <button
            type="button"
            className="file-back-link"
            onClick={() =>
              void submitAction('PRESERVE_EVIDENCE')
            }
            disabled={submittingAction !== null}
          >
            {submittingAction === 'PRESERVE_EVIDENCE'
              ? 'Recording...'
              : 'Preserve Evidence'}
          </button>


          <button
            type="button"
            className="file-back-link"
            onClick={() =>
              void submitAction('QUARANTINE_FILE')
            }
            disabled={submittingAction !== null}
          >
            {submittingAction === 'QUARANTINE_FILE'
              ? 'Recording...'
              : 'Quarantine File'}
          </button>


          <button
            type="button"
            className="file-back-link"
            onClick={() =>
              void submitAction('MARK_REVIEWED')
            }
            disabled={submittingAction !== null}
          >
            {submittingAction === 'MARK_REVIEWED'
              ? 'Recording...'
              : 'Mark Reviewed'}
          </button>

        </div>


        {backendStatus && (
          <div
            style={{
              marginTop: 14,
              fontSize: 12,
              letterSpacing: 1,
            }}
          >
            {backendStatus}
          </div>
        )}


        {actionError && (
          <div
            style={{
              marginTop: 12,
              fontSize: 13,
            }}
          >
            {actionError}
          </div>
        )}


        <div
          className="file-notes"
          style={{ marginTop: 18 }}
        >

          <p>
            Response actions are recorded as analyst workflow
            events. These actions do not directly delete, restore,
            or quarantine files on the endpoint.
          </p>

        </div>


        <div style={{ marginTop: 18 }}>

          <div
            className="file-detail-panel-header"
            style={{ padding: 0 }}
          >

            <div>

              <strong>
                Response History
              </strong>

              <span>
                Persistent actions recorded by the CyberSentinel API
              </span>

            </div>

          </div>


          {loadingActions ? (

            <div style={{ marginTop: 16 }}>
              Loading response history...
            </div>

          ) : actions.length === 0 ? (

            <div style={{ marginTop: 16 }}>
              No response actions recorded yet.
            </div>

          ) : (

            <div
              className="file-timeline"
              style={{ marginTop: 16 }}
            >

              {actions.map((action) => (

                <div
                  className="file-timeline-item"
                  key={`${action.action_id}-${action.id}`}
                >

                  <span />

                  <div>

                    <strong>
                      {
                        FILE_ACTION_LABELS[action.action] ??
                        action.status
                      }
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