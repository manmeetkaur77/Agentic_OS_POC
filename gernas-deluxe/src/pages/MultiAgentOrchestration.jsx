import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Network, Hammer, Users2, ArrowRight, Users, GitBranch,
  Bot, Layers, Share2, MessageSquare, BarChart2, CheckCircle2,
} from 'lucide-react'
import useStore from '../store/useStore'
import { activeAgentCount, avgAccuracy, storyForWorkflow } from '../data/platformData'

/* ══════════════════════════════════════════════════════════════════════════════
   MOCK DATA — the two catalog-backed swarms are pulled straight from the real
   workflow records (same ones Discover Hub and Command Center show), so their
   name, status, agent roster and progress can't drift out of sync. "Fraud
   Detection Council" is a genuine ad-hoc swarm — assembled from real agents but
   with no permanent workflow of its own, exactly what Swarm Builder is for.
   ══════════════════════════════════════════════════════════════════════════════ */

const wf001 = storyForWorkflow('wf-001')
const wf002 = storyForWorkflow('wf-002')

const STATS = [
  { label: 'Active Agents',   value: String(activeAgentCount)      },
  { label: 'Orchestrations',  value: '3'                            },
  { label: 'Consensus Rate',  value: `${Math.round(avgAccuracy)}%`  },
  { label: 'Avg Latency',     value: '1.4s'                         },
]

const TABS = [
  { key: 'live',     label: 'Live Orchestrations', icon: Network },
  { key: 'context',  label: 'Context Architecture', icon: Layers },
  { key: 'patterns', label: 'Swarm Patterns',       icon: Share2 },
  { key: 'negotiations', label: 'Negotiations',      icon: MessageSquare },
  { key: 'resources', label: 'Resources',            icon: BarChart2 },
]
const PATTERN_ICON  = { sequential: ArrowRight, consensus: Users, pipeline: GitBranch }
const STATUS_STYLE  = {
  running: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  voting:  { bg: 'bg-amber-100',   text: 'text-amber-700'   },
  queued:  { bg: 'bg-[#F1F5F9]',   text: 'text-[#64748B]'   },
}

const perHour = (tasksPerDay) => `${Math.max(1, Math.round(tasksPerDay / 24))}/hour`

const ORCHESTRATIONS = [
  {
    id: 'orc-1', name: wf001.name, pattern: 'sequential', patternLabel: 'Sequential Chain',
    agents: wf001.agents.map(a => a.name),
    throughput: perHour(wf001.workflow.tasksPerDay), status: 'running', progress: Math.round(wf001.workflow.sla),
  },
  {
    id: 'orc-2', name: 'Fraud Detection Council', pattern: 'consensus', patternLabel: 'Consensus Protocol',
    agents: ['Fraud Detection Agent', 'Dispute Resolution Agent', 'Compliance Audit Agent'],
    throughput: '12/hour', status: 'voting', progress: 67,
  },
  {
    id: 'orc-3', name: wf002.name, pattern: 'pipeline', patternLabel: 'Pipeline Chain',
    agents: wf002.agents.map(a => a.name),
    throughput: perHour(wf002.workflow.tasksPerDay), status: 'queued', progress: Math.round(wf002.workflow.sla),
  },
]

const ROSTER = [
  { name: 'Lead Scoring Agent',      status: 'draft',  progress: 18 },
  { name: 'Approval Notifier',       status: 'active', progress: 98 },
  { name: 'Document Collection Bot', status: 'active', progress: 94 },
  { name: 'GL Posting Agent',        status: 'active', progress: 99 },
  { name: 'Wire Transfer Verifier',  status: 'active', progress: 97 },
]

/* ══════════════════════════════════════════════════════════════════════════════
   PIECES
   ══════════════════════════════════════════════════════════════════════════════ */

function OrchestrationCard({ orc }) {
  const Icon = PATTERN_ICON[orc.pattern] || Bot
  const s = STATUS_STYLE[orc.status] || STATUS_STYLE.queued
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
      className="card p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#1A2340' }}>
            <Icon size={17} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1A2340] leading-tight">{orc.name}</p>
            <p className="text-xs text-[#9BA8BA] mt-0.5">{orc.patternLabel} &middot; {orc.agents.length} agents</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-[#9BA8BA]">{orc.throughput}</p>
          <p className="text-[10px] text-[#CBD5E0] -mt-0.5 mb-1">throughput</p>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${s.bg} ${s.text}`}>{orc.status}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {orc.agents.map(a => (
          <span key={a} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[#F1F5F9] text-[#4A5568]">
            <Bot size={10} className="text-[#9BA8BA]" /> {a}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${orc.progress}%`, background: '#1A2340' }} />
        </div>
        <span className="text-xs font-bold text-[#1A2340] flex-shrink-0">{orc.progress}%</span>
      </div>
    </motion.div>
  )
}

