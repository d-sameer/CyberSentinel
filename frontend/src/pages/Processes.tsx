import {

  Activity,

  AlertTriangle,

  Cpu,

  Search,

  ShieldAlert,

  Terminal,

} from 'lucide-react'

import { useMemo, useState, useEffect } from 'react'

import { useNavigate } from 'react-router-dom'

// ============================================================

// TYPES

// ============================================================

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

// ============================================================

// API

// ============================================================

const API_URL =

  'http://127.0.0.1:8001/api/processes'

// ============================================================

// COMPONENT

// ============================================================

function Processes() {

  const navigate = useNavigate()

  const [processes, setProcesses] =

    useState<ProcessData[]>([])

  const [search, setSearch] =

    useState('')

  const [loading, setLoading] =

    useState(true)

  const [error, setError] =

    useState<string | null>(null)

  // ==========================================================

  // LOAD PROCESSES

  // ==========================================================

  useEffect(() => {

    let active = true

    const controller =

      new AbortController()

    const timeoutId =

      window.setTimeout(() => {

        controller.abort()

      }, 5000)

    async function loadProcesses() {

      try {

        setLoading(true)

        setError(null)

        const response =

          await fetch(API_URL, {

            signal: controller.signal,

          })

        if (!response.ok) {

          throw new Error(

            `Process API returned ${response.status}`,

          )

        }

        const data =

          await response.json()

        if (!active) {

          return

        }

        // ------------------------------------------------------

        // Normalize backend response.

        // Supports both snake_case and camelCase.

        // ------------------------------------------------------

        const normalized: ProcessData[] =

          data.map(

            (item: Record<string, unknown>) => ({

              id:

                String(

                  item.process_id ??

                  item.processId ??

                  item.id ??

                  '',

                ),

              name:

                String(

                  item.name ??

                  'Unknown',

                ),

              pid:

                Number(

                  item.pid ??

                  0,

                ),

              endpoint:

                String(

                  item.endpoint ??

                  'Unknown',

                ),

              user:

                String(

                  item.user ??

                  'Unknown',

                ),

              cpu:

                String(

                  item.cpu ??

                  '0%',

                ),

              memory:

                String(

                  item.memory ??

                  '0 MB',

                ),

              parent:

                String(

                  item.parent ??

                  item.parent_process ??

                  item.parentProcess ??

                  'Unknown',

                ),

              commandLine:

                String(

                  item.command_line ??

                  item.commandLine ??

                  'Unknown',

                ),

              status:

                String(

                  item.status ??

                  'NORMAL',

                ).toUpperCase() as ProcessStatus,

            }),

          )

        setProcesses(normalized)

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

            'Failed to load processes:',

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

        window.clearTimeout(timeoutId)

        if (active) {

          setLoading(false)

        }

      }

    }

    void loadProcesses()

    return () => {

      active = false

      controller.abort()

      window.clearTimeout(timeoutId)

    }

  }, [])

  // ==========================================================

  // SUMMARY

  // ==========================================================

  const normalProcesses =

    processes.filter(

      (process) =>

        process.status === 'NORMAL',

    ).length

  const suspiciousProcesses =

    processes.filter(

      (process) =>

        process.status === 'SUSPICIOUS',

    ).length

  const highRiskProcesses =

    processes.filter(

      (process) =>

        process.status === 'HIGH RISK',

    ).length

  // ==========================================================

  // FILTERED PROCESSES

  // ==========================================================

  const filteredProcesses =

    useMemo(() => {

      const query =

        search.trim().toLowerCase()

      if (!query) {

        return processes

      }

      return processes.filter(

        (process) =>

          process.name

            .toLowerCase()

            .includes(query) ||

          process.id

            .toLowerCase()

            .includes(query) ||

          process.endpoint

            .toLowerCase()

            .includes(query) ||

          process.user

            .toLowerCase()

            .includes(query) ||

          String(process.pid)

            .includes(query) ||

          process.parent

            .toLowerCase()

            .includes(query) ||

          process.commandLine

            .toLowerCase()

            .includes(query),

      )

    }, [processes, search])

  // ==========================================================

  // AVERAGE CPU

  // ==========================================================

  const averageCpu =

    useMemo(() => {

      if (processes.length === 0) {

        return '0.0%'

      }

      const total =

        processes.reduce(

          (sum, process) => {

            const value =

              Number.parseFloat(

                process.cpu.replace(

                  '%',

                  '',

                ),

              )

            return sum + (

              Number.isNaN(value)

                ? 0

                : value

            )

          },

          0,

        )

      return `${(

        total / processes.length

      ).toFixed(1)}%`

    }, [processes])

  // ==========================================================

  // LOADING

  // ==========================================================

  if (loading) {

    return (

      <div className="page-container">

        <div className="process-panel">

          <div

            className="process-panel-header"

            style={{

              minHeight: 220,

              justifyContent: 'center',

            }}

          >

            <div>

              <div className="process-panel-title">

                Loading Process Monitoring

              </div>

              <div className="process-panel-subtitle">

                Retrieving endpoint process telemetry

                from CyberSentinel...

              </div>

            </div>

            <Activity size={22} />

          </div>

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

        <div className="process-panel">

          <div

            className="process-panel-header"

            style={{

              minHeight: 220,

              justifyContent: 'center',

            }}

          >

            <div>

              <div

                className="process-panel-title"

                style={{

                  color: '#f87171',

                }}

              >

                Process Backend Unavailable

              </div>

              <div className="process-panel-subtitle">

                {error}

              </div>

              <button

                type="button"

                onClick={() =>

                  window.location.reload()

                }

                style={{

                  marginTop: 16,

                  padding: '9px 14px',

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

            </div>

            <ShieldAlert size={22} />

          </div>

        </div>

      </div>

    )

  }

  // ==========================================================

  // MAIN PAGE

  // ==========================================================

  return (

    <div className="page-container">

      {/* =====================================================

          PAGE HEADER

          ===================================================== */}

      <div className="page-header">

        <div>

          <div className="page-eyebrow">

            ENDPOINT THREAT HUNTING

          </div>

          <h1>

            Processes

          </h1>

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

      {/* =====================================================

          PROCESS SUMMARY

          ===================================================== */}

      <section className="process-summary-grid">

        {/* TOTAL */}

        <div className="process-summary-card">

          <div className="process-summary-top">

            <span>

              TOTAL PROCESSES

            </span>

            <Activity size={17} />

          </div>

          <strong>

            {String(

              processes.length,

            ).padStart(2, '0')}

          </strong>

          <p>

            Processes currently monitored

          </p>

        </div>

        {/* NORMAL */}

        <div className="process-summary-card">

          <div className="process-summary-top">

            <span>

              NORMAL

            </span>

            <Cpu size={17} />

          </div>

          <strong>

            {String(

              normalProcesses,

            ).padStart(2, '0')}

          </strong>

          <p>

            No immediate indicators

          </p>

        </div>

        {/* SUSPICIOUS */}

        <div className="process-summary-card process-summary-warning">

          <div className="process-summary-top">

            <span>

              SUSPICIOUS

            </span>

            <ShieldAlert size={17} />

          </div>

          <strong>

            {String(

              suspiciousProcesses,

            ).padStart(2, '0')}

          </strong>

          <p>

            Require analyst review

          </p>

        </div>

        {/* HIGH RISK */}

        <div className="process-summary-card process-summary-danger">

          <div className="process-summary-top">

            <span>

              HIGH RISK

            </span>

            <AlertTriangle size={17} />

          </div>

          <strong>

            {String(

              highRiskProcesses,

            ).padStart(2, '0')}

          </strong>

          <p>

            Potential malicious behavior

          </p>

        </div>

      </section>

      {/* =====================================================

          HUNTING OVERVIEW

          ===================================================== */}

      <section className="process-overview-grid">

        {/* RESOURCE ACTIVITY */}

        <div className="process-panel">

          <div className="process-panel-header">

            <div>

              <div className="process-panel-title">

                Process Resource Activity

              </div>

              <div className="process-panel-subtitle">

                CPU utilization across monitored processes

              </div>

            </div>

            <Activity size={18} />

          </div>

          <div

            style={{

              padding: '22px 18px',

            }}

          >

            {processes

              .slice()

              .sort(

                (a, b) =>

                  Number.parseFloat(

                    b.cpu,

                  ) -

                  Number.parseFloat(

                    a.cpu,

                  ),

              )

              .slice(0, 6)

              .map((process) => {

                const cpu =

                  Number.parseFloat(

                    process.cpu.replace(

                      '%',

                      '',

                    ),

                  )

                const width =

                  Math.min(

                    Math.max(

                      cpu,

                      0,

                    ),

                    100,

                  )

                return (

                  <div

                    key={process.id}

                    style={{

                      marginBottom: 16,

                    }}

                  >

                    <div

                      style={{

                        display: 'flex',

                        justifyContent:

                          'space-between',

                        alignItems:

                          'center',

                        marginBottom: 6,

                      }}

                    >

                      <span

                        style={{

                          color: '#94a3b8',

                          fontSize: 10,

                        }}

                      >

                        {process.name}

                      </span>

                      <span

                        className="process-mono"

                        style={{

                          color:

                            cpu >= 20

                              ? '#f87171'

                              : '#818cf8',

                          fontSize: 10,

                        }}

                      >

                        {process.cpu}

                      </span>

                    </div>

                    <div

                      style={{

                        height: 6,

                        borderRadius: 999,

                        background:

                          'rgba(148, 163, 184, 0.08)',

                        overflow: 'hidden',

                      }}

                    >

                      <div

                        style={{

                          width: `${width}%`,

                          height: '100%',

                          borderRadius: 999,

                          background:

                            cpu >= 20

                              ? '#ef4444'

                              : '#818cf8',

                          transition:

                            'width 0.3s ease',

                        }}

                      />

                    </div>

                  </div>

                )

              })}

            <div

              style={{

                marginTop: 8,

                color: '#475569',

                fontSize: 9,

              }}

            >

              Average CPU usage: {averageCpu}

            </div>

          </div>

        </div>

        {/* THREAT INDICATORS */}

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

            {processes

              .filter(

                (process) =>

                  process.status !== 'NORMAL',

              )

              .map((process) => (

                <div

                  className="process-indicator-item"

                  key={process.id}

                >

                  <div

                    className={`process-indicator-icon ${

                      process.status === 'HIGH RISK'

                        ? 'process-indicator-danger'

                        : 'process-indicator-warning'

                    }`}

                  >

                    {process.status === 'HIGH RISK' ? (

                      <AlertTriangle size={15} />

                    ) : (

                      <ShieldAlert size={15} />

                    )}

                  </div>

                  <div>

                    <strong>

                      {process.status}

                    </strong>

                    <span>

                      {process.name} on{' '}

                      {process.endpoint}

                    </span>

                  </div>

                </div>

              ))}

            {processes.filter(

              (process) =>

                process.status !== 'NORMAL',

            ).length === 0 && (

              <div

                style={{

                  padding: 18,

                  color: '#64748b',

                  fontSize: 10,

                }}

              >

                No suspicious process activity

                detected.

              </div>

            )}

          </div>

        </div>

      </section>

      {/* =====================================================

          SEARCH

          ===================================================== */}

      <div className="process-toolbar">

        <div className="process-search">

          <Search size={15} />

          <input

            type="text"

            value={search}

            onChange={(event) =>

              setSearch(

                event.target.value,

              )

            }

            placeholder="Search process, endpoint, user or PID..."

          />

        </div>

        <div className="process-result-count">

          {filteredProcesses.length}{' '}

          monitored processes

        </div>

      </div>

      {/* =====================================================

          PROCESS TABLE

          ===================================================== */}

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

                <th>

                  PROCESS

                </th>

                <th>

                  PID

                </th>

                <th>

                  ENDPOINT

                </th>

                <th>

                  USER

                </th>

                <th>

                  CPU

                </th>

                <th>

                  MEMORY

                </th>

                <th>

                  PARENT

                </th>

                <th>

                  STATUS

                </th>

              </tr>

            </thead>

            <tbody>

              {filteredProcesses.map(

                (process) => (

                  <tr

                    key={process.id}

                    onClick={() =>

                      navigate(

                        `/processes/${process.id}`,

                      )

                    }

                    style={{

                      cursor: 'pointer',

                    }}

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

                          .replace(

                            ' ',

                            '-',

                          )}`}

                      >

                        <span />

                        {process.status}

                      </span>

                    </td>

                  </tr>

                ),

              )}

              {filteredProcesses.length === 0 && (

                <tr>

                  <td

                    colSpan={8}

                    style={{

                      padding: 30,

                      textAlign: 'center',

                      color: '#64748b',

                    }}

                  >

                    No processes match your search.

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>

  )

}

export default Processes
