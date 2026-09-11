import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, X, Zap, Bot, Search, Loader, BookOpen,
  CreditCard, Printer, FileText, Database, Shield,
  Play, ChevronRight, ChevronLeft, ToggleLeft, ToggleRight,
  User, Cpu, Lock, Send, Rocket, Globe, Terminal, Plus, Code,
  GitMerge, ArrowLeft, Layers, Sparkles,
  Crown, Users, ArrowRight, Share2, MessageSquare, Trash2,
} from 'lucide-react'
import useStore from '../store/useStore'
import { INDIVIDUAL_AGENTS } from './AgentPool'

const PHASES = [
  { id: 1, label: 'Agent Configuration', desc: 'Identity, skills & behaviour' },
  { id: 2, label: 'Simulation & Testing',  desc: 'Test before deploying'       },
  { id: 3, label: 'Non-Prod Deployment',   desc: 'Staging environment'          },
  { id: 4, label: 'Production Deployment', desc: 'Go live'                      },
]

const SEGMENTS = [
  { key: 'merchant', label: 'Merchant Services', icon: CreditCard, color: '#0EA5E9' },
  { key: 'print',    label: 'Print',             icon: Printer,    color: '#6B7280' },
  { key: 'b2b',      label: 'B2B Payments',      icon: FileText,   color: '#8B5CF6' },
  { key: 'data',     label: 'Data Solutions',    icon: Database,   color: '#10B981' },
  { key: 'platform', label: 'Platform',          icon: Shield,     color: '#C8102E' },
]

const MODELS = [
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', tier: 'Recommended', badge: 'bg-emerald-100 text-emerald-700', desc: 'Best balance of speed and intelligence for most workflow tasks.' },
  { id: 'claude-opus-4-7',   label: 'Claude Opus 4.7',   tier: 'Powerful',    badge: 'bg-purple-100 text-purple-700',  desc: 'Maximum reasoning power for complex, high-stakes decisions.'   },
  { id: 'claude-haiku-4-5',  label: 'Claude Haiku 4.5',  tier: 'Efficient',   badge: 'bg-blue-100 text-blue-700',     desc: 'Ultra-fast, cost-efficient for high-volume simple tasks.'        },
]

const SKILLS = [
  { id: 'crm-read',         label: 'CRM Read',           category: 'CRM'        },
  { id: 'crm-write',        label: 'CRM Write',          category: 'CRM'        },
  { id: 'email-send',       label: 'Email Send',         category: 'Comms'      },
  { id: 'kyb-verify',       label: 'KYB Verify',         category: 'Compliance' },
  { id: 'erp-read',         label: 'ERP Read',           category: 'Finance'    },
  { id: 'gl-write',         label: 'GL Write',           category: 'Finance'    },
  { id: 'payment-match',    label: 'Payment Match',      category: 'Finance'    },
  { id: 'txn-stream',       label: 'Transaction Stream', category: 'Payments'   },
  { id: 'anomaly-detect',   label: 'Anomaly Detect',     category: 'ML'         },
  { id: 'hold-trigger',     label: 'Hold Trigger',       category: 'Payments'   },
  { id: 'data-fetch',       label: 'Data Fetch',         category: 'Data'       },
  { id: 'profile-update',   label: 'Profile Update',     category: 'Data'       },
  { id: 'sales-alert',      label: 'Sales Alert',        category: 'CRM'        },
  { id: 'report-gen',       label: 'Report Generate',    category: 'Analytics'  },
  { id: 'order-history',    label: 'Order History',      category: 'Print'      },
  { id: 'terminal-config',  label: 'Terminal Config',    category: 'Payments'   },
  { id: 'propensity-score', label: 'Propensity Score',   category: 'ML'         },
  { id: 'webhook-send',     label: 'Webhook Send',       category: 'Integration'},
]

// ─── Risk assessment ──────────────────────────────────────────────────────────
const HIGH_RISK_TOOLS = ['txn-stream','hold-trigger','gl-write','payment-post','account-freeze','swift-api','sanctions-check','aml-screen','anomaly-detect','compliance-alert']
const MED_RISK_TOOLS  = ['crm-write','erp-write','profile-update','warehouse-write','approval-route','kyb-verify','kyb-api','payment-match','dispute-api']

function generateRiskReport(agentName, description, tools) {
  const text = (agentName + ' ' + description + ' ' + tools.join(' ')).toLowerCase()
  const highCount = tools.filter(t => HIGH_RISK_TOOLS.includes(t)).length
  const medCount  = tools.filter(t => MED_RISK_TOOLS.includes(t)).length
  const hasFinancial   = highCount > 0 || text.includes('payment') || text.includes('invoice') || text.includes('financial')
  const hasCompliance  = text.includes('fraud') || text.includes('kyc') || text.includes('aml') || text.includes('compliance')
  const hasIrreversible = tools.some(t => ['hold-trigger','account-freeze','gl-write','swift-api','payment-post'].includes(t))
  const level = (highCount >= 2 || (highCount >= 1 && (hasFinancial || hasCompliance))) ? 'red'
    : (highCount === 1 || medCount >= 2 || hasFinancial || hasCompliance) ? 'yellow' : 'green'
  const score = Math.min(
    level === 'red' ? 75 + highCount * 5 : level === 'yellow' ? 40 + medCount * 8 + highCount * 10 : 10 + medCount * 5, 100
  )
  return {
    level, score,
    generatedAt: new Date().toISOString(),
    sections: [
      { title: 'Data Access',         risk: hasFinancial ? 'high' : medCount > 0 ? 'medium' : 'low',
        finding: hasFinancial ? 'Agent has write access to financial systems. Changes may be irreversible.'
          : medCount > 0 ? 'Reads from CRM/operational systems. Moderate data exposure.'
          : 'Read-only tools with minimal data exposure.' },
      { title: 'Financial Impact',    risk: tools.some(t => ['gl-write','payment-post'].includes(t)) ? 'high' : hasFinancial ? 'medium' : 'low',
        finding: tools.some(t => ['gl-write','payment-post'].includes(t))
          ? 'Direct financial writes detected. Incorrect operations could impact statements.'
          : hasFinancial ? 'Indirect financial impact via payment matching/reconciliation.'
          : 'No direct financial write operations.' },
      { title: 'Compliance Exposure', risk: hasCompliance ? 'high' : highCount > 0 ? 'medium' : 'low',
        finding: hasCompliance ? 'Operates in regulated domain (KYC/AML/Fraud). Requires BSA/PCI compliance.'
          : highCount > 0 ? 'Some tools may trigger compliance obligations.'
          : 'No compliance-regulated operations detected.' },
      { title: 'Reversibility',       risk: hasIrreversible ? 'high' : medCount > 0 ? 'medium' : 'low',
        finding: hasIrreversible ? 'Can perform irreversible actions (holds, GL entries). Requires human approval guardrail.'
          : medCount > 0 ? 'Write operations reversible with effort. Audit logging recommended.'
          : 'All operations reversible or read-only.' },
    ],
    recommendation: level === 'red'
      ? 'High-risk agent. Requires senior security review and CISO sign-off before production.'
      : level === 'yellow'
        ? 'Medium-risk agent. Standard compliance review required. Ensure human approval guardrails active.'
        : 'Low-risk agent. Routine review sufficient. Enable audit logging as best practice.',
  }
}

