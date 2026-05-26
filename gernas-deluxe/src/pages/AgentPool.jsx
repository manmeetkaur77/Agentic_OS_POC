import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Search, Layers, CheckCircle, AlertCircle, Clock, Users,
  Zap, Bot, CreditCard, Printer, FileText, Database, Shield,
  Plus, ChevronRight, BarChart2, Play, Edit3, Star
} from 'lucide-react'
import StatusBadge from '../components/shared/StatusBadge'
import SegmentTag from '../components/shared/SegmentTag'
import useStore from '../store/useStore'

const segColors = { merchant: '#0EA5E9', print: '#6B7280', b2b: '#8B5CF6', data: '#10B981', platform: '#C8102E' }
const segIcons  = { merchant: CreditCard, print: Printer, b2b: FileText, data: Database, platform: Shield }

const CATEGORIES = ['All', 'Onboarding', 'Revenue', 'Operations', 'Data', 'Risk & Compliance']
const SEGMENTS   = ['All Segments', 'Merchant Services', 'Print', 'B2B Payments', 'Data Solutions']

function PoolCard({ agent, onClick }) {
  const navigate  = useNavigate()
  const Icon      = segIcons[agent.segmentKey] || Bot
  const color     = segColors[agent.segmentKey] || '#718096'

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="card overflow-hidden cursor-pointer flex flex-col"
      onClick={() => onClick(agent)}
    >
      {/* Top bar */}
      <div className="h-1.5" style={{ background: color }} />
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
              {agent.status === 'running'
                ? <span className="agent-pulse"><Icon size={17} style={{ color }} /></span>
                : <Icon size={17} style={{ color }} />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-[#1A2340] leading-tight">{agent.name}</p>
                {agent.isCustom && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Custom</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <SegmentTag segment={agent.segment} />
                <StatusBadge status={agent.status} />
              </div>
            </div>
          </div>
          <span className="text-xs text-[#718096] flex items-center gap-1">
            <Users size={10} /> {agent.teams} teams
          </span>
        </div>

        {/* What it solves */}
        <div className="flex-1 mb-3">
          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-1.5">Solves</p>
          <div className="flex flex-col gap-1">
            {agent.solves.slice(0, 3).map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle size={11} className="text-emerald-500 flex-shrink-0" />
                <span className="text-xs text-[#4A5568]">{s}</span>
              </div>
            ))}
            {agent.solves.length > 3 && (
              <p className="text-xs text-[#718096] ml-4">+{agent.solves.length - 3} more</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E2E8F0]">
          <div className="text-center">
            <p className="text-sm font-bold text-[#1A2340]">{agent.successRate}%</p>
            <p className="text-xs text-[#718096]">Success</p>
          </div>
          <div className="text-center border-l border-[#E2E8F0]">
            <p className="text-sm font-bold text-[#1A2340]">{agent.tasksToday.toLocaleString()}</p>
            <p className="text-xs text-[#718096]">Tasks/day</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 border-t border-[#E2E8F0] bg-[#F7F8FA] flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); navigate('/merchant') }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-white text-xs font-semibold"
          style={{ background: '#C8102E' }}
        >
          <Play size={11} /> Deploy
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); navigate('/agent-analyst') }}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#4A5568] bg-white border border-[#E2E8F0] hover:border-[#CBD5E0]"
        >
          <Edit3 size={11} /> Modify
        </button>
      </div>
    </motion.div>
  )
}