function RosterItem({ agent }) {
  const isActive = agent.status === 'active'
  return (
    <div className="px-4 py-3 border-b border-[#F0F2F5] last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-bold text-[#1A2340]">{agent.name}</p>
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: isActive ? '#10B981' : '#CBD5E0' }} />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full bg-[#F0F2F5] overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${agent.progress}%`, background: isActive ? '#10B981' : '#CBD5E0' }} />
        </div>
        <span className="text-[10px] text-[#9BA8BA] flex-shrink-0">{agent.status}</span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════════════════════════ */

export default function MultiAgentOrchestration() {
  const navigate = useNavigate()
  const { addToast } = useStore()
  const [tab, setTab] = useState('live')

  const notify = (title, message) => addToast({ type: 'info', title, message })

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="flex flex-col gap-5">

      {/* ── Banner ── */}
      <div className="rounded-2xl px-6 py-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#1A2340 0%,#2D3A5C 100%)' }}>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Network size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-display text-xl font-bold">Multi-Agent Orchestration</h1>
              <p className="text-white/50 text-xs mt-0.5">Live Orchestrations &middot; Context Architecture &middot; Swarms &middot; Resources</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/builder')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10">
              <Hammer size={13} /> Agent Builder
            </button>
            <button onClick={() => navigate('/studio')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#1A2340] bg-white hover:bg-white/90 transition-all">
              <Users2 size={13} /> New Swarm
            </button>
          </div>
        </div>
        <div className="h-px bg-white/10 mb-4" />
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-8 flex-wrap">
            {STATS.map(s => (
              <div key={s.label}>
                <p className="text-white font-display text-2xl font-bold leading-none">{s.value}</p>
                <p className="text-white/50 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" /> All systems operational
          </span>
        </div>
      </div>

      {/* ── Tab strip ── */}
      <div className="card p-1.5 flex items-center gap-1 overflow-x-auto">
        {TABS.map(t => {
          const Icon = t.icon
          const active = tab === t.key
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                active ? 'text-white' : 'text-[#4A5568] hover:bg-[#F7F8FA]'
              }`}
              style={active ? { background: '#1A2340' } : undefined}>
              <Icon size={13} /> {t.label}
            </button>
          )
        })}
      </div>

      {/* ── Content ── */}
      {tab !== 'live' ? (
        <div className="card p-12 text-center">
          {(() => { const Icon = TABS.find(t => t.key === tab).icon; return <Icon size={28} className="text-[#CBD5E0] mx-auto mb-3" /> })()}
          <p className="text-sm font-semibold text-[#1A2340]">{TABS.find(t => t.key === tab).label}</p>
          <p className="text-xs text-[#9BA8BA] mt-1">This view is coming soon to Multi-Agent Orchestration.</p>
        </div>
      ) : (
        <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 320px' }}>
          {/* Left: Active Orchestrations */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <Network size={15} className="text-[#C8102E]" />
              <p className="text-sm font-bold text-[#1A2340]">Active Orchestrations</p>
            </div>
            <div className="flex flex-col gap-4">
              {ORCHESTRATIONS.map(orc => <OrchestrationCard key={orc.id} orc={orc} />)}
            </div>
          </div>

          {/* Right: Agent Roster */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <Users size={15} className="text-[#C8102E]" />
              <p className="text-sm font-bold text-[#1A2340]">Agent Roster</p>
            </div>
            <div className="card overflow-hidden">
              {ROSTER.map(a => <RosterItem key={a.name} agent={a} />)}
            </div>
            <button onClick={() => notify('Agent Roster', 'The full roster browser is coming soon — see Discover Hub for now.')}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 mt-3 rounded-xl text-xs font-semibold text-[#4A5568] border border-[#E2E8F0] bg-white hover:bg-[#F7F8FA] transition-all">
              <CheckCircle2 size={12} /> View Full Roster
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
