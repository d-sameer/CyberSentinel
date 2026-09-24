import './App.css'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-main">
        <Topbar />

        <main className="main-content">
          <Dashboard />
        </main>
      </div>
    </div>
  )
}

export default App