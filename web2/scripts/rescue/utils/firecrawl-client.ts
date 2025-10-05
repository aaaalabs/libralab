/**
 * Firecrawl API client wrapper
 */

interface FirecrawlMapOptions {
  maxDepth?: number;
  limit?: number;
}

interface FirecrawlScrapeOptions {
  formats?: string[];
  onlyMainContent?: boolean;
}

interface FirecrawlMapResult {
  links: string[];
}

interface FirecrawlScrapeResult {
  content?: string;
  html?: string;
  markdown?: string;
  links?: string[];
  metadata?: Record<string, any>;
}

export class FirecrawlClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.firecrawl.dev/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async map(url: string, options: FirecrawlMapOptions = {}): Promise<FirecrawlMapResult> {
    const response = await fetch(`${this.baseUrl}/map`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        ...options
      })
    });

    if (!response.ok) {
      throw new Error(`Firecrawl map failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async scrape(url: string, options: FirecrawlScrapeOptions = {}): Promise<FirecrawlScrapeResult> {
    const response = await fetch(`${this.baseUrl}/scrape`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        formats: options.formats || ['html', 'markdown'],
        onlyMainContent: options.onlyMainContent ?? true
      })
    });

    if (!response.ok) {
      throw new Error(`Firecrawl scrape failed: ${response.statusText}`);
    }

    return await response.json();
  }
}
