import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Filter,
  Search,
  ShieldAlert,
  ShieldCheck,
  Target,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { MouseEvent as ReactMouseEvent } from 'react'

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

type FrameworkSummary = {
  framework: string
  total: number
  compliant: number
  non_compliant: number
  needs_review: number
  partial: number
  score: number
}

type ComplianceResponse = {
  summary: {
    compliance_score: number
    total_controls: number
    compliant: number
    non_compliant: number
    needs_review: number
    partial: number
    evidence_verified: number
    evidence_pending: number
    evidence_missing: number
    compliance_rate: number
  }
  frameworks: FrameworkSummary[]
  controls: ComplianceControl[]
}

const API_URL = 'http://127.0.0.1:8000/api/compliance'

function statusStyle(status: string) {
  switch (status.toUpperCase()) {
    case 'COMPLIANT':
      return {
        background: 'rgba(34, 197, 94, 0.12)',
        border: '1px solid rgba(34, 197, 94, 0.28)',
        color: '#4ade80',
      }

    case 'NON_COMPLIANT':
      return {
        background: 'rgba(239, 68, 68, 0.12)',
        border: '1px solid rgba(239, 68, 68, 0.28)',
        color: '#f87171',
      }

    case 'NEEDS_REVIEW':
      return {
        background: 'rgba(245, 158, 11, 0.12)',
        border: '1px solid rgba(245, 158, 11, 0.28)',
        color: '#fbbf24',
      }

    case 'PARTIAL':
      return {
        background: 'rgba(59, 130, 246, 0.12)',
        border: '1px solid rgba(59, 130, 246, 0.28)',
        color: '#60a5fa',
      }

    default:
      return {
        background: 'rgba(148, 163, 184, 0.10)',
        border: '1px solid rgba(148, 163, 184, 0.20)',
        color: '#94a3b8',
      }
  }
}

function evidenceStyle(status: string) {
  switch (status.toUpperCase()) {
    case 'VERIFIED':
      return {
        background: 'rgba(34, 197, 94, 0.10)',
        color: '#4ade80',
      }

    case 'MISSING':
      return {
        background: 'rgba(239, 68, 68, 0.10)',
        color: '#f87171',
      }

    case 'PENDING':
      return {
        background: 'rgba(245, 158, 11, 0.10)',
        color: '#fbbf24',
      }

    default:
      return {
        background: 'rgba(148, 163, 184, 0.10)',
        color: '#94a3b8',
      }
  }
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(' ')
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Not reviewed'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  )
}

function getScoreColor(score: number) {
  if (score >= 80) {
    return '#4ade80'
  }

  if (score >= 60) {
    return '#fbbf24'
  }

  return '#f87171'
}

