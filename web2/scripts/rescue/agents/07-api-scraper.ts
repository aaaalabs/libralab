import { getLogger } from '../utils/logger';
import type { ExtractedData, APIData, AgentResult } from '../types';

const log = getLogger();

interface APIScraperConfig {
  baseUrl: string;
  timeout?: number;
  retryAttempts?: number;
}

/**
 * API Scraper Agent - Phase 2 Extraction
 * Attempts to access API endpoints, falls back gracefully if unavailable
 */
export default class APIScraperAgent {
  private config: APIScraperConfig;

  constructor(config: APIScraperConfig) {
    this.config = {
      timeout: 10000,
      retryAttempts: 2,
      ...config
    };
  }

  /**
   * Execute the API scraper agent
   */
  async execute(extractedData: ExtractedData): Promise<AgentResult<APIData>> {
    const startTime = Date.now();
    log.info('Starting API Scraper Agent', { baseUrl: this.config.baseUrl }, 'api-scraper');

    try {
      // Strategy 1: Try documented API endpoints
      const documentedResult = await this.tryDocumentedEndpoints();
      if (documentedResult && documentedResult.available.length > 0) {
        log.success('Documented API endpoints successful', {
          available: documentedResult.available.length
        }, 'api-scraper');
        return {
          success: true,
          data: documentedResult,
          confidence: documentedResult.confidence,
          timestamp: new Date()
        };
      }

      // Strategy 2: Try common API patterns
      const commonResult = await this.tryCommonPatterns();
      if (commonResult && commonResult.available.length > 0) {
        log.success('Common API patterns successful', {
          available: commonResult.available.length
        }, 'api-scraper');
        return {
          success: true,
          data: commonResult,
          confidence: commonResult.confidence,
          timestamp: new Date()
        };
      }

      // Strategy 3: Try REST variations
      const restResult = await this.tryRestVariations();
      if (restResult && restResult.available.length > 0) {
        log.success('REST variations successful', {
          available: restResult.available.length
        }, 'api-scraper');
        return {
          success: true,
          data: restResult,
          confidence: restResult.confidence,
          timestamp: new Date()
        };
      }

      // Strategy 4: Use extracted data as fallback
      log.warn('No API endpoints available, using extracted data fallback', undefined, 'api-scraper');
      const fallbackResult = this.createFallbackFromExtractedData(extractedData);

      return {
        success: true,
        data: fallbackResult,
        confidence: fallbackResult.confidence,
        timestamp: new Date()
      };
    } catch (error: any) {
      log.error('API Scraper Agent failed', error.message, 'api-scraper');

      // Return fallback even on error
      const fallbackResult = this.createFallbackFromExtractedData(extractedData);
      return {
        success: true,
        data: fallbackResult,
        confidence: 0.1,
        timestamp: new Date()
      };
    }
  }

  /**
   * Strategy 1: Try documented API endpoints
   */
  private async tryDocumentedEndpoints(): Promise<APIData | null> {
    log.info('Attempting documented API endpoints', undefined, 'api-scraper');

    const endpoints = [
      '/api/rooms',
      '/api/common-areas',
      '/api/location'
    ];

    const results: APIData = {
      endpoints: {},
      available: [],
      confidence: 0,
      timestamp: new Date()
    };

    for (const endpoint of endpoints) {
      const data = await this.fetchEndpoint(endpoint);
      if (data) {
        const key = endpoint.split('/').pop() as string;
        results.endpoints[key.replace('-', '') as keyof APIData['endpoints']] = data;
        results.available.push(endpoint);
      }
    }

    if (results.available.length > 0) {
      results.confidence = results.available.length === endpoints.length ? 0.95 : 0.8;
      return results;
    }

    return null;
  }

  /**
   * Strategy 2: Try common API patterns
   */
  private async tryCommonPatterns(): Promise<APIData | null> {
    log.info('Attempting common API patterns', undefined, 'api-scraper');

    const patterns = [
      '/api/v1/rooms',
      '/api/v2/rooms',
      '/v1/rooms',
      '/rooms.json',
      '/data/rooms.json',
      '/api/rooms/all',
      '/api/rooms/list'
    ];

    const results: APIData = {
      endpoints: {},
      available: [],
      confidence: 0,
      timestamp: new Date()
    };

    for (const pattern of patterns) {
      const data = await this.fetchEndpoint(pattern);
      if (data) {
        results.endpoints.rooms = Array.isArray(data) ? data : data.rooms || data.data;
        results.available.push(pattern);
        break; // Found one, stop trying
      }
    }

    if (results.available.length > 0) {
      results.confidence = 0.75;
      return results;
    }

    return null;
  }

