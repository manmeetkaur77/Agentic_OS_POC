import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Bot, Zap, ArrowRight, Plus, Users,
  CreditCard, Printer, FileText, Database, Shield, Hammer
} from 'lucide-react'
import useStore from '../store/useStore'
import StatusBadge from '../components/shared/StatusBadge'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
const item      = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

const SEG_COLORS = { merchant: '#0EA5E9', print: '#6B7280', b2b: '#8B5CF6', data: '#10B981', platform: '#C8102E' }
const SEG_ICONS  = { merchant: CreditCard, print: Printer, b2b: FileText, data: Database, platform: Shield }

function AgentRow({ agent, isCustom }) {
  const navigate = useNavigate()
  const segKey = agent.segmentKey || agent.segment || 'platform'
  const color  = SEG_COLORS[segKey] || '#718096'
  const Icon   = SEG_ICONS[segKey] || Bot

  return (
    <motion.div
      whileHover={{ x: 2 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E0] hover:bg-[#F7F9FF] cursor-pointer transition-all"
      onClick={() => navigate('/agent-pool')}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
        {agent.status === 'running'
          ? <span className="agent-pulse"><Icon size={15} style={{ color }} /></span>
          : <Icon size={15} style={{ color }} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[#1A2340] truncate">{agent.name}</p>
          {isCustom && (
            <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Custom</span>
          )}
        </div>
        <p className="text-xs text-[#718096] truncate mt-0.5">{agent.description || 'Custom agent'}</p>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        {agent.teams != null && (
          <div className="flex items-center gap-1 text-xs text-[#718096]">
            <Users size={11} />
            <span>{agent.teams} team{agent.teams !== 1 ? 's' : ''}</span>
          </div>
        )}
        {agent.successRate != null && (
          <div className="text-xs font-semibold text-emerald-600">{agent.successRate}%</div>
        )}
        <StatusBadge status={agent.status || 'idle'} />
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { metrics, agents, builtAgents } = useStore()
  const [poolAgents, setPoolAgents] = useState([])

  useEffect(() => {
    fetch('/api/nova/agents')
      .then(r => r.ok ? r.json() : [])
      .then(data => setPoolAgents(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  if (!metrics) return (
    <div className="grid grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => <div key={i} className="card p-5 h-28 skeleton" />)}
    </div>
  )

  const ov           = metrics.overview
  const activeAgents = poolAgents.filter(a => a.status === 'running')
  const allBuilt     = builtAgents || []

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

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

      {/* Bottom two-column section */}
      <motion.div variants={item} className="grid grid-cols-2 gap-5">

        {/* Agents built by you */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Hammer size={13} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A2340]">Agents Built by You</p>
                <p className="text-xs text-[#718096]">{allBuilt.length} custom agent{allBuilt.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/agent-pool')}
              className="flex items-center gap-1 text-xs text-[#C8102E] font-medium hover:gap-2 transition-all"
            >
              View all <ArrowRight size={11} />
            </button>
          </div>

          <div className="p-4 space-y-2 min-h-[200px]">
            {allBuilt.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] border border-[#E2E8F0] flex items-center justify-center mb-3">
                  <Bot size={18} className="text-[#CBD5E0]" />
                </div>
                <p className="text-sm font-medium text-[#1A2340] mb-1">No agents built yet</p>
                <p className="text-xs text-[#718096] mb-3">Use Imagination Studio to discover needs, then build your first agent.</p>
                <button
                  onClick={() => navigate('/builder')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ background: '#C8102E' }}
                >
                  <Plus size={11} /> Build your first agent
                </button>
              </div>
            ) : (
              allBuilt.map((agent, i) => (
                <AgentRow key={agent.id || i} agent={agent} isCustom />
              ))
            )}
          </div>
        </div>

        {/* Active agents from pool */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <Zap size={13} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A2340]">Trending Agents</p>
                <p className="text-xs text-[#718096]">{activeAgents.length} running in production</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/agent-pool')}
              className="flex items-center gap-1 text-xs text-[#C8102E] font-medium hover:gap-2 transition-all"
            >
              View all agents <ArrowRight size={11} />
            </button>
          </div>

          <div className="p-4 space-y-2 min-h-[200px]">
            {activeAgents.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-sm text-[#718096]">No agents running — pool loading…</p>
              </div>
            ) : (
              activeAgents.map((agent, i) => (
                <AgentRow key={agent.id || i} agent={agent} isCustom={false} />
              ))
            )}
          </div>

          {poolAgents.length > activeAgents.length && (
            <div className="px-5 py-3 border-t border-[#E2E8F0] bg-[#F7F8FA]">
              <p className="text-xs text-[#718096]">
                + {poolAgents.length - activeAgents.length} idle agent{poolAgents.length - activeAgents.length !== 1 ? 's' : ''} in pool
                <button onClick={() => navigate('/agent-pool')} className="ml-2 text-[#C8102E] font-medium hover:underline">Browse all</button>
              </p>
            </div>
          )}
        </div>

      </motion.div>
    </motion.div>
  )
}
