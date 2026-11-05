import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDownLeft, ArrowUpRight, CheckCircle2,
  Clock3, Filter, RefreshCw, Search, Shield, ShieldAlert,
  ShieldCheck, XCircle, Wifi,
} from 'lucide-react'
import './Firewall.css'

const API = 'http://127.0.0.1:8001/api/firewall'

type Profile = {
  Name: string
  Enabled: number | boolean | string
  DefaultInboundAction: number
  DefaultOutboundAction: number
}

type FirewallRule = {
  Name: string
  DisplayName: string
  Enabled: number | boolean | string
  Direction: number | string
  Action: number | string
  Profile: number | string
  PolicyStoreSourceType?: number | string
}

type FirewallData = {
  profiles: Profile[]
  summary: {
    total_rules: number
    enabled_rules: number
    inbound_rules: number
    outbound_rules: number
  }
  source: string
}

type RulesData = {
  total: number
  returned: number
  rules: FirewallRule[]
}

type FirewallRuleDetails = {
  Name: string
  DisplayName: string
  Description?: string
  Enabled: boolean | number | string
  Direction: string
  Action: string
  Profile: number | string
  PolicyStoreSource?: string
  PolicyStoreSourceType?: number | string
  Protocol?: unknown[]
  LocalPort?: unknown[]
  RemotePort?: unknown[]
  LocalAddress?: unknown[]
  RemoteAddress?: unknown[]
  Program?: unknown[]
  Package?: unknown[]
  Service?: unknown[]
  InterfaceType?: unknown[]
}

type FirewallDetailsResponse = {
  rule: FirewallRuleDetails
  source: string
  read_only: boolean
}

type DetailGroup = {
  title: string
  fields: [string, unknown[] | undefined][]
}

function isEnabled(value: number | boolean | string) {
  return value === true || value === 1 || value === 'True'
}

function directionLabel(value: number | string) {
  if (value === 1 || value === 'Inbound') return 'Inbound'
  if (value === 2 || value === 'Outbound') return 'Outbound'
  return String(value)
}

function actionLabel(value: number | string) {
  if (value === 1 || value === 'Block') return 'Block'
  if (value === 2 || value === 'Allow') return 'Allow'
  return String(value)
}

function profileLabel(value: number | string) {
  if (value === 1) return 'Domain'
  if (value === 2) return 'Private'
  if (value === 4) return 'Public'
  if (value === 7) return 'All profiles'
  if (typeof value === 'string') return value
  const names = [
    (value & 1) ? 'Domain' : '',
    (value & 2) ? 'Private' : '',
    (value & 4) ? 'Public' : '',
  ].filter(Boolean)
  return names.join(', ') || 'Not specified'
}

function StatCard({
  label, value, icon: Icon, detail,
}: {
  label: string
  value: string | number
  icon: typeof Shield
  detail: string
}) {
  return (
    <div className="fw-stat-card">
      <div className="fw-stat-top">
        <span>{label}</span>
        <Icon size={19} />
      </div>
      <div className="fw-stat-value">{value}</div>
      <div className="fw-stat-detail">{detail}</div>
    </div>
  )
}

