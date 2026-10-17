import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Copy,
  Cpu,
  FileText,
  Play,
  Shield,
  Target,
  User,
  Workflow,
  X,
  History,
  RefreshCw,
} from 'lucide-react'

type Playbook = {
  playbook_id: string
  name: string
  description: string
  category: string
  severity: string
  status: string
  trigger_type: string
  target_type: string
  actions: string[]
  owner: string
  version: string
  created_at: string | null
  updated_at: string | null
}

type PlaybookExecution = {
  execution_id: string
  playbook_id: string
  target: string
  actor: string
  status: string
  note: string
  step_count: number
  result: string
  started_at: string | null
  completed_at: string | null
}

type ExecutionResponse = {
  playbook_id: string
  total_executions: number
  executions: PlaybookExecution[]
}

function getSeverityClass(severity: string) {
  switch (severity) {
    case 'CRITICAL':
      return 'soc-category-critical'
    case 'HIGH':
      return 'soc-category-high'
    case 'MEDIUM':
      return 'soc-category-medium'
    default:
      return 'soc-category-low'
  }
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Not available'
  }

  return new Date(value).toLocaleString()
}

export default function SecurityPlaybookDetails() {
  const { playbookId } = useParams()

  const [playbook, setPlaybook] = useState<Playbook | null>(null)
  const [executions, setExecutions] = useState<
    PlaybookExecution[]
  >([])

  const [loading, setLoading] = useState(true)
  const [executionLoading, setExecutionLoading] =
    useState(false)

  const [error, setError] = useState('')
  const [executionError, setExecutionError] =
    useState('')

  const [showExecuteModal, setShowExecuteModal] =
    useState(false)

  const [target, setTarget] = useState('')
  const [note, setNote] = useState('')

  const [executionSuccess, setExecutionSuccess] =
    useState<PlaybookExecution | null>(null)

  const loadExecutions = async () => {
    if (!playbookId) {
      return
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8001/api/playbooks/${encodeURIComponent(
          playbookId,
        )}/executions`,
      )

      if (!response.ok) {
        throw new Error(
          `Unable to load execution history (${response.status})`,
        )
      }

      const data: ExecutionResponse =
        await response.json()

      setExecutions(data.executions || [])
    } catch (err) {
      setExecutionError(
        err instanceof Error
          ? err.message
          : 'Unable to load execution history.',
      )
    }
  }

  useEffect(() => {
    const loadPlaybook = async () => {
      if (!playbookId) {
        setError('Playbook ID is missing.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `http://127.0.0.1:8001/api/playbooks/${encodeURIComponent(
            playbookId,
          )}`,
        )

        if (!response.ok) {
          throw new Error(
            `Unable to load playbook (${response.status})`,
          )
        }

        const data: Playbook = await response.json()

        setPlaybook(data)

        setTarget(
          data.target_type === 'Endpoint'
            ? 'WIN-01'
            : '',
        )
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load playbook.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadPlaybook()
  }, [playbookId])

  useEffect(() => {
    if (!loading && playbook) {
      loadExecutions()
    }
  }, [loading, playbook, playbookId])

  const openExecuteModal = () => {
    setExecutionError('')
    setExecutionSuccess(null)

    if (!target) {
      setTarget(
        playbook?.target_type === 'Endpoint'
          ? 'WIN-01'
          : '',
      )
    }

    setShowExecuteModal(true)
  }

  const closeExecuteModal = () => {
    if (executionLoading) {
      return
    }

    setShowExecuteModal(false)
    setExecutionError('')
  }

  const executePlaybook = async () => {
    if (!playbookId || !playbook) {
      return
    }

    const cleanTarget = target.trim()

    if (!cleanTarget) {
      setExecutionError(
        'Execution target is required.',
      )
      return
    }

    try {
      setExecutionLoading(true)
      setExecutionError('')
      setExecutionSuccess(null)

      const response = await fetch(
        `http://127.0.0.1:8001/api/playbooks/${encodeURIComponent(
          playbookId,
        )}/executions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            target: cleanTarget,
            note: note.trim(),
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            `Execution failed (${response.status})`,
        )
      }

      setExecutionSuccess(data)

      setExecutions((current) => [
        data,
        ...current,
      ])

      setNote('')
    } catch (err) {
      setExecutionError(
        err instanceof Error
          ? err.message
          : 'Unable to execute playbook.',
      )
    } finally {
      setExecutionLoading(false)
    }
  }

  const copyPlaybookId = async () => {
    if (!playbook) {
      return
    }

    try {
      await navigator.clipboard.writeText(
        playbook.playbook_id,
      )
    } catch {
      // Clipboard access may be unavailable.
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">
              SECURITY AUTOMATION CENTER
            </div>

            <h1>Playbook Details</h1>

            <p>
              Loading security automation workflow...
            </p>
          </div>
        </div>

        <div className="dashboard-panel">
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              color: '#94a3b8',
            }}
          >
            Loading playbook data...
          </div>
        </div>
      </div>
    )
  }

  if (error || !playbook) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">
              SECURITY AUTOMATION CENTER
            </div>

            <h1>Playbook Details</h1>

            <p>
              Unable to load the requested security
              playbook.
            </p>
          </div>
        </div>

        <div className="dashboard-panel">
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
            }}
          >
            <AlertTriangle
              size={42}
              style={{
                color: '#f59e0b',
                marginBottom: '14px',
              }}
            />

            <div
              style={{
                color: '#f8fafc',
                fontSize: '18px',
                fontWeight: 700,
                marginBottom: '8px',
              }}
            >
              Playbook not available
            </div>

            <div
              style={{
                color: '#94a3b8',
                marginBottom: '20px',
              }}
            >
              {error ||
                'The requested playbook could not be found.'}
            </div>

            <Link
              to="/automation"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '8px',
                border:
                  '1px solid rgba(34, 211, 238, 0.35)',
                background:
                  'rgba(8, 47, 73, 0.45)',
                color: '#67e8f9',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              <ArrowLeft size={17} />
              Back to Playbooks
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <Link
            to="/automation"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              color: '#67e8f9',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 700,
              marginBottom: '18px',
            }}
          >
            <ArrowLeft size={17} />
            Security Playbooks
          </Link>

          <div className="page-eyebrow">
            SECURITY AUTOMATION CENTER
          </div>

          <h1>{playbook.name}</h1>

          <p>
            Review the automation workflow, trigger
            conditions, execution target, and configured
            response actions.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '10px',
            border:
              '1px solid rgba(34, 211, 238, 0.22)',
            background:
              'rgba(8, 47, 73, 0.30)',
            color: '#67e8f9',
            fontSize: '13px',
            fontWeight: 800,
          }}
        >
          <Activity size={17} />
          AUTOMATION WORKFLOW
        </div>
      </div>

      {/* IDENTITY / STATUS */}
      <div
        className="dashboard-panel"
        style={{
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            padding: '22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  'rgba(6, 182, 212, 0.12)',
                border:
                  '1px solid rgba(34, 211, 238, 0.22)',
              }}
            >
              <Workflow
                size={27}
                style={{
                  color: '#22d3ee',
                }}
              />
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    color: '#f8fafc',
                    fontSize: '20px',
                    fontWeight: 800,
                  }}
                >
                  {playbook.playbook_id}
                </span>

                <span
                  style={{
                    color: '#64748b',
                  }}
                >
                  •
                </span>

                <span
                  style={{
                    color: '#94a3b8',
                  }}
                >
                  Version {playbook.version}
                </span>
              </div>

              <div
                style={{
                  marginTop: '5px',
                  color: '#64748b',
                  fontSize: '13px',
                }}
              >
                Security automation workflow
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <span
              className={getSeverityClass(
                playbook.severity,
              )}
              style={{
                padding: '7px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              {playbook.severity}
            </span>

            <span
              style={{
                padding: '7px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 800,
                color:
                  playbook.status === 'ENABLED'
                    ? '#4ade80'
                    : '#94a3b8',
                background:
                  playbook.status === 'ENABLED'
                    ? 'rgba(34, 197, 94, 0.10)'
                    : 'rgba(100, 116, 139, 0.12)',
                border:
                  playbook.status === 'ENABLED'
                    ? '1px solid rgba(34, 197, 94, 0.22)'
                    : '1px solid rgba(100, 116, 139, 0.22)',
              }}
            >
              {playbook.status}
            </span>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div
        className="stats-grid"
        style={{
          marginBottom: '20px',
        }}
      >
        <div className="stat-card">
          <div
            style={{
              color: '#67e8f9',
              marginBottom: '12px',
            }}
          >
            <Target size={22} />
          </div>

          <div
            style={{
              color: '#64748b',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Trigger
          </div>

          <div
            style={{
              marginTop: '7px',
              color: '#f8fafc',
              fontSize: '17px',
              fontWeight: 700,
            }}
          >
            {playbook.trigger_type}
          </div>
        </div>

        <div className="stat-card">
          <div
            style={{
              color: '#67e8f9',
              marginBottom: '12px',
            }}
          >
            <Cpu size={22} />
          </div>

          <div
            style={{
              color: '#64748b',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Target
          </div>

          <div
            style={{
              marginTop: '7px',
              color: '#f8fafc',
              fontSize: '17px',
              fontWeight: 700,
            }}
          >
            {playbook.target_type}
          </div>
        </div>

        <div className="stat-card">
          <div
            style={{
              color: '#67e8f9',
              marginBottom: '12px',
            }}
          >
            <Play size={22} />
          </div>

          <div
            style={{
              color: '#64748b',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Executions
          </div>

          <div
            style={{
              marginTop: '7px',
              color: '#f8fafc',
              fontSize: '22px',
              fontWeight: 800,
            }}
          >
            {executions.length}
          </div>
        </div>

        <div className="stat-card">
          <div
            style={{
              color: '#67e8f9',
              marginBottom: '12px',
            }}
          >
            <User size={22} />
          </div>

          <div
            style={{
              color: '#64748b',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Owner
          </div>

          <div
            style={{
              marginTop: '7px',
              color: '#f8fafc',
              fontSize: '17px',
              fontWeight: 700,
            }}
          >
            {playbook.owner}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        className="dashboard-grid"
        style={{
          gridTemplateColumns:
            'minmax(0, 1.15fr) minmax(320px, 0.85fr)',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* DESCRIPTION */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <FileText size={19} />
                <span>Playbook Description</span>
              </div>
            </div>

            <div
              style={{
                padding: '22px',
                color: '#cbd5e1',
                lineHeight: 1.7,
                fontSize: '15px',
              }}
            >
              {playbook.description}
            </div>
          </div>

          {/* WORKFLOW */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <Workflow size={19} />
                <span>Automation Workflow</span>
              </div>

              <span
                style={{
                  color: '#64748b',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {playbook.actions.length} STEPS
              </span>
            </div>

            <div
              style={{
                padding: '22px',
              }}
            >
              {playbook.actions.map(
                (action, index) => (
                  <div
                    key={`${playbook.playbook_id}-${index}`}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      position: 'relative',
                      paddingBottom:
                        index ===
                        playbook.actions.length - 1
                          ? '0'
                          : '24px',
                    }}
                  >
                    {index !==
                      playbook.actions.length - 1 && (
                      <div
                        style={{
                          position: 'absolute',
                          left: '16px',
                          top: '34px',
                          bottom: '0',
                          width: '1px',
                          background:
                            'rgba(71, 85, 105, 0.45)',
                        }}
                      />
                    )}

                    <div
                      style={{
                        position: 'relative',
                        zIndex: 1,
                        width: '34px',
                        height: '34px',
                        minWidth: '34px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background:
                          'rgba(6, 182, 212, 0.12)',
                        border:
                          '1px solid rgba(34, 211, 238, 0.28)',
                        color: '#67e8f9',
                        fontSize: '13px',
                        fontWeight: 800,
                      }}
                    >
                      {index + 1}
                    </div>

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        paddingTop: '5px',
                      }}
                    >
                      <div
                        style={{
                          color: '#f8fafc',
                          fontSize: '15px',
                          fontWeight: 700,
                        }}
                      >
                        {action}
                      </div>

                      <div
                        style={{
                          marginTop: '5px',
                          color: '#64748b',
                          fontSize: '12px',
                        }}
                      >
                        Automated response step
                      </div>
                    </div>

                    <CheckCircle2
                      size={18}
                      style={{
                        color: '#4ade80',
                        marginTop: '5px',
                      }}
                    />
                  </div>
                ),
              )}
            </div>
          </div>

          {/* EXECUTION HISTORY */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <History size={19} />
                <span>Execution History</span>
              </div>

              <button
                type="button"
                onClick={loadExecutions}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#67e8f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>

            {executionError && (
              <div
                style={{
                  margin: '18px 22px 0',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border:
                    '1px solid rgba(239, 68, 68, 0.25)',
                  background:
                    'rgba(127, 29, 29, 0.15)',
                  color: '#fca5a5',
                  fontSize: '13px',
                }}
              >
                {executionError}
              </div>
            )}

            {executions.length === 0 ? (
              <div
                style={{
                  padding: '35px 22px',
                  textAlign: 'center',
                  color: '#64748b',
                }}
              >
                <History
                  size={30}
                  style={{
                    marginBottom: '10px',
                    opacity: 0.6,
                  }}
                />

                <div
                  style={{
                    color: '#94a3b8',
                    fontWeight: 700,
                  }}
                >
                  No executions recorded
                </div>

                <div
                  style={{
                    marginTop: '5px',
                    fontSize: '12px',
                  }}
                >
                  Execute this playbook to create
                  an execution record.
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '8px 0 12px',
                  overflowX: 'auto',
                }}
              >
                {executions.map((execution) => (
                  <div
                    key={execution.execution_id}
                    style={{
                      margin: '10px 22px',
                      padding: '16px',
                      borderRadius: '10px',
                      border:
                        '1px solid rgba(71, 85, 105, 0.30)',
                      background:
                        'rgba(15, 23, 42, 0.55)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <Link
                          to={`/automation/${playbook.playbook_id}/executions/${execution.execution_id}`}
                          style={{
                            color: '#67e8f9',
                            fontWeight: 800,
                            fontSize: '14px',
                            textDecoration: 'none',
                          }}
                        >
                          {execution.execution_id}
                        </Link>

                        <span
                          style={{
                            color: '#64748b',
                          }}
                        >
                          •
                        </span>

                        <span
                          style={{
                            color: '#cbd5e1',
                            fontSize: '13px',
                            fontWeight: 700,
                          }}
                        >
                          {execution.target}
                        </span>
                      </div>

                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 9px',
                          borderRadius: '999px',
                          background:
                            'rgba(34, 197, 94, 0.10)',
                          border:
                            '1px solid rgba(34, 197, 94, 0.22)',
                          color: '#4ade80',
                          fontSize: '11px',
                          fontWeight: 800,
                        }}
                      >
                        <CheckCircle2 size={13} />
                        {execution.status}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(3, minmax(0, 1fr))',
                        gap: '12px',
                        marginTop: '14px',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: '#64748b',
                            fontSize: '10px',
                            fontWeight: 800,
                            marginBottom: '4px',
                          }}
                        >
                          ACTOR
                        </div>

                        <div
                          style={{
                            color: '#cbd5e1',
                            fontSize: '12px',
                          }}
                        >
                          {execution.actor}
                        </div>
                      </div>

                      <div>
                        <div
                          style={{
                            color: '#64748b',
                            fontSize: '10px',
                            fontWeight: 800,
                            marginBottom: '4px',
                          }}
                        >
                          STEPS
                        </div>

                        <div
                          style={{
                            color: '#cbd5e1',
                            fontSize: '12px',
                          }}
                        >
                          {execution.step_count}
                        </div>
                      </div>

                      <div>
                        <div
                          style={{
                            color: '#64748b',
                            fontSize: '10px',
                            fontWeight: 800,
                            marginBottom: '4px',
                          }}
                        >
                          COMPLETED
                        </div>

                        <div
                          style={{
                            color: '#cbd5e1',
                            fontSize: '12px',
                          }}
                        >
                          {formatDate(
                            execution.completed_at,
                          )}
                        </div>
                      </div>
                    </div>

                    {execution.note && (
                      <div
                        style={{
                          marginTop: '13px',
                          paddingTop: '12px',
                          borderTop:
                            '1px solid rgba(71, 85, 105, 0.22)',
                          color: '#94a3b8',
                          fontSize: '12px',
                          lineHeight: 1.6,
                        }}
                      >
                        <strong
                          style={{
                            color: '#cbd5e1',
                          }}
                        >
                          Note:
                        </strong>{' '}
                        {execution.note}
                      </div>
                    )}

                    <div
                      style={{
                        marginTop: '12px',
                        color: '#64748b',
                        fontSize: '11px',
                        lineHeight: 1.5,
                      }}
                    >
                      {execution.result}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* CONFIGURATION */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <Shield size={19} />
                <span>Workflow Configuration</span>
              </div>
            </div>

            <div
              style={{
                padding: '8px 22px 18px',
              }}
            >
              <div
                style={{
                  padding: '16px 0',
                  borderBottom:
                    '1px solid rgba(71, 85, 105, 0.25)',
                }}
              >
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '6px',
                  }}
                >
                  CATEGORY
                </div>

                <div
                  style={{
                    color: '#e2e8f0',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                >
                  {playbook.category}
                </div>
              </div>

              <div
                style={{
                  padding: '16px 0',
                  borderBottom:
                    '1px solid rgba(71, 85, 105, 0.25)',
                }}
              >
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '6px',
                  }}
                >
                  TRIGGER CONDITION
                </div>

                <div
                  style={{
                    color: '#e2e8f0',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                >
                  {playbook.trigger_type}
                </div>
              </div>

              <div
                style={{
                  padding: '16px 0',
                  borderBottom:
                    '1px solid rgba(71, 85, 105, 0.25)',
                }}
              >
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '6px',
                  }}
                >
                  EXECUTION TARGET
                </div>

                <div
                  style={{
                    color: '#e2e8f0',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                >
                  {playbook.target_type}
                </div>
              </div>

              <div
                style={{
                  padding: '16px 0',
                }}
              >
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '6px',
                  }}
                >
                  OWNER
                </div>

                <div
                  style={{
                    color: '#e2e8f0',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                >
                  {playbook.owner}
                </div>
              </div>
            </div>
          </div>

          {/* METADATA */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <Clock3 size={19} />
                <span>Playbook Metadata</span>
              </div>
            </div>

            <div
              style={{
                padding: '8px 22px 18px',
              }}
            >
              <div
                style={{
                  padding: '16px 0',
                  borderBottom:
                    '1px solid rgba(71, 85, 105, 0.25)',
                }}
              >
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '6px',
                  }}
                >
                  CREATED
                </div>

                <div
                  style={{
                    color: '#cbd5e1',
                    fontSize: '13px',
                  }}
                >
                  {formatDate(playbook.created_at)}
                </div>
              </div>

              <div
                style={{
                  padding: '16px 0',
                }}
              >
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '6px',
                  }}
                >
                  LAST UPDATED
                </div>

                <div
                  style={{
                    color: '#cbd5e1',
                    fontSize: '13px',
                  }}
                >
                  {formatDate(playbook.updated_at)}
                </div>
              </div>
            </div>
          </div>

          {/* STATUS */}
          <div
            className="dashboard-panel"
            style={{
              borderColor:
                playbook.status === 'ENABLED'
                  ? 'rgba(34, 197, 94, 0.18)'
                  : 'rgba(100, 116, 139, 0.18)',
            }}
          >
            <div
              style={{
                padding: '20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      playbook.status === 'ENABLED'
                        ? 'rgba(34, 197, 94, 0.10)'
                        : 'rgba(100, 116, 139, 0.10)',
                  }}
                >
                  {playbook.status === 'ENABLED' ? (
                    <CheckCircle2
                      size={21}
                      style={{
                        color: '#4ade80',
                      }}
                    />
                  ) : (
                    <AlertTriangle
                      size={21}
                      style={{
                        color: '#94a3b8',
                      }}
                    />
                  )}
                </div>

                <div>
                  <div
                    style={{
                      color: '#f8fafc',
                      fontWeight: 800,
                      fontSize: '15px',
                    }}
                  >
                    {playbook.status === 'ENABLED'
                      ? 'Playbook Enabled'
                      : 'Playbook Disabled'}
                  </div>

                  <div
                    style={{
                      color: '#64748b',
                      fontSize: '12px',
                      marginTop: '3px',
                    }}
                  >
                    {playbook.status === 'ENABLED'
                      ? 'Workflow is available for automated execution.'
                      : 'Workflow is currently unavailable for execution.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* EXECUTE BUTTON */}
          <button
            type="button"
            onClick={openExecuteModal}
            disabled={playbook.status !== 'ENABLED'}
            style={{
              width: '100%',
              border:
                '1px solid rgba(34, 211, 238, 0.30)',
              background:
                playbook.status === 'ENABLED'
                  ? 'linear-gradient(135deg, rgba(8, 47, 73, 0.90), rgba(8, 51, 68, 0.80))'
                  : 'rgba(30, 41, 59, 0.55)',
              color:
                playbook.status === 'ENABLED'
                  ? '#67e8f9'
                  : '#64748b',
              borderRadius: '10px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '9px',
              fontWeight: 800,
              fontSize: '14px',
              cursor:
                playbook.status === 'ENABLED'
                  ? 'pointer'
                  : 'not-allowed',
            }}
          >
            <Play size={17} />
            Execute Playbook
          </button>

          {/* COPY */}
          <button
            type="button"
            onClick={copyPlaybookId}
            style={{
              width: '100%',
              border:
                '1px solid rgba(71, 85, 105, 0.45)',
              background:
                'rgba(15, 23, 42, 0.65)',
              color: '#94a3b8',
              borderRadius: '10px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '9px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <Copy size={16} />
            Copy Playbook ID
          </button>
        </div>
      </div>

      {/* EXECUTION MODAL */}
      {showExecuteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background:
              'rgba(2, 6, 23, 0.78)',
            backdropFilter: 'blur(5px)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              border:
                '1px solid rgba(34, 211, 238, 0.25)',
              borderRadius: '14px',
              background:
                'linear-gradient(180deg, #0b1220 0%, #080f1c 100%)',
              boxShadow:
                '0 25px 80px rgba(0, 0, 0, 0.55)',
            }}
          >
            {/* MODAL HEADER */}
            <div
              style={{
                padding: '20px 22px',
                borderBottom:
                  '1px solid rgba(71, 85, 105, 0.28)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '15px',
              }}
            >
              <div>
                <div
                  style={{
                    color: '#67e8f9',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    marginBottom: '6px',
                  }}
                >
                  SECURITY AUTOMATION
                </div>

                <div
                  style={{
                    color: '#f8fafc',
                    fontSize: '20px',
                    fontWeight: 800,
                  }}
                >
                  Execute Playbook
                </div>
              </div>

              <button
                type="button"
                onClick={closeExecuteModal}
                disabled={executionLoading}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  border:
                    '1px solid rgba(71, 85, 105, 0.35)',
                  background:
                    'rgba(15, 23, 42, 0.75)',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: executionLoading
                    ? 'not-allowed'
                    : 'pointer',
                }}
              >
                <X size={17} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div
              style={{
                padding: '22px',
              }}
            >
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '9px',
                  border:
                    '1px solid rgba(34, 211, 238, 0.18)',
                  background:
                    'rgba(8, 47, 73, 0.22)',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '11px',
                    fontWeight: 800,
                    marginBottom: '5px',
                  }}
                >
                  PLAYBOOK
                </div>

                <div
                  style={{
                    color: '#e2e8f0',
                    fontWeight: 800,
                  }}
                >
                  {playbook.playbook_id} — {playbook.name}
                </div>
              </div>

              {/* TARGET */}
              <label
                style={{
                  display: 'block',
                  color: '#cbd5e1',
                  fontSize: '13px',
                  fontWeight: 800,
                  marginBottom: '8px',
                }}
              >
                Execution Target
              </label>

              <input
                value={target}
                onChange={(event) =>
                  setTarget(event.target.value)
                }
                placeholder={`Enter ${playbook.target_type.toLowerCase()} target...`}
                disabled={executionLoading}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  borderRadius: '9px',
                  border:
                    '1px solid rgba(71, 85, 105, 0.45)',
                  background:
                    'rgba(15, 23, 42, 0.80)',
                  color: '#f8fafc',
                  outline: 'none',
                  fontSize: '14px',
                  marginBottom: '18px',
                }}
              />

              {/* NOTE */}
              <label
                style={{
                  display: 'block',
                  color: '#cbd5e1',
                  fontSize: '13px',
                  fontWeight: 800,
                  marginBottom: '8px',
                }}
              >
                Execution Note
              </label>

              <textarea
                value={note}
                onChange={(event) =>
                  setNote(event.target.value)
                }
                placeholder="Describe why this playbook is being executed..."
                disabled={executionLoading}
                rows={4}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  padding: '12px 14px',
                  borderRadius: '9px',
                  border:
                    '1px solid rgba(71, 85, 105, 0.45)',
                  background:
                    'rgba(15, 23, 42, 0.80)',
                  color: '#f8fafc',
                  outline: 'none',
                  fontSize: '14px',
                  lineHeight: 1.5,
                  marginBottom: '18px',
                }}
              />

              {/* EXECUTION WARNING */}
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '9px',
                  border:
                    '1px solid rgba(245, 158, 11, 0.22)',
                  background:
                    'rgba(120, 53, 15, 0.12)',
                  color: '#fbbf24',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  marginBottom: '18px',
                }}
              >
                <AlertTriangle
                  size={17}
                  style={{
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                />

                <span>
                  This portfolio workflow records a
                  simulated security response execution.
                  It does not directly perform actions
                  against the target system.
                </span>
              </div>

              {/* ERROR */}
              {executionError && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '9px',
                    border:
                      '1px solid rgba(239, 68, 68, 0.28)',
                    background:
                      'rgba(127, 29, 29, 0.16)',
                    color: '#fca5a5',
                    fontSize: '13px',
                    marginBottom: '18px',
                  }}
                >
                  {executionError}
                </div>
              )}

              {/* SUCCESS */}
              {executionSuccess && (
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '9px',
                    border:
                      '1px solid rgba(34, 197, 94, 0.25)',
                    background:
                      'rgba(20, 83, 45, 0.14)',
                    marginBottom: '18px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#4ade80',
                      fontWeight: 800,
                      fontSize: '14px',
                      marginBottom: '6px',
                    }}
                  >
                    <CheckCircle2 size={17} />
                    Playbook Executed Successfully
                  </div>

                  <div
                    style={{
                      color: '#94a3b8',
                      fontSize: '12px',
                      lineHeight: 1.6,
                    }}
                  >
                    Execution{' '}
                    <strong
                      style={{
                        color: '#cbd5e1',
                      }}
                    >
                      {executionSuccess.execution_id}
                    </strong>{' '}
                    was recorded for target{' '}
                    <strong
                      style={{
                        color: '#cbd5e1',
                      }}
                    >
                      {executionSuccess.target}
                    </strong>
                    .
                  </div>
                </div>
              )}

              {/* BUTTONS */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={closeExecuteModal}
                  disabled={executionLoading}
                  style={{
                    border:
                      '1px solid rgba(71, 85, 105, 0.45)',
                    background:
                      'rgba(15, 23, 42, 0.70)',
                    color: '#94a3b8',
                    borderRadius: '9px',
                    padding: '11px 18px',
                    fontWeight: 700,
                    cursor: executionLoading
                      ? 'not-allowed'
                      : 'pointer',
                  }}
                >
                  {executionSuccess
                    ? 'Close'
                    : 'Cancel'}
                </button>

                {!executionSuccess && (
                  <button
                    type="button"
                    onClick={executePlaybook}
                    disabled={executionLoading}
                    style={{
                      border:
                        '1px solid rgba(34, 211, 238, 0.30)',
                      background:
                        'linear-gradient(135deg, #083047, #083344)',
                      color: '#67e8f9',
                      borderRadius: '9px',
                      padding: '11px 20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: 800,
                      cursor: executionLoading
                        ? 'wait'
                        : 'pointer',
                      minWidth: '155px',
                    }}
                  >
                    {executionLoading ? (
                      <>
                        <RefreshCw
                          size={16}
                          style={{
                            animation:
                              'spin 1s linear infinite',
                          }}
                        />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        Execute Playbook
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}