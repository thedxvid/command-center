export interface Agent {
  id: string;
  name: string;
  avatar?: string;
  systemPrompt: string;
  description?: string;
  skills: string[];
  config: AgentConfig;
  squadId?: string;
  squad?: Squad;
  conversations?: Conversation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface Squad {
  id: string;
  name: string;
  description?: string;
  color?: string;
  agents: Agent[];
  conversations?: Conversation[];
  createdAt: Date;
}

export interface Conversation {
  id: string;
  title?: string;
  agentId?: string;
  agent?: Agent;
  squadId?: string;
  squad?: Squad;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentId?: string;
  metadata?: MessageMetadata;
  attachments?: Attachment[];
  createdAt: Date;
}

export interface MessageMetadata {
  tokensUsed?: number;
  model?: string;
  latencyMs?: number;
}

export interface Attachment {
  type: 'image' | 'file';
  url: string;
  name: string;
}

export interface CreativeOutput {
  id: string;
  type: 'carousel' | 'ad_creative' | 'script' | 'viral_content';
  prompt: string;
  agentId: string;
  conversationId?: string;
  images: string[];
  textContent?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface VaultNote {
  path: string;
  content: string;
  lastSynced: Date;
}

export type AgentSkill = 'vault_search' | 'read_vault_note' | 'generate_image' | 'web_search';

export type RunState = 'idle' | 'thinking' | 'searching_vault' | 'generating_image' | 'responding';

export interface AgentRun {
  runId: string;
  agentId: string;
  state: RunState;
  tokens: string[];
  currentTool?: string;
}
