import { create } from 'zustand';
import type { Agent, Squad } from '@/types';

interface AgentState {
  agents: Agent[];
  squads: Squad[];

  setAgents: (agents: Agent[]) => void;
  setSquads: (squads: Squad[]) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;
  addSquad: (squad: Squad) => void;
  updateSquad: (id: string, updates: Partial<Squad>) => void;
  removeSquad: (id: string) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  squads: [],

  setAgents: (agents) => set({ agents }),
  setSquads: (squads) => set({ squads }),

  addAgent: (agent) =>
    set((state) => ({ agents: [...state.agents, agent] })),

  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),

  removeAgent: (id) =>
    set((state) => ({ agents: state.agents.filter((a) => a.id !== id) })),

  addSquad: (squad) =>
    set((state) => ({ squads: [...state.squads, squad] })),

  updateSquad: (id, updates) =>
    set((state) => ({
      squads: state.squads.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),

  removeSquad: (id) =>
    set((state) => ({ squads: state.squads.filter((s) => s.id !== id) })),
}));
