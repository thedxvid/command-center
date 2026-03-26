'use client';

import { type ReactNode } from 'react';
import { ThemeProvider, Sidebar, Header } from '@/components/layout';
import { useUIStore } from '@/stores/uiStore';

function MainContent({ children }: { children: ReactNode }) {
  const { sidebarOpen } = useUIStore();

  return (
    <div
      className="flex-1 flex flex-col min-h-screen transition-all duration-200"
      style={{ marginLeft: sidebarOpen ? 'var(--sidebar-width)' : '0' }}
    >
      <Header />
      <main className="flex-1 p-6 bg-bg-secondary overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex h-full">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </ThemeProvider>
  );
}
