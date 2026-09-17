/* ══════════════════════════════════════════════════════════════════════════════
   PLATFORM DATA — the single source of truth for the whole app.

   Every page derives its figures from this file. If a number is shown to a user
   anywhere in DLX_AGENTIC_OS it should either be a field on one of these records
   or a documented formula over them — never independently hand-typed, so the
   same metric can't disagree between two screens.
   ══════════════════════════════════════════════════════════════════════════════ */
import {
  CreditCard, Printer, FileText, Database, Shield, Layers,
  Mail, Globe, Zap, Wrench, Server, Cloud, Cpu, CheckCheck,
  Lock, Code, Settings, Users, TrendingUp, Sparkles, Bot,
} from 'lucide-react'

export const segColors = { merchant: '#0EA5E9', print: '#6B7280', b2b: '#8B5CF6', data: '#10B981', platform: '#C8102E', shared: '#F59E0B' }
export const segIcons  = { merchant: CreditCard, print: Printer, b2b: FileText, data: Database, platform: Shield, shared: Layers }

/* ══════════════════════════════════════════════════════════════════════════════
   HARDCODED DATA
   ══════════════════════════════════════════════════════════════════════════════ */

/* ── Section 1: Workflows ─────────────────────────────────────────────────── */
export const ALL_WORKFLOWS = [
  {
    id: 'wf-001',
    name: 'SMB Merchant Onboarding Pipeline',
    description: 'Full end-to-end merchant onboarding — KYB verification, document collection, risk scoring and approval.',
    segmentKey: 'merchant', segment: 'Merchant Services',
    authors: ['Satishkumar Balasubramanian', 'Ashish Agarwal'],
    status: 'live', sla: 99.2, tasksPerDay: 423,
    lastRun: '2 min ago', avgRunTime: '4.2 min',
    trigger: 'Merchant Application Submitted',
    output: 'Merchant Onboarded — Live in Dashboard',
    agents: [
      { id: 'a1', name: 'KYB Verification Agent',  role: 'Verifies business identity via D&B and KYB APIs',             tools: ['kyb-api', 'dnb-lookup', 'sanctions-check'], status: 'full' },
      { id: 'a2', name: 'Document Collection Bot', role: 'Requests, parses & validates required merchant documents',     tools: ['doc-parser', 'email-send', 'ocr-extract'],  status: 'full' },
      { id: 'a3', name: 'Risk Scoring Engine',     role: 'Scores merchant risk profile using ML-based risk model',       tools: ['risk-model', 'crm-write', 'fraud-signals'], status: 'full' },
      { id: 'a4', name: 'Approval Notifier',       role: 'Routes to approver & notifies all stakeholders on decision',  tools: ['workflow-api', 'notify-send', 'crm-update'], status: 'full' },
    ],
  },
  {
    id: 'wf-002',
    name: 'Invoice-to-Cash Reconciliation',
    description: 'Automated invoice ingestion, PO matching, GL posting and exception escalation for B2B payment flows.',
    segmentKey: 'b2b', segment: 'B2B Payments',
    authors: ['Vadivel Mohanakrishnan'],
    status: 'incomplete', sla: 97.8, tasksPerDay: 289,
    lastRun: '8 min ago', avgRunTime: '2.8 min',
    trigger: 'Invoice Received (Email / EDI)',
    output: 'Payment Cleared — Ledger Updated',
    agents: [
      { id: 'b1', name: 'Invoice Ingestion Agent', role: 'Parses & classifies incoming invoices from email and EDI feeds', tools: ['ocr-parser', 'email-inbox', 'edi-reader'], status: 'full' },
      { id: 'b2', name: 'PO Matching Engine',      role: 'Matches invoices to purchase orders using fuzzy matching',      tools: ['erp-read', 'match-algo', 'gl-lookup'],    status: 'full' },
      { id: 'b3', name: 'GL Posting Agent',        role: 'Posts matched invoices to general ledger with audit trail',     tools: ['gl-write', 'audit-log', 'erp-write'],     status: 'full' },
      { id: 'b4', name: 'Exception Handler',       role: 'Flags unmatched invoices & routes to finance team for review',  tools: ['notify-send', 'ticket-create', 'jira-api'], status: 'partial' },
    ],
  },
  {
    id: 'wf-003',
    name: 'Churn Prevention Campaign',
    description: 'Identifies at-risk customers, generates personalised retention offers and triggers multi-channel outreach.',
    segmentKey: 'print', segment: 'Print & Retention',
    authors: ['Swetha Surendran', 'Thilak Balakrishnan'],
    status: 'live', sla: 96.4, tasksPerDay: 178,
    lastRun: '14 min ago', avgRunTime: '3.1 min',
    trigger: 'Customer Churn Score > 0.7',
    output: 'Retention Offer Sent — CRM Updated',
    agents: [
      { id: 'c1', name: 'Churn Predictor',       role: 'Calculates real-time churn probability using ML model',       tools: ['ml-predict', 'crm-read', 'segment-api'],   status: 'full' },
      { id: 'c2', name: 'Offer Generator',        role: 'Selects best retention offer based on customer value tier',  tools: ['offer-engine', 'pricing-api', 'ab-test'],  status: 'full' },
      { id: 'c3', name: 'Campaign Dispatcher',    role: 'Sends personalised outreach via email, SMS and push',        tools: ['email-send', 'sms-gateway', 'push-notify'], status: 'full' },
    ],
  },
  {
    id: 'wf-004',
    name: 'Data Enrichment Pipeline',
    description: 'Enriches raw customer and company data with third-party signals, deduplicates records and syncs to data lake.',
    segmentKey: 'data', segment: 'Data Solutions',
    authors: ['Shubham Singh'],
    status: 'live', sla: 99.7, tasksPerDay: 1240,
    lastRun: '1 min ago', avgRunTime: '1.4 min',
    trigger: 'New Record Ingested (CRM / DB)',
    output: 'Enriched Record — Data Lake Synced',
    agents: [
      { id: 'd1', name: 'Record Classifier',    role: 'Identifies record type and routes to appropriate enricher',  tools: ['classifier-api', 'schema-detect'],          status: 'full' },
      { id: 'd2', name: 'Data Enricher',        role: 'Appends firmographic, demographic & intent signals',         tools: ['clearbit-api', 'zoominfo-api', 'dnb-lookup'], status: 'full' },
      { id: 'd3', name: 'Dedup Engine',         role: 'Merges duplicate records and maintains golden record',       tools: ['match-algo', 'crm-write', 'audit-log'],     status: 'full' },
      { id: 'd4', name: 'Data Lake Sync Agent', role: 'Pushes enriched records to Snowflake data lake',             tools: ['snowflake-write', 'schema-validate', 'dq-check'], status: 'full' },
    ],
  },
  {
    id: 'wf-005',
    name: 'Governance & Compliance Monitor',
    description: 'Continuously monitors workflows for policy violations, audits agent actions and raises compliance alerts.',
    segmentKey: 'platform', segment: 'Platform',
    authors: ['Satishkumar Balasubramanian'],
    status: 'incomplete', sla: 94.1, tasksPerDay: 87,
    lastRun: '22 min ago', avgRunTime: '5.7 min',
    trigger: 'Scheduled (Every 15 min) + Event',
    output: 'Compliance Report — Alerts Dispatched',
    agents: [
      { id: 'e1', name: 'Policy Monitor',       role: 'Scans running workflows against governance rule set',        tools: ['policy-api', 'workflow-read', 'audit-log'],  status: 'full' },
      { id: 'e2', name: 'Violation Classifier', role: 'Categorises violations by severity and domain',             tools: ['classify-api', 'risk-model'],               status: 'full' },
      { id: 'e3', name: 'Alert Dispatcher',     role: 'Notifies compliance officers and escalates critical issues', tools: ['notify-send', 'jira-api', 'email-send'],    status: 'partial' },
    ],
  },
]

