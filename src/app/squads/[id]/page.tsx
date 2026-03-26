'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { Card, Button, Badge } from '@/components/ui';
import { mockSquads } from '@/lib/mockData';
import type { Message } from '@/types';

const mockSquadMessages: (Message & { agentName?: string; agentAvatar?: string })[] = [
  {
    id: 'sq-msg-1',
    conversationId: 'squad-conv-1',
    role: 'user',
    content: 'Preciso de uma campanha completa sobre produtividade. Roteiro de reels, carrossel e copy para ads.',
    createdAt: new Date('2026-03-25T14:00:00'),
  },
  {
    id: 'sq-msg-2',
    conversationId: 'squad-conv-1',
    role: 'assistant',
    content: `## Roteiro de Reels: Produtividade Real

**Hook (0-3s):** "Para de fingir que tá produzindo..."

**Desenvolvimento (3-25s):**
1. Fecha todas as abas que não precisa
2. Coloca o celular no modo foco
3. Define UMA meta pro próximo bloco de 90 min
4. Trabalha sem parar até o timer tocar

**CTA (25-30s):** "Testa isso agora e me conta nos comentários."

*Formato: talking head + b-roll de tela, cortes rápidos*`,
    agentId: 'agent-1',
    agentName: 'Roteirizador',
    agentAvatar: '🎬',
    metadata: { tokensUsed: 245, model: 'claude-sonnet-4-20250514', latencyMs: 1800 },
    createdAt: new Date('2026-03-25T14:00:04'),
  },
  {
    id: 'sq-msg-3',
    conversationId: 'squad-conv-1',
    role: 'assistant',
    content: `## Carrossel: 5 Hábitos de Quem é Realmente Produtivo

**Slide 1 (Capa):** "5 Hábitos que Mudaram Minha Produtividade"
_Visual: Fundo escuro, tipografia bold_

**Slide 2:** "1. Bloco de 90 minutos sem interrupção"
_Visual: Timer minimalista_

**Slide 3:** "2. Lista de 3 prioridades, não 30 tarefas"
_Visual: Checklist com 3 items_

**Slide 4:** "3. Celular no modo avião durante deep work"
_Visual: Celular com ícone de avião_

**Slide 5:** "4. Review semanal todo domingo"
_Visual: Calendário_

**Slide 6 (CTA):** "Qual desses você já faz? Comenta o número!"`,
    agentId: 'agent-2',
    agentName: 'Carrossel Master',
    agentAvatar: '🎠',
    metadata: { tokensUsed: 320, model: 'claude-sonnet-4-20250514', latencyMs: 2200 },
    createdAt: new Date('2026-03-25T14:00:08'),
  },
  {
    id: 'sq-msg-4',
    conversationId: 'squad-conv-1',
    role: 'assistant',
    content: `## Viral Hook Analysis

Analisei os top 50 reels sobre produtividade dessa semana. Tendências:

- **"Para de..."** hooks têm 3.2x mais saves
- **Formato lista** (3-5 itens) performa melhor que tutorial longo
- **Horário ideal**: 7h-8h e 18h-19h (seu público)
- **Duração sweet spot**: 18-25 segundos

Recomendo combinar o roteiro do Roteirizador com o carrossel do Carrossel Master e publicar no mesmo dia pra maximizar alcance.`,
    agentId: 'agent-4',
    agentName: 'Viral Content',
    agentAvatar: '🔥',
    metadata: { tokensUsed: 198, model: 'claude-sonnet-4-20250514', latencyMs: 2800 },
    createdAt: new Date('2026-03-25T14:00:12'),
  },
];

export default function SquadChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const squad = mockSquads.find((s) => s.id === id);
  const [inputValue, setInputValue] = useState('');

  if (!squad) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-text-secondary">Squad not found</p>
        <Link href="/squads">
          <Button variant="secondary">Back to Squads</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-var(--header-height,64px)-3rem)] gap-0 -m-6">
      {/* Left sidebar - agents list */}
      <div className="w-64 border-r border-border bg-bg-elevated flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: squad.color || 'var(--accent)' }}
            />
            <h2 className="text-sm font-semibold text-text-primary truncate">
              {squad.name}
            </h2>
          </div>
          <p className="text-xs text-text-tertiary mt-1 line-clamp-2">
            {squad.description}
          </p>
        </div>

        <div className="p-3 flex-1 overflow-y-auto">
          <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2 px-1">
            Agents ({squad.agents.length})
          </p>
          <div className="flex flex-col gap-1">
            {squad.agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-2.5 px-2 py-2 rounded-[var(--radius-md)] hover:bg-bg-tertiary transition-colors"
              >
                <div className="relative">
                  <span className="text-xl leading-none">{agent.avatar || '🤖'}</span>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-bg-elevated"
                    style={{ backgroundColor: squad.color || 'var(--accent)' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {agent.name}
                  </p>
                  <p className="text-[11px] text-text-tertiary truncate">
                    {agent.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 border-t border-border">
          <Link href="/squads">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Squads
            </Button>
          </Link>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="px-6 py-3 border-b border-border bg-bg-elevated flex items-center gap-3">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: squad.color || 'var(--accent)' }}
          />
          <h1 className="text-base font-semibold text-text-primary">{squad.name}</h1>
          <Badge variant="accent" size="sm">{squad.agents.length} agents</Badge>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {mockSquadMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${msg.role === 'user' ? '' : ''}`}>
                {/* Agent badge for assistant messages */}
                {msg.role === 'assistant' && msg.agentName && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-base leading-none">{msg.agentAvatar}</span>
                    <span className="text-xs font-medium text-text-secondary">
                      {msg.agentName}
                    </span>
                  </div>
                )}

                <div
                  className={`px-4 py-3 rounded-[var(--radius-lg)] text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-accent text-white rounded-br-sm'
                      : 'bg-bg-elevated border border-border rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Metadata */}
                {msg.metadata && (
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="text-[10px] text-text-tertiary">
                      {msg.metadata.tokensUsed} tokens
                    </span>
                    <span className="text-[10px] text-text-tertiary">
                      {msg.metadata.latencyMs}ms
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="px-6 py-4 border-t border-border bg-bg-elevated">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Message ${squad.name}...`}
                rows={1}
                className="w-full px-4 py-3 text-sm bg-bg-primary border border-border rounded-[var(--radius-lg)] text-text-primary placeholder:text-text-tertiary outline-none resize-none transition-all duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
            <Button size="md" disabled={!inputValue.trim()}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 2L7 9M14 2L9.5 14L7 9M14 2L2 6.5L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          </div>
          <p className="text-[11px] text-text-tertiary mt-2">
            All {squad.agents.length} agents will collaborate on your request
          </p>
        </div>
      </div>
    </div>
  );
}
