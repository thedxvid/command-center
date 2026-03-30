import { NextRequest, NextResponse } from 'next/server';
import { firecrawl } from '@/lib/firecrawl';

export async function POST(req: NextRequest) {
  try {
    const { url, formats = ['markdown'] } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });
    }

    const result = await firecrawl.scrape(url, { formats });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao fazer scrape';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
