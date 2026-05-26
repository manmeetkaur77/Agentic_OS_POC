import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Send, FileText, CheckCircle, AlertCircle, XCircle,
  Bot, Zap, ArrowRight, Plus, Edit3, RotateCcw, Loader,
  TrendingUp, Users, Clock, DollarSign, ChevronRight, Upload, Lightbulb,
  Play, Terminal, ChevronDown, GitBranch, Search, Download
} from 'lucide-react'
import useStore from '../store/useStore'

const EXAMPLE_PROMPTS = [
  "We're losing print customers because we don't catch them early enough before they churn",
  "Our merchant onboarding takes 5–7 days — we need to cut that to under 24 hours",
  "We process 500+ invoices daily and our team spends 3 days matching payments manually",
  "We need real-time fraud detection across all merchant transactions",
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-[#E2E8F0] w-fit">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i} className="w-1.5 h-1.5 rounded-full bg-[#CBD5E0]"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

function NeedsCard({ need, match, onBuild, onModify, index }) {
  const statusConfig = {
    solved:   { icon: CheckCircle,  color: '#10B981', bg: '#F0FDF4', border: '#BBF7D0', label: 'Solved' },
    partial:  { icon: AlertCircle,  color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', label: 'Partial Match' },
    unsolved: { icon: XCircle,      color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', label: 'No Agent Yet' },
  }
  const cfg = statusConfig[match?.status] || statusConfig.unsolved
  const Icon = cfg.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12 }}
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: cfg.border, background: cfg.bg }}
    >
      <div className="px-4 py-3">
        <div className="flex items-start justify-between mb-1.5">
          <div className="flex items-start gap-2 flex-1">
            <Icon size={15} style={{ color: cfg.color }} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#1A2340]">{need.label}</p>
              <p className="text-xs text-[#718096] mt-0.5 leading-relaxed">{need.detail}</p>
            </div>
          </div>
          <span
            className="flex-shrink-0 ml-3 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ color: cfg.color, background: `${cfg.color}18` }}
          >
            {cfg.label}
          </span>
        </div>

        {match?.agentName && (
          <div className="mt-2 pt-2 border-t" style={{ borderColor: cfg.border }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Bot size={11} style={{ color: cfg.color }} />
              <span className="text-xs font-semibold" style={{ color: cfg.color }}>{match.agentName}</span>
              {match.score > 0 && (
                <span className="text-xs text-[#718096]">— {match.score}% match</span>
              )}
            </div>
            {match.solves && <p className="text-xs text-[#4A5568]">✓ {match.solves}</p>}
            {match.gap    && <p className="text-xs text-amber-600 mt-0.5">⚠ Gap: {match.gap}</p>}
          </div>
        )}

        {match?.status === 'unsolved' && (
          <div className="mt-2 pt-2 border-t border-red-200 flex gap-2">
            <button
              onClick={() => onBuild(need)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: '#C8102E' }}
            >
              <Plus size={11} /> Build Agent
            </button>
            <button
              onClick={() => onModify(need)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#4A5568] bg-white border border-red-200 hover:border-red-300"
            >
              <Edit3 size={11} /> Modify Existing
            </button>
          </div>
        )}
        {match?.status === 'partial' && (
          <div className="mt-2 pt-2 border-t border-amber-200">
            <button
              onClick={() => onModify(need)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-700 bg-white border border-amber-200 hover:border-amber-300"
            >
              <Edit3 size={11} /> Extend this agent to cover the gap
            </button>
          </div>
        )}
        {match?.status === 'solved' && (
          <div className="mt-2 pt-2 border-t border-emerald-200">
            <button
              onClick={() => onModify(need)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 bg-white border border-emerald-200 hover:border-emerald-300"
            >
              <Zap size={11} /> Deploy now
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Agent Flowchart (shown on hover) ────────────────────────────────────────

const SEG_COLOR = { merchant: '#0EA5E9', print: '#6B7280', b2b: '#8B5CF6', data: '#10B981', platform: '#C8102E' }

function AgentFlowChart({ agentName, segment, solvedNeeds, partialNeeds }) {
  const nodeH = 58
  const nodeW = 126
  const nodeGap = 12
  const chartW = 400
  const midX = chartW / 2
  const kernelR = 36

  const maxRows = Math.max(solvedNeeds.length, partialNeeds.length, 1)
  const rowH = nodeH + nodeGap
  const chartH = maxRows * rowH + nodeGap * 2

  const kernelCY = chartH / 2

  const leftTotalH = solvedNeeds.length * rowH - nodeGap
  const leftStartY  = (chartH - leftTotalH) / 2
  const lNodeY  = (i) => leftStartY + i * rowH
  const lNodeCY = (i) => lNodeY(i) + nodeH / 2

  const rightTotalH = partialNeeds.length * rowH - nodeGap
  const rightStartY  = (chartH - rightTotalH) / 2
  const rNodeY  = (i) => rightStartY + i * rowH
  const rNodeCY = (i) => rNodeY(i) + nodeH / 2

  const rightLeftX = chartW - nodeW
  const color = SEG_COLOR[segment] || '#1A2340'

  return (
    <div className="relative" style={{ width: chartW, height: chartH }}>
      <svg className="absolute inset-0 pointer-events-none" width={chartW} height={chartH}>
        {solvedNeeds.map((_, i) => (
          <line key={i}
            x1={nodeW} y1={lNodeCY(i)} x2={midX - kernelR} y2={kernelCY}
            stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"
          />
        ))}
        {partialNeeds.map((_, i) => (
          <line key={i}
            x1={midX + kernelR} y1={kernelCY} x2={rightLeftX} y2={rNodeCY(i)}
            stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="5 3" strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Left — solved */}
      {solvedNeeds.map(({ need, match }, i) => (
        <div key={need.id} className="absolute" style={{ left: 0, top: lNodeY(i), width: nodeW, height: nodeH }}>
          <div className="w-full h-full rounded-xl border-2 border-emerald-400 bg-white shadow-sm p-2 flex flex-col justify-center">
            <div className="flex items-center gap-1 mb-1">
              <CheckCircle size={10} className="text-emerald-500 flex-shrink-0" />
              <span className="text-xs font-bold text-[#1A2340] leading-tight" style={{ fontSize: '10px' }}>
                {need.label.split(' ').slice(0, 3).join(' ')}
              </span>
            </div>
            <span className="text-emerald-600 font-semibold" style={{ fontSize: '10px' }}>{match.score}% match</span>
          </div>
        </div>
      ))}

      {/* Kernel circle */}
      <div className="absolute rounded-full flex flex-col items-center justify-center"
        style={{
          left: midX - kernelR, top: kernelCY - kernelR,
          width: kernelR * 2, height: kernelR * 2,
          background: '#1A2340',
          boxShadow: '0 4px 16px rgba(26,35,64,0.35)',
        }}>
        <Bot size={13} className="text-white mb-0.5" />
        <p className="text-white font-bold text-center leading-tight px-1" style={{ fontSize: '7.5px' }}>
          {agentName.split(' ').slice(0, 2).join(' ')}
        </p>
        <p style={{ fontSize: '6.5px' }} className="text-white/40 mt-0.5">kernel</p>
      </div>

      {/* Right — partial */}
      {partialNeeds.map(({ need, match }, i) => (
        <div key={need.id} className="absolute" style={{ left: rightLeftX, top: rNodeY(i), width: nodeW, height: nodeH }}>
          <div className="w-full h-full rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-2 flex flex-col justify-center">
            <div className="flex items-center gap-1 mb-1">
              <AlertCircle size={10} className="text-amber-500 flex-shrink-0" />
              <span className="text-xs font-bold text-[#1A2340] leading-tight" style={{ fontSize: '10px' }}>
                {need.label.split(' ').slice(0, 3).join(' ')}
              </span>
            </div>
            <span className="text-amber-600 font-semibold" style={{ fontSize: '10px' }}>{match.score}% — gap</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Agent Recommendation Card ────────────────────────────────────────────────

function AgentRecommendationCard({ agentName, agentId, segment, solvedNeeds, partialNeeds, navigate, agentPool = [] }) {
  const [view, setView] = useState(null)  // null | 'flow' | 'detail'
  const color = SEG_COLOR[segment] || '#718096'

  const handleMouseEnter = () => { if (view !== 'detail') setView('flow') }
  const handleMouseLeave = () => { if (view === 'flow') setView(null) }
  const handleClick = () => setView(v => v === 'detail' ? null : 'detail')

  // Build a lookup from the fetched pool — keyed by id
  const agentById = Object.fromEntries(agentPool.map(a => [a.id, a]))

  return (
    <div
      className="card overflow-visible relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ borderLeft: `3px solid ${color}` }}
    >
      {/* Header — always visible */}
      <button
        onClick={handleClick}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
            <Bot size={15} style={{ color }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1A2340]">{agentName}</p>
            <div className="flex items-center gap-2.5 mt-0.5">
              {solvedNeeds.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <CheckCircle size={10} /> {solvedNeeds.length} fully solved
                </span>
              )}
              {partialNeeds.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                  <AlertCircle size={10} /> {partialNeeds.length} partial match
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#9BA8BA]">
          <span>{view === 'detail' ? 'Collapse' : 'Click for detail'}</span>
          <ChevronDown size={13} className={`transition-transform duration-200 ${view === 'detail' ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Flowchart — shown on hover, hidden when detail open */}
      <AnimatePresence>
        {view === 'flow' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[#E2E8F0]"
          >
            <div className="px-4 py-3 bg-[#F7F9FF]">
              <div className="flex items-center mb-3">
                <p className="text-xs font-semibold text-[#4A5568] flex items-center gap-1.5">
                  <GitBranch size={11} /> Agent Coverage Map
                </p>
              </div>
              <div className="flex justify-center overflow-x-auto">
                <AgentFlowChart
                  agentName={agentName}
                  segment={segment}
                  solvedNeeds={solvedNeeds}
                  partialNeeds={partialNeeds}
                />
              </div>
              <div className="flex items-center gap-4 mt-2.5 pt-2 border-t border-[#E2E8F0]">
                <span className="flex items-center gap-1 text-xs text-[#718096]">
                  <span className="inline-block w-5 h-px bg-emerald-400 rounded" /> Fully solved
                </span>
                <span className="flex items-center gap-1 text-xs text-[#718096]">
                  <span className="inline-block w-5 h-0.5 border-t-2 border-dashed border-amber-400" /> Partial match
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail view — shown on click */}
      <AnimatePresence>
        {view === 'detail' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[#E2E8F0]"
          >
            <div className="px-4 py-3 space-y-2">

              {/* Fully solved needs */}
              {solvedNeeds.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <CheckCircle size={10} /> Fully solved by this agent
                  </p>
                  {solvedNeeds.map(({ need, match }) => (
                    <div key={need.id} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 mb-1.5">
                      <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1A2340]">{need.label}</p>
                        <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">{match.solves}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 flex-shrink-0">{match.score}%</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Partial needs */}
              {partialNeeds.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <AlertCircle size={10} /> Partially covered — gaps remain
                  </p>
                  {partialNeeds.map(({ need, match }) => (
                    <div key={need.id} className="px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 mb-1.5">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#1A2340]">{need.label}</p>
                          <p className="text-xs text-amber-700 mt-0.5">{match.solves}</p>
                          <p className="text-xs text-red-500 mt-0.5">⚠ Gap: {match.gap}</p>
                        </div>
                        <span className="text-xs font-bold text-amber-600 flex-shrink-0">{match.score}%</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate('/agent-analyst', { state: { template: agentById[agentId] || { name: agentName } } }) }}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-white border border-amber-300 hover:bg-amber-100 transition-all"
                      >
                        <Edit3 size={10} /> Modify this agent to fill the gap →
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={(e) => { e.stopPropagation(); navigate('/merchant') }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all"
                  style={{ background: color }}
                >
                  <Play size={11} /> Deploy Now
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate('/agent-analyst', { state: { template: agentById[agentId] } }) }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#4A5568] bg-white border border-[#E2E8F0] hover:bg-[#F7F8FA] transition-all"
                >
                  <Edit3 size={11} /> Open in Builder
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

// Deluxe segment name → short key used for color coding
const SEGMENT_KEY = {
  'Merchant Services': 'merchant',
  'Print':             'print',
  'B2B Payments':      'b2b',
  'Data Solutions':    'data',
}

export default function ImagineStudio() {
  const navigate   = useNavigate()
  const { addToast, addConfluencePage, novaSession, setNovaSession, clearNovaSession } = useStore()

  // Restore from Zustand store (persists while tab is open, cleared on refresh)
  const s = novaSession

  const [input, setInput]       = useState('')
  const [phase, setPhase]       = useState(s?.phase ?? 0)
  const [messages, setMessages] = useState(() => s?.messages ?? [])
  const [typing, setTyping]     = useState(false)
  const [buildSugg, setBuildSugg] = useState(s?.buildSugg ?? null)
  const [showDocPreview, setShowDocPreview] = useState(false)
  const [docTitle, setDocTitle]   = useState('')
  const [docDesc,  setDocDesc]    = useState('')
  const [docSysP,  setDocSysP]    = useState('')
  const [novaResults, setNovaResults] = useState(s?.novaResults ?? null)
  const [novaSummary, setNovaSummary] = useState(s?.novaSummary ?? null)
  const [answeredIds, setAnsweredIds] = useState(() => new Set(s?.answeredIds ?? []))
  const [sessionId, setSessionId] = useState(() => s?.sessionId ?? crypto.randomUUID())
  const [agentPool, setAgentPool] = useState([])

  const chatEndRef = useRef(null)
  const inputRef   = useRef(null)

  // Fetch agent pool from backend — single source of truth
  useEffect(() => {
    fetch('/api/nova/agents')
      .then(r => r.ok ? r.json() : [])
      .then(data => setAgentPool(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  // Auto-save session to Zustand on every state change
  useEffect(() => {
    if (phase === 0 && messages.length === 0) return // nothing to save
    setNovaSession({
      phase,
      messages,
      buildSugg,
      novaResults,
      novaSummary,
      sessionId,
      answeredIds: [...answeredIds],
    })
  }, [phase, messages, buildSugg, novaResults, novaSummary])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const pushMsg = (role, content, extra = {}) => {
    setMessages(prev => [...prev, { role, content, ...extra, id: Date.now() + Math.random() }])
  }

  // Strip markdown code fences and try to extract {"type":"report",...} JSON
  const tryParseReport = (msg) => {
    if (!msg) return null
    const stripped = msg.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim()
    const idx = stripped.indexOf('"type"')
    if (idx === -1) return null
    let start = stripped.lastIndexOf('{', idx)
    if (start === -1) return null
    let depth = 0, end = -1
    for (let i = start; i < stripped.length; i++) {
      if (stripped[i] === '{') depth++
      else if (stripped[i] === '}') { depth--; if (depth === 0) { end = i + 1; break } }
    }
    if (end === -1) return null
    try {
      const obj = JSON.parse(stripped.slice(start, end))
      return obj?.type === 'report' ? obj : null
    } catch { return null }
  }

  const callNova = async (displayMessage, apiMessage = null) => {
    setTyping(true)
    try {
      const res = await fetch('/api/nova/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: apiMessage ?? displayMessage }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setTyping(false)

      // Frontend fallback: if server didn't parse the report, try extracting it from raw message
      if (!data.needsAnalysis && data.message) {
        const parsed = tryParseReport(data.message)
        if (parsed) {
          data.needsAnalysis = parsed
          data.message = null
        }
      }

      if (data.needsAnalysis) {
        // Store results immediately, then animate through phases
        setNovaResults(data.needsAnalysis)
        if (data.message) {
          setNovaSummary(data.message)
          pushMsg('nova', data.message)
        }
        setPhase(3)
        setTimeout(() => setPhase(4), 1200)
        setTimeout(() => {
          setPhase(5)
          const na = data.needsAnalysis
          const isNew = na.type === 'report'
          const solved   = isNew ? na.needs.filter(n => n.coverage === 'full').length    : Object.values(na.matches || {}).filter(m => m.status === 'solved').length
          const partial  = isNew ? na.needs.filter(n => n.coverage === 'partial').length : Object.values(na.matches || {}).filter(m => m.status === 'partial').length
          const unsolved = isNew ? na.needs.filter(n => n.coverage === 'none').length    : Object.values(na.matches || {}).filter(m => m.status === 'unsolved').length
          const total    = solved + partial + unsolved
          const scanMsg  = unsolved === total
            ? `Scan complete. No existing agents cover this — **${unsolved} gap${unsolved !== 1 ? 's' : ''} identified**. See the build recommendation on the right →`
            : `Scan complete. Found **${solved} need${solved !== 1 ? 's' : ''} fully covered**, **${partial} partial match${partial !== 1 ? 'es' : ''}**, and **${unsolved} gap${unsolved !== 1 ? 's' : ''}** to build. See the full recommendation on the right →`
          pushMsg('nova', scanMsg)

          const hasBuild = data.needsAnalysis.type === 'report'
            ? !!data.needsAnalysis.build_recommendation
            : (data.needsAnalysis.suggestBuild && data.needsAnalysis.buildSuggestion)
          if (hasBuild) {
            setBuildSugg(data.needsAnalysis.build_recommendation || data.needsAnalysis.buildSuggestion)
            setTimeout(() => {
              pushMsg('nova',
                `I also noticed a gap no existing agent addresses: **${data.needsAnalysis.buildSuggestion}**. Want me to pre-fill the Agent Builder with a recommended spec for this?`,
                { isBuildPrompt: true, suggestion: data.needsAnalysis.buildSuggestion, desc: data.needsAnalysis.buildDesc }
              )
            }, 1000)
          }
        }, 2400)

      } else if (data.options?.length) {
        pushMsg('nova', data.message, { isQuestion: true, options: data.options })
        if (phase < 5) setPhase(1)
      } else {
        pushMsg('nova', data.message || "Let me ask you a few more questions to refine my analysis.")
        if (phase < 5) setPhase(1)
      }
    } catch (err) {
      setTyping(false)
      pushMsg('nova', "I'm having trouble connecting to my analysis engine. Please ensure the Nova service is running (`python server/agent.py`) and AWS Bedrock is configured.")
      setPhase(1)
    }
  }

  const handleSubmit = async () => {
    if (!input.trim() || typing) return
    const text = input.trim()
    setInput('')
    pushMsg('user', text)
    if (phase === 0) setPhase(1)

    // After results are shown, append a silent re-analysis instruction so Nova
    // always produces a fresh <needs_analysis> block with the updated context.
    const apiMsg = phase >= 5
      ? `${text}\n\n[The user has provided additional context after seeing the analysis. Re-evaluate all conversation history plus this new information and produce a complete updated <needs_analysis> block. Do not skip the analysis — always output the full JSON block.]`
      : null

    await callNova(text, apiMsg)
  }

  const handleQuickFind = async () => {
    if (typing) return
    // Mid-conversation with no new input — use existing context to generate report now
    if (!input.trim()) {
      if (phase < 1) return
      const skipMsg = "I have enough context. Please generate the report now."
      pushMsg('user', skipMsg)
      const apiMsg = `[SKIP — generate report now using everything discussed so far. Do NOT ask any more questions. Immediately produce the complete report JSON based on the full conversation context.]`
      await callNova(skipMsg, apiMsg)
      return
    }
    // Has input — send it and skip remaining questions
    const text = input.trim()
    setInput('')
    pushMsg('user', text)
    setPhase(1)
    const apiMsg = `${text}\n\n[SKIP CONVERSATION — The user wants instant results. Do NOT ask any questions. Based solely on this input, immediately produce a complete report JSON with your best-effort analysis. Make reasonable assumptions about scale and segment from the context given.]`
    await callNova(text, apiMsg)
  }

  const handleDownloadReport = () => {
    if (!sc) return
    const isNew = sc.type === 'report'
    const date  = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    // Build agent lookup from pool
    const poolById   = Object.fromEntries(agentPool.map(a => [a.id,   a]))
    const poolByName = Object.fromEntries(agentPool.map(a => [a.name, a]))

    const coverageBadge = (c) => {
      if (c === 'full')    return `<span class="badge badge-green">✓ Fully Covered</span>`
      if (c === 'partial') return `<span class="badge badge-amber">⚠ Partial Match</span>`
      return `<span class="badge badge-red">✗ Gap — Build Needed</span>`
    }

    // ── Section 1: Needs table
    const needs = isNew ? sc.needs : []
    const needsRows = needs.map(n => `
      <tr>
        <td style="font-weight:600;color:#1A2340;">${n.need}</td>
        <td>${n.agent || '<span style="color:#CBD5E0;">—</span>'}</td>
        <td>${coverageBadge(n.coverage)}</td>
        <td style="color:#718096;font-size:12px;">${n.note}</td>
      </tr>`).join('')

    // ── Section 2: Agent cards for matched agents
    const matchedAgentNames = [...new Set(needs.filter(n => n.agent && n.coverage !== 'none').map(n => n.agent))]
    const agentCardsHtml = matchedAgentNames.map(name => {
      const a = poolByName[name]
      if (!a) return ''
      const caps   = (a.capabilities || []).map(c => `<li>${c}</li>`).join('')
      const tools  = (a.tools || []).map(t => `<span class="chip chip-blue">${t}</span>`).join(' ')
      const solves = (a.solves || []).map(s => `<span class="chip chip-green">✓ ${s}</span>`).join(' ')
      const gaps   = (a.doesNotSolve || []).map(g => `<span class="chip chip-red">✗ ${g}</span>`).join(' ')
      const sysprompt = `You are ${a.name}, an AI agent deployed by Deluxe Corporation on the DLX_AGENTIC_OS platform.\n\nSEGMENT: ${a.segment}\nPURPOSE: ${a.description}\n\nYOU ARE AUTHORISED TO:\n${(a.tools||[]).map(t=>`  - ${t}`).join('\n')}\n\nCAPABILITIES:\n${(a.capabilities||[]).map(c=>`  - ${c}`).join('\n')}\n\nYOU MUST NOT:\n  - Take actions outside your authorised tool list\n  - Make financial decisions without human approval\n  - Access data outside your segment scope\n\nAlways log every action with timestamp and rationale. Escalate anomalies immediately.`
      return `
      <div class="agent-card">
        <div class="agent-header">
          <div>
            <div class="agent-name">${a.name}</div>
            <div class="agent-meta">${a.segment} &nbsp;·&nbsp; v${a.version || '—'} &nbsp;·&nbsp; Model: ${a.model || 'claude-sonnet-4-6'} &nbsp;·&nbsp; Trigger: <code>${a.trigger || '—'}</code></div>
          </div>
          <span class="badge ${a.status === 'running' ? 'badge-green' : 'badge-amber'}">${a.status || 'idle'}</span>
        </div>

        <div class="field-label">Description</div>
        <p class="field-value">${a.description}</p>

        <div class="field-label">Capabilities</div>
        <ul class="caps-list">${caps}</ul>

        <div class="two-col">
          <div>
            <div class="field-label">Authorised Tools (Guardrails)</div>
            <div>${tools || '<span style="color:#CBD5E0;">None listed</span>'}</div>
          </div>
          <div>
            <div class="field-label">Success Rate &amp; Deployments</div>
            <p class="field-value">${a.successRate ?? '—'}% success &nbsp;·&nbsp; ${a.deployments ?? '—'} deployments</p>
          </div>
        </div>

        <div class="two-col" style="margin-top:12px;">
          <div>
            <div class="field-label">Solves</div>
            <div>${solves}</div>
          </div>
          <div>
            <div class="field-label">Does Not Solve</div>
            <div>${gaps}</div>
          </div>
        </div>

        <div class="field-label" style="margin-top:14px;">System Prompt</div>
        <pre class="sysprompt">${sysprompt}</pre>
      </div>`
    }).join('')

    // ── Section 3: Build recommendation card
    const buildName = isNew ? sc.build_recommendation?.split(' — ')[0] : sc.buildSuggestion
    const buildDesc = isNew ? sc.build_recommendation?.split(' — ').slice(1).join(' — ') : sc.buildDesc
    const buildNeeds = needs.filter(n => n.coverage === 'none')
    const suggestedTools = buildNeeds.flatMap(n => {
      const kw = n.need.toLowerCase()
      if (kw.includes('invoic') || kw.includes('reconcil')) return ['erp-read','payment-match','gl-write','exception-flag']
      if (kw.includes('fraud') || kw.includes('detect'))   return ['txn-stream','anomaly-detect','hold-trigger']
      if (kw.includes('onboard') || kw.includes('kyb'))    return ['kyb-verify','crm-write','email-send']
      if (kw.includes('churn') || kw.includes('retention'))return ['crm-read','order-history','email-send']
      if (kw.includes('enrich') || kw.includes('data'))    return ['data-fetch','profile-update','signal-score']
      return ['api-read','data-write','notification-send']
    })
    const uniqueTools  = [...new Set(suggestedTools)]
    const suggestedPrompt = buildName ? `You are ${buildName}, an AI agent built for Deluxe Corporation.\n\nPURPOSE: ${buildDesc || 'Automate the identified business process.'}\n\nCORE RESPONSIBILITIES:\n${buildNeeds.map(n=>`  - ${n.need}`).join('\n')}\n\nAUTHORISED TOOLS:\n${uniqueTools.map(t=>`  - ${t}`).join('\n')}\n\nGUARDRAILS:\n  - Only act within your defined tool scope\n  - Flag any anomaly or edge case to a human supervisor\n  - Log every action with timestamp, input, and outcome\n  - Never take irreversible financial actions autonomously\n  - Comply with Deluxe's PCI DSS, SOX, and CCPA policies\n\nOUTPUT FORMAT:\nReturn structured JSON for every action:\n{\n  "action": "<tool-name>",\n  "input": { ... },\n  "rationale": "<one sentence>",\n  "confidence": 0.0-1.0\n}` : ''

    // ── Section 4: Conversation
    const convHtml = messages.filter(m => m.content).map(m => m.role === 'user'
      ? `<div style="margin:8px 0;text-align:right;"><span style="display:inline-block;background:#C8102E;color:#fff;padding:8px 14px;border-radius:16px 16px 4px 16px;font-size:13px;max-width:78%;">${m.content}</span></div>`
      : `<div style="margin:8px 0;"><span style="display:inline-block;background:#F7F8FA;border:1px solid #E2E8F0;color:#1A2340;padding:8px 14px;border-radius:4px 16px 16px 16px;font-size:13px;max-width:85%;">${m.content}</span></div>`
    ).join('')

    const gapsHtml = (isNew && sc.gaps?.length) ? sc.gaps.map(g =>
      `<li>${g}</li>`).join('') : ''

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Nova Agent Discovery Report — ${date}</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1A2340;background:#fff;font-size:13px;}
        .page{max-width:860px;margin:0 auto;padding:44px 52px;}
        /* Cover */
        .cover{border-bottom:3px solid #C8102E;padding-bottom:28px;margin-bottom:36px;}
        .cover-logo{font-size:10px;font-weight:800;letter-spacing:.14em;color:#C8102E;text-transform:uppercase;margin-bottom:10px;}
        h1{font-size:28px;font-weight:800;color:#1A2340;line-height:1.25;margin-bottom:6px;}
        .meta{font-size:12px;color:#9BA8BA;margin-top:6px;}
        /* Sections */
        .section{margin-bottom:36px;}
        .section-title{font-size:10px;font-weight:800;color:#9BA8BA;text-transform:uppercase;letter-spacing:.12em;padding-bottom:8px;border-bottom:1px solid #F0F2F5;margin-bottom:16px;}
        /* Summary */
        .summary-box{background:#F7F9FF;border-left:4px solid #C8102E;padding:16px 20px;border-radius:0 8px 8px 0;font-size:14px;line-height:1.75;color:#1A2340;}
        /* Table */
        table{width:100%;border-collapse:collapse;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;font-size:12px;}
        th{background:#1A2340;color:#fff;padding:9px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;}
        td{padding:10px 12px;border-bottom:1px solid #F0F2F5;vertical-align:top;}
        tr:nth-child(even) td{background:#F7F8FA;}
        /* Badges */
        .badge{padding:2px 9px;border-radius:999px;font-size:10px;font-weight:700;white-space:nowrap;}
        .badge-green{background:#D1FAE5;color:#065F46;}
        .badge-amber{background:#FEF3C7;color:#92400E;}
        .badge-red{background:#FEE2E2;color:#991B1B;}
        /* Chips */
        .chip{display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;margin:2px 2px 2px 0;}
        .chip-blue{background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;}
        .chip-green{background:#F0FDF4;color:#166534;border:1px solid #BBF7D0;}
        .chip-red{background:#FEF2F2;color:#991B1B;border:1px solid #FECACA;}
        /* Agent card */
        .agent-card{border:1px solid #E2E8F0;border-radius:10px;padding:20px 22px;margin-bottom:20px;break-inside:avoid;}
        .agent-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;}
        .agent-name{font-size:16px;font-weight:800;color:#1A2340;margin-bottom:3px;}
        .agent-meta{font-size:11px;color:#9BA8BA;}
        .agent-meta code{background:#F7F8FA;padding:1px 5px;border-radius:4px;font-size:10px;}
        .field-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9BA8BA;margin:12px 0 5px;}
        .field-value{font-size:13px;color:#4A5568;line-height:1.6;}
        .caps-list{padding-left:16px;}
        .caps-list li{font-size:12px;color:#4A5568;margin-bottom:4px;line-height:1.5;}
        .two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:10px;}
        .sysprompt{background:#F7F8FA;border:1px solid #E2E8F0;border-radius:6px;padding:14px 16px;font-size:11px;font-family:'Courier New',monospace;color:#374151;white-space:pre-wrap;line-height:1.6;margin-top:6px;}
        /* Build card */
        .build-card{background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:20px 22px;break-inside:avoid;}
        .build-label{font-size:10px;font-weight:800;color:#D97706;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px;}
        .build-name{font-size:18px;font-weight:800;color:#1A2340;margin-bottom:4px;}
        .build-desc{font-size:13px;color:#4A5568;line-height:1.6;margin-bottom:14px;}
        ul{padding-left:18px;}
        ul li{margin-bottom:6px;font-size:13px;color:#4A5568;line-height:1.6;}
        /* Footer */
        .footer{margin-top:52px;padding-top:14px;border-top:1px solid #E2E8F0;font-size:10px;color:#9BA8BA;display:flex;justify-content:space-between;}
        .print-btn{position:fixed;top:16px;right:16px;background:#C8102E;color:#fff;border:none;padding:8px 18px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;z-index:999;box-shadow:0 2px 8px rgba(0,0,0,.2);}
        .print-btn:hover{background:#a50e26;}
        @media print{
          .print-btn{display:none;}
          body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
          .page{padding:24px 32px;}
          .agent-card,.build-card{break-inside:avoid;}
        }
      </style>
    </head><body>
    <button class="print-btn" onclick="window.print()">🖨 Print / Save PDF</button>
    <div class="page">

      <div class="cover">
        <div class="cover-logo">DLX_AGENTIC_OS — Deluxe Corporation</div>
        <h1>Agent Discovery Report</h1>
        <p class="meta">Generated by Nova &nbsp;·&nbsp; ${date} &nbsp;·&nbsp; Confidential &amp; Internal Use Only</p>
      </div>

      <!-- Problem Summary -->
      <div class="section">
        <div class="section-title">Problem Summary</div>
        <div class="summary-box">${(isNew ? sc.summary : sc.needsTitle) || 'See conversation transcript below.'}</div>
      </div>

      <!-- Needs Analysis Table -->
      ${needsRows ? `<div class="section">
        <div class="section-title">Needs Analysis &amp; Agent Coverage</div>
        <table>
          <thead><tr><th>Need</th><th>Matched Agent</th><th>Coverage</th><th>Notes</th></tr></thead>
          <tbody>${needsRows}</tbody>
        </table>
      </div>` : ''}

      <!-- Matched Agent Detail Cards -->
      ${agentCardsHtml ? `<div class="section">
        <div class="section-title">Matched Agent Specifications</div>
        ${agentCardsHtml}
      </div>` : ''}

      <!-- Gaps -->
      ${gapsHtml ? `<div class="section">
        <div class="section-title">Identified Gaps</div>
        <ul>${gapsHtml}</ul>
      </div>` : ''}

      <!-- Build Recommendation -->
      ${buildName ? `<div class="section">
        <div class="section-title">Build Recommendation</div>
        <div class="build-card">
          <div class="build-label">💡 Recommended Agent to Build</div>
          <div class="build-name">${buildName}</div>
          <div class="build-desc">${buildDesc || ''}</div>

          ${buildNeeds.length ? `
          <div class="field-label">Needs This Agent Must Solve</div>
          <ul>${buildNeeds.map(n=>`<li><strong>${n.need}</strong> — ${n.note}</li>`).join('')}</ul>` : ''}

          <div class="field-label" style="margin-top:14px;">Suggested Authorised Tools (Guardrails)</div>
          <div>${uniqueTools.map(t=>`<span class="chip chip-blue">${t}</span>`).join(' ')}</div>

          <div class="field-label" style="margin-top:14px;">Suggested System Prompt</div>
          <pre class="sysprompt">${suggestedPrompt}</pre>
        </div>
      </div>` : ''}

      <!-- Conversation Transcript -->
      <div class="section">
        <div class="section-title">Full Conversation with Nova</div>
        <div style="background:#F7F8FA;border:1px solid #E2E8F0;border-radius:8px;padding:16px 20px;">${convHtml}</div>
      </div>

      <div class="footer">
        <span>DLX_AGENTIC_OS — Deluxe Corporation &nbsp;·&nbsp; Confidential &amp; Internal Use Only</span>
        <span>Nova Discovery Report &nbsp;·&nbsp; ${date}</span>
      </div>
    </div></body></html>`

    // Open in new tab — no auto-print, no freeze
    const blob    = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url     = URL.createObjectURL(blob)
    const newTab  = window.open()
    if (newTab) {
      newTab.document.open()
      newTab.document.write(html)
      newTab.document.close()
      newTab.document.title = `Nova Report — ${date}`
    }
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }

  const handleSendToConfluence = () => {
    if (!sc) return
    const isNew    = sc.type === 'report'
    const title    = (isNew ? sc.summary : sc.needsTitle)
      ?.replace(/\s*[\(\-—]\s*assuming[^).\n]*/gi, '')
      ?.replace(/\s*\([^)]*\)/g, '')
      ?.trim() || 'Nova Discovery Report'

    // Build description from summary + needs overview
    const needs    = isNew ? (sc.needs || []) : []
    const gaps     = needs.filter(n => n.coverage === 'none')
    const covered  = needs.filter(n => n.coverage === 'full' || n.coverage === 'partial')
    const descParts = [
      sc.summary || sc.needsTitle || '',
      covered.length  ? `Covered by existing agents: ${covered.map(n => n.need).join(', ')}.` : '',
      gaps.length     ? `Gaps requiring new agents: ${gaps.map(n => n.need).join(', ')}.` : '',
    ].filter(Boolean)
    const description = descParts.join(' ')

    // Build system prompt from gaps
    const gapNeeds = gaps.length > 0 ? gaps : needs
    const systemPrompt = `You are an AI agent designed to automate the following business requirement identified via the DLX_AGENTIC_OS Imagination Studio.

BUSINESS PROBLEM: ${title}

YOUR RESPONSIBILITIES:
${gapNeeds.map((n, i) => `  ${i + 1}. ${n.need}${n.note ? ' — ' + n.note : ''}`).join('\n')}

GUARDRAILS:
  - Never take irreversible actions without human approval
  - Log every action with timestamp and rationale
  - Escalate exceptions to the appropriate team immediately
  - Comply with all applicable data handling and compliance requirements

SOURCE: Generated from Nova Discovery session in Imagination Studio`

    const page = {
      id:      `nova-${Date.now()}`,
      title,
      space:   'Imagination Studio',
      updated: 'just now',
      fromNova: true,
      content: { description, systemPrompt },
    }

    addConfluencePage(page)
    addToast({
      type:    'success',
      title:   'Document created in Confluence',
      message: `Opening Agent Analyst to build your agent…`,
    })
    setTimeout(() => navigate('/agent-analyst'), 800)
  }

  const handleOptionClick = async (msgId, answer) => {
    setAnsweredIds(prev => new Set([...prev, msgId]))
    pushMsg('user', answer)
    await callNova(answer)
  }

  const handleBuild = (need) => {
    navigate('/agent-analyst', { state: { prefill: { name: need.label, description: need.detail } } })
  }

  const handleModify = (need) => {
    const match    = novaResults?.matches?.[need.id]
    const template = match?.agentId ? agentPool.find(a => a.id === match.agentId) : null
    if (template) {
      navigate('/agent-analyst', { state: { template } })
    } else {
      navigate('/agent-analyst', { state: { prefill: { name: need.label, description: need.detail } } })
    }
  }

  const handleReset = () => {
    fetch(`/api/nova/session/${sessionId}`, { method: 'DELETE' }).catch(() => {})
    clearNovaSession()
    setSessionId(crypto.randomUUID())
    setPhase(0); setMessages([]); setTyping(false); setBuildSugg(null); setInput('')
    setNovaResults(null); setNovaSummary(null); setAnsweredIds(new Set())
  }

  const sc = novaResults
  // Support both new format {type:"report", needs:[{need,agent,coverage,note}]}
  // and legacy format {needs:[{id,label,detail}], matches:{...}}
  const isNewFormat = sc?.type === 'report'

  const solvedCount   = sc ? (isNewFormat
    ? sc.needs.filter(n => n.coverage === 'full').length
    : Object.values(sc.matches || {}).filter(m => m.status === 'solved').length) : 0
  const partialCount  = sc ? (isNewFormat
    ? sc.needs.filter(n => n.coverage === 'partial').length
    : Object.values(sc.matches || {}).filter(m => m.status === 'partial').length) : 0
  const unsolvedCount = sc ? (isNewFormat
    ? sc.needs.filter(n => n.coverage === 'none').length
    : Object.values(sc.matches || {}).filter(m => m.status === 'unsolved').length) : 0

  const agentSegMap = Object.fromEntries(
    agentPool.map(a => [a.name, SEGMENT_KEY[a.segment] || 'platform'])
  )

  const agentGroups = {}
  if (sc?.needs) {
    if (isNewFormat) {
      sc.needs.forEach((n, i) => {
        if (n.agent && n.coverage !== 'none') {
          if (!agentGroups[n.agent]) {
            agentGroups[n.agent] = {
              agentId: agentPool.find(a => a.name === n.agent)?.id || null,
              segment: agentSegMap[n.agent] || 'platform',
              solved: [], partial: [],
            }
          }
          const needObj  = { id: i, label: n.need, detail: n.note }
          const matchObj = { score: n.coverage === 'full' ? 94 : 70, solves: n.note, gap: n.coverage === 'partial' ? n.note : null }
          if (n.coverage === 'full') agentGroups[n.agent].solved.push({ need: needObj, match: matchObj })
          else agentGroups[n.agent].partial.push({ need: needObj, match: matchObj })
        }
      })
    } else if (sc.matches) {
      sc.needs.forEach(need => {
        const match = sc.matches[need.id]
        if (match?.agentName && match.status !== 'unsolved') {
          if (!agentGroups[match.agentName]) {
            agentGroups[match.agentName] = {
              agentId: match.agentId,
              segment: agentSegMap[match.agentName] || 'platform',
              solved: [], partial: [],
            }
          }
          if (match.status === 'solved') agentGroups[match.agentName].solved.push({ need, match })
          else agentGroups[match.agentName].partial.push({ need, match })
        }
      })
    }
  }

  const unsolvedNeeds = sc?.needs
    ? isNewFormat
      ? sc.needs.filter(n => n.coverage === 'none').map((n, i) => ({ id: i, label: n.need, detail: n.note }))
      : sc.needs.filter(n => sc?.matches?.[n.id]?.status === 'unsolved')
    : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="flex gap-5 h-[calc(100vh-120px)]"
    >
      {/* ── LEFT: Conversation panel ── */}
      <div className="w-[44%] flex flex-col card overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1A2340, #2D3A5C)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Sparkles size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Nova</p>
              <p className="text-white/40 text-xs">Automation Discovery Intelligence</p>
            </div>
          </div>
          {phase > 0 && (
            <button onClick={handleReset} className="flex items-center gap-1 text-white/40 hover:text-white/70 text-xs">
              <RotateCcw size={12} /> Reset
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {/* Idle state */}
          {phase === 0 && messages.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-2">
              <div className="text-center py-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={22} className="text-amber-500" />
                </div>
                <p className="text-sm font-semibold text-[#1A2340]">What business problem are you trying to solve?</p>
                <p className="text-xs text-[#718096] mt-1">Type it in plain English. Nova will find the right agents — or spec out what to build.</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Lightbulb size={11} /> Try an example
                </p>
                <div className="flex flex-col gap-2">
                  {EXAMPLE_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(p)}
                      className="text-left px-3 py-2.5 rounded-xl border border-[#E2E8F0] hover:border-[#C8102E] hover:bg-[#FDF0F2] text-xs text-[#4A5568] transition-all leading-relaxed"
                    >
                      "{p}"
                    </button>
                  ))}
                  <button
                    onClick={() => { setInput(''); setTimeout(() => inputRef.current?.focus(), 50) }}
                    className="text-left px-3 py-2.5 rounded-xl border border-dashed border-[#CBD5E0] hover:border-[#C8102E] hover:bg-[#FDF0F2] text-xs text-[#9BA8BA] hover:text-[#C8102E] transition-all leading-relaxed flex items-center gap-1.5"
                  >
                    <Edit3 size={11} className="flex-shrink-0" /> Something else entirely — describe it below
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Message thread */}
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'user' ? (
                <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm text-white leading-relaxed"
                  style={{ background: '#C8102E' }}>
                  {msg.content}
                </div>
              ) : msg.isQuestion ? (
                <div className="max-w-[90%] w-full">
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-[#E2E8F0] mb-2">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles size={12} className="text-amber-500" />
                      <span className="text-xs font-semibold text-[#718096]">Nova</span>
                    </div>
                    <p className="text-sm text-[#1A2340] leading-relaxed">{msg.content}</p>
                  </div>
                  {!answeredIds.has(msg.id) && (
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {msg.options.map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleOptionClick(msg.id, opt)}
                            className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#4A5568] hover:border-[#C8102E] hover:bg-[#FDF0F2] hover:text-[#C8102E] transition-all"
                          >
                            {opt}
                          </button>
                        ))}
                        <button
                          onClick={() => { setAnsweredIds(prev => new Set([...prev, msg.id])); setTimeout(() => inputRef.current?.focus(), 50) }}
                          className="px-3 py-1.5 rounded-lg border border-dashed border-[#CBD5E0] text-xs font-medium text-[#9BA8BA] hover:border-[#C8102E] hover:bg-[#FDF0F2] hover:text-[#C8102E] transition-all flex items-center gap-1"
                        >
                          <Edit3 size={10} /> Something else — describe below
                        </button>
                      </div>

                      {/* Skip section — separator + skip button */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <div className="flex-1 h-px bg-[#EDF2F7]" />
                        <button
                          onClick={() => {
                            setAnsweredIds(prev => new Set([...prev, msg.id]))
                            handleQuickFind()
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-dashed border-[#C8102E]/30 text-[#C8102E]/70 hover:border-[#C8102E] hover:text-[#C8102E] hover:bg-[#FDF0F2]"
                        >
                          <Search size={10} /> skip chat &amp; find agents instantly
                        </button>
                        <div className="flex-1 h-px bg-[#EDF2F7]" />
                      </div>
                    </div>
                  )}
                </div>
              ) : msg.isBuildPrompt ? (
                <div className="max-w-[90%] w-full">
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles size={12} className="text-amber-500" />
                      <span className="text-xs font-semibold text-amber-600">Nova suggests</span>
                    </div>
                    <p className="text-sm text-[#1A2340] leading-relaxed mb-3">
                      {msg.content.split('**').map((part, i) =>
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                      )}
                    </p>
                    <p className="text-xs text-[#718096] mb-3">{msg.desc}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate('/agent-analyst', { state: { prefill: { name: msg.suggestion, description: msg.desc } } })}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-xs font-semibold"
                        style={{ background: '#C8102E' }}
                      >
                        <Plus size={12} /> Yes, build it
                      </button>
                      <button
                        onClick={() => addToast({ type: 'info', title: 'Noted', message: 'Logged as a feature request.' })}
                        className="px-3 py-2 rounded-lg text-xs font-medium text-[#718096] bg-white border border-[#E2E8F0]"
                      >
                        Submit request
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-[90%] px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-[#E2E8F0]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={12} className="text-amber-500" />
                    <span className="text-xs font-semibold text-[#718096]">Nova</span>
                  </div>
                  <p className="text-sm text-[#1A2340] leading-relaxed">
                    {msg.content.split('**').map((part, i) =>
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    )}
                  </p>
                </div>
              )}
            </motion.div>
          ))}

          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <TypingIndicator />
            </motion.div>
          )}

          {/* Scanning animation */}
          {phase === 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
                <Loader size={13} className="text-emerald-600 animate-spin" />
                <span className="text-xs text-emerald-700 font-medium">Scanning agent pool for matches...</span>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 p-4 border-t border-[#E2E8F0]">
          {/* Refinement chips — shown after results are delivered */}
          {phase >= 5 && !typing && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              <span className="text-xs text-[#9BA8BA] self-center mr-1">Refine:</span>
              {[
                'Add more context',
                'Different segment',
                'Suggest new agents',
                'Re-analyze from scratch',
              ].map(chip => (
                <button
                  key={chip}
                  onClick={() => {
                    if (chip === 'Re-analyze from scratch') {
                      handleReset()
                    } else {
                      setInput(prev => prev ? prev : chip === 'Add more context' ? '' : chip + ' — ')
                      if (chip !== 'Add more context') document.querySelector('textarea')?.focus()
                    }
                  }}
                  className="px-2.5 py-1 rounded-full border border-[#E2E8F0] text-xs text-[#4A5568] hover:border-[#C8102E] hover:text-[#C8102E] hover:bg-[#FDF0F2] transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
              placeholder={phase >= 5 ? 'Add more context to refine the analysis…' : 'Describe your business problem…'}
              rows={2}
              disabled={typing}
              className="flex-1 px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm resize-none focus:outline-none focus:border-[#C8102E] disabled:bg-[#F7F8FA] disabled:text-[#CBD5E0]"
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || typing}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-all"
              style={{ background: '#C8102E' }}
              title="Send message"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Results panel ── */}
      <div className="flex-1 overflow-y-auto">
        {phase === 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="h-full flex flex-col items-center justify-center text-center p-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#F7F8FA] border border-[#E2E8F0] flex items-center justify-center mb-4">
              <Bot size={28} className="text-[#CBD5E0]" />
            </div>
            <p className="font-display text-xl font-bold text-[#1A2340] mb-2">Your discovery results will appear here</p>
            <p className="text-sm text-[#718096] max-w-sm">Start a conversation with Nova. She'll analyze your needs and show you exactly which agents can help — and what to build for the gaps.</p>
          </motion.div>
        )}

        {phase === 1 && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="card p-8 flex flex-col items-center justify-center text-center h-48">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-sm font-semibold text-[#1A2340]">Nova is gathering context</span>
            </div>
            <p className="text-xs text-[#718096]">She'll map your business problem to the right agents once she has enough information.</p>
          </motion.div>
        )}

        {(phase === 3) && sc && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="card p-5">
              <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-3">Building Your Needs Profile</p>
              <div className="flex flex-col gap-2">
                {sc.needs.map((need, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#F7F8FA] border border-[#E2E8F0]">
                    <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                    <p className="text-sm text-[#1A2340] font-medium">{isNewFormat ? need.need : need.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {phase === 4 && sc && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="card p-5">
              <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-3">Building Your Needs Profile</p>
              <div className="flex flex-col gap-2">
                {sc.needs.map((need, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#F7F8FA] border border-[#E2E8F0]">
                    <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                    <p className="text-sm text-[#1A2340] font-medium">{isNewFormat ? need.need : need.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-5 flex items-center gap-3">
              <Loader size={16} className="text-[#C8102E] animate-spin flex-shrink-0" />
              <p className="text-sm text-[#4A5568]">Scanning agent pool for matches...</p>
            </div>
          </motion.div>
        )}

        {phase >= 5 && sc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Summary header */}
            <div className="card p-5" style={{ borderLeft: '4px solid #C8102E' }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A2340] leading-relaxed">
                    {(isNewFormat ? sc.summary : sc.needsTitle)
                      ?.replace(/\s*[\(\-—]\s*assuming[^).\n]*/gi, '')
                      ?.replace(/\s*\([^)]*\)/g, '')
                      ?.trim()}
                  </p>
                  <p className="text-xs text-[#9BA8BA] mt-0.5">Requirements gathered by Nova</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Export Report */}
                  <button
                    onClick={handleDownloadReport}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#4A5568] hover:border-[#C8102E] hover:text-[#C8102E] hover:bg-[#FDF0F2] transition-all"
                    title="Download full report as PDF"
                  >
                    <Download size={12} /> Export Report
                  </button>
                  {/* Build Agent from this Doc */}
                  <button
                    onClick={handleSendToConfluence}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #C8102E)' }}
                    title="Save as Confluence doc and open Agent Analyst to build"
                  >
                    Build Agent from this Doc
                  </button>
                </div>
              </div>

              {/* Requirements summary paragraph */}
              {novaSummary && (
                <p className="text-sm text-[#4A5568] leading-relaxed mb-4 pb-4 border-b border-[#E2E8F0]">
                  {novaSummary}
                </p>
              )}

              {/* Agent pool coverage */}
              <div>
                <p className="text-xs font-semibold text-[#9BA8BA] uppercase tracking-wider mb-2.5">
                  Agent Pool Coverage
                </p>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
                    <CheckCircle size={12} className="text-emerald-500" />
                    {solvedCount} fully solved
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700">
                    <AlertCircle size={12} className="text-amber-500" />
                    {partialCount} partial match
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
                    <XCircle size={12} className="text-red-400" />
                    {unsolvedCount} gap{unsolvedCount !== 1 ? 's' : ''} to build
                  </span>
                </div>
                <p className="text-xs text-[#718096] leading-relaxed">
                  {Object.keys(agentGroups).length > 0
                    ? `${Object.keys(agentGroups).length} agent${Object.keys(agentGroups).length !== 1 ? 's' : ''} from the pool address${Object.keys(agentGroups).length === 1 ? 'es' : ''} ${solvedCount + partialCount} of your ${sc.needs?.length || 5} requirements — ${unsolvedCount > 0 ? `${unsolvedCount} need${unsolvedCount !== 1 ? 's' : ''} require a new agent to be built` : 'all needs are covered'}.`
                    : `No agents in the current pool match your requirements — ${unsolvedCount} new agent${unsolvedCount !== 1 ? 's' : ''} need to be built.`
                  }
                </p>
              </div>
            </div>

            {/* Recommended agents — grouped by agent, hover=flowchart, click=detail */}
            {Object.keys(agentGroups).length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider flex items-center gap-1.5">
                  <Bot size={11} /> Recommended Agents — hover to map, click to expand
                </p>
                {Object.entries(agentGroups).map(([agentName, group]) => (
                  <AgentRecommendationCard
                    key={agentName}
                    agentName={agentName}
                    agentId={group.agentId}
                    segment={group.segment}
                    solvedNeeds={group.solved}
                    partialNeeds={group.partial}
                    navigate={navigate}
                    agentPool={agentPool}
                  />
                ))}
              </div>
            )}

            {/* Unsolved — no matching agent → build from scratch */}
            {unsolvedNeeds.length > 0 && (
              <div className="card p-4">
                <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <XCircle size={11} className="text-red-400" /> No agent match — {unsolvedNeeds.length} gap{unsolvedNeeds.length > 1 ? 's' : ''}
                </p>
                <div className="space-y-2">
                  {unsolvedNeeds.map(need => (
                    <div key={need.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
                      <XCircle size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1A2340]">{need.label}</p>
                        <p className="text-xs text-[#718096] mt-0.5 leading-relaxed">{need.detail}</p>
                        <button
                          onClick={() => navigate('/agent-analyst', { state: { prefill: { name: need.label, description: need.detail } } })}
                          className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg, #1A2340, #2D3A5C)' }}
                        >
                          <Terminal size={11} />
                          Build from scratch
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Build suggestion banner */}
            {buildSugg && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="card p-5 border-amber-200 bg-amber-50"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Lightbulb size={17} className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1A2340]">
                      Suggested: {isNewFormat ? sc.build_recommendation?.split(' — ')[0] : sc.buildSuggestion}
                    </p>
                    <p className="text-xs text-[#718096] mt-1 leading-relaxed">
                      {(isNewFormat ? sc.build_recommendation?.split(' — ').slice(1).join(' — ') : sc.buildDesc)
                        ?.replace(/\s*[\(\-—]\s*assuming[^).\n]*/gi, '')
                        ?.replace(/\s*\([^)]*\)/g, '')
                        ?.trim()}
                    </p>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {/* Preview & Edit toggle */}
                      <button
                        onClick={() => {
                          const name = isNewFormat ? sc.build_recommendation?.split(' — ')[0] : sc.buildSuggestion

                          // Try split first, fallback to full recommendation, then summary
                          const splitDesc = isNewFormat
                            ? sc.build_recommendation?.split(' — ').slice(1).join(' — ')
                            : sc.buildDesc
                          const desc = (splitDesc?.trim()
                            || sc.build_recommendation
                            || sc.summary
                            || '')
                            .replace(/\s*[\(\-—]\s*assuming[^).\n]*/gi, '')
                            .replace(/\s*\([^)]*\)/g, '')
                            .trim()

                          const sysp = `You are ${name}, an AI agent deployed by Deluxe Corporation on the DLX_AGENTIC_OS platform.\n\nPURPOSE: ${desc}\n\nGUARDRAILS:\n  - Never take irreversible actions without human approval\n  - Log every action with timestamp and rationale\n  - Escalate exceptions to the appropriate team immediately\n\nSOURCE: Generated from Nova suggestion in Imagination Studio`
                          setDocTitle(name || 'Nova Suggested Agent')
                          setDocDesc(desc)
                          setDocSysP(sysp)
                          setShowDocPreview(p => !p)
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                        style={{ borderColor: '#7C3AED', color: '#7C3AED', background: '#F5F3FF' }}
                      >
                        <FileText size={11} /> {showDocPreview ? 'Hide Preview' : 'Preview & Edit Doc'}
                      </button>

                      {/* Make Document & Build Agent */}
                      <button
                        onClick={() => {
                          const name = docTitle || (isNewFormat ? sc.build_recommendation?.split(' — ')[0] : sc.buildSuggestion)
                          const desc = docDesc || ''
                          const sysp = docSysP || ''
                          const page = {
                            id: `nova-sugg-${Date.now()}`,
                            title: name,
                            space: 'Imagination Studio',
                            updated: 'just now',
                            fromNova: true,
                            content: { description: desc, systemPrompt: sysp },
                          }
                          addConfluencePage(page)
                          addToast({ type: 'success', title: 'Document created', message: 'Opening Agent Analyst…' })
                          setTimeout(() => navigate('/agent-analyst'), 800)
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg,#7C3AED,#C8102E)' }}
                      >
                        Make Document &amp; Build Agent
                      </button>
                    </div>

                    {/* Inline editable doc preview */}
                    {showDocPreview && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                        className="mt-4 rounded-2xl overflow-hidden shadow-sm"
                        style={{ border: '1px solid #E9D5FF', background: '#fff' }}
                      >
                        {/* Doc header bar */}
                        <div className="flex items-center justify-between px-5 py-3"
                          style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', borderBottom: '1px solid #6D28D9' }}>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
                              <FileText size={13} className="text-white" />
                            </div>
                            <span className="text-xs font-bold text-white tracking-wide">Confluence Document</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">Draft</span>
                            <span className="text-[10px] text-white/60">Imagination Studio · just now</span>
                          </div>
                        </div>

                        {/* Doc body — paper-like */}
                        <div className="p-5 space-y-5" style={{ background: '#FAFAFA' }}>

                          {/* Agent Name — big title input */}
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#7C3AED' }}>
                              Agent Name
                            </p>
                            <input
                              value={docTitle}
                              onChange={e => setDocTitle(e.target.value)}
                              className="w-full bg-transparent border-0 border-b-2 text-lg font-bold text-gray-900 focus:outline-none pb-1"
                              style={{ borderColor: '#E9D5FF' }}
                              onFocus={e => e.target.style.borderColor = '#7C3AED'}
                              onBlur={e => e.target.style.borderColor = '#E9D5FF'}
                            />
                          </div>

                          {/* Divider */}
                          <div className="h-px" style={{ background: '#F3E8FF' }} />

                          {/* Description */}
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#7C3AED' }}>
                              Description
                            </p>
                            <textarea
                              value={docDesc}
                              onChange={e => setDocDesc(e.target.value)}
                              rows={3}
                              placeholder="Describe what this agent does..."
                              className="w-full bg-white rounded-xl border px-4 py-3 text-sm text-gray-700 leading-relaxed focus:outline-none resize-none"
                              style={{ borderColor: '#E9D5FF' }}
                              onFocus={e => e.target.style.borderColor = '#7C3AED'}
                              onBlur={e => e.target.style.borderColor = '#E9D5FF'}
                            />
                          </div>

                          {/* System Prompt */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#7C3AED' }}>
                                System Prompt
                              </p>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                                style={{ background: '#F3E8FF', color: '#7C3AED' }}>
                                {docSysP.length} chars
                              </span>
                            </div>
                            <textarea
                              value={docSysP}
                              onChange={e => setDocSysP(e.target.value)}
                              rows={9}
                              className="w-full bg-white rounded-xl border px-4 py-3 text-xs font-mono text-gray-700 leading-relaxed focus:outline-none resize-none"
                              style={{ borderColor: '#E9D5FF' }}
                              onFocus={e => e.target.style.borderColor = '#7C3AED'}
                              onBlur={e => e.target.style.borderColor = '#E9D5FF'}
                            />
                          </div>

                          {/* Footer note */}
                          <p className="text-[10px] text-gray-400 text-center">
                            ✏️ Edit above then click <strong>Make Document &amp; Build Agent</strong> to save
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
