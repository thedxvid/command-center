'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { mockAgents, mockSquads } from '@/lib/mockData';

export default function AgentsPage() {
  const getSquad = (squadId?: string) =>
    squadId ? mockSquads.find((s) => s.id === squadId) : undefined;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Agents</h1>
          <p className="text-sm text-text-secondary mt-1">
            {mockAgents.length} agents configured
          </p>
        </div>
        <Link href="/agents/new">
          <Button>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            New Agent
          </Button>
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockAgents.map((agent) => {
          const squad = getSquad(agent.squadId);
          return (
            <Link key={agent.id} href={`/agents/${agent.id}`}>
              <Card hover className="flex flex-col gap-3 h-full">
                {/* Avatar + Name */}
                <div className="flex items-start gap-3">
                  <span className="text-3xl leading-none">{agent.avatar || '🤖'}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-text-primary truncate">
                      {agent.name}
                    </h3>
                    {agent.description && (
                      <p className="text-sm text-text-secondary mt-0.5 line-clamp-2">
                        {agent.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Squad badge */}
                {squad && (
                  <div>
                    <span
                      className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full"
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
                <div className="flex flex-wrap gap-1.5">
                  {agent.skills.map((skill) => (
                    <Badge key={skill} size="sm">
                      {skill.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>

                {/* Chat button */}
                <div className="mt-auto pt-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M2 3a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H5l-3 3V3z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Chat
                  </Button>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
