import {

  AlertTriangle,

  CheckCircle2,

  Clock3,

  Filter,

  Search,

  ShieldAlert,

  ShieldCheck,

  User,

} from 'lucide-react'

import { useEffect, useMemo, useState } from 'react'

import { Link } from 'react-router-dom'



type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'



type IncidentStatus =

  | 'OPEN'

  | 'INVESTIGATING'

  | 'CONTAINED'

  | 'RESOLVED'



type ApiIncident = Record<string, unknown>

type Incident = {

  id: string

  title: string

  description: string

  severity: IncidentSeverity

  status: IncidentStatus

  endpoint: string

  analyst: string

  source: string

  technique: string

  techniqueName: string

  evidenceCount: number

  created: string

  updated: string

}



const API_BASE_URL = 'http://127.0.0.1:8001'



function asString(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return fallback
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => asString(item)).filter(Boolean)
}

function normalizeSeverity(value: unknown): IncidentSeverity {
  const severity = asString(value, 'MEDIUM').trim().toUpperCase()
  if (severity === 'CRITICAL' || severity === 'SEV-1' || severity === 'P1') return 'CRITICAL'
  if (severity === 'HIGH' || severity === 'SEV-2' || severity === 'P2') return 'HIGH'
  if (severity === 'MEDIUM' || severity === 'MODERATE' || severity === 'SEV-3' || severity === 'P3') return 'MEDIUM'
  if (severity === 'LOW' || severity === 'INFO' || severity === 'INFORMATIONAL' || severity === 'SEV-4' || severity === 'P4') return 'LOW'
  return 'MEDIUM'
}

function normalizeStatus(value: unknown): IncidentStatus {
  const status = asString(value, 'OPEN').trim().toUpperCase().replace(/[ -]+/g, '_')
  if (status === 'OPEN' || status === 'NEW' || status === 'DETECTED') return 'OPEN'
  if (status === 'INVESTIGATING' || status === 'IN_PROGRESS' || status === 'UNDER_INVESTIGATION') return 'INVESTIGATING'
  if (status === 'CONTAINED' || status === 'MITIGATED') return 'CONTAINED'
  if (status === 'RESOLVED' || status === 'CLOSED' || status === 'REMEDIATED') return 'RESOLVED'
  return 'OPEN'
}