// ─── Velox documentation pages ────────────────────────────────────────────────
const VELOX_PAGES = [
  { id: 'adk',     title: 'Google Agent Development Kit (ADK) — Integration Guide', space: 'Platform',          updated: '1 day ago',  keywords: ['adk','google','agent','framework','kit'],
    content: '# Google Agent Development Kit (ADK) — Integration Guide\n\n## Overview\nThe Google ADK is an open-source framework for building production-grade AI agents. All DLX_AGENTIC_OS agents follow ADK patterns.\n\n## Agent Structure\nName: descriptive agent name reflecting its primary function\nSegment: one of merchant, print, b2b, data, or platform\nDescription: 1-2 sentences describing the agent\'s primary purpose and value\n\n## Approved Tools\n- crm-read / crm-write: Salesforce CRM read and write operations\n- email-send: SendGrid transactional and campaign emails\n- kyb-verify: Know-Your-Business verification via Middesk/D&B\n- erp-read / gl-write: SAP/Oracle ERP and General Ledger operations\n- payment-match: Invoice-to-payment fuzzy matching\n- txn-stream: Real-time transaction stream ingestion\n- anomaly-detect: ML-based anomaly detection\n- hold-trigger: Account hold and suspension triggers\n- data-fetch / profile-update: Data enrichment and profile management\n- sales-alert: Sales team notification and escalation\n- report-gen: Automated report generation\n- order-history: Print order history retrieval\n- terminal-config: Payment terminal provisioning\n- propensity-score: ML propensity scoring\n- webhook-send: External webhook dispatch\n\n## System Prompt Template\nYou are [Agent Name] for Deluxe Corporation.\n\nYour responsibilities:\n1. [Primary responsibility]\n2. [Secondary responsibility]\n3. [Escalation conditions]\n\nGuardrails:\n- Never take irreversible actions without human approval\n- Always log actor, timestamp, and rationale for every decision\n- On uncertainty: pause, flag, and surface to human reviewer\n- Comply with all applicable data privacy and compliance requirements\n\n## Getting Started\n1. Define role and capabilities from the documentation\n2. Configure tools from approved registry above\n3. Set guardrails (human review, audit logging, rate limits)\n4. Test in simulation mode before staging\n5. Submit for compliance review' },
  { id: 'onboard', title: 'SMB Merchant Onboarding — Process BRD',              space: 'Merchant Services', updated: '2 days ago', keywords: ['onboard','merchant','kyb','kyc','smb','terminal'],
    content: '# SMB Merchant Onboarding — Process BRD\n\n## Agent Specification\nName: SMB Onboarding Agent\nSegment: merchant\nDescription: Automates the full SMB merchant onboarding lifecycle from KYB verification to first live transaction, cutting onboarding time from days to hours.\n\n## Tools Required\n- kyb-verify: Business identity verification via D&B and Middesk\n- crm-write: Create merchant record in Salesforce\n- email-send: Send approval/welcome notifications\n- terminal-config: Provision and configure payment terminals\n\n## System Prompt\nYou are an SMB Onboarding Agent for Deluxe Corporation.\n\nResponsibilities:\n1. Receive new merchant applications via webhook trigger\n2. Run KYB verification within 2 minutes of application receipt\n3. Score merchant risk across 12 signals (credit, fraud history, industry, geography)\n4. Risk score below 40: auto-approve and proceed to provisioning\n5. Risk score 40-70: flag for human review within 4 hours\n6. Risk score above 70: auto-decline with detailed explanation\n7. Upon approval: provision terminal, create CRM record, send welcome email with activation link\n\nGuardrails:\n- Never approve without completing full KYB verification\n- Require dual approval for merchants in high-risk industries (gaming, CBD, firearms)\n- Log all decisions with rationale for compliance audit trail\n- Maximum 3 automated retries on any verification failure before escalating to human' },
  { id: 'invoice', title: 'Invoice Reconciliation — Finance Ops Spec',          space: 'B2B Payments',      updated: '5 days ago', keywords: ['invoice','reconcil','finance','payment','gl','erp'],
    content: '# Invoice Reconciliation — Finance Ops Spec\n\n## Agent Specification\nName: Invoice Reconciliation Agent\nSegment: b2b\nDescription: Eliminates manual invoice-to-payment matching across multiple ERP systems, auto-posting matched transactions to the GL and flagging exceptions for human review.\n\n## Tools Required\n- erp-read: Read invoice and payment data from SAP, Oracle, NetSuite\n- payment-match: Fuzzy-match invoices to payments using ML matching algorithm\n- gl-write: Post matched transactions to the General Ledger with audit trail\n- exception-flag: Flag and route unmatched items for human review\n\n## System Prompt\nYou are an Invoice Reconciliation Agent for Deluxe Corporation B2B Payments.\n\nResponsibilities:\n1. Continuously monitor incoming invoices from email and EDI feeds\n2. Match each invoice to corresponding purchase orders and payments\n3. Exact match (invoice number + amount within $0.01): auto-post to GL within 5 minutes\n4. Fuzzy match (amount within 2%, reference >80% similarity): validate then post with annotation\n5. No match after 24 hours: flag with suggested resolution and route to finance team\n6. Generate daily reconciliation reports with exception counts and aging\n\nMatching Rules:\n- Priority 1: Exact invoice number + PO number + amount match\n- Priority 2: Amount within 2% tolerance with partial reference match\n- Priority 3: Amount match only, flag for manual verification\n\nGuardrails:\n- Never post amounts exceeding $100,000 without human approval\n- Always generate audit trail entry for every GL posting\n- Escalate vendor disputes to AP team within 2 business hours\n- Pause automated processing 3 days before month-end close' },
  { id: 'churn',   title: 'Churn Prevention — Print Revenue Playbook',           space: 'Print & Retention', updated: '1 week ago', keywords: ['churn','retention','print','revenue','order'],               content: '# Churn Prevention Playbook\n\nDetect at-risk customers 60+ days before churn.\n\n## Signals\n- Order frequency decline >30%\n- Recency gap >90 days\n- Support ticket spike' },
  { id: 'fraud',   title: 'Fraud Detection — Real-Time Risk Architecture',       space: 'Merchant Services', updated: '3 days ago', keywords: ['fraud','risk','anomaly','detect','transaction','hold'],
    content: '# Fraud Detection — Real-Time Risk Architecture\n\n## Agent Specification\nName: Fraud Detection Agent\nSegment: merchant\nDescription: Provides sub-second real-time fraud detection across the merchant transaction stream, automatically holding suspicious accounts and generating compliance alerts.\n\n## Tools Required\n- txn-stream: Ingest and process the live transaction stream in real time\n- anomaly-detect: ML-based anomaly scoring for transaction patterns\n- hold-trigger: Place automatic holds on accounts with high-confidence fraud signals\n- compliance-alert: Generate BSA/AML compliance alerts and SAR notifications\n\n## System Prompt\nYou are a Fraud Detection Agent for Deluxe Corporation Merchant Services.\n\nResponsibilities:\n1. Monitor the real-time transaction stream continuously\n2. Score each transaction for fraud probability (0-100) within 200ms\n3. Score 80 or above: trigger automatic account hold and alert compliance team immediately\n4. Score 50-79: flag transaction for human review within 15 minutes\n5. Score below 50: log and continue monitoring\n6. Generate Suspicious Activity Reports (SARs) for BSA/AML compliance when required\n7. Maintain rolling 30-day fraud pattern baseline per merchant\n\nGuardrails:\n- Never hold an account without fraud score of 80 or higher\n- Always log transaction ID, timestamp, fraud score, and rationale for every action\n- Require human approval before filing any regulatory report\n- Alert on model confidence degradation below 95%\n- Never contact merchant during active fraud investigation' },
  { id: 'enrich',  title: 'Data Enrichment — SMB Profile Pipeline',              space: 'Data Solutions',    updated: '4 days ago', keywords: ['enrich','data','profile','firmographic','smb','segment'],      content: '# Data Enrichment Pipeline\n\nContinuous enrichment from Clearbit, ZoomInfo, D&B.\n\n## Fields\n- Revenue band, employee count, SIC\n- Payment behaviour scores' },
  { id: 'ach',     title: 'ACH Payment Processing — Technical Spec',             space: 'B2B Payments',      updated: '3 days ago', keywords: ['ach','payment','bank','nacha','debit','credit'],             content: '# ACH Processing\n\nNACHA-compliant origination and return handling.' },
  { id: 'kyc',     title: 'KYC/AML Compliance Framework',                        space: 'Risk & Compliance', updated: '1 week ago', keywords: ['kyc','aml','compliance','sanctions','ofac','screening'],      content: '# KYC/AML Framework\n\nOFAC and global sanctions screening.' },
  { id: 'dispute', title: 'Merchant Dispute Resolution Process',                 space: 'Merchant Services', updated: '2 days ago', keywords: ['dispute','chargeback','merchant','evidence'],                content: '# Dispute Resolution\n\nAutomate evidence collection for chargebacks.' },
  { id: 'gl',      title: 'GL Entry Automation — Finance Guide',                 space: 'B2B Payments',      updated: '4 days ago', keywords: ['gl','journal','finance','entry','ledger','posting'],          content: '# GL Automation\n\nAutomatic write-back with full audit trail.' },
  { id: 'crm',     title: 'Salesforce CRM Integration Patterns',                 space: 'Platform',          updated: '5 days ago', keywords: ['crm','salesforce','integration','contact','account'],         content: '# Salesforce Integration\n\nBest practices for reading and writing CRM records.' },
  { id: 'dq',      title: 'Data Quality & Governance Standards',                 space: 'Data Solutions',    updated: '6 days ago', keywords: ['data','quality','governance','schema','completeness'],         content: '# Data Quality Standards\n\nDefine and enforce data quality SLAs.' },
  { id: 'segment', title: 'Segmentation & Propensity Modeling',                  space: 'Data Solutions',    updated: '1 week ago', keywords: ['segment','propensity','ml','cluster','scoring'],              content: '# Propensity Modeling\n\nML-based segmentation and lead scoring.' },
  { id: 'email',   title: 'Email Campaign Automation Guide',                     space: 'Print & Retention', updated: '3 days ago', keywords: ['email','campaign','send','sendgrid','outreach'],             content: '# Email Automation\n\nSendGrid integration for campaigns.' },
  { id: 'lead',    title: 'Lead Scoring Algorithm Specification',                space: 'Data Solutions',    updated: '4 days ago', keywords: ['lead','score','intent','firmographic','prospect'],            content: '# Lead Scoring\n\nIntent + firmographic + behavioural signals.' },
  { id: 'terminal',title: 'Terminal Provisioning & Config Guide',                space: 'Merchant Services', updated: '5 days ago', keywords: ['terminal','payment','config','pos','provision'],              content: '# Terminal Provisioning\n\nAutomate POS ordering and remote config.' },
  { id: 'wire',    title: 'Wire Transfer Security Controls',                     space: 'B2B Payments',      updated: '1 week ago', keywords: ['wire','swift','transfer','beneficiary'],                     content: '# Wire Transfer Controls\n\nBeneficiary validation and sanctions screening.' },
  { id: 'vendor',  title: 'Vendor Onboarding Checklist',                        space: 'B2B Payments',      updated: '2 days ago', keywords: ['vendor','onboard','supplier','procurement'],                 content: '# Vendor Onboarding\n\nKYB, bank verification, and ERP setup.' },
  { id: 'api',     title: 'API Rate Limiting & Gateway Policies',               space: 'Platform',          updated: '3 days ago', keywords: ['api','gateway','rate','limit','throttle'],                   content: '# API Gateway Policies\n\nEnforce rate limits and monitor health.' },
  { id: 'bedrock', title: 'AWS Bedrock Model Integration',                       space: 'Platform',          updated: '2 days ago', keywords: ['bedrock','claude','llm','model','aws'],                      content: '# AWS Bedrock Integration\n\nClaude model inference via Bedrock.' },
]

function getRelevantPages(name, description, tools) {
  const text = (name + ' ' + description + ' ' + tools.join(' ')).toLowerCase()
  const adk = VELOX_PAGES.find(p => p.id === 'adk')
  const others = VELOX_PAGES
    .filter(p => p.id !== 'adk')
    .map(p => ({ ...p, score: p.keywords.filter(kw => text.includes(kw)).length }))
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
  return [adk, ...others]
}

const VELOX_NAV = [
  { label: 'BRD Assistant',    sub: 'Create & manage BRDs',            active: false },
  { label: 'Confluence',       sub: 'Browse & integrate docs',         active: false },
  { label: 'Jira',             sub: 'Project tracking & issues',       active: false },
  { label: 'Architecture',     sub: 'Technical architecture planning', active: false },
  { label: 'Pair Programming', sub: 'MCP setup & IDE integration',     active: false },
  { label: 'Agent Analyst',    sub: 'Build agents from docs',          active: true  },
  { label: 'Testing',          sub: 'Test scenarios & Katalon',        active: false },
]

const SKILL_CATS = ['All', ...new Set(SKILLS.map(s => s.category))]

const CURRENT_USER = 'Shubham Singh'

const TRIGGER_TYPES = [
  { id: 'schedule', label: 'Schedule',  opts: ['Every minute', 'Every 5 minutes', 'Hourly', 'Every 4 hours', 'Daily at 9am', 'Weekly on Monday'] },
  { id: 'event',    label: 'Event',     opts: ['new-merchant-application', 'payment-received', 'invoice-created', 'order-placed', 'customer-at-risk', 'transaction-flagged'] },
  { id: 'webhook',  label: 'Webhook',   opts: [] },
  { id: 'realtime', label: 'Real-time', opts: [] },
  { id: 'manual',   label: 'Manual',    opts: [] },
]

const SAMPLE_AGENT = {
  name:        'Merchant Churn Risk Monitor',
  version:     '1.0.0',
  author:      'DLX_AGENTIC_OS Team',
  segment:     'merchant',
  description: 'Monitors merchant transaction activity and identifies accounts showing early churn signals — declining volumes, missed settlements, or reduced login frequency. Triggers automated retention campaigns and routes high-value accounts to a named account manager before they disengage.',
  systemPrompt: `You are a Merchant Churn Risk Monitor for Deluxe Corporation.

Your job is to:
1. Continuously scan merchant transaction data for early churn signals (volume decline >20% week-over-week, missed settlements, reduced API activity).
2. Compute a churn risk score (0–100) for each merchant based on behavioural signals.
3. For merchants scoring 60–79: trigger an automated re-engagement email campaign.
4. For merchants scoring 80+: immediately alert the assigned account manager with a full context brief.
5. Log every action to the Governance Registry with a rationale.

Rules:
- Never contact a merchant more than once per 48 hours.
- Always require human approval before placing a merchant account on hold.
- Flag any anomalies you cannot categorise for human review.
- Prioritise accuracy over speed — a missed churn signal is better than a false positive.`,
  model:          'claude-sonnet-4-6',
  skills:         ['crm-read', 'txn-stream', 'anomaly-detect', 'propensity-score', 'email-send', 'sales-alert'],
  triggers:       ['schedule: hourly-scan', 'event: transaction-flagged'],
  maxConcurrent:  5,
  env:            'staging',
  dataSource:     'anonymized',
  validationPeriod: '48h',
  guardrail_humanReview:      true,
  guardrail_auditLog:         true,
  guardrail_rateLimitEmail:   true,
  guardrail_dryRunMode:       false,
  guardrail_alertOnException: true,
}

