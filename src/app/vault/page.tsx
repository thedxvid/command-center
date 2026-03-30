'use client';

import { useState } from 'react';
import { Card, Input, Badge } from '@/components/ui';

interface VaultFile {
  name: string;
  type: 'folder' | 'file';
  children?: VaultFile[];
  content?: string;
}

const mockVaultTree: VaultFile[] = [
  {
    name: 'Estudos',
    type: 'folder',
    children: [
      {
        name: 'Inteligência Artificial',
        type: 'folder',
        children: [
          {
            name: 'Prompt Engineering.md',
            type: 'file',
            content: `# Prompt Engineering

## Princípios Fundamentais

### 1. Clareza e Especificidade
Quanto mais claro e específico o prompt, melhor o resultado. Evite ambiguidades.

### 2. Contexto é Rei
Forneça contexto suficiente para que o modelo entenda o cenário completo.

### 3. Few-Shot Learning
Use exemplos para guiar o modelo no formato e estilo desejados.

## Técnicas Avançadas

- **Chain of Thought**: Peça ao modelo para "pensar passo a passo"
- **Role Playing**: Defina um papel específico para o modelo
- **Constraints**: Estabeleça limites claros (tamanho, formato, tom)

## Referências
- Anthropic Docs
- OpenAI Cookbook`,
          },
          {
            name: 'Agentes Autônomos.md',
            type: 'file',
            content: `# Agentes Autônomos

## Conceito
Agentes que podem tomar decisões e executar ações de forma independente, usando LLMs como "cérebro".

## Componentes
1. **Planejamento**: Decomposição de tarefas
2. **Memória**: Curto e longo prazo
3. **Ferramentas**: APIs e ações no mundo real
4. **Reflexão**: Auto-avaliação e correção

## Frameworks
- LangGraph
- CrewAI
- AutoGen`,
          },
        ],
      },
      {
        name: 'Marketing Digital',
        type: 'folder',
        children: [
          {
            name: 'Funil de Vendas.md',
            type: 'file',
            content: `# Funil de Vendas

## Etapas
1. **Topo**: Consciência do problema
2. **Meio**: Consideração da solução
3. **Fundo**: Decisão de compra

## Métricas Chave
- CPL (Custo por Lead)
- Taxa de Conversão
- LTV (Lifetime Value)
- CAC (Custo de Aquisição)`,
          },
        ],
      },
      {
        name: 'Programação',
        type: 'folder',
        children: [
          {
            name: 'Next.js 15.md',
            type: 'file',
            content: `# Next.js 15

## Novidades
- React 19 support
- Async Request APIs (params, searchParams)
- Improved caching
- Turbopack stable

## App Router
- Server Components por padrão
- Streaming com Suspense
- Parallel Routes
- Intercepting Routes`,
          },
          {
            name: 'TypeScript Tips.md',
            type: 'file',
            content: `# TypeScript Tips

## Utility Types
- \`Partial<T>\` — Torna todas as props opcionais
- \`Required<T>\` — Torna todas as props obrigatórias
- \`Pick<T, K>\` — Seleciona props específicas
- \`Omit<T, K>\` — Remove props específicas
- \`Record<K, V>\` — Cria tipo de objeto`,
          },
        ],
      },
    ],
  },
  {
    name: 'SOIA',
    type: 'folder',
    children: [
      {
        name: 'Estratégia',
        type: 'folder',
        children: [
          {
            name: 'Roadmap Q2 2026.md',
            type: 'file',
            content: `# Roadmap Q2 2026

## Abril
- [ ] Lançar MVP do Command Center
- [ ] Setup de 5 agentes core
- [ ] Integração com Obsidian

## Maio
- [ ] Dashboard de métricas
- [ ] Automação de conteúdo semanal
- [ ] Testes A/B de criativos

## Junho
- [ ] Escalar produção para 30 posts/semana
- [ ] Implementar feedback loop com analytics
- [ ] V2 do sistema de squads`,
          },
        ],
      },
      {
        name: 'Produtos',
        type: 'folder',
        children: [
          {
            name: 'Ideias de Produto.md',
            type: 'file',
            content: `# Ideias de Produto

## Em Validação
1. **Command Center** — Dashboard de gestão de agentes IA
2. **Content OS** — Sistema operacional para criação de conteúdo

## Backlog
- Curso de IA para Criadores
- Template Pack para Notion/Obsidian
- API de Agentes como Serviço`,
          },
        ],
      },
    ],
  },
  {
    name: 'Claude Code',
    type: 'folder',
    children: [
      {
        name: 'Side Projects',
        type: 'folder',
        children: [
          {
            name: 'Command Center Notes.md',
            type: 'file',
            content: `# Command Center Notes

## Stack
- Next.js 15 (App Router)
- Tailwind CSS v4
- Prisma + SQLite
- Claude API (Anthropic)

## Arquitetura
- Cada agente tem seu system prompt
- Squads agrupam agentes para colaboração
- Vault sync com Obsidian via REST API
- Creative outputs salvos no banco

## TODO
- [ ] Implementar streaming de respostas
- [ ] Adicionar histórico de conversas
- [ ] Dashboard com métricas de uso`,
          },
        ],
      },
    ],
  },
];

