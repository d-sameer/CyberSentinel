import { AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react'

function ThreatOverview() {
  return (
    <section className="dashboard-panel threat-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">Threat Overview</div>
          <div className="panel-description">
            Current security severity distribution
          </div>
        </div>
      </div>

      <div className="threat-summary">
        <div className="threat-main">
          <div className="threat-score">MEDIUM</div>

          <div className="threat-score-description">
            Current environment risk
          </div>
        </div>

        <div className="threat-indicator">
          <ShieldAlert size={30} />
        </div>
      </div>

      <div className="threat-list">
        <div className="threat-row">
          <div className="threat-label">
            <span className="severity-dot severity-high" />
            High
          </div>

          <div className="threat-count">
            <AlertTriangle size={14} />
            1
          </div>
        </div>

        <div className="threat-row">
          <div className="threat-label">
            <span className="severity-dot severity-medium" />
            Medium
          </div>

          <div className="threat-count">
            <ShieldAlert size={14} />
            2
          </div>
        </div>

        <div className="threat-row">
          <div className="threat-label">
            <span className="severity-dot severity-low" />
            Low
          </div>

          <div className="threat-count">
            <ShieldCheck size={14} />
            5
          </div>
        </div>
      </div>
    </section>
  )
}

export default ThreatOverview