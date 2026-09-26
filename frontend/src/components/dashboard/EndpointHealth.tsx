import {
  Laptop,
  Monitor,
  Server,
  ShieldCheck,
} from 'lucide-react'

interface Endpoint {
  id: number
  name: string
  operatingSystem: string
  status: 'ONLINE' | 'WARNING'
  lastSeen: string
  icon: typeof Laptop
}

const endpoints: Endpoint[] = [
  {
    id: 1,
    name: 'WIN-01',
    operatingSystem: 'Windows 11',
    status: 'ONLINE',
    lastSeen: 'Just now',
    icon: Monitor,
  },
  {
    id: 2,
    name: 'KALI-01',
    operatingSystem: 'Kali Linux',
    status: 'ONLINE',
    lastSeen: 'Just now',
    icon: Laptop,
  },
  {
    id: 3,
    name: 'WIN-02',
    operatingSystem: 'Windows 10',
    status: 'WARNING',
    lastSeen: '2 min ago',
    icon: Monitor,
  },
  {
    id: 4,
    name: 'LINUX-01',
    operatingSystem: 'Ubuntu Linux',
    status: 'ONLINE',
    lastSeen: 'Just now',
    icon: Server,
  },
]

function EndpointHealth() {
  return (
    <section className="dashboard-panel endpoint-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">Endpoint Health</div>

          <div className="panel-description">
            Current status of monitored systems
          </div>
        </div>

        <ShieldCheck
          size={18}
          className="endpoint-header-icon"
        />
      </div>

      <div className="endpoint-list">
        {endpoints.map((endpoint) => {
          const Icon = endpoint.icon

          return (
            <div className="endpoint-row" key={endpoint.id}>
              <div className="endpoint-icon">
                <Icon size={16} />
              </div>

              <div className="endpoint-info">
                <div className="endpoint-name">
                  {endpoint.name}
                </div>

                <div className="endpoint-os">
                  {endpoint.operatingSystem}
                </div>
              </div>

              <div className="endpoint-status">
                <div
                  className={`endpoint-status-dot endpoint-${endpoint.status.toLowerCase()}`}
                />

                <div>
                  <div
                    className={`endpoint-status-text endpoint-${endpoint.status.toLowerCase()}`}
                  >
                    {endpoint.status}
                  </div>

                  <div className="endpoint-last-seen">
                    {endpoint.lastSeen}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default EndpointHealth