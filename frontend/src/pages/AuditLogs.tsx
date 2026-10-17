import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Filter,
  KeyRound,
  Monitor,
  Search,
  ShieldAlert,
  User,
  UserCog,
} from 'lucide-react'

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type AuditCategory =
  | 'AUTH'
  | 'ADMIN'
  | 'SECURITY'
  | 'SYSTEM'

type AuditSeverity =
  | 'INFO'
  | 'WARNING'
  | 'HIGH'

type AuditStatus =
  | 'SUCCESS'
  | 'REVIEW'
  | 'BLOCKED'
  | 'REVIEWED'

type AuditLog = {
  id: string
  timestamp: string
  action: string
  category: AuditCategory
  severity: AuditSeverity
  status: AuditStatus
  user: string
  endpoint: string
  sourceIp: string
  description: string
}

type RawAuditLog = Record<string, unknown>

const asText = (value: unknown, fallback = '—'): string => {
  if (value === null || value === undefined || value === '') return fallback
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return fallback
}

const firstValue = (item: RawAuditLog, ...keys: string[]): unknown => {
  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null && item[key] !== '') return item[key]
  }
  return undefined
}

const normalizeCategory = (value: unknown): AuditCategory => {
  const normalized = asText(value, 'SYSTEM').trim().toUpperCase().replace(/[ -]+/g, '_')
  if (['AUTH', 'AUTHENTICATION', 'LOGIN'].includes(normalized)) return 'AUTH'
  if (['ADMIN', 'ADMINISTRATIVE', 'ADMINISTRATION'].includes(normalized)) return 'ADMIN'
  if (['SECURITY', 'THREAT', 'DETECTION'].includes(normalized)) return 'SECURITY'
  return 'SYSTEM'
}

const normalizeSeverity = (value: unknown): AuditSeverity => {
  const normalized = asText(value, 'INFO').trim().toUpperCase()
  if (['CRITICAL', 'HIGH', 'SEVERE'].includes(normalized)) return 'HIGH'
  if (['WARNING', 'WARN', 'MEDIUM', 'MODERATE'].includes(normalized)) return 'WARNING'
  return 'INFO'
}

const normalizeStatus = (value: unknown): AuditStatus => {
  const normalized = asText(value, 'SUCCESS').trim().toUpperCase().replace(/[ -]+/g, '_')
  if (['BLOCKED', 'DENIED', 'FAILED', 'FAILURE'].includes(normalized)) return 'BLOCKED'
  if (['REVIEWED', 'RESOLVED', 'CLOSED'].includes(normalized)) return 'REVIEWED'
  if (['REVIEW', 'NEEDS_REVIEW', 'PENDING_REVIEW', 'OPEN'].includes(normalized)) return 'REVIEW'
  return 'SUCCESS'
}

const normalizeAuditLog = (raw: RawAuditLog, index: number): AuditLog => {
  const id = asText(firstValue(raw, 'id', 'event_id', 'eventId', 'audit_id', 'auditId', 'log_id', 'logId'), `AUD-${index + 1}`)
  const rawTimestamp = firstValue(raw, 'timestamp', 'created_at', 'createdAt', 'event_time', 'eventTime', 'time')
  let timestamp = asText(rawTimestamp, 'Timestamp unavailable')
  if (rawTimestamp instanceof Date) timestamp = rawTimestamp.toLocaleString()
  else if (typeof rawTimestamp === 'number') timestamp = new Date(rawTimestamp).toLocaleString()
  const action = asText(firstValue(raw, 'action', 'event', 'event_name', 'eventName', 'action_name', 'actionName', 'title'), 'Audit event')
  const category = normalizeCategory(firstValue(raw, 'category', 'event_category', 'eventCategory', 'type'))
  const severity = normalizeSeverity(firstValue(raw, 'severity', 'risk_level', 'riskLevel', 'level'))
  const status = normalizeStatus(firstValue(raw, 'status', 'result', 'outcome', 'event_status', 'eventStatus'))
  const user = asText(firstValue(raw, 'user', 'username', 'user_name', 'userName', 'actor', 'principal'))
  const endpoint = asText(firstValue(raw, 'endpoint', 'host', 'hostname', 'device', 'endpoint_name', 'endpointName'))
  const sourceIp = asText(firstValue(raw, 'sourceIp', 'source_ip', 'sourceIP', 'src_ip', 'srcIp', 'ip_address', 'ipAddress', 'ip'))
  const description = asText(firstValue(raw, 'description', 'details', 'message', 'summary'), action)
  return { id, timestamp, action, category, severity, status, user, endpoint, sourceIp, description }
}

const API_URL = 'http://127.0.0.1:8001/api/audit-logs'

