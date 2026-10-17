import {
  Activity,
  AlertTriangle,
  Archive,
  CalendarClock,
  Database,
  FileSearch,
  FolderSearch,
  HardDrive,
  Search,
  ShieldAlert,
  Terminal,
  User,
} from 'lucide-react'

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = 'http://127.0.0.1:8001/api/forensics'

type EvidenceStatus =
  | 'COLLECTED'
  | 'ANALYZING'
  | 'FLAGGED'
  | 'VERIFIED'

type EvidenceType =
  | 'PROCESS'
  | 'FILE'
  | 'NETWORK'
  | 'USER ACTIVITY'
  | 'SYSTEM'

type EvidenceItem = {
  id: string
  name: string
  type: EvidenceType
  endpoint: string
  collected: string
  analyst: string
  status: EvidenceStatus
  source: string
  description: string
}

type ApiEvidenceItem = Record<string, unknown>

function readString(
  item: ApiEvidenceItem,
  ...keys: string[]
): string {
  for (const key of keys) {
    const value = item[key]
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim()
    }
  }
  return ''
}

function normalizeStatus(value: string): EvidenceStatus {
  const status = value.trim().toUpperCase().replace(/[ -]+/g, '_')
  if (status === 'ANALYSIS' || status === 'IN_PROGRESS' || status === 'UNDER_ANALYSIS') {
    return 'ANALYZING'
  }
  if (status === 'ALERT' || status === 'SUSPICIOUS' || status === 'REQUIRES_REVIEW') {
    return 'FLAGGED'
  }
  if (status === 'VERIFIED' || status === 'COLLECTED' || status === 'ANALYZING' || status === 'FLAGGED') {
    return status
  }
  return 'COLLECTED'
}

function normalizeType(value: string): EvidenceType {
  const type = value.trim().toUpperCase().replace(/[_-]+/g, ' ')
  if (type.includes('PROCESS')) return 'PROCESS'
  if (type.includes('FILE')) return 'FILE'
  if (type.includes('NETWORK') || type.includes('CONNECTION')) return 'NETWORK'
  if (type.includes('USER') || type.includes('AUTHENTICATION') || type.includes('ACCOUNT')) return 'USER ACTIVITY'
  return 'SYSTEM'
}

function normalizeEvidence(item: ApiEvidenceItem, index: number): EvidenceItem {
  const name = readString(item, 'name', 'evidence_name', 'title', 'artifact_name') || `Evidence item ${index + 1}`
  const endpoint = readString(item, 'endpoint', 'endpoint_name', 'host', 'hostname', 'device') || 'Unknown endpoint'
  const id = readString(item, 'evidence_id', 'evidenceId', 'id', 'uuid', 'artifact_id') || `${name}-${endpoint}-${index}`
  return {
    id,
    name,
    type: normalizeType(readString(item, 'evidence_type', 'evidenceType', 'type', 'category')),
    endpoint,
    collected: readString(item, 'collected', 'collected_at', 'collectedAt', 'collection_time', 'timestamp', 'created_at') || '—',
    analyst: readString(item, 'analyst', 'analyst_name', 'owner', 'collected_by') || 'Unassigned',
    status: normalizeStatus(readString(item, 'status', 'evidence_status', 'evidenceStatus', 'state')),
    source: readString(item, 'source', 'source_name', 'origin', 'artifact_source') || 'Unknown source',
    description: readString(item, 'description', 'summary', 'details', 'notes') || 'No description available.',
  }
}

