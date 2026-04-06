/**
 * POST /api/squads/import
 * Importa os squads de D:/Jarvis/squads/ para o banco SQLite
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const SQUADS_DIR = 'D:/Jarvis/squads';

const SQUAD_COLORS: Record<string, string> = {
  'traffic-masters': '#ef4444',
  'copy-squad':      '#f59e0b',
  'hormozi-squad':   '#10b981',
  'storytelling':    '#8b5cf6',
  'brand-squad':     '#ec4899',
  'design-squad':    '#06b6d4',
  'data-squad':      '#3b82f6',
  'advisory-board':  '#6366f1',
  'claude-code-mastery': '#4fc3f7',
  'c-level-squad':   '#64748b',
  'cybersecurity':   '#dc2626',
  'movement':        '#16a34a',
};

const AGENT_AVATARS = ['🤖','⚡','🎯','🔥','💡','🚀','🎬','📊','✍️','🎨','🔐','📈'];

interface SquadYaml {
  name?: string;
  'short-title'?: string;
  description?: string;
  components?: { agents?: string[] };
}

function extractSystemPrompt(agentMd: string): string {
  // Pega o bloco yaml dentro do arquivo .md do agente
  const yamlMatch = agentMd.match(/```yaml\n([\s\S]*?)```/);
  if (yamlMatch) {
    try {
      const agentYaml = yaml.load(yamlMatch[1]) as Record<string, unknown>;
      const persona = agentYaml?.persona as Record<string, string> | undefined;
      if (persona?.role) {
        return `Você é ${agentYaml?.agent ? (agentYaml.agent as Record<string, string>).name : 'um especialista'}.
Papel: ${persona.role}
Identidade: ${persona.identity || ''}
Estilo: ${persona.style || ''}
Foco: ${persona.focus || ''}

${agentMd.slice(0, 1500)}`;
      }
    } catch {
      // fallback
    }
  }
  // Fallback: usa o conteúdo bruto do .md
  return agentMd.slice(0, 2000);
}

export async function POST(req: NextRequest) {
  try {
    const { squadNames } = await req.json().catch(() => ({ squadNames: null }));

    if (!fs.existsSync(SQUADS_DIR)) {
      return NextResponse.json({ error: `Pasta não encontrada: ${SQUADS_DIR}` }, { status: 404 });
    }

    const entries = fs.readdirSync(SQUADS_DIR, { withFileTypes: true });
    const folders = entries
      .filter((e) => e.isDirectory() && e.name !== '_example')
      .map((e) => e.name)
      .filter((n) => !squadNames || squadNames.includes(n));

    const results: { squad: string; agents: number; status: string }[] = [];

    for (const folderName of folders) {
      const squadDir = path.join(SQUADS_DIR, folderName);
      const yamlPath = path.join(squadDir, 'squad.yaml');

      if (!fs.existsSync(yamlPath)) continue;

      const squadYaml = yaml.load(fs.readFileSync(yamlPath, 'utf-8')) as SquadYaml;
      const squadName = squadYaml['short-title'] || squadYaml.name || folderName;
      const description = squadYaml.description || '';
      const color = SQUAD_COLORS[folderName] || '#6366f1';

      // Upsert squad
      const squad = await prisma.squad.upsert({
        where: { id: folderName },
        update: { name: squadName, description, color },
        create: { id: folderName, name: squadName, description, color },
      });

      // Importa agentes
      const agentFiles = squadYaml.components?.agents || [];
      const agentsDir = path.join(squadDir, 'agents');
      let agentCount = 0;

      for (let i = 0; i < agentFiles.length; i++) {
        const agentFile = agentFiles[i];
        const agentPath = path.join(agentsDir, agentFile);
        if (!fs.existsSync(agentPath)) continue;

        const agentMd = fs.readFileSync(agentPath, 'utf-8');
        const agentId = `${folderName}__${agentFile.replace('.md', '')}`;

        // Extrai nome do agente do arquivo
        const nameMatch = agentMd.match(/# (.+)/);
        const agentName = nameMatch ? nameMatch[1].trim() : agentFile.replace('.md', '');

        const systemPrompt = extractSystemPrompt(agentMd);
        const avatar = AGENT_AVATARS[i % AGENT_AVATARS.length];

        await prisma.agent.upsert({
          where: { id: agentId },
          update: { name: agentName, systemPrompt, avatar, squadId: squad.id },
          create: {
            id: agentId,
            name: agentName,
            avatar,
            systemPrompt,
            description: `Agente da squad ${squadName}`,
            squadId: squad.id,
            config: JSON.stringify({ model: 'claude-sonnet-4-6', temperature: 0.7, maxTokens: 2048 }),
          },
        });
        agentCount++;
      }

      results.push({ squad: squadName, agents: agentCount, status: 'ok' });
    }

    return NextResponse.json({ imported: results.length, results });
  } catch (error: unknown) {
    console.error('[squads/import]', error);
    const msg = error instanceof Error ? error.message : 'Erro interno';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  // Lista squads já importadas
  const squads = await prisma.squad.findMany({
    include: { _count: { select: { agents: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ squads });
}
