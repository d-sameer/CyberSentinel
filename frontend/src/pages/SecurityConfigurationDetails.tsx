import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileCheck2,
  History,
  Info,
  RefreshCw,
  Server,
  ShieldAlert,
  ShieldCheck,
  User,
  Wrench,
} from 'lucide-react'

type SecurityConfiguration = {
  id: number
  configuration_id: string
  name: string
  description: string
  configuration_type: string
  category: string
  asset_id: string
  asset_name: string
  environment: string
  baseline: string
  baseline_version: string
  compliance_status: string
  severity: string
  current_value: string
  expected_value: string
  control_reference: string
  remediation: string
  owner: string
  last_checked: string
  created_at: string
  updated_at: string
}

type ConfigurationAction = {
  id: number
  configuration_id: string
  action: string
  status: string
  performed_by: string
  notes: string
  created_at: string
}

type ActionsResponse = {
  configuration_id: string
  actions: ConfigurationAction[]
}

type ActionName =
  | 'REMEDIATE'
  | 'MARK_COMPLIANT'
  | 'ACCEPT_RISK'
  | 'SCHEDULE_REVIEW'
  | 'RECHECK'

const API_BASE = 'http://127.0.0.1:8000'

function getStatusClass(status: string) {
  switch (status.toUpperCase()) {
    case 'COMPLIANT':
      return 'soc-category-low'

    case 'NON_COMPLIANT':
      return 'soc-category-critical'

    case 'PARTIALLY_COMPLIANT':
      return 'soc-category-medium'

    default:
      return 'soc-category-medium'
  }
}

function getSeverityClass(severity: string) {
  switch (severity.toUpperCase()) {
    case 'CRITICAL':
      return 'soc-category-critical'

    case 'HIGH':
      return 'soc-category-high'

    case 'MEDIUM':
      return 'soc-category-medium'

    case 'LOW':
      return 'soc-category-low'

    default:
      return 'soc-category-medium'
  }
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ')
}

function formatAction(action: string) {
  return action.replace(/_/g, ' ')
}

function formatDate(value: string) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '180px 1fr',
        gap: '20px',
        padding: '13px 0',
        borderBottom:
          '1px solid rgba(148, 163, 184, 0.08)',
      }}
    >
      <span
        style={{
          color: '#64748b',
          fontSize: '12px',
          fontWeight: 600,
        }}
      >
        {label}
      </span>

      <span
        style={{
          color: '#cbd5e1',
          fontSize: '13px',
          lineHeight: 1.6,
        }}
      >
        {value || '—'}
      </span>
    </div>
  )
}