/* ── Section 2: Individual Agents ────────────────────────────────────────── */
export const INDIVIDUAL_AGENTS = [
  /* Merchant Services */
  { id: 'ia-01', name: 'KYB Verification Agent',  segmentKey: 'merchant', segment: 'Merchant Services', status: 'active',  category: 'Risk & Compliance', usedIn: 2, successRate: 99.1, tasksToday: 423,  tools: ['kyb-api', 'dnb-lookup', 'sanctions-check'],      description: 'Verifies business identity and sanctions screening via multiple regulatory APIs.',                                  authors: ['Satishkumar Balasubramanian', 'Ashish Agarwal'] },
  { id: 'ia-02', name: 'Document Collection Bot', segmentKey: 'merchant', segment: 'Merchant Services', status: 'active',  category: 'Onboarding',         usedIn: 3, successRate: 98.4, tasksToday: 319,  tools: ['doc-parser', 'email-send', 'ocr-extract'],        description: 'Requests, parses and validates merchant documents with OCR and validation rules.',                                    authors: ['Vadivel Mohanakrishnan'] },
  { id: 'ia-03', name: 'Risk Scoring Engine',     segmentKey: 'merchant', segment: 'Merchant Services', status: 'active',  category: 'Risk & Compliance', usedIn: 4, successRate: 97.8, tasksToday: 512,  tools: ['risk-model', 'crm-write', 'fraud-signals'],       description: 'ML-based risk scoring engine integrating fraud signals and CRM history.',                                            authors: ['Swetha Surendran', 'Thilak Balakrishnan'] },
  { id: 'ia-11', name: 'Approval Notifier',       segmentKey: 'merchant', segment: 'Merchant Services', status: 'active',  category: 'Onboarding',         usedIn: 2, successRate: 98.9, tasksToday: 211,  tools: ['workflow-api', 'notify-send', 'crm-update'],      description: 'Routes decisions to approvers and broadcasts notifications to all stakeholders.',                                    authors: ['Vadivel Mohanakrishnan'] },
  /* B2B Payments */
  { id: 'ia-13', name: 'Invoice Ingestion Agent', segmentKey: 'b2b',      segment: 'B2B Payments',      status: 'active',  category: 'Operations',         usedIn: 1, successRate: 98.1, tasksToday: 289,  tools: ['ocr-parser', 'email-inbox', 'edi-reader'],        description: 'Parses and classifies incoming invoices from email and EDI feeds automatically.',                                    authors: ['Thilak Balakrishnan'] },
  { id: 'ia-04', name: 'PO Matching Engine',      segmentKey: 'b2b',      segment: 'B2B Payments',      status: 'active',  category: 'Operations',         usedIn: 2, successRate: 96.3, tasksToday: 267,  tools: ['erp-read', 'match-algo', 'gl-lookup'],            description: 'Fuzzy-matches invoices to purchase orders across multiple ERP systems.',                                             authors: ['Ashish Agarwal'] },
  { id: 'ia-05', name: 'GL Posting Agent',        segmentKey: 'b2b',      segment: 'B2B Payments',      status: 'active',  category: 'Operations',         usedIn: 2, successRate: 99.5, tasksToday: 243,  tools: ['gl-write', 'audit-log', 'erp-write'],             description: 'Posts verified invoices to the general ledger with full audit trail.',                                               authors: ['Shubham Singh'] },
  { id: 'ia-14', name: 'Exception Handler',       segmentKey: 'b2b',      segment: 'B2B Payments',      status: 'under-review', category: 'Operations',    usedIn: 1, successRate: 82.4, tasksToday: 58,   tools: ['notify-send', 'ticket-create', 'jira-api'],       description: 'Flags unmatched invoices and routes them to the finance team for manual review.',                                    authors: ['Ashish Agarwal'] },
  /* Print & Retention */
  { id: 'ia-06', name: 'Churn Predictor',         segmentKey: 'print',    segment: 'Print & Retention', status: 'active',  category: 'Revenue',            usedIn: 1, successRate: 95.2, tasksToday: 178,  tools: ['ml-predict', 'crm-read', 'segment-api'],         description: 'Real-time churn probability scoring using behavioural and usage signals.',                                           authors: ['Satishkumar Balasubramanian'] },
  { id: 'ia-15', name: 'Offer Generator',         segmentKey: 'print',    segment: 'Print & Retention', status: 'active',  category: 'Revenue',            usedIn: 1, successRate: 96.8, tasksToday: 162,  tools: ['offer-engine', 'pricing-api', 'ab-test'],         description: 'Selects the optimal retention offer based on customer value tier and A/B tests.',                                    authors: ['Satishkumar Balasubramanian'] },
  { id: 'ia-07', name: 'Campaign Dispatcher',     segmentKey: 'print',    segment: 'Print & Retention', status: 'active',  category: 'Revenue',            usedIn: 1, successRate: 94.7, tasksToday: 154,  tools: ['email-send', 'sms-gateway', 'push-notify'],       description: 'Multi-channel outreach dispatcher for email, SMS and push notifications.',                                           authors: ['Vadivel Mohanakrishnan', 'Swetha Surendran'] },
  /* Data Solutions */
  { id: 'ia-16', name: 'Record Classifier',       segmentKey: 'data',     segment: 'Data Solutions',    status: 'active',  category: 'Data',               usedIn: 1, successRate: 99.3, tasksToday: 1240, tools: ['classifier-api', 'schema-detect'],                description: 'Identifies record type and routes each record to the appropriate enrichment agent.',                                 authors: ['Vadivel Mohanakrishnan'] },
  { id: 'ia-08', name: 'Data Enricher',           segmentKey: 'data',     segment: 'Data Solutions',    status: 'active',  category: 'Data',               usedIn: 3, successRate: 99.8, tasksToday: 1240, tools: ['clearbit-api', 'zoominfo-api', 'dnb-lookup'],     description: 'Appends firmographic, demographic and intent signals from multiple data providers.',                                 authors: ['Thilak Balakrishnan'] },
  { id: 'ia-09', name: 'Dedup Engine',            segmentKey: 'data',     segment: 'Data Solutions',    status: 'active',  category: 'Data',               usedIn: 2, successRate: 99.2, tasksToday: 981,  tools: ['match-algo', 'crm-write', 'audit-log'],           description: 'Merges duplicate customer records and maintains a single golden record.',                                            authors: ['Ashish Agarwal'] },
  { id: 'ia-12', name: 'Data Lake Sync Agent',    segmentKey: 'data',     segment: 'Data Solutions',    status: 'active',  category: 'Data',               usedIn: 1, successRate: 99.9, tasksToday: 1240, tools: ['snowflake-write', 'schema-validate', 'dq-check'], description: 'Pushes enriched records to Snowflake with schema validation and data quality checks.',                               authors: ['Swetha Surendran'] },
  /* Platform */
  { id: 'ia-10', name: 'Policy Monitor',          segmentKey: 'platform', segment: 'Platform',          status: 'under-review', category: 'Risk & Compliance', usedIn: 1, successRate: 94.1, tasksToday: 87,  tools: ['policy-api', 'workflow-read', 'audit-log'],       description: 'Continuously scans running workflows against governance and compliance rules.',                                       authors: ['Satishkumar Balasubramanian', 'Shubham Singh'] },
  { id: 'ia-17', name: 'Violation Classifier',    segmentKey: 'platform', segment: 'Platform',          status: 'active',  category: 'Risk & Compliance', usedIn: 1, successRate: 97.3, tasksToday: 64,   tools: ['classify-api', 'risk-model'],                     description: 'Categorises detected policy violations by severity, domain and remediation path.',                                   authors: ['Swetha Surendran'] },
  { id: 'ia-18', name: 'Alert Dispatcher',        segmentKey: 'platform', segment: 'Platform',          status: 'under-review', category: 'Risk & Compliance', usedIn: 1, successRate: 89.6, tasksToday: 42, tools: ['notify-send', 'jira-api', 'email-send'],          description: 'Notifies compliance officers and escalates critical violations via Jira and email.',                                  authors: ['Thilak Balakrishnan', 'Shubham Singh'] },
  // ── Backend agents (parity with agents.json) ──
  { id: 'ia-19', name: 'SMB Onboarding Agent',         segmentKey: 'merchant', segment: 'Merchant Services', status: 'active',       category: 'Onboarding',        usedIn: 5,  successRate: 96.2, tasksToday: 47,   tools: ['kyb-verify', 'crm-write', 'email-send', 'terminal-config'],         description: 'Automates the full SMB merchant onboarding lifecycle — from KYB verification to first live transaction.',           authors: ['Satishkumar Balasubramanian', 'Ashish Agarwal'] },
  { id: 'ia-20', name: 'Fraud Detection Agent',        segmentKey: 'merchant', segment: 'Merchant Services', status: 'active',       category: 'Risk & Compliance', usedIn: 6,  successRate: 99.8, tasksToday: 3201, tools: ['txn-stream', 'anomaly-detect', 'hold-trigger', 'compliance-alert'],  description: 'Sub-second real-time fraud detection with automated account holds and SAR compliance alerts.',                      authors: ['Vadivel Mohanakrishnan'] },
  { id: 'ia-21', name: 'Churn Prevention Agent',       segmentKey: 'print',    segment: 'Print & Retention', status: 'active',       category: 'Revenue',           usedIn: 3,  successRate: 88.7, tasksToday: 31,   tools: ['crm-read', 'order-history', 'email-send', 'sales-alert'],            description: 'Monitors print customer order patterns to detect churn signals and triggers automated retention campaigns.',         authors: ['Swetha Surendran'] },
  { id: 'ia-22', name: 'Invoice Reconciliation Agent', segmentKey: 'b2b',      segment: 'B2B Payments',      status: 'active',       category: 'Operations',        usedIn: 4,  successRate: 94.1, tasksToday: 124,  tools: ['erp-read', 'payment-match', 'gl-write', 'exception-flag'],           description: 'Eliminates manual invoice-to-payment matching across multiple ERP systems with auto GL posting.',                   authors: ['Shubham Singh'] },
  { id: 'ia-23', name: 'Data Enrichment Agent',        segmentKey: 'data',     segment: 'Data Solutions',    status: 'active',       category: 'Data',              usedIn: 5,  successRate: 99.1, tasksToday: 892,  tools: ['data-fetch', 'profile-update', 'signal-score', 'warehouse-write'],   description: 'Continuously enriches SMB customer profiles with firmographic and payment behavior signals.',                       authors: ['Satishkumar Balasubramanian'] },
  { id: 'ia-24', name: 'Upsell Intelligence Agent',    segmentKey: 'print',    segment: 'Print & Retention', status: 'active',       category: 'Revenue',           usedIn: 1,  successRate: 72.4, tasksToday: 18,   tools: ['crm-read', 'propensity-score', 'proposal-gen', 'sales-route'],       description: 'Scores print customers for payments migration propensity and routes leads to sales teams with proposals.',           authors: ['Ashish Agarwal'] },
  // ── Net-new agents ──
  { id: 'ia-25', name: 'Terminal Provisioning Agent',  segmentKey: 'merchant', segment: 'Merchant Services', status: 'active',       category: 'Onboarding',        usedIn: 2,  successRate: 97.5, tasksToday: 38,   tools: ['terminal-api', 'inventory-check', 'shipping-create', 'crm-write'],   description: 'Automates POS terminal ordering, configuration, and shipping for newly approved merchants.',                        authors: ['Vadivel Mohanakrishnan'] },
  { id: 'ia-26', name: 'Dispute Resolution Agent',     segmentKey: 'merchant', segment: 'Merchant Services', status: 'active',       category: 'Operations',        usedIn: 2,  successRate: 89.3, tasksToday: 67,   tools: ['dispute-api', 'txn-lookup', 'evidence-collect', 'notify-send'],       description: 'Manages chargeback and dispute workflows by collecting evidence and routing for adjudication.',                     authors: ['Swetha Surendran', 'Thilak Balakrishnan'] },
  { id: 'ia-27', name: 'Merchant KYC/AML Agent',       segmentKey: 'merchant', segment: 'Merchant Services', status: 'active',       category: 'Risk & Compliance', usedIn: 3,  successRate: 98.1, tasksToday: 52,   tools: ['sanctions-check', 'aml-screen', 'kyc-verify', 'alert-write'],        description: 'Continuous KYC/AML screening against OFAC and global sanctions lists for all merchant accounts.',                  authors: ['Ashish Agarwal'] },
  { id: 'ia-28', name: 'Print Order Fulfillment Agent',segmentKey: 'print',    segment: 'Print & Retention', status: 'active',       category: 'Operations',        usedIn: 1,  successRate: 97.8, tasksToday: 214,  tools: ['order-api', 'inventory-check', 'print-queue', 'shipping-create'],    description: 'Orchestrates end-to-end print order fulfilment from receipt through production to dispatch.',                       authors: ['Satishkumar Balasubramanian'] },
  { id: 'ia-29', name: 'Reorder Reminder Agent',       segmentKey: 'print',    segment: 'Print & Retention', status: 'active',       category: 'Revenue',           usedIn: 1,  successRate: 91.4, tasksToday: 188,  tools: ['order-history', 'email-send', 'sms-gateway', 'crm-read'],            description: 'Predicts reorder windows and sends personalised reorder nudges to print customers at the right time.',              authors: ['Thilak Balakrishnan'] },
  { id: 'ia-30', name: 'Direct Mail Campaign Agent',   segmentKey: 'print',    segment: 'Print & Retention', status: 'active',       category: 'Revenue',           usedIn: 1,  successRate: 83.6, tasksToday: 72,   tools: ['campaign-api', 'segment-api', 'address-verify', 'print-queue'],      description: 'Automates direct mail campaign execution with address verification and segment targeting.',                         authors: ['Shubham Singh'] },
  { id: 'ia-31', name: 'ACH Payment Processor',        segmentKey: 'b2b',      segment: 'B2B Payments',      status: 'active',       category: 'Operations',        usedIn: 2,  successRate: 99.4, tasksToday: 341,  tools: ['ach-gateway', 'bank-verify', 'payment-post', 'audit-log'],           description: 'Processes ACH credit and debit transactions with bank account verification and full audit trail.',                  authors: ['Vadivel Mohanakrishnan'] },
  { id: 'ia-32', name: 'Wire Transfer Verifier',       segmentKey: 'b2b',      segment: 'B2B Payments',      status: 'active',       category: 'Operations',        usedIn: 1,  successRate: 99.7, tasksToday: 89,   tools: ['swift-api', 'beneficiary-check', 'sanctions-check', 'gl-write'],     description: 'Verifies wire transfer beneficiaries against sanctions lists and posts confirmed transfers to GL.',                  authors: ['Swetha Surendran'] },
  { id: 'ia-33', name: 'Vendor Onboarding Agent',      segmentKey: 'b2b',      segment: 'B2B Payments',      status: 'active',       category: 'Onboarding',        usedIn: 1,  successRate: 95.2, tasksToday: 28,   tools: ['vendor-api', 'kyb-api', 'bank-verify', 'erp-write'],                 description: 'Streamlines vendor onboarding with KYB checks, bank account verification, and ERP setup.',                         authors: ['Ashish Agarwal'] },
  { id: 'ia-34', name: 'Purchase Order Automation',    segmentKey: 'b2b',      segment: 'B2B Payments',      status: 'active',       category: 'Operations',        usedIn: 2,  successRate: 96.8, tasksToday: 156,  tools: ['po-api', 'erp-read', 'approval-route', 'notify-send'],               description: 'Automates PO creation, approval routing, and ERP updates for B2B procurement workflows.',                          authors: ['Satishkumar Balasubramanian', 'Shubham Singh'] },
  { id: 'ia-35', name: 'Expense Report Processor',     segmentKey: 'b2b',      segment: 'B2B Payments',      status: 'under-review', category: 'Operations',        usedIn: 1,  successRate: 84.1, tasksToday: 203,  tools: ['ocr-extract', 'policy-check', 'gl-write', 'approval-route'],         description: 'Extracts expense data from receipts, validates against policy, and routes for approval.',                          authors: ['Thilak Balakrishnan'] },
  { id: 'ia-36', name: 'SMB Credit Scoring Agent',     segmentKey: 'data',     segment: 'Data Solutions',    status: 'active',       category: 'Data',              usedIn: 3,  successRate: 97.3, tasksToday: 411,  tools: ['credit-api', 'risk-model', 'bureau-lookup', 'profile-update'],       description: 'Generates real-time SMB credit scores using bureau data and proprietary underwriting risk signals.',                authors: ['Vadivel Mohanakrishnan'] },
  { id: 'ia-37', name: 'Lead Scoring Agent',           segmentKey: 'data',     segment: 'Data Solutions',    status: 'under-review', category: 'Data',              usedIn: 2,  successRate: 93.6, tasksToday: 527,  tools: ['crm-read', 'ml-predict', 'segment-api', 'crm-write'],                description: 'Scores inbound and outbound leads using intent, firmographic, and behavioural signals.',                            authors: ['Swetha Surendran'] },
  { id: 'ia-38', name: 'Market Segmentation Agent',    segmentKey: 'data',     segment: 'Data Solutions',    status: 'active',       category: 'Data',              usedIn: 2,  successRate: 96.1, tasksToday: 1891, tools: ['warehouse-read', 'segment-api', 'ml-predict', 'crm-write'],          description: 'Re-segments the SMB customer base using ML clustering on continuously enriched profiles.',                          authors: ['Ashish Agarwal'] },
  { id: 'ia-39', name: 'Data Quality Monitor',         segmentKey: 'data',     segment: 'Data Solutions',    status: 'active',       category: 'Data',              usedIn: 1,  successRate: 98.8, tasksToday: 756,  tools: ['dq-check', 'schema-validate', 'alert-write', 'audit-log'],           description: 'Monitors data pipeline quality, flags schema drift, and automatically triggers repair jobs.',                       authors: ['Satishkumar Balasubramanian'] },
  { id: 'ia-40', name: 'Compliance Audit Agent',       segmentKey: 'platform', segment: 'Platform',          status: 'active',       category: 'Risk & Compliance', usedIn: 2,  successRate: 96.9, tasksToday: 144,  tools: ['audit-log', 'policy-api', 'report-gen', 'notify-send'],              description: 'Generates automated compliance audit reports and flags policy deviations for executive review.',                    authors: ['Thilak Balakrishnan'] },
  { id: 'ia-41', name: 'API Gateway Monitor',          segmentKey: 'platform', segment: 'Platform',          status: 'active',       category: 'Operations',        usedIn: 1,  successRate: 99.5, tasksToday: 8421, tools: ['gateway-api', 'rate-limit', 'alert-write', 'metric-push'],          description: 'Monitors API gateway health, enforces rate limits, and alerts on anomalous traffic patterns.',                     authors: ['Shubham Singh', 'Vadivel Mohanakrishnan'] },
  // Statement Analysis Platform (Merchant Services PRD) — two agents fully cover Phase 1
  // extraction/analysis, one only partially covers the review step; savings-proposal,
  // revenue-calc and export/distribution are intentionally absent (Phase 2, not yet built).
  { id: 'ia-42', name: 'Merchant Statement Extraction Agent', segmentKey: 'merchant', segment: 'Merchant Services', status: 'active',       category: 'Data',       usedIn: 1, successRate: 96.4, tasksToday: 156, tools: ['ocr-extract', 'pricing-extract'],       description: 'Ingests native and scanned merchant pricing statements and extracts transaction volume, transaction count, fees, rates and other pricing data into a structured record.', authors: ['Ashish Agarwal'] },
  { id: 'ia-43', name: 'Pricing Structure Analyzer',          segmentKey: 'merchant', segment: 'Merchant Services', status: 'active',       category: 'Data',       usedIn: 1, successRate: 94.8, tasksToday: 156, tools: ['pricing-extract', 'confidence-score'],  description: 'Identifies pricing structures from extracted statement data, flags missing, summarized or obscured fee information, and produces a confidence score for each analysis.', authors: ['Ashish Agarwal'] },
  { id: 'ia-44', name: 'Statement Review Workflow Agent',     segmentKey: 'merchant', segment: 'Merchant Services', status: 'under-review', category: 'Operations', usedIn: 1, successRate: 78.6, tasksToday: 62,  tools: ['notify-send', 'audit-log'],             description: 'Routes flagged statement analyses to a reviewer and logs the decision. Does not yet support confidence-based prioritisation or Account Executive approval sign-off before results are shared externally.', authors: ['Swetha Surendran'] },
]

