import { NextRequest, NextResponse } from 'next/server';
import { firecrawl } from '@/lib/firecrawl';

export async function POST(req: NextRequest) {
  try {
    const { url, search } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });
    }

    const result = await firecrawl.map(url, { search });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao mapear URLs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
