import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'
import {
  FileText, BookOpen, Briefcase, Layout, Code2, FlaskConical,
  HelpCircle, MessageSquare, ChevronLeft, Search, ExternalLink,
  Sparkles, Bot, RefreshCw, ChevronRight, Cpu, Zap, Lock,
  CheckCircle, AlertCircle, X
} from 'lucide-react'

// ─── SiriusAI-style tools list (same as original, Agent Analyst added on top) ──
const TOOLS = [
  { id: 'brd',           label: 'BRD Assistant',      sub: 'Create & manage BRDs',             icon: FileText    },
  { id: 'confluence',    label: 'Confluence',          sub: 'Browse & integrate docs',          icon: BookOpen    },
  { id: 'jira',          label: 'Jira',                sub: 'Project tracking & issues',        icon: Briefcase   },
  { id: 'architecture',  label: 'Architecture',        sub: 'Technical architecture planning',  icon: Layout      },
  { id: 'pair-prog',     label: 'Pair Programming',    sub: 'MCP setup & IDE integration',      icon: Code2       },
  {
    id: 'agent-analyst',
    label: 'Agent Analyst',
    sub: 'Build agents from docs',
    icon: Bot,
    isNew: true,
  },
  { id: 'testing',       label: 'Testing',             sub: 'Test scenarios & Katalon pipeline',icon: FlaskConical},
]

