'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BrandingContext {
  id: string;
  name: string;
  description: string;
  colors: string;
  fonts: string;
  tone: string;
  audience: string;
  references: string;
  extraNotes: string;
  createdAt: Date;
}

interface BrandingStore {
  contexts: BrandingContext[];
  activeContextId: string | null;
  addContext: (context: BrandingContext) => void;
  updateContext: (id: string, updates: Partial<BrandingContext>) => void;
  removeContext: (id: string) => void;
  setActiveContext: (id: string | null) => void;
  getActiveContext: () => BrandingContext | null;
}

export const useBrandingStore = create<BrandingStore>()(
  persist(
    (set, get) => ({
      contexts: [],
      activeContextId: null,

      addContext: (context) =>
        set((state) => ({ contexts: [...state.contexts, context] })),

      updateContext: (id, updates) =>
        set((state) => ({
          contexts: state.contexts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      removeContext: (id) =>
        set((state) => ({
          contexts: state.contexts.filter((c) => c.id !== id),
          activeContextId: state.activeContextId === id ? null : state.activeContextId,
        })),

      setActiveContext: (id) => set({ activeContextId: id }),

      getActiveContext: () => {
        const { contexts, activeContextId } = get();
        return contexts.find((c) => c.id === activeContextId) || null;
      },
    }),
    {
      name: 'command-center-branding',
    }
  )
);
