import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout                  from './components/layout/Layout'
// Build & Catalog
import AgentPool               from './pages/AgentPool'
import AgentBuilder            from './pages/AgentBuilder'
import AgentOrchestrator       from './pages/AgentOrchestrator'
import ImagineStudio           from './pages/ImagineStudio'
// Operations
import CommandCenter           from './pages/CommandCenter'
import LiveOperations          from './pages/LiveOperations'
import MakerChecker            from './pages/MakerChecker'
import IncidentManagement      from './pages/IncidentManagement'
// Governance
import GovernanceRegistry      from './pages/GovernanceRegistry'
import TrustControl            from './pages/TrustControl'
// System Internals
import UserAccessManagement    from './pages/UserAccessManagement'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/agent-pool" replace />} />

          {/* Build & Catalog */}
          <Route path="agent-pool"          element={<AgentPool />} />
          <Route path="builder"             element={<AgentBuilder />} />
          <Route path="agent-orchestrator"  element={<AgentOrchestrator />} />
          <Route path="studio"              element={<ImagineStudio />} />

          {/* Operations */}
          <Route path="command-center"      element={<CommandCenter />} />
          <Route path="live-operations"     element={<LiveOperations />} />
          <Route path="maker-checker"       element={<MakerChecker />} />
          <Route path="incident-management" element={<IncidentManagement />} />

          {/* Governance */}
          <Route path="approval-centre"     element={<GovernanceRegistry />} />
          <Route path="trust-control"       element={<TrustControl />} />

          {/* System Internals */}
          <Route path="user-access"         element={<UserAccessManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
