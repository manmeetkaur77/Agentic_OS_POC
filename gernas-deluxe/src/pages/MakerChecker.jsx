import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Users, ShieldAlert, CheckCircle2, XCircle, Clock, Bot,
  ArrowRight, History, AlertTriangle,
} from 'lucide-react'
import useStore from '../store/useStore'
import { highRiskAgents, mediumRiskAgents, agentByName } from '../data/platformData'

/* ══════════════════════════════════════════════════════════════════════════════
   MAKER-CHECKER (HITL) — "Human-in-the-loop approval queue for high-risk or
   regulated agent decisions." Distinct from Approval Centre: that page approves
   AGENTS/WORKFLOWS for deployment; this page approves individual RUNTIME
   DECISIONS a live agent wants to take before it's allowed to execute them.

   The maker (agent) proposing each decision is real — pulled from the same
   high/medium-risk agents Trust & Control tracks — so this queue can't invent
   an agent that doesn't exist in the catalog.
   ══════════════════════════════════════════════════════════════════════════════ */

const riskPool = [...highRiskAgents, ...mediumRiskAgents]

// One plausible proposed action per real agent, grounded in that agent's actual tools/description
const PROPOSAL_TEMPLATES = {
  'GL Posting Agent':           { action: 'Post $84,200 in matched invoices to General Ledger', tool: 'gl-write' },
  'Wire Transfer Verifier':     { action: 'Release wire transfer WT-88213 ($142,000) after sanctions clear', tool: 'sanctions-check' },
  'Fraud Detection Agent':      { action: 'Place hold on Merchant #4821 — anomalous transaction velocity', tool: 'hold-trigger' },
  'KYB Verification Agent':     { action: 'Approve business verification for Sunrise Bakery LLC', tool: 'sanctions-check' },
  'ACH Payment Processor':      { action: 'Batch-release 340 ACH credits totalling $612,400', tool: 'ach-gateway' },
  'Risk Scoring Engine':        { action: 'Auto-decline merchant application — risk score 82/100', tool: 'risk-model' },
  'Merchant KYC/AML Agent':     { action: 'Escalate account for enhanced due diligence review', tool: 'aml-screen' },
  'Dispute Resolution Agent':   { action: 'Issue chargeback reversal of $2,340 to cardholder', tool: 'dispute-api' },
}

const buildQueue = () => riskPool
  .filter(a => PROPOSAL_TEMPLATES[a.name])
  .map(a => ({
    id: a.id, agent: a.name, tier: a.category, tasksToday: a.tasksToday,
    ...PROPOSAL_TEMPLATES[a.name],
    status: 'pending',
  }))

export default function MakerChecker() {
  const navigate = useNavigate()
  const { addToast } = useStore()
  const [queue, setQueue] = useState(buildQueue)
  const [history, setHistory] = useState([])

  const decide = (item, decision) => {
    setQueue(prev => prev.filter(q => q.id !== item.id))
    setHistory(prev => [{ ...item, status: decision, decidedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...prev].slice(0, 8))
    addToast({
      type: decision === 'approved' ? 'success' : 'info',
      title: decision === 'approved' ? 'Decision approved' : 'Decision rejected',
      message: `${item.agent}'s proposal has been ${decision}.`,
    })
  }

  const pendingCount = queue.length
  const approvedToday = history.filter(h => h.status === 'approved').length
  const rejectedToday = history.filter(h => h.status === 'rejected').length

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="flex flex-col gap-5">

      {/* Header */}
      <div className="rounded-2xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap"
        style={{ background: 'linear-gradient(135deg,#1A2340 0%,#2D3A5C 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-display text-xl font-bold">Maker-Checker</h1>
            <p className="text-white/50 text-xs mt-0.5">Human-in-the-loop approval for high-risk or regulated agent decisions</p>
          </div>
        </div>
        <button onClick={() => navigate('/trust-control')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10">
          <ShieldAlert size={13} /> View Trust &amp; Control
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Pending Decisions', value: pendingCount, color: '#F59E0B', icon: Clock },
          { label: 'Approved Today',    value: approvedToday, color: '#10B981', icon: CheckCircle2 },
          { label: 'Rejected Today',    value: rejectedToday, color: '#EF4444', icon: XCircle },
          { label: 'Agents Under Review', value: riskPool.length, color: '#7C3AED', icon: Bot },
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

      {/* Queue */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-bold text-[#1A2340]">Pending Decisions</p>
            <p className="text-xs text-[#9BA8BA] mt-0.5">The "maker" (agent) proposes an action; a human "checker" approves or rejects before it executes.</p>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {queue.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
              <CheckCircle2 size={26} className="text-emerald-300 mx-auto mb-2" />
              <p className="text-sm text-[#9BA8BA]">Queue is clear — every high-risk decision has been reviewed.</p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3">
              {queue.map(item => (
                <motion.div key={item.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }}
                  className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#1A2340] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot size={16} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#1A2340]">{item.agent}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-amber-200 text-amber-700">{item.tool}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">{item.tier}</span>
                        </div>
                        <p className="text-sm text-[#1A2340] mt-1 leading-snug">{item.action}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => decide(item, 'approved')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-all">
                        <CheckCircle2 size={12} /> Approve
                      </button>
                      <button onClick={() => decide(item, 'rejected')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-all">
                        <XCircle size={12} /> Reject
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Decision history */}
      {history.length > 0 && (
        <div className="card p-5">
          <p className="text-sm font-bold text-[#1A2340] mb-3 flex items-center gap-2"><History size={14} className="text-[#9BA8BA]" /> Recent Decisions</p>
          <div className="flex flex-col gap-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#F7F8FA]">
                {h.status === 'approved'
                  ? <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                  : <XCircle size={14} className="text-red-500 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1A2340] truncate">{h.agent} <span className="text-[#9BA8BA] font-normal">— {h.action}</span></p>
                </div>
                <span className="text-[10px] text-[#9BA8BA] flex-shrink-0">{h.decidedAt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cross-link */}
      <button onClick={() => navigate('/incident-management')}
        className="self-start flex items-center gap-1.5 text-xs text-[#718096] hover:text-[#1A2340] transition-all">
        <AlertTriangle size={12} /> Rejected decisions are logged in Incident Management <ArrowRight size={11} />
      </button>
    </motion.div>
  )
}