/* ── Section 3: Tools / MCP ──────────────────────────────────────────────── */
export const TOOLS_MCP = [
  /* Connectors */
  { id: 't-01', name: 'email-send',       category: 'Connector',  type: 'REST API',    status: 'connected', usedBy: 8, provider: 'SendGrid',    icon: Mail,       color: '#0EA5E9', description: 'Sends transactional and campaign emails via SendGrid API.',                                authors: ['Ashish Agarwal'] },
  { id: 't-02', name: 'sms-gateway',      category: 'Connector',  type: 'REST API',    status: 'connected', usedBy: 3, provider: 'Twilio',      icon: Globe,      color: '#7C3AED', description: 'Outbound SMS delivery through Twilio programmable messaging.',                             authors: ['Satishkumar Balasubramanian'] },
  { id: 't-03', name: 'notify-send',      category: 'Connector',  type: 'REST API',    status: 'connected', usedBy: 6, provider: 'Internal',    icon: Zap,        color: '#F59E0B', description: 'Internal push notification bus for real-time stakeholder alerts.',                         authors: ['Vadivel Mohanakrishnan'] },
  { id: 't-04', name: 'jira-api',         category: 'MCP',        type: 'MCP Server',  status: 'connected', usedBy: 4, provider: 'Atlassian',   icon: Wrench,     color: '#0052CC', description: 'Creates, updates and resolves Jira tickets from agent actions.',                          authors: ['Swetha Surendran'] },
  { id: 't-05', name: 'slack-mcp',        category: 'MCP',        type: 'MCP Server',  status: 'connected', usedBy: 5, provider: 'Slack',       icon: Globe,      color: '#4A154B', description: 'Posts messages and interactive blocks to Slack channels via MCP.',                        authors: ['Thilak Balakrishnan'] },
  /* Data & Storage */
  { id: 't-06', name: 'erp-read',         category: 'Data',       type: 'REST API',    status: 'connected', usedBy: 4, provider: 'SAP',         icon: Database,   color: '#10B981', description: 'Read-only access to ERP master data, GL accounts and cost centres.',                     authors: ['Shubham Singh'] },
  { id: 't-07', name: 'erp-write',        category: 'Data',       type: 'REST API',    status: 'connected', usedBy: 3, provider: 'SAP',         icon: Database,   color: '#10B981', description: 'Writes transactions and journal entries back to SAP ERP.',                                authors: ['Satishkumar Balasubramanian'] },
  { id: 't-08', name: 'gl-write',         category: 'Data',       type: 'REST API',    status: 'connected', usedBy: 2, provider: 'Oracle',      icon: Server,     color: '#EA580C', description: 'Posts GL entries to Oracle Finance with full audit stamping.',                            authors: ['Ashish Agarwal', 'Vadivel Mohanakrishnan'] },
  { id: 't-09', name: 'crm-write',        category: 'Data',       type: 'REST API',    status: 'connected', usedBy: 7, provider: 'Salesforce',  icon: Cloud,      color: '#00A1E0', description: 'Writes contact, opportunity and account updates to Salesforce CRM.',                     authors: ['Swetha Surendran'] },
  { id: 't-10', name: 'crm-read',         category: 'Data',       type: 'REST API',    status: 'connected', usedBy: 6, provider: 'Salesforce',  icon: Cloud,      color: '#00A1E0', description: 'Reads customer profiles and activity history from Salesforce.',                           authors: ['Thilak Balakrishnan'] },
  { id: 't-11', name: 'snowflake-write',  category: 'Data',       type: 'SQL Driver',  status: 'connected', usedBy: 2, provider: 'Snowflake',   icon: Database,   color: '#29B5E8', description: 'Bulk-inserts enriched records into Snowflake data warehouse.',                            authors: ['Shubham Singh', 'Satishkumar Balasubramanian'] },
  /* AI / ML */
  { id: 't-12', name: 'risk-model',       category: 'AI/ML',      type: 'Model API',   status: 'connected', usedBy: 5, provider: 'Internal',    icon: Cpu,        color: '#C8102E', description: 'Real-time risk scoring model trained on Deluxe fraud and underwriting data.',             authors: ['Ashish Agarwal'] },
  { id: 't-13', name: 'ml-predict',       category: 'AI/ML',      type: 'Model API',   status: 'connected', usedBy: 3, provider: 'Internal',    icon: Cpu,        color: '#C8102E', description: 'General-purpose ML inference endpoint for classification tasks.',                        authors: ['Vadivel Mohanakrishnan'] },
  { id: 't-14', name: 'match-algo',       category: 'AI/ML',      type: 'Internal',    status: 'connected', usedBy: 3, provider: 'Internal',    icon: CheckCheck, color: '#8B5CF6', description: 'Fuzzy matching algorithm for record linkage and deduplication.',                          authors: ['Swetha Surendran'] },
  /* Third-party data */
  { id: 't-15', name: 'kyb-api',          category: 'Third-Party',type: 'REST API',    status: 'connected', usedBy: 2, provider: 'Middesk',     icon: Lock,       color: '#059669', description: 'Know-Your-Business verification checks via Middesk API.',                                authors: ['Thilak Balakrishnan'] },
  { id: 't-16', name: 'dnb-lookup',       category: 'Third-Party',type: 'REST API',    status: 'connected', usedBy: 3, provider: 'D&B',         icon: Globe,      color: '#1D4ED8', description: 'Dun & Bradstreet firmographic data enrichment and credit signals.',                       authors: ['Shubham Singh'] },
  { id: 't-17', name: 'clearbit-api',     category: 'Third-Party',type: 'REST API',    status: 'connected', usedBy: 2, provider: 'Clearbit',    icon: Globe,      color: '#6366F1', description: 'Company and contact enrichment from Clearbit Enrichment API.',                           authors: ['Satishkumar Balasubramanian'] },
  { id: 't-18', name: 'sanctions-check',  category: 'Third-Party',type: 'REST API',    status: 'connected', usedBy: 2, provider: 'Refinitiv',   icon: Shield,     color: '#DC2626', description: 'OFAC and global sanctions screening via Refinitiv World-Check.',                         authors: ['Ashish Agarwal'] },
  { id: 't-19', name: 'ocr-extract',      category: 'Third-Party',type: 'REST API',    status: 'warning',   usedBy: 3, provider: 'AWS Textract',icon: Code,       color: '#F59E0B', description: 'Document text and data extraction via AWS Textract OCR engine.',                         authors: ['Vadivel Mohanakrishnan', 'Swetha Surendran'] },
  { id: 't-20', name: 'audit-log',        category: 'Connector',  type: 'Internal',    status: 'connected', usedBy: 9, provider: 'Internal',    icon: Settings,   color: '#64748B', description: 'Immutable audit trail writer for all agent actions and decisions.',                       authors: ['Thilak Balakrishnan'] },
  { id: 't-21', name: 'pricing-extract',  category: 'AI/ML',      type: 'Model API',   status: 'connected', usedBy: 2, provider: 'Internal',    icon: FileText,   color: '#C8102E', description: 'Extracts pricing, fee and rate structures from merchant statements and pricing documents.', authors: ['Ashish Agarwal'] },
  { id: 't-22', name: 'confidence-score', category: 'AI/ML',      type: 'Model API',   status: 'connected', usedBy: 2, provider: 'Internal',    icon: Cpu,        color: '#C8102E', description: 'Scores extraction and analysis confidence to prioritise items for human review.',        authors: ['Ashish Agarwal'] },
]

