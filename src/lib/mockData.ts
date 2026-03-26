import type { Agent, Squad, Conversation, Message, CreativeOutput } from '@/types';

export const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Roteirizador',
    avatar: '🎬',
    systemPrompt: 'Você é um roteirista especialista em conteúdo para redes sociais...',
    description: 'Cria roteiros para reels, stories e vídeos curtos',
    skills: ['vault_search', 'read_vault_note'],
    config: { model: 'claude-sonnet-4-20250514', temperature: 0.8, maxTokens: 4096 },
    squadId: 'squad-1',
    createdAt: new Date('2026-03-20'),
    updatedAt: new Date('2026-03-25'),
  },
  {
    id: 'agent-2',
    name: 'Carrossel Master',
    avatar: '🎠',
    systemPrompt: 'Você é especialista em criar carrosséis virais para Instagram...',
    description: 'Gera carrosséis com copy persuasiva e estrutura visual',
    skills: ['vault_search', 'generate_image'],
    config: { model: 'claude-sonnet-4-20250514', temperature: 0.7, maxTokens: 4096 },
    squadId: 'squad-1',
    createdAt: new Date('2026-03-20'),
    updatedAt: new Date('2026-03-25'),
  },
  {
    id: 'agent-3',
    name: 'Ad Creative',
    avatar: '📢',
    systemPrompt: 'Você é um especialista em criativos para anúncios pagos...',
    description: 'Cria copies e criativos para Facebook/Instagram Ads',
    skills: ['vault_search', 'generate_image'],
    config: { model: 'claude-sonnet-4-20250514', temperature: 0.6, maxTokens: 4096 },
    squadId: 'squad-2',
    createdAt: new Date('2026-03-21'),
    updatedAt: new Date('2026-03-25'),
  },
  {
    id: 'agent-4',
    name: 'Viral Content',
    avatar: '🔥',
    systemPrompt: 'Você é especialista em criar conteúdo viral...',
    description: 'Analisa trends e cria conteúdo com potencial viral',
    skills: ['vault_search', 'web_search'],
    config: { model: 'claude-sonnet-4-20250514', temperature: 0.9, maxTokens: 4096 },
    squadId: 'squad-1',
    createdAt: new Date('2026-03-22'),
    updatedAt: new Date('2026-03-25'),
  },
  {
    id: 'agent-5',
    name: 'Estrategista',
    avatar: '🧠',
    systemPrompt: 'Você é um estrategista de conteúdo digital...',
    description: 'Planeja calendário editorial e estratégia de conteúdo',
    skills: ['vault_search', 'read_vault_note'],
    config: { model: 'claude-sonnet-4-20250514', temperature: 0.5, maxTokens: 8192 },
    createdAt: new Date('2026-03-23'),
    updatedAt: new Date('2026-03-25'),
  },
];

export const mockSquads: Squad[] = [
  {
    id: 'squad-1',
    name: 'Content Factory',
    description: 'Squad de produção de conteúdo orgânico',
    color: '#E8734A',
    agents: mockAgents.filter((a) => a.squadId === 'squad-1'),
    createdAt: new Date('2026-03-20'),
  },
  {
    id: 'squad-2',
    name: 'Ads Machine',
    description: 'Squad focado em criativos para tráfego pago',
    color: '#6366F1',
    agents: mockAgents.filter((a) => a.squadId === 'squad-2'),
    createdAt: new Date('2026-03-20'),
  },
];