function AgentDetailPane({ agent, onClose }) {
  const navigate = useNavigate()
  if (!agent) return null
  const Icon  = segIcons[agent.segmentKey] || Bot
  const color = segColors[agent.segmentKey] || '#718096'

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="card overflow-hidden flex flex-col h-full"
    >
      <div className="h-1.5" style={{ background: color }} />
      <div className="p-5 border-b border-[#E2E8F0]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
            <Icon size={20} style={{ color }} />
          </div>
          <div className="flex-1">
            <p className="font-display text-base font-bold text-[#1A2340]">{agent.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <SegmentTag segment={agent.segment} />
              <StatusBadge status={agent.status} />
              <span className="text-xs text-[#718096] font-mono">v{agent.version}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-[#CBD5E0] hover:text-[#718096] text-lg leading-none">×</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Live stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Success Rate',   value: `${agent.successRate}%`, color: 'emerald' },
            { label: 'Tasks Today',    value: agent.tasksToday.toLocaleString(), color: 'default' },
            { label: 'Teams Using',    value: agent.teams,     color: 'default' },
            { label: 'Version',        value: `v${agent.version}`, color: 'default' },
          ].map(s => (
            <div key={s.label} className="bg-[#F7F8FA] rounded-xl p-3">
              <p className="text-xs text-[#718096] mb-1">{s.label}</p>
              <p className={`text-lg font-bold ${s.color === 'emerald' ? 'text-emerald-600' : s.color === 'red' ? 'text-[#C8102E]' : 'text-[#1A2340]'}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Solves */}
        <div>
          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle size={11} className="text-emerald-500" /> This agent solves
          </p>
          <div className="flex flex-col gap-1.5">
            {agent.solves.map((s, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100">
                <CheckCircle size={12} className="text-emerald-500 flex-shrink-0" />
                <span className="text-xs text-[#1A2340]">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Does not solve */}
        <div>
          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertCircle size={11} className="text-amber-500" /> Known gaps
          </p>
          <div className="flex flex-col gap-1.5">
            {agent.doesNotSolve.map((s, i) => (
              <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2">
                  <AlertCircle size={12} className="text-amber-500 flex-shrink-0" />
                  <span className="text-xs text-[#4A5568]">{s}</span>
                </div>
                <button
                  onClick={() => navigate('/builder', { state: { prefill: { name: `${s} — ${agent.name} Extension`, description: s } } })}
                  className="flex-shrink-0 text-xs text-amber-600 font-medium hover:text-amber-700"
                >
                  Fill gap →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div>
          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-2">Tools</p>
          <div className="flex flex-wrap gap-1.5">
            {(agent.tools || []).map(c => (
              <span key={c} className="px-2 py-1 rounded-lg bg-[#F7F8FA] border border-[#E2E8F0] text-xs font-mono text-[#4A5568]">{c}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#E2E8F0] flex gap-2">
        <button
          onClick={() => navigate('/merchant')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: '#C8102E' }}
        >
          <Play size={14} /> Deploy Now
        </button>
        <button
          onClick={() => navigate('/agent-analyst')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-[#E2E8F0] text-[#4A5568] hover:bg-[#F7F8FA]"
        >
          <Edit3 size={14} /> Modify
        </button>
      </div>
    </motion.div>
  )
}

export default function AgentPool() {
  const navigate = useNavigate()
  const { builtAgents } = useStore()
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('All')
  const [segment, setSegment]   = useState('All Segments')
  const [selected, setSelected] = useState(null)
  const [poolAgents, setPoolAgents] = useState([])

  useEffect(() => {
    fetch('/api/nova/agents')
      .then(r => r.ok ? r.json() : [])
      .then(data => setPoolAgents(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  const ALL_AGENTS = [...poolAgents, ...builtAgents]

  const filtered = ALL_AGENTS.filter(a => {
    const mSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || (a.solves || []).some(s => s.toLowerCase().includes(search.toLowerCase()))
    const mCat    = category === 'All' || a.category === category
    const mSeg    = segment === 'All Segments' || a.segment === segment
    return mSearch && mCat && mSeg
  })

  const totalTasks   = ALL_AGENTS.reduce((s, a) => s + (a.tasksToday || 0), 0)
  const running      = ALL_AGENTS.filter(a => a.status === 'running').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-[#1A2340]">Agent Pool</h1>
          <p className="text-sm text-[#718096] mt-1">Hosted agents available for deployment across Deluxe business segments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Agents in Pool',    value: ALL_AGENTS.length,           icon: Layers },
          { label: 'Running Now',       value: running,                     icon: Zap },
          { label: 'Tasks Today',       value: totalTasks.toLocaleString(), icon: BarChart2 },
          { label: 'Avg Success Rate',  value: `${ALL_AGENTS.length ? (ALL_AGENTS.reduce((s,a) => s + (a.successRate||0), 0) / ALL_AGENTS.length).toFixed(1) : 0}%`, icon: CheckCircle },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FDF0F2] flex items-center justify-center">
                <Icon size={16} className="text-[#C8102E]" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#1A2340]">{s.value}</p>
                <p className="text-xs text-[#718096]">{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="card p-4 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search agents or capabilities..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-xl bg-[#F7F8FA] focus:outline-none focus:border-[#C8102E]"
          />
        </div>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${category === c ? 'text-white' : 'bg-[#F7F8FA] text-[#718096]'}`}
            style={category === c ? { background: '#1A2340' } : {}}
          >{c}</button>
        ))}
        <select value={segment} onChange={e => setSegment(e.target.value)}
          className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-xl bg-white text-[#4A5568] focus:outline-none focus:border-[#C8102E]">
          {SEGMENTS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Grid + detail pane */}
      <div className={`grid gap-4 ${selected ? 'grid-cols-3' : 'grid-cols-3'}`}>
        {selected && (
          <div className="col-span-1 h-[600px]">
            <AgentDetailPane agent={selected} onClose={() => setSelected(null)} />
          </div>
        )}
        <div className={`${selected ? 'col-span-2' : 'col-span-3'} grid gap-4 ${selected ? 'grid-cols-2' : 'grid-cols-3'} content-start`}>
          {filtered.map(agent => (
            <PoolCard
              key={agent.id}
              agent={agent}
              onClick={a => setSelected(selected?.id === a.id ? null : a)}
            />
          ))}
          {/* "Add to pool" placeholder */}
          <motion.div
            whileHover={{ y: -2 }}
            onClick={() => navigate('/builder')}
            className="card p-5 flex flex-col items-center justify-center text-center cursor-pointer border-dashed border-2 border-[#E2E8F0] hover:border-[#C8102E] hover:bg-[#FDF0F2] transition-all min-h-[180px]"
          >
            <Plus size={22} className="text-[#CBD5E0] mb-2" />
            <p className="text-sm font-medium text-[#718096]">Build a new agent</p>
            <p className="text-xs text-[#CBD5E0] mt-1">Add it to the pool</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
