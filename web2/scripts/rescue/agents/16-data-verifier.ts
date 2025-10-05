/**
 * Data Verifier Agent - Phase 5 Validation
 * Verifies data completeness, accuracy, and consistency
 */

import { promises as fs } from 'fs';
import path from 'path';
import { getLogger } from '../utils/logger';
import { loadJSON } from '../utils/file-system';
import type { AgentResult, RoomData } from '../types';

const log = getLogger();

interface DataIssue {
  roomId: string;
  field: string;
  issue: string;
  severity: 'critical' | 'warning' | 'info';
}

interface TranslationIssue {
  key: string;
  language: string;
  issue: string;
}

interface DataAnomaly {
  type: string;
  description: string;
  affectedRooms: string[];
  severity: 'critical' | 'warning' | 'info';
}

interface VerificationReport {
  completeness: number; // percentage
  accuracy: number; // percentage
  consistency: number; // percentage
  missingData: DataIssue[];
  translationIssues: TranslationIssue[];
  anomalies: DataAnomaly[];
  imageVerification: {
    totalImages: number;
    existingImages: number;
    missingImages: string[];
  };
  priceAnalysis: {
    min: number;
    max: number;
    average: number;
    outliers: string[];
  };
  summary: string;
}

interface DataVerifierConfig {
  dataPath: string;
  imagesDir?: string;
  priceRange?: { min: number; max: number };
  requiredFields?: string[];
}

/**
 * Data Verifier Agent
 * Validates data quality, completeness, and consistency
 */
export default class DataVerifierAgent {
  private config: DataVerifierConfig;
  private rooms: RoomData[] = [];

  constructor(config: DataVerifierConfig) {
    this.config = {
      priceRange: { min: 500, max: 3000 },
      requiredFields: ['id', 'title', 'price', 'size', 'description', 'images', 'availability'],
      ...config
    };
  }