/* ── Section 4: Bundles — curated agent + tool packages solving one workflow ── */
export const BUNDLES = ALL_WORKFLOWS.map(wf => ({
  id:          `bundle-${wf.id}`,
  workflowId:  wf.id,
  name:        `${wf.name} Bundle`,
  description: wf.description,
  segmentKey:  wf.segmentKey,
  segment:     wf.segment,
  status:      wf.status,
  agentCount:  (wf.agents || []).length,
  toolCount:   new Set((wf.agents || []).flatMap(a => a.tools || [])).size,
}))

/* ── Discover Hub card helpers ─────────────────────────────────────────────── */
export const AGENT_CATEGORY_ICON = {
  'Risk & Compliance': Shield,
  'Onboarding':         Users,
  'Operations':         Wrench,
  'Data':               Database,
  'Revenue':            TrendingUp,
  'Custom':             Sparkles,
}
export const ACCESS_CHANNELS = [
  { label: 'Chat',     bg: '#DCFCE7', text: '#166534' },
  { label: 'REST API', bg: '#DBEAFE', text: '#1D4ED8' },
  { label: 'Webhook',  bg: '#F5F3FF', text: '#7C3AED' },
  { label: 'A2A',      bg: '#F1F5F9', text: '#475569' },
]
export function estimateAvgTime(agent) {
  const perDay = agent.tasksToday || 1
  const secs = Math.max(2, Math.round(20000 / perDay))
  if (secs < 60) return `${secs}s`
  const mins = Math.round(secs / 60)
  return mins < 60 ? `${mins}min` : `${(mins / 60).toFixed(1)}h`
}
export function estimateKYA(agent) {
  return Math.min(99, Math.max(70, Math.round((agent.successRate ?? 90) - 3)))
}

