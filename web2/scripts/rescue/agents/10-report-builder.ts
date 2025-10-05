import { getLogger } from '../utils/logger';
import { saveText, saveJSON } from '../utils/file-system';
import path from 'path';
import type {
  ComparisonResult,
  DiffReport,
  StatusReport,
  Finding,
  Risk,
  AgentResult,
  CrawlerOutput,
  URLMap,
  StructureMap
} from '../types';

const log = getLogger();

interface AllPhaseOutputs {
  phase1?: {
    crawler?: CrawlerOutput;
    urlMap?: URLMap;
    structure?: StructureMap;
  };
  phase2?: {
    extraction?: any;
  };
  phase3: {
    comparison: ComparisonResult;
    diffReport: DiffReport;
  };
}

/**
 * Report Builder Agent - Phase 3 Comparison
 * Compiles comprehensive status report from all phases
 */
export default class ReportBuilderAgent {
  private allOutputs: AllPhaseOutputs;
  private outputDir: string;

  constructor(allOutputs: AllPhaseOutputs, outputDir?: string) {
    this.allOutputs = allOutputs;
    this.outputDir = outputDir || path.join(process.cwd(), 'scripts/rescue/outputs/03-comparison');
  }

  /**
   * Execute the report builder agent
   */
  async execute(): Promise<AgentResult<StatusReport>> {
    const startTime = Date.now();
    log.info('Starting Report Builder Agent', undefined, 'report-builder');

    try {
      const report = await this.buildReport();
      const duration = Date.now() - startTime;

      // Save reports
      await this.saveReports(report);

      log.success(
        'Report Builder completed successfully',
        {
          duration: `${duration}ms`,
          findings: report.findings.length,
          risks: report.risks.length,
          nextSteps: report.nextSteps.length
        },
        'report-builder'
      );

      return {
        success: true,
        data: report,
        confidence: 1.0,
        timestamp: new Date()
      };
    } catch (error: any) {
      log.error('Report Builder Agent failed', error.message, 'report-builder');

      return {
        success: false,
        error: error.message,
        confidence: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Build comprehensive status report
   */
  private async buildReport(): Promise<StatusReport> {
    const findings = this.analyzeFindings();
    const risks = this.assessRisks();
    const nextSteps = this.generateNextSteps();
    const artifacts = this.catalogArtifacts();
    const summary = this.generateSummary(findings, risks);
    const progress = this.calculateProgress();

    return {
      phase: 'Phase 3: Comparison & Analysis',
      progress,
      findings,
      risks,
      nextSteps,
      artifacts,
      summary,
      timestamp: new Date()
    };
  }

  /**
   * Analyze findings from all phases
   */
  private analyzeFindings(): Finding[] {
    const findings: Finding[] = [];
    const { comparison } = this.allOutputs.phase3;

    // Data findings
    if (comparison.added.length > 0) {
      findings.push({
        category: 'data',
        severity: 'info',
        message: `${comparison.added.length} new rooms detected`,
        details: comparison.added.map(r => ({ id: r.id, title: r.title }))
      });
    }

    if (comparison.removed.length > 0) {
      findings.push({
        category: 'data',
        severity: 'warning',
        message: `${comparison.removed.length} rooms removed`,
        details: comparison.removed.map(r => ({ id: r.id, title: r.title }))
      });
    }

    if (comparison.modified.length > 0) {
      findings.push({
        category: 'data',
        severity: 'warning',
        message: `${comparison.modified.length} rooms modified`,
        details: {
          totalChanges: comparison.modified.reduce((sum, mod) => sum + mod.changes.length, 0),
          criticalChanges: comparison.criticalChanges.length
        }
      });
    }

    // Critical changes
    if (comparison.criticalChanges.length > 0) {
      findings.push({
        category: 'data',
        severity: 'critical',
        message: `${comparison.criticalChanges.length} critical changes detected`,
        details: comparison.criticalChanges.map(c => ({
          field: c.field,
          oldValue: c.oldValue,
          newValue: c.newValue
        }))
      });
    }

    // Phase 1 findings
    if (this.allOutputs.phase1?.crawler) {
      findings.push({
        category: 'structure',
        severity: 'info',
        message: `Discovered ${this.allOutputs.phase1.crawler.urls.length} URLs`,
        details: {
          confidence: this.allOutputs.phase1.crawler.confidence,
          pageTypes: Object.keys(this.allOutputs.phase1.crawler.pageTypes).length
        }
      });
    }

    if (this.allOutputs.phase1?.structure) {
      findings.push({
        category: 'structure',
        severity: 'info',
        message: 'Structure analysis completed',
        details: {
          components: Object.keys(this.allOutputs.phase1.structure.components).length,
          confidence: this.allOutputs.phase1.structure.confidence
        }
      });
    }

    return findings;
  }

  /**
   * Assess risks from comparison results
   */
  private assessRisks(): Risk[] {
    const risks: Risk[] = [];
    const { comparison } = this.allOutputs.phase3;

    // Critical changes risk
    if (comparison.criticalChanges.length > 0) {
      const priceChanges = comparison.criticalChanges.filter(c => c.field.includes('price'));
      const availabilityChanges = comparison.criticalChanges.filter(c => c.field.includes('availability'));

      if (priceChanges.length > 0) {
        risks.push({
          level: 'high',
          category: 'Pricing',
          description: `${priceChanges.length} price changes detected that may affect customer expectations`,
          mitigation: 'Review all price changes and update customer communications'
        });
      }

      if (availabilityChanges.length > 0) {
        risks.push({
          level: 'high',
          category: 'Availability',
          description: `${availabilityChanges.length} availability changes that may impact bookings`,
          mitigation: 'Verify availability status and notify affected customers'
        });
      }
    }

    // Data integrity risk
    if (comparison.removed.length > 0) {
      risks.push({
        level: 'medium',
        category: 'Data Integrity',
        description: `${comparison.removed.length} rooms were removed from the dataset`,
        mitigation: 'Verify that removed rooms are intentional and handle existing references'
      });
    }

    // Large-scale changes risk
    const changeRatio = comparison.stats.changedRooms / comparison.stats.totalRooms;
    if (changeRatio > 0.5) {
      risks.push({
        level: 'medium',
        category: 'Data Quality',
        description: `${(changeRatio * 100).toFixed(1)}% of rooms have changes - unusually high`,
        mitigation: 'Perform manual review of changes to ensure data quality'
      });
    }

    // Confidence risk
    if (comparison.confidence < 0.7) {
      risks.push({
        level: 'medium',
        category: 'Confidence',
        description: `Low comparison confidence (${(comparison.confidence * 100).toFixed(1)}%)`,
        mitigation: 'Review comparison logic and data quality'
      });
    }

    return risks;
  }

  /**
   * Generate next steps recommendations
   */
  private generateNextSteps(): string[] {
    const steps: string[] = [];
    const { comparison } = this.allOutputs.phase3;

    // Always recommend reviewing the diff report
    steps.push('Review the detailed diff report for all changes');

    // Critical changes
    if (comparison.criticalChanges.length > 0) {
      steps.push(`Address ${comparison.criticalChanges.length} critical changes before proceeding`);
    }

    // New rooms
    if (comparison.added.length > 0) {
      steps.push(`Validate ${comparison.added.length} new rooms and ensure all required fields are populated`);
    }

    // Removed rooms
    if (comparison.removed.length > 0) {
      steps.push(`Confirm removal of ${comparison.removed.length} rooms and update any references`);
    }

    // Price changes
    const priceChanges = comparison.criticalChanges.filter(c => c.field.includes('price'));
    if (priceChanges.length > 0) {
      steps.push('Update pricing information across all customer-facing channels');
    }

    // Phase 4 preparation
    steps.push('Proceed to Phase 4: Implementation once all changes are validated');
    steps.push('Create backup of current production data before deploying changes');
    steps.push('Schedule deployment during low-traffic period');

    return steps;
  }

  /**
   * Catalog all artifacts generated
   */
  private catalogArtifacts(): StatusReport['artifacts'] {
    const artifacts: StatusReport['artifacts'] = [];
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Phase 3 artifacts
    artifacts.push({
      path: path.join(this.outputDir, `diff-report-${timestamp}.md`),
      type: 'markdown',
      description: 'Human-readable diff report with all changes'
    });

    artifacts.push({
      path: path.join(this.outputDir, `diff-report-${timestamp}.json`),
      type: 'json',
      description: 'Machine-readable comparison data'
    });

    artifacts.push({
      path: path.join(this.outputDir, `status-report-${timestamp}.md`),
      type: 'markdown',
      description: 'Comprehensive status report with findings and recommendations'
    });

    artifacts.push({
      path: path.join(this.outputDir, `status-report-${timestamp}.json`),
      type: 'json',
      description: 'Structured status report data'
    });

    return artifacts;
  }

  /**
   * Generate executive summary
   */
  private generateSummary(findings: Finding[], risks: Risk[]): string {
    const { comparison } = this.allOutputs.phase3;
    const lines: string[] = [];

    lines.push('AUTONOMOUS RESCUE SYSTEM - PHASE 3 COMPARISON REPORT');
    lines.push('='.repeat(60));
    lines.push('');

    // Overview
    lines.push('OVERVIEW:');
    lines.push(`  Total Rooms: ${comparison.stats.totalRooms}`);
    lines.push(`  Unchanged: ${comparison.stats.unchangedRooms} (${((comparison.stats.unchangedRooms / comparison.stats.totalRooms) * 100).toFixed(1)}%)`);
    lines.push(`  Modified: ${comparison.stats.changedRooms}`);
    lines.push(`  Added: ${comparison.stats.addedRooms}`);
    lines.push(`  Removed: ${comparison.stats.removedRooms}`);
    lines.push('');

    // Critical findings
    const criticalFindings = findings.filter(f => f.severity === 'critical');
    if (criticalFindings.length > 0) {
      lines.push('CRITICAL FINDINGS:');
      for (const finding of criticalFindings) {
        lines.push(`  - ${finding.message}`);
      }
      lines.push('');
    }

    // High-priority risks
    const highRisks = risks.filter(r => r.level === 'high');
    if (highRisks.length > 0) {
      lines.push('HIGH-PRIORITY RISKS:');
      for (const risk of highRisks) {
        lines.push(`  - ${risk.category}: ${risk.description}`);
        if (risk.mitigation) {
          lines.push(`    Mitigation: ${risk.mitigation}`);
        }
      }
      lines.push('');
    }

    // Status
    lines.push('STATUS:');
    if (comparison.criticalChanges.length === 0 && highRisks.length === 0) {
      lines.push('  ✅ Phase 3 completed successfully - ready to proceed to Phase 4');
    } else if (comparison.criticalChanges.length > 0) {
      lines.push('  ⚠️  Critical changes detected - review required before proceeding');
    } else {
      lines.push('  ⚠️  Some risks identified - review recommended');
    }

    lines.push('');
    lines.push(`Confidence: ${(comparison.confidence * 100).toFixed(1)}%`);
    lines.push(`Generated: ${new Date().toISOString()}`);

    return lines.join('\n');
  }

  /**
   * Calculate overall progress
   */
  private calculateProgress(): number {
    // Phase 3 is complete when this report is generated
    // Return 0.75 (75%) as we're at the end of Phase 3, before Phase 4
    return 0.75;
  }

  /**
   * Save reports to disk
   */
  private async saveReports(report: StatusReport): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Save markdown report
    const markdownPath = path.join(this.outputDir, `status-report-${timestamp}.md`);
    const markdown = this.generateMarkdownReport(report);
    await saveText(markdownPath, markdown);
    log.info(`Saved markdown report to ${markdownPath}`, undefined, 'report-builder');

    // Save JSON report
    const jsonPath = path.join(this.outputDir, `status-report-${timestamp}.json`);
    await saveJSON(jsonPath, report);
    log.info(`Saved JSON report to ${jsonPath}`, undefined, 'report-builder');

    // Save executive summary
    const summaryPath = path.join(this.outputDir, `executive-summary-${timestamp}.txt`);
    await saveText(summaryPath, report.summary);
    log.info(`Saved executive summary to ${summaryPath}`, undefined, 'report-builder');
  }

  /**
   * Generate markdown format report
   */
  private generateMarkdownReport(report: StatusReport): string {
    const lines: string[] = [];

    // Header
    lines.push(`# ${report.phase} - Status Report`);
    lines.push('');
    lines.push(`**Generated:** ${report.timestamp.toISOString()}`);
    lines.push(`**Progress:** ${(report.progress * 100).toFixed(1)}%`);
    lines.push('');

    // Executive Summary
    lines.push('## Executive Summary');
    lines.push('');
    lines.push('```');
    lines.push(report.summary);
    lines.push('```');
    lines.push('');

    // Findings
    lines.push('## Findings');
    lines.push('');

    const findingsByCategory: Record<string, Finding[]> = {};
    for (const finding of report.findings) {
      if (!findingsByCategory[finding.category]) {
        findingsByCategory[finding.category] = [];
      }
      findingsByCategory[finding.category].push(finding);
    }

    for (const [category, findings] of Object.entries(findingsByCategory)) {
      lines.push(`### ${category.charAt(0).toUpperCase() + category.slice(1)}`);
      lines.push('');

      for (const finding of findings) {
        const icon = finding.severity === 'critical' ? '🔴' : finding.severity === 'warning' ? '🟡' : '🔵';
        lines.push(`${icon} **${finding.message}**`);
        if (finding.details) {
          lines.push('```json');
          lines.push(JSON.stringify(finding.details, null, 2));
          lines.push('```');
        }
        lines.push('');
      }
    }

    // Risks
    lines.push('## Risk Assessment');
    lines.push('');

    const risksByLevel: Record<string, Risk[]> = {};
    for (const risk of report.risks) {
      if (!risksByLevel[risk.level]) {
        risksByLevel[risk.level] = [];
      }
      risksByLevel[risk.level].push(risk);
    }

    for (const level of ['high', 'medium', 'low']) {
      const risks = risksByLevel[level] || [];
      if (risks.length === 0) continue;

      const icon = level === 'high' ? '🔴' : level === 'medium' ? '🟡' : '🟢';
      lines.push(`### ${icon} ${level.toUpperCase()} Priority`);
      lines.push('');

      for (const risk of risks) {
        lines.push(`**${risk.category}**`);
        lines.push(`- ${risk.description}`);
        if (risk.mitigation) {
          lines.push(`- *Mitigation:* ${risk.mitigation}`);
        }
        lines.push('');
      }
    }

    // Next Steps
    lines.push('## Next Steps');
    lines.push('');

    for (let i = 0; i < report.nextSteps.length; i++) {
      lines.push(`${i + 1}. ${report.nextSteps[i]}`);
    }
    lines.push('');

    // Artifacts
    lines.push('## Generated Artifacts');
    lines.push('');

    for (const artifact of report.artifacts) {
      lines.push(`- **${artifact.type.toUpperCase()}**: \`${artifact.path}\``);
      lines.push(`  ${artifact.description}`);
    }
    lines.push('');

    return lines.join('\n');
  }
}
