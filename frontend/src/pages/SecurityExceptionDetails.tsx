import {

  ArrowLeft,

  CheckCircle2,

  Clock3,

  FileCheck2,

  FileText,

  RefreshCw,

  ShieldAlert,

  XCircle,

} from 'lucide-react'

import { useEffect, useMemo, useState } from 'react'

import { Link, useParams } from 'react-router-dom'



type ExceptionData = {

  exception_id: string

  title: string

  description: string

  category: string

  status: string

  severity: string

  requester: string

  owner: string

  approver: string

  justification: string

  compensating_controls: string

  requested_date: string

  expiry_date: string

  related_policy_ids: string[]

  related_risk_ids: string[]

  related_control_ids: string[]

  related_vulnerability_ids: string[]

  created_at: string | null

  updated_at: string | null

  expiry_status?: string

}



type ExceptionAction = {

  action_id: string

  exception_id: string

  action: string

  previous_status: string

  new_status: string

  actor: string

  note: string

  created_at: string | null

}



const API_BASE = 'http://127.0.0.1:8001'



function formatDate(value?: string | null) {

  if (!value) return '—'



  const date = new Date(value)



  if (Number.isNaN(date.getTime())) {

    return value

  }



  return date.toLocaleDateString('en-IN', {

    day: '2-digit',

    month: 'short',

    year: 'numeric',

  })

}



function formatDateTime(value?: string | null) {

  if (!value) return '—'



  const date = new Date(value)



  if (Number.isNaN(date.getTime())) {

    return value

  }



  return date.toLocaleString('en-IN', {

    day: '2-digit',

    month: 'short',

    year: 'numeric',

    hour: '2-digit',

    minute: '2-digit',

  })

}



function formatStatus(status: string) {

  return status.replaceAll('_', ' ')

}



function getStatusClass(status: string) {

  switch (status) {

    case 'APPROVED':

      return 'soc-category-low'



    case 'UNDER_REVIEW':

      return 'soc-category-medium'



    case 'REQUESTED':

      return 'soc-category-info'



    case 'REJECTED':

    case 'REVOKED':

    case 'EXPIRED':

      return 'soc-category-critical'



    default:

      return 'soc-category-info'

  }

}



function getSeverityClass(severity: string) {

  switch (severity) {

    case 'CRITICAL':

      return 'soc-category-critical'



    case 'HIGH':

      return 'soc-category-high'



    case 'MEDIUM':

      return 'soc-category-medium'



    case 'LOW':

      return 'soc-category-low'



    default:

      return 'soc-category-info'

  }

}



function getActionLabel(action: string) {

  return action.replaceAll('_', ' ')

}



function getActionIcon(action: string) {

  switch (action) {

    case 'APPROVE_EXCEPTION':

      return <CheckCircle2 size={16} />



    case 'REJECT_EXCEPTION':

      return <XCircle size={16} />



    case 'START_REVIEW':

      return <Clock3 size={16} />



    case 'RENEW_EXCEPTION':

      return <RefreshCw size={16} />



    default:

      return <FileCheck2 size={16} />

  }

}



function getAvailableActions(status: string) {

  switch (status) {

    case 'REQUESTED':

      return [

        {

          action: 'START_REVIEW',

          label: 'Start Review',

          variant: 'primary',

        },

        {

          action: 'APPROVE_EXCEPTION',

          label: 'Approve',

          variant: 'success',

        },

        {

          action: 'REJECT_EXCEPTION',

          label: 'Reject',

          variant: 'danger',

        },

      ]



    case 'UNDER_REVIEW':

      return [

        {

          action: 'APPROVE_EXCEPTION',

          label: 'Approve',

          variant: 'success',

        },

        {

          action: 'REJECT_EXCEPTION',

          label: 'Reject',

          variant: 'danger',

        },

        {

          action: 'EXPIRE_EXCEPTION',

          label: 'Expire',

          variant: 'danger',

        },

      ]



    case 'APPROVED':

      return [

        {

          action: 'RENEW_EXCEPTION',

          label: 'Renew',

          variant: 'primary',

        },

        {

          action: 'REVOKE_EXCEPTION',

          label: 'Revoke',

          variant: 'danger',

        },

        {

          action: 'EXPIRE_EXCEPTION',

          label: 'Expire',

          variant: 'danger',

        },

      ]



    case 'EXPIRED':

    case 'REVOKED':

      return [

        {

          action: 'RENEW_EXCEPTION',

          label: 'Renew',

          variant: 'primary',

        },

      ]



    default:

      return []

  }

}