export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    role: 'user',
    content: 'Cria um roteiro de reels sobre produtividade usando a técnica Pomodoro',
    createdAt: new Date('2026-03-25T10:00:00'),
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    role: 'assistant',
    content: `## Roteiro: Reels sobre Pomodoro 🍅

**Hook (0-3s):**
"Você trabalha 8 horas mas rende só 2? Tenta isso..."

**Desenvolvimento (3-20s):**
1. Abre o timer no celular — 25 minutos
2. Foca em UMA tarefa só
3. Quando tocar, para TUDO — 5 min de pausa
4. Repete 4x, depois descansa 15-30 min

**CTA (20-30s):**
"Eu uso isso todo dia e triplicou minha produtividade. Salva pra testar amanhã."

**Instruções visuais:**
- Gravar em formato talking head
- Cortes rápidos a cada frase
- Texto na tela acompanhando os números
- Música: lo-fi suave de fundo`,
    agentId: 'agent-1',
    metadata: { tokensUsed: 312, model: 'claude-sonnet-4-20250514', latencyMs: 2400 },
    createdAt: new Date('2026-03-25T10:00:05'),
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    role: 'user',
    content: 'Agora faz um carrossel sobre o mesmo tema, 7 slides',
    createdAt: new Date('2026-03-25T10:01:00'),
  },
  {
    id: 'msg-4',
    conversationId: 'conv-1',
    role: 'assistant',
    content: `## Carrossel: Técnica Pomodoro 🍅

**Slide 1 (Capa):**
"A técnica que me fez render 3x mais"
_Visual: Fundo laranja, emoji de tomate grande_

**Slide 2:**
"O problema: você trabalha o dia todo mas não produz nada de verdade"
_Visual: Relógio derretendo estilo Dalí_

**Slide 3:**
"A solução: Pomodoro em 4 passos"
_Visual: Infográfico circular_

**Slide 4:**
"25 min de foco absoluto → 5 min de pausa"
_Visual: Timer minimalista_

**Slide 5:**
"Repita 4 ciclos → Descanse 15-30 min"
_Visual: 4 tomates em sequência_

**Slide 6:**
"Por que funciona: Seu cérebro não foi feito para 8h seguidas"
_Visual: Cérebro com bateria carregando_

**Slide 7 (CTA):**
"Salva esse post e testa amanhã. Me conta o resultado nos comentários."
_Visual: Botão de salvar destacado_`,
    agentId: 'agent-2',
    metadata: { tokensUsed: 428, model: 'claude-sonnet-4-20250514', latencyMs: 3100 },
    createdAt: new Date('2026-03-25T10:01:08'),
  },
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Conteúdo sobre Pomodoro',
    agentId: 'agent-1',
    messages: mockMessages.filter((m) => m.conversationId === 'conv-1'),
    createdAt: new Date('2026-03-25T10:00:00'),
    updatedAt: new Date('2026-03-25T10:01:08'),
  },
  {
    id: 'conv-2',
    title: 'Estratégia Q2 2026',
    agentId: 'agent-5',
    messages: [],
    createdAt: new Date('2026-03-24'),
    updatedAt: new Date('2026-03-24'),
  },
  {
    id: 'conv-3',
    title: 'Criativos para campanha de lançamento',
    squadId: 'squad-2',
    messages: [],
    createdAt: new Date('2026-03-23'),
    updatedAt: new Date('2026-03-23'),
  },
];

export const mockCreativeOutputs: CreativeOutput[] = [
  {
    id: 'creative-1',
    type: 'carousel',
    prompt: 'Carrossel sobre técnica Pomodoro, 7 slides, estilo minimalista',
    agentId: 'agent-2',
    conversationId: 'conv-1',
    images: ['/placeholder-slide-1.png', '/placeholder-slide-2.png'],
    textContent: 'Técnica Pomodoro - 7 slides',
    createdAt: new Date('2026-03-25'),
  },
  {
    id: 'creative-2',
    type: 'ad_creative',
    prompt: 'Criativo para ad de curso de produtividade',
    agentId: 'agent-3',
    images: ['/placeholder-ad-1.png'],
    textContent: 'Descubra como triplicar sua produtividade',
    createdAt: new Date('2026-03-24'),
  },
];

export const mockStats = {
  totalAgents: 5,
  totalSquads: 2,
  totalConversations: 3,
  totalCreatives: 2,
  tokensUsedToday: 1847,
  activeAgents: 2,
};
