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
import Endpoints from './pages/Endpoints'
import EndpointDetails from './pages/EndpointDetails'
import Alerts from './pages/Alerts'
import AlertDetails from './pages/AlertDetails'
import Network from './pages/Network'
import Processes from './pages/Processes'
import FileIntegrity from './pages/FileIntegrity'
import Forensics from './pages/Forensics'
import AuditLogs from './pages/AuditLogs'

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
                path="/processes"
                element={<Processes />}
              />

              <Route
                path="/file-integrity"
                element={<FileIntegrity />}
              />

              <Route
                path="/forensics"
                element={<Forensics />}
              />

              <Route
                path="/audit-logs"
                element={<AuditLogs />}
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