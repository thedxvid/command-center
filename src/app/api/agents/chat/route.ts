import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { agentId, message, conversationId, systemPrompt, model = 'claude-sonnet-4-6' } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'message obrigatório' }, { status: 400 });
    }

    // Busca histórico da conversa se existir
    let history: { role: 'user' | 'assistant'; content: string }[] = [];
    if (conversationId) {
      const msgs = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        take: 20,
      });
      history = msgs
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    }

    // Salva mensagem do usuário
    let activeConversationId = conversationId;
    if (!activeConversationId && agentId) {
      const conv = await prisma.conversation.create({
        data: { agentId, title: message.slice(0, 60) },
      });
      activeConversationId = conv.id;
    }

    if (activeConversationId) {
      await prisma.message.create({
        data: {
          conversationId: activeConversationId,
          role: 'user',
          content: message,
          agentId,
        },
      });
    }

    // Streaming response
    const stream = anthropic.messages.stream({
      model,
      max_tokens: 2048,
      system: systemPrompt || 'Você é um assistente útil e direto.',
      messages: [...history, { role: 'user', content: message }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let fullText = '';
        const startTime = Date.now();

        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            fullText += chunk.delta.text;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`));
          }
        }

        const finalMsg = await stream.finalMessage();
        const latencyMs = Date.now() - startTime;
        const tokensUsed = finalMsg.usage.output_tokens;

        // Salva resposta do agente
        if (activeConversationId) {
          await prisma.message.create({
            data: {
              conversationId: activeConversationId,
              role: 'assistant',
              content: fullText,
              agentId,
              metadata: JSON.stringify({ tokensUsed, latencyMs, model }),
            },
          });
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ done: true, conversationId: activeConversationId, tokensUsed, latencyMs })}\n\n`
          )
        );
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
    console.error('[agents/chat]', error);
    const msg = error instanceof Error ? error.message : 'Erro interno';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
