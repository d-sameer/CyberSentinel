import './App.css'

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'

import Dashboard from './pages/Dashboard'
import SecurityPosture from './pages/SecurityPosture'
import SecurityMetrics from './pages/SecurityMetrics'
import Compliance from './pages/Compliance'
import ComplianceDetails from './pages/ComplianceDetails'
import Endpoints from './pages/Endpoints'
import EndpointDetails from './pages/EndpointDetails'
import Alerts from './pages/Alerts'
import AlertDetails from './pages/AlertDetails'
import Network from './pages/Network'
import NetworkConnectionDetails from './pages/NetworkConnectionDetails'
import Processes from './pages/Processes'
import ProcessDetails from './pages/ProcessDetails'
import FileIntegrity from './pages/FileIntegrity'
import FileIntegrityDetails from './pages/FileIntegrityDetails'
import Forensics from './pages/Forensics'
import ForensicsDetails from './pages/ForensicsDetails'
import AuditLogs from './pages/AuditLogs'
import AuditLogDetails from './pages/AuditLogDetails'
import DetectionRules from './pages/DetectionRules'
import DetectionRuleDetails from './pages/DetectionRuleDetails'
import Incidents from './pages/Incidents'
import IncidentDetails from './pages/IncidentDetails'
import ThreatIntelligence from './pages/ThreatIntelligence'
import ThreatIntelligenceDetails from './pages/ThreatIntelligenceDetails'
import Identity from './pages/Identity'
import IdentityDetails from './pages/IdentityDetails'
import Vulnerabilities from './pages/Vulnerabilities'
import VulnerabilityDetails from './pages/VulnerabilityDetails'
import SOC from './pages/SOC'
import SOCEventDetails from './pages/SOCEventDetails'
import Reports from './pages/Reports'
import RiskManagement from './pages/RiskManagement'
import RiskDetails from './pages/RiskDetails'
import PolicyManagement from './pages/PolicyManagement'
import PolicyDetails from './pages/PolicyDetails'
import SecurityExceptions from './pages/SecurityExceptions'
import SecurityExceptionDetails from './pages/SecurityExceptionDetails'
import SecurityPlaybooks from './pages/SecurityPlaybooks'
import SecurityPlaybookDetails from './pages/SecurityPlaybookDetails'
import SecurityPlaybookExecutionDetails from './pages/SecurityPlaybookExecutionDetails'
import SecurityIntegrations from './pages/SecurityIntegrations'
import SecurityIntegrationDetails from './pages/SecurityIntegrationDetails'
import SecurityArchitecture from './pages/SecurityArchitecture'
import SecurityArchitectureDetails from './pages/SecurityArchitectureDetails'
import SecurityAssets from './pages/SecurityAssets'
import SecurityAssetDetails from './pages/SecurityAssetDetails'
import SecurityConfigurations from './pages/SecurityConfigurations'
import SecurityConfigurationDetails from './pages/SecurityConfigurationDetails'

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />

        <div className="app-main">
          <Topbar />

          <main className="main-content">
            <Routes>

              <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
              />

              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              <Route
                path="/security-posture"
                element={<SecurityPosture />}
              />

              <Route
                path="/security-metrics"
                element={<SecurityMetrics />}
              />

              <Route
                path="/compliance"
                element={<Compliance />}
              />

              <Route
                path="/compliance/:controlId"
                element={<ComplianceDetails />}
              />

              <Route
                path="/endpoints"
                element={<Endpoints />}
              />

              <Route
                path="/endpoints/:endpointId"
                element={<EndpointDetails />}
              />

              <Route
                path="/alerts"
                element={<Alerts />}
              />

              <Route
                path="/alerts/:alertId"
                element={<AlertDetails />}
              />

              <Route
                path="/network"
                element={<Network />}
              />

              <Route
                path="/network/:connectionId"
                element={<NetworkConnectionDetails />}
              />

              <Route
                path="/processes"
                element={<Processes />}
              />

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

              <Route
                path="/forensics"
                element={<Forensics />}
              />

              <Route
                path="/forensics/:evidenceId"
                element={<ForensicsDetails />}
              />

              <Route
                path="/audit-logs"
                element={<AuditLogs />}
              />

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

              <Route
                path="/incidents"
                element={<Incidents />}
              />

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

              <Route
                path="/identity"
                element={<Identity />}
              />

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

              <Route
                path="/soc"
                element={<SOC />}
              />

              <Route
                path="/soc/events/:eventId"
                element={<SOCEventDetails />}
              />

              <Route
                path="/reports"
                element={<Reports />}
              />

              <Route
                path="/risks"
                element={<RiskManagement />}
              />

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

              <Route
                path="/automation"
                element={<SecurityPlaybooks />}
              />

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

              <Route
                path="/assets"
                element={<SecurityAssets />}
              />

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
                path="*"
                element={<Navigate to="/dashboard" replace />}
              />

            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App