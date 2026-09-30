import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileBarChart,
  Monitor,
  RefreshCw,
  Shield,
  ShieldAlert,
  Target,
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

const API_URL = 'http://127.0.0.1:8000/api/reports'

interface ReportResponse {
  report: {
    title: string
    description: string
  }

  executive_summary: {
    total_alerts: number
    open_alerts: number
    resolved_alerts: number
    critical_alerts: number
    high_alerts: number
    total_events: number
    critical_events: number
    total_endpoints: number
    online_endpoints: number
    offline_endpoints: number
    compliance_score: number
  }

  alerts: {
    total: number
    open: number
    resolved: number
    severity: {
      critical: number
      high: number
      medium: number
      low: number
    }
    resolution_rate: number
  }

  events: {
    total: number
    severity: {
      critical: number
      high: number
      medium: number
      low: number
    }
  }

  endpoints: {
    total: number
    online: number
    offline: number
    availability_rate: number
    telemetry_records: number
    activity_records: number
  }

  compliance: {
    score: number
    total_controls: number
    compliant: number
    non_compliant: number
    partial: number
    needs_review: number
    compliance_rate: number
  }

  report_metadata: {
    data_sources: string[]
  }
}

interface StatCardProps {
  label: string
  value: string | number
  subtitle: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  tone?: 'cyan' | 'green' | 'amber' | 'red'
}

function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  tone = 'cyan',
}: StatCardProps) {
  const toneMap = {
    cyan: {
      icon: '#22d3ee',
      background: 'rgba(34,211,238,0.10)',
      border: 'rgba(34,211,238,0.20)',
    },
    green: {
      icon: '#34d399',
      background: 'rgba(52,211,153,0.10)',
      border: 'rgba(52,211,153,0.20)',
    },
    amber: {
      icon: '#fbbf24',
      background: 'rgba(251,191,36,0.10)',
      border: 'rgba(251,191,36,0.20)',
    },
    red: {
      icon: '#f87171',
      background: 'rgba(248,113,113,0.10)',
      border: 'rgba(248,113,113,0.20)',
    },
  }

  const current = toneMap[tone]

  return (
    <div className="stat-card">
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
            }}
          >
            {label}
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 30,
              fontWeight: 800,
              color: '#f8fafc',
              lineHeight: 1,
            }}
          >
            {value}
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: '#64748b',
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 11,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: current.background,
            border: `1px solid ${current.border}`,
            color: current.icon,
            flexShrink: 0,
          }}
        >
          <Icon size={21} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  )
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  title: string
  subtitle: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(34,211,238,0.08)',
          border: '1px solid rgba(34,211,238,0.15)',
          color: '#22d3ee',
          flexShrink: 0,
        }}
      >
        <Icon size={17} strokeWidth={1.8} />
      </div>

      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: '#e2e8f0',
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: 3,
            fontSize: 11,
            color: '#64748b',
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  )
}

