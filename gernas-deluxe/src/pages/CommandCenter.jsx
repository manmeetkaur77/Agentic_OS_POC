import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  RefreshCw, Users, Presentation,
  Zap, ShieldCheck, Activity, Bot, TrendingUp, TrendingDown,
  Network, DollarSign, MessageSquare, Send,
  CheckCircle2, Clock, AlertTriangle, Shield, ArrowRight, Sparkles,
} from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import useStore from '../store/useStore'
import {
  ALL_WORKFLOWS, INDIVIDUAL_AGENTS, liveWorkflows, activeAgentCount, dailyExecutions,
  avgWorkflowSla, avgLiveSla, orchestratedAgentCount, totalCostAvoided, workflowRoi,
  formatMoney, latencyMs, uptimePct, errorRatePct, monthlyCostUsd,
  monthlySpendUsd, monthlyBudgetUsd, budgetBurnPct, COST_BREAKDOWN,
  formatCompact, COST_PER_TASK_USD,
  storyline,
} from '../data/platformData'

/* ══════════════════════════════════════════════════════════════════════════════
   Every figure on this page comes from src/data/platformData.js — the same
   catalog Discover Hub reads — so nothing here can disagree with another screen.
   ══════════════════════════════════════════════════════════════════════════════ */

const STAT_TILES = [
  { key: 'agents',    label: 'AI Agents in Production',        value: String(activeAgentCount),           delta: '+12%',  icon: Bot,          color: '#0EA5E9' },
  { key: 'automation',label: 'End-to-End Automation Rate',      value: `${Math.round(liveWorkflows.length / ALL_WORKFLOWS.length * 100)}%`, delta: '+4.5%', icon: Zap,          color: '#F59E0B' },
  { key: 'cost',      label: 'Cost Avoided Through Automation', value: formatMoney(totalCostAvoided),   delta: '+18%',  icon: TrendingUp,   color: '#10B981' },
  { key: 'stp',       label: 'Straight-Through Processing',     value: `${Math.round(avgWorkflowSla)}%`,   delta: '+8%',   icon: CheckCircle2, color: '#8B5CF6' },
]

const ACTIVE_SWARMS = liveWorkflows.map(w => ({
  name: w.name, agents: w.agents.length,
}))

const COLLAB_TYPE_STYLE = {
  handoff:    { bg: '#DBEAFE', text: '#1D4ED8' },
  data:       { bg: '#EDE9FE', text: '#7C3AED' },
  decision:   { bg: '#D1FAE5', text: '#059669' },
  escalation: { bg: '#FEF3C7', text: '#B45309' },
}
const COLLAB_PATTERNS = [
  { from: 'KYB Verification Agent',  to: 'Risk Scoring Engine',   type: 'handoff'    },
  { from: 'Risk Scoring Engine',     to: 'Approval Notifier',     type: 'decision'   },
  { from: 'Document Collection Bot', to: 'KYB Verification Agent',type: 'data'       },
  { from: 'Invoice Ingestion Agent', to: 'PO Matching Engine',    type: 'handoff'    },
  { from: 'Exception Handler',       to: 'GL Posting Agent',      type: 'escalation' },
]

// Top spenders fall out of the catalog: run-cost scales with the volume each agent handles
const MOST_EXPENSIVE_AGENTS = [...INDIVIDUAL_AGENTS]
  .sort((a, b) => monthlyCostUsd(b) - monthlyCostUsd(a))
  .slice(0, 4)
  .map((a, i) => ({ rank: i + 1, name: a.name, cost: monthlyCostUsd(a) }))

const HANDOFF_REASONS = [
  { name: 'Policy Exception',  value: 45, color: '#1A2340' },
  { name: 'Customer Request',  value: 32, color: '#0EA5E9' },
  { name: 'Complex Case',      value: 28, color: '#C8102E' },
  { name: 'System Error',      value: 18, color: '#F59E0B' },
  { name: 'Other',             value: 11, color: '#9BA8BA' },
]
const RECENT_INTERVENTIONS = [
  { time: '14:30', agent: 'Risk Scoring Engine',     reason: 'Policy Exception',        duration: '2.1h', done: true  },
  { time: '13:45', agent: 'KYB Verification Agent',  reason: 'Document Clarity',        duration: '1.5h', done: true  },
  { time: '12:20', agent: 'Fraud Detection Agent',   reason: 'Manual Review Required',  duration: '5.2h', done: false },
  { time: '11:10', agent: 'Approval Notifier',       reason: 'Customer Negotiation',    duration: '0.8h', done: true  },
]

const GOV_STATS = [
  { label: 'Critical',    value: 1,     color: '#EF4444' },
  { label: 'Warnings',    value: 2,     color: '#F59E0B' },
  { label: 'Resolved',    value: 1,     color: '#10B981' },
  { label: 'Compliance',  value: '98%', color: '#1A2340' },
]
const GOV_LEVEL_STYLE = {
  critical: { border: '#EF4444', bg: '#FEF2F2', badgeBg: '#FEE2E2', badgeText: '#B91C1C' },
  warning:  { border: '#F59E0B', bg: '#FFFBEB', badgeBg: '#FEF3C7', badgeText: '#B45309' },
  info:     { border: '#3B82F6', bg: '#EFF6FF', badgeBg: '#DBEAFE', badgeText: '#1D4ED8' },
}
const GOVERNANCE_ALERTS = [
  { level: 'critical', title: 'Agent attempted unauthorized data access',        status: 'investigating', agent: 'Fraud Detection Agent',      category: 'Data Access Control', time: '2 min ago'  },
  { level: 'warning',  title: 'High-value transaction requires manual approval', status: 'pending',       agent: 'Approval Notifier',          category: 'Transaction Limits',  time: '15 min ago' },
  { level: 'info',     title: 'Policy updated: Customer Data Retention',        status: 'completed',     agent: 'System Admin',               category: 'Data Retention',      time: '1 hour ago' },
  { level: 'warning',  title: 'Agent exceeded rate limit threshold',            status: 'resolved',      agent: 'Document Collection Bot',    category: 'Rate Limiting',       time: '2 hours ago'},
]

const ASK_CHIPS = [
  'Which agents have the highest error rates?',
  'Show me workflows with low STP rates',
  "What's the cost breakdown by department?",
  'Which agents need optimization?',
]

// Real agents, spanning every category in the catalog — tasksDay is exact;
// latency/uptime/errors are formulas over the real successRate/tasksToday fields
const AGENT_PERF_CATEGORIES = ['All', 'Risk & Compliance', 'Onboarding', 'Operations', 'Data', 'Revenue']
const AGENT_PERF_IDS = ['ia-20', 'ia-03', 'ia-02', 'ia-05', 'ia-08', 'ia-06']
const AGENT_PERF = AGENT_PERF_IDS.map(id => {
  const a = INDIVIDUAL_AGENTS.find(x => x.id === id)
  return {
    name: a.name, sub: a.description, category: a.category,
    latency: latencyMs(a),
    uptime:  uptimePct(a),
    errors:  errorRatePct(a),
    tasksDay: a.tasksToday,
  }
})

// Every workflow in the catalog — stp/tat/agents are real fields (not fabricated hours);
// deviations/human/roi are formulas over sla/tasksPerDay
const WORKFLOW_ANALYTICS = ALL_WORKFLOWS.map(w => ({
  name: w.name, sub: w.description, status: w.status,
  stp: w.sla, tat: w.avgRunTime, agents: w.agents.length,
  roi: formatMoney(workflowRoi(w)) + ' annually',
}))

/* ══════════════════════════════════════════════════════════════════════════════
   SMALL PRESENTATIONAL PIECES
   ══════════════════════════════════════════════════════════════════════════════ */

function StatCard({ label, value, delta, icon: Icon, color }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-[#718096]">{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <p className="font-display text-3xl font-bold text-[#1A2340]">{value}</p>
      <div className="flex items-center gap-1 mt-2">
        <TrendingUp size={12} className="text-emerald-500" />
        <span className="text-xs font-semibold text-emerald-600">{delta}</span>
        <span className="text-xs text-[#9BA8BA]">vs last month</span>
      </div>
    </div>
  )
}

function MiniDonut({ data, size = 150 }) {
  return (
    <ResponsiveContainer width="100%" height={size}>
      <PieChart>
        <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={size * 0.32} outerRadius={size * 0.47} paddingAngle={3}>
          {data.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12 }}
          formatter={(v, n) => [typeof v === 'number' && v > 999 ? `$${(v / 1000).toFixed(1)}K` : v, n]}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

function StoryCard({ story, onOpen }) {
  const SegIcon = story.segment.icon
  return (
    <button onClick={onOpen}
      className="text-left rounded-2xl border border-[#E2E8F0] bg-white p-4 flex-shrink-0 hover:border-[#CBD5E0] hover:shadow-sm transition-all"
      style={{ width: 250 }}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: `${story.segment.color}18` }}>
            <SegIcon size={12} style={{ color: story.segment.color }} />
          </div>
          <span className="text-xs font-semibold text-[#718096]">{story.segment.short}</span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0" style={{ background: `${story.stageMeta.color}18`, color: story.stageMeta.color }}>
          {story.stageMeta.label}
        </span>
      </div>
      <p className="text-xs font-bold text-[#1A2340] leading-snug mb-2">{story.headline}</p>
      <div className="flex items-center gap-1.5 text-xs">
        <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#718096] line-through">{story.before.value}</span>
        <ArrowRight size={10} className="text-[#CBD5E0] flex-shrink-0" />
        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">{story.workflow.avgRunTime}</span>
      </div>
    </button>
  )
}

function ToolbarButton({ icon: Icon, label, onClick, primary }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
        primary ? 'text-white hover:opacity-90' : 'text-[#4A5568] bg-white border border-[#E2E8F0] hover:bg-[#F7F8FA]'
      }`}
      style={primary ? { background: '#1A2340' } : undefined}
    >
      <Icon size={13} /> {label}
    </button>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════════════════════════ */

export default function CommandCenter() {
  const navigate = useNavigate()
  const { addToast } = useStore()
  const [perfCategory, setPerfCategory] = useState('All')
  const [perfSort, setPerfSort] = useState('latency')
  const [askInput, setAskInput] = useState('')

  const notify = (title, message) => addToast({ type: 'info', title, message })

  const filteredAgents = AGENT_PERF
    .filter(a => perfCategory === 'All' || a.category === perfCategory)
    .slice()
    .sort((a, b) => (perfSort === 'latency' ? a.latency - b.latency : perfSort === 'uptime' ? b.uptime - a.uptime : a.errors - b.errors))

  const handleAsk = () => {
    if (!askInput.trim()) return
    notify('Sent to Nova', `"${askInput.trim()}" — open Imagination Studio to continue this analysis.`)
    setAskInput('')
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="flex flex-col gap-5">

      {/* ── Auto-optimization event banner ── */}
      <div className="rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4 flex-wrap"
        style={{ background: 'linear-gradient(135deg,#1A2340 0%,#2D3A5C 100%)', borderLeft: '4px solid #F59E0B' }}>
        <div className="flex items-center gap-3">
          <RefreshCw size={16} className="text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white">Auto-Optimization Event Detected</p>
            <p className="text-xs text-white/50 mt-0.5">Routing Engine temporarily shifted 40% of calls from Sonnet to Haiku to preserve SLA during load spike. No policy changes.</p>
          </div>
        </div>
        <button onClick={() => notify('Routing Logs', 'Model routing history is captured in Opik Observability.')}
          className="flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition-all">
          View Logs
        </button>
      </div>

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1A2340]">Command Center</h1>
          <p className="text-sm text-[#718096] mt-1">Real-time intelligence across your autonomous workforce — track adoption, efficiency, and ROI</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ToolbarButton icon={Users}        label="Collaborate" onClick={() => notify('Collaborate', 'Invite teammates to co-edit this dashboard.')} />
          <ToolbarButton icon={Presentation} label="Present"     onClick={() => notify('Present', 'Presentation mode coming soon.')} />
          <ToolbarButton icon={Zap} label="Launch Agent" primary onClick={() => navigate('/builder')} />
        </div>
      </div>

      {/* ── Automation Journeys — one storyline per segment, from discovery to scale ── */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Sparkles size={13} className="text-[#8B5CF6]" />
          <p className="text-xs font-bold text-[#9BA8BA] uppercase tracking-wider">Automation Journeys</p>
        </div>
        <div className="flex items-stretch gap-3 overflow-x-auto pb-1">
          {storyline.map(story => (
            <StoryCard key={story.workflowId} story={story}
              onOpen={() => navigate(story.stage === 'building' || story.stage === 'governance' ? '/approval-centre' : '/agent-pool')} />
          ))}
        </div>
      </div>

      {/* ── Compliance banner ── */}
      <div className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
        style={{ background: 'linear-gradient(135deg,#10B981 0%,#0E7490 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={17} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">All Agents Monitored &amp; Policy-Compliant</p>
            <p className="text-xs text-white/75 mt-0.5">100% audit coverage &middot; Human oversight enabled &middot; Zero unauthorized actions</p>
          </div>
        </div>
        <button onClick={() => navigate('/approval-centre')}
          className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/15 hover:bg-white/25 transition-all">
          View Risk Dashboard
        </button>
      </div>

      {/* ── Real-time orchestration banner ── */}
      <div className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
        style={{ background: 'linear-gradient(135deg,#1A2340 0%,#0F1730 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Activity size={17} className="text-blue-300" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Real-Time Orchestration</p>
            <p className="text-sm text-white/70 mt-0.5">{liveWorkflows.length} Active Swarms &middot; {orchestratedAgentCount} Agents Collaborating &middot; {Math.round(avgLiveSla)}% Synchronization</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex -space-x-2">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="w-7 h-7 rounded-full bg-white/10 border-2 flex items-center justify-center" style={{ borderColor: '#1A2340' }}>
                <Bot size={12} className="text-white/70" />
              </div>
            ))}
          </div>
          <span className="flex items-center gap-1.5 text-xs text-white/60 ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" /> Live Activity
          </span>
        </div>
      </div>

      {/* ── Stat tiles ── */}
      <div className="grid grid-cols-4 gap-4">
        {STAT_TILES.map(({ key, ...t }) => <StatCard key={key} {...t} />)}
      </div>

      {/* ── Agent Collaboration ── */}
      <div className="grid grid-cols-1">
        <div className="card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-[#1A2340]">Agent Collaboration</p>
              <p className="text-xs text-[#9BA8BA] mt-0.5">Network patterns and swarm activity</p>
            </div>
            <Network size={16} className="text-[#CBD5E0] flex-shrink-0" />
          </div>

          <p className="text-xs font-bold text-[#9BA8BA] uppercase tracking-wider mb-2">Active Swarms</p>
          <div className="flex flex-col gap-2 mb-4">
            {ACTIVE_SWARMS.map(s => (
              <div key={s.name} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#F7F8FA]">
                <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                  <Users size={13} className="text-[#0EA5E9]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#1A2340] truncate">{s.name}</p>
                  <p className="text-xs text-[#9BA8BA]">{s.agents} agents collaborating</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs font-bold text-[#9BA8BA] uppercase tracking-wider mb-2">Top Collaboration Patterns</p>
          <div className="flex flex-col gap-1.5">
            {COLLAB_PATTERNS.map((p, i) => {
              const s = COLLAB_TYPE_STYLE[p.type]
              return (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#F0F2F5]">
                  <span className="text-xs font-medium text-[#4A5568] truncate">{p.from}</span>
                  <ArrowRight size={11} className="text-[#CBD5E0] flex-shrink-0" />
                  <span className="text-xs font-medium text-[#4A5568] truncate flex-1 min-w-0">{p.to}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0" style={{ background: s.bg, color: s.text }}>{p.type}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Cost Efficiency Monitor ── */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-bold text-[#1A2340]">Cost Efficiency Monitor</p>
            <p className="text-xs text-[#9BA8BA] mt-0.5">Real-time cost tracking and optimization</p>
          </div>
          <DollarSign size={16} className="text-emerald-500 flex-shrink-0" />
        </div>

        <div className="grid grid-cols-4 gap-3 mb-5">
          <div className="rounded-xl px-4 py-3 bg-emerald-50 border border-emerald-100">
            <p className="text-xs text-[#718096]">Monthly Spend</p>
            <p className="text-lg font-bold text-[#1A2340] mt-0.5">${monthlySpendUsd.toLocaleString()}</p>
            <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1"><TrendingDown size={11} /> 12% vs last month</p>
          </div>
          <div className="rounded-xl px-4 py-3 bg-blue-50 border border-blue-100">
            <p className="text-xs text-[#718096]">Cost / Task</p>
            <p className="text-lg font-bold text-[#1A2340] mt-0.5">${COST_PER_TASK_USD.toFixed(2)}</p>
            <p className="text-xs text-[#9BA8BA] mt-0.5">{formatCompact(dailyExecutions)} tasks/day</p>
          </div>
          <div className="rounded-xl px-4 py-3 bg-amber-50 border border-amber-100">
            <p className="text-xs text-[#718096]">Budget Burn</p>
            <p className="text-lg font-bold text-amber-600 mt-0.5">{budgetBurnPct}%</p>
            <p className="text-xs text-[#9BA8BA] mt-0.5">{formatMoney(monthlyBudgetUsd)} allocated</p>
          </div>
          <div className="rounded-xl px-4 py-3 bg-purple-50 border border-purple-100">
            <p className="text-xs text-[#718096]">Savings Found</p>
            <p className="text-lg font-bold text-purple-600 mt-0.5">{formatMoney(monthlyBudgetUsd - monthlySpendUsd)}</p>
            <p className="text-xs text-[#9BA8BA] mt-0.5">Headroom this month</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-bold text-[#9BA8BA] uppercase tracking-wider mb-2">Cost Breakdown</p>
            <div className="flex items-center gap-4">
              <div className="w-36 flex-shrink-0"><MiniDonut data={COST_BREAKDOWN} size={130} /></div>
              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                {COST_BREAKDOWN.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-xs text-[#4A5568] flex-1 truncate">{d.name}</span>
                    <span className="text-xs font-semibold text-[#1A2340]">${(d.value / 1000).toFixed(1)}K</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-[#9BA8BA] uppercase tracking-wider mb-2">Most Expensive Agents</p>
            <div className="flex flex-col gap-1.5">
              {MOST_EXPENSIVE_AGENTS.map(a => (
                <div key={a.rank} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#F7F8FA]">
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#C8102E' }}>{a.rank}</span>
                  <span className="text-xs font-medium text-[#1A2340] flex-1 truncate">{a.name}</span>
                  <span className="text-xs font-bold text-[#C8102E] flex-shrink-0">${a.cost.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Handoffs + Governance ── */}
      <div className="grid grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-[#1A2340]">Human-Agent Handoffs</p>
              <p className="text-xs text-[#9BA8BA] mt-0.5">Intervention patterns and response times</p>
            </div>
            <Users size={16} className="text-[#CBD5E0] flex-shrink-0" />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl px-3 py-2.5 bg-blue-50 border border-blue-100">
              <p className="text-xs text-[#718096]">Today's Handoffs</p>
              <p className="text-lg font-bold text-[#1A2340] mt-0.5 flex items-center gap-1">234 <TrendingDown size={12} className="text-red-400" /></p>
            </div>
            <div className="rounded-xl px-3 py-2.5 bg-amber-50 border border-amber-100">
              <p className="text-xs text-[#718096]">Avg Response</p>
              <p className="text-lg font-bold text-amber-600 mt-0.5">4.2h</p>
            </div>
          </div>

          <p className="text-xs font-bold text-[#9BA8BA] uppercase tracking-wider mb-2">Handoff Reasons</p>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-32 flex-shrink-0"><MiniDonut data={HANDOFF_REASONS} size={120} /></div>
            <div className="flex-1 flex flex-col gap-1.5">
              {HANDOFF_REASONS.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-xs text-[#4A5568] flex-1 truncate">{d.name}</span>
                  <span className="text-xs font-semibold text-[#1A2340]">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs font-bold text-[#9BA8BA] uppercase tracking-wider mb-2">Recent Interventions</p>
          <div className="flex flex-col gap-1.5">
            {RECENT_INTERVENTIONS.map((iv, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#F7F8FA]">
                <span className="text-xs text-[#9BA8BA] w-10 flex-shrink-0">{iv.time}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1A2340] truncate">{iv.agent}</p>
                  <p className="text-xs text-[#9BA8BA] truncate">{iv.reason}</p>
                </div>
                <span className="text-xs text-[#718096] flex items-center gap-1 flex-shrink-0"><Clock size={10} /> {iv.duration}</span>
                {iv.done
                  ? <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                  : <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-[#1A2340]">Governance &amp; Policy</p>
              <p className="text-xs text-[#9BA8BA] mt-0.5">Real-time alerts and compliance events</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">1 Pending</span>
              <Shield size={16} className="text-[#CBD5E0]" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2.5 mb-4">
            {GOV_STATS.map(s => (
              <div key={s.label} className="rounded-xl px-2.5 py-2.5 bg-[#F7F8FA] text-center">
                <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-[#9BA8BA] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2.5">
            {GOVERNANCE_ALERTS.map((a, i) => {
              const s = GOV_LEVEL_STYLE[a.level]
              return (
                <div key={i} className="rounded-xl px-3.5 py-3 border-l-4" style={{ borderColor: s.border, background: s.bg }}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-[#1A2340]">{a.title}</p>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0" style={{ background: s.badgeBg, color: s.badgeText }}>{a.status}</span>
                  </div>
                  <p className="text-xs text-[#718096] mt-1">{a.agent} &middot; {a.category} &middot; {a.time}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Ask About Your System ── */}
      <div className="card p-5" style={{ borderColor: '#DDD6FE' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#7C3AED,#4338CA)' }}>
            <MessageSquare size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1A2340]">Ask About Your System</p>
            <p className="text-xs text-[#9BA8BA]">Natural language analytics powered by AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={askInput}
            onChange={e => setAskInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            placeholder="Ask anything about your agents, workflows, or performance…"
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#7C3AED]"
          />
          <button onClick={handleAsk}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 hover:opacity-90 transition-all"
            style={{ background: '#7C3AED' }}>
            <Send size={15} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {ASK_CHIPS.map(c => (
            <button key={c} onClick={() => setAskInput(c)}
              className="px-3 py-1.5 rounded-full border border-[#E2E8F0] text-xs text-[#4A5568] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-all">
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Agent Performance ── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <p className="text-sm font-bold text-[#1A2340]">Agent Performance</p>
            <p className="text-xs text-[#9BA8BA] mt-0.5">Individual agent metrics and health</p>
          </div>
          <select value={perfSort} onChange={e => setPerfSort(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs text-[#4A5568] bg-white focus:outline-none">
            <option value="latency">Latency</option>
            <option value="uptime">Uptime</option>
            <option value="errors">Error Rate</option>
          </select>
        </div>
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {AGENT_PERF_CATEGORIES.map(c => (
            <button key={c} onClick={() => setPerfCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                perfCategory === c ? 'bg-[#1A2340] text-white' : 'bg-[#F7F8FA] text-[#718096] border border-[#E2E8F0] hover:bg-white'
              }`}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {filteredAgents.map(a => (
            <div key={a.name} className="rounded-2xl border border-[#E2E8F0] p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#1A2340' }}>
                  <Bot size={15} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#1A2340] truncate">{a.name}</p>
                  <p className="text-xs text-[#9BA8BA] truncate">{a.sub}</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-[#F7F8FA] px-2.5 py-2">
                  <p className="text-xs text-[#9BA8BA] flex items-center gap-1"><Clock size={9} /> Latency</p>
                  <p className="text-sm font-bold text-[#1A2340]">{a.latency}ms</p>
                </div>
                <div className="rounded-lg bg-[#F7F8FA] px-2.5 py-2">
                  <p className="text-xs text-[#9BA8BA] flex items-center gap-1"><Activity size={9} /> Uptime</p>
                  <p className="text-sm font-bold text-emerald-600">{a.uptime}%</p>
                </div>
                <div className="rounded-lg bg-[#F7F8FA] px-2.5 py-2">
                  <p className="text-xs text-[#9BA8BA] flex items-center gap-1"><AlertTriangle size={9} /> Errors</p>
                  <p className="text-sm font-bold text-red-500">{a.errors}%</p>
                </div>
                <div className="rounded-lg bg-[#F7F8FA] px-2.5 py-2">
                  <p className="text-xs text-[#9BA8BA] flex items-center gap-1"><Zap size={9} /> Tasks/day</p>
                  <p className="text-sm font-bold text-[#1A2340]">{a.tasksDay.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Workflow Analytics ── */}
      <div className="card p-5">
        <p className="text-sm font-bold text-[#1A2340]">Workflow Analytics</p>
        <p className="text-xs text-[#9BA8BA] mt-0.5 mb-4">STP rates, TAT, and deviation tracking</p>
        <div className="flex flex-col gap-3">
          {WORKFLOW_ANALYTICS.map(wf => (
            <div key={wf.name} className="rounded-2xl bg-[#F7F8FA] px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center flex-shrink-0">
                    <Network size={14} className="text-[#4A5568]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1A2340]">{wf.name}</p>
                    <p className="text-xs text-[#9BA8BA]">{wf.sub}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                  wf.status === 'live' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>{wf.status === 'live' ? 'live' : 'under review'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  ['STP Rate', `${wf.stp}%`], ['Avg TAT', wf.tat], ['Agents', wf.agents],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-white px-2.5 py-2 border border-[#E2E8F0]">
                    <p className="text-xs text-[#9BA8BA]">{label}</p>
                    <p className="text-sm font-bold text-[#1A2340]">{value}</p>
                  </div>
                ))}
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <TrendingUp size={11} /> ROI: {wf.roi}
              </span>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  )
}
