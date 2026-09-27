import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Database,
  FileSearch,
  Hash,
  Network,
  ShieldAlert,
  Terminal,
  User,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

type EvidenceStatus =
  | 'COLLECTED'
  | 'ANALYZING'
  | 'FLAGGED'
  | 'VERIFIED'

type EvidenceDetailsData = {
  id: string
  name: string
  type: string
  endpoint: string
  collected: string
  analyst: string
  status: EvidenceStatus
  source: string
  description: string
  artifact: string
  relatedProcess: string
  relatedFile: string
  relatedNetwork: string
  hash: string
  integrity: string
  acquisition: string
  assessment: string
}

const evidenceDetails: Record<string, EvidenceDetailsData> = {
  'EVD-001': {
    id: 'EVD-001',
    name: 'powershell.exe execution trace',
    type: 'PROCESS',
    endpoint: 'WIN-01',
    collected: 'Today, 10:06:14',
    analyst: 'SOC Analyst',
    status: 'FLAGGED',
    source: 'Process Telemetry',
    description:
      'Execution trace associated with an ExecutionPolicy Bypass command.',
    artifact:
      'powershell.exe -ExecutionPolicy Bypass -File update.ps1',
    relatedProcess: 'powershell.exe (PID 7348)',
    relatedFile: 'update.ps1',
    relatedNetwork: 'Outbound HTTPS connection observed',
    hash: '8e91...42bd',
    integrity: 'Unsigned process execution',
    acquisition: 'Endpoint telemetry collector',
    assessment:
      'Execution behavior requires investigation because PowerShell was launched with ExecutionPolicy Bypass and executed a script.',
  },

  'EVD-002': {
    id: 'EVD-002',
    name: 'update.ps1 file artifact',
    type: 'FILE',
    endpoint: 'WIN-01',
    collected: 'Today, 10:06:28',
    analyst: 'SOC Analyst',
    status: 'ANALYZING',
    source: 'File Integrity',
    description:
      'PowerShell script whose integrity baseline changed after execution.',
    artifact:
      'C:\\Users\\Sameer\\Downloads\\update.ps1',
    relatedProcess: 'powershell.exe (PID 7348)',
    relatedFile: 'update.ps1',
    relatedNetwork: 'Related outbound HTTPS activity',
    hash: 'd92a...71e4',
    integrity: 'Baseline mismatch detected',
    acquisition: 'File integrity collector',
    assessment:
      'The file differs from its established baseline and should be correlated with the modifying process and network activity.',
  },

  'EVD-003': {
    id: 'EVD-003',
    name: 'Outbound HTTPS connection',
    type: 'NETWORK',
    endpoint: 'WIN-01',
    collected: 'Today, 10:06:42',
    analyst: 'SOC Analyst',
    status: 'FLAGGED',
    source: 'Network Telemetry',
    description:
      'Outbound connection associated with suspicious process activity.',
    artifact:
      'WIN-01 → 203.0.113.45 : 443',
    relatedProcess: 'powershell.exe (PID 7348)',
    relatedFile: 'update.ps1',
    relatedNetwork: 'TCP / HTTPS / 443',
    hash: 'N/A',
    integrity: 'Network artifact',
    acquisition: 'Network telemetry collector',
    assessment:
      'The connection occurred in the same investigation window as suspicious PowerShell activity.',
  },

  'EVD-004': {
    id: 'EVD-004',
    name: 'unknown_update.exe execution',
    type: 'PROCESS',
    endpoint: 'WIN-02',
    collected: 'Today, 10:25:11',
    analyst: 'SOC Analyst',
    status: 'FLAGGED',
    source: 'Process Telemetry',
    description:
      'Unsigned executable launched from a temporary directory.',
    artifact:
      'C:\\Users\\Sameer\\AppData\\Local\\Temp\\unknown_update.exe',
    relatedProcess: 'unknown_update.exe (PID 9124)',
    relatedFile: 'payload.bin',
    relatedNetwork: 'Outbound connection associated with process',
    hash: '41ca...92e7',
    integrity: 'Unsigned executable',
    acquisition: 'Endpoint telemetry collector',
    assessment:
      'Execution from a temporary directory combined with elevated resource usage requires investigation.',
  },

  'EVD-005': {
    id: 'EVD-005',
    name: 'payload.bin creation',
    type: 'FILE',
    endpoint: 'WIN-02',
    collected: 'Today, 10:25:23',
    analyst: 'SOC Analyst',
    status: 'ANALYZING',
    source: 'File Integrity',
    description:
      'New binary created shortly after suspicious process execution.',
    artifact:
      'C:\\Users\\Sameer\\AppData\\Local\\Temp\\payload.bin',
    relatedProcess: 'unknown_update.exe (PID 9124)',
    relatedFile: 'payload.bin',
    relatedNetwork: 'Network activity observed after creation',
    hash: 'a91e...5f02',
    integrity: 'New binary artifact',
    acquisition: 'File integrity collector',
    assessment:
      'The newly created binary should be validated against its originating process and execution history.',
  },

  'EVD-006': {
    id: 'EVD-006',
    name: 'SSH authorization change',
    type: 'USER ACTIVITY',
    endpoint: 'LINUX-01',
    collected: 'Today, 09:59:03',
    analyst: 'SOC Analyst',
    status: 'VERIFIED',
    source: 'Authentication Logs',
    description:
      'Change to the authorized_keys file associated with an SSH session.',
    artifact:
      '/home/admin/.ssh/authorized_keys',
    relatedProcess: 'sshd',
    relatedFile: 'authorized_keys',
    relatedNetwork: 'SSH session activity',
    hash: '8fe4...c220',
    integrity: 'Baseline change verified',
    acquisition: 'Linux authentication telemetry',
    assessment:
      'The authorization change was reviewed and verified against the available investigation context.',
  },

  'EVD-007': {
    id: 'EVD-007',
    name: 'Windows security rules deletion',
    type: 'SYSTEM',
    endpoint: 'WIN-02',
    collected: 'Today, 10:26:39',
    analyst: 'SOC Analyst',
    status: 'FLAGGED',
    source: 'File Integrity',
    description:
      'Protected security rules file was deleted from the endpoint.',
    artifact:
      'C:\\ProgramData\\Security\\temp_rules.xml',
    relatedProcess: 'services.exe',
    relatedFile: 'temp_rules.xml',
    relatedNetwork: 'No related network activity',
    hash: 'c901...21fa',
    integrity: 'Protected file deletion',
    acquisition: 'File integrity collector',
    assessment:
      'Deletion of a monitored security configuration artifact requires validation and endpoint review.',
  },

  'EVD-008': {
    id: 'EVD-008',
    name: 'Endpoint authentication events',
    type: 'USER ACTIVITY',
    endpoint: 'WIN-02',
    collected: 'Today, 10:27:12',
    analyst: 'SOC Analyst',
    status: 'COLLECTED',
    source: 'Windows Event Logs',
    description:
      'Authentication activity collected for timeline correlation.',
    artifact:
      'Windows Security Event Log authentication records',
    relatedProcess: 'winlogon.exe',
    relatedFile: 'Security.evtx',
    relatedNetwork: 'Authentication-related network activity',
    hash: 'N/A',
    integrity: 'Event log artifact',
    acquisition: 'Windows Event Log collector',
    assessment:
      'Evidence has been collected and is awaiting detailed correlation with endpoint activity.',
  },
}