function Compliance() {
  const [data, setData] =
    useState<ComplianceResponse | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [search, setSearch] =
    useState('')

  const [frameworkFilter, setFrameworkFilter] =
    useState('ALL')

  const [statusFilter, setStatusFilter] =
    useState('ALL')

  useEffect(() => {
    let cancelled = false

    async function loadCompliance() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(API_URL)

        if (!response.ok) {
          throw new Error(
            `Compliance API returned ${response.status}`,
          )
        }

        const result =
          (await response.json()) as ComplianceResponse

        if (!cancelled) {
          setData(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load compliance data.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadCompliance()

    return () => {
      cancelled = true
    }
  }, [])

  const frameworks = useMemo(() => {
    if (!data) {
      return []
    }

    return data.frameworks
  }, [data])

  const filteredControls = useMemo(() => {
    if (!data) {
      return []
    }

    const query =
      search.trim().toLowerCase()

    return data.controls.filter((control) => {
      const matchesSearch =
        !query ||
        control.control_id
          .toLowerCase()
          .includes(query) ||
        control.control_name
          .toLowerCase()
          .includes(query) ||
        control.category
          .toLowerCase()
          .includes(query) ||
        control.owner
          .toLowerCase()
          .includes(query)

      const matchesFramework =
        frameworkFilter === 'ALL' ||
        control.framework === frameworkFilter

      const matchesStatus =
        statusFilter === 'ALL' ||
        control.status === statusFilter

      return (
        matchesSearch &&
        matchesFramework &&
        matchesStatus
      )
    })
  }, [
    data,
    search,
    frameworkFilter,
    statusFilter,
  ])

  if (loading) {
    return (
      <div className="page-container">
        <div
          style={{
            minHeight: 420,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            fontSize: 14,
          }}
        >
          Loading compliance data...
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="page-container">
        <div
          className="dashboard-panel"
          style={{
            borderColor:
              'rgba(239, 68, 68, 0.30)',
          }}
        >
          <div className="panel-header">
            <div>
              <div className="page-eyebrow">
                COMPLIANCE CENTER
              </div>

              <h2
                style={{
                  margin: '8px 0 0',
                  color: '#f8fafc',
                  fontSize: 20,
                }}
              >
                Unable to load compliance data
              </h2>
            </div>

            <AlertTriangle
              size={22}
              color="#f87171"
            />
          </div>

          <p
            style={{
              color: '#94a3b8',
              margin: 0,
              fontSize: 14,
            }}
          >
            {error ||
              'The Compliance API did not return data.'}
          </p>
        </div>
      </div>
    )
  }

  const score =
    data.summary.compliance_score

  const scoreColor =
    getScoreColor(score)

  const attentionCount =
    data.summary.non_compliant +
    data.summary.needs_review

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            GOVERNANCE &amp; RISK
          </div>

          <h1>
            Compliance Center
          </h1>

          <p>
            Monitor security controls, evidence
            coverage, and framework compliance.
          </p>
        </div>

        <div
          className="page-status"
          style={{
            color: scoreColor,
            borderColor: `${scoreColor}45`,
            background: `${scoreColor}12`,
          }}
        >
          <ShieldCheck size={15} />
          {score >= 80
            ? 'COMPLIANCE HEALTHY'
            : score >= 60
              ? 'REVIEW REQUIRED'
              : 'COMPLIANCE RISK'}
        </div>
      </div>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span>Compliance Score</span>

            <ShieldCheck size={18} />
          </div>

          <div
            className="stat-card-value"
            style={{
              color: scoreColor,
            }}
          >
            {score}%
          </div>

          <div className="stat-card-meta">
            Overall control posture
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Total Controls</span>

            <ClipboardCheck size={18} />
          </div>

          <div className="stat-card-value">
            {data.summary.total_controls}
          </div>

          <div className="stat-card-meta">
            Across {frameworks.length} frameworks
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Compliant</span>

            <CheckCircle2 size={18} />
          </div>

          <div
            className="stat-card-value"
            style={{
              color: '#4ade80',
            }}
          >
            {data.summary.compliant}
          </div>

          <div className="stat-card-meta">
            {data.summary.compliance_rate}%
            direct compliance rate
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Attention Required</span>

            <ShieldAlert size={18} />
          </div>

          <div
            className="stat-card-value"
            style={{
              color:
                attentionCount > 0
                  ? '#fbbf24'
                  : '#4ade80',
            }}
          >
            {attentionCount}
          </div>

          <div className="stat-card-meta">
            Non-compliant + review
          </div>
        </div>
      </div>

      {/* ======================================================
          FRAMEWORKS + EVIDENCE
      ====================================================== */}

      <div
        className="dashboard-grid"
        style={{
          gridTemplateColumns:
            'minmax(0, 1.6fr) minmax(300px, 1fr)',
          marginTop: 18,
        }}
      >
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <div className="page-eyebrow">
                FRAMEWORK COVERAGE
              </div>

              <h2
                style={{
                  margin: '6px 0 0',
                  fontSize: 18,
                  color: '#f8fafc',
                }}
              >
                Framework Overview
              </h2>
            </div>

            <Target
              size={20}
              color="#38bdf8"
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(2, minmax(0, 1fr))',
              gap: 12,
            }}
          >
            {frameworks.map((framework) => {
              const color =
                getScoreColor(
                  framework.score,
                )

              return (
                <div
                  key={framework.framework}
                  style={{
                    padding: 16,
                    border:
                      '1px solid rgba(148,163,184,0.14)',
                    borderRadius: 12,
                    background:
                      'rgba(15,23,42,0.48)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 650,
                          color: '#e2e8f0',
                          fontSize: 14,
                        }}
                      >
                        {framework.framework}
                      </div>

                      <div
                        style={{
                          color: '#64748b',
                          fontSize: 12,
                          marginTop: 4,
                        }}
                      >
                        {framework.total} controls
                      </div>
                    </div>

                    <div
                      style={{
                        color,
                        fontWeight: 700,
                        fontSize: 18,
                      }}
                    >
                      {framework.score}%
                    </div>
                  </div>

                  <div
                    style={{
                      height: 6,
                      marginTop: 14,
                      borderRadius: 99,
                      background:
                        'rgba(51,65,85,0.65)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(
                          framework.score,
                          100,
                        )}%`,
                        height: '100%',
                        background: color,
                        borderRadius: 99,
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      flexWrap: 'wrap',
                      marginTop: 12,
                      fontSize: 11,
                    }}
                  >
                    <span
                      style={{
                        color: '#4ade80',
                      }}
                    >
                      {framework.compliant}{' '}
                      compliant
                    </span>

                    <span
                      style={{
                        color: '#60a5fa',
                      }}
                    >
                      {framework.partial}{' '}
                      partial
                    </span>

                    <span
                      style={{
                        color: '#fbbf24',
                      }}
                    >
                      {framework.needs_review}{' '}
                      review
                    </span>

                    <span
                      style={{
                        color: '#f87171',
                      }}
                    >
                      {framework.non_compliant}{' '}
                      failed
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <div className="page-eyebrow">
                EVIDENCE
              </div>

              <h2
                style={{
                  margin: '6px 0 0',
                  fontSize: 18,
                  color: '#f8fafc',
                }}
              >
                Evidence Coverage
              </h2>
            </div>

            <FileCheck2
              size={20}
              color="#38bdf8"
            />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  fontSize: 13,
                  marginBottom: 7,
                }}
              >
                <span
                  style={{
                    color: '#cbd5e1',
                  }}
                >
                  Verified
                </span>

                <strong
                  style={{
                    color: '#4ade80',
                  }}
                >
                  {data.summary.evidence_verified}
                </strong>
              </div>

              <div
                style={{
                  height: 7,
                  background:
                    'rgba(51,65,85,0.65)',
                  borderRadius: 99,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${
                      data.summary.total_controls
                        ? (
                            data.summary
                              .evidence_verified /
                            data.summary
                              .total_controls
                          ) * 100
                        : 0
                    }%`,
                    height: '100%',
                    background: '#4ade80',
                  }}
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  fontSize: 13,
                  marginBottom: 7,
                }}
              >
                <span
                  style={{
                    color: '#cbd5e1',
                  }}
                >
                  Pending
                </span>

                <strong
                  style={{
                    color: '#fbbf24',
                  }}
                >
                  {data.summary.evidence_pending}
                </strong>
              </div>

              <div
                style={{
                  height: 7,
                  background:
                    'rgba(51,65,85,0.65)',
                  borderRadius: 99,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${
                      data.summary.total_controls
                        ? (
                            data.summary
                              .evidence_pending /
                            data.summary
                              .total_controls
                          ) * 100
                        : 0
                    }%`,
                    height: '100%',
                    background: '#fbbf24',
                  }}
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  fontSize: 13,
                  marginBottom: 7,
                }}
              >
                <span
                  style={{
                    color: '#cbd5e1',
                  }}
                >
                  Missing
                </span>

                <strong
                  style={{
                    color: '#f87171',
                  }}
                >
                  {data.summary.evidence_missing}
                </strong>
              </div>

              <div
                style={{
                  height: 7,
                  background:
                    'rgba(51,65,85,0.65)',
                  borderRadius: 99,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${
                      data.summary.total_controls
                        ? (
                            data.summary
                              .evidence_missing /
                            data.summary
                              .total_controls
                          ) * 100
                        : 0
                    }%`,
                    height: '100%',
                    background: '#f87171',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          CONTROLS
      ====================================================== */}

      <div
        className="dashboard-panel"
        style={{
          marginTop: 18,
        }}
      >
        <div className="panel-header">
          <div>
            <div className="page-eyebrow">
              CONTROL MONITORING
            </div>

            <h2
              style={{
                margin: '6px 0 0',
                fontSize: 18,
                color: '#f8fafc',
              }}
            >
              Compliance Controls
            </h2>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              color: '#64748b',
              fontSize: 12,
            }}
          >
            <Filter size={15} />

            {filteredControls.length} results
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(220px, 1.5fr) repeat(2, minmax(180px, 1fr))',
            gap: 10,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              position: 'relative',
            }}
          >
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform:
                  'translateY(-50%)',
                color: '#64748b',
              }}
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search controls..."
              style={{
                width: '100%',
                height: 40,
                padding:
                  '0 12px 0 36px',
                borderRadius: 9,
                border:
                  '1px solid rgba(148,163,184,0.16)',
                background:
                  'rgba(15,23,42,0.72)',
                color: '#e2e8f0',
                outline: 'none',
                fontSize: 13,
              }}
            />
          </div>

          <select
            value={frameworkFilter}
            onChange={(event) =>
              setFrameworkFilter(
                event.target.value,
              )
            }
            style={{
              height: 40,
              padding: '0 12px',
              borderRadius: 9,
              border:
                '1px solid rgba(148,163,184,0.16)',
              background:
                '#0f172a',
              color: '#cbd5e1',
              outline: 'none',
              fontSize: 13,
            }}
          >
            <option value="ALL">
              All Frameworks
            </option>

            {frameworks.map(
              (framework) => (
                <option
                  key={framework.framework}
                  value={framework.framework}
                >
                  {framework.framework}
                </option>
              ),
            )}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value,
              )
            }
            style={{
              height: 40,
              padding: '0 12px',
              borderRadius: 9,
              border:
                '1px solid rgba(148,163,184,0.16)',
              background:
                '#0f172a',
              color: '#cbd5e1',
              outline: 'none',
              fontSize: 13,
            }}
          >
            <option value="ALL">
              All Statuses
            </option>

            <option value="COMPLIANT">
              Compliant
            </option>

            <option value="PARTIAL">
              Partial
            </option>

            <option value="NEEDS_REVIEW">
              Needs Review
            </option>

            <option value="NON_COMPLIANT">
              Non-Compliant
            </option>
          </select>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 9,
          }}
        >
          {filteredControls.map(
            (control) => {
              const relatedCount =
                control.related_event_ids
                  .length +
                control.related_alert_ids
                  .length +
                control.related_incident_ids
                  .length

              return (
                <Link
                  key={control.control_id}
                  to={`/compliance/${encodeURIComponent(control.control_id)}`}
                  style={{
                    display: 'block',
                    padding: 15,
                    border:
                      '1px solid rgba(148,163,184,0.13)',
                    borderRadius: 11,
                    background:
                      'rgba(15,23,42,0.38)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition:
                      'border-color 0.2s ease, background 0.2s ease, transform 0.2s ease',
                  }}
                  onMouseEnter={(event: ReactMouseEvent<HTMLAnchorElement>) => {
                    event.currentTarget.style.borderColor =
                      'rgba(34,211,238,0.35)'
                    event.currentTarget.style.background =
                      'rgba(15,23,42,0.65)'
                    event.currentTarget.style.transform =
                      'translateY(-1px)'
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.borderColor =
                      'rgba(148,163,184,0.13)'
                    event.currentTarget.style.background =
                      'rgba(15,23,42,0.38)'
                    event.currentTarget.style.transform =
                      'translateY(0)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems:
                        'flex-start',
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems:
                            'center',
                          gap: 9,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            fontFamily:
                              'monospace',
                            fontSize: 12,
                            color: '#38bdf8',
                          }}
                        >
                          {control.control_id}
                        </span>

                        <span
                          style={{
                            color: '#64748b',
                            fontSize: 11,
                          }}
                        >
                          {control.framework}
                        </span>

                        <span
                          style={{
                            ...statusStyle(
                              control.status,
                            ),
                            display:
                              'inline-flex',
                            alignItems:
                              'center',
                            padding:
                              '3px 8px',
                            borderRadius: 999,
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform:
                              'uppercase',
                            letterSpacing:
                              '0.04em',
                          }}
                        >
                          {formatStatus(
                            control.status,
                          )}
                        </span>
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                          color: '#e2e8f0',
                          fontSize: 14,
                          fontWeight: 650,
                        }}
                      >
                        {control.control_name}
                      </div>

                      <div
                        style={{
                          marginTop: 5,
                          color: '#94a3b8',
                          fontSize: 12,
                          lineHeight: 1.55,
                        }}
                      >
                        {control.description}
                      </div>
                    </div>

                    <div
                      style={{
                        ...evidenceStyle(
                          control.evidence_status,
                        ),
                        flexShrink: 0,
                        padding:
                          '5px 9px',
                        borderRadius: 7,
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform:
                          'uppercase',
                      }}
                    >
                      Evidence:{' '}
                      {formatStatus(
                        control.evidence_status,
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(4, minmax(0, 1fr))',
                      gap: 10,
                      marginTop: 14,
                      paddingTop: 12,
                      borderTop:
                        '1px solid rgba(148,163,184,0.09)',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: '#64748b',
                          fontSize: 10,
                          textTransform:
                            'uppercase',
                          letterSpacing:
                            '0.05em',
                        }}
                      >
                        Category
                      </div>

                      <div
                        style={{
                          color: '#cbd5e1',
                          fontSize: 12,
                          marginTop: 4,
                        }}
                      >
                        {control.category}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          color: '#64748b',
                          fontSize: 10,
                          textTransform:
                            'uppercase',
                          letterSpacing:
                            '0.05em',
                        }}
                      >
                        Owner
                      </div>

                      <div
                        style={{
                          color: '#cbd5e1',
                          fontSize: 12,
                          marginTop: 4,
                        }}
                      >
                        {control.owner}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          color: '#64748b',
                          fontSize: 10,
                          textTransform:
                            'uppercase',
                          letterSpacing:
                            '0.05em',
                        }}
                      >
                        Correlations
                      </div>

                      <div
                        style={{
                          color:
                            relatedCount > 0
                              ? '#38bdf8'
                              : '#64748b',
                          fontSize: 12,
                          marginTop: 4,
                        }}
                      >
                        {relatedCount}{' '}
                        linked records
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          color: '#64748b',
                          fontSize: 10,
                          textTransform:
                            'uppercase',
                          letterSpacing:
                            '0.05em',
                        }}
                      >
                        Last Reviewed
                      </div>

                      <div
                        style={{
                          color: '#cbd5e1',
                          fontSize: 12,
                          marginTop: 4,
                        }}
                      >
                        {formatDate(
                          control.last_reviewed,
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            },
          )}

          {filteredControls.length === 0 && (
            <div
              style={{
                padding: 40,
                textAlign: 'center',
                color: '#64748b',
                fontSize: 13,
              }}
            >
              No compliance controls match
              the selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Compliance