import { FirecrawlClient } from '../utils/firecrawl-client';
import { getLogger } from '../utils/logger';
import { load as cheerioLoad } from 'cheerio';
import type { StructureMap, URLMap, ParsedContent, AgentResult } from '../types';

const log = getLogger();

interface ContentParserConfig {
  firecrawlApiKey: string;
  maxConcurrent?: number;
}

/**
 * Content Parser Agent - Phase 2 Extraction
 * Scrapes priority URLs and extracts room data, text content, and metrics
 */
export default class ContentParserAgent {
  private client: FirecrawlClient;
  private config: ContentParserConfig;

  constructor(config: ContentParserConfig) {
    this.client = new FirecrawlClient(config.firecrawlApiKey);
    this.config = {
      maxConcurrent: 5,
      ...config
    };
  }

  /**
   * Execute the content parser agent
   */
  async execute(structureMap: StructureMap, urlMap: URLMap): Promise<AgentResult<ParsedContent>> {
    const startTime = Date.now();
    log.info('Starting Content Parser Agent', { urls: urlMap.priority1.length }, 'content-parser');

    try {
      // Strategy 1: Try API-based extraction
      const apiResult = await this.tryApiExtraction(urlMap);
      if (apiResult && apiResult.rooms.length > 0) {
        log.success('API extraction successful', { rooms: apiResult.rooms.length }, 'content-parser');
        return {
          success: true,
          data: apiResult,
          confidence: apiResult.confidence,
          timestamp: new Date()
        };
      }

      // Strategy 2: Structured content extraction
      const structuredResult = await this.tryStructuredExtraction(structureMap, urlMap);
      if (structuredResult && structuredResult.rooms.length > 0) {
        log.success('Structured extraction successful', { rooms: structuredResult.rooms.length }, 'content-parser');
        return {
          success: true,
          data: structuredResult,
          confidence: structuredResult.confidence,
          timestamp: new Date()
        };
      }

      // Strategy 3: Markdown-based extraction
      const markdownResult = await this.tryMarkdownExtraction(urlMap);
      if (markdownResult && markdownResult.rooms.length > 0) {
        log.success('Markdown extraction successful', { rooms: markdownResult.rooms.length }, 'content-parser');
        return {
          success: true,
          data: markdownResult,
          confidence: markdownResult.confidence,
          timestamp: new Date()
        };
      }

      // Strategy 4: DOM-based extraction
      const domResult = await this.tryDomExtraction(structureMap, urlMap);
      if (domResult && domResult.rooms.length > 0) {
        log.success('DOM extraction successful', { rooms: domResult.rooms.length }, 'content-parser');
        return {
          success: true,
          data: domResult,
          confidence: domResult.confidence,
          timestamp: new Date()
        };
      }

      // Strategy 5: Fallback basic extraction
      log.warn('All extraction strategies failed, using fallback', undefined, 'content-parser');
      const fallbackResult = await this.fallbackExtraction(urlMap);

      return {
        success: true,
        data: fallbackResult,
        confidence: fallbackResult.confidence,
        timestamp: new Date()
      };
    } catch (error: any) {
      log.error('Content Parser Agent failed', error.message, 'content-parser');
      return {
        success: false,
        error: error.message,
        confidence: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Strategy 1: Try API-based extraction
   */
  private async tryApiExtraction(urlMap: URLMap): Promise<ParsedContent | null> {
    log.info('Attempting API extraction', undefined, 'content-parser');

    try {
      const apiUrls = urlMap.apiEndpoints.filter(url =>
        url.includes('/api/rooms') || url.includes('/api/data')
      );

      if (apiUrls.length === 0) {
        return null;
      }

      const responses = await Promise.all(
        apiUrls.map(url => fetch(url).then(r => r.json()).catch(() => null))
      );

      const validResponses = responses.filter(r => r && Array.isArray(r.rooms));

      if (validResponses.length === 0) {
        return null;
      }

      const allRooms = validResponses.flatMap(r => r.rooms);

      return {
        rooms: allRooms,
        features: this.extractFeatures(allRooms),
        text: { en: '', de: '' },
        metrics: {
          totalRooms: allRooms.length,
          totalImages: allRooms.reduce((acc, r) => acc + (r.images?.length || 0), 0),
          contentLength: JSON.stringify(allRooms).length
        },
        confidence: 0.95,
        timestamp: new Date()
      };
    } catch (error) {
      log.warn('API extraction failed', { error }, 'content-parser');
      return null;
    }
  }

  /**
   * Strategy 2: Structured content extraction using component patterns
   */
  private async tryStructuredExtraction(structureMap: StructureMap, urlMap: URLMap): Promise<ParsedContent | null> {
    log.info('Attempting structured extraction', undefined, 'content-parser');

    try {
      const roomCardPatterns = structureMap.components.roomCards;
      if (roomCardPatterns.length === 0) {
        return null;
      }

      const rooms: any[] = [];
      const features: string[] = [];

      for (const url of urlMap.priority1.slice(0, 3)) {
        const scrapeResult = await this.client.scrape(url, {
          formats: ['html'],
          onlyMainContent: true
        });

        if (!scrapeResult.html) continue;

        const $ = cheerioLoad(scrapeResult.html);

        for (const pattern of roomCardPatterns) {
          $(pattern.selector).each((_, el) => {
            const room = this.extractRoomFromElement($, el, pattern);
            if (room) {
              rooms.push(room);
            }
          });
        }
      }

      if (rooms.length === 0) {
        return null;
      }

      return {
        rooms,
        features: this.extractFeatures(rooms),
        text: { en: '', de: '' },
        metrics: {
          totalRooms: rooms.length,
          totalImages: rooms.reduce((acc, r) => acc + (r.images?.length || 0), 0),
          contentLength: JSON.stringify(rooms).length
        },
        confidence: 0.85,
        timestamp: new Date()
      };
    } catch (error) {
      log.warn('Structured extraction failed', { error }, 'content-parser');
      return null;
    }
  }

  /**
   * Strategy 3: Markdown-based extraction
   */
  private async tryMarkdownExtraction(urlMap: URLMap): Promise<ParsedContent | null> {
    log.info('Attempting markdown extraction', undefined, 'content-parser');

    try {
      const rooms: any[] = [];
      let textEn = '';
      let textDe = '';

      for (const url of urlMap.priority1.slice(0, 3)) {
        const scrapeResult = await this.client.scrape(url, {
          formats: ['markdown'],
          onlyMainContent: true
        });

        if (!scrapeResult.markdown) continue;

        const extractedRooms = this.parseMarkdownForRooms(scrapeResult.markdown);
        rooms.push(...extractedRooms);

        if (url.includes('/en')) {
          textEn += scrapeResult.markdown;
        } else {
          textDe += scrapeResult.markdown;
        }
      }

      if (rooms.length === 0) {
        return null;
      }

      return {
        rooms,
        features: this.extractFeatures(rooms),
        text: { en: textEn, de: textDe },
        metrics: {
          totalRooms: rooms.length,
          totalImages: rooms.reduce((acc, r) => acc + (r.images?.length || 0), 0),
          contentLength: textEn.length + textDe.length
        },
        confidence: 0.75,
        timestamp: new Date()
      };
    } catch (error) {
      log.warn('Markdown extraction failed', { error }, 'content-parser');
      return null;
    }
  }

  /**
   * Strategy 4: DOM-based extraction
   */
  private async tryDomExtraction(structureMap: StructureMap, urlMap: URLMap): Promise<ParsedContent | null> {
    log.info('Attempting DOM extraction', undefined, 'content-parser');

    try {
      const rooms: any[] = [];

      for (const url of urlMap.priority1) {
        const scrapeResult = await this.client.scrape(url, {
          formats: ['html'],
          onlyMainContent: false
        });

        if (!scrapeResult.html) continue;

        const $ = cheerioLoad(scrapeResult.html);

        // Generic selectors for room data
        const selectors = [
          '.room-card', '.room', '[class*="room"]',
          '.zimmer-card', '.zimmer', '[class*="zimmer"]',
          'article', '.card'
        ];

        for (const selector of selectors) {
          $(selector).each((_, el) => {
            const room = this.extractRoomGeneric($, el);
            if (room && room.title && room.price) {
              rooms.push(room);
            }
          });

          if (rooms.length > 0) break;
        }
      }

      if (rooms.length === 0) {
        return null;
      }

      return {
        rooms,
        features: this.extractFeatures(rooms),
        text: { en: '', de: '' },
        metrics: {
          totalRooms: rooms.length,
          totalImages: rooms.reduce((acc, r) => acc + (r.images?.length || 0), 0),
          contentLength: JSON.stringify(rooms).length
        },
        confidence: 0.65,
        timestamp: new Date()
      };
    } catch (error) {
      log.warn('DOM extraction failed', { error }, 'content-parser');
      return null;
    }
  }

  /**
   * Strategy 5: Fallback extraction
   */
  private async fallbackExtraction(urlMap: URLMap): Promise<ParsedContent> {
    log.info('Using fallback extraction', undefined, 'content-parser');

    const scrapeResult = await this.client.scrape(urlMap.priority1[0], {
      formats: ['markdown', 'html'],
      onlyMainContent: true
    });

    return {
      rooms: [],
      features: [],
      text: {
        en: scrapeResult.markdown || '',
        de: scrapeResult.markdown || ''
      },
      metrics: {
        totalRooms: 0,
        totalImages: 0,
        contentLength: scrapeResult.markdown?.length || 0
      },
      confidence: 0.3,
      timestamp: new Date()
    };
  }

  /**
   * Extract room data from element using pattern
   */
  private extractRoomFromElement($: any, el: any, pattern: any): any | null {
    const $el = $(el);

    return {
      id: this.extractText($el, ['id', 'data-id', 'data-room-id']),
      title: this.extractText($el, ['.title', '.room-title', 'h2', 'h3']),
      price: this.extractPrice($el),
      size: this.extractSize($el),
      description: this.extractText($el, ['.description', '.desc', 'p']),
      images: this.extractImages($el),
      features: this.extractFeaturesFromElement($el),
      availability: this.extractAvailability($el)
    };
  }

  /**
   * Generic room extraction from any element
   */
  private extractRoomGeneric($: any, el: any): any {
    const $el = $(el);

    return {
      id: $el.attr('id') || $el.attr('data-id') || this.generateId(),
      title: this.extractText($el, ['h1', 'h2', 'h3', '.title']),
      price: this.extractPrice($el),
      size: this.extractSize($el),
      description: this.extractText($el, ['.description', '.desc', 'p']),
      images: this.extractImages($el),
      features: this.extractFeaturesFromElement($el)
    };
  }

  /**
   * Extract text from element using selectors
   */
  private extractText($el: any, selectors: string[]): string {
    for (const selector of selectors) {
      const text = $el.find(selector).first().text().trim();
      if (text) return text;
    }
    return $el.text().trim().substring(0, 100);
  }

  /**
   * Extract price from element
   */
  private extractPrice($el: any): number {
    const text = $el.text();
    const priceMatch = text.match(/(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*€/);
    if (priceMatch) {
      return parseFloat(priceMatch[1].replace(/[.,]/g, ''));
    }
    return 0;
  }

  /**
   * Extract size from element
   */
  private extractSize($el: any): number {
    const text = $el.text();
    const sizeMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:m²|m2|sqm)/i);
    if (sizeMatch) {
      return parseFloat(sizeMatch[1].replace(',', '.'));
    }
    return 0;
  }

  /**
   * Extract images from element
   */
  private extractImages($el: any): string[] {
    const images: string[] = [];
    $el.find('img').each((_: any, img: any) => {
      const src = $(img).attr('src') || $(img).attr('data-src');
      if (src) images.push(src);
    });
    return images;
  }

  /**
   * Extract features from element
   */
  private extractFeaturesFromElement($el: any): string[] {
    const features: string[] = [];
    $el.find('.feature, .amenity, li').each((_: any, feat: any) => {
      const text = $(feat).text().trim();
      if (text && text.length < 50) features.push(text);
    });
    return features.slice(0, 10);
  }

  /**
   * Extract availability from element
   */
  private extractAvailability($el: any): string {
    const text = $el.text().toLowerCase();
    if (text.includes('available') || text.includes('frei')) return 'available';
    if (text.includes('occupied') || text.includes('belegt')) return 'occupied';
    if (text.includes('reserved') || text.includes('reserviert')) return 'reserved';
    return 'available';
  }

  /**
   * Parse markdown for room data
   */
  private parseMarkdownForRooms(markdown: string): any[] {
    const rooms: any[] = [];
    const sections = markdown.split(/#{2,3}/);

    for (const section of sections) {
      const priceMatch = section.match(/(\d+)\s*€/);
      const sizeMatch = section.match(/(\d+)\s*m²/);

      if (priceMatch && sizeMatch) {
        rooms.push({
          id: this.generateId(),
          title: section.split('\n')[0].trim(),
          price: parseInt(priceMatch[1]),
          size: parseInt(sizeMatch[1]),
          description: section.split('\n').slice(1, 3).join(' ').trim(),
          images: [],
          features: []
        });
      }
    }

    return rooms;
  }

  /**
   * Extract features from all rooms
   */
  private extractFeatures(rooms: any[]): string[] {
    const allFeatures = new Set<string>();
    rooms.forEach(room => {
      if (room.features && Array.isArray(room.features)) {
        room.features.forEach((f: string) => allFeatures.add(f));
      }
    });
    return Array.from(allFeatures);
  }

  /**
   * Generate random ID
   */
  private generateId(): string {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
