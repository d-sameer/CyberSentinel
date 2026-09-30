import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Filter,
  Search,
  ShieldAlert,
  Target,
} from 'lucide-react'

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
}

type RiskResponse = {
  summary: {
    total_risks: number
    critical: number
    high: number
    medium: number
    low: number
    open_risks: number
    accepted: number
    mitigated: number
    average_inherent_score: number
    average_residual_score: number
  }
  risks: Risk[]
}

const API_BASE = 'http://127.0.0.1:8000'

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

function getStatusClass(status: string) {
  switch (status.toUpperCase()) {
    case 'MITIGATED':
      return 'resolved'
    case 'ACCEPTED':
      return 'info'
    case 'MONITORING':
      return 'warning'
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

function getScoreClass(score: number) {
  if (score >= 20) return 'critical'
  if (score >= 12) return 'high'
  if (score >= 6) return 'medium'
  return 'low'
}

export default function RiskManagement() {
  const [data, setData] = useState<RiskResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  useEffect(() => {
    const loadRisks = async () => {
      try {
        setLoading(true)

        const response = await fetch(
          `${API_BASE}/api/risks`,
        )

        if (!response.ok) {
          throw new Error('Failed to load risk data')
        }

        const result: RiskResponse =
          await response.json()

        setData(result)
        setError('')
      } catch (err) {
        console.error(err)
        setError(
          'Unable to load risk management data from the backend.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadRisks()
  }, [])

  const categories = useMemo(() => {
    if (!data) return []

    return Array.from(
      new Set(
        data.risks.map((risk) => risk.category),
      ),
    ).sort()
  }, [data])

  const filteredRisks = useMemo(() => {
    if (!data) return []

    const searchValue = search
      .toLowerCase()
      .trim()

    return data.risks.filter((risk) => {
      const matchesSearch =
        !searchValue ||
        risk.risk_id
          .toLowerCase()
          .includes(searchValue) ||
        risk.title
          .toLowerCase()
          .includes(searchValue) ||
        risk.category
          .toLowerCase()
          .includes(searchValue) ||
        risk.owner
          .toLowerCase()
          .includes(searchValue)

      const matchesSeverity =
        severityFilter === 'ALL' ||
        risk.severity.toUpperCase() ===
          severityFilter

      const matchesStatus =
        statusFilter === 'ALL' ||
        risk.status.toUpperCase() ===
          statusFilter

      const matchesCategory =
        categoryFilter === 'ALL' ||
        risk.category === categoryFilter

      return (
        matchesSearch &&
        matchesSeverity &&
        matchesStatus &&
        matchesCategory
      )
    })
  }, [
    data,
    search,
    severityFilter,
    statusFilter,
    categoryFilter,
  ])

  const maxResidualScore = useMemo(() => {
    if (!data || data.risks.length === 0) {
      return 1
    }

    return Math.max(
      ...data.risks.map(
        (risk) => risk.residual_score,
      ),
      1,
    )
  }, [data])

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">
              GRC / RISK
            </div>

            <h1>Risk Management Center</h1>

            <p>
              Loading enterprise security risk data...
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
            Loading risk management data...
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">
              GRC / RISK
            </div>

            <h1>Risk Management Center</h1>

            <p>
              Enterprise risk identification,
              treatment and monitoring.
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
            {error || 'No risk data available.'}
          </div>
        </div>
      </div>
    )
  }

  const { summary } = data

  const tableHeaderStyle = {
    textAlign: 'left' as const,
    padding: '12px 8px',
    color: '#64748b',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap' as const,
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            GRC / RISK MANAGEMENT
          </div>

          <h1>Risk Management Center</h1>

          <p>
            Identify, assess, prioritize and track
            enterprise security risks across
            CyberSentinel.
          </p>
        </div>

        <div className="page-status">
          <ShieldAlert size={16} />
          Risk Register Active
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span>Total Risks</span>
            <Target size={18} />
          </div>

          <div className="stat-card-value">
            {summary.total_risks}
          </div>

          <div className="stat-card-label">
            Registered security risks
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Critical / High</span>
            <AlertTriangle size={18} />
          </div>

          <div className="stat-card-value">
            {summary.critical +
              summary.high}
          </div>

          <div className="stat-card-label">
            Risks requiring priority attention
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Open Risks</span>
            <Clock3 size={18} />
          </div>

          <div className="stat-card-value">
            {summary.open_risks}
          </div>

          <div className="stat-card-label">
            Open, monitoring or under treatment
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Residual Risk</span>
            <BarChart3 size={18} />
          </div>

          <div className="stat-card-value">
            {summary.average_residual_score}
          </div>

          <div className="stat-card-label">
            Average residual risk score
          </div>
        </div>
      </div>

      {/* Risk Overview */}
      <div className="dashboard-grid">
        {/* Severity Distribution */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Risk Severity Distribution</h3>

              <span>
                Current risk register breakdown
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(4, minmax(0, 1fr))',
              gap: '14px',
              marginTop: '18px',
            }}
          >
            {[
              {
                label: 'Critical',
                value: summary.critical,
                className: 'critical',
              },
              {
                label: 'High',
                value: summary.high,
                className: 'high',
              },
              {
                label: 'Medium',
                value: summary.medium,
                className: 'medium',
              },
              {
                label: 'Low',
                value: summary.low,
                className: 'low',
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: '18px',
                  border:
                    '1px solid rgba(148, 163, 184, 0.12)',
                  borderRadius: '10px',
                  background:
                    'rgba(15, 23, 42, 0.45)',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    marginBottom: '8px',
                  }}
                >
                  {item.label}
                </div>

                <div
                  className={`soc-category-${item.className}`}
                  style={{
                    fontSize: '26px',
                    fontWeight: 700,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Risk Score Bars */}
          <div
            style={{
              marginTop: '22px',
              display: 'grid',
              gap: '14px',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  marginBottom: '7px',
                  fontSize: '12px',
                }}
              >
                <span>
                  Average Inherent Risk
                </span>

                <strong>
                  {summary.average_inherent_score}
                </strong>
              </div>

              <div
                style={{
                  height: '8px',
                  borderRadius: '999px',
                  background:
                    'rgba(148, 163, 184, 0.12)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(
                      (summary.average_inherent_score /
                        25) *
                        100,
                      100,
                    )}%`,
                    height: '100%',
                    background: '#f97316',
                    borderRadius: '999px',
                  }}
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  marginBottom: '7px',
                  fontSize: '12px',
                }}
              >
                <span>
                  Average Residual Risk
                </span>

                <strong>
                  {summary.average_residual_score}
                </strong>
              </div>

              <div
                style={{
                  height: '8px',
                  borderRadius: '999px',
                  background:
                    'rgba(148, 163, 184, 0.12)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(
                      (summary.average_residual_score /
                        25) *
                        100,
                      100,
                    )}%`,
                    height: '100%',
                    background: '#22d3ee',
                    borderRadius: '999px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Treatment Status */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Risk Treatment Status</h3>

              <span>
                Current treatment lifecycle
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gap: '4px',
              marginTop: '18px',
            }}
          >
            {/* Open / Treatment */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'space-between',
                gap: '20px',
                padding: '14px 16px',
                borderBottom:
                  '1px solid rgba(148, 163, 184, 0.10)',
              }}
            >
              <div
                style={{
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <strong
                  style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontSize: '14px',
                    lineHeight: 1.4,
                    marginBottom: '5px',
                  }}
                >
                  Open / Treatment
                </strong>

                <span
                  style={{
                    display: 'block',
                    color: '#64748b',
                    fontSize: '12px',
                    lineHeight: 1.5,
                  }}
                >
                  Risks requiring active management
                </span>
              </div>

              <strong
                style={{
                  color: '#f8fafc',
                  fontSize: '22px',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                {summary.open_risks}
              </strong>
            </div>

            {/* Accepted */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'space-between',
                gap: '20px',
                padding: '14px 16px',
                borderBottom:
                  '1px solid rgba(148, 163, 184, 0.10)',
              }}
            >
              <div
                style={{
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <strong
                  style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontSize: '14px',
                    lineHeight: 1.4,
                    marginBottom: '5px',
                  }}
                >
                  Accepted
                </strong>

                <span
                  style={{
                    display: 'block',
                    color: '#64748b',
                    fontSize: '12px',
                    lineHeight: 1.5,
                  }}
                >
                  Risks formally accepted by ownership
                </span>
              </div>

              <strong
                style={{
                  color: '#f8fafc',
                  fontSize: '22px',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                {summary.accepted}
              </strong>
            </div>

            {/* Mitigated */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'space-between',
                gap: '20px',
                padding: '14px 16px',
              }}
            >
              <div
                style={{
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <strong
                  style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontSize: '14px',
                    lineHeight: 1.4,
                    marginBottom: '5px',
                  }}
                >
                  Mitigated
                </strong>

                <span
                  style={{
                    display: 'block',
                    color: '#64748b',
                    fontSize: '12px',
                    lineHeight: 1.5,
                  }}
                >
                  Risks with completed mitigation
                </span>
              </div>

              <strong
                style={{
                  color: '#f8fafc',
                  fontSize: '22px',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                {summary.mitigated}
              </strong>
            </div>
          </div>

          {/* Sync Status */}
          <div
            style={{
              marginTop: '20px',
              padding: '16px',
              borderRadius: '10px',
              border:
                '1px solid rgba(34, 211, 238, 0.15)',
              background:
                'rgba(34, 211, 238, 0.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#67e8f9',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={16} />

              Risk register synchronized
            </div>

            <div
              style={{
                marginTop: '7px',
                color: '#94a3b8',
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              Data is being served directly from the
              CyberSentinel risk management API.
            </div>
          </div>
        </div>
      </div>

      {/* Risk Register */}
      <div
        className="dashboard-panel"
        style={{
          marginTop: '20px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div className="panel-header">
          <div>
            <h3>Risk Register</h3>

            <span>
              {filteredRisks.length} of{' '}
              {data.risks.length} risks displayed
            </span>
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(220px, 2fr) repeat(3, minmax(130px, 1fr))',
            gap: '12px',
            marginTop: '18px',
          }}
        >
          {/* Search */}
          <div
            style={{
              position: 'relative',
              minWidth: 0,
            }}
          >
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform:
                  'translateY(-50%)',
                color: '#64748b',
              }}
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search risk, owner, category..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding:
                  '11px 12px 11px 38px',
                borderRadius: '8px',
                border:
                  '1px solid rgba(148, 163, 184, 0.16)',
                background:
                  'rgba(15, 23, 42, 0.7)',
                color: '#e2e8f0',
                outline: 'none',
              }}
            />
          </div>

          {/* Severity */}
          <select
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(
                event.target.value,
              )
            }
            style={{
              width: '100%',
              minWidth: 0,
              padding: '11px 12px',
              borderRadius: '8px',
              border:
                '1px solid rgba(148, 163, 184, 0.16)',
              background: '#0f172a',
              color: '#e2e8f0',
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

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value,
              )
            }
            style={{
              width: '100%',
              minWidth: 0,
              padding: '11px 12px',
              borderRadius: '8px',
              border:
                '1px solid rgba(148, 163, 184, 0.16)',
              background: '#0f172a',
              color: '#e2e8f0',
              outline: 'none',
            }}
          >
            <option value="ALL">
              All Statuses
            </option>

            <option value="OPEN">
              Open
            </option>

            <option value="UNDER_TREATMENT">
              Under Treatment
            </option>

            <option value="MONITORING">
              Monitoring
            </option>

            <option value="ACCEPTED">
              Accepted
            </option>

            <option value="MITIGATED">
              Mitigated
            </option>
          </select>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value,
              )
            }
            style={{
              width: '100%',
              minWidth: 0,
              padding: '11px 12px',
              borderRadius: '8px',
              border:
                '1px solid rgba(148, 163, 184, 0.16)',
              background: '#0f172a',
              color: '#e2e8f0',
              outline: 'none',
            }}
          >
            <option value="ALL">
              All Categories
            </option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div
          style={{
            marginTop: '20px',
            width: '100%',
            overflowX: 'hidden',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              tableLayout: 'fixed',
            }}
          >
            <colgroup>
              <col style={{ width: '29%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '8%' }} />
            </colgroup>

            <thead>
              <tr
                style={{
                  borderBottom:
                    '1px solid rgba(148, 163, 184, 0.12)',
                }}
              >
                {[
                  'Risk',
                  'Category',
                  'Severity',
                  'Inherent',
                  'Residual',
                  'Status',
                  'Owner',
                  'Due Date',
                ].map((heading) => (
                  <th
                    key={heading}
                    style={tableHeaderStyle}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredRisks.map((risk) => (
                <tr
                  key={risk.risk_id}
                  style={{
                    borderBottom:
                      '1px solid rgba(148, 163, 184, 0.08)',
                  }}
                >
                  {/* Risk */}
                  <td
                    style={{
                      padding: '15px 8px',
                      verticalAlign: 'top',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        minWidth: 0,
                      }}
                    >
                      <Link
                        to={`/risks/${risk.risk_id}`}
                        style={{
                          display: 'inline-block',
                          color: '#67e8f9',
                          fontSize: '11px',
                          fontWeight: 700,
                          marginBottom: '5px',
                          textDecoration: 'none',
                        }}
                      >
                        {risk.risk_id}
                      </Link>

                      <Link
                        to={`/risks/${risk.risk_id}`}
                        style={{
                          display: 'block',
                          color: '#e2e8f0',
                          fontWeight: 600,
                          fontSize: '13px',
                          lineHeight: 1.4,
                          overflowWrap:
                            'anywhere',
                          textDecoration: 'none',
                        }}
                      >
                        {risk.title}
                      </Link>

                      <div
                        style={{
                          color: '#64748b',
                          fontSize: '11px',
                          marginTop: '4px',
                          lineHeight: 1.5,
                          overflowWrap:
                            'anywhere',
                        }}
                      >
                        {risk.description}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td
                    style={{
                      padding: '15px 8px',
                      color: '#cbd5e1',
                      fontSize: '12px',
                      lineHeight: 1.4,
                      verticalAlign: 'top',
                      overflowWrap:
                        'anywhere',
                    }}
                  >
                    {risk.category}
                  </td>

                  {/* Severity */}
                  <td
                    style={{
                      padding: '15px 8px',
                      verticalAlign: 'top',
                    }}
                  >
                    <span
                      className={`soc-category-${getSeverityClass(
                        risk.severity,
                      )}`}
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {risk.severity}
                    </span>
                  </td>

                  {/* Inherent */}
                  <td
                    style={{
                      padding: '15px 8px',
                      verticalAlign: 'top',
                    }}
                  >
                    <span
                      className={`soc-category-${getScoreClass(
                        risk.inherent_score,
                      )}`}
                      style={{
                        fontWeight: 700,
                        fontSize: '13px',
                      }}
                    >
                      {risk.inherent_score}
                    </span>
                  </td>

                  {/* Residual */}
                  <td
                    style={{
                      padding: '15px 8px',
                      verticalAlign: 'top',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent:
                            'space-between',
                          alignItems: 'center',
                          gap: '4px',
                          marginBottom: '5px',
                        }}
                      >
                        <span
                          className={`soc-category-${getScoreClass(
                            risk.residual_score,
                          )}`}
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          {risk.residual_score}
                        </span>

                        <span
                          style={{
                            color: '#64748b',
                            fontSize: '10px',
                          }}
                        >
                          / 25
                        </span>
                      </div>

                      <div
                        style={{
                          width: '100%',
                          height: '4px',
                          borderRadius:
                            '999px',
                          background:
                            'rgba(148, 163, 184, 0.12)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${
                              (risk.residual_score /
                                maxResidualScore) *
                              100
                            }%`,
                            height: '100%',
                            background:
                              '#22d3ee',
                            borderRadius:
                              '999px',
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td
                    style={{
                      padding: '15px 8px',
                      verticalAlign: 'top',
                      overflowWrap:
                        'anywhere',
                    }}
                  >
                    <span
                      className={`soc-category-${getStatusClass(
                        risk.status,
                      )}`}
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        lineHeight: 1.4,
                      }}
                    >
                      {formatStatus(
                        risk.status,
                      )}
                    </span>
                  </td>

                  {/* Owner */}
                  <td
                    style={{
                      padding: '15px 8px',
                      color: '#cbd5e1',
                      fontSize: '12px',
                      lineHeight: 1.4,
                      verticalAlign: 'top',
                      overflowWrap:
                        'anywhere',
                      wordBreak:
                        'break-word',
                    }}
                  >
                    {risk.owner}
                  </td>

                  {/* Due Date */}
                  <td
                    style={{
                      padding: '15px 8px',
                      color: '#94a3b8',
                      fontSize: '11px',
                      lineHeight: 1.4,
                      verticalAlign: 'top',
                      overflowWrap:
                        'anywhere',
                    }}
                  >
                    {risk.due_date || '—'}
                  </td>
                </tr>
              ))}

              {filteredRisks.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: '40px',
                      textAlign: 'center',
                      color: '#64748b',
                    }}
                  >
                    <Filter
                      size={22}
                      style={{
                        marginBottom: '8px',
                      }}
                    />

                    <div>
                      No risks match the selected
                      filters.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}