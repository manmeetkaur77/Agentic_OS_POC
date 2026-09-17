import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Search, Layers, CheckCircle, AlertCircle, Zap, Bot,
  CreditCard, Printer, FileText, Database, Shield,
  Plus, ChevronRight, Play, Edit3,
  GitMerge, X, Terminal,
  Plug, Link2, Mail, Globe, Cpu, Tag,
  Clock, Users, BarChart2, Settings, Code,
  Wrench, Server, Cloud, Lock, Upload, AlertTriangle,
  Award, LayoutDashboard, TrendingUp, Loader,
  Sparkles, ArrowUpRight, List, LayoutGrid as GridIcon
} from 'lucide-react'
import useStore from '../store/useStore'

import {
  segColors, segIcons, ALL_WORKFLOWS, INDIVIDUAL_AGENTS, TOOLS_MCP, SEGMENTS,
  AGENT_CATEGORY_ICON, ACCESS_CHANNELS, estimateAvgTime, estimateKYA,
} from '../data/platformData'

/* ══════════════════════════════════════════════════════════════════════════════
   CANVAS COMPONENTS (shared)
   ══════════════════════════════════════════════════════════════════════════════ */
function CanvasTrigger({ label, color }) {
  return (
    <div className="flex flex-col items-center flex-shrink-0" style={{ width: 120 }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm"
        style={{ background: `${color}12`, border: `2px dashed ${color}55` }}>
        <Zap size={22} style={{ color }} />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest mt-1.5 mb-1" style={{ color }}>Trigger</p>
      <p className="text-xs text-center font-semibold text-[#1A2340] leading-tight px-1">{label}</p>
    </div>
  )
}
function CanvasConnector({ color }) {
  return (
    <div className="flex items-center flex-shrink-0 mx-1 mt-[-18px]" style={{ width: 44 }}>
      <div className="flex-1 h-0.5" style={{ background: `${color}45` }} />
      <div style={{ borderLeft: `7px solid ${color}55`, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', width: 0, height: 0 }} />
    </div>
  )
}
function CanvasAgentNode({ agent, index, color, isSelected, onClick }) {
  const statusDot = agent.status === 'full' ? '#10B981' : '#F59E0B'
  return (
    <motion.div onClick={onClick} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}
      className="flex flex-col items-center flex-shrink-0 cursor-pointer" style={{ width: 120 }}>
      <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition-all duration-200"
        style={{ background: isSelected ? color : 'white', border: `2.5px solid ${isSelected ? color : color + '45'}`, boxShadow: isSelected ? `0 8px 24px ${color}30` : '0 2px 10px rgba(0,0,0,0.07)' }}>
        <Bot size={22} style={{ color: isSelected ? 'white' : color }} />
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center" style={{ background: statusDot }}>
          <span className="text-white font-black" style={{ fontSize: 8 }}>{index + 1}</span>
        </div>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider mt-1.5 mb-1" style={{ color: isSelected ? color : '#9BA8BA' }}>Agent {index + 1}</p>
      <p className="text-xs text-center font-semibold leading-tight px-1" style={{ color: isSelected ? '#1A2340' : '#4A5568' }}>
        {agent.name.split(' ').slice(0, 3).join(' ')}
      </p>
    </motion.div>
  )
}
function CanvasOutput({ label }) {
  return (
    <div className="flex flex-col items-center flex-shrink-0" style={{ width: 120 }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm bg-emerald-50" style={{ border: '2px solid #BBF7D0' }}>
        <CheckCircle size={22} className="text-emerald-500" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest mt-1.5 mb-1 text-emerald-500">Output</p>
      <p className="text-xs text-center font-semibold text-[#1A2340] leading-tight px-1">{label}</p>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   WORKFLOW DETAIL MODAL
   ══════════════════════════════════════════════════════════════════════════════ */
function WorkflowDetailModal({ workflow, onClose, onViewAgent }) {
  const navigate = useNavigate()
  const deployWorkflow = useStore(s => s.deployWorkflow)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [deployed, setDeployed] = useState(false)
  const color  = segColors[workflow.segmentKey] || '#C8102E'
  const agents = workflow.agents || []

  const handleDeploy = () => {
    deployWorkflow(workflow)
    setDeployed(true)
    setTimeout(() => {
      onClose()
      navigate('/approval-centre')
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(10px)', background: 'rgba(10,18,40,0.72)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.93, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 24 }} transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: '92vw', maxWidth: 920, maxHeight: '90vh', boxShadow: '0 40px 100px rgba(0,0,0,0.45)' }}>
        {/* Header */}
        <div className="px-7 py-5 flex items-center justify-between flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1A2340 0%, #2D3A5C 100%)' }}>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}25`, border: `1.5px solid ${color}40` }}>
              <GitMerge size={21} style={{ color }} />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">{workflow.name}</p>
              <div className="flex items-center gap-3 mt-1">
                {workflow.status === 'incomplete' ? (
                  <span className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />Under Review
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />Approved
                  </span>
                )}
                <span className="text-white/40 text-xs">{agents.length} agents</span>
                <span className="text-white/40 text-xs">·</span>
                <span className="text-white/40 text-xs">{workflow.segment}</span>
                {workflow.authors?.length > 0 && (
                  <>
                    <span className="text-white/40 text-xs">·</span>
                    <span className="text-white/40 text-xs">{workflow.authors.join(', ')}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
            <X size={15} className="text-white" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 border-b border-[#E2E8F0] flex-shrink-0">
          {[
            { label: 'Tasks Today',  value: workflow.tasksPerDay?.toLocaleString(), color },
            { label: 'SLA',          value: `${workflow.sla}%`,   color: '#10B981' },
            { label: 'Last Run',     value: workflow.lastRun,     color: '#718096' },
            { label: 'Avg Duration', value: workflow.avgRunTime,  color: '#718096' },
          ].map((s, i) => (
            <div key={s.label} className={`px-6 py-3.5 ${i > 0 ? 'border-l border-[#E2E8F0]' : ''}`}>
              <p className="text-xs text-[#718096] mb-0.5">{s.label}</p>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Pipeline canvas */}
        <div className="flex-1 overflow-auto px-7 py-7" style={{ background: 'linear-gradient(135deg,#F7F9FF 0%,#EEF2FF 100%)' }}>
          <p className="text-xs font-bold uppercase tracking-widest text-[#9BA8BA] mb-6 flex items-center gap-1.5">
            <GitMerge size={11} /> Full Pipeline — click an agent node to inspect · jump to agent profile
          </p>
          <div className="flex items-start overflow-x-auto pb-6">
            <CanvasTrigger label={workflow.trigger} color={color} />
            <CanvasConnector color={color} />
            {agents.map((agent, i) => (
              <div key={agent.id} className="flex items-start">
                <CanvasAgentNode agent={agent} index={i} color={color}
                  isSelected={selectedAgent?.id === agent.id}
                  onClick={() => setSelectedAgent(a => a?.id === agent.id ? null : agent)} />
                {i < agents.length - 1 && <CanvasConnector color={color} />}
              </div>
            ))}
            <CanvasConnector color={color} />
            <CanvasOutput label={workflow.output} />
          </div>
          <AnimatePresence>
            {selectedAgent && (
              <motion.div key={selectedAgent.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.2 }}
                className="mt-2 rounded-2xl border-2 bg-white overflow-hidden" style={{ borderColor: color + '40' }}>
                <div className="h-1" style={{ background: color }} />
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                      <Bot size={19} style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-[#1A2340]">{selectedAgent.name}</p>
                      <p className="text-xs text-[#718096] mt-0.5">{selectedAgent.role}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: selectedAgent.status === 'full' ? '#D1FAE5' : '#FEF3C7', color: selectedAgent.status === 'full' ? '#065F46' : '#92400E' }}>
                      {selectedAgent.status === 'full' ? '✓ Active' : '⚠ Needs Work'}
                    </span>
                  </div>
                  <div className="flex items-end justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-2">Authorised Tools</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(selectedAgent.tools || []).map(t => (
                          <span key={t} className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#F0F4FF] border border-[#C7D2FE] text-[#4338CA]">{t}</span>
                        ))}
                      </div>
                    </div>
                    {/* Jump to individual agent card */}
                    {onViewAgent && (
                      <motion.button
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onViewAgent(selectedAgent.name)}
                        className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`, boxShadow: `0 4px 12px ${color}35` }}
                      >
                        View Agent Profile <ChevronRight size={12} />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-[#E2E8F0] flex items-center gap-3 flex-shrink-0 bg-white">
          <button onClick={handleDeploy} disabled={deployed}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: deployed ? '#10B981' : color, opacity: deployed ? 0.9 : 1 }}>
            {deployed ? <><CheckCircle size={13} /> Deployed!</> : <><Play size={13} /> Deploy to Production</>}
          </button>
          <button onClick={() => navigate('/builder')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#E2E8F0] text-[#4A5568] hover:bg-[#F7F8FA] transition-all">
            <Edit3 size={13} /> Edit Workflow
          </button>
          <button onClick={onClose} className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-[#718096] hover:text-[#4A5568] transition-all">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   AGENT DETAIL MODAL
   ══════════════════════════════════════════════════════════════════════════════ */
function AgentDetailModal({ agent, onClose }) {
  const color = segColors[agent.segmentKey] || '#718096'
  const Icon  = segIcons[agent.segmentKey] || Bot
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(10px)', background: 'rgba(10,18,40,0.72)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ width: '92vw', maxWidth: 560, maxHeight: '88vh', boxShadow: '0 40px 80px rgba(0,0,0,0.35)' }}>
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1A2340 0%, #2D3A5C 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${color}25` }}>
              <Bot size={19} style={{ color }} />
            </div>
            <div>
              <p className="text-white font-bold text-sm">{agent.name}</p>
              <p className="text-white/50 text-xs mt-0.5">{agent.segment}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
            <X size={14} className="text-white" />
          </button>
        </div>
        {/* Stats bar */}
        <div className="border-b border-[#E2E8F0] px-5 py-3.5">
          <p className="text-xs text-[#718096] mb-0.5">Used in</p>
          <p className="text-lg font-bold" style={{ color: '#718096' }}>{agent.usedIn} workflows</p>
        </div>
        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto" style={{ maxHeight: 'calc(88vh - 200px)' }}>
          <p className="text-sm text-[#4A5568]">{agent.description}</p>
          <div>
            <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-2.5">Category</p>
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${color}15`, color }}>{agent.category}</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-2.5">
              {agent.authors?.length > 1 ? 'Authors' : 'Author'}
            </p>
            <div className="flex flex-col gap-1.5">
              {(agent.authors?.length > 0 ? agent.authors : ['DLX AGENTIC OS Team']).map(a => (
                <div key={a} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F7F8FA] border border-[#E2E8F0]">
                  <Tag size={12} className="text-[#9BA8BA]" />
                  <span className="text-sm font-semibold text-[#1A2340]">{a}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-2.5">Authorised Tools</p>
            <div className="flex flex-wrap gap-1.5">
              {agent.tools.map(t => (
                <span key={t} className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#F0F4FF] border border-[#C7D2FE] text-[#4338CA]">{t}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-2.5">Status</p>
            {agent.status === 'active'
              ? <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />Approved</span>
              : <span className="flex items-center gap-1.5 text-sm text-amber-600 font-semibold"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Under Review</span>
            }
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   SECTION CARD COMPONENTS
   ══════════════════════════════════════════════════════════════════════════════ */

/* ── Workflow Card ── */
/* ── Use Case Tile (workflow, styled to match the Discover Hub tile grammar) ── */
function UseCaseTile({ wf, isHighlighted, onClick, onDeploy, onEvaluate }) {
  const color  = segColors[wf.segmentKey] || '#C8102E'
  const agents = wf.agents || []
  const toolCount = new Set(agents.flatMap(a => a.tools || [])).size
  const statusCfg = wf.status === 'rejected'
    ? { label: 'REJECTED', bg: 'bg-red-100', text: 'text-red-700' }
    : wf.status === 'incomplete'
      ? { label: 'UNDER REVIEW', bg: 'bg-amber-100', text: 'text-amber-700' }
      : { label: 'PRODUCTION', bg: 'bg-emerald-100', text: 'text-emerald-700' }

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }} onClick={onClick}
      className="rounded-2xl border bg-white overflow-hidden cursor-pointer hover:shadow-md transition-all flex flex-col"
      style={{ borderColor: isHighlighted ? color : '#E2E8F0', boxShadow: isHighlighted ? `0 0 0 3px ${color}25` : undefined }}>
      <div className="p-4 flex-1 flex flex-col">
        {/* Icon + status badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: color }}>
            <GitMerge size={19} className="text-white" />
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusCfg.bg} ${statusCfg.text}`}>{statusCfg.label}</span>
        </div>

        {/* Name + segment */}
        <p className="text-sm font-bold text-[#1A2340] leading-tight">{wf.name}</p>
        <span className="inline-block mt-1.5 mb-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1F5F9] text-[#64748B] w-fit">
          {wf.segment}
        </span>

        {/* Description */}
        <p className="text-xs text-[#718096] mb-3 line-clamp-2 leading-relaxed">{wf.description}</p>

        <div className="border-t border-[#F0F2F5] pt-3 mb-3">
          {/* 3-stat row */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <p className="text-sm font-bold text-emerald-600">{wf.sla != null ? `${wf.sla}%` : '—'}</p>
              <p className="text-[10px] text-[#9BA8BA] uppercase tracking-wide">SLA</p>
            </div>
            <div>
              <p className="text-sm font-bold text-[#1A2340]">{wf.avgRunTime || '—'}</p>
              <p className="text-[10px] text-[#9BA8BA] uppercase tracking-wide">Avg Run</p>
            </div>
            <div>
              <p className="text-sm font-bold text-[#1A2340]">{(wf.tasksPerDay || 0).toLocaleString()}</p>
              <p className="text-[10px] text-[#9BA8BA] uppercase tracking-wide">Daily</p>
            </div>
          </div>

          {/* Pipeline meta */}
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700"><Bot size={9} /> {agents.length} agents</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F1F5F9] text-[#64748B]"><Plug size={9} /> {toolCount} tools</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto">
          <button
            onClick={e => { e.stopPropagation(); onDeploy?.(wf) }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: color }}
          >
            <ArrowUpRight size={12} /> Deploy
          </button>
          {onEvaluate && (
            <button onClick={e => { e.stopPropagation(); onEvaluate() }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-[#C8102E] bg-white border border-[#C8102E] hover:bg-[#FDF0F2] transition-all"
              title="Evaluate">
              <Shield size={13} />
            </button>
          )}
          <button
            onClick={e => { e.stopPropagation(); onClick?.() }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#4A5568] bg-white border border-[#E2E8F0] hover:bg-[#F7F8FA] transition-all"
          >
            Details
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Individual Agent Card ── */
function AgentCard({ agent, onClick, onDeploy }) {
  const isApproved = agent.status === 'active' || agent.status === 'approved'
  const CatIcon = AGENT_CATEGORY_ICON[agent.category] || Bot
  const kya = estimateKYA(agent)

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}
      className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden cursor-pointer hover:border-[#CBD5E0] hover:shadow-md transition-all flex flex-col"
      onClick={onClick}>
      <div className="p-4 flex-1 flex flex-col">
        {/* Icon + status badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#1A2340' }}>
            <CatIcon size={19} className="text-white" />
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {isApproved ? 'PRODUCTION' : 'UNDER REVIEW'}
          </span>
        </div>

        {/* Name + category */}
        <p className="text-sm font-bold text-[#1A2340] leading-tight">{agent.name}</p>
        <span className="inline-block mt-1.5 mb-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1F5F9] text-[#64748B] w-fit">
          {agent.category}
        </span>

        {/* Description */}
        <p className="text-xs text-[#718096] mb-3 line-clamp-2 leading-relaxed">{agent.description}</p>

        <div className="border-t border-[#F0F2F5] pt-3 mb-3">
          {/* 3-stat row */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <p className="text-sm font-bold text-emerald-600">{agent.successRate}%</p>
              <p className="text-[10px] text-[#9BA8BA] uppercase tracking-wide">Accuracy</p>
            </div>
            <div>
              <p className="text-sm font-bold text-[#1A2340]">{estimateAvgTime(agent)}</p>
              <p className="text-[10px] text-[#9BA8BA] uppercase tracking-wide">Avg Time</p>
            </div>
            <div>
              <p className="text-sm font-bold text-[#1A2340]">{(agent.tasksToday || 0).toLocaleString()}</p>
              <p className="text-[10px] text-[#9BA8BA] uppercase tracking-wide">Daily</p>
            </div>
          </div>

          {/* KYA + Certified */}
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[10px] text-[#9BA8BA] font-semibold mr-0.5">KYA:</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              kya >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>{kya} Score</span>
            {isApproved
              ? <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700"><CheckCircle size={9} /> Certified</span>
              : <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F1F5F9] text-[#94A3B8]">Pending Certification</span>}
          </div>

          {/* Access via */}
          <p className="text-[10px] text-[#9BA8BA] font-semibold mb-1.5">Access via:</p>
          <div className="flex flex-wrap gap-1">
            {ACCESS_CHANNELS.map(ch => (
              <span key={ch.label} className="px-2 py-0.5 rounded-md text-[10px] font-semibold" style={{ background: ch.bg, color: ch.text }}>{ch.label}</span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto">
          <button
            onClick={e => { e.stopPropagation(); onDeploy?.(agent) }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: '#1A2340' }}
          >
            <ArrowUpRight size={12} /> Deploy
          </button>
          <button
            onClick={e => { e.stopPropagation(); onClick?.() }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#4A5568] bg-white border border-[#E2E8F0] hover:bg-[#F7F8FA] transition-all"
          >
            Details
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Compact list row (Agents list view) ── */
function AgentListRow({ agent, onClick, onDeploy }) {
  const isApproved = agent.status === 'active' || agent.status === 'approved'
  const CatIcon = AGENT_CATEGORY_ICON[agent.category] || Bot
  const kya = estimateKYA(agent)
  return (
    <div onClick={onClick}
      className="flex items-center gap-4 px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#CBD5E0] hover:shadow-sm transition-all cursor-pointer">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#1A2340' }}>
        <CatIcon size={16} className="text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-[#1A2340] truncate">{agent.name}</p>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {isApproved ? 'PRODUCTION' : 'UNDER REVIEW'}
          </span>
        </div>
        <p className="text-xs text-[#9BA8BA] truncate">{agent.category} &middot; {agent.description}</p>
      </div>
      <div className="hidden md:flex items-center gap-5 flex-shrink-0">
        <div className="text-center w-14"><p className="text-sm font-bold text-emerald-600">{agent.successRate}%</p><p className="text-[9px] text-[#9BA8BA] uppercase">Accuracy</p></div>
        <div className="text-center w-14"><p className="text-sm font-bold text-[#1A2340]">{estimateAvgTime(agent)}</p><p className="text-[9px] text-[#9BA8BA] uppercase">Avg Time</p></div>
        <div className="text-center w-16"><p className="text-sm font-bold text-[#1A2340]">{(agent.tasksToday || 0).toLocaleString()}</p><p className="text-[9px] text-[#9BA8BA] uppercase">Daily</p></div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${kya >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{kya} KYA</span>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onDeploy?.(agent) }}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0 hover:opacity-90 transition-all"
        style={{ background: '#1A2340' }}
      >
        <ArrowUpRight size={12} /> Deploy
      </button>
    </div>
  )
}

/* ── Tool Detail Modal ── */
function ToolDetailModal({ tool, onClose }) {
  const Icon = tool.icon
  const catColors = {
    Connector:     { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
    MCP:           { bg: '#F5F3FF', border: '#DDD6FE', text: '#6D28D9' },
    Data:          { bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46' },
    'AI/ML':       { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
    'Third-Party': { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
  }
  const catStyle = catColors[tool.category] || catColors.Connector
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(10px)', background: 'rgba(10,18,40,0.72)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ width: '92vw', maxWidth: 520, maxHeight: '88vh', boxShadow: '0 40px 80px rgba(0,0,0,0.35)' }}>
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1A2340 0%, #2D3A5C 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${tool.color}25` }}>
              <Icon size={19} style={{ color: tool.color }} />
            </div>
            <div>
              <p className="text-white font-bold text-sm font-mono">{tool.name}</p>
              <p className="text-white/50 text-xs mt-0.5">{tool.provider} · {tool.type}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
            <X size={14} className="text-white" />
          </button>
        </div>
        {/* Stats bar */}
        <div className="grid grid-cols-3 border-b border-[#E2E8F0]">
          {[
            { label: 'Status',    value: tool.status === 'connected' ? 'Connected' : 'Warning', c: tool.status === 'connected' ? '#10B981' : '#F59E0B' },
            { label: 'Used by',   value: `${tool.usedBy} agents`, c: tool.color },
            { label: 'Category',  value: tool.category, c: '#718096' },
          ].map((s, i) => (
            <div key={s.label} className={`px-5 py-3.5 ${i > 0 ? 'border-l border-[#E2E8F0]' : ''}`}>
              <p className="text-xs text-[#718096] mb-0.5">{s.label}</p>
              <p className="text-sm font-bold" style={{ color: s.c }}>{s.value}</p>
            </div>
          ))}
        </div>
        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto" style={{ maxHeight: 'calc(88vh - 220px)' }}>
          <p className="text-sm text-[#4A5568] leading-relaxed">{tool.description}</p>
          <div>
            <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-2.5">Type</p>
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${tool.color}15`, color: tool.color }}>{tool.type}</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-2.5">Category</p>
            <span className="px-3 py-1 rounded-full text-xs font-bold border" style={catStyle}>{tool.category}</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-2.5">Provider</p>
            <span className="text-sm font-semibold text-[#1A2340]">{tool.provider}</span>
          </div>
          {tool.authors?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-2.5">
                {tool.authors.length > 1 ? 'Authors' : 'Author'}
              </p>
              <div className="flex flex-col gap-1.5">
                {tool.authors.map(a => (
                  <div key={a} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F7F8FA] border border-[#E2E8F0]">
                    <Tag size={12} className="text-[#9BA8BA]" />
                    <span className="text-sm font-semibold text-[#1A2340]">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="pt-1">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: tool.status === 'connected' ? '#F0FDF4' : '#FFFBEB', border: `1px solid ${tool.status === 'connected' ? '#BBF7D0' : '#FDE68A'}` }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tool.status === 'connected' ? '#22C55E' : '#F59E0B' }} />
              <span className="text-xs font-semibold" style={{ color: tool.status === 'connected' ? '#16A34A' : '#D97706' }}>
                {tool.status === 'connected' ? 'Integration active — all agents can use this tool' : 'Warning — check credentials or connection'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Tool / MCP Card ── */
function ToolCard({ tool, onClick }) {
  const Icon = tool.icon
  const catColors = {
    Connector:     { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
    MCP:           { bg: '#F5F3FF', border: '#DDD6FE', text: '#6D28D9' },
    Data:          { bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46' },
    'AI/ML':       { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
    'Third-Party': { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
  }
  const catStyle = catColors[tool.category] || catColors.Connector
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}
      onClick={onClick} className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden hover:border-[#CBD5E0] hover:shadow-md transition-all cursor-pointer">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${tool.color}15` }}>
              <Icon size={16} style={{ color: tool.color }} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1A2340] font-mono">{tool.name}</p>
              <p className="text-[10px] text-[#718096]">{tool.provider} · {tool.type}</p>
            </div>
          </div>
          {tool.status === 'connected'
            ? <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />Connected
              </span>
            : <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />Warning
              </span>
          }
        </div>
        <p className="text-xs text-[#718096] mb-2 line-clamp-2 leading-relaxed">{tool.description}</p>
        {tool.authors?.length > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Tag size={9} className="text-[#9BA8BA] flex-shrink-0" />
            <span className="text-[10px] text-[#9BA8BA] truncate">{tool.authors.join(', ')}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold border" style={catStyle}>{tool.category}</span>
          <span className="text-[10px] text-[#9BA8BA] flex items-center gap-1"><Link2 size={9} />{tool.usedBy} agents</span>
        </div>
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   DASHBOARD DATA — author artifact counts
   ══════════════════════════════════════════════════════════════════════════════ */

const ALL_AUTHORS = [
  'Satishkumar Balasubramanian',
  'Ashish Agarwal',
  'Vadivel Mohanakrishnan',
  'Swetha Surendran',
  'Thilak Balakrishnan',
  'Shubham Singh',
]

function buildAuthorStats() {
  const stats = {}
  ALL_AUTHORS.forEach(a => { stats[a] = { agents: [], tools: [], workflows: [] } })

  INDIVIDUAL_AGENTS.forEach(item => {
    (item.authors || []).forEach(a => { if (stats[a]) stats[a].agents.push(item) })
  })
  TOOLS_MCP.forEach(item => {
    (item.authors || []).forEach(a => { if (stats[a]) stats[a].tools.push(item) })
  })
  ALL_WORKFLOWS.forEach(item => {
    (item.authors || []).forEach(a => { if (stats[a]) stats[a].workflows.push(item) })
  })

  return ALL_AUTHORS.map(name => ({
    name,
    agents:    stats[name].agents,
    tools:     stats[name].tools,
    workflows: stats[name].workflows,
    total:     stats[name].agents.length + stats[name].tools.length + stats[name].workflows.length,
  }))
}

const AUTHOR_STATS = buildAuthorStats()

/* ── Security high-risk tool patterns ── */
const HIGH_RISK_TOOLS  = ['gl-write','hold-trigger','sanctions-check','aml-screen','erp-write','crm-write','snowflake-write']
const MED_RISK_TOOLS   = ['kyb-api','kyc-verify','fraud-signals','audit-log','payment-match','exception-flag','compliance-alert']

function assessSecurity(agents) {
  return agents.map(agent => {
    const tools = agent.tools || []
    const highRisk = tools.filter(t => HIGH_RISK_TOOLS.some(h => t.includes(h) || h.includes(t)))
    const medRisk  = tools.filter(t => MED_RISK_TOOLS.some(h => t.includes(h)  || h.includes(t)))
    let score, color, label, reasoning

    if (highRisk.length >= 2) {
      score = 'red'; color = '#EF4444'; label = 'High Risk'
      reasoning = `Contains ${highRisk.length} high-risk tools (${highRisk.slice(0,2).join(', ')}). Requires CISO sign-off before production deployment.`
    } else if (highRisk.length === 1 || medRisk.length >= 2) {
      score = 'yellow'; color = '#F59E0B'; label = 'Medium Risk'
      reasoning = `Contains ${highRisk.length + medRisk.length} sensitive tool(s). Review data-write permissions and audit trail coverage.`
    } else {
      score = 'green'; color = '#10B981'; label = 'Low Risk'
      reasoning = 'No high-risk tools detected. Agent follows least-privilege principle with read-only or low-impact operations.'
    }
    return { ...agent, secScore: score, secColor: color, secLabel: label, secReasoning: reasoning, highRisk, medRisk }
  })
}

/* ── Evaluate Workflow Modal ── */
function EvaluateModal({ workflow, allAgents, onClose, onFixWithAI }) {
  const navigate       = useNavigate()
  const deployWorkflow = useStore(s => s.deployWorkflow)
  const [step, setStep]           = useState('loading') // loading | results | fixing | fixed
  const [fixedWorkflow, setFixedWorkflow] = useState(null)
  const [fixSummary,    setFixSummary]    = useState([])
  const color = segColors[workflow.segmentKey] || '#C8102E'
  const agents = workflow.agents || []

  const agentSecReport  = assessSecurity(agents)
  const existingNames   = new Set(allAgents.map(a => a.name.toLowerCase()))
  const duplicates      = agents.filter(a => existingNames.has((a.name || '').toLowerCase()))
  const redCount        = agentSecReport.filter(a => a.secScore === 'red').length
  const yellowCount     = agentSecReport.filter(a => a.secScore === 'yellow').length
  const greenCount      = agentSecReport.filter(a => a.secScore === 'green').length

  useEffect(() => {
    const t = setTimeout(() => setStep('results'), 1200)
    return () => clearTimeout(t)
  }, [])

  const handleFix = () => {
    setStep('fixing')
    setTimeout(() => {
      const summary = []
      const fixedAgents = agentSecReport.map(a => {
        const removed = a.tools.filter(t => HIGH_RISK_TOOLS.some(h => t.includes(h) || h.includes(t)))
        if (removed.length > 0) {
          summary.push({ agent: a.name, removed })
        }
        return {
          ...a,
          tools: a.tools.filter(t => !HIGH_RISK_TOOLS.some(h => t.includes(h) || h.includes(t))),
          secScore: 'green', secColor: '#10B981', secLabel: 'Low Risk',
          secReasoning: 'High-risk tools removed by AI. Agent now operates with least-privilege principle.',
        }
      })
      const fixed = { ...workflow, agents: fixedAgents, secFixed: true, fixedAt: new Date().toLocaleString() }
      setFixSummary(summary)
      setFixedWorkflow(fixed)
      setStep('fixed')
      onFixWithAI(fixed)
    }, 2200)
  }

  const scoreColor = s => s === 'red' ? '#EF4444' : s === 'yellow' ? '#F59E0B' : '#10B981'
  const scoreBg    = s => s === 'red' ? '#FEF2F2' : s === 'yellow' ? '#FFFBEB' : '#F0FDF4'
  const scoreBorder= s => s === 'red' ? '#FECACA' : s === 'yellow' ? '#FDE68A' : '#BBF7D0'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(10px)', background: 'rgba(10,18,40,0.75)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.93, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93 }} transition={{ duration: 0.25 }}
        className="bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: '92vw', maxWidth: 860, maxHeight: '90vh' }}>
        {/* Header */}
        <div className="px-7 py-5 flex items-center justify-between flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#1A2340,#2D3A5C)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}25` }}>
              <Shield size={20} style={{ color }} />
            </div>
            <div>
              <p className="text-white font-bold">Workflow Evaluation</p>
              <p className="text-white/50 text-xs">{workflow.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
            <X size={14} className="text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5">
          {/* Loading state */}
          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader size={28} className="animate-spin text-[#C8102E]" />
              <p className="text-sm font-semibold text-[#1A2340]">Running evaluation…</p>
              <p className="text-xs text-[#718096]">Checking agents, tools, and security posture</p>
            </div>
          )}

          {(step === 'results' || step === 'fixing' || step === 'fixed') && (
            <>
              {/* 4.1 Duplicate check */}
              <div className="rounded-2xl border border-[#E2E8F0] overflow-hidden">
                <div className="px-5 py-3 flex items-center gap-2.5 border-b border-[#E2E8F0]" style={{ background: '#F7F8FA' }}>
                  <Users size={15} className="text-[#0EA5E9]" />
                  <p className="font-bold text-sm text-[#1A2340]">Duplicate Agent Check</p>
                  <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: duplicates.length > 0 ? '#FEF3C7' : '#D1FAE5', color: duplicates.length > 0 ? '#92400E' : '#065F46' }}>
                    {duplicates.length} duplicate{duplicates.length !== 1 ? 's' : ''} found
                  </span>
                </div>
                <div className="px-5 py-3">
                  {duplicates.length === 0 ? (
                    <p className="text-xs text-emerald-600 flex items-center gap-1.5"><CheckCircle size={13} /> All agents are unique — no duplicates found in Discover Hub.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {duplicates.map(d => (
                        <div key={d.id || d.name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
                          <AlertTriangle size={12} className="text-amber-600 flex-shrink-0" />
                          <span className="text-xs font-semibold text-amber-800">{d.name}</span>
                          <span className="text-xs text-amber-600 ml-auto">Already in Discover Hub</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 4.2 Security report */}
              <div className="rounded-2xl border border-[#E2E8F0] overflow-hidden">
                <div className="px-5 py-3 flex items-center gap-2.5 border-b border-[#E2E8F0]" style={{ background: '#F7F8FA' }}>
                  <Shield size={15} className="text-[#8B5CF6]" />
                  <p className="font-bold text-sm text-[#1A2340]">Security Report</p>
                  <div className="ml-auto flex items-center gap-2">
                    {redCount > 0    && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">{redCount} High</span>}
                    {yellowCount > 0 && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">{yellowCount} Medium</span>}
                    {greenCount > 0  && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">{greenCount} Low</span>}
                  </div>
                </div>
                <div className="px-5 py-3 space-y-3">
                  {agentSecReport.map((a, i) => (
                    <div key={i} className="rounded-xl border p-3" style={{ background: scoreBg(a.secScore), borderColor: scoreBorder(a.secScore) }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: scoreColor(a.secScore) + '20' }}>
                          <Bot size={13} style={{ color: scoreColor(a.secScore) }} />
                        </div>
                        <p className="font-semibold text-sm text-[#1A2340] flex-1">{a.name}</p>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: scoreColor(a.secScore) + '20', color: scoreColor(a.secScore) }}>
                          ● {a.secLabel}
                        </span>
                      </div>
                      <p className="text-xs text-[#4A5568] leading-relaxed">{a.secReasoning}</p>
                      {a.highRisk.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {a.highRisk.map(t => <span key={t} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-100 border border-red-200 text-red-700">{t}</span>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Fixed workflow */}
          {step === 'fixed' && fixedWorkflow && (
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={18} className="text-emerald-600" />
                <p className="font-bold text-emerald-800">Workflow updated — new version generated</p>
              </div>
              {fixSummary.length > 0 ? (
                <div className="space-y-2 mb-3">
                  {fixSummary.map(({ agent, removed }) => (
                    <div key={agent} className="px-3 py-2 rounded-xl bg-white border border-emerald-200">
                      <p className="text-xs font-bold text-emerald-800 mb-1">{agent}</p>
                      <p className="text-xs text-emerald-700">
                        Removed <span className="font-semibold">{removed.join(', ')}</span> — replaced with read-only equivalents
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-700 mb-3">No high-risk tools were found. Workflow is already compliant.</p>
              )}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-emerald-200">
                {fixedWorkflow.agents.map(a => (
                  <span key={a.name} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white border border-emerald-300 text-emerald-800 font-semibold">
                    <CheckCircle size={10} /> {a.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'results' && (redCount > 0 || yellowCount > 0) && (
          <div className="px-7 py-4 border-t border-[#E2E8F0] flex-shrink-0 bg-white">
            <button onClick={handleFix}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#C8102E,#a50e26)', boxShadow: '0 4px 14px rgba(200,16,46,0.3)' }}>
              <Zap size={14} /> Fix Vulnerabilities with AI
            </button>
          </div>
        )}
        {step === 'fixing' && (
          <div className="px-7 py-4 border-t border-[#E2E8F0] flex-shrink-0 bg-white flex items-center gap-3">
            <Loader size={16} className="animate-spin text-[#C8102E]" />
            <span className="text-sm font-semibold text-[#1A2340]">AI is fixing vulnerabilities…</span>
          </div>
        )}
        {step === 'results' && redCount === 0 && yellowCount === 0 && (
          <div className="px-7 py-4 border-t border-[#E2E8F0] flex-shrink-0 bg-white">
            <button onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#E2E8F0] text-[#4A5568] hover:bg-[#F7F8FA] transition-all cursor-pointer">
              Close
            </button>
          </div>
        )}
        {step === 'fixed' && (
          <div className="px-7 py-4 border-t border-[#E2E8F0] flex-shrink-0 bg-white flex items-center gap-3">
            <button onClick={() => { deployWorkflow(fixedWorkflow); onClose(); navigate('/approval-centre') }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 cursor-pointer"
              style={{ background: '#10B981' }}>
              <Play size={13} /> Deploy to Production
            </button>
            <button onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#E2E8F0] text-[#4A5568] hover:bg-[#F7F8FA] transition-all cursor-pointer">
              Close
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

/* ── Bring Your Existing Flows — upload a spec, review/edit what was fetched,
   watch it get scanned, then land in the Under Review queue ── */
const FLOW_SCAN_STEPS = [
  'Parsing specification file',
  'Matching agents against the catalog',
  'Validating tool permissions',
  'Running compliance guardrail checks',
]

function parseFlowSpecFile(rawText, fileName) {
  try {
    const raw = JSON.parse(rawText)
    const w = (raw.workflow && typeof raw.workflow === 'object')
      ? { ...raw.workflow, agents: raw.agents || raw.workflow.agents || [] }
      : raw
    const agents = (w.agents || w.chain || []).map((a, ai) => ({
      name: a.name || a.agent_name || `Agent ${ai + 1}`,
      role: a.role || a.description || '',
    }))
    return {
      name:        w.name || w.workflow_name || fileName.replace(/\.[^.]+$/, ''),
      description: w.description || w.summary || '',
      segmentKey:  w.segment_key || w.segmentKey || 'platform',
      agents,
      tools:       [...new Set((w.agents || w.chain || []).flatMap(a => a.tools || []))],
    }
  } catch {
    // Not a recognisable JSON spec — still let the user proceed with an empty, editable draft
    return { name: fileName.replace(/\.[^.]+$/, ''), description: '', segmentKey: 'platform', agents: [], tools: [] }
  }
}

function BringFlowModal({ onClose, onSubmitted }) {
  const [stage, setStage]     = useState('upload')   // upload | review | scanning | done
  const [fileName, setFileName] = useState('')
  const [draft, setDraft]     = useState(null)
  const [scanStep, setScanStep] = useState(0)
  const fileRef = useRef(null)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setDraft(parseFlowSpecFile(String(ev.target.result), file.name))
      setStage('review')
    }
    reader.readAsText(file)
  }

  useEffect(() => {
    if (stage !== 'scanning') return
    setScanStep(0)
    const timers = FLOW_SCAN_STEPS.map((_, i) => setTimeout(() => setScanStep(i + 1), (i + 1) * 650))
    const finish = setTimeout(() => setStage('done'), FLOW_SCAN_STEPS.length * 650 + 500)
    return () => { timers.forEach(clearTimeout); clearTimeout(finish) }
  }, [stage])

  const updateDraft  = (patch) => setDraft(prev => ({ ...prev, ...patch }))
  const updateAgent  = (i, patch) => setDraft(prev => ({ ...prev, agents: prev.agents.map((a, ai) => ai === i ? { ...a, ...patch } : a) }))
  const removeAgent  = (i) => setDraft(prev => ({ ...prev, agents: prev.agents.filter((_, ai) => ai !== i) }))
  const addAgentRow  = () => setDraft(prev => ({ ...prev, agents: [...prev.agents, { name: '', role: '' }] }))
  const removeTool   = (t) => setDraft(prev => ({ ...prev, tools: prev.tools.filter(x => x !== t) }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(10px)', background: 'rgba(10,18,40,0.72)' }}
      onClick={e => e.target === e.currentTarget && stage !== 'scanning' && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.93, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 24 }} transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: '92vw', maxWidth: 640, maxHeight: '90vh', boxShadow: '0 40px 100px rgba(0,0,0,0.45)' }}>

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1A2340 0%, #2D3A5C 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Upload size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">Bring your existing flows</p>
              <p className="text-white/50 text-xs mt-0.5">
                {stage === 'upload'    && 'Upload a workflow spec to bring it into Discover Hub'}
                {stage === 'review'    && 'Confirm what we found — edit anything before scanning'}
                {stage === 'scanning'  && 'Scanning against the live catalog…'}
                {stage === 'done'      && 'Ready for compliance review'}
              </p>
            </div>
          </div>
          {stage !== 'scanning' && (
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all flex-shrink-0">
              <X size={15} className="text-white" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* ── Stage 1: Upload ── */}
          {stage === 'upload' && (
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-[#F7F8FA] border-2 border-dashed border-[#CBD5E0] flex items-center justify-center mb-4">
                <Upload size={24} className="text-[#9BA8BA]" />
              </div>
              <p className="text-sm font-semibold text-[#1A2340]">Upload your workflow specification</p>
              <p className="text-xs text-[#9BA8BA] mt-1.5 max-w-xs">A JSON export from your existing automation tooling — we'll fetch the name, agents and tools so you can confirm them.</p>
              <button onClick={() => fileRef.current?.click()}
                className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: '#C8102E' }}>
                <Upload size={14} /> Choose Spec File
              </button>
              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFile} />
            </div>
          )}

          {/* ── Stage 2: Review / edit fetched info ── */}
          {stage === 'review' && draft && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
                <CheckCircle size={13} className="text-emerald-600 flex-shrink-0" />
                <p className="text-xs text-emerald-700"><strong>{fileName}</strong> parsed — review the fetched details below.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#718096] mb-1.5 block">Workflow Name</label>
                <input value={draft.name} onChange={e => updateDraft({ name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#C8102E]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#718096] mb-1.5 block">Description</label>
                <textarea value={draft.description} onChange={e => updateDraft({ description: e.target.value })}
                  rows={2} placeholder="What does this workflow do?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm resize-none focus:outline-none focus:border-[#C8102E]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#718096] mb-1.5 block">Segment</label>
                <select value={draft.segmentKey} onChange={e => updateDraft({ segmentKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm bg-white focus:outline-none focus:border-[#C8102E]">
                  {SEGMENTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#718096]">Agents Detected ({draft.agents.length})</label>
                  <button onClick={addAgentRow} className="text-xs font-semibold text-[#C8102E] hover:underline">+ Add agent</button>
                </div>
                <div className="flex flex-col gap-2">
                  {draft.agents.length === 0 && (
                    <p className="text-xs text-[#9BA8BA] px-3.5 py-3 rounded-xl bg-[#F7F8FA]">No agents detected in the spec — add them manually or continue without.</p>
                  )}
                  {draft.agents.map((a, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input value={a.name} onChange={e => updateAgent(i, { name: e.target.value })} placeholder="Agent name"
                        className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-[#E2E8F0] text-xs font-semibold focus:outline-none focus:border-[#C8102E]" />
                      <input value={a.role} onChange={e => updateAgent(i, { role: e.target.value })} placeholder="Role / description"
                        className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-[#E2E8F0] text-xs text-[#718096] focus:outline-none focus:border-[#C8102E]" />
                      <button onClick={() => removeAgent(i)} className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 flex-shrink-0 transition-all">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {draft.tools.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-[#718096] mb-1.5 block">Tools Detected ({draft.tools.length})</label>
                  <div className="flex flex-wrap gap-1.5">
                    {draft.tools.map(t => (
                      <span key={t} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono bg-[#F1F5F9] text-[#475569]">
                        {t}
                        <button onClick={() => removeTool(t)} className="hover:text-red-500"><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Stage 3: Scanning ── */}
          {stage === 'scanning' && (
            <div className="flex flex-col gap-3 py-6">
              {FLOW_SCAN_STEPS.map((label, i) => {
                const done = scanStep > i
                const active = scanStep === i
                return (
                  <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: done ? '#F0FDF4' : active ? '#EFF6FF' : '#F7F8FA' }}>
                    {done
                      ? <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                      : active
                        ? <Loader size={16} className="text-[#1D4ED8] animate-spin flex-shrink-0" />
                        : <div className="w-4 h-4 rounded-full border-2 border-[#E2E8F0] flex-shrink-0" />}
                    <span className={`text-sm ${done ? 'text-emerald-700 font-medium' : active ? 'text-[#1D4ED8] font-semibold' : 'text-[#9BA8BA]'}`}>{label}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Stage 4: Done ── */}
          {stage === 'done' && draft && (
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
                <AlertCircle size={26} className="text-amber-500" />
              </div>
              <p className="text-base font-bold text-[#1A2340]">"{draft.name}" is now Under Review</p>
              <p className="text-xs text-[#718096] mt-1.5 max-w-xs">Scan complete — it's been added to Discover Hub's workflow list, flagged Under Review until compliance signs off in Approval Centre.</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {stage === 'review' && (
          <div className="px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-between flex-shrink-0">
            <button onClick={onClose} className="text-xs font-semibold text-[#9BA8BA] hover:text-[#4A5568]">Cancel</button>
            <button onClick={() => setStage('scanning')} disabled={!draft.name.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 hover:opacity-90"
              style={{ background: '#1A2340' }}>
              <Zap size={14} /> Run Scan
            </button>
          </div>
        )}
        {stage === 'done' && (
          <div className="px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-end flex-shrink-0">
            <button onClick={() => onSubmitted(draft)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: '#1A2340' }}>
              View in Discover Hub
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

/* ── Author Dashboard Tab ── */
function AuthorDashboard({ allAgents, allWorkflows, allTools }) {
  const [selected, setSelected] = useState(null)

  const authorStats = ALL_AUTHORS.map(name => {
    const myAgents    = allAgents.filter(a    => (a.authors || []).includes(name))
    const myTools     = allTools.filter(t     => (t.authors || []).includes(name))
    const myWorkflows = allWorkflows.filter(w => (w.authors || []).includes(name))
    return {
      name,
      agents: myAgents, tools: myTools, workflows: myWorkflows,
      total:  myAgents.length + myTools.length + myWorkflows.length,
      approvedAgents:   myAgents.filter(a => a.status === 'active' || a.status === 'approved').length,
      underReviewAgents:myAgents.filter(a => a.status === 'under-review').length,
    }
  })

  const sel = selected ? authorStats.find(a => a.name === selected) : null
  const avatarColor = (name) => {
    const colors = ['#C8102E','#0EA5E9','#10B981','#8B5CF6','#F59E0B','#EC4899']
    return colors[ALL_AUTHORS.indexOf(name) % colors.length]
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {authorStats.map(a => (
          <motion.div key={a.name} whileHover={{ y: -2 }} transition={{ duration: 0.15 }}
            className="rounded-2xl border-2 bg-white overflow-hidden cursor-pointer transition-all"
            style={{ borderColor: selected === a.name ? avatarColor(a.name) : '#E2E8F0', boxShadow: selected === a.name ? `0 0 0 3px ${avatarColor(a.name)}25` : undefined }}
            onClick={() => setSelected(s => s === a.name ? null : a.name)}>
            <div className="h-1.5" style={{ background: avatarColor(a.name) }} />
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: avatarColor(a.name) }}>
                  {a.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#1A2340] leading-tight truncate">{a.name}</p>
                  <p className="text-xs text-[#718096]">{a.total} artifacts</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[['Agents', a.agents.length, '#0EA5E9'], ['Tools', a.tools.length, '#8B5CF6'], ['Workflows', a.workflows.length, '#C8102E']].map(([lbl, cnt, col]) => (
                  <div key={lbl} className="px-1 py-2 rounded-xl" style={{ background: col + '10' }}>
                    <p className="text-lg font-black" style={{ color: col }}>{cnt}</p>
                    <p className="text-[9px] font-semibold text-[#9BA8BA] uppercase tracking-wide">{lbl}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected author detail */}
      <AnimatePresence>
        {sel && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
            className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: avatarColor(sel.name) + '40' }}>
            <div className="px-6 py-4 flex items-center gap-3" style={{ background: 'linear-gradient(135deg,#1A2340,#2D3A5C)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: avatarColor(sel.name) }}>
                {sel.name.split(' ').map(n => n[0]).join('').slice(0,2)}
              </div>
              <div>
                <p className="text-white font-bold">{sel.name}</p>
                <p className="text-white/50 text-xs">{sel.total} total artifacts</p>
              </div>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4 bg-white">
              <div>
                <p className="text-xs font-bold text-[#718096] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Bot size={12} /> Agents ({sel.agents.length})
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                    <span className="text-xs text-emerald-700 font-semibold">Approved</span>
                    <span className="text-sm font-black text-emerald-700">{sel.approvedAgents}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
                    <span className="text-xs text-amber-700 font-semibold">Under Review</span>
                    <span className="text-sm font-black text-amber-700">{sel.underReviewAgents}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-[#718096] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Plug size={12} /> Tools & Workflows
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE]">
                    <span className="text-xs text-violet-700 font-semibold">Tools</span>
                    <span className="text-sm font-black text-violet-700">{sel.tools.length}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA]">
                    <span className="text-xs text-[#C8102E] font-semibold">Workflows</span>
                    <span className="text-sm font-black text-[#C8102E]">{sel.workflows.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════════════════ */
export default function AgentPool() {
  const navigate    = useNavigate()
  const location    = useLocation()
  const storeBuilt        = useStore(s => s.builtAgents)
  const pendingWorkflows  = useStore(s => s.pendingWorkflows) || []
  const platformApprovals = useStore(s => s.platformApprovals) || {}
  const addToast          = useStore(s => s.addToast)
  const deployWorkflow    = useStore(s => s.deployWorkflow)
  const [tab,            setTab]            = useState('workflows')
  const [statusFilter,   setStatusFilter]   = useState('all')
  const [wfStatusFilter, setWfStatusFilter] = useState('all')
  const [toolStatusFilter, setToolStatusFilter] = useState('all')
  const [wfSearch,  setWfSearch]  = useState('')
  const [agSearch,  setAgSearch]  = useState('')
  const [toolSearch,setToolSearch]= useState('')
  const [toolCat,   setToolCat]   = useState('All')
  const [toolTile,  setToolTile]  = useState('connectors')  // 'connectors' | 'ai' | 'mcp'
  const [agentView, setAgentView] = useState('grid')        // 'grid' | 'list'
  const [detailWf,   setDetailWf]   = useState(null)
  const [detailAg,   setDetailAg]   = useState(null)
  const [detailTool, setDetailTool] = useState(null)
  const [importedWorkflows, setImportedWorkflows] = useState([])
  const [evaluateWf, setEvaluateWf] = useState(null)
  const [flowModalOpen, setFlowModalOpen] = useState(false)

  const TOOL_TILE_GROUPS = {
    connectors: { label: 'Connectors',  categories: ['Connector', 'Third-Party', 'Data'], color: '#10B981' },
    ai:         { label: 'AI Tools',    categories: ['AI/ML'],                            color: '#8B5CF6' },
    mcp:        { label: 'MCP Servers', categories: ['MCP'],                              color: '#7C3AED' },
  }

  const handleDeployAgent = (agent) => {
    addToast({ type: 'success', title: 'Agent deployed', message: `${agent.name} is now live and processing tasks.` })
  }

  const handleDeployWorkflow = (wf) => {
    deployWorkflow(wf)
    addToast({ type: 'success', title: 'Workflow submitted', message: `${wf.name} is pending approval — visible in Approval Centre.` })
  }

  const highlightId    = location.state?.highlightId    || null
  const highlightAgent = location.state?.highlightAgent || null
  const contentRef     = useRef(null)

  /* Merge built agents (newest first) with the static catalog — must be before effects */
  const allAgents = [
    ...storeBuilt.map(a => ({
      id:          a.id,
      name:        a.name,
      segmentKey:  a.segmentKey || 'platform',
      segment:     a.segment    || 'Platform',
      status:      a.status === 'running' ? 'active' : (a.status || 'active'),
      category:    a.category   || 'Custom',
      usedIn:      a.deployments || 0,
      successRate: a.successRate ?? 100,
      tasksToday:  a.tasksToday  || 0,
      tools:       a.tools || a.capabilities || [],
      description: a.description || '',
      isCustom:    true,
    })).reverse(),
    ...INDIVIDUAL_AGENTS
      .filter(a => platformApprovals[a.id] !== 'rejected')
      .map(a => ({
        ...a,
        status: platformApprovals[a.id] === 'approved' ? 'active'
               : a.status,
      })),
  ]

  useEffect(() => {
    if (highlightId) {
      const wf = ALL_WORKFLOWS.find(w => w.id === highlightId)
      if (wf) { setTab('workflows'); setDetailWf(wf) }
    }
  }, [highlightId])

  useEffect(() => {
    if (highlightAgent) {
      const agent = allAgents.find(a => a.name === highlightAgent)
      if (agent) { setTab('agents'); setDetailAg(agent) }
    }
  }, [highlightAgent])

  /* Reset search + filters when tab (or tool tile group) changes */
  useEffect(() => {
    setWfSearch(''); setAgSearch(''); setToolSearch(''); setToolCat('All')
    setWfStatusFilter('all'); setStatusFilter('all'); setToolStatusFilter('all')
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [tab, toolTile])


  /* Merge imported + pending + static workflows */
  const allDisplayWorkflows = [
    ...importedWorkflows,
    ...pendingWorkflows.map(wf => ({
      id:          wf.id,
      name:        wf.name,
      description: wf.summary || '',
      segmentKey:  'platform',
      segment:     'User Submitted',
      status:      wf.status === 'approved' ? 'live' : wf.status === 'rejected' ? 'rejected' : 'incomplete',
      agentCount:  wf.agentCount || (wf.chain || []).length || 1,
      sla:         null,
      tasksPerDay: 0,
      lastRun:     'Not yet deployed',
      avgRunTime:  '—',
      trigger:     'From Imagination Studio',
      output:      wf.status === 'approved' ? 'Approved & Live' : 'Pending Approval',
      agents:      (wf.chain || []).map((s, i) => ({
        id: 'uw-' + i,
        name: s.agent_name || s.name || ('Agent ' + (i + 1)),
        role: s.description || '',
        tools: s.tools || [],
        status: s.status || 'full',
      })),
      isUserSubmitted: true,
    })),
    ...ALL_WORKFLOWS
      .filter(wf => platformApprovals[wf.id] !== 'rejected')
      .map(wf => ({
        ...wf,
        status: platformApprovals[wf.id] === 'approved' ? 'live' : wf.status,
      })),
  ]

  /* Filtered data */
  const filteredWf = allDisplayWorkflows.filter(w => {
    const matchSearch = !wfSearch || w.name.toLowerCase().includes(wfSearch.toLowerCase()) ||
      w.segment.toLowerCase().includes(wfSearch.toLowerCase())
    const matchStatus = wfStatusFilter === 'all' ? true
      : wfStatusFilter === 'under-review' ? (w.status === 'incomplete' || w.status === 'rejected')
      : w.status === 'live'
    return matchSearch && matchStatus
  })
  const filteredAg = allAgents.filter(a => {
    const matchSearch = !agSearch
      || a.name.toLowerCase().includes(agSearch.toLowerCase())
      || a.segment.toLowerCase().includes(agSearch.toLowerCase())
      || a.category.toLowerCase().includes(agSearch.toLowerCase())
    const matchStatus = statusFilter === 'all' ? true
      : statusFilter === 'under-review' ? a.status === 'under-review'
      : (a.status === 'active' || a.status === 'approved')
    return matchSearch && matchStatus
  })
  const activeToolGroup = TOOL_TILE_GROUPS[toolTile] || TOOL_TILE_GROUPS.connectors
  const toolCategories = ['All', ...activeToolGroup.categories]
  const filteredTools = TOOLS_MCP.filter(t => {
    const mGroup = activeToolGroup.categories.includes(t.category)
    const mCat = toolCat === 'All' || t.category === toolCat
    const mSearch = !toolSearch || t.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
      t.provider.toLowerCase().includes(toolSearch.toLowerCase())
    const mStatus = toolStatusFilter === 'all' ? true
      : toolStatusFilter === 'under-review' ? t.status === 'warning'
      : t.status === 'connected'
    return mGroup && mCat && mSearch && mStatus
  })
  /* Pipeline → Agent profile navigation */
  const handleViewAgent = (agentName) => {
    const match = allAgents.find(a => a.name === agentName)
    setDetailWf(null)
    if (match) {
      setTimeout(() => {
        setTab('agents')
        setDetailAg(match)
      }, 180)
    }
  }

  /* Land a "Bring your existing flows" submission as an Under Review workflow */
  const handleFlowSubmitted = (draft) => {
    const segment = SEGMENTS.find(s => s.key === draft.segmentKey)
    const wf = {
      id:          `imported-${Date.now()}`,
      name:        draft.name || 'Imported Workflow',
      description: draft.description,
      segmentKey:  draft.segmentKey,
      segment:     segment?.label || 'Platform',
      status:      'incomplete',
      sla:         null,
      tasksPerDay: 0,
      lastRun:     'Not yet deployed',
      avgRunTime:  '—',
      trigger:     'Imported Config',
      output:      'Pending Deployment',
      agents:      draft.agents.map((a, ai) => ({
        id: `imp-agent-${ai}`, name: a.name || `Agent ${ai + 1}`, role: a.role, tools: [], status: 'full',
      })),
      authors:     [],
      isImported:  true,
    }
    setImportedWorkflows(prev => [wf, ...prev])
    setFlowModalOpen(false)
    setTab('workflows')
    setWfStatusFilter('under-review')
    addToast({ type: 'success', title: 'Flow brought in ✓', message: `"${wf.name}" was scanned and is now under review.` })
  }

  /* Discover Hub category tiles */
  const connectorsCount = TOOLS_MCP.filter(t => TOOL_TILE_GROUPS.connectors.categories.includes(t.category)).length
  const aiToolsCount    = TOOLS_MCP.filter(t => TOOL_TILE_GROUPS.ai.categories.includes(t.category)).length
  const mcpCount        = TOOLS_MCP.filter(t => TOOL_TILE_GROUPS.mcp.categories.includes(t.category)).length

  const TILES = [
    { key: 'agents',     label: 'Agents',      icon: Bot,             color: '#0EA5E9', count: allAgents.length,
      active: tab === 'agents',                                onClick: () => setTab('agents') },
    { key: 'workflows',  label: 'Use Cases',   icon: GitMerge,        color: '#C8102E', count: allDisplayWorkflows.length,
      active: tab === 'workflows',                             onClick: () => setTab('workflows') },
    { key: 'connectors', label: 'Connectors',  icon: Plug,            color: TOOL_TILE_GROUPS.connectors.color, count: connectorsCount,
      active: tab === 'tools' && toolTile === 'connectors',    onClick: () => { setTab('tools'); setToolTile('connectors') } },
    { key: 'ai',         label: 'AI Tools',    icon: Cpu,             color: TOOL_TILE_GROUPS.ai.color, count: aiToolsCount,
      active: tab === 'tools' && toolTile === 'ai',            onClick: () => { setTab('tools'); setToolTile('ai') } },
    { key: 'mcp',        label: 'MCP Servers', icon: Server,          color: TOOL_TILE_GROUPS.mcp.color, count: mcpCount,
      active: tab === 'tools' && toolTile === 'mcp',           onClick: () => { setTab('tools'); setToolTile('mcp') } },
    { key: 'dashboard',  label: 'Leaderboard', icon: LayoutDashboard, color: '#10B981', count: null,
      active: tab === 'dashboard',                             onClick: () => setTab('dashboard') },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="flex flex-col" style={{ minHeight: '100%' }}>

      {/* Modals */}
      <AnimatePresence>
        {detailWf && <WorkflowDetailModal workflow={detailWf} onClose={() => setDetailWf(null)} onViewAgent={handleViewAgent} />}
      </AnimatePresence>
      <AnimatePresence>
        {detailAg && <AgentDetailModal agent={detailAg} onClose={() => setDetailAg(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {detailTool && <ToolDetailModal tool={detailTool} onClose={() => setDetailTool(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {evaluateWf && (
          <EvaluateModal
            workflow={evaluateWf}
            allAgents={allAgents}
            onClose={() => setEvaluateWf(null)}
            onFixWithAI={(fixed) => {
              setImportedWorkflows(prev => prev.map(w => w.id === fixed.id ? fixed : w))
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {flowModalOpen && <BringFlowModal onClose={() => setFlowModalOpen(false)} onSubmitted={handleFlowSubmitted} />}
      </AnimatePresence>

      {/* ── Page Header / Banner ── */}
      <div className="rounded-2xl px-6 py-4 mb-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#1A2340 0%,#2D3A5C 100%)' }}>
        <div className="flex items-center justify-between gap-4 flex-wrap relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Globe size={18} className="text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <h1 className="text-white font-display text-lg font-bold">Discover Hub</h1>
                <p className="text-white/50 text-xs">Enterprise AI Assets &middot; Agents &middot; Tools &middot; Integrations</p>
              </div>
            </div>
          </div>
          <button onClick={() => setFlowModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#1A2340] bg-white hover:bg-white/90 transition-all flex-shrink-0">
            <Upload size={13} /> Bring your existing flows.
          </button>
        </div>
      </div>

      {/* ── Tab nav strip — sticky ── */}
      <div
        className="sticky top-0 z-20 -mx-6 px-6 py-2.5 mb-4"
        style={{
          background: 'rgba(247,248,250,0.97)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(26,35,64,0.06)',
        }}
      >
        <div className="grid grid-cols-6 gap-2.5">
          {TILES.map(t => {
            const Icon = t.icon
            return (
              <motion.button
                key={t.key}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={t.onClick}
                className="rounded-xl px-3 py-2.5 text-left transition-all bg-white"
                style={{
                  border: t.active ? `2px solid ${t.color}` : '1px solid #E2E8F0',
                  boxShadow: t.active ? `0 4px 12px ${t.color}22` : undefined,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: t.active ? t.color : '#F1F5F9' }}>
                    <Icon size={13} style={{ color: t.active ? 'white' : '#94A3B8' }} />
                  </div>
                  {t.count !== null && (
                    <span className="text-base font-bold leading-none" style={{ color: t.active ? t.color : '#CBD5E0' }}>{t.count}</span>
                  )}
                </div>
                <p className="text-xs font-semibold truncate" style={{ color: t.active ? '#1A2340' : '#4A5568' }}>{t.label}</p>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ── Tab content — animated page switch ── */}
      <div ref={contentRef} className="flex-1">
        <AnimatePresence mode="wait">

          {/* ── TAB 1: WORKFLOWS ── */}
          {tab === 'workflows' && (
            <motion.div key="workflows"
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}>
              {/* Section header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#FDF0F2' }}>
                    <GitMerge size={14} className="text-[#C8102E]" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#1A2340]">Workflows</p>
                    <p className="text-xs text-[#718096]">End-to-end automated pipelines — click to view full pipeline</p>
                  </div>
                </div>
                <div className="flex-1" />
                <div className="relative w-56">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
                  <input value={wfSearch} onChange={e => setWfSearch(e.target.value)}
                    placeholder="Search workflows…"
                    className="w-full pl-8 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-xl bg-white focus:outline-none focus:border-[#C8102E]" />
                </div>
              </div>
              {/* Status filter chips */}
              <div className="flex items-center gap-2 pt-1 pb-2">
                {[['all','All'],['live','Approved'],['under-review','Under Review']].map(([key, label]) => {
                  const approvedCount = allDisplayWorkflows.filter(w => w.status === 'live').length
                  const urCount = allDisplayWorkflows.filter(w => w.status === 'incomplete' || w.status === 'rejected').length
                  const count = key === 'live' ? approvedCount : key === 'under-review' ? urCount : null
                  const isActive = wfStatusFilter === key
                  return (
                    <button key={key} onClick={() => setWfStatusFilter(key)}
                      className={'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ' + (
                        isActive
                          ? key === 'under-review' ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-[#1A2340] text-white border border-[#1A2340]'
                          : 'text-[#718096] bg-[#F7F8FA] border border-[#E2E8F0] hover:bg-white'
                      )}>
                      {label}
                      {count !== null && (
                        <span className={'px-1.5 py-0.5 rounded-full text-[10px] font-bold ' + (
                          key === 'under-review'
                            ? 'bg-amber-200 text-amber-800'
                            : isActive ? 'bg-white/25 text-white' : 'bg-[#E2E8F0] text-[#718096]'
                        )}>{count}</span>
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {filteredWf.map(wf => (
                  <UseCaseTile key={wf.id} wf={wf} isHighlighted={highlightId === wf.id} onClick={() => setDetailWf(wf)}
                    onDeploy={handleDeployWorkflow}
                    onEvaluate={wf.isImported ? () => setEvaluateWf(wf) : null} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── TAB 2: INDIVIDUAL AGENTS ── */}
          {tab === 'agents' && (
            <motion.div key="agents"
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#EFF6FF' }}>
                    <Bot size={14} style={{ color: '#0EA5E9' }} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#1A2340]">Individual Agents</p>
                    <p className="text-xs text-[#718096]">Reusable AI agents deployed across workflows — click to inspect</p>
                  </div>
                </div>
                <div className="flex-1" />
                <div className="relative w-56">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
                  <input value={agSearch} onChange={e => setAgSearch(e.target.value)}
                    placeholder="Search agents, tools, use cases…"
                    className="w-full pl-8 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-xl bg-white focus:outline-none focus:border-[#0EA5E9]" />
                </div>
                <div className="flex items-center rounded-xl border border-[#E2E8F0] bg-white overflow-hidden flex-shrink-0">
                  <button onClick={() => setAgentView('grid')}
                    className="w-8 h-8 flex items-center justify-center transition-all"
                    style={{ background: agentView === 'grid' ? '#EFF6FF' : 'white', color: agentView === 'grid' ? '#0EA5E9' : '#9BA8BA' }}
                    aria-label="Grid view" title="Grid view">
                    <GridIcon size={14} />
                  </button>
                  <button onClick={() => setAgentView('list')}
                    className="w-8 h-8 flex items-center justify-center transition-all border-l border-[#E2E8F0]"
                    style={{ background: agentView === 'list' ? '#EFF6FF' : 'white', color: agentView === 'list' ? '#0EA5E9' : '#9BA8BA' }}
                    aria-label="List view" title="List view">
                    <List size={14} />
                  </button>
                </div>
              </div>
              {/* Status filter */}
              <div className="flex items-center gap-2 pt-1 pb-2">
                {[['all','All'],['active','Approved'],['under-review','Under Review']].map(([key, label]) => {
                  const approvedCount = allAgents.filter(a => a.status === 'active' || a.status === 'approved').length
                  const urCount       = allAgents.filter(a => a.status === 'under-review').length
                  const count = key === 'active' ? approvedCount : key === 'under-review' ? urCount : null
                  const isActive = statusFilter === key
                  return (
                    <button key={key} onClick={() => setStatusFilter(key)}
                      className={'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ' + (
                        isActive
                          ? key === 'under-review' ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-[#1A2340] text-white border border-[#1A2340]'
                          : 'text-[#718096] bg-[#F7F8FA] border border-[#E2E8F0] hover:bg-white'
                      )}>
                      {label}
                      {count !== null && (
                        <span className={'px-1.5 py-0.5 rounded-full text-[10px] font-bold ' + (
                          key === 'under-review'
                            ? 'bg-amber-200 text-amber-800'
                            : isActive ? 'bg-white/25 text-white' : 'bg-[#E2E8F0] text-[#718096]'
                        )}>{count}</span>
                      )}
                    </button>
                  )
                })}
              </div>
              {agentView === 'grid' ? (
                <div className="grid grid-cols-3 gap-4">
                  {filteredAg.map(agent => (
                    <AgentCard key={agent.id} agent={agent} onClick={() => setDetailAg(agent)} onDeploy={handleDeployAgent} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {filteredAg.map(agent => (
                    <AgentListRow key={agent.id} agent={agent} onClick={() => setDetailAg(agent)} onDeploy={handleDeployAgent} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── TAB 3: TOOLS / MCP ── */}
          {tab === 'tools' && (
            <motion.div key="tools"
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}>
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${activeToolGroup.color}15` }}>
                    <Plug size={14} style={{ color: activeToolGroup.color }} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#1A2340]">{activeToolGroup.label}</p>
                    <p className="text-xs text-[#718096]">APIs, connectors and MCP servers authorised for agent use</p>
                  </div>
                </div>
                <div className="flex-1" />
                <div className="relative w-48">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
                  <input value={toolSearch} onChange={e => setToolSearch(e.target.value)}
                    placeholder="Search tools…"
                    className="w-full pl-8 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-xl bg-white focus:outline-none"
                    style={{ borderColor: '#E2E8F0' }}
                    onFocus={e => e.target.style.borderColor = activeToolGroup.color}
                    onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {toolCategories.map(c => (
                    <button key={c} onClick={() => setToolCat(c)}
                      className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                      style={toolCat === c ? { background: activeToolGroup.color, color: 'white' } : { background: 'white', color: '#718096', border: '1px solid #E2E8F0' }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              {/* Status filter chips */}
              <div className="flex items-center gap-2 pt-1 pb-3">
                {[['all','All'],['connected','Approved'],['under-review','Under Review']].map(([key, label]) => {
                  const approvedCount = TOOLS_MCP.filter(t => t.status === 'connected').length
                  const urCount = TOOLS_MCP.filter(t => t.status === 'warning').length
                  const count = key === 'connected' ? approvedCount : key === 'under-review' ? urCount : null
                  const isActive = toolStatusFilter === key
                  return (
                    <button key={key} onClick={() => setToolStatusFilter(key)}
                      className={'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ' + (
                        isActive
                          ? key === 'under-review' ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-[#1A2340] text-white border border-[#1A2340]'
                          : 'text-[#718096] bg-[#F7F8FA] border border-[#E2E8F0] hover:bg-white'
                      )}>
                      {label}
                      {count !== null && (
                        <span className={'px-1.5 py-0.5 rounded-full text-[10px] font-bold ' + (
                          key === 'under-review'
                            ? 'bg-amber-200 text-amber-800'
                            : isActive ? 'bg-white/25 text-white' : 'bg-[#E2E8F0] text-[#718096]'
                        )}>{count}</span>
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="grid grid-cols-4 gap-3">
                {filteredTools.map(tool => (
                  <ToolCard key={tool.id} tool={tool} onClick={() => setDetailTool(tool)} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── TAB 4: DASHBOARD ── */}
          {tab === 'dashboard' && (
            <motion.div key="dashboard"
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}>
              <AuthorDashboard allAgents={allAgents} allWorkflows={allDisplayWorkflows} allTools={TOOLS_MCP} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <div className="h-4" />
    </motion.div>
  )
}
