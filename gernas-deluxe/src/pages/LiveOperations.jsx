import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Activity, Shield, Flag, GitMerge, ChevronDown, AlertOctagon,
  Bot, ShieldCheck, ExternalLink, Database, MessageCircle,
} from 'lucide-react'
import useStore from '../store/useStore'
import {
  activeAgentCount, uptimePct, errorRatePct, latencyMs, liveWorkflows, agentByName,
  buildIncidents, INCIDENT_SEVERITY_STYLE, INCIDENT_STATUS_STYLE,
} from '../data/platformData'

/* ══════════════════════════════════════════════════════════════════════════════
   MOCK DATA — built from agents/tools that already exist in Discover Hub
   ══════════════════════════════════════════════════════════════════════════════ */

const QUICK_ACTIONS = [
  { key: 'maker-checker', label: 'Maker-Checker',  icon: Flag },
  { key: 'approval',      label: 'Approval Centre', icon: Shield },
  { key: 'incidents',     label: 'Incidents',       icon: Activity },
  { key: 'workflow',      label: 'Create Workflow', icon: GitMerge },
]

// Icon per agent, inferred from its real role/tools text — not hand-picked per agent
const NODE_ICON_RULES = [
  { test: /kyb|verif|identity|sanction/i,          icon: ShieldCheck },
  { test: /risk|score|fraud|ml|churn|classif/i,    icon: Activity },
  { test: /gl|ledger|write|erp|snowflake|sync/i,   icon: Database },
]
const iconForAgent = (agent) => {
  const haystack = `${agent.role} ${(agent.tools || []).join(' ')}`
  return (NODE_ICON_RULES.find(r => r.test.test(haystack)) || { icon: Bot }).icon
}
const NODE_COLORS = ['#0EA5E9', '#7C3AED', '#10B981', '#F59E0B']

const topIncidents = buildIncidents().slice(0, 3)

/* ══════════════════════════════════════════════════════════════════════════════
   PIECES
   ══════════════════════════════════════════════════════════════════════════════ */

function KernelNode({ label, sub, icon: Icon, color, style }) {
  return (
    <div className="absolute rounded-xl border-2 bg-white px-3 py-2.5" style={{ borderColor: color, width: NODE_W, ...style }}>
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon size={12} className="flex-shrink-0" style={{ color }} />
        <p className="text-xs font-bold text-[#1A2340] leading-tight">{label}</p>
      </div>
      <p className="text-[10px] text-[#9BA8BA] truncate">{sub}</p>
    </div>
  )
}

// Fixed pixel geometry — deterministic layout, avoids measuring flex-rendered DOM.
// Column heights adapt to however many agents land on each side (1-3 per side).
const NODE_W = 190, NODE_H = 54, NODE_GAP = 24, KERNEL_R = 32, COL_GAP = 70
const KERNEL_CX = NODE_W + COL_GAP + KERNEL_R
const RIGHT_X   = KERNEL_CX + KERNEL_R + COL_GAP
const DIAGRAM_W = RIGHT_X + NODE_W
const colHeight  = (count) => count * NODE_H + (count - 1) * NODE_GAP
const colNodeCy  = (count, totalH, i) => (totalH - colHeight(count)) / 2 + i * (NODE_H + NODE_GAP) + NODE_H / 2