// ─── Mock Confluence pages for Deluxe Corp ────────────────────────────────────
const CONFLUENCE_PAGES = [
  {
    id: 'p1',
    title: 'SMB Merchant Onboarding — Process BRD',
    space: 'Merchant Services',
    updated: '2 days ago',
    content: {
      description: 'Automates the full SMB merchant onboarding lifecycle — from application submission to first live transaction. Handles KYB verification, risk scoring, terminal provisioning, document collection, and banking account verification.',
      systemPrompt: `You are the SMB Onboarding Agent deployed by Deluxe Corporation on the DLX_AGENTIC_OS platform.

SEGMENT: Merchant Services
PURPOSE: Automate the SMB merchant onboarding lifecycle end-to-end.

YOUR RESPONSIBILITIES:
  - Run KYB (Know Your Business) verification against government and commercial databases
  - Score merchant risk across 12 signals: credit, fraud history, industry risk
  - Provision and configure payment terminals
  - Collect, validate, and store onboarding documents securely
  - Verify banking accounts via micro-deposit

AUTHORISED TOOLS:
  - kyb-verify, crm-write, email-send, terminal-config, bank-verify

GUARDRAILS:
  - Never approve an application with risk score > 85 without human review
  - Log every verification step with timestamp and rationale
  - Escalate SAR-level flags to Compliance immediately
  - Comply with PCI DSS v4.0 and BSA/AML requirements`,
    },
  },
  {
    id: 'p2',
    title: 'Invoice Reconciliation — Finance Ops Spec',
    space: 'B2B Payments',
    updated: '5 days ago',
    content: {
      description: 'Eliminates manual invoice-to-payment matching across multiple ERP systems. Auto-posts matched transactions to the GL and flags exceptions for human review. Integrates natively with SAP, Oracle, and NetSuite.',
      systemPrompt: `You are the Invoice Reconciliation Agent deployed by Deluxe Corporation.

SEGMENT: B2B Payments
PURPOSE: Automate invoice-to-payment matching and GL posting across ERP systems.

YOUR RESPONSIBILITIES:
  - Match invoices to payments across SAP, Oracle, and NetSuite
  - Flag unmatched items with suggested resolution
  - Write journal entries to General Ledger
  - Provide real-time reconciliation with full audit trail

AUTHORISED TOOLS:
  - erp-read, payment-match, gl-write, exception-flag

GUARDRAILS:
  - Never write-off amounts > $10,000 without CFO approval
  - All GL postings require dual-control verification
  - Comply with SOX Section 302 and NACHA operating rules
  - Maintain immutable audit log for every transaction`,
    },
  },
  {
    id: 'p3',
    title: 'Churn Prevention — Print Revenue Playbook',
    space: 'Print & Retention',
    updated: '1 week ago',
    content: {
      description: 'Monitors print customer order patterns to detect early churn signals (60+ days out) and automatically triggers retention campaigns before customers leave. Scores risk based on purchase frequency, recency, and product mix.',
      systemPrompt: `You are the Churn Prevention Agent deployed by Deluxe Corporation.

SEGMENT: Print & Retention
PURPOSE: Detect churn signals early and trigger automated retention campaigns.

YOUR RESPONSIBILITIES:
  - Monitor order frequency and recency across all print customers
  - Score churn risk using purchase pattern analysis
  - Execute targeted email retention campaigns
  - Escalate high-value at-risk accounts to sales team

AUTHORISED TOOLS:
  - crm-read, order-history, email-send, sales-alert

GUARDRAILS:
  - Never apply discounts > 20% without Sales VP approval
  - Respect customer communication preferences and opt-outs
  - Comply with CCPA data handling requirements
  - Campaign sends limited to 3 per customer per 30-day window`,
    },
  },
  {
    id: 'p4',
    title: 'Fraud Detection — Real-Time Risk Architecture',
    space: 'Merchant Services',
    updated: '3 days ago',
    content: {
      description: 'Provides sub-second real-time fraud detection across the merchant transaction stream with 99.8% accuracy. Automatically holds suspicious accounts and generates compliance reports for BSA/AML requirements.',
      systemPrompt: `You are the Fraud Detection Agent deployed by Deluxe Corporation.

SEGMENT: Merchant Services
PURPOSE: Real-time fraud detection and automated compliance response.

YOUR RESPONSIBILITIES:
  - Monitor live transaction stream for anomaly signals
  - Hold accounts on high-confidence fraud detection (>95% threshold)
  - Generate compliance alerts and regulatory notifications
  - Maintain SAR documentation for BSA/AML requirements

AUTHORISED TOOLS:
  - txn-stream, anomaly-detect, hold-trigger, compliance-alert

GUARDRAILS:
  - Account freeze requires confidence score > 0.95
  - SAR filing must be reviewed by Compliance Officer before submission
  - Never notify law enforcement directly — escalate to Legal
  - Comply with PCI DSS v4.0, BSA/AML, and SOX`,
    },
  },
  {
    id: 'p5',
    title: 'Data Enrichment — SMB Profile Pipeline',
    space: 'Data Solutions',
    updated: '4 days ago',
    content: {
      description: 'Continuously enriches SMB customer profiles with firmographic, revenue, and payment behavior signals to improve segmentation, propensity scoring, and upsell targeting across all business segments.',
      systemPrompt: `You are the Data Enrichment Agent deployed by Deluxe Corporation.

SEGMENT: Data Solutions
PURPOSE: Continuously enrich SMB profiles for better segmentation and targeting.

YOUR RESPONSIBILITIES:
  - Fetch firmographic and revenue data from external enrichment sources
  - Score payment behavior trends for propensity modeling
  - Refresh and de-duplicate customer profiles continuously
  - Push updated segments to CRM and marketing systems

AUTHORISED TOOLS:
  - data-fetch, profile-update, signal-score, warehouse-write

GUARDRAILS:
  - Only use approved data vendors from the Data Governance list
  - PII fields must be hashed before writing to analytics warehouse
  - Comply with CCPA — honor all opt-out flags
  - Refresh cycle capped at once per 24 hours per profile`,
    },
  },
]

