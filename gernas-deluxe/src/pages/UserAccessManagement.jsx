import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { KeyRound, Shield, Hammer, CheckCircle2, ArrowRight } from 'lucide-react'
import { AUTHOR_STATS } from '../data/platformData'

/* ══════════════════════════════════════════════════════════════════════════════
   USER & ACCESS MANAGEMENT — "Access control layer enforcing role-based
   permissions for users to build, run, approve and manage agents, workflows
   and tools."

   The user list is the same six people already credited as authors on real
   agents/tools/workflows throughout Discover Hub — not a separate invented cast.
   ══════════════════════════════════════════════════════════════════════════════ */

const ROLE_STYLE = {
  Admin:    { bg: '#F5F3FF', text: '#6D28D9', badge: 'bg-violet-100 text-violet-700' },
  Approver: { bg: '#EFF6FF', text: '#1D4ED8', badge: 'bg-blue-100 text-blue-700' },
  Builder:  { bg: '#ECFDF5', text: '#047857', badge: 'bg-emerald-100 text-emerald-700' },
}

const PERMISSIONS = [
  { role: 'Admin',    can: ['Build agents & workflows', 'Approve for production', 'Manage users & access', 'Configure OS Console'] },
  { role: 'Approver', can: ['Build agents & workflows', 'Approve for production', 'Review Maker-Checker queue'] },
  { role: 'Builder',  can: ['Build agents & workflows', 'Submit for approval', 'Run in non-prod'] },
]

export default function UserAccessManagement() {
  const navigate = useNavigate()

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="flex flex-col gap-5">

      <div className="rounded-2xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap"
        style={{ background: 'linear-gradient(135deg,#1A2340 0%,#0F1730 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <KeyRound size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-display text-xl font-bold">User &amp; Access Management</h1>
            <p className="text-white/50 text-xs mt-0.5">Role-based permissions to build, run, approve and manage agents, workflows and tools</p>
          </div>
        </div>
        <button onClick={() => navigate('/agent-pool')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10">
          View Authored Work <ArrowRight size={13} />
        </button>
      </div>

      {/* Roles */}
      <div className="grid grid-cols-3 gap-4">
        {PERMISSIONS.map(p => {
          const rs = ROLE_STYLE[p.role]
          const Icon = p.role === 'Admin' ? Shield : p.role === 'Approver' ? CheckCircle2 : Hammer
          return (
            <div key={p.role} className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: rs.bg }}>
                  <Icon size={14} style={{ color: rs.text }} />
                </div>
                <p className="text-sm font-bold text-[#1A2340]">{p.role}</p>
              </div>
              <ul className="space-y-1.5">
                {p.can.map(c => (
                  <li key={c} className="text-xs text-[#4A5568] flex items-start gap-1.5">
                    <CheckCircle2 size={11} className="text-emerald-500 mt-0.5 flex-shrink-0" /> {c}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Users */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0]">
          <p className="text-sm font-bold text-[#1A2340]">Users</p>
          <p className="text-xs text-[#9BA8BA] mt-0.5">Every user here has authored real agents, tools or workflows visible in Discover Hub.</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[#9BA8BA] uppercase tracking-wider border-b border-[#F0F2F5]">
              <th className="px-5 py-2.5 font-semibold">User</th>
              <th className="px-5 py-2.5 font-semibold">Role</th>
              <th className="px-5 py-2.5 font-semibold">Agents</th>
              <th className="px-5 py-2.5 font-semibold">Workflows</th>
              <th className="px-5 py-2.5 font-semibold">Tools</th>
              <th className="px-5 py-2.5 font-semibold text-right">Total Artifacts</th>
            </tr>
          </thead>
          <tbody>
            {AUTHOR_STATS.map(u => {
              const rs = ROLE_STYLE[u.role]
              return (
                <tr key={u.name} className="border-b border-[#F7F8FA] last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#1A2340' }}>
                        {u.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <span className="text-xs font-semibold text-[#1A2340]">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${rs.badge}`}>{u.role}</span></td>
                  <td className="px-5 py-3 text-xs text-[#4A5568]">{u.agents.length}</td>
                  <td className="px-5 py-3 text-xs text-[#4A5568]">{u.workflows.length}</td>
                  <td className="px-5 py-3 text-xs text-[#4A5568]">{u.tools.length}</td>
                  <td className="px-5 py-3 text-right text-xs font-bold text-[#1A2340]">{u.total}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
