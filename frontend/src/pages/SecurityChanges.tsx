import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileCog,
  Search,
  ShieldAlert,
  XCircle,
} from 'lucide-react'

type SecurityChange = {
  id: number
  change_id: string
  title: string
  description: string
  change_type: string
  category: string
  priority: string
  risk_level: string
  status: string
  approval_status: string
  implementation_status: string
  environment: string
  asset_id: string
  asset_name: string
  requester: string
  owner: string
  business_impact: string
  security_impact: string
  implementation_plan: string
  validation_plan: string
  rollback_plan: string
  scheduled_start: string | null
  scheduled_end: string | null
  related_configuration_ids: string[]
  related_incident_ids: string[]
  related_vulnerability_ids: string[]
  related_alert_ids: string[]
  created_at: string
  updated_at: string
}

type ChangeSummary = {
  total: number
  approved: number
  pending_approval: number
  rejected: number
  completed: number
  in_progress: number
  planned: number
  failed: number
  rolled_back: number
  critical: number
  high: number
  medium: number
  low: number
}

type SecurityChangesResponse = {
  summary: ChangeSummary
  changes: SecurityChange[]
}

const API_URL = 'http://127.0.0.1:8001/api/security-changes'

function statusClass(status: string) {
  const value = status.toUpperCase()

  if (value === 'COMPLETED') return 'status-success'
  if (value === 'IN_PROGRESS') return 'status-warning'
  if (value === 'PLANNED') return 'status-info'
  if (value === 'FAILED') return 'status-danger'
  if (value === 'ROLLED_BACK') return 'status-danger'
  if (value === 'PENDING') return 'status-warning'

  return 'status-neutral'
}

function riskClass(risk: string) {
  const value = risk.toUpperCase()

  if (value === 'CRITICAL') return 'status-danger'
  if (value === 'HIGH') return 'status-warning'
  if (value === 'MEDIUM') return 'status-info'
  if (value === 'LOW') return 'status-success'

  return 'status-neutral'
}

