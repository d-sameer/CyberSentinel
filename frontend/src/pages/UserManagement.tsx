
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  Activity,
  CheckCircle2,
  CircleUserRound,
  LoaderCircle,
  Plus,
  RefreshCw,
  Shield,
  ShieldCheck,
  UserCog,
  Users,
  XCircle,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import './UserManagement.css'

type UserRole = 'Admin' | 'Analyst' | 'Viewer'

interface ManagedUser {
  id: number
  username: string
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001'

const TOKEN_KEY = 'cybersentinel_access_token'

export default function UserManagement() {
  const { user } = useAuth()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newRole, setNewRole] = useState<UserRole>('Analyst')

  const getHeaders = useCallback((): HeadersInit => {
    const token = sessionStorage.getItem(TOKEN_KEY)
    return {
      Authorization: `Bearer ${token ?? ''}`,
      'Content-Type': 'application/json',
    }
  }, [])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
        headers: getHeaders(),
      })

      if (response.status === 401) {
        throw new Error('Your session has expired. Please log in again.')
      }

      if (response.status === 403) {
        throw new Error('Administrator permissions are required.')
      }

      if (!response.ok) {
        throw new Error(`Unable to load users (${response.status}).`)
      }

      const data: ManagedUser[] = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load users.')
    } finally {
      setLoading(false)
    }
  }, [getHeaders])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const createUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
          role: newRole,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const detail = Array.isArray(data.detail)
          ? data.detail.map((item: { msg?: string }) => item.msg).join(', ')
          : data.detail
        throw new Error(detail || `Unable to create user (${response.status}).`)
      }

      setUsername('')
      setEmail('')
      setPassword('')
      setNewRole('Analyst')
      setShowCreateForm(false)
      setNotice('User account created successfully.')
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create user.')
    } finally {
      setSaving(false)
    }
  }

  const updateRole = async (target: ManagedUser, role: UserRole) => {
    if (target.role === role) return

    setError('')
    setNotice('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/users/${target.id}/role?role=${encodeURIComponent(role)}`,
        { method: 'PATCH', headers: getHeaders() },
      )

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.detail || `Role update failed (${response.status}).`)
      }

      setNotice(`Updated ${target.username}'s role to ${role}.`)
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update role.')
    }
  }

  const toggleStatus = async (target: ManagedUser) => {
    const nextStatus = !target.is_active
    const action = nextStatus ? 'activate' : 'deactivate'

    if (
      !window.confirm(
        `Are you sure you want to ${action} the account "${target.username}"?`,
      )
    ) {
      return
    }

    setError('')
    setNotice('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/users/${target.id}/status?is_active=${nextStatus}`,
        { method: 'PATCH', headers: getHeaders() },
      )

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.detail || `Status update failed (${response.status}).`)
      }

      setNotice(
        `${target.username}'s account has been ${nextStatus ? 'activated' : 'deactivated'}.`,
      )
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update status.')
    }
  }

  const filteredUsers = users.filter((item) => {
    const query = search.toLowerCase()
    const matchesSearch =
      item.username.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query)
    const matchesRole = roleFilter === 'All' || item.role === roleFilter
    return matchesSearch && matchesRole
  })

  const activeCount = users.filter((item) => item.is_active).length
  const adminCount = users.filter((item) => item.role === 'Admin').length

  if (user?.role !== 'Admin') {
    return (
      <section className="um-page">
        <div className="um-message um-error">
          <Shield size={22} />
          <div>
            <strong>Administrator access required</strong>
            <p>Your account cannot manage users.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="um-page">
      <header className="um-header">
        <div>
          <div className="um-eyebrow">
            <ShieldCheck size={15} /> ACCESS CONTROL
          </div>
          <h1>User Management</h1>
          <p>Manage CyberSentinel accounts, permissions and access status.</p>
        </div>

        <button
          className="um-primary-button"
          onClick={() => {
            setShowCreateForm((current) => !current)
            setError('')
          }}
        >
          {showCreateForm ? <XCircle size={17} /> : <Plus size={17} />}
          {showCreateForm ? 'Cancel' : 'Create user'}
        </button>
      </header>

      <div className="um-stat-grid">
        <article className="um-stat-card">
          <span className="um-stat-icon"><Users size={21} /></span>
          <div><span>Total accounts</span><strong>{users.length}</strong></div>
        </article>
        <article className="um-stat-card">
          <span className="um-stat-icon um-green"><CheckCircle2 size={21} /></span>
          <div><span>Active accounts</span><strong>{activeCount}</strong></div>
        </article>
        <article className="um-stat-card">
          <span className="um-stat-icon um-purple"><ShieldCheck size={21} /></span>
          <div><span>Administrators</span><strong>{adminCount}</strong></div>
        </article>
        <article className="um-stat-card">
          <span className="um-stat-icon um-orange"><Activity size={21} /></span>
          <div><span>Inactive accounts</span><strong>{users.length - activeCount}</strong></div>
        </article>
      </div>

      {error && (
        <div className="um-message um-error" role="alert">
          <XCircle size={19} /> <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="um-message um-success" role="status">
          <CheckCircle2 size={19} /> <span>{notice}</span>
        </div>
      )}

      {showCreateForm && (
        <form className="um-create-panel" onSubmit={createUser}>
          <div className="um-panel-heading">
            <div>
              <h2>Create account</h2>
              <p>Create a new user with a specific access role.</p>
            </div>
            <UserCog size={23} />
          </div>

          <div className="um-form-grid">
            <label>
              Username
              <input
                required
                minLength={3}
                maxLength={50}
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="e.g. security_analyst"
              />
            </label>
            <label>
              Email address
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="analyst@company.com"
              />
            </label>
            <label>
              Temporary password
              <input
                required
                minLength={12}
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 12 characters"
              />
            </label>
            <label>
              Access role
              <select
                value={newRole}
                onChange={(event) => setNewRole(event.target.value as UserRole)}
              >
                <option value="Viewer">Viewer</option>
                <option value="Analyst">Analyst</option>
                <option value="Admin">Admin</option>
              </select>
            </label>
          </div>

          <div className="um-form-actions">
            <button
              type="button"
              className="um-secondary-button"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </button>
            <button className="um-primary-button" type="submit" disabled={saving}>
              {saving && <LoaderCircle size={16} className="um-spin" />}
              {saving ? 'Creating...' : 'Create account'}
            </button>
          </div>
        </form>
      )}

      <div className="um-table-panel">
        <div className="um-table-heading">
          <div>
            <h2>Registered users</h2>
            <p>Review accounts and manage access permissions.</p>
          </div>
          <button
            className="um-icon-button"
            onClick={() => void loadUsers()}
            title="Refresh users"
            aria-label="Refresh users"
            disabled={loading}
          >
            <RefreshCw size={17} className={loading ? 'um-spin' : ''} />
          </button>
        </div>

        <div className="um-toolbar">
          <input
            className="um-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search username or email..."
            aria-label="Search users"
          />
          <select
            className="um-role-filter"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            aria-label="Filter by role"
          >
            <option value="All">All roles</option>
            <option value="Admin">Admin</option>
            <option value="Analyst">Analyst</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>

        {loading ? (
          <div className="um-empty-state">
            <LoaderCircle size={24} className="um-spin" />
            <p>Loading user accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="um-empty-state">
            <CircleUserRound size={28} />
            <p>{users.length ? 'No users match your filters.' : 'No user accounts found.'}</p>
          </div>
        ) : (
          <div className="um-table-scroll">
            <table className="um-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="um-user-cell">
                        <span className="um-avatar">
                          {item.username.slice(0, 1).toUpperCase()}
                        </span>
                        <div>
                          <strong>{item.username}</strong>
                          <span>{item.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        className="um-inline-select"
                        aria-label={`Role for ${item.username}`}
                        value={item.role}
                        disabled={item.id === user.id}
                        onChange={(event) =>
                          void updateRole(item, event.target.value as UserRole)
                        }
                      >
                        <option value="Viewer">Viewer</option>
                        <option value="Analyst">Analyst</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`um-status ${item.is_active ? 'is-active' : 'is-inactive'}`}>
                        <span /> {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="um-date">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>
                      <button
                        className={`um-status-button ${item.is_active ? 'deactivate' : 'activate'}`}
                        disabled={item.id === user.id}
                        onClick={() => void toggleStatus(item)}
                      >
                        {item.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <footer className="um-table-footer">
          Showing {filteredUsers.length} of {users.length} accounts
        </footer>
      </div>

      <p className="um-security-note">
        <ShieldCheck size={15} />
        User administration is restricted to administrators. Role and account
        status changes are validated by the backend.
      </p>
    </section>
  )
}
