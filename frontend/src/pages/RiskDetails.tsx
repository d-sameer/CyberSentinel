import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  FileSearch,
  Link2,
  ShieldAlert,
  ShieldCheck,
  Target,
  User,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

type Risk = {
  risk_id: string
  title: string
  description: string
  category: string
  likelihood: number
  impact: number
  inherent_score: number
  residual_likelihood: number
  residual_impact: number
  residual_score: number
  severity: string
  status: string
  treatment: string
  owner: string
  treatment_plan: string
  due_date: string | null
  related_vulnerability_ids: string[]
  related_incident_ids: string[]
  related_control_ids: string[]
  created_at: string | null
  updated_at: string | null
}

type RiskAction = {
  id?: number | string
  action?: string
  action_type?: string
  performed_by?: string
  notes?: string
  status?: string
  created_at?: string | null
  timestamp?: string | null
}

type RiskActionsResponse = {
  risk_id: string
  total_actions: number
  actions: RiskAction[]
}

type RiskActionDefinition = {
  id: string
  label: string
  description: string
  icon: typeof ShieldCheck
  tone: string
}

const RISK_ACTIONS: RiskActionDefinition[] = [
  {
    id: 'START_TREATMENT',
    label: 'Start Treatment',
    description: 'Move the risk into active treatment.',
    icon: ShieldCheck,
    tone: '#22d3ee',
  },
  {
    id: 'START_MONITORING',
    label: 'Start Monitoring',
    description: 'Track the risk under continuous monitoring.',
    icon: CircleDot,
    tone: '#fbbf24',
  },
  {
    id: 'MARK_MITIGATED',
    label: 'Mark Mitigated',
    description: 'Record that mitigation has been completed.',
    icon: CheckCircle2,
    tone: '#4ade80',
  },
  {
    id: 'ACCEPT_RISK',
    label: 'Accept Risk',
    description: 'Formally accept the remaining exposure.',
    icon: ShieldAlert,
    tone: '#a78bfa',
  },
  {
    id: 'REOPEN_RISK',
    label: 'Reopen Risk',
    description: 'Return the risk to active treatment.',
    icon: AlertTriangle,
    tone: '#f87171',
  },
]



const API_BASE = 'http://127.0.0.1:8001'

function getSeverityClass(severity: string) {
  switch (severity.toUpperCase()) {
    case 'CRITICAL':
      return 'critical'
    case 'HIGH':
      return 'high'
    case 'MEDIUM':
      return 'medium'
    default:
      return 'low'
  }
}

function getScoreClass(score: number) {
  if (score >= 20) return 'critical'
  if (score >= 12) return 'high'
  if (score >= 6) return 'medium'
  return 'low'
}

function getStatusClass(status: string) {
  switch (status.toUpperCase()) {
    case 'MITIGATED':
      return 'resolved'
    case 'ACCEPTED':
      return 'info'
    case 'MONITORING':
    case 'UNDER_TREATMENT':
      return 'warning'
    default:
      return 'critical'
  }
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(' ')
}

function formatDate(value: string | null) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(value: string | null) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ScoreCard({
  label,
  score,
  description,
}: {
  label: string
  score: number
  description: string
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span>{label}</span>
        <Target size={18} />
      </div>

      <div
        className={`stat-card-value soc-category-${getScoreClass(
          score,
        )}`}
      >
        {score}
      </div>

      <div className="stat-card-label">
        {description}
      </div>
    </div>
  )
}