function CollaborationDiagram({ agents }) {
  const mid = Math.ceil(agents.length / 2)
  const left  = agents.slice(0, mid).map((a, i) => ({
    label: a.name, sub: a.role.length > 30 ? a.role.slice(0, 28) + '…' : a.role,
    icon: iconForAgent(a), color: NODE_COLORS[i % NODE_COLORS.length],
  }))
  const right = agents.slice(mid).map((a, i) => ({
    label: a.name, sub: a.role.length > 30 ? a.role.slice(0, 28) + '…' : a.role,
    icon: iconForAgent(a), color: NODE_COLORS[(mid + i) % NODE_COLORS.length],
  }))
  const diagramH = Math.max(colHeight(left.length), colHeight(right.length), NODE_H)

  return (
    <div className="py-6 px-4 rounded-xl bg-[#F7F8FA] overflow-x-auto">
      <div className="relative mx-auto" style={{ width: DIAGRAM_W, height: diagramH }}>
        <svg className="absolute inset-0 pointer-events-none" width={DIAGRAM_W} height={diagramH}>
          {left.map((_, i) => (
            <line key={i} x1={NODE_W} y1={colNodeCy(left.length, diagramH, i)} x2={KERNEL_CX - KERNEL_R} y2={diagramH / 2}
              stroke="#CBD5E0" strokeWidth="1.5" strokeDasharray="4 4" />
          ))}
          {right.map((_, i) => (
            <line key={i} x1={KERNEL_CX + KERNEL_R} y1={diagramH / 2} x2={RIGHT_X} y2={colNodeCy(right.length, diagramH, i)}
              stroke="#CBD5E0" strokeWidth="1.5" strokeDasharray="4 4" />
          ))}
        </svg>

        {left.map((n, i) => (
          <KernelNode key={n.label} {...n} style={{ left: 0, top: colNodeCy(left.length, diagramH, i) - NODE_H / 2 }} />
        ))}

        <div className="absolute rounded-full flex flex-col items-center justify-center"
          style={{
            left: KERNEL_CX - KERNEL_R, top: diagramH / 2 - KERNEL_R, width: KERNEL_R * 2, height: KERNEL_R * 2,
            background: '#1A2340', boxShadow: '0 6px 20px rgba(26,35,64,0.35)',
          }}>
          <Bot size={16} className="text-white mb-0.5" />
          <p className="text-white font-bold leading-none" style={{ fontSize: 8 }}>DLX</p>
          <p className="text-white/40 leading-none mt-0.5" style={{ fontSize: 7 }}>Kernel</p>
        </div>

        {right.map((n, i) => (
          <KernelNode key={n.label} {...n} style={{ left: RIGHT_X, top: colNodeCy(right.length, diagramH, i) - NODE_H / 2 }} />
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════════════════════════ */

export default function LiveOperations() {
  const navigate = useNavigate()
  const { addToast } = useStore()
  const [showQuickActions, setShowQuickActions] = useState(true)

  const notify = (title, message) => addToast({ type: 'info', title, message })

  const [selectedFlowId, setSelectedFlowId] = useState(liveWorkflows[0].id)
  const selectedFlow = liveWorkflows.find(w => w.id === selectedFlowId) || liveWorkflows[0]

  const processHealth = useMemo(() => {
    // The workflow chain only carries lightweight {name, role, tools} records —
    // resolve each to its real catalog agent so uptime/latency/error reflect
    // actual tasksToday/successRate instead of falling back to generic defaults.
    const agents = selectedFlow.agents.map(a => agentByName(a.name) || a)
    const avgUptime  = agents.reduce((n, a) => n + uptimePct(a), 0) / agents.length
    const avgError   = agents.reduce((n, a) => n + errorRatePct(a), 0) / agents.length
    const avgLatency = agents.reduce((n, a) => n + latencyMs(a), 0) / agents.length
    return [
      { label: 'Uptime',        value: `${avgUptime.toFixed(1)}%`,    bg: '#F0FDF4', color: '#059669' },
      { label: 'Avg Latency',   value: `${Math.round(avgLatency)}ms`, bg: '#EFF6FF', color: '#1D4ED8' },
      { label: 'Error Rate',    value: `${avgError.toFixed(2)}%`,     bg: '#FFFBEB', color: '#B45309' },
      { label: 'Active Agents', value: String(activeAgentCount),      bg: '#F5F3FF', color: '#7C3AED' },
    ]
  }, [selectedFlow])

  const handleQuickAction = (key) => {
    if (key === 'approval')      return navigate('/approval-centre')
    if (key === 'workflow')      return navigate('/studio')
    if (key === 'maker-checker') return navigate('/maker-checker')
    if (key === 'incidents')     return navigate('/incident-management')
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="flex flex-col gap-5">

      {/* ── Quick Actions bar ── */}
      <AnimatePresence initial={false}>
        {showQuickActions && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="card px-5 py-3.5 flex items-center gap-6 flex-wrap overflow-hidden">
            <span className="text-xs font-bold text-[#9BA8BA] uppercase tracking-wider flex-shrink-0">Quick Actions:</span>
            {QUICK_ACTIONS.map(a => {
              const Icon = a.icon
              return (
                <button key={a.key} onClick={() => handleQuickAction(a.key)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-[#4A5568] hover:text-[#C8102E] transition-all">
                  <Icon size={14} /> {a.label}
                </button>
              )
            })}
            <button onClick={() => setShowQuickActions(false)} className="ml-auto text-xs text-[#9BA8BA] hover:text-[#1A2340] flex-shrink-0">Hide</button>
          </motion.div>
        )}
      </AnimatePresence>
      {!showQuickActions && (
        <button onClick={() => setShowQuickActions(true)}
          className="self-start flex items-center gap-1.5 text-xs text-[#9BA8BA] hover:text-[#1A2340]">
          <ChevronDown size={12} /> Show Quick Actions
        </button>
      )}

      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 340px' }}>
        {/* ── LEFT column ── */}
        <div className="flex flex-col gap-5 min-w-0">
          {/* Live Agent Collaboration */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <GitMerge size={15} className="text-[#C8102E]" />
                <p className="text-sm font-bold text-[#1A2340]">Live Agent Collaboration</p>
              </div>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-700">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse inline-block" /> ORCHESTRATION ACTIVE
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-[#9BA8BA]">Viewing:</span>
              <select value={selectedFlowId} onChange={e => setSelectedFlowId(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#1A2340] bg-white focus:outline-none focus:border-[#C8102E]">
                {liveWorkflows.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              <span className="text-xs text-[#9BA8BA]">— {selectedFlow.segment} &middot; {selectedFlow.agents.length} agents</span>
            </div>
            <CollaborationDiagram agents={selectedFlow.agents} />
          </div>

          {/* Opik Flight Recorder banner */}
          <div className="rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4 flex-wrap"
            style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <div className="flex items-center gap-2.5">
              <Activity size={16} className="text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-900">
                <span className="font-bold">Opik Flight Recorder Active:</span> All executions are being traced for replay and audit
              </p>
            </div>
            <button onClick={() => notify('Opik Observability', 'Deep-dive tracing view is coming to this workspace soon.')}
              className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 transition-all flex-shrink-0">
              View All Traces <ExternalLink size={11} />
            </button>
          </div>
        </div>

        {/* ── RIGHT column ── */}
        <div className="flex flex-col gap-5 min-w-0">
          {/* Active Incidents — the same real incidents shown in Incident Management */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertOctagon size={15} className="text-[#C8102E]" />
                <p className="text-sm font-bold text-[#1A2340]">Active Incidents</p>
              </div>
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">{topIncidents.length}</span>
            </div>
            <div className="flex flex-col gap-3 mb-3">
              {topIncidents.map(inc => {
                const sev = INCIDENT_SEVERITY_STYLE[inc.severity]
                const st  = INCIDENT_STATUS_STYLE[inc.status]
                return (
                  <div key={inc.id} className="rounded-xl border border-[#F0F2F5] px-3.5 py-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs font-bold" style={{ color: sev.text }}>{inc.agent}</p>
                      <span className="text-[10px] text-[#9BA8BA] flex-shrink-0">{inc.reportedAgo}</span>
                    </div>
                    <p className="text-xs text-[#4A5568] leading-relaxed mb-2">{inc.type}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.bg}`}>{st.label}</span>
                      <span className="text-[10px] font-bold" style={{ color: sev.text }}>{inc.errorRate}% error rate</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <button onClick={() => navigate('/incident-management')}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-[#4A5568] border border-[#E2E8F0] hover:bg-[#F7F8FA] transition-all">
              <MessageCircle size={12} /> View All Incidents
            </button>
          </div>

          {/* Process Health */}
          <div className="card p-5">
            <p className="text-sm font-bold text-[#1A2340] mb-1">Process Health</p>
            <p className="text-xs text-[#9BA8BA] mb-3">For {selectedFlow.name}</p>
            <div className="grid grid-cols-2 gap-3">
              {processHealth.map(p => (
                <div key={p.label} className="rounded-xl px-3 py-3" style={{ background: p.bg }}>
                  <p className="text-lg font-bold" style={{ color: p.color }}>{p.value}</p>
                  <p className="text-xs text-[#718096] mt-0.5">{p.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
