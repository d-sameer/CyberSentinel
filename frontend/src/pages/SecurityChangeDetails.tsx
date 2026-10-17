import { useEffect, useState } from 'react'

import { Link, useParams } from 'react-router-dom'

import {

  AlertTriangle,

  ArrowLeft,

  CalendarClock,

  CheckCircle2,

  ClipboardCheck,

  FileCog,

  GitBranch,

  Shield,

  ShieldAlert,

  User,
  ThumbsUp,
  ThumbsDown,
  Play,
  RotateCcw,
  XCircle,

} from 'lucide-react'



type SecurityChange = {

  id: number

  change_id: string

  title: string

  description: string

  change_type: string

  category: string

  priority: string

  risk_level: string

  status: string

  approval_status: string

  implementation_status: string

  environment: string

  asset_id: string

  asset_name: string

  requester: string

  owner: string

  business_impact: string

  security_impact: string

  implementation_plan: string

  validation_plan: string

  rollback_plan: string

  scheduled_start: string | null

  scheduled_end: string | null

  related_configuration_ids: string[]

  related_incident_ids: string[]

  related_vulnerability_ids: string[]

  related_alert_ids: string[]

  created_at: string

  updated_at: string

}



type SecurityChangeAction = {

  id: number

  change_id: string

  action: string

  status: string

  performed_by: string

  notes: string

  created_at: string

}



const API_URL = 'http://127.0.0.1:8001/api/security-changes'



function statusClass(status: string) {

  const value = status.toUpperCase()



  if (value === 'COMPLETED') return 'status-success'

  if (value === 'IN_PROGRESS') return 'status-warning'

  if (value === 'PLANNED') return 'status-info'

  if (value === 'FAILED') return 'status-danger'

  if (value === 'ROLLED_BACK') return 'status-danger'



  return 'status-neutral'

}



function riskClass(risk: string) {

  const value = risk.toUpperCase()



  if (value === 'CRITICAL') return 'status-danger'

  if (value === 'HIGH') return 'status-warning'

  if (value === 'MEDIUM') return 'status-info'

  if (value === 'LOW') return 'status-success'



  return 'status-neutral'

}



function approvalClass(status: string) {

  const value = status.toUpperCase()



  if (value === 'APPROVED') return 'status-success'

  if (value === 'PENDING') return 'status-warning'

  if (value === 'REJECTED') return 'status-danger'



  return 'status-neutral'

}



function formatStatus(value: string) {

  return value

    .toLowerCase()

    .split('_')

    .map(

      (part) =>

        part.charAt(0).toUpperCase() + part.slice(1),

    )

    .join(' ')

}



function formatDate(value: string | null) {

  if (!value) return 'Not scheduled'



  return new Date(value).toLocaleString([], {

    dateStyle: 'medium',

    timeStyle: 'short',

  })

}



function DetailRow({

  label,

  value,

}: {

  label: string

  value: React.ReactNode

}) {

  return (

    <div

      style={{

        display: 'grid',

        gridTemplateColumns: '180px 1fr',

        gap: '24px',

        padding: '15px 0',

        borderBottom:

          '1px solid rgba(148, 163, 184, 0.10)',

      }}

    >

      <div

        style={{

          color: '#64748b',

          fontSize: '13px',

          fontWeight: 600,

        }}

      >

        {label}

      </div>



      <div

        style={{

          color: '#cbd5e1',

          fontSize: '14px',

          lineHeight: 1.6,

        }}

      >

        {value}

      </div>

    </div>

  )

}



