import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Search,
  ShieldAlert,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

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

type PlaybookResponse = {
  summary: {
    total_playbooks: number
    enabled: number
    disabled: number
    critical: number
    high: number
    medium: number
  }
  playbooks: Playbook[]
}

const API_BASE = 'http://127.0.0.1:8000'

function severityClass(severity: string) {
  switch (severity) {
    case 'CRITICAL':
      return 'soc-category-critical'

    case 'HIGH':
      return 'soc-category-high'

    case 'MEDIUM':
      return 'soc-category-medium'

    case 'LOW':
      return 'soc-category-low'

    default:
      return 'soc-category-info'
  }
}

function statusClass(status: string) {
  return status === 'ENABLED'
    ? 'soc-category-low'
    : 'soc-category-critical'
}

function formatStatus(value: string) {
  return value.replaceAll('_', ' ')
}

function SecurityPlaybooks() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([])
  const [summary, setSummary] =
    useState<PlaybookResponse['summary'] | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')
  const [status, setStatus] = useState('ALL')
  const [severity, setSeverity] = useState('ALL')

  async function loadPlaybooks() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `${API_BASE}/api/playbooks`,
      )

      if (!response.ok) {
        throw new Error(
          `Unable to load playbooks (${response.status})`,
        )
      }

      const data: PlaybookResponse =
        await response.json()

      setPlaybooks(data.playbooks || [])
      setSummary(data.summary)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load security playbooks.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlaybooks()
  }, [])

  const categories = useMemo(() => {
    return [
      'ALL',
      ...Array.from(
        new Set(
          playbooks.map(
            (playbook) => playbook.category,
          ),
        ),
      ),
    ]
  }, [playbooks])

  const filteredPlaybooks = useMemo(() => {
    const query = search.trim().toLowerCase()

    return playbooks.filter((playbook) => {
      const matchesSearch =
        !query ||
        playbook.playbook_id
          .toLowerCase()
          .includes(query) ||
        playbook.name
          .toLowerCase()
          .includes(query) ||
        playbook.description
          .toLowerCase()
          .includes(query) ||
        playbook.category
          .toLowerCase()
          .includes(query) ||
        playbook.owner
          .toLowerCase()
          .includes(query)

      const matchesCategory =
        category === 'ALL' ||
        playbook.category === category

      const matchesStatus =
        status === 'ALL' ||
        playbook.status === status

      const matchesSeverity =
        severity === 'ALL' ||
        playbook.severity === severity

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesSeverity
      )
    })
  }, [
    playbooks,
    search,
    category,
    status,
    severity,
  ])

  if (loading) {
    return (
      <div className="page-container">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <div className="page-eyebrow">
                SECURITY AUTOMATION
              </div>

              <h2>Loading playbooks...</h2>
            </div>

            <Activity size={20} />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">
              SECURITY AUTOMATION
            </div>

            <h1>Playbooks unavailable</h1>

            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            SECURITY AUTOMATION CENTER
          </div>

          <h1>Security Playbooks</h1>

          <p>
            Manage automated security response workflows
            used by CyberSentinel SOC operations.
          </p>
        </div>

        <div className="page-status">
          <span className="soc-category soc-category-info">
            <Zap size={14} />
            AUTOMATION
          </span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">
            Total Playbooks
          </div>

          <div className="stat-value">
            {summary?.total_playbooks ?? 0}
          </div>

          <div className="stat-meta">
            Response workflows
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            Enabled
          </div>

          <div className="stat-value">
            {summary?.enabled ?? 0}
          </div>

          <div className="stat-meta">
            Available for execution
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            Critical
          </div>

          <div className="stat-value">
            {summary?.critical ?? 0}
          </div>

          <div className="stat-meta">
            Critical response workflows
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            High
          </div>

          <div className="stat-value">
            {summary?.high ?? 0}
          </div>

          <div className="stat-meta">
            High-priority workflows
          </div>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="panel-header">
          <div>
            <div className="page-eyebrow">
              PLAYBOOK CATALOG
            </div>

            <h2>Response Automation</h2>
          </div>

          <BookOpen size={20} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(240px, 1.6fr) repeat(3, minmax(150px, 0.7fr))',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
              }}
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search playbooks..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px 10px 36px',
                background:
                  'rgba(15, 23, 42, 0.72)',
                border:
                  '1px solid rgba(148, 163, 184, 0.18)',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            style={{
              padding: '10px 12px',
              background:
                'rgba(15, 23, 42, 0.72)',
              border:
                '1px solid rgba(148, 163, 184, 0.18)',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          >
            {categories.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item === 'ALL'
                  ? 'All Categories'
                  : item}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            style={{
              padding: '10px 12px',
              background:
                'rgba(15, 23, 42, 0.72)',
              border:
                '1px solid rgba(148, 163, 184, 0.18)',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          >
            <option value="ALL">
              All Statuses
            </option>

            <option value="ENABLED">
              Enabled
            </option>

            <option value="DISABLED">
              Disabled
            </option>
          </select>

          <select
            value={severity}
            onChange={(event) =>
              setSeverity(event.target.value)
            }
            style={{
              padding: '10px 12px',
              background:
                'rgba(15, 23, 42, 0.72)',
              border:
                '1px solid rgba(148, 163, 184, 0.18)',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          >
            <option value="ALL">
              All Severities
            </option>

            <option value="CRITICAL">
              Critical
            </option>

            <option value="HIGH">
              High
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="LOW">
              Low
            </option>
          </select>
        </div>

        <div
          style={{
            marginBottom: '12px',
            color: '#64748b',
            fontSize: '12px',
          }}
        >
          Showing {filteredPlaybooks.length} of{' '}
          {playbooks.length} playbooks
        </div>

        <div
          style={{
            overflowX: 'auto',
            border:
              '1px solid rgba(148, 163, 184, 0.12)',
            borderRadius: '10px',
          }}
        >
          <table
            style={{
              width: '100%',
              minWidth: '1000px',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr
                style={{
                  background:
                    'rgba(15, 23, 42, 0.85)',
                }}
              >
                <th
                  style={{
                    padding: '13px 14px',
                    textAlign: 'left',
                    color: '#64748b',
                    fontSize: '11px',
                    letterSpacing: '0.06em',
                  }}
                >
                  PLAYBOOK
                </th>

                <th
                  style={{
                    padding: '13px 14px',
                    textAlign: 'left',
                    color: '#64748b',
                    fontSize: '11px',
                  }}
                >
                  CATEGORY
                </th>

                <th
                  style={{
                    padding: '13px 14px',
                    textAlign: 'left',
                    color: '#64748b',
                    fontSize: '11px',
                  }}
                >
                  SEVERITY
                </th>

                <th
                  style={{
                    padding: '13px 14px',
                    textAlign: 'left',
                    color: '#64748b',
                    fontSize: '11px',
                  }}
                >
                  STATUS
                </th>

                <th
                  style={{
                    padding: '13px 14px',
                    textAlign: 'left',
                    color: '#64748b',
                    fontSize: '11px',
                  }}
                >
                  TRIGGER
                </th>

                <th
                  style={{
                    padding: '13px 14px',
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '11px',
                  }}
                >
                  ACTIONS
                </th>

                <th
                  style={{
                    padding: '13px 14px',
                    textAlign: 'right',
                    color: '#64748b',
                    fontSize: '11px',
                    position: 'sticky',
                    right: 0,
                    background:
                      'rgba(15, 23, 42, 0.96)',
                  }}
                >
                  VIEW
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredPlaybooks.map(
                (playbook) => (
                  <tr
                    key={playbook.playbook_id}
                    style={{
                      borderTop:
                        '1px solid rgba(148, 163, 184, 0.10)',
                    }}
                  >
                    <td
                      style={{
                        padding: '15px 14px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background:
                              'rgba(6, 182, 212, 0.10)',
                            color: '#67e8f9',
                            flexShrink: 0,
                          }}
                        >
                          <ShieldAlert size={16} />
                        </div>

                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              color: '#e2e8f0',
                              fontSize: '13px',
                            }}
                          >
                            {playbook.name}
                          </div>

                          <div
                            style={{
                              color: '#64748b',
                              fontSize: '11px',
                              marginTop: '4px',
                            }}
                          >
                            {playbook.playbook_id} · v
                            {playbook.version}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td
                      style={{
                        padding: '15px 14px',
                        color: '#cbd5e1',
                        fontSize: '12px',
                      }}
                    >
                      {playbook.category}
                    </td>

                    <td
                      style={{
                        padding: '15px 14px',
                      }}
                    >
                      <span
                        className={`soc-category ${severityClass(
                          playbook.severity,
                        )}`}
                      >
                        {playbook.severity}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: '15px 14px',
                      }}
                    >
                      <span
                        className={`soc-category ${statusClass(
                          playbook.status,
                        )}`}
                      >
                        {formatStatus(
                          playbook.status,
                        )}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: '15px 14px',
                        color: '#94a3b8',
                        fontSize: '12px',
                      }}
                    >
                      {playbook.trigger_type}
                    </td>

                    <td
                      style={{
                        padding: '15px 14px',
                        textAlign: 'center',
                        color: '#cbd5e1',
                        fontWeight: 600,
                      }}
                    >
                      {playbook.actions.length}
                    </td>

                    <td
                      style={{
                        padding: '15px 14px',
                        textAlign: 'right',
                        position: 'sticky',
                        right: 0,
                        background:
                          'rgba(2, 6, 23, 0.98)',
                        boxShadow:
                          '-8px 0 14px rgba(0, 0, 0, 0.18)',
                      }}
                    >
                      <Link
                        to={`/automation/${playbook.playbook_id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#67e8f9',
                          textDecoration: 'none',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        View
                        <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>

        {filteredPlaybooks.length === 0 ? (
          <div
            style={{
              padding: '30px',
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            <CheckCircle2
              size={28}
              style={{
                marginBottom: '8px',
              }}
            />

            <div>
              No playbooks match the current filters.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default SecurityPlaybooks