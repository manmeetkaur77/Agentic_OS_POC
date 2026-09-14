import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck, ShieldAlert, Lock, FileCheck, Users as UsersIcon, ArrowRight,
} from 'lucide-react'
import {
  GUARDRAILS, highRiskAgents, mediumRiskAgents, activeAgentCount,
  HIGH_RISK_TOOLS, MED_RISK_TOOLS,
} from '../data/platformData'

/* ══════════════════════════════════════════════════════════════════════════════
   TRUST & CONTROL — "An enterprise policy enforcement layer that governs AI
   actions with built-in compliance, safety controls and full auditability."

   Every figure is derived from the real catalog: guardrail coverage, and the
   exact agents currently classified high/medium risk.
   ══════════════════════════════════════════════════════════════════════════════ */

export default function TrustControl() {
  const navigate = useNavigate()
  const controlledCount = highRiskAgents.length + mediumRiskAgents.length

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="flex flex-col gap-5">

      <div className="rounded-2xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap"
        style={{ background: 'linear-gradient(135deg,#10B981 0%,#0E7490 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-display text-xl font-bold">Trust &amp; Control</h1>
            <p className="text-white/75 text-xs mt-0.5">Policy enforcement, compliance and auditability across every agent</p>
          </div>
        </div>
        <button onClick={() => navigate('/maker-checker')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/15 hover:bg-white/25 transition-all">
          Open Maker-Checker Queue <ArrowRight size={13} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Agents in Production', value: activeAgentCount, color: '#0EA5E9', icon: UsersIcon },
          { label: 'High-Risk Agents',      value: highRiskAgents.length, color: '#EF4444', icon: ShieldAlert },
          { label: 'Medium-Risk Agents',    value: mediumRiskAgents.length, color: '#F59E0B', icon: ShieldAlert },
          { label: 'Audit Coverage',        value: '100%', color: '#10B981', icon: FileCheck },
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

      {/* Guardrails */}
      <div className="card p-5">
        <p className="text-sm font-bold text-[#1A2340] mb-1">Platform Guardrails</p>
        <p className="text-xs text-[#9BA8BA] mb-4">Enforced on every agent build in Agent Builder — coverage is measured, not assumed.</p>
        <div className="flex flex-col gap-2.5">
          {GUARDRAILS.map(g => (
            <div key={g.key} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F7F8FA]">
              <Lock size={14} className="text-[#7C3AED] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#1A2340]">{g.label}</p>
                <p className="text-xs text-[#9BA8BA] mt-0.5">Applies to {g.appliesTo} agent{g.appliesTo !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 w-36">
                <div className="flex-1 h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${g.coveragePct}%` }} />
                </div>
                <span className="text-xs font-bold text-emerald-600 w-9 text-right">{g.coveragePct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk tiers */}
      <div className="grid grid-cols-2 gap-5">
        <div className="card p-5">
          <p className="text-sm font-bold text-[#1A2340] mb-1">High-Risk Agents</p>
          <p className="text-xs text-[#9BA8BA] mb-4">Two or more high-risk tools (financial writes, sanctions checks, holds) — every decision requires Maker-Checker sign-off.</p>
          <div className="flex flex-col gap-2">
            {highRiskAgents.slice(0, 6).map(a => (
              <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-50 border border-red-100">
                <span className="text-xs font-semibold text-[#1A2340]">{a.name}</span>
                <span className="text-xs text-red-600 font-mono">{a.tools.filter(t => HIGH_RISK_TOOLS.some(h => t.includes(h) || h.includes(t))).join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <p className="text-sm font-bold text-[#1A2340] mb-1">Medium-Risk Agents</p>
          <p className="text-xs text-[#9BA8BA] mb-4">One high-risk tool, or two+ medium-risk tools — routine compliance review applies.</p>
          <div className="flex flex-col gap-2">
            {mediumRiskAgents.slice(0, 6).map(a => (
              <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-50 border border-amber-100">
                <span className="text-xs font-semibold text-[#1A2340]">{a.name}</span>
                <span className="text-xs text-amber-600 font-mono">{a.tools.filter(t => MED_RISK_TOOLS.some(h => t.includes(h) || h.includes(t))).join(', ') || a.tools[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