  /**
   * Execute the data verifier agent
   */
  async execute(): Promise<AgentResult<VerificationReport>> {
    const startTime = Date.now();
    log.info('Starting Data Verifier Agent', { dataPath: this.config.dataPath }, 'data-verifier');

    try {
      // Load data
      await this.loadData();

      // Run verification
      const report = await this.verifyData();
      const duration = Date.now() - startTime;

      const confidence = this.calculateConfidence(report);

      log.success(
        'Data Verifier completed',
        {
          duration: `${duration}ms`,
          completeness: report.completeness.toFixed(1) + '%',
          accuracy: report.accuracy.toFixed(1) + '%',
          issues: report.missingData.length,
          confidence: confidence.toFixed(2)
        },
        'data-verifier'
      );

      return {
        success: true,
        data: report,
        confidence,
        timestamp: new Date()
      };
    } catch (error: any) {
      log.error('Data Verifier Agent failed', error.message, 'data-verifier');

      return {
        success: false,
        error: error.message,
        confidence: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Load room data
   */
  private async loadData(): Promise<void> {
    try {
      const data = await loadJSON<{ rooms: RoomData[] }>(this.config.dataPath);
      this.rooms = data.rooms || [];
      log.info(`Loaded ${this.rooms.length} rooms`, undefined, 'data-verifier');
    } catch (error: any) {
      throw new Error(`Failed to load data from ${this.config.dataPath}: ${error.message}`);
    }
  }

  /**
   * Verify all data aspects
   */
  private async verifyData(): Promise<VerificationReport> {
    // Check completeness
    log.info('Checking data completeness...', undefined, 'data-verifier');
    const { completeness, missingData } = this.checkCompleteness();

    // Check translations
    log.info('Verifying translations...', undefined, 'data-verifier');
    const translationIssues = this.verifyTranslations();

    // Verify images
    log.info('Verifying image paths...', undefined, 'data-verifier');
    const imageVerification = await this.verifyImages();

    // Analyze prices
    log.info('Analyzing price data...', undefined, 'data-verifier');
    const priceAnalysis = this.analyzePrices();

    // Check consistency
    log.info('Checking data consistency...', undefined, 'data-verifier');
    const { consistency, anomalies } = this.checkConsistency();

    // Calculate accuracy (based on valid data)
    const accuracy = this.calculateAccuracy(missingData, anomalies);

    const summary = this.generateSummary({
      completeness,
      accuracy,
      consistency,
      missingData,
      translationIssues,
      anomalies,
      imageVerification,
      priceAnalysis,
      summary: ''
    });

    return {
      completeness,
      accuracy,
      consistency,
      missingData,
      translationIssues,
      anomalies,
      imageVerification,
      priceAnalysis,
      summary
    };
  }

  /**
   * Check data completeness
   */
  private checkCompleteness(): { completeness: number; missingData: DataIssue[] } {
    const missingData: DataIssue[] = [];
    const requiredFields = this.config.requiredFields!;

    for (const room of this.rooms) {
      // Check required fields
      for (const field of requiredFields) {
        if (!room[field] || (Array.isArray(room[field]) && room[field].length === 0)) {
          missingData.push({
            roomId: room.id,
            field,
            issue: `Missing or empty ${field}`,
            severity: this.getFieldSeverity(field)
          });
        }
      }

      // Check specific field validations
      if (room.title && room.title.length < 5) {
        missingData.push({
          roomId: room.id,
          field: 'title',
          issue: 'Title too short (< 5 characters)',
          severity: 'warning'
        });
      }

      if (room.description && room.description.length < 20) {
        missingData.push({
          roomId: room.id,
          field: 'description',
          issue: 'Description too short (< 20 characters)',
          severity: 'warning'
        });
      }

      if (room.images && room.images.length === 0) {
        missingData.push({
          roomId: room.id,
          field: 'images',
          issue: 'No images provided',
          severity: 'critical'
        });
      }

      if (room.price && room.price <= 0) {
        missingData.push({
          roomId: room.id,
          field: 'price',
          issue: 'Invalid price (must be > 0)',
          severity: 'critical'
        });
      }

      if (room.size && room.size <= 0) {
        missingData.push({
          roomId: room.id,
          field: 'size',
          issue: 'Invalid size (must be > 0)',
          severity: 'critical'
        });
      }
    }

    // Calculate completeness percentage
    const totalChecks = this.rooms.length * requiredFields.length;
    const missingChecks = missingData.filter(d => d.severity === 'critical').length;
    const completeness = ((totalChecks - missingChecks) / totalChecks) * 100;

    return { completeness, missingData };
  }

  /**
   * Get severity for a field
   */
  private getFieldSeverity(field: string): 'critical' | 'warning' | 'info' {
    const criticalFields = ['id', 'title', 'price', 'availability'];
    const warningFields = ['size', 'description', 'images'];

    if (criticalFields.includes(field)) return 'critical';
    if (warningFields.includes(field)) return 'warning';
    return 'info';
  }

  /**
   * Verify translation completeness
   */
  private verifyTranslations(): TranslationIssue[] {
    const issues: TranslationIssue[] = [];

    // Check if rooms have both EN and DE translations
    for (const room of this.rooms) {
      // Check title translations
      if (room.title_en && !room.title_de) {
        issues.push({
          key: `room_${room.id}_title`,
          language: 'de',
          issue: 'Missing German translation for title'
        });
      }

      if (room.title_de && !room.title_en) {
        issues.push({
          key: `room_${room.id}_title`,
          language: 'en',
          issue: 'Missing English translation for title'
        });
      }

      // Check description translations
      if (room.description_en && !room.description_de) {
        issues.push({
          key: `room_${room.id}_description`,
          language: 'de',
          issue: 'Missing German translation for description'
        });
      }

      if (room.description_de && !room.description_en) {
        issues.push({
          key: `room_${room.id}_description`,
          language: 'en',
          issue: 'Missing English translation for description'
        });
      }
    }

    return issues;
  }

  /**
   * Verify image paths exist
   */
  private async verifyImages(): Promise<{
    totalImages: number;
    existingImages: number;
    missingImages: string[];
  }> {
    const allImages: string[] = [];
    const missingImages: string[] = [];

    // Collect all image paths
    for (const room of this.rooms) {
      if (room.images && Array.isArray(room.images)) {
        allImages.push(...room.images);
      }
    }

    // Check if images exist (if imagesDir is provided)
    if (this.config.imagesDir) {
      for (const imagePath of allImages) {
        const fullPath = path.join(this.config.imagesDir, imagePath);

        try {
          await fs.access(fullPath);
        } catch {
          missingImages.push(imagePath);
        }
      }
    }

    return {
      totalImages: allImages.length,
      existingImages: allImages.length - missingImages.length,
      missingImages
    };
  }

  /**
   * Analyze price data
   */
  private analyzePrices(): {
    min: number;
    max: number;
    average: number;
    outliers: string[];
  } {
    const prices = this.rooms.map(r => r.price).filter(p => p > 0);

    if (prices.length === 0) {
      return { min: 0, max: 0, average: 0, outliers: [] };
    }

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    // Find outliers (outside configured range)
    const outliers: string[] = [];
    const { min: minRange, max: maxRange } = this.config.priceRange!;

    for (const room of this.rooms) {
      if (room.price < minRange || room.price > maxRange) {
        outliers.push(`${room.id} (${room.title}): €${room.price}`);
      }
    }

    return { min, max, average, outliers };
  }

  /**
   * Check data consistency
   */
  private checkConsistency(): { consistency: number; anomalies: DataAnomaly[] } {
    const anomalies: DataAnomaly[] = [];

    // Check price vs size consistency
    const pricePerSqm = this.rooms
      .filter(r => r.price > 0 && r.size > 0)
      .map(r => ({ id: r.id, title: r.title, ratio: r.price / r.size }));

    if (pricePerSqm.length > 0) {
      const avgRatio = pricePerSqm.reduce((sum, r) => sum + r.ratio, 0) / pricePerSqm.length;
      const outlierThreshold = avgRatio * 2; // 2x average is anomalous

      const outliers = pricePerSqm.filter(r => r.ratio > outlierThreshold);

      if (outliers.length > 0) {
        anomalies.push({
          type: 'price_size_mismatch',
          description: 'Price per sqm significantly higher than average',
          affectedRooms: outliers.map(o => `${o.id} (${o.title})`),
          severity: 'warning'
        });
      }
    }

    // Check duplicate IDs
    const ids = this.rooms.map(r => r.id);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

    if (duplicateIds.length > 0) {
      anomalies.push({
        type: 'duplicate_ids',
        description: 'Duplicate room IDs found',
        affectedRooms: [...new Set(duplicateIds)],
        severity: 'critical'
      });
    }

    // Check availability values
    const validAvailability = ['available', 'occupied', 'reserved'];
    const invalidAvailability = this.rooms.filter(
      r => r.availability && !validAvailability.includes(r.availability)
    );

    if (invalidAvailability.length > 0) {
      anomalies.push({
        type: 'invalid_availability',
        description: 'Invalid availability status',
        affectedRooms: invalidAvailability.map(r => `${r.id}: ${r.availability}`),
        severity: 'critical'
      });
    }

    // Calculate consistency score
    const totalChecks = this.rooms.length;
    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical').length;
    const consistency = ((totalChecks - criticalAnomalies) / totalChecks) * 100;

    return { consistency, anomalies };
  }

  /**
   * Calculate accuracy score
   */
  private calculateAccuracy(missingData: DataIssue[], anomalies: DataAnomaly[]): number {
    const totalIssues = missingData.length + anomalies.length;
    const criticalIssues = [
      ...missingData.filter(d => d.severity === 'critical'),
      ...anomalies.filter(a => a.severity === 'critical')
    ].length;

    // Accuracy based on lack of critical issues
    const totalRooms = this.rooms.length;
    const accuracy = ((totalRooms - criticalIssues) / totalRooms) * 100;

    return Math.max(0, Math.min(100, accuracy));
  }

  /**
   * Generate verification summary
   */
  private generateSummary(report: VerificationReport): string {
    const lines: string[] = [];

    lines.push('DATA VERIFICATION SUMMARY');
    lines.push('='.repeat(50));
    lines.push('');

    lines.push(`Total Rooms: ${this.rooms.length}`);
    lines.push(`Completeness: ${report.completeness.toFixed(1)}%`);
    lines.push(`Accuracy: ${report.accuracy.toFixed(1)}%`);
    lines.push(`Consistency: ${report.consistency.toFixed(1)}%`);
    lines.push('');

    // Missing data
    if (report.missingData.length > 0) {
      const critical = report.missingData.filter(d => d.severity === 'critical').length;
      const warnings = report.missingData.filter(d => d.severity === 'warning').length;

      lines.push('MISSING DATA:');
      lines.push(`  Critical Issues: ${critical}`);
      lines.push(`  Warnings: ${warnings}`);
      lines.push('');
    }

    // Translation issues
    if (report.translationIssues.length > 0) {
      lines.push(`Translation Issues: ${report.translationIssues.length}`);
      lines.push('');
    }

    // Image verification
    lines.push('IMAGES:');
    lines.push(`  Total: ${report.imageVerification.totalImages}`);
    lines.push(`  Existing: ${report.imageVerification.existingImages}`);
    lines.push(`  Missing: ${report.imageVerification.missingImages.length}`);
    lines.push('');

    // Price analysis
    lines.push('PRICE ANALYSIS:');
    lines.push(`  Range: €${report.priceAnalysis.min} - €${report.priceAnalysis.max}`);
    lines.push(`  Average: €${report.priceAnalysis.average.toFixed(2)}`);
    if (report.priceAnalysis.outliers.length > 0) {
      lines.push(`  Outliers: ${report.priceAnalysis.outliers.length}`);
    }
    lines.push('');

    // Anomalies
    if (report.anomalies.length > 0) {
      lines.push('ANOMALIES:');
      for (const anomaly of report.anomalies) {
        lines.push(`  - ${anomaly.type}: ${anomaly.description} (${anomaly.affectedRooms.length} rooms)`);
      }
      lines.push('');
    }

    // Overall status
    const overallScore = (report.completeness + report.accuracy + report.consistency) / 3;

    if (overallScore >= 90) {
      lines.push('✅ DATA VALIDATION PASSED - High quality data');
    } else if (overallScore >= 70) {
      lines.push('⚠️  DATA VALIDATION PARTIAL - Review and fix issues');
    } else {
      lines.push('❌ DATA VALIDATION FAILED - Significant data quality issues');
    }

    return lines.join('\n');
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(report: VerificationReport): number {
    // Base confidence on the three main metrics
    const avgScore = (report.completeness + report.accuracy + report.consistency) / 300; // Normalize to 0-1

    let confidence = avgScore;

    // Deduct for critical issues
    const criticalMissing = report.missingData.filter(d => d.severity === 'critical').length;
    const criticalAnomalies = report.anomalies.filter(a => a.severity === 'critical').length;

    confidence -= criticalMissing * 0.05;
    confidence -= criticalAnomalies * 0.1;

    // Deduct for missing images
    const imageMissingRatio = report.imageVerification.missingImages.length / report.imageVerification.totalImages;
    confidence -= imageMissingRatio * 0.2;

    // Deduct for translation issues
    confidence -= (report.translationIssues.length / this.rooms.length) * 0.1;

    return Math.max(0, Math.min(1.0, confidence));
  }
}
