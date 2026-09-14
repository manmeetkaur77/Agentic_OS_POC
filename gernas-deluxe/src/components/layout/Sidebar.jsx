import { NavLink } from 'react-router-dom'
import {
  Layers, Hammer, Network, Sparkles,
  LayoutGrid, Activity, Users, AlertOctagon,
  Shield, ShieldCheck,
  Terminal, KeyRound,
} from 'lucide-react'

// Matches the platform architecture exactly: 4 groups, 12 components. Nothing here
// that isn't one of the twelve — see "Agentic OS: Components" for the source of truth.
const navItems = [
  { divider: true, label: 'BUILD & CATALOG' },
  { path: '/agent-pool',         label: 'Discover Hub',       icon: Layers,   badge: null },
  { path: '/builder',            label: 'Agent Builder',      icon: Hammer,   badge: null },
  { path: '/agent-orchestrator', label: 'Agent Orchestrator', icon: Network,  badge: null },
  { path: '/studio',             label: 'Imagination Studio', icon: Sparkles, badge: 'AI', accent: '#F59E0B' },

  { divider: true, label: 'OPERATIONS' },
  { path: '/command-center',      label: 'Command Center',      icon: LayoutGrid,   badge: null },
  { path: '/live-operations',     label: 'Live Operations',     icon: Activity,     badge: null },
  { path: '/maker-checker',       label: 'Maker-Checker',       icon: Users,        badge: 'HITL', accent: '#0EA5E9' },
  { path: '/incident-management', label: 'Incident Management', icon: AlertOctagon, badge: null },

  { divider: true, label: 'GOVERNANCE' },
  { path: '/approval-centre', label: 'Approval Centre', icon: Shield,      badge: null },
  { path: '/trust-control',   label: 'Trust & Control',  icon: ShieldCheck, badge: null },

  { divider: true, label: 'SYSTEM INTERNALS' },
  { path: '/os-console',  label: 'OS Console',              icon: Terminal, badge: null },
  { path: '/user-access', label: 'User & Access Management', icon: KeyRound, badge: null },
]

export default function Sidebar() {
  return (
    <aside className="w-60 min-h-screen flex flex-col" style={{ background: '#1A2340' }}>
      {/* Brand block */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#C8102E' }}>
            <span className="text-white font-black text-xs tracking-tight leading-none">dlx</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight tracking-wide">DLX_AGENTIC_OS</p>
            <p className="text-white/40 text-xs">Agentic Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item, i) => {
          if (item.divider) {
            return (
              <p key={i} className="text-white/30 text-xs font-semibold uppercase tracking-widest px-3 pt-5 pb-2">
                {item.label}
              </p>
            )
          }
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-all duration-150 group
                ${isActive
                  ? 'text-white font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
              style={({ isActive }) => isActive ? {
                background: 'rgba(200,16,46,0.15)',
                borderLeft: '3px solid #C8102E',
                paddingLeft: '9px',
              } : {}}
            >
              <Icon
                size={16}
                style={item.color ? { color: item.color } : {}}
                className={!item.color ? 'group-hover:text-white' : ''}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                  style={item.accent
                    ? { background: `${item.accent}30`, color: item.accent }
                    : { background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.70)' }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-white/30 text-xs">Powered by DLX_AGENTIC_OS</p>
      </div>
    </aside>
  )
}
