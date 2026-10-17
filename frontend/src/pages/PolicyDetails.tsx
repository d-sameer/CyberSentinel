import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Link2,
  RefreshCw,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

type Policy = {
  policy_id: string
  title: string
  description: string
  category: string
  status: string
  owner: string
  version: string
  effective_date: string | null
  review_date: string | null
  frameworks: string[]
  related_control_ids: string[]
  related_risk_ids: string[]
  review_status: string
}

type PolicyAction = {
  id: number
  policy_id: string
  action: string
  action_label: string
  previous_status: string
  new_status: string
  note: string
  performed_by: string
  created_at: string | null
}

type PolicyActionsResponse = {
  policy_id: string
  total_actions: number
  actions: PolicyAction[]
}

const ACTIONS = [
  {
    action: 'START_REVIEW',
    label: 'Start Review',
    description: 'Move the policy into the review workflow.',
    icon: Clock3,
  },
  {
    action: 'APPROVE_POLICY',
    label: 'Approve Policy',
    description: 'Approve the policy and mark it active.',
    icon: CheckCircle2,
  },
  {
    action: 'RENEW_POLICY',
    label: 'Renew Policy',
    description: 'Renew the policy and keep it active.',
    icon: RefreshCw,
  },
  {
    action: 'RETURN_TO_DRAFT',
    label: 'Return to Draft',
    description: 'Move the policy back into draft status.',
    icon: FileText,
  },
  {
    action: 'EXPIRE_POLICY',
    label: 'Expire Policy',
    description: 'Mark the policy as expired.',
    icon: XCircle,
  },
]

