import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Bot, ArrowRight, Plus, Users,
  CreditCard, Printer, FileText, Database, Shield, Hammer,
  X, CheckCircle2, ShieldCheck, Wrench, Cpu, Send, Upload, Eye, Workflow,
  Clock, Zap, AlertCircle
} from 'lucide-react'
import useStore from '../store/useStore'
import StatusBadge from '../components/shared/StatusBadge'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
const item      = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

const SEG_COLORS = { merchant: '#0EA5E9', print: '#6B7280', b2b: '#8B5CF6', data: '#10B981', platform: '#C8102E' }
const SEG_ICONS  = { merchant: CreditCard, print: Printer, b2b: FileText, data: Database, platform: Shield }

/* ─── Hardcoded demo agents ─────────────────────────────────────────────────── */
const DEMO_AGENTS = [
  {
    id: 'demo-001',
    name: 'SMB Onboarding Workflow',
    description: 'Automates merchant KYC, document collection & approval pipeline',
    segmentKey: 'merchant',
    agentStatus: 'live',
  },
  {
    id: 'demo-002',
    name: 'Invoice Reconciliation Agent',
    description: 'Matches invoices against purchase orders and flags discrepancies',
    segmentKey: 'b2b',
    agentStatus: 'complete-process',
  },
  {
    id: 'demo-003',
    name: 'Fraud Detection Engine',
    description: 'Real-time transaction scoring using ML anomaly detection',
    segmentKey: 'data',
    agentStatus: 'pending-approval',
  },
]

/* ─── Status badge helper ────────────────────────────────────────────────────── */
function AgentStatusBadge({ agentStatus, pendingApproval }) {
  if (pendingApproval || agentStatus === 'pending-approval') {
    return (
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200 whitespace-nowrap">
        <Clock size={10} />
        Check Approval Status
      </span>
    )
  }
  if (agentStatus === 'live') {
    return (
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 whitespace-nowrap">
        <Zap size={10} />
        Live
      </span>
    )
  }
  if (agentStatus === 'complete-process') {
    return (
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200 whitespace-nowrap">
        <AlertCircle size={10} />
        Complete the Process
      </span>
    )
  }
  // fallback to the existing StatusBadge for store agents
  return <StatusBadge status={agentStatus || 'idle'} />
}

