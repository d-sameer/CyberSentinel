import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileWarning,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'

type SecurityException = {
  exception_id: string
  title: string
  description: string
  category: string
  status: string
  severity: string
  requester: string
  owner: string
  approver: string
  justification: string
  compensating_controls: string
  requested_date: string | null
  expiry_date: string | null
  expiry_status: string
  related_policy_ids: string[]
  related_risk_ids: string[]
  related_control_ids: string[]
  related_vulnerability_ids: string[]
  created_at: string | null
  updated_at: string | null
}

type ExceptionResponse = {
  summary: {
    total_exceptions: number
    requested: number
    under_review: number
    approved: number
    rejected: number
    expired: number
    revoked: number
    overdue: number
    critical: number
    high: number
  }
  exceptions: SecurityException[]
}

const API_BASE = 'http://127.0.0.1:8000'

function statusClass(status: string) {
  switch (status) {
    case 'APPROVED':
      return 'status-badge status-active'

    case 'UNDER_REVIEW':
      return 'status-badge status-warning'

    case 'REQUESTED':
      return 'status-badge status-info'

    case 'REJECTED':
    case 'REVOKED':
    case 'EXPIRED':
      return 'status-badge status-danger'

    default:
      return 'status-badge'
  }
}

function severityClass(severity: string) {
  switch (severity) {
    case 'CRITICAL':
      return 'status-badge status-danger'

    case 'HIGH':
      return 'status-badge status-warning'

    case 'MEDIUM':
      return 'status-badge status-info'

    case 'LOW':
      return 'status-badge status-active'

    default:
      return 'status-badge'
  }
}

