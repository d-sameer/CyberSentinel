import {
  AlertTriangle,
  Bug,
  ChevronRight,
  Clock3,
  Database,
  KeyRound,
  Monitor,
  Shield,
  ShieldAlert,
  Siren,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

type ApiRiskAsset = {
  id: string
  name: string
  type: string
  risk: RiskLevel
  score: number
  findings: number
  primaryIssue: string
  route: string
}

type ApiDomain = {
  label: string
  score: number
  risk: RiskLevel
}

type ApiActivity = {
  id: string
  time: string
  title: string
  description: string
  severity: string
  route: string
}

type ApiAction = {
  action_id: string
  action: string
  status: string
  analyst: string
  created_at: string
}

type SecurityPostureResponse = {
  status: string
  generated_at: string
  overall: {
    score: number
    label: string
  }
  metrics: {
    critical_risks: number
    high_risks: number
    open_vulnerabilities: number
    active_incidents: number
  }
  domains: ApiDomain[]
  risk_distribution: {
    CRITICAL: number
    HIGH: number
    MEDIUM: number
    LOW: number
  }
  total_findings: number
  risk_assets: ApiRiskAsset[]
  recent_activity: ApiActivity[]
  actions: ApiAction[]
}

const API_BASE = 'http://127.0.0.1:8001'

function normalizeRiskLevel(value: string): RiskLevel {
  const normalized = value.toUpperCase()

  if (normalized === 'CRITICAL') return 'CRITICAL'
  if (normalized === 'HIGH') return 'HIGH'
  if (normalized === 'MEDIUM' || normalized === 'WARNING') return 'MEDIUM'

  return 'LOW'
}

const riskStyles: Record<
  RiskLevel,
  {
    text: string
    background: string
    border: string
    bar: string
  }
> = {
  CRITICAL: {
    text: '#f87171',
    background: 'rgba(239, 68, 68, 0.10)',
    border: 'rgba(239, 68, 68, 0.28)',
    bar: '#ef4444',
  },
  HIGH: {
    text: '#fb923c',
    background: 'rgba(249, 115, 22, 0.10)',
    border: 'rgba(249, 115, 22, 0.28)',
    bar: '#f97316',
  },
  MEDIUM: {
    text: '#facc15',
    background: 'rgba(234, 179, 8, 0.10)',
    border: 'rgba(234, 179, 8, 0.28)',
    bar: '#eab308',
  },
  LOW: {
    text: '#4ade80',
    background: 'rgba(34, 197, 94, 0.10)',
    border: 'rgba(34, 197, 94, 0.28)',
    bar: '#22c55e',
  },
}

function formatDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function formatRelativeTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000),
  )

  if (seconds < 60) {
    return `${seconds}s ago`
  }

  const minutes = Math.floor(seconds / 60)

  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return `${hours}h ago`
  }

  return `${Math.floor(hours / 24)}d ago`
}