/* ─── Agent row ─────────────────────────────────────────────────────────────── */
function AgentRow({ agent, isCustom }) {
  const navigate = useNavigate()
  const segKey = agent.segmentKey || agent.segment || 'platform'
  const color  = SEG_COLORS[segKey] || '#718096'
  const Icon   = SEG_ICONS[segKey] || Bot

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      whileHover={{ x: 2 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E0] hover:bg-[#F7F9FF] cursor-pointer transition-all"
      onClick={() => navigate('/agent-pool')}
    >
      {/* Icon */}
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
        {agent.agentStatus === 'live'
          ? <span className="agent-pulse"><Icon size={15} style={{ color }} /></span>
          : <Icon size={15} style={{ color }} />}
      </div>

      {/* Name + description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[#1A2340] truncate">{agent.name}</p>
          {isCustom && (
            <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Custom</span>
          )}
          {agent.pendingApproval && (
            <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700">Imported</span>
          )}
          {agent.fromAnalyst && (
            <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Agent Analyst</span>
          )}
        </div>
        <p className="text-xs text-[#718096] truncate mt-0.5">
          {agent.description || (agent.framework ? `Framework: ${agent.framework}` : 'Custom agent')}
        </p>
      </div>

      {/* Meta + status */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {agent.teams != null && (
          <div className="flex items-center gap-1 text-xs text-[#718096]">
            <Users size={11} />
            <span>{agent.teams} team{agent.teams !== 1 ? 's' : ''}</span>
          </div>
        )}
        {agent.successRate != null && (
          <div className="text-xs font-semibold text-emerald-600">{agent.successRate}%</div>
        )}
        <AgentStatusBadge agentStatus={agent.agentStatus} pendingApproval={agent.pendingApproval} />
      </div>
    </motion.div>
  )
}

/* ─── Workflow Config Modal ─────────────────────────────────────────────────── */
function WorkflowConfigModal({ config, onClose, onApprove, approved }) {
  const { agent = {}, model = {}, tools = [], guardrails = {}, observability = {} } = config
  const enabledTools = tools.filter(t => t.enabled !== false)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(6px)', background: 'rgba(10,18,40,0.6)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
        style={{ maxHeight: '88vh', boxShadow: '0 25px 60px rgba(0,0,0,0.35)' }}
      >
        {/* ── Sticky header ── */}
        <div
          className="px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1A2340 0%, #2D3A5C 100%)', borderRadius: '1rem 1rem 0 0' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Workflow size={15} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{agent.name || 'Workflow Configuration'}</p>
              <p className="text-white/50 text-xs">Configuration Artifact Review</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
            <X size={13} className="text-white" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* Agent Identity */}
          <div>
            <SectionLabel icon={<Bot size={12} />} label="Agent Identity" />
            <div className="bg-[#F7F8FA] rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1A2340]">{agent.name}</p>
                  <p className="text-xs text-[#718096] mt-1 leading-relaxed">{agent.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {agent.version && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">v{agent.version}</span>
                  )}
                  {agent.framework && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#1A2340]/5 text-[#1A2340]">{agent.framework}</span>
                  )}
                </div>
              </div>
              {agent.id && (
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#E2E8F0]">
                  <span className="text-xs text-[#718096]">ID:</span>
                  <code className="text-xs font-mono text-[#C8102E] bg-red-50 px-2 py-0.5 rounded-md border border-red-100">{agent.id}</code>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {agent.skills?.length > 0 && (
            <div>
              <SectionLabel icon={<Cpu size={12} />} label={`Skills (${agent.skills.length})`} />
              <div className="flex flex-wrap gap-2">
                {agent.skills.map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Model */}
          {model.id && (
            <div>
              <SectionLabel icon={<Cpu size={12} />} label="Model" />
              <div className="flex items-center gap-3 bg-[#F7F8FA] rounded-xl p-3 border border-[#E2E8F0]">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Cpu size={15} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1A2340]">{model.displayName || model.id}</p>
                  <p className="text-xs text-[#718096]">Provider: {model.provider}</p>
                </div>
                <code className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">{model.id}</code>
              </div>
            </div>
          )}

          {/* Tools */}
          {enabledTools.length > 0 && (
            <div>
              <SectionLabel icon={<Wrench size={12} />} label={`Tools (${enabledTools.length} enabled)`} />
              <div className="grid grid-cols-2 gap-2">
                {enabledTools.map((tool) => (
                  <div key={tool.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F7F8FA] border border-[#E2E8F0]">
                    <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                    <span className="text-xs text-[#1A2340] font-medium truncate">{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guardrails */}
          {(guardrails.mandatory?.length > 0 || guardrails.custom?.length > 0) && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <SectionLabel icon={<ShieldCheck size={12} />} label="Guardrails" inline />
                {guardrails.framework && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{guardrails.framework}</span>
                )}
              </div>
              <div className="space-y-3">
                {guardrails.mandatory?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#718096] mb-2 uppercase tracking-wide">Mandatory</p>
                    <div className="flex flex-wrap gap-2">
                      {guardrails.mandatory.map((g) => (
                        <span key={g.id} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-[#C8102E] border border-red-100">{g.name}</span>
                      ))}
                    </div>
                  </div>
                )}
                {guardrails.custom?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#718096] mb-2 uppercase tracking-wide">Custom</p>
                    <div className="flex flex-wrap gap-2">
                      {guardrails.custom.map((g) => (
                        <span key={g.id} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">{g.name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Observability */}
          {observability.provider && (
            <div>
              <SectionLabel icon={<Eye size={12} />} label="Observability" />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1A2340] text-white">{observability.provider}</span>
                {observability.tracing && <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">Tracing ✓</span>}
                {observability.metrics && <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">Metrics ✓</span>}
                {observability.logging && <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">Logging: {observability.logging}</span>}
              </div>
            </div>
          )}

        </div>

        {/* ── Sticky footer ── */}
        <div
          className="px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-between flex-shrink-0"
          style={{ background: '#F7F8FA', borderRadius: '0 0 1rem 1rem' }}
        >
          <p className="text-xs text-[#718096]">
            {approved ? 'Workflow added to your agents list — approval pending.' : 'Review all artifacts before sending for approval'}
          </p>
          {approved ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={13} />
              <span className="text-xs font-semibold">Sent for Approval</span>
            </div>
          ) : (
            <button
              onClick={onApprove}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #C8102E 0%, #9B0D24 100%)' }}
            >
              <Send size={12} /> Send for Approval
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

/* ── Small helper ── */
function SectionLabel({ icon, label, inline }) {
  const el = (
    <div className="flex items-center gap-2">
      <span className="text-[#1A2340]">{icon}</span>
      <p className="text-xs font-semibold text-[#1A2340] uppercase tracking-wider">{label}</p>
    </div>
  )
  return inline ? el : <div className="mb-3">{el}</div>
}

/* ─── Dashboard ─────────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate()
  const { metrics, builtAgents, deployedAgents } = useStore()
  const [poolAgents, setPoolAgents]         = useState([])
  const [uploadedConfig, setUploadedConfig] = useState(null)
  const [approvalSent, setApprovalSent]     = useState(false)
  const [pendingAgents, setPendingAgents]   = useState([])
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetch('/api/nova/agents')
      .then(r => r.ok ? r.json() : [])
      .then(data => setPoolAgents(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result)
        setUploadedConfig(json)
        setApprovalSent(false)
      } catch { /* ignore invalid JSON */ }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleApprove() {
    if (!uploadedConfig) return
    const a = uploadedConfig.agent || {}
    setPendingAgents(prev => [
      ...prev.filter(p => p.id !== (a.id || a.name)),
      {
        id:              a.id   || `pending-${Date.now()}`,
        name:            a.name || 'Imported Workflow',
        description:     a.description || '',
        framework:       a.framework   || '',
        pendingApproval: true,
        agentStatus:     'pending-approval',
        segmentKey:      'platform',
      }
    ])
    setApprovalSent(true)
  }

  function handleModalClose() {
    setUploadedConfig(null)
    setApprovalSent(false)
  }

  if (!metrics) return (
    <div className="grid grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => <div key={i} className="card p-5 h-28 skeleton" />)}
    </div>
  )

  const ov       = metrics.overview
  const allBuilt = builtAgents || []

  // Convert deployedAgents (from Agent Analyst phase journey) to the row format
  const deployedRows = (deployedAgents || []).map(a => ({
    id:           a.id,
    name:         a.name,
    description:  `Submitted for approval · ${a.submittedAt || ''}`,
    segmentKey:   'platform',
    agentStatus:  a.status === 'pending-approval' ? 'pending-approval' : a.status,
    fromAnalyst:  true,
  }))

  // Demo agents + store agents + uploaded pending agents + analyst-submitted agents
  const allShown = [...DEMO_AGENTS, ...allBuilt, ...pendingAgents, ...deployedRows]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileUpload} />

      {/* Config artifact modal */}
      <AnimatePresence>
        {uploadedConfig && (
          <WorkflowConfigModal
            config={uploadedConfig}
            onClose={handleModalClose}
            onApprove={handleApprove}
            approved={approvalSent}
          />
        )}
      </AnimatePresence>

      {/* Hero header */}
      <motion.div variants={item} className="relative rounded-2xl overflow-hidden p-6"
        style={{ background: 'linear-gradient(135deg, #1A2340 0%, #2D3A5C 60%, #1A2340 100%)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #C8102E 0%, transparent 60%)' }} />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">DLX_AGENTIC_OS — Deluxe Corporation</p>
            <h1 className="font-display text-2xl font-bold text-white">Homepage</h1>
            <p className="text-white/60 text-sm mt-1">Real-time agent intelligence across all business segments</p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-xs mb-1">System Status</p>
            <div className="flex items-center gap-2 justify-end">
              <span className="agent-pulse w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span className="text-emerald-400 text-sm font-semibold">{ov.uptimePercent}% Uptime</span>
            </div>
            <p className="text-white/40 text-xs mt-1">{ov.activeAgents} of {ov.totalAgents} agents active</p>
          </div>
        </div>
      </motion.div>

      {/* Bottom section */}
      <motion.div variants={item}>
        <div className="card overflow-hidden">

          {/* Card header */}
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Hammer size={13} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A2340]">Agents Built by You</p>
                <p className="text-xs text-[#718096]">{allShown.length} agent{allShown.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/agent-pool')}
              className="flex items-center gap-1 text-xs text-[#C8102E] font-medium hover:gap-2 transition-all"
            >
              View all <ArrowRight size={11} />
            </button>
          </div>

          {/* Agent list */}
          <div className="p-4 space-y-2">
            {allShown.map((agent, i) => (
              <AgentRow
                key={agent.id || i}
                agent={agent}
                isCustom={!agent.pendingApproval && !agent.fromAnalyst && !DEMO_AGENTS.find(d => d.id === agent.id)}
              />
            ))}

            {/* Action buttons always visible below the list */}
            <div className="pt-3 flex items-center gap-2">
              <button
                onClick={() => navigate('/studio')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ background: '#C8102E' }}
              >
                <Plus size={11} /> Build your first agent
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1A2340] border border-[#E2E8F0] hover:border-[#CBD5E0] hover:bg-[#F7F9FF] transition-all"
              >
                <Upload size={11} /> Existing Workflow
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  )
}