export default function SecurityConfigurationDetails() {
  const { configurationId } = useParams<{
    configurationId: string
  }>()

  const [configuration, setConfiguration] =
    useState<SecurityConfiguration | null>(null)

  const [actions, setActions] = useState<
    ConfigurationAction[]
  >([])

  const [loading, setLoading] = useState(true)
  const [actionsLoading, setActionsLoading] = useState(true)
  const [actionLoading, setActionLoading] =
    useState<ActionName | null>(null)

  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')

  const [performedBy, setPerformedBy] =
    useState('Security Analyst')

  const [actionNotes, setActionNotes] = useState('')

  const loadConfiguration = async () => {
    if (!configurationId) {
      setError('Configuration ID is missing.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `${API_BASE}/api/security-configurations/${configurationId}`,
      )

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            'Security configuration not found.',
          )
        }

        throw new Error(
          `Failed to load security configuration (${response.status})`,
        )
      }

      const result: SecurityConfiguration =
        await response.json()

      setConfiguration(result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load security configuration.',
      )
    } finally {
      setLoading(false)
    }
  }

  const loadActions = async () => {
    if (!configurationId) return

    try {
      setActionsLoading(true)

      const response = await fetch(
        `${API_BASE}/api/security-configurations/${configurationId}/actions`,
      )

      if (!response.ok) {
        throw new Error(
          `Failed to load response history (${response.status})`,
        )
      }

      const result: ActionsResponse = await response.json()

      setActions(result.actions)
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'Unable to load response history.',
      )
    } finally {
      setActionsLoading(false)
    }
  }

  useEffect(() => {
    loadConfiguration()
    loadActions()
  }, [configurationId])

  const executeAction = async (action: ActionName) => {
    if (!configurationId) return

    setActionLoading(action)
    setActionMessage('')
    setActionError('')

    try {
      const response = await fetch(
        `${API_BASE}/api/security-configurations/${configurationId}/actions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action,
            performed_by:
              performedBy.trim() || 'Security Analyst',
            notes:
              actionNotes.trim() ||
              `Security configuration action ${formatAction(
                action,
              ).toLowerCase()} executed from CyberSentinel.`,
          }),
        },
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.detail ||
            'Failed to execute security configuration action.',
        )
      }

      setActionMessage(
        `${formatAction(action)} completed successfully.`,
      )

      setActionNotes('')

      await Promise.all([
        loadConfiguration(),
        loadActions(),
      ])
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'Unable to execute security configuration action.',
      )
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">
              SECURITY GOVERNANCE
            </div>

            <h1>Security Configuration Details</h1>

            <p>
              Loading configuration security posture and
              baseline information.
            </p>
          </div>

          <div className="page-status">
            <ShieldCheck size={16} />
            BACKEND CONNECTED
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
            Loading configuration details...
          </div>
        </div>
      </div>
    )
  }

  if (error || !configuration) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">
              SECURITY GOVERNANCE
            </div>

            <h1>Configuration Not Found</h1>

            <p>
              The requested security configuration could not
              be loaded.
            </p>
          </div>
        </div>

        <div className="dashboard-panel">
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              color: '#f87171',
            }}
          >
            <AlertTriangle
              size={28}
              style={{ marginBottom: '12px' }}
            />

            <div>{error || 'Configuration not found.'}</div>

            <Link
              to="/security-configurations"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                marginTop: '20px',
                color: '#67e8f9',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={16} />
              Back to Configuration Center
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isCompliant =
    configuration.compliance_status.toUpperCase() ===
    'COMPLIANT'

  return (
    <div className="page-container">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <Link
            to="/security-configurations"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              color: '#67e8f9',
              textDecoration: 'none',
              fontSize: '12px',
              marginBottom: '14px',
            }}
          >
            <ArrowLeft size={15} />
            Back to Configuration Center
          </Link>

          <div className="page-eyebrow">
            SECURITY CONFIGURATION
          </div>

          <h1>{configuration.name}</h1>

          <p>{configuration.description}</p>
        </div>

        <div className="page-status">
          <ShieldCheck size={16} />
          BACKEND CONNECTED
        </div>
      </div>

      {/* STATUS HEADER */}
      <div
        className="dashboard-panel"
        style={{
          marginBottom: '20px',
          minHeight: '0',
          height: 'auto',
        }}
      >
        <div
          style={{
            padding: '20px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            minHeight: '0',
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
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isCompliant
                  ? 'rgba(34, 197, 94, 0.10)'
                  : 'rgba(239, 68, 68, 0.10)',
                border: isCompliant
                  ? '1px solid rgba(34, 197, 94, 0.20)'
                  : '1px solid rgba(239, 68, 68, 0.20)',
              }}
            >
              {isCompliant ? (
                <CheckCircle2
                  size={24}
                  style={{ color: '#4ade80' }}
                />
              ) : (
                <ShieldAlert
                  size={24}
                  style={{ color: '#f87171' }}
                />
              )}
            </div>

            <div>
              <div
                style={{
                  color: '#e2e8f0',
                  fontSize: '15px',
                  fontWeight: 700,
                }}
              >
                {configuration.configuration_id}
              </div>

              <div
                style={{
                  color: '#64748b',
                  fontSize: '12px',
                  marginTop: '4px',
                }}
              >
                {configuration.category} ·{' '}
                {configuration.configuration_type}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <span
              className={`soc-category ${getStatusClass(
                configuration.compliance_status,
              )}`}
            >
              {formatStatus(
                configuration.compliance_status,
              )}
            </span>

            <span
              className={`soc-category ${getSeverityClass(
                configuration.severity,
              )}`}
            >
              {configuration.severity}
            </span>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">
            <ClipboardCheck size={20} />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '7px',
            }}
          >
            <span>Configuration ID</span>
            <strong>{configuration.configuration_id}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">
            <FileCheck2 size={20} />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '7px',
            }}
          >
            <span>Baseline</span>
            <strong>
              {configuration.baseline_version}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">
            <Server size={20} />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '7px',
            }}
          >
            <span>Environment</span>
            <strong>{configuration.environment}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">
            <User size={20} />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '7px',
            }}
          >
            <span>Owner</span>
            <strong>{configuration.owner}</strong>
          </div>
        </div>
      </div>

      {/* CONFIGURATION + ASSET */}
      <div
        className="dashboard-grid"
        style={{ marginTop: '20px' }}
      >
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Configuration Overview</h3>
              <span>
                Core configuration and baseline metadata
              </span>
            </div>

            <Info size={18} />
          </div>

          <div style={{ padding: '6px 20px 20px' }}>
            <DetailRow
              label="Configuration ID"
              value={configuration.configuration_id}
            />

            <DetailRow
              label="Configuration Type"
              value={configuration.configuration_type}
            />

            <DetailRow
              label="Category"
              value={configuration.category}
            />

            <DetailRow
              label="Environment"
              value={configuration.environment}
            />

            <DetailRow
              label="Baseline"
              value={`${configuration.baseline} v${configuration.baseline_version}`}
            />

            <DetailRow
              label="Control Reference"
              value={configuration.control_reference}
            />

            <DetailRow
              label="Owner"
              value={configuration.owner}
            />
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Asset Correlation</h3>
              <span>
                Protected asset associated with this
                configuration
              </span>
            </div>

            <Server size={18} />
          </div>

          <div style={{ padding: '20px' }}>
            <div
              style={{
                padding: '18px',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.65)',
                border:
                  '1px solid rgba(148, 163, 184, 0.10)',
              }}
            >
              <div
                style={{
                  color: '#67e8f9',
                  fontSize: '15px',
                  fontWeight: 700,
                }}
              >
                {configuration.asset_id}
              </div>

              <div
                style={{
                  color: '#cbd5e1',
                  marginTop: '6px',
                  fontSize: '13px',
                }}
              >
                {configuration.asset_name}
              </div>

              <div
                style={{
                  marginTop: '14px',
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <span className="soc-category soc-category-medium">
                  {configuration.environment}
                </span>

                <span className="soc-category soc-category-low">
                  Protected Asset
                </span>
              </div>

              <Link
                to={`/assets/${configuration.asset_id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '18px',
                  color: '#67e8f9',
                  textDecoration: 'none',
                  fontSize: '12px',
                }}
              >
                Open Asset Details
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CURRENT VS EXPECTED */}
      <div
        className="dashboard-grid"
        style={{ marginTop: '20px' }}
      >
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Current Configuration</h3>
              <span>
                Value currently detected on the asset
              </span>
            </div>

            <AlertTriangle size={18} />
          </div>

          <div style={{ padding: '20px' }}>
            <div
              style={{
                minHeight: '130px',
                padding: '18px',
                borderRadius: '10px',
                background:
                  'rgba(239, 68, 68, 0.055)',
                border:
                  '1px solid rgba(239, 68, 68, 0.16)',
                color: '#fca5a5',
                fontSize: '13px',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}
            >
              {configuration.current_value}
            </div>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Expected Configuration</h3>
              <span>
                Value required by the security baseline
              </span>
            </div>

            <CheckCircle2 size={18} />
          </div>

          <div style={{ padding: '20px' }}>
            <div
              style={{
                minHeight: '130px',
                padding: '18px',
                borderRadius: '10px',
                background:
                  'rgba(34, 197, 94, 0.055)',
                border:
                  '1px solid rgba(34, 197, 94, 0.16)',
                color: '#86efac',
                fontSize: '13px',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}
            >
              {configuration.expected_value}
            </div>
          </div>
        </div>
      </div>

      {/* REMEDIATION GUIDANCE */}
      <div
        className="dashboard-panel"
        style={{ marginTop: '20px' }}
      >
        <div className="panel-header">
          <div>
            <h3>Remediation Guidance</h3>
            <span>
              Recommended action for addressing the
              configuration state
            </span>
          </div>

          <ShieldAlert size={18} />
        </div>

        <div style={{ padding: '20px' }}>
          <div
            style={{
              padding: '18px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.055)',
              border:
                '1px solid rgba(245, 158, 11, 0.15)',
              color: '#fcd34d',
              fontSize: '13px',
              lineHeight: 1.7,
            }}
          >
            {configuration.remediation}
          </div>
        </div>
      </div>

      {/* RESPONSE WORKFLOW */}
      <div
        className="dashboard-panel"
        style={{ marginTop: '20px' }}
      >
        <div className="panel-header">
          <div>
            <h3>Response Workflow</h3>
            <span>
              Record and track configuration remediation
              actions
            </span>
          </div>

          <Wrench size={18} />
        </div>

        <div style={{ padding: '20px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
              marginBottom: '20px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  color: '#64748b',
                  fontSize: '11px',
                  marginBottom: '7px',
                  fontWeight: 600,
                }}
              >
                PERFORMED BY
              </label>

              <input
                type="text"
                value={performedBy}
                onChange={(event) =>
                  setPerformedBy(event.target.value)
                }
                placeholder="Security Analyst"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '11px 12px',
                  borderRadius: '8px',
                  border:
                    '1px solid rgba(148, 163, 184, 0.18)',
                  background: 'rgba(15, 23, 42, 0.7)',
                  color: '#e2e8f0',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  color: '#64748b',
                  fontSize: '11px',
                  marginBottom: '7px',
                  fontWeight: 600,
                }}
              >
                ACTION NOTES
              </label>

              <input
                type="text"
                value={actionNotes}
                onChange={(event) =>
                  setActionNotes(event.target.value)
                }
                placeholder="Describe the action performed..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '11px 12px',
                  borderRadius: '8px',
                  border:
                    '1px solid rgba(148, 163, 184, 0.18)',
                  background: 'rgba(15, 23, 42, 0.7)',
                  color: '#e2e8f0',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {actionMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                padding: '12px 14px',
                marginBottom: '16px',
                borderRadius: '8px',
                background:
                  'rgba(34, 197, 94, 0.07)',
                border:
                  '1px solid rgba(34, 197, 94, 0.18)',
                color: '#86efac',
                fontSize: '12px',
              }}
            >
              <CheckCircle2 size={16} />
              {actionMessage}
            </div>
          )}

          {actionError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                padding: '12px 14px',
                marginBottom: '16px',
                borderRadius: '8px',
                background:
                  'rgba(239, 68, 68, 0.07)',
                border:
                  '1px solid rgba(239, 68, 68, 0.18)',
                color: '#fca5a5',
                fontSize: '12px',
              }}
            >
              <AlertTriangle size={16} />
              {actionError}
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '10px',
            }}
          >
            <button
              type="button"
              onClick={() => executeAction('REMEDIATE')}
              disabled={actionLoading !== null}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                border:
                  '1px solid rgba(34, 197, 94, 0.25)',
                background:
                  'rgba(34, 197, 94, 0.08)',
                color: '#86efac',
                cursor:
                  actionLoading !== null
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  actionLoading !== null ? 0.6 : 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Wrench size={16} />

              {actionLoading === 'REMEDIATE'
                ? 'Processing...'
                : 'Remediate'}
            </button>

            <button
              type="button"
              onClick={() =>
                executeAction('MARK_COMPLIANT')
              }
              disabled={actionLoading !== null}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                border:
                  '1px solid rgba(34, 211, 238, 0.25)',
                background:
                  'rgba(34, 211, 238, 0.07)',
                color: '#67e8f9',
                cursor:
                  actionLoading !== null
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  actionLoading !== null ? 0.6 : 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={16} />

              {actionLoading === 'MARK_COMPLIANT'
                ? 'Processing...'
                : 'Mark Compliant'}
            </button>

            <button
              type="button"
              onClick={() => executeAction('ACCEPT_RISK')}
              disabled={actionLoading !== null}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                border:
                  '1px solid rgba(245, 158, 11, 0.25)',
                background:
                  'rgba(245, 158, 11, 0.07)',
                color: '#fcd34d',
                cursor:
                  actionLoading !== null
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  actionLoading !== null ? 0.6 : 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ShieldAlert size={16} />

              {actionLoading === 'ACCEPT_RISK'
                ? 'Processing...'
                : 'Accept Risk'}
            </button>

            <button
              type="button"
              onClick={() =>
                executeAction('SCHEDULE_REVIEW')
              }
              disabled={actionLoading !== null}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                border:
                  '1px solid rgba(148, 163, 184, 0.22)',
                background:
                  'rgba(148, 163, 184, 0.06)',
                color: '#cbd5e1',
                cursor:
                  actionLoading !== null
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  actionLoading !== null ? 0.6 : 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ClipboardCheck size={16} />

              {actionLoading === 'SCHEDULE_REVIEW'
                ? 'Processing...'
                : 'Schedule Review'}
            </button>

            <button
              type="button"
              onClick={() => executeAction('RECHECK')}
              disabled={actionLoading !== null}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                border:
                  '1px solid rgba(96, 165, 250, 0.25)',
                background:
                  'rgba(96, 165, 250, 0.07)',
                color: '#93c5fd',
                cursor:
                  actionLoading !== null
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  actionLoading !== null ? 0.6 : 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <RefreshCw size={16} />

              {actionLoading === 'RECHECK'
                ? 'Processing...'
                : 'Recheck'}
            </button>
          </div>
        </div>
      </div>

      {/* RESPONSE HISTORY */}
      <div
        className="dashboard-panel"
        style={{ marginTop: '20px' }}
      >
        <div className="panel-header">
          <div>
            <h3>Response History</h3>
            <span>
              Persistent security configuration response
              actions
            </span>
          </div>

          <History size={18} />
        </div>

        {actionsLoading ? (
          <div
            style={{
              padding: '30px',
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
              padding: '30px',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '12px',
            }}
          >
            No response actions have been recorded yet.
          </div>
        ) : (
          <div style={{ padding: '8px 20px 20px' }}>
            {actions.map((action) => (
              <div
                key={action.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '42px 1fr auto',
                  gap: '14px',
                  alignItems: 'start',
                  padding: '16px 0',
                  borderBottom:
                    '1px solid rgba(148, 163, 184, 0.08)',
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      'rgba(34, 211, 238, 0.07)',
                    border:
                      '1px solid rgba(34, 211, 238, 0.14)',
                  }}
                >
                  <Wrench
                    size={15}
                    style={{ color: '#67e8f9' }}
                  />
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <strong
                      style={{
                        color: '#e2e8f0',
                        fontSize: '13px',
                      }}
                    >
                      {formatAction(action.action)}
                    </strong>

                    <span className="soc-category soc-category-low">
                      {action.status}
                    </span>
                  </div>

                  <div
                    style={{
                      color: '#94a3b8',
                      fontSize: '12px',
                      marginTop: '6px',
                      lineHeight: 1.6,
                    }}
                  >
                    {action.notes || 'No notes provided.'}
                  </div>

                  <div
                    style={{
                      color: '#64748b',
                      fontSize: '11px',
                      marginTop: '7px',
                    }}
                  >
                    Performed by {action.performed_by}
                  </div>
                </div>

                <div
                  style={{
                    color: '#64748b',
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatDate(action.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CHECK INFORMATION */}
      <div
        className="dashboard-panel"
        style={{ marginTop: '20px' }}
      >
        <div className="panel-header">
          <div>
            <h3>Configuration Check History</h3>
            <span>
              Configuration timestamps and validation metadata
            </span>
          </div>

          <ClipboardCheck size={18} />
        </div>

        <div style={{ padding: '6px 20px 20px' }}>
          <DetailRow
            label="Last Checked"
            value={formatDate(configuration.last_checked)}
          />

          <DetailRow
            label="Created"
            value={formatDate(configuration.created_at)}
          />

          <DetailRow
            label="Last Updated"
            value={formatDate(configuration.updated_at)}
          />

          <DetailRow
            label="Baseline"
            value={`${configuration.baseline} v${configuration.baseline_version}`}
          />

          <DetailRow
            label="Control"
            value={configuration.control_reference}
          />
        </div>
      </div>

      {/* NAVIGATION */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginTop: '20px',
        }}
      >
        <Link
          to="/security-configurations"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            color: '#67e8f9',
            textDecoration: 'none',
            fontSize: '12px',
          }}
        >
          <ArrowLeft size={15} />
          Back to Configuration Center
        </Link>

        <Link
          to={`/assets/${configuration.asset_id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            color: '#67e8f9',
            textDecoration: 'none',
            fontSize: '12px',
          }}
        >
          Open Related Asset
          <ExternalLink size={14} />
        </Link>
      </div>
    </div>
  )
}