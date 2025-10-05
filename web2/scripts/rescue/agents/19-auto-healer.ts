import { getLogger } from '../utils/logger';
import type { AgentResult, RoomData } from '../types';

const log = getLogger();

/**
 * Auto-Healer Agent - Autonomous System
 * Detects and fixes common data errors automatically
 * Never fails - always returns best effort result
 */

export interface HealingStrategy {
  error: string;
  strategy: string;
  applied: boolean;
  confidence: number;
  originalValue?: any;
  healedValue?: any;
  reasoning: string;
}

export interface HealingResult {
  healedData: any;
  healingLog: HealingStrategy[];
  totalErrors: number;
  totalHealed: number;
  confidence: number;
  timestamp: Date;
}

export default class AutoHealerAgent {
  private healingLog: HealingStrategy[] = [];

  /**
   * Execute auto-healing on data
   */
  async execute(data: any, dataType: string = 'room'): Promise<AgentResult<HealingResult>> {
    const startTime = Date.now();
    log.info(
      'Starting Auto-Healer Agent',
      { dataType, isArray: Array.isArray(data) },
      'auto-healer'
    );

    try {
      let healedData: any;

      if (Array.isArray(data)) {
        healedData = await this.healArray(data, dataType);
      } else {
        healedData = await this.healObject(data, dataType);
      }

      const result = this.buildHealingResult(healedData);
      const duration = Date.now() - startTime;

      log.success(
        'Auto-Healer completed',
        {
          duration: `${duration}ms`,
          errorsFound: result.totalErrors,
          errorsHealed: result.totalHealed,
          confidence: result.confidence
        },
        'auto-healer'
      );

      return {
        success: true,
        data: result,
        confidence: result.confidence,
        timestamp: new Date()
      };
    } catch (error: any) {
      log.warn(
        'Auto-Healer encountered error, returning partial result',
        error.message,
        'auto-healer'
      );

      // Never fail - return data as-is with low confidence
      const result: HealingResult = {
        healedData: data,
        healingLog: this.healingLog,
        totalErrors: this.healingLog.length,
        totalHealed: 0,
        confidence: 0.3,
        timestamp: new Date()
      };

      return {
        success: true,
        data: result,
        confidence: 0.3,
        timestamp: new Date()
      };
    }
  }

  /**
   * Heal array of objects
   */
  private async healArray(data: any[], dataType: string): Promise<any[]> {
    const healedArray: any[] = [];

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const healedItem = await this.healObject(item, dataType, i);
      healedArray.push(healedItem);
    }

    // Check for duplicates
    const deduped = this.deduplicateRooms(healedArray);
    if (deduped.length < healedArray.length) {
      this.healingLog.push({
        error: 'duplicate_rooms',
        strategy: 'deduplicate_by_title_and_id',
        applied: true,
        confidence: 0.9,
        originalValue: healedArray.length,
        healedValue: deduped.length,
        reasoning: `Removed ${healedArray.length - deduped.length} duplicate rooms`
      });
      return deduped;
    }