function Forensics() {
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([])
  const [search, setSearch] = useState('')

  const [statusFilter, setStatusFilter] = useState<
    'ALL' | EvidenceStatus
  >('ALL')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadEvidence = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('Failed to load forensic evidence')
      }

      const payload: unknown = await response.json()
      const records = Array.isArray(payload)
        ? payload
        : payload && typeof payload === 'object'
          ? (() => {
              const record = payload as Record<string, unknown>
              const nested = record.items ?? record.evidence ?? record.results ?? record.data
              return Array.isArray(nested) ? nested : []
            })()
          : []

      const mappedEvidence = records
        .filter((item): item is ApiEvidenceItem => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
        .map((item, index) => normalizeEvidence(item, index))

      setEvidenceItems(mappedEvidence)
    } catch (err) {
      console.error('Forensics API error:', err)

      setError(
        'Unable to connect to the forensic evidence service.',
      )

      setEvidenceItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvidence()
  }, [])

  const collectedCount = evidenceItems.filter(
    (item) => item.status === 'COLLECTED',
  ).length

  const analyzingCount = evidenceItems.filter(
    (item) => item.status === 'ANALYZING',
  ).length

  const flaggedCount = evidenceItems.filter(
    (item) => item.status === 'FLAGGED',
  ).length

  const categoryCounts = useMemo(
    () => ({
      process: evidenceItems.filter(
        (item) => item.type === 'PROCESS',
      ).length,

      file: evidenceItems.filter(
        (item) => item.type === 'FILE',
      ).length,

      network: evidenceItems.filter(
        (item) => item.type === 'NETWORK',
      ).length,

      userActivity: evidenceItems.filter(
        (item) => item.type === 'USER ACTIVITY',
      ).length,

      system: evidenceItems.filter(
        (item) => item.type === 'SYSTEM',
      ).length,
    }),
    [evidenceItems],
  )

  const filteredEvidence = useMemo(() => {
    const query = search.toLowerCase().trim()

    return evidenceItems.filter((item) => {
      const matchesSearch =
        !query ||
        item.id.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.endpoint.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)

      const matchesStatus =
        statusFilter === 'ALL' ||
        item.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [evidenceItems, search, statusFilter])

  return (
    <div className="page-container">

      {/* =========================================
          PAGE HEADER
          ========================================= */}

      <div className="page-header">

        <div>
          <div className="page-eyebrow">
            DIGITAL FORENSICS & INCIDENT RESPONSE
          </div>

          <h1>Forensics</h1>

          <p>
            Collect, correlate, and investigate digital evidence
            from monitored endpoints and security telemetry.
          </p>
        </div>

        <div className="page-status page-forensics-status">
          <span />

          {loading
            ? 'CONNECTING TO FORENSIC SERVICE'
            : error
              ? 'FORENSIC SERVICE OFFLINE'
              : 'FORENSIC COLLECTION ACTIVE'}
        </div>

      </div>

      {/* =========================================
          ERROR / RETRY
          ========================================= */}

      {error && (
        <div className="forensics-error">
          <AlertTriangle size={16} />

          <span>{error}</span>

          <button
            type="button"
            onClick={loadEvidence}
            className="forensics-refresh-button"
          >
            Retry
          </button>
        </div>
      )}

      {/* =========================================
          LOADING
          ========================================= */}

      {loading && (
        <div className="forensics-loading">
          <Activity size={18} />

          <span>
            Loading forensic evidence from backend...
          </span>
        </div>
      )}

      {/* =========================================
          EVIDENCE SUMMARY
          ========================================= */}

      <section className="forensics-summary-grid">

        <div className="forensics-summary-card">

          <div className="forensics-summary-top">
            <span>TOTAL EVIDENCE</span>
            <Database size={17} />
          </div>

          <strong>
            {String(evidenceItems.length).padStart(2, '0')}
          </strong>

          <p>
            Evidence items collected
          </p>

        </div>

        <div className="forensics-summary-card">

          <div className="forensics-summary-top">
            <span>COLLECTED</span>
            <Archive size={17} />
          </div>

          <strong>
            {String(collectedCount).padStart(2, '0')}
          </strong>

          <p>
            Awaiting analysis
          </p>

        </div>

        <div className="forensics-summary-card forensics-summary-warning">

          <div className="forensics-summary-top">
            <span>ANALYZING</span>
            <FileSearch size={17} />
          </div>

          <strong>
            {String(analyzingCount).padStart(2, '0')}
          </strong>

          <p>
            Under investigation
          </p>

        </div>

        <div className="forensics-summary-card forensics-summary-danger">

          <div className="forensics-summary-top">
            <span>FLAGGED</span>
            <AlertTriangle size={17} />
          </div>

          <strong>
            {String(flaggedCount).padStart(2, '0')}
          </strong>

          <p>
            Requires analyst attention
          </p>

        </div>

      </section>

      {/* =========================================
          FORENSIC OVERVIEW
          ========================================= */}

      <section className="forensics-overview-grid">

        {/* Timeline */}

        <div className="forensics-panel">

          <div className="forensics-panel-header">

            <div>

              <div className="forensics-panel-title">
                Investigation Timeline
              </div>

              <div className="forensics-panel-subtitle">
                Evidence activity correlated across the current
                investigation window
              </div>

            </div>

            <CalendarClock size={18} />

          </div>

          <div className="forensics-timeline-chart">

            <div className="forensics-chart-grid">
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="forensics-timeline-line">

              {Array.from({
                length: Math.max(
                  evidenceItems.length,
                  1,
                ),
              }).map((_, index) => (
                <div
                  className="forensics-event-dot"
                  key={index}
                />
              ))}

            </div>

            <div className="forensics-time-labels">
              <span>08:00</span>
              <span>09:00</span>
              <span>10:00</span>
              <span>11:00</span>
            </div>

          </div>

        </div>

        {/* Categories */}

        <div className="forensics-panel">

          <div className="forensics-panel-header">

            <div>

              <div className="forensics-panel-title">
                Evidence Categories
              </div>

              <div className="forensics-panel-subtitle">
                Distribution of collected forensic artifacts
              </div>

            </div>

            <FolderSearch size={18} />

          </div>

          <div className="forensics-category-list">

            <div className="forensics-category-item">

              <div className="forensics-category-icon">
                <Terminal size={15} />
              </div>

              <div className="forensics-category-content">

                <strong>
                  Process Evidence
                </strong>

                <span>
                  Execution and parent-child relationships
                </span>

              </div>

              <b>
                {String(categoryCounts.process).padStart(2, '0')}
              </b>

            </div>

            <div className="forensics-category-item">

              <div className="forensics-category-icon">
                <FileSearch size={15} />
              </div>

              <div className="forensics-category-content">

                <strong>
                  File Evidence
                </strong>

                <span>
                  File changes and integrity artifacts
                </span>

              </div>

              <b>
                {String(categoryCounts.file).padStart(2, '0')}
              </b>

            </div>

            <div className="forensics-category-item">

              <div className="forensics-category-icon">
                <Activity size={15} />
              </div>

              <div className="forensics-category-content">

                <strong>
                  Network Evidence
                </strong>

                <span>
                  Connections and communication artifacts
                </span>

              </div>

              <b>
                {String(categoryCounts.network).padStart(2, '0')}
              </b>

            </div>

            <div className="forensics-category-item">

              <div className="forensics-category-icon">
                <User size={15} />
              </div>

              <div className="forensics-category-content">

                <strong>
                  User Activity
                </strong>

                <span>
                  Authentication and account activity
                </span>

              </div>

              <b>
                {String(categoryCounts.userActivity).padStart(2, '0')}
              </b>

            </div>

            <div className="forensics-category-item">

              <div className="forensics-category-icon">
                <HardDrive size={15} />
              </div>

              <div className="forensics-category-content">

                <strong>
                  System Evidence
                </strong>

                <span>
                  OS and security configuration artifacts
                </span>

              </div>

              <b>
                {String(categoryCounts.system).padStart(2, '0')}
              </b>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          COLLECTION STATUS
          ========================================= */}

      <section className="forensics-collection-panel">

        <div className="forensics-collection-header">

          <div>

            <div className="forensics-panel-title">
              Evidence Collection Status
            </div>

            <div className="forensics-panel-subtitle">
              Endpoint evidence sources currently available
            </div>

          </div>

          <ShieldAlert size={18} />

        </div>

        <div className="forensics-collection-grid">

          <div className="forensics-source-card">

            <div className="forensics-source-icon">
              <Terminal size={17} />
            </div>

            <div>
              <strong>Process Telemetry</strong>
              <span>WIN-01 / WIN-02</span>
            </div>

            <b>ACTIVE</b>

          </div>

          <div className="forensics-source-card">

            <div className="forensics-source-icon">
              <FileSearch size={17} />
            </div>

            <div>
              <strong>File Integrity</strong>
              <span>WIN-01 / WIN-02 / LINUX-01</span>
            </div>

            <b>ACTIVE</b>

          </div>

          <div className="forensics-source-card">

            <div className="forensics-source-icon">
              <Activity size={17} />
            </div>

            <div>
              <strong>Network Telemetry</strong>

              <span>
                {categoryCounts.network} active evidence records
              </span>
            </div>

            <b>ACTIVE</b>

          </div>

          <div className="forensics-source-card">

            <div className="forensics-source-icon">
              <Database size={17} />
            </div>

            <div>
              <strong>Event Logs</strong>
              <span>Windows / Linux telemetry</span>
            </div>

            <b>ACTIVE</b>

          </div>

        </div>

      </section>

      {/* =========================================
          SEARCH / FILTER
          ========================================= */}

      <div className="forensics-toolbar">

        <div className="forensics-search">

          <Search size={15} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search evidence, endpoint, source..."
          />

        </div>

        <div className="forensics-filter-group">

          {(
            [
              'ALL',
              'COLLECTED',
              'ANALYZING',
              'FLAGGED',
              'VERIFIED',
            ] as const
          ).map((status) => (

            <button
              key={status}
              type="button"
              className={
                statusFilter === status
                  ? 'forensics-filter-button forensics-filter-active'
                  : 'forensics-filter-button'
              }
              onClick={() =>
                setStatusFilter(status)
              }
            >
              {status}
            </button>

          ))}

        </div>

        <div className="forensics-result-count">
          {filteredEvidence.length} evidence items
        </div>

      </div>

      {/* =========================================
          EVIDENCE TABLE
          ========================================= */}

      <section className="forensics-panel forensics-table-panel">

        <div className="forensics-panel-header">

          <div>

            <div className="forensics-panel-title">
              Evidence Repository
            </div>

            <div className="forensics-panel-subtitle">
              Digital artifacts collected for investigation
            </div>

          </div>

          <FolderSearch size={18} />

        </div>

        <div className="forensics-table-wrapper">

          <table className="forensics-table">

            <thead>

              <tr>
                <th>EVIDENCE</th>
                <th>TYPE</th>
                <th>ENDPOINT</th>
                <th>SOURCE</th>
                <th>COLLECTED</th>
                <th>STATUS</th>
              </tr>

            </thead>

            <tbody>

              {filteredEvidence.map((item) => (

                <tr
                  key={item.id}
                  className="forensics-clickable-row"
                >

                  <td>

                    <Link
                      to={`/forensics/${encodeURIComponent(item.id)}`}
                      className="forensics-evidence-link"
                    >

                      <div className="forensics-evidence-cell">

                        <div className="forensics-evidence-icon">
                          <FileSearch size={14} />
                        </div>

                        <div>

                          <strong>
                            {item.name}
                          </strong>

                          <span>
                            {item.id}
                          </span>

                        </div>

                      </div>

                    </Link>

                  </td>

                  <td>

                    <span className="forensics-type">
                      {item.type}
                    </span>

                  </td>

                  <td className="forensics-mono">
                    {item.endpoint}
                  </td>

                  <td>

                    <div className="forensics-source-cell">

                      <strong>
                        {item.source}
                      </strong>

                      <span>
                        {item.description}
                      </span>

                    </div>

                  </td>

                  <td className="forensics-mono">
                    {item.collected}
                  </td>

                  <td>

                    <span
                      className={`forensics-status forensics-status-${item.status.toLowerCase()}`}
                    >

                      <span />

                      {item.status}

                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {!loading && filteredEvidence.length === 0 && (

            <div className="forensics-empty-state">

              <Search size={22} />

              <strong>
                No matching evidence
              </strong>

              <span>
                {error
                  ? 'Check the backend service and try again.'
                  : 'Try changing the search or status filter.'}
              </span>

            </div>

          )}

        </div>

      </section>

    </div>
  )
}

export default Forensics