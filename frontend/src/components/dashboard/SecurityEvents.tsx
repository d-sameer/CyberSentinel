import {
  AlertTriangle,
  FileWarning,
  KeyRound,
  Network,
} from 'lucide-react'

interface SecurityEvent {
  id: number
  title: string
  description: string
  time: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  icon: typeof AlertTriangle
}

const securityEvents: SecurityEvent[] = [
  {
    id: 1,
    title: 'Suspicious process detected',
    description: 'Unknown executable started on endpoint WIN-01',
    time: '2 min ago',
    severity: 'HIGH',
    icon: AlertTriangle,
  },
  {
    id: 2,
    title: 'Outbound connection detected',
    description: 'Endpoint established connection to an external address',
    time: '7 min ago',
    severity: 'MEDIUM',
    icon: Network,
  },
  {
    id: 3,
    title: 'File integrity change',
    description: 'Protected system file was modified',
    time: '14 min ago',
    severity: 'LOW',
    icon: FileWarning,
  },
  {
    id: 4,
    title: 'Authentication event',
    description: 'New authentication activity detected',
    time: '21 min ago',
    severity: 'MEDIUM',
    icon: KeyRound,
  },
]

function SecurityEvents() {
  return (
    <section className="dashboard-panel events-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">Live Security Events</div>

          <div className="panel-description">
            Recent activity detected across monitored endpoints
          </div>
        </div>

        <div className="panel-live">
          <span />
          LIVE
        </div>
      </div>

      <div className="security-events-list">
        {securityEvents.map((event) => {
          const Icon = event.icon

          return (
            <div className="security-event" key={event.id}>
              <div className={`event-icon event-${event.severity.toLowerCase()}`}>
                <Icon size={16} />
              </div>

              <div className="event-content">
                <div className="event-title">
                  {event.title}
                </div>

                <div className="event-description">
                  {event.description}
                </div>
              </div>

              <div className="event-meta">
                <span
                  className={`event-severity event-${event.severity.toLowerCase()}`}
                >
                  {event.severity}
                </span>

                <span className="event-time">
                  {event.time}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default SecurityEvents