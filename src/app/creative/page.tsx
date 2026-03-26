'use client';

import { useState } from 'react';
import { Card, Button, Badge, Modal, Textarea, Tabs } from '@/components/ui';
import { mockCreativeOutputs, mockAgents } from '@/lib/mockData';

const typeLabels: Record<string, string> = {
  carousel: 'Carousel',
  ad_creative: 'Ad Creative',
  script: 'Script',
  viral_content: 'Viral Content',
};

const typeBadgeVariant: Record<string, 'default' | 'accent' | 'success' | 'warning' | 'danger'> = {
  carousel: 'accent',
  ad_creative: 'warning',
  script: 'success',
  viral_content: 'danger',
};

const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'carousel', label: 'Carousels' },
  { id: 'ad_creative', label: 'Ad Creatives' },
  { id: 'script', label: 'Scripts' },
  { id: 'viral_content', label: 'Viral Content' },
];

export default function CreativePage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateType, setGenerateType] = useState('carousel');
  const [generateAgent, setGenerateAgent] = useState(mockAgents[0]?.id || '');
  const [generatePrompt, setGeneratePrompt] = useState('');

  const filtered =
    activeFilter === 'all'
      ? mockCreativeOutputs
      : mockCreativeOutputs.filter((c) => c.type === activeFilter);

  const getAgentName = (agentId: string) =>
    mockAgents.find((a) => a.id === agentId)?.name || 'Unknown';

  const getAgentAvatar = (agentId: string) =>
    mockAgents.find((a) => a.id === agentId)?.avatar || '🤖';

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Creative Studio</h1>
          <p className="text-sm text-text-secondary mt-1">
            {mockCreativeOutputs.length} creative outputs
          </p>
        </div>
        <Button onClick={() => setGenerateOpen(true)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Generate New
        </Button>
      </div>

      {/* Filter tabs */}
      <Tabs
        tabs={filterTabs}
        defaultTab="all"
        onChange={(tabId) => setActiveFilter(tabId)}
      />

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((creative) => (
          <Card key={creative.id} className="flex flex-col gap-3 h-full">
            {/* Placeholder image area */}
            <div className="aspect-[4/3] bg-bg-tertiary rounded-[var(--radius-md)] flex flex-col items-center justify-center gap-2">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                className="text-text-tertiary"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 16l5-5 4 4 2-2 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs text-text-tertiary">
                {creative.images.length} image{creative.images.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Type badge */}
            <div className="flex items-center justify-between">
              <Badge variant={typeBadgeVariant[creative.type] || 'default'} size="sm">
                {typeLabels[creative.type] || creative.type}
              </Badge>
              <span className="text-[11px] text-text-tertiary">
                {creative.createdAt.toLocaleDateString('pt-BR')}
              </span>
            </div>

            {/* Prompt */}
            <p className="text-sm text-text-primary line-clamp-2">
              {creative.prompt}
            </p>

            {/* Agent */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm leading-none">{getAgentAvatar(creative.agentId)}</span>
              <span className="text-xs text-text-secondary">{getAgentName(creative.agentId)}</span>
            </div>

            {/* Actions */}
            <div className="mt-auto pt-3 border-t border-border flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8a6 6 0 1112 0A6 6 0 012 8z" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="8" cy="8" r="1" fill="currentColor" />
                </svg>
                View
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 text-red-400 hover:text-red-500">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 5h10M6 5V3h4v2M5 5v8h6V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Delete
              </Button>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-text-tertiary gap-2">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 16l5-5 4 4 2-2 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm">No creative outputs in this category yet</p>
          </div>
        )}
      </div>

      {/* Generate Modal */}
      <Modal open={generateOpen} onClose={() => setGenerateOpen(false)} title="Generate Creative">
        <div className="flex flex-col gap-4">
          <Textarea
            label="Prompt"
            placeholder="Descreva o que você quer gerar..."
            rows={4}
            value={generatePrompt}
            onChange={(e) => setGeneratePrompt(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Type</label>
            <select
              value={generateType}
              onChange={(e) => setGenerateType(e.target.value)}
              className="h-10 px-3 text-sm bg-bg-primary border border-border rounded-[var(--radius-md)] text-text-primary outline-none transition-all duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              <option value="carousel">Carousel</option>
              <option value="ad_creative">Ad Creative</option>
              <option value="script">Script</option>
              <option value="viral_content">Viral Content</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Agent</label>
            <select
              value={generateAgent}
              onChange={(e) => setGenerateAgent(e.target.value)}
              className="h-10 px-3 text-sm bg-bg-primary border border-border rounded-[var(--radius-md)] text-text-primary outline-none transition-all duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              {mockAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.avatar} {agent.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setGenerateOpen(false)}>
              Cancel
            </Button>
            <div className="relative group">
              <Button disabled>
                Generate
              </Button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 text-[11px] bg-bg-primary border border-border text-text-secondary rounded-[var(--radius-sm)] shadow-[var(--shadow-md)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Coming soon
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