// ─── Agent Analyst Module ─────────────────────────────────────────────────────
function AgentAnalystModule() {
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState(null)
  const [agentName, setAgentName] = useState('')
  const [description, setDesc]    = useState('')
  const [systemPrompt, setSysP]   = useState('')
  const [syncing, setSyncing]     = useState(false)
  const [fetched, setFetched]     = useState(false)
  const navigate = useNavigate()

  // Pages sent from Imagination Studio are prepended to the static list
  const storePages  = useStore(s => s.confluencePages)
  const allPages    = [...storePages, ...CONFLUENCE_PAGES]

  const filtered = allPages.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.space.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (page) => {
    setSelected(page)
    setFetched(false)
    setAgentName('')
    setDesc('')
    setSysP('')
  }

  const handleFetch = () => {
    if (!selected) return
    setSyncing(true)
    setTimeout(() => {
      setAgentName(selected.title.split('—')[0].trim())
      setDesc(selected.content.description)
      setSysP(selected.content.systemPrompt)
      setFetched(true)
      setSyncing(false)
    }, 900)
  }

  return (
    /* Gray outer background — same as SiriusAI */
    <div className="flex-1 bg-gray-100 p-4 flex gap-4 overflow-hidden" style={{ minHeight: 0 }}>

      {/* ── Left panel — white card with border ── */}
      <div className="w-72 flex-shrink-0 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
        {/* Search */}
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search pages"
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-300 bg-white"
            />
          </div>
        </div>

        {/* Page list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center px-4 py-10">No pages found matching your search.</p>
          ) : (
            filtered.map(page => (
              <button
                key={page.id}
                onClick={() => handleSelect(page)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  selected?.id === page.id ? 'bg-blue-50 border-l-[3px] border-l-blue-500' : ''}`}>
                <div className="flex items-start gap-2.5">
                  <FileText size={13} className={`flex-shrink-0 mt-0.5 ${selected?.id === page.id ? 'text-blue-500' : 'text-gray-400'}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className={`text-sm font-medium leading-snug ${selected?.id === page.id ? 'text-blue-700' : 'text-gray-800'}`}>
                        {page.title}
                      </p>
                      {page.fromNova && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700 leading-none flex-shrink-0">
                          Nova
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{page.space} · {page.updated}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Right panel — white card with border ── */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">

        {/* Action bar — title left, buttons right */}
        <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <span className="text-sm font-semibold text-gray-800">
            {selected ? selected.title : 'Select a page'}
          </span>
          <div className="flex items-center gap-2">
            {/* Auto-fetch — purple */}
            <button
              onClick={handleFetch}
              disabled={!selected || syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-30 transition-all"
              style={{ background: syncing ? '#9CA3AF' : '#8B5CF6' }}>
              {syncing
                ? <><RefreshCw size={11} className="animate-spin" /> Fetching…</>
                : <><Sparkles size={11} /> Auto-fetch from Doc</>}
            </button>
            {/* Build Agent — red, only after fetch */}
            {fetched && (
              <button
                onClick={() => navigate('/studio')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                style={{ background: '#C8102E' }}>
                Build Agent
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {!selected ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-gray-400">Select a page to view details</p>
            </div>
          ) : !fetched ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={20} className="text-purple-400" />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">"{selected.title}"</p>
                <p className="text-xs text-gray-400 mb-4">Click <strong>Auto-fetch from Doc</strong> to extract agent configuration</p>
                <button onClick={handleFetch} disabled={syncing}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white mx-auto"
                  style={{ background: '#8B5CF6' }}>
                  <Sparkles size={13} /> Auto-fetch from Doc
                </button>
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-2xl">

              {/* Success banner */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
                <p className="text-sm text-emerald-700 font-medium">Agent configuration extracted from Confluence document</p>
              </div>

              {/* Agent Name */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Agent Name</label>
                <input
                  value={agentName}
                  onChange={e => setAgentName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-400 bg-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 leading-relaxed focus:outline-none focus:border-purple-400 resize-none bg-white"
                />
              </div>

              {/* System Prompt */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">System Prompt</label>
                  <span className="text-xs text-gray-400 font-mono">{systemPrompt.length} chars</span>
                </div>
                <textarea
                  value={systemPrompt}
                  onChange={e => setSysP(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-xs font-mono text-gray-700 leading-relaxed focus:outline-none focus:border-purple-400 resize-none bg-white"
                />
              </div>

              {/* CTA row */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => navigate('/studio')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-bold transition-all hover:opacity-90"
                  style={{ background: '#C8102E' }}>
                  Build Agent from this Doc
                </button>
                <button onClick={() => { setFetched(false); setSelected(null) }}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                  Clear
                </button>
              </div>

            </motion.div>
          )}
        </div>
      </div>

    </div>
  )
}

// ─── Placeholder modules (matching SiriusAI) ──────────────────────────────────
function PlaceholderModule({ tool }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4">
          <tool.icon size={24} className="text-gray-300" />
        </div>
        <p className="text-sm font-semibold text-gray-600">{tool.label}</p>
        <p className="text-xs text-gray-400 mt-1">{tool.sub}</p>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AgentAnalyst() {
  const navigate = useNavigate()
  const [active, setActive]         = useState('agent-analyst')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const activeTool = TOOLS.find(t => t.id === active)

  /* -m-6 cancels DLX Layout's p-6 so we go edge-to-edge inside the content area */
  return (
    <div className="-m-6 flex overflow-hidden bg-white"
      style={{ height: 'calc(100vh - 56px)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* ── Velox TOOLS sidebar ── */}
      {sidebarOpen ? (
        <aside className="w-48 border-r flex flex-col flex-shrink-0" style={{ background: '#FAFAFA', borderColor: '#E5E7EB' }}>

          {/* Velox branding block */}
          <div className="px-4 pt-4 pb-3 flex-shrink-0 flex items-start justify-between" style={{ borderBottom: '1px solid #F0F0F0' }}>
            <div>
              <p className="text-lg font-black tracking-tight leading-none" style={{ color: '#C8102E' }}>
                Velox
              </p>
              <p className="text-[10px] mt-0.5 leading-tight" style={{ color: '#9CA3AF' }}>
                Drive Engineering Excellence @dlx
              </p>
            </div>
            <button onClick={() => setSidebarOpen(false)}
              className="transition-colors mt-0.5"
              style={{ color: '#D1D5DB' }}
              onMouseEnter={e => e.currentTarget.style.color = '#6B7280'}
              onMouseLeave={e => e.currentTarget.style.color = '#D1D5DB'}>
              <ChevronLeft size={15} />
            </button>
          </div>

          <div className="px-3 pt-3 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Tools</span>
          </div>

          <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
            {TOOLS.map(tool => (
              <button key={tool.id} onClick={() => setActive(tool.id)}
                className="w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-all"
                style={active === tool.id
                  ? { background: '#FEF2F2', borderLeft: '2px solid #C8102E', paddingLeft: '10px' }
                  : {}
                }
                onMouseEnter={e => { if (active !== tool.id) e.currentTarget.style.background = '#F3F4F6' }}
                onMouseLeave={e => { if (active !== tool.id) e.currentTarget.style.background = '' }}>
                <tool.icon size={14}
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: active === tool.id ? '#C8102E' : '#9CA3AF' }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold leading-tight"
                      style={{ color: active === tool.id ? '#C8102E' : '#374151' }}>
                      {tool.label}
                    </span>
                    {tool.isNew && (
                      <span className="px-1 py-0.5 rounded text-[9px] font-bold leading-none"
                        style={{ background: '#FEF3C7', color: '#D97706' }}>new</span>
                    )}
                  </div>
                  <p className="text-[10px] mt-0.5 leading-tight" style={{ color: '#9CA3AF' }}>{tool.sub}</p>
                </div>
              </button>
            ))}
          </nav>

          <div className="px-2 pb-3 pt-2 space-y-0.5" style={{ borderTop: '1px solid #F0F0F0' }}>
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors hover:bg-gray-100">
              <HelpCircle size={14} style={{ color: '#9CA3AF' }} />
              <span className="text-xs" style={{ color: '#6B7280' }}>Support</span>
            </button>
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors hover:bg-gray-100">
              <MessageSquare size={14} style={{ color: '#9CA3AF' }} />
              <span className="text-xs" style={{ color: '#6B7280' }}>Contact Us</span>
            </button>
          </div>
        </aside>
      ) : (
        <button onClick={() => setSidebarOpen(true)}
          className="w-7 border-r border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0">
          <ChevronRight size={13} className="text-gray-400" />
        </button>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={active}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col overflow-hidden">
            {active === 'agent-analyst' && <AgentAnalystModule />}
            {active !== 'agent-analyst' && <PlaceholderModule tool={activeTool} />}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  )
}