export default function Firewall() {
  const [summary, setSummary] = useState<FirewallData | null>(null)
  const [rules, setRules] = useState<FirewallRule[]>([])
  const [totalRules, setTotalRules] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [direction, setDirection] = useState('ALL')
  const [status, setStatus] = useState('ALL')
  const [action, setAction] = useState('ALL')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [selectedRule, setSelectedRule] = useState<FirewallRule | null>(null)
  const [ruleDetails, setRuleDetails] = useState<FirewallRuleDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')


  const loadFirewall = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true)
    else setLoading(true)
    setError('')

    try {
      const [summaryResponse, rulesResponse] = await Promise.all([
        fetch(`${API}/summary`),
        fetch(`${API}/rules?limit=500`),
      ])

      if (!summaryResponse.ok || !rulesResponse.ok) {
        throw new Error('Firewall API is unavailable. Check the backend.')
      }

      const [summaryData, rulesData]: [FirewallData, RulesData] =
        await Promise.all([
          summaryResponse.json(),
          rulesResponse.json(),
        ])

      setSummary(summaryData)
      setRules(rulesData.rules ?? [])
      setTotalRules(rulesData.total ?? 0)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load firewall data.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const openRuleDetails = async (rule: FirewallRule) => {
    setSelectedRule(rule)
    setRuleDetails(null)
    setDetailsError('')
    setDetailsLoading(true)

    try {
      const response = await fetch(
        `${API}/rule?name=${encodeURIComponent(rule.Name)}`
      )
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.detail || 'Unable to retrieve rule details.')
      }
      const data: FirewallDetailsResponse = await response.json()
      setRuleDetails(data.rule)
    } catch (err) {
      setDetailsError(err instanceof Error ? err.message : 'Unable to load rule details.')
    } finally {
      setDetailsLoading(false)
    }
  }

  const closeRuleDetails = () => {
    setSelectedRule(null)
    setRuleDetails(null)
    setDetailsError('')
  }

  useEffect(() => {
    void loadFirewall()
  }, [loadFirewall])

  const profiles = summary?.profiles ?? []
  const enabledProfiles = profiles.filter((profile) => isEnabled(profile.Enabled)).length

  const filteredRules = useMemo(() => {
    const query = search.trim().toLowerCase()

    return rules.filter((rule) => {
      const matchesSearch =
        !query ||
        (rule.DisplayName ?? '').toLowerCase().includes(query) ||
        (rule.Name ?? '').toLowerCase().includes(query)

      const matchesDirection =
        direction === 'ALL' || directionLabel(rule.Direction).toUpperCase() === direction

      const matchesStatus =
        status === 'ALL' ||
        (status === 'ENABLED' ? isEnabled(rule.Enabled) : !isEnabled(rule.Enabled))

      const matchesAction =
        action === 'ALL' || actionLabel(rule.Action).toUpperCase() === action

      return matchesSearch && matchesDirection && matchesStatus && matchesAction
    })
  }, [rules, search, direction, status, action])

  const detailGroups: DetailGroup[] = ruleDetails ? [
    {
      title: 'NETWORK CONFIGURATION',
      fields: [
        ['Protocol', ruleDetails.Protocol],
        ['Local Port', ruleDetails.LocalPort],
        ['Remote Port', ruleDetails.RemotePort],
        ['Local Address', ruleDetails.LocalAddress],
        ['Remote Address', ruleDetails.RemoteAddress],
        ['Profile', [profileLabel(ruleDetails.Profile)]],
      ],
    },
    {
      title: 'APPLICATION INFORMATION',
      fields: [
        ['Program', ruleDetails.Program],
        ['Package', ruleDetails.Package],
        ['Service', ruleDetails.Service],
        ['Interface Type', ruleDetails.InterfaceType],
      ],
    },
    {
      title: 'POLICY INFORMATION',
      fields: [
        ['Policy Store', ruleDetails.PolicyStoreSource ? [ruleDetails.PolicyStoreSource] : []],
        ['Policy Source Type', ruleDetails.PolicyStoreSourceType !== undefined ? [ruleDetails.PolicyStoreSourceType] : []],
      ],
    },
  ] : []



  return (
    <div className="firewall-page">
      <div className="fw-header">
        <div>
          <div className="fw-eyebrow">
            <ShieldCheck size={15} /> SECURITY OPERATIONS
          </div>
          <h1>Firewall Security Center</h1>
          <p>Monitor and inspect your Windows Defender Firewall configuration.</p>
        </div>
        <button
          className="fw-refresh"
          onClick={() => void loadFirewall(true)}
          disabled={loading || refreshing}
        >
          <RefreshCw size={16} className={refreshing ? 'fw-spinning' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh data'}
        </button>
      </div>

      <div className="fw-source">
        <span className="fw-source-dot" />
        <span>LIVE WINDOWS FIREWALL DATA</span>
        <span className="fw-source-divider">/</span>
        <span>ActiveStore</span>
        <span className="fw-source-readonly">READ ONLY</span>
      </div>

      {error && (
        <div className="fw-error">
          <ShieldAlert size={19} />
          <div>
            <strong>Unable to retrieve firewall information</strong>
            <p>{error}</p>
          </div>
          <button onClick={() => void loadFirewall(true)}>Retry</button>
        </div>
      )}

      {loading && !summary ? (
        <div className="fw-loading">
          <RefreshCw size={22} className="fw-spinning" />
          <span>Loading Windows Firewall configuration...</span>
        </div>
      ) : (
        <>
          <div className="fw-section-heading">
            <div>
              <h2>Firewall profiles</h2>
              <p>Protection status across Windows network profiles</p>
            </div>
            <span className="fw-profile-count">
              {enabledProfiles}/3 PROFILES ACTIVE
            </span>
          </div>

          <div className="fw-profile-grid">
            {profiles.map((profile) => {
              const active = isEnabled(profile.Enabled)
              return (
                <div className="fw-profile-card" key={profile.Name}>
                  <div className="fw-profile-top">
                    <div className="fw-profile-icon"><Shield size={20} /></div>
                    <span className={active ? 'fw-status active' : 'fw-status inactive'}>
                      {active ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                      {active ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <h3>{profile.Name}</h3>
                  <p>Windows Defender Firewall</p>
                  <div className="fw-profile-policy">
                    <span>Inbound default</span>
                    <strong>{profile.DefaultInboundAction === 4 ? 'Block' : profile.DefaultInboundAction === 2 ? 'Allow' : 'Not configured'}</strong>
                  </div>
                  <div className="fw-profile-policy">
                    <span>Outbound default</span>
                    <strong>{profile.DefaultOutboundAction === 4 ? 'Block' : profile.DefaultOutboundAction === 2 ? 'Allow' : 'Not configured'}</strong>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="fw-section-heading">
            <div>
              <h2>Firewall rule overview</h2>
              <p>Rules retrieved from the active Windows policy store</p>
            </div>
          </div>

          <div className="fw-stats-grid">
            <StatCard label="Total rules" value={summary?.summary.total_rules ?? 0} icon={Shield} detail="Registered firewall rules" />
            <StatCard label="Enabled rules" value={summary?.summary.enabled_rules ?? 0} icon={ShieldCheck} detail="Currently enabled" />
            <StatCard label="Inbound rules" value={summary?.summary.inbound_rules ?? 0} icon={ArrowDownLeft} detail="Incoming traffic rules" />
            <StatCard label="Outbound rules" value={summary?.summary.outbound_rules ?? 0} icon={ArrowUpRight} detail="Outgoing traffic rules" />
          </div>

          <div className="fw-rules-section">
            <div className="fw-rules-heading">
              <div>
                <h2>Firewall rules</h2>
                <p>Search and inspect configured firewall policies</p>
              </div>
              <span className="fw-rule-total">{filteredRules.length} / {totalRules} displayed</span>
            </div>

            <div className="fw-filters">
              <div className="fw-search">
                <Search size={17} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search firewall rules..."
                />
              </div>
              <select value={direction} onChange={(event) => setDirection(event.target.value)}>
                <option value="ALL">All directions</option>
                <option value="INBOUND">Inbound</option>
                <option value="OUTBOUND">Outbound</option>
              </select>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="ALL">All statuses</option>
                <option value="ENABLED">Enabled</option>
                <option value="DISABLED">Disabled</option>
              </select>
              <select value={action} onChange={(event) => setAction(event.target.value)}>
                <option value="ALL">All actions</option>
                <option value="ALLOW">Allow</option>
                <option value="BLOCK">Block</option>
              </select>
            </div>

            <div className="fw-table-wrap">
              <table className="fw-table">
                <thead>
                  <tr>
                    <th>RULE NAME</th>
                    <th>DIRECTION</th>
                    <th>ACTION</th>
                    <th>PROFILE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRules.map((rule, index) => {
                    const active = isEnabled(rule.Enabled)
                    const inbound = directionLabel(rule.Direction) === 'Inbound'
                    const ruleAction = actionLabel(rule.Action)

                    return (
                      <tr
                        key={`${rule.Name}-${index}`}
                        className="fw-clickable-row"
                        onClick={() => void openRuleDetails(rule)}
                        title="Click to inspect rule details"
                      >
                        <td>
                          <strong>{rule.DisplayName || rule.Name}</strong>
                          <span>{rule.Name}</span>
                        </td>
                        <td>
                          <span className="fw-direction">
                            {inbound ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                            {directionLabel(rule.Direction)}
                          </span>
                        </td>
                        <td>
                          <span className={ruleAction === 'Block' ? 'fw-action block' : 'fw-action allow'}>
                            {ruleAction}
                          </span>
                        </td>
                        <td>{profileLabel(rule.Profile)}</td>
                        <td>
                          <span className={active ? 'fw-status active' : 'fw-status inactive'}>
                            {active ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredRules.length === 0 && (
                    <tr>
                      <td colSpan={5} className="fw-empty">
                        <Filter size={20} />
                        No firewall rules match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="fw-table-footer">
              Showing up to 500 rules from Windows Defender Firewall ActiveStore.
            </div>
          </div>

          {selectedRule && (
            <div className="fw-details-overlay" onClick={closeRuleDetails}>
              <section
                className="fw-details-panel"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Firewall rule details"
              >
                <div className="fw-details-header">
                  <div>
                    <span className="fw-details-eyebrow">
                      <ShieldCheck size={14} /> FIREWALL INSPECTION
                    </span>
                    <h2>Rule Details</h2>
                    <p>Read-only firewall policy information</p>
                  </div>
                  <button
                    className="fw-details-close"
                    onClick={closeRuleDetails}
                    aria-label="Close rule details"
                  >
                    <XCircle size={20} />
                  </button>
                </div>

                {detailsLoading ? (
                  <div className="fw-details-message">
                    <RefreshCw className="fw-spinning" size={22} />
                    Loading rule information...
                  </div>
                ) : detailsError ? (
                  <div className="fw-details-error">
                    <ShieldAlert size={20} />
                    <span>{detailsError}</span>
                    <button onClick={() => void openRuleDetails(selectedRule)}>
                      Retry
                    </button>
                  </div>
                ) : ruleDetails ? (
                  <div className="fw-details-content">
                    <div className="fw-details-identity">
                      <span>DISPLAY NAME</span>
                      <h3>{ruleDetails.DisplayName || ruleDetails.Name}</h3>
                      <p>{ruleDetails.Name}</p>
                    </div>

                    <div className="fw-details-badges">
                      <span className={isEnabled(ruleDetails.Enabled) ? 'active' : 'inactive'}>
                        {isEnabled(ruleDetails.Enabled) ? 'Enabled' : 'Disabled'}
                      </span>
                      <span className={actionLabel(ruleDetails.Action) === 'Block' ? 'block' : 'allow'}>
                        {actionLabel(ruleDetails.Action)}
                      </span>
                      <span>{directionLabel(ruleDetails.Direction)}</span>
                    </div>

                    {ruleDetails.Description && (
                      <div className="fw-detail-group">
                        <h3>DESCRIPTION</h3>
                        <p>{ruleDetails.Description}</p>
                      </div>
                    )}

                    {detailGroups.map((group) => (
                      <div className="fw-detail-group" key={group.title}>
                        <h3>{group.title}</h3>
                        <div className="fw-detail-grid">
                          {group.fields.map(([label, values]) => (
                            <div className="fw-detail-item" key={label}>
                              <span>{label}</span>
                              <strong>
                                {values?.length
                                  ? values.filter((value) => value !== null && value !== undefined).map(String).join(', ')
                                  : 'Not specified'}
                              </strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="fw-details-readonly">
                      <ShieldCheck size={16} />
                      Inspection only ? no firewall settings modified.
                    </div>
                  </div>
                ) : null}
              </section>
            </div>
          )}

          <div className="fw-footer">
            <div><Wifi size={15} /> Source: {summary?.source ?? 'Windows Defender Firewall'}</div>
            <div><Clock3 size={15} /> Last updated: {lastUpdated?.toLocaleTimeString() ?? '—'}</div>
            <div><Activity size={15} /> Monitoring only — no firewall settings modified</div>
          </div>
        </>
      )}
    </div>
  )
}