function FolderTree({
  items,
  depth = 0,
  selectedFile,
  onSelectFile,
}: {
  items: VaultFile[];
  depth?: number;
  selectedFile: string | null;
  onSelectFile: (file: VaultFile) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    // Default expand first level
    Object.fromEntries(items.filter((i) => i.type === 'folder').map((i) => [i.name, depth === 0]))
  );

  return (
    <div className="flex flex-col">
      {items.map((item) => (
        <div key={item.name}>
          <button
            onClick={() => {
              if (item.type === 'folder') {
                setExpanded((prev) => ({ ...prev, [item.name]: !prev[item.name] }));
              } else {
                onSelectFile(item);
              }
            }}
            className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-[var(--radius-sm)] transition-colors text-left hover:bg-bg-tertiary ${
              item.type === 'file' && selectedFile === item.name
                ? 'bg-accent/10 text-accent'
                : 'text-text-primary'
            }`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {item.type === 'folder' ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                className={`shrink-0 transition-transform ${expanded[item.name] ? 'rotate-90' : ''}`}
              >
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 text-text-tertiary">
                <path d="M4 2h5l1 1h3a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1h1z" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            )}
            {item.type === 'folder' ? (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 text-amber-500">
                <path
                  d="M2 4a1 1 0 011-1h3.5l1.5 1.5H13a1 1 0 011 1V12a1 1 0 01-1 1H3a1 1 0 01-1-1V4z"
                  fill="currentColor"
                  opacity="0.2"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            ) : null}
            <span className="truncate">{item.name}</span>
          </button>

          {item.type === 'folder' && expanded[item.name] && item.children && (
            <FolderTree
              items={item.children}
              depth={depth + 1}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function VaultPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<VaultFile | null>(null);

  return (
    <div className="flex flex-col gap-4 p-6 h-[calc(100vh-var(--header-height,64px)-3rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Explorador do Vault</h1>
          <p className="text-sm text-text-secondary mt-1">Navegue e pesquise seu vault do Obsidian</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
        >
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar notas, pastas, conteúdo..."
          className="w-full h-12 pl-10 pr-4 text-sm bg-bg-elevated border border-border rounded-[var(--radius-lg)] text-text-primary placeholder:text-text-tertiary outline-none transition-all duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {/* Connection status */}
      <div className="flex items-center gap-2">
        <Badge variant="warning" size="md">
          <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5 inline-block" />
          Não conectado — Instale o plugin Obsidian Local REST API
        </Badge>
      </div>

      {/* Split layout */}
      <div className="flex gap-0 flex-1 min-h-0 border border-border rounded-[var(--radius-lg)] overflow-hidden">
        {/* Folder tree */}
        <div className="w-[300px] shrink-0 border-r border-border bg-bg-elevated overflow-y-auto p-3">
          <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2 px-2">
            Estrutura do Vault
          </p>
          <FolderTree
            items={mockVaultTree}
            selectedFile={selectedFile?.name || null}
            onSelectFile={setSelectedFile}
          />
        </div>

        {/* Preview panel */}
        <div className="flex-1 bg-bg-primary overflow-y-auto">
          {selectedFile ? (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-tertiary">
                  <path d="M4 2h5l1 1h3a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1h1z" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <h2 className="text-base font-semibold text-text-primary">
                  {selectedFile.name}
                </h2>
              </div>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-text-primary leading-relaxed font-sans">
                  {selectedFile.content}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-text-tertiary">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm">Selecione uma nota para visualizar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
