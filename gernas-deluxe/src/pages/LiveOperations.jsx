import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Activity, Shield, Flag, GitMerge, ChevronDown,
  RefreshCw, XCircle, PlayCircle, Bot, ShieldCheck,
  MessageSquare, ExternalLink, Database,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import useStore from '../store/useStore'
import { activeAgentCount, uptimePct, errorRatePct, latencyMs, dailyExecutions, agentByName } from '../data/platformData'

/* ══════════════════════════════════════════════════════════════════════════════
   MOCK DATA — built from agents/tools that already exist in Discover Hub
   ══════════════════════════════════════════════════════════════════════════════ */

const QUICK_ACTIONS = [
  { key: 'maker-checker', label: 'Maker-Checker',  icon: Flag },
  { key: 'approval',      label: 'Approval Centre', icon: Shield },
  { key: 'incidents',     label: 'Incidents',       icon: Activity },
  { key: 'workflow',      label: 'Create Workflow', icon: GitMerge },
]

const KERNEL_LEFT = [
  { label: 'KYB Verification Agent', sub: 'Identity Check', icon: ShieldCheck, color: '#0EA5E9' },
  { label: 'Risk Scoring Engine',    sub: 'Fraud Signals',   icon: Activity,    color: '#7C3AED' },
]
const KERNEL_RIGHT = [
  { label: 'Approval Notifier',  sub: 'Stakeholder Alerts', icon: Bot,      color: '#10B981' },
  { label: 'GL Posting Agent',   sub: 'Ledger Update',      icon: Database, color: '#F59E0B' },
]

const AGENT_FLAGS = [
  { agent: 'Risk Scoring Engine',    time: '2m ago',  text: 'Merchant #4821: Risk score 78 requires manual review before approval.',        level: 'review',   target: 'risk-model' },
  { agent: 'GL Posting Agent',       time: '8m ago',  text: 'Batch processing available: 14 pending GL entries can be posted together.',     level: 'optimize',  target: 'gl-write' },
  { agent: 'KYB Verification Agent', time: '15m ago', text: 'API rate limit approaching (85%). Consider staggered verification calls.',      level: 'error',      target: 'dnb-lookup' },
]
const FLAG_STYLE = {
  review:   { label: 'REVIEW REQUIRED',        bg: 'bg-amber-100',   text: 'text-amber-700',   name: 'text-amber-700'   },
  optimize: { label: 'OPTIMIZATION OPPORTUNITY', bg: 'bg-emerald-100', text: 'text-emerald-700', name: 'text-emerald-700' },
  error:    { label: 'ERROR PRONE',            bg: 'bg-red-100',     text: 'text-red-700',     name: 'text-red-700'     },
}

// Scaled so the peak lines up with the platform's real total daily volume
const executionPeak = Math.round(dailyExecutions / 24 * 1.1)
const EXECUTION_DATA = [0.16, 0.30, 0.40, 0.53, 0.64, 0.85, 1.0].map((f, i) => ({
  t: `${String(9 + i).padStart(2, '0')}:00`, v: Math.round(executionPeak * f),
}))

// Rolled up from the four agents actually shown in the collaboration diagram above
const kernelAgents = [...KERNEL_LEFT, ...KERNEL_RIGHT].map(n => agentByName(n.label))
const avgUptime  = kernelAgents.reduce((n, a) => n + uptimePct(a), 0) / kernelAgents.length
const avgErrorPct = kernelAgents.reduce((n, a) => n + errorRatePct(a), 0) / kernelAgents.length
const avgLatency = kernelAgents.reduce((n, a) => n + latencyMs(a), 0) / kernelAgents.length

const PROCESS_HEALTH = [
  { label: 'Uptime',        value: `${avgUptime.toFixed(1)}%`,   bg: '#F0FDF4', color: '#059669' },
  { label: 'Avg Latency',   value: `${Math.round(avgLatency)}ms`, bg: '#EFF6FF', color: '#1D4ED8' },
  { label: 'Error Rate',    value: `${avgErrorPct.toFixed(2)}%`, bg: '#FFFBEB', color: '#B45309' },
  { label: 'Active Agents', value: String(activeAgentCount),     bg: '#F5F3FF', color: '#7C3AED' },
]

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

// Fixed pixel geometry — deterministic layout, avoids measuring flex-rendered DOM
const NODE_W = 190, NODE_H = 54, NODE_GAP = 24, KERNEL_R = 32, COL_GAP = 70
const DIAGRAM_H = 2 * NODE_H + NODE_GAP
const KERNEL_CX = NODE_W + COL_GAP + KERNEL_R
const RIGHT_X   = KERNEL_CX + KERNEL_R + COL_GAP
const DIAGRAM_W = RIGHT_X + NODE_W
const NODE_CY   = (i) => i * (NODE_H + NODE_GAP) + NODE_H / 2

