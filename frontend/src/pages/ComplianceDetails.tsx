import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileSearch,
  ShieldAlert,
  Target,
  TriangleAlert,
} from 'lucide-react'

type ComplianceControl = {
  control_id: string
  framework: string
  control_name: string
  description: string
  category: string
  status: string
  owner: string
  evidence_status: string
  related_event_ids: string[]
  related_alert_ids: string[]
  related_incident_ids: string[]
  last_reviewed: string | null
}

function getStatusStyle(status: string) {
  switch (status.toUpperCase()) {
    case 'COMPLIANT':
      return {
        color: '#4ade80',
        background: 'rgba(34, 197, 94, 0.10)',
        border: 'rgba(34, 197, 94, 0.35)',
      }

    case 'NON_COMPLIANT':
      return {
        color: '#ff6b6b',
        background: 'rgba(239, 68, 68, 0.10)',
        border: 'rgba(239, 68, 68, 0.35)',
      }

    case 'NEEDS_REVIEW':
      return {
        color: '#fbbf24',
        background: 'rgba(245, 158, 11, 0.10)',
        border: 'rgba(245, 158, 11, 0.35)',
      }

    case 'PARTIAL':
      return {
        color: '#60a5fa',
        background: 'rgba(59, 130, 246, 0.10)',
        border: 'rgba(59, 130, 246, 0.35)',
      }

    default:
      return {
        color: '#94a3b8',
        background: 'rgba(148, 163, 184, 0.10)',
        border: 'rgba(148, 163, 184, 0.25)',
      }
  }
}

function getEvidenceStyle(status: string) {
  switch (status.toUpperCase()) {
    case 'VERIFIED':
      return {
        color: '#4ade80',
        background: 'rgba(34, 197, 94, 0.10)',
      }

    case 'PENDING':
      return {
        color: '#fbbf24',
        background: 'rgba(245, 158, 11, 0.10)',
      }

    case 'MISSING':
      return {
        color: '#ff6b6b',
        background: 'rgba(239, 68, 68, 0.10)',
      }

    default:
      return {
        color: '#94a3b8',
        background: 'rgba(148, 163, 184, 0.10)',
      }
  }
}

function formatStatus(value: string) {
  return value.replace(/_/g, ' ')
}

