import { getLogger } from '../utils/logger';
import type { CrawlerOutput, URLMap, AgentResult } from '../types';

const log = getLogger();

/**
 * URL Mapper Agent - Phase 1 Discovery
 * Categorizes URLs into priority groups and endpoint types
 */
export default class URLMapperAgent {
  private crawlerOutput: CrawlerOutput;

  constructor(crawlerOutput: CrawlerOutput) {
    this.crawlerOutput = crawlerOutput;
  }

  /**
   * Execute the URL mapper agent
   */
  async execute(): Promise<AgentResult<URLMap>> {
    const startTime = Date.now();
    log.info('Starting URL Mapper Agent', { totalUrls: this.crawlerOutput.urls.length }, 'url-mapper');

    try {
      const urlMap = await this.categorizeUrls();
      const duration = Date.now() - startTime;

      log.success(
        `URL Mapper completed successfully`,
        {
          duration: `${duration}ms`,
          priority1: urlMap.priority1.length,
          priority2: urlMap.priority2.length,
          priority3: urlMap.priority3.length,
          apiEndpoints: urlMap.apiEndpoints.length,
          confidence: urlMap.confidence
        },
        'url-mapper'
      );

      return {
        success: true,
        data: urlMap,
        confidence: urlMap.confidence,
        timestamp: new Date()
      };
    } catch (error: any) {
      log.error('URL Mapper Agent failed', error.message, 'url-mapper');

      return {
        success: false,
        error: error.message,
        confidence: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Categorize URLs into priority groups
   */
  private async categorizeUrls(): Promise<URLMap> {
    const priority1: string[] = [];
    const priority2: string[] = [];
    const priority3: string[] = [];
    const apiEndpoints: string[] = [];
    const assetPaths: string[] = [];

    this.crawlerOutput.urls.forEach(url => {
      const type = this.crawlerOutput.pageTypes[url];

      switch (type) {
        case 'homepage':
        case 'room':
          priority1.push(url);
          break;

        case 'about':
        case 'contact':
        case 'application':
          priority2.push(url);
          break;

        case 'legal':
          priority3.push(url);
          break;

        case 'api':
          apiEndpoints.push(url);
          break;

        case 'asset':
          assetPaths.push(url);
          break;

        case 'content':
          // Categorize by URL pattern
          if (this.isPriority1Pattern(url)) {
            priority1.push(url);
          } else if (this.isPriority2Pattern(url)) {
            priority2.push(url);
          } else {
            priority3.push(url);
          }
          break;
      }
    });

    const coverage = this.calculateCoverage(priority1, priority2, priority3);
    const confidence = this.calculateConfidence(priority1, priority2, priority3, coverage);

    return {
      priority1: this.sortByPriority(priority1),
      priority2: this.sortByPriority(priority2),
      priority3: this.sortByPriority(priority3),
      apiEndpoints: this.sortByPriority(apiEndpoints),
      assetPaths: this.sortByPriority(assetPaths),
      confidence,
      coverage,
      timestamp: new Date()
    };
  }

  /**
   * Check if URL matches priority 1 pattern
   */
  private isPriority1Pattern(url: string): boolean {
    const path = new URL(url).pathname.toLowerCase();
    const priority1Patterns = [
      '/',
      '/rooms',
      '/zimmer',
      '/home',
      '/index'
    ];

    return priority1Patterns.some(pattern => path === pattern || path.startsWith(pattern + '/'));
  }

  /**
   * Check if URL matches priority 2 pattern
   */
  private isPriority2Pattern(url: string): boolean {
    const path = new URL(url).pathname.toLowerCase();
    const priority2Patterns = [
      '/about',
      '/uber',
      '/features',
      '/services',
      '/contact',
      '/kontakt',
      '/apply',
      '/bewerben',
      '/faq'
    ];

    return priority2Patterns.some(pattern => path === pattern || path.startsWith(pattern + '/'));
  }

  /**
   * Sort URLs by priority (homepage first, then alphabetically)
   */
  private sortByPriority(urls: string[]): string[] {
    return urls.sort((a, b) => {
      const pathA = new URL(a).pathname;
      const pathB = new URL(b).pathname;

      // Homepage always first
      if (pathA === '/' || pathA === '') return -1;
      if (pathB === '/' || pathB === '') return 1;

      // Then alphabetically
      return pathA.localeCompare(pathB);
    });
  }

  /**
   * Calculate coverage score
   */
  private calculateCoverage(priority1: string[], priority2: string[], priority3: string[]): number {
    const totalCategorized = priority1.length + priority2.length + priority3.length;
    const totalUrls = this.crawlerOutput.urls.filter(url => {
      const type = this.crawlerOutput.pageTypes[url];
      return type !== 'asset' && type !== 'api';
    }).length;

    return totalUrls > 0 ? totalCategorized / totalUrls : 0;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(priority1: string[], priority2: string[], priority3: string[], coverage: number): number {
    let score = 0;

    // Priority 1 completeness (40%)
    const hasPriority1 = priority1.length > 0;
    const hasMultiplePriority1 = priority1.length >= 2;
    score += hasPriority1 ? 0.2 : 0;
    score += hasMultiplePriority1 ? 0.2 : 0;

    // Priority 2 completeness (30%)
    const hasPriority2 = priority2.length > 0;
    const hasMultiplePriority2 = priority2.length >= 3;
    score += hasPriority2 ? 0.15 : 0;
    score += hasMultiplePriority2 ? 0.15 : 0;

    // Priority 3 completeness (10%)
    const hasPriority3 = priority3.length > 0;
    score += hasPriority3 ? 0.1 : 0;

    // Coverage (20%)
    score += coverage * 0.2;

    return Math.min(score, 1.0);
  }
}
