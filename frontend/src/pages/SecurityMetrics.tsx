import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock3,
  Database,
  FileBarChart,
  Monitor,
  RefreshCw,
  Shield,
  ShieldAlert,
  TrendingUp,
  Wifi,
  XCircle,
} from 'lucide-react'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const API_BASE_URL = 'http://127.0.0.1:8000'

interface DistributionItem {
  severity?: string
  risk?: string
  category?: string
  count: number
  percentage?: number
}

interface SecurityMetrics {
  report_summary: {
    generated_at: string
    data_sources: string[]
    total_records: number
    security_score: number
    posture: string
  }

  security_score: {
    score: number
    posture: string
  }

  events: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
    info: number
    statuses: Record<string, number>
    severity_distribution: DistributionItem[]
    category_distribution: DistributionItem[]
  }

  alerts: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
    open: number
    investigating: number
    reviewed: number
    average_confidence: number
    statuses: Record<string, number>
    severity_distribution: DistributionItem[]
    category_distribution: {
      category: string
      count: number
    }[]
  }

  endpoints: {
    total: number
    online: number
    warning: number
    offline: number
    high_risk: number
    medium_risk: number
    low_risk: number
    statuses: Record<string, number>
    risk_distribution: DistributionItem[]
  }

  top_categories: {
    category: string
    count: number
  }[]

  recent_activity: {
    id: string
    title: string
    severity: string
    status: string
    category: string
    asset: string
    source: string
    timestamp: string | null
  }[]

  risk_assets: {
    endpoint_id: string
    hostname: string
    risk: string
    status: string
    open_alerts: number
    open_incidents: number
    ip_address: string
  }[]
}

function MetricCard({
  label,
  value,
  description,
  icon,
  variant = 'cyan',
}: {
  label: string
  value: string | number
  description: string
  icon: ReactNode
  variant?: 'cyan' | 'red' | 'blue' | 'amber'
}) {
  return (
    <div className={`stat-card stat-card-${variant}`}>
      <div className="stat-card-top">
        <div className="stat-card-label">
          {label}
        </div>

        <div className="stat-card-icon">
          {icon}
        </div>
      </div>

      <div className="stat-card-value">
        {value}
      </div>

      <div className="stat-card-description">
        {description}
      </div>
    </div>
  )
}

function Panel({
  title,
  description,
  icon,
  children,
}: {
  title: string
  description: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <section className="dashboard-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">
            {title}
          </div>

          <div className="panel-description">
            {description}
          </div>
        </div>

        <div className="endpoint-header-icon">
          {icon}
        </div>
      </div>

      {children}
    </section>
  )
}

function severityClass(severity: string) {
  switch (severity.toUpperCase()) {
    case 'CRITICAL':
      return 'critical'
    case 'HIGH':
      return 'high'
    case 'MEDIUM':
      return 'medium'
    case 'LOW':
      return 'low'
    case 'INFO':
      return 'info'
    default:
      return 'info'
  }
}

function formatTime(timestamp: string | null) {
  if (!timestamp) {
    return 'Unknown'
  }

  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return timestamp
  }

  return date.toLocaleString()
}

function getPostureColor(posture: string) {
  switch (posture.toUpperCase()) {
    case 'HEALTHY':
      return '#4ade80'
    case 'GUARDED':
      return '#67e8f9'
    case 'ELEVATED':
      return '#fbbf24'
    case 'CRITICAL':
      return '#f87171'
    default:
      return '#94a3b8'
  }
}

function getRiskColor(risk: string) {
  switch (risk.toUpperCase()) {
    case 'CRITICAL':
      return '#f87171'
    case 'HIGH':
      return '#fb923c'
    case 'MEDIUM':
      return '#fbbf24'
    case 'LOW':
      return '#4ade80'
    default:
      return '#94a3b8'
  }
}