/* ══════════════════════════════════════════════════════════════════════════════
   SEGMENTS
   ══════════════════════════════════════════════════════════════════════════════ */

export const SEGMENTS = [
  { key: 'merchant', label: 'Merchant Services', short: 'Merchant', icon: CreditCard, color: '#0EA5E9' },
  { key: 'b2b',      label: 'B2B Payments',      short: 'B2B',      icon: FileText,   color: '#8B5CF6' },
  { key: 'print',    label: 'Print & Retention', short: 'Print',    icon: Printer,    color: '#6B7280' },
  { key: 'data',     label: 'Data Solutions',    short: 'Data',     icon: Database,   color: '#10B981' },
  { key: 'platform', label: 'Platform',          short: 'Platform', icon: Shield,     color: '#C8102E' },
]

/* ══════════════════════════════════════════════════════════════════════════════
   ECONOMIC MODEL — the constants behind every cost / ROI figure in the app
   ══════════════════════════════════════════════════════════════════════════════ */

export const WORKING_DAYS_PER_YEAR    = 250
export const MANUAL_MINUTES_PER_TASK  = 15     // human minutes displaced by one automated task
export const ANALYST_HOURLY_RATE_USD  = 35
export const SAVING_PER_TASK_USD      = (ANALYST_HOURLY_RATE_USD / 60) * MANUAL_MINUTES_PER_TASK  // $8.75
export const COST_PER_TASK_USD        = 0.06   // blended platform run-cost per task
export const SPANS_PER_EXECUTION      = 1.7    // traces emitted per task, for observability figures

