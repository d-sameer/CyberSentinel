import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Database,
  FileSearch,
  Hash,
  Network,
  ShieldAlert,
  Terminal,
  User,
} from 'lucide-react'

import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const API_URL = 'http://127.0.0.1:8001/api/forensics'

type EvidenceStatus = 'COLLECTED' | 'ANALYZING' | 'FLAGGED' | 'VERIFIED'

type Correlation = {
  type: string
  value: string
  context: string
}

type EvidenceListItem = {
  id?: string
  evidence_id: string
  name: string
  status: EvidenceStatus
  endpoint: string
  evidence_type: string
  source: string
  collected: string
  analyst: string
  description: string
}

type EvidenceDetailResponse = {
  evidence_id: string
  status: EvidenceStatus
  endpoint: string
  evidence_type: string
  source: string
  correlations: Correlation[]
}

type ForensicAction = {
  id: number | string
  action_id: string
  evidence_id: string
  action: string
  status: string
  analyst: string
  created_at: string
}

type ApiRecord = Record<string, unknown>

function asRecord(value: unknown): ApiRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as ApiRecord
    : {}
}

function readString(record: ApiRecord, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' || typeof value === 'number') {
      const normalized = String(value).trim()
      if (normalized) return normalized
    }
  }
  return ''
}

function normalizeStatus(value: unknown): EvidenceStatus {
  const status = String(value ?? 'COLLECTED').trim().toUpperCase().replace(/[ -]+/g, '_')
  if (['ANALYZING', 'ANALYSING', 'IN_PROGRESS', 'UNDER_ANALYSIS'].includes(status)) return 'ANALYZING'
  if (['FLAGGED', 'SUSPICIOUS', 'ALERT', 'HIGH_RISK'].includes(status)) return 'FLAGGED'
  if (['VERIFIED', 'CONFIRMED', 'CLOSED'].includes(status)) return 'VERIFIED'
  return 'COLLECTED'
}

function normalizeEvidenceListItem(value: unknown): EvidenceListItem {
  const item = asRecord(value)
  const evidenceId = readString(item, 'evidence_id', 'evidenceId', 'id', 'uuid') || 'unknown-evidence'
  const rawType = readString(item, 'evidence_type', 'evidenceType', 'type', 'category') || 'SYSTEM'
  return {
    id: readString(item, 'id', 'uuid') || evidenceId,
    evidence_id: evidenceId,
    name: readString(item, 'name', 'file_name', 'fileName', 'title') || `Evidence ${evidenceId}`,
    status: normalizeStatus(item.status),
    endpoint: readString(item, 'endpoint', 'endpoint_name', 'endpointName', 'host') || 'Unknown endpoint',
    evidence_type: rawType.toUpperCase().replace(/_/g, ' '),
    source: readString(item, 'source', 'collection_source', 'collectionSource') || 'Unknown source',
    collected: readString(item, 'collected', 'collected_at', 'collectedAt', 'timestamp', 'created_at', 'createdAt') || 'Not recorded',
    analyst: readString(item, 'analyst', 'collected_by', 'collectedBy', 'owner') || 'Unassigned',
    description: readString(item, 'description', 'details', 'summary') || 'No description provided by the backend.',
  }
}

function normalizeCorrelations(value: unknown): Correlation[] {
  if (!Array.isArray(value)) return []
  return value.map((entry) => {
    const item = asRecord(entry)
    return {
      type: readString(item, 'type', 'category', 'kind').toUpperCase() || 'RELATED',
      value: readString(item, 'value', 'name', 'id', 'target') || 'Unknown related artifact',
      context: readString(item, 'context', 'description', 'relationship') || 'No additional context provided.',
    }
  })
}

function normalizeEvidenceDetail(value: unknown, fallback: EvidenceListItem): EvidenceDetailResponse {
  const root = asRecord(value)
  const nested = asRecord(root.evidence ?? root.item ?? root.data)
  const item = Object.keys(nested).length ? nested : root
  return {
    evidence_id: readString(item, 'evidence_id', 'evidenceId', 'id', 'uuid') || fallback.evidence_id,
    status: normalizeStatus(item.status ?? fallback.status),
    endpoint: readString(item, 'endpoint', 'endpoint_name', 'endpointName', 'host') || fallback.endpoint,
    evidence_type: readString(item, 'evidence_type', 'evidenceType', 'type', 'category').toUpperCase().replace(/_/g, ' ') || fallback.evidence_type,
    source: readString(item, 'source', 'collection_source', 'collectionSource') || fallback.source,
    correlations: normalizeCorrelations(item.correlations ?? item.related_artifacts ?? item.relatedArtifacts),
  }
}