function getActionButtonStyle(

  variant: string,

  disabled: boolean,

): React.CSSProperties {

  const base: React.CSSProperties = {

    display: 'inline-flex',

    alignItems: 'center',

    justifyContent: 'center',

    gap: '8px',

    minHeight: '38px',

    padding: '9px 15px',

    borderRadius: '8px',

    border: '1px solid',

    fontSize: '13px',

    fontWeight: 600,

    fontFamily: 'inherit',

    cursor: disabled ? 'not-allowed' : 'pointer',

    opacity: disabled ? 0.55 : 1,

    transition: 'all 0.2s ease',

  }



  if (variant === 'success') {

    return {

      ...base,

      color: '#86efac',

      background: 'rgba(34, 197, 94, 0.10)',

      borderColor: 'rgba(34, 197, 94, 0.30)',

    }

  }



  if (variant === 'danger') {

    return {

      ...base,

      color: '#fca5a5',

      background: 'rgba(239, 68, 68, 0.10)',

      borderColor: 'rgba(239, 68, 68, 0.30)',

    }

  }



  return {

    ...base,

    color: '#67e8f9',

    background: 'rgba(6, 182, 212, 0.10)',

    borderColor: 'rgba(6, 182, 212, 0.30)',

  }

}



function getGovernanceCardStyle(): React.CSSProperties {

  return {

    padding: '16px 18px',

    minHeight: '86px',

    boxSizing: 'border-box',

    borderRadius: '10px',

    border: '1px solid rgba(148, 163, 184, 0.14)',

    background: 'rgba(15, 23, 42, 0.42)',

    display: 'flex',

    flexDirection: 'column',

    justifyContent: 'center',

    gap: '7px',

    overflow: 'hidden',

  }

}