/* ══════════════════════════════════════════════════════════════════════════════
   DERIVED AGGREGATES
   ══════════════════════════════════════════════════════════════════════════════ */

export const activeAgents        = INDIVIDUAL_AGENTS.filter(a => a.status === 'active')
export const reviewAgents        = INDIVIDUAL_AGENTS.filter(a => a.status === 'under-review')
export const agentCount          = INDIVIDUAL_AGENTS.length
export const activeAgentCount    = activeAgents.length
export const reviewAgentCount    = reviewAgents.length

export const dailyExecutions     = INDIVIDUAL_AGENTS.reduce((n, a) => n + (a.tasksToday || 0), 0)
export const avgAccuracy         = INDIVIDUAL_AGENTS.reduce((n, a) => n + (a.successRate || 0), 0) / INDIVIDUAL_AGENTS.length

export const liveWorkflows       = ALL_WORKFLOWS.filter(w => w.status === 'live')
export const reviewWorkflows     = ALL_WORKFLOWS.filter(w => w.status !== 'live')

// Kept as named exports because Governance Registry consumes them; both are now
// derived rather than hand-maintained copies.
export const INCOMPLETE_WORKFLOWS = ALL_WORKFLOWS.filter(w => w.status === 'incomplete')
export const UNDER_REVIEW_AGENTS  = INDIVIDUAL_AGENTS.filter(a => a.status === 'under-review')
export const avgWorkflowSla      = ALL_WORKFLOWS.reduce((n, w) => n + w.sla, 0) / ALL_WORKFLOWS.length
export const avgLiveSla          = liveWorkflows.reduce((n, w) => n + w.sla, 0) / liveWorkflows.length
export const workflowDailyVolume = ALL_WORKFLOWS.reduce((n, w) => n + (w.tasksPerDay || 0), 0)

// Agents that appear inside a currently-live workflow
export const orchestratedAgentNames = [...new Set(liveWorkflows.flatMap(w => (w.agents || []).map(a => a.name)))]
export const orchestratedAgentCount = orchestratedAgentNames.length

export const connectedTools      = TOOLS_MCP.filter(t => t.status === 'connected').length

/* ── Money ─────────────────────────────────────────────────────────────────── */
export const workflowRoi      = (w) => (w.tasksPerDay || 0) * WORKING_DAYS_PER_YEAR * SAVING_PER_TASK_USD
export const totalCostAvoided = liveWorkflows.reduce((n, w) => n + workflowRoi(w), 0)
export const monthlySpendUsd  = Math.round(dailyExecutions * 30 * COST_PER_TASK_USD)
export const monthlyBudgetUsd = 60000
export const budgetBurnPct    = Math.round(monthlySpendUsd / monthlyBudgetUsd * 100)