export default function Reports() {
  const [report, setReport] = useState<ReportResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const fetchReport = async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError('')

      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error(`Report API returned ${response.status}`)
      }

      const data: ReportResponse = await response.json()

      setReport(data)
    } catch (err) {
      console.error('Failed to load security report:', err)

      setError(
        'Unable to load the security report. Make sure the CyberSentinel backend is running.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void fetchReport()
  }, [])

  const alertSeverityData = useMemo(() => {
    if (!report) return []

    return [
      {
        name: 'Critical',
        value: report.alerts.severity.critical,
      },
      {
        name: 'High',
        value: report.alerts.severity.high,
      },
      {
        name: 'Medium',
        value: report.alerts.severity.medium,
      },
      {
        name: 'Low',
        value: report.alerts.severity.low,
      },
    ]
  }, [report])

  const eventSeverityData = useMemo(() => {
    if (!report) return []

    return [
      {
        name: 'Critical',
        value: report.events.severity.critical,
      },
      {
        name: 'High',
        value: report.events.severity.high,
      },
      {
        name: 'Medium',
        value: report.events.severity.medium,
      },
      {
        name: 'Low',
        value: report.events.severity.low,
      },
    ]
  }, [report])

  const complianceData = useMemo(() => {
    if (!report) return []

    return [
      {
        name: 'Compliant',
        value: report.compliance.compliant,
      },
      {
        name: 'Partial',
        value: report.compliance.partial,
      },
      {
        name: 'Needs Review',
        value: report.compliance.needs_review,
      },
      {
        name: 'Non-Compliant',
        value: report.compliance.non_compliant,
      },
    ]
  }, [report])

  const endpointData = useMemo(() => {
    if (!report) return []

    return [
      {
        name: 'Online',
        value: report.endpoints.online,
      },
      {
        name: 'Offline',
        value: report.endpoints.offline,
      },
    ]
  }, [report])

  if (loading) {
    return (
      <div className="page-container">
        <div
          style={{
            minHeight: 420,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 12,
            color: '#94a3b8',
          }}
        >
          <RefreshCw
            size={28}
            className="spin"
            color="#22d3ee"
          />
          <div style={{ fontSize: 13 }}>
            Loading security report...
          </div>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">SECURITY REPORTING</div>
            <h1>Security Reports</h1>
            <p>
              Executive-level security operations reporting and
              aggregated platform intelligence.
            </p>
          </div>
        </div>

        <div
          className="dashboard-panel"
          style={{
            borderColor: 'rgba(248,113,113,0.25)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: '#f87171',
            }}
          >
            <ShieldAlert size={22} />

            <div>
              <div
                style={{
                  fontWeight: 800,
                  color: '#f8fafc',
                }}
              >
                Report unavailable
              </div>

              <div
                style={{
                  marginTop: 4,
                  color: '#94a3b8',
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void fetchReport(true)}
            style={{
              marginTop: 18,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 14px',
              borderRadius: 8,
              border: '1px solid rgba(34,211,238,0.25)',
              background: 'rgba(34,211,238,0.08)',
              color: '#67e8f9',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      </div>
    )
  }

  const {
    executive_summary,
    alerts,
    events,
    endpoints,
    compliance,
  } = report

  const alertChartColors = [
    '#f87171',
    '#fb923c',
    '#fbbf24',
    '#64748b',
  ]

  const complianceChartColors = [
    '#34d399',
    '#fbbf24',
    '#a78bfa',
    '#f87171',
  ]

  const endpointChartColors = [
    '#34d399',
    '#f87171',
  ]

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            SECURITY REPORTING CENTER
          </div>

          <h1>{report.report.title}</h1>

          <p>{report.report.description}</p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            className="page-status"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#34d399',
                boxShadow: '0 0 10px rgba(52,211,153,0.6)',
              }}
            />
            LIVE REPORT
          </div>

          <button
            type="button"
            onClick={() => void fetchReport(true)}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 13px',
              borderRadius: 8,
              border: '1px solid rgba(148,163,184,0.16)',
              background: 'rgba(15,23,42,0.6)',
              color: '#cbd5e1',
              cursor: refreshing ? 'wait' : 'pointer',
              opacity: refreshing ? 0.65 : 1,
            }}
          >
            <RefreshCw
              size={15}
              className={refreshing ? 'spin' : ''}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Executive KPI cards */}
      <div className="stats-grid">
        <StatCard
          label="Security Alerts"
          value={executive_summary.total_alerts}
          subtitle={`${executive_summary.open_alerts} currently open`}
          icon={AlertTriangle}
          tone="amber"
        />

        <StatCard
          label="Security Events"
          value={executive_summary.total_events}
          subtitle={`${executive_summary.critical_events} critical event`}
          icon={Activity}
          tone="red"
        />

        <StatCard
          label="Protected Endpoints"
          value={executive_summary.total_endpoints}
          subtitle={`${executive_summary.online_endpoints} online`}
          icon={Monitor}
          tone="green"
        />

        <StatCard
          label="Compliance Score"
          value={`${executive_summary.compliance_score}%`}
          subtitle={`${compliance.total_controls} controls assessed`}
          icon={Shield}
          tone="cyan"
        />
      </div>

      {/* Executive summary */}
      <div
        className="dashboard-panel"
        style={{ marginTop: 20 }}
      >
        <div className="panel-header">
          <SectionTitle
            icon={FileBarChart}
            title="Executive Security Summary"
            subtitle="Current operational security posture"
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          <div className="endpoint-summary-card">
            <div
              style={{
                fontSize: 11,
                color: '#64748b',
                textTransform: 'uppercase',
              }}
            >
              Critical Alerts
            </div>

            <div
              style={{
                marginTop: 7,
                fontSize: 24,
                fontWeight: 800,
                color: '#f87171',
              }}
            >
              {executive_summary.critical_alerts}
            </div>
          </div>

          <div className="endpoint-summary-card">
            <div
              style={{
                fontSize: 11,
                color: '#64748b',
                textTransform: 'uppercase',
              }}
            >
              High Alerts
            </div>

            <div
              style={{
                marginTop: 7,
                fontSize: 24,
                fontWeight: 800,
                color: '#fb923c',
              }}
            >
              {executive_summary.high_alerts}
            </div>
          </div>

          <div className="endpoint-summary-card">
            <div
              style={{
                fontSize: 11,
                color: '#64748b',
                textTransform: 'uppercase',
              }}
            >
              Open Alerts
            </div>

            <div
              style={{
                marginTop: 7,
                fontSize: 24,
                fontWeight: 800,
                color: '#fbbf24',
              }}
            >
              {executive_summary.open_alerts}
            </div>
          </div>

          <div className="endpoint-summary-card">
            <div
              style={{
                fontSize: 11,
                color: '#64748b',
                textTransform: 'uppercase',
              }}
            >
              Alert Resolution
            </div>

            <div
              style={{
                marginTop: 7,
                fontSize: 24,
                fontWeight: 800,
                color: '#22d3ee',
              }}
            >
              {alerts.resolution_rate}%
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div
        className="dashboard-grid"
        style={{
          marginTop: 20,
          gridTemplateColumns:
            'repeat(auto-fit, minmax(360px, 1fr))',
        }}
      >
        {/* Alert severity */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <SectionTitle
              icon={AlertTriangle}
              title="Alert Severity"
              subtitle={`${alerts.total} total security alerts`}
            />
          </div>

          <div style={{ height: 290 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={alertSeverityData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  stroke="rgba(148,163,184,0.08)"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fill: '#64748b',
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fill: '#64748b',
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border:
                      '1px solid rgba(148,163,184,0.18)',
                    borderRadius: 8,
                    color: '#e2e8f0',
                  }}
                />

                <Bar
                  dataKey="value"
                  name="Alerts"
                  radius={[5, 5, 0, 0]}
                >
                  {alertSeverityData.map(
                    (_, index) => (
                      <Cell
                        key={`alert-${index}`}
                        fill={
                          alertChartColors[index]
                        }
                      />
                    )
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event severity */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <SectionTitle
              icon={Activity}
              title="Event Severity"
              subtitle={`${events.total} security events`}
            />
          </div>

          <div style={{ height: 290 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={eventSeverityData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  stroke="rgba(148,163,184,0.08)"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fill: '#64748b',
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fill: '#64748b',
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border:
                      '1px solid rgba(148,163,184,0.18)',
                    borderRadius: 8,
                    color: '#e2e8f0',
                  }}
                />

                <Bar
                  dataKey="value"
                  name="Events"
                  radius={[5, 5, 0, 0]}
                >
                  {eventSeverityData.map(
                    (_, index) => (
                      <Cell
                        key={`event-${index}`}
                        fill={
                          alertChartColors[index]
                        }
                      />
                    )
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Endpoint + compliance */}
      <div
        className="dashboard-grid"
        style={{
          marginTop: 20,
          gridTemplateColumns:
            'repeat(auto-fit, minmax(360px, 1fr))',
        }}
      >
        {/* Endpoint security */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <SectionTitle
              icon={Monitor}
              title="Endpoint Security"
              subtitle="Protected infrastructure availability"
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '180px 1fr',
              gap: 20,
              alignItems: 'center',
            }}
          >
            <div style={{ height: 210 }}>
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={endpointData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={82}
                    paddingAngle={3}
                  >
                    {endpointData.map(
                      (_, index) => (
                        <Cell
                          key={`endpoint-${index}`}
                          fill={
                            endpointChartColors[
                              index
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border:
                        '1px solid rgba(148,163,184,0.18)',
                      borderRadius: 8,
                      color: '#e2e8f0',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: '#34d399',
                }}
              >
                {endpoints.availability_rate}%
              </div>

              <div
                style={{
                  marginTop: 4,
                  color: '#94a3b8',
                  fontSize: 12,
                }}
              >
                Endpoint availability
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: 'grid',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      color: '#94a3b8',
                    }}
                  >
                    Online
                  </span>

                  <strong
                    style={{
                      color: '#34d399',
                    }}
                  >
                    {endpoints.online}
                  </strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      color: '#94a3b8',
                    }}
                  >
                    Offline
                  </span>

                  <strong
                    style={{
                      color: '#f87171',
                    }}
                  >
                    {endpoints.offline}
                  </strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      color: '#94a3b8',
                    }}
                  >
                    Telemetry records
                  </span>

                  <strong
                    style={{
                      color: '#cbd5e1',
                    }}
                  >
                    {endpoints.telemetry_records}
                  </strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      color: '#94a3b8',
                    }}
                  >
                    Activity records
                  </span>

                  <strong
                    style={{
                      color: '#cbd5e1',
                    }}
                  >
                    {endpoints.activity_records}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <SectionTitle
              icon={Shield}
              title="Compliance Overview"
              subtitle={`${compliance.total_controls} controls assessed`}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '180px 1fr',
              gap: 20,
              alignItems: 'center',
            }}
          >
            <div style={{ height: 210 }}>
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={complianceData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={82}
                    paddingAngle={3}
                  >
                    {complianceData.map(
                      (_, index) => (
                        <Cell
                          key={`compliance-${index}`}
                          fill={
                            complianceChartColors[
                              index
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border:
                        '1px solid rgba(148,163,184,0.18)',
                      borderRadius: 8,
                      color: '#e2e8f0',
                    }}
                  />

                  <Legend
                    verticalAlign="bottom"
                    height={30}
                    wrapperStyle={{
                      fontSize: 10,
                      color: '#94a3b8',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: '#22d3ee',
                }}
              >
                {compliance.score}%
              </div>

              <div
                style={{
                  marginTop: 4,
                  color: '#94a3b8',
                  fontSize: 12,
                }}
              >
                Weighted compliance score
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: 'grid',
                  gap: 9,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      color: '#94a3b8',
                    }}
                  >
                    Compliant
                  </span>

                  <strong
                    style={{
                      color: '#34d399',
                    }}
                  >
                    {compliance.compliant}
                  </strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      color: '#94a3b8',
                    }}
                  >
                    Partial
                  </span>

                  <strong
                    style={{
                      color: '#fbbf24',
                    }}
                  >
                    {compliance.partial}
                  </strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      color: '#94a3b8',
                    }}
                  >
                    Needs Review
                  </span>

                  <strong
                    style={{
                      color: '#a78bfa',
                    }}
                  >
                    {compliance.needs_review}
                  </strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      color: '#94a3b8',
                    }}
                  >
                    Non-Compliant
                  </span>

                  <strong
                    style={{
                      color: '#f87171',
                    }}
                  >
                    {compliance.non_compliant}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operational indicators */}
      <div
        className="dashboard-panel"
        style={{ marginTop: 20 }}
      >
        <div className="panel-header">
          <SectionTitle
            icon={TrendingUp}
            title="Operational Indicators"
            subtitle="Key security operations measurements"
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          <div className="endpoint-summary-card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#34d399',
              }}
            >
              <CheckCircle2 size={16} />

              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Online Endpoints
              </span>
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 23,
                fontWeight: 800,
                color: '#f8fafc',
              }}
            >
              {endpoints.online}
            </div>
          </div>

          <div className="endpoint-summary-card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#f87171',
              }}
            >
              <ShieldAlert size={16} />

              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Critical Alerts
              </span>
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 23,
                fontWeight: 800,
                color: '#f8fafc',
              }}
            >
              {alerts.severity.critical}
            </div>
          </div>

          <div className="endpoint-summary-card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#22d3ee',
              }}
            >
              <Target size={16} />

              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Compliance Rate
              </span>
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 23,
                fontWeight: 800,
                color: '#f8fafc',
              }}
            >
              {compliance.compliance_rate}%
            </div>
          </div>

          <div className="endpoint-summary-card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#34d399',
              }}
            >
              <Wifi size={16} />

              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Availability
              </span>
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 23,
                fontWeight: 800,
                color: '#f8fafc',
              }}
            >
              {endpoints.availability_rate}%
            </div>
          </div>

          <div className="endpoint-summary-card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#a78bfa',
              }}
            >
              <Activity size={16} />

              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Endpoint Activity
              </span>
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 23,
                fontWeight: 800,
                color: '#f8fafc',
              }}
            >
              {endpoints.activity_records}
            </div>
          </div>

          <div className="endpoint-summary-card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#fbbf24',
              }}
            >
              <XCircle size={16} />

              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Needs Review
              </span>
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 23,
                fontWeight: 800,
                color: '#f8fafc',
              }}
            >
              {compliance.needs_review}
            </div>
          </div>
        </div>
      </div>

      {/* Data sources */}
      <div
        className="dashboard-panel"
        style={{ marginTop: 20 }}
      >
        <div className="panel-header">
          <SectionTitle
            icon={Shield}
            title="Report Data Sources"
            subtitle="Backend datasets contributing to this report"
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {report.report_metadata.data_sources.map(
            (source) => (
              <div
                key={source}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '7px 10px',
                  borderRadius: 7,
                  border:
                    '1px solid rgba(148,163,184,0.13)',
                  background:
                    'rgba(15,23,42,0.45)',
                  color: '#94a3b8',
                  fontSize: 11,
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
              >
                <DatabaseIcon />
                {source}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

function DatabaseIcon() {
  return (
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: '#22d3ee',
        boxShadow:
          '0 0 8px rgba(34,211,238,0.5)',
      }}
    />
  )
}