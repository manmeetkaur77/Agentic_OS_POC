# DLX_AGENTIC_OS — POC

An enterprise agentic platform POC for Deluxe Corporation. It lets business stakeholders discover, evaluate, import, build, and govern AI agents and workflows across four business segments: Merchant Services, B2B Payments, Print & Retention, and Data Solutions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19 + Vite |
| Routing | React Router 7 |
| State management | Zustand |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion |
| Backend | FastAPI (Python) |
| LLM | AWS Bedrock — Claude Sonnet 4.5 |
| AWS SDK | boto3 |

---

## Project Structure

```
gernas-deluxe/
├── src/
│   ├── App.jsx                     # Route definitions
│   ├── main.jsx                    # React entry point
│   ├── store/
│   │   └── useStore.js             # Zustand global store
│   ├── data/
│   │   └── platformData.js         # Static workflow/agent/tool catalog data
│   ├── pages/
│   │   ├── ImagineStudio.jsx       # Nova AI chat — discover & design agents
│   │   ├── AgentPool.jsx           # Discover Hub — browse/import/evaluate workflows
│   │   ├── GovernanceRegistry.jsx  # Review & approve submitted agents/workflows
│   │   ├── AgentBuilder.jsx        # Solution Builder — define and submit agents
│   │   ├── Dashboard.jsx           # Platform metrics + author stats
│   │   └── ...                     # Other segment-specific pages
│   └── components/
│       ├── layout/
│       │   ├── Sidebar.jsx         # Navigation sidebar
│       │   ├── TopBar.jsx          # Top bar
│       │   └── Layout.jsx          # Shell wrapping all pages
│       └── shared/                 # Reusable UI components (cards, badges, toasts)
├── server/
│   ├── agent.py                    # FastAPI app — Nova AI endpoints
│   ├── agents.json                 # Agent pool loaded at startup
│   ├── workflows.json              # Workflow pool loaded at startup
│   ├── requirements.txt            # Python dependencies
│   └── .env                        # AWS credentials + Bedrock config (not committed)
└── artifacts/
    ├── simple-agent-config.json            # Demo: single-agent import config
    ├── sample-workflow-config.json         # Demo: standard workflow config
    └── cross-border-payments-workflow.json # Demo: high-risk workflow for evaluate storyline
```

---

## Running the App

### Frontend

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173`. The root `/` redirects to `/studio`.

### Backend

```bash
cd server
pip install -r requirements.txt
python agent.py
```

Runs on `http://localhost:8000`. Requires a valid `server/.env` (see below).

### Environment Variables (`server/.env`)

```env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=...           # Required for STS temporary credentials

BEDROCK_MODEL_ID=global.anthropic.claude-sonnet-4-5-20250929-v1:0
BEDROCK_REGION=us-east-1
BEDROCK_MAX_TOKENS=8192
BEDROCK_TEMPERATURE=0
BEDROCK_GUARDRAIL_ARN=...       # Optional — leave blank to disable
BEDROCK_GUARDRAIL_VERSION=1
```

> If using AWS STS temporary credentials, the session token expires. Replace all three AWS values when you see `UnrecognizedClientException` errors.

---

## Key Pages

### Imagination Studio (`/studio`)
The primary discovery interface. Powered by **Nova**, an AI analyst running on AWS Bedrock.

- User describes a business problem in plain language
- Nova detects intent at three priority levels:
  1. **Agent Match** — if an existing deployed agent covers the request, Nova names it immediately and offers to proceed or clarify
  2. **Build Intent** — if the user wants to build something new, Nova collects requirements through guided questions
  3. **Discovery Flow** — open-ended business problem exploration
- On completion, Nova outputs a structured JSON report (agent chain + coverage) which is submitted to Governance

### Discover Hub (`/agent-pool`)
A four-tab catalog of everything on the platform.

| Tab | Contents |
|---|---|
| Individual Agents | All standalone agents with author, status, and capabilities |
| Workflows | Multi-agent pipelines with filter chips (All / Approved / Under Review) |
| Tools & MCPs | Individual tools/MCP integrations with status filters |
| Dashboard | Author-level artifact count stats |

**Import from Config** — any tab lets you drag-drop or upload a JSON config file to import a workflow. The file is parsed, validated for duplicates, and opened in the **Evaluate modal**.

**Evaluate modal** — scores imported workflows for security risk:
- Tools are matched against a `HIGH_RISK_TOOLS` / `MED_RISK_TOOLS` list to produce a per-agent risk score
- **Fix with AI** removes high-risk tools and shows a per-agent diff of what was removed
- **Deploy to Production** submits the (fixed) workflow to Governance as `status: 'pending'` (Under Review)

### Governance Registry (`/governance`)
Shows all submitted agents and workflows awaiting review.

- Workflows deployed via **Deploy to Production** appear here with status **Under Review**
- Reviewers can Approve or Reject each item
- Approving an agent auto-promotes any pending workflow whose build-gaps are now filled

### Solution Builder (`/builder`)
Form-driven interface to define a new custom agent — name, description, tools, segment — and submit it to Governance.

---

## State Management (`useStore.js`)

All cross-page state lives in a single Zustand store.

| State key | Purpose |
|---|---|
| `pendingWorkflows` | Workflows submitted to Governance (status: `pending` / `approved` / `rejected`) |
| `builtAgents` | Agents created in Solution Builder |
| `deployedAgents` | Agents that have been fully approved and deployed |
| `novaSession` | Current Imagination Studio conversation state (persists across navigation, clears on refresh) |
| `confluencePages` | Pages passed from Imagination Studio to Agent Analyst |

Key actions:
- `deployWorkflow(wf)` — adds a workflow to `pendingWorkflows` with `status: 'pending'`
- `addPendingWorkflow(wf)` — same, used from Imagination Studio submit
- `updateWorkflowStatus(id, status)` — approves or rejects a workflow
- `approveAgent(agentId)` — approves a built agent and auto-promotes dependent workflows

---

## Backend API (`server/agent.py`)

Three POST endpoints:

| Endpoint | Purpose |
|---|---|
| `POST /nova/chat` | Main Nova conversation — takes `{ message, history }`, returns `{ reply, options, done }` |
| `POST /nova/simulate` | Runs the structured agent report generation after discovery is complete |
| `POST /nova/analyst` | Deeper workflow analysis used by the Agent Analyst page |

Nova's system prompt is assembled dynamically at call time — it injects the live agent pool from `agents.json` so Claude always sees the current deployed agents when detecting intent.

---

## Import Config Format

Workflows can be imported via JSON. Two supported shapes:

**Flat:**
```json
{
  "name": "My Workflow",
  "description": "...",
  "agents": [
    { "name": "Agent A", "role": "...", "tools": ["tool-1", "tool-2"] }
  ]
}
```

**Enveloped:**
```json
{
  "workflow": { "name": "My Workflow", "description": "..." },
  "agents": [
    { "name": "Agent A", "role": "...", "tools": ["tool-1"] }
  ]
}
```

Sample configs in `artifacts/` demonstrate both a simple single-agent import and a high-risk multi-agent workflow designed to trigger the security evaluation storyline.
