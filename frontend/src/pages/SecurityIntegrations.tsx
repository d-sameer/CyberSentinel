import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Database,
  HeartPulse,
  Search,
  Server,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'

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

type IntegrationResponse = {
  summary: {
    total: number
    connected: number
    disconnected: number
    degraded: number
    disabled: number
    healthy: number
    unhealthy: number
  }
  integrations: Integration[]
}

function formatLastSync(value: string | null) {
  if (!value) {
    return 'Never'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

function statusTone(status: string) {
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
    case 'DISABLED':
      return {
        background: 'rgba(100, 116, 139, 0.12)',
        border: '1px solid rgba(100, 116, 139, 0.28)',
        color: '#cbd5e1',
      }
    default:
      return {
        background: 'rgba(56, 189, 248, 0.12)',
        border: '1px solid rgba(56, 189, 248, 0.28)',
        color: '#7dd3fc',
      }
  }
}

function healthTone(health: string) {
  if (health === 'HEALTHY') {
    return {
      background: 'rgba(34, 197, 94, 0.1)',
      color: '#86efac',
    }
  }

  return {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#fca5a5',
  }
}

function statusIcon(status: string) {
  if (status === 'CONNECTED') {
    return <CheckCircle2 size={14} />
  }

  if (status === 'DEGRADED') {
    return <AlertTriangle size={14} />
  }

  if (status === 'DISCONNECTED') {
    return <XCircle size={14} />
  }

  return <ShieldCheck size={14} />
}

export default function SecurityIntegrations() {
  const [data, setData] = useState<IntegrationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')
  const [status, setStatus] = useState('ALL')
  const [health, setHealth] = useState('ALL')

  useEffect(() => {
    const loadIntegrations = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          'http://127.0.0.1:8000/api/integrations',
        )

        if (!response.ok) {
          throw new Error('Failed to load security integrations.')
        }

        const result: IntegrationResponse = await response.json()
        setData(result)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load security integrations.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadIntegrations()
  }, [])

  const integrations = data?.integrations ?? []

  const categories = useMemo(() => {
    return [
      'ALL',
      ...Array.from(
        new Set(integrations.map((integration) => integration.category)),
      ).sort(),
    ]
  }, [integrations])

  const filteredIntegrations = useMemo(() => {
    const query = search.trim().toLowerCase()

    return integrations.filter((integration) => {
      const matchesSearch =
        !query ||
        integration.integration_id.toLowerCase().includes(query) ||
        integration.name.toLowerCase().includes(query) ||
        integration.provider.toLowerCase().includes(query) ||
        integration.category.toLowerCase().includes(query) ||
        integration.owner.toLowerCase().includes(query)

      const matchesCategory =
        category === 'ALL' || integration.category === category

      const matchesStatus =
        status === 'ALL' || integration.status === status

      const matchesHealth =
        health === 'ALL' || integration.health === health

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesHealth
      )
    })
  }, [integrations, search, category, status, health])

  const summary = data?.summary ?? {
    total: 0,
    connected: 0,
    disconnected: 0,
    degraded: 0,
    disabled: 0,
    healthy: 0,
    unhealthy: 0,
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            <Database size={14} />
            SECURITY OPERATIONS
          </div>

          <h1>Security Integrations</h1>

          <p>
            Manage connected security platforms, telemetry sources,
            synchronization health, and integration status.
          </p>
        </div>

        <div className="page-status">
          <Activity size={15} />
          Integration monitoring active
        </div>
      </div>

      {error && (
        <div
          className="dashboard-panel"
          style={{
            marginBottom: 20,
            borderColor: 'rgba(239, 68, 68, 0.3)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: '#fca5a5',
            }}
          >
            <AlertTriangle size={18} />
            {error}
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">
            <Database size={20} />
          </div>

          <div>
            <div className="stat-card-label">Total Integrations</div>
            <div className="stat-card-value">
              {loading ? '—' : summary.total}
            </div>
            <div className="stat-card-meta">
              Registered security platforms
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <div className="stat-card-label">Connected</div>
            <div className="stat-card-value">
              {loading ? '—' : summary.connected}
            </div>
            <div className="stat-card-meta">
              Active integrations
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">
            <HeartPulse size={20} />
          </div>

          <div>
            <div className="stat-card-label">Healthy</div>
            <div className="stat-card-value">
              {loading ? '—' : summary.healthy}
            </div>
            <div className="stat-card-meta">
              Operating within expected health
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">
            <AlertTriangle size={20} />
          </div>

          <div>
            <div className="stat-card-label">Attention Required</div>
            <div className="stat-card-value">
              {loading ? '—' : summary.unhealthy}
            </div>
            <div className="stat-card-meta">
              Unhealthy integrations
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-panel" style={{ marginTop: 20 }}>
        <div
          className="panel-header"
          style={{
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h2>Integration Inventory</h2>
            <span>
              {filteredIntegrations.length} of {integrations.length}{' '}
              integrations shown
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                minWidth: 250,
                padding: '9px 12px',
                borderRadius: 8,
                border: '1px solid rgba(148, 163, 184, 0.16)',
                background: 'rgba(15, 23, 42, 0.75)',
              }}
            >
              <Search size={16} style={{ color: '#64748b' }} />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search integrations..."
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: '#e2e8f0',
                  fontSize: 13,
                }}
              />
            </div>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              style={{
                minWidth: 170,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid rgba(148, 163, 184, 0.16)',
                background: '#0f172a',
                color: '#cbd5e1',
              }}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === 'ALL' ? 'All Categories' : item}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              style={{
                minWidth: 150,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid rgba(148, 163, 184, 0.16)',
                background: '#0f172a',
                color: '#cbd5e1',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="CONNECTED">Connected</option>
              <option value="DEGRADED">Degraded</option>
              <option value="DISCONNECTED">Disconnected</option>
              <option value="DISABLED">Disabled</option>
            </select>

            <select
              value={health}
              onChange={(event) => setHealth(event.target.value)}
              style={{
                minWidth: 135,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid rgba(148, 163, 184, 0.16)',
                background: '#0f172a',
                color: '#cbd5e1',
              }}
            >
              <option value="ALL">All Health</option>
              <option value="HEALTHY">Healthy</option>
              <option value="UNHEALTHY">Unhealthy</option>
            </select>
          </div>
        </div>

        <div
          style={{
            overflowX: 'auto',
            marginTop: 14,
          }}
        >
          <table
            style={{
              width: '100%',
              minWidth: 1100,
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom:
                    '1px solid rgba(148, 163, 184, 0.12)',
                  color: '#64748b',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                <th style={{ textAlign: 'left', padding: '12px 14px' }}>
                  Integration
                </th>

                <th style={{ textAlign: 'left', padding: '12px 14px' }}>
                  Category
                </th>

                <th style={{ textAlign: 'left', padding: '12px 14px' }}>
                  Provider
                </th>

                <th style={{ textAlign: 'left', padding: '12px 14px' }}>
                  Status
                </th>

                <th style={{ textAlign: 'left', padding: '12px 14px' }}>
                  Health
                </th>

                <th style={{ textAlign: 'left', padding: '12px 14px' }}>
                  Last Sync
                </th>

                <th
                  style={{
                    textAlign: 'right',
                    padding: '12px 14px',
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: 36,
                      textAlign: 'center',
                      color: '#64748b',
                    }}
                  >
                    Loading security integrations...
                  </td>
                </tr>
              ) : filteredIntegrations.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: 36,
                      textAlign: 'center',
                      color: '#64748b',
                    }}
                  >
                    No integrations match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredIntegrations.map((integration) => (
                  <tr
                    key={integration.integration_id}
                    style={{
                      borderBottom:
                        '1px solid rgba(148, 163, 184, 0.08)',
                    }}
                  >
                    <td style={{ padding: '15px 14px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 9,
                            display: 'grid',
                            placeItems: 'center',
                            background:
                              'rgba(56, 189, 248, 0.08)',
                            border:
                              '1px solid rgba(56, 189, 248, 0.16)',
                            color: '#7dd3fc',
                            flexShrink: 0,
                          }}
                        >
                          <Server size={17} />
                        </div>

                        <div>
                          <div
                            style={{
                              color: '#e2e8f0',
                              fontWeight: 600,
                              fontSize: 13,
                            }}
                          >
                            {integration.name}
                          </div>

                          <div
                            style={{
                              color: '#64748b',
                              fontSize: 11,
                              marginTop: 3,
                            }}
                          >
                            {integration.integration_id} ·{' '}
                            {integration.integration_type}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '15px 14px' }}>
                      <span
                        style={{
                          color: '#94a3b8',
                          fontSize: 12,
                        }}
                      >
                        {integration.category}
                      </span>
                    </td>

                    <td style={{ padding: '15px 14px' }}>
                      <span
                        style={{
                          color: '#cbd5e1',
                          fontSize: 12,
                        }}
                      >
                        {integration.provider}
                      </span>
                    </td>

                    <td style={{ padding: '15px 14px' }}>
                      <span
                        style={{
                          ...statusTone(integration.status),
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '5px 9px',
                          borderRadius: 999,
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                        }}
                      >
                        {statusIcon(integration.status)}
                        {integration.status}
                      </span>
                    </td>

                    <td style={{ padding: '15px 14px' }}>
                      <span
                        style={{
                          ...healthTone(integration.health),
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '5px 9px',
                          borderRadius: 999,
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        <HeartPulse size={13} />
                        {integration.health}
                      </span>
                    </td>

                    <td style={{ padding: '15px 14px' }}>
                      <div>
                        <div
                          style={{
                            color: '#cbd5e1',
                            fontSize: 12,
                          }}
                        >
                          {formatLastSync(integration.last_sync)}
                        </div>

                        <div
                          style={{
                            color: '#64748b',
                            fontSize: 10,
                            marginTop: 3,
                          }}
                        >
                          {integration.sync_frequency}
                        </div>
                      </div>
                    </td>

                    <td
                      style={{
                        padding: '15px 14px',
                        textAlign: 'right',
                      }}
                    >
                      <Link
                        to={`/integrations/${integration.integration_id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          color: '#7dd3fc',
                          textDecoration: 'none',
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        View
                        <ChevronRight size={15} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}