function PolicyDetails() {
  const navigate = useNavigate()
  const { policyId } = useParams()

  const [policy, setPolicy] = useState<Policy | null>(null)
  const [actions, setActions] = useState<PolicyAction[]>([])

  const [loading, setLoading] = useState(true)
  const [actionsLoading, setActionsLoading] = useState(true)

  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [selectedAction, setSelectedAction] = useState('')
  const [note, setNote] = useState('')
  const [performingAction, setPerformingAction] =
    useState(false)

  const formatDate = (value: string | null) => {
    if (!value) return '—'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatDateTime = (value: string | null) => {
    if (!value) return '—'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatStatus = (value: string) => {
    return value.replace(/_/g, ' ')
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'status-badge status-badge-success'

      case 'UNDER_REVIEW':
        return 'status-badge status-badge-warning'

      case 'EXPIRED':
        return 'status-badge status-badge-danger'

      case 'DRAFT':
        return 'status-badge status-badge-neutral'

      default:
        return 'status-badge status-badge-neutral'
    }
  }

  const getReviewClass = (status: string) => {
    switch (status) {
      case 'OVERDUE':
        return 'status-badge status-badge-danger'

      case 'SCHEDULED':
        return 'status-badge status-badge-success'

      default:
        return 'status-badge status-badge-neutral'
    }
  }

  const fetchPolicy = async () => {
    if (!policyId) return

    try {
      const response = await fetch(
        `http://127.0.0.1:8001/api/policies/${policyId}`
      )

      if (!response.ok) {
        throw new Error('Policy not found')
      }

      const result: Policy = await response.json()

      setPolicy(result)
    } catch (err) {
      console.error(err)

      setError(
        'Unable to load this policy. Make sure the policy ID is valid and the backend is running.'
      )
    }
  }

  const fetchActions = async () => {
    if (!policyId) return

    try {
      setActionsLoading(true)

      const response = await fetch(
        `http://127.0.0.1:8001/api/policies/${policyId}/actions`
      )

      if (!response.ok) {
        throw new Error('Failed to load policy actions')
      }

      const result: PolicyActionsResponse =
        await response.json()

      setActions(result.actions)
    } catch (err) {
      console.error(err)
      setActionError(
        'Unable to load policy response history.'
      )
    } finally {
      setActionsLoading(false)
    }
  }

  useEffect(() => {
    const loadPolicy = async () => {
      try {
        setLoading(true)
        setError('')

        await fetchPolicy()
        await fetchActions()
      } finally {
        setLoading(false)
      }
    }

    if (policyId) {
      loadPolicy()
    }
  }, [policyId])

  const performAction = async (action: string) => {
    if (!policyId) return

    setPerformingAction(true)
    setActionError('')
    setSuccessMessage('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8001/api/policies/${policyId}/actions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action,
            note,
            performed_by: 'GRC Analyst',
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result?.detail?.message ||
            result?.detail ||
            'Failed to perform policy action'
        )
      }

      setSuccessMessage(
        `${result.action_label} recorded successfully.`
      )

      setNote('')
      setSelectedAction('')

      await fetchPolicy()
      await fetchActions()
    } catch (err) {
      console.error(err)

      setActionError(
        err instanceof Error
          ? err.message
          : 'Failed to perform policy action.'
      )
    } finally {
      setPerformingAction(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">
              POLICY INVESTIGATION
            </div>

            <h1>Loading Policy</h1>

            <p>
              Retrieving policy information from CyberSentinel.
            </p>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Loading policy details</h3>

              <p>
                Please wait while the policy record is
                retrieved.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !policy) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">
              POLICY INVESTIGATION
            </div>

            <h1>Policy Not Found</h1>

            <p>
              The requested policy could not be loaded.
            </p>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Unable to load policy</h3>

              <p>
                {error ||
                  'No policy record was returned by the backend.'}
              </p>
            </div>

            <button
              onClick={() => navigate('/policies')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #263449',
                background: '#0b1220',
                color: '#cbd5e1',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} />
              Back to Policies
            </button>
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
          <button
            onClick={() => navigate('/policies')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              border: 'none',
              background: 'transparent',
              padding: 0,
              marginBottom: '18px',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            <ArrowLeft size={15} />
            Back to Policy Management
          </button>

          <div className="page-eyebrow">
            POLICY INVESTIGATION
          </div>

          <h1>{policy.title}</h1>

          <p>
            {policy.policy_id} · Version {policy.version} ·{' '}
            {policy.category}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          <span className={getStatusClass(policy.status)}>
            {formatStatus(policy.status)}
          </span>

          <span
            className={getReviewClass(
              policy.review_status
            )}
          >
            {formatStatus(policy.review_status)}
          </span>
        </div>

      </div>

      {/* KPI CARDS */}
      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-card-icon">
            <ShieldCheck size={20} />
          </div>

          <div>
            <div className="stat-card-label">
              POLICY ID
            </div>

            <div className="stat-card-value">
              {policy.policy_id}
            </div>

            <div className="stat-card-meta">
              Governance record
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">
            <User size={20} />
          </div>

          <div>
            <div className="stat-card-label">
              OWNER
            </div>

            <div
              className="stat-card-value"
              style={{
                fontSize: '20px',
              }}
            >
              {policy.owner}
            </div>

            <div className="stat-card-meta">
              Policy responsibility
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">
            <CalendarDays size={20} />
          </div>

          <div>
            <div className="stat-card-label">
              REVIEW DATE
            </div>

            <div
              className="stat-card-value"
              style={{
                fontSize: '20px',
              }}
            >
              {formatDate(policy.review_date)}
            </div>

            <div className="stat-card-meta">
              Scheduled policy review
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">
            <FileText size={20} />
          </div>

          <div>
            <div className="stat-card-label">
              VERSION
            </div>

            <div className="stat-card-value">
              {policy.version}
            </div>

            <div className="stat-card-meta">
              Current document version
            </div>
          </div>
        </div>

      </div>

      {/* POLICY INFORMATION */}
      <div className="dashboard-grid">

        <div className="dashboard-panel">

          <div className="panel-header">
            <div>
              <h3>Policy Overview</h3>

              <p>
                Core governance information
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: '20px',
              display: 'grid',
              gap: '18px',
            }}
          >

            <div>
              <div
                style={{
                  color: '#64748b',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '6px',
                }}
              >
                Description
              </div>

              <div
                style={{
                  color: '#cbd5e1',
                  lineHeight: 1.7,
                  fontSize: '14px',
                }}
              >
                {policy.description}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(2, minmax(0, 1fr))',
                gap: '18px',
              }}
            >

              <div>
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px',
                  }}
                >
                  Category
                </div>

                <div
                  style={{
                    color: '#e5e7eb',
                    fontWeight: 600,
                  }}
                >
                  {policy.category}
                </div>
              </div>

              <div>
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px',
                  }}
                >
                  Owner
                </div>

                <div
                  style={{
                    color: '#e5e7eb',
                    fontWeight: 600,
                  }}
                >
                  {policy.owner}
                </div>
              </div>

              <div>
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px',
                  }}
                >
                  Effective Date
                </div>

                <div
                  style={{
                    color: '#e5e7eb',
                  }}
                >
                  {formatDate(policy.effective_date)}
                </div>
              </div>

              <div>
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px',
                  }}
                >
                  Review Date
                </div>

                <div
                  style={{
                    color: '#e5e7eb',
                  }}
                >
                  {formatDate(policy.review_date)}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* FRAMEWORKS */}
        <div className="dashboard-panel">

          <div className="panel-header">
            <div>
              <h3>Framework Alignment</h3>

              <p>
                Security and governance frameworks
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            {policy.frameworks.length > 0 ? (
              policy.frameworks.map((framework) => (
                <div
                  key={framework}
                  style={{
                    padding: '10px 13px',
                    borderRadius: '8px',
                    border:
                      '1px solid rgba(34, 211, 238, 0.2)',
                    background:
                      'rgba(34, 211, 238, 0.05)',
                    color: '#cbd5e1',
                    fontSize: '13px',
                  }}
                >
                  {framework}
                </div>
              ))
            ) : (
              <div
                style={{
                  color: '#64748b',
                  fontSize: '13px',
                }}
              >
                No framework mappings recorded.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* CORRELATION */}
      <div className="dashboard-grid">

        <div className="dashboard-panel">

          <div className="panel-header">
            <div>
              <h3>Related Compliance Controls</h3>

              <p>
                Controls governed or supported by this policy
              </p>
            </div>

            <Link2
              size={19}
              style={{
                color: '#22d3ee',
              }}
            />
          </div>

          <div
            style={{
              marginTop: '18px',
              display: 'grid',
              gap: '10px',
            }}
          >
            {policy.related_control_ids.length > 0 ? (
              policy.related_control_ids.map((controlId) => (
                <div
                  key={controlId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border:
                      '1px solid #263449',
                    background: '#0b1220',
                  }}
                >
                  <span
                    style={{
                      color: '#22d3ee',
                      fontWeight: 600,
                      fontSize: '13px',
                    }}
                  >
                    {controlId}
                  </span>

                  <span
                    style={{
                      color: '#64748b',
                      fontSize: '12px',
                    }}
                  >
                    Compliance Control
                  </span>
                </div>
              ))
            ) : (
              <div
                style={{
                  color: '#64748b',
                  fontSize: '13px',
                }}
              >
                No related controls recorded.
              </div>
            )}
          </div>

        </div>

        {/* RISKS */}
        <div className="dashboard-panel">

          <div className="panel-header">
            <div>
              <h3>Related Risks</h3>

              <p>
                Risk records associated with this policy
              </p>
            </div>

            <ShieldCheck
              size={19}
              style={{
                color: '#f59e0b',
              }}
            />
          </div>

          <div
            style={{
              marginTop: '18px',
              display: 'grid',
              gap: '10px',
            }}
          >
            {policy.related_risk_ids.length > 0 ? (
              policy.related_risk_ids.map((riskId) => (
                <div
                  key={riskId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border:
                      '1px solid #263449',
                    background: '#0b1220',
                  }}
                >
                  <span
                    style={{
                      color: '#fbbf24',
                      fontWeight: 600,
                      fontSize: '13px',
                    }}
                  >
                    {riskId}
                  </span>

                  <span
                    style={{
                      color: '#64748b',
                      fontSize: '12px',
                    }}
                  >
                    Risk Record
                  </span>
                </div>
              ))
            ) : (
              <div
                style={{
                  color: '#64748b',
                  fontSize: '13px',
                }}
              >
                No related risks recorded.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* POLICY RESPONSE WORKFLOW */}
      <div className="dashboard-panel">

        <div className="panel-header">
          <div>
            <h3>Policy Review & Response</h3>

            <p>
              Record governance actions and update the
              policy lifecycle state.
            </p>
          </div>

          <ShieldCheck
            size={20}
            style={{
              color: '#22d3ee',
            }}
          />
        </div>

        {/* ACTION BUTTONS */}
        <div
          style={{
            marginTop: '20px',
            display: 'grid',
            gridTemplateColumns:
              'repeat(5, minmax(0, 1fr))',
            gap: '10px',
          }}
        >
          {ACTIONS.map((item) => {
            const Icon = item.icon
            const isSelected =
              selectedAction === item.action

            return (
              <button
                key={item.action}
                onClick={() =>
                  setSelectedAction(item.action)
                }
                disabled={performingAction}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '9px',
                  minHeight: '100px',
                  padding: '14px',
                  borderRadius: '9px',
                  border: isSelected
                    ? '1px solid rgba(34, 211, 238, 0.55)'
                    : '1px solid #263449',
                  background: isSelected
                    ? 'rgba(34, 211, 238, 0.08)'
                    : '#0b1220',
                  color: '#e5e7eb',
                  cursor: performingAction
                    ? 'not-allowed'
                    : 'pointer',
                  textAlign: 'left',
                  opacity: performingAction
                    ? 0.65
                    : 1,
                }}
              >
                <Icon
                  size={19}
                  style={{
                    color: isSelected
                      ? '#22d3ee'
                      : '#94a3b8',
                  }}
                />

                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </span>

                <span
                  style={{
                    color: '#64748b',
                    fontSize: '11px',
                    lineHeight: 1.4,
                  }}
                >
                  {item.description}
                </span>
              </button>
            )
          })}
        </div>

        {/* SELECTED ACTION */}
        {selectedAction && (
          <div
            style={{
              marginTop: '18px',
              padding: '16px',
              borderRadius: '9px',
              border:
                '1px solid rgba(34, 211, 238, 0.2)',
              background:
                'rgba(34, 211, 238, 0.035)',
            }}
          >
            <div
              style={{
                color: '#94a3b8',
                fontSize: '12px',
                marginBottom: '8px',
              }}
            >
              Selected action
            </div>

            <div
              style={{
                color: '#22d3ee',
                fontWeight: 600,
                fontSize: '14px',
                marginBottom: '14px',
              }}
            >
              {
                ACTIONS.find(
                  (item) =>
                    item.action === selectedAction
                )?.label
              }
            </div>

            <textarea
              value={note}
              onChange={(event) =>
                setNote(event.target.value)
              }
              placeholder="Add an analyst note (optional)..."
              rows={3}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                resize: 'vertical',
                padding: '11px 12px',
                borderRadius: '8px',
                border: '1px solid #263449',
                background: '#080e19',
                color: '#e5e7eb',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: '13px',
              }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '12px',
              }}
            >
              <button
                onClick={() => {
                  setSelectedAction('')
                  setNote('')
                }}
                disabled={performingAction}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #263449',
                  background: '#0b1220',
                  color: '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  performAction(selectedAction)
                }
                disabled={performingAction}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border:
                    '1px solid rgba(34, 211, 238, 0.4)',
                  background:
                    'rgba(34, 211, 238, 0.12)',
                  color: '#22d3ee',
                  fontWeight: 600,
                  cursor: performingAction
                    ? 'not-allowed'
                    : 'pointer',
                }}
              >
                {performingAction && (
                  <RefreshCw
                    size={15}
                    style={{
                      animation:
                        'spin 1s linear infinite',
                    }}
                  />
                )}

                {performingAction
                  ? 'Recording...'
                  : 'Record Action'}
              </button>
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {successMessage && (
          <div
            style={{
              marginTop: '14px',
              padding: '11px 13px',
              borderRadius: '8px',
              border:
                '1px solid rgba(34, 197, 94, 0.25)',
              background:
                'rgba(34, 197, 94, 0.06)',
              color: '#4ade80',
              fontSize: '13px',
            }}
          >
            {successMessage}
          </div>
        )}

        {/* ERROR */}
        {actionError && (
          <div
            style={{
              marginTop: '14px',
              padding: '11px 13px',
              borderRadius: '8px',
              border:
                '1px solid rgba(239, 68, 68, 0.25)',
              background:
                'rgba(239, 68, 68, 0.06)',
              color: '#f87171',
              fontSize: '13px',
            }}
          >
            {actionError}
          </div>
        )}

      </div>

      {/* RESPONSE HISTORY */}
      <div className="dashboard-panel">

        <div className="panel-header">
          <div>
            <h3>Response History</h3>

            <p>
              Persistent policy review and governance
              actions
            </p>
          </div>

          <div
            style={{
              color: '#64748b',
              fontSize: '13px',
            }}
          >
            {actions.length} action
            {actions.length === 1 ? '' : 's'}
          </div>
        </div>

        <div
          style={{
            marginTop: '18px',
          }}
        >
          {actionsLoading ? (
            <div
              style={{
                padding: '28px',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '13px',
              }}
            >
              Loading response history...
            </div>
          ) : actions.length === 0 ? (
            <div
              style={{
                padding: '30px',
                textAlign: 'center',
                borderRadius: '9px',
                border:
                  '1px dashed #263449',
                color: '#64748b',
                fontSize: '13px',
              }}
            >
              No policy response actions have been
              recorded yet.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gap: '10px',
              }}
            >
              {actions.map((action) => (
                <div
                  key={action.id}
                  style={{
                    padding: '15px',
                    borderRadius: '9px',
                    border:
                      '1px solid #263449',
                    background: '#0b1220',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent:
                        'space-between',
                      gap: '16px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '9px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            color: '#22d3ee',
                            fontWeight: 600,
                            fontSize: '14px',
                          }}
                        >
                          {action.action_label}
                        </span>

                        <span
                          style={{
                            color: '#64748b',
                            fontSize: '12px',
                          }}
                        >
                          {action.previous_status}
                          {' → '}
                          {action.new_status}
                        </span>
                      </div>

                      <div
                        style={{
                          marginTop: '7px',
                          color: '#94a3b8',
                          fontSize: '12px',
                        }}
                      >
                        Performed by{' '}
                        <span
                          style={{
                            color: '#cbd5e1',
                          }}
                        >
                          {action.performed_by}
                        </span>
                        {' · '}
                        {formatDateTime(
                          action.created_at
                        )}
                      </div>
                    </div>
                  </div>

                  {action.note && (
                    <div
                      style={{
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop:
                          '1px solid #1e293b',
                        color: '#cbd5e1',
                        fontSize: '13px',
                        lineHeight: 1.6,
                      }}
                    >
                      {action.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* INVESTIGATION CONTEXT */}
      <div className="dashboard-panel">

        <div className="panel-header">
          <div>
            <h3>Investigation Context</h3>

            <p>
              Governance context for security operations
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: '20px',
            display: 'grid',
            gridTemplateColumns:
              'repeat(3, minmax(0, 1fr))',
            gap: '18px',
          }}
        >

          <div
            className="endpoint-summary-card"
            style={{
              minHeight: '110px',
            }}
          >
            <div className="endpoint-summary-label">
              Policy Status
            </div>

            <div
              className="endpoint-summary-value"
              style={{
                fontSize: '18px',
                marginTop: '10px',
              }}
            >
              {formatStatus(policy.status)}
            </div>
          </div>

          <div
            className="endpoint-summary-card"
            style={{
              minHeight: '110px',
            }}
          >
            <div className="endpoint-summary-label">
              Review State
            </div>

            <div
              className="endpoint-summary-value"
              style={{
                fontSize: '18px',
                marginTop: '10px',
              }}
            >
              {formatStatus(policy.review_status)}
            </div>
          </div>

          <div
            className="endpoint-summary-card"
            style={{
              minHeight: '110px',
            }}
          >
            <div className="endpoint-summary-label">
              Governance Owner
            </div>

            <div
              className="endpoint-summary-value"
              style={{
                fontSize: '18px',
                marginTop: '10px',
              }}
            >
              {policy.owner}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}

export default PolicyDetails