export default function SecurityMetrics() {
  const [metrics, setMetrics] =
    useState<SecurityMetrics | null>(null)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadMetrics = async () => {
    try {
      setError('')

      const response = await fetch(
        `${API_BASE_URL}/api/security-metrics`,
      )

      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status}`,
        )
      }

      const data: SecurityMetrics =
        await response.json()

      setMetrics(data)
    } catch (err) {
      console.error(err)

      setError(
        'Unable to load security metrics from the backend.',
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadMetrics()
  }, [])

  const refreshMetrics = () => {
    setRefreshing(true)
    loadMetrics()
  }

  const eventSeverityData = useMemo(() => {
    if (!metrics) return []

    return metrics.events.severity_distribution.map(
      (item) => ({
        name: item.severity,
        value: item.count,
      }),
    )
  }, [metrics])

  const endpointRiskData = useMemo(() => {
    if (!metrics) return []

    return metrics.endpoints.risk_distribution.map(
      (item) => ({
        name: item.risk,
        value: item.count,
      }),
    )
  }, [metrics])

  const categoryData = useMemo(() => {
    if (!metrics) return []

    return metrics.top_categories.map((item) => ({
      name: item.category,
      count: item.count,
    }))
  }, [metrics])

  if (loading) {
    return (
      <div className="page-container">
        <div
          style={{
            minHeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            fontSize: 12,
          }}
        >
          <RefreshCw
            size={18}
            style={{
              marginRight: 9,
              animation: 'spin 1s linear infinite',
            }}
          />

          Loading security metrics...
        </div>
      </div>
    )
  }

  if (!metrics || error) {
    return (
      <div className="page-container">
        <div
          className="dashboard-panel"
          style={{
            minHeight: 260,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <XCircle
              size={32}
              color="#f87171"
            />

            <div
              style={{
                marginTop: 14,
                color: '#f87171',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Security Metrics Unavailable
            </div>

            <div
              style={{
                marginTop: 7,
                color: '#64748b',
                fontSize: 10,
              }}
            >
              {error}
            </div>

            <button
              onClick={refreshMetrics}
              className="filter-button"
              style={{
                marginTop: 18,
              }}
            >
              <RefreshCw
                size={13}
                style={{
                  marginRight: 6,
                  verticalAlign: 'middle',
                }}
              />

              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const postureColor = getPostureColor(
    metrics.security_score.posture,
  )

  const severityColors = [
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#22d3ee',
    '#64748b',
  ]

  return (
    <div className="page-container">
      {/* HEADER */}

      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            SECURITY ANALYTICS
          </div>

          <h1>
            Security Metrics & Reporting
          </h1>

          <p className="page-description">
            Operational security posture, analytics
            and reporting across the CyberSentinel
            security platform.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
          }}
        >
          <div className="page-status">
            <span />
            BACKEND CONNECTED
          </div>

          <button
            onClick={refreshMetrics}
            disabled={refreshing}
            className="filter-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              opacity: refreshing ? 0.6 : 1,
            }}
          >
            <RefreshCw
              size={13}
              style={{
                animation: refreshing
                  ? 'spin 1s linear infinite'
                  : 'none',
              }}
            />

            Refresh
          </button>
        </div>
      </div>

      {/* REPORT SOURCE */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          marginBottom: 18,
          padding: '13px 16px',
          border: '1px solid rgba(34, 211, 238, 0.08)',
          borderRadius: 10,
          background:
            'rgba(15, 23, 42, 0.55)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Database
            size={16}
            color="#22d3ee"
          />

          <div>
            <div
              style={{
                color: '#475569',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              Report Sources
            </div>

            <div
              style={{
                marginTop: 4,
                color: '#94a3b8',
                fontSize: 10,
              }}
            >
              {metrics.report_summary.data_sources.join(
                ' • ',
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            color: '#475569',
            fontSize: 9,
            whiteSpace: 'nowrap',
          }}
        >
          Generated{' '}
          {formatTime(
            metrics.report_summary.generated_at,
          )}
        </div>
      </div>

      {/* KPI CARDS */}

      <div className="stats-grid">
        <MetricCard
          label="Security Events"
          value={metrics.events.total}
          description={`${metrics.events.critical} critical • ${metrics.events.high} high`}
          icon={<Activity size={17} />}
          variant="red"
        />

        <MetricCard
          label="Security Alerts"
          value={metrics.alerts.total}
          description={`${metrics.alerts.open} open • ${metrics.alerts.investigating} investigating`}
          icon={<AlertTriangle size={17} />}
          variant="amber"
        />

        <MetricCard
          label="Protected Endpoints"
          value={metrics.endpoints.total}
          description={`${metrics.endpoints.online} online • ${metrics.endpoints.offline} offline`}
          icon={<Monitor size={17} />}
          variant="cyan"
        />

        <MetricCard
          label="Alert Confidence"
          value={`${metrics.alerts.average_confidence}%`}
          description={`${metrics.alerts.reviewed} reviewed alerts`}
          icon={<TrendingUp size={17} />}
          variant="blue"
        />
      </div>

      {/* MAIN GRID */}

      <div
        className="dashboard-grid"
        style={{
          marginTop: 14,
        }}
      >
        {/* SECURITY SCORE */}

        <Panel
          title="Security Posture"
          description="Current backend-calculated security score"
          icon={<Shield size={17} />}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'minmax(210px, 0.8fr) minmax(0, 1.4fr)',
              gap: 24,
              alignItems: 'center',
              marginTop: 22,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: 150,
                  height: 150,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `8px solid rgba(34, 211, 238, 0.09)`,
                  borderTopColor: postureColor,
                  borderRightColor:
                    metrics.security_score.score >=
                    60
                      ? postureColor
                      : 'rgba(34, 211, 238, 0.09)',
                  borderRadius: '50%',
                  boxShadow:
                    '0 0 30px rgba(34, 211, 238, 0.04)',
                }}
              >
                <div
                  style={{
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      color: '#f8fafc',
                      fontSize: 38,
                      fontWeight: 800,
                      lineHeight: 1,
                    }}
                  >
                    {metrics.security_score.score}
                  </div>

                  <div
                    style={{
                      marginTop: 7,
                      color: postureColor,
                      fontSize: 9,
                      fontWeight: 800,
                      letterSpacing: 1.2,
                    }}
                  >
                    {metrics.security_score.posture}
                  </div>
                </div>
              </div>
            </div>

            <div>
              {[
                [
                  'Critical Events',
                  metrics.events.critical,
                  '#f87171',
                ],
                [
                  'High Events',
                  metrics.events.high,
                  '#fb923c',
                ],
                [
                  'Medium Events',
                  metrics.events.medium,
                  '#fbbf24',
                ],
                [
                  'Low / Info Events',
                  metrics.events.low +
                    metrics.events.info,
                  '#67e8f9',
                ],
              ].map(([label, value, color]) => (
                <div
                  key={String(label)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 0',
                    borderBottom:
                      '1px solid rgba(30, 41, 59, 0.6)',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      color: '#64748b',
                      fontSize: 10,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: String(color),
                      }}
                    />

                    {label}
                  </span>

                  <strong
                    style={{
                      color: '#cbd5e1',
                      fontSize: 11,
                    }}
                  >
                    {value}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {/* EVENT SEVERITY */}

        <Panel
          title="Event Severity Distribution"
          description="Security events by severity"
          icon={<BarChart3 size={17} />}
        >
          <div
            style={{
              height: 280,
              marginTop: 14,
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={eventSeverityData}
                margin={{
                  top: 10,
                  right: 5,
                  left: -20,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(71, 85, 105, 0.18)"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fill: '#64748b',
                    fontSize: 9,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fill: '#475569',
                    fontSize: 9,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    background: '#0b1220',
                    border:
                      '1px solid #263247',
                    borderRadius: 7,
                    color: '#cbd5e1',
                    fontSize: 10,
                  }}
                />

                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                >
                  {eventSeverityData.map(
                    (_, index) => (
                      <Cell
                        key={`severity-${index}`}
                        fill={
                          severityColors[
                            index %
                              severityColors.length
                          ]
                        }
                      />
                    ),
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* ALERT / ENDPOINT GRID */}

      <div
        className="dashboard-grid"
        style={{
          marginTop: 14,
        }}
      >
        {/* ALERT OVERVIEW */}

        <Panel
          title="Alert Overview"
          description="Current alert workload and operational status"
          icon={<AlertTriangle size={17} />}
        >
          <div
            className="stats-grid"
            style={{
              gridTemplateColumns:
                'repeat(4, minmax(0, 1fr))',
              marginTop: 20,
            }}
          >
            {[
              [
                'Critical',
                metrics.alerts.critical,
                '#f87171',
              ],
              [
                'High',
                metrics.alerts.high,
                '#fb923c',
              ],
              [
                'Medium',
                metrics.alerts.medium,
                '#fbbf24',
              ],
              [
                'Open',
                metrics.alerts.open,
                '#67e8f9',
              ],
            ].map(([label, value, color]) => (
              <div
                key={String(label)}
                style={{
                  padding: 13,
                  border:
                    '1px solid rgba(148, 163, 184, 0.07)',
                  borderRadius: 9,
                  background:
                    'rgba(15, 23, 42, 0.55)',
                }}
              >
                <div
                  style={{
                    color: '#64748b',
                    fontSize: 9,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    marginTop: 8,
                    color: String(color),
                    fontSize: 22,
                    fontWeight: 700,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 22,
            }}
          >
            {[
              [
                'Investigating',
                metrics.alerts.investigating,
                '#fb923c',
              ],
              [
                'Reviewed',
                metrics.alerts.reviewed,
                '#4ade80',
              ],
            ].map(([label, value, color]) => {
              const percentage =
                metrics.alerts.total > 0
                  ? (Number(value) /
                      metrics.alerts.total) *
                    100
                  : 0

              return (
                <div
                  key={String(label)}
                  style={{
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        color: '#64748b',
                        fontSize: 9,
                      }}
                    >
                      {label}
                    </span>

                    <span
                      style={{
                        color: '#94a3b8',
                        fontSize: 9,
                      }}
                    >
                      {value}
                    </span>
                  </div>

                  <div
                    style={{
                      height: 4,
                      overflow: 'hidden',
                      borderRadius: 999,
                      background:
                        '#172033',
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        borderRadius: 999,
                        background: String(
                          color,
                        ),
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>

        {/* ENDPOINT RISK */}

        <Panel
          title="Endpoint Risk Distribution"
          description="Current endpoint exposure by risk level"
          icon={<Monitor size={17} />}
        >
          <div
            style={{
              height: 270,
              marginTop: 5,
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={endpointRiskData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="48%"
                  innerRadius={58}
                  outerRadius={91}
                  paddingAngle={3}
                >
                  {endpointRiskData.map(
                    (item) => (
                      <Cell
                        key={`risk-${item.name}`}
                        fill={getRiskColor(item.name || 'UNKNOWN')}
                      />
                    ),
                  )}
                </Pie>

                <Tooltip
                  contentStyle={{
                    background: '#0b1220',
                    border:
                      '1px solid #263247',
                    borderRadius: 7,
                    color: '#cbd5e1',
                    fontSize: 10,
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{
                    color: '#64748b',
                    fontSize: 9,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="soc-endpoint-health">
            <div>
              <strong>
                {metrics.endpoints.online}
              </strong>
              <span>Online</span>
            </div>

            <div>
              <strong
                style={{
                  color: '#f87171',
                }}
              >
                {metrics.endpoints.high_risk}
              </strong>
              <span>High Risk</span>
            </div>

            <div>
              <strong
                style={{
                  color: '#fbbf24',
                }}
              >
                {metrics.endpoints.medium_risk}
              </strong>
              <span>Medium Risk</span>
            </div>
          </div>
        </Panel>
      </div>

      {/* CATEGORY ANALYTICS */}

      <div
        style={{
          marginTop: 14,
        }}
      >
        <Panel
          title="Security Activity by Category"
          description="Most active security event categories"
          icon={<Activity size={17} />}
        >
          <div
            className="soc-category-list"
            style={{
              padding: '22px 4px 5px',
            }}
          >
            {categoryData.map((item) => {
              const maxCount = Math.max(
                ...categoryData.map(
                  (category) =>
                    category.count,
                ),
                1,
              )

              const width =
                (item.count / maxCount) * 100

              return (
                <div
                  key={item.name}
                  className="soc-category-row"
                >
                  <div className="soc-category-name">
                    <Activity size={12} />
                    {item.name}
                  </div>

                  <div className="soc-category-bar">
                    <div
                      className="soc-category-fill"
                      style={{
                        width: `${width}%`,
                      }}
                    />
                  </div>

                  <div className="soc-category-value">
                    {item.count}
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>
      </div>

      {/* RISK ENDPOINTS */}

      <div
        style={{
          marginTop: 14,
        }}
      >
        <Panel
          title="Top Risk Endpoints"
          description="Endpoints ordered by current risk and open security workload"
          icon={<ShieldAlert size={17} />}
        >
          <div
            style={{
              marginTop: 18,
              overflowX: 'auto',
            }}
          >
            <div
              style={{
                minWidth: 780,
              }}
            >
              {/* TABLE HEADER */}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1.4fr 1.2fr 0.8fr 0.8fr 0.6fr 0.7fr',
                  gap: 15,
                  padding: '10px 4px',
                  borderBottom:
                    '1px solid rgba(148, 163, 184, 0.08)',
                  color: '#475569',
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}
              >
                <span>Endpoint</span>
                <span>IP Address</span>
                <span>Risk</span>
                <span>Status</span>
                <span>Alerts</span>
                <span>Incidents</span>
              </div>

              {metrics.risk_assets.map(
                (endpoint) => (
                  <div
                    key={endpoint.endpoint_id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        '1.4fr 1.2fr 0.8fr 0.8fr 0.6fr 0.7fr',
                      gap: 15,
                      alignItems: 'center',
                      minHeight: 68,
                      padding: '8px 4px',
                      borderBottom:
                        '1px solid rgba(148, 163, 184, 0.05)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <div className="endpoint-icon">
                        <Monitor size={15} />
                      </div>

                      <div>
                        <div className="endpoint-name">
                          {endpoint.hostname}
                        </div>

                        <div className="endpoint-os">
                          {endpoint.endpoint_id}
                        </div>
                      </div>
                    </div>

                    <div className="endpoint-table-ip">
                      {endpoint.ip_address}
                    </div>

                    <div>
                      <span
                        style={{
                          display: 'inline-flex',
                          padding:
                            '4px 7px',
                          borderRadius: 5,
                          border: `1px solid ${getRiskColor(
                            endpoint.risk,
                          )}33`,
                          color:
                            getRiskColor(
                              endpoint.risk,
                            ),
                          background: `${getRiskColor(
                            endpoint.risk,
                          )}0d`,
                          fontSize: 8,
                          fontWeight: 800,
                        }}
                      >
                        {endpoint.risk}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color:
                          endpoint.status ===
                          'ONLINE'
                            ? '#4ade80'
                            : '#fbbf24',
                        fontSize: 8,
                        fontWeight: 700,
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius:
                            '50%',
                          background:
                            endpoint.status ===
                            'ONLINE'
                              ? '#22c55e'
                              : '#f59e0b',
                        }}
                      />

                      {endpoint.status}
                    </div>

                    <div
                      style={{
                        color: '#cbd5e1',
                        fontSize: 10,
                      }}
                    >
                      {endpoint.open_alerts}
                    </div>

                    <div
                      style={{
                        color: '#cbd5e1',
                        fontSize: 10,
                      }}
                    >
                      {endpoint.open_incidents}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </Panel>
      </div>

      {/* RECENT ACTIVITY */}

      <div
        style={{
          marginTop: 14,
        }}
      >
        <Panel
          title="Recent Security Activity"
          description="Latest events contributing to the operational security picture"
          icon={<Clock3 size={17} />}
        >
          <div className="security-events-list">
            {metrics.recent_activity.map(
              (event) => {
                const severity =
                  severityClass(
                    event.severity,
                  )

                return (
                  <div
                    key={event.id}
                    className="security-event"
                  >
                    <div
                      className={`event-icon event-${severity}`}
                    >
                      <Activity size={15} />
                    </div>

                    <div className="event-content">
                      <div className="event-title">
                        {event.title}
                      </div>

                      <div className="event-description">
                        {event.id} •{' '}
                        {event.category} •{' '}
                        {event.asset} •{' '}
                        {event.source}
                      </div>
                    </div>

                    <div className="event-meta">
                      <div
                        className={`event-severity event-${severity}`}
                      >
                        {event.severity}
                      </div>

                      <div className="event-time">
                        {formatTime(
                          event.timestamp,
                        )}
                      </div>
                    </div>
                  </div>
                )
              },
            )}
          </div>
        </Panel>
      </div>

      {/* FOOTER HEALTH */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(3, minmax(0, 1fr))',
          gap: 14,
          marginTop: 14,
        }}
      >
        <div className="endpoint-summary-card endpoint-summary-online">
          <div className="endpoint-summary-label">
            ONLINE ENDPOINTS
          </div>

          <div
            className="endpoint-summary-value"
            style={{
              color: '#4ade80',
            }}
          >
            {metrics.endpoints.online}
          </div>

          <div className="endpoint-summary-description">
            Active and reporting
          </div>
        </div>

        <div className="endpoint-summary-card endpoint-summary-offline">
          <div className="endpoint-summary-label">
            HIGH-RISK ENDPOINTS
          </div>

          <div
            className="endpoint-summary-value"
            style={{
              color: '#f87171',
            }}
          >
            {metrics.endpoints.high_risk}
          </div>

          <div className="endpoint-summary-description">
            Critical or high exposure
          </div>
        </div>

        <div className="endpoint-summary-card">
          <div className="endpoint-summary-label">
            DATA RECORDS
          </div>

          <div
            className="endpoint-summary-value"
            style={{
              color: '#67e8f9',
            }}
          >
            {metrics.report_summary.total_records}
          </div>

          <div className="endpoint-summary-description">
            Events + alerts + endpoints
          </div>
        </div>
      </div>

      {/* FOOTER */}

      <div
        className="soc-footer"
        style={{
          marginTop: 22,
          paddingBottom: 10,
        }}
      >
        <div>
          <FileBarChart size={13} />

          CyberSentinel Security Metrics &
          Reporting Center
        </div>

        <div>
          <Wifi size={12} />

          Backend operational
        </div>
      </div>
    </div>
  )
}


