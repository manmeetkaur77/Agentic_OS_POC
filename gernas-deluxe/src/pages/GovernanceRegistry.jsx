import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, CheckCircle, XCircle, ChevronDown, ChevronUp, Download } from 'lucide-react'
import useStore from '../store/useStore'

const FRAMEWORKS = [
  { label: 'PCI DSS v4.0', desc: 'Payment security',     color: '#0EA5E9' },
  { label: 'SOX',          desc: 'Financial controls',    color: '#8B5CF6' },
  { label: 'BSA / AML',    desc: 'Anti-money laundering', color: '#C8102E' },
  { label: 'NACHA',        desc: 'ACH payment rules',     color: '#F59E0B' },
  { label: 'CCPA',         desc: 'Data privacy',          color: '#10B981' },
  { label: 'SOC 2 Type II',desc: 'Security & uptime',     color: '#6366F1' },
]

const AGENTS = [
  {
    name: 'SMB Onboarding Agent',        segment: 'Merchant',  riskLevel: 'medium', version: '2.1.4', owner: 'Merchant Ops',    lastAudit: '2024-05-19', frameworks: ['PCI DSS v4.0', 'BSA / AML'],
    permitted:        ['kyb-verify', 'crm-write', 'email-send', 'terminal-config'],
    requiresApproval: ['bank-debit', 'account-suspend'],
    autonomous:       ['document-parse', 'status-update', 'notification-send'],
  },
  {
    name: 'Fraud Detection Agent',        segment: 'Merchant',  riskLevel: 'high',   version: '5.1.0', owner: 'Risk & Compliance', lastAudit: '2024-05-19', frameworks: ['PCI DSS v4.0', 'BSA / AML', 'SOX'],
    permitted:        ['txn-stream', 'anomaly-detect', 'hold-trigger', 'compliance-alert'],
    requiresApproval: ['account-freeze', 'sar-file', 'law-enforcement-notify'],
    autonomous:       ['flag', 'score', 'alert-internal', 'hold-temporary'],
  },
  {
    name: 'Invoice Reconciliation Agent', segment: 'B2B',       riskLevel: 'high',   version: '3.0.1', owner: 'Finance Ops',     lastAudit: '2024-05-18', frameworks: ['SOX', 'NACHA'],
    permitted:        ['erp-read', 'payment-match', 'gl-write', 'exception-flag'],
    requiresApproval: ['payment-void', 'credit-memo', 'write-off'],
    autonomous:       ['invoice-read', 'match-score', 'exception-log'],
  },
  {
    name: 'Churn Prevention Agent',       segment: 'Print',     riskLevel: 'low',    version: '1.8.2', owner: 'Print Revenue',   lastAudit: '2024-05-19', frameworks: ['CCPA', 'SOC 2 Type II'],
    permitted:        ['crm-read', 'email-send', 'sales-alert', 'order-history'],
    requiresApproval: ['discount-apply', 'contract-extend'],
    autonomous:       ['risk-score', 'segment-tag', 'alert-route'],
  },
  {
    name: 'Data Enrichment Agent',        segment: 'Data',      riskLevel: 'low',    version: '4.2.0', owner: 'Data Platform',   lastAudit: '2024-05-19', frameworks: ['CCPA', 'SOC 2 Type II'],
    permitted:        ['data-fetch', 'profile-update', 'warehouse-write', 'signal-score'],
    requiresApproval: [],
    autonomous:       ['enrich', 'dedupe', 'quality-score', 'refresh-trigger'],
  },
  {
    name: 'Upsell Intelligence Agent',    segment: 'Print',     riskLevel: 'low',    version: '1.2.0', owner: 'Sales Ops',       lastAudit: '2024-05-17', frameworks: ['CCPA', 'SOC 2 Type II'],
    permitted:        ['crm-read', 'propensity-score', 'proposal-gen', 'sales-route'],
    requiresApproval: ['sales-route'],
    autonomous:       ['score', 'rank', 'generate-brief'],
  },
]


const SEG_COLOR  = { Merchant: '#0EA5E9', Print: '#6B7280', B2B: '#8B5CF6', Data: '#10B981' }
const RISK_STYLE = {
  low:    { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  medium: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  high:   { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
}

export default function GovernanceRegistry() {
  const { addToast } = useStore()
  const [expanded, setExpanded] = useState(null)
  const doExport = () => addToast({ type: 'success', title: 'Export initiated', message: 'Audit log sent to compliance@deluxe.com' })

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-[#1A2340]">Agent Governance & Compliance</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
          <Shield size={15} className="text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-700">All Frameworks Compliant</span>
        </div>
      </div>

      {/* Compliance frameworks */}
      <div className="grid grid-cols-6 gap-3">
        {FRAMEWORKS.map(f => (
          <div key={f.label} className="card p-3 flex flex-col items-center text-center gap-1.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${f.color}15` }}>
              <CheckCircle size={14} style={{ color: f.color }} />
            </div>
            <p className="text-xs font-bold text-[#1A2340] leading-tight">{f.label}</p>
            <p className="text-[10px] text-[#9BA8BA]">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Agent Registry */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#1A2340]">Agent Registry</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9BA8BA]">Click a row to see permissions</span>
          </div>
        </div>

        <div className="divide-y divide-[#F0F2F5]">
          {AGENTS.map(agent => {
            const isOpen = expanded === agent.name
            const risk   = RISK_STYLE[agent.riskLevel]
            const segC   = SEG_COLOR[agent.segment] || '#718096'
            return (
              <div key={agent.name} style={{ borderLeft: `3px solid ${segC}` }}>
                <button className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-[#F7F9FF] transition-colors"
                  onClick={() => setExpanded(isOpen ? null : agent.name)}>
                  {/* Name + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-[#1A2340]">{agent.name}</p>
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: segC + '18', color: segC }}>{agent.segment}</span>
                      <span className="px-1.5 py-0.5 rounded text-xs font-bold border" style={{ background: risk.bg, color: risk.text, borderColor: risk.border }}>{agent.riskLevel} risk</span>
                    </div>
                    <p className="text-xs text-[#9BA8BA]">v{agent.version} · {agent.owner} · Audited {agent.lastAudit}</p>
                  </div>
                  {/* Framework tags */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {agent.frameworks.map(fw => (
                      <span key={fw} className="px-1.5 py-0.5 rounded text-xs bg-[#F7F8FA] border border-[#E2E8F0] text-[#4A5568]">{fw}</span>
                    ))}
                    {isOpen ? <ChevronUp size={14} className="text-[#9BA8BA] ml-1" /> : <ChevronDown size={14} className="text-[#9BA8BA] ml-1" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="px-4 pb-4 pt-3 bg-[#F7F9FF] grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1"><CheckCircle size={11} /> Permitted</p>
                          <div className="flex flex-wrap gap-1">
                            {agent.permitted.map(p => <span key={p} className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-mono">{p}</span>)}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1"><XCircle size={11} /> Requires Approval</p>
                          {agent.requiresApproval.length > 0
                            ? <div className="flex flex-wrap gap-1">{agent.requiresApproval.map(p => <span key={p} className="px-2 py-0.5 rounded bg-red-50 border border-red-200 text-xs text-red-700 font-mono">{p}</span>)}</div>
                            : <p className="text-xs text-[#9BA8BA]">None required</p>}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-blue-600 mb-2 flex items-center gap-1"><CheckCircle size={11} /> Autonomous</p>
                          <div className="flex flex-wrap gap-1">
                            {agent.autonomous.map(p => <span key={p} className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-xs text-blue-700 font-mono">{p}</span>)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>


    </motion.div>
  )
}
