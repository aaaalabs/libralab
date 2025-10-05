import { getLogger } from '../utils/logger';
import { saveText, saveJSON } from '../utils/file-system';
import path from 'path';
import type {
  ComparisonResult,
  DiffReport,
  DiffSection,
  RoomComparison,
  ChangeDetail,
  AgentResult
} from '../types';

const log = getLogger();

/**
 * Diff Generator Agent - Phase 3 Comparison
 * Generates human-readable diff reports from comparison results
 */
export default class DiffGeneratorAgent {
  private comparison: ComparisonResult;
  private outputDir: string;

  constructor(comparison: ComparisonResult, outputDir?: string) {
    this.comparison = comparison;
    this.outputDir = outputDir || path.join(process.cwd(), 'scripts/rescue/outputs/03-comparison');
  }

  /**
   * Execute the diff generator agent
   */
  async execute(): Promise<AgentResult<DiffReport>> {
    const startTime = Date.now();
    log.info('Starting Diff Generator Agent', undefined, 'diff-generator');

    try {
      const report = await this.generateReport();
      const duration = Date.now() - startTime;

      // Save reports
      await this.saveReports(report);

      log.success(
        'Diff Generator completed successfully',
        {
          duration: `${duration}ms`,
          markdownSize: `${report.markdown.length} chars`,
          jsonSize: `${report.json.length} chars`
        },
        'diff-generator'
      );

      return {
        success: true,
        data: report,
        confidence: 1.0,
        timestamp: new Date()
      };
    } catch (error: any) {
      log.error('Diff Generator Agent failed', error.message, 'diff-generator');

      return {
        success: false,
        error: error.message,
        confidence: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Generate comprehensive diff report
   */
  private async generateReport(): Promise<DiffReport> {
    const summary = this.generateSummary();
    const sections = {
      rooms: this.generateRoomSections(),
      pricing: this.generatePricingSections(),
      features: this.generateFeatureSections(),
      images: this.generateImageSections()
    };

    const markdown = this.generateMarkdown(summary, sections);
    const json = JSON.stringify(this.comparison, null, 2);

    return {
      summary,
      sections,
      markdown,
      json,
      timestamp: new Date()
    };
  }

  /**
   * Generate executive summary
   */
  private generateSummary(): string {
    const { stats, criticalChanges, added, removed, modified } = this.comparison;

    const parts = [];

    parts.push(`Total rooms: ${stats.totalRooms}`);
    parts.push(`Changed: ${stats.changedRooms}`);
    parts.push(`Added: ${stats.addedRooms}`);
    parts.push(`Removed: ${stats.removedRooms}`);
    parts.push(`Unchanged: ${stats.unchangedRooms}`);

    if (criticalChanges.length > 0) {
      parts.push(`CRITICAL: ${criticalChanges.length} critical changes detected!`);
    }

    return parts.join(' | ');
  }

  /**
   * Generate room-related diff sections
   */
  private generateRoomSections(): DiffSection[] {
    const sections: DiffSection[] = [];

    // Added rooms
    if (this.comparison.added.length > 0) {
      sections.push({
        title: 'Added Rooms',
        items: this.comparison.added.map(room =>
          `[+] ${room.title} (ID: ${room.id}) - ${room.price} EUR/month, ${room.size}m²`
        ),
        severity: 'info'
      });
    }

    // Removed rooms
    if (this.comparison.removed.length > 0) {
      sections.push({
        title: 'Removed Rooms',
        items: this.comparison.removed.map(room =>
          `[-] ${room.title} (ID: ${room.id}) - ${room.price} EUR/month, ${room.size}m²`
        ),
        severity: 'warning'
      });
    }

    // Modified rooms
    if (this.comparison.modified.length > 0) {
      sections.push({
        title: 'Modified Rooms',
        items: this.comparison.modified.map(mod =>
          this.formatRoomModification(mod)
        ),
        severity: 'warning'
      });
    }

    return sections;
  }

  /**
   * Generate pricing-related diff sections
   */
  private generatePricingSections(): DiffSection[] {
    const sections: DiffSection[] = [];
    const priceChanges: string[] = [];

    for (const mod of this.comparison.modified) {
      const priceChange = mod.changes.find(c => c.field === 'price');
      if (priceChange) {
        priceChanges.push(
          `[~] Room ${mod.roomId}: ${priceChange.oldValue} EUR → ${priceChange.newValue} EUR (${this.calculatePriceChange(priceChange)})`
        );
      }
    }

    if (priceChanges.length > 0) {
      sections.push({
        title: 'Price Changes',
        items: priceChanges,
        severity: 'critical'
      });
    }

    return sections;
  }

  /**
   * Generate feature-related diff sections
   */
  private generateFeatureSections(): DiffSection[] {
    const sections: DiffSection[] = [];
    const featureChanges: string[] = [];

    for (const mod of this.comparison.modified) {
      const featureChange = mod.changes.find(c => c.field.includes('features'));
      if (featureChange) {
        featureChanges.push(
          `[~] Room ${mod.roomId}: Features updated`
        );
      }
    }

    if (featureChanges.length > 0) {
      sections.push({
        title: 'Feature Changes',
        items: featureChanges,
        severity: 'info'
      });
    }

    return sections;
  }

  /**
   * Generate image-related diff sections
   */
  private generateImageSections(): DiffSection[] {
    const sections: DiffSection[] = [];
    const imageChanges: string[] = [];

    for (const mod of this.comparison.modified) {
      const imageChange = mod.changes.find(c => c.field.includes('images'));
      if (imageChange) {
        const oldCount = Array.isArray(imageChange.oldValue) ? imageChange.oldValue.length : 0;
        const newCount = Array.isArray(imageChange.newValue) ? imageChange.newValue.length : 0;
        imageChanges.push(
          `[~] Room ${mod.roomId}: ${oldCount} images → ${newCount} images`
        );
      }
    }

    if (imageChanges.length > 0) {
      sections.push({
        title: 'Image Changes',
        items: imageChanges,
        severity: 'info'
      });
    }

    return sections;
  }

  /**
   * Format room modification for display
   */
  private formatRoomModification(mod: RoomComparison): string {
    const changeCount = mod.changes.length;
    const criticalCount = mod.changes.filter(c => c.severity === 'critical').length;
    const warningCount = mod.changes.filter(c => c.severity === 'warning').length;

    const parts = [`[~] Room ${mod.roomId}: ${changeCount} changes`];

    if (criticalCount > 0) {
      parts.push(`(${criticalCount} critical)`);
    }
    if (warningCount > 0) {
      parts.push(`(${warningCount} warnings)`);
    }

    // Add top changes
    const topChanges = mod.changes
      .filter(c => c.severity === 'critical' || c.severity === 'warning')
      .slice(0, 3)
      .map(c => `${c.field}: ${c.oldValue} → ${c.newValue}`);

    if (topChanges.length > 0) {
      parts.push(`\n    ${topChanges.join('\n    ')}`);
    }

    return parts.join(' ');
  }

  /**
   * Calculate price change percentage
   */
  private calculatePriceChange(change: ChangeDetail): string {
    const oldPrice = Number(change.oldValue);
    const newPrice = Number(change.newValue);

    if (isNaN(oldPrice) || isNaN(newPrice) || oldPrice === 0) {
      return 'N/A';
    }

    const percentChange = ((newPrice - oldPrice) / oldPrice) * 100;
    const sign = percentChange > 0 ? '+' : '';

    return `${sign}${percentChange.toFixed(1)}%`;
  }

  /**
   * Generate markdown report
   */
  private generateMarkdown(summary: string, sections: DiffReport['sections']): string {
    const lines: string[] = [];

    // Header
    lines.push('# Data Comparison Report');
    lines.push('');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');

    // Summary
    lines.push('## Summary');
    lines.push('');
    lines.push(summary);
    lines.push('');

    // Critical changes
    if (this.comparison.criticalChanges.length > 0) {
      lines.push('## Critical Changes');
      lines.push('');
      for (const change of this.comparison.criticalChanges) {
        lines.push(`- **${change.field}**: ${change.oldValue} → ${change.newValue}`);
      }
      lines.push('');
    }

    // All sections
    const allSections = [
      ...sections.rooms,
      ...sections.pricing,
      ...sections.features,
      ...sections.images
    ];

    for (const section of allSections) {
      lines.push(`## ${section.title}`);
      lines.push('');
      lines.push(this.getSeverityBadge(section.severity));
      lines.push('');

      for (const item of section.items) {
        lines.push(item);
      }

      lines.push('');
    }

    // Detailed Changes
    if (this.comparison.modified.length > 0) {
      lines.push('## Detailed Changes by Room');
      lines.push('');

      for (const mod of this.comparison.modified) {
        lines.push(`### Room ${mod.roomId}`);
        lines.push('');
        lines.push('| Field | Old Value | New Value | Severity |');
        lines.push('|-------|-----------|-----------|----------|');

        for (const change of mod.changes) {
          lines.push(
            `| ${change.field} | ${this.formatValue(change.oldValue)} | ${this.formatValue(change.newValue)} | ${this.colorSeverity(change.severity)} |`
          );
        }

        lines.push('');
      }
    }

    return lines.join('\n');
  }

  /**
   * Get severity badge
   */
  private getSeverityBadge(severity: 'critical' | 'warning' | 'info'): string {
    switch (severity) {
      case 'critical':
        return '🔴 **CRITICAL**';
      case 'warning':
        return '🟡 **WARNING**';
      case 'info':
        return '🔵 **INFO**';
    }
  }

  /**
   * Color code severity
   */
  private colorSeverity(severity: 'critical' | 'warning' | 'info'): string {
    switch (severity) {
      case 'critical':
        return '🔴 Critical';
      case 'warning':
        return '🟡 Warning';
      case 'info':
        return '🔵 Info';
    }
  }

  /**
   * Format value for display
   */
  private formatValue(value: any): string {
    if (value === undefined || value === null) {
      return '_empty_';
    }

    if (Array.isArray(value)) {
      return `[${value.length} items]`;
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  /**
   * Save reports to disk
   */
  private async saveReports(report: DiffReport): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Save markdown report
    const markdownPath = path.join(this.outputDir, `diff-report-${timestamp}.md`);
    await saveText(markdownPath, report.markdown);
    log.info(`Saved markdown report to ${markdownPath}`, undefined, 'diff-generator');

    // Save JSON report
    const jsonPath = path.join(this.outputDir, `diff-report-${timestamp}.json`);
    await saveJSON(jsonPath, this.comparison);
    log.info(`Saved JSON report to ${jsonPath}`, undefined, 'diff-generator');

    // Save summary
    const summaryPath = path.join(this.outputDir, `summary-${timestamp}.txt`);
    await saveText(summaryPath, report.summary);
    log.info(`Saved summary to ${summaryPath}`, undefined, 'diff-generator');
  }
}