  /**
   * Strategy 3: Try REST variations
   */
  private async tryRestVariations(): Promise<APIData | null> {
    log.info('Attempting REST variations', undefined, 'api-scraper');

    const variations = [
      '/rest/rooms',
      '/graphql',
      '/api.php?action=getRooms',
      '/wp-json/wp/v2/rooms',
      '/.netlify/functions/rooms',
      '/.vercel/functions/rooms'
    ];

    const results: APIData = {
      endpoints: {},
      available: [],
      confidence: 0,
      timestamp: new Date()
    };

    for (const variation of variations) {
      const data = await this.fetchEndpoint(variation);
      if (data) {
        results.endpoints.rooms = this.normalizeResponse(data);
        results.available.push(variation);
        results.confidence = 0.65;
        return results;
      }
    }

    return null;
  }

  /**
   * Strategy 4: Create fallback from extracted data
   */
  private createFallbackFromExtractedData(extractedData: ExtractedData): APIData {
    log.info('Creating fallback from extracted data', undefined, 'api-scraper');

    return {
      endpoints: {
        rooms: extractedData.rooms,
        commonAreas: [],
        location: {
          name: 'Epic WG',
          address: 'Unknown',
          city: 'Unknown'
        }
      },
      available: ['fallback'],
      confidence: 0.2,
      timestamp: new Date()
    };
  }

  /**
   * Fetch endpoint with retry logic
   */
  private async fetchEndpoint(endpoint: string): Promise<any | null> {
    for (let attempt = 1; attempt <= this.config.retryAttempts!; attempt++) {
      try {
        const url = this.buildUrl(endpoint);
        log.info(`Fetching ${url} (attempt ${attempt})`, undefined, 'api-scraper');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; RescueBot/1.0)'
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }

        const data = await response.json();
        return this.validateResponse(data) ? data : null;
      } catch (error: any) {
        log.warn(`Endpoint ${endpoint} failed`, { attempt, error: error.message }, 'api-scraper');

        if (attempt === this.config.retryAttempts) {
          return null;
        }

        // Wait before retry
        await this.sleep(1000 * attempt);
      }
    }

    return null;
  }

  /**
   * Build full URL from endpoint
   */
  private buildUrl(endpoint: string): string {
    const base = this.config.baseUrl.replace(/\/$/, '');
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  }

  /**
   * Validate API response structure
   */
  private validateResponse(data: any): boolean {
    if (!data) return false;

    // Valid if it's an array
    if (Array.isArray(data)) return true;

    // Valid if it has expected structure
    if (data.rooms || data.data || data.results) return true;

    // Valid if it has room-like properties
    if (typeof data === 'object' && (data.id || data.title || data.name)) return true;

    return false;
  }

  /**
   * Normalize response to standard format
   */
  private normalizeResponse(data: any): any[] {
    if (Array.isArray(data)) {
      return data;
    }

    if (data.rooms && Array.isArray(data.rooms)) {
      return data.rooms;
    }

    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }

    if (data.results && Array.isArray(data.results)) {
      return data.results;
    }

    // Single object, wrap in array
    if (typeof data === 'object' && data.id) {
      return [data];
    }

    return [];
  }

  /**
   * Merge API data with extracted data
   */
  async mergeWithExtractedData(apiData: APIData, extractedData: ExtractedData): Promise<ExtractedData> {
    log.info('Merging API data with extracted data', undefined, 'api-scraper');

    if (!apiData.endpoints.rooms || apiData.endpoints.rooms.length === 0) {
      return extractedData;
    }

    // Merge rooms: API data takes precedence
    const apiRoomIds = new Set(apiData.endpoints.rooms.map((r: any) => r.id));
    const mergedRooms = [
      ...apiData.endpoints.rooms,
      ...extractedData.rooms.filter(r => !apiRoomIds.has(r.id))
    ];

    return {
      rooms: mergedRooms,
      metadata: {
        ...extractedData.metadata,
        source: 'api-merged',
        totalRooms: mergedRooms.length,
        confidence: Math.max(apiData.confidence, extractedData.metadata.confidence)
      }
    };
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