export default function RiskDetails() {
  const { riskId } = useParams<{ riskId: string }>()

  const [risk, setRisk] = useState<Risk | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [actions, setActions] = useState<RiskAction[]>([])
  const [actionsLoading, setActionsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  useEffect(() => {
    const loadRisk = async () => {
      if (!riskId) {
        setError('Risk ID was not provided.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        const response = await fetch(
          `${API_BASE}/api/risks/${encodeURIComponent(
            riskId,
          )}`,
        )

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Risk not found.')
          }

          throw new Error(
            'Failed to load risk details.',
          )
        }

        const result: Risk = await response.json()

        setRisk(result)
        setError('')
      } catch (err) {
        console.error(err)

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load risk details.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadRisk()
  }, [riskId])

  useEffect(() => {
    if (riskId) {
      loadActions(riskId)
    }
  }, [riskId])

  const loadActions = async (currentRiskId: string) => {
    try {
      setActionsLoading(true)

      const response = await fetch(
        `${API_BASE}/api/risks/${encodeURIComponent(
          currentRiskId,
        )}/actions`,
      )

      if (!response.ok) {
        throw new Error('Failed to load risk response history.')
      }

      const result: RiskActionsResponse =
        await response.json()

      setActions(result.actions ?? [])
      setActionError('')
    } catch (err) {
      console.error(err)
      setActionError(
        err instanceof Error
          ? err.message
          : 'Unable to load response history.',
      )
    } finally {
      setActionsLoading(false)
    }
  }

  const performAction = async (actionId: string) => {
    if (!riskId || actionLoading) return

    try {
      setActionLoading(actionId)
      setActionError('')
      setActionSuccess('')

      const response = await fetch(
        `${API_BASE}/api/risks/${encodeURIComponent(
          riskId,
        )}/actions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: actionId,
            action_type: actionId,
            performed_by: 'Security Operations',
            notes: `Risk response action: ${actionId}`,
          }),
        },
      )

      if (!response.ok) {
        let message = 'Risk response action failed.'

        try {
          const result = await response.json()
          if (typeof result?.detail === 'string') {
            message = result.detail
          }
        } catch {
          // Keep the default error message.
        }

        throw new Error(message)
      }

      const selectedAction = RISK_ACTIONS.find(
        (item) => item.id === actionId,
      )

      setActionSuccess(
        selectedAction
          ? `${selectedAction.label} recorded successfully.`
          : 'Risk response action recorded successfully.',
      )

      // Refresh the risk itself because response actions can
      // change the persisted risk status.
      const riskResponse = await fetch(
        `${API_BASE}/api/risks/${encodeURIComponent(
          riskId,
        )}`,
      )

      if (riskResponse.ok) {
        const refreshedRisk: Risk =
          await riskResponse.json()
        setRisk(refreshedRisk)
      }

      await loadActions(riskId)
    } catch (err) {
      console.error(err)
      setActionError(
        err instanceof Error
          ? err.message
          : 'Unable to perform risk response action.',
      )
    } finally {
      setActionLoading('')
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">
              GRC / RISK INVESTIGATION
            </div>

            <h1>Risk Investigation</h1>

            <p>
              Loading risk investigation data...
            </p>
          </div>
        </div>

        <div className="dashboard-panel">
          <div
            style={{
              padding: '50px',
              textAlign: 'center',
              color: '#94a3b8',
            }}
          >
            Loading risk details...
          </div>
        </div>
      </div>
    )
  }

  if (error || !risk) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">
              GRC / RISK INVESTIGATION
            </div>

            <h1>Risk Investigation</h1>

            <p>
              Investigate risk posture and associated
              security relationships.
            </p>
          </div>
        </div>

        <div className="dashboard-panel">
          <div
            style={{
              padding: '50px',
              textAlign: 'center',
              color: '#f87171',
            }}
          >
            <ShieldAlert
              size={30}
              style={{
                marginBottom: '12px',
              }}
            />

            <div>
              {error || 'Risk could not be found.'}
            </div>

            <Link
              to="/risks"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                marginTop: '20px',
                color: '#67e8f9',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <ArrowLeft size={16} />
              Back to Risk Management
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <Link
            to="/risks"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              color: '#67e8f9',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '12px',
            }}
          >
            <ArrowLeft size={15} />
            Back to Risk Management
          </Link>

          <div className="page-eyebrow">
            GRC / RISK INVESTIGATION
          </div>

          <h1>{risk.title}</h1>

          <p>
            Investigation view for {risk.risk_id}{' '}
            and its associated security relationships.
          </p>
        </div>

        <div
          className="page-status"
          style={{
            borderColor:
              'rgba(34, 211, 238, 0.20)',
          }}
        >
          <ShieldAlert size={16} />
          {risk.risk_id}
        </div>
      </div>

      {/* Risk Identity */}
      <div
        className="dashboard-panel"
        style={{
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: '280px',
            }}
          >
            <div
              style={{
                color: '#67e8f9',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                marginBottom: '8px',
              }}
            >
              {risk.risk_id}
            </div>

            <h2
              style={{
                margin: 0,
                color: '#f8fafc',
                fontSize: '24px',
                lineHeight: 1.3,
              }}
            >
              {risk.title}
            </h2>

            <p
              style={{
                marginTop: '12px',
                marginBottom: 0,
                color: '#94a3b8',
                fontSize: '13px',
                lineHeight: 1.7,
                maxWidth: '850px',
              }}
            >
              {risk.description}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <span
              className={`soc-category-${getSeverityClass(
                risk.severity,
              )}`}
              style={{
                padding: '7px 11px',
                borderRadius: '7px',
                fontSize: '11px',
                fontWeight: 700,
                background:
                  'rgba(15, 23, 42, 0.75)',
                border:
                  '1px solid rgba(148, 163, 184, 0.12)',
              }}
            >
              {risk.severity}
            </span>

            <span
              className={`soc-category-${getStatusClass(
                risk.status,
              )}`}
              style={{
                padding: '7px 11px',
                borderRadius: '7px',
                fontSize: '11px',
                fontWeight: 700,
                background:
                  'rgba(15, 23, 42, 0.75)',
                border:
                  '1px solid rgba(148, 163, 184, 0.12)',
              }}
            >
              {formatStatus(risk.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Risk Scores */}
      <div className="stats-grid">
        <ScoreCard
          label="Inherent Risk"
          score={risk.inherent_score}
          description="Risk before treatment"
        />

        <ScoreCard
          label="Residual Risk"
          score={risk.residual_score}
          description="Risk after current controls"
        />

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Likelihood</span>
            <CircleDot size={18} />
          </div>

          <div className="stat-card-value">
            {risk.likelihood}
            <span
              style={{
                color: '#64748b',
                fontSize: '14px',
                marginLeft: '4px',
              }}
            >
              / 5
            </span>
          </div>

          <div className="stat-card-label">
            Residual likelihood: {risk.residual_likelihood}
            / 5
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Impact</span>
            <AlertTriangle size={18} />
          </div>

          <div className="stat-card-value">
            {risk.impact}
            <span
              style={{
                color: '#64748b',
                fontSize: '14px',
                marginLeft: '4px',
              }}
            >
              / 5
            </span>
          </div>

          <div className="stat-card-label">
            Residual impact: {risk.residual_impact}
            / 5
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Risk Assessment</h3>

              <span>
                Inherent versus residual exposure
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gap: '22px',
              marginTop: '20px',
            }}
          >
            {/* Inherent */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <span
                  style={{
                    color: '#cbd5e1',
                    fontSize: '13px',
                  }}
                >
                  Inherent Risk Score
                </span>

                <strong
                  className={`soc-category-${getScoreClass(
                    risk.inherent_score,
                  )}`}
                >
                  {risk.inherent_score} / 25
                </strong>
              </div>

              <div
                style={{
                  height: '9px',
                  borderRadius: '999px',
                  background:
                    'rgba(148, 163, 184, 0.12)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${
                      (risk.inherent_score / 25) *
                      100
                    }%`,
                    height: '100%',
                    background: '#f97316',
                    borderRadius: '999px',
                  }}
                />
              </div>
            </div>

            {/* Residual */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <span
                  style={{
                    color: '#cbd5e1',
                    fontSize: '13px',
                  }}
                >
                  Residual Risk Score
                </span>

                <strong
                  className={`soc-category-${getScoreClass(
                    risk.residual_score,
                  )}`}
                >
                  {risk.residual_score} / 25
                </strong>
              </div>

              <div
                style={{
                  height: '9px',
                  borderRadius: '999px',
                  background:
                    'rgba(148, 163, 184, 0.12)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${
                      (risk.residual_score / 25) *
                      100
                    }%`,
                    height: '100%',
                    background: '#22d3ee',
                    borderRadius: '999px',
                  }}
                />
              </div>
            </div>

            {/* Assessment Matrix */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(2, minmax(0, 1fr))',
                gap: '12px',
              }}
            >
              <div
                style={{
                  padding: '16px',
                  borderRadius: '9px',
                  border:
                    '1px solid rgba(148, 163, 184, 0.10)',
                  background:
                    'rgba(15, 23, 42, 0.45)',
                }}
              >
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '11px',
                    marginBottom: '7px',
                  }}
                >
                  Inherent Assessment
                </div>

                <div
                  style={{
                    color: '#e2e8f0',
                    fontSize: '13px',
                  }}
                >
                  Likelihood{' '}
                  <strong>
                    {risk.likelihood}/5
                  </strong>{' '}
                  × Impact{' '}
                  <strong>
                    {risk.impact}/5
                  </strong>
                </div>
              </div>

              <div
                style={{
                  padding: '16px',
                  borderRadius: '9px',
                  border:
                    '1px solid rgba(148, 163, 184, 0.10)',
                  background:
                    'rgba(15, 23, 42, 0.45)',
                }}
              >
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '11px',
                    marginBottom: '7px',
                  }}
                >
                  Residual Assessment
                </div>

                <div
                  style={{
                    color: '#e2e8f0',
                    fontSize: '13px',
                  }}
                >
                  Likelihood{' '}
                  <strong>
                    {risk.residual_likelihood}/5
                  </strong>{' '}
                  × Impact{' '}
                  <strong>
                    {risk.residual_impact}/5
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ownership */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Risk Ownership</h3>

              <span>
                Accountability and treatment
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gap: '14px',
              marginTop: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px',
                borderRadius: '9px',
                background:
                  'rgba(15, 23, 42, 0.45)',
                border:
                  '1px solid rgba(148, 163, 184, 0.10)',
              }}
            >
              <User
                size={18}
                color="#67e8f9"
              />

              <div>
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '11px',
                    marginBottom: '4px',
                  }}
                >
                  Risk Owner
                </div>

                <strong
                  style={{
                    color: '#e2e8f0',
                    fontSize: '13px',
                  }}
                >
                  {risk.owner}
                </strong>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px',
                borderRadius: '9px',
                background:
                  'rgba(15, 23, 42, 0.45)',
                border:
                  '1px solid rgba(148, 163, 184, 0.10)',
              }}
            >
              <ShieldCheck
                size={18}
                color="#67e8f9"
              />

              <div>
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '11px',
                    marginBottom: '4px',
                  }}
                >
                  Treatment
                </div>

                <strong
                  style={{
                    color: '#e2e8f0',
                    fontSize: '13px',
                  }}
                >
                  {risk.treatment}
                </strong>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px',
                borderRadius: '9px',
                background:
                  'rgba(15, 23, 42, 0.45)',
                border:
                  '1px solid rgba(148, 163, 184, 0.10)',
              }}
            >
              <CalendarDays
                size={18}
                color="#67e8f9"
              />

              <div>
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '11px',
                    marginBottom: '4px',
                  }}
                >
                  Treatment Due Date
                </div>

                <strong
                  style={{
                    color: '#e2e8f0',
                    fontSize: '13px',
                  }}
                >
                  {formatDate(risk.due_date)}
                </strong>
              </div>
            </div>

            <div
              style={{
                padding: '15px',
                borderRadius: '9px',
                border:
                  '1px solid rgba(34, 211, 238, 0.15)',
                background:
                  'rgba(34, 211, 238, 0.04)',
              }}
            >
              <div
                style={{
                  color: '#67e8f9',
                  fontSize: '11px',
                  fontWeight: 700,
                  marginBottom: '7px',
                }}
              >
                TREATMENT PLAN
              </div>

              <div
                style={{
                  color: '#94a3b8',
                  fontSize: '12px',
                  lineHeight: 1.6,
                }}
              >
                {risk.treatment_plan}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Response Actions */}
      <div
        className="dashboard-panel"
        style={{
          marginTop: '20px',
        }}
      >
        <div className="panel-header">
          <div>
            <h3>Risk Response Actions</h3>
            <span>
              Record treatment decisions and update the risk lifecycle.
            </span>
          </div>

          <ShieldCheck
            size={18}
            color="#67e8f9"
          />
        </div>

        {actionError && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px 14px',
              borderRadius: '9px',
              border: '1px solid rgba(248, 113, 113, 0.20)',
              background: 'rgba(248, 113, 113, 0.05)',
              color: '#fca5a5',
              fontSize: '12px',
            }}
          >
            {actionError}
          </div>
        )}

        {actionSuccess && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px 14px',
              borderRadius: '9px',
              border: '1px solid rgba(74, 222, 128, 0.20)',
              background: 'rgba(74, 222, 128, 0.05)',
              color: '#86efac',
              fontSize: '12px',
            }}
          >
            {actionSuccess}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '10px',
            marginTop: '18px',
          }}
        >
          {RISK_ACTIONS.map((item) => {
            const Icon = item.icon
            const isLoading = actionLoading === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => performAction(item.id)}
                disabled={Boolean(actionLoading)}
                style={{
                  minHeight: '112px',
                  padding: '14px',
                  borderRadius: '9px',
                  border: `1px solid ${item.tone}33`,
                  background: `${item.tone}08`,
                  color: '#e2e8f0',
                  textAlign: 'left',
                  cursor: actionLoading
                    ? 'not-allowed'
                    : 'pointer',
                  opacity:
                    actionLoading &&
                    !isLoading
                      ? 0.55
                      : 1,
                  transition:
                    'transform 0.15s ease, border-color 0.15s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '10px',
                    color: item.tone,
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  <Icon size={16} />
                  {isLoading
                    ? 'Processing...'
                    : item.label}
                </div>

                <div
                  style={{
                    color: '#64748b',
                    fontSize: '11px',
                    lineHeight: 1.5,
                  }}
                >
                  {item.description}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Response History */}
      <div
        className="dashboard-panel"
        style={{
          marginTop: '20px',
        }}
      >
        <div className="panel-header">
          <div>
            <h3>Response History</h3>
            <span>
              Persistent actions recorded against this risk.
            </span>
          </div>

          <FileSearch
            size={18}
            color="#a78bfa"
          />
        </div>

        {actionsLoading ? (
          <div
            style={{
              marginTop: '18px',
              padding: '24px',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '12px',
            }}
          >
            Loading response history...
          </div>
        ) : actions.length === 0 ? (
          <div
            style={{
              marginTop: '18px',
              padding: '24px',
              borderRadius: '9px',
              border:
                '1px solid rgba(148, 163, 184, 0.10)',
              background:
                'rgba(15, 23, 42, 0.45)',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '12px',
            }}
          >
            No response actions have been recorded for this risk yet.
          </div>
        ) : (
          <div
            style={{
              marginTop: '18px',
              display: 'grid',
              gap: '10px',
            }}
          >
            {actions.map((item, index) => {
              const actionName =
                item.action ||
                item.action_type ||
                'Risk response action'

              const actionLabel = actionName
                .toLowerCase()
                .split('_')
                .map(
                  (word) =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1),
                )
                .join(' ')

              const timestamp =
                item.created_at ||
                item.timestamp ||
                null

              return (
                <div
                  key={
                    item.id ??
                    `${actionName}-${timestamp ?? index}`
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      'space-between',
                    gap: '18px',
                    padding: '14px 16px',
                    borderRadius: '9px',
                    border:
                      '1px solid rgba(148, 163, 184, 0.10)',
                    background:
                      'rgba(15, 23, 42, 0.45)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '11px',
                      minWidth: 0,
                    }}
                  >
                    <CheckCircle2
                      size={17}
                      color="#67e8f9"
                    />

                    <div>
                      <div
                        style={{
                          color: '#e2e8f0',
                          fontSize: '13px',
                          fontWeight: 700,
                        }}
                      >
                        {actionLabel}
                      </div>

                      <div
                        style={{
                          marginTop: '4px',
                          color: '#64748b',
                          fontSize: '11px',
                        }}
                      >
                        {item.performed_by ||
                          'Security Operations'}
                        {item.notes
                          ? ` • ${item.notes}`
                          : ''}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      color: '#64748b',
                      fontSize: '11px',
                      textAlign: 'right',
                      flexShrink: 0,
                    }}
                  >
                    {formatDateTime(timestamp)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Correlation */}
      <div
        className="dashboard-panel"
        style={{
          marginTop: '20px',
        }}
      >
        <div className="panel-header">
          <div>
            <h3>Risk Correlation</h3>

            <span>
              Related security objects connected to
              this risk
            </span>
          </div>

          <Link2
            size={18}
            color="#67e8f9"
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(3, minmax(0, 1fr))',
            gap: '14px',
            marginTop: '20px',
          }}
        >
          {/* Vulnerabilities */}
          <div
            style={{
              padding: '18px',
              borderRadius: '10px',
              border:
                '1px solid rgba(148, 163, 184, 0.10)',
              background:
                'rgba(15, 23, 42, 0.45)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '14px',
              }}
            >
              <ShieldAlert
                size={17}
                color="#f87171"
              />

              <strong
                style={{
                  color: '#e2e8f0',
                  fontSize: '13px',
                }}
              >
                Vulnerabilities
              </strong>
            </div>

            {risk.related_vulnerability_ids.length >
            0 ? (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '7px',
                }}
              >
                {risk.related_vulnerability_ids.map(
                  (id) => (
                    <Link
                      key={id}
                      to={`/vulnerabilities/${id}`}
                      style={{
                        color: '#67e8f9',
                        textDecoration: 'none',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '6px 9px',
                        borderRadius: '6px',
                        border:
                          '1px solid rgba(34, 211, 238, 0.18)',
                        background:
                          'rgba(34, 211, 238, 0.04)',
                      }}
                    >
                      {id}
                    </Link>
                  ),
                )}
              </div>
            ) : (
              <span
                style={{
                  color: '#64748b',
                  fontSize: '12px',
                }}
              >
                No linked vulnerabilities
              </span>
            )}
          </div>

          {/* Incidents */}
          <div
            style={{
              padding: '18px',
              borderRadius: '10px',
              border:
                '1px solid rgba(148, 163, 184, 0.10)',
              background:
                'rgba(15, 23, 42, 0.45)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '14px',
              }}
            >
              <AlertTriangle
                size={17}
                color="#f59e0b"
              />

              <strong
                style={{
                  color: '#e2e8f0',
                  fontSize: '13px',
                }}
              >
                Incidents
              </strong>
            </div>

            {risk.related_incident_ids.length >
            0 ? (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '7px',
                }}
              >
                {risk.related_incident_ids.map(
                  (id) => (
                    <Link
                      key={id}
                      to={`/incidents/${id}`}
                      style={{
                        color: '#fbbf24',
                        textDecoration: 'none',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '6px 9px',
                        borderRadius: '6px',
                        border:
                          '1px solid rgba(245, 158, 11, 0.18)',
                        background:
                          'rgba(245, 158, 11, 0.04)',
                      }}
                    >
                      {id}
                    </Link>
                  ),
                )}
              </div>
            ) : (
              <span
                style={{
                  color: '#64748b',
                  fontSize: '12px',
                }}
              >
                No linked incidents
              </span>
            )}
          </div>

          {/* Controls */}
          <div
            style={{
              padding: '18px',
              borderRadius: '10px',
              border:
                '1px solid rgba(148, 163, 184, 0.10)',
              background:
                'rgba(15, 23, 42, 0.45)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '14px',
              }}
            >
              <FileSearch
                size={17}
                color="#a78bfa"
              />

              <strong
                style={{
                  color: '#e2e8f0',
                  fontSize: '13px',
                }}
              >
                Compliance Controls
              </strong>
            </div>

            {risk.related_control_ids.length >
            0 ? (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '7px',
                }}
              >
                {risk.related_control_ids.map(
                  (id) => (
                    <Link
                      key={id}
                      to={`/compliance/${id}`}
                      style={{
                        color: '#c4b5fd',
                        textDecoration: 'none',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '6px 9px',
                        borderRadius: '6px',
                        border:
                          '1px solid rgba(167, 139, 250, 0.18)',
                        background:
                          'rgba(167, 139, 250, 0.04)',
                      }}
                    >
                      {id}
                    </Link>
                  ),
                )}
              </div>
            ) : (
              <span
                style={{
                  color: '#64748b',
                  fontSize: '12px',
                }}
              >
                No linked controls
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Investigation Timeline / Metadata */}
      <div
        className="dashboard-grid"
        style={{
          marginTop: '20px',
        }}
      >
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Investigation Context</h3>

              <span>
                Current risk treatment context
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: '18px',
              display: 'grid',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
                padding: '15px 16px',
                borderRadius: '9px',
                border:
                  '1px solid rgba(148, 163, 184, 0.10)',
                background:
                  'rgba(15, 23, 42, 0.45)',
              }}
            >
              <strong
                style={{
                  color: '#e2e8f0',
                  fontSize: '13px',
                  flexShrink: 0,
                }}
              >
                Risk Category
              </strong>

              <span
                style={{
                  color: '#cbd5e1',
                  fontSize: '13px',
                  textAlign: 'right',
                }}
              >
                {risk.category}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
                padding: '15px 16px',
                borderRadius: '9px',
                border:
                  '1px solid rgba(148, 163, 184, 0.10)',
                background:
                  'rgba(15, 23, 42, 0.45)',
              }}
            >
              <strong
                style={{
                  color: '#e2e8f0',
                  fontSize: '13px',
                  flexShrink: 0,
                }}
              >
                Treatment Strategy
              </strong>

              <span
                style={{
                  color: '#67e8f9',
                  fontSize: '13px',
                  fontWeight: 700,
                  textAlign: 'right',
                }}
              >
                {risk.treatment}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
                padding: '15px 16px',
                borderRadius: '9px',
                border:
                  '1px solid rgba(148, 163, 184, 0.10)',
                background:
                  'rgba(15, 23, 42, 0.45)',
              }}
            >
              <strong
                style={{
                  color: '#e2e8f0',
                  fontSize: '13px',
                  flexShrink: 0,
                }}
              >
                Current Status
              </strong>

              <span
                style={{
                  color: '#fbbf24',
                  fontSize: '13px',
                  fontWeight: 700,
                  textAlign: 'right',
                }}
              >
                {formatStatus(risk.status)}
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Risk Metadata</h3>

              <span>
                Record lifecycle information
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: '18px',
              display: 'grid',
              gap: '14px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                gap: '20px',
                paddingBottom: '12px',
                borderBottom:
                  '1px solid rgba(148, 163, 184, 0.10)',
              }}
            >
              <span
                style={{
                  color: '#64748b',
                  fontSize: '12px',
                }}
              >
                Created
              </span>

              <strong
                style={{
                  color: '#cbd5e1',
                  fontSize: '12px',
                  textAlign: 'right',
                }}
              >
                {formatDateTime(
                  risk.created_at,
                )}
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                gap: '20px',
                paddingBottom: '12px',
                borderBottom:
                  '1px solid rgba(148, 163, 184, 0.10)',
              }}
            >
              <span
                style={{
                  color: '#64748b',
                  fontSize: '12px',
                }}
              >
                Last Updated
              </span>

              <strong
                style={{
                  color: '#cbd5e1',
                  fontSize: '12px',
                  textAlign: 'right',
                }}
              >
                {formatDateTime(
                  risk.updated_at,
                )}
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                gap: '20px',
              }}
            >
              <span
                style={{
                  color: '#64748b',
                  fontSize: '12px',
                }}
              >
                Risk Identifier
              </span>

              <strong
                style={{
                  color: '#67e8f9',
                  fontSize: '12px',
                }}
              >
                {risk.risk_id}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div
        style={{
          marginTop: '20px',
          padding: '16px 18px',
          borderRadius: '10px',
          border:
            '1px solid rgba(34, 211, 238, 0.14)',
          background:
            'rgba(34, 211, 238, 0.035)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <CheckCircle2
          size={18}
          color="#67e8f9"
        />

        <div>
          <strong
            style={{
              color: '#67e8f9',
              fontSize: '13px',
            }}
          >
            Risk investigation data synchronized
          </strong>

          <div
            style={{
              color: '#64748b',
              fontSize: '11px',
              marginTop: '3px',
            }}
          >
            This investigation view is populated
            directly from the CyberSentinel Risk API.
          </div>
        </div>
      </div>
    </div>
  )
}