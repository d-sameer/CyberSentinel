import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Cpu,
  FileText,
  Shield,
  Target,
  User,
  Workflow,
} from 'lucide-react'

type ExecutionStep = {
  step_number: number
  action: string
  status: string
  result: string
  started_at: string | null
  completed_at: string | null
}

type Execution = {
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
  steps: ExecutionStep[]
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Not available'
  }

  return new Date(value).toLocaleString()
}

export default function SecurityPlaybookExecutionDetails() {
  const { playbookId, executionId } = useParams()

  const [execution, setExecution] =
    useState<Execution | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadExecution = async () => {
      if (!playbookId || !executionId) {
        setError('Playbook or execution ID is missing.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `http://127.0.0.1:8001/api/playbooks/${encodeURIComponent(
            playbookId,
          )}/executions/${encodeURIComponent(
            executionId,
          )}`,
        )

        if (!response.ok) {
          throw new Error(
            `Unable to load execution (${response.status})`,
          )
        }

        const data: Execution = await response.json()

        setExecution(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load execution details.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadExecution()
  }, [playbookId, executionId])

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">
              SECURITY AUTOMATION CENTER
            </div>

            <h1>Execution Details</h1>

            <p>
              Loading playbook execution telemetry...
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
            Loading execution details...
          </div>
        </div>
      </div>
    )
  }

  if (error || !execution) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">
              SECURITY AUTOMATION CENTER
            </div>

            <h1>Execution Details</h1>

            <p>
              Unable to load the requested playbook
              execution.
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
                fontWeight: 800,
                marginBottom: '8px',
              }}
            >
              Execution not available
            </div>

            <div
              style={{
                color: '#94a3b8',
                marginBottom: '20px',
              }}
            >
              {error ||
                'The requested execution could not be found.'}
            </div>

            <Link
              to={`/automation/${playbookId}`}
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
              Back to Playbook
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const completedSteps = execution.steps.filter(
    (step) => step.status === 'COMPLETED',
  ).length

  return (
    <div className="page-container">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <Link
            to={`/automation/${playbookId}`}
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
            Back to Playbook
          </Link>

          <div className="page-eyebrow">
            SECURITY AUTOMATION CENTER
          </div>

          <h1>Execution Details</h1>

          <p>
            Detailed audit trail for the selected security
            automation execution.
          </p>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '9px',
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
          EXECUTION AUDIT
        </div>
      </div>

      {/* EXECUTION HEADER */}
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
                minWidth: '54px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  'rgba(34, 197, 94, 0.10)',
                border:
                  '1px solid rgba(34, 197, 94, 0.24)',
              }}
            >
              <CheckCircle2
                size={27}
                style={{
                  color: '#4ade80',
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
                    fontSize: '21px',
                    fontWeight: 800,
                  }}
                >
                  {execution.execution_id}
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
                    color: '#67e8f9',
                    fontSize: '14px',
                    fontWeight: 800,
                  }}
                >
                  {execution.playbook_id}
                </span>
              </div>

              <div
                style={{
                  marginTop: '6px',
                  color: '#64748b',
                  fontSize: '13px',
                }}
              >
                Persistent security automation execution
                record
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 13px',
              borderRadius: '999px',
              background:
                'rgba(34, 197, 94, 0.10)',
              border:
                '1px solid rgba(34, 197, 94, 0.22)',
              color: '#4ade80',
              fontSize: '12px',
              fontWeight: 800,
            }}
          >
            <CheckCircle2 size={15} />
            {execution.status}
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
            Target
          </div>

          <div
            style={{
              marginTop: '7px',
              color: '#f8fafc',
              fontSize: '18px',
              fontWeight: 800,
            }}
          >
            {execution.target}
          </div>
        </div>

        <div className="stat-card">
          <div
            style={{
              color: '#67e8f9',
              marginBottom: '12px',
            }}
          >
            <Workflow size={22} />
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
            Steps
          </div>

          <div
            style={{
              marginTop: '7px',
              color: '#f8fafc',
              fontSize: '22px',
              fontWeight: 800,
            }}
          >
            {execution.step_count}
          </div>
        </div>

        <div className="stat-card">
          <div
            style={{
              color: '#67e8f9',
              marginBottom: '12px',
            }}
          >
            <CheckCircle2 size={22} />
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
            Completed Steps
          </div>

          <div
            style={{
              marginTop: '7px',
              color: '#4ade80',
              fontSize: '22px',
              fontWeight: 800,
            }}
          >
            {completedSteps}
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
            Actor
          </div>

          <div
            style={{
              marginTop: '7px',
              color: '#f8fafc',
              fontSize: '17px',
              fontWeight: 700,
            }}
          >
            {execution.actor}
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
        {/* LEFT */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* EXECUTION TIMELINE */}
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
                <span>Execution Timeline</span>
              </div>

              <span
                style={{
                  color: '#64748b',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {execution.steps.length} STEPS
              </span>
            </div>

            <div
              style={{
                padding: '24px',
              }}
            >
              {execution.steps.length === 0 ? (
                <div
                  style={{
                    padding: '30px',
                    textAlign: 'center',
                    color: '#64748b',
                  }}
                >
                  No step-level execution data is
                  available for this execution.
                </div>
              ) : (
                execution.steps.map(
                  (step, index) => (
                    <div
                      key={`${execution.execution_id}-${step.step_number}`}
                      style={{
                        display: 'flex',
                        gap: '16px',
                        position: 'relative',
                        paddingBottom:
                          index ===
                          execution.steps.length - 1
                            ? '0'
                            : '28px',
                      }}
                    >
                      {index !==
                        execution.steps.length - 1 && (
                        <div
                          style={{
                            position: 'absolute',
                            left: '17px',
                            top: '36px',
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
                          width: '36px',
                          height: '36px',
                          minWidth: '36px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background:
                            step.status ===
                            'COMPLETED'
                              ? 'rgba(34, 197, 94, 0.12)'
                              : 'rgba(245, 158, 11, 0.12)',
                          border:
                            step.status ===
                            'COMPLETED'
                              ? '1px solid rgba(34, 197, 94, 0.28)'
                              : '1px solid rgba(245, 158, 11, 0.28)',
                          color:
                            step.status ===
                            'COMPLETED'
                              ? '#4ade80'
                              : '#fbbf24',
                          fontSize: '13px',
                          fontWeight: 800,
                        }}
                      >
                        {step.step_number}
                      </div>

                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                          paddingTop: '2px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent:
                              'space-between',
                            gap: '12px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <div
                            style={{
                              color: '#f8fafc',
                              fontSize: '15px',
                              fontWeight: 800,
                            }}
                          >
                            {step.action}
                          </div>

                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 8px',
                              borderRadius: '999px',
                              background:
                                step.status ===
                                'COMPLETED'
                                  ? 'rgba(34, 197, 94, 0.10)'
                                  : 'rgba(245, 158, 11, 0.10)',
                              color:
                                step.status ===
                                'COMPLETED'
                                  ? '#4ade80'
                                  : '#fbbf24',
                              fontSize: '10px',
                              fontWeight: 800,
                            }}
                          >
                            {step.status ===
                            'COMPLETED' ? (
                              <CheckCircle2
                                size={12}
                              />
                            ) : (
                              <AlertTriangle
                                size={12}
                              />
                            )}

                            {step.status}
                          </span>
                        </div>

                        <div
                          style={{
                            marginTop: '9px',
                            padding: '11px 13px',
                            borderRadius: '8px',
                            border:
                              '1px solid rgba(71, 85, 105, 0.24)',
                            background:
                              'rgba(15, 23, 42, 0.55)',
                            color: '#94a3b8',
                            fontSize: '12px',
                            lineHeight: 1.55,
                          }}
                        >
                          {step.result}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            gap: '18px',
                            marginTop: '9px',
                            color: '#64748b',
                            fontSize: '10px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span>
                            Started:{' '}
                            {formatDate(
                              step.started_at,
                            )}
                          </span>

                          <span>
                            Completed:{' '}
                            {formatDate(
                              step.completed_at,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ),
                )
              )}
            </div>
          </div>

          {/* EXECUTION RESULT */}
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
                <span>Execution Result</span>
              </div>
            </div>

            <div
              style={{
                padding: '22px',
              }}
            >
              <div
                style={{
                  padding: '15px 16px',
                  borderRadius: '9px',
                  border:
                    '1px solid rgba(34, 197, 94, 0.20)',
                  background:
                    'rgba(20, 83, 45, 0.10)',
                  color: '#cbd5e1',
                  fontSize: '13px',
                  lineHeight: 1.7,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#4ade80',
                    fontWeight: 800,
                    marginBottom: '7px',
                  }}
                >
                  <CheckCircle2 size={17} />
                  Execution Completed
                </div>

                {execution.result}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* EXECUTION INFORMATION */}
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
                <span>Execution Information</span>
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
                    fontSize: '11px',
                    fontWeight: 800,
                    marginBottom: '6px',
                  }}
                >
                  EXECUTION ID
                </div>

                <div
                  style={{
                    color: '#67e8f9',
                    fontSize: '14px',
                    fontWeight: 800,
                  }}
                >
                  {execution.execution_id}
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
                    fontSize: '11px',
                    fontWeight: 800,
                    marginBottom: '6px',
                  }}
                >
                  PLAYBOOK
                </div>

                <Link
                  to={`/automation/${execution.playbook_id}`}
                  style={{
                    color: '#cbd5e1',
                    fontSize: '14px',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  {execution.playbook_id}
                </Link>
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
                    fontSize: '11px',
                    fontWeight: 800,
                    marginBottom: '6px',
                  }}
                >
                  TARGET
                </div>

                <div
                  style={{
                    color: '#e2e8f0',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                >
                  {execution.target}
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
                    fontSize: '11px',
                    fontWeight: 800,
                    marginBottom: '6px',
                  }}
                >
                  ACTOR
                </div>

                <div
                  style={{
                    color: '#e2e8f0',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                >
                  {execution.actor}
                </div>
              </div>
            </div>
          </div>

          {/* TIMING */}
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
                <span>Execution Timing</span>
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
                    fontSize: '11px',
                    fontWeight: 800,
                    marginBottom: '6px',
                  }}
                >
                  STARTED
                </div>

                <div
                  style={{
                    color: '#cbd5e1',
                    fontSize: '13px',
                  }}
                >
                  {formatDate(execution.started_at)}
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
                    fontSize: '11px',
                    fontWeight: 800,
                    marginBottom: '6px',
                  }}
                >
                  COMPLETED
                </div>

                <div
                  style={{
                    color: '#cbd5e1',
                    fontSize: '13px',
                  }}
                >
                  {formatDate(
                    execution.completed_at,
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* NOTE */}
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
                <span>Execution Note</span>
              </div>
            </div>

            <div
              style={{
                padding: '20px 22px',
              }}
            >
              {execution.note ? (
                <div
                  style={{
                    color: '#cbd5e1',
                    fontSize: '13px',
                    lineHeight: 1.7,
                    padding: '13px 14px',
                    borderRadius: '8px',
                    background:
                      'rgba(15, 23, 42, 0.55)',
                    border:
                      '1px solid rgba(71, 85, 105, 0.24)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {execution.note}
                </div>
              ) : (
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '13px',
                  }}
                >
                  No execution note was recorded.
                </div>
              )}
            </div>
          </div>

          {/* SAFETY */}
          <div className="dashboard-panel">
            <div
              style={{
                padding: '20px',
                display: 'flex',
                gap: '12px',
              }}
            >
              <Cpu
                size={20}
                style={{
                  color: '#67e8f9',
                  flexShrink: 0,
                }}
              />

              <div>
                <div
                  style={{
                    color: '#f8fafc',
                    fontWeight: 800,
                    fontSize: '14px',
                    marginBottom: '5px',
                  }}
                >
                  Simulated Automation
                </div>

                <div
                  style={{
                    color: '#64748b',
                    fontSize: '12px',
                    lineHeight: 1.6,
                  }}
                >
                  This execution represents a safe
                  portfolio simulation. The recorded
                  workflow does not directly modify the
                  target system.
                </div>
              </div>
            </div>
          </div>

          <Link
            to={`/automation/${execution.playbook_id}`}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              border:
                '1px solid rgba(34, 211, 238, 0.30)',
              background:
                'linear-gradient(135deg, rgba(8, 47, 73, 0.90), rgba(8, 51, 68, 0.80))',
              color: '#67e8f9',
              borderRadius: '10px',
              padding: '13px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: 800,
              fontSize: '13px',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} />
            Return to Playbook
          </Link>
        </div>
      </div>
    </div>
  )
}