function ForensicsDetails() {
  const { evidenceId } = useParams()

  const evidence = evidenceId
    ? evidenceDetails[evidenceId]
    : undefined

  if (!evidence) {
    return (
      <div className="page-container">

        <div className="forensics-detail-not-found">

          <ShieldAlert size={30} />

          <h2>Evidence Not Found</h2>

          <p>
            The requested forensic evidence item does not
            exist in the current investigation dataset.
          </p>

          <Link
            to="/forensics"
            className="forensics-back-link"
          >
            <ArrowLeft size={14} />
            Back to Forensics
          </Link>

        </div>

      </div>
    )
  }

  const statusClass = evidence.status.toLowerCase()

  return (
    <div className="page-container">

      {/* =========================================
          HEADER
          ========================================= */}

      <div className="page-header">

        <div>

          <Link
            to="/forensics"
            className="forensics-detail-back"
          >
            <ArrowLeft size={14} />
            DIGITAL FORENSICS CENTER
          </Link>

          <div className="page-eyebrow">
            EVIDENCE INVESTIGATION
          </div>

          <h1>{evidence.name}</h1>

          <p>
            Detailed forensic investigation for evidence
            item {evidence.id}.
          </p>

        </div>

        <div
          className={`forensics-detail-status forensics-detail-status-${statusClass}`}
        >
          <span />
          {evidence.status}
        </div>

      </div>

      {/* =========================================
          EVIDENCE HERO
          ========================================= */}

      <section className="forensics-detail-hero">

        <div className="forensics-detail-identity">

          <div className="forensics-detail-icon">
            <FileSearch size={23} />
          </div>

          <div>

            <div className="forensics-detail-name">
              {evidence.name}
            </div>

            <div className="forensics-detail-id">
              {evidence.id} · {evidence.type}
            </div>

          </div>

        </div>

        <div className="forensics-detail-endpoint">
          <span>ENDPOINT</span>
          <strong>{evidence.endpoint}</strong>
        </div>

        <div className="forensics-detail-endpoint">
          <span>COLLECTED BY</span>
          <strong>{evidence.analyst}</strong>
        </div>

      </section>

      {/* =========================================
          METRICS
          ========================================= */}

      <section className="forensics-detail-metrics">

        <div className="forensics-detail-metric">

          <Database size={17} />

          <span>EVIDENCE TYPE</span>

          <strong>
            {evidence.type}
          </strong>

        </div>

        <div className="forensics-detail-metric">

          <Clock3 size={17} />

          <span>COLLECTED</span>

          <strong>
            {evidence.collected}
          </strong>

        </div>

        <div className="forensics-detail-metric">

          <Terminal size={17} />

          <span>RELATED PROCESS</span>

          <strong>
            {evidence.relatedProcess}
          </strong>

        </div>

        <div className="forensics-detail-metric">

          <Hash size={17} />

          <span>ARTIFACT HASH</span>

          <strong>
            {evidence.hash}
          </strong>

        </div>

      </section>

      {/* =========================================
          INVESTIGATION GRID
          ========================================= */}

      <section className="forensics-detail-grid">

        {/* Evidence Context */}

        <div className="forensics-detail-panel">

          <div className="forensics-detail-panel-header">

            <div>

              <strong>
                Evidence Context
              </strong>

              <span>
                Identity and acquisition information
              </span>

            </div>

            <Database size={18} />

          </div>

          <div className="forensics-detail-fields">

            <div>
              <span>EVIDENCE ID</span>
              <strong>{evidence.id}</strong>
            </div>

            <div>
              <span>EVIDENCE TYPE</span>
              <strong>{evidence.type}</strong>
            </div>

            <div>
              <span>ENDPOINT</span>
              <strong>{evidence.endpoint}</strong>
            </div>

            <div>
              <span>SOURCE</span>
              <strong>{evidence.source}</strong>
            </div>

            <div>
              <span>ANALYST</span>
              <strong>{evidence.analyst}</strong>
            </div>

            <div>
              <span>ACQUISITION</span>
              <strong>{evidence.acquisition}</strong>
            </div>

            <div className="forensics-detail-field-wide">

              <span>
                ARTIFACT
              </span>

              <code>
                {evidence.artifact}
              </code>

            </div>

            <div className="forensics-detail-field-wide">

              <span>
                DESCRIPTION
              </span>

              <strong>
                {evidence.description}
              </strong>

            </div>

          </div>

        </div>

        {/* Security Assessment */}

        <div className="forensics-detail-panel">

          <div className="forensics-detail-panel-header">

            <div>

              <strong>
                Analyst Assessment
              </strong>

              <span>
                Current forensic assessment
              </span>

            </div>

            <ShieldAlert size={18} />

          </div>

          <div className="forensics-assessment">

            <div
              className={`forensics-assessment-banner forensics-assessment-${statusClass}`}
            >

              {evidence.status === 'VERIFIED' ? (
                <CheckCircle2 size={17} />
              ) : (
                <AlertTriangle size={17} />
              )}

              <div>

                <strong>
                  {evidence.status} EVIDENCE
                </strong>

                <span>
                  Current investigation classification
                </span>

              </div>

            </div>

            <div className="forensics-assessment-row">

              <span>
                Assessment
              </span>

              <strong>
                {evidence.assessment}
              </strong>

            </div>

            <div className="forensics-assessment-row">

              <span>
                Integrity
              </span>

              <strong>
                {evidence.integrity}
              </strong>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          CORRELATION
          ========================================= */}

      <section className="forensics-detail-panel forensics-correlation-panel">

        <div className="forensics-detail-panel-header">

          <div>

            <strong>
              Evidence Correlation
            </strong>

            <span>
              Related forensic artifacts identified during
              investigation
            </span>

          </div>

          <Activity size={18} />

        </div>

        <div className="forensics-correlation-grid">

          <div className="forensics-correlation-card">

            <div className="forensics-correlation-icon">
              <Terminal size={16} />
            </div>

            <span>RELATED PROCESS</span>

            <strong>
              {evidence.relatedProcess}
            </strong>

          </div>

          <div className="forensics-correlation-card">

            <div className="forensics-correlation-icon">
              <FileSearch size={16} />
            </div>

            <span>RELATED FILE</span>

            <strong>
              {evidence.relatedFile}
            </strong>

          </div>

          <div className="forensics-correlation-card">

            <div className="forensics-correlation-icon">
              <Network size={16} />
            </div>

            <span>NETWORK CONTEXT</span>

            <strong>
              {evidence.relatedNetwork}
            </strong>

          </div>

        </div>

      </section>

      {/* =========================================
          INVESTIGATION TIMELINE
          ========================================= */}

      <section className="forensics-detail-grid">

        <div className="forensics-detail-panel">

          <div className="forensics-detail-panel-header">

            <div>

              <strong>
                Investigation Timeline
              </strong>

              <span>
                Evidence handling and analysis events
              </span>

            </div>

            <Clock3 size={18} />

          </div>

          <div className="forensics-detail-timeline">

            <div className="forensics-detail-timeline-item">

              <span />

              <div>

                <strong>
                  Evidence collected
                </strong>

                <small>
                  {evidence.collected}
                </small>

              </div>

            </div>

            <div className="forensics-detail-timeline-item">

              <span />

              <div>

                <strong>
                  Artifact normalized
                </strong>

                <small>
                  +12 seconds
                </small>

              </div>

            </div>

            <div className="forensics-detail-timeline-item">

              <span />

              <div>

                <strong>
                  Related telemetry correlated
                </strong>

                <small>
                  +34 seconds
                </small>

              </div>

            </div>

            <div className="forensics-detail-timeline-item">

              <span />

              <div>

                <strong>
                  Analyst assessment generated
                </strong>

                <small>
                  +01 minute
                </small>

              </div>

            </div>

          </div>

        </div>

        {/* Chain of Custody */}

        <div className="forensics-detail-panel">

          <div className="forensics-detail-panel-header">

            <div>

              <strong>
                Evidence Handling
              </strong>

              <span>
                Chain-of-custody style metadata
              </span>

            </div>

            <ShieldAlert size={18} />

          </div>

          <div className="forensics-handling-list">

            <div className="forensics-handling-item">

              <div className="forensics-handling-icon">
                <Database size={15} />
              </div>

              <div>

                <strong>
                  Collection
                </strong>

                <span>
                  Endpoint telemetry collector
                </span>

              </div>

              <b>
                VERIFIED
              </b>

            </div>

            <div className="forensics-handling-item">

              <div className="forensics-handling-icon">
                <Hash size={15} />
              </div>

              <div>

                <strong>
                  Integrity
                </strong>

                <span>
                  Artifact metadata recorded
                </span>

              </div>

              <b>
                RECORDED
              </b>

            </div>

            <div className="forensics-handling-item">

              <div className="forensics-handling-icon">
                <User size={15} />
              </div>

              <div>

                <strong>
                  Analyst
                </strong>

                <span>
                  {evidence.analyst}
                </span>

              </div>

              <b>
                ASSIGNED
              </b>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          INVESTIGATION NOTES
          ========================================= */}

      <section className="forensics-detail-panel forensics-notes-panel">

        <div className="forensics-detail-panel-header">

          <div>

            <strong>
              Investigation Notes
            </strong>

            <span>
              Initial forensic observations
            </span>

          </div>

          <FileSearch size={18} />

        </div>

        <div className="forensics-notes">

          <p>
            <AlertTriangle size={14} />

            Review the evidence together with the associated
            process, file, network, and user telemetry.
          </p>

          <p>
            <Activity size={14} />

            Correlation across multiple artifact sources can
            help establish the sequence of events.
          </p>

          <p>
            <ShieldAlert size={14} />

            Preserve the original evidence metadata before
            performing any remediation or containment action.
          </p>

        </div>

      </section>

    </div>
  )
}

export default ForensicsDetails