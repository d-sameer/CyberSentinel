import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Clock3,
  FileWarning,
  Globe,
  Laptop,
  Network,
  Search,
  Shield,
  Terminal,
} from 'lucide-react'

import { Link, useParams } from 'react-router-dom'

type AlertSeverity = 'HIGH' | 'MEDIUM' | 'LOW'

type AlertData = {
  id: string
  title: string
  severity: AlertSeverity
  status: string
  description: string
  endpoint: string
  operatingSystem: string
  ipAddress: string
  detectedAt: string
  process: string
  parentProcess: string
  commandLine: string
  sourceIp: string
  destinationIp: string
  protocol: string
  fileName: string
  fileHash: string
}

const alertData: Record<string, AlertData> = {
  'ALERT-001': {
    id: 'ALERT-001',
    title: 'Suspicious Process Detected',
    severity: 'HIGH',
    status: 'OPEN',
    description:
      'An unknown executable was launched on the monitored endpoint and triggered a behavioral security rule.',
    endpoint: 'WIN-01',
    operatingSystem: 'Windows 11',
    ipAddress: '192.168.1.101',
    detectedAt: '2 minutes ago',
    process: 'powershell.exe',
    parentProcess: 'explorer.exe',
    commandLine:
      'powershell.exe -ExecutionPolicy Bypass -File update.ps1',
    sourceIp: '192.168.1.101',
    destinationIp: '185.199.108.153',
    protocol: 'HTTPS',
    fileName: 'update.ps1',
    fileHash:
      '8f14e45fceea167a5a36dedd4bea2543',
  },

  'ALERT-002': {
    id: 'ALERT-002',
    title: 'Outbound Connection Detected',
    severity: 'MEDIUM',
    status: 'INVESTIGATING',
    description:
      'A monitored endpoint established an unexpected outbound connection to an external destination.',
    endpoint: 'KALI-01',
    operatingSystem: 'Kali Linux',
    ipAddress: '192.168.1.102',
    detectedAt: '7 minutes ago',
    process: 'curl',
    parentProcess: 'bash',
    commandLine:
      'curl https://example-security-endpoint.test/api',
    sourceIp: '192.168.1.102',
    destinationIp: '203.0.113.45',
    protocol: 'HTTPS',
    fileName: 'curl',
    fileHash:
      'c4ca4238a0b923820dcc509a6f75849b',
  },

  'ALERT-003': {
    id: 'ALERT-003',
    title: 'File Integrity Change',
    severity: 'LOW',
    status: 'OPEN',
    description:
      'A protected system file was modified on a monitored endpoint.',
    endpoint: 'LINUX-01',
    operatingSystem: 'Ubuntu Linux',
    ipAddress: '192.168.1.104',
    detectedAt: '14 minutes ago',
    process: 'systemd',
    parentProcess: 'init',
    commandLine: 'systemd',
    sourceIp: '192.168.1.104',
    destinationIp: '192.168.1.1',
    protocol: 'TCP',
    fileName: '/etc/hosts',
    fileHash:
      '6512bd43d9caa6e02c990b0a82652dca',
  },
}

