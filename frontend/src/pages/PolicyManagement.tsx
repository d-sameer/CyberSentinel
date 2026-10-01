import { useEffect, useMemo, useState } from 'react'
import { Search, ShieldCheck, Clock3, FileWarning, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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

type PolicyResponse = {
  summary: {
    total_policies: number
    active: number
    under_review: number
    draft: number
    expired: number
    review_scheduled: number
  }
  policies: Policy[]
}

function PolicyManagement() {
  const navigate = useNavigate()

  const [data, setData] = useState<PolicyResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          'http://127.0.0.1:8000/api/policies'
        )

        if (!response.ok) {
          throw new Error('Failed to load policies')
        }

        const result: PolicyResponse = await response.json()
        setData(result)
      } catch (err) {
        console.error(err)
        setError(
          'Unable to load policy data. Make sure the CyberSentinel backend is running.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchPolicies()
  }, [])

  const categories = useMemo(() => {
    if (!data) return []

    return Array.from(
      new Set(data.policies.map((policy) => policy.category))
    ).sort()
  }, [data])

  const filteredPolicies = useMemo(() => {
    if (!data) return []

    const query = search.trim().toLowerCase()

    return data.policies.filter((policy) => {
      const matchesSearch =
        !query ||
        policy.policy_id.toLowerCase().includes(query) ||
        policy.title.toLowerCase().includes(query) ||
        policy.category.toLowerCase().includes(query) ||
        policy.owner.toLowerCase().includes(query)

      const matchesStatus =
        statusFilter === 'ALL' ||
        policy.status === statusFilter

      const matchesCategory =
        categoryFilter === 'ALL' ||
        policy.category === categoryFilter

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      )
    })
  }, [data, search, statusFilter, categoryFilter])

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

  const getReviewClass = (reviewStatus: string) => {
    switch (reviewStatus) {
      case 'OVERDUE':
        return 'status-badge status-badge-danger'

      case 'SCHEDULED':
        return 'status-badge status-badge-success'

      case 'NO_REVIEW_DATE':
        return 'status-badge status-badge-neutral'

      default:
        return 'status-badge status-badge-neutral'
    }
  }

  const getReviewLabel = (reviewStatus: string) => {
    switch (reviewStatus) {
      case 'OVERDUE':
        return 'Overdue'

      case 'SCHEDULED':
        return 'Scheduled'

      case 'NO_REVIEW_DATE':
        return 'No Review Date'

      default:
        return reviewStatus
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">
              GOVERNANCE
            </div>

            <h1>Policy Management</h1>

            <p>
              Manage security policies, ownership, review schedules,
              and governance relationships.
            </p>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Loading policy inventory</h3>
              <p>Retrieving policy data from CyberSentinel API...</p>
            </div>
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
              GOVERNANCE
            </div>

            <h1>Policy Management</h1>

            <p>
              Manage security policies, ownership, review schedules,
              and governance relationships.
            </p>
          </div>

          <div className="page-status">
            <span className="status-dot" />
            Backend connection required
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Policy data unavailable</h3>

              <p>
                {error ||
                  'No policy data was returned by the backend.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            GOVERNANCE
          </div>

          <h1>Policy Management</h1>

          <p>
            Manage security policies, ownership, review schedules,
            frameworks, and governance relationships.
          </p>
        </div>

        <div className="page-status">
          <span className="status-dot" />
          Policy governance operational
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
              Total Policies
            </div>

            <div className="stat-card-value">
              {data.summary.total_policies}
            </div>

            <div className="stat-card-meta">
              Registered governance documents
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">
            <ShieldCheck size={20} />
          </div>

          <div>
            <div className="stat-card-label">
              Active
            </div>

            <div className="stat-card-value">
              {data.summary.active}
            </div>

            <div className="stat-card-meta">
              Currently effective policies
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">
            <Clock3 size={20} />
          </div>

          <div>
            <div className="stat-card-label">
              Under Review
            </div>

            <div className="stat-card-value">
              {data.summary.under_review}
            </div>

            <div className="stat-card-meta">
              Policies undergoing review
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">
            <FileWarning size={20} />
          </div>

          <div>
            <div className="stat-card-label">
              Expired
            </div>

            <div className="stat-card-value">
              {data.summary.expired}
            </div>

            <div className="stat-card-meta">
              Policies requiring attention
            </div>
          </div>
        </div>

      </div>

      {/* GOVERNANCE OVERVIEW */}
      <div className="dashboard-grid">

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Policy Governance Overview</h3>

              <p>
                Current policy lifecycle distribution
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(4, minmax(0, 1fr))',
              gap: '16px',
              marginTop: '18px',
            }}
          >
            <div className="endpoint-summary-card">
              <div className="endpoint-summary-label">
                Active
              </div>

              <div className="endpoint-summary-value">
                {data.summary.active}
              </div>
            </div>

            <div className="endpoint-summary-card">
              <div className="endpoint-summary-label">
                Under Review
              </div>

              <div className="endpoint-summary-value">
                {data.summary.under_review}
              </div>
            </div>

            <div className="endpoint-summary-card">
              <div className="endpoint-summary-label">
                Draft
              </div>

              <div className="endpoint-summary-value">
                {data.summary.draft}
              </div>
            </div>

            <div className="endpoint-summary-card">
              <div className="endpoint-summary-label">
                Expired
              </div>

              <div className="endpoint-summary-value">
                {data.summary.expired}
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Review Management</h3>

              <p>
                Policy review scheduling status
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '34px',
                  fontWeight: 700,
                  color: '#e5e7eb',
                }}
              >
                {data.summary.review_scheduled}
              </div>

              <div
                style={{
                  marginTop: '4px',
                  color: '#94a3b8',
                  fontSize: '13px',
                }}
              >
                Policies with review schedules
              </div>
            </div>

            <Clock3
              size={42}
              style={{
                color: '#22d3ee',
                opacity: 0.8,
              }}
            />
          </div>
        </div>

      </div>

      {/* FILTERS */}
      <div className="dashboard-panel">

        <div className="panel-header">
          <div>
            <h3>Policy Register</h3>

            <p>
              Search and filter the security policy inventory
            </p>
          </div>

          <div
            style={{
              fontSize: '13px',
              color: '#94a3b8',
            }}
          >
            {filteredPolicies.length} of{' '}
            {data.policies.length} policies
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(280px, 1fr) 180px 220px',
            gap: '12px',
            marginTop: '18px',
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
                left: '13px',
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
              placeholder="Search policies..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding:
                  '11px 12px 11px 38px',
                borderRadius: '8px',
                border: '1px solid #263449',
                background: '#0b1220',
                color: '#e5e7eb',
                outline: 'none',
              }}
            />
          </div>

          {/* STATUS */}
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            style={{
              width: '100%',
              padding: '11px 12px',
              borderRadius: '8px',
              border: '1px solid #263449',
              background: '#0b1220',
              color: '#e5e7eb',
              outline: 'none',
            }}
          >
            <option value="ALL">
              All Statuses
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="UNDER_REVIEW">
              Under Review
            </option>

            <option value="DRAFT">
              Draft
            </option>

            <option value="EXPIRED">
              Expired
            </option>
          </select>

          {/* CATEGORY */}
          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
            style={{
              width: '100%',
              padding: '11px 12px',
              borderRadius: '8px',
              border: '1px solid #263449',
              background: '#0b1220',
              color: '#e5e7eb',
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

        {/* TABLE */}
        <div
          style={{
            marginTop: '20px',
            overflowX: 'auto',
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
              <col style={{ width: '10%' }} />
              <col style={{ width: '23%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '7%' }} />
            </colgroup>

            <thead>
              <tr
                style={{
                  borderBottom:
                    '1px solid #263449',
                }}
              >
                {[
                  'Policy ID',
                  'Policy',
                  'Category',
                  'Status',
                  'Owner',
                  'Review Date',
                  'Review',
                  'Action',
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding:
                        '12px 10px',
                      textAlign: 'left',
                      color: '#64748b',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform:
                        'uppercase',
                      letterSpacing:
                        '0.05em',
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredPolicies.map((policy) => (
                <tr
                  key={policy.policy_id}
                  style={{
                    borderBottom:
                      '1px solid rgba(38, 52, 73, 0.65)',
                  }}
                >
                  <td
                    style={{
                      padding: '15px 10px',
                    }}
                  >
                    <button
                      onClick={() =>
                        navigate(
                          `/policies/${policy.policy_id}`
                        )
                      }
                      style={{
                        border: 'none',
                        background: 'transparent',
                        padding: 0,
                        color: '#22d3ee',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {policy.policy_id}
                    </button>
                  </td>

                  <td
                    style={{
                      padding: '15px 10px',
                    }}
                  >
                    <div
                      style={{
                        color: '#e5e7eb',
                        fontWeight: 600,
                        lineHeight: 1.4,
                        wordBreak: 'break-word',
                      }}
                    >
                      {policy.title}
                    </div>

                    <div
                      style={{
                        marginTop: '4px',
                        color: '#64748b',
                        fontSize: '12px',
                      }}
                    >
                      {policy.version}
                    </div>
                  </td>

                  <td
                    style={{
                      padding: '15px 10px',
                      color: '#cbd5e1',
                      fontSize: '13px',
                    }}
                  >
                    {policy.category}
                  </td>

                  <td
                    style={{
                      padding: '15px 10px',
                    }}
                  >
                    <span
                      className={getStatusClass(
                        policy.status
                      )}
                    >
                      {policy.status.replace(
                        /_/g,
                        ' '
                      )}
                    </span>
                  </td>

                  <td
                    style={{
                      padding: '15px 10px',
                      color: '#cbd5e1',
                      fontSize: '13px',
                    }}
                  >
                    {policy.owner}
                  </td>

                  <td
                    style={{
                      padding: '15px 10px',
                      color: '#cbd5e1',
                      fontSize: '13px',
                    }}
                  >
                    {formatDate(
                      policy.review_date
                    )}
                  </td>

                  <td
                    style={{
                      padding: '15px 10px',
                    }}
                  >
                    <span
                      className={getReviewClass(
                        policy.review_status
                      )}
                    >
                      {getReviewLabel(
                        policy.review_status
                      )}
                    </span>
                  </td>

                  <td
                    style={{
                      padding: '15px 10px',
                    }}
                  >
                    <button
                      onClick={() =>
                        navigate(
                          `/policies/${policy.policy_id}`
                        )
                      }
                      title="View policy"
                      style={{
                        width: '34px',
                        height: '34px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '7px',
                        border:
                          '1px solid #263449',
                        background:
                          '#0b1220',
                        color: '#94a3b8',
                        cursor: 'pointer',
                      }}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredPolicies.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: '40px 20px',
                      textAlign: 'center',
                      color: '#64748b',
                    }}
                  >
                    No policies match the selected
                    filters.
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

export default PolicyManagement