function SecurityPosture() {
  const navigate = useNavigate()

  const [data, setData] =
    useState<SecurityPostureResponse | null>(null)

  const [selectedRisk, setSelectedRisk] =
    useState<RiskLevel | 'ALL'>('ALL')

  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

  const loadPosture = async () => {
    try {
      setLoading(true)
      setApiError('')

      const response = await fetch(
        `${API_BASE}/api/security-posture`,
      )

      if (!response.ok) {
        throw new Error('Security posture API request failed')
      }

      const payload =
        (await response.json()) as SecurityPostureResponse

      setData(payload)
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : 'Unable to load security posture.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadPosture()
  }, [])

  const filteredAssets = useMemo(() => {
    if (!data) {
      return []
    }

    if (selectedRisk === 'ALL') {
      return data.risk_assets
    }

    return data.risk_assets.filter(
      (asset) => asset.risk === selectedRisk,
    )
  }, [data, selectedRisk])

  const submitAction = async (action: string) => {
    try {
      setActionLoading(true)
      setActionMessage('')

      const response = await fetch(
        `${API_BASE}/api/security-posture/actions`,
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
        const body = await response.json().catch(() => null)
        throw new Error(
          body?.detail ?? 'Security posture action failed',
        )
      }

      const result =
        (await response.json()) as ApiAction

      setActionMessage(
        `${result.action.replaceAll('_', ' ')} → ${result.status.replaceAll('_', ' ')}`,
      )

      await loadPosture()
    } catch (error) {
      setActionMessage(
        error instanceof Error
          ? error.message
          : 'Action failed.',
      )
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100%',
          padding: '32px',
          color: '#67e8f9',
          background: '#070b14',
        }}
      >
        Loading security posture from CyberSentinel API...
      </div>
    )
  }

  if (!data) {
    return (
      <div
        style={{
          minHeight: '100%',
          padding: '32px',
          background: '#070b14',
          color: '#e5e7eb',
        }}
      >
        <h1>Security Posture</h1>

        <div
          style={{
            marginTop: '16px',
            padding: '14px',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '8px',
            color: '#fca5a5',
            background: 'rgba(239,68,68,0.08)',
          }}
        >
          Backend connection failed: {apiError}
        </div>
      </div>
    )
  }

  const postureStyle =
    data.overall.score >= 85
      ? riskStyles.CRITICAL
      : data.overall.score >= 70
        ? riskStyles.HIGH
        : riskStyles.LOW

  return (
    <div
      style={{
        minHeight: '100%',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        padding: '28px',
        background: '#070b14',
        color: '#e5e7eb',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '20px',
          marginBottom: '28px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
            }}
          >
            <ShieldAlert size={24} color="#22d3ee" />

            <span
              style={{
                fontSize: '12px',
                letterSpacing: '1.8px',
                color: '#64748b',
                fontWeight: 700,
              }}
            >
              SECURITY OPERATIONS
            </span>
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: '30px',
              fontWeight: 700,
              letterSpacing: '-0.7px',
            }}
          >
            Security Posture
          </h1>

          <p
            style={{
              margin: '8px 0 0',
              color: '#94a3b8',
              fontSize: '14px',
            }}
          >
            Backend-calculated view of current enterprise
            security exposure.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <button
            disabled={actionLoading}
            onClick={() => {
              setSelectedRisk('CRITICAL')
              void submitAction('REVIEW_CRITICAL_RISKS')
            }}
            style={actionButton('#22d3ee')}
          >
            Review Critical Risks
          </button>

          <button
            disabled={actionLoading}
            onClick={() =>
              void submitAction('ACKNOWLEDGE_REVIEW')
            }
            style={actionButton('#4ade80')}
          >
            Acknowledge Review
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'minmax(280px, 1.2fr) repeat(auto-fit, minmax(170px, 1fr))',
          gap: '14px',
          marginBottom: '18px',
        }}
      >
        <div
          style={{
            border: `1px solid ${postureStyle.border}`,
            background:
              'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(8,47,73,0.55))',
            borderRadius: '12px',
            padding: '20px',
            minWidth: 0,
          }}
        >
          <div
            style={{
              color: '#64748b',
              fontSize: '11px',
              letterSpacing: '1.5px',
              fontWeight: 700,
            }}
          >
            OVERALL SECURITY POSTURE
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              marginTop: '16px',
            }}
          >
            <div
              style={{
                width: '82px',
                height: '82px',
                flexShrink: 0,
                borderRadius: '50%',
                border: `7px solid ${postureStyle.background}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '25px',
                fontWeight: 800,
                color: postureStyle.text,
              }}
            >
              {data.overall.score}
            </div>

            <div>
              <div
                style={{
                  color: postureStyle.text,
                  fontSize: '17px',
                  fontWeight: 800,
                }}
              >
                {data.overall.label}
              </div>

              <div
                style={{
                  color: '#94a3b8',
                  fontSize: '12px',
                  marginTop: '5px',
                  lineHeight: 1.5,
                }}
              >
                Calculated from current events,
                <br />
                alerts, incidents and vulnerabilities.
              </div>
            </div>
          </div>
        </div>

        <MetricCard
          label="CRITICAL RISKS"
          value={String(data.metrics.critical_risks)}
          icon={<ShieldAlert size={18} />}
          color="#f87171"
        />

        <MetricCard
          label="HIGH RISKS"
          value={String(data.metrics.high_risks)}
          icon={<AlertTriangle size={18} />}
          color="#fb923c"
        />

        <MetricCard
          label="OPEN VULNERABILITIES"
          value={String(data.metrics.open_vulnerabilities)}
          icon={<Bug size={18} />}
          color="#facc15"
        />

        <MetricCard
          label="ACTIVE INCIDENTS"
          value={String(data.metrics.active_incidents)}
          icon={<Siren size={18} />}
          color="#fb7185"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '18px',
        }}
      >
        {data.domains.map((domain) => (
          <RiskDomain
            key={domain.label}
            label={domain.label}
            value={domain.risk}
            score={domain.score}
            icon={domainIcon(domain.label)}
          />
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'minmax(0, 1.5fr) minmax(280px, 0.8fr)',
          gap: '18px',
        }}
      >
        <section className="security-posture-panel">
          <PanelHeader
            title="Top Risk Assets"
            subtitle="Assets requiring analyst attention"
          />

          <div
            style={{
              padding: '12px 20px',
              display: 'flex',
              gap: '5px',
              flexWrap: 'wrap',
              borderBottom: '1px solid #172033',
            }}
          >
            {(
              ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const
            ).map((level) => (
              <button
                key={level}
                onClick={() => setSelectedRisk(level)}
                style={{
                  border: '1px solid #1e293b',
                  background:
                    selectedRisk === level
                      ? '#132131'
                      : 'transparent',
                  color:
                    selectedRisk === level
                      ? '#67e8f9'
                      : '#64748b',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {level}
              </button>
            ))}
          </div>

          {filteredAssets.length === 0 ? (
            <div
              style={{
                padding: '30px 20px',
                color: '#64748b',
              }}
            >
              No assets match this risk filter.
            </div>
          ) : (
            filteredAssets.map((asset) => {
              const style = riskStyles[asset.risk]

              return (
                <button
                  key={asset.id}
                  onClick={() => navigate(asset.route)}
                  style={{
                    width: '100%',
                    minWidth: 0,
                    textAlign: 'left',
                    border: 0,
                    borderBottom:
                      '1px solid rgba(30,41,59,0.65)',
                    background: 'transparent',
                    color: 'inherit',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    display: 'grid',
                    gridTemplateColumns:
                      '105px 85px minmax(0,1fr) 75px 20px',
                    gap: '12px',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                      }}
                    >
                      {asset.name}
                    </div>

                    <div
                      style={{
                        fontSize: '10px',
                        color: '#64748b',
                        marginTop: '3px',
                      }}
                    >
                      {asset.type}
                    </div>
                  </div>

                  <RiskBadge level={asset.risk} />

                  <div
                    style={{
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#cbd5e1',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {asset.primaryIssue}
                    </div>

                    <div
                      style={{
                        height: '4px',
                        background: '#172033',
                        borderRadius: '999px',
                        marginTop: '8px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${asset.score}%`,
                          height: '100%',
                          background: style.bar,
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '18px',
                        fontWeight: 800,
                        color: style.text,
                      }}
                    >
                      {asset.score}
                    </div>

                    <div
                      style={{
                        fontSize: '9px',
                        color: '#64748b',
                      }}
                    >
                      {asset.findings} findings
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    color="#475569"
                  />
                </button>
              )
            })
          )}
        </section>

        <section className="security-posture-panel">
          <PanelHeader
            title="Risk Distribution"
            subtitle="Current findings by severity"
          />

          <div
            style={{
              padding: '25px 20px 20px',
            }}
          >
            <div
              style={{
                width: '170px',
                height: '170px',
                margin: '0 auto',
                borderRadius: '50%',
                background: distributionGradient(
                  data.risk_distribution,
                  data.total_findings,
                ),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '112px',
                  height: '112px',
                  borderRadius: '50%',
                  background: '#0b111d',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '28px',
                    fontWeight: 800,
                  }}
                >
                  {data.total_findings}
                </span>

                <span
                  style={{
                    fontSize: '10px',
                    color: '#64748b',
                  }}
                >
                  TOTAL FINDINGS
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginTop: '24px',
              }}
            >
              <DistributionItem
                label="Critical"
                value={data.risk_distribution.CRITICAL}
                color="#ef4444"
              />

              <DistributionItem
                label="High"
                value={data.risk_distribution.HIGH}
                color="#f97316"
              />

              <DistributionItem
                label="Medium"
                value={data.risk_distribution.MEDIUM}
                color="#eab308"
              />

              <DistributionItem
                label="Low"
                value={data.risk_distribution.LOW}
                color="#22c55e"
              />
            </div>
          </div>
        </section>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'minmax(0, 1.4fr) minmax(300px, 0.8fr)',
          gap: '18px',
          marginTop: '18px',
        }}
      >
        <section className="security-posture-panel">
          <PanelHeader
            title="Recent Security Activity"
            subtitle="Latest activity contributing to security posture"
          />

          {data.recent_activity.map((activity) => {
            const activityRisk = normalizeRiskLevel(activity.severity)
            const style = riskStyles[activityRisk]

            return (
              <button
                key={activity.id}
                onClick={() => navigate(activity.route)}
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: '80px minmax(0,1fr) 20px',
                  gap: '14px',
                  alignItems: 'center',
                  textAlign: 'left',
                  border: 0,
                  borderBottom:
                    '1px solid rgba(30,41,59,0.65)',
                  background: 'transparent',
                  color: 'inherit',
                  padding: '15px 20px',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#64748b',
                    fontSize: '10px',
                  }}
                >
                  <Clock3 size={13} />
                  {formatRelativeTime(activity.time)}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {activity.title}
                    </span>

                    <span
                      style={{
                        color: style.text,
                        background: style.background,
                        border: `1px solid ${style.border}`,
                        borderRadius: '4px',
                        padding: '2px 5px',
                        fontSize: '8px',
                        fontWeight: 800,
                      }}
                    >
                      {activityRisk}
                    </span>
                  </div>

                  <div
                    style={{
                      color: '#64748b',
                      fontSize: '10px',
                      marginTop: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {activity.description}
                  </div>
                </div>

                <ChevronRight
                  size={15}
                  color="#475569"
                />
              </button>
            )
          })}
        </section>

        <section className="security-posture-panel">
          <PanelHeader
            title="Analyst Focus"
            subtitle="Persistent posture review workflow"
          />

          <div
            style={{
              padding: '18px 20px',
              display: 'grid',
              gap: '10px',
            }}
          >
            <Recommendation
              title="Investigate highest-risk asset"
              description="Open the asset with the highest calculated risk score."
              onClick={() => {
                const asset = data.risk_assets[0]
                if (asset) navigate(asset.route)
              }}
            />

            <Recommendation
              title="Review active incidents"
              description="Open incidents contributing to current posture."
              onClick={() => navigate('/incidents')}
            />

            <Recommendation
              title="Review vulnerabilities"
              description="Inspect currently open or patch-available CVEs."
              onClick={() => navigate('/vulnerabilities')}
            />

            <Recommendation
              title="Review identity activity"
              description="Inspect authentication and privilege-related activity."
              onClick={() => navigate('/identity')}
            />
          </div>

          {actionMessage && (
            <div
              style={{
                margin: '0 20px 18px',
                padding: '10px 12px',
                borderRadius: '7px',
                border:
                  '1px solid rgba(34,211,238,0.18)',
                background:
                  'rgba(34,211,238,0.06)',
                color: '#67e8f9',
                fontSize: '10px',
              }}
            >
              {actionMessage}
            </div>
          )}

          {data.actions.length > 0 && (
            <div
              style={{
                padding: '0 20px 20px',
              }}
            >
              <div
                style={{
                  color: '#64748b',
                  fontSize: '10px',
                  letterSpacing: '1.2px',
                  fontWeight: 700,
                  marginBottom: '10px',
                }}
              >
                RESPONSE HISTORY
              </div>

              {data.actions.slice(0, 4).map((action) => (
                <div
                  key={action.action_id}
                  style={{
                    borderTop: '1px solid #172033',
                    padding: '9px 0',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '8px',
                      fontSize: '10px',
                    }}
                  >
                    <strong>
                      {action.action.replaceAll('_', ' ')}
                    </strong>

                    <span style={{ color: '#22d3ee' }}>
                      {action.status.replaceAll('_', ' ')}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: '4px',
                      color: '#64748b',
                      fontSize: '9px',
                    }}
                  >
                    {action.action_id} · {action.analyst} ·{' '}
                    {formatDateTime(action.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div
        style={{
          marginTop: '18px',
          padding: '10px 14px',
          border: '1px solid rgba(34,211,238,0.16)',
          borderRadius: '7px',
          background: 'rgba(34,211,238,0.04)',
          color: '#67e8f9',
          fontSize: '10px',
        }}
      >
        {data.status} · Generated {formatDateTime(data.generated_at)}
      </div>
    </div>
  )
}

function actionButton(color: string) {
  return {
    border: `1px solid ${color}40`,
    background: `${color}0d`,
    color,
    padding: '10px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
  } as const
}

function domainIcon(label: string) {
  switch (label) {
    case 'Endpoint':
      return <Monitor size={17} />
    case 'Vulnerability':
      return <Bug size={17} />
    case 'Identity':
      return <KeyRound size={17} />
    case 'Network':
      return <Database size={17} />
    case 'Incidents':
      return <Siren size={17} />
    default:
      return <Shield size={17} />
  }
}

function distributionGradient(
  distribution: SecurityPostureResponse['risk_distribution'],
  total: number,
) {
  if (!total) {
    return '#172033'
  }

  const critical = (distribution.CRITICAL / total) * 360
  const high = (distribution.HIGH / total) * 360
  const medium = (distribution.MEDIUM / total) * 360

  return `conic-gradient(
    #ef4444 0deg ${critical}deg,
    #f97316 ${critical}deg ${critical + high}deg,
    #eab308 ${critical + high}deg ${critical + high + medium}deg,
    #22c55e ${critical + high + medium}deg 360deg
  )`
}

function MetricCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <div
      style={{
        border: '1px solid #172033',
        background: '#0b111d',
        borderRadius: '12px',
        padding: '17px',
        minWidth: 0,
      }}
    >
      <div style={{ color }}>{icon}</div>

      <div
        style={{
          marginTop: '15px',
          fontSize: '25px',
          fontWeight: 800,
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: '4px',
          color: '#64748b',
          fontSize: '9px',
          letterSpacing: '0.7px',
          fontWeight: 700,
        }}
      >
        {label}
      </div>
    </div>
  )
}

function RiskDomain({
  label,
  value,
  score,
  icon,
}: {
  label: string
  value: RiskLevel
  score: number
  icon: React.ReactNode
}) {
  const style = riskStyles[value]

  return (
    <div
      style={{
        border: '1px solid #172033',
        background: '#0b111d',
        borderRadius: '10px',
        padding: '14px',
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: style.text,
        }}
      >
        {icon}

        <span
          style={{
            fontSize: '9px',
            fontWeight: 800,
          }}
        >
          {value}
        </span>
      </div>

      <div
        style={{
          marginTop: '10px',
          fontSize: '11px',
          color: '#94a3b8',
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: '8px',
          height: '3px',
          background: '#172033',
          borderRadius: '99px',
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: '100%',
            borderRadius: '99px',
            background: style.bar,
          }}
        />
      </div>

      <div
        style={{
          marginTop: '6px',
          fontSize: '10px',
          color: '#64748b',
        }}
      >
        Risk score {score}
      </div>
    </div>
  )
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const style = riskStyles[level]

  return (
    <span
      style={{
        display: 'inline-flex',
        justifyContent: 'center',
        width: '72px',
        padding: '5px 7px',
        borderRadius: '5px',
        border: `1px solid ${style.border}`,
        background: style.background,
        color: style.text,
        fontSize: '9px',
        fontWeight: 800,
      }}
    >
      {level}
    </span>
  )
}

function DistributionItem({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 9px',
        border: '1px solid #172033',
        borderRadius: '6px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          color: '#94a3b8',
          fontSize: '10px',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: color,
          }}
        />

        {label}
      </div>

      <span
        style={{
          color,
          fontSize: '12px',
          fontWeight: 800,
        }}
      >
        {value}
      </span>
    </div>
  )
}

function Recommendation({
  title,
  description,
  onClick,
}: {
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '10px',
        border: '1px solid #172033',
        background: '#0d1421',
        color: 'inherit',
        borderRadius: '8px',
        padding: '11px',
        cursor: 'pointer',
      }}
    >
      <div>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#cbd5e1',
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: '4px',
            fontSize: '9px',
            color: '#64748b',
            lineHeight: 1.4,
          }}
        >
          {description}
        </div>
      </div>

      <ChevronRight size={14} color="#475569" />
    </button>
  )
}

function PanelHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div
      style={{
        padding: '18px 20px',
        borderBottom: '1px solid #172033',
      }}
    >
      <div
        style={{
          fontSize: '15px',
          fontWeight: 700,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: '12px',
          color: '#64748b',
          marginTop: '4px',
        }}
      >
        {subtitle}
      </div>
    </div>
  )
}

export default SecurityPosture