function formatIncidentDate(value: unknown): string {
  const raw = asString(value, 'Not available')
  if (raw === 'Not available') return raw
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return date.toLocaleString([], {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function firstValue(item: ApiIncident, ...keys: string[]): unknown {
  for (const key of keys) {
    const value = item[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return undefined
}

function mapApiIncident(item: ApiIncident, index: number): Incident {
  const relatedEvents = asStringArray(firstValue(item, 'related_event_ids', 'relatedEventIds', 'event_ids', 'eventIds'))
  const relatedAlerts = asStringArray(firstValue(item, 'related_alert_ids', 'relatedAlertIds', 'alert_ids', 'alertIds'))
  const relatedEvidence = [...relatedEvents, ...relatedAlerts]
  const id = asString(firstValue(item, 'incident_id', 'incidentId', 'case_id', 'caseId', 'id'), `INC-${String(index + 1).padStart(3, '0')}`)
  const title = asString(firstValue(item, 'title', 'name', 'summary'), 'Untitled security incident')
  const source = relatedAlerts.length > 0
    ? relatedAlerts.join(', ')
    : relatedEvents.length > 0
      ? relatedEvents.join(', ')
      : asString(firstValue(item, 'source', 'detection_source'), 'Incident API')
  const technique = asString(firstValue(item, 'technique', 'mitre_technique', 'mitreTechnique'), 'Linked Evidence')
  const techniqueName = asString(firstValue(item, 'technique_name', 'techniqueName', 'mitre_technique_name'), relatedEvents.length > 0 ? relatedEvents.join(', ') : 'No linked events')

  return {
    id,
    title,
    description: asString(firstValue(item, 'description', 'details'), ''),
    severity: normalizeSeverity(firstValue(item, 'severity', 'priority', 'risk_level')),
    status: normalizeStatus(firstValue(item, 'status', 'state', 'incident_status')),
    endpoint: asString(firstValue(item, 'primary_asset', 'primaryAsset', 'endpoint', 'hostname', 'asset_name'), 'Unknown endpoint'),
    analyst: asString(firstValue(item, 'analyst', 'assigned_to', 'assignedTo', 'owner'), 'Unassigned'),
    source,
    technique,
    techniqueName,
    evidenceCount: typeof firstValue(item, 'evidence_count', 'evidenceCount') === 'number'
      ? Number(firstValue(item, 'evidence_count', 'evidenceCount'))
      : relatedEvidence.length,
    created: formatIncidentDate(firstValue(item, 'created_at', 'createdAt', 'created', 'timestamp')),
    updated: formatIncidentDate(firstValue(item, 'updated_at', 'updatedAt', 'updated', 'modified_at')),
  }
}

function extractIncidents(payload: unknown): ApiIncident[] {
  if (Array.isArray(payload)) return payload.filter((item): item is ApiIncident => !!item && typeof item === 'object')
  if (!payload || typeof payload !== 'object') return []
  const record = payload as Record<string, unknown>
  for (const key of ['incidents', 'items', 'results', 'data', 'records']) {
    const value = record[key]
    if (Array.isArray(value)) return value.filter((item): item is ApiIncident => !!item && typeof item === 'object')
    if (value && typeof value === 'object') {
      const nested = extractIncidents(value)
      if (nested.length > 0) return nested
    }
  }
  return []
}

function Incidents() {

  const [incidents, setIncidents] = useState<Incident[]>([])

  const [search, setSearch] = useState('')

  const [severityFilter, setSeverityFilter] = useState('ALL')

  const [statusFilter, setStatusFilter] = useState('ALL')



  const [loading, setLoading] = useState(true)

  const [apiError, setApiError] = useState('')



  useEffect(() => {

    let cancelled = false



    async function loadIncidents() {

      try {

        setLoading(true)

        setApiError('')



        const response = await fetch(`${API_BASE_URL}/api/incidents`)



        if (!response.ok) {

          throw new Error(`Incident API returned ${response.status}`)

        }



        const payload: unknown = await response.json()
        const data = extractIncidents(payload)

        if (!cancelled) {
          setIncidents(data.map(mapApiIncident))
        }

      } catch (error) {

        console.error('Failed to load incidents:', error)



        if (!cancelled) {

          setApiError(

            'Unable to connect to the Incident API. Make sure the CyberSentinel backend is running.',

          )

          setIncidents([])

        }

      } finally {

        if (!cancelled) {

          setLoading(false)

        }

      }

    }



    loadIncidents()



    return () => {

      cancelled = true

    }

  }, [])



  const filteredIncidents = useMemo(() => {

    const query = search.trim().toLowerCase()



    return incidents.filter((incident) => {

      const matchesSearch =

        !query ||

        incident.id.toLowerCase().includes(query) ||

        incident.title.toLowerCase().includes(query) ||

        incident.endpoint.toLowerCase().includes(query) ||

        incident.analyst.toLowerCase().includes(query) ||

        incident.source.toLowerCase().includes(query) ||

        incident.technique.toLowerCase().includes(query) ||

        incident.techniqueName.toLowerCase().includes(query)



      const matchesSeverity =

        severityFilter === 'ALL' ||

        incident.severity === severityFilter



      const matchesStatus =

        statusFilter === 'ALL' ||

        incident.status === statusFilter



      return matchesSearch && matchesSeverity && matchesStatus

    })

  }, [incidents, search, severityFilter, statusFilter])



  const totalIncidents = incidents.length



  const activeIncidents = incidents.filter(

    (incident) =>

      incident.status === 'OPEN' ||

      incident.status === 'INVESTIGATING',

  ).length



  const criticalIncidents = incidents.filter(

    (incident) => incident.severity === 'CRITICAL',

  ).length



  const evidenceTotal = incidents.reduce(

    (sum, incident) => sum + incident.evidenceCount,

    0,

  )



  return (

    <div className="page-container">

      <div className="page-header">

        <div>

          <div className="page-eyebrow">

            INCIDENT RESPONSE

          </div>



          <h1>Incident Center</h1>



          <p>

            Centralize security investigations, evidence,

            analysts, and response activity.

          </p>

        </div>



        <div className="incident-engine-status">

          <span />

          {loading ? 'CONNECTING TO RESPONSE CENTER' : apiError ? 'API OFFLINE' : 'RESPONSE CENTER ONLINE'}

        </div>

      </div>



      {apiError && (

        <div

          style={{

            marginBottom: '18px',

            padding: '13px 15px',

            borderRadius: '10px',

            border: '1px solid rgba(239, 68, 68, 0.25)',

            background: 'rgba(239, 68, 68, 0.07)',

            color: '#fca5a5',

            fontSize: '13px',

            display: 'flex',

            alignItems: 'center',

            gap: '9px',

          }}

        >

          <AlertTriangle size={16} />

          <span>{apiError}</span>

        </div>

      )}



      <section className="incident-summary-grid">

        <div className="incident-summary-card">

          <div className="incident-summary-icon">

            <ShieldCheck size={19} />

          </div>



          <div>

            <span>TOTAL INCIDENTS</span>

            <strong>{loading ? '—' : totalIncidents}</strong>

          </div>

        </div>



        <div className="incident-summary-card">

          <div className="incident-summary-icon">

            <Clock3 size={19} />

          </div>



          <div>

            <span>ACTIVE CASES</span>

            <strong>{loading ? '—' : activeIncidents}</strong>

          </div>

        </div>



        <div className="incident-summary-card">

          <div className="incident-summary-icon incident-summary-icon-critical">

            <ShieldAlert size={19} />

          </div>



          <div>

            <span>CRITICAL</span>

            <strong>{loading ? '—' : criticalIncidents}</strong>

          </div>

        </div>



        <div className="incident-summary-card">

          <div className="incident-summary-icon">

            <CheckCircle2 size={19} />

          </div>



          <div>

            <span>LINKED EVIDENCE</span>

            <strong>{loading ? '—' : evidenceTotal}</strong>

          </div>

        </div>

      </section>



      <section className="incident-toolbar">

        <div className="incident-search">

          <Search size={17} />



          <input

            value={search}

            onChange={(event) => setSearch(event.target.value)}

            placeholder="Search incidents..."

          />

        </div>



        <div className="incident-filter">

          <Filter size={15} />



          <select

            value={severityFilter}

            onChange={(event) =>

              setSeverityFilter(event.target.value)

            }

          >

            <option value="ALL">All Severity</option>

            <option value="CRITICAL">Critical</option>

            <option value="HIGH">High</option>

            <option value="MEDIUM">Medium</option>

            <option value="LOW">Low</option>

          </select>

        </div>



        <div className="incident-filter">

          <Filter size={15} />



          <select

            value={statusFilter}

            onChange={(event) =>

              setStatusFilter(event.target.value)

            }

          >

            <option value="ALL">All Status</option>

            <option value="OPEN">Open</option>

            <option value="INVESTIGATING">

              Investigating

            </option>

            <option value="CONTAINED">Contained</option>

            <option value="RESOLVED">Resolved</option>

          </select>

        </div>

      </section>



      <section className="incident-table-panel">

        <div className="incident-table-header">

          <div>

            <strong>Active Investigation Cases</strong>



            <span>

              {loading

                ? 'Loading incidents from backend...'

                : `${filteredIncidents.length} incidents matching current filters`}

            </span>

          </div>



          <ShieldAlert size={18} />

        </div>



        <div className="incident-table-wrap">

          {loading ? (

            <div

              style={{

                minHeight: '260px',

                display: 'flex',

                flexDirection: 'column',

                alignItems: 'center',

                justifyContent: 'center',

                gap: '10px',

                color: '#94a3b8',

              }}

            >

              <Clock3 size={24} />

              <strong

                style={{

                  color: '#cbd5e1',

                  fontSize: '14px',

                }}

              >

                Loading incident data

              </strong>

              <span style={{ fontSize: '12px' }}>

                Connecting to CyberSentinel Incident API...

              </span>

            </div>

          ) : (

            <>

              <table className="incident-table">

                <thead>

                  <tr>

                    <th>INCIDENT</th>

                    <th>SEVERITY</th>

                    <th>STATUS</th>

                    <th>ENDPOINT</th>

                    <th>ANALYST</th>

                    <th>DETECTION</th>

                    <th>MITRE ATT&CK</th>

                    <th>EVIDENCE</th>

                  </tr>

                </thead>



                <tbody>

                  {filteredIncidents.map((incident) => (

                    <tr key={incident.id}>

                      <td>

                        <Link

                          to={`/incidents/${incident.id}`}

                          className="incident-link"

                        >

                          <strong>{incident.title}</strong>

                          <span>{incident.id}</span>

                        </Link>

                      </td>



                      <td>

                        <span

                          className={`incident-severity incident-severity-${incident.severity.toLowerCase()}`}

                        >

                          <AlertTriangle size={13} />

                          {incident.severity}

                        </span>

                      </td>



                      <td>

                        <span

                          className={`incident-status incident-status-${incident.status.toLowerCase()}`}

                        >

                          <span />

                          {incident.status}

                        </span>

                      </td>



                      <td>

                        <strong className="incident-endpoint">

                          {incident.endpoint}

                        </strong>

                      </td>



                      <td>

                        <div className="incident-analyst">

                          <User size={13} />

                          <span>{incident.analyst}</span>

                        </div>

                      </td>



                      <td>

                        <span className="incident-source">

                          {incident.source}

                        </span>

                      </td>



                      <td>

                        <div className="incident-technique">

                          <strong>{incident.technique}</strong>

                          <span>{incident.techniqueName}</span>

                        </div>

                      </td>



                      <td>

                        <strong className="incident-evidence-count">

                          {incident.evidenceCount}

                        </strong>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>



              {filteredIncidents.length === 0 && (

                <div className="incident-empty">

                  <ShieldAlert size={25} />



                  <strong>No incidents found</strong>



                  <span>

                    Try changing the search or filter criteria.

                  </span>

                </div>

              )}

            </>

          )}

        </div>

      </section>

    </div>

  )

}



export default Incidents
