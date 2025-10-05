import { FirecrawlClient } from '../utils/firecrawl-client';
import { getLogger } from '../utils/logger';
import type { URLMap, StructureMap, ComponentPattern, AgentResult } from '../types';

const log = getLogger();

interface StructureAnalyzerConfig {
  maxUrlsToAnalyze?: number;
  concurrency?: number;
}

/**
 * Structure Analyzer Agent - Phase 1 Discovery
 * Analyzes DOM structure and identifies component patterns
 */
export default class StructureAnalyzerAgent {
  private client: FirecrawlClient;
  private urlMap: URLMap;
  private config: StructureAnalyzerConfig;

  constructor(client: FirecrawlClient, urlMap: URLMap, config: StructureAnalyzerConfig = {}) {
    this.client = client;
    this.urlMap = urlMap;
    this.config = {
      maxUrlsToAnalyze: 10,
      concurrency: 3,
      ...config
    };
  }

  /**
   * Execute the structure analyzer agent
   */
  async execute(): Promise<AgentResult<StructureMap>> {
    const startTime = Date.now();
    log.info('Starting Structure Analyzer Agent', { maxUrls: this.config.maxUrlsToAnalyze }, 'structure-analyzer');

    try {
      const structureMap = await this.analyzeStructure();
      const duration = Date.now() - startTime;

      log.success(
        `Structure Analyzer completed successfully`,
        {
          duration: `${duration}ms`,
          roomCards: structureMap.components.roomCards.length,
          navigation: structureMap.components.navigation.length,
          confidence: structureMap.confidence
        },
        'structure-analyzer'
      );

      return {
        success: true,
        data: structureMap,
        confidence: structureMap.confidence,
        timestamp: new Date()
      };
    } catch (error: any) {
      log.error('Structure Analyzer Agent failed', error.message, 'structure-analyzer');

      return {
        success: false,
        error: error.message,
        confidence: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Analyze structure of priority URLs
   */
  private async analyzeStructure(): Promise<StructureMap> {
    // Select URLs to analyze (prioritize priority1)
    const urlsToAnalyze = [
      ...this.urlMap.priority1.slice(0, 5),
      ...this.urlMap.priority2.slice(0, 3),
      ...this.urlMap.priority3.slice(0, 2)
    ].slice(0, this.config.maxUrlsToAnalyze);

    log.info(`Analyzing ${urlsToAnalyze.length} URLs for structure`, undefined, 'structure-analyzer');

    // Scrape URLs for HTML content
    const scrapeResults = await this.client.scrapeMultiple(
      urlsToAnalyze,
      { formats: ['html', 'rawHtml'], onlyMainContent: false },
      this.config.concurrency
    );

    // Analyze patterns
    const roomCards = this.findRoomCardPatterns(scrapeResults);
    const navigation = this.findNavigationPatterns(scrapeResults);
    const forms = this.findFormPatterns(scrapeResults);
    const contentSections = this.findContentSectionPatterns(scrapeResults);
    const layout = this.analyzeLayout(scrapeResults);

    const confidence = this.calculateConfidence(roomCards, navigation, forms, contentSections);

    return {
      components: {
        roomCards,
        navigation,
        forms,
        contentSections
      },
      layout,
      confidence,
      timestamp: new Date()
    };
  }

  /**
   * Find room card component patterns
   */
  private findRoomCardPatterns(scrapeResults: any[]): ComponentPattern[] {
    const patterns: ComponentPattern[] = [];

    scrapeResults.forEach(result => {
      const html = result.html || result.rawHtml || '';

      // Common room card patterns
      const selectors = [
        { selector: '.room-card', type: 'class', regex: /class="[^"]*room-card[^"]*"/g },
        { selector: '.listing-card', type: 'class', regex: /class="[^"]*listing-card[^"]*"/g },
        { selector: '[data-room]', type: 'attribute', regex: /data-room="[^"]*"/g },
        { selector: '.card', type: 'class', regex: /class="[^"]*card[^"]*"/g }
      ];

      selectors.forEach(({ selector, type, regex }) => {
        const matches = html.match(regex);
        if (matches && matches.length > 0) {
          const confidence = this.calculateSelectorConfidence(matches.length, type);

          patterns.push({
            selector,
            type: 'room-card',
            confidence,
            attributes: {
              occurrences: matches.length,
              matchType: type,
              url: result.url
            }
          });
        }
      });
    });

    return this.deduplicatePatterns(patterns);
  }

  /**
   * Find navigation component patterns
   */
  private findNavigationPatterns(scrapeResults: any[]): ComponentPattern[] {
    const patterns: ComponentPattern[] = [];

    scrapeResults.forEach(result => {
      const html = result.html || result.rawHtml || '';

      const selectors = [
        { selector: 'nav', type: 'element', regex: /<nav[^>]*>/g },
        { selector: '.navbar', type: 'class', regex: /class="[^"]*navbar[^"]*"/g },
        { selector: '.navigation', type: 'class', regex: /class="[^"]*navigation[^"]*"/g },
        { selector: 'header nav', type: 'nested', regex: /<header[^>]*>[\s\S]*?<nav/g }
      ];

      selectors.forEach(({ selector, type, regex }) => {
        const matches = html.match(regex);
        if (matches && matches.length > 0) {
          const confidence = this.calculateSelectorConfidence(matches.length, type);

          patterns.push({
            selector,
            type: 'navigation',
            confidence,
            attributes: {
              occurrences: matches.length,
              matchType: type,
              url: result.url
            }
          });
        }
      });
    });

    return this.deduplicatePatterns(patterns);
  }

  /**
   * Find form component patterns
   */
  private findFormPatterns(scrapeResults: any[]): ComponentPattern[] {
    const patterns: ComponentPattern[] = [];

    scrapeResults.forEach(result => {
      const html = result.html || result.rawHtml || '';

      const selectors = [
        { selector: 'form', type: 'element', regex: /<form[^>]*>/g },
        { selector: '.application-form', type: 'class', regex: /class="[^"]*application-form[^"]*"/g },
        { selector: '.contact-form', type: 'class', regex: /class="[^"]*contact-form[^"]*"/g }
      ];

      selectors.forEach(({ selector, type, regex }) => {
        const matches = html.match(regex);
        if (matches && matches.length > 0) {
          const confidence = this.calculateSelectorConfidence(matches.length, type);

          patterns.push({
            selector,
            type: 'form',
            confidence,
            attributes: {
              occurrences: matches.length,
              matchType: type,
              url: result.url
            }
          });
        }
      });
    });

    return this.deduplicatePatterns(patterns);
  }

  /**
   * Find content section patterns
   */
  private findContentSectionPatterns(scrapeResults: any[]): ComponentPattern[] {
    const patterns: ComponentPattern[] = [];

    scrapeResults.forEach(result => {
      const html = result.html || result.rawHtml || '';

      const selectors = [
        { selector: 'section', type: 'element', regex: /<section[^>]*>/g },
        { selector: '.section', type: 'class', regex: /class="[^"]*section[^"]*"/g },
        { selector: 'main', type: 'element', regex: /<main[^>]*>/g },
        { selector: '.container', type: 'class', regex: /class="[^"]*container[^"]*"/g }
      ];

      selectors.forEach(({ selector, type, regex }) => {
        const matches = html.match(regex);
        if (matches && matches.length > 0) {
          const confidence = this.calculateSelectorConfidence(matches.length, type);

          patterns.push({
            selector,
            type: 'content-section',
            confidence,
            attributes: {
              occurrences: matches.length,
              matchType: type,
              url: result.url
            }
          });
        }
      });
    });

    return this.deduplicatePatterns(patterns);
  }

  /**
   * Analyze layout patterns
   */
  private analyzeLayout(scrapeResults: any[]): StructureMap['layout'] {
    const html = scrapeResults.map(r => r.html || r.rawHtml || '').join('');

    const hasGrid = /grid|grid-template|display:\s*grid/i.test(html);
    const hasFlex = /flex|display:\s*flex/i.test(html);
    const hasResponsive = /responsive|media|@media|breakpoint/i.test(html);
    const hasTailwind = /class="[^"]*(?:sm:|md:|lg:|xl:)/i.test(html);

    const breakpoints: string[] = [];
    if (hasTailwind) {
      breakpoints.push('sm:640px', 'md:768px', 'lg:1024px', 'xl:1280px');
    }

    return {
      gridSystem: hasGrid ? 'CSS Grid' : hasFlex ? 'Flexbox' : undefined,
      responsive: hasResponsive || hasTailwind,
      breakpoints: breakpoints.length > 0 ? breakpoints : undefined
    };
  }

  /**
   * Calculate selector confidence score
   */
  private calculateSelectorConfidence(occurrences: number, matchType: string): number {
    let score = 0;

    // Base score from match type
    switch (matchType) {
      case 'element':
        score = 0.9;
        break;
      case 'class':
        score = 0.8;
        break;
      case 'attribute':
        score = 0.7;
        break;
      case 'nested':
        score = 0.85;
        break;
      default:
        score = 0.5;
    }

    // Boost for multiple occurrences
    if (occurrences >= 3) score += 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Deduplicate patterns by selector
   */
  private deduplicatePatterns(patterns: ComponentPattern[]): ComponentPattern[] {
    const seen = new Map<string, ComponentPattern>();

    patterns.forEach(pattern => {
      const existing = seen.get(pattern.selector);

      if (!existing || pattern.confidence > existing.confidence) {
        seen.set(pattern.selector, pattern);
      }
    });

    return Array.from(seen.values()).sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate overall confidence score
   */
  private calculateConfidence(
    roomCards: ComponentPattern[],
    navigation: ComponentPattern[],
    forms: ComponentPattern[],
    contentSections: ComponentPattern[]
  ): number {
    let score = 0;

    // Room cards found (40%)
    if (roomCards.length > 0) {
      const avgConfidence = roomCards.reduce((sum, p) => sum + p.confidence, 0) / roomCards.length;
      score += avgConfidence * 0.4;
    }

    // Navigation found (30%)
    if (navigation.length > 0) {
      const avgConfidence = navigation.reduce((sum, p) => sum + p.confidence, 0) / navigation.length;
      score += avgConfidence * 0.3;
    }

    // Forms found (15%)
    if (forms.length > 0) {
      const avgConfidence = forms.reduce((sum, p) => sum + p.confidence, 0) / forms.length;
      score += avgConfidence * 0.15;
    }

    // Content sections found (15%)
    if (contentSections.length > 0) {
      const avgConfidence = contentSections.reduce((sum, p) => sum + p.confidence, 0) / contentSections.length;
      score += avgConfidence * 0.15;
    }

    return Math.min(score, 1.0);
  }
}