function approvalClass(status: string) {
  const value = status.toUpperCase()

  if (value === 'APPROVED') return 'status-success'
  if (value === 'PENDING') return 'status-warning'
  if (value === 'REJECTED') return 'status-danger'

  return 'status-neutral'
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatDate(value: string | null) {
  if (!value) return 'Not scheduled'

  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function SecurityChanges() {
  const [data, setData] = useState<SecurityChangesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [approvalFilter, setApprovalFilter] = useState('ALL')
  const [riskFilter, setRiskFilter] = useState('ALL')

  useEffect(() => {
    const loadChanges = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(API_URL)

        if (!response.ok) {
          throw new Error('Failed to load security changes')
        }

        const result: SecurityChangesResponse = await response.json()
        setData(result)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load security changes',
        )
      } finally {
        setLoading(false)
      }
    }

    loadChanges()
  }, [])

  const changes = data?.changes ?? []
  const summary = data?.summary

  const changeTypes = useMemo(() => {
    return Array.from(
      new Set(changes.map((change) => change.change_type)),
    ).sort()
  }, [changes])

  const filteredChanges = useMemo(() => {
    const query = search.trim().toLowerCase()

    return changes.filter((change) => {
      const matchesSearch =
        !query ||
        change.change_id.toLowerCase().includes(query) ||
        change.title.toLowerCase().includes(query) ||
        change.asset_id.toLowerCase().includes(query) ||
        change.asset_name.toLowerCase().includes(query) ||
        change.owner.toLowerCase().includes(query)

      const matchesType =
        typeFilter === 'ALL' ||
        change.change_type === typeFilter

      const matchesStatus =
        statusFilter === 'ALL' ||
        change.status === statusFilter

      const matchesApproval =
        approvalFilter === 'ALL' ||
        change.approval_status === approvalFilter

      const matchesRisk =
        riskFilter === 'ALL' ||
        change.risk_level === riskFilter

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesApproval &&
        matchesRisk
      )
    })
  }, [
    changes,
    search,
    typeFilter,
    statusFilter,
    approvalFilter,
    riskFilter,
  ])

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            SECURITY OPERATIONS
          </div>

          <h1>Security Change Management</h1>

          <p>
            Manage, assess, approve, implement, and track
            security-related infrastructure and configuration changes.
          </p>
        </div>

        <div className="page-status">
          <FileCog size={16} />
          Change Control Center
        </div>
      </div>

      {error && (
        <div
          className="dashboard-panel"
          style={{
            marginBottom: '20px',
            borderColor: 'rgba(239, 68, 68, 0.35)',
          }}
        >
          <div
            style={{
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
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
          <div className="stat-card-header">
            <span>Total Changes</span>
            <FileCog size={18} />
          </div>

          <div className="stat-card-value">
            {loading ? '—' : summary?.total ?? 0}
          </div>

          <div className="stat-card-label">
            Change requests tracked
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Pending Approval</span>
            <Clock3 size={18} />
          </div>

          <div className="stat-card-value">
            {loading ? '—' : summary?.pending_approval ?? 0}
          </div>

          <div className="stat-card-label">
            Awaiting approval
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>In Progress</span>
            <ShieldAlert size={18} />
          </div>

          <div className="stat-card-value">
            {loading ? '—' : summary?.in_progress ?? 0}
          </div>

          <div className="stat-card-label">
            Changes being implemented
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Completed</span>
            <CheckCircle2 size={18} />
          </div>

          <div className="stat-card-value">
            {loading ? '—' : summary?.completed ?? 0}
          </div>

          <div className="stat-card-label">
            Successfully implemented
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '20px' }}>
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Change Status</h3>
              <span>Current implementation lifecycle</span>
            </div>
          </div>

          <div
            style={{
              padding: '20px',
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '14px',
            }}
          >
            <div className="endpoint-summary-card">
              <div className="endpoint-summary-value">
                {summary?.planned ?? 0}
              </div>
              <div className="endpoint-summary-label">
                Planned
              </div>
            </div>

            <div className="endpoint-summary-card">
              <div className="endpoint-summary-value">
                {summary?.in_progress ?? 0}
              </div>
              <div className="endpoint-summary-label">
                In Progress
              </div>
            </div>

            <div className="endpoint-summary-card">
              <div className="endpoint-summary-value">
                {summary?.completed ?? 0}
              </div>
              <div className="endpoint-summary-label">
                Completed
              </div>
            </div>

            <div className="endpoint-summary-card">
              <div className="endpoint-summary-value">
                {summary?.failed ?? 0}
              </div>
              <div className="endpoint-summary-label">
                Failed
              </div>
            </div>

            <div className="endpoint-summary-card">
              <div className="endpoint-summary-value">
                {summary?.rolled_back ?? 0}
              </div>
              <div className="endpoint-summary-label">
                Rolled Back
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Risk Distribution</h3>
              <span>Risk profile of tracked changes</span>
            </div>
          </div>

          <div
            style={{
              padding: '20px',
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '14px',
            }}
          >
            <div className="endpoint-summary-card">
              <div
                className="endpoint-summary-value"
                style={{ color: '#f87171' }}
              >
                {summary?.critical ?? 0}
              </div>
              <div className="endpoint-summary-label">
                Critical
              </div>
            </div>

            <div className="endpoint-summary-card">
              <div
                className="endpoint-summary-value"
                style={{ color: '#fbbf24' }}
              >
                {summary?.high ?? 0}
              </div>
              <div className="endpoint-summary-label">
                High
              </div>
            </div>

            <div className="endpoint-summary-card">
              <div className="endpoint-summary-value">
                {summary?.medium ?? 0}
              </div>
              <div className="endpoint-summary-label">
                Medium
              </div>
            </div>

            <div className="endpoint-summary-card">
              <div
                className="endpoint-summary-value"
                style={{ color: '#4ade80' }}
              >
                {summary?.low ?? 0}
              </div>
              <div className="endpoint-summary-label">
                Low
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="panel-header">
          <div>
            <h3>Security Change Inventory</h3>
            <span>
              {filteredChanges.length} of {changes.length} changes
            </span>
          </div>
        </div>

        <div
          style={{
            padding: '18px',
            display: 'grid',
            gridTemplateColumns:
              'minmax(220px, 2fr) repeat(4, minmax(150px, 1fr))',
            gap: '12px',
          }}
        >
          <div style={{ position: 'relative' }}>
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: 0.55,
              }}
            />

            <input
              type="text"
              placeholder="Search changes, assets, owners..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              style={{
                width: '100%',
                padding: '11px 12px 11px 38px',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.18)',
                background: 'rgba(15, 23, 42, 0.72)',
                color: '#e2e8f0',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
            style={selectStyle}
          >
            <option value="ALL">All Types</option>

            {changeTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            style={selectStyle}
          >
            <option value="ALL">All Status</option>
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="ROLLED_BACK">Rolled Back</option>
          </select>

          <select
            value={approvalFilter}
            onChange={(event) =>
              setApprovalFilter(event.target.value)
            }
            style={selectStyle}
          >
            <option value="ALL">All Approvals</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={riskFilter}
            onChange={(event) =>
              setRiskFilter(event.target.value)
            }
            style={selectStyle}
          >
            <option value="ALL">All Risk</option>
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
            }}
          >
            <thead>
              <tr
                style={{
                  borderTop:
                    '1px solid rgba(148, 163, 184, 0.12)',
                  borderBottom:
                    '1px solid rgba(148, 163, 184, 0.12)',
                }}
              >
                <th style={thStyle}>Change</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Asset</th>
                <th style={thStyle}>Risk</th>
                <th style={thStyle}>Approval</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Schedule</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    style={emptyStyle}
                  >
                    Loading security changes...
                  </td>
                </tr>
              ) : filteredChanges.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={emptyStyle}
                  >
                    No security changes match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredChanges.map((change) => (
                  <tr
                    key={change.change_id}
                    style={{
                      borderBottom:
                        '1px solid rgba(148, 163, 184, 0.08)',
                    }}
                  >
                    <td style={tdStyle}>
                      <Link
                        to={`/security-changes/${change.change_id}`}
                        style={{
                          color: '#67e8f9',
                          textDecoration: 'none',
                          fontWeight: 700,
                        }}
                      >
                        {change.change_id}
                      </Link>

                      <div
                        style={{
                          marginTop: '5px',
                          color: '#cbd5e1',
                          fontWeight: 600,
                        }}
                      >
                        {change.title}
                      </div>

                      <div
                        style={{
                          marginTop: '4px',
                          color: '#64748b',
                          fontSize: '12px',
                        }}
                      >
                        {change.category}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      {change.change_type}
                    </td>

                    <td style={tdStyle}>
                      <Link
                        to={`/assets/${change.asset_id}`}
                        style={{
                          color: '#94a3b8',
                          textDecoration: 'none',
                        }}
                      >
                        {change.asset_id}
                      </Link>

                      <div
                        style={{
                          marginTop: '4px',
                          color: '#64748b',
                          fontSize: '12px',
                        }}
                      >
                        {change.asset_name}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <span
                        className={`status-pill ${riskClass(
                          change.risk_level,
                        )}`}
                      >
                        {change.risk_level}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      <span
                        className={`status-pill ${approvalClass(
                          change.approval_status,
                        )}`}
                      >
                        {formatStatus(
                          change.approval_status,
                        )}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      <span
                        className={`status-pill ${statusClass(
                          change.status,
                        )}`}
                      >
                        {formatStatus(change.status)}
                      </span>
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        minWidth: '190px',
                      }}
                    >
                      <div
                        style={{
                          color: '#cbd5e1',
                          fontSize: '12px',
                        }}
                      >
                        {formatDate(change.scheduled_start)}
                      </div>

                      {change.scheduled_end && (
                        <div
                          style={{
                            marginTop: '4px',
                            color: '#64748b',
                            fontSize: '11px',
                          }}
                        >
                          Ends {formatDate(change.scheduled_end)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="dashboard-panel"
        style={{
          marginTop: '20px',
          minHeight: '0',
          height: 'auto',
        }}
      >
        <div
          style={{
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#94a3b8',
          }}
        >
          <XCircle size={17} />
          <span style={{ fontSize: '13px' }}>
            Failed and rolled-back changes require documented
            validation and rollback evidence before closure.
          </span>
        </div>
      </div>
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 12px',
  borderRadius: '8px',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  background: 'rgba(15, 23, 42, 0.72)',
  color: '#e2e8f0',
  outline: 'none',
}

const thStyle: React.CSSProperties = {
  padding: '13px 16px',
  textAlign: 'left',
  color: '#64748b',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  padding: '15px 16px',
  color: '#cbd5e1',
  fontSize: '13px',
  verticalAlign: 'top',
}

const emptyStyle: React.CSSProperties = {
  padding: '40px 20px',
  textAlign: 'center',
  color: '#64748b',
}