function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

  const [search, setSearch] = useState('')

  const [categoryFilter, setCategoryFilter] = useState<
    'ALL' | AuditCategory
  >('ALL')

  const [severityFilter, setSeverityFilter] = useState<
    'ALL' | AuditSeverity
  >('ALL')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAuditLogs = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error(
          `Audit API request failed with status ${response.status}`,
        )
      }

      const payload: unknown = await response.json()
      const rows = Array.isArray(payload)
        ? payload
        : payload && typeof payload === 'object'
          ? (() => {
              const record = payload as Record<string, unknown>
              const nested = record.items ?? record.results ?? record.audit_logs ?? record.auditLogs ?? record.data
              return Array.isArray(nested) ? nested : []
            })()
          : []

      setAuditLogs(
        rows
          .filter((item): item is RawAuditLog => !!item && typeof item === 'object' && !Array.isArray(item))
          .map((item, index) => normalizeAuditLog(item, index)),
      )
    } catch (error) {
      console.error('Audit logs API error:', error)

      setAuditLogs([])

      setError(
        error instanceof Error
          ? error.message
          : 'Unable to load audit logs.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAuditLogs()
  }, [])

  const infoCount = auditLogs.filter(
    (log) => log.severity === 'INFO',
  ).length

  const warningCount = auditLogs.filter(
    (log) => log.severity === 'WARNING',
  ).length

  const highCount = auditLogs.filter(
    (log) => log.severity === 'HIGH',
  ).length

  const reviewCount = auditLogs.filter(
    (log) =>
      log.status === 'REVIEW' ||
      log.status === 'BLOCKED',
  ).length

  const categoryCounts = useMemo(() => {
    return {
      AUTH: auditLogs.filter(
        (log) => log.category === 'AUTH',
      ).length,

      ADMIN: auditLogs.filter(
        (log) => log.category === 'ADMIN',
      ).length,

      SECURITY: auditLogs.filter(
        (log) => log.category === 'SECURITY',
      ).length,

      SYSTEM: auditLogs.filter(
        (log) => log.category === 'SYSTEM',
      ).length,
    }
  }, [auditLogs])

  const filteredLogs = useMemo(() => {
    const query = search.toLowerCase().trim()

    return auditLogs.filter((log) => {
      const matchesSearch =
        !query ||
        log.id.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.category.toLowerCase().includes(query) ||
        log.user.toLowerCase().includes(query) ||
        log.endpoint.toLowerCase().includes(query) ||
        log.sourceIp.toLowerCase().includes(query) ||
        log.description.toLowerCase().includes(query)

      const matchesCategory =
        categoryFilter === 'ALL' ||
        log.category === categoryFilter

      const matchesSeverity =
        severityFilter === 'ALL' ||
        log.severity === severityFilter

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSeverity
      )
    })
  }, [
    auditLogs,
    search,
    categoryFilter,
    severityFilter,
  ])

  return (
    <div className="page-container">

      {/* =========================================
          PAGE HEADER
          ========================================= */}

      <div className="page-header">

        <div>

          <div className="page-eyebrow">
            SECURITY AUDITING & EVENT CORRELATION
          </div>

          <h1>Audit Logs</h1>

          <p>
            Review authentication, administrative, security,
            and system activity across monitored endpoints.
          </p>

        </div>

        <div className="page-status page-audit-status">
          <span />
          {loading
            ? 'LOADING AUDIT COLLECTION'
            : error
              ? 'AUDIT COLLECTION ERROR'
              : 'AUDIT COLLECTION ACTIVE'}
        </div>

      </div>

      {/* =========================================
          ERROR
          ========================================= */}

      {error && (
        <div
          style={{
            marginBottom: '18px',
            padding: '12px 14px',
            borderRadius: '9px',
            border:
              '1px solid rgba(248, 113, 113, 0.25)',
            background:
              'rgba(127, 29, 29, 0.18)',
            color: '#fca5a5',
            fontSize: '12px',
          }}
        >
          {error}

          <button
            type="button"
            onClick={loadAuditLogs}
            style={{
              marginLeft: '12px',
              border:
                '1px solid rgba(248, 113, 113, 0.35)',
              background: 'transparent',
              color: '#fca5a5',
              borderRadius: '6px',
              padding: '5px 9px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* =========================================
          SUMMARY
          ========================================= */}

      <section className="audit-summary-grid">

        <div className="audit-summary-card">

          <div className="audit-summary-top">
            <span>TOTAL EVENTS</span>
            <Activity size={17} />
          </div>

          <strong>
            {String(auditLogs.length).padStart(2, '0')}
          </strong>

          <p>
            Audit events collected
          </p>

        </div>

        <div className="audit-summary-card">

          <div className="audit-summary-top">
            <span>INFORMATION</span>
            <CheckCircle2 size={17} />
          </div>

          <strong>
            {String(infoCount).padStart(2, '0')}
          </strong>

          <p>
            Routine activity
          </p>

        </div>

        <div className="audit-summary-card audit-summary-warning">

          <div className="audit-summary-top">
            <span>WARNING</span>
            <AlertTriangle size={17} />
          </div>

          <strong>
            {String(warningCount).padStart(2, '0')}
          </strong>

          <p>
            Requires review
          </p>

        </div>

        <div className="audit-summary-card audit-summary-danger">

          <div className="audit-summary-top">
            <span>HIGH RISK</span>
            <ShieldAlert size={17} />
          </div>

          <strong>
            {String(highCount).padStart(2, '0')}
          </strong>

          <p>
            Security investigation
          </p>

        </div>

      </section>

      {/* =========================================
          ACTIVITY OVERVIEW
          ========================================= */}

      <section className="audit-overview-grid">

        <div className="audit-panel">

          <div className="audit-panel-header">

            <div>

              <div className="audit-panel-title">
                Audit Activity
              </div>

              <div className="audit-panel-subtitle">
                Event volume across the current monitoring
                window
              </div>

            </div>

            <Activity size={18} />

          </div>

          <div className="audit-activity-chart">

            <div className="audit-chart-grid">
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="audit-activity-bars">

              <div style={{ height: '34%' }} />
              <div style={{ height: '51%' }} />
              <div style={{ height: '43%' }} />
              <div style={{ height: '72%' }} />
              <div style={{ height: '57%' }} />
              <div style={{ height: '88%' }} />
              <div style={{ height: '62%' }} />
              <div style={{ height: '76%' }} />
              <div style={{ height: '48%' }} />
              <div style={{ height: '68%' }} />

            </div>

            <div className="audit-time-labels">
              <span>08:00</span>
              <span>09:00</span>
              <span>10:00</span>
              <span>11:00</span>
            </div>

          </div>

        </div>

        <div className="audit-panel">

          <div className="audit-panel-header">

            <div>

              <div className="audit-panel-title">
                Event Categories
              </div>

              <div className="audit-panel-subtitle">
                Distribution of recorded audit activity
              </div>

            </div>

            <Filter size={18} />

          </div>

          <div className="audit-category-list">

            <div className="audit-category-item">

              <div className="audit-category-icon">
                <KeyRound size={15} />
              </div>

              <div>

                <strong>
                  Authentication
                </strong>

                <span>
                  Login and authentication activity
                </span>

              </div>

              <b>
                {String(categoryCounts.AUTH).padStart(2, '0')}
              </b>

            </div>

            <div className="audit-category-item">

              <div className="audit-category-icon">
                <UserCog size={15} />
              </div>

              <div>

                <strong>
                  Administrative
                </strong>

                <span>
                  Privilege and configuration changes
                </span>

              </div>

              <b>
                {String(categoryCounts.ADMIN).padStart(2, '0')}
              </b>

            </div>

            <div className="audit-category-item">

              <div className="audit-category-icon">
                <ShieldAlert size={15} />
              </div>

              <div>

                <strong>
                  Security
                </strong>

                <span>
                  Threat-related security events
                </span>

              </div>

              <b>
                {String(categoryCounts.SECURITY).padStart(2, '0')}
              </b>

            </div>

            <div className="audit-category-item">

              <div className="audit-category-icon">
                <Monitor size={15} />
              </div>

              <div>

                <strong>
                  System
                </strong>

                <span>
                  Operating system activity
                </span>

              </div>

              <b>
                {String(categoryCounts.SYSTEM).padStart(2, '0')}
              </b>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          MONITORING SOURCES
          ========================================= */}

      <section className="audit-source-panel">

        <div className="audit-source-header">

          <div>

            <div className="audit-panel-title">
              Audit Collection Sources
            </div>

            <div className="audit-panel-subtitle">
              Security telemetry sources currently reporting
            </div>

          </div>

          <FileText size={18} />

        </div>

        <div className="audit-source-grid">

          <div className="audit-source-card">

            <div className="audit-source-icon">
              <KeyRound size={16} />
            </div>

            <div>

              <strong>
                Authentication Logs
              </strong>

              <span>
                Windows / Linux
              </span>

            </div>

            <b>ACTIVE</b>

          </div>

          <div className="audit-source-card">

            <div className="audit-source-icon">
              <UserCog size={16} />
            </div>

            <div>

              <strong>
                Administrative Events
              </strong>

              <span>
                Privilege / Policy changes
              </span>

            </div>

            <b>ACTIVE</b>

          </div>

          <div className="audit-source-card">

            <div className="audit-source-icon">
              <ShieldAlert size={16} />
            </div>

            <div>

              <strong>
                Security Events
              </strong>

              <span>
                Threat and detection telemetry
              </span>

            </div>

            <b>ACTIVE</b>

          </div>

          <div className="audit-source-card">

            <div className="audit-source-icon">
              <Monitor size={16} />
            </div>

            <div>

              <strong>
                System Events
              </strong>

              <span>
                Endpoint operating system logs
              </span>

            </div>

            <b>ACTIVE</b>

          </div>

        </div>

      </section>

      {/* =========================================
          FILTERS
          ========================================= */}

      <div className="audit-toolbar">

        <div className="audit-search">

          <Search size={15} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search event, user, endpoint, IP..."
          />

        </div>

        <div className="audit-filter-group">

          {(
            [
              'ALL',
              'AUTH',
              'ADMIN',
              'SECURITY',
              'SYSTEM',
            ] as const
          ).map((category) => (

            <button
              key={category}
              type="button"
              className={
                categoryFilter === category
                  ? 'audit-filter-button audit-filter-active'
                  : 'audit-filter-button'
              }
              onClick={() =>
                setCategoryFilter(category)
              }
            >
              {category}
            </button>

          ))}

        </div>

        <div className="audit-severity-group">

          {(
            [
              'ALL',
              'INFO',
              'WARNING',
              'HIGH',
            ] as const
          ).map((severity) => (

            <button
              key={severity}
              type="button"
              className={
                severityFilter === severity
                  ? 'audit-severity-button audit-severity-active'
                  : 'audit-severity-button'
              }
              onClick={() =>
                setSeverityFilter(severity)
              }
            >
              {severity}
            </button>

          ))}

        </div>

        <div className="audit-result-count">
          {filteredLogs.length} events
        </div>

      </div>

      {/* =========================================
          REVIEW INDICATOR
          ========================================= */}

      <div className="audit-review-strip">

        <div className="audit-review-icon">
          <Activity size={15} />
        </div>

        <div>

          <strong>
            {reviewCount} events require analyst review
          </strong>

          <span>
            Review high-risk activity and unusual
            authentication or administrative events.
          </span>

        </div>

        <ShieldAlert size={16} />

      </div>

      {/* =========================================
          AUDIT EVENT TABLE
          ========================================= */}

      <section className="audit-panel audit-table-panel">

        <div className="audit-panel-header">

          <div>

            <div className="audit-panel-title">
              Audit Event Repository
            </div>

            <div className="audit-panel-subtitle">
              Detailed endpoint activity and security events
            </div>

          </div>

          <FileText size={18} />

        </div>

        <div className="audit-table-wrapper">

          {loading ? (

            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '13px',
              }}
            >
              Loading audit events from CyberSentinel API...
            </div>

          ) : (

            <table className="audit-table">

              <thead>

                <tr>
                  <th>EVENT</th>
                  <th>CATEGORY</th>
                  <th>USER</th>
                  <th>ENDPOINT</th>
                  <th>SOURCE IP</th>
                  <th>TIME</th>
                  <th>SEVERITY</th>
                  <th>STATUS</th>
                </tr>

              </thead>

              <tbody>

                {filteredLogs.map((log) => (

                  <tr
                    key={log.id}
                    className="audit-clickable-row"
                  >

                    <td>

                      <Link
                        to={`/audit-logs/${log.id}`}
                        className="audit-event-link"
                      >

                        <div className="audit-event-cell">

                          <div className="audit-event-icon">
                            <FileText size={14} />
                          </div>

                          <div>

                            <strong>
                              {log.action}
                            </strong>

                            <span>
                              {log.id}
                            </span>

                          </div>

                        </div>

                      </Link>

                    </td>

                    <td>

                      <span className="audit-category">
                        {log.category}
                      </span>

                    </td>

                    <td>

                      <div className="audit-user-cell">

                        <User size={12} />

                        <span>
                          {log.user}
                        </span>

                      </div>

                    </td>

                    <td className="audit-mono">
                      {log.endpoint}
                    </td>

                    <td className="audit-mono">
                      {log.sourceIp}
                    </td>

                    <td className="audit-mono">
                      {log.timestamp}
                    </td>

                    <td>

                      <span
                        className={`audit-severity audit-severity-${log.severity.toLowerCase()}`}
                      >

                        <span />

                        {log.severity}

                      </span>

                    </td>

                    <td>

                      <span
                        className={`audit-event-status audit-event-status-${log.status.toLowerCase()}`}
                      >

                        <span />

                        {log.status}

                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

          {!loading && filteredLogs.length === 0 && (

            <div className="audit-empty-state">

              <Search size={22} />

              <strong>
                No matching audit events
              </strong>

              <span>
                Try changing the search or event filters.
              </span>

            </div>

          )}

        </div>

      </section>

    </div>
  )
}

export default AuditLogs