function normalizeForensicAction(value: unknown, index: number, evidenceId: string): ForensicAction {
  const item = asRecord(value)
  const action = readString(item, 'action', 'action_type', 'actionType', 'type') || 'RECORDED_ACTION'
  return {
    id: (typeof item.id === 'string' || typeof item.id === 'number') ? item.id : index,
    action_id: readString(item, 'action_id', 'actionId', 'id', 'uuid') || `${evidenceId}-${action}-${index}`,
    evidence_id: readString(item, 'evidence_id', 'evidenceId') || evidenceId,
    action: action.toUpperCase().replace(/[ -]+/g, '_'),
    status: readString(item, 'status', 'result', 'state').toUpperCase() || 'RECORDED',
    analyst: readString(item, 'analyst', 'actor', 'user') || 'SOC Analyst',
    created_at: readString(item, 'created_at', 'createdAt', 'timestamp', 'occurred_at', 'occurredAt') || '',
  }
}

function unwrapArray(value: unknown, keys: string[]): unknown[] {
  if (Array.isArray(value)) return value
  const root = asRecord(value)
  for (const key of keys) {
    if (Array.isArray(root[key])) return root[key] as unknown[]
  }
  const data = asRecord(root.data)
  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key] as unknown[]
  }
  return []
}

const FORENSIC_ACTION_LABELS: Record<string, string> = {
  START_ANALYSIS: 'ANALYSIS STARTED',
  PRESERVE_EVIDENCE: 'EVIDENCE PRESERVED',
  ESCALATE_EVIDENCE: 'ESCALATION REQUESTED',
  MARK_VERIFIED: 'VERIFIED',
}

