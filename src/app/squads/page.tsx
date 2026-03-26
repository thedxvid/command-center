'use client';

import Link from 'next/link';
import { Card, Button, Badge } from '@/components/ui';
import { mockSquads } from '@/lib/mockData';

export default function SquadsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Squads</h1>
          <p className="text-sm text-text-secondary mt-1">
            {mockSquads.length} squads configured
          </p>
        </div>
        <Button>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          New Squad
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockSquads.map((squad) => (
          <Card key={squad.id} className="flex flex-col gap-4 h-full">
            {/* Name + color indicator */}
            <div className="flex items-start gap-3">
              <span
                className="mt-1.5 w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: squad.color || 'var(--accent)' }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-text-primary truncate">
                  {squad.name}
                </h3>
                {squad.description && (
                  <p className="text-sm text-text-secondary mt-0.5 line-clamp-2">
                    {squad.description}
                  </p>
                )}
              </div>
            </div>

            {/* Agent avatars - overlapping circles */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {squad.agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="w-8 h-8 rounded-full bg-bg-tertiary border-2 border-bg-elevated flex items-center justify-center text-sm"
                    title={agent.name}
                  >
                    {agent.avatar || '🤖'}
                  </div>
                ))}
              </div>
              <span className="text-xs text-text-tertiary">
                {squad.agents.length} agent{squad.agents.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Skills overview */}
            <div className="flex flex-wrap gap-1.5">
              {Array.from(new Set(squad.agents.flatMap((a) => a.skills))).map((skill) => (
                <Badge key={skill} size="sm">
                  {skill.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>

            {/* Chat button */}
            <div className="mt-auto pt-3 border-t border-border">
              <Link href={`/squads/${squad.id}`}>
                <Button variant="secondary" size="sm" className="w-full">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M2 3a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H5l-3 3V3z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Chat with Squad
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
