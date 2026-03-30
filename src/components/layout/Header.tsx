'use client';

import { usePathname } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';

const pageTitles: Record<string, string> = {
  '/': 'Painel',
  '/agents': 'Agentes',
  '/squads': 'Squads',
  '/creative': 'Estúdio Criativo',
  '/vault': 'Vault',
  '/settings': 'Configurações',
};

export default function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme, sidebarOpen, toggleSidebar, voiceMode, toggleVoiceMode } = useUIStore();

  const getTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (path === '/' && pathname === '/') return title;
      if (path !== '/' && pathname.startsWith(path)) return title;
    }
    return 'Command Center';
  };

  return (
    <header className="h-[var(--header-height)] border-b border-border bg-bg-primary/80 backdrop-blur-md flex items-center justify-between px-5 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Sidebar toggle */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-[var(--radius-sm)] text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            {sidebarOpen ? (
              <path d="M3 4.5H15M3 9H15M3 13.5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <path d="M3 4.5H15M3 9H15M3 13.5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            )}
          </svg>
        </button>

        <h2 className="text-base font-semibold text-text-primary">{getTitle()}</h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Voice mode toggle */}
        <button
          onClick={toggleVoiceMode}
          className={`p-2 rounded-[var(--radius-sm)] transition-colors ${
            voiceMode
              ? 'bg-accent text-white'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
          }`}
          title={voiceMode ? 'Modo voz LIGADO' : 'Modo voz DESLIGADO'}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="6.5" y="2" width="5" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 9.5C4 12.3 6.2 14.5 9 14.5C11.8 14.5 14 12.3 14 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M9 14.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-[var(--radius-sm)] text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          title={`Mudar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
        >
          {theme === 'light' ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 1.5V3M9 15V16.5M1.5 9H3M15 9H16.5M3.7 3.7L4.8 4.8M13.2 13.2L14.3 14.3M14.3 3.7L13.2 4.8M4.8 13.2L3.7 14.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M15 10.5C14.3 13.3 11.9 15.5 9 15.5C5.4 15.5 2.5 12.6 2.5 9C2.5 6.1 4.7 3.7 7.5 3C6.9 4.1 6.5 5.5 6.5 7C6.5 10.6 9.4 13.5 13 13.5C13.9 13.5 14.5 13.2 15 10.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
