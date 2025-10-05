import { getLogger } from '../utils/logger';
import { promises as fs } from 'fs';
import path from 'path';
import type { ExtractedData, ImageManifest, AgentResult } from '../types';

const log = getLogger();

interface ImageHarvesterConfig {
  outputDir: string;
  maxConcurrent?: number;
  retryAttempts?: number;
  retryDelay?: number;
  optimizeImages?: boolean;
}

/**
 * Image Harvester Agent - Phase 2 Extraction
 * Downloads all room/location images from production with retry logic
 */
export default class ImageHarvesterAgent {
  private config: ImageHarvesterConfig;

  constructor(config: ImageHarvesterConfig) {
    this.config = {
      maxConcurrent: 5,
      retryAttempts: 3,
      retryDelay: 1000,
      optimizeImages: false,
      ...config
    };
  }

  /**
   * Execute the image harvester agent
   */
  async execute(extractedData: ExtractedData): Promise<AgentResult<ImageManifest>> {
    const startTime = Date.now();
    log.info('Starting Image Harvester Agent', { rooms: extractedData.rooms.length }, 'image-harvester');

    try {
      // Collect all image URLs
      const allImages = this.collectImageUrls(extractedData);
      log.info(`Found ${allImages.length} images to download`, undefined, 'image-harvester');

      // Strategy 1: Parallel download with retries
      const parallelResult = await this.tryParallelDownload(allImages);
      if (parallelResult.downloaded.length >= allImages.length * 0.8) {
        log.success('Parallel download successful', {
          downloaded: parallelResult.downloaded.length,
          missing: parallelResult.missing.length
        }, 'image-harvester');
        return {
          success: true,
          data: parallelResult,
          confidence: this.calculateConfidence(parallelResult, allImages.length),
          timestamp: new Date()
        };
      }

      // Strategy 2: Sequential download with extended retries
      const sequentialResult = await this.trySequentialDownload(allImages);
      if (sequentialResult.downloaded.length >= allImages.length * 0.6) {
        log.success('Sequential download successful', {
          downloaded: sequentialResult.downloaded.length,
          missing: sequentialResult.missing.length
        }, 'image-harvester');
        return {
          success: true,
          data: sequentialResult,
          confidence: this.calculateConfidence(sequentialResult, allImages.length),
          timestamp: new Date()
        };
      }

      // Strategy 3: Best effort download
      log.warn('Using best effort download', {
        downloaded: sequentialResult.downloaded.length,
        total: allImages.length
      }, 'image-harvester');

      return {
        success: true,
        data: sequentialResult,
        confidence: this.calculateConfidence(sequentialResult, allImages.length),
        timestamp: new Date()
      };
    } catch (error: any) {
      log.error('Image Harvester Agent failed', error.message, 'image-harvester');
      return {
        success: false,
        error: error.message,
        confidence: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Collect all image URLs from extracted data
   */
  private collectImageUrls(extractedData: ExtractedData): string[] {
    const urls = new Set<string>();

    extractedData.rooms.forEach(room => {
      if (Array.isArray(room.images)) {
        room.images.forEach(img => {
          if (typeof img === 'string' && img.length > 0) {
            // Resolve relative URLs
            const absoluteUrl = this.resolveUrl(img, extractedData.metadata.source);
            if (this.isValidImageUrl(absoluteUrl)) {
              urls.add(absoluteUrl);
            }
          }
        });
      }
    });

    return Array.from(urls);
  }

  /**
   * Strategy 1: Parallel download with retry logic
   */
  private async tryParallelDownload(urls: string[]): Promise<ImageManifest> {
    log.info('Attempting parallel download', { urls: urls.length }, 'image-harvester');

    const downloaded: ImageManifest['downloaded'] = [];
    const missing: string[] = [];
    const errors: ImageManifest['errors'] = [];

    // Create output directories
    await this.createOutputDirectories();

    // Download in batches
    const batches = this.chunkArray(urls, this.config.maxConcurrent!);

    for (const batch of batches) {
      const results = await Promise.all(
        batch.map(url => this.downloadImageWithRetry(url))
      );

      results.forEach((result, index) => {
        if (result.success && result.path) {
          downloaded.push({
            url: batch[index],
            path: result.path,
            size: result.size || 0
          });
        } else if (result.missing) {
          missing.push(batch[index]);
        } else {
          errors.push({
            url: batch[index],
            error: result.error || 'Unknown error'
          });
        }
      });
    }

    return {
      downloaded,
      missing,
      errors,
      confidence: this.calculateSuccessRate(downloaded.length, urls.length),
      timestamp: new Date()
    };
  }

  /**
   * Strategy 2: Sequential download with extended retries
   */
  private async trySequentialDownload(urls: string[]): Promise<ImageManifest> {
    log.info('Attempting sequential download', { urls: urls.length }, 'image-harvester');

    const downloaded: ImageManifest['downloaded'] = [];
    const missing: string[] = [];
    const errors: ImageManifest['errors'] = [];

    await this.createOutputDirectories();

    for (const url of urls) {
      const result = await this.downloadImageWithRetry(url, this.config.retryAttempts! * 2);

      if (result.success && result.path) {
        downloaded.push({
          url,
          path: result.path,
          size: result.size || 0
        });
      } else if (result.missing) {
        missing.push(url);
      } else {
        errors.push({
          url,
          error: result.error || 'Unknown error'
        });
      }

      // Small delay between downloads
      await this.sleep(100);
    }

    return {
      downloaded,
      missing,
      errors,
      confidence: this.calculateSuccessRate(downloaded.length, urls.length),
      timestamp: new Date()
    };
  }

  /**
   * Download single image with retry logic
   */
  private async downloadImageWithRetry(
    url: string,
    maxAttempts: number = this.config.retryAttempts!
  ): Promise<{ success: boolean; path?: string; size?: number; error?: string; missing?: boolean }> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await this.downloadImage(url);
        return { success: true, ...result };
      } catch (error: any) {
        lastError = error;

        // Check if it's a 404 - no point retrying
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          return { success: false, missing: true };
        }

        if (attempt < maxAttempts) {
          // Exponential backoff
          const delay = this.config.retryDelay! * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Download failed after retries'
    };
  }

  /**
   * Download single image
   */
  private async downloadImage(url: string): Promise<{ path: string; size: number }> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Determine category and filename
    const category = this.categorizeImage(url);
    const filename = this.generateFilename(url);
    const relativePath = path.join(category, filename);
    const absolutePath = path.join(this.config.outputDir, relativePath);

    // Save file
    await fs.writeFile(absolutePath, uint8Array);

    return {
      path: relativePath,
      size: uint8Array.length
    };
  }

