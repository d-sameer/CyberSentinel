import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Boxes,
  CheckCircle2,
  CircleAlert,
  GitBranch,
  Network,
  RefreshCw,
  Shield,
  Users,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

type ArchitectureRecord = {
  id: number
  architecture_id: string
  name: string
  description: string
  architecture_type: string
  zone: string
  security_layer: string
  component_type: string
  status: string
  criticality: string
  owner: string
  technologies: string[]
  security_controls: string[]
  connected_components: string[]
  trust_level: string
  exposure: string
  risk_level: string
  created_at: string | null
  updated_at: string | null
}

const API_BASE = 'http://127.0.0.1:8001'

function badgeStyle(value: string) {
  const normalized = value.toUpperCase()

  if (
    ['CRITICAL', 'HIGH', 'EXTERNAL'].includes(normalized)
  ) {
    return {
      background: 'rgba(239, 68, 68, 0.12)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      color: '#f87171',
    }
  }

  if (
    ['MEDIUM', 'CONTROLLED'].includes(normalized)
  ) {
    return {
      background: 'rgba(245, 158, 11, 0.12)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      color: '#fbbf24',
    }
  }

  if (
    [
      'ACTIVE',
      'INTERNAL',
      'TRUSTED',
      'HIGHLY TRUSTED',
    ].includes(normalized)
  ) {
    return {
      background: 'rgba(34, 197, 94, 0.12)',
      border: '1px solid rgba(34, 197, 94, 0.3)',
      color: '#4ade80',
    }
  }

  return {
    background: 'rgba(100, 116, 139, 0.12)',
    border: '1px solid rgba(100, 116, 139, 0.3)',
    color: '#94a3b8',
  }
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function TagList({
  items,
  emptyText = 'No records',
}: {
  items: string[]
  emptyText?: string
}) {
  if (!items.length) {
    return (
      <div
        style={{
          color: '#64748b',
          fontSize: 13,
        }}
      >
        {emptyText}
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
      }}
    >
      {items.map((item) => (
        <span
          key={item}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '7px 10px',
            borderRadius: 8,
            background: 'rgba(15, 23, 42, 0.75)',
            border:
              '1px solid rgba(148, 163, 184, 0.14)',
            color: '#cbd5e1',
            fontSize: 12,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

export default function SecurityArchitectureDetails() {
  const { architectureId } = useParams<{
    architectureId: string
  }>()

  const [architecture, setArchitecture] =
    useState<ArchitectureRecord | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const loadArchitecture = async () => {
    if (!architectureId) {
      setError('Architecture component ID is missing.')
      setLoading(false)
      return
    }

    try {
      setError('')

      const response = await fetch(
        `${API_BASE}/api/architecture/${architectureId}`,
      )

      if (!response.ok) {
        throw new Error(
          'Failed to load architecture component',
        )
      }

      const result: ArchitectureRecord =
        await response.json()

      setArchitecture(result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load architecture component',
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadArchitecture()
  }, [architectureId])

  const riskMessage = useMemo(() => {
    if (!architecture) return ''

    if (
      architecture.risk_level === 'CRITICAL'
    ) {
      return 'Critical architecture risk requires immediate security review.'
    }

    if (architecture.risk_level === 'HIGH') {
      return 'High architecture risk should remain under active security monitoring.'
    }

    if (architecture.risk_level === 'MEDIUM') {
      return 'Moderate architecture risk should be tracked through normal security governance.'
    }

    return 'Architecture risk is currently classified as low.'
  }, [architecture])

  if (loading) {
    return (
      <div className="page-container">
        <div className="dashboard-panel">
          <div
            style={{
              padding: 50,
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            Loading architecture component...
          </div>
        </div>
      </div>
    )
  }

  if (error || !architecture) {
    return (
      <div className="page-container">
        <div
          className="dashboard-panel"
          style={{
            borderColor:
              'rgba(239, 68, 68, 0.3)',
          }}
        >
          <div
            style={{
              padding: 40,
              textAlign: 'center',
            }}
          >
            <CircleAlert
              size={30}
              color="#f87171"
            />

            <h2
              style={{
                marginTop: 14,
                color: '#e2e8f0',
              }}
            >
              Architecture Component Not Found
            </h2>

            <p
              style={{
                color: '#64748b',
                marginTop: 8,
              }}
            >
              {error ||
                'The requested architecture component could not be loaded.'}
            </p>

            <Link
              to="/architecture"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 20,
                color: '#67e8f9',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              <ArrowLeft size={16} />
              Return to Architecture
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <Link
            to="/architecture"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              color: '#67e8f9',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 18,
            }}
          >
            <ArrowLeft size={15} />
            Back to Security Architecture
          </Link>

          <div className="page-eyebrow">
            ARCHITECTURE COMPONENT
          </div>

          <h1>{architecture.name}</h1>

          <p>{architecture.description}</p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 10,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 13px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              ...badgeStyle(
                architecture.status,
              ),
            }}
          >
            <CheckCircle2 size={15} />
            {architecture.status}
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 13px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              ...badgeStyle(
                architecture.risk_level,
              ),
            }}
          >
            <CircleAlert size={15} />
            {architecture.risk_level} RISK
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-label">
            Architecture ID
          </div>

          <div
            className="stat-card-value"
            style={{
              fontSize: 25,
              fontFamily: 'monospace',
            }}
          >
            {architecture.architecture_id}
          </div>

          <div className="stat-card-meta">
            Registered component
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">
            Security Layer
          </div>

          <div
            className="stat-card-value"
            style={{
              fontSize: 24,
            }}
          >
            {architecture.security_layer}
          </div>

          <div className="stat-card-meta">
            {architecture.architecture_type}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">
            Trust Level
          </div>

          <div
            className="stat-card-value"
            style={{
              fontSize: 23,
            }}
          >
            {architecture.trust_level}
          </div>

          <div className="stat-card-meta">
            {architecture.zone} zone
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">
            Owner
          </div>

          <div
            className="stat-card-value"
            style={{
              fontSize: 23,
            }}
          >
            {architecture.owner}
          </div>

          <div className="stat-card-meta">
            Responsible security team
          </div>
        </div>
      </div>

      <div
        className="dashboard-grid"
        style={{
          marginTop: 20,
        }}
      >
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Architecture Overview</h2>
              <span>
                Component classification and security
                boundary
              </span>
            </div>

            <Boxes size={18} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(2, minmax(0, 1fr))',
              gap: 12,
            }}
          >
            <InfoCard
              label="Component Type"
              value={architecture.component_type}
            />

            <InfoCard
              label="Architecture Type"
              value={architecture.architecture_type}
            />

            <InfoCard
              label="Security Zone"
              value={architecture.zone}
            />

            <InfoCard
              label="Security Layer"
              value={architecture.security_layer}
            />

            <InfoCard
              label="Criticality"
              value={architecture.criticality}
              badge
            />

            <InfoCard
              label="Exposure"
              value={architecture.exposure}
              badge
            />
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Risk & Trust</h2>
              <span>
                Architecture security posture
              </span>
            </div>

            <Shield size={18} />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <RiskRow
              label="Risk Level"
              value={architecture.risk_level}
            />

            <RiskRow
              label="Criticality"
              value={architecture.criticality}
            />

            <RiskRow
              label="Trust Level"
              value={architecture.trust_level}
            />

            <RiskRow
              label="Exposure"
              value={architecture.exposure}
            />

            <div
              style={{
                padding: 14,
                borderRadius: 10,
                background:
                  'rgba(15, 23, 42, 0.6)',
                border:
                  '1px solid rgba(148, 163, 184, 0.1)',
                color: '#94a3b8',
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              {riskMessage}
            </div>
          </div>
        </div>
      </div>

      <div
        className="dashboard-grid"
        style={{
          marginTop: 20,
        }}
      >
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Technology Stack</h2>
              <span>
                Technologies associated with this
                component
              </span>
            </div>

            <Network size={18} />
          </div>

          <TagList
            items={architecture.technologies}
          />
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Security Controls</h2>
              <span>
                Controls protecting this component
              </span>
            </div>

            <Shield size={18} />
          </div>

          <TagList
            items={architecture.security_controls}
          />
        </div>
      </div>

      <div
        className="dashboard-panel"
        style={{
          marginTop: 20,
        }}
      >
        <div className="panel-header">
          <div>
            <h2>Connected Components</h2>
            <span>
              Architecture relationships and trust
              boundaries
            </span>
          </div>

          <GitBranch size={18} />
        </div>

        {architecture.connected_components.length ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 10,
            }}
          >
            {architecture.connected_components.map(
              (componentId) => (
                <Link
                  key={componentId}
                  to={`/architecture/${componentId}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      'space-between',
                    gap: 10,
                    padding: '13px 14px',
                    borderRadius: 10,
                    background:
                      'rgba(15, 23, 42, 0.65)',
                    border:
                      '1px solid rgba(148, 163, 184, 0.12)',
                    color: '#67e8f9',
                    textDecoration: 'none',
                    fontFamily: 'monospace',
                    fontSize: 12,
                  }}
                >
                  {componentId}
                  <ArrowLeft
                    size={14}
                    style={{
                      transform: 'rotate(180deg)',
                    }}
                  />
                </Link>
              ),
            )}
          </div>
        ) : (
          <div
            style={{
              color: '#64748b',
              fontSize: 13,
            }}
          >
            No connected components recorded.
          </div>
        )}
      </div>

      <div
        className="dashboard-panel"
        style={{
          marginTop: 20,
        }}
      >
        <div className="panel-header">
          <div>
            <h2>Architecture Ownership</h2>
            <span>
              Administrative responsibility
            </span>
          </div>

          <Users size={18} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(3, minmax(0, 1fr))',
            gap: 12,
          }}
        >
          <InfoCard
            label="Owner"
            value={architecture.owner}
          />

          <InfoCard
            label="Zone"
            value={architecture.zone}
          />

          <InfoCard
            label="Component Type"
            value={architecture.component_type}
          />
        </div>
      </div>

      <div
        className="dashboard-panel"
        style={{
          marginTop: 20,
        }}
      >
        <div className="panel-header">
          <div>
            <h2>Architecture Metadata</h2>
            <span>
              Administrative record information
            </span>
          </div>

          <Boxes size={18} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(3, minmax(0, 1fr))',
            gap: 20,
          }}
        >
          <MetaItem
            label="Created"
            value={formatDate(
              architecture.created_at,
            )}
          />

          <MetaItem
            label="Last Updated"
            value={formatDate(
              architecture.updated_at,
            )}
          />

          <MetaItem
            label="Architecture ID"
            value={architecture.architecture_id}
            accent
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          marginTop: 20,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => {
            setRefreshing(true)
            loadArchitecture()
          }}
          disabled={refreshing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 15px',
            borderRadius: 8,
            border:
              '1px solid rgba(148, 163, 184, 0.15)',
            background: '#0f172a',
            color: '#cbd5e1',
            cursor: refreshing
              ? 'not-allowed'
              : 'pointer',
          }}
        >
          <RefreshCw
            size={15}
            style={{
              animation: refreshing
                ? 'spin 1s linear infinite'
                : undefined,
            }}
          />
          Refresh Component
        </button>

        <Link
          to="/architecture"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '13px 20px',
            borderRadius: 9,
            background: 'rgba(34, 211, 238, 0.12)',
            border:
              '1px solid rgba(34, 211, 238, 0.25)',
            color: '#67e8f9',
            textDecoration: 'none',
            fontWeight: 800,
          }}
        >
          <ArrowLeft size={16} />
          Return to Architecture
        </Link>
      </div>
    </div>
  )
}

function InfoCard({
  label,
  value,
  badge = false,
}: {
  label: string
  value: string
  badge?: boolean
}) {
  return (
    <div
      style={{
        padding: 15,
        borderRadius: 10,
        background: 'rgba(15, 23, 42, 0.55)',
        border:
          '1px solid rgba(148, 163, 184, 0.1)',
      }}
    >
      <div
        style={{
          color: '#64748b',
          fontSize: 10,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
        }}
      >
        {label}
      </div>

      {badge ? (
        <span
          style={{
            display: 'inline-flex',
            marginTop: 9,
            padding: '5px 9px',
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 800,
            ...badgeStyle(value),
          }}
        >
          {value}
        </span>
      ) : (
        <div
          style={{
            marginTop: 8,
            color: '#e2e8f0',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {value}
        </div>
      )}
    </div>
  )
}

function RiskRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 15,
        paddingBottom: 12,
        borderBottom:
          '1px solid rgba(148, 163, 184, 0.08)',
      }}
    >
      <span
        style={{
          color: '#64748b',
          fontSize: 12,
        }}
      >
        {label}
      </span>

      <span
        style={{
          display: 'inline-flex',
          padding: '5px 9px',
          borderRadius: 999,
          fontSize: 10,
          fontWeight: 800,
          ...badgeStyle(value),
        }}
      >
        {value}
      </span>
    </div>
  )
}

function MetaItem({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div>
      <div
        style={{
          color: '#64748b',
          fontSize: 10,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 8,
          color: accent
            ? '#67e8f9'
            : '#cbd5e1',
          fontSize: 13,
          fontFamily: accent
            ? 'monospace'
            : undefined,
        }}
      >
        {value}
      </div>
    </div>
  )
}