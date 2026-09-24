import {
  Activity,
  AlertTriangle,
  Monitor,
  ShieldAlert,
} from 'lucide-react'

import StatCard from '../components/dashboard/StatCard'
import NetworkActivity from '../components/dashboard/NetworkActivity'
import ThreatOverview from '../components/dashboard/ThreatOverview'

function Dashboard() {
  return (
    <div className="dashboard-page">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-eyebrow">
            SECURITY OVERVIEW
          </div>

          <h1>Security Operations Center</h1>

          <p>
            Monitor endpoints, security events, network activity,
            and threats from one place.
          </p>
        </div>

        <div className="dashboard-live-status">
          <span />
          LIVE MONITORING
        </div>
      </div>

      {/* Security KPI Cards */}
      <section className="stats-grid">
        <StatCard
          label="Endpoints"
          value="08"
          description="+2 connected today"
          icon={Monitor}
          tone="cyan"
        />

        <StatCard
          label="Active Alerts"
          value="03"
          description="1 requires attention"
          icon={AlertTriangle}
          tone="red"
        />

        <StatCard
          label="Security Events"
          value="147"
          description="+18 events today"
          icon={Activity}
          tone="blue"
        />

        <StatCard
          label="Risk Level"
          value="MEDIUM"
          description="Continuous monitoring"
          icon={ShieldAlert}
          tone="amber"
        />
      </section>

      {/* Network Activity + Threat Overview */}
      <section className="dashboard-grid">
        <NetworkActivity />

        <ThreatOverview />
      </section>
    </div>
  )
}

export default Dashboard