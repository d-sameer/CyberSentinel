import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Boxes, ExternalLink, Search, Shield, Wifi } from 'lucide-react'
import { Link } from 'react-router-dom'

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

type ArchitectureResponse = {
  summary: {
    total: number
    active: number
    inactive: number
    critical: number
    high: number
    medium: number
    low: number
    high_risk: number
    external: number
  }
  total: number
  architecture: ArchitectureRecord[]
}

const API_BASE = 'http://127.0.0.1:8000'

function badgeStyle(value: string) {
  const normalized = value.toUpperCase()

  if (['CRITICAL', 'HIGH', 'EXTERNAL'].includes(normalized)) {
    return {
      background: 'rgba(239, 68, 68, 0.12)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      color: '#f87171',
    }
  }

  if (['MEDIUM', 'CONTROLLED'].includes(normalized)) {
    return {
      background: 'rgba(245, 158, 11, 0.12)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      color: '#fbbf24',
    }
  }

  if (['ACTIVE', 'INTERNAL', 'TRUSTED', 'HIGHLY TRUSTED'].includes(normalized)) {
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

export default function SecurityArchitecture() {
  const [data, setData] = useState<ArchitectureResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [zoneFilter, setZoneFilter] = useState('ALL')
  const [layerFilter, setLayerFilter] = useState('ALL')
  const [criticalityFilter, setCriticalityFilter] = useState('ALL')
  const [riskFilter, setRiskFilter] = useState('ALL')

  const loadArchitecture = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_BASE}/api/architecture`)

      if (!response.ok) {
        throw new Error('Failed to load security architecture')
      }

      const result: ArchitectureResponse = await response.json()
      setData(result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load security architecture',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArchitecture()
  }, [])

  const records = data?.architecture ?? []

  const zones = useMemo(
    () => [...new Set(records.map((item) => item.zone))].sort(),
    [records],
  )

  const layers = useMemo(
    () => [...new Set(records.map((item) => item.security_layer))].sort(),
    [records],
  )

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase()

    return records.filter((item) => {
      const matchesSearch =
        !query ||
        item.architecture_id.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.component_type.toLowerCase().includes(query) ||
        item.owner.toLowerCase().includes(query)

      const matchesZone =
        zoneFilter === 'ALL' || item.zone === zoneFilter

      const matchesLayer =
        layerFilter === 'ALL' || item.security_layer === layerFilter

      const matchesCriticality =
        criticalityFilter === 'ALL' ||
        item.criticality === criticalityFilter

      const matchesRisk =
        riskFilter === 'ALL' ||
        item.risk_level === riskFilter

      return (
        matchesSearch &&
        matchesZone &&
        matchesLayer &&
        matchesCriticality &&
        matchesRisk
      )
    })
  }, [
    records,
    search,
    zoneFilter,
    layerFilter,
    criticalityFilter,
    riskFilter,
  ])

  const summary = data?.summary

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            SECURITY ARCHITECTURE
          </div>

          <h1>Security Architecture Center</h1>

          <p>
            View security zones, architecture layers, critical
            components, trust boundaries, exposure, and architecture
            risk across the CyberSentinel environment.
          </p>
        </div>

        <div className="page-status">
          <Shield size={16} />
          Architecture Visibility
        </div>
      </div>

      {error && (
        <div
          className="dashboard-panel"
          style={{
            marginBottom: 20,
            borderColor: 'rgba(239, 68, 68, 0.35)',
          }}
        >
          <div
            style={{
              color: '#f87171',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-label">Total Components</div>
          <div className="stat-card-value">
            {loading ? '—' : summary?.total ?? 0}
          </div>
          <div className="stat-card-meta">
            Architecture inventory
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">Active</div>
          <div className="stat-card-value">
            {loading ? '—' : summary?.active ?? 0}
          </div>
          <div className="stat-card-meta">
            Active architecture components
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">Critical</div>
          <div className="stat-card-value">
            {loading ? '—' : summary?.critical ?? 0}
          </div>
          <div className="stat-card-meta">
            Critical components
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">High Risk</div>
          <div className="stat-card-value">
            {loading ? '—' : summary?.high_risk ?? 0}
          </div>
          <div className="stat-card-meta">
            Critical or high risk
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">External</div>
          <div className="stat-card-value">
            {loading ? '—' : summary?.external ?? 0}
          </div>
          <div className="stat-card-meta">
            Externally exposed components
          </div>
        </div>
      </div>

      <div
        className="dashboard-panel"
        style={{ marginBottom: 20 }}
      >
        <div className="panel-header">
          <div>
            <h2>Architecture Overview</h2>
            <span>
              Security zones and trust boundaries
            </span>
          </div>

          <Boxes size={18} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 12,
          }}
        >
          {[
            {
              label: 'Internet',
              value: 'Untrusted',
              icon: <ExternalLink size={18} />,
            },
            {
              label: 'DMZ',
              value: 'Controlled',
              icon: <Wifi size={18} />,
            },
            {
              label: 'Internal',
              value: 'Trusted',
              icon: <Shield size={18} />,
            },
            {
              label: 'Restricted',
              value: 'Highly Trusted',
              icon: <Shield size={18} />,
            },
          ].map((zone) => (
            <div
              key={zone.label}
              style={{
                padding: 16,
                border: '1px solid rgba(148, 163, 184, 0.12)',
                borderRadius: 12,
                background: 'rgba(15, 23, 42, 0.45)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: '#cbd5e1',
                  fontWeight: 700,
                }}
              >
                {zone.icon}
                {zone.label}
              </div>

              <div
                style={{
                  marginTop: 8,
                  color: '#64748b',
                  fontSize: 12,
                }}
              >
                Trust boundary
              </div>

              <div
                style={{
                  marginTop: 8,
                  display: 'inline-flex',
                  padding: '5px 9px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  ...badgeStyle(zone.value),
                }}
              >
                {zone.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="dashboard-panel"
        style={{ marginBottom: 20 }}
      >
        <div className="panel-header">
          <div>
            <h2>Architecture Inventory</h2>
            <span>
              {filteredRecords.length} of {records.length}{' '}
              components
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(220px, 2fr) repeat(4, minmax(150px, 1fr))',
            gap: 10,
            marginBottom: 18,
          }}
        >
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
              }}
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search architecture..."
              style={{
                width: '100%',
                padding: '11px 12px 11px 36px',
                background: '#0f172a',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                borderRadius: 8,
                color: '#e2e8f0',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={zoneFilter}
            onChange={(event) =>
              setZoneFilter(event.target.value)
            }
            style={selectStyle}
          >
            <option value="ALL">All Zones</option>
            {zones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>

          <select
            value={layerFilter}
            onChange={(event) =>
              setLayerFilter(event.target.value)
            }
            style={selectStyle}
          >
            <option value="ALL">All Layers</option>
            {layers.map((layer) => (
              <option key={layer} value={layer}>
                {layer}
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
            onChange={(event) =>
              setRiskFilter(event.target.value)
            }
            style={selectStyle}
          >
            <option value="ALL">All Risk</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              minWidth: 1200,
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr>
                {[
                  'ID',
                  'Component',
                  'Zone',
                  'Security Layer',
                  'Criticality',
                  'Risk',
                  'Trust',
                  'Exposure',
                  'Status',
                  'Owner',
                  'Updated',
                  '',
                ].map((heading) => (
                  <th
                    key={heading}
                    style={tableHeaderStyle}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={12}
                    style={emptyStyle}
                  >
                    Loading security architecture...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    style={emptyStyle}
                  >
                    No architecture components match the
                    selected filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => (
                  <tr key={item.architecture_id}>
                    <td style={tableCellStyle}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          color: '#67e8f9',
                          fontSize: 12,
                        }}
                      >
                        {item.architecture_id}
                      </span>
                    </td>

                    <td style={tableCellStyle}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: '#e2e8f0',
                        }}
                      >
                        {item.name}
                      </div>

                      <div
                        style={{
                          marginTop: 4,
                          color: '#64748b',
                          fontSize: 11,
                        }}
                      >
                        {item.component_type}
                      </div>
                    </td>

                    <td style={tableCellStyle}>
                      <span
                        style={{
                          color: '#cbd5e1',
                          fontSize: 12,
                        }}
                      >
                        {item.zone}
                      </span>
                    </td>

                    <td style={tableCellStyle}>
                      <span
                        style={{
                          color: '#94a3b8',
                          fontSize: 12,
                        }}
                      >
                        {item.security_layer}
                      </span>
                    </td>

                    <td style={tableCellStyle}>
                      <span
                        style={{
                          display: 'inline-flex',
                          padding: '5px 9px',
                          borderRadius: 999,
                          fontSize: 10,
                          fontWeight: 800,
                          ...badgeStyle(item.criticality),
                        }}
                      >
                        {item.criticality}
                      </span>
                    </td>

                    <td style={tableCellStyle}>
                      <span
                        style={{
                          display: 'inline-flex',
                          padding: '5px 9px',
                          borderRadius: 999,
                          fontSize: 10,
                          fontWeight: 800,
                          ...badgeStyle(item.risk_level),
                        }}
                      >
                        {item.risk_level}
                      </span>
                    </td>

                    <td style={tableCellStyle}>
                      <span
                        style={{
                          display: 'inline-flex',
                          padding: '5px 9px',
                          borderRadius: 999,
                          fontSize: 10,
                          fontWeight: 700,
                          ...badgeStyle(item.trust_level),
                        }}
                      >
                        {item.trust_level}
                      </span>
                    </td>

                    <td style={tableCellStyle}>
                      <span
                        style={{
                          display: 'inline-flex',
                          padding: '5px 9px',
                          borderRadius: 999,
                          fontSize: 10,
                          fontWeight: 700,
                          ...badgeStyle(item.exposure),
                        }}
                      >
                        {item.exposure}
                      </span>
                    </td>

                    <td style={tableCellStyle}>
                      <span
                        style={{
                          display: 'inline-flex',
                          padding: '5px 9px',
                          borderRadius: 999,
                          fontSize: 10,
                          fontWeight: 700,
                          ...badgeStyle(item.status),
                        }}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td style={tableCellStyle}>
                      <span
                        style={{
                          color: '#94a3b8',
                          fontSize: 12,
                        }}
                      >
                        {item.owner}
                      </span>
                    </td>

                    <td style={tableCellStyle}>
                      <span
                        style={{
                          color: '#64748b',
                          fontSize: 11,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatDate(item.updated_at)}
                      </span>
                    </td>

                    <td style={tableCellStyle}>
                      <Link
                        to={`/architecture/${item.architecture_id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          color: '#67e8f9',
                          textDecoration: 'none',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        View
                        <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const selectStyle = {
  width: '100%',
  padding: '11px 12px',
  background: '#0f172a',
  border: '1px solid rgba(148, 163, 184, 0.15)',
  borderRadius: 8,
  color: '#cbd5e1',
  outline: 'none',
}

const tableHeaderStyle = {
  padding: '12px 10px',
  textAlign: 'left' as const,
  color: '#64748b',
  fontSize: 10,
  fontWeight: 800,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
  whiteSpace: 'nowrap' as const,
}

const tableCellStyle = {
  padding: '14px 10px',
  borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
  verticalAlign: 'middle' as const,
}

const emptyStyle = {
  padding: 40,
  textAlign: 'center' as const,
  color: '#64748b',
  fontSize: 13,
}