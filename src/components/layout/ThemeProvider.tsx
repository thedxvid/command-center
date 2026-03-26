'use client';

import { useEffect, type ReactNode } from 'react';
import { useUIStore } from '@/stores/uiStore';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useUIStore();

  useEffect(() => {
    const saved = localStorage.getItem('cc-theme') as 'light' | 'dark' | null;
    if (saved) {
      setTheme(saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, [setTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cc-theme', theme);
  }, [theme]);

  return <>{children}</>;
}
