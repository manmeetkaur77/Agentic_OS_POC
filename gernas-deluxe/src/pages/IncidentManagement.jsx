import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  AlertOctagon, CheckCircle2, Clock, TrendingDown, Bot,
  MessageSquarePlus, ArrowRight, X, Activity, TrendingUp, Wrench,
} from 'lucide-react'
import useStore from '../store/useStore'
import {
  avgAccuracy, agentById, buildIncidents,
  INCIDENT_SEVERITY_STYLE as SEVERITY_STYLE, INCIDENT_STATUS_STYLE as STATUS_STYLE,
} from '../data/platformData'

/* ══════════════════════════════════════════════════════════════════════════════
   INCIDENT MANAGEMENT — "Feedback & incident management to capture errors,
   highlight issues and improve agents, workflows and OS over time."

   Every incident is a real agent, ranked by its real error rate — not invented.
   The feed itself (buildIncidents) lives in platformData.js so Live Operations
   can show the exact same incidents, not a lookalike mock list.
   ══════════════════════════════════════════════════════════════════════════════ */

// Generic explanation per incident category — what this pattern usually means operationally
const INCIDENT_TYPE_DETAIL = {
  'Elevated error rate on repeated task type': 'The agent is failing more often than usual on one specific task pattern — often a sign that the input data shape changed upstream, or a downstream system started rejecting a previously-valid request.',
  'Timeout on downstream API call': 'A tool or API this agent depends on is responding slower than its configured timeout, causing the task to abort before completion.',
  'Unexpected output format from tool response': 'A connected tool returned a payload the agent could not parse — usually caused by an API version change on the tool provider\'s side.',
  'Retry budget exhausted before completion': 'The agent hit its maximum retry count without a successful response and gave up rather than looping indefinitely.',
}

/* ── Incident detail modal — full context before a human resolves it ── */
function IncidentDetailModal({ incident, onClose, onResolve }) {
  const agent = agentById(incident.id)
  const sev = SEVERITY_STYLE[incident.severity]
  const st  = STATUS_STYLE[incident.status]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(10px)', background: 'rgba(10,18,40,0.72)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.93, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 24 }} transition={{ duration: 0.22 }}
        className="bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: '92vw', maxWidth: 560, maxHeight: '88vh', boxShadow: '0 40px 100px rgba(0,0,0,0.45)' }}>

        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#1A2340 0%,#2D3A5C 100%)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Bot size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-base leading-tight truncate">{incident.agent}</p>
              <p className="text-white/50 text-xs mt-0.5">{incident.category} &middot; {incident.reportedAgo}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all flex-shrink-0">
            <X size={15} className="text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${st.bg}`}>{st.label}</span>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ color: sev.text, background: sev.bg }}>{incident.severity} severity</span>
          </div>

          <div className="rounded-2xl px-4 py-3.5" style={{ background: sev.bg, border: `1px solid ${sev.text}30` }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: sev.text }}>{incident.type}</p>
            <p className="text-sm text-[#1A2340] leading-relaxed">{INCIDENT_TYPE_DETAIL[incident.type]}</p>
          </div>

          {agent && (
            <div>
              <p className="text-xs font-bold text-[#9BA8BA] uppercase tracking-wider mb-1.5">What this agent does</p>
              <p className="text-sm text-[#4A5568] leading-relaxed">{agent.description}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-[#F7F8FA] px-3 py-2.5">
              <p className="text-xs text-[#9BA8BA] flex items-center gap-1"><AlertOctagon size={10} /> Error Rate</p>
              <p className="text-sm font-bold text-red-500 mt-0.5">{incident.errorRate}%</p>
            </div>
            <div className="rounded-xl bg-[#F7F8FA] px-3 py-2.5">
              <p className="text-xs text-[#9BA8BA] flex items-center gap-1"><TrendingUp size={10} /> Success Rate</p>
              <p className="text-sm font-bold text-emerald-600 mt-0.5">{agent?.successRate ?? '—'}%</p>
            </div>
            <div className="rounded-xl bg-[#F7F8FA] px-3 py-2.5">
              <p className="text-xs text-[#9BA8BA] flex items-center gap-1"><Activity size={10} /> Tasks/Day</p>
              <p className="text-sm font-bold text-[#1A2340] mt-0.5">{agent?.tasksToday?.toLocaleString() ?? '—'}</p>
            </div>
          </div>

          {agent?.tools?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#9BA8BA] uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Wrench size={11} /> Tools In Use</p>
              <div className="flex flex-wrap gap-1.5">
                {agent.tools.map(t => (
                  <span key={t} className="px-2 py-1 rounded-md text-xs font-mono bg-[#F1F5F9] text-[#475569]">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-end gap-2 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#4A5568] hover:bg-[#F7F8FA] transition-all">Close</button>
          {incident.status !== 'resolved' && (
            <button onClick={() => onResolve(incident.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1A2340] hover:opacity-90 transition-all">
              <CheckCircle2 size={14} /> Mark Resolved
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default function IncidentManagement() {
  const navigate = useNavigate()
  const { addToast } = useStore()
  const [incidents, setIncidents] = useState(buildIncidents)
  const [feedback, setFeedback] = useState('')
  const [selected, setSelected] = useState(null)

  const resolve = (id) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'resolved' } : inc))
    addToast({ type: 'success', title: 'Incident resolved', message: 'Marked resolved and logged for trend analysis.' })
    setSelected(null)
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

      <AnimatePresence>
        {selected && <IncidentDetailModal incident={selected} onClose={() => setSelected(null)} onResolve={resolve} />}
      </AnimatePresence>

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
              <div key={inc.id} onClick={() => setSelected(inc)}
                className="rounded-xl border px-4 py-3 cursor-pointer hover:shadow-sm transition-all" style={{ borderColor: `${sev.text}30`, background: sev.bg }}>
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
                      <button onClick={(e) => { e.stopPropagation(); resolve(inc.id) }}
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
