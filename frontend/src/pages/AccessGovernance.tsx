import {
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

type AccessRecord = {
  id: number
  user_id: string
  username: string
  email: string | null
  role: string
  access_level: string
  permissions: string | null
  mfa_enabled: boolean
  privileged_access: boolean
  least_privilege_status: string
  access_review_status: string
  last_reviewed: string | null
  review_due_date: string | null
  account_status: string
  notes: string | null
}

type AccessForm = {
  user_id: string
  username: string
  email: string
  role: string
  access_level: string
  permissions: string
  mfa_enabled: boolean
  privileged_access: boolean
  least_privilege_status: string
  access_review_status: string
  account_status: string
  notes: string
}

const API_URL =
  'http://127.0.0.1:8001/api/access-governance'

const emptyForm: AccessForm = {
  user_id: '',
  username: '',
  email: '',
  role: '',
  access_level: 'Medium',
  permissions: '',
  mfa_enabled: true,
  privileged_access: false,
  least_privilege_status: 'Compliant',
  access_review_status: 'Pending',
  account_status: 'Active',
  notes: '',
}

function AccessGovernance() {
  const [records, setRecords] = useState<AccessRecord[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState<AccessForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const loadRecords = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error(
          'Failed to load access governance records',
        )
      }

      const data: AccessRecord[] =
        await response.json()

      setRecords(data)
    } catch (err) {
      console.error(err)

      setError(
        'Unable to connect to the Access Governance API.',
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadRecords()
  }

  const openAddModal = () => {
    setForm(emptyForm)
    setFormError('')
    setShowAddModal(true)
  }

  const closeAddModal = () => {
    if (saving) {
      return
    }

    setShowAddModal(false)
    setFormError('')
  }

  const updateForm = (
    field: keyof AccessForm,
    value: string | boolean,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setFormError('')

    if (
      !form.user_id.trim() ||
      !form.username.trim() ||
      !form.role.trim()
    ) {
      setFormError(
        'User ID, username, and role are required.',
      )
      return
    }

    try {
      setSaving(true)

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: form.user_id.trim(),
          username: form.username.trim(),
          email: form.email.trim() || null,
          role: form.role.trim(),
          access_level: form.access_level,
          permissions:
            form.permissions.trim() || null,
          mfa_enabled: form.mfa_enabled,
          privileged_access:
            form.privileged_access,
          least_privilege_status:
            form.least_privilege_status,
          access_review_status:
            form.access_review_status,
          account_status: form.account_status,
          notes: form.notes.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
            'Failed to create access record.',
        )
      }

      setShowAddModal(false)
      setForm(emptyForm)

      await loadRecords()
    } catch (err) {
      console.error(err)

      setFormError(
        err instanceof Error
          ? err.message
          : 'Failed to create access record.',
      )
    } finally {
      setSaving(false)
    }
  }

  const filteredRecords = useMemo(() => {
    const value = search.toLowerCase().trim()

    if (!value) {
      return records
    }

    return records.filter((record) =>
      [
        record.user_id,
        record.username,
        record.email,
        record.role,
        record.access_level,
        record.least_privilege_status,
        record.access_review_status,
        record.account_status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(value),
    )
  }, [records, search])

  const totalUsers = records.length

  const privilegedAccounts = records.filter(
    (record) => record.privileged_access,
  ).length

  const mfaEnabled = records.filter(
    (record) => record.mfa_enabled,
  ).length

  const pendingReviews = records.filter(
    (record) =>
      record.access_review_status !== 'Approved',
  ).length

  const mfaCoverage =
    totalUsers > 0
      ? Math.round(
          (mfaEnabled / totalUsers) * 100,
        )
      : 0

  return (
    <div className="page-container">
      <div className="page-header access-governance-header">
        <div>
          <div className="page-eyebrow">
            IDENTITY SECURITY
          </div>

          <h1>Access Governance</h1>

          <p className="page-description">
            Manage identities, privileged access, MFA
            coverage, least-privilege controls, and
            access reviews.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <button
            className="access-governance-action access-governance-action-secondary"
            onClick={handleRefresh}
            type="button"
            disabled={refreshing}
          >
            <RefreshCw
              size={14}
              className={
                refreshing
                  ? 'access-governance-spin'
                  : ''
              }
            />
            Refresh
          </button>

          <button
            className="access-governance-action access-governance-action-primary"
            onClick={openAddModal}
            type="button"
          >
            <Plus size={14} />
            Add Access
          </button>
        </div>
      </div>

      <div className="stats-grid access-governance-stats">
        <div className="stat-card stat-card-cyan access-governance-stat">
          <div className="stat-card-top">
            <span className="stat-card-label">
              Total Users
            </span>

            <div className="stat-card-icon">
              <Users size={17} />
            </div>
          </div>

          <div className="stat-card-value">
            {totalUsers}
          </div>

          <div className="stat-card-description">
            Identities under governance
          </div>
        </div>

        <div className="stat-card stat-card-red access-governance-stat">
          <div className="stat-card-top">
            <span className="stat-card-label">
              Privileged Accounts
            </span>

            <div className="stat-card-icon">
              <UserCog size={17} />
            </div>
          </div>

          <div className="stat-card-value">
            {privilegedAccounts}
          </div>

          <div className="stat-card-description">
            Elevated access accounts
          </div>
        </div>

        <div className="stat-card stat-card-blue access-governance-stat">
          <div className="stat-card-top">
            <span className="stat-card-label">
              MFA Coverage
            </span>

            <div className="stat-card-icon">
              <ShieldCheck size={17} />
            </div>
          </div>

          <div className="stat-card-value">
            {mfaCoverage}%
          </div>

          <div className="stat-card-description">
            Users protected by MFA
          </div>
        </div>

        <div className="stat-card stat-card-amber access-governance-stat">
          <div className="stat-card-top">
            <span className="stat-card-label">
              Pending Reviews
            </span>

            <div className="stat-card-icon">
              <KeyRound size={17} />
            </div>
          </div>

          <div className="stat-card-value">
            {pendingReviews}
          </div>

          <div className="stat-card-description">
            Access reviews requiring attention
          </div>
        </div>
      </div>

      <section className="access-governance-panel">
        <div className="access-governance-panel-header">
          <div>
            <div className="access-governance-panel-title">
              Access Governance Records
            </div>

            <div className="access-governance-panel-description">
              Review and monitor user access across
              the CyberSentinel environment.
            </div>
          </div>
        </div>

        <div className="access-governance-toolbar">
          <div className="access-governance-search">
            <Search size={15} />

            <input
              type="text"
              placeholder="Search users, roles, access..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div
            style={{
              color: '#475569',
              fontSize: '9px',
            }}
          >
            {filteredRecords.length} of{' '}
            {records.length} records
          </div>
        </div>

        {error && (
          <div className="access-governance-error">
            <ShieldCheck size={16} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="access-governance-loading">
            <RefreshCw
              size={24}
              className="access-governance-spin"
            />

            <p>
              Loading access governance data...
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="access-governance-empty">
            <ShieldCheck size={32} />

            <h3>No access records found</h3>

            <p>
              No governance records match your
              current search.
            </p>
          </div>
        ) : (
          <div className="access-governance-table-wrapper">
            <table className="access-governance-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Account Type</th>
                  <th>MFA</th>
                  <th>Access Level</th>
                  <th>Review Status</th>
                  <th>Last Reviewed</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => {
                  const accountType =
                    record.privileged_access
                      ? 'Privileged'
                      : record.username.startsWith(
                            'svc-',
                          )
                        ? 'Service'
                        : 'Standard'

                  return (
                    <tr key={record.id}>
                      <td>
                        <div className="access-governance-user">
                          <div className="access-governance-user-icon">
                            <Users size={15} />
                          </div>

                          <div>
                            <strong>
                              {record.username}
                            </strong>

                            <span>
                              {record.email ??
                                record.user_id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>{record.role}</td>

                      <td>
                        <span className="access-governance-badge">
                          {accountType}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`access-governance-badge ${
                            record.mfa_enabled
                              ? 'access-governance-badge-success'
                              : 'access-governance-badge-danger'
                          }`}
                        >
                          {record.mfa_enabled
                            ? 'Enabled'
                            : 'Disabled'}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`access-governance-badge ${
                            record.access_level ===
                            'Critical'
                              ? 'access-governance-badge-danger'
                              : record.access_level ===
                                  'High'
                                ? 'access-governance-badge-warning'
                                : 'access-governance-badge-info'
                          }`}
                        >
                          {record.access_level}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`access-governance-badge ${
                            record.access_review_status ===
                            'Approved'
                              ? 'access-governance-badge-success'
                              : record.access_review_status ===
                                  'Review Required'
                                ? 'access-governance-badge-danger'
                                : 'access-governance-badge-warning'
                          }`}
                        >
                          {record.access_review_status}
                        </span>
                      </td>

                      <td>
                        {record.last_reviewed
                          ? new Date(
                              record.last_reviewed,
                            ).toLocaleDateString(
                              'en-GB',
                            )
                          : 'Never'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ADD ACCESS MODAL */}

      {showAddModal && (
        <div
          className="access-governance-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeAddModal()
            }
          }}
        >
          <div className="access-governance-modal">
            <div className="access-governance-modal-header">
              <div>
                <div className="page-eyebrow">
                  ACCESS CONTROL
                </div>

                <h2>Add Access Record</h2>

                <p>
                  Create a new identity access record.
                </p>
              </div>

              <button
                className="access-governance-modal-close"
                type="button"
                onClick={closeAddModal}
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="access-governance-form"
            >
              <div className="access-governance-form-grid">
                <label>
                  <span>User ID *</span>

                  <input
                    value={form.user_id}
                    onChange={(event) =>
                      updateForm(
                        'user_id',
                        event.target.value,
                      )
                    }
                    placeholder="USR-006"
                  />
                </label>

                <label>
                  <span>Username *</span>

                  <input
                    value={form.username}
                    onChange={(event) =>
                      updateForm(
                        'username',
                        event.target.value,
                      )
                    }
                    placeholder="analyst02"
                  />
                </label>

                <label>
                  <span>Email</span>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateForm(
                        'email',
                        event.target.value,
                      )
                    }
                    placeholder="analyst02@cybersentinel.local"
                  />
                </label>

                <label>
                  <span>Role *</span>

                  <input
                    value={form.role}
                    onChange={(event) =>
                      updateForm(
                        'role',
                        event.target.value,
                      )
                    }
                    placeholder="Threat Analyst"
                  />
                </label>

                <label>
                  <span>Access Level</span>

                  <select
                    value={form.access_level}
                    onChange={(event) =>
                      updateForm(
                        'access_level',
                        event.target.value,
                      )
                    }
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">
                      Medium
                    </option>
                    <option value="High">High</option>
                    <option value="Critical">
                      Critical
                    </option>
                  </select>
                </label>

                <label>
                  <span>Review Status</span>

                  <select
                    value={
                      form.access_review_status
                    }
                    onChange={(event) =>
                      updateForm(
                        'access_review_status',
                        event.target.value,
                      )
                    }
                  >
                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Approved">
                      Approved
                    </option>

                    <option value="Review Required">
                      Review Required
                    </option>
                  </select>
                </label>

                <label>
                  <span>Least Privilege</span>

                  <select
                    value={
                      form.least_privilege_status
                    }
                    onChange={(event) =>
                      updateForm(
                        'least_privilege_status',
                        event.target.value,
                      )
                    }
                  >
                    <option value="Compliant">
                      Compliant
                    </option>

                    <option value="Review Required">
                      Review Required
                    </option>

                    <option value="Non-Compliant">
                      Non-Compliant
                    </option>
                  </select>
                </label>

                <label>
                  <span>Account Status</span>

                  <select
                    value={form.account_status}
                    onChange={(event) =>
                      updateForm(
                        'account_status',
                        event.target.value,
                      )
                    }
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Disabled">
                      Disabled
                    </option>

                    <option value="Suspended">
                      Suspended
                    </option>
                  </select>
                </label>
              </div>

              <label>
                <span>Permissions</span>

                <textarea
                  value={form.permissions}
                  onChange={(event) =>
                    updateForm(
                      'permissions',
                      event.target.value,
                    )
                  }
                  placeholder="Alert Investigation, Threat Intelligence"
                  rows={3}
                />
              </label>

              <div className="access-governance-toggle-row">
                <label className="access-governance-checkbox">
                  <input
                    type="checkbox"
                    checked={form.mfa_enabled}
                    onChange={(event) =>
                      updateForm(
                        'mfa_enabled',
                        event.target.checked,
                      )
                    }
                  />

                  <span>MFA Enabled</span>
                </label>

                <label className="access-governance-checkbox">
                  <input
                    type="checkbox"
                    checked={
                      form.privileged_access
                    }
                    onChange={(event) =>
                      updateForm(
                        'privileged_access',
                        event.target.checked,
                      )
                    }
                  />

                  <span>Privileged Access</span>
                </label>
              </div>

              <label>
                <span>Notes</span>

                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    updateForm(
                      'notes',
                      event.target.value,
                    )
                  }
                  placeholder="Additional access governance notes..."
                  rows={3}
                />
              </label>

              {formError && (
                <div className="access-governance-form-error">
                  {formError}
                </div>
              )}

              <div className="access-governance-form-actions">
                <button
                  type="button"
                  className="access-governance-action access-governance-action-secondary"
                  onClick={closeAddModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="access-governance-action access-governance-action-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={14}
                        className="access-governance-spin"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Create Access
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccessGovernance