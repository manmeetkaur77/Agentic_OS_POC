import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle, X, Zap, Bot, Shield, Play, ChevronRight, ChevronLeft, Plus,
  Sparkles, Crown, Users, ArrowRight, Share2, MessageSquare, Trash2, ChevronDown, Search,
} from 'lucide-react'
import useStore from '../store/useStore'
import { INDIVIDUAL_AGENTS } from '../data/platformData'

/* ══════════════════════════════════════════════════════════════════════════════
   AGENT ORCHESTRATOR — "Design, coordinate, and govern multi-agent collaboration
   by composing topologies & defining agent roles." Extracted from the Swarm
   Builder wizard that used to live inside Solution Builder / Agent Builder —
   promoted to its own top-level component per the platform architecture.
   ══════════════════════════════════════════════════════════════════════════════ */

// ─── Swarm Builder ──────────────────────────────────────────────────────────
const TOPOLOGIES = [
  { key: 'hierarchical', icon: Crown,        color: '#7C3AED', bg: '#F5F3FF', pattern: 'manager → workers',
    title: 'Hierarchical Swarm', desc: 'Manager agent delegates tasks to specialized workers. Best for complex multi-step processes.',
    bestFor: ['Merchant Onboarding', 'Document Processing', 'Invoice Reconciliation'] },
  { key: 'consensus', icon: Users,           color: '#1D4ED8', bg: '#EFF6FF', pattern: 'peer ↔ peer ↔ peer',
    title: 'Consensus Council', desc: 'Agents vote democratically on decisions. Best for high-stakes decisions requiring multiple perspectives.',
    bestFor: ['Fraud Detection', 'Risk Assessment', 'Compliance Review'] },
  { key: 'pipeline', icon: ArrowRight,       color: '#059669', bg: '#ECFDF5', pattern: 'A → B → C → D',
    title: 'Pipeline Chain', desc: 'Sequential handoff between agents. Each agent processes and passes to the next.',
    bestFor: ['KYB Verification', 'Invoice-to-Cash', 'Data Enrichment'] },
  { key: 'parallel', icon: Share2,           color: '#0EA5E9', bg: '#EFF6FF', pattern: 'coordinator → [A, B, C] → aggregator',
    title: 'Parallel Fan-Out', desc: 'Coordinator distributes work to parallel workers, then aggregates results.',
    bestFor: ['Batch Data Processing', 'Multi-Document Analysis', 'Segment Scoring'] },
  { key: 'negotiation', icon: MessageSquare, color: '#B45309', bg: '#FFFBEB', pattern: 'agent ↔ agent (rounds)',
    title: 'Negotiation Swarm', desc: 'Agents with different objectives negotiate to find an optimal solution.',
    bestFor: ['Dynamic Pricing', 'Dispute Resolution', 'Policy Exceptions'] },
  { key: 'reactive', icon: Zap,              color: '#DC2626', bg: '#FEF2F2', pattern: 'event → subscriber(s)',
    title: 'Reactive Event Mesh', desc: 'Agents react to events and trigger other agents. Event-driven collaboration.',
    bestFor: ['Transaction Monitoring', 'Alert Handling', 'Real-Time Triggers'] },
]

const ROLE_LABELS = {
  hierarchical: (i) => i === 0 ? 'manager' : 'worker',
  consensus:    () => 'peer',
  pipeline:     () => 'worker',
  parallel:     (i) => i === 0 ? 'coordinator' : 'worker',
  negotiation:  () => 'negotiator',
  reactive:     (i) => i === 0 ? 'trigger' : 'subscriber',
}
const ROLE_STYLE = {
  manager:     { bg: '#EDE9FE', text: '#6D28D9' },
  worker:      { bg: '#F1F5F9', text: '#475569' },
  peer:        { bg: '#DBEAFE', text: '#1D4ED8' },
  coordinator: { bg: '#DBEAFE', text: '#1D4ED8' },
  negotiator:  { bg: '#FEF3C7', text: '#B45309' },
  trigger:     { bg: '#FEE2E2', text: '#B91C1C' },
  subscriber:  { bg: '#F1F5F9', text: '#475569' },
}
// Which roles are valid to assign an agent, per topology — lets the builder
// reassign e.g. Manager ↔ Worker on a hierarchical swarm instead of only
// inferring the role from row position.
const ROLE_OPTIONS = {
  hierarchical: ['manager', 'worker'],
  consensus:    ['peer'],
  pipeline:     ['worker'],
  parallel:     ['coordinator', 'worker'],
  negotiation:  ['negotiator'],
  reactive:     ['trigger', 'subscriber'],
}

// Templates reuse real agents from Discover Hub, so a deployed swarm's roster
// matches what's already in the catalog (and, for fraud/invoice, the same
// rosters shown in Multi-Agent Orchestration).
const TEMPLATES = [
  {
    key: 'onboarding', topology: 'hierarchical', latency: '2.4s',
    name: 'SMB Merchant Onboarding Swarm',
    agents: [
      { name: 'Onboarding Orchestrator', description: 'Coordinates the full onboarding pipeline end-to-end',        linkedId: null },
      { name: 'KYB Verification Agent',  description: 'Verifies business identity and sanctions screening',         linkedId: 'ia-01' },
      { name: 'Document Collection Bot', description: 'Requests, parses and validates merchant documents',          linkedId: 'ia-02' },
      { name: 'Risk Scoring Engine',     description: 'ML-based risk scoring engine integrating fraud signals',     linkedId: 'ia-03' },
      { name: 'Approval Notifier',       description: 'Routes decisions to approvers and stakeholders',             linkedId: 'ia-11' },
    ],
  },
  {
    key: 'fraud', topology: 'consensus', latency: '0.8s',
    name: 'Fraud Detection Council',
    agents: [
      { name: 'Fraud Detection Agent',    description: 'Sub-second real-time fraud detection',            linkedId: 'ia-20' },
      { name: 'Dispute Resolution Agent', description: 'Manages chargeback and dispute workflows',         linkedId: 'ia-26' },
      { name: 'Violation Classifier',     description: 'Categorises policy violations by severity',        linkedId: 'ia-17' },
      { name: 'Compliance Audit Agent',   description: 'Generates automated compliance audit reports',     linkedId: 'ia-40' },
    ],
  },
  {
    key: 'invoice', topology: 'pipeline', latency: '3.2s',
    name: 'Invoice-to-Cash Reconciliation',
    agents: [
      { name: 'Invoice Ingestion Agent', description: 'Parses and classifies incoming invoices',       linkedId: 'ia-13' },
      { name: 'PO Matching Engine',      description: 'Fuzzy-matches invoices to purchase orders',      linkedId: 'ia-04' },
      { name: 'GL Posting Agent',        description: 'Posts verified invoices to the general ledger',  linkedId: 'ia-05' },
      { name: 'Exception Handler',       description: 'Flags unmatched invoices for finance review',    linkedId: 'ia-14' },
    ],
  },
]

const SWARM_STEPS = [
  { key: 'topology',   label: 'Topology',   icon: Share2 },
  { key: 'agents',     label: 'Agents',     icon: Bot },
  { key: 'governance', label: 'Governance', icon: Shield },
  { key: 'review',     label: 'Review',     icon: CheckCircle },
]

function TopologyStep({ onPick, onTemplate }) {
  return (
    <div>
      <div className="rounded-2xl border border-[#DDD6FE] bg-[#F5F3FF] px-5 py-4 mb-5 flex items-start gap-3">
        <Sparkles size={16} className="text-[#7C3AED] mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-[#1A2340]">Choose Your Swarm Topology</p>
          <p className="text-xs text-[#6D28D9] mt-0.5">Select how agents will collaborate. Each topology has different coordination patterns, governance models, and optimal use cases.</p>
        </div>
      </div>

      <p className="text-xs font-bold text-[#9BA8BA] uppercase tracking-wider mb-3">Quick Start Templates</p>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {TEMPLATES.map(tpl => {
          const t = TOPOLOGIES.find(x => x.key === tpl.topology)
          const Icon = t.icon
          return (
            <button key={tpl.key} onClick={() => onTemplate(tpl)}
              className="card p-4 text-left hover:border-[#7C3AED] hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: t.bg }}>
                  <Icon size={13} style={{ color: t.color }} />
                </div>
                <span className="text-xs font-semibold text-[#718096]">{t.title}</span>
              </div>
              <p className="text-sm font-bold text-[#1A2340] leading-tight">{tpl.name}</p>
              <p className="text-xs text-[#9BA8BA] mt-1">{tpl.agents.length} agents &middot; {tpl.latency}</p>
            </button>
          )
        })}
      </div>

      <p className="text-xs font-bold text-[#9BA8BA] uppercase tracking-wider mb-3">Or Build Custom</p>
      <div className="grid grid-cols-2 gap-4">
        {TOPOLOGIES.map(t => {
          const Icon = t.icon
          return (
            <button key={t.key} onClick={() => onPick(t.key)}
              className="card p-5 text-left hover:border-[#7C3AED] hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: t.bg }}>
                  <Icon size={18} style={{ color: t.color }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1A2340]">{t.title}</p>
                  <span className="text-xs font-mono text-[#9BA8BA]">{t.pattern}</span>
                </div>
              </div>
              <p className="text-xs text-[#718096] mb-3 leading-relaxed">{t.desc}</p>
              <div className="pt-3 border-t border-[#F0F2F5]">
                <p className="text-xs text-[#9BA8BA] mb-1.5">Best for:</p>
                <div className="flex flex-wrap gap-1">
                  {t.bestFor.map(b => (
                    <span key={b} className="px-2 py-0.5 rounded-md text-xs font-medium bg-[#F7F8FA] text-[#4A5568]">{b}</span>
                  ))}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Rich picker for linking a swarm slot to a real catalog agent — shows category,
// live/under-review status, description and daily volume so the choice is
// informed, instead of a bare name-only <select>.
function AgentPickerField({ linkedId, onLink }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const linked = linkedId ? INDIVIDUAL_AGENTS.find(a => a.id === linkedId) : null
  const q = query.trim().toLowerCase()
  const filtered = INDIVIDUAL_AGENTS.filter(ia =>
    !q || ia.name.toLowerCase().includes(q) || ia.category.toLowerCase().includes(q) || ia.segment.toLowerCase().includes(q))

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] text-xs bg-white hover:border-[#7C3AED] transition-all">
        {linked ? (
          <span className="flex items-center gap-1.5 min-w-0">
            <Bot size={11} className="text-[#7C3AED] flex-shrink-0" />
            <span className="font-semibold text-[#1A2340] truncate">{linked.name}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1F5F9] text-[#475569] flex-shrink-0">{linked.category}</span>
          </span>
        ) : (
          <span className="text-[#9BA8BA]">Link to an existing catalog agent…</span>
        )}
        <ChevronDown size={12} className="text-[#9BA8BA] flex-shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1.5 w-[400px] max-w-[90vw] rounded-xl border border-[#E2E8F0] bg-white shadow-xl flex flex-col overflow-hidden">
            <div className="p-2 border-b border-[#F0F2F5] flex items-center gap-1.5">
              <Search size={12} className="text-[#9BA8BA] ml-1.5 flex-shrink-0" />
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search by name, category, or segment…"
                className="flex-1 py-1.5 text-xs focus:outline-none" />
            </div>
            <div className="max-h-72 overflow-y-auto">
              {linked && (
                <button onClick={() => { onLink(null); setOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 text-left border-b border-[#F0F2F5]">
                  <X size={11} /> Unlink — use a custom (non-catalog) agent instead
                </button>
              )}
              {filtered.length === 0 && (
                <p className="px-3 py-6 text-xs text-[#9BA8BA] text-center">No agents match "{query}"</p>
              )}
              {filtered.map(ia => (
                <button key={ia.id} onClick={() => { onLink(ia.id); setOpen(false) }}
                  className={`w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-[#F7F8FA] transition-all border-b border-[#F7F8FA] last:border-0 ${ia.id === linkedId ? 'bg-violet-50' : ''}`}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#1A2340' }}>
                    <Bot size={12} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-[#1A2340]">{ia.name}</span>
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1F5F9] text-[#475569]">{ia.category}</span>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ia.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`}
                        title={ia.status === 'active' ? 'Live in production' : 'Under review'} />
                    </div>
                    <p className="text-[11px] text-[#9BA8BA] truncate mt-0.5">{ia.description}</p>
                    <p className="text-[10px] text-[#B0BAC9] mt-0.5">{ia.segment} &middot; {ia.successRate}% success &middot; {ia.tasksToday.toLocaleString()} tasks/day</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function AgentsStep({ topo, swarmName, setSwarmName, agents, onAdd, onUpdate, onRemove, onLink }) {
  const Icon = topo.icon
  const roleOptions = ROLE_OPTIONS[topo.key] || ['worker']
  return (
    <div>
      <div className="rounded-2xl px-5 py-4 mb-5 flex items-start gap-3" style={{ background: topo.bg, border: `1px solid ${topo.color}30` }}>
        <Icon size={18} style={{ color: topo.color }} className="mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-[#1A2340]">{topo.title} <span className="text-xs font-normal text-[#718096]">&middot; {topo.pattern}</span></p>
          <p className="text-xs text-[#718096] mt-0.5">{topo.desc}</p>
        </div>
      </div>

      <label className="text-xs font-semibold text-[#718096] mb-1.5 block">Swarm Name</label>
      <input value={swarmName} onChange={e => setSwarmName(e.target.value)} placeholder="e.g. Merchant Onboarding Swarm"
        className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm mb-5 focus:outline-none focus:border-[#7C3AED]" />

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-[#1A2340]">Swarm Agents</p>
        <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90" style={{ background: '#7C3AED' }}>
          <Plus size={12} /> Add Agent
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {agents.length === 0 && (
          <div className="card p-8 text-center">
            <Bot size={22} className="text-[#CBD5E0] mx-auto mb-2" />
            <p className="text-xs text-[#9BA8BA]">No agents yet — click "Add Agent" to build your roster.</p>
          </div>
        )}
        {agents.map((a, i) => {
          const rs = ROLE_STYLE[a.role] || ROLE_STYLE.worker
          return (
            <div key={a.id} className="card p-4 flex items-start gap-3">
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5" style={{ background: '#1A2340' }}>{i + 1}</span>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <input value={a.name} onChange={e => onUpdate(a.id, { name: e.target.value })} placeholder="Agent name"
                    className="flex-1 min-w-[140px] px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#1A2340] focus:outline-none focus:border-[#7C3AED]" />
                  {roleOptions.length > 1 ? (
                    <select value={a.role} onChange={e => onUpdate(a.id, { role: e.target.value })}
                      className="px-2 py-1 rounded-full text-xs font-bold uppercase border-0 focus:outline-none cursor-pointer"
                      style={{ background: rs.bg, color: rs.text }}>
                      {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase" style={{ background: rs.bg, color: rs.text }}>{a.role}</span>
                  )}
                </div>
                <input value={a.description} onChange={e => onUpdate(a.id, { description: e.target.value })} placeholder="What does this agent do?"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] text-xs text-[#718096] focus:outline-none focus:border-[#7C3AED]" />
                <AgentPickerField linkedId={a.linkedId} onLink={linkedId => onLink(a.id, linkedId)} />
              </div>
              <button onClick={() => onRemove(a.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 flex-shrink-0 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GovernanceStep({ timeout, setTimeoutVal, maxRetries, setMaxRetries, escalation, setEscalation, sharedContext, setSharedContext, persistResults, setPersistResults }) {
  return (
    <div>
      <div className="rounded-2xl px-5 py-4 mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200">
        <Shield size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-amber-900">Swarm Governance Settings</p>
          <p className="text-xs text-amber-700 mt-0.5">Configure how agents collaborate, resolve conflicts, and handle failures.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-6">
        <div>
          <label className="text-xs font-semibold text-[#718096] mb-1.5 block">Execution Timeout</label>
          <select value={timeout} onChange={e => setTimeoutVal(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm bg-white focus:outline-none">
            {['15 seconds', '30 seconds', '60 seconds', '120 seconds'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#718096] mb-1.5 block">Max Retries</label>
          <select value={maxRetries} onChange={e => setMaxRetries(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm bg-white focus:outline-none">
            {['1 retry', '2 retries', '3 retries', '5 retries'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-xs font-semibold text-[#718096] mb-1.5 block">Escalation Policy</label>
        <select value={escalation} onChange={e => setEscalation(e.target.value)}
          className="w-full max-w-sm px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm bg-white focus:outline-none">
          {['Escalate to Human', 'Auto-Retry', 'Fail Silently', 'Notify Only'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      <p className="text-sm font-bold text-[#1A2340] mb-3">Shared Memory</p>
      <div className="flex flex-col gap-2.5">
        {[
          { key: 'context', checked: sharedContext, set: setSharedContext, title: 'Shared Context Pool', desc: 'Agents share context within swarm execution' },
          { key: 'persist', checked: persistResults, set: setPersistResults, title: 'Persist Results', desc: 'Save swarm outputs to episodic memory' },
        ].map(opt => (
          <label key={opt.key} className="card p-4 flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-[#1A2340]">{opt.title}</p>
              <p className="text-xs text-[#9BA8BA] mt-0.5">{opt.desc}</p>
            </div>
            <input type="checkbox" checked={opt.checked} onChange={e => opt.set(e.target.checked)}
              className="w-4 h-4 rounded accent-[#7C3AED]" />
          </label>
        ))}
      </div>
    </div>
  )
}

function ReviewStep({ topo, swarmName, agents, timeout, escalation, sharedContext, canDeploy, onDeploy }) {
  const TIcon = topo.icon
  return (
    <div>
      <div className={`rounded-2xl px-5 py-4 mb-6 flex items-start gap-3 ${canDeploy ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
        {canDeploy
          ? <CheckCircle size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
          : <Shield size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />}
        <div>
          <p className={`text-sm font-bold ${canDeploy ? 'text-emerald-900' : 'text-amber-900'}`}>
            {canDeploy ? 'Ready to Deploy' : 'A few things need attention'}
          </p>
          <p className={`text-xs mt-0.5 ${canDeploy ? 'text-emerald-700' : 'text-amber-700'}`}>
            {canDeploy ? 'Review your swarm configuration before deployment.' : 'Give the swarm a name and at least 2 named agents before deploying.'}
          </p>
        </div>
      </div>

      <div className="card p-5 mb-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-base font-bold text-[#1A2340]">{swarmName || 'Untitled Swarm'}</p>
            <p className="text-xs text-[#718096] mt-0.5 flex items-center gap-1.5"><TIcon size={12} style={{ color: topo.color }} /> {topo.title}</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0" style={{ background: topo.bg, color: topo.color }}>{agents.length} Agents</span>
        </div>

        <div className="rounded-2xl p-5 mb-4 overflow-x-auto" style={{ background: '#0F1730' }}>
          <div className="flex items-start gap-1 min-w-max">
            {agents.map((a, i) => (
              <div key={a.id} className="flex items-center">
                <div className="flex flex-col items-center flex-shrink-0" style={{ width: 110 }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-1.5" style={{ background: i === 0 ? topo.color : 'rgba(255,255,255,0.1)' }}>
                    <Bot size={18} className="text-white" />
                  </div>
                  <p className="text-xs font-semibold text-white text-center leading-tight truncate w-full">{a.name || `Agent ${i + 1}`}</p>
                  <p className="text-xs text-white/40">{a.role}</p>
                </div>
                {i < agents.length - 1 && <ArrowRight size={16} className="text-white/25 mx-1 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-[#F7F8FA] px-3 py-2.5"><p className="text-xs text-[#9BA8BA]">Timeout</p><p className="text-sm font-bold text-[#1A2340]">{timeout}</p></div>
          <div className="rounded-xl bg-[#F7F8FA] px-3 py-2.5"><p className="text-xs text-[#9BA8BA]">Escalation</p><p className="text-sm font-bold text-[#1A2340]">{escalation.replace('Escalate to ', '')}</p></div>
          <div className="rounded-xl bg-[#F7F8FA] px-3 py-2.5"><p className="text-xs text-[#9BA8BA]">Shared Memory</p><p className="text-sm font-bold text-[#1A2340]">{sharedContext ? 'Enabled' : 'Disabled'}</p></div>
        </div>
      </div>

      <button onClick={onDeploy} disabled={!canDeploy}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 hover:opacity-90 active:scale-[0.99]"
        style={{ background: canDeploy ? 'linear-gradient(135deg,#7C3AED 0%,#4338CA 100%)' : '#CBD5E0' }}>
        <Play size={15} /> Deploy Swarm
      </button>
    </div>
  )
}

export default function AgentOrchestrator() {
  const navigate = useNavigate()
  const { addToast, deployWorkflow } = useStore()

  const [step, setStep] = useState('topology')
  const [topology, setTopology] = useState(null)
  const [swarmName, setSwarmName] = useState('')
  const [agents, setAgents] = useState([])
  const [timeout_, setTimeoutVal] = useState('30 seconds')
  const [maxRetries, setMaxRetries] = useState('3 retries')
  const [escalation, setEscalation] = useState('Escalate to Human')
  const [sharedContext, setSharedContext] = useState(true)
  const [persistResults, setPersistResults] = useState(true)
  const [deployed, setDeployed] = useState(false)

  const topo = TOPOLOGIES.find(t => t.key === topology)
  const stepIndex = SWARM_STEPS.findIndex(s => s.key === step)

  const applyTemplate = (tpl) => {
    setTopology(tpl.topology)
    setSwarmName(tpl.name)
    setAgents(tpl.agents.map((a, i) => ({
      id: `sa-${Date.now()}-${i}`, name: a.name, description: a.description,
      role: ROLE_LABELS[tpl.topology](i), linkedId: a.linkedId,
    })))
    setStep('agents')
  }

  const pickTopology = (key) => {
    setTopology(key)
    setAgents([])
    setStep('agents')
  }

  const addAgentRow = () => {
    setAgents(prev => [...prev, {
      id: `sa-${Date.now()}`, name: '', description: '',
      role: ROLE_LABELS[topology](prev.length), linkedId: null,
    }])
  }
  const updateAgent = (id, patch) => setAgents(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a))
  const removeAgent = (id) => setAgents(prev => prev.filter(a => a.id !== id))
  const linkAgent = (id, linkedId) => {
    const src = INDIVIDUAL_AGENTS.find(a => a.id === linkedId)
    updateAgent(id, { linkedId, name: src ? src.name : '', description: src ? src.description : '' })
  }

  const canDeploy = swarmName.trim().length > 0 && agents.length >= 2 && agents.every(a => a.name.trim())

  const handleDeploySwarm = () => {
    deployWorkflow({
      name: swarmName,
      description: `${topo.title} — ${agents.length} agents collaborating (${topo.pattern})`,
      agents: agents.map(a => {
        const src = a.linkedId ? INDIVIDUAL_AGENTS.find(x => x.id === a.linkedId) : null
        return { name: a.name, role: a.description, tools: src?.tools || [], status: 'full' }
      }),
    })
    setDeployed(true)
    addToast({ type: 'success', title: 'Swarm submitted for review', message: `${swarmName} is under review — visible in Discover Hub.` })
    setTimeout(() => navigate('/agent-pool'), 2200)
  }

  if (deployed) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <h2 className="font-display text-2xl font-bold text-[#1A2340] mb-2">Swarm Deployed!</h2>
        <p className="text-[#718096] mb-2"><strong className="text-[#1A2340]">{swarmName}</strong> has been submitted for compliance review.</p>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 mb-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
          <span className="text-xs font-semibold text-amber-700">Under Review — visible in Discover Hub</span>
        </div>
        <p className="text-sm text-[#CBD5E0]">Redirecting to Discover Hub…</p>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto">

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-xl font-bold text-[#1A2340]">Agent Orchestrator</h1>
          <p className="text-sm text-[#718096] mt-1">Design multi-agent collaboration patterns</p>
        </div>
        <button onClick={() => navigate('/agent-pool')} className="text-xs text-[#718096] flex items-center gap-1 hover:text-[#1A2340]">
          <X size={13} /> Cancel
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {SWARM_STEPS.map((s, i) => {
          const Icon = s.icon
          const active = step === s.key
          const done = stepIndex > i
          return (
            <div key={s.key} className="flex items-center gap-2">
              <button
                onClick={() => { if (done || active) setStep(s.key) }}
                disabled={!done && !active}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  active ? 'text-white' : done ? 'text-[#7C3AED] bg-violet-50 hover:bg-violet-100' : 'text-[#CBD5E0] bg-[#F7F8FA] cursor-not-allowed'
                }`}
                style={active ? { background: '#7C3AED' } : undefined}
              >
                <Icon size={13} /> {s.label}
              </button>
              {i < SWARM_STEPS.length - 1 && <ChevronRight size={14} className="text-[#CBD5E0]" />}
            </div>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
          {step === 'topology' && <TopologyStep onPick={pickTopology} onTemplate={applyTemplate} />}
          {step === 'agents' && topo && (
            <AgentsStep topo={topo} swarmName={swarmName} setSwarmName={setSwarmName}
              agents={agents} onAdd={addAgentRow} onUpdate={updateAgent} onRemove={removeAgent} onLink={linkAgent} />
          )}
          {step === 'governance' && (
            <GovernanceStep timeout={timeout_} setTimeoutVal={setTimeoutVal} maxRetries={maxRetries} setMaxRetries={setMaxRetries}
              escalation={escalation} setEscalation={setEscalation}
              sharedContext={sharedContext} setSharedContext={setSharedContext}
              persistResults={persistResults} setPersistResults={setPersistResults} />
          )}
          {step === 'review' && topo && (
            <ReviewStep topo={topo} swarmName={swarmName} agents={agents}
              timeout={timeout_} escalation={escalation} sharedContext={sharedContext}
              canDeploy={canDeploy} onDeploy={handleDeploySwarm} />
          )}
        </motion.div>
      </AnimatePresence>

      {(step === 'agents' || step === 'governance') && (
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#F0F2F5]">
          <button onClick={() => setStep(SWARM_STEPS[stepIndex - 1].key)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#4A5568] hover:bg-[#F7F8FA]">
            <ChevronLeft size={16} /> Back
          </button>
          <button
            onClick={() => setStep(SWARM_STEPS[stepIndex + 1].key)}
            disabled={step === 'agents' && (!swarmName.trim() || agents.length < 2)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 transition-all"
            style={{ background: '#7C3AED' }}>
            Continue <ChevronRight size={16} />
          </button>
        </div>
      )}
      {step === 'review' && (
        <div className="flex items-center justify-start mt-8 pt-4 border-t border-[#F0F2F5]">
          <button onClick={() => setStep('governance')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#4A5568] hover:bg-[#F7F8FA]">
            <ChevronLeft size={16} /> Back
          </button>
        </div>
      )}
    </motion.div>
  )
}