  /**
   * Create output directory structure
   */
  private async createOutputDirectories(): Promise<void> {
    const dirs = [
      path.join(this.config.outputDir, 'rooms'),
      path.join(this.config.outputDir, 'epicwg'),
      path.join(this.config.outputDir, 'partners')
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * Categorize image by URL pattern
   */
  private categorizeImage(url: string): string {
    const urlLower = url.toLowerCase();

    if (urlLower.includes('/room') || urlLower.includes('/zimmer')) {
      return 'rooms';
    } else if (urlLower.includes('/partner') || urlLower.includes('/coliving')) {
      return 'partners';
    } else if (urlLower.includes('/epicwg') || urlLower.includes('/location') || urlLower.includes('/common')) {
      return 'epicwg';
    }

    return 'epicwg'; // default
  }

  /**
   * Generate filename from URL
   */
  private generateFilename(url: string): string {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = path.basename(pathname);

    // If filename is generic or missing, generate one
    if (!filename || filename.length < 3) {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 6);
      const ext = this.getImageExtension(url);
      return `image_${timestamp}_${random}.${ext}`;
    }

    // Sanitize filename
    return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  /**
   * Get image extension from URL or content type
   */
  private getImageExtension(url: string): string {
    const urlLower = url.toLowerCase();

    if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) return 'jpg';
    if (urlLower.includes('.png')) return 'png';
    if (urlLower.includes('.webp')) return 'webp';
    if (urlLower.includes('.gif')) return 'gif';
    if (urlLower.includes('.svg')) return 'svg';

    return 'jpg'; // default
  }

  /**
   * Resolve relative URL to absolute
   */
  private resolveUrl(url: string, baseUrl: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    if (url.startsWith('//')) {
      return `https:${url}`;
    }

    if (url.startsWith('/')) {
      const base = new URL(baseUrl);
      return `${base.protocol}//${base.host}${url}`;
    }

    return new URL(url, baseUrl).toString();
  }

  /**
   * Check if URL is a valid image URL
   */
  private isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();

      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
      const hasValidExtension = validExtensions.some(ext => pathname.endsWith(ext));

      const isDataUrl = url.startsWith('data:image/');

      return hasValidExtension || isDataUrl;
    } catch {
      return false;
    }
  }

  /**
   * Calculate confidence based on success rate
   */
  private calculateConfidence(manifest: ImageManifest, totalImages: number): number {
    const successRate = this.calculateSuccessRate(manifest.downloaded.length, totalImages);

    if (successRate >= 0.95) return 0.95;
    if (successRate >= 0.8) return 0.85;
    if (successRate >= 0.6) return 0.7;
    if (successRate >= 0.4) return 0.5;
    return 0.3;
  }

  /**
   * Calculate success rate
   */
  private calculateSuccessRate(downloaded: number, total: number): number {
    if (total === 0) return 0;
    return downloaded / total;
  }

  /**
   * Chunk array into batches
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
