import { useEffect, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Database,
  ExternalLink,
  HeartPulse,
  RefreshCw,
  Server,
  Shield,
  User,
  XCircle,
  Zap,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

type Integration = {
  integration_id: string
  name: string
  description: string
  category: string
  provider: string
  integration_type: string
  status: string
  health: string
  endpoint: string
  owner: string
  data_collected: string[]
  sync_frequency: string
  last_sync: string | null
  error_message: string
  created_at: string
  updated_at: string
}

type IntegrationAction = {
  action_id: string
  integration_id: string
  action: string
  previous_status: string
  new_status: string
  previous_health: string
  new_health: string
  actor: string
  note: string
  result: string
  created_at: string
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Never'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

function statusStyle(status: string) {
  switch (status) {
    case 'CONNECTED':
      return {
        background: 'rgba(34, 197, 94, 0.12)',
        border: '1px solid rgba(34, 197, 94, 0.28)',
        color: '#86efac',
      }

    case 'DEGRADED':
      return {
        background: 'rgba(245, 158, 11, 0.12)',
        border: '1px solid rgba(245, 158, 11, 0.28)',
        color: '#fcd34d',
      }

    case 'DISCONNECTED':
      return {
        background: 'rgba(239, 68, 68, 0.12)',
        border: '1px solid rgba(239, 68, 68, 0.28)',
        color: '#fca5a5',
      }

    default:
      return {
        background: 'rgba(100, 116, 139, 0.12)',
        border: '1px solid rgba(100, 116, 139, 0.28)',
        color: '#cbd5e1',
      }
  }
}

function healthStyle(health: string) {
  if (health === 'HEALTHY') {
    return {
      background: 'rgba(34, 197, 94, 0.12)',
      border: '1px solid rgba(34, 197, 94, 0.28)',
      color: '#86efac',
    }
  }

  return {
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.28)',
    color: '#fca5a5',
  }
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'CONNECTED') {
    return <CheckCircle2 size={16} />
  }

  if (status === 'DEGRADED') {
    return <AlertTriangle size={16} />
  }

  if (status === 'DISCONNECTED') {
    return <XCircle size={16} />
  }

  return <Shield size={16} />
}

function actionLabel(action: string) {
  switch (action) {
    case 'TEST_CONNECTION':
      return 'Test Connection'
    case 'ENABLE_INTEGRATION':
      return 'Enable Integration'
    case 'DISABLE_INTEGRATION':
      return 'Disable Integration'
    case 'RECONNECT_INTEGRATION':
      return 'Reconnect Integration'
    default:
      return action.replaceAll('_', ' ')
  }
}

function actionButtonStyle(
  variant: 'primary' | 'warning' | 'danger' | 'neutral',
) {
  const styles = {
    primary: {
      background: 'rgba(14, 116, 144, 0.28)',
      border: '1px solid rgba(34, 211, 238, 0.28)',
      color: '#67e8f9',
    },
    warning: {
      background: 'rgba(180, 83, 9, 0.22)',
      border: '1px solid rgba(245, 158, 11, 0.28)',
      color: '#fcd34d',
    },
    danger: {
      background: 'rgba(153, 27, 27, 0.22)',
      border: '1px solid rgba(239, 68, 68, 0.28)',
      color: '#fca5a5',
    },
    neutral: {
      background: 'rgba(51, 65, 85, 0.32)',
      border: '1px solid rgba(148, 163, 184, 0.18)',
      color: '#cbd5e1',
    },
  }

  return {
    ...styles[variant],
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  }
}

