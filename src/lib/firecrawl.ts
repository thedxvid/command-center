import Firecrawl from '@mendable/firecrawl-js';

if (!process.env.FIRECRAWL_API_KEY) {
  throw new Error('FIRECRAWL_API_KEY não configurada');
}

export const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY,
});