    return healedArray;
  }

  /**
   * Heal single object
   */
  private async healObject(data: any, dataType: string, index?: number): Promise<any> {
    const healed = { ...data };
    const prefix = index !== undefined ? `[${index}]` : '';

    if (dataType === 'room') {
      // Strategy 1: Fix missing price
      if (!healed.price || healed.price <= 0) {
        const estimatedPrice = this.estimatePriceFromSize(healed.size, healed.description);
        if (estimatedPrice > 0) {
          this.healingLog.push({
            error: `${prefix}missing_price`,
            strategy: 'estimate_from_size_and_description',
            applied: true,
            confidence: 0.6,
            originalValue: healed.price,
            healedValue: estimatedPrice,
            reasoning: `Estimated €${estimatedPrice} from ${healed.size}m² size`
          });
          healed.price = estimatedPrice;
        } else {
          // Extract from description
          const extracted = this.extractPriceFromDescription(healed.description);
          if (extracted > 0) {
            this.healingLog.push({
              error: `${prefix}missing_price`,
              strategy: 'extract_from_description',
              applied: true,
              confidence: 0.8,
              originalValue: healed.price,
              healedValue: extracted,
              reasoning: `Extracted €${extracted} from description text`
            });
            healed.price = extracted;
          }
        }
      }

      // Strategy 2: Fix missing size
      if (!healed.size || healed.size <= 0) {
        const extracted = this.extractSizeFromDescription(healed.description);
        if (extracted > 0) {
          this.healingLog.push({
            error: `${prefix}missing_size`,
            strategy: 'extract_from_description',
            applied: true,
            confidence: 0.75,
            originalValue: healed.size,
            healedValue: extracted,
            reasoning: `Extracted ${extracted}m² from description`
          });
          healed.size = extracted;
        }
      }

      // Strategy 3: Fix missing translation
      if (healed.description && typeof healed.description === 'object') {
        if (!healed.description.en && healed.description.de) {
          healed.description.en = healed.description.de; // Fallback copy
          this.healingLog.push({
            error: `${prefix}missing_translation_en`,
            strategy: 'copy_from_other_language',
            applied: true,
            confidence: 0.5,
            reasoning: 'Copied German description as English fallback'
          });
        }
        if (!healed.description.de && healed.description.en) {
          healed.description.de = healed.description.en; // Fallback copy
          this.healingLog.push({
            error: `${prefix}missing_translation_de`,
            strategy: 'copy_from_other_language',
            applied: true,
            confidence: 0.5,
            reasoning: 'Copied English description as German fallback'
          });
        }
      }

      // Strategy 4: Fix broken image paths
      if (healed.images && Array.isArray(healed.images)) {
        healed.images = healed.images.map((img: string, idx: number) => {
          const fixed = this.fixImagePath(img);
          if (fixed !== img) {
            this.healingLog.push({
              error: `${prefix}broken_image_path[${idx}]`,
              strategy: 'auto_correct_path_format',
              applied: true,
              confidence: 0.85,
              originalValue: img,
              healedValue: fixed,
              reasoning: 'Fixed image path format'
            });
          }
          return fixed;
        });
      }

      // Strategy 5: Fix invalid data types
      if (typeof healed.price === 'string') {
        const numPrice = parseFloat(healed.price.replace(/[^0-9.]/g, ''));
        if (!isNaN(numPrice)) {
          this.healingLog.push({
            error: `${prefix}invalid_type_price`,
            strategy: 'type_coercion_string_to_number',
            applied: true,
            confidence: 0.95,
            originalValue: healed.price,
            healedValue: numPrice,
            reasoning: 'Converted price from string to number'
          });
          healed.price = numPrice;
        }
      }

      if (typeof healed.size === 'string') {
        const numSize = parseFloat(healed.size.replace(/[^0-9.]/g, ''));
        if (!isNaN(numSize)) {
          this.healingLog.push({
            error: `${prefix}invalid_type_size`,
            strategy: 'type_coercion_string_to_number',
            applied: true,
            confidence: 0.95,
            originalValue: healed.size,
            healedValue: numSize,
            reasoning: 'Converted size from string to number'
          });
          healed.size = numSize;
        }
      }

      // Strategy 6: Fix missing required fields with defaults
      if (!healed.id) {
        healed.id = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.healingLog.push({
          error: `${prefix}missing_id`,
          strategy: 'generate_unique_id',
          applied: true,
          confidence: 1.0,
          healedValue: healed.id,
          reasoning: 'Generated unique ID'
        });
      }

      if (!healed.title) {
        healed.title = `Room ${healed.id}`;
        this.healingLog.push({
          error: `${prefix}missing_title`,
          strategy: 'use_default_title',
          applied: true,
          confidence: 0.4,
          healedValue: healed.title,
          reasoning: 'Used default title format'
        });
      }

      if (!healed.availability) {
        healed.availability = 'available';
        this.healingLog.push({
          error: `${prefix}missing_availability`,
          strategy: 'use_default_available',
          applied: true,
          confidence: 0.7,
          healedValue: healed.availability,
          reasoning: 'Defaulted to available status'
        });
      }

      if (!healed.features || !Array.isArray(healed.features)) {
        healed.features = [];
        this.healingLog.push({
          error: `${prefix}missing_features`,
          strategy: 'use_empty_array',
          applied: true,
          confidence: 0.8,
          healedValue: [],
          reasoning: 'Initialized empty features array'
        });
      }
    }

    return healed;
  }

  /**
   * Estimate price from room size
   */
  private estimatePriceFromSize(size: number, description?: string): number {
    if (!size || size <= 0) return 0;

    // Base price per m² (typical for shared housing)
    let pricePerSqm = 15; // €15/m² is a reasonable baseline

    // Adjust based on description keywords if available
    if (description) {
      const desc = description.toString().toLowerCase();
      if (desc.includes('balkon') || desc.includes('balcony')) pricePerSqm += 2;
      if (desc.includes('möbliert') || desc.includes('furnished')) pricePerSqm += 3;
      if (desc.includes('ensuite') || desc.includes('privat')) pricePerSqm += 4;
    }

    return Math.round(size * pricePerSqm);
  }

  /**
   * Extract price from description text
   */
  private extractPriceFromDescription(description: any): number {
    if (!description) return 0;

    const text = typeof description === 'string'
      ? description
      : (description.en || description.de || '');

    // Match patterns like "€450", "450€", "450 EUR", "$450"
    const patterns = [
      /€\s*(\d+)/,
      /(\d+)\s*€/,
      /(\d+)\s*EUR/i,
      /\$\s*(\d+)/,
      /(\d+)\s*\$/
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const price = parseInt(match[1], 10);
        if (price > 100 && price < 2000) { // Sanity check
          return price;
        }
      }
    }

    return 0;
  }

  /**
   * Extract size from description text
   */
  private extractSizeFromDescription(description: any): number {
    if (!description) return 0;

    const text = typeof description === 'string'
      ? description
      : (description.en || description.de || '');

    // Match patterns like "15m²", "15 m²", "15 sqm", "15m2"
    const patterns = [
      /(\d+(?:\.\d+)?)\s*m²/,
      /(\d+(?:\.\d+)?)\s*m2/i,
      /(\d+(?:\.\d+)?)\s*sqm/i,
      /(\d+(?:\.\d+)?)\s*square\s*meters/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const size = parseFloat(match[1]);
        if (size > 5 && size < 100) { // Sanity check for room size
          return size;
        }
      }
    }

    return 0;
  }

  /**
   * Fix broken image paths
   */
  private fixImagePath(path: string): string {
    if (!path) return '';

    let fixed = path;

    // Fix double slashes
    fixed = fixed.replace(/\/\//g, '/');

    // Fix missing leading slash for absolute paths
    if (!fixed.startsWith('/') && !fixed.startsWith('http')) {
      fixed = '/' + fixed;
    }

    // Fix spaces in URLs
    fixed = fixed.replace(/\s+/g, '%20');

    // Normalize path separators
    fixed = fixed.replace(/\\/g, '/');

    return fixed;
  }

  /**
   * Deduplicate rooms by title and ID
   */
  private deduplicateRooms(rooms: any[]): any[] {
    const seen = new Map<string, any>();
    const deduped: any[] = [];

    for (const room of rooms) {
      const key = `${room.id}|${room.title}`.toLowerCase();

      if (!seen.has(key)) {
        seen.set(key, room);
        deduped.push(room);
      } else {
        // Keep the one with more complete data
        const existing = seen.get(key);
        const existingFields = Object.keys(existing).filter(k => existing[k]).length;
        const newFields = Object.keys(room).filter(k => room[k]).length;

        if (newFields > existingFields) {
          // Replace with more complete version
          const index = deduped.findIndex(r => r === existing);
          if (index !== -1) {
            deduped[index] = room;
            seen.set(key, room);
          }
        }
      }
    }

    return deduped;
  }

  /**
   * Build final healing result
   */
  private buildHealingResult(healedData: any): HealingResult {
    const totalErrors = this.healingLog.length;
    const totalHealed = this.healingLog.filter(h => h.applied).length;

    // Calculate confidence based on healing success
    let confidence = 1.0;

    if (totalErrors > 0) {
      const successRate = totalHealed / totalErrors;
      confidence = 0.5 + (successRate * 0.4); // 50% base + up to 40% for success

      // Adjust for healing strategy confidence
      const avgStrategyConfidence = this.healingLog
        .filter(h => h.applied)
        .reduce((sum, h) => sum + h.confidence, 0) / (totalHealed || 1);

      confidence = (confidence + avgStrategyConfidence) / 2;
    }

    return {
      healedData,
      healingLog: this.healingLog,
      totalErrors,
      totalHealed,
      confidence: Math.max(0.3, Math.min(1.0, confidence)),
      timestamp: new Date()
    };
  }

  /**
   * Get healing statistics
   */
  getStatistics(): {
    totalStrategies: number;
    byStrategy: Record<string, number>;
    byError: Record<string, number>;
    averageConfidence: number;
  } {
    const stats = {
      totalStrategies: this.healingLog.length,
      byStrategy: {} as Record<string, number>,
      byError: {} as Record<string, number>,
      averageConfidence: 0
    };

    let totalConfidence = 0;

    for (const heal of this.healingLog) {
      if (heal.applied) {
        stats.byStrategy[heal.strategy] = (stats.byStrategy[heal.strategy] || 0) + 1;
        stats.byError[heal.error] = (stats.byError[heal.error] || 0) + 1;
        totalConfidence += heal.confidence;
      }
    }

    const appliedCount = this.healingLog.filter(h => h.applied).length;
    if (appliedCount > 0) {
      stats.averageConfidence = totalConfidence / appliedCount;
    }

    return stats;
  }
}