// Cost split — fractions sum to 1 so the breakdown always reconciles to monthly spend
export const COST_BREAKDOWN = [
  { name: 'LLM Tokens', fraction: 0.40, color: '#1A2340' },
  { name: 'API Calls',  fraction: 0.27, color: '#0EA5E9' },
  { name: 'Compute',    fraction: 0.19, color: '#C8102E' },
  { name: 'Storage',    fraction: 0.07, color: '#F59E0B' },
  { name: 'Other',      fraction: 0.07, color: '#9BA8BA' },
].map(c => ({ ...c, value: Math.round(monthlySpendUsd * c.fraction) }))

/* ── Observability ─────────────────────────────────────────────────────────── */
export const dailyTraces  = Math.round(dailyExecutions * SPANS_PER_EXECUTION)
export const cacheHitPct  = 94
export const p95LatencyMs = 420

/* ══════════════════════════════════════════════════════════════════════════════
   PER-AGENT DERIVATIONS — one formula each, reused everywhere
   ══════════════════════════════════════════════════════════════════════════════ */

export const latencyMs      = (a) => Math.max(45, Math.round(6000 / Math.sqrt(a.tasksToday || 1)))
export const uptimePct      = (a) => Math.min(99.9, +((a.successRate ?? 90) + 1.2).toFixed(1))
export const errorRatePct   = (a) => +Math.max(0.05, (100 - (a.successRate ?? 90)) * 0.35).toFixed(2)
export const monthlyCostUsd = (a) => Math.round((a.tasksToday || 0) * 30 * COST_PER_TASK_USD)
export const annualValueUsd = (a) => Math.round((a.tasksToday || 0) * WORKING_DAYS_PER_YEAR * SAVING_PER_TASK_USD)

/* ══════════════════════════════════════════════════════════════════════════════
   LOOKUPS
   ══════════════════════════════════════════════════════════════════════════════ */

export const agentById     = (id)   => INDIVIDUAL_AGENTS.find(a => a.id === id)
export const agentByName   = (name) => INDIVIDUAL_AGENTS.find(a => a.name === name)
export const workflowById  = (id)   => ALL_WORKFLOWS.find(w => w.id === id)
export const segmentByKey  = (key)  => SEGMENTS.find(s => s.key === key)
export const toolByName    = (name) => TOOLS_MCP.find(t => t.name === name)
export const workflowTools = (w)    => [...new Set((w.agents || []).flatMap(a => a.tools || []))]

/* ══════════════════════════════════════════════════════════════════════════════
   FORMATTERS
   ══════════════════════════════════════════════════════════════════════════════ */

export const formatCompact = (n) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(Math.round(n))

export const formatMoney = (d) =>
  d >= 1_000_000 ? `$${(d / 1_000_000).toFixed(1)}M`
  : d >= 1000    ? `$${Math.round(d / 1000)}K`
  : `$${Math.round(d)}`

/* ══════════════════════════════════════════════════════════════════════════════
   STORYLINE — one automation journey per segment.

   Every page is a different lens on these same five journeys: Imagination Studio
   discovers them, Solution Builder assembles them, Governance approves them,
   Orchestration and Live Operations run them, Command Center and the Executive
   Deck report their impact. `stage` is what drives that cross-page narrative.
   ══════════════════════════════════════════════════════════════════════════════ */

export const STAGES = [
  { key: 'discovery',  label: 'Discovery',  color: '#8B5CF6', desc: 'Problem framed in Imagination Studio' },
  { key: 'building',   label: 'Building',   color: '#F59E0B', desc: 'Agents being assembled in Solution Builder' },
  { key: 'governance', label: 'In Review',  color: '#C8102E', desc: 'Awaiting compliance sign-off' },
  { key: 'live',       label: 'Live',       color: '#10B981', desc: 'Running in production' },
  { key: 'scaling',    label: 'Scaling',    color: '#0EA5E9', desc: 'Live and expanding to new volume' },
]
export const stageByKey = (key) => STAGES.find(s => s.key === key)

export const STORYLINE = [
  {
    workflowId: 'wf-001', segmentKey: 'merchant', stage: 'scaling',
    headline: 'Merchant onboarding cut from days to minutes',
    problem:  'SMB onboarding took 5–7 days of manual KYB checks, document chasing and risk review — and applicants dropped out while they waited.',
    before:   { label: 'Manual onboarding', value: '5–7 days' },
    outcome:  'Applications now clear end-to-end without a human in the loop unless risk scoring flags them.',
    owner:    'Satishkumar Balasubramanian',
  },
  {
    workflowId: 'wf-002', segmentKey: 'b2b', stage: 'governance',
    headline: 'Invoice matching moves off spreadsheets',
    problem:  'Finance spent roughly three days a week reconciling invoices to payments by hand across three ERP systems.',
    before:   { label: 'Manual reconciliation', value: '3 days/wk' },
    outcome:  'Awaiting compliance sign-off — the exception handler still needs review before GL posting runs unattended.',
    owner:    'Vadivel Mohanakrishnan',
  },
  {
    workflowId: 'wf-003', segmentKey: 'print', stage: 'live',
    headline: 'Churn caught before the customer leaves',
    problem:  'Print customers were only identified as lost after they stopped ordering, far too late to make an offer.',
    before:   { label: 'Churn spotted', value: 'After the fact' },
    outcome:  'At-risk accounts are scored continuously and a tailored retention offer goes out the same day.',
    owner:    'Swetha Surendran',
  },
  {
    workflowId: 'wf-004', segmentKey: 'data', stage: 'scaling',
    headline: 'Customer data enriched continuously, not quarterly',
    problem:  'Firmographic data was refreshed in quarterly batches, so segmentation and lead scoring ran on stale records.',
    before:   { label: 'Enrichment cycle', value: 'Quarterly batch' },
    outcome:  'Highest-volume pipeline on the platform — every new record is enriched, deduplicated and synced on arrival.',
    owner:    'Shubham Singh',
  },
  {
    workflowId: 'wf-005', segmentKey: 'platform', stage: 'building',
    headline: 'Continuous compliance instead of quarterly audit',
    problem:  'Policy violations surfaced in quarterly audits, weeks after the offending agent action had already run.',
    before:   { label: 'Audit cadence', value: 'Quarterly' },
    outcome:  'Still being assembled — the alert dispatcher is partially built and the policy monitor is under review.',
    owner:    'Satishkumar Balasubramanian',
  },
]

// Storyline entries joined to their workflow + segment + derived economics.
export const storyline = STORYLINE.map(s => {
  const wf  = workflowById(s.workflowId)
  const seg = segmentByKey(s.segmentKey)
  return {
    ...s,
    workflow: wf,
    segment:  seg,
    name:     wf.name,
    after:    { label: 'Automated run time', value: wf.avgRunTime },
    agents:   wf.agents || [],
    tools:    workflowTools(wf),
    roi:      workflowRoi(wf),
    stageMeta: stageByKey(s.stage),
  }
})
export const storyForWorkflow = (id) => storyline.find(s => s.workflowId === id)

