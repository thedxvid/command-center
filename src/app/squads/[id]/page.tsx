'use client';

import { use, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Badge } from '@/components/ui';
import { mockSquads } from '@/lib/mockData';
import type { Message } from '@/types';

type SquadMessage = Message & { agentName?: string; agentAvatar?: string };

export default function SquadChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const squad = mockSquads.find((s) => s.id === id);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<SquadMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!squad) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-text-secondary">Squad não encontrado</p>
        <Link href="/squads">
          <Button variant="secondary">Voltar para Squads</Button>
        </Link>
      </div>
    );
  }

  async function handleSend() {
    if (!inputValue.trim() || isLoading) return;

    const userContent = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    const userMsg: SquadMessage = {
      id: `user-${Date.now()}`,
      conversationId: conversationId || '',
      role: 'user',
      content: userContent,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('/api/squads/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ squadId: id, message: userContent, conversationId }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Erro ao contatar a squad');
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let currentAgentMsgId: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split('\n').filter((l) => l.startsWith('data: '));

        for (const line of lines) {
          let data: Record<string, unknown>;
          try { data = JSON.parse(line.slice(6)); } catch { continue; }

          if (data.agentStart) {
            const start = data.agentStart as { id: string; name: string; avatar: string };
            currentAgentMsgId = `agent-${start.id}-${Date.now()}`;
            setMessages((prev) => [
              ...prev,
              {
                id: currentAgentMsgId!,
                conversationId: conversationId || '',
                role: 'assistant',
                content: '',
                agentId: start.id,
                agentName: start.name,
                agentAvatar: start.avatar,
                createdAt: new Date(),
              },
            ]);
          } else if (data.text && currentAgentMsgId) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === currentAgentMsgId ? { ...m, content: m.content + (data.text as string) } : m
              )
            );
          } else if (data.agentDone && currentAgentMsgId) {
            const done = data.agentDone as { tokensUsed: number; latencyMs: number };
            setMessages((prev) =>
              prev.map((m) =>
                m.id === currentAgentMsgId
                  ? { ...m, metadata: { tokensUsed: done.tokensUsed, latencyMs: done.latencyMs } }
                  : m
              )
            );
            currentAgentMsgId = null;
          } else if (data.done) {
            setConversationId(data.conversationId as string);
          }
        }
      }
    } catch (e) {
      const errMsg: SquadMessage = {
        id: `err-${Date.now()}`,
        conversationId: conversationId || '',
        role: 'assistant',
        content: e instanceof Error ? e.message : 'Erro desconhecido',
        agentName: 'Sistema',
        agentAvatar: '⚠️',
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
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
            Agentes ({squad.agents.length})
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
              Voltar para Squads
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
          <Badge variant="accent" size="sm">{squad.agents.length} agentes</Badge>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
              <p className="text-text-secondary text-sm">
                Envie uma mensagem para acionar todos os agentes da squad.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[75%]">
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
                  {msg.content || (
                    <span className="inline-flex gap-1 text-text-tertiary">
                      <span className="animate-pulse">•</span>
                      <span className="animate-pulse [animation-delay:150ms]">•</span>
                      <span className="animate-pulse [animation-delay:300ms]">•</span>
                    </span>
                  )}
                </div>

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

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-[var(--radius-lg)] bg-bg-elevated border border-border text-sm text-text-tertiary">
                Acionando agentes...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="px-6 py-4 border-t border-border bg-bg-elevated">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Mensagem para ${squad.name}...`}
                rows={1}
                disabled={isLoading}
                className="w-full px-4 py-3 text-sm bg-bg-primary border border-border rounded-[var(--radius-lg)] text-text-primary placeholder:text-text-tertiary outline-none resize-none transition-all duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
            </div>
            <Button size="md" disabled={!inputValue.trim() || isLoading} onClick={handleSend}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 2L7 9M14 2L9.5 14L7 9M14 2L2 6.5L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          </div>
          <p className="text-[11px] text-text-tertiary mt-2">
            Todos os {squad.agents.length} agentes vão colaborar na sua solicitação
          </p>
        </div>
      </div>
    </div>
  );
}