export default function SecurityIntegrationDetails() {
  const { integrationId } = useParams()

  const [integration, setIntegration] =
    useState<Integration | null>(null)

  const [actions, setActions] = useState<IntegrationAction[]>([])
  const [loading, setLoading] = useState(true)
  const [actionsLoading, setActionsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [note, setNote] = useState('')

  const loadIntegration = async () => {
    if (!integrationId) {
      setError('Integration ID is missing.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `http://127.0.0.1:8001/api/integrations/${integrationId}`,
      )

      if (!response.ok) {
        throw new Error(
          `Unable to load integration ${integrationId}.`,
        )
      }

      const result: Integration = await response.json()

      setIntegration(result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load integration details.',
      )
    } finally {
      setLoading(false)
    }
  }

  const loadActions = async () => {
    if (!integrationId) {
      return
    }

    try {
      setActionsLoading(true)

      const response = await fetch(
        `http://127.0.0.1:8001/api/integrations/${integrationId}/actions`,
      )

      if (!response.ok) {
        throw new Error('Unable to load integration action history.')
      }

      const result: {
        integration_id: string
        total: number
        actions: IntegrationAction[]
      } = await response.json()

      setActions(result.actions)
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'Unable to load action history.',
      )
    } finally {
      setActionsLoading(false)
    }
  }

  useEffect(() => {
    loadIntegration()
    loadActions()
  }, [integrationId])

  const performAction = async (action: string) => {
    if (!integrationId) {
      return
    }

    setActionLoading(action)
    setActionError('')
    setActionSuccess('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8001/api/integrations/${integrationId}/actions?action=${encodeURIComponent(action)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            note: note.trim(),
          }),
        },
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.detail ||
            'Integration action could not be completed.',
        )
      }

      setActionSuccess(result.message)
      setNote('')

      await Promise.all([
        loadIntegration(),
        loadActions(),
      ])
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'Integration action failed.',
      )
    } finally {
      setActionLoading('')
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div
          className="dashboard-panel"
          style={{
            padding: 40,
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          Loading integration details...
        </div>
      </div>
    )
  }

  if (error || !integration) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">
              SECURITY OPERATIONS
            </div>

            <h1>Integration Details</h1>

            <p>
              Unable to load the requested security integration.
            </p>
          </div>
        </div>

        <div
          className="dashboard-panel"
          style={{
            borderColor: 'rgba(239, 68, 68, 0.28)',
            padding: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: '#fca5a5',
              marginBottom: 18,
            }}
          >
            <AlertTriangle size={20} />

            <strong>
              {error || 'Integration not found.'}
            </strong>
          </div>

          <Link
            to="/integrations"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: '#7dd3fc',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={17} />
            Back to Integrations
          </Link>
        </div>
      </div>
    )
  }

  const isDisabled = integration.status === 'DISABLED'

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <Link
            to="/integrations"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: '#67e8f9',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 14,
              marginBottom: 18,
            }}
          >
            <ArrowLeft size={17} />
            Back to Integrations
          </Link>

          <div className="page-eyebrow">
            <Database size={14} />
            SECURITY INTEGRATION CENTER
          </div>

          <h1>{integration.name}</h1>

          <p>{integration.description}</p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 10,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 15px',
              borderRadius: 10,
              ...statusStyle(integration.status),
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <StatusIcon status={integration.status} />
            {integration.status}
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 12px',
              borderRadius: 999,
              ...healthStyle(integration.health),
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            <HeartPulse size={14} />
            {integration.health}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">
            <Server size={20} />
          </div>

          <div>
            <div className="stat-card-label">
              Integration ID
            </div>

            <div className="stat-card-value">
              {integration.integration_id}
            </div>

            <div className="stat-card-meta">
              Registered security integration
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">
            <Shield size={20} />
          </div>

          <div>
            <div className="stat-card-label">
              Category
            </div>

            <div
              className="stat-card-value"
              style={{ fontSize: 20 }}
            >
              {integration.category}
            </div>

            <div className="stat-card-meta">
              {integration.integration_type}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">
            <Clock3 size={20} />
          </div>

          <div>
            <div className="stat-card-label">
              Sync Frequency
            </div>

            <div
              className="stat-card-value"
              style={{ fontSize: 20 }}
            >
              {integration.sync_frequency}
            </div>

            <div className="stat-card-meta">
              Last sync: {formatDate(integration.last_sync)}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">
            <User size={20} />
          </div>

          <div>
            <div className="stat-card-label">
              Owner
            </div>

            <div
              className="stat-card-value"
              style={{ fontSize: 20 }}
            >
              {integration.owner}
            </div>

            <div className="stat-card-meta">
              Responsible security team
            </div>
          </div>
        </div>
      </div>

      <div
        className="dashboard-grid"
        style={{ marginTop: 20 }}
      >
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Integration Overview</h2>
              <span>
                Platform configuration and ownership
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(2, minmax(0, 1fr))',
              gap: 16,
              marginTop: 18,
            }}
          >
            <div
              className="endpoint-summary-card"
              style={{ minHeight: 0 }}
            >
              <div
                style={{
                  color: '#64748b',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 7,
                }}
              >
                Provider
              </div>

              <div
                style={{
                  color: '#e2e8f0',
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {integration.provider}
              </div>
            </div>

            <div
              className="endpoint-summary-card"
              style={{ minHeight: 0 }}
            >
              <div
                style={{
                  color: '#64748b',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 7,
                }}
              >
                Integration Type
              </div>

              <div
                style={{
                  color: '#e2e8f0',
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {integration.integration_type}
              </div>
            </div>

            <div
              className="endpoint-summary-card"
              style={{ minHeight: 0 }}
            >
              <div
                style={{
                  color: '#64748b',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 7,
                }}
              >
                Category
              </div>

              <div
                style={{
                  color: '#e2e8f0',
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {integration.category}
              </div>
            </div>

            <div
              className="endpoint-summary-card"
              style={{ minHeight: 0 }}
            >
              <div
                style={{
                  color: '#64748b',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 7,
                }}
              >
                Owner
              </div>

              <div
                style={{
                  color: '#e2e8f0',
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {integration.owner}
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Connection Health</h2>
              <span>Current synchronization state</span>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom:
                  '1px solid rgba(148, 163, 184, 0.1)',
              }}
            >
              <span style={{ color: '#64748b' }}>
                Status
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  ...statusStyle(integration.status),
                  padding: '6px 10px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                <StatusIcon status={integration.status} />
                {integration.status}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom:
                  '1px solid rgba(148, 163, 184, 0.1)',
              }}
            >
              <span style={{ color: '#64748b' }}>
                Health
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  ...healthStyle(integration.health),
                  padding: '6px 10px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                <HeartPulse size={14} />
                {integration.health}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom:
                  '1px solid rgba(148, 163, 184, 0.1)',
              }}
            >
              <span style={{ color: '#64748b' }}>
                Sync Frequency
              </span>

              <span style={{ color: '#cbd5e1' }}>
                {integration.sync_frequency}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 0',
              }}
            >
              <span style={{ color: '#64748b' }}>
                Last Sync
              </span>

              <span
                style={{
                  color: '#cbd5e1',
                  textAlign: 'right',
                }}
              >
                {formatDate(integration.last_sync)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="dashboard-grid"
        style={{ marginTop: 20 }}
      >
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Connection Configuration</h2>
              <span>Configured integration endpoint</span>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div
              style={{
                color: '#64748b',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 8,
              }}
            >
              Endpoint
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
                padding: '14px 16px',
                borderRadius: 9,
                background: 'rgba(15, 23, 42, 0.8)',
                border:
                  '1px solid rgba(148, 163, 184, 0.12)',
              }}
            >
              <code
                style={{
                  color: '#7dd3fc',
                  fontSize: 13,
                  overflowWrap: 'anywhere',
                }}
              >
                {integration.endpoint}
              </code>

              <ExternalLink
                size={16}
                style={{
                  color: '#64748b',
                  flexShrink: 0,
                }}
              />
            </div>
          </div>

          {integration.error_message && (
            <div
              style={{
                marginTop: 18,
                padding: 16,
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.07)',
                border:
                  '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#fca5a5',
                  fontWeight: 600,
                  marginBottom: 7,
                }}
              >
                <AlertTriangle size={16} />
                Integration Error
              </div>

              <div
                style={{
                  color: '#94a3b8',
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                {integration.error_message}
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Data Collection</h2>
              <span>
                Telemetry supplied by this integration
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              marginTop: 18,
            }}
          >
            {integration.data_collected.map((item) => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 13px',
                  borderRadius: 8,
                  background: 'rgba(15, 23, 42, 0.72)',
                  border:
                    '1px solid rgba(148, 163, 184, 0.1)',
                  color: '#cbd5e1',
                  fontSize: 13,
                }}
              >
                <CheckCircle2
                  size={15}
                  style={{ color: '#4ade80' }}
                />

                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="dashboard-panel"
        style={{ marginTop: 20 }}
      >
        <div className="panel-header">
          <div>
            <h2>Integration Administration</h2>
            <span>
              Controlled simulated connection management
            </span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              color: '#64748b',
              fontSize: 11,
            }}
          >
            <Activity size={14} />
            Actions are audited
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(0, 1fr) 280px',
            gap: 20,
            marginTop: 18,
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <button
                type="button"
                disabled={
                  actionLoading !== '' || isDisabled
                }
                onClick={() =>
                  performAction('TEST_CONNECTION')
                }
                style={{
                  ...actionButtonStyle('primary'),
                  opacity:
                    actionLoading !== '' || isDisabled
                      ? 0.5
                      : 1,
                }}
              >
                <Zap size={15} />
                {actionLoading === 'TEST_CONNECTION'
                  ? 'Testing...'
                  : 'Test Connection'}
              </button>

              <button
                type="button"
                disabled={
                  actionLoading !== '' ||
                  isDisabled
                }
                onClick={() =>
                  performAction('RECONNECT_INTEGRATION')
                }
                style={{
                  ...actionButtonStyle('neutral'),
                  opacity:
                    actionLoading !== '' || isDisabled
                      ? 0.5
                      : 1,
                }}
              >
                <RefreshCw size={15} />
                {actionLoading ===
                'RECONNECT_INTEGRATION'
                  ? 'Reconnecting...'
                  : 'Reconnect'}
              </button>

              {isDisabled ? (
                <button
                  type="button"
                  disabled={actionLoading !== ''}
                  onClick={() =>
                    performAction(
                      'ENABLE_INTEGRATION',
                    )
                  }
                  style={{
                    ...actionButtonStyle('primary'),
                    opacity:
                      actionLoading !== '' ? 0.5 : 1,
                  }}
                >
                  <CheckCircle2 size={15} />
                  {actionLoading ===
                  'ENABLE_INTEGRATION'
                    ? 'Enabling...'
                    : 'Enable Integration'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={actionLoading !== ''}
                  onClick={() =>
                    performAction(
                      'DISABLE_INTEGRATION',
                    )
                  }
                  style={{
                    ...actionButtonStyle('danger'),
                    opacity:
                      actionLoading !== '' ? 0.5 : 1,
                  }}
                >
                  <XCircle size={15} />
                  {actionLoading ===
                  'DISABLE_INTEGRATION'
                    ? 'Disabling...'
                    : 'Disable Integration'}
                </button>
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              <label
                htmlFor="integration-action-note"
                style={{
                  display: 'block',
                  color: '#94a3b8',
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 7,
                }}
              >
                Action Note
              </label>

              <textarea
                id="integration-action-note"
                value={note}
                onChange={(event) =>
                  setNote(event.target.value)
                }
                placeholder="Optional note for the integration audit history..."
                rows={3}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  padding: '11px 13px',
                  borderRadius: 8,
                  border:
                    '1px solid rgba(148, 163, 184, 0.16)',
                  background: 'rgba(15, 23, 42, 0.82)',
                  color: '#cbd5e1',
                  outline: 'none',
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              />
            </div>

            {actionSuccess && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 9,
                  marginTop: 14,
                  padding: 13,
                  borderRadius: 8,
                  background:
                    'rgba(34, 197, 94, 0.08)',
                  border:
                    '1px solid rgba(34, 197, 94, 0.2)',
                  color: '#86efac',
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                <CheckCircle2
                  size={16}
                  style={{ flexShrink: 0 }}
                />
                {actionSuccess}
              </div>
            )}

            {actionError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 9,
                  marginTop: 14,
                  padding: 13,
                  borderRadius: 8,
                  background:
                    'rgba(239, 68, 68, 0.08)',
                  border:
                    '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#fca5a5',
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                <AlertTriangle
                  size={16}
                  style={{ flexShrink: 0 }}
                />
                {actionError}
              </div>
            )}
          </div>

          <div
            style={{
              padding: 15,
              borderRadius: 10,
              background: 'rgba(15, 23, 42, 0.7)',
              border:
                '1px solid rgba(56, 189, 248, 0.12)',
            }}
          >
            <div
              style={{
                color: '#67e8f9',
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Simulated Administration
            </div>

            <div
              style={{
                color: '#64748b',
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              These controls update the local CyberSentinel
              integration record and create an audit trail.
              They do not connect to or modify external
              security infrastructure.
            </div>
          </div>
        </div>
      </div>

      <div
        className="dashboard-panel"
        style={{ marginTop: 20 }}
      >
        <div className="panel-header">
          <div>
            <h2>Action History</h2>
            <span>
              Persistent administrative activity for this
              integration
            </span>
          </div>

          <div
            style={{
              color: '#64748b',
              fontSize: 11,
            }}
          >
            {actions.length} recorded action
            {actions.length === 1 ? '' : 's'}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          {actionsLoading ? (
            <div
              style={{
                padding: 30,
                textAlign: 'center',
                color: '#64748b',
                fontSize: 13,
              }}
            >
              Loading action history...
            </div>
          ) : actions.length === 0 ? (
            <div
              style={{
                padding: 30,
                textAlign: 'center',
                color: '#64748b',
                fontSize: 13,
              }}
            >
              No administrative actions have been recorded
              yet.
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {actions.map((item) => (
                <div
                  key={item.action_id}
                  style={{
                    padding: 16,
                    borderRadius: 10,
                    background:
                      'rgba(15, 23, 42, 0.72)',
                    border:
                      '1px solid rgba(148, 163, 184, 0.1)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems: 'flex-start',
                      gap: 16,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 9,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            color: '#67e8f9',
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {item.action_id}
                        </span>

                        <span
                          style={{
                            color: '#e2e8f0',
                            fontWeight: 600,
                            fontSize: 13,
                          }}
                        >
                          {actionLabel(item.action)}
                        </span>
                      </div>

                      <div
                        style={{
                          color: '#64748b',
                          fontSize: 11,
                          marginTop: 6,
                        }}
                      >
                        {formatDate(item.created_at)}
                        {' · '}
                        {item.actor}
                      </div>
                    </div>

                    <span
                      style={{
                        ...statusStyle(item.new_status),
                        padding: '5px 9px',
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {item.new_status}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(2, minmax(0, 1fr))',
                      gap: 10,
                      marginTop: 14,
                    }}
                  >
                    <div
                      style={{
                        padding: 10,
                        borderRadius: 8,
                        background:
                          'rgba(2, 6, 23, 0.35)',
                      }}
                    >
                      <div
                        style={{
                          color: '#64748b',
                          fontSize: 10,
                          textTransform:
                            'uppercase',
                          letterSpacing: '0.07em',
                        }}
                      >
                        Status Transition
                      </div>

                      <div
                        style={{
                          color: '#cbd5e1',
                          fontSize: 12,
                          marginTop: 5,
                        }}
                      >
                        {item.previous_status}
                        {' → '}
                        {item.new_status}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: 10,
                        borderRadius: 8,
                        background:
                          'rgba(2, 6, 23, 0.35)',
                      }}
                    >
                      <div
                        style={{
                          color: '#64748b',
                          fontSize: 10,
                          textTransform:
                            'uppercase',
                          letterSpacing: '0.07em',
                        }}
                      >
                        Health Transition
                      </div>

                      <div
                        style={{
                          color: '#cbd5e1',
                          fontSize: 12,
                          marginTop: 5,
                        }}
                      >
                        {item.previous_health}
                        {' → '}
                        {item.new_health}
                      </div>
                    </div>
                  </div>

                  {item.note && (
                    <div
                      style={{
                        marginTop: 12,
                        color: '#94a3b8',
                        fontSize: 12,
                        lineHeight: 1.5,
                      }}
                    >
                      <strong
                        style={{ color: '#64748b' }}
                      >
                        Note:
                      </strong>{' '}
                      {item.note}
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: 10,
                      paddingTop: 10,
                      borderTop:
                        '1px solid rgba(148, 163, 184, 0.08)',
                      color: '#64748b',
                      fontSize: 11,
                      lineHeight: 1.5,
                    }}
                  >
                    {item.result}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className="dashboard-panel"
        style={{ marginTop: 20 }}
      >
        <div className="panel-header">
          <div>
            <h2>Integration Metadata</h2>
            <span>Administrative record information</span>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(3, minmax(0, 1fr))',
            gap: 16,
            marginTop: 18,
          }}
        >
          <div>
            <div
              style={{
                color: '#64748b',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 7,
              }}
            >
              Created
            </div>

            <div style={{ color: '#cbd5e1' }}>
              {formatDate(integration.created_at)}
            </div>
          </div>

          <div>
            <div
              style={{
                color: '#64748b',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 7,
              }}
            >
              Last Updated
            </div>

            <div style={{ color: '#cbd5e1' }}>
              {formatDate(integration.updated_at)}
            </div>
          </div>

          <div>
            <div
              style={{
                color: '#64748b',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 7,
              }}
            >
              Integration ID
            </div>

            <div
              style={{
                color: '#67e8f9',
                fontWeight: 600,
              }}
            >
              {integration.integration_id}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 20,
          paddingBottom: 30,
        }}
      >
        <Link
          to="/integrations"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            padding: '14px 18px',
            borderRadius: 10,
            background: 'rgba(14, 116, 144, 0.3)',
            border:
              '1px solid rgba(34, 211, 238, 0.25)',
            color: '#67e8f9',
            textDecoration: 'none',
            fontWeight: 700,
          }}
        >
          <ArrowLeft size={17} />
          Return to Integrations
        </Link>
      </div>
    </div>
  )
}