function AlertDetails() {
  const { alertId } = useParams()

  const alert = alertId
    ? alertData[alertId]
    : undefined

  if (!alert) {
    return (
      <div className="page-container">
        <div className="alert-not-found">
          <AlertTriangle size={32} />

          <h1>Alert Not Found</h1>

          <p>
            The requested security alert does not exist in
            CyberSentinel.
          </p>

          <Link
            to="/alerts"
            className="back-to-alerts"
          >
            <ArrowLeft size={15} />
            Back to Alerts
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container alert-details-page">

      {/* =========================================
          BACK TO ALERTS
          ========================================= */}

      <Link
        to="/alerts"
        className="alert-back-link"
      >
        <ArrowLeft size={15} />
        Back to Alerts
      </Link>

      {/* =========================================
          ALERT HEADER
          ========================================= */}

      <div className="alert-details-header">

        <div className="alert-details-identity">

          <div
            className={`alert-details-icon alert-icon-${alert.severity.toLowerCase()}`}
          >
            <AlertTriangle size={25} />
          </div>

          <div>
            <div className="page-eyebrow">
              SECURITY ALERT INVESTIGATION
            </div>

            <h1>{alert.title}</h1>

            <div className="alert-details-subtitle">
              {alert.id} • Detected {alert.detectedAt}
            </div>
          </div>

        </div>

        <div className="alert-header-badges">

          <div
            className={`alert-severity-badge alert-severity-${alert.severity.toLowerCase()}`}
          >
            <span />
            {alert.severity}
          </div>

          <div className="alert-status-badge">
            {alert.status}
          </div>

        </div>

      </div>

      {/* =========================================
          DESCRIPTION
          ========================================= */}

      <section className="alert-description-panel">

        <div className="alert-description-icon">
          <Shield size={19} />
        </div>

        <div>
          <div className="alert-description-title">
            Detection Summary
          </div>

          <p>
            {alert.description}
          </p>
        </div>

      </section>

      {/* =========================================
          AFFECTED ENDPOINT
          ========================================= */}

      <section className="alert-detail-grid">

        <div className="alert-detail-card">

          <div className="alert-detail-card-header">
            <span>AFFECTED ENDPOINT</span>
            <Laptop size={17} />
          </div>

          <div className="alert-detail-main">
            {alert.endpoint}
          </div>

          <div className="alert-detail-muted">
            {alert.operatingSystem}
          </div>

        </div>

        <div className="alert-detail-card">

          <div className="alert-detail-card-header">
            <span>IP ADDRESS</span>
            <Network size={17} />
          </div>

          <div className="alert-detail-main alert-mono">
            {alert.ipAddress}
          </div>

          <div className="alert-detail-muted">
            Monitored endpoint address
          </div>

        </div>

        <div className="alert-detail-card">

          <div className="alert-detail-card-header">
            <span>PROCESS</span>
            <Terminal size={17} />
          </div>

          <div className="alert-detail-main alert-mono">
            {alert.process}
          </div>

          <div className="alert-detail-muted">
            Detected process
          </div>

        </div>

        <div className="alert-detail-card">

          <div className="alert-detail-card-header">
            <span>DETECTION TIME</span>
            <Clock3 size={17} />
          </div>

          <div className="alert-detail-main">
            {alert.detectedAt}
          </div>

          <div className="alert-detail-muted">
            Security event timestamp
          </div>

        </div>

      </section>

      {/* =========================================
          PROCESS ANALYSIS + NETWORK ANALYSIS
          ========================================= */}

      <section className="alert-analysis-columns">

        <div className="alert-panel">

          <div className="alert-panel-header">

            <div>
              <div className="alert-panel-title">
                Process Analysis
              </div>

              <div className="alert-panel-subtitle">
                Process execution information
              </div>
            </div>

            <Activity size={18} />

          </div>

          <div className="alert-information-list">

            <div className="alert-information-row">
              <span>Process</span>
              <strong>{alert.process}</strong>
            </div>

            <div className="alert-information-row">
              <span>Parent Process</span>
              <strong>{alert.parentProcess}</strong>
            </div>

            <div className="alert-information-row alert-command-row">
              <span>Command Line</span>

              <code>
                {alert.commandLine}
              </code>
            </div>

          </div>

        </div>

        <div className="alert-panel">

          <div className="alert-panel-header">

            <div>
              <div className="alert-panel-title">
                Network Analysis
              </div>

              <div className="alert-panel-subtitle">
                Observed network communication
              </div>
            </div>

            <Globe size={18} />

          </div>

          <div className="alert-information-list">

            <div className="alert-information-row">
              <span>Source IP</span>
              <strong>{alert.sourceIp}</strong>
            </div>

            <div className="alert-information-row">
              <span>Destination IP</span>
              <strong>{alert.destinationIp}</strong>
            </div>

            <div className="alert-information-row">
              <span>Protocol</span>
              <strong>{alert.protocol}</strong>
            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          INDICATORS
          ========================================= */}

      <section className="alert-panel alert-indicators-panel">

        <div className="alert-panel-header">

          <div>
            <div className="alert-panel-title">
              Indicators & Evidence
            </div>

            <div className="alert-panel-subtitle">
              Security artifacts associated with this alert
            </div>
          </div>

          <Search size={18} />

        </div>

        <div className="alert-indicators-grid">

          <div className="alert-indicator">

            <div className="alert-indicator-icon">
              <FileWarning size={16} />
            </div>

            <div>
              <span>File</span>
              <strong>{alert.fileName}</strong>
            </div>

          </div>

          <div className="alert-indicator">

            <div className="alert-indicator-icon">
              <Shield size={16} />
            </div>

            <div>
              <span>File Hash</span>
              <strong className="alert-hash">
                {alert.fileHash}
              </strong>
            </div>

          </div>

          <div className="alert-indicator">

            <div className="alert-indicator-icon">
              <Network size={16} />
            </div>

            <div>
              <span>Source</span>
              <strong>{alert.sourceIp}</strong>
            </div>

          </div>

          <div className="alert-indicator">

            <div className="alert-indicator-icon">
              <Globe size={16} />
            </div>

            <div>
              <span>Destination</span>
              <strong>{alert.destinationIp}</strong>
            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          INVESTIGATION TIMELINE
          ========================================= */}

      <section className="alert-panel alert-timeline-panel">

        <div className="alert-panel-header">

          <div>
            <div className="alert-panel-title">
              Investigation Timeline
            </div>

            <div className="alert-panel-subtitle">
              Sequence of security events associated with
              this detection
            </div>
          </div>

          <Clock3 size={18} />

        </div>

        <div className="alert-timeline">

          <div className="alert-timeline-item">

            <div className="timeline-marker timeline-high" />

            <div className="timeline-content">
              <strong>
                Suspicious activity observed
              </strong>

              <span>
                Endpoint telemetry identified unusual
                process behavior.
              </span>
            </div>

            <time>
              09:41:12
            </time>

          </div>

          <div className="alert-timeline-item">

            <div className="timeline-marker timeline-medium" />

            <div className="timeline-content">
              <strong>
                Detection rule triggered
              </strong>

              <span>
                Behavioral security rule matched the
                observed activity.
              </span>
            </div>

            <time>
              09:41:14
            </time>

          </div>

          <div className="alert-timeline-item">

            <div className="timeline-marker timeline-low" />

            <div className="timeline-content">
              <strong>
                Alert generated
              </strong>

              <span>
                CyberSentinel created a security alert for
                analyst investigation.
              </span>
            </div>

            <time>
              09:41:18
            </time>

          </div>

        </div>

      </section>

    </div>
  )
}

export default AlertDetails