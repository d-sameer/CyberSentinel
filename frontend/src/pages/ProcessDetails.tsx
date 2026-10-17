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

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'


// ============================================================
// TYPES
// ============================================================

type ProcessStatus =
  | 'NORMAL'
  | 'SUSPICIOUS'
  | 'HIGH RISK'


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


// ============================================================
// API
// ============================================================

const API_URL =
  'http://127.0.0.1:8001/api/processes'


// ============================================================
// HELPERS
// ============================================================

function formatTimestamp(
  value: unknown,
): string {

  if (!value) {
    return 'Not available'
  }


  const text =
    String(value)


  const date =
    new Date(text)


  if (Number.isNaN(date.getTime())) {
    return text
  }


  return date.toLocaleString(
    undefined,
    {
      dateStyle: 'medium',
      timeStyle: 'medium',
    },
  )
}


// ============================================================
// NORMALIZE BACKEND PROCESS
// ============================================================

function normalizeProcess(
  item: Record<string, unknown>,
): ProcessDetailsData {

  const id =
    String(
      item.process_id ??
      item.processId ??
      item.id ??
      '',
    )


  const name =
    String(
      item.name ??
      'Unknown process',
    )


  const pid =
    Number(
      item.pid ??
      0,
    )


  const endpoint =
    String(
      item.endpoint ??
      'Unknown',
    )


  const user =
    String(
      item.user ??
      'Unknown',
    )


  const cpu =
    String(
      item.cpu ??
      '0%',
    )


  const memory =
    String(
      item.memory ??
      '0 MB',
    )


  const parent =
    String(
      item.parent ??
      item.parent_process ??
      item.parentProcess ??
      'Unknown',
    )


  const commandLine =
    String(
      item.command_line ??
      item.commandLine ??
      'Not available',
    )


  const rawStatus = String(item.status ?? 'NORMAL').toUpperCase()
  const status: ProcessStatus =
    rawStatus === 'HIGH RISK' || rawStatus === 'SUSPICIOUS'
      ? rawStatus
      : 'NORMAL'


  const started =
    formatTimestamp(
      item.created_at ??
      item.createdAt ??
      item.updated_at ??
      item.updatedAt,
    )


  // ----------------------------------------------------------
  // The current Process API does not expose these fields.
  // Do not fabricate security telemetry.
  // ----------------------------------------------------------

  const executable =
    commandLine !== 'Not available'
      ? commandLine
      : 'Not available from process telemetry'


  const integrity =
    'Not available from process telemetry'


  const signer =
    'Not available from process telemetry'


  const hash =
    'Not available from process telemetry'


  let detection =
    'No additional detection metadata was returned by the process API.'


  let networkActivity =
    'No process-specific network telemetry was returned by the API.'


  if (status === 'HIGH RISK') {

    detection =
      'Process is currently classified as HIGH RISK by CyberSentinel process telemetry.'

    networkActivity =
      'Review related network connections for this high-risk process.'

  } else if (status === 'SUSPICIOUS') {

    detection =
      'Process is currently classified as SUSPICIOUS by CyberSentinel process telemetry.'

    networkActivity =
      'Review related network connections for this suspicious process.'

  }


  return {

    id,
    name,
    pid,
    endpoint,
    user,
    cpu,
    memory,
    parent,
    commandLine,
    status,

    executable,
    started,
    integrity,
    signer,
    hash,
    detection,
    networkActivity,

  }

}


// ============================================================
// COMPONENT
// ============================================================

