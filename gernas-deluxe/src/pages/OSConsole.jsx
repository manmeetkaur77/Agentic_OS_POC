import { motion } from 'framer-motion'
import {
  Terminal, Cpu, Globe, CheckCircle2, Server, Activity, Database,
} from 'lucide-react'
import {
  TOOLS_MCP, connectedTools, activeAgentCount, dailyExecutions,
  avgAccuracy, formatCompact,
} from '../data/platformData'

/* ══════════════════════════════════════════════════════════════════════════════
   OS CONSOLE — "Core administrative console for configuration, observability
   and platform health." Model config mirrors what's actually set in
   server/.env (region, model, token limits) — not invented values.
   ══════════════════════════════════════════════════════════════════════════════ */

const MODEL_CONFIG = [
  { label: 'Foundation Model', value: 'Claude Sonnet 4.5' },
  { label: 'Region',           value: 'us-east-1' },
  { label: 'Max Tokens',       value: '8,192' },
  { label: 'Temperature',      value: '0.0 (deterministic)' },
]

const categoryCounts = TOOLS_MCP.filter(t => t.status === 'connected').reduce((acc, t) => {
  acc[t.category] = (acc[t.category] || 0) + 1
  return acc
}, {})

export default function OSConsole() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="flex flex-col gap-5">

      <div className="rounded-2xl px-6 py-5 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg,#1A2340 0%,#0F1730 100%)' }}>
        <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <Terminal size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-white font-display text-xl font-bold">OS Console</h1>
          <p className="text-white/50 text-xs mt-0.5">Core administration for configuration, observability and platform health</p>
        </div>
      </div>

      {/* Platform health */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Agents',     value: activeAgentCount,          color: '#0EA5E9', icon: Cpu },
          { label: 'Daily Executions',  value: `${formatCompact(dailyExecutions)}+`, color: '#10B981', icon: Activity },
          { label: 'Avg Accuracy',      value: `${avgAccuracy.toFixed(1)}%`, color: '#7C3AED', icon: CheckCircle2 },
          { label: 'Connected Integrations', value: connectedTools, color: '#F59E0B', icon: Server },
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

      <div className="grid grid-cols-2 gap-5">
        {/* Model config */}
        <div className="card p-5">
          <p className="text-sm font-bold text-[#1A2340] mb-1 flex items-center gap-2"><Cpu size={14} className="text-[#7C3AED]" /> Foundation Model Configuration</p>
          <p className="text-xs text-[#9BA8BA] mb-4">Every agent in Agent Builder and Imagination Studio runs on this configuration via MAF ADK 2.5.</p>
          <div className="flex flex-col gap-2">
            {MODEL_CONFIG.map(c => (
              <div key={c.label} className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#F7F8FA]">
                <span className="text-xs text-[#718096]">{c.label}</span>
                <span className="text-xs font-mono font-semibold text-[#1A2340]">{c.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Integrations */}
        <div className="card p-5">
          <p className="text-sm font-bold text-[#1A2340] mb-1 flex items-center gap-2"><Globe size={14} className="text-[#0EA5E9]" /> Integration Health</p>
          <p className="text-xs text-[#9BA8BA] mb-4">Live status of every tool/MCP category registered in Discover Hub.</p>
          <div className="flex flex-col gap-2">
            {Object.entries(categoryCounts).map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#F7F8FA]">
                <span className="text-xs text-[#718096] flex items-center gap-1.5"><Database size={11} className="text-[#9BA8BA]" /> {cat}</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-xs font-semibold text-[#1A2340]">{count} connected</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Environment */}
      <div className="card p-5">
        <p className="text-sm font-bold text-[#1A2340] mb-4">Environment</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
            <p className="text-xs text-[#718096]">Environment</p>
            <p className="text-sm font-bold text-emerald-700 mt-0.5">Production</p>
          </div>
          <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
            <p className="text-xs text-[#718096]">Platform Version</p>
            <p className="text-sm font-bold text-[#1A2340] mt-0.5">DLX_AGENTIC_OS v1.0</p>
          </div>
          <div className="rounded-xl bg-purple-50 border border-purple-100 px-4 py-3">
            <p className="text-xs text-[#718096]">Agent Framework</p>
            <p className="text-sm font-bold text-[#1A2340] mt-0.5">MAF ADK 2.5</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
