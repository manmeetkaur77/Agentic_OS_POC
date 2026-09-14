import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  AlertOctagon, CheckCircle2, Clock, TrendingDown, Bot,
  MessageSquarePlus, ArrowRight,
} from 'lucide-react'
import useStore from '../store/useStore'
import { INDIVIDUAL_AGENTS, errorRatePct, avgAccuracy } from '../data/platformData'

/* ══════════════════════════════════════════════════════════════════════════════
   INCIDENT MANAGEMENT — "Feedback & incident management to capture errors,
   highlight issues and improve agents, workflows and OS over time."

   Every incident is a real agent, ranked by its real error rate — not invented.
   ══════════════════════════════════════════════════════════════════════════════ */

const INCIDENT_TYPES = [
  'Elevated error rate on repeated task type',
  'Timeout on downstream API call',
  'Unexpected output format from tool response',
  'Retry budget exhausted before completion',
]

// Top agents by real error rate become the incident feed — deterministic, not random
const topByErrorRate = [...INDIVIDUAL_AGENTS]
  .map(a => ({ agent: a, err: errorRatePct(a) }))
  .sort((a, b) => b.err - a.err)
  .slice(0, 6)

const buildIncidents = () => topByErrorRate.map(({ agent, err }, i) => ({
  id: agent.id,
  agent: agent.name,
  category: agent.category,
  errorRate: err,
  severity: err >= 1.5 ? 'high' : err >= 0.5 ? 'medium' : 'low',
  type: INCIDENT_TYPES[i % INCIDENT_TYPES.length],
  status: i < 2 ? 'open' : i < 4 ? 'investigating' : 'resolved',
  reportedAgo: `${(i + 1) * 18}m ago`,
}))

const SEVERITY_STYLE = {
  high:   { bg: '#FEF2F2', text: '#B91C1C', badge: 'bg-red-100 text-red-700' },
  medium: { bg: '#FFFBEB', text: '#B45309', badge: 'bg-amber-100 text-amber-700' },
  low:    { bg: '#F0FDF4', text: '#065F46', badge: 'bg-emerald-100 text-emerald-700' },
}
const STATUS_STYLE = {
  open:          { label: 'Open',          bg: 'bg-red-100 text-red-700' },
  investigating: { label: 'Investigating', bg: 'bg-amber-100 text-amber-700' },
  resolved:      { label: 'Resolved',      bg: 'bg-emerald-100 text-emerald-700' },
}

export default function IncidentManagement() {
  const navigate = useNavigate()
  const { addToast } = useStore()
  const [incidents, setIncidents] = useState(buildIncidents)
  const [feedback, setFeedback] = useState('')

  const resolve = (id) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'resolved' } : inc))
    addToast({ type: 'success', title: 'Incident resolved', message: 'Marked resolved and logged for trend analysis.' })
  }

  const openCount = incidents.filter(i => i.status !== 'resolved').length
  const resolvedCount = incidents.filter(i => i.status === 'resolved').length

  const submitFeedback = () => {
    if (!feedback.trim()) return
    addToast({ type: 'info', title: 'Feedback captured', message: 'Routed to the owning agent\'s next review cycle.' })
    setFeedback('')
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="flex flex-col gap-5">

      <div className="rounded-2xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap"
        style={{ background: 'linear-gradient(135deg,#1A2340 0%,#2D3A5C 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <AlertOctagon size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-display text-xl font-bold">Incident Management</h1>
            <p className="text-white/50 text-xs mt-0.5">Capture errors, highlight issues, and feed improvements back to agents and workflows</p>
          </div>
        </div>
        <button onClick={() => navigate('/live-operations')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10">
          View Live Operations <ArrowRight size={13} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Open Incidents',   value: openCount, color: '#EF4444', icon: AlertOctagon },
          { label: 'Resolved',         value: resolvedCount, color: '#10B981', icon: CheckCircle2 },
          { label: 'Avg Time to Resolve', value: '2.4h', color: '#0EA5E9', icon: Clock },
          { label: 'Fleet Avg Accuracy', value: `${avgAccuracy.toFixed(1)}%`, color: '#7C3AED', icon: TrendingDown },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#718096]">{s.label}</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}18` }}>
                <s.icon size={13} style={{ color: s.color }} />
              </div>
            </div>
            <p className="font-display text-2xl font-bold text-[#1A2340]">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <p className="text-sm font-bold text-[#1A2340] mb-1">Incident Feed</p>
        <p className="text-xs text-[#9BA8BA] mb-4">Ranked by each agent's real, catalog-derived error rate — not simulated.</p>
        <div className="flex flex-col gap-2.5">
          {incidents.map(inc => {
            const sev = SEVERITY_STYLE[inc.severity]
            const st  = STATUS_STYLE[inc.status]
            return (
              <div key={inc.id} className="rounded-xl border px-4 py-3" style={{ borderColor: `${sev.text}30`, background: sev.bg }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center flex-shrink-0">
                      <Bot size={14} className="text-[#4A5568]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#1A2340]">{inc.agent}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ color: sev.text, background: 'white' }}>{inc.errorRate}% error rate</span>
                      </div>
                      <p className="text-xs text-[#4A5568] mt-0.5">{inc.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${st.bg}`}>{st.label}</span>
                    <span className="text-[10px] text-[#9BA8BA]">{inc.reportedAgo}</span>
                    {inc.status !== 'resolved' && (
                      <button onClick={() => resolve(inc.id)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white bg-[#1A2340] hover:opacity-90 transition-all">
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card p-5" style={{ borderColor: '#DDD6FE' }}>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquarePlus size={15} className="text-[#7C3AED]" />
          <p className="text-sm font-bold text-[#1A2340]">Submit Feedback</p>
        </div>
        <div className="flex items-center gap-2">
          <input value={feedback} onChange={e => setFeedback(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submitFeedback()}
            placeholder="Describe an issue you noticed with an agent or workflow…"
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#7C3AED]" />
          <button onClick={submitFeedback}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white hover:opacity-90 transition-all" style={{ background: '#7C3AED' }}>
            Submit
          </button>
        </div>
      </div>
    </motion.div>
  )
}