/* ══════════════════════════════════════════════════════════════════════════════
   PER-SEGMENT ROLLUPS
   ══════════════════════════════════════════════════════════════════════════════ */

export const segmentStats = SEGMENTS.map(s => {
  const agents    = INDIVIDUAL_AGENTS.filter(a => a.segmentKey === s.key)
  const workflows = ALL_WORKFLOWS.filter(w => w.segmentKey === s.key)
  const daily     = agents.reduce((n, a) => n + (a.tasksToday || 0), 0)
  return {
    ...s,
    agentCount:      agents.length,
    activeCount:     agents.filter(a => a.status === 'active').length,
    workflowCount:   workflows.length,
    dailyExecutions: daily,
    avgAccuracy:     agents.length ? agents.reduce((n, a) => n + a.successRate, 0) / agents.length : 0,
    roi:             workflows.reduce((n, w) => n + workflowRoi(w), 0),
    monthlyCost:     Math.round(daily * 30 * COST_PER_TASK_USD),
    story:           storyline.find(st => st.segmentKey === s.key) || null,
  }
})

/* ══════════════════════════════════════════════════════════════════════════════
   PEOPLE — the same six real authors credited on agents/tools/workflows
   throughout Discover Hub. User & Access Management and Trust & Control read
   from this rather than inventing a separate cast.
   ══════════════════════════════════════════════════════════════════════════════ */

export const ALL_AUTHORS = [
  'Satishkumar Balasubramanian',
  'Ashish Agarwal',
  'Vadivel Mohanakrishnan',
  'Swetha Surendran',
  'Thilak Balakrishnan',
  'Shubham Singh',
]

// One of five roles per person, assigned deterministically (not random) so it's
// stable across renders. Shubham Singh (this session's user) is Admin.
const ROLE_BY_AUTHOR = {
  'Shubham Singh': 'Admin',
  'Satishkumar Balasubramanian': 'Approver',
  'Vadivel Mohanakrishnan': 'Approver',
  'Ashish Agarwal': 'Builder',
  'Swetha Surendran': 'Builder',
  'Thilak Balakrishnan': 'Builder',
}

export const AUTHOR_STATS = ALL_AUTHORS.map(name => {
  const agents    = INDIVIDUAL_AGENTS.filter(a => (a.authors || []).includes(name))
  const tools     = TOOLS_MCP.filter(t => (t.authors || []).includes(name))
  const workflows = ALL_WORKFLOWS.filter(w => (w.authors || []).includes(name))
  return {
    name, role: ROLE_BY_AUTHOR[name] || 'Builder',
    agents, tools, workflows,
    total: agents.length + tools.length + workflows.length,
  }
})

/* ══════════════════════════════════════════════════════════════════════════════
   RISK & GUARDRAILS — used by Trust & Control and Maker-Checker
   ══════════════════════════════════════════════════════════════════════════════ */

export const HIGH_RISK_TOOLS = ['gl-write', 'hold-trigger', 'sanctions-check', 'aml-screen', 'erp-write', 'crm-write', 'snowflake-write']
export const MED_RISK_TOOLS  = ['kyb-api', 'kyc-verify', 'fraud-signals', 'audit-log', 'payment-match', 'exception-flag', 'compliance-alert']

export const riskTierOf = (agent) => {
  const tools = agent.tools || []
  const high = tools.filter(t => HIGH_RISK_TOOLS.some(h => t.includes(h) || h.includes(t))).length
  const med  = tools.filter(t => MED_RISK_TOOLS.some(h => t.includes(h) || h.includes(t))).length
  if (high >= 2) return 'high'
  if (high === 1 || med >= 2) return 'medium'
  return 'low'
}

export const highRiskAgents   = INDIVIDUAL_AGENTS.filter(a => riskTierOf(a) === 'high')
export const mediumRiskAgents = INDIVIDUAL_AGENTS.filter(a => riskTierOf(a) === 'medium')

// Standard guardrail policies. Human review is mandatory for every high/medium-risk
// agent (their count is real); audit logging is a platform-wide default (100%),
// matching the "100% audit coverage" claim shown on Command Center's compliance banner.
export const GUARDRAILS = [
  { key: 'humanReview', label: 'Human Review Required', appliesTo: highRiskAgents.length + mediumRiskAgents.length, coveragePct: 100 },
  { key: 'auditLog',     label: 'Audit Logging',          appliesTo: agentCount,                                     coveragePct: 100 },
  { key: 'rateLimit',    label: 'Rate Limiting',           appliesTo: highRiskAgents.length,                          coveragePct: 100 },
  { key: 'dryRun',       label: 'Dry-Run Before Prod',      appliesTo: reviewAgentCount,                              coveragePct: 100 },
  { key: 'alertOnException', label: 'Alert on Exception',  appliesTo: agentCount,                                     coveragePct: 100 },
]

/* ══════════════════════════════════════════════════════════════════════════════
   INCIDENT FEED — shared by Incident Management and Live Operations, so both
   pages show the exact same real incidents (ranked by real, catalog-derived
   error rate) instead of each inventing its own mock list.
   ══════════════════════════════════════════════════════════════════════════════ */

export const INCIDENT_TYPES = [
  'Elevated error rate on repeated task type',
  'Timeout on downstream API call',
  'Unexpected output format from tool response',
  'Retry budget exhausted before completion',
]

const topByErrorRate = [...INDIVIDUAL_AGENTS]
  .map(a => ({ agent: a, err: errorRatePct(a) }))
  .sort((a, b) => b.err - a.err)
  .slice(0, 6)

export const buildIncidents = () => topByErrorRate.map(({ agent, err }, i) => ({
  id: agent.id,
  agent: agent.name,
  category: agent.category,
  errorRate: err,
  severity: err >= 1.5 ? 'high' : err >= 0.5 ? 'medium' : 'low',
  type: INCIDENT_TYPES[i % INCIDENT_TYPES.length],
  status: i < 2 ? 'open' : i < 4 ? 'investigating' : 'resolved',
  reportedAgo: `${(i + 1) * 18}m ago`,
}))

export const INCIDENT_SEVERITY_STYLE = {
  high:   { bg: '#FEF2F2', text: '#B91C1C', badge: 'bg-red-100 text-red-700' },
  medium: { bg: '#FFFBEB', text: '#B45309', badge: 'bg-amber-100 text-amber-700' },
  low:    { bg: '#F0FDF4', text: '#065F46', badge: 'bg-emerald-100 text-emerald-700' },
}
export const INCIDENT_STATUS_STYLE = {
  open:          { label: 'Open',          bg: 'bg-red-100 text-red-700' },
  investigating: { label: 'Investigating', bg: 'bg-amber-100 text-amber-700' },
  resolved:      { label: 'Resolved',      bg: 'bg-emerald-100 text-emerald-700' },
}