function formatActionDate(value: string) {
  if (!value) return 'Time not recorded'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function ForensicsDetails() {
  const { evidenceId } = useParams()

  const [listItem, setListItem] = useState<EvidenceListItem | null>(null)
  const [detail, setDetail] = useState<EvidenceDetailResponse | null>(null)

  const [actions, setActions] = useState<ForensicAction[]>([])

  const [loading, setLoading] = useState(true)
  const [loadingActions, setLoadingActions] = useState(false)

  const [submittingAction, setSubmittingAction] =
    useState<string | null>(null)

  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  const [backendStatus, setBackendStatus] = useState<
    'BACKEND CONNECTED' | 'BACKEND ERROR'
  >('BACKEND CONNECTED')

  /*
   * Load the main evidence record.
   *
   * The list endpoint provides the descriptive fields:
   * name, collected, analyst and description.
   *
   * The detail endpoint provides the investigation-specific
   * fields and correlations.
   */
  const loadEvidence = async () => {
    if (!evidenceId) {
      setError('No forensic evidence ID was provided.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      const safeEvidenceId = encodeURIComponent(evidenceId)
      const [listResponse, detailResponse] = await Promise.all([
        fetch(API_URL),
        fetch(`${API_URL}/${safeEvidenceId}`),
      ])

      if (!listResponse.ok) throw new Error('Unable to load forensic evidence list')
      if (!detailResponse.ok) throw new Error('Forensic evidence item not found')

      const [rawList, rawDetail]: [unknown, unknown] = await Promise.all([
        listResponse.json(),
        detailResponse.json(),
      ])
      const listData = unwrapArray(rawList, ['items', 'evidence', 'records', 'results'])
        .map(normalizeEvidenceListItem)
      const selectedItem = listData.find((item) =>
        item.evidence_id === evidenceId || item.id === evidenceId,
      )

      if (!selectedItem) throw new Error('Forensic evidence item not found in the evidence repository')

      setListItem(selectedItem)
      setDetail(normalizeEvidenceDetail(rawDetail, selectedItem))
      setBackendStatus('BACKEND CONNECTED')
    } catch (caught) {
      console.error('Forensics detail API error:', caught)
      setListItem(null)
      setDetail(null)
      setError(caught instanceof Error ? caught.message : 'Unable to load forensic evidence.')
      setBackendStatus('BACKEND ERROR')
    } finally {
      setLoading(false)
    }
  }

  /*
   * Load persistent response history.
   */
  const loadActions = async () => {
    if (!evidenceId) return

    try {
      setLoadingActions(true)
      setActionError('')
      const response = await fetch(`${API_URL}/${encodeURIComponent(evidenceId)}/actions`)
      if (!response.ok) throw new Error('Unable to load forensic response history')

      const rawData: unknown = await response.json()
      const actionItems = unwrapArray(rawData, ['actions', 'items', 'history', 'records'])
      setActions(actionItems.map((item, index) => normalizeForensicAction(item, index, evidenceId)))
    } catch (caught) {
      console.error('Forensic action history error:', caught)
      setActions([])
      setActionError(caught instanceof Error ? caught.message : 'Unable to load response history.')
    } finally {
      setLoadingActions(false)
    }
  }

  useEffect(() => {
    loadEvidence()
    loadActions()
  }, [evidenceId])

  /*
   * Submit a persistent forensic response action.
   */
  const submitAction = async (action: string) => {
    if (!evidenceId) return

    try {
      setSubmittingAction(action)
      setActionError('')

      const response = await fetch(
        `${API_URL}/${encodeURIComponent(evidenceId)}/actions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action,
            analyst: 'SOC Analyst',
          }),
        },
      )

      if (!response.ok) {
        const detailText = await response.text()

        throw new Error(
          detailText || 'Unable to record forensic response action',
        )
      }

      const createdData: unknown = await response.json()
      const created = normalizeForensicAction(createdData, Date.now(), evidenceId)

      setActions((current) => [created, ...current])

      /*
       * MARK_VERIFIED changes the evidence status in the backend,
       * so refresh the evidence after every successful action.
       */
      await loadEvidence()

      setBackendStatus('BACKEND CONNECTED')
    } catch (error) {
      console.error('Forensic action error:', error)

      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to record forensic response action',
      )
    } finally {
      setSubmittingAction(null)
    }
  }

  /*
   * Derive correlation information directly from the backend.
   */
  const relatedProcess = useMemo(() => {
    return (
      detail?.correlations.find(
        (item) => item.type.toUpperCase() === 'PROCESS',
      )?.value || 'Not available from forensic telemetry'
    )
  }, [detail])

  const relatedFile = useMemo(() => {
    return (
      detail?.correlations.find(
        (item) => item.type.toUpperCase() === 'FILE',
      )?.value || 'Not available from forensic telemetry'
    )
  }, [detail])

  const relatedNetwork = useMemo(() => {
    return (
      detail?.correlations.find(
        (item) => item.type.toUpperCase() === 'NETWORK',
      )?.value || 'Not available from forensic telemetry'
    )
  }, [detail])

  const status = detail?.status ?? listItem?.status ?? 'COLLECTED'

  const statusClass = status.toLowerCase()

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="page-container">
        <div className="forensics-detail-not-found">
          <Database size={30} />

          <h2>Loading Evidence</h2>

          <p>
            Loading forensic evidence and investigation context
            from the CyberSentinel backend.
          </p>
        </div>
      </div>
    )
  }

  /*
   * Error / not found state
   */
  if (error || !listItem || !detail) {
    return (
      <div className="page-container">
        <div className="forensics-detail-not-found">
          <ShieldAlert size={30} />

          <h2>Evidence Not Found</h2>

          <p>
            {error ||
              'The requested forensic evidence item could not be loaded.'}
          </p>

          <Link
            to="/forensics"
            className="forensics-back-link"
          >
            <ArrowLeft size={14} />

            Back to Forensics
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">

      {/* =========================================
          HEADER
          ========================================= */}

      <div className="page-header">

        <div>

          <Link
            to="/forensics"
            className="forensics-detail-back"
          >
            <ArrowLeft size={14} />

            DIGITAL FORENSICS CENTER
          </Link>

          <div className="page-eyebrow">
            EVIDENCE INVESTIGATION
          </div>

          <h1>{listItem.name}</h1>

          <p>
            Detailed forensic investigation for evidence item{' '}
            {listItem.evidence_id}.
          </p>

        </div>

        <div
          className={`forensics-detail-status forensics-detail-status-${statusClass}`}
        >
          <span />

          {status}
        </div>

      </div>

      {/* =========================================
          EVIDENCE HERO
          ========================================= */}

      <section className="forensics-detail-hero">

        <div className="forensics-detail-identity">

          <div className="forensics-detail-icon">
            <FileSearch size={23} />
          </div>

          <div>

            <div className="forensics-detail-name">
              {listItem.name}
            </div>

            <div className="forensics-detail-id">
              {listItem.evidence_id} · {detail.evidence_type}
            </div>

          </div>

        </div>

        <div className="forensics-detail-endpoint">
          <span>ENDPOINT</span>

          <strong>{detail.endpoint}</strong>
        </div>

        <div className="forensics-detail-endpoint">
          <span>COLLECTED BY</span>

          <strong>{listItem.analyst}</strong>
        </div>

      </section>

      {/* =========================================
          METRICS
          ========================================= */}

      <section className="forensics-detail-metrics">

        <div className="forensics-detail-metric">

          <Database size={17} />

          <span>EVIDENCE TYPE</span>

          <strong>
            {detail.evidence_type}
          </strong>

        </div>

        <div className="forensics-detail-metric">

          <Clock3 size={17} />

          <span>COLLECTED</span>

          <strong>
            {listItem.collected}
          </strong>

        </div>

        <div className="forensics-detail-metric">

          <Terminal size={17} />

          <span>RELATED PROCESS</span>

          <strong>
            {relatedProcess}
          </strong>

        </div>

        <div className="forensics-detail-metric">

          <Hash size={17} />

          <span>ARTIFACT HASH</span>

          <strong>
            Not available from forensic telemetry
          </strong>

        </div>

      </section>

      {/* =========================================
          INVESTIGATION GRID
          ========================================= */}

      <section className="forensics-detail-grid">

        {/* Evidence Context */}

        <div className="forensics-detail-panel">

          <div className="forensics-detail-panel-header">

            <div>

              <strong>
                Evidence Context
              </strong>

              <span>
                Identity and acquisition information
              </span>

            </div>

            <Database size={18} />

          </div>

          <div className="forensics-detail-fields">

            <div>
              <span>EVIDENCE ID</span>

              <strong>
                {detail.evidence_id}
              </strong>
            </div>

            <div>
              <span>EVIDENCE TYPE</span>

              <strong>
                {detail.evidence_type}
              </strong>
            </div>

            <div>
              <span>ENDPOINT</span>

              <strong>
                {detail.endpoint}
              </strong>
            </div>

            <div>
              <span>SOURCE</span>

              <strong>
                {detail.source}
              </strong>
            </div>

            <div>
              <span>ANALYST</span>

              <strong>
                {listItem.analyst}
              </strong>
            </div>

            <div>
              <span>COLLECTED</span>

              <strong>
                {listItem.collected}
              </strong>
            </div>

            <div className="forensics-detail-field-wide">

              <span>
                DESCRIPTION
              </span>

              <strong>
                {listItem.description}
              </strong>

            </div>

          </div>

        </div>

        {/* Security Assessment */}

        <div className="forensics-detail-panel">

          <div className="forensics-detail-panel-header">

            <div>

              <strong>
                Analyst Assessment
              </strong>

              <span>
                Current forensic assessment
              </span>

            </div>

            <ShieldAlert size={18} />

          </div>

          <div className="forensics-assessment">

            <div
              className={`forensics-assessment-banner forensics-assessment-${statusClass}`}
            >

              {status === 'VERIFIED' ? (
                <CheckCircle2 size={17} />
              ) : (
                <AlertTriangle size={17} />
              )}

              <div>

                <strong>
                  {status} EVIDENCE
                </strong>

                <span>
                  Current investigation classification
                </span>

              </div>

            </div>

            <div className="forensics-assessment-row">

              <span>
                Source
              </span>

              <strong>
                {detail.source}
              </strong>

            </div>

            <div className="forensics-assessment-row">

              <span>
                Description
              </span>

              <strong>
                {listItem.description}
              </strong>

            </div>

            <div className="forensics-assessment-row">

              <span>
                Detailed analyst assessment
              </span>

              <strong>
                Not available from current forensic telemetry
              </strong>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          CORRELATION
          ========================================= */}

      <section className="forensics-detail-panel forensics-correlation-panel">

        <div className="forensics-detail-panel-header">

          <div>

            <strong>
              Evidence Correlation
            </strong>

            <span>
              Related forensic artifacts identified during
              investigation
            </span>

          </div>

          <Activity size={18} />

        </div>

        <div className="forensics-correlation-grid">

          <div className="forensics-correlation-card">

            <div className="forensics-correlation-icon">
              <Terminal size={16} />
            </div>

            <span>RELATED PROCESS</span>

            <strong>
              {relatedProcess}
            </strong>

          </div>

          <div className="forensics-correlation-card">

            <div className="forensics-correlation-icon">
              <FileSearch size={16} />
            </div>

            <span>RELATED FILE</span>

            <strong>
              {relatedFile}
            </strong>

          </div>

          <div className="forensics-correlation-card">

            <div className="forensics-correlation-icon">
              <Network size={16} />
            </div>

            <span>NETWORK CONTEXT</span>

            <strong>
              {relatedNetwork}
            </strong>

          </div>

        </div>

        {detail.correlations.length > 0 && (
          <div
            style={{
              marginTop: '18px',
              display: 'grid',
              gap: '8px',
            }}
          >
            {detail.correlations.map((item) => (
              <div
                key={`${item.type}-${item.value}`}
                style={{
                  padding: '10px 12px',
                  border:
                    '1px solid rgba(148, 163, 184, 0.12)',
                  borderRadius: '9px',
                  background:
                    'rgba(15, 23, 42, 0.45)',
                }}
              >
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    color: '#67e8f9',
                    marginBottom: '4px',
                  }}
                >
                  {item.type}
                </div>

                <strong
                  style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontSize: '12px',
                  }}
                >
                  {item.value}
                </strong>

                <span
                  style={{
                    display: 'block',
                    marginTop: '4px',
                    color: '#94a3b8',
                    fontSize: '11px',
                  }}
                >
                  {item.context}
                </span>
              </div>
            ))}
          </div>
        )}

      </section>

      {/* =========================================
          INVESTIGATION TIMELINE
          ========================================= */}

      <section className="forensics-detail-grid">

        <div className="forensics-detail-panel">

          <div className="forensics-detail-panel-header">

            <div>

              <strong>
                Investigation Timeline
              </strong>

              <span>
                Evidence collection and recorded response events
              </span>

            </div>

            <Clock3 size={18} />

          </div>

          <div className="forensics-detail-timeline">

            <div className="forensics-detail-timeline-item">

              <span />

              <div>

                <strong>
                  Evidence collected
                </strong>

                <small>
                  {listItem.collected}
                </small>

              </div>

            </div>

            {actions.map((item) => (

              <div
                className="forensics-detail-timeline-item"
                key={`timeline-${item.action_id}`}
              >

                <span />

                <div>

                  <strong>
                    {FORENSIC_ACTION_LABELS[item.action] ??
                      item.status}
                  </strong>

                  <small>
                    {formatActionDate(item.created_at)}
                    {' · '}
                    {item.analyst}
                  </small>

                </div>

              </div>

            ))}

            {actions.length === 0 && (
              <div
                style={{
                  color: '#64748b',
                  fontSize: '12px',
                  paddingTop: '4px',
                }}
              >
                No analyst response events have been
                recorded yet.
              </div>
            )}

          </div>

        </div>

        {/* Evidence Handling */}

        <div className="forensics-detail-panel">

          <div className="forensics-detail-panel-header">

            <div>

              <strong>
                Evidence Handling
              </strong>

              <span>
                Chain-of-custody style metadata
              </span>

            </div>

            <ShieldAlert size={18} />

          </div>

          <div className="forensics-handling-list">

            <div className="forensics-handling-item">

              <div className="forensics-handling-icon">
                <Database size={15} />
              </div>

              <div>

                <strong>
                  Collection
                </strong>

                <span>
                  {listItem.source}
                </span>

              </div>

              <b>
                RECORDED
              </b>

            </div>

            <div className="forensics-handling-item">

              <div className="forensics-handling-icon">
                <Hash size={15} />
              </div>

              <div>

                <strong>
                  Integrity
                </strong>

                <span>
                  Evidence integrity state: {status}
                </span>

              </div>

              <b>
                {status === 'VERIFIED'
                  ? 'VERIFIED'
                  : 'RECORDED'}
              </b>

            </div>

            <div className="forensics-handling-item">

              <div className="forensics-handling-icon">
                <User size={15} />
              </div>

              <div>

                <strong>
                  Analyst
                </strong>

                <span>
                  {listItem.analyst}
                </span>

              </div>

              <b>
                ASSIGNED
              </b>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          RESPONSE WORKFLOW
          ========================================= */}

      <section className="forensics-detail-panel forensics-response-panel">

        <div className="forensics-detail-panel-header">

          <div>

            <strong>
              Response Workflow
            </strong>

            <span>
              Persistent analyst actions for forensic evidence
              handling
            </span>

          </div>

          <ShieldAlert size={18} />

        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '18px',
            padding: '12px 14px',
            border:
              '1px solid rgba(148, 163, 184, 0.14)',
            borderRadius: '10px',
            background:
              'rgba(15, 23, 42, 0.55)',
          }}
        >

          <div>

            <div
              style={{
                fontSize: '11px',
                letterSpacing: '0.12em',
                color: '#94a3b8',
              }}
            >
              RESPONSE API
            </div>

            <strong
              style={{
                display: 'block',
                marginTop: '4px',
                fontSize: '12px',
              }}
            >
              {backendStatus}
            </strong>

          </div>

          <div
            style={{
              fontSize: '11px',
              color: '#94a3b8',
              textAlign: 'right',
            }}
          >
            Analyst: SOC Analyst
          </div>

        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px',
          }}
        >

          {[
            ['START_ANALYSIS', 'Start Analysis'],
            ['PRESERVE_EVIDENCE', 'Preserve Evidence'],
            ['ESCALATE_EVIDENCE', 'Escalate Evidence'],
            ['MARK_VERIFIED', 'Mark Verified'],
          ].map(([action, label]) => (

            <button
              key={action}
              type="button"
              onClick={() => submitAction(action)}
              disabled={submittingAction !== null}
              style={{
                border:
                  '1px solid rgba(34, 211, 238, 0.25)',
                background:
                  'rgba(8, 47, 73, 0.35)',
                color: '#e2e8f0',
                borderRadius: '9px',
                padding: '11px 12px',
                cursor:
                  submittingAction
                    ? 'wait'
                    : 'pointer',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {submittingAction === action
                ? 'Saving...'
                : label}
            </button>

          ))}

        </div>

        {actionError && (
          <div
            style={{
              marginTop: '12px',
              padding: '10px 12px',
              borderRadius: '8px',
              border:
                '1px solid rgba(248, 113, 113, 0.25)',
              background:
                'rgba(127, 29, 29, 0.18)',
              color: '#fca5a5',
              fontSize: '12px',
            }}
          >
            {actionError}
          </div>
        )}

        <div style={{ marginTop: '22px' }}>

          <div
            style={{
              fontSize: '11px',
              letterSpacing: '0.12em',
              color: '#94a3b8',
              marginBottom: '10px',
            }}
          >
            RESPONSE HISTORY
          </div>

          {loadingActions ? (

            <div
              style={{
                color: '#94a3b8',
                fontSize: '12px',
              }}
            >
              Loading response history...
            </div>

          ) : actions.length === 0 ? (

            <div
              style={{
                color: '#64748b',
                fontSize: '12px',
              }}
            >
              No response actions recorded for this
              evidence item.
            </div>

          ) : (

            <div
              style={{
                display: 'grid',
                gap: '8px',
              }}
            >

              {actions.map((item) => (

                <div
                  key={item.action_id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      '1fr auto',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '11px 12px',
                    border:
                      '1px solid rgba(148, 163, 184, 0.12)',
                    borderRadius: '9px',
                    background:
                      'rgba(15, 23, 42, 0.45)',
                  }}
                >

                  <div>

                    <strong
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        color: '#e2e8f0',
                      }}
                    >
                      {FORENSIC_ACTION_LABELS[
                        item.action
                      ] ?? item.status}
                    </strong>

                    <span
                      style={{
                        display: 'block',
                        marginTop: '4px',
                        fontSize: '11px',
                        color: '#94a3b8',
                      }}
                    >
                      {item.action_id}
                      {' · '}
                      {item.analyst}
                      {' · '}
                      {formatActionDate(
                        item.created_at,
                      )}
                    </span>

                  </div>

                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      color: '#67e8f9',
                    }}
                  >
                    {item.status}
                  </span>

                </div>

              ))}

            </div>

          )}

        </div>

        <div
          style={{
            marginTop: '16px',
            fontSize: '11px',
            color: '#64748b',
          }}
        >
          These actions record the analyst workflow in
          CyberSentinel. They do not directly alter, delete,
          or acquire evidence from the endpoint.
        </div>

      </section>

      {/* =========================================
          INVESTIGATION NOTES
          ========================================= */}

      <section className="forensics-detail-panel forensics-notes-panel">

        <div className="forensics-detail-panel-header">

          <div>

            <strong>
              Investigation Notes
            </strong>

            <span>
              Initial forensic observations
            </span>

          </div>

          <FileSearch size={18} />

        </div>

        <div className="forensics-notes">

          <p>
            <AlertTriangle size={14} />

            Review the evidence together with the associated
            process, file, network, and user telemetry.
          </p>

          <p>
            <Activity size={14} />

            Backend correlations currently associated with
            this evidence item are shown above.
          </p>

          <p>
            <ShieldAlert size={14} />

            Preserve the original evidence metadata before
            performing any remediation or containment action.
          </p>

        </div>

      </section>

    </div>
  )
}

export default ForensicsDetails