function SecurityExceptionDetails() {

  const { exceptionId } = useParams()



  const [exception, setException] =

    useState<ExceptionData | null>(null)



  const [actions, setActions] =

    useState<ExceptionAction[]>([])



  const [loading, setLoading] = useState(true)

  const [actionsLoading, setActionsLoading] = useState(true)

  const [submitting, setSubmitting] = useState(false)



  const [error, setError] = useState('')

  const [actionError, setActionError] = useState('')

  const [successMessage, setSuccessMessage] = useState('')



  const [note, setNote] = useState('')

  const [renewalDate, setRenewalDate] = useState('')



  const availableActions = useMemo(

    () => getAvailableActions(exception?.status || ''),

    [exception?.status],

  )



  async function loadException() {

    if (!exceptionId) return



    try {

      setLoading(true)

      setError('')



      const response = await fetch(

        `${API_BASE}/api/exceptions/${exceptionId}`,

      )



      if (!response.ok) {

        throw new Error(

          `Unable to load exception (${response.status})`,

        )

      }



      const data = await response.json()



      setException(data)

    } catch (err) {

      setError(

        err instanceof Error

          ? err.message

          : 'Unable to load security exception.',

      )

    } finally {

      setLoading(false)

    }

  }



  async function loadActions() {

    if (!exceptionId) return



    try {

      setActionsLoading(true)

      setActionError('')



      const response = await fetch(

        `${API_BASE}/api/exceptions/${exceptionId}/actions`,

      )



      if (!response.ok) {

        throw new Error(

          `Unable to load response history (${response.status})`,

        )

      }



      const data = await response.json()



      setActions(data.actions || [])

    } catch (err) {

      setActionError(

        err instanceof Error

          ? err.message

          : 'Unable to load response history.',

      )

    } finally {

      setActionsLoading(false)

    }

  }



  async function refreshPage() {

    await Promise.all([

      loadException(),

      loadActions(),

    ])

  }



  useEffect(() => {

    refreshPage()

  }, [exceptionId])



  async function performAction(action: string) {

    if (!exceptionId) return



    if (

      action === 'RENEW_EXCEPTION' &&

      !renewalDate

    ) {

      setActionError(

        'Select a new expiry date before renewing the exception.',

      )

      return

    }



    const confirmation = window.confirm(

      `Are you sure you want to ${getActionLabel(action).toLowerCase()} ${exceptionId}?`,

    )



    if (!confirmation) {

      return

    }



    try {

      setSubmitting(true)

      setActionError('')

      setSuccessMessage('')



      const body: {

        action: string

        note: string

        actor: string

        expiry_date?: string

      } = {

        action,

        note:

          note.trim() ||

          `Action ${getActionLabel(action).toLowerCase()} from CyberSentinel.`,

        actor: 'Security Admin',

      }



      if (action === 'RENEW_EXCEPTION') {

        body.expiry_date = renewalDate

      }



      const response = await fetch(

        `${API_BASE}/api/exceptions/${exceptionId}/actions`,

        {

          method: 'POST',

          headers: {

            'Content-Type': 'application/json',

          },

          body: JSON.stringify(body),

        },

      )



      const data = await response.json()



      if (!response.ok) {

        throw new Error(

          data?.detail ||

            'Unable to record exception action.',

        )

      }



      setSuccessMessage(

        `${getActionLabel(action)} completed successfully.`,

      )



      setNote('')

      setRenewalDate('')



      await refreshPage()

    } catch (err) {

      setActionError(

        err instanceof Error

          ? err.message

          : 'Unable to record exception action.',

      )

    } finally {

      setSubmitting(false)

    }

  }



  if (loading) {

    return (

      <div className="page-container">

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <div className="page-eyebrow">

                SECURITY EXCEPTION

              </div>



              <h2>Loading exception...</h2>

            </div>

          </div>

        </div>

      </div>

    )

  }



  if (error || !exception) {

    return (

      <div className="page-container">

        <div className="page-header">

          <div>

            <div className="page-eyebrow">

              SECURITY EXCEPTION

            </div>



            <h1>Exception unavailable</h1>



            <p>

              {error ||

                'The requested security exception could not be found.'}

            </p>

          </div>

        </div>



        <Link

          to="/exceptions"

          className="secondary-button"

        >

          <ArrowLeft size={16} />

          Back to Security Exceptions

        </Link>

      </div>

    )

  }



  return (

    <div className="page-container">

      {/* HEADER */}

      <div className="page-header">

        <div

          style={{

            minWidth: 0,

            flex: 1,

          }}

        >

          <div className="page-eyebrow">

            SECURITY EXCEPTION

          </div>



          <h1

            style={{

              overflowWrap: 'anywhere',

            }}

          >

            {exception.title}

          </h1>



          <p>{exception.description}</p>

        </div>



        <div

          style={{

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'flex-end',

            gap: '8px',

            flexWrap: 'wrap',

            flexShrink: 0,

            maxWidth: '320px',

          }}

        >

          <span

            className={`soc-category ${getStatusClass(

              exception.status,

            )}`}

            style={{

              whiteSpace: 'nowrap',

            }}

          >

            {formatStatus(exception.status)}

          </span>



          <span

            className={`soc-category ${getSeverityClass(

              exception.severity,

            )}`}

            style={{

              whiteSpace: 'nowrap',

            }}

          >

            {exception.severity}

          </span>

        </div>

      </div>



      {/* PAGE CONTROLS */}

      <div

        style={{

          display: 'flex',

          justifyContent: 'space-between',

          alignItems: 'center',

          gap: '12px',

          marginBottom: '20px',

          flexWrap: 'wrap',

        }}

      >

        <Link

          to="/exceptions"

          className="secondary-button"

        >

          <ArrowLeft size={16} />

          Back to Exceptions

        </Link>



        <button

          type="button"

          className="secondary-button"

          onClick={refreshPage}

          disabled={loading || actionsLoading}

        >

          <RefreshCw size={16} />

          Refresh

        </button>

      </div>



      {/* SUMMARY CARDS */}

      <div className="stats-grid">

        <div className="stat-card">

          <div className="stat-label">

            Exception ID

          </div>



          <div className="stat-value">

            {exception.exception_id}

          </div>



          <div className="stat-meta">

            Governance record

          </div>

        </div>



        <div className="stat-card">

          <div className="stat-label">

            Category

          </div>



          <div className="stat-value">

            {exception.category}

          </div>



          <div className="stat-meta">

            Policy domain

          </div>

        </div>



        <div className="stat-card">

          <div className="stat-label">

            Expiry Date

          </div>



          <div className="stat-value">

            {formatDate(exception.expiry_date)}

          </div>



          <div className="stat-meta">

            {exception.expiry_status || 'Expiry tracked'}

          </div>

        </div>



        <div className="stat-card">

          <div className="stat-label">

            Response Actions

          </div>



          <div className="stat-value">

            {actions.length}

          </div>



          <div className="stat-meta">

            Recorded in backend

          </div>

        </div>

      </div>



      {/* GOVERNANCE + LIFECYCLE */}

      <div className="dashboard-grid">

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <div className="page-eyebrow">

                GOVERNANCE

              </div>



              <h2>Exception Overview</h2>

            </div>



            <ShieldAlert size={20} />

          </div>



          <div

            style={{

              display: 'grid',

              gridTemplateColumns:

                'repeat(auto-fit, minmax(180px, 1fr))',

              gap: '14px',

            }}

          >

            <div style={getGovernanceCardStyle()}>

              <span

                style={{

                  color: '#64748b',

                  fontSize: '12px',

                  lineHeight: 1.2,

                }}

              >

                Requester

              </span>



              <strong

                style={{

                  color: '#e2e8f0',

                  fontSize: '14px',

                  lineHeight: 1.35,

                  overflowWrap: 'anywhere',

                }}

              >

                {exception.requester}

              </strong>

            </div>



            <div style={getGovernanceCardStyle()}>

              <span

                style={{

                  color: '#64748b',

                  fontSize: '12px',

                  lineHeight: 1.2,

                }}

              >

                Owner

              </span>



              <strong

                style={{

                  color: '#e2e8f0',

                  fontSize: '14px',

                  lineHeight: 1.35,

                  overflowWrap: 'anywhere',

                }}

              >

                {exception.owner}

              </strong>

            </div>



            <div style={getGovernanceCardStyle()}>

              <span

                style={{

                  color: '#64748b',

                  fontSize: '12px',

                  lineHeight: 1.2,

                }}

              >

                Approver

              </span>



              <strong

                style={{

                  color: '#e2e8f0',

                  fontSize: '14px',

                  lineHeight: 1.35,

                  overflowWrap: 'anywhere',

                }}

              >

                {exception.approver}

              </strong>

            </div>



            <div style={getGovernanceCardStyle()}>

              <span

                style={{

                  color: '#64748b',

                  fontSize: '12px',

                  lineHeight: 1.2,

                }}

              >

                Requested

              </span>



              <strong

                style={{

                  color: '#e2e8f0',

                  fontSize: '14px',

                  lineHeight: 1.35,

                }}

              >

                {formatDate(exception.requested_date)}

              </strong>

            </div>

          </div>

        </div>



        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <div className="page-eyebrow">

                LIFECYCLE

              </div>



              <h2>Exception Timeline</h2>

            </div>



            <Clock3 size={20} />

          </div>



          <div className="security-event">

            <div>

              <strong>Requested</strong>



              <p>

                {formatDate(exception.requested_date)}

              </p>

            </div>

          </div>



          <div className="security-event">

            <div>

              <strong>Current Status</strong>



              <p>

                {formatStatus(exception.status)}

              </p>

            </div>

          </div>



          <div className="security-event">

            <div>

              <strong>Expiry</strong>



              <p>

                {formatDate(exception.expiry_date)}

              </p>

            </div>

          </div>

        </div>

      </div>



      {/* RESPONSE WORKFLOW */}

      <div className="dashboard-panel">

        <div className="panel-header">

          <div>

            <div className="page-eyebrow">

              RESPONSE WORKFLOW

            </div>



            <h2>Exception Actions</h2>

          </div>



          <FileCheck2 size={20} />

        </div>



        {availableActions.length === 0 ? (

          <div

            style={{

              padding: '16px',

              border:

                '1px solid rgba(148, 163, 184, 0.14)',

              borderRadius: '10px',

              color: '#94a3b8',

            }}

          >

            No response actions are currently available

            for this exception status.

          </div>

        ) : (

          <>

            <div

              style={{

                display: 'flex',

                gap: '10px',

                flexWrap: 'wrap',

                marginBottom: '18px',

              }}

            >

              {availableActions.map((item) => (

                <button

                  key={item.action}

                  type="button"

                  onClick={() =>

                    performAction(item.action)

                  }

                  disabled={submitting}

                  style={getActionButtonStyle(

                    item.variant,

                    submitting,

                  )}

                >

                  {getActionIcon(item.action)}



                  {item.label}

                </button>

              ))}

            </div>



            <div

              style={{

                display: 'grid',

                gridTemplateColumns:

                  availableActions.some(

                    (item) =>

                      item.action ===

                      'RENEW_EXCEPTION',

                  )

                    ? 'minmax(0, 1fr) 220px'

                    : 'minmax(0, 1fr)',

                gap: '12px',

                alignItems: 'end',

              }}

            >

              <div>

                <label

                  style={{

                    display: 'block',

                    fontSize: '12px',

                    color: '#94a3b8',

                    marginBottom: '7px',

                  }}

                >

                  Action Note

                </label>



                <textarea

                  value={note}

                  onChange={(event) =>

                    setNote(event.target.value)

                  }

                  placeholder="Add a governance note for this action..."

                  rows={3}

                  style={{

                    width: '100%',

                    resize: 'vertical',

                    background:

                      'rgba(15, 23, 42, 0.7)',

                    border:

                      '1px solid rgba(148, 163, 184, 0.18)',

                    borderRadius: '8px',

                    color: '#e2e8f0',

                    padding: '10px 12px',

                    fontFamily: 'inherit',

                    boxSizing: 'border-box',

                    outline: 'none',

                  }}

                />

              </div>



              {availableActions.some(

                (item) =>

                  item.action === 'RENEW_EXCEPTION',

              ) ? (

                <div>

                  <label

                    style={{

                      display: 'block',

                      fontSize: '12px',

                      color: '#94a3b8',

                      marginBottom: '7px',

                    }}

                  >

                    New Expiry Date

                  </label>



                  <input

                    type="date"

                    value={renewalDate}

                    onChange={(event) =>

                      setRenewalDate(

                        event.target.value,

                      )

                    }

                    min={

                      new Date()

                        .toISOString()

                        .split('T')[0]

                    }

                    style={{

                      width: '100%',

                      boxSizing: 'border-box',

                      background:

                        'rgba(15, 23, 42, 0.7)',

                      border:

                        '1px solid rgba(148, 163, 184, 0.18)',

                      borderRadius: '8px',

                      color: '#e2e8f0',

                      padding: '10px 12px',

                      fontFamily: 'inherit',

                      outline: 'none',

                    }}

                  />

                </div>

              ) : null}

            </div>

          </>

        )}



        {successMessage ? (

          <div

            style={{

              marginTop: '16px',

              padding: '12px 14px',

              borderRadius: '8px',

              border:

                '1px solid rgba(34, 197, 94, 0.25)',

              background:

                'rgba(34, 197, 94, 0.08)',

              color: '#86efac',

              display: 'flex',

              alignItems: 'center',

              gap: '8px',

            }}

          >

            <CheckCircle2 size={16} />



            {successMessage}

          </div>

        ) : null}



        {actionError ? (

          <div

            style={{

              marginTop: '16px',

              padding: '12px 14px',

              borderRadius: '8px',

              border:

                '1px solid rgba(239, 68, 68, 0.25)',

              background:

                'rgba(239, 68, 68, 0.08)',

              color: '#fca5a5',

              display: 'flex',

              alignItems: 'center',

              gap: '8px',

            }}

          >

            <XCircle size={16} />



            {actionError}

          </div>

        ) : null}

      </div>



      {/* RESPONSE HISTORY */}

      <div className="dashboard-panel">

        <div className="panel-header">

          <div>

            <div className="page-eyebrow">

              RESPONSE HISTORY

            </div>



            <h2>Governance Actions</h2>

          </div>



          <FileText size={20} />

        </div>



        {actionsLoading ? (

          <div

            style={{

              padding: '16px',

              color: '#94a3b8',

            }}

          >

            Loading response history...

          </div>

        ) : actions.length === 0 ? (

          <div

            style={{

              padding: '16px',

              border:

                '1px solid rgba(148, 163, 184, 0.14)',

              borderRadius: '10px',

              color: '#94a3b8',

            }}

          >

            No response actions have been recorded

            for this exception.

          </div>

        ) : (

          <div

            style={{

              display: 'flex',

              flexDirection: 'column',

              gap: '12px',

            }}

          >

            {actions.map((item) => (

              <div

                key={item.action_id}

                style={{

                  border:

                    '1px solid rgba(148, 163, 184, 0.14)',

                  borderRadius: '10px',

                  padding: '15px',

                  background:

                    'rgba(15, 23, 42, 0.35)',

                }}

              >

                <div

                  style={{

                    display: 'flex',

                    justifyContent: 'space-between',

                    alignItems: 'flex-start',

                    gap: '12px',

                    flexWrap: 'wrap',

                  }}

                >

                  <div

                    style={{

                      minWidth: 0,

                    }}

                  >

                    <div

                      style={{

                        display: 'flex',

                        alignItems: 'center',

                        gap: '8px',

                        marginBottom: '6px',

                        flexWrap: 'wrap',

                      }}

                    >

                      {getActionIcon(item.action)}



                      <strong>

                        {getActionLabel(

                          item.action,

                        )}

                      </strong>



                      <span

                        className={`soc-category ${getStatusClass(

                          item.new_status,

                        )}`}

                        style={{

                          whiteSpace: 'nowrap',

                        }}

                      >

                        {formatStatus(

                          item.new_status,

                        )}

                      </span>

                    </div>



                    <div

                      style={{

                        color: '#94a3b8',

                        fontSize: '12px',

                      }}

                    >

                      {item.action_id} ·{' '}

                      {item.actor} ·{' '}

                      {formatDateTime(

                        item.created_at,

                      )}

                    </div>

                  </div>



                  <div

                    style={{

                      fontSize: '12px',

                      color: '#64748b',

                      whiteSpace: 'nowrap',

                    }}

                  >

                    {formatStatus(

                      item.previous_status,

                    )}{' '}

                    →{' '}

                    {formatStatus(

                      item.new_status,

                    )}

                  </div>

                </div>



                {item.note ? (

                  <div

                    style={{

                      marginTop: '12px',

                      paddingTop: '12px',

                      borderTop:

                        '1px solid rgba(148, 163, 184, 0.10)',

                      color: '#cbd5e1',

                      fontSize: '13px',

                      lineHeight: 1.6,

                    }}

                  >

                    {item.note}

                  </div>

                ) : null}

              </div>

            ))}

          </div>

        )}

      </div>



      {/* JUSTIFICATION + CONTROLS */}

      <div className="dashboard-grid">

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <div className="page-eyebrow">

                BUSINESS JUSTIFICATION

              </div>



              <h2>Justification</h2>

            </div>

          </div>



          <p

            style={{

              margin: 0,

              color: '#cbd5e1',

              lineHeight: 1.7,

            }}

          >

            {exception.justification ||

              'No justification recorded.'}

          </p>

        </div>



        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <div className="page-eyebrow">

                COMPENSATING CONTROLS

              </div>



              <h2>Risk Mitigation</h2>

            </div>

          </div>



          <p

            style={{

              margin: 0,

              color: '#cbd5e1',

              lineHeight: 1.7,

            }}

          >

            {exception.compensating_controls ||

              'No compensating controls recorded.'}

          </p>

        </div>

      </div>



      {/* RELATIONSHIPS + AUDIT */}

      <div className="dashboard-grid">

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <div className="page-eyebrow">

                RELATIONSHIPS

              </div>



              <h2>Governance Relationships</h2>

            </div>

          </div>



          <div

            style={{

              display: 'grid',

              gap: '16px',

            }}

          >

            <div>

              <div

                style={{

                  color: '#64748b',

                  fontSize: '12px',

                  marginBottom: '6px',

                }}

              >

                Policies

              </div>



              <div

                style={{

                  display: 'flex',

                  gap: '8px',

                  flexWrap: 'wrap',

                }}

              >

                {exception.related_policy_ids

                  ?.length ? (

                  exception.related_policy_ids.map(

                    (item) => (

                      <span

                        key={item}

                        className="soc-category soc-category-info"

                      >

                        {item}

                      </span>

                    ),

                  )

                ) : (

                  <span

                    style={{

                      color: '#64748b',

                    }}

                  >

                    None

                  </span>

                )}

              </div>

            </div>



            <div>

              <div

                style={{

                  color: '#64748b',

                  fontSize: '12px',

                  marginBottom: '6px',

                }}

              >

                Risks

              </div>



              <div

                style={{

                  display: 'flex',

                  gap: '8px',

                  flexWrap: 'wrap',

                }}

              >

                {exception.related_risk_ids

                  ?.length ? (

                  exception.related_risk_ids.map(

                    (item) => (

                      <span

                        key={item}

                        className="soc-category soc-category-medium"

                      >

                        {item}

                      </span>

                    ),

                  )

                ) : (

                  <span

                    style={{

                      color: '#64748b',

                    }}

                  >

                    None

                  </span>

                )}

              </div>

            </div>



            <div>

              <div

                style={{

                  color: '#64748b',

                  fontSize: '12px',

                  marginBottom: '6px',

                }}

              >

                Controls

              </div>



              <div

                style={{

                  display: 'flex',

                  gap: '8px',

                  flexWrap: 'wrap',

                }}

              >

                {exception.related_control_ids

                  ?.length ? (

                  exception.related_control_ids.map(

                    (item) => (

                      <span

                        key={item}

                        className="soc-category soc-category-low"

                      >

                        {item}

                      </span>

                    ),

                  )

                ) : (

                  <span

                    style={{

                      color: '#64748b',

                    }}

                  >

                    None

                  </span>

                )}

              </div>

            </div>



            <div>

              <div

                style={{

                  color: '#64748b',

                  fontSize: '12px',

                  marginBottom: '6px',

                }}

              >

                Vulnerabilities

              </div>



              <div

                style={{

                  display: 'flex',

                  gap: '8px',

                  flexWrap: 'wrap',

                }}

              >

                {exception.related_vulnerability_ids

                  ?.length ? (

                  exception.related_vulnerability_ids.map(

                    (item) => (

                      <span

                        key={item}

                        className="soc-category soc-category-critical"

                      >

                        {item}

                      </span>

                    ),

                  )

                ) : (

                  <span

                    style={{

                      color: '#64748b',

                    }}

                  >

                    None

                  </span>

                )}

              </div>

            </div>

          </div>

        </div>



        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <div className="page-eyebrow">

                RECORD METADATA

              </div>



              <h2>Audit Information</h2>

            </div>

          </div>



          <div className="security-event">

            <div>

              <strong>Created</strong>



              <p>

                {formatDateTime(

                  exception.created_at,

                )}

              </p>

            </div>

          </div>



          <div className="security-event">

            <div>

              <strong>Last Updated</strong>



              <p>

                {formatDateTime(

                  exception.updated_at,

                )}

              </p>

            </div>

          </div>



          <div className="security-event">

            <div>

              <strong>

                Current Governance State

              </strong>



              <p>

                {formatStatus(exception.status)}

              </p>

            </div>

          </div>

        </div>

      </div>



      {/* EXPIRATION NOTICE */}

      {exception.expiry_status === 'OVERDUE' ||

      exception.status === 'EXPIRED' ? (

        <div

          style={{

            marginTop: '20px',

            padding: '15px 16px',

            borderRadius: '10px',

            border:

              '1px solid rgba(239, 68, 68, 0.25)',

            background:

              'rgba(239, 68, 68, 0.08)',

            color: '#fca5a5',

          }}

        >

          <strong>Expiration Notice</strong>



          <div

            style={{

              marginTop: '5px',

              fontSize: '13px',

              lineHeight: 1.6,

            }}

          >

            This security exception requires governance

            attention because its expiration date has

            passed or its status is expired.

          </div>

        </div>

      ) : null}

    </div>

  )

}



export default SecurityExceptionDetails