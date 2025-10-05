/**
 * Image Organizer Agent - Phase 4 Implementation
 * Takes ImageManifest and organizes downloaded images into proper directories
 * Renames images to match naming conventions, updates paths in JSON
 */

import { promises as fs } from 'fs';
import path from 'path';
import { getLogger } from '../utils/logger';
import type {
  ImageManifest,
  OrganizedImages,
  AgentResult
} from '../types';

const log = getLogger();

interface ImageCategory {
  type: 'room' | 'epicwg' | 'partner';
  targetDir: string;
}

export default class ImageOrganizerAgent {
  private imageManifest: ImageManifest;
  private baseDir: string;
  private imageDirs: {
    rooms: string;
    epicwg: string;
    partners: string;
  };

  constructor(
    imageManifest: ImageManifest,
    baseDir: string = './public'
  ) {
    this.imageManifest = imageManifest;
    this.baseDir = baseDir;
    this.imageDirs = {
      rooms: path.join(baseDir, 'rooms'),
      epicwg: path.join(baseDir, 'epicwg'),
      partners: path.join(baseDir, 'partners')
    };
  }

  /**
   * Execute the image organizer agent
   */
  async execute(): Promise<AgentResult<OrganizedImages>> {
    const startTime = Date.now();
    log.info(
      'Starting Image Organizer Agent',
      {
        downloaded: this.imageManifest.downloaded.length,
        missing: this.imageManifest.missing.length
      },
      'image-organizer'
    );

    try {
      // Ensure target directories exist
      await this.ensureDirectories();

      // Organize images
      const organized = await this.organizeImages();

      // Validate all paths exist
      const validated = await this.validatePaths(organized);

      // Calculate confidence
      const confidence = this.calculateConfidence(organized, validated);

      const duration = Date.now() - startTime;

      const result: OrganizedImages = {
        structure: organized.structure,
        nameMapping: organized.nameMapping,
        totalOrganized: organized.totalOrganized,
        confidence
      };

      log.success(
        'Image Organizer completed successfully',
        {
          duration: `${duration}ms`,
          totalOrganized: organized.totalOrganized,
          rooms: organized.structure.rooms.length,
          epicwg: organized.structure.epicwg.length,
          partners: organized.structure.partners.length,
          confidence
        },
        'image-organizer'
      );

      return {
        success: true,
        data: result,
        confidence,
        timestamp: new Date()
      };
    } catch (error: any) {
      log.error('Image Organizer Agent failed', error.message, 'image-organizer');

      return {
        success: false,
        error: error.message,
        confidence: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Ensure target directories exist
   */
  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(this.imageDirs.rooms, { recursive: true });
    await fs.mkdir(this.imageDirs.epicwg, { recursive: true });
    await fs.mkdir(this.imageDirs.partners, { recursive: true });

    log.info('Created image directories', this.imageDirs, 'image-organizer');
  }

  /**
   * Organize downloaded images into proper directories
   */
  private async organizeImages(): Promise<{
    structure: {
      rooms: string[];
      epicwg: string[];
      partners: string[];
    };
    nameMapping: Record<string, string>;
    totalOrganized: number;
  }> {
    const structure = {
      rooms: [] as string[],
      epicwg: [] as string[],
      partners: [] as string[]
    };

    const nameMapping: Record<string, string> = {};
    let totalOrganized = 0;

    for (const image of this.imageManifest.downloaded) {
      try {
        // Categorize image
        const category = this.categorizeImage(image.url, image.path);

        // Generate new filename
        const newFilename = this.generateFilename(image.url, category.type);

        // Construct target path
        const targetPath = path.join(category.targetDir, newFilename);

        // Check if source file exists
        const sourceExists = await this.fileExists(image.path);
        if (!sourceExists) {
          log.warn(`Source image not found: ${image.path}`, undefined, 'image-organizer');
          continue;
        }

        // Copy/move image to target directory
        await this.copyImage(image.path, targetPath);

        // Update mappings
        nameMapping[image.url] = targetPath;

        // Add to structure
        const relativePath = path.relative(this.baseDir, targetPath);
        switch (category.type) {
          case 'room':
            structure.rooms.push(relativePath);
            break;
          case 'epicwg':
            structure.epicwg.push(relativePath);
            break;
          case 'partner':
            structure.partners.push(relativePath);
            break;
        }

        totalOrganized++;
      } catch (error: any) {
        log.warn(
          `Failed to organize image: ${image.url}`,
          { error: error.message },
          'image-organizer'
        );
      }
    }

    return { structure, nameMapping, totalOrganized };
  }

  /**
   * Categorize image based on URL or path
   */
  private categorizeImage(url: string, downloadPath: string): ImageCategory {
    const urlLower = url.toLowerCase();
    const pathLower = downloadPath.toLowerCase();

    // Determine category from URL or path patterns
    if (urlLower.includes('room') || urlLower.includes('zimmer') || pathLower.includes('room')) {
      return {
        type: 'room',
        targetDir: this.imageDirs.rooms
      };
    }

    if (urlLower.includes('partner') || pathLower.includes('partner')) {
      return {
        type: 'partner',
        targetDir: this.imageDirs.partners
      };
    }

    // Default to epicwg (general WG images)
    return {
      type: 'epicwg',
      targetDir: this.imageDirs.epicwg
    };
  }

  /**
   * Generate filename from URL with naming conventions
   */
  private generateFilename(url: string, type: string): string {
    // Extract original filename from URL
    const urlPath = new URL(url).pathname;
    const originalFilename = path.basename(urlPath);

    // Get extension
    const ext = path.extname(originalFilename);

    // Create clean filename
    const baseName = path.basename(originalFilename, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Add prefix based on type
    const prefix = type === 'room' ? 'room-' : type === 'partner' ? 'partner-' : 'wg-';

    // Generate unique filename with timestamp if needed
    const timestamp = Date.now();
    const filename = `${prefix}${baseName}-${timestamp}${ext}`;

    return filename;
  }

  /**
   * Copy image to target location
   */
  private async copyImage(sourcePath: string, targetPath: string): Promise<void> {
    // Check if target already exists
    const targetExists = await this.fileExists(targetPath);
    if (targetExists) {
      log.warn(`Target already exists, skipping: ${targetPath}`, undefined, 'image-organizer');
      return;
    }

    // Copy file
    await fs.copyFile(sourcePath, targetPath);

    log.info(`Copied image: ${sourcePath} -> ${targetPath}`, undefined, 'image-organizer');
  }

  /**
   * Validate all image paths exist
   */
  private async validatePaths(organized: {
    structure: { rooms: string[]; epicwg: string[]; partners: string[] };
    nameMapping: Record<string, string>;
    totalOrganized: number;
  }): Promise<number> {
    let validCount = 0;

    const allPaths = [
      ...organized.structure.rooms,
      ...organized.structure.epicwg,
      ...organized.structure.partners
    ];

    for (const relativePath of allPaths) {
      const fullPath = path.join(this.baseDir, relativePath);
      const exists = await this.fileExists(fullPath);
      if (exists) {
        validCount++;
      } else {
        log.warn(`Validation failed: ${fullPath} does not exist`, undefined, 'image-organizer');
      }
    }

    return validCount;
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    organized: {
      structure: { rooms: string[]; epicwg: string[]; partners: string[] };
      nameMapping: Record<string, string>;
      totalOrganized: number;
    },
    validCount: number
  ): number {
    let score = 0.5; // Base confidence

    // Organization success rate
    const totalDownloaded = this.imageManifest.downloaded.length;
    if (totalDownloaded > 0) {
      const organizedRatio = organized.totalOrganized / totalDownloaded;
      score += organizedRatio * 0.3;
    }

    // Validation success rate
    const totalOrganized = organized.totalOrganized;
    if (totalOrganized > 0) {
      const validRatio = validCount / totalOrganized;
      score += validRatio * 0.2;
    }

    // Distribution balance (penalize if all images in one category)
    const categories = [
      organized.structure.rooms.length,
      organized.structure.epicwg.length,
      organized.structure.partners.length
    ];
    const nonZeroCategories = categories.filter(c => c > 0).length;
    if (nonZeroCategories > 1) {
      score += 0.1;
    }

    // Ensure score is between 0 and 1
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Generate image index/manifest file
   */
  async generateManifest(organized: OrganizedImages): Promise<void> {
    const manifestPath = path.join(this.baseDir, 'image-manifest.json');

    const manifest = {
      generatedAt: new Date().toISOString(),
      totalImages: organized.totalOrganized,
      structure: organized.structure,
      nameMapping: organized.nameMapping,
      stats: {
        rooms: organized.structure.rooms.length,
        epicwg: organized.structure.epicwg.length,
        partners: organized.structure.partners.length
      }
    };

    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

    log.success(`Image manifest generated: ${manifestPath}`, undefined, 'image-organizer');
  }
}