// ─── Velox Documentation Panel ────────────────────────────────────────────────
function VeloxDocsPanel({ onClose, onFillSpec, addToast, currentForm }) {
  const adkPage = VELOX_PAGES.find(p => p.id === 'adk')
  const [selectedPages, setSelectedPages] = useState(adkPage ? [adkPage] : [])
  const [viewedPage,    setViewedPage]    = useState(adkPage || null)
  const [search,        setSearch]        = useState('')
  const [filling,       setFilling]       = useState(false)

  const displayPages = search
    ? VELOX_PAGES.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.space.toLowerCase().includes(search.toLowerCase()))
    : VELOX_PAGES

  const togglePage = (page) => {
    setSelectedPages(prev =>
      prev.some(p => p.id === page.id)
        ? prev.filter(p => p.id !== page.id)
        : [...prev, page]
    )
  }

  const hasExisting = !!(currentForm?.name || currentForm?.description || currentForm?.systemPrompt)

  const handleFill = async () => {
    if (selectedPages.length === 0 || filling) return
    setFilling(true)
    try {
      const combinedContent = selectedPages
        .map(p => '=== ' + p.title + ' ===\n' + (p.content || p.title))
        .join('\n\n')
      const existingSpec = currentForm ? {
        name:         currentForm.name         || '',
        description:  currentForm.description  || '',
        segment:      currentForm.segment      || '',
        skills:       currentForm.skills       || [],
        systemPrompt: currentForm.systemPrompt || '',
      } : {}
      const res = await fetch('/api/nova/fill-from-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: combinedContent, existingSpec }),
      })
      const data = await res.json()
      if (data.success && data.spec) {
        onFillSpec(data.spec)
        onClose()
        addToast?.({
          type: 'success',
          title: hasExisting ? 'Context enriched from docs' : 'Form filled from docs',
          message: hasExisting ? 'Existing content preserved — documentation context added.' : 'Agent configuration extracted from selected pages.',
        })
      } else {
        addToast?.({ type: 'error', title: 'Enrich failed', message: data.error || 'Could not extract context from the selected pages.' })
      }
    } catch (err) {
      addToast?.({ type: 'error', title: 'Connection error', message: 'Make sure the Nova service is running on port 8000.' })
    } finally {
      setFilling(false)
    }
  }

  const filtered = displayPages
  return (
    <div className="fixed inset-0 z-50 flex" style={{ backdropFilter: 'blur(4px)', background: 'rgba(10,18,40,0.55)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}
        transition={{ duration: 0.22 }} className="flex h-full bg-white shadow-2xl overflow-hidden" style={{ width: 900, maxWidth: '95vw' }}>
        {/* Left nav */}
        <div className="w-56 flex-shrink-0 flex flex-col border-r border-[#E2E8F0]" style={{ background: '#FAFBFC' }}>
          <div className="px-5 py-5 border-b border-[#E2E8F0]">
            <p className="text-lg font-black tracking-tight leading-none" style={{ color: '#C8102E' }}>Velox</p>
            <p className="text-[10px] text-[#9BA8BA] mt-0.5 leading-relaxed">Drive Engineering Excellence<br />@dlx</p>
          </div>
          <div className="px-3 pt-4 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Tools</span>
          </div>
          <nav className="flex-1 px-2 overflow-y-auto">
            <div className="flex items-start gap-2.5 px-3 py-2 rounded-lg"
              style={{ background: '#FEF2F2', borderLeft: '2px solid #C8102E', paddingLeft: '10px' }}>
              <BookOpen size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#C8102E' }} />
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-tight" style={{ color: '#C8102E' }}>Confluence</p>
                <p className="text-[10px] mt-0.5 leading-tight" style={{ color: '#9CA3AF' }}>Browse & integrate docs</p>
              </div>
            </div>
          </nav>
        </div>
        {/* Pages list */}
        <div className="w-64 flex-shrink-0 flex flex-col border-r border-[#E2E8F0]">
          <div className="px-4 py-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white">
              <Search size={13} className="text-[#9BA8BA] flex-shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pages"
                className="flex-1 text-xs outline-none bg-transparent text-[#4A5568]" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {displayPages.map(page => {
              const isSelected = selectedPages.some(p => p.id === page.id)
              const isViewed   = viewedPage?.id === page.id
              return (
                <div key={page.id} className={'flex items-start gap-2.5 px-4 py-3 hover:bg-[#F7F9FF] transition-all cursor-pointer ' + (isViewed ? 'bg-[#F0F4FF]' : '')}
                  onClick={() => setViewedPage(page)}>
                  <button
                    onClick={e => { e.stopPropagation(); togglePage(page) }}
                    className={'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ' + (isSelected ? 'bg-[#1A2340] border-[#1A2340]' : 'border-[#CBD5E0] hover:border-[#9BA8BA] bg-white')}>
                    {isSelected && <CheckCircle size={9} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1A2340] leading-snug line-clamp-2">{page.title}</p>
                    <p className="text-[10px] text-[#9BA8BA] mt-0.5">{page.space} · {page.updated}</p>
                  </div>
                </div>
              )
            })}
          </div>
          {/* Fill with AI button */}
          <div className="px-4 py-3 border-t border-[#E2E8F0]">
            <button onClick={handleFill} disabled={selectedPages.length === 0 || filling}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#1A2340,#2D3A5C)' }}>
              {filling
                ? <><Loader size={14} className="animate-spin" /> Filling form…</>
                : <><Zap size={14} /> {hasExisting ? 'Enrich' : 'Fill'} with AI{selectedPages.length > 0 ? ' (' + selectedPages.length + ' pages)' : ''}</>
              }
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#1A2340]">{viewedPage ? viewedPage.title : 'Click a page to preview'}</p>
              {viewedPage && <p className="text-xs text-[#9BA8BA] mt-0.5">{viewedPage.space} · {viewedPage.updated}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="w-7 h-7 rounded-lg border border-[#E2E8F0] flex items-center justify-center hover:bg-[#F7F8FA]">
                <X size={13} className="text-[#9BA8BA]" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {viewedPage?.content ? (
              <div className="space-y-1.5">
                {viewedPage.content.split('\n').map((line, i) => {
                  if (line.startsWith('# '))  return <h1 key={i} className="text-lg font-bold text-[#1A2340] mb-3">{line.slice(2)}</h1>
                  if (line.startsWith('## ')) return <h2 key={i} className="text-sm font-bold text-[#1A2340] mt-4 mb-2">{line.slice(3)}</h2>
                  if (line.startsWith('- '))  return <div key={i} className="flex gap-2 text-sm text-[#4A5568] mb-1"><span className="text-[#9BA8BA]">•</span><span>{line.slice(2)}</span></div>
                  if (/^\d+\./.test(line))    return <p key={i} className="text-sm text-[#4A5568] mb-1 ml-3">{line}</p>
                  if (line === '')            return <div key={i} className="h-1.5" />
                  return <p key={i} className="text-sm text-[#4A5568] leading-relaxed">{line}</p>
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-[#CBD5E0]">Select a page to view details</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const EMPTY_FORM = {
  name: '', description: '', segment: 'merchant', model: 'claude-sonnet-4-6',
  skills: [], triggers: [], systemPrompt: '', maxConcurrent: 1, version: '1.0.0',
  author: CURRENT_USER, env: 'staging', dataSource: 'anonymized', validationPeriod: '48h',
  guardrail_humanReview: true, guardrail_auditLog: true,
  guardrail_rateLimitEmail: false, guardrail_dryRunMode: false, guardrail_alertOnException: true,
}

// ─── Phase Indicator ──────────────────────────────────────────────────────────
function PhaseBar({ phase, setPhase, canAdvance }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {PHASES.map((p, i) => (
        <div key={p.id} className="flex items-center">
          <button
            onClick={() => p.id < phase || (p.id === phase + 1 && canAdvance()) ? setPhase(p.id) : null}
            className="flex items-center gap-2.5 group"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              p.id < phase   ? 'bg-emerald-500 text-white'
              : p.id === phase ? 'text-white'
              : 'bg-[#F0F2F5] text-[#9BA8BA]'
            }`} style={p.id === phase ? { background: '#1A2340' } : {}}>
              {p.id < phase ? <CheckCircle size={15} /> : p.id}
            </div>
            <div className="text-left hidden sm:block">
              <p className={`text-xs font-semibold leading-tight ${p.id === phase ? 'text-[#1A2340]' : p.id < phase ? 'text-emerald-600' : 'text-[#9BA8BA]'}`}>{p.label}</p>
              <p className="text-xs text-[#B0BAC9] leading-tight">{p.desc}</p>
            </div>
          </button>
          {i < PHASES.length - 1 && (
            <div className="w-12 h-px mx-3" style={{ background: p.id < phase ? '#10B981' : '#E2E8F0' }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Phase 1: Confluence-style Agent Document ─────────────────────────────────
function PhaseDocumentDesigner({ form, set, fromWorkflow, workflowStep }) {
  const [skillCat,   setSkillCat]   = useState('All')
  const [triggerType, setTriggerType] = useState('schedule')

  const toggleSkill = (id) => {
    const cur = form.skills || []
    set('skills', cur.includes(id) ? cur.filter(s => s !== id) : [...cur, id])
  }

  const addTrigger = (spec) => {
    if (!spec) return
    const entry = `${triggerType}: ${spec}`
    const cur = form.triggers || []
    if (!cur.includes(entry)) set('triggers', [...cur, entry])
  }

  const filteredSkills = SKILLS.filter(s => skillCat === 'All' || s.category === skillCat)

  return (
    <div className="max-w-3xl mx-auto">

      {/* ── Workflow context banner ── */}
      {fromWorkflow && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border border-violet-200 bg-violet-50"
        >
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
            <GitMerge size={14} className="text-violet-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-violet-700">Building Agent for Workflow Pipeline</p>
            <p className="text-xs text-violet-500 mt-0.5">
              {workflowStep ? `Step ${workflowStep}: ` : ''}{form.name || 'New Agent'} · Complete configuration then save to workflow
            </p>
          </div>
          <Layers size={14} className="text-violet-300 ml-auto flex-shrink-0" />
        </motion.div>
      )}

      {/* ── Confluence page header ── */}
      <div className="mb-8">
        <div className="flex items-start gap-4 mb-5">
          {/* Page icon */}
          <div className="w-12 h-12 rounded-xl bg-[#F7F8FA] border-2 border-dashed border-[#E2E8F0] flex items-center justify-center flex-shrink-0 mt-1 text-2xl select-none">
            📄
          </div>
          {/* Editable title */}
          <div className="flex-1">
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Agent Name *"
              className="w-full text-2xl font-bold text-[#1A2340] border-none outline-none bg-transparent placeholder-[#CBD5E0] focus:placeholder-[#E2E8F0]"
            />
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-xs text-[#9BA8BA]">Created by</span>
              <input
                value={form.author}
                onChange={e => set('author', e.target.value)}
                className="text-xs text-[#718096] border-none outline-none bg-transparent w-40 focus:underline"
              />
              <span className="text-xs text-[#CBD5E0]">·</span>
              <select
                value={form.segment}
                onChange={e => set('segment', e.target.value)}
                className="text-xs text-[#718096] border-none outline-none bg-transparent cursor-pointer"
              >
                {SEGMENTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <span className="text-xs text-[#CBD5E0]">·</span>
              <input
                value={form.version}
                onChange={e => set('version', e.target.value)}
                placeholder="v1.0.0"
                className="text-xs text-[#718096] border-none outline-none bg-transparent w-16 focus:underline"
              />
            </div>
          </div>
        </div>
        <hr className="border-[#E2E8F0]" />
      </div>

      {/* ══════════════ Section 1: Identity ══════════════ */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <User size={17} className="text-[#9BA8BA]" />
          <h2 className="text-base font-bold text-[#1A2340]">Identity</h2>
        </div>
        <hr className="border-[#E2E8F0] mb-5" />

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#4A5568] mb-1.5">
              Description <span className="text-[#C8102E]">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="What does this agent do? What problem does it solve?"
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#C8102E] transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#4A5568] mb-1.5">
              System Prompt <span className="text-[#C8102E]">*</span>
            </label>
            <textarea
              value={form.systemPrompt}
              onChange={e => set('systemPrompt', e.target.value)}
              placeholder={`You are a ${form.name || 'Deluxe AI Agent'} for Deluxe Corporation.\n\nYour role is to...\n\nPrioritise accuracy. Log all actions. Flag exceptions for human review.`}
              rows={8}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-mono focus:outline-none focus:border-[#C8102E] transition-colors resize-none bg-[#FAFBFC]"
            />
          </div>
        </div>
      </div>

      {/* ══════════════ Section 2: Skills & Tools ══════════════ */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={17} className="text-[#9BA8BA]" />
          <h2 className="text-base font-bold text-[#1A2340]">Skills &amp; Tools</h2>
        </div>
        <hr className="border-[#E2E8F0] mb-5" />

        <div className="space-y-4">
          {/* Selected chips */}
          {(form.skills || []).length > 0 && (
            <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E2E8F0]">
              <p className="text-xs font-semibold text-[#718096] mb-2">Selected — {(form.skills || []).length} skills</p>
              <div className="flex flex-wrap gap-1.5">
                {(form.skills || []).map(id => {
                  const sk = SKILLS.find(s => s.id === id)
                  return (
                    <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-white" style={{ background: '#1A2340' }}>
                      {sk?.label}
                      <button onClick={() => toggleSkill(id)} className="ml-0.5 hover:text-red-300">
                        <X size={10} />
                      </button>
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Category filter */}
          <div className="flex gap-1.5 flex-wrap">
            {SKILL_CATS.map(cat => (
              <button key={cat} onClick={() => setSkillCat(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${skillCat === cat ? 'text-white' : 'bg-[#F7F8FA] text-[#718096] hover:bg-[#EDF0F5]'}`}
                style={skillCat === cat ? { background: '#C8102E' } : {}}>
                {cat}
              </button>
            ))}
          </div>

          {/* Skills grid */}
          <div className="flex flex-wrap gap-2">
            {filteredSkills.map(sk => {
              const active = (form.skills || []).includes(sk.id)
              return (
                <button key={sk.id} onClick={() => toggleSkill(sk.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                    active
                      ? 'border-[#1A2340] bg-[#1A2340] text-white'
                      : 'border-[#E2E8F0] text-[#4A5568] hover:border-[#1A2340] hover:text-[#1A2340]'
                  }`}>
                  {active && <CheckCircle size={11} />}
                  {sk.label}
                </button>
              )
            })}
          </div>

          {/* Trigger configuration */}
          <div className="pt-4 border-t border-[#F0F2F5]">
            <h3 className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider mb-3">Trigger Configuration</h3>
            {(form.triggers || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(form.triggers || []).map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-xs font-mono text-amber-700">
                    <Zap size={10} /> {t}
                    <button onClick={() => set('triggers', (form.triggers || []).filter((_, j) => j !== i))}><X size={9} /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2 mb-2 flex-wrap">
              {TRIGGER_TYPES.map(t => (
                <button key={t.id} onClick={() => setTriggerType(t.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${triggerType === t.id ? 'border-[#C8102E] bg-[#FDF0F2] text-[#C8102E]' : 'border-[#E2E8F0] text-[#4A5568]'}`}>
                  {t.label}
                </button>
              ))}
            </div>
            {TRIGGER_TYPES.find(t => t.id === triggerType)?.opts.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {TRIGGER_TYPES.find(t => t.id === triggerType).opts.map(opt => (
                  <button key={opt} onClick={() => addTrigger(opt)}
                    className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs text-[#4A5568] hover:border-[#C8102E] hover:text-[#C8102E] transition-all">
                    + {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  placeholder={triggerType === 'webhook' ? 'https://your-endpoint.com/hook' : 'Label or stream name'}
                  className="flex-1 px-3 py-2 rounded-lg border border-[#E2E8F0] text-xs focus:outline-none focus:border-[#C8102E]"
                  onKeyDown={e => { if (e.key === 'Enter') { addTrigger(e.target.value); e.target.value = '' } }}
                />
                <button
                  onClick={e => { const inp = e.target.previousSibling; addTrigger(inp.value); inp.value = '' }}
                  className="px-3 py-2 rounded-lg text-white text-xs font-medium"
                  style={{ background: '#C8102E' }}
                >Add</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════ Section 3: Intelligence Layer ══════════════ */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <Cpu size={17} className="text-[#9BA8BA]" />
          <h2 className="text-base font-bold text-[#1A2340]">Intelligence Layer</h2>
        </div>
        <hr className="border-[#E2E8F0] mb-5" />

        <div className="space-y-4">
          {MODELS.map(m => (
            <button key={m.id} onClick={() => set('model', m.id)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${form.model === m.id ? 'border-[#1A2340] bg-[#F7F9FF]' : 'border-[#E2E8F0] hover:border-[#CBD5E0]'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Bot size={14} className={form.model === m.id ? 'text-[#1A2340]' : 'text-[#718096]'} />
                  <p className="font-semibold text-[#1A2340] font-mono text-sm">{m.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.badge}`}>{m.tier}</span>
                  {form.model === m.id && <CheckCircle size={14} className="text-[#1A2340]" />}
                </div>
              </div>
              <p className="text-xs text-[#718096]">{m.desc}</p>
            </button>
          ))}

          <div>
            <label className="block text-xs font-semibold text-[#4A5568] mb-2">Max Concurrent Runs</label>
            <div className="flex gap-2">
              {[1, 3, 5, 10, 'Unlimited'].map(v => (
                <button key={v} onClick={() => set('maxConcurrent', v)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${form.maxConcurrent === v ? 'border-[#1A2340] bg-[#1A2340] text-white' : 'border-[#E2E8F0] text-[#4A5568] hover:border-[#1A2340]'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ Section 4: Guardrails ══════════════ */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Lock size={17} className="text-[#9BA8BA]" />
          <h2 className="text-base font-bold text-[#1A2340]">Guardrails</h2>
        </div>
        <hr className="border-[#E2E8F0] mb-5" />

        <div className="space-y-2">
          {[
            { key: 'humanReview',      label: 'Require human review for high-risk actions',       desc: 'Pauses workflow and sends approval request before irreversible actions' },
            { key: 'auditLog',         label: 'Log all actions to Governance Registry',           desc: 'Every action written to the immutable audit trail'                    },
            { key: 'rateLimitEmail',   label: 'Rate-limit outbound emails (max 100/hour)',        desc: 'Prevents email flooding from misconfigured triggers'                  },
            { key: 'dryRunMode',       label: 'Start in dry-run mode (read only)',                desc: 'Workflow reads and reasons but makes no writes until approved'         },
            { key: 'alertOnException', label: 'Alert admin on unhandled exceptions',              desc: 'Pings platform admin when workflow encounters unexpected state'        },
          ].map(({ key, label, desc }) => (
            <button key={key} onClick={() => set(`guardrail_${key}`, !form[`guardrail_${key}`])}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${form[`guardrail_${key}`] ? 'border-[#1A2340] bg-[#F7F9FF]' : 'border-[#E2E8F0] hover:bg-[#F7F8FA]'}`}>
              {form[`guardrail_${key}`]
                ? <ToggleRight size={22} className="text-[#1A2340] flex-shrink-0" />
                : <ToggleLeft  size={22} className="text-[#CBD5E0] flex-shrink-0" />}
              <div>
                <p className="text-sm font-medium text-[#1A2340]">{label}</p>
                <p className="text-xs text-[#718096] mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}

// ─── Phase 2: Simulation & Testing ───────────────────────────────────────────
function PhaseSimulation({ form }) {
  const [sessionId] = useState(() => `sim-${Date.now()}`)
  const [messages, setMessages] = useState([
    { role: 'system', text: `Agent "${form.name || 'New Agent'}" is connected to AWS Bedrock. Send a test input to see how it responds using its actual system prompt.` }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef(null)
  const [simGuardrails, setSimGuardrails] = useState({
    guardrail_humanReview:      form.guardrail_humanReview      ?? false,
    guardrail_auditLog:         form.guardrail_auditLog         ?? false,
    guardrail_rateLimitEmail:   form.guardrail_rateLimitEmail   ?? false,
    guardrail_dryRunMode:       form.guardrail_dryRunMode       ?? false,
    guardrail_alertOnException: form.guardrail_alertOnException ?? false,
  })

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  const send = async () => {
    if (!input.trim() || typing) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setTyping(true)

    const guardrailContext = [
      simGuardrails.guardrail_dryRunMode       && '[DRY-RUN MODE: do not make any writes or irreversible actions]',
      simGuardrails.guardrail_humanReview      && '[GUARDRAIL: escalate any high-risk action to human review before proceeding]',
      simGuardrails.guardrail_auditLog         && '[GUARDRAIL: log every action you take to the Governance Registry]',
      simGuardrails.guardrail_rateLimitEmail   && '[GUARDRAIL: email sends are rate-limited to 100/hour]',
      simGuardrails.guardrail_alertOnException && '[GUARDRAIL: alert admin on any unhandled exception]',
    ].filter(Boolean).join('\n')

    const systemPrompt = [guardrailContext, form.systemPrompt || `You are ${form.name || 'an AI agent'} for Deluxe Corporation.`]
      .filter(Boolean).join('\n\n')

    try {
      const res = await fetch('/api/nova/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: userMsg, systemPrompt, agentName: form.name }),
      })
      const data = await res.json()
      setTyping(false)
      setMessages(prev => [...prev, { role: 'agent', text: data.message }])
    } catch {
      setTyping(false)
      setMessages(prev => [...prev, { role: 'agent', text: 'Connection error — ensure the Nova service is running on port 8000.' }])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-[#1A2340]">Simulation &amp; Testing</h2>
          <p className="text-xs text-[#718096] mt-0.5">Send test inputs and observe agent behaviour before deploying</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
          <span className="text-xs font-semibold text-amber-700">Simulation Mode</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Config summary */}
        <div className="card p-4 space-y-4 overflow-y-auto" style={{ maxHeight: '420px' }}>
          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Agent Config</p>
          <div className="space-y-2">
            {[
              { label: 'Name',     value: form.name    || '—' },
              { label: 'Model',    value: form.model   || '—' },
              { label: 'Skills',   value: `${(form.skills   || []).length} configured` },
              { label: 'Triggers', value: `${(form.triggers || []).length} configured` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-[#9BA8BA]">{label}</p>
                <p className="text-xs font-semibold text-[#1A2340] font-mono truncate">{value}</p>
              </div>
            ))}
          </div>
          {(form.skills || []).length > 0 && (
            <div>
              <p className="text-xs text-[#9BA8BA] mb-1.5">Active Skills</p>
              <div className="flex flex-wrap gap-1">
                {(form.skills || []).map(id => (
                  <span key={id} className="px-1.5 py-0.5 rounded text-xs bg-[#F7F8FA] border border-[#E2E8F0] font-mono text-[#4A5568]">{id}</span>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-2">Guardrails</p>
            <div className="space-y-1.5">
              {[
                { key: 'guardrail_humanReview',      label: 'Human review'    },
                { key: 'guardrail_auditLog',         label: 'Audit logging'   },
                { key: 'guardrail_rateLimitEmail',   label: 'Email rate-limit'},
                { key: 'guardrail_dryRunMode',       label: 'Dry-run mode'    },
                { key: 'guardrail_alertOnException', label: 'Alert on exception' },
              ].map(({ key, label }) => {
                const on = !!form[key]
                return (
                  <button key={key}
                    onClick={() => setSimGuardrails(prev => ({ ...prev, [key]: !prev[key] }))}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                      simGuardrails[key] ?? on ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-[#E2E8F0] bg-[#F7F8FA] text-[#9BA8BA]'
                    }`}
                  >
                    <span className="font-medium">{label}</span>
                    <span className={`font-bold ${simGuardrails[key] ?? on ? 'text-emerald-600' : 'text-[#CBD5E0]'}`}>
                      {simGuardrails[key] ?? on ? 'ON' : 'OFF'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="col-span-2 card overflow-hidden flex flex-col" style={{ height: '420px' }}>
          <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center gap-2" style={{ background: '#1A2340' }}>
            <Terminal size={14} className="text-emerald-400" />
            <span className="text-xs font-semibold text-white">{form.name || 'Agent'} — Simulation Console</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFBFC]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'system' ? (
                  <div className="w-full px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-700 text-center">{m.text}</div>
                ) : m.role === 'user' ? (
                  <div className="max-w-[75%] px-3 py-2 rounded-xl rounded-tr-sm text-xs text-white" style={{ background: '#C8102E' }}>{m.text}</div>
                ) : (
                  <div className="max-w-[75%] px-3 py-2 rounded-xl rounded-tl-sm bg-white border border-[#E2E8F0] text-xs text-[#1A2340] leading-relaxed">
                    <div className="flex items-center gap-1 mb-1">
                      <Bot size={10} className="text-[#1A2340]" />
                      <span className="text-xs font-semibold text-[#9BA8BA]">Agent response</span>
                    </div>
                    {m.text}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-[#E2E8F0]">
                  {[0,1,2].map(i => (
                    <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-[#CBD5E0]"
                      animate={{ y: [0,-4,0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i*0.12 }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div className="p-3 border-t border-[#E2E8F0] flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send() }}
              placeholder="Send a test input to the agent..."
              className="flex-1 px-3 py-2 rounded-lg border border-[#E2E8F0] text-xs focus:outline-none focus:border-[#1A2340] transition-colors" />
            <button onClick={send} disabled={!input.trim()}
              className="px-3 py-2 rounded-lg text-white text-xs font-medium disabled:opacity-40 transition-all"
              style={{ background: '#1A2340' }}>
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Phase 3: Non-Prod Deployment ─────────────────────────────────────────────
function PhaseNonProd({ form, set }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-[#1A2340]">Non-Production Deployment</h2>
        <p className="text-xs text-[#718096] mt-0.5">Deploy to staging and validate against real data before going live</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="card p-5 space-y-4">
          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Environment Settings</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#4A5568] mb-1.5">Target Environment</label>
              <select value={form.env || 'staging'} onChange={e => set('env', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#C8102E] bg-white">
                <option value="staging">Staging</option>
                <option value="uat">UAT</option>
                <option value="sandbox">Sandbox</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4A5568] mb-1.5">Data Source</label>
              <select value={form.dataSource || 'synthetic'} onChange={e => set('dataSource', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#C8102E] bg-white">
                <option value="synthetic">Synthetic test data</option>
                <option value="anonymized">Anonymised production copy</option>
                <option value="live-readonly">Live data (read-only)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4A5568] mb-1.5">Validation Period</label>
              <select value={form.validationPeriod || '48h'} onChange={e => set('validationPeriod', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#C8102E] bg-white">
                <option value="24h">24 hours</option>
                <option value="48h">48 hours</option>
                <option value="7d">7 days</option>
                <option value="manual">Manual sign-off</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Pre-Deployment Checklist</p>
          {[
            { label: 'System prompt reviewed',        done: !!form.systemPrompt              },
            { label: 'Skills configured',             done: (form.skills   || []).length > 0 },
            { label: 'At least one trigger set',      done: (form.triggers || []).length > 0 },
            { label: 'Model selected',                done: !!form.model                     },
            { label: 'Simulation test passed',        done: false                            },
            { label: 'Governance guardrails enabled', done: !!form.guardrail_auditLog        },
          ].map(({ label, done }, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#F7F8FA]">
              {done
                ? <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                : <div className="w-3.5 h-3.5 rounded-full border-2 border-[#CBD5E0] flex-shrink-0" />}
              <span className={`text-xs ${done ? 'text-[#1A2340] font-medium' : 'text-[#9BA8BA]'}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5 border-l-4 border-l-amber-400 bg-amber-50">
        <div className="flex items-start gap-3">
          <Globe size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Staging deployment will be isolated</p>
            <p className="text-xs text-amber-700 mt-0.5">The agent will run with full functionality but all write actions will be sandboxed. No production data will be modified during this phase.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Phase 4: Production Deployment ──────────────────────────────────────────
function PhaseProd({ form, onDeploy, fromWorkflow }) {
  const segObj = SEGMENTS.find(s => s.key === form.segment)
  const Icon   = segObj?.icon || Bot
  const color  = segObj?.color || '#718096'
  const [showJson, setShowJson] = useState(false)

  const configJson = JSON.stringify({
    name:          form.name,
    version:       form.version || '1.0.0',
    author:        form.author  || 'DLX_AGENTIC_OS Team',
    segment:       form.segment,
    model:         form.model,
    skills:        form.skills   || [],
    triggers:      form.triggers || [],
    systemPrompt:  form.systemPrompt || '',
    maxConcurrent: form.maxConcurrent || 1,
    environment:   form.env || 'staging',
  }, null, 2)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-semibold text-[#1A2340]">
          {fromWorkflow ? 'Save Agent to Workflow' : 'Production Deployment'}
        </h2>
        <p className="text-xs text-[#718096] mt-0.5">
          {fromWorkflow
            ? 'Review your agent configuration and save it to the workflow pipeline'
            : 'Review your agent configuration and deploy to production'}
        </p>
      </div>

      {/* Summary card */}
      <div className="card p-5" style={{ borderLeft: `4px solid ${color}` }}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
            <Icon size={20} style={{ color }} />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-[#1A2340]">{form.name || 'Unnamed Agent'}</h3>
            <p className="text-sm text-[#718096]">{form.description || 'No description provided'}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Segment',  value: segObj?.label || '—'                              },
            { label: 'Model',    value: form.model?.split('-').slice(1,3).join(' ') || '—' },
            { label: 'Skills',   value: `${(form.skills   || []).length} tools`            },
            { label: 'Triggers', value: `${(form.triggers || []).length} triggers`         },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#F7F8FA] rounded-xl p-3">
              <p className="text-xs text-[#9BA8BA]">{label}</p>
              <p className="text-sm font-bold text-[#1A2340]">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Skills & Triggers */}
      <div className="grid grid-cols-2 gap-4">
        {(form.skills || []).length > 0 && (
          <div className="card p-4">
            <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-3">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {(form.skills || []).map(id => (
                <span key={id} className="px-2 py-1 rounded-lg bg-[#F7F8FA] border border-[#E2E8F0] text-xs font-mono text-[#4A5568]">{id}</span>
              ))}
            </div>
          </div>
        )}
        {(form.triggers || []).length > 0 && (
          <div className="card p-4">
            <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-3">Triggers</p>
            <div className="flex flex-col gap-1.5">
              {(form.triggers || []).map((t, i) => (
                <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-xs font-mono text-amber-700">
                  <Zap size={10} /> {t}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* JSON toggle */}
      <div>
        <button onClick={() => setShowJson(v => !v)}
          className="flex items-center gap-1.5 text-xs font-medium text-[#718096] hover:text-[#1A2340] mb-2">
          <Code size={12} /> {showJson ? 'Hide' : 'View'} Agent Config JSON
        </button>
        {showJson && (
          <pre className="p-4 rounded-xl bg-[#1A2340] text-[#10B981] text-xs font-mono overflow-x-auto leading-relaxed">{configJson}</pre>
        )}
      </div>

      {/* Deploy / Save CTA */}
      <div className={`card p-5 ${fromWorkflow ? 'bg-violet-50 border-violet-200' : 'bg-emerald-50 border-emerald-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            {fromWorkflow
              ? <GitMerge size={18} className="text-violet-600 mt-0.5 flex-shrink-0" />
              : <Rocket    size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />}
            <div>
              <p className={`text-sm font-semibold ${fromWorkflow ? 'text-violet-800' : 'text-emerald-800'}`}>
                {fromWorkflow ? 'Agent ready — save to workflow pipeline' : 'Ready to deploy to production'}
              </p>
              <p className={`text-xs mt-0.5 ${fromWorkflow ? 'text-violet-600' : 'text-emerald-700'}`}>
                {fromWorkflow
                  ? 'This agent will be added to the workflow. Return to Imagination Studio to send the full workflow for approval.'
                  : 'This agent will go live immediately and start processing real data.'}
              </p>
            </div>
          </div>
          <button onClick={onDeploy}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex-shrink-0"
            style={{
              background:  fromWorkflow ? '#7C3AED' : '#10B981',
              boxShadow:   fromWorkflow ? '0 4px 20px rgba(124,58,237,0.3)' : '0 4px 20px rgba(16,185,129,0.3)',
            }}>
            {fromWorkflow
              ? <><GitMerge size={15} /> Save to Workflow</>
              : <><Rocket   size={15} /> Deploy Agent</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Build-mode chooser ("What do you need to build?") ────────────────────────
const BUILD_OPTIONS = [
  {
    key: 'single', icon: Bot, color: '#1A2340', badge: null,
    title: 'Single Agent', tagline: 'Best for focused, specialized tasks',
    bullets: ['Document OCR & extraction', 'Credit scoring calculation', 'Single-step validation', 'Customer Q&A responses'],
    cta: 'Create Single Agent',
  },
  {
    key: 'swarm', icon: GitMerge, color: '#7C3AED', badge: 'RECOMMENDED',
    title: 'Agent Swarm', tagline: 'Best for complex, multi-step workflows',
    bullets: ['End-to-end loan processing', 'Multi-agent fraud council', 'KYC verification pipeline', 'Decisions needing consensus'],
    cta: 'Build Agent Swarm',
  },
]

const QUICK_NAV_TILES = [
  { key: 'studio', icon: Sparkles, title: 'Imagination Studio', sub: 'Design process → auto-generate swarm', gradient: 'linear-gradient(135deg,#7C3AED 0%,#5B21B6 100%)' },
  { key: 'discover', icon: Globe,  title: 'Discover Hub',       sub: 'Browse agents & swarm templates',      gradient: 'linear-gradient(135deg,#10B981 0%,#047857 100%)' },
  { key: 'single', icon: Bot,      title: 'Single Agent',       sub: 'Build focused, specialized agent',     gradient: 'linear-gradient(135deg,#1A2340 0%,#2D3A5C 100%)' },
  { key: 'swarm', icon: GitMerge,  title: 'Agent Swarm',        sub: 'Multi-agent collaboration',            gradient: 'linear-gradient(135deg,#C8102E 0%,#7C3AED 100%)' },
]

function BuildModeChooser({ navigate, onPickSingle, onPickSwarm }) {
  const handleTile = (key) => {
    if (key === 'studio')   return navigate('/studio')
    if (key === 'discover') return navigate('/agent-pool')
    if (key === 'single')   return onPickSingle()
    if (key === 'swarm')    return onPickSwarm()
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto">

      {/* Header banner */}
      <div className="rounded-2xl px-6 py-6 mb-6 flex items-center justify-between flex-wrap gap-4"
        style={{ background: 'linear-gradient(135deg,#1A2340 0%,#2D3A5C 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-display text-xl font-bold">DLX Agent Builder</h1>
            <p className="text-white/50 text-xs mt-0.5">AgentSpec-Driven &middot; Vendor-Neutral &middot; Control-Plane Governed</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/agent-pool')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10">
            <Globe size={13} /> Browse Catalog
          </button>
          <button onClick={onPickSingle}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#1A2340] bg-white hover:bg-white/90 transition-all">
            <Plus size={13} /> Create New Agent
          </button>
        </div>
      </div>

      {/* What do you need to build? */}
      <div className="mb-3 flex items-center gap-2">
        <Cpu size={15} className="text-[#1A2340]" />
        <h2 className="text-sm font-bold text-[#1A2340]">What do you need to build?</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {BUILD_OPTIONS.map(opt => {
          const Icon = opt.icon
          return (
            <div key={opt.key} className="card p-5 flex flex-col" style={{ borderColor: '#E2E8F0' }}>
              <div className="flex items-center gap-2 mb-1">
                <Icon size={16} style={{ color: opt.color }} />
                <p className="text-sm font-bold text-[#1A2340]">{opt.title}</p>
                {opt.badge && (
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700">{opt.badge}</span>
                )}
              </div>
              <p className="text-xs text-[#718096] mb-3">{opt.tagline}</p>
              <ul className="space-y-1.5 mb-4 flex-1">
                {opt.bullets.map(b => (
                  <li key={b} className="text-xs text-[#4A5568] flex items-start gap-1.5">
                    <span className="text-[#CBD5E0] mt-0.5">&bull;</span> {b}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => opt.key === 'single' ? onPickSingle() : onPickSwarm()}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: opt.key === 'swarm' ? '#7C3AED' : '#1A2340' }}
              >
                {opt.cta}
              </button>
            </div>
          )
        })}
      </div>

      {/* Quick-nav gradient tiles */}
      <div className="grid grid-cols-4 gap-4">
        {QUICK_NAV_TILES.map(tile => {
          const Icon = tile.icon
          return (
            <button
              key={tile.key}
              onClick={() => handleTile(tile.key)}
              className="rounded-2xl p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.99]"
              style={{ background: tile.gradient }}
            >
              <Icon size={18} className="text-white/90 mb-6" />
              <p className="text-sm font-bold text-white leading-tight">{tile.title}</p>
              <p className="text-xs text-white/60 mt-1 leading-snug">{tile.sub}</p>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Swarm Builder ──────────────────────────────────────────────────────────
const TOPOLOGIES = [
  { key: 'hierarchical', icon: Crown,        color: '#7C3AED', bg: '#F5F3FF', pattern: 'manager → workers',
    title: 'Hierarchical Swarm', desc: 'Manager agent delegates tasks to specialized workers. Best for complex multi-step processes.',
    bestFor: ['Merchant Onboarding', 'Document Processing', 'Invoice Reconciliation'] },
  { key: 'consensus', icon: Users,           color: '#1D4ED8', bg: '#EFF6FF', pattern: 'peer ↔ peer ↔ peer',
    title: 'Consensus Council', desc: 'Agents vote democratically on decisions. Best for high-stakes decisions requiring multiple perspectives.',
    bestFor: ['Fraud Detection', 'Risk Assessment', 'Compliance Review'] },
  { key: 'pipeline', icon: ArrowRight,       color: '#059669', bg: '#ECFDF5', pattern: 'A → B → C → D',
    title: 'Pipeline Chain', desc: 'Sequential handoff between agents. Each agent processes and passes to the next.',
    bestFor: ['KYB Verification', 'Invoice-to-Cash', 'Data Enrichment'] },
  { key: 'parallel', icon: Share2,           color: '#0EA5E9', bg: '#EFF6FF', pattern: 'coordinator → [A, B, C] → aggregator',
    title: 'Parallel Fan-Out', desc: 'Coordinator distributes work to parallel workers, then aggregates results.',
    bestFor: ['Batch Data Processing', 'Multi-Document Analysis', 'Segment Scoring'] },
  { key: 'negotiation', icon: MessageSquare, color: '#B45309', bg: '#FFFBEB', pattern: 'agent ↔ agent (rounds)',
    title: 'Negotiation Swarm', desc: 'Agents with different objectives negotiate to find an optimal solution.',
    bestFor: ['Dynamic Pricing', 'Dispute Resolution', 'Policy Exceptions'] },
  { key: 'reactive', icon: Zap,              color: '#DC2626', bg: '#FEF2F2', pattern: 'event → subscriber(s)',
    title: 'Reactive Event Mesh', desc: 'Agents react to events and trigger other agents. Event-driven collaboration.',
    bestFor: ['Transaction Monitoring', 'Alert Handling', 'Real-Time Triggers'] },
]

const ROLE_LABELS = {
  hierarchical: (i) => i === 0 ? 'manager' : 'worker',
  consensus:    () => 'peer',
  pipeline:     () => 'worker',
  parallel:     (i) => i === 0 ? 'coordinator' : 'worker',
  negotiation:  () => 'negotiator',
  reactive:     (i) => i === 0 ? 'trigger' : 'subscriber',
}
const ROLE_STYLE = {
  manager:     { bg: '#EDE9FE', text: '#6D28D9' },
  worker:      { bg: '#F1F5F9', text: '#475569' },
  peer:        { bg: '#DBEAFE', text: '#1D4ED8' },
  coordinator: { bg: '#DBEAFE', text: '#1D4ED8' },
  negotiator:  { bg: '#FEF3C7', text: '#B45309' },
  trigger:     { bg: '#FEE2E2', text: '#B91C1C' },
  subscriber:  { bg: '#F1F5F9', text: '#475569' },
}

// Templates reuse real agents from Discover Hub, so a deployed swarm's roster
// matches what's already in the catalog (and, for fraud/invoice, the same
// rosters shown in Multi-Agent Orchestration).
const TEMPLATES = [
  {
    key: 'onboarding', topology: 'hierarchical', latency: '2.4s',
    name: 'SMB Merchant Onboarding Swarm',
    agents: [
      { name: 'Onboarding Orchestrator', description: 'Coordinates the full onboarding pipeline end-to-end',        linkedId: null },
      { name: 'KYB Verification Agent',  description: 'Verifies business identity and sanctions screening',         linkedId: 'ia-01' },
      { name: 'Document Collection Bot', description: 'Requests, parses and validates merchant documents',          linkedId: 'ia-02' },
      { name: 'Risk Scoring Engine',     description: 'ML-based risk scoring engine integrating fraud signals',     linkedId: 'ia-03' },
      { name: 'Approval Notifier',       description: 'Routes decisions to approvers and stakeholders',             linkedId: 'ia-11' },
    ],
  },
  {
    key: 'fraud', topology: 'consensus', latency: '0.8s',
    name: 'Fraud Detection Council',
    agents: [
      { name: 'Fraud Detection Agent',    description: 'Sub-second real-time fraud detection',            linkedId: 'ia-20' },
      { name: 'Dispute Resolution Agent', description: 'Manages chargeback and dispute workflows',         linkedId: 'ia-26' },
      { name: 'Violation Classifier',     description: 'Categorises policy violations by severity',        linkedId: 'ia-17' },
      { name: 'Compliance Audit Agent',   description: 'Generates automated compliance audit reports',     linkedId: 'ia-40' },
    ],
  },
  {
    key: 'invoice', topology: 'pipeline', latency: '3.2s',
    name: 'Invoice-to-Cash Reconciliation',
    agents: [
      { name: 'Invoice Ingestion Agent', description: 'Parses and classifies incoming invoices',       linkedId: 'ia-13' },
      { name: 'PO Matching Engine',      description: 'Fuzzy-matches invoices to purchase orders',      linkedId: 'ia-04' },
      { name: 'GL Posting Agent',        description: 'Posts verified invoices to the general ledger',  linkedId: 'ia-05' },
      { name: 'Exception Handler',       description: 'Flags unmatched invoices for finance review',    linkedId: 'ia-14' },
    ],
  },
]

const SWARM_STEPS = [
  { key: 'topology',   label: 'Topology',   icon: Share2 },
  { key: 'agents',     label: 'Agents',     icon: Bot },
  { key: 'governance', label: 'Governance', icon: Shield },
  { key: 'review',     label: 'Review',     icon: CheckCircle },
]

function TopologyStep({ onPick, onTemplate }) {
  return (
    <div>
      <div className="rounded-2xl border border-[#DDD6FE] bg-[#F5F3FF] px-5 py-4 mb-5 flex items-start gap-3">
        <Sparkles size={16} className="text-[#7C3AED] mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-[#1A2340]">Choose Your Swarm Topology</p>
          <p className="text-xs text-[#6D28D9] mt-0.5">Select how agents will collaborate. Each topology has different coordination patterns, governance models, and optimal use cases.</p>
        </div>
      </div>

      <p className="text-xs font-bold text-[#9BA8BA] uppercase tracking-wider mb-3">Quick Start Templates</p>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {TEMPLATES.map(tpl => {
          const t = TOPOLOGIES.find(x => x.key === tpl.topology)
          const Icon = t.icon
          return (
            <button key={tpl.key} onClick={() => onTemplate(tpl)}
              className="card p-4 text-left hover:border-[#7C3AED] hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: t.bg }}>
                  <Icon size={13} style={{ color: t.color }} />
                </div>
                <span className="text-xs font-semibold text-[#718096]">{t.title}</span>
              </div>
              <p className="text-sm font-bold text-[#1A2340] leading-tight">{tpl.name}</p>
              <p className="text-xs text-[#9BA8BA] mt-1">{tpl.agents.length} agents &middot; {tpl.latency}</p>
            </button>
          )
        })}
      </div>

      <p className="text-xs font-bold text-[#9BA8BA] uppercase tracking-wider mb-3">Or Build Custom</p>
      <div className="grid grid-cols-2 gap-4">
        {TOPOLOGIES.map(t => {
          const Icon = t.icon
          return (
            <button key={t.key} onClick={() => onPick(t.key)}
              className="card p-5 text-left hover:border-[#7C3AED] hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: t.bg }}>
                  <Icon size={18} style={{ color: t.color }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1A2340]">{t.title}</p>
                  <span className="text-xs font-mono text-[#9BA8BA]">{t.pattern}</span>
                </div>
              </div>
              <p className="text-xs text-[#718096] mb-3 leading-relaxed">{t.desc}</p>
              <div className="pt-3 border-t border-[#F0F2F5]">
                <p className="text-xs text-[#9BA8BA] mb-1.5">Best for:</p>
                <div className="flex flex-wrap gap-1">
                  {t.bestFor.map(b => (
                    <span key={b} className="px-2 py-0.5 rounded-md text-xs font-medium bg-[#F7F8FA] text-[#4A5568]">{b}</span>
                  ))}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function AgentsStep({ topo, swarmName, setSwarmName, agents, onAdd, onUpdate, onRemove, onLink }) {
  const Icon = topo.icon
  return (
    <div>
      <div className="rounded-2xl px-5 py-4 mb-5 flex items-start gap-3" style={{ background: topo.bg, border: `1px solid ${topo.color}30` }}>
        <Icon size={18} style={{ color: topo.color }} className="mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-[#1A2340]">{topo.title} <span className="text-xs font-normal text-[#718096]">&middot; {topo.pattern}</span></p>
          <p className="text-xs text-[#718096] mt-0.5">{topo.desc}</p>
        </div>
      </div>

      <label className="text-xs font-semibold text-[#718096] mb-1.5 block">Swarm Name</label>
      <input value={swarmName} onChange={e => setSwarmName(e.target.value)} placeholder="e.g. Merchant Onboarding Swarm"
        className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm mb-5 focus:outline-none focus:border-[#7C3AED]" />

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-[#1A2340]">Swarm Agents</p>
        <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90" style={{ background: '#7C3AED' }}>
          <Plus size={12} /> Add Agent
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {agents.length === 0 && (
          <div className="card p-8 text-center">
            <Bot size={22} className="text-[#CBD5E0] mx-auto mb-2" />
            <p className="text-xs text-[#9BA8BA]">No agents yet — click "Add Agent" to build your roster.</p>
          </div>
        )}
        {agents.map((a, i) => {
          const rs = ROLE_STYLE[a.role] || ROLE_STYLE.worker
          return (
            <div key={a.id} className="card p-4 flex items-start gap-3">
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5" style={{ background: '#1A2340' }}>{i + 1}</span>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <input value={a.name} onChange={e => onUpdate(a.id, { name: e.target.value })} placeholder="Agent name"
                    className="flex-1 min-w-[140px] px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#1A2340] focus:outline-none focus:border-[#7C3AED]" />
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase" style={{ background: rs.bg, color: rs.text }}>{a.role}</span>
                </div>
                <input value={a.description} onChange={e => onUpdate(a.id, { description: e.target.value })} placeholder="What does this agent do?"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] text-xs text-[#718096] focus:outline-none focus:border-[#7C3AED]" />
                <select value={a.linkedId || ''} onChange={e => onLink(a.id, e.target.value || null)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] text-xs text-[#4A5568] bg-white focus:outline-none">
                  <option value="">Link to existing agent…</option>
                  {INDIVIDUAL_AGENTS.map(ia => <option key={ia.id} value={ia.id}>{ia.name}</option>)}
                </select>
              </div>
              <button onClick={() => onRemove(a.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 flex-shrink-0 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GovernanceStep({ timeout, setTimeoutVal, maxRetries, setMaxRetries, escalation, setEscalation, sharedContext, setSharedContext, persistResults, setPersistResults }) {
  return (
    <div>
      <div className="rounded-2xl px-5 py-4 mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200">
        <Shield size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-amber-900">Swarm Governance Settings</p>
          <p className="text-xs text-amber-700 mt-0.5">Configure how agents collaborate, resolve conflicts, and handle failures.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-6">
        <div>
          <label className="text-xs font-semibold text-[#718096] mb-1.5 block">Execution Timeout</label>
          <select value={timeout} onChange={e => setTimeoutVal(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm bg-white focus:outline-none">
            {['15 seconds', '30 seconds', '60 seconds', '120 seconds'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#718096] mb-1.5 block">Max Retries</label>
          <select value={maxRetries} onChange={e => setMaxRetries(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm bg-white focus:outline-none">
            {['1 retry', '2 retries', '3 retries', '5 retries'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-xs font-semibold text-[#718096] mb-1.5 block">Escalation Policy</label>
        <select value={escalation} onChange={e => setEscalation(e.target.value)}
          className="w-full max-w-sm px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm bg-white focus:outline-none">
          {['Escalate to Human', 'Auto-Retry', 'Fail Silently', 'Notify Only'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      <p className="text-sm font-bold text-[#1A2340] mb-3">Shared Memory</p>
      <div className="flex flex-col gap-2.5">
        {[
          { key: 'context', checked: sharedContext, set: setSharedContext, title: 'Shared Context Pool', desc: 'Agents share context within swarm execution' },
          { key: 'persist', checked: persistResults, set: setPersistResults, title: 'Persist Results', desc: 'Save swarm outputs to episodic memory' },
        ].map(opt => (
          <label key={opt.key} className="card p-4 flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-[#1A2340]">{opt.title}</p>
              <p className="text-xs text-[#9BA8BA] mt-0.5">{opt.desc}</p>
            </div>
            <input type="checkbox" checked={opt.checked} onChange={e => opt.set(e.target.checked)}
              className="w-4 h-4 rounded accent-[#7C3AED]" />
          </label>
        ))}
      </div>
    </div>
  )
}

function ReviewStep({ topo, swarmName, agents, timeout, escalation, sharedContext, canDeploy, onDeploy }) {
  const TIcon = topo.icon
  return (
    <div>
      <div className={`rounded-2xl px-5 py-4 mb-6 flex items-start gap-3 ${canDeploy ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
        {canDeploy
          ? <CheckCircle size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
          : <Shield size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />}
        <div>
          <p className={`text-sm font-bold ${canDeploy ? 'text-emerald-900' : 'text-amber-900'}`}>
            {canDeploy ? 'Ready to Deploy' : 'A few things need attention'}
          </p>
          <p className={`text-xs mt-0.5 ${canDeploy ? 'text-emerald-700' : 'text-amber-700'}`}>
            {canDeploy ? 'Review your swarm configuration before deployment.' : 'Give the swarm a name and at least 2 named agents before deploying.'}
          </p>
        </div>
      </div>

      <div className="card p-5 mb-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-base font-bold text-[#1A2340]">{swarmName || 'Untitled Swarm'}</p>
            <p className="text-xs text-[#718096] mt-0.5 flex items-center gap-1.5"><TIcon size={12} style={{ color: topo.color }} /> {topo.title}</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0" style={{ background: topo.bg, color: topo.color }}>{agents.length} Agents</span>
        </div>

        <div className="rounded-2xl p-5 mb-4 overflow-x-auto" style={{ background: '#0F1730' }}>
          <div className="flex items-start gap-1 min-w-max">
            {agents.map((a, i) => (
              <div key={a.id} className="flex items-center">
                <div className="flex flex-col items-center flex-shrink-0" style={{ width: 110 }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-1.5" style={{ background: i === 0 ? topo.color : 'rgba(255,255,255,0.1)' }}>
                    <Bot size={18} className="text-white" />
                  </div>
                  <p className="text-xs font-semibold text-white text-center leading-tight truncate w-full">{a.name || `Agent ${i + 1}`}</p>
                  <p className="text-xs text-white/40">{a.role}</p>
                </div>
                {i < agents.length - 1 && <ArrowRight size={16} className="text-white/25 mx-1 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-[#F7F8FA] px-3 py-2.5"><p className="text-xs text-[#9BA8BA]">Timeout</p><p className="text-sm font-bold text-[#1A2340]">{timeout}</p></div>
          <div className="rounded-xl bg-[#F7F8FA] px-3 py-2.5"><p className="text-xs text-[#9BA8BA]">Escalation</p><p className="text-sm font-bold text-[#1A2340]">{escalation.replace('Escalate to ', '')}</p></div>
          <div className="rounded-xl bg-[#F7F8FA] px-3 py-2.5"><p className="text-xs text-[#9BA8BA]">Shared Memory</p><p className="text-sm font-bold text-[#1A2340]">{sharedContext ? 'Enabled' : 'Disabled'}</p></div>
        </div>
      </div>

      <button onClick={onDeploy} disabled={!canDeploy}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 hover:opacity-90 active:scale-[0.99]"
        style={{ background: canDeploy ? 'linear-gradient(135deg,#7C3AED 0%,#4338CA 100%)' : '#CBD5E0' }}>
        <Play size={15} /> Deploy Swarm
      </button>
    </div>
  )
}

function SwarmBuilderFlow({ onExit }) {
  const navigate = useNavigate()
  const { addToast, deployWorkflow } = useStore()

  const [step, setStep] = useState('topology')
  const [topology, setTopology] = useState(null)
  const [swarmName, setSwarmName] = useState('')
  const [agents, setAgents] = useState([])
  const [timeout_, setTimeoutVal] = useState('30 seconds')
  const [maxRetries, setMaxRetries] = useState('3 retries')
  const [escalation, setEscalation] = useState('Escalate to Human')
  const [sharedContext, setSharedContext] = useState(true)
  const [persistResults, setPersistResults] = useState(true)
  const [deployed, setDeployed] = useState(false)

  const topo = TOPOLOGIES.find(t => t.key === topology)
  const stepIndex = SWARM_STEPS.findIndex(s => s.key === step)

  const applyTemplate = (tpl) => {
    setTopology(tpl.topology)
    setSwarmName(tpl.name)
    setAgents(tpl.agents.map((a, i) => ({
      id: `sa-${Date.now()}-${i}`, name: a.name, description: a.description,
      role: ROLE_LABELS[tpl.topology](i), linkedId: a.linkedId,
    })))
    setStep('agents')
  }

  const pickTopology = (key) => {
    setTopology(key)
    setAgents([])
    setStep('agents')
  }

  const addAgentRow = () => {
    setAgents(prev => [...prev, {
      id: `sa-${Date.now()}`, name: '', description: '',
      role: ROLE_LABELS[topology](prev.length), linkedId: null,
    }])
  }
  const updateAgent = (id, patch) => setAgents(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a))
  const removeAgent = (id) => setAgents(prev => prev.filter(a => a.id !== id))
  const linkAgent = (id, linkedId) => {
    const src = INDIVIDUAL_AGENTS.find(a => a.id === linkedId)
    updateAgent(id, { linkedId, name: src ? src.name : '', description: src ? src.description : '' })
  }

  const canDeploy = swarmName.trim().length > 0 && agents.length >= 2 && agents.every(a => a.name.trim())

  const handleDeploySwarm = () => {
    deployWorkflow({
      name: swarmName,
      description: `${topo.title} — ${agents.length} agents collaborating (${topo.pattern})`,
      agents: agents.map(a => {
        const src = a.linkedId ? INDIVIDUAL_AGENTS.find(x => x.id === a.linkedId) : null
        return { name: a.name, role: a.description, tools: src?.tools || [], status: 'full' }
      }),
    })
    setDeployed(true)
    addToast({ type: 'success', title: 'Swarm submitted for review', message: `${swarmName} is under review — visible in Discover Hub.` })
    setTimeout(() => navigate('/agent-pool'), 2200)
  }

  if (deployed) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <h2 className="font-display text-2xl font-bold text-[#1A2340] mb-2">Swarm Deployed!</h2>
        <p className="text-[#718096] mb-2"><strong className="text-[#1A2340]">{swarmName}</strong> has been submitted for compliance review.</p>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 mb-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
          <span className="text-xs font-semibold text-amber-700">Under Review — visible in Discover Hub</span>
        </div>
        <p className="text-sm text-[#CBD5E0]">Redirecting to Discover Hub…</p>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto">

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-xl font-bold text-[#1A2340]">Swarm Builder</h1>
          <p className="text-sm text-[#718096] mt-1">Design multi-agent collaboration patterns</p>
        </div>
        <button onClick={onExit} className="text-xs text-[#718096] flex items-center gap-1 hover:text-[#1A2340]">
          <X size={13} /> Cancel
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {SWARM_STEPS.map((s, i) => {
          const Icon = s.icon
          const active = step === s.key
          const done = stepIndex > i
          return (
            <div key={s.key} className="flex items-center gap-2">
              <button
                onClick={() => { if (done || active) setStep(s.key) }}
                disabled={!done && !active}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  active ? 'text-white' : done ? 'text-[#7C3AED] bg-violet-50 hover:bg-violet-100' : 'text-[#CBD5E0] bg-[#F7F8FA] cursor-not-allowed'
                }`}
                style={active ? { background: '#7C3AED' } : undefined}
              >
                <Icon size={13} /> {s.label}
              </button>
              {i < SWARM_STEPS.length - 1 && <ChevronRight size={14} className="text-[#CBD5E0]" />}
            </div>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
          {step === 'topology' && <TopologyStep onPick={pickTopology} onTemplate={applyTemplate} />}
          {step === 'agents' && topo && (
            <AgentsStep topo={topo} swarmName={swarmName} setSwarmName={setSwarmName}
              agents={agents} onAdd={addAgentRow} onUpdate={updateAgent} onRemove={removeAgent} onLink={linkAgent} />
          )}
          {step === 'governance' && (
            <GovernanceStep timeout={timeout_} setTimeoutVal={setTimeoutVal} maxRetries={maxRetries} setMaxRetries={setMaxRetries}
              escalation={escalation} setEscalation={setEscalation}
              sharedContext={sharedContext} setSharedContext={setSharedContext}
              persistResults={persistResults} setPersistResults={setPersistResults} />
          )}
          {step === 'review' && topo && (
            <ReviewStep topo={topo} swarmName={swarmName} agents={agents}
              timeout={timeout_} escalation={escalation} sharedContext={sharedContext}
              canDeploy={canDeploy} onDeploy={handleDeploySwarm} />
          )}
        </motion.div>
      </AnimatePresence>

      {(step === 'agents' || step === 'governance') && (
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#F0F2F5]">
          <button onClick={() => setStep(SWARM_STEPS[stepIndex - 1].key)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#4A5568] hover:bg-[#F7F8FA]">
            <ChevronLeft size={16} /> Back
          </button>
          <button
            onClick={() => setStep(SWARM_STEPS[stepIndex + 1].key)}
            disabled={step === 'agents' && (!swarmName.trim() || agents.length < 2)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 transition-all"
            style={{ background: '#7C3AED' }}>
            Continue <ChevronRight size={16} />
          </button>
        </div>
      )}
      {step === 'review' && (
        <div className="flex items-center justify-start mt-8 pt-4 border-t border-[#F0F2F5]">
          <button onClick={() => setStep('governance')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#4A5568] hover:bg-[#F7F8FA]">
            <ChevronLeft size={16} /> Back
          </button>
        </div>
      )}
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AgentBuilder() {
  const navigate    = useNavigate()
  const location    = useLocation()
  const { addToast, addBuiltAgent } = useStore()

  const template      = location.state?.template
  const prefill       = location.state?.prefill
  const fromWorkflow  = location.state?.fromWorkflow  || false
  const workflowStep  = location.state?.workflowStep  || null

  const [phase,     setPhase]     = useState(1)
  const [deployed,  setDeployed]  = useState(false)
  const [showVelox, setShowVelox] = useState(false)

  // Fresh visits (no template/prefill/workflow context) start on the build-mode chooser
  const skipChooser = fromWorkflow || !!template || !!prefill
  const [buildMode,  setBuildMode] = useState(skipChooser ? 'single' : null)

  const defaultForm = template ? {
    name:        template.name + ' (Copy)',
    description: template.description,
    segment:     template.segment,
    model:       template.model,
    skills:      [...(template.tools    || [])],
    triggers:    [...(template.triggers || [])],
    systemPrompt: '', maxConcurrent: 3, version: '1.0.0', author: 'DLX_AGENTIC_OS Team',
    env: 'staging', dataSource: 'anonymized', validationPeriod: '48h',
    guardrail_humanReview: true, guardrail_auditLog: true,
    guardrail_rateLimitEmail: false, guardrail_dryRunMode: false, guardrail_alertOnException: true,
  } : prefill ? {
    name:        prefill.name        || '',
    description: prefill.description || prefill.role || '',
    segment:     prefill.segment     || 'merchant',
    model:       'claude-sonnet-4-6',
    skills:      prefill.tools       || [],
    triggers:    [],
    systemPrompt: prefill.systemPrompt
      ? prefill.systemPrompt
      : prefill.suggestion
        ? `You are a ${prefill.name || 'Deluxe AI Agent'} for Deluxe Corporation.\n\n${prefill.suggestion}\n\nPrioritise accuracy. Log all actions. Flag exceptions for human review.`
        : '',
    maxConcurrent: 1, version: '1.0.0',
    author: prefill.collaborationAuthor ? prefill.collaborationAuthor + ' + ' + CURRENT_USER : CURRENT_USER,
    env: 'staging', dataSource: 'anonymized', validationPeriod: '48h',
    guardrail_humanReview: true, guardrail_auditLog: true,
    guardrail_rateLimitEmail: false, guardrail_dryRunMode: false, guardrail_alertOnException: true,
  } : { ...EMPTY_FORM }

  const [form, setForm] = useState(defaultForm)
  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const canAdvance = () => {
    if (phase === 1) return form.name.trim().length > 0 && !!form.segment
    if (phase === 2) return true
    if (phase === 3) return true
    return false
  }

  const handleDeploy = () => {
    addBuiltAgent({
      id:          `custom-${Date.now()}`,
      name:        form.name,
      segment:     form.segment    || 'platform',
      segmentKey:  form.segment    || 'platform',
      description: form.description || '',
      status:      'under-review',
      riskReport:  generateRiskReport(form.name, form.description || '', form.skills || []),
      model:       form.model      || 'claude-sonnet-4-6',
      version:     form.version    || '1.0.0',
      teams:       1, deployments: 0, successRate: 100, tasksToday: 0, savingsDay: 0,
      solves:      [form.description || 'Custom agent task'],
      doesNotSolve: [],
      tools:        form.skills   || [],
      capabilities: form.skills   || [],
      category:    'Custom',
      author:      form.author || CURRENT_USER,
      systemPrompt: form.systemPrompt,
      guardrails: {
        humanReview:      !!form.guardrail_humanReview,
        auditLog:         !!form.guardrail_auditLog,
        rateLimitEmail:   !!form.guardrail_rateLimitEmail,
        dryRunMode:       !!form.guardrail_dryRunMode,
        alertOnException: !!form.guardrail_alertOnException,
      },
      isCustom:    true,
    })

    if (fromWorkflow) {
      addToast({ type: 'success', title: 'Agent saved to workflow!', message: `${form.name} has been configured. Return to Imagination Studio to submit the full workflow.` })
      // Pass back the 0-indexed step so ImagineStudio marks it as built
      setTimeout(() => navigate('/studio', { state: { builtWorkflowStep: (workflowStep ?? 1) - 1 } }), 1800)
    } else {
      setDeployed(true)
      addToast({ type: 'success', title: 'Agent submitted for review', message: `${form.name} is under review — visible in Discover Hub.` })
      setTimeout(() => navigate('/agent-pool'), 2500)
    }
  }

  if (deployed) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <h2 className="font-display text-2xl font-bold text-[#1A2340] mb-2">Agent Deployed!</h2>
        <p className="text-[#718096] mb-2"><strong className="text-[#1A2340]">{form.name}</strong> has been submitted for compliance review.</p>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 mb-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
          <span className="text-xs font-semibold text-amber-700">Under Review — visible in Discover Hub</span>
        </div>
        <p className="text-sm text-[#CBD5E0]">Redirecting to Discover Hub…</p>
      </motion.div>
    )
  }

  if (buildMode === 'swarm') {
    return <SwarmBuilderFlow onExit={() => setBuildMode(null)} />
  }

  if (!buildMode) {
    return <BuildModeChooser navigate={navigate} onPickSingle={() => setBuildMode('single')} onPickSwarm={() => setBuildMode('swarm')} />
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto">

      <AnimatePresence>
        {showVelox && (
          <VeloxDocsPanel
            onClose={() => setShowVelox(false)}
            addToast={addToast}
            currentForm={form}
            onFillSpec={spec => {
              // Claude has already produced a unified spec — apply directly.
              // Name: only overwrite if currently empty
              if (spec.name && !form.name.trim())       set('name', spec.name)
              // Description + systemPrompt: Claude unified these — use the result as-is
              if (spec.description)                     set('description', spec.description)
              // Segment: only update if still at default
              if (spec.segment && form.segment === 'merchant') set('segment', spec.segment)
              // Skills: union (additive makes sense for tools)
              if (spec.skills?.length) {
                const merged = [...new Set([...(form.skills || []), ...spec.skills])]
                set('skills', merged)
              }
              // System prompt: Claude rewrote this as unified — replace with the result
              if (spec.systemPrompt)                    set('systemPrompt', spec.systemPrompt)
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-xl font-bold text-[#1A2340]">
            {fromWorkflow ? 'Agent Configuration' : 'Agent Builder'}
          </h1>
          <p className="text-sm text-[#718096] mt-1">
            {fromWorkflow
              ? `Building agent for workflow pipeline${workflowStep ? ` — Step ${workflowStep}` : ''}`
              : template
                ? `Cloning from: ${template.name}`
                : prefill
                  ? `Pre-filled from Imagination Studio — ${prefill.name}`
                  : 'Design, test, and deploy enterprise AI agents with confidence'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowVelox(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-[#C7D2FE] bg-[#EFF6FF] text-[#4338CA] hover:bg-[#E0EAFF] transition-all">
            <BookOpen size={13} className="text-[#4338CA]" /> Select Relevant Docs
          </button>
          {fromWorkflow && (
            <button
              onClick={() => navigate('/studio')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-violet-700 bg-violet-50 border border-violet-200 hover:bg-violet-100 transition-all"
            >
              <ArrowLeft size={12} /> Back to Studio
            </button>
          )}
          <button
            onClick={() => navigate(fromWorkflow ? '/studio' : '/dashboard')}
            className="text-xs text-[#718096] flex items-center gap-1 hover:text-[#1A2340]"
          >
            <X size={13} /> Cancel
          </button>
        </div>
      </div>

      {/* Phase bar */}
      <PhaseBar phase={phase} setPhase={setPhase} canAdvance={canAdvance} />

      {/* Phase content */}
      <AnimatePresence mode="wait">
        <motion.div key={phase}
          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}>
          {phase === 1 && (
            <PhaseDocumentDesigner
              form={form}
              set={set}
              fromWorkflow={fromWorkflow}
              workflowStep={workflowStep}
            />
          )}
          {phase === 2 && <PhaseSimulation form={form} />}
          {phase === 3 && <PhaseNonProd form={form} set={set} />}
          {phase === 4 && <PhaseProd form={form} onDeploy={handleDeploy} fromWorkflow={fromWorkflow} />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#F0F2F5]">
        <button onClick={() => setPhase(p => p - 1)} disabled={phase === 1}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#4A5568] disabled:opacity-40 hover:bg-[#F7F8FA]">
          <ChevronLeft size={16} /> Back
        </button>
        {phase < 4 && (
          <button onClick={() => setPhase(p => p + 1)} disabled={!canAdvance()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 transition-all"
            style={{ background: '#1A2340', boxShadow: canAdvance() ? '0 4px 20px rgba(26,35,64,0.25)' : 'none' }}>
            Continue <ChevronRight size={16} />
          </button>
        )}
      </div>
    </motion.div>
  )
}
