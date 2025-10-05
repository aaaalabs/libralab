import { FirecrawlClient } from '../utils/firecrawl-client';
import { getLogger } from '../utils/logger';
import type { CrawlerOutput, AgentResult } from '../types';

const log = getLogger();

interface CrawlerConfig {
  baseUrl: string;
  maxDepth?: number;
  limit?: number;
  timeout?: number;
}

/**
 * Crawler Agent - Phase 1 Discovery
 * Maps the production website and discovers all URLs
 */
export default class CrawlerAgent {
  private client: FirecrawlClient;
  private config: CrawlerConfig;

  constructor(client: FirecrawlClient, config: CrawlerConfig) {
    this.client = client;
    this.config = {
      maxDepth: 3,
      limit: 100,
      timeout: 30000,
      ...config
    };
  }

  /**
   * Execute the crawler agent
   */
  async execute(): Promise<AgentResult<CrawlerOutput>> {
    const startTime = Date.now();
    log.info('Starting Crawler Agent', { baseUrl: this.config.baseUrl }, 'crawler');

    try {
      // Strategy 1: Use Firecrawl map
      const output = await this.crawlWithFirecrawl();

      if (output.urls.length > 0) {
        const duration = Date.now() - startTime;
        log.success(
          `Crawler completed successfully: ${output.urls.length} URLs discovered`,
          { duration: `${duration}ms`, confidence: output.confidence },
          'crawler'
        );

        return {
          success: true,
          data: output,
          confidence: output.confidence,
          timestamp: new Date()
        };
      }

      // Strategy 2: Fallback to basic scraping
      log.warn('Firecrawl map returned no URLs, falling back to basic scraping', undefined, 'crawler');
      const fallbackOutput = await this.fallbackCrawl();

      return {
        success: true,
        data: fallbackOutput,
        confidence: fallbackOutput.confidence,
        timestamp: new Date()
      };
    } catch (error: any) {
      log.error('Crawler Agent failed', error.message, 'crawler');

      return {
        success: false,
        error: error.message,
        confidence: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Primary crawl strategy using Firecrawl map
   */
  private async crawlWithFirecrawl(): Promise<CrawlerOutput> {
    log.info('Using Firecrawl map strategy', undefined, 'crawler');

    const mapResult = await this.client.map(this.config.baseUrl, {
      maxDepth: this.config.maxDepth,
      limit: this.config.limit
    });

    const urls = mapResult.links;
    const pageTypes = this.categorizeUrls(urls);
    const sitemap = this.generateSitemap(urls);
    const confidence = this.calculateConfidence(urls, pageTypes);

    return {
      urls,
      sitemap,
      pageTypes,
      confidence,
      timestamp: new Date()
    };
  }

  /**
   * Fallback crawl strategy using basic scraping
   */
  private async fallbackCrawl(): Promise<CrawlerOutput> {
    log.info('Using fallback scraping strategy', undefined, 'crawler');

    const scrapeResult = await this.client.scrape(this.config.baseUrl, {
      formats: ['links', 'html'],
      onlyMainContent: false
    });

    const urls = scrapeResult.links || [this.config.baseUrl];
    const pageTypes = this.categorizeUrls(urls);
    const sitemap = this.generateSitemap(urls);
    const confidence = this.calculateConfidence(urls, pageTypes) * 0.7; // Lower confidence for fallback

    return {
      urls,
      sitemap,
      pageTypes,
      confidence,
      timestamp: new Date()
    };
  }

  /**
   * Categorize URLs by type
   */
  private categorizeUrls(urls: string[]): Record<string, string> {
    const types: Record<string, string> = {};

    urls.forEach(url => {
      const path = new URL(url).pathname;

      if (path === '/' || path === '') {
        types[url] = 'homepage';
      } else if (path.includes('/rooms') || path.includes('/zimmer')) {
        types[url] = 'room';
      } else if (path.includes('/about') || path.includes('/uber')) {
        types[url] = 'about';
      } else if (path.includes('/contact') || path.includes('/kontakt')) {
        types[url] = 'contact';
      } else if (path.includes('/apply') || path.includes('/bewerben')) {
        types[url] = 'application';
      } else if (path.includes('/terms') || path.includes('/agb') || path.includes('/privacy') || path.includes('/datenschutz')) {
        types[url] = 'legal';
      } else if (path.includes('/api/')) {
        types[url] = 'api';
      } else if (this.isAssetPath(path)) {
        types[url] = 'asset';
      } else {
        types[url] = 'content';
      }
    });

    return types;
  }

  /**
   * Check if path is an asset
   */
  private isAssetPath(path: string): boolean {
    const assetExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.css', '.js', '.woff', '.woff2', '.ttf'];
    return assetExtensions.some(ext => path.toLowerCase().endsWith(ext));
  }

  /**
   * Generate sitemap structure
   */
  private generateSitemap(urls: string[]): string[] {
    const sitemap = urls
      .filter(url => !this.isAssetPath(new URL(url).pathname))
      .sort((a, b) => {
        const pathA = new URL(a).pathname;
        const pathB = new URL(b).pathname;
        return pathA.localeCompare(pathB);
      });

    return sitemap;
  }

  /**
   * Calculate confidence score based on completeness
   */
  private calculateConfidence(urls: string[], pageTypes: Record<string, string>): number {
    const typeValues = Object.values(pageTypes);
    const hasHomepage = typeValues.includes('homepage');
    const hasRooms = typeValues.includes('room');
    const hasAbout = typeValues.includes('about');
    const hasContact = typeValues.includes('contact');
    const hasLegal = typeValues.includes('legal');

    let score = 0;
    if (hasHomepage) score += 0.3;
    if (hasRooms) score += 0.3;
    if (hasAbout) score += 0.15;
    if (hasContact) score += 0.1;
    if (hasLegal) score += 0.05;

    // Additional points for quantity
    if (urls.length >= 10) score += 0.1;

    return Math.min(score, 1.0);
  }
}
