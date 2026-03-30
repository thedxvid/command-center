import Firecrawl from '@mendable/firecrawl-js';

let _firecrawl: Firecrawl | null = null;

export function getFirecrawl(): Firecrawl {
  if (!process.env.FIRECRAWL_API_KEY) {
    throw new Error('FIRECRAWL_API_KEY não configurada');
  }
  if (!_firecrawl) {
    _firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
  }
  return _firecrawl;
}
