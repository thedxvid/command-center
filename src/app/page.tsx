'use client';

import { Card, Badge, Button } from '@/components/ui';
import { mockStats, mockAgents, mockConversations } from '@/lib/mockData';
import Link from 'next/link';

const statCards = [
  {
    label: 'Total de Agentes',
    value: mockStats.totalAgents,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    label: 'Squads Ativos',
    value: mockStats.totalSquads,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
  },
  {
    label: 'Conversas',
    value: mockStats.totalConversations,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    label: 'Criativos Gerados',
    value: mockStats.totalCreatives,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 0 3Z" />
      </svg>
    ),
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
];

const recentActivities = [
  {
    id: 1,
    action: 'Criativo gerado',
    detail: 'Carrossel sobre Pomodoro por Carrossel Master',
    time: '2 horas atrás',
    icon: '🎨',
  },
  {
    id: 2,
    action: 'Conversa iniciada',
    detail: `"${mockConversations[0].title}" com Roteirizador`,
    time: '3 horas atrás',
    icon: '💬',
  },
  {
    id: 3,
    action: 'Criativo gerado',
    detail: 'Ad creative para curso de produtividade por Ad Creative',
    time: '1 dia atrás',
    icon: '🎨',
  },
  {
    id: 4,
    action: 'Agente criado',
    detail: `${mockAgents[4].name} entrou no time`,
    time: '3 dias atrás',
    icon: '🤖',
  },
  {
    id: 5,
    action: 'Squad criado',
    detail: 'Squad Ads Machine montado',
    time: '6 dias atrás',
    icon: '👥',
  },
];

const activeAgents = [
  {
    agent: mockAgents[0],
    status: 'responding' as const,
    task: 'Gerando roteiro de reels sobre rotina matinal',
  },
  {
    agent: mockAgents[3],
    status: 'thinking' as const,
    task: 'Analisando tópicos em alta para conteúdo viral',
  },
];

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'accent' }> = {
  idle: { label: 'Ocioso', variant: 'warning' },
  thinking: { label: 'Pensando...', variant: 'accent' },
  responding: { label: 'Respondendo', variant: 'success' },
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Painel</h1>
        <p className="text-sm text-text-secondary mt-1">Visão geral das operações dos seus agentes IA</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} hover>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-[var(--radius-md)] ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                <p className="text-xs text-text-secondary">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <Card padding="none" className="overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="text-base font-semibold text-text-primary">Atividade Recente</h2>
          </div>
          <div className="divide-y divide-border">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-4 hover:bg-bg-secondary/50 transition-colors">
                <span className="text-lg mt-0.5">{activity.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{activity.action}</p>
                  <p className="text-xs text-text-secondary truncate">{activity.detail}</p>
                </div>
                <span className="text-[11px] text-text-tertiary whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Agent Activity Monitor */}
          <Card padding="none" className="overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-base font-semibold text-text-primary">Monitor de Atividade</h2>
              <Badge variant="accent" size="sm">{mockStats.activeAgents} ativos</Badge>
            </div>
            <div className="divide-y divide-border">
              {activeAgents.map(({ agent, status, task }) => {
                const cfg = statusConfig[status];
                return (
                  <div key={agent.id} className="flex items-center gap-3 p-4">
                    <span className="text-2xl">{agent.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text-primary">{agent.name}</p>
                        <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                      </div>
                      <p className="text-xs text-text-secondary truncate mt-0.5">{task}</p>
                    </div>
                    {status === 'responding' && (
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:300ms]" />
                      </div>
                    )}
                    {status === 'thinking' && (
                      <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                );
              })}
              {/* Idle agents summary */}
              <div className="p-4 text-xs text-text-tertiary text-center">
                {mockStats.totalAgents - mockStats.activeAgents} outros agentes ociosos
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h2 className="text-base font-semibold text-text-primary mb-4">Ações Rápidas</h2>
            <div className="grid grid-cols-3 gap-3">
              <Link href="/agents/new">
                <Button variant="primary" size="md" className="w-full">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Novo Agente
                </Button>
              </Link>
              <Link href="/squads/new">
                <Button variant="secondary" size="md" className="w-full">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Novo Squad
                </Button>
              </Link>
              <Link href="/chat">
                <Button variant="secondary" size="md" className="w-full">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                  </svg>
                  Iniciar Chat
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
