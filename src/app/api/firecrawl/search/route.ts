import { NextRequest, NextResponse } from 'next/server';
import { getFirecrawl } from '@/lib/firecrawl';

export async function POST(req: NextRequest) {
  try {
    const { query, limit = 5 } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query é obrigatória' }, { status: 400 });
    }

    const result = await getFirecrawl().search(query, { limit });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
