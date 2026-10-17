
import { lazy, Suspense } from 'react'
import './App.css'

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'

// Load pages only when their routes are visited.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const SecurityPosture = lazy(() => import('./pages/SecurityPosture'))
const SecurityMetrics = lazy(() => import('./pages/SecurityMetrics'))
const Compliance = lazy(() => import('./pages/Compliance'))
const ComplianceDetails = lazy(() => import('./pages/ComplianceDetails'))
const Endpoints = lazy(() => import('./pages/Endpoints'))
const EndpointDetails = lazy(() => import('./pages/EndpointDetails'))
const Alerts = lazy(() => import('./pages/Alerts'))
const AlertDetails = lazy(() => import('./pages/AlertDetails'))
const Network = lazy(() => import('./pages/Network'))
const NetworkConnectionDetails = lazy(
  () => import('./pages/NetworkConnectionDetails'),
)
const Processes = lazy(() => import('./pages/Processes'))
const ProcessDetails = lazy(() => import('./pages/ProcessDetails'))
const FileIntegrity = lazy(() => import('./pages/FileIntegrity'))
const FileIntegrityDetails = lazy(
  () => import('./pages/FileIntegrityDetails'),
)
const Forensics = lazy(() => import('./pages/Forensics'))
const ForensicsDetails = lazy(() => import('./pages/ForensicsDetails'))
const AuditLogs = lazy(() => import('./pages/AuditLogs'))
const AuditLogDetails = lazy(() => import('./pages/AuditLogDetails'))
const DetectionRules = lazy(() => import('./pages/DetectionRules'))
const DetectionRuleDetails = lazy(
  () => import('./pages/DetectionRuleDetails'),
)
const Incidents = lazy(() => import('./pages/Incidents'))
const IncidentDetails = lazy(() => import('./pages/IncidentDetails'))
const ThreatIntelligence = lazy(
  () => import('./pages/ThreatIntelligence'),
)
const ThreatIntelligenceDetails = lazy(
  () => import('./pages/ThreatIntelligenceDetails'),
)
const Identity = lazy(() => import('./pages/Identity'))
const IdentityDetails = lazy(() => import('./pages/IdentityDetails'))
const Vulnerabilities = lazy(() => import('./pages/Vulnerabilities'))
const VulnerabilityDetails = lazy(
  () => import('./pages/VulnerabilityDetails'),
)
const SOC = lazy(() => import('./pages/SOC'))
const SOCEventDetails = lazy(() => import('./pages/SOCEventDetails'))
const Reports = lazy(() => import('./pages/Reports'))
const RiskManagement = lazy(() => import('./pages/RiskManagement'))
const RiskDetails = lazy(() => import('./pages/RiskDetails'))
const PolicyManagement = lazy(() => import('./pages/PolicyManagement'))
const PolicyDetails = lazy(() => import('./pages/PolicyDetails'))
const SecurityExceptions = lazy(
  () => import('./pages/SecurityExceptions'),
)
const SecurityExceptionDetails = lazy(
  () => import('./pages/SecurityExceptionDetails'),
)
const SecurityPlaybooks = lazy(() => import('./pages/SecurityPlaybooks'))
const SecurityPlaybookDetails = lazy(
  () => import('./pages/SecurityPlaybookDetails'),
)
const SecurityPlaybookExecutionDetails = lazy(
  () => import('./pages/SecurityPlaybookExecutionDetails'),
)
const SecurityIntegrations = lazy(
  () => import('./pages/SecurityIntegrations'),
)
const SecurityIntegrationDetails = lazy(
  () => import('./pages/SecurityIntegrationDetails'),
)
const SecurityArchitecture = lazy(
  () => import('./pages/SecurityArchitecture'),
)
const SecurityArchitectureDetails = lazy(
  () => import('./pages/SecurityArchitectureDetails'),
)
const SecurityAssets = lazy(() => import('./pages/SecurityAssets'))
const SecurityAssetDetails = lazy(
  () => import('./pages/SecurityAssetDetails'),
)
const SecurityConfigurations = lazy(
  () => import('./pages/SecurityConfigurations'),
)
const SecurityConfigurationDetails = lazy(
  () => import('./pages/SecurityConfigurationDetails'),
)
const SecurityChanges = lazy(() => import('./pages/SecurityChanges'))
const SecurityChangeDetails = lazy(
  () => import('./pages/SecurityChangeDetails'),
)
const AccessGovernance = lazy(() => import('./pages/AccessGovernance'))

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />

        <div className="app-main">
          <Topbar />

          <main className="main-content">
            <Suspense
              fallback={
                <div
                  role="status"
                  aria-live="polite"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '240px',
                    color: 'var(--text-secondary, #94a3b8)',
                  }}
                >
                  Loading security module...
                </div>
              }
            >
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />

                <Route path="/dashboard" element={<Dashboard />} />
                <Route
                  path="/security-posture"
                  element={<SecurityPosture />}
                />
                <Route
                  path="/security-metrics"
                  element={<SecurityMetrics />}
                />

                <Route path="/compliance" element={<Compliance />} />
                <Route
                  path="/compliance/:controlId"
                  element={<ComplianceDetails />}
                />

                <Route path="/endpoints" element={<Endpoints />} />
                <Route
                  path="/endpoints/:endpointId"
                  element={<EndpointDetails />}
                />

                <Route path="/alerts" element={<Alerts />} />
                <Route
                  path="/alerts/:alertId"
                  element={<AlertDetails />}
                />

                <Route path="/network" element={<Network />} />
                <Route
                  path="/network/:connectionId"
                  element={<NetworkConnectionDetails />}
                />

                <Route path="/processes" element={<Processes />} />
                <Route
                  path="/processes/:processId"
                  element={<ProcessDetails />}
                />

                <Route
                  path="/file-integrity"
                  element={<FileIntegrity />}
                />
                <Route
                  path="/file-integrity/:fileId"
                  element={<FileIntegrityDetails />}
                />

                <Route path="/forensics" element={<Forensics />} />
                <Route
                  path="/forensics/:evidenceId"
                  element={<ForensicsDetails />}
                />

                <Route path="/audit-logs" element={<AuditLogs />} />
                <Route
                  path="/audit-logs/:logId"
                  element={<AuditLogDetails />}
                />

                <Route
                  path="/detection-rules"
                  element={<DetectionRules />}
                />
                <Route
                  path="/detection-rules/:ruleId"
                  element={<DetectionRuleDetails />}
                />

                <Route path="/incidents" element={<Incidents />} />
                <Route
                  path="/incidents/:incidentId"
                  element={<IncidentDetails />}
                />

                <Route
                  path="/threat-intelligence"
                  element={<ThreatIntelligence />}
                />
                <Route
                  path="/threat-intelligence/:indicatorId"
                  element={<ThreatIntelligenceDetails />}
                />

                <Route path="/identity" element={<Identity />} />
                <Route
                  path="/identity/:eventId"
                  element={<IdentityDetails />}
                />

                <Route
                  path="/vulnerabilities"
                  element={<Vulnerabilities />}
                />
                <Route
                  path="/vulnerabilities/:vulnerabilityId"
                  element={<VulnerabilityDetails />}
                />

                <Route path="/soc" element={<SOC />} />
                <Route
                  path="/soc/events/:eventId"
                  element={<SOCEventDetails />}
                />

                <Route path="/reports" element={<Reports />} />

                <Route path="/risks" element={<RiskManagement />} />
                <Route
                  path="/risks/:riskId"
                  element={<RiskDetails />}
                />

                <Route
                  path="/policies"
                  element={<PolicyManagement />}
                />
                <Route
                  path="/policies/:policyId"
                  element={<PolicyDetails />}
                />

                <Route
                  path="/exceptions"
                  element={<SecurityExceptions />}
                />
                <Route
                  path="/exceptions/:exceptionId"
                  element={<SecurityExceptionDetails />}
                />

                <Route path="/automation" element={<SecurityPlaybooks />} />
                <Route
                  path="/automation/:playbookId"
                  element={<SecurityPlaybookDetails />}
                />
                <Route
                  path="/automation/:playbookId/executions/:executionId"
                  element={<SecurityPlaybookExecutionDetails />}
                />

                <Route
                  path="/integrations"
                  element={<SecurityIntegrations />}
                />
                <Route
                  path="/integrations/:integrationId"
                  element={<SecurityIntegrationDetails />}
                />

                <Route
                  path="/architecture"
                  element={<SecurityArchitecture />}
                />
                <Route
                  path="/architecture/:architectureId"
                  element={<SecurityArchitectureDetails />}
                />

                <Route path="/assets" element={<SecurityAssets />} />
                <Route
                  path="/assets/:assetId"
                  element={<SecurityAssetDetails />}
                />

                <Route
                  path="/security-configurations"
                  element={<SecurityConfigurations />}
                />
                <Route
                  path="/security-configurations/:configurationId"
                  element={<SecurityConfigurationDetails />}
                />

                <Route
                  path="/security-changes"
                  element={<SecurityChanges />}
                />
                <Route
                  path="/security-changes/:changeId"
                  element={<SecurityChangeDetails />}
                />

                <Route
                  path="/access-governance"
                  element={<AccessGovernance />}
                />

                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