function ProcessDetails() {

  const {
    processId,
  } = useParams()


  const [
    process,
    setProcess,
  ] =
    useState<ProcessDetailsData | null>(
      null,
    )


  const [
    loading,
    setLoading,
  ] =
    useState(true)


  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )


  // ==========================================================
  // LOAD PROCESS FROM BACKEND
  // ==========================================================

  useEffect(() => {

    let active = true


    const controller =
      new AbortController()


    const timeoutId =
      window.setTimeout(
        () => {
          controller.abort()
        },
        5000,
      )


    async function loadProcess() {

      try {

        setLoading(true)

        setError(null)


        const response =
          await fetch(
            API_URL,
            {
              signal:
                controller.signal,
            },
          )


        if (!response.ok) {

          throw new Error(
            `Process API returned ${response.status}`,
          )

        }


        const data =
          await response.json()


        if (!Array.isArray(data)) {

          throw new Error(
            'The process API returned an invalid response.',
          )

        }


        const matchingProcess =
          data.find(
            (item: Record<string, unknown>) => {

              const id =
                String(
                  item.process_id ??
                  item.processId ??
                  item.id ??
                  '',
                )


              return id.toLowerCase() === String(processId ?? '').toLowerCase()

            },
          )


        if (!active) {
          return
        }


        if (!matchingProcess) {

          setProcess(null)

          setError(null)

          return

        }


        setProcess(
          normalizeProcess(
            matchingProcess,
          ),
        )


      } catch (err) {

        if (
          err instanceof DOMException &&
          err.name === 'AbortError'
        ) {

          if (active) {

            setError(
              'The process backend did not respond within 5 seconds.',
            )

          }

        } else {

          console.error(
            'Failed to load process details:',
            err,
          )


          if (active) {

            setError(
              err instanceof Error
                ? err.message
                : 'Unable to connect to the CyberSentinel process backend.',
            )

          }

        }

      } finally {

        window.clearTimeout(
          timeoutId,
        )


        if (active) {
          setLoading(false)
        }

      }

    }


    void loadProcess()


    return () => {

      active = false

      controller.abort()

      window.clearTimeout(
        timeoutId,
      )

    }

  }, [processId])


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <div className="page-container">

        <div className="process-detail-not-found">

          <Activity size={30} />

          <h2>
            Loading Process Investigation
          </h2>

          <p>
            Retrieving process telemetry from
            the CyberSentinel backend...
          </p>

        </div>

      </div>

    )

  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {

    return (

      <div className="page-container">

        <div className="process-detail-not-found">

          <ShieldAlert size={30} />

          <h2>
            Process Backend Unavailable
          </h2>

          <p>
            {error}
          </p>


          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            style={{
              marginTop: 12,
              padding:
                '9px 14px',
              borderRadius: 7,
              border:
                '1px solid rgba(129, 140, 248, 0.20)',
              background:
                'rgba(129, 140, 248, 0.05)',
              color: '#a5b4fc',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>


          <Link
            to="/processes"
            className="process-back-link"
          >

            <ArrowLeft size={14} />

            Back to Processes

          </Link>

        </div>

      </div>

    )

  }


  // ==========================================================
  // PROCESS NOT FOUND
  // ==========================================================

  if (!process) {

    return (

      <div className="page-container">

        <div className="process-detail-not-found">

          <ShieldAlert size={30} />

          <h2>
            Process Not Found
          </h2>

          <p>
            The requested process does not exist
            in the current backend telemetry.
          </p>


          <Link
            to="/processes"
            className="process-back-link"
          >

            <ArrowLeft size={14} />

            Back to Processes

          </Link>

        </div>

      </div>

    )

  }


  // ==========================================================
  // STATUS CLASS
  // ==========================================================

  const statusClass =
    process.status
      .toLowerCase()
      .replace(
        ' ',
        '-',
      )


  // ==========================================================
  // MAIN PAGE
  // ==========================================================

  return (

    <div className="page-container">


      {/* =====================================================
          HEADER
          ===================================================== */}

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


          <h1>
            {process.name}
          </h1>


          <p>
            Detailed execution context and threat
            investigation for monitored process{' '}
            {process.id}.
          </p>

        </div>


        <div
          className={
            `process-detail-status process-detail-status-${statusClass}`
          }
        >

          <span />

          {process.status}

        </div>


      </div>


      {/* =====================================================
          PROCESS IDENTITY
          ===================================================== */}

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

              {process.id}

              {' · '}

              PID {process.pid}

            </div>

          </div>


        </div>


        <div className="process-detail-endpoint">

          <span>
            ENDPOINT
          </span>

          <strong>
            {process.endpoint}
          </strong>

        </div>


        <div className="process-detail-endpoint">

          <span>
            USER
          </span>

          <strong>
            {process.user}
          </strong>

        </div>


      </section>


      {/* =====================================================
          KEY METRICS
          ===================================================== */}

      <section className="process-detail-metrics">


        <div className="process-detail-metric">

          <Cpu size={17} />

          <span>
            CPU USAGE
          </span>

          <strong>
            {process.cpu}
          </strong>

        </div>


        <div className="process-detail-metric">

          <Activity size={17} />

          <span>
            MEMORY
          </span>

          <strong>
            {process.memory}
          </strong>

        </div>


        <div className="process-detail-metric">

          <User size={17} />

          <span>
            USER CONTEXT
          </span>

          <strong>
            {process.user}
          </strong>

        </div>


        <div className="process-detail-metric">

          <Clock3 size={17} />

          <span>
            OBSERVED
          </span>

          <strong>
            {process.started}
          </strong>

        </div>


      </section>


      {/* =====================================================
          INVESTIGATION GRID
          ===================================================== */}

      <section className="process-detail-grid">


        {/* ===================================================
            EXECUTION CONTEXT
            =================================================== */}

        <div className="process-detail-panel">


          <div className="process-detail-panel-header">

            <div>

              <strong>
                Execution Context
              </strong>

              <span>
                Process execution and parent relationship
              </span>

            </div>

            <Terminal size={18} />

          </div>


          <div className="process-detail-fields">


            <div>

              <span>
                PROCESS NAME
              </span>

              <strong>
                {process.name}
              </strong>

            </div>


            <div>

              <span>
                PROCESS ID
              </span>

              <strong>
                {process.pid}
              </strong>

            </div>


            <div>

              <span>
                PARENT PROCESS
              </span>

              <strong>
                {process.parent}
              </strong>

            </div>


            <div>

              <span>
                INTEGRITY LEVEL
              </span>

              <strong>
                {process.integrity}
              </strong>

            </div>


            <div className="process-detail-field-wide">

              <span>
                COMMAND LINE
              </span>

              <code>
                {process.commandLine}
              </code>

            </div>


            <div className="process-detail-field-wide">

              <span>
                EXECUTABLE / COMMAND
              </span>

              <code>
                {process.executable}
              </code>

            </div>


          </div>


        </div>


        {/* ===================================================
            SECURITY ASSESSMENT
            =================================================== */}

        <div className="process-detail-panel">


          <div className="process-detail-panel-header">

            <div>

              <strong>
                Security Assessment
              </strong>

              <span>
                Current threat assessment for this process
              </span>

            </div>

            <ShieldAlert size={18} />

          </div>


          <div className="process-assessment">


            <div
              className={
                `process-assessment-banner process-assessment-${statusClass}`
              }
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

              <span>
                Detection
              </span>

              <strong>
                {process.detection}
              </strong>

            </div>


            <div className="process-assessment-row">

              <span>
                File Signer
              </span>

              <strong>
                {process.signer}
              </strong>

            </div>


            <div className="process-assessment-row">

              <span>
                SHA-256
              </span>

              <code>
                {process.hash}
              </code>

            </div>


          </div>


        </div>


      </section>


      {/* =====================================================
          ACTIVITY
          ===================================================== */}

      <section className="process-detail-grid">


        {/* ===================================================
            NETWORK ACTIVITY
            =================================================== */}

        <div className="process-detail-panel">


          <div className="process-detail-panel-header">

            <div>

              <strong>
                Network Activity
              </strong>

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


        {/* ===================================================
            INVESTIGATION TIMELINE
            =================================================== */}

        <div className="process-detail-panel">


          <div className="process-detail-panel-header">

            <div>

              <strong>
                Investigation Timeline
              </strong>

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

                <strong>
                  Process telemetry observed
                </strong>

                <small>
                  {process.started}
                </small>

              </div>

            </div>


            <div className="process-timeline-item">

              <span />

              <div>

                <strong>
                  Process telemetry collected
                </strong>

                <small>
                  Current API observation
                </small>

              </div>

            </div>


            <div className="process-timeline-item">

              <span />

              <div>

                <strong>
                  Security assessment generated
                </strong>

                <small>
                  Based on current process status
                </small>

              </div>

            </div>


          </div>


        </div>


      </section>


      {/* =====================================================
          INVESTIGATION NOTES
          ===================================================== */}

      <section className="process-detail-panel process-notes-panel">


        <div className="process-detail-panel-header">

          <div>

            <strong>
              Analyst Investigation Notes
            </strong>

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

                Process is currently classified as
                HIGH RISK by the backend telemetry.

              </p>


              <p>

                Review the process execution context,
                parent process, command-line arguments,
                executable reputation, and related
                endpoint activity.

              </p>


              <p>

                File signer and SHA-256 information are
                not currently returned by the Process API.
                Additional endpoint telemetry would be
                required to validate those indicators.

              </p>

            </>

          ) : process.status === 'SUSPICIOUS' ? (

            <>

              <p>

                <ShieldAlert size={14} />

                Process behavior is currently classified
                as SUSPICIOUS.

              </p>


              <p>

                Investigate the process initiation context,
                parent process, command line, and any
                associated network connections.

              </p>


              <p>

                Additional file reputation and hash
                telemetry is not currently available
                from the Process API.

              </p>

            </>

          ) : (

            <>

              <p>

                <Activity size={14} />

                No immediate threat classification was
                returned for this process.

              </p>


              <p>

                Process is currently classified as NORMAL
                based on the available backend telemetry.

              </p>


              <p>

                Additional file-level metadata such as
                signer and SHA-256 is not currently
                available from the Process API.

              </p>

            </>

          )}


        </div>


      </section>


    </div>

  )

}


export default ProcessDetails