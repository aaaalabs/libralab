/**
 * JSON Generator Agent - Phase 4 Implementation
 * Takes ExtractedData and ComparisonResult to generate new epicwg.json
 * Creates backup, validates schema, applies auto-fixes
 */

import { promises as fs } from 'fs';
import path from 'path';
import { getLogger } from '../utils/logger';
import { BackupManager } from '../utils/backup-manager';
import { SchemaValidator } from '../utils/schema-validator';
import type {
  ExtractedData,
  ComparisonResult,
  GeneratorResult,
  AgentResult,
  EpicWGData
} from '../types';

const log = getLogger();

export default class JSONGeneratorAgent {
  private extractedData: ExtractedData;
  private comparisonResult: ComparisonResult;
  private backupManager: BackupManager;
  private schemaValidator: SchemaValidator;
  private targetFile: string;

  constructor(
    extractedData: ExtractedData,
    comparisonResult: ComparisonResult,
    targetFile: string = './src/data/epicwg.json'
  ) {
    this.extractedData = extractedData;
    this.comparisonResult = comparisonResult;
    this.targetFile = targetFile;
    this.backupManager = new BackupManager('./scripts/rescue/backups');
    this.schemaValidator = new SchemaValidator();
  }

  /**
   * Execute the JSON generator agent
   */
  async execute(): Promise<AgentResult<GeneratorResult>> {
    const startTime = Date.now();
    log.info(
      'Starting JSON Generator Agent',
      {
        totalRooms: this.extractedData.rooms.length,
        changes: {
          added: this.comparisonResult.added.length,
          removed: this.comparisonResult.removed.length,
          modified: this.comparisonResult.modified.length
        }
      },
      'json-generator'
    );

    try {
      // Create backup of current file
      const backupPath = await this.createBackup();

      // Generate new JSON structure
      const newJSON = this.generateJSON();

      // Validate schema
      let validated = this.schemaValidator.validate(newJSON);

      // Apply auto-fixes if needed
      let finalJSON = newJSON;
      if (!validated.valid && validated.errors.length > 0) {
        log.warn(
          'Schema validation failed, applying auto-fixes',
          { errors: validated.errors.length },
          'json-generator'
        );

        finalJSON = this.schemaValidator.autoFix(newJSON);
        validated = this.schemaValidator.validate(finalJSON);
        validated.autoFixed = true;
      }

      // Calculate confidence
      const confidence = this.calculateConfidence(validated);

      const duration = Date.now() - startTime;

      const result: GeneratorResult = {
        newJSON: finalJSON,
        validated: validated.valid,
        schemaValidation: validated,
        backupPath,
        confidence
      };

      log.success(
        'JSON Generator completed successfully',
        {
          duration: `${duration}ms`,
          validated: validated.valid,
          autoFixed: validated.autoFixed,
          confidence
        },
        'json-generator'
      );

      return {
        success: true,
        data: result,
        confidence,
        timestamp: new Date()
      };
    } catch (error: any) {
      log.error('JSON Generator Agent failed', error.message, 'json-generator');

      return {
        success: false,
        error: error.message,
        confidence: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Create backup of current epicwg.json
   */
  private async createBackup(): Promise<string> {
    try {
      // Check if file exists
      await fs.access(this.targetFile);

      // Create backup
      const backupPath = await this.backupManager.createBackup(this.targetFile);
      return backupPath;
    } catch (error: any) {
      // File doesn't exist, no backup needed
      if (error.code === 'ENOENT') {
        log.info('Target file does not exist, skipping backup', undefined, 'json-generator');
        return 'none';
      }
      throw error;
    }
  }

  /**
   * Generate new JSON structure
   */
  private generateJSON(): EpicWGData {
    const rooms = this.extractedData.rooms;

    // Sort rooms by ID for consistency
    const sortedRooms = [...rooms].sort((a, b) => a.id.localeCompare(b.id));

    // Create new JSON structure
    const newJSON: EpicWGData = {
      rooms: sortedRooms,
      lastUpdated: new Date(),
      version: this.generateVersion()
    };

    log.info(
      'Generated new JSON structure',
      {
        totalRooms: sortedRooms.length,
        version: newJSON.version
      },
      'json-generator'
    );

    return newJSON;
  }

  /**
   * Generate version string based on changes
   */
  private generateVersion(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}.${month}.${day}`;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(validation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
    autoFixed: boolean;
  }): number {
    let score = 0.5; // Base confidence

    // Schema validation success
    if (validation.valid) {
      score += 0.3;
    } else {
      score -= 0.2;
    }

    // Auto-fixes penalty
    if (validation.autoFixed) {
      score -= 0.1;
    }

    // Errors penalty
    score -= validation.errors.length * 0.05;

    // Warnings penalty (less severe)
    score -= validation.warnings.length * 0.02;

    // Data quality from comparison
    if (this.comparisonResult.confidence > 0.8) {
      score += 0.2;
    } else if (this.comparisonResult.confidence < 0.5) {
      score -= 0.1;
    }

    // Ensure score is between 0 and 1
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Save generated JSON to file with pretty printing
   */
  async saveJSON(data: any, outputPath?: string): Promise<void> {
    const filePath = outputPath || this.targetFile;

    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // Pretty-print with 2-space indent
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonString, 'utf-8');

    log.success(`JSON saved to ${filePath}`, undefined, 'json-generator');
  }
}