function TextPanel({

  title,

  description,

  value,

  icon,

}: {

  title: string

  description: string

  value: string

  icon: React.ReactNode

}) {

  return (

    <div
      className="dashboard-panel"
      style={{
        minHeight: '0',
        height: 'auto',
      }}
    >

      <div className="panel-header">

        <div>

          <h3>{title}</h3>

          <span>{description}</span>

        </div>



        {icon}

      </div>



      <div style={{ padding: '20px' }}>

        <div

          style={{

            padding: '18px',

            borderRadius: '10px',

            background: 'rgba(15, 23, 42, 0.65)',

            border:

              '1px solid rgba(148, 163, 184, 0.12)',

            color: '#cbd5e1',

            lineHeight: 1.7,

            fontSize: '14px',

          }}

        >

          {value}

        </div>

      </div>

    </div>

  )

}



export default function SecurityChangeDetails() {

  const { changeId } = useParams<{ changeId: string }>()



  const [change, setChange] =

    useState<SecurityChange | null>(null)



  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')

  const [actions, setActions] =

    useState<SecurityChangeAction[]>([])

  const [actionNotes, setActionNotes] = useState('')

  const [actionLoading, setActionLoading] =

    useState(false)

  const [actionError, setActionError] = useState('')



  useEffect(() => {

    const loadData = async () => {

      if (!changeId) {

        setError('Security change ID is missing')

        setLoading(false)

        return

      }



      try {

        setLoading(true)

        setError('')

        setActionError('')



        const [changeResponse, actionsResponse] =

          await Promise.all([

            fetch(`${API_URL}/${changeId}`),

            fetch(`${API_URL}/${changeId}/actions`),

          ])



        if (!changeResponse.ok) {

          throw new Error(

            'Security change could not be found',

          )

        }



        if (!actionsResponse.ok) {

          throw new Error(

            'Security change response history could not be loaded',

          )

        }



        const changeResult: SecurityChange =

          await changeResponse.json()

        const actionsResult: {

          change_id: string

          actions: SecurityChangeAction[]

        } = await actionsResponse.json()



        setChange(changeResult)

        setActions(actionsResult.actions || [])

      } catch (err) {

        setError(

          err instanceof Error

            ? err.message

            : 'Unable to load security change',

        )

      } finally {

        setLoading(false)

      }

    }



    loadData()

  }, [changeId])



  const performAction = async (action: string) => {

    if (!changeId || actionLoading) return



    try {

      setActionLoading(true)

      setActionError('')



      const response = await fetch(

        `${API_URL}/${changeId}/actions`,

        {

          method: 'POST',

          headers: {

            'Content-Type': 'application/json',

          },

          body: JSON.stringify({

            action,

            performed_by: 'Security Analyst',

            notes: actionNotes.trim(),

          }),

        },

      )



      const result = await response.json()



      if (!response.ok) {

        throw new Error(

          result.detail ||

            'Security change action failed',

        )

      }



      setChange((current) =>

        current

          ? {

              ...current,

              status: result.change.status,

              approval_status: result.change.approval_status,

              implementation_status:

                result.change.implementation_status,

              updated_at: result.change.updated_at,

            }

          : current,

      )

      setActions((current) => [

        result.action,

        ...current,

      ])

      setActionNotes('')

    } catch (err) {

      setActionError(

        err instanceof Error

          ? err.message

          : 'Unable to complete security change action',

      )

    } finally {

      setActionLoading(false)

    }

  }



  if (loading) {

    return (

      <div className="page-container">

        <div className="dashboard-panel">

          <div

            style={{

              padding: '40px',

              textAlign: 'center',

              color: '#64748b',

            }}

          >

            Loading security change...

          </div>

        </div>

      </div>

    )

  }



  if (error || !change) {

    return (

      <div className="page-container">

        <div className="dashboard-panel">

          <div

            style={{

              padding: '40px',

              textAlign: 'center',

            }}

          >

            <AlertTriangle

              size={32}

              style={{

                color: '#f87171',

                marginBottom: '12px',

              }}

            />



            <h2

              style={{

                margin: '0 0 8px',

                color: '#f8fafc',

              }}

            >

              Security Change Not Found

            </h2>



            <p

              style={{

                color: '#64748b',

                marginBottom: '20px',

              }}

            >

              {error ||

                'The requested security change does not exist.'}

            </p>



            <Link

              to="/security-changes"

              style={{

                color: '#67e8f9',

                textDecoration: 'none',

              }}

            >

              <ArrowLeft

                size={16}

                style={{

                  verticalAlign: 'middle',

                  marginRight: '6px',

                }}

              />

              Back to Change Management

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

          <div className="page-eyebrow">

            SECURITY CHANGE INVESTIGATION

          </div>



          <h1>{change.title}</h1>



          <p>{change.description}</p>

        </div>



        <div className="page-status">

          <FileCog size={16} />

          Change {change.change_id}

        </div>

      </div>



      {/* Compact Change Status Header */}

      <div

        className="dashboard-panel"

        style={{

          marginBottom: '20px',

          minHeight: '0',

          height: 'auto',

        }}

      >

        <div

          style={{

            padding: '20px 22px',

            display: 'flex',

            justifyContent: 'space-between',

            alignItems: 'center',

            gap: '20px',

            flexWrap: 'wrap',

            minHeight: '0',

          }}

        >

          <div

            style={{

              display: 'flex',

              alignItems: 'center',

              gap: '16px',

            }}

          >

            <div

              style={{

                width: '52px',

                height: '52px',

                borderRadius: '12px',

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'center',

                background:

                  'rgba(34, 211, 238, 0.08)',

                border:

                  '1px solid rgba(34, 211, 238, 0.22)',

              }}

            >

              <GitBranch

                size={25}

                style={{ color: '#22d3ee' }}

              />

            </div>



            <div>

              <div

                style={{

                  fontSize: '18px',

                  fontWeight: 700,

                  color: '#f8fafc',

                }}

              >

                {change.change_id}

              </div>



              <div

                style={{

                  marginTop: '4px',

                  color: '#64748b',

                  fontSize: '13px',

                }}

              >

                {change.change_type} · {change.category}

              </div>

            </div>

          </div>



          <div

            style={{

              display: 'flex',

              alignItems: 'center',

              gap: '10px',

              flexWrap: 'wrap',

            }}

          >

            <span

              className={`status-pill ${statusClass(

                change.status,

              )}`}

            >

              {formatStatus(change.status)}

            </span>



            <span

              className={`status-pill ${approvalClass(

                change.approval_status,

              )}`}

            >

              {formatStatus(

                change.approval_status,

              )}

            </span>



            <span

              className={`status-pill ${riskClass(

                change.risk_level,

              )}`}

            >

              {change.risk_level}

            </span>

          </div>

        </div>

      </div>



      {/* KPI Cards */}

      <div className="stats-grid">

        <div className="stat-card">

          <div className="stat-card-header">

            <span>Priority</span>

            <ShieldAlert size={18} />

          </div>



          <div className="stat-card-value">

            {change.priority}

          </div>



          <div className="stat-card-label">

            Change priority

          </div>

        </div>



        <div className="stat-card">

          <div className="stat-card-header">

            <span>Environment</span>

            <Shield size={18} />

          </div>



          <div className="stat-card-value">

            {change.environment}

          </div>



          <div className="stat-card-label">

            Target environment

          </div>

        </div>



        <div className="stat-card">

          <div className="stat-card-header">

            <span>Asset</span>

            <FileCog size={18} />

          </div>



          <div className="stat-card-value">

            {change.asset_id}

          </div>



          <div className="stat-card-label">

            Protected asset

          </div>

        </div>



        <div className="stat-card">

          <div className="stat-card-header">

            <span>Owner</span>

            <User size={18} />

          </div>



          <div className="stat-card-value">

            {change.owner}

          </div>



          <div className="stat-card-label">

            Change owner

          </div>

        </div>

      </div>



      {/* Overview + Asset */}

      <div

        className="dashboard-grid"

        style={{ marginTop: '20px' }}

      >

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <h3>Change Overview</h3>

              <span>

                Core change request and ownership metadata

              </span>

            </div>



            <ClipboardCheck size={21} />

          </div>



          <div style={{ padding: '0 20px 20px' }}>

            <DetailRow

              label="Change ID"

              value={change.change_id}

            />



            <DetailRow

              label="Change Type"

              value={change.change_type}

            />



            <DetailRow

              label="Category"

              value={change.category}

            />



            <DetailRow

              label="Priority"

              value={change.priority}

            />



            <DetailRow

              label="Environment"

              value={change.environment}

            />



            <DetailRow

              label="Requester"

              value={change.requester}

            />



            <DetailRow

              label="Owner"

              value={change.owner}

            />

          </div>

        </div>



        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <h3>Affected Asset</h3>

              <span>

                Infrastructure target of this change

              </span>

            </div>



            <Shield size={21} />

          </div>



          <div style={{ padding: '20px' }}>

            <Link

              to={`/assets/${change.asset_id}`}

              style={{

                display: 'block',

                padding: '18px',

                borderRadius: '10px',

                background:

                  'rgba(15, 23, 42, 0.72)',

                border:

                  '1px solid rgba(34, 211, 238, 0.18)',

                textDecoration: 'none',

              }}

            >

              <div

                style={{

                  color: '#22d3ee',

                  fontSize: '16px',

                  fontWeight: 700,

                }}

              >

                {change.asset_id}

              </div>



              <div

                style={{

                  marginTop: '6px',

                  color: '#cbd5e1',

                  fontWeight: 600,

                }}

              >

                {change.asset_name}

              </div>



              <div

                style={{

                  marginTop: '10px',

                  color: '#64748b',

                  fontSize: '12px',

                }}

              >

                Open related asset →

              </div>

            </Link>

          </div>

        </div>

      </div>



      {/* Risk & Impact */}

      <div

        className="dashboard-grid"

        style={{ marginTop: '20px' }}

      >

        <TextPanel

          title="Business Impact"

          description="Expected effect on business operations"

          value={change.business_impact}

          icon={<AlertTriangle size={21} />}

        />



        <TextPanel

          title="Security Impact"

          description="Expected security effect of the change"

          value={change.security_impact}

          icon={<ShieldAlert size={21} />}

        />

      </div>



      {/* Implementation */}

      <div

        className="dashboard-grid"

        style={{ marginTop: '20px' }}

      >

        <TextPanel

          title="Implementation Plan"

          description="Approved procedure for implementing the change"

          value={change.implementation_plan}

          icon={<FileCog size={21} />}

        />



        <TextPanel

          title="Validation Plan"

          description="Checks required after implementation"

          value={change.validation_plan}

          icon={<CheckCircle2 size={21} />}

        />

      </div>



      {/* Rollback */}

      <div style={{ marginTop: '20px' }}>

        <TextPanel

          title="Rollback Plan"

          description="Recovery procedure if implementation fails"

          value={change.rollback_plan}

          icon={<GitBranch size={21} />}

        />

      </div>



      {/* Schedule */}

      <div

        className="dashboard-panel"

        style={{

          marginTop: '20px',

          minHeight: '0',

          height: 'auto',

        }}

      >

        <div className="panel-header">

          <div>

            <h3>Change Schedule</h3>

            <span>

              Planned implementation window

            </span>

          </div>



          <CalendarClock size={21} />

        </div>



        <div style={{ padding: '0 20px 20px' }}>

          <DetailRow

            label="Scheduled Start"

            value={formatDate(

              change.scheduled_start,

            )}

          />



          <DetailRow

            label="Scheduled End"

            value={formatDate(

              change.scheduled_end,

            )}

          />



          <DetailRow

            label="Implementation Status"

            value={

              <span

                className={`status-pill ${statusClass(

                  change.implementation_status,

                )}`}

              >

                {formatStatus(

                  change.implementation_status,

                )}

              </span>

            }

          />

        </div>

      </div>



      {/* Correlations */}

      <div

        className="dashboard-panel"

        style={{

          marginTop: '20px',

          minHeight: '0',

          height: 'auto',

        }}

      >

        <div className="panel-header">

          <div>

            <h3>Security Correlation</h3>

            <span>

              Related security records connected to this change

            </span>

          </div>



          <GitBranch size={21} />

        </div>



        <div

          style={{

            padding: '20px',

            display: 'grid',

            gridTemplateColumns:

              'repeat(auto-fit, minmax(220px, 1fr))',

            gap: '14px',

          }}

        >

          <CorrelationCard

            label="Configurations"

            values={change.related_configuration_ids}

            empty="No related configurations"

            basePath="/security-configurations"

          />



          <CorrelationCard

            label="Incidents"

            values={change.related_incident_ids}

            empty="No related incidents"

            basePath="/incidents"

          />



          <CorrelationCard

            label="Vulnerabilities"

            values={change.related_vulnerability_ids}

            empty="No related vulnerabilities"

            basePath="/vulnerabilities"

          />



          <CorrelationCard

            label="Alerts"

            values={change.related_alert_ids}

            empty="No related alerts"

            basePath="/alerts"

          />

        </div>

      </div>



      {/* Response Workflow */}

      <div

        className="dashboard-panel"

        style={{

          marginTop: '20px',

          minHeight: '0',

          height: 'auto',

        }}

      >

        <div className="panel-header">

          <div>

            <h3>Response Workflow</h3>

            <span>

              Execute and record security change lifecycle actions

            </span>

          </div>



          <FileCog size={21} />

        </div>



        <div style={{ padding: '20px' }}>

          <div

            style={{

              display: 'grid',

              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',

              gap: '10px',

              marginBottom: '16px',

            }}

          >

            <ActionButton

              label="Approve"

              icon={<ThumbsUp size={16} />}

              onClick={() => performAction('APPROVE')}

              disabled={

                actionLoading ||

                change.approval_status === 'APPROVED' ||

                change.status === 'COMPLETED' ||

                change.status === 'ROLLED_BACK'

              }

              tone="success"

            />



            <ActionButton

              label="Reject"

              icon={<ThumbsDown size={16} />}

              onClick={() => performAction('REJECT')}

              disabled={

                actionLoading ||

                change.approval_status !== 'PENDING'

              }

              tone="danger"

            />



            <ActionButton

              label="Start Implementation"

              icon={<Play size={16} />}

              onClick={() => performAction('START_IMPLEMENTATION')}

              disabled={

                actionLoading ||

                change.approval_status !== 'APPROVED' ||

                change.status === 'IN_PROGRESS' ||

                change.status === 'COMPLETED' ||

                change.status === 'ROLLED_BACK'

              }

              tone="info"

            />



            <ActionButton

              label="Validate"

              icon={<CheckCircle2 size={16} />}

              onClick={() => performAction('VALIDATE')}

              disabled={

                actionLoading ||

                !['IN_PROGRESS', 'COMPLETED'].includes(

                  change.status,

                )

              }

              tone="info"

            />



            <ActionButton

              label="Complete"

              icon={<CheckCircle2 size={16} />}

              onClick={() => performAction('COMPLETE')}

              disabled={

                actionLoading ||

                change.approval_status !== 'APPROVED' ||

                change.status === 'COMPLETED' ||

                change.status === 'ROLLED_BACK'

              }

              tone="success"

            />



            <ActionButton

              label="Rollback"

              icon={<RotateCcw size={16} />}

              onClick={() => performAction('ROLLBACK')}

              disabled={

                actionLoading ||

                ['ROLLED_BACK', 'CANCELLED'].includes(

                  change.status,

                )

              }

              tone="danger"

            />



            <ActionButton

              label="Cancel"

              icon={<XCircle size={16} />}

              onClick={() => performAction('CANCEL')}

              disabled={

                actionLoading ||

                ['COMPLETED', 'ROLLED_BACK', 'CANCELLED'].includes(

                  change.status,

                )

              }

              tone="danger"

            />

          </div>



          <textarea

            value={actionNotes}

            onChange={(event) =>

              setActionNotes(event.target.value)

            }

            placeholder="Add analyst notes for the selected action..."

            rows={3}

            style={{

              width: '100%',

              boxSizing: 'border-box',

              resize: 'vertical',

              padding: '12px 14px',

              borderRadius: '10px',

              border: '1px solid rgba(148, 163, 184, 0.16)',

              background: 'rgba(15, 23, 42, 0.72)',

              color: '#cbd5e1',

              fontSize: '13px',

              outline: 'none',

            }}

          />



          {actionLoading && (

            <div

              style={{

                marginTop: '10px',

                color: '#67e8f9',

                fontSize: '13px',

              }}

            >

              Processing security change action...

            </div>

          )}



          {actionError && (

            <div

              style={{

                marginTop: '10px',

                padding: '10px 12px',

                borderRadius: '8px',

                background: 'rgba(239, 68, 68, 0.08)',

                border: '1px solid rgba(239, 68, 68, 0.20)',

                color: '#fca5a5',

                fontSize: '13px',

              }}

            >

              {actionError}

            </div>

          )}

        </div>

      </div>



      {/* Response History */}

      <div

        className="dashboard-panel"

        style={{

          marginTop: '20px',

          minHeight: '0',

          height: 'auto',

        }}

      >

        <div className="panel-header">

          <div>

            <h3>Response History</h3>

            <span>

              Persistent analyst actions recorded for this change

            </span>

          </div>



          <ClipboardCheck size={21} />

        </div>



        <div style={{ padding: '0 20px 20px' }}>

          {actions.length === 0 ? (

            <div

              style={{

                padding: '18px 0',

                color: '#64748b',

                fontSize: '13px',

              }}

            >

              No response actions recorded yet.

            </div>

          ) : (

            <div style={{ display: 'flex', flexDirection: 'column' }}>

              {actions.map((action) => (

                <div

                  key={action.id}

                  style={{

                    display: 'grid',

                    gridTemplateColumns: '180px 120px 1fr 170px',

                    gap: '16px',

                    alignItems: 'center',

                    padding: '15px 0',

                    borderBottom: '1px solid rgba(148, 163, 184, 0.10)',

                  }}

                >

                  <div>

                    <div

                      style={{

                        color: '#f8fafc',

                        fontWeight: 700,

                        fontSize: '13px',

                      }}

                    >

                      {formatStatus(action.action)}

                    </div>

                    <div

                      style={{

                        marginTop: '4px',

                        color: '#64748b',

                        fontSize: '11px',

                      }}

                    >

                      Action #{action.id}

                    </div>

                  </div>



                  <span className="status-pill status-success">

                    {formatStatus(action.status)}

                  </span>



                  <div>

                    <div

                      style={{

                        color: '#cbd5e1',

                        fontSize: '13px',

                        lineHeight: 1.5,

                      }}

                    >

                      {action.notes || 'No analyst notes provided.'}

                    </div>

                    <div

                      style={{

                        marginTop: '5px',

                        color: '#64748b',

                        fontSize: '11px',

                      }}

                    >

                      Performed by {action.performed_by}

                    </div>

                  </div>



                  <div

                    style={{

                      color: '#64748b',

                      fontSize: '12px',

                      textAlign: 'right',

                    }}

                  >

                    {formatDate(action.created_at)}

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>



      {/* Metadata */}

      <div

        className="dashboard-panel"

        style={{

          marginTop: '20px',

          minHeight: '0',

          height: 'auto',

        }}

      >

        <div className="panel-header">

          <div>

            <h3>Change Metadata</h3>

            <span>

              Creation and modification timestamps

            </span>

          </div>

        </div>



        <div style={{ padding: '0 20px 20px' }}>

          <DetailRow

            label="Created"

            value={formatDate(change.created_at)}

          />



          <DetailRow

            label="Last Updated"

            value={formatDate(change.updated_at)}

          />

        </div>

      </div>



      <div

        style={{

          display: 'flex',

          justifyContent: 'space-between',

          alignItems: 'center',

          gap: '20px',

          marginTop: '22px',

          paddingBottom: '20px',

          flexWrap: 'wrap',

        }}

      >

        <Link

          to="/security-changes"

          style={{

            color: '#22d3ee',

            textDecoration: 'none',

            display: 'flex',

            alignItems: 'center',

            gap: '7px',

            fontSize: '14px',

          }}

        >

          <ArrowLeft size={17} />

          Back to Change Management

        </Link>



        <Link

          to={`/assets/${change.asset_id}`}

          style={{

            color: '#22d3ee',

            textDecoration: 'none',

            fontSize: '14px',

          }}

        >

          Open Related Asset →

        </Link>

      </div>

    </div>

  )

}



function ActionButton({

  label,

  icon,

  onClick,

  disabled,

  tone,

}: {

  label: string

  icon: React.ReactNode

  onClick: () => void

  disabled: boolean

  tone: 'success' | 'danger' | 'info'

}) {

  const toneStyles = {

    success: {

      border: 'rgba(34, 197, 94, 0.25)',

      background: 'rgba(34, 197, 94, 0.08)',

      color: '#86efac',

    },

    danger: {

      border: 'rgba(239, 68, 68, 0.25)',

      background: 'rgba(239, 68, 68, 0.08)',

      color: '#fca5a5',

    },

    info: {

      border: 'rgba(34, 211, 238, 0.25)',

      background: 'rgba(34, 211, 238, 0.08)',

      color: '#67e8f9',

    },

  }



  const styles = toneStyles[tone]



  return (

    <button

      type="button"

      onClick={onClick}

      disabled={disabled}

      style={{

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'center',

        gap: '8px',

        minHeight: '42px',

        padding: '10px 12px',

        borderRadius: '9px',

        border: `1px solid ${styles.border}`,

        background: styles.background,

        color: styles.color,

        fontSize: '12px',

        fontWeight: 700,

        cursor: disabled ? 'not-allowed' : 'pointer',

        opacity: disabled ? 0.38 : 1,

      }}

    >

      {icon}

      {label}

    </button>

  )

}



function CorrelationCard({

  label,

  values,

  empty,

  basePath,

}: {

  label: string

  values: string[]

  empty: string

  basePath: string

}) {

  return (

    <div

      style={{

        padding: '18px',

        borderRadius: '10px',

        background: 'rgba(15, 23, 42, 0.65)',

        border:

          '1px solid rgba(148, 163, 184, 0.12)',

      }}

    >

      <div

        style={{

          color: '#64748b',

          fontSize: '11px',

          fontWeight: 700,

          textTransform: 'uppercase',

          letterSpacing: '0.06em',

          marginBottom: '12px',

        }}

      >

        {label}

      </div>



      {values.length === 0 ? (

        <div

          style={{

            color: '#475569',

            fontSize: '13px',

          }}

        >

          {empty}

        </div>

      ) : (

        <div

          style={{

            display: 'flex',

            flexDirection: 'column',

            gap: '8px',

          }}

        >

          {values.map((value) => (

            <Link

              key={value}

              to={`${basePath}/${value}`}

              style={{

                color: '#67e8f9',

                textDecoration: 'none',

                fontWeight: 600,

                fontSize: '13px',

              }}

            >

              {value}

            </Link>

          ))}

        </div>

      )}

    </div>

  )

}