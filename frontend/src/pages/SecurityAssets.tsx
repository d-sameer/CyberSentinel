import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Database,
  Globe2,
  Monitor,
  Network,
  Search,
  ShieldCheck,
  Server,
} from 'lucide-react'

type Asset = {
  id: number
  asset_id: string
  name: string
  description: string
  asset_type: string
  category: string
  environment: string
  location: string
  owner: string
  business_unit: string
  operating_system: string
  technologies: string[]
  criticality: string
  business_importance: string
  status: string
  security_status: string
  exposure: string
  risk_level: string
  ip_address: string
  hostname: string
  related_endpoint_ids: string[]
  related_vulnerability_ids: string[]
  related_incident_ids: string[]
  related_alert_ids: string[]
  related_architecture_ids: string[]
  created_at: string
  updated_at: string
}

type AssetResponse = {
  summary: {
    total: number
    active: number
    inactive: number
    critical: number
    high_risk: number
    medium_risk: number
    low_risk: number
    external: number
    secure: number
    attention_required: number
  }
  assets: Asset[]
}

const API_BASE = 'http://127.0.0.1:8001'

const formatDate = (value: string) => {
  if (!value) return '—'

  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const getAssetIcon = (type: string) => {
  const normalized = type.toLowerCase()

  if (normalized.includes('database')) return Database
  if (normalized.includes('endpoint')) return Monitor
  if (normalized.includes('network')) return Network
  if (normalized.includes('security')) return ShieldCheck
  if (normalized.includes('storage')) return Boxes
  if (normalized.includes('identity')) return ShieldCheck

  return Server
}

const getRiskClass = (risk: string) => {
  switch (risk.toUpperCase()) {
    case 'HIGH':
      return 'soc-category-critical'
    case 'MEDIUM':
      return 'soc-category-warning'
    case 'LOW':
      return 'soc-category-success'
    default:
      return 'soc-category-neutral'
  }
}

const getCriticalityClass = (criticality: string) => {
  switch (criticality.toUpperCase()) {
    case 'CRITICAL':
      return 'soc-category-critical'
    case 'HIGH':
      return 'soc-category-warning'
    case 'MEDIUM':
      return 'soc-category-info'
    case 'LOW':
      return 'soc-category-success'
    default:
      return 'soc-category-neutral'
  }
}

const getSecurityClass = (status: string) => {
  switch (status.toUpperCase()) {
    case 'SECURE':
      return 'soc-category-success'
    case 'AT_RISK':
      return 'soc-category-warning'
    case 'COMPROMISED':
      return 'soc-category-critical'
    case 'DEGRADED':
      return 'soc-category-warning'
    default:
      return 'soc-category-neutral'
  }
}

const getExposureClass = (exposure: string) => {
  return exposure.toUpperCase() === 'EXTERNAL'
    ? 'soc-category-warning'
    : 'soc-category-info'
}

export default function SecurityAssets() {
  const [data, setData] = useState<AssetResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [environmentFilter, setEnvironmentFilter] = useState('ALL')
  const [criticalityFilter, setCriticalityFilter] = useState('ALL')
  const [riskFilter, setRiskFilter] = useState('ALL')

  const loadAssets = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_BASE}/api/assets`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result: AssetResponse = await response.json()
      setData(result)
    } catch (err) {
      console.error(err)
      setError(
        'Unable to load security assets. Make sure the CyberSentinel backend is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssets()
  }, [])

  const assets = data?.assets ?? []

  const typeOptions = useMemo(
    () => [...new Set(assets.map((asset) => asset.asset_type))].sort(),
    [assets]
  )

  const environmentOptions = useMemo(
    () => [...new Set(assets.map((asset) => asset.environment))].sort(),
    [assets]
  )

  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase()

    return assets.filter((asset) => {
      const matchesSearch =
        !query ||
        asset.asset_id.toLowerCase().includes(query) ||
        asset.name.toLowerCase().includes(query) ||
        asset.hostname.toLowerCase().includes(query) ||
        asset.ip_address.toLowerCase().includes(query) ||
        asset.owner.toLowerCase().includes(query) ||
        asset.category.toLowerCase().includes(query)

      const matchesType =
        typeFilter === 'ALL' || asset.asset_type === typeFilter

      const matchesEnvironment =
        environmentFilter === 'ALL' ||
        asset.environment === environmentFilter

      const matchesCriticality =
        criticalityFilter === 'ALL' ||
        asset.criticality === criticalityFilter

      const matchesRisk =
        riskFilter === 'ALL' || asset.risk_level === riskFilter

      return (
        matchesSearch &&
        matchesType &&
        matchesEnvironment &&
        matchesCriticality &&
        matchesRisk
      )
    })
  }, [
    assets,
    search,
    typeFilter,
    environmentFilter,
    criticalityFilter,
    riskFilter,
  ])

  const summary = data?.summary

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            <Boxes size={14} />
            ASSET MANAGEMENT
          </div>

          <h1>Security Asset Inventory</h1>

          <p>
            Central inventory of enterprise assets, security posture,
            ownership, exposure, risk, and investigation relationships.
          </p>
        </div>

        <div className="page-status">
          <span className="status-dot" />
          INVENTORY ONLINE
        </div>
      </div>

      {error && (
        <div
          className="dashboard-panel"
          style={{
            marginBottom: 20,
            borderColor: 'rgba(248, 113, 113, 0.35)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: '#fca5a5',
            }}
          >
            <CircleAlert size={18} />
            {error}
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span>Total Assets</span>
            <Boxes size={18} />
          </div>

          <div className="stat-card-value">
            {loading ? '—' : summary?.total ?? 0}
          </div>

          <div className="stat-card-meta">
            Enterprise inventory
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Active</span>
            <CheckCircle2 size={18} />
          </div>

          <div className="stat-card-value">
            {loading ? '—' : summary?.active ?? 0}
          </div>

          <div className="stat-card-meta">
            {summary?.inactive ?? 0} inactive
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Critical</span>
            <AlertTriangle size={18} />
          </div>

          <div className="stat-card-value">
            {loading ? '—' : summary?.critical ?? 0}
          </div>

          <div className="stat-card-meta">
            Critical business assets
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>High Risk</span>
            <CircleAlert size={18} />
          </div>

          <div className="stat-card-value">
            {loading ? '—' : summary?.high_risk ?? 0}
          </div>

          <div className="stat-card-meta">
            {summary?.attention_required ?? 0} need attention
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>External</span>
            <Globe2 size={18} />
          </div>

          <div className="stat-card-value">
            {loading ? '—' : summary?.external ?? 0}
          </div>

          <div className="stat-card-meta">
            Internet-exposed assets
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: 20 }}>
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Security Posture</div>
              <div className="panel-subtitle">
                Current asset protection state
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 12,
              marginTop: 18,
            }}
          >
            <div className="endpoint-summary-card">
              <div className="endpoint-summary-label">
                Secure
              </div>
              <div className="endpoint-summary-value">
                {summary?.secure ?? 0}
              </div>
              <div className="endpoint-summary-meta">
                Protected assets
              </div>
            </div>

            <div className="endpoint-summary-card">
              <div className="endpoint-summary-label">
                Attention
              </div>
              <div className="endpoint-summary-value">
                {summary?.attention_required ?? 0}
              </div>
              <div className="endpoint-summary-meta">
                At-risk or degraded
              </div>
            </div>

            <div className="endpoint-summary-card">
              <div className="endpoint-summary-label">
                Medium Risk
              </div>
              <div className="endpoint-summary-value">
                {summary?.medium_risk ?? 0}
              </div>
              <div className="endpoint-summary-meta">
                Monitoring required
              </div>
            </div>

            <div className="endpoint-summary-card">
              <div className="endpoint-summary-label">
                Low Risk
              </div>
              <div className="endpoint-summary-value">
                {summary?.low_risk ?? 0}
              </div>
              <div className="endpoint-summary-meta">
                Lower exposure
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-panel" style={{ marginTop: 20 }}>
        <div className="panel-header">
          <div>
            <div className="panel-title">Asset Inventory</div>
            <div className="panel-subtitle">
              {filteredAssets.length} of {assets.length} assets
              displayed
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 18,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              minWidth: 260,
              flex: '1 1 280px',
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              borderRadius: 8,
              padding: '9px 12px',
            }}
          >
            <Search size={16} style={{ opacity: 0.6 }} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search asset, hostname, IP, owner..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#e2e8f0',
                fontSize: 13,
              }}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            style={selectStyle}
          >
            <option value="ALL">All Types</option>
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={environmentFilter}
            onChange={(event) =>
              setEnvironmentFilter(event.target.value)
            }
            style={selectStyle}
          >
            <option value="ALL">All Environments</option>
            {environmentOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={criticalityFilter}
            onChange={(event) =>
              setCriticalityFilter(event.target.value)
            }
            style={selectStyle}
          >
            <option value="ALL">All Criticality</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={riskFilter}
            onChange={(event) => setRiskFilter(event.target.value)}
            style={selectStyle}
          >
            <option value="ALL">All Risk</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div
          style={{
            overflowX: 'auto',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: 10,
          }}
        >
          <table
            style={{
              width: '100%',
              minWidth: 1250,
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr>
                {[
                  'Asset',
                  'Type',
                  'Environment',
                  'Criticality',
                  'Risk',
                  'Security',
                  'Exposure',
                  'Owner',
                  'Updated',
                  'View',
                ].map((heading) => (
                  <th key={heading} style={tableHeaderStyle}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={10}
                    style={emptyStyle}
                  >
                    Loading security assets...
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    style={emptyStyle}
                  >
                    No assets match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  const Icon = getAssetIcon(asset.asset_type)

                  return (
                    <tr key={asset.asset_id}>
                      <td style={tableCellStyle}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 8,
                              display: 'grid',
                              placeItems: 'center',
                              background:
                                'rgba(34, 211, 238, 0.08)',
                              border:
                                '1px solid rgba(34, 211, 238, 0.15)',
                              flexShrink: 0,
                            }}
                          >
                            <Icon size={16} />
                          </div>

                          <div>
                            <div
                              style={{
                                fontWeight: 600,
                                color: '#e2e8f0',
                              }}
                            >
                              {asset.name}
                            </div>

                            <div
                              style={{
                                fontSize: 11,
                                color: '#64748b',
                                marginTop: 3,
                              }}
                            >
                              {asset.asset_id} · {asset.hostname}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={tableCellStyle}>
                        <span className="soc-category-info">
                          {asset.asset_type}
                        </span>
                      </td>

                      <td style={tableCellStyle}>
                        {asset.environment}
                      </td>

                      <td style={tableCellStyle}>
                        <span
                          className={getCriticalityClass(
                            asset.criticality
                          )}
                        >
                          {asset.criticality}
                        </span>
                      </td>

                      <td style={tableCellStyle}>
                        <span
                          className={getRiskClass(
                            asset.risk_level
                          )}
                        >
                          {asset.risk_level}
                        </span>
                      </td>

                      <td style={tableCellStyle}>
                        <span
                          className={getSecurityClass(
                            asset.security_status
                          )}
                        >
                          {asset.security_status.replace('_', ' ')}
                        </span>
                      </td>

                      <td style={tableCellStyle}>
                        <span
                          className={getExposureClass(
                            asset.exposure
                          )}
                        >
                          {asset.exposure}
                        </span>
                      </td>

                      <td style={tableCellStyle}>
                        <div>
                          <div
                            style={{
                              color: '#cbd5e1',
                              fontSize: 12,
                            }}
                          >
                            {asset.owner}
                          </div>

                          <div
                            style={{
                              color: '#64748b',
                              fontSize: 11,
                              marginTop: 3,
                            }}
                          >
                            {asset.business_unit}
                          </div>
                        </div>
                      </td>

                      <td
                        style={{
                          ...tableCellStyle,
                          color: '#94a3b8',
                        }}
                      >
                        {formatDate(asset.updated_at)}
                      </td>

                      <td
                        style={{
                          ...tableCellStyle,
                          position: 'sticky',
                          right: 0,
                          background: '#0b1220',
                          zIndex: 2,
                        }}
                      >
                        <Link
                          to={`/assets/${asset.asset_id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            color: '#67e8f9',
                            textDecoration: 'none',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          View
                          <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  background: '#0f172a',
  border: '1px solid rgba(148, 163, 184, 0.15)',
  borderRadius: 8,
  color: '#cbd5e1',
  padding: '9px 12px',
  outline: 'none',
  fontSize: 12,
  minWidth: 145,
}

const tableHeaderStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 14px',
  fontSize: 10,
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
  whiteSpace: 'nowrap',
}

const tableCellStyle: React.CSSProperties = {
  padding: '13px 14px',
  fontSize: 12,
  color: '#94a3b8',
  borderBottom: '1px solid rgba(148, 163, 184, 0.07)',
  whiteSpace: 'nowrap',
}

const emptyStyle: React.CSSProperties = {
  padding: '40px 20px',
  textAlign: 'center',
  color: '#64748b',
  fontSize: 13,
}