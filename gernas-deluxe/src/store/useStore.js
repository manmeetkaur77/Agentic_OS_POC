import { create } from 'zustand'

function computeAdvanced(m) {
  const nextStep = Math.min(m.currentStep + 1, 6)
  const isCompleted = nextStep >= 6
  return {
    ...m,
    currentStep: nextStep,
    status: isCompleted ? 'completed' : 'in_progress',
    steps: m.steps.map((step, i) => {
      if (i + 1 < nextStep)  return { ...step, status: 'completed' }
      if (i + 1 === nextStep) return { ...step, status: isCompleted ? 'completed' : 'running', completedAt: isCompleted || step.status === 'running' ? new Date().toLocaleTimeString() : null }
      if (i + 1 === nextStep + 1 && !isCompleted) return { ...step, status: 'running' }
      return step
    })
  }
}

const useStore = create((set) => ({
  agents: [],
  metrics: null,
  merchants: [],
  tasks: [],
  selectedMerchant: null,
  toasts: [],
  builtAgents: [],
  confluencePages: [],   // pages sent from Imagination Studio → Agent Analyst
  deployedAgents: [],    // agents submitted via Agent Analyst phase journey

  // Imagination Studio session — persists during SPA navigation, clears on refresh
  novaSession: null,
  setNovaSession: (s) => set({ novaSession: s }),
  clearNovaSession: () => set({ novaSession: null }),

  setAgents:    (agents)    => set({ agents }),
  setMetrics:   (metrics)   => set({ metrics }),
  setMerchants: (merchants) => set({ merchants }),
  setTasks:     (tasks)     => set({ tasks }),

  addBuiltAgent: (agent) => set((s) => ({
    builtAgents: [...s.builtAgents, agent],
  })),

  addConfluencePage: (page) => set((s) => ({
    confluencePages: [page, ...s.confluencePages],
  })),

  addDeployedAgent: (agent) => set((s) => ({
    deployedAgents: [...s.deployedAgents, { ...agent, id: agent.id || Date.now() }],
  })),
  updateDeployedAgentStatus: (id, status) => set((s) => ({
    deployedAgents: s.deployedAgents.map(a => a.id === id ? { ...a, status } : a),
  })),

  setSelectedMerchant: (m) => set({ selectedMerchant: m }),

  addToast: (toast) => set((s) => ({
    toasts: [...s.toasts, { ...toast, id: Date.now() }]
  })),
  removeToast: (id) => set((s) => ({
    toasts: s.toasts.filter((t) => t.id !== id)
  })),

  advanceMerchantStep: (merchantId) => set((s) => {
    const updated = s.merchants.map((m) =>
      m.id === merchantId ? computeAdvanced(m) : m
    )
    const updatedMerchant = updated.find((m) => m.id === merchantId)
    return {
      merchants: updated,
      selectedMerchant: s.selectedMerchant?.id === merchantId ? updatedMerchant : s.selectedMerchant,
    }
  }),
}))

export default useStore
