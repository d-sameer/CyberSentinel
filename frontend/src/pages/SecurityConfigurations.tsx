import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Filter,
  Search,
  ShieldCheck,
  XCircle,
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

type ConfigurationResponse = {
  summary: {
    total: number
    compliant: number
    non_compliant: number
    partially_compliant: number
    critical: number
    high: number
    medium: number
    low: number
  }
  configurations: SecurityConfiguration[]
}

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

function formatDate(value: string) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

export default function SecurityConfigurations() {
  const [data, setData] = useState<ConfigurationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [complianceFilter, setComplianceFilter] = useState('ALL')
  const [severityFilter, setSeverityFilter] = useState('ALL')

  useEffect(() => {
    const loadConfigurations = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_BASE}/api/security-configurations`,
        )

        if (!response.ok) {
          throw new Error(
            `Failed to load security configurations (${response.status})`,
          )
        }

        const result: ConfigurationResponse = await response.json()
        setData(result)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load security configurations.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadConfigurations()
  }, [])

  const configurations = data?.configurations ?? []

  const configurationTypes = useMemo(() => {
    return Array.from(
      new Set(
        configurations.map(
          (configuration) => configuration.configuration_type,
        ),
      ),
    ).sort()
  }, [configurations])

  const filteredConfigurations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return configurations.filter((configuration) => {
      const matchesSearch =
        !normalizedSearch ||
        configuration.configuration_id
          .toLowerCase()
          .includes(normalizedSearch) ||
        configuration.name.toLowerCase().includes(normalizedSearch) ||
        configuration.asset_id.toLowerCase().includes(normalizedSearch) ||
        configuration.asset_name.toLowerCase().includes(normalizedSearch) ||
        configuration.category.toLowerCase().includes(normalizedSearch) ||
        configuration.owner.toLowerCase().includes(normalizedSearch) ||
        configuration.control_reference
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesType =
        typeFilter === 'ALL' ||
        configuration.configuration_type === typeFilter

      const matchesCompliance =
        complianceFilter === 'ALL' ||
        configuration.compliance_status === complianceFilter

      const matchesSeverity =
        severityFilter === 'ALL' ||
        configuration.severity === severityFilter

      return (
        matchesSearch &&
        matchesType &&
        matchesCompliance &&
        matchesSeverity
      )
    })
  }, [
    configurations,
    search,
    typeFilter,
    complianceFilter,
    severityFilter,
  ])

  const summary = data?.summary ?? {
    total: 0,
    compliant: 0,
    non_compliant: 0,
    partially_compliant: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">SECURITY GOVERNANCE</div>

          <h1>Security Configuration Center</h1>

          <p>
            Monitor configuration baselines, compliance status, security
            findings, and configuration drift across protected assets.
          </p>
        </div>

        <div className="page-status">
          <ShieldCheck size={16} />
          BACKEND CONNECTED
        </div>
      </div>

      {loading && (
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Loading Configuration Inventory</h3>
              <span>Retrieving security configuration data...</span>
            </div>
          </div>

          <div
            style={{
              padding: '28px',
              textAlign: 'center',
              color: '#94a3b8',
            }}
          >
            Loading security configurations...
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Configuration API Error</h3>
              <span>Unable to retrieve configuration inventory.</span>
            </div>
          </div>

          <div
            style={{
              padding: '24px',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertTriangle size={18} />
            {error}
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-icon">
                <ClipboardCheck size={20} />
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <span>Total Configurations</span>
                <strong>{summary.total}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon">
                <CheckCircle2 size={20} />
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <span>Compliant</span>
                <strong>{summary.compliant}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon">
                <XCircle size={20} />
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <span>Non-Compliant</span>
                <strong>{summary.non_compliant}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon">
                <AlertTriangle size={20} />
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <span>Critical Findings</span>
                <strong>{summary.critical}</strong>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-panel">
              <div className="panel-header">
                <div>
                  <h3>Compliance Overview</h3>
                  <span>Current baseline compliance state</span>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '14px',
                  padding: '18px',
                }}
              >
                <div
                  className="endpoint-summary-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span>Compliant</span>
                  <strong>{summary.compliant}</strong>
                  <small>Configurations meeting baseline</small>
                </div>

                <div
                  className="endpoint-summary-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span>Non-Compliant</span>
                  <strong>{summary.non_compliant}</strong>
                  <small>Configurations requiring remediation</small>
                </div>

                <div
                  className="endpoint-summary-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span>Partial</span>
                  <strong>{summary.partially_compliant}</strong>
                  <small>Configurations with deviations</small>
                </div>
              </div>
            </div>

            <div className="dashboard-panel">
              <div className="panel-header">
                <div>
                  <h3>Severity Distribution</h3>
                  <span>Configuration finding severity</span>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(110px, 1fr))',
                  gap: '12px',
                  padding: '18px',
                }}
              >
                <div
                  className="endpoint-summary-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span>Critical</span>
                  <strong>{summary.critical}</strong>
                </div>

                <div
                  className="endpoint-summary-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span>High</span>
                  <strong>{summary.high}</strong>
                </div>

                <div
                  className="endpoint-summary-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span>Medium</span>
                  <strong>{summary.medium}</strong>
                </div>

                <div
                  className="endpoint-summary-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span>Low</span>
                  <strong>{summary.low}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-panel" style={{ marginTop: '20px' }}>
            <div className="panel-header">
              <div>
                <h3>Configuration Inventory</h3>
                <span>
                  {filteredConfigurations.length} of{' '}
                  {configurations.length} configurations displayed
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                padding: '18px',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  flex: '1 1 260px',
                  minWidth: '240px',
                }}
              >
                <Search
                  size={17}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                  }}
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search configuration, asset, owner..."
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '11px 12px 11px 38px',
                    borderRadius: '8px',
                    border: '1px solid rgba(148, 163, 184, 0.18)',
                    background: 'rgba(15, 23, 42, 0.7)',
                    color: '#e2e8f0',
                    outline: 'none',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#94a3b8',
                }}
              >
                <Filter size={16} />
              </div>

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(148, 163, 184, 0.18)',
                  background: '#0f172a',
                  color: '#cbd5e1',
                }}
              >
                <option value="ALL">All Types</option>

                {configurationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                value={complianceFilter}
                onChange={(event) =>
                  setComplianceFilter(event.target.value)
                }
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(148, 163, 184, 0.18)',
                  background: '#0f172a',
                  color: '#cbd5e1',
                }}
              >
                <option value="ALL">All Compliance</option>
                <option value="COMPLIANT">Compliant</option>
                <option value="NON_COMPLIANT">Non-Compliant</option>
                <option value="PARTIALLY_COMPLIANT">
                  Partially Compliant
                </option>
              </select>

              <select
                value={severityFilter}
                onChange={(event) => setSeverityFilter(event.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(148, 163, 184, 0.18)',
                  background: '#0f172a',
                  color: '#cbd5e1',
                }}
              >
                <option value="ALL">All Severity</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: '1050px',
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '13px 18px',
                        color: '#64748b',
                        fontSize: '11px',
                        letterSpacing: '0.08em',
                      }}
                    >
                      CONFIGURATION
                    </th>

                    <th
                      style={{
                        textAlign: 'left',
                        padding: '13px 18px',
                        color: '#64748b',
                        fontSize: '11px',
                        letterSpacing: '0.08em',
                      }}
                    >
                      ASSET
                    </th>

                    <th
                      style={{
                        textAlign: 'left',
                        padding: '13px 18px',
                        color: '#64748b',
                        fontSize: '11px',
                        letterSpacing: '0.08em',
                      }}
                    >
                      TYPE
                    </th>

                    <th
                      style={{
                        textAlign: 'left',
                        padding: '13px 18px',
                        color: '#64748b',
                        fontSize: '11px',
                        letterSpacing: '0.08em',
                      }}
                    >
                      COMPLIANCE
                    </th>

                    <th
                      style={{
                        textAlign: 'left',
                        padding: '13px 18px',
                        color: '#64748b',
                        fontSize: '11px',
                        letterSpacing: '0.08em',
                      }}
                    >
                      SEVERITY
                    </th>

                    <th
                      style={{
                        textAlign: 'left',
                        padding: '13px 18px',
                        color: '#64748b',
                        fontSize: '11px',
                        letterSpacing: '0.08em',
                      }}
                    >
                      BASELINE
                    </th>

                    <th
                      style={{
                        textAlign: 'left',
                        padding: '13px 18px',
                        color: '#64748b',
                        fontSize: '11px',
                        letterSpacing: '0.08em',
                      }}
                    >
                      ACTION
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredConfigurations.map((configuration) => (
                    <tr
                      key={configuration.configuration_id}
                      style={{
                        borderTop:
                          '1px solid rgba(148, 163, 184, 0.08)',
                      }}
                    >
                      <td style={{ padding: '16px 18px' }}>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                          }}
                        >
                          <strong
                            style={{
                              color: '#e2e8f0',
                              fontSize: '13px',
                            }}
                          >
                            {configuration.name}
                          </strong>

                          <span
                            style={{
                              color: '#64748b',
                              fontSize: '11px',
                            }}
                          >
                            {configuration.configuration_id} ·{' '}
                            {configuration.category}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        <Link
                          to={`/assets/${configuration.asset_id}`}
                          style={{
                            color: '#67e8f9',
                            textDecoration: 'none',
                            fontSize: '13px',
                          }}
                        >
                          {configuration.asset_id}
                        </Link>

                        <div
                          style={{
                            color: '#64748b',
                            fontSize: '11px',
                            marginTop: '3px',
                          }}
                        >
                          {configuration.asset_name}
                        </div>
                      </td>

                      <td
                        style={{
                          padding: '16px 18px',
                          color: '#cbd5e1',
                          fontSize: '12px',
                        }}
                      >
                        {configuration.configuration_type}
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        <span
                          className={`soc-category ${getStatusClass(
                            configuration.compliance_status,
                          )}`}
                        >
                          {formatStatus(
                            configuration.compliance_status,
                          )}
                        </span>
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        <span
                          className={`soc-category ${getSeverityClass(
                            configuration.severity,
                          )}`}
                        >
                          {configuration.severity}
                        </span>
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '3px',
                          }}
                        >
                          <span
                            style={{
                              color: '#cbd5e1',
                              fontSize: '12px',
                            }}
                          >
                            {configuration.baseline}
                          </span>

                          <span
                            style={{
                              color: '#64748b',
                              fontSize: '11px',
                            }}
                          >
                            v{configuration.baseline_version}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        <Link
                          to={`/security-configurations/${configuration.configuration_id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: '#67e8f9',
                            textDecoration: 'none',
                            fontSize: '12px',
                          }}
                        >
                          View Details
                          <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {filteredConfigurations.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          padding: '40px',
                          textAlign: 'center',
                          color: '#64748b',
                        }}
                      >
                        No security configurations match the
                        selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
              color: '#64748b',
              fontSize: '11px',
            }}
          >
            <span>
              Configuration inventory synchronized from CyberSentinel
              backend.
            </span>

            <span>
              Last checked:{' '}
              {configurations.length > 0
                ? formatDate(configurations[0].last_checked)
                : '—'}
            </span>
          </div>
        </>
      )}
    </div>
  )
}