function formatDate(value: string | null) {
  if (!value) return '—'

  const date = new Date(`${value}T00:00:00`)

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function SecurityExceptions() {
  const [data, setData] = useState<ExceptionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  const loadExceptions = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `${API_BASE}/api/exceptions`
      )

      if (!response.ok) {
        throw new Error(
          'Failed to load security exceptions'
        )
      }

      const result: ExceptionResponse =
        await response.json()

      setData(result)
    } catch (err) {
      console.error(err)

      setError(
        'Unable to load security exceptions. Make sure the CyberSentinel backend is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExceptions()
  }, [])

  const categories = useMemo(() => {
    if (!data) return []

    return Array.from(
      new Set(
        data.exceptions.map(
          (item) => item.category
        )
      )
    ).sort()
  }, [data])

  const filteredExceptions = useMemo(() => {
    if (!data) return []

    const query = search.trim().toLowerCase()

    return data.exceptions.filter((item) => {
      const matchesSearch =
        !query ||
        item.exception_id
          .toLowerCase()
          .includes(query) ||
        item.title
          .toLowerCase()
          .includes(query) ||
        item.category
          .toLowerCase()
          .includes(query) ||
        item.requester
          .toLowerCase()
          .includes(query) ||
        item.owner
          .toLowerCase()
          .includes(query)

      const matchesStatus =
        statusFilter === 'ALL' ||
        item.status === statusFilter

      const matchesSeverity =
        severityFilter === 'ALL' ||
        item.severity === severityFilter

      const matchesCategory =
        categoryFilter === 'ALL' ||
        item.category === categoryFilter

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSeverity &&
        matchesCategory
      )
    })
  }, [
    data,
    search,
    statusFilter,
    severityFilter,
    categoryFilter,
  ])

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">
              GRC / EXCEPTIONS
            </div>

            <h1>Security Exceptions</h1>

            <p>
              Loading security exception and waiver
              records...
            </p>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <span>
              Loading exception inventory
            </span>

            <RefreshCw
              size={18}
              className="spin"
            />
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
              GRC / EXCEPTIONS
            </div>

            <h1>Security Exceptions</h1>

            <p>
              Governance and risk exceptions requiring
              controlled review and expiration
              management.
            </p>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <span>
              Exception service unavailable
            </span>
          </div>

          <div
            style={{
              padding: '24px',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertTriangle size={20} />

            {error ||
              'No exception data available.'}
          </div>

          <div
            style={{
              padding: '0 24px 24px',
            }}
          >
            <button
              className="secondary-button"
              onClick={loadExceptions}
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const summary = data.summary

  return (
    <div className="page-container">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            GRC / EXCEPTIONS
          </div>

          <h1>Security Exceptions</h1>

          <p>
            Manage temporary security policy
            deviations, compensating controls,
            approval status, and exception
            expiration.
          </p>
        </div>

        <div className="page-status">
          <ShieldCheck size={16} />
          Exception Governance Active
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-label">
            <FileWarning size={16} />
            Total Exceptions
          </div>

          <div className="stat-card-value">
            {summary.total_exceptions}
          </div>

          <div className="stat-card-meta">
            Active exception inventory
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">
            <Clock3 size={16} />
            Under Review
          </div>

          <div className="stat-card-value">
            {summary.under_review}
          </div>

          <div className="stat-card-meta">
            Awaiting governance review
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">
            <ShieldCheck size={16} />
            Approved
          </div>

          <div className="stat-card-value">
            {summary.approved}
          </div>

          <div className="stat-card-meta">
            Approved temporary deviations
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">
            <AlertTriangle size={16} />
            Overdue
          </div>

          <div className="stat-card-value">
            {summary.overdue}
          </div>

          <div className="stat-card-meta">
            Past expiration date
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">
            <ShieldAlert size={16} />
            Critical
          </div>

          <div className="stat-card-value">
            {summary.critical}
          </div>

          <div className="stat-card-meta">
            Critical-severity exceptions
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">
            <AlertTriangle size={16} />
            High
          </div>

          <div className="stat-card-value">
            {summary.high}
          </div>

          <div className="stat-card-meta">
            High-severity exceptions
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div
        className="dashboard-panel"
        style={{
          marginTop: '20px',
        }}
      >
        <div className="panel-header">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Filter size={17} />
            Exception Filters
          </div>

          <button
            className="secondary-button"
            onClick={loadExceptions}
            title="Refresh exceptions"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(220px, 1.5fr) repeat(3, minmax(140px, 1fr))',
            gap: '12px',
            padding: '18px',
          }}
        >
          {/* SEARCH */}
          <div
            style={{
              position: 'relative',
            }}
          >
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform:
                  'translateY(-50%)',
                opacity: 0.55,
              }}
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search exceptions..."
              style={{
                width: '100%',
                padding:
                  '11px 12px 11px 38px',
                borderRadius: '8px',
                border:
                  '1px solid rgba(148, 163, 184, 0.18)',
                background:
                  'rgba(15, 23, 42, 0.7)',
                color: 'inherit',
                outline: 'none',
              }}
            />
          </div>

          {/* STATUS */}
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            style={{
              padding: '11px 12px',
              borderRadius: '8px',
              border:
                '1px solid rgba(148, 163, 184, 0.18)',
              background:
                'rgba(15, 23, 42, 0.7)',
              color: 'inherit',
            }}
          >
            <option value="ALL">
              All Statuses
            </option>

            <option value="REQUESTED">
              Requested
            </option>

            <option value="UNDER_REVIEW">
              Under Review
            </option>

            <option value="APPROVED">
              Approved
            </option>

            <option value="REJECTED">
              Rejected
            </option>

            <option value="EXPIRED">
              Expired
            </option>

            <option value="REVOKED">
              Revoked
            </option>
          </select>

          {/* SEVERITY */}
          <select
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(
                event.target.value
              )
            }
            style={{
              padding: '11px 12px',
              borderRadius: '8px',
              border:
                '1px solid rgba(148, 163, 184, 0.18)',
              background:
                'rgba(15, 23, 42, 0.7)',
              color: 'inherit',
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

          {/* CATEGORY */}
          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value
              )
            }
            style={{
              padding: '11px 12px',
              borderRadius: '8px',
              border:
                '1px solid rgba(148, 163, 184, 0.18)',
              background:
                'rgba(15, 23, 42, 0.7)',
              color: 'inherit',
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
      </div>

      {/* EXCEPTION INVENTORY */}
      <div
        className="dashboard-panel"
        style={{
          marginTop: '20px',
        }}
      >
        <div className="panel-header">
          <div>
            <span>
              Exception Inventory
            </span>

            <span
              style={{
                marginLeft: '10px',
                opacity: 0.55,
                fontSize: '12px',
              }}
            >
              {filteredExceptions.length} of{' '}
              {data.exceptions.length}
            </span>
          </div>
        </div>

        {filteredExceptions.length === 0 ? (
          <div
            style={{
              padding: '42px 24px',
              textAlign: 'center',
              opacity: 0.65,
            }}
          >
            No security exceptions match the
            current filters.
          </div>
        ) : (
          <div
            style={{
              overflowX: 'auto',
              position: 'relative',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '900px',
              }}
            >
              <thead>
                <tr>
                  {[
                    'Exception',
                    'Category',
                    'Severity',
                    'Status',
                    'Owner',
                    'Expiry',
                    'Relationships',
                    '',
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        textAlign: 'left',
                        padding:
                          '13px 16px',
                        fontSize: '11px',
                        letterSpacing:
                          '0.08em',
                        textTransform:
                          'uppercase',
                        opacity: 0.5,
                        borderBottom:
                          '1px solid rgba(148, 163, 184, 0.12)',
                        whiteSpace:
                          'nowrap',

                        ...(heading === ''
                          ? {
                              position:
                                'sticky',
                              right: 0,
                              background:
                                '#0b1220',
                              zIndex: 3,
                              boxShadow:
                                '-8px 0 12px rgba(2, 6, 23, 0.35)',
                            }
                          : {}),
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredExceptions.map(
                  (item) => {
                    const isOverdue =
                      item.expiry_status ===
                      'OVERDUE'

                    return (
                      <tr
                        key={
                          item.exception_id
                        }
                        style={{
                          borderBottom:
                            '1px solid rgba(148, 163, 184, 0.08)',
                        }}
                      >
                        {/* EXCEPTION */}
                        <td
                          style={{
                            padding:
                              '15px 16px',
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              marginBottom:
                                '4px',
                            }}
                          >
                            {item.title}
                          </div>

                          <div
                            style={{
                              fontSize:
                                '12px',
                              opacity: 0.5,
                            }}
                          >
                            {
                              item.exception_id
                            }
                          </div>
                        </td>

                        {/* CATEGORY */}
                        <td
                          style={{
                            padding:
                              '15px 16px',
                          }}
                        >
                          <span
                            style={{
                              fontSize:
                                '13px',
                            }}
                          >
                            {item.category}
                          </span>
                        </td>

                        {/* SEVERITY */}
                        <td
                          style={{
                            padding:
                              '15px 16px',
                          }}
                        >
                          <span
                            className={severityClass(
                              item.severity
                            )}
                          >
                            {item.severity}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td
                          style={{
                            padding:
                              '15px 16px',
                          }}
                        >
                          <span
                            className={statusClass(
                              item.status
                            )}
                          >
                            {item.status.replace(
                              '_',
                              ' '
                            )}
                          </span>
                        </td>

                        {/* OWNER */}
                        <td
                          style={{
                            padding:
                              '15px 16px',
                          }}
                        >
                          <div
                            style={{
                              fontSize:
                                '13px',
                            }}
                          >
                            {item.owner}
                          </div>

                          <div
                            style={{
                              fontSize:
                                '11px',
                              opacity: 0.45,
                              marginTop:
                                '3px',
                            }}
                          >
                            Approver:{' '}
                            {item.approver}
                          </div>
                        </td>

                        {/* EXPIRY */}
                        <td
                          style={{
                            padding:
                              '15px 16px',
                          }}
                        >
                          <div
                            style={{
                              display:
                                'flex',
                              alignItems:
                                'center',
                              gap: '6px',
                              color:
                                isOverdue
                                  ? '#fca5a5'
                                  : undefined,
                            }}
                          >
                            <CalendarClock
                              size={14}
                            />

                            {formatDate(
                              item.expiry_date
                            )}
                          </div>

                          <div
                            style={{
                              fontSize:
                                '11px',
                              opacity: 0.5,
                              marginTop:
                                '4px',
                            }}
                          >
                            {item.expiry_status.replace(
                              '_',
                              ' '
                            )}
                          </div>
                        </td>

                        {/* RELATIONSHIPS */}
                        <td
                          style={{
                            padding:
                              '15px 16px',
                          }}
                        >
                          <div
                            style={{
                              display:
                                'flex',
                              gap: '5px',
                              flexWrap:
                                'wrap',
                              maxWidth:
                                '220px',
                            }}
                          >
                            {item
                              .related_policy_ids
                              .length >
                              0 && (
                              <span
                                style={{
                                  fontSize:
                                    '10px',
                                  padding:
                                    '3px 6px',
                                  borderRadius:
                                    '5px',
                                  background:
                                    'rgba(34, 211, 238, 0.08)',
                                  border:
                                    '1px solid rgba(34, 211, 238, 0.15)',
                                }}
                              >
                                {
                                  item
                                    .related_policy_ids
                                    .length
                                }{' '}
                                Policy
                              </span>
                            )}

                            {item
                              .related_risk_ids
                              .length >
                              0 && (
                              <span
                                style={{
                                  fontSize:
                                    '10px',
                                  padding:
                                    '3px 6px',
                                  borderRadius:
                                    '5px',
                                  background:
                                    'rgba(168, 85, 247, 0.08)',
                                  border:
                                    '1px solid rgba(168, 85, 247, 0.15)',
                                }}
                              >
                                {
                                  item
                                    .related_risk_ids
                                    .length
                                }{' '}
                                Risk
                              </span>
                            )}

                            {item
                              .related_control_ids
                              .length >
                              0 && (
                              <span
                                style={{
                                  fontSize:
                                    '10px',
                                  padding:
                                    '3px 6px',
                                  borderRadius:
                                    '5px',
                                  background:
                                    'rgba(34, 197, 94, 0.08)',
                                  border:
                                    '1px solid rgba(34, 197, 94, 0.15)',
                                }}
                              >
                                {
                                  item
                                    .related_control_ids
                                    .length
                                }{' '}
                                Control
                              </span>
                            )}

                            {item
                              .related_vulnerability_ids
                              .length >
                              0 && (
                              <span
                                style={{
                                  fontSize:
                                    '10px',
                                  padding:
                                    '3px 6px',
                                  borderRadius:
                                    '5px',
                                  background:
                                    'rgba(245, 158, 11, 0.08)',
                                  border:
                                    '1px solid rgba(245, 158, 11, 0.15)',
                                }}
                              >
                                {
                                  item
                                    .related_vulnerability_ids
                                    .length
                                }{' '}
                                Vulnerability
                              </span>
                            )}
                          </div>
                        </td>

                        {/* STICKY VIEW COLUMN */}
                        <td
                          style={{
                            padding:
                              '15px 16px',
                            position:
                              'sticky',
                            right: 0,
                            background:
                              '#0b1220',
                            zIndex: 2,
                            boxShadow:
                              '-8px 0 12px rgba(2, 6, 23, 0.35)',
                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          <Link
                            to={`/exceptions/${item.exception_id}`}
                            className="secondary-button"
                            style={{
                              display:
                                'inline-flex',
                              alignItems:
                                'center',
                              justifyContent:
                                'center',
                              textDecoration:
                                'none',
                              whiteSpace:
                                'nowrap',
                              minWidth:
                                '58px',
                            }}
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    )
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* GOVERNANCE SUMMARY */}
      <div
        className="dashboard-grid"
        style={{
          marginTop: '20px',
        }}
      >
        {/* APPROVAL STATE */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={17} />
              Approval State
            </div>
          </div>

          <div
            style={{
              padding: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                padding: '10px 0',
                borderBottom:
                  '1px solid rgba(148, 163, 184, 0.08)',
              }}
            >
              <span>Approved</span>

              <strong>
                {summary.approved}
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                padding: '10px 0',
                borderBottom:
                  '1px solid rgba(148, 163, 184, 0.08)',
              }}
            >
              <span>
                Under Review
              </span>

              <strong>
                {summary.under_review}
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                padding: '10px 0',
                borderBottom:
                  '1px solid rgba(148, 163, 184, 0.08)',
              }}
            >
              <span>Requested</span>

              <strong>
                {summary.requested}
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                padding: '10px 0',
              }}
            >
              <span>
                Rejected / Revoked
              </span>

              <strong>
                {summary.rejected +
                  summary.revoked}
              </strong>
            </div>
          </div>
        </div>

        {/* EXPIRATION MONITORING */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <XCircle size={17} />
              Expiration Monitoring
            </div>
          </div>

          <div
            style={{
              padding: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                padding: '10px 0',
                borderBottom:
                  '1px solid rgba(148, 163, 184, 0.08)',
              }}
            >
              <span>Overdue</span>

              <strong>
                {summary.overdue}
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                padding: '10px 0',
                borderBottom:
                  '1px solid rgba(148, 163, 184, 0.08)',
              }}
            >
              <span>Expired</span>

              <strong>
                {summary.expired}
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                padding: '10px 0',
              }}
            >
              <span>
                Active / Reviewable
              </span>

              <strong>
                {summary.total_exceptions -
                  summary.expired -
                  summary.revoked}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}