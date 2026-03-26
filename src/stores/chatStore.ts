import { create } from 'zustand';
import type { Conversation, Message, AgentRun } from '@/types';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeRuns: Map<string, AgentRun>;

  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Message) => void;
  startRun: (runId: string, agentId: string) => void;
  updateRunState: (runId: string, state: AgentRun['state']) => void;
  appendToken: (runId: string, token: string) => void;
  finishRun: (runId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  activeRuns: new Map(),

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  addMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message] }
          : c
      ),
    })),

  startRun: (runId, agentId) =>
    set((state) => {
      const runs = new Map(state.activeRuns);
      runs.set(runId, { runId, agentId, state: 'thinking', tokens: [] });
      return { activeRuns: runs };
    }),

  updateRunState: (runId, runState) =>
    set((state) => {
      const runs = new Map(state.activeRuns);
      const run = runs.get(runId);
      if (run) runs.set(runId, { ...run, state: runState });
      return { activeRuns: runs };
    }),

  appendToken: (runId, token) =>
    set((state) => {
      const runs = new Map(state.activeRuns);
      const run = runs.get(runId);
      if (run) runs.set(runId, { ...run, tokens: [...run.tokens, token] });
      return { activeRuns: runs };
    }),

  finishRun: (runId) =>
    set((state) => {
      const runs = new Map(state.activeRuns);
      runs.delete(runId);
      return { activeRuns: runs };
    }),
}));
