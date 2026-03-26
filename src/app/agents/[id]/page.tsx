'use client';

import { use, useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { mockAgents, mockSquads, mockMessages, mockConversations } from '@/lib/mockData';
import type { Message } from '@/types';

const MOCK_RESPONSES = [
  'Entendido! Vou trabalhar nisso agora. Aqui está minha sugestão baseada no que você pediu...',
  'Boa ideia! Deixa eu elaborar um pouco mais sobre esse tema e trazer algumas opções criativas.',
  'Perfeito, analisei o contexto e tenho algumas recomendações. Veja o que acha dessas abordagens...',
  'Interessante! Vou combinar isso com as melhores práticas que conheço para entregar algo bem impactante.',
];

export default function AgentChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const agent = mockAgents.find((a) => a.id === id);
  const squad = agent?.squadId ? mockSquads.find((s) => s.id === agent.squadId) : undefined;

  // Find conversations for this agent
  const conversation = mockConversations.find((c) => c.agentId === id);
  const initialMessages = conversation
    ? mockMessages.filter((m) => m.conversationId === conversation.id)
    : [];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [systemPromptExpanded, setSystemPromptExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputValue]);

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <p className="text-lg text-text-secondary">Agent not found</p>
        <Link href="/agents">
          <Button variant="secondary">Back to Agents</Button>
        </Link>
      </div>
    );
  }

  const totalTokens = messages
    .filter((m) => m.metadata?.tokensUsed)
    .reduce((sum, m) => sum + (m.metadata?.tokensUsed || 0), 0);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isTyping) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: conversation?.id || 'conv-new',
      role: 'user',
      content: text,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Simulate typing
    setIsTyping(true);
    setTimeout(() => {
      const responseText = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        conversationId: conversation?.id || 'conv-new',
        role: 'assistant',
        content: responseText,
        agentId: agent.id,
        metadata: {
          tokensUsed: Math.floor(Math.random() * 200) + 100,
          model: agent.config.model || 'claude-sonnet-4-20250514',
          latencyMs: Math.floor(Math.random() * 2000) + 1000,
        },
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-bg-elevated shrink-0">
          <Link href="/agents" className="text-text-tertiary hover:text-text-primary transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 5l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <span className="text-2xl">{agent.avatar || '🤖'}</span>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">{agent.name}</h2>
            {squad && (
              <span className="text-xs text-text-secondary">{squad.name}</span>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <span className="text-5xl">{agent.avatar || '🤖'}</span>
              <h3 className="text-lg font-semibold text-text-primary">{agent.name}</h3>
              <p className="text-sm text-text-secondary max-w-md">
                {agent.description || 'Start a conversation with this agent.'}
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex gap-2.5 max-w-[75%] ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {msg.role === 'assistant' && (
                  <span className="text-xl shrink-0 mt-1">{agent.avatar || '🤖'}</span>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-accent-light text-text-primary rounded-br-md'
                      : 'bg-bg-elevated border border-border text-text-primary rounded-bl-md'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <p className="text-xs font-medium text-accent mb-1">{agent.name}</p>
                  )}
                  {msg.content}
                  {msg.metadata?.tokensUsed && (
                    <p className="text-[10px] text-text-tertiary mt-2">
                      {msg.metadata.tokensUsed} tokens &middot; {msg.metadata.latencyMs}ms
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-2.5 max-w-[75%]">
                <span className="text-xl shrink-0 mt-1">{agent.avatar || '🤖'}</span>
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-bg-elevated border border-border">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border bg-bg-elevated px-6 py-3 shrink-0">
          <div className="flex items-end gap-2 bg-bg-primary border border-border rounded-2xl px-4 py-2 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${agent.name}...`}
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none max-h-40 py-1"
            />
            {/* Mic button */}
            <button
              className="shrink-0 p-1.5 text-text-tertiary hover:text-text-secondary transition-colors"
              title="Voice (coming soon)"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1.5a2.25 2.25 0 00-2.25 2.25v4.5a2.25 2.25 0 004.5 0v-4.5A2.25 2.25 0 009 1.5z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4.5 7.5v.75a4.5 4.5 0 009 0V7.5M9 12.75V15M6.75 15h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="shrink-0 p-1.5 bg-accent text-white rounded-lg hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9h12M10.5 4.5L15 9l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-text-tertiary text-center mt-1.5">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-[300px] border-l border-border bg-bg-secondary overflow-y-auto shrink-0 hidden lg:block">
        <div className="p-5 space-y-5">
          {/* Agent info */}
          <div className="flex flex-col items-center text-center gap-2">
            <span className="text-5xl">{agent.avatar || '🤖'}</span>
            <h3 className="text-lg font-semibold text-text-primary">{agent.name}</h3>
            {agent.description && (
              <p className="text-sm text-text-secondary">{agent.description}</p>
            )}
          </div>

          {/* Squad */}
          {squad && (
            <div>
              <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">Squad</p>
              <span
                className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: `${squad.color}18`,
                  color: squad.color,
                }}
              >
                {squad.name}
              </span>
            </div>
          )}

          {/* Skills */}
          <div>
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {agent.skills.map((skill) => (
                <Badge key={skill} size="sm">
                  {skill.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">System Prompt</p>
            <Card padding="sm" className="bg-bg-primary">
              <p className={`text-xs text-text-secondary font-mono whitespace-pre-wrap ${!systemPromptExpanded ? 'line-clamp-4' : ''}`}>
                {agent.systemPrompt}
              </p>
              <button
                onClick={() => setSystemPromptExpanded(!systemPromptExpanded)}
                className="text-xs text-accent hover:underline mt-1"
              >
                {systemPromptExpanded ? 'Show less' : 'Show more'}
              </button>
            </Card>
          </div>

          {/* Stats */}
          <div>
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">Stats</p>
            <div className="grid grid-cols-2 gap-2">
              <Card padding="sm" className="text-center bg-bg-primary">
                <p className="text-lg font-bold text-text-primary">{messages.length}</p>
                <p className="text-[10px] text-text-tertiary">Messages</p>
              </Card>
              <Card padding="sm" className="text-center bg-bg-primary">
                <p className="text-lg font-bold text-text-primary">{totalTokens.toLocaleString()}</p>
                <p className="text-[10px] text-text-tertiary">Tokens</p>
              </Card>
            </div>
          </div>

          {/* Edit button */}
          <Link href={`/agents/${agent.id}/edit`}>
            <Button variant="secondary" className="w-full mt-2">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M11.5 2.5l2 2M2 14l1-4L11.5 1.5l2 2L5 12l-4 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              Edit Agent
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
