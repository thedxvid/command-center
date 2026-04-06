import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { squadId, message, conversationId, model = 'claude-sonnet-4-6' } = await req.json();

    if (!squadId || !message) {
      return NextResponse.json({ error: 'squadId e message obrigatórios' }, { status: 400 });
    }

    // Busca squad + agentes do DB
    const squad = await prisma.squad.findUnique({
      where: { id: squadId },
      include: { agents: true },
    });

    if (!squad) {
      return NextResponse.json({ error: 'Squad não encontrada' }, { status: 404 });
    }

    // Cria conversa se não existir
    let activeConversationId = conversationId;
    if (!activeConversationId) {
      const conv = await prisma.conversation.create({
        data: { squadId, title: message.slice(0, 60) },
      });
      activeConversationId = conv.id;
    }

    // Salva mensagem do usuário
    await prisma.message.create({
      data: {
        conversationId: activeConversationId,
        role: 'user',
        content: message,
      },
    });

    // Cada agente responde em sequência (pipeline)
    const encoder = new TextEncoder();
    const agentsToRun = squad.agents.slice(0, 4); // máx 4 agentes por request

    const readable = new ReadableStream({
      async start(controller) {
        const send = (data: object) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

        for (const agent of agentsToRun) {
          const agentConfig = (() => {
            try { return JSON.parse(agent.config); } catch { return {}; }
          })();

          send({ agentStart: { id: agent.id, name: agent.name, avatar: agent.avatar } });

          let agentText = '';
          const startTime = Date.now();

          const stream = anthropic.messages.stream({
            model: agentConfig.model || model,
            max_tokens: 1024,
            system: agent.systemPrompt,
            messages: [{ role: 'user', content: message }],
          });

          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              agentText += chunk.delta.text;
              send({ agentId: agent.id, text: chunk.delta.text });
            }
          }

          const finalMsg = await stream.finalMessage();
          const latencyMs = Date.now() - startTime;
          const tokensUsed = finalMsg.usage.output_tokens;

          // Salva resposta de cada agente
          await prisma.message.create({
            data: {
              conversationId: activeConversationId,
              role: 'assistant',
              content: agentText,
              agentId: agent.id,
              metadata: JSON.stringify({
                tokensUsed,
                latencyMs,
                model: agentConfig.model || model,
                agentName: agent.name,
                agentAvatar: agent.avatar,
              }),
            },
          });

          send({ agentDone: { id: agent.id, tokensUsed, latencyMs } });
        }

        send({ done: true, conversationId: activeConversationId });
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error('[squads/chat]', error);
    const msg = error instanceof Error ? error.message : 'Erro interno';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