function CollaborationDiagram() {
  return (
    <div className="py-6 px-4 rounded-xl bg-[#F7F8FA] overflow-x-auto">
      <div className="relative mx-auto" style={{ width: DIAGRAM_W, height: DIAGRAM_H }}>
        <svg className="absolute inset-0 pointer-events-none" width={DIAGRAM_W} height={DIAGRAM_H}>
          {KERNEL_LEFT.map((_, i) => (
            <line key={i} x1={NODE_W} y1={NODE_CY(i)} x2={KERNEL_CX - KERNEL_R} y2={DIAGRAM_H / 2}
              stroke="#CBD5E0" strokeWidth="1.5" strokeDasharray="4 4" />
          ))}
          {KERNEL_RIGHT.map((_, i) => (
            <line key={i} x1={KERNEL_CX + KERNEL_R} y1={DIAGRAM_H / 2} x2={RIGHT_X} y2={NODE_CY(i)}
              stroke="#CBD5E0" strokeWidth="1.5" strokeDasharray="4 4" />
          ))}
        </svg>

        {KERNEL_LEFT.map((n, i) => (
          <KernelNode key={n.label} {...n} style={{ left: 0, top: NODE_CY(i) - NODE_H / 2 }} />
        ))}

        <div className="absolute rounded-full flex flex-col items-center justify-center"
          style={{
            left: KERNEL_CX - KERNEL_R, top: DIAGRAM_H / 2 - KERNEL_R, width: KERNEL_R * 2, height: KERNEL_R * 2,
            background: '#1A2340', boxShadow: '0 6px 20px rgba(26,35,64,0.35)',
          }}>
          <Bot size={16} className="text-white mb-0.5" />
          <p className="text-white font-bold leading-none" style={{ fontSize: 8 }}>DLX</p>
          <p className="text-white/40 leading-none mt-0.5" style={{ fontSize: 7 }}>Kernel</p>
        </div>

        {KERNEL_RIGHT.map((n, i) => (
          <KernelNode key={n.label} {...n} style={{ left: RIGHT_X, top: NODE_CY(i) - NODE_H / 2 }} />
        ))}
      </div>
    </div>
  )
}

function ExecutionChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={EXECUTION_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="liveOpsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey="t" tick={{ fontSize: 11, fill: '#718096' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#718096' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12 }} />
        <Area type="monotone" dataKey="v" stroke="#1D4ED8" strokeWidth={2.5} fill="url(#liveOpsGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════════════════════════ */

export default function LiveOperations() {
  const navigate = useNavigate()
  const { addToast } = useStore()
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [killed, setKilled] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)

  const notify = (title, message) => addToast({ type: 'info', title, message })

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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GitMerge size={15} className="text-[#C8102E]" />
                <p className="text-sm font-bold text-[#1A2340]">Live Agent Collaboration</p>
              </div>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-700">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse inline-block" /> SWARM ACTIVE
              </span>
            </div>
            <CollaborationDiagram />
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

          {/* Live Execution Monitor */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-[#1A2340]">Live Execution Monitor</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setRefreshTick(v => v + 1)}
                  className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white flex items-center justify-center hover:bg-[#F7F8FA] transition-all">
                  <motion.span key={refreshTick} initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                    <RefreshCw size={14} className="text-[#4A5568]" />
                  </motion.span>
                </button>
                {!killed ? (
                  <button onClick={() => { setKilled(true); notify('Process terminated', 'Live execution monitoring has been stopped.') }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-all">
                    <XCircle size={13} /> Kill Process
                  </button>
                ) : (
                  <button onClick={() => setKilled(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all">
                    <PlayCircle size={13} /> Restart
                  </button>
                )}
              </div>
            </div>
            {killed ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <XCircle size={26} className="text-red-300 mb-2" />
                <p className="text-sm font-semibold text-[#4A5568]">Process terminated</p>
                <p className="text-xs text-[#9BA8BA] mt-1">Restart to resume live monitoring.</p>
              </div>
            ) : (
              <ExecutionChart key={refreshTick} />
            )}
          </div>
        </div>

        {/* ── RIGHT column ── */}
        <div className="flex flex-col gap-5 min-w-0">
          {/* Active Agent Flags */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flag size={15} className="text-[#C8102E]" />
                <p className="text-sm font-bold text-[#1A2340]">Active Agent Flags</p>
              </div>
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">{AGENT_FLAGS.length}</span>
            </div>
            <div className="flex flex-col gap-3 mb-3">
              {AGENT_FLAGS.map((f, i) => {
                const s = FLAG_STYLE[f.level]
                return (
                  <div key={i} className="rounded-xl border border-[#F0F2F5] px-3.5 py-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className={`text-xs font-bold ${s.name}`}>{f.agent}</p>
                      <span className="text-[10px] text-[#9BA8BA] flex-shrink-0">{f.time}</span>
                    </div>
                    <p className="text-xs text-[#4A5568] leading-relaxed mb-2">{f.text}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.bg} ${s.text}`}>{s.label}</span>
                      <span className="text-[10px] text-[#9BA8BA] font-mono truncate">Target: {f.target}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <button onClick={() => notify('Feedback Hub', 'A dedicated feedback log is coming soon.')}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-[#4A5568] border border-[#E2E8F0] hover:bg-[#F7F8FA] transition-all">
              <MessageSquare size={12} /> View All Feedback
            </button>
          </div>

          {/* Process Health */}
          <div className="card p-5">
            <p className="text-sm font-bold text-[#1A2340] mb-3">Process Health</p>
            <div className="grid grid-cols-2 gap-3">
              {PROCESS_HEALTH.map(p => (
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
