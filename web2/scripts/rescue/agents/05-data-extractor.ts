import { getLogger } from '../utils/logger';
import type { ParsedContent, ExtractedData, RoomData, AgentResult } from '../types';

const log = getLogger();

interface DataExtractorConfig {
  priceMultiplier?: number;
  defaultFloor?: number;
  defaultFurnished?: boolean;
}

/**
 * Data Extractor Agent - Phase 2 Extraction
 * Transforms parsed content into epicwg.json schema format
 */
export default class DataExtractorAgent {
  private config: DataExtractorConfig;

  constructor(config: DataExtractorConfig = {}) {
    this.config = {
      priceMultiplier: 1,
      defaultFloor: 1,
      defaultFurnished: true,
      ...config
    };
  }

  /**
   * Execute the data extractor agent
   */
  async execute(parsedContent: ParsedContent): Promise<AgentResult<ExtractedData>> {
    const startTime = Date.now();
    log.info('Starting Data Extractor Agent', { rooms: parsedContent.rooms.length }, 'data-extractor');

    try {
      // Strategy 1: Direct mapping (if data already in correct format)
      const directResult = this.tryDirectMapping(parsedContent);
      if (directResult && directResult.rooms.length > 0) {
        log.success('Direct mapping successful', { rooms: directResult.rooms.length }, 'data-extractor');
        return {
          success: true,
          data: directResult,
          confidence: directResult.metadata.confidence,
          timestamp: new Date()
        };
      }

      // Strategy 2: Schema transformation
      const transformResult = this.trySchemaTransformation(parsedContent);
      if (transformResult && transformResult.rooms.length > 0) {
        log.success('Schema transformation successful', { rooms: transformResult.rooms.length }, 'data-extractor');
        return {
          success: true,
          data: transformResult,
          confidence: transformResult.metadata.confidence,
          timestamp: new Date()
        };
      }

      // Strategy 3: Intelligent field mapping
      const mappingResult = this.tryIntelligentMapping(parsedContent);
      if (mappingResult && mappingResult.rooms.length > 0) {
        log.success('Intelligent mapping successful', { rooms: mappingResult.rooms.length }, 'data-extractor');
        return {
          success: true,
          data: mappingResult,
          confidence: mappingResult.metadata.confidence,
          timestamp: new Date()
        };
      }

      // Strategy 4: Field-by-field extraction
      const fieldResult = this.tryFieldByFieldExtraction(parsedContent);
      if (fieldResult && fieldResult.rooms.length > 0) {
        log.success('Field extraction successful', { rooms: fieldResult.rooms.length }, 'data-extractor');
        return {
          success: true,
          data: fieldResult,
          confidence: fieldResult.metadata.confidence,
          timestamp: new Date()
        };
      }

      // Strategy 5: Fallback minimal extraction
      log.warn('All extraction strategies incomplete, using fallback', undefined, 'data-extractor');
      const fallbackResult = this.fallbackExtraction(parsedContent);

      return {
        success: true,
        data: fallbackResult,
        confidence: fallbackResult.metadata.confidence,
        timestamp: new Date()
      };
    } catch (error: any) {
      log.error('Data Extractor Agent failed', error.message, 'data-extractor');
      return {
        success: false,
        error: error.message,
        confidence: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Strategy 1: Direct mapping if data already matches schema
   */
  private tryDirectMapping(parsedContent: ParsedContent): ExtractedData | null {
    log.info('Attempting direct mapping', undefined, 'data-extractor');

    try {
      const rooms = parsedContent.rooms.map(room => {
        if (!this.validateRoomData(room)) {
          return null;
        }
        return this.normalizeRoom(room, 0.95);
      }).filter(Boolean) as RoomData[];

      if (rooms.length === 0) {
        return null;
      }

      return {
        rooms,
        metadata: {
          source: 'direct-mapping',
          extractedAt: new Date(),
          totalRooms: rooms.length,
          confidence: 0.95
        }
      };
    } catch (error) {
      log.warn('Direct mapping failed', { error }, 'data-extractor');
      return null;
    }
  }

  /**
   * Strategy 2: Schema transformation
   */
  private trySchemaTransformation(parsedContent: ParsedContent): ExtractedData | null {
    log.info('Attempting schema transformation', undefined, 'data-extractor');

    try {
      const rooms = parsedContent.rooms.map(room => {
        const transformed: any = {
          id: this.extractField(room, ['id', 'roomId', 'room_id', '_id'], ''),
          title: this.extractField(room, ['title', 'name', 'roomName', 'room_name'], ''),
          price: this.extractNumericField(room, ['price', 'rent', 'rental', 'monthlyRent'], 0),
          size: this.extractNumericField(room, ['size', 'area', 'sqm', 'm2'], 0),
          description: this.extractField(room, ['description', 'desc', 'details', 'info'], ''),
          images: this.extractArrayField(room, ['images', 'photos', 'pictures', 'imgs']),
          features: this.extractArrayField(room, ['features', 'amenities', 'facilities', 'equipment']),
          availability: this.extractField(room, ['availability', 'status', 'available'], 'available'),
          floor: this.extractNumericField(room, ['floor', 'level', 'etage'], this.config.defaultFloor),
          furnished: this.extractBooleanField(room, ['furnished', 'isFurnished', 'mobel'], this.config.defaultFurnished)
        };

        if (!transformed.id || !transformed.title) {
          return null;
        }

        return this.normalizeRoom(transformed, 0.85);
      }).filter(Boolean) as RoomData[];

      if (rooms.length === 0) {
        return null;
      }

      return {
        rooms,
        metadata: {
          source: 'schema-transformation',
          extractedAt: new Date(),
          totalRooms: rooms.length,
          confidence: 0.85
        }
      };
    } catch (error) {
      log.warn('Schema transformation failed', { error }, 'data-extractor');
      return null;
    }
  }

  /**
   * Strategy 3: Intelligent field mapping
   */
  private tryIntelligentMapping(parsedContent: ParsedContent): ExtractedData | null {
    log.info('Attempting intelligent mapping', undefined, 'data-extractor');

    try {
      const rooms = parsedContent.rooms.map(room => {
        const mapped: any = {};

        // ID extraction
        mapped.id = this.intelligentExtractId(room);

        // Title extraction
        mapped.title = this.intelligentExtractTitle(room);

        // Price extraction
        mapped.price = this.intelligentExtractPrice(room);

        // Size extraction
        mapped.size = this.intelligentExtractSize(room);

        // Description extraction
        mapped.description = this.intelligentExtractDescription(room);

        // Images extraction
        mapped.images = this.intelligentExtractImages(room);

        // Features extraction
        mapped.features = this.intelligentExtractFeatures(room);

        // Availability extraction
        mapped.availability = this.intelligentExtractAvailability(room);

        // Additional fields
        mapped.floor = this.extractNumericField(room, ['floor', 'level'], this.config.defaultFloor);
        mapped.furnished = this.extractBooleanField(room, ['furnished'], this.config.defaultFurnished);

        if (!mapped.id || !mapped.title || !mapped.price) {
          return null;
        }

        return this.normalizeRoom(mapped, 0.75);
      }).filter(Boolean) as RoomData[];

      if (rooms.length === 0) {
        return null;
      }

      return {
        rooms,
        metadata: {
          source: 'intelligent-mapping',
          extractedAt: new Date(),
          totalRooms: rooms.length,
          confidence: 0.75
        }
      };
    } catch (error) {
      log.warn('Intelligent mapping failed', { error }, 'data-extractor');
      return null;
    }
  }

  /**
   * Strategy 4: Field-by-field extraction
   */
  private tryFieldByFieldExtraction(parsedContent: ParsedContent): ExtractedData | null {
    log.info('Attempting field-by-field extraction', undefined, 'data-extractor');

    try {
      const rooms = parsedContent.rooms.map((room, index) => {
        const extracted: any = {
          id: room.id || `room_${index + 1}`,
          title: room.title || room.name || `Room ${index + 1}`,
          price: this.parsePrice(room.price) || 0,
          size: this.parseSize(room.size) || 0,
          description: String(room.description || room.desc || '').substring(0, 500),
          images: Array.isArray(room.images) ? room.images : [],
          features: Array.isArray(room.features) ? room.features : [],
          availability: String(room.availability || 'available'),
          floor: parseInt(String(room.floor || this.config.defaultFloor)),
          furnished: Boolean(room.furnished ?? this.config.defaultFurnished)
        };

        return this.normalizeRoom(extracted, 0.65);
      });

      return {
        rooms,
        metadata: {
          source: 'field-by-field',
          extractedAt: new Date(),
          totalRooms: rooms.length,
          confidence: 0.65
        }
      };
    } catch (error) {
      log.warn('Field-by-field extraction failed', { error }, 'data-extractor');
      return null;
    }
  }

  /**
   * Strategy 5: Fallback minimal extraction
   */
  private fallbackExtraction(parsedContent: ParsedContent): ExtractedData {
    log.info('Using fallback extraction', undefined, 'data-extractor');

    const rooms = parsedContent.rooms.map((room, index) => ({
      id: `fallback_${index}`,
      title: `Room ${index + 1}`,
      price: 0,
      size: 0,
      description: JSON.stringify(room).substring(0, 200),
      images: [],
      features: [],
      availability: 'available' as const,
      floor: 1,
      furnished: true
    }));

    return {
      rooms,
      metadata: {
        source: 'fallback',
        extractedAt: new Date(),
        totalRooms: rooms.length,
        confidence: 0.3
      }
    };
  }

  /**
   * Validate room data completeness
   */
  private validateRoomData(room: any): boolean {
    return !!(room.id && room.title && room.price >= 0);
  }

  /**
   * Normalize room data to standard format
   */
  private normalizeRoom(room: any, confidence: number): RoomData {
    return {
      id: String(room.id),
      title: String(room.title).trim(),
      price: this.normalizePrice(room.price),
      size: this.normalizeSize(room.size),
      description: String(room.description || '').trim(),
      images: this.normalizeImages(room.images),
      features: this.normalizeFeatures(room.features),
      availability: this.normalizeAvailability(room.availability),
      floor: parseInt(String(room.floor || 1)),
      furnished: Boolean(room.furnished ?? true),
      _confidence: confidence
    };
  }

  /**
   * Extract field from object using multiple possible keys
   */
  private extractField(obj: any, keys: string[], defaultValue: any): any {
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
        return obj[key];
      }
    }
    return defaultValue;
  }

  /**
   * Extract numeric field
   */
  private extractNumericField(obj: any, keys: string[], defaultValue: number): number {
    const value = this.extractField(obj, keys, defaultValue);
    const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * Extract array field
   */
  private extractArrayField(obj: any, keys: string[]): any[] {
    const value = this.extractField(obj, keys, []);
    return Array.isArray(value) ? value : [];
  }

  /**
   * Extract boolean field
   */
  private extractBooleanField(obj: any, keys: string[], defaultValue: boolean): boolean {
    const value = this.extractField(obj, keys, defaultValue);
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1' || value === 'yes';
    }
    return defaultValue;
  }

  /**
   * Intelligent ID extraction
   */
  private intelligentExtractId(room: any): string {
    if (room.id) return String(room.id);
    if (room.roomId) return String(room.roomId);
    if (room.title) return this.slugify(room.title);
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Intelligent title extraction
   */
  private intelligentExtractTitle(room: any): string {
    if (room.title) return String(room.title);
    if (room.name) return String(room.name);
    if (room.roomName) return String(room.roomName);
    return 'Untitled Room';
  }

  /**
   * Intelligent price extraction
   */
  private intelligentExtractPrice(room: any): number {
    return this.parsePrice(room.price || room.rent || room.rental || room.monthlyRent || 0);
  }

  /**
   * Intelligent size extraction
   */
  private intelligentExtractSize(room: any): number {
    return this.parseSize(room.size || room.area || room.sqm || room.m2 || 0);
  }

  /**
   * Intelligent description extraction
   */
  private intelligentExtractDescription(room: any): string {
    const desc = room.description || room.desc || room.details || room.info || '';
    return String(desc).substring(0, 1000);
  }

  /**
   * Intelligent images extraction
   */
  private intelligentExtractImages(room: any): string[] {
    const images = room.images || room.photos || room.pictures || room.imgs || [];
    return Array.isArray(images) ? images : [];
  }

  /**
   * Intelligent features extraction
   */
  private intelligentExtractFeatures(room: any): string[] {
    const features = room.features || room.amenities || room.facilities || room.equipment || [];
    return Array.isArray(features) ? features : [];
  }

  /**
   * Intelligent availability extraction
   */
  private intelligentExtractAvailability(room: any): string {
    const status = String(room.availability || room.status || 'available').toLowerCase();
    if (status.includes('available') || status.includes('frei')) return 'available';
    if (status.includes('occupied') || status.includes('belegt')) return 'occupied';
    if (status.includes('reserved') || status.includes('reserviert')) return 'reserved';
    return 'available';
  }

  /**
   * Parse price from various formats
   */
  private parsePrice(value: any): number {
    if (typeof value === 'number') return value;
    const str = String(value).replace(/[^0-9.,-]/g, '');
    const num = parseFloat(str.replace(',', '.'));
    return isNaN(num) ? 0 : Math.round(num * this.config.priceMultiplier!);
  }

  /**
   * Parse size from various formats
   */
  private parseSize(value: any): number {
    if (typeof value === 'number') return value;
    const str = String(value).replace(/[^0-9.,-]/g, '');
    const num = parseFloat(str.replace(',', '.'));
    return isNaN(num) ? 0 : Math.round(num);
  }

  /**
   * Normalize price
   */
  private normalizePrice(price: any): number {
    const num = this.parsePrice(price);
    return num > 0 ? num : 0;
  }

  /**
   * Normalize size
   */
  private normalizeSize(size: any): number {
    const num = this.parseSize(size);
    return num > 0 && num < 1000 ? num : 0;
  }

  /**
   * Normalize images array
   */
  private normalizeImages(images: any): string[] {
    if (!Array.isArray(images)) return [];
    return images
      .filter(img => typeof img === 'string' && img.length > 0)
      .map(img => img.trim())
      .slice(0, 20);
  }

  /**
   * Normalize features array
   */
  private normalizeFeatures(features: any): string[] {
    if (!Array.isArray(features)) return [];
    return features
      .filter(feat => typeof feat === 'string' && feat.length > 0)
      .map(feat => feat.trim())
      .slice(0, 50);
  }

  /**
   * Normalize availability status
   */
  private normalizeAvailability(status: any): 'available' | 'occupied' | 'reserved' {
    const str = String(status || 'available').toLowerCase();
    if (str.includes('occupied') || str.includes('belegt')) return 'occupied';
    if (str.includes('reserved') || str.includes('reserviert')) return 'reserved';
    return 'available';
  }

  /**
   * Convert string to slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }
}
