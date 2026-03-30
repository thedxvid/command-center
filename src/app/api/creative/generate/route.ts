import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Nano Banana 2 > Nano Banana Pro > Nano Banana > Gemini 2.0 Flash
const IMAGE_MODELS = [
  'gemini-3.1-flash-image-preview',
  'gemini-3-pro-image-preview',
  'gemini-2.5-flash-image',
  'gemini-2.0-flash',
];

function getGeminiUrl(model: string) {
  return `${GEMINI_BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`;
}

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY não configurada' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const prompt = formData.get('prompt') as string;
    const type = formData.get('type') as string;
    const brandingContext = formData.get('brandingContext') as string | null;
    const referenceImages = formData.getAll('referenceImages') as File[];

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt é obrigatório' }, { status: 400 });
    }

    // Build the full prompt with branding context
    let fullPrompt = buildCreativePrompt(prompt, type, brandingContext);

    // Build the request parts
    const parts: Array<Record<string, unknown>> = [];

    // Add reference images if provided
    for (const file of referenceImages) {
      if (file.size > 0) {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        parts.push({
          inlineData: {
            mimeType: file.type,
            data: base64,
          },
        });
        fullPrompt += '\n\nUse a imagem de referência acima como inspiração visual para o criativo.';
      }
    }

    parts.push({ text: fullPrompt });

    // Try each model in order until one succeeds
    let data: Record<string, unknown> | null = null;
    let lastError = '';

    for (const model of IMAGE_MODELS) {
      const response = await fetch(getGeminiUrl(model), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        }),
      });

      if (response.ok) {
        data = await response.json();
        break;
      }

      const errorBody = await response.text();
      console.error(`Gemini model ${model} failed:`, errorBody);

      // If rate limited, try next model
      if (response.status === 429) {
        lastError = `Cota excedida para ${model}`;
        continue;
      }

      // For other errors, still try next model
      lastError = `Erro ${response.status} no modelo ${model}`;
    }

    if (!data) {
      return NextResponse.json(
        { error: lastError || 'Todos os modelos falharam. Tente novamente em alguns segundos.' },
        { status: 429 }
      );
    }

    // Extract images and text from response
    const result = parseGeminiResponse(data);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Creative generation error:', error);
    const message = error instanceof Error ? error.message : 'Erro ao gerar criativo';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildCreativePrompt(
  prompt: string,
  type: string,
  brandingContext: string | null
): string {
  const typeInstructions: Record<string, string> = {
    carousel:
      'Crie uma imagem para um slide de carrossel do Instagram. Design limpo, tipografia marcante, visualmente impactante. Formato quadrado (1:1).',
    ad_creative:
      'Crie um criativo de anúncio para redes sociais. Deve ser chamativo, com hierarquia visual clara e CTA implícito. Formato 1:1 ou 4:5.',
    script:
      'Crie uma thumbnail ou capa visual para um roteiro de vídeo. Estilo cinematográfico, com título em destaque.',
    viral_content:
      'Crie uma imagem para conteúdo viral de redes sociais. Deve gerar curiosidade, ser compartilhável e parar o scroll.',
  };

  let fullPrompt = `TAREFA: Gerar criativo visual profissional.\n\n`;
  fullPrompt += `TIPO: ${typeInstructions[type] || typeInstructions.carousel}\n\n`;

  if (brandingContext) {
    try {
      const branding = JSON.parse(brandingContext);
      fullPrompt += `CONTEXTO DE BRANDING:\n`;
      if (branding.colors) fullPrompt += `- Cores: ${branding.colors}\n`;
      if (branding.fonts) fullPrompt += `- Tipografia: ${branding.fonts}\n`;
      if (branding.tone) fullPrompt += `- Tom de voz: ${branding.tone}\n`;
      if (branding.audience) fullPrompt += `- Público-alvo: ${branding.audience}\n`;
      if (branding.references) fullPrompt += `- Referências visuais: ${branding.references}\n`;
      if (branding.extraNotes) fullPrompt += `- Notas extras: ${branding.extraNotes}\n`;
      fullPrompt += '\n';
    } catch {
      fullPrompt += `CONTEXTO: ${brandingContext}\n\n`;
    }
  }

  fullPrompt += `PEDIDO DO USUÁRIO: ${prompt}\n\n`;
  fullPrompt += `IMPORTANTE: Gere uma imagem de alta qualidade, profissional, pronta para publicação. Sem textos com erros ortográficos. Se incluir texto, use português brasileiro.`;

  return fullPrompt;
}

function parseGeminiResponse(data: Record<string, unknown>): {
  images: string[];
  text: string;
} {
  const images: string[] = [];
  let text = '';

  const candidates = data.candidates as Array<{
    content?: { parts?: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> };
  }>;

  if (candidates) {
    for (const candidate of candidates) {
      const parts = candidate.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.text) {
          text += part.text;
        }
        if (part.inlineData) {
          const dataUri = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          images.push(dataUri);
        }
      }
    }
  }

  return { images, text };
}
