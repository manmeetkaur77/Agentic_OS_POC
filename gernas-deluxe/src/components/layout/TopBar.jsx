import { useState, useEffect } from 'react'
import { Bell, ChevronRight, User } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const breadcrumbs = {
  '/dashboard':    ['DLX_AGENTIC_OS', 'Homepage'],
  '/orchestration':['DLX_AGENTIC_OS', 'Agent Orchestration'],
  '/merchant':     ['DLX_AGENTIC_OS', 'Merchant Services', 'Onboarding Agent'],
  '/print':        ['DLX_AGENTIC_OS', 'Print', 'Churn Prevention'],
  '/b2b':          ['DLX_AGENTIC_OS', 'B2B Payments', 'Reconciliation'],
  '/data':          ['DLX_AGENTIC_OS', 'Data Solutions', 'Enrichment'],
  '/common-agents': ['DLX_AGENTIC_OS', 'Shared Agents', 'Common Agents'],
  '/governance':   ['DLX_AGENTIC_OS', 'Platform', 'Governance Registry'],
  '/executive':    ['DLX_AGENTIC_OS', 'Platform', 'Executive Deck'],
  '/catalog':      ['DLX_AGENTIC_OS', 'Build', 'Agent Catalog'],
  '/builder':      ['DLX_AGENTIC_OS', 'Build', 'Agent Builder'],
  '/studio':       ['DLX_AGENTIC_OS', 'Discover', 'Imagination Studio'],
  '/agent-pool':   ['DLX_AGENTIC_OS', 'Discover', 'Agent Pool'],
}

export default function TopBar() {
  const location = useLocation()
  const crumbs = breadcrumbs[location.pathname] || ['DLX_AGENTIC_OS']
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const hour = time.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <header
      className="h-14 flex items-center justify-between px-6 bg-white"
      style={{ borderBottom: '1px solid #E2E8F0', borderLeft: '4px solid #C8102E' }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} className="text-[#CBD5E0]" />}
            <span className={`text-sm ${i === crumbs.length - 1 ? 'text-[#1A2340] font-semibold' : 'text-[#718096]'}`}>
              {crumb}
            </span>
          </span>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <p className="text-xs text-[#718096]">
          {greeting}, <span className="font-semibold text-[#1A2340]">Deluxe</span>
          <span className="ml-2 text-[#CBD5E0]">|</span>
          <span className="ml-2 font-mono">{time.toLocaleTimeString()}</span>
        </p>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg bg-[#F7F8FA] flex items-center justify-center hover:bg-[#EDF0F5] relative">
            <Bell size={15} className="text-[#4A5568]" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C8102E]" />
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-[#E2E8F0]">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#C8102E' }}>
              M
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1A2340] leading-tight">Manmeet Kaur</p>
              <p className="text-xs text-[#718096] leading-tight">Platform Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
