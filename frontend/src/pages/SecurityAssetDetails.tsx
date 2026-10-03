import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  Globe2,
  Laptop,
  Network,
  Server,
  Shield,
  ShieldCheck,
  TriangleAlert,
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

const API_BASE = 'http://127.0.0.1:8000'

const formatDateTime = (value: string) => {
  if (!value) return '—'

  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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

const getAssetIcon = (type: string) => {
  const normalized = type.toLowerCase()

  if (normalized.includes('endpoint')) return Laptop
  if (normalized.includes('network')) return Network
  if (normalized.includes('security')) return ShieldCheck
  if (normalized.includes('identity')) return Shield
  if (normalized.includes('server')) return Server

  return Boxes
}

function TagList({
  items,
  emptyText = 'No related records',
}: {
  items: string[]
  emptyText?: string
}) {
  if (items.length === 0) {
    return (
      <div
        style={{
          color: '#64748b',
          fontSize: 13,
          padding: '12px 0',
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
            padding: '7px 10px',
            borderRadius: 7,
            border: '1px solid rgba(34, 211, 238, 0.16)',
            background: 'rgba(34, 211, 238, 0.05)',
            color: '#67e8f9',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'monospace',
          }}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function RelationshipCard({
  title,
  subtitle,
  icon: Icon,
  items,
  pathPrefix,
}: {
  title: string
  subtitle: string
  icon: typeof Shield
  items: string[]
  pathPrefix: string
}) {
  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Icon size={20} />

          <div>
            <div className="panel-title">{title}</div>
            <div className="panel-subtitle">{subtitle}</div>
          </div>
        </div>

        <span
          style={{
            fontSize: 11,
            color: '#64748b',
          }}
        >
          {items.length} linked
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 10,
          marginTop: 18,
        }}
      >
        {items.length === 0 ? (
          <div
            style={{
              color: '#64748b',
              fontSize: 13,
              padding: '8px 0',
            }}
          >
            No related records
          </div>
        ) : (
          items.map((item) => (
            <Link
              key={item}
              to={`${pathPrefix}/${item}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                padding: '13px 14px',
                borderRadius: 9,
                border:
                  '1px solid rgba(148, 163, 184, 0.12)',
                background: 'rgba(15, 23, 42, 0.7)',
                color: '#67e8f9',
                textDecoration: 'none',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'monospace',
              }}
            >
              {item}
              <ExternalLink size={14} />
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

export default function SecurityAssetDetails() {
  const { assetId } = useParams<{ assetId: string }>()

  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAsset = async () => {
    if (!assetId) return

    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `${API_BASE}/api/assets/${assetId}`
      )

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Security asset not found.')
        }

        throw new Error(`HTTP ${response.status}`)
      }

      const result: Asset = await response.json()
      setAsset(result)
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load security asset.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAsset()
  }, [assetId])

  if (loading) {
    return (
      <div className="page-container">
        <div className="dashboard-panel">
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            Loading security asset...
          </div>
        </div>
      </div>
    )
  }

  if (error || !asset) {
    return (
      <div className="page-container">
        <Link
          to="/assets"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: '#67e8f9',
            textDecoration: 'none',
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          <ArrowLeft size={18} />
          Back to Security Asset Inventory
        </Link>

        <div className="dashboard-panel">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: '#fca5a5',
              padding: 30,
            }}
          >
            <CircleAlert size={20} />
            {error || 'Security asset not found.'}
          </div>
        </div>
      </div>
    )
  }

  const AssetIcon = getAssetIcon(asset.asset_type)

  return (
    <div className="page-container">
      <Link
        to="/assets"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          color: '#67e8f9',
          textDecoration: 'none',
          fontWeight: 600,
          marginBottom: 22,
        }}
      >
        <ArrowLeft size={18} />
        Back to Security Asset Inventory
      </Link>

      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            <Boxes size={14} />
            SECURITY ASSET
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 8,
            }}
          >
            <AssetIcon size={32} />

            <h1>{asset.name}</h1>
          </div>

          <p>{asset.description}</p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 10,
          }}
        >
          <span className={getSecurityClass(asset.security_status)}>
            {asset.security_status.replace('_', ' ')}
          </span>

          <span className={getRiskClass(asset.risk_level)}>
            {asset.risk_level} RISK
          </span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span>Asset ID</span>
            <Boxes size={18} />
          </div>

          <div
            className="stat-card-value"
            style={{ fontFamily: 'monospace' }}
          >
            {asset.asset_id}
          </div>

          <div className="stat-card-meta">
            Registered security asset
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Asset Type</span>
            <Server size={18} />
          </div>

          <div className="stat-card-value">
            {asset.asset_type}
          </div>

          <div className="stat-card-meta">
            {asset.category}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Criticality</span>
            <TriangleAlert size={18} />
          </div>

          <div className="stat-card-value">
            {asset.criticality}
          </div>

          <div className="stat-card-meta">
            {asset.business_importance} business importance
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Exposure</span>
            <Globe2 size={18} />
          </div>

          <div className="stat-card-value">
            {asset.exposure}
          </div>

          <div className="stat-card-meta">
            {asset.environment} environment
          </div>
        </div>
      </div>

      <div
        className="dashboard-grid"
        style={{ marginTop: 20 }}
      >
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                Asset Overview
              </div>

              <div className="panel-subtitle">
                Core asset classification and ownership
              </div>
            </div>

            <Boxes size={20} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(190px, 1fr))',
              gap: 12,
              marginTop: 18,
            }}
          >
            <InfoCard
              label="Category"
              value={asset.category}
            />

            <InfoCard
              label="Environment"
              value={asset.environment}
            />

            <InfoCard
              label="Location"
              value={asset.location}
            />

            <InfoCard
              label="Owner"
              value={asset.owner}
            />

            <InfoCard
              label="Business Unit"
              value={asset.business_unit}
            />

            <InfoCard
              label="Operating System"
              value={asset.operating_system}
            />
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                Risk & Security
              </div>

              <div className="panel-subtitle">
                Current asset security posture
              </div>
            </div>

            <Shield size={20} />
          </div>

          <div style={{ marginTop: 12 }}>
            <RiskRow
              label="Risk Level"
              value={asset.risk_level}
              className={getRiskClass(asset.risk_level)}
            />

            <RiskRow
              label="Criticality"
              value={asset.criticality}
              className={getCriticalityClass(
                asset.criticality
              )}
            />

            <RiskRow
              label="Security Status"
              value={asset.security_status.replace(
                '_',
                ' '
              )}
              className={getSecurityClass(
                asset.security_status
              )}
            />

            <RiskRow
              label="Exposure"
              value={asset.exposure}
              className={getExposureClass(asset.exposure)}
            />

            <RiskRow
              label="Asset Status"
              value={asset.status}
              className={
                asset.status === 'ACTIVE'
                  ? 'soc-category-success'
                  : 'soc-category-neutral'
              }
            />
          </div>
        </div>
      </div>

      <div
        className="dashboard-grid"
        style={{ marginTop: 20 }}
      >
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                Network Identity
              </div>

              <div className="panel-subtitle">
                Host and network identification
              </div>
            </div>

            <Network size={20} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
              marginTop: 18,
            }}
          >
            <InfoCard
              label="Hostname"
              value={asset.hostname}
              mono
            />

            <InfoCard
              label="IP Address"
              value={asset.ip_address}
              mono
            />

            <InfoCard
              label="Environment"
              value={asset.environment}
            />

            <InfoCard
              label="Location"
              value={asset.location}
            />
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                Technology Stack
              </div>

              <div className="panel-subtitle">
                Technologies associated with this asset
              </div>
            </div>

            <Server size={20} />
          </div>

          <div style={{ marginTop: 18 }}>
            <TagList
              items={asset.technologies}
              emptyText="No technologies recorded"
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <RelationshipCard
          title="Endpoint Correlation"
          subtitle="Related endpoint security records"
          icon={Laptop}
          items={asset.related_endpoint_ids}
          pathPrefix="/endpoints"
        />
      </div>

      <div
        className="dashboard-grid"
        style={{ marginTop: 20 }}
      >
        <RelationshipCard
          title="Vulnerabilities"
          subtitle="Related vulnerability findings"
          icon={TriangleAlert}
          items={asset.related_vulnerability_ids}
          pathPrefix="/vulnerabilities"
        />

        <RelationshipCard
          title="Incidents"
          subtitle="Related security incidents"
          icon={AlertTriangle}
          items={asset.related_incident_ids}
          pathPrefix="/incidents"
        />
      </div>

      <div
        className="dashboard-grid"
        style={{ marginTop: 20 }}
      >
        <RelationshipCard
          title="Alerts"
          subtitle="Related security alerts"
          icon={CircleAlert}
          items={asset.related_alert_ids}
          pathPrefix="/alerts"
        />

        <RelationshipCard
          title="Architecture"
          subtitle="Related security architecture"
          icon={Network}
          items={asset.related_architecture_ids}
          pathPrefix="/architecture"
        />
      </div>

      <div
        className="dashboard-panel"
        style={{ marginTop: 20 }}
      >
        <div className="panel-header">
          <div>
            <div className="panel-title">
              Asset Ownership
            </div>

            <div className="panel-subtitle">
              Administrative responsibility
            </div>
          </div>

          <ShieldCheck size={20} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
            marginTop: 18,
          }}
        >
          <InfoCard
            label="Owner"
            value={asset.owner}
          />

          <InfoCard
            label="Business Unit"
            value={asset.business_unit}
          />

          <InfoCard
            label="Business Importance"
            value={asset.business_importance}
          />
        </div>
      </div>

      <div
        className="dashboard-panel"
        style={{ marginTop: 20 }}
      >
        <div className="panel-header">
          <div>
            <div className="panel-title">
              Asset Metadata
            </div>

            <div className="panel-subtitle">
              Administrative record information
            </div>
          </div>

          <CheckCircle2 size={20} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
            marginTop: 18,
          }}
        >
          <MetaItem
            label="Created"
            value={formatDateTime(asset.created_at)}
          />

          <MetaItem
            label="Last Updated"
            value={formatDateTime(asset.updated_at)}
          />

          <MetaItem
            label="Asset ID"
            value={asset.asset_id}
          />
        </div>
      </div>
    </div>
  )
}

function InfoCard({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 9,
        background: 'rgba(15, 23, 42, 0.65)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 8,
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: '#e2e8f0',
          fontWeight: 600,
          fontSize: 13,
          fontFamily: mono ? 'monospace' : 'inherit',
          wordBreak: 'break-word',
        }}
      >
        {value || '—'}
      </div>
    </div>
  )
}

function RiskRow({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 15,
        padding: '13px 0',
        borderBottom:
          '1px solid rgba(148, 163, 184, 0.08)',
      }}
    >
      <span
        style={{
          color: '#64748b',
          fontSize: 13,
        }}
      >
        {label}
      </span>

      <span className={className}>
        {value}
      </span>
    </div>
  )
}

function MetaItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 8,
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: '#cbd5e1',
          fontSize: 13,
        }}
      >
        {value}
      </div>
    </div>
  )
}