function formatDate(value: string | null) {
  if (!value) return 'Not reviewed'

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

function CorrelationCard({
  title,
  icon,
  ids,
  hrefPrefix,
}: {
  title: string
  icon: React.ReactNode
  ids: string[]
  hrefPrefix: string
}) {
  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <div>
          <div className="page-eyebrow">{title}</div>
          <h3 style={{ marginTop: 6 }}>
            {ids.length} linked {ids.length === 1 ? 'record' : 'records'}
          </h3>
        </div>

        {icon}
      </div>

      {ids.length === 0 ? (
        <div
          style={{
            padding: '20px 0',
            color: '#64748b',
            fontSize: 14,
          }}
        >
          No correlated records.
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 18,
          }}
        >
          {ids.map((id) => (
            <Link
              key={id}
              to={`${hrefPrefix}/${encodeURIComponent(id)}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 12px',
                borderRadius: 8,
                border: '1px solid rgba(34, 211, 238, 0.22)',
                background: 'rgba(34, 211, 238, 0.06)',
                color: '#22d3ee',
                textDecoration: 'none',
                fontFamily: 'monospace',
                fontSize: 13,
              }}
            >
              {id}
              <ExternalLink size={13} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ComplianceDetails() {
  const { controlId } = useParams<{ controlId: string }>()

  const [control, setControl] = useState<ComplianceControl | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!controlId) return

    const loadControl = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `http://127.0.0.1:8001/api/compliance/${encodeURIComponent(controlId)}`,
        )

        if (!response.ok) {
          throw new Error('Compliance control could not be loaded.')
        }

        const data: ComplianceControl = await response.json()
        setControl(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load compliance control.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadControl()
  }, [controlId])

  const statusStyle = useMemo(
    () => getStatusStyle(control?.status || ''),
    [control?.status],
  )

  const evidenceStyle = useMemo(
    () => getEvidenceStyle(control?.evidence_status || ''),
    [control?.evidence_status],
  )

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">GOVERNANCE & RISK</div>
            <h1>Compliance Control</h1>
            <p>Loading control details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !control) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">GOVERNANCE & RISK</div>
            <h1>Compliance Control</h1>
            <p>{error || 'Control not found.'}</p>
          </div>
        </div>

        <Link
          to="/compliance"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: '#22d3ee',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={17} />
          Back to Compliance Center
        </Link>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div
        style={{
          marginBottom: 22,
        }}
      >
        <Link
          to="/compliance"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: '#22d3ee',
            textDecoration: 'none',
            fontSize: 14,
          }}
        >
          <ArrowLeft size={17} />
          Back to Compliance Center
        </Link>
      </div>

      <div className="page-header">
        <div>
          <div className="page-eyebrow">GOVERNANCE & RISK</div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <h1>{control.control_name}</h1>

            <span
              style={{
                padding: '6px 11px',
                borderRadius: 999,
                border: `1px solid ${statusStyle.border}`,
                background: statusStyle.background,
                color: statusStyle.color,
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              {formatStatus(control.status)}
            </span>
          </div>

          <p>
            {control.control_id} · {control.framework}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '11px 15px',
            borderRadius: 10,
            background: evidenceStyle.background,
            color: evidenceStyle.color,
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          <FileSearch size={17} />
          Evidence: {formatStatus(control.evidence_status)}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              color: '#22d3ee',
            }}
          >
            <Target size={18} />
            Framework
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {control.framework}
          </div>

          <div
            style={{
              marginTop: 7,
              color: '#64748b',
              fontSize: 13,
            }}
          >
            {control.control_id}
          </div>
        </div>

        <div className="stat-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              color: '#22d3ee',
            }}
          >
            <ClipboardCheck size={18} />
            Evidence
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: 24,
              fontWeight: 700,
              color: evidenceStyle.color,
            }}
          >
            {formatStatus(control.evidence_status)}
          </div>

          <div
            style={{
              marginTop: 7,
              color: '#64748b',
              fontSize: 13,
            }}
          >
            Current evidence state
          </div>
        </div>

        <div className="stat-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              color: '#22d3ee',
            }}
          >
            <ShieldAlert size={18} />
            Correlations
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {control.related_event_ids.length +
              control.related_alert_ids.length +
              control.related_incident_ids.length}
          </div>

          <div
            style={{
              marginTop: 7,
              color: '#64748b',
              fontSize: 13,
            }}
          >
            Events, alerts & incidents
          </div>
        </div>

        <div className="stat-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              color: '#22d3ee',
            }}
          >
            <CheckCircle2 size={18} />
            Last Reviewed
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            {formatDate(control.last_reviewed)}
          </div>

          <div
            style={{
              marginTop: 7,
              color: '#64748b',
              fontSize: 13,
            }}
          >
            Control review date
          </div>
        </div>
      </div>

      <div
        className="dashboard-grid"
        style={{
          marginTop: 22,
        }}
      >
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <div className="page-eyebrow">CONTROL PROFILE</div>
              <h3>Control Description</h3>
            </div>

            <ShieldAlert size={22} color="#22d3ee" />
          </div>

          <p
            style={{
              marginTop: 18,
              color: '#94a3b8',
              lineHeight: 1.7,
            }}
          >
            {control.description}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 18,
              marginTop: 24,
            }}
          >
            <div>
              <div className="page-eyebrow">CATEGORY</div>
              <div style={{ marginTop: 7 }}>{control.category}</div>
            </div>

            <div>
              <div className="page-eyebrow">CONTROL OWNER</div>
              <div style={{ marginTop: 7 }}>{control.owner}</div>
            </div>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <div className="page-eyebrow">EVIDENCE STATUS</div>
              <h3>Evidence Assessment</h3>
            </div>

            <FileSearch size={22} color="#22d3ee" />
          </div>

          <div
            style={{
              marginTop: 22,
              padding: 18,
              borderRadius: 10,
              background: evidenceStyle.background,
              border: `1px solid ${evidenceStyle.color}30`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: evidenceStyle.color,
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              {control.evidence_status === 'VERIFIED' ? (
                <CheckCircle2 size={18} />
              ) : (
                <TriangleAlert size={18} />
              )}

              {formatStatus(control.evidence_status)}
            </div>

            <p
              style={{
                marginTop: 10,
                marginBottom: 0,
                color: '#94a3b8',
                lineHeight: 1.6,
              }}
            >
              Evidence records associated with this control can be reviewed
              alongside its correlated security activity.
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <div className="page-eyebrow">SECURITY CORRELATION</div>

        <h2
          style={{
            marginTop: 6,
            marginBottom: 18,
          }}
        >
          Related Security Activity
        </h2>

        <div
          className="dashboard-grid"
          style={{
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          }}
        >
          <CorrelationCard
            title="Security Events"
            icon={<ShieldAlert size={21} color="#22d3ee" />}
            ids={control.related_event_ids}
            hrefPrefix="/soc/events"
          />

          <CorrelationCard
            title="Security Alerts"
            icon={<TriangleAlert size={21} color="#fbbf24" />}
            ids={control.related_alert_ids}
            hrefPrefix="/alerts"
          />

          <CorrelationCard
            title="Incidents"
            icon={<Target size={21} color="#ff6b6b" />}
            ids={control.related_incident_ids}
            hrefPrefix="/incidents"
          />
        </div>
      </div>
    </div>
  )
}