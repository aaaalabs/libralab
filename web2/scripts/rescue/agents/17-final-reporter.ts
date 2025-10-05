/**
 * Final Reporter Agent - Phase 5 Validation
 * Compiles all validation results and makes GO/NO-GO deployment decision
 */

import { getLogger } from '../utils/logger';
import { saveText, saveJSON } from '../utils/file-system';
import path from 'path';
import type { AgentResult } from '../types';

const log = getLogger();

interface ValidationInputs {
  buildValidation?: {
    buildSuccess: boolean;
    typeErrors: any[];
    warnings: any[];
    confidence: number;
  };
  visualComparison?: {
    passed: boolean;
    percentDifference: number;
    structuralDifferences: any[];
    confidence: number;
  };
  dataVerification?: {
    completeness: number;
    accuracy: number;
    consistency: number;
    missingData: any[];
    anomalies: any[];
    confidence: number;
  };
}

interface Evidence {
  source: string;
  type: 'passed' | 'failed' | 'warning';
  message: string;
  confidence: number;
  details?: any;
}

interface ChecklistItem {
  task: string;
  status: 'completed' | 'pending' | 'failed';
  required: boolean;
  notes?: string;
}

interface RollbackStep {
  step: number;
  action: string;
  command?: string;
  critical: boolean;
}

interface FinalReport {
  decision: 'GO' | 'NO-GO' | 'REVIEW_REQUIRED';
  confidence: number;
  overallScore: number;
  evidence: Evidence[];
  checklist: ChecklistItem[];
  risks: Array<{
    level: 'high' | 'medium' | 'low';
    category: string;
    description: string;
    mitigation?: string;
  }>;
  rollbackPlan: RollbackStep[];
  recommendations: string[];
  summary: string;
  timestamp: Date;
}

/**
 * Final Reporter Agent
 * Makes deployment decision based on all validation results
 */
export default class FinalReporterAgent {
  private inputs: ValidationInputs;
  private outputDir: string;
  private thresholds = {
    GO: 0.85,
    REVIEW: 0.5
  };

  constructor(inputs: ValidationInputs, outputDir?: string) {
    this.inputs = inputs;
    this.outputDir =
      outputDir || path.join(process.cwd(), 'scripts/rescue/outputs/05-validation');
  }

  /**
   * Execute the final reporter agent
   */
  async execute(): Promise<AgentResult<FinalReport>> {
    const startTime = Date.now();
    log.info('Starting Final Reporter Agent', undefined, 'final-reporter');

    try {
      const report = await this.generateFinalReport();
      const duration = Date.now() - startTime;

      // Save reports
      await this.saveReports(report);

      log.success(
        `Final Reporter completed - Decision: ${report.decision}`,
        {
          duration: `${duration}ms`,
          confidence: report.confidence.toFixed(2),
          overallScore: report.overallScore.toFixed(2),
          risks: report.risks.length
        },
        'final-reporter'
      );

      return {
        success: true,
        data: report,
        confidence: report.confidence,
        timestamp: new Date()
      };
    } catch (error: any) {
      log.error('Final Reporter Agent failed', error.message, 'final-reporter');

      return {
        success: false,
        error: error.message,
        confidence: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Generate final deployment report
   */
  private async generateFinalReport(): Promise<FinalReport> {
    log.info('Compiling validation results...', undefined, 'final-reporter');

    // Collect evidence from all validation phases
    const evidence = this.collectEvidence();

    // Calculate overall confidence and score
    const { confidence, overallScore } = this.calculateOverallMetrics(evidence);

    // Make GO/NO-GO decision
    const decision = this.makeDecision(confidence, evidence);

    // Assess risks
    const risks = this.assessRisks(evidence);

    // Generate deployment checklist
    const checklist = this.generateChecklist(evidence);

    // Create rollback plan
    const rollbackPlan = this.createRollbackPlan();

    // Generate recommendations
    const recommendations = this.generateRecommendations(decision, evidence, risks);

    // Generate summary
    const summary = this.generateSummary({
      decision,
      confidence,
      overallScore,
      evidence,
      checklist,
      risks,
      rollbackPlan,
      recommendations,
      summary: '',
      timestamp: new Date()
    });

    return {
      decision,
      confidence,
      overallScore,
      evidence,
      checklist,
      risks,
      rollbackPlan,
      recommendations,
      summary,
      timestamp: new Date()
    };
  }

  /**
   * Collect evidence from all validation phases
   */
  private collectEvidence(): Evidence[] {
    const evidence: Evidence[] = [];

    // Build validation evidence
    if (this.inputs.buildValidation) {
      const build = this.inputs.buildValidation;

      evidence.push({
        source: 'Build Validation',
        type: build.buildSuccess ? 'passed' : 'failed',
        message: build.buildSuccess
          ? 'Build completed successfully'
          : `Build failed with ${build.typeErrors.length} errors`,
        confidence: build.confidence,
        details: {
          typeErrors: build.typeErrors.length,
          warnings: build.warnings.length
        }
      });

      if (build.typeErrors.length > 0 && build.buildSuccess) {
        evidence.push({
          source: 'Build Validation',
          type: 'warning',
          message: `${build.typeErrors.length} type errors detected`,
          confidence: build.confidence,
          details: { errors: build.typeErrors.slice(0, 5) }
        });
      }
    }

    // Visual comparison evidence
    if (this.inputs.visualComparison) {
      const visual = this.inputs.visualComparison;

      evidence.push({
        source: 'Visual Comparison',
        type: visual.passed ? 'passed' : 'failed',
        message: visual.passed
          ? `Visual comparison passed (${visual.percentDifference.toFixed(2)}% difference)`
          : `Visual differences exceed threshold (${visual.percentDifference.toFixed(2)}%)`,
        confidence: visual.confidence,
        details: {
          percentDifference: visual.percentDifference,
          structuralDifferences: visual.structuralDifferences.length
        }
      });
    }

    // Data verification evidence
    if (this.inputs.dataVerification) {
      const data = this.inputs.dataVerification;
      const avgQuality = (data.completeness + data.accuracy + data.consistency) / 3;

      evidence.push({
        source: 'Data Verification',
        type: avgQuality >= 90 ? 'passed' : avgQuality >= 70 ? 'warning' : 'failed',
        message: `Data quality: ${avgQuality.toFixed(1)}% (Completeness: ${data.completeness.toFixed(1)}%, Accuracy: ${data.accuracy.toFixed(1)}%, Consistency: ${data.consistency.toFixed(1)}%)`,
        confidence: data.confidence,
        details: {
          completeness: data.completeness,
          accuracy: data.accuracy,
          consistency: data.consistency,
          missingData: data.missingData.length,
          anomalies: data.anomalies.length
        }
      });

      if (data.missingData.length > 0) {
        const criticalMissing = data.missingData.filter((d: any) => d.severity === 'critical').length;

        if (criticalMissing > 0) {
          evidence.push({
            source: 'Data Verification',
            type: 'failed',
            message: `${criticalMissing} critical data issues found`,
            confidence: data.confidence,
            details: { criticalIssues: criticalMissing }
          });
        }
      }
    }

    return evidence;
  }

  /**
   * Calculate overall metrics
   */
  private calculateOverallMetrics(evidence: Evidence[]): {
    confidence: number;
    overallScore: number;
  } {
    if (evidence.length === 0) {
      return { confidence: 0, overallScore: 0 };
    }

    // Average confidence from all sources
    const avgConfidence = evidence.reduce((sum, e) => sum + e.confidence, 0) / evidence.length;

    // Calculate score based on passed/failed evidence
    const passed = evidence.filter(e => e.type === 'passed').length;
    const failed = evidence.filter(e => e.type === 'failed').length;
    const warnings = evidence.filter(e => e.type === 'warning').length;

    const overallScore = (passed * 1.0 + warnings * 0.5 + failed * 0.0) / evidence.length;

    // Combine confidence and score
    const confidence = (avgConfidence + overallScore) / 2;

    return { confidence, overallScore };
  }

  /**
   * Make GO/NO-GO decision
   */
  private makeDecision(confidence: number, evidence: Evidence[]): 'GO' | 'NO-GO' | 'REVIEW_REQUIRED' {
    // Check for critical failures
    const criticalFailures = evidence.filter(e => e.type === 'failed');

    if (criticalFailures.length > 0) {
      // Check if it's the build that failed
      const buildFailed = criticalFailures.some(e => e.source === 'Build Validation');

      if (buildFailed) {
        log.error('Build validation failed - NO-GO decision', undefined, 'final-reporter');
        return 'NO-GO';
      }
    }

    // Make decision based on confidence thresholds
    if (confidence >= this.thresholds.GO) {
      log.success('Confidence threshold met - GO decision', { confidence }, 'final-reporter');
      return 'GO';
    } else if (confidence < this.thresholds.REVIEW) {
      log.warn('Confidence below threshold - NO-GO decision', { confidence }, 'final-reporter');
      return 'NO-GO';
    } else {
      log.info('Confidence requires review - REVIEW_REQUIRED decision', { confidence }, 'final-reporter');
      return 'REVIEW_REQUIRED';
    }
  }

  /**
   * Assess deployment risks
   */
  private assessRisks(evidence: Evidence[]): FinalReport['risks'] {
    const risks: FinalReport['risks'] = [];

    // Check for build risks
    const buildEvidence = evidence.find(e => e.source === 'Build Validation');
    if (buildEvidence && buildEvidence.type === 'failed') {
      risks.push({
        level: 'high',
        category: 'Build Failure',
        description: 'Build process failed - deployment will fail',
        mitigation: 'Fix all build errors before attempting deployment'
      });
    }

    // Check for visual differences
    const visualEvidence = evidence.find(e => e.source === 'Visual Comparison');
    if (visualEvidence && visualEvidence.type === 'failed') {
      risks.push({
        level: 'medium',
        category: 'Visual Inconsistencies',
        description: 'Visual differences detected between production and local',
        mitigation: 'Review visual diff images and verify intentional changes'
      });
    }

    // Check for data quality risks
    const dataEvidence = evidence.find(e => e.source === 'Data Verification');
    if (dataEvidence && (dataEvidence.type === 'failed' || dataEvidence.type === 'warning')) {
      const criticalDataIssues = evidence.filter(
        e => e.source === 'Data Verification' && e.type === 'failed'
      );

      if (criticalDataIssues.length > 0) {
        risks.push({
          level: 'high',
          category: 'Data Quality',
          description: 'Critical data quality issues detected',
          mitigation: 'Fix missing required fields and data anomalies'
        });
      } else {
        risks.push({
          level: 'low',
          category: 'Data Quality',
          description: 'Minor data quality issues detected',
          mitigation: 'Review and address data warnings when possible'
        });
      }
    }

    // Add general deployment risks
    risks.push({
      level: 'low',
      category: 'Deployment',
      description: 'Standard deployment risks (downtime, cache invalidation)',
      mitigation: 'Deploy during low-traffic period, monitor logs, have rollback ready'
    });

    return risks;
  }

  /**
   * Generate deployment checklist
   */
  private generateChecklist(evidence: Evidence[]): ChecklistItem[] {
    const checklist: ChecklistItem[] = [];

    // Build validation
    const buildEvidence = evidence.find(e => e.source === 'Build Validation');
    checklist.push({
      task: 'Build validation',
      status: buildEvidence?.type === 'passed' ? 'completed' : 'failed',
      required: true,
      notes: buildEvidence?.message
    });

    // Visual comparison
    const visualEvidence = evidence.find(e => e.source === 'Visual Comparison');
    checklist.push({
      task: 'Visual comparison',
      status: visualEvidence?.type === 'passed' ? 'completed' : visualEvidence ? 'pending' : 'pending',
      required: false,
      notes: visualEvidence?.message || 'Not performed'
    });

    // Data verification
    const dataEvidence = evidence.find(e => e.source === 'Data Verification');
    checklist.push({
      task: 'Data verification',
      status: dataEvidence?.type === 'passed' ? 'completed' : dataEvidence ? 'pending' : 'pending',
      required: true,
      notes: dataEvidence?.message || 'Not performed'
    });

    // Pre-deployment tasks
    checklist.push({
      task: 'Backup current production data',
      status: 'pending',
      required: true,
      notes: 'Create backup before deployment'
    });

    checklist.push({
      task: 'Review changelog and migration notes',
      status: 'pending',
      required: true
    });

    checklist.push({
      task: 'Notify team of deployment window',
      status: 'pending',
      required: false
    });

    checklist.push({
      task: 'Prepare rollback procedure',
      status: 'pending',
      required: true
    });

    return checklist;
  }

  /**
   * Create rollback plan
   */
  private createRollbackPlan(): RollbackStep[] {
    return [
      {
        step: 1,
        action: 'Stop receiving new traffic',
        command: 'Disable load balancer or set maintenance mode',
        critical: true
      },
      {
        step: 2,
        action: 'Revert to previous deployment',
        command: 'vercel rollback or git revert + redeploy',
        critical: true
      },
      {
        step: 3,
        action: 'Restore database backup if data migration occurred',
        command: 'Restore from backup created in step 1 of deployment',
        critical: true
      },
      {
        step: 4,
        action: 'Clear CDN and browser caches',
        command: 'Invalidate Vercel cache, clear CloudFlare cache',
        critical: false
      },
      {
        step: 5,
        action: 'Verify rollback successful',
        command: 'Test key pages and functionality',
        critical: true
      },
      {
        step: 6,
        action: 'Re-enable traffic',
        command: 'Enable load balancer or disable maintenance mode',
        critical: true
      },
      {
        step: 7,
        action: 'Monitor error logs and metrics',
        command: 'Check Vercel logs, Sentry, analytics',
        critical: false
      },
      {
        step: 8,
        action: 'Document rollback reason and investigation plan',
        command: 'Create incident report',
        critical: false
      }
    ];
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    decision: FinalReport['decision'],
    evidence: Evidence[],
    risks: FinalReport['risks']
  ): string[] {
    const recommendations: string[] = [];

    if (decision === 'GO') {
      recommendations.push('✅ All validation checks passed - proceed with deployment');
      recommendations.push('Create production backup before deployment');
      recommendations.push('Deploy during low-traffic period (e.g., early morning)');
      recommendations.push('Monitor logs and error tracking for 24 hours post-deployment');
      recommendations.push('Have rollback procedure ready and tested');
    } else if (decision === 'NO-GO') {
      recommendations.push('❌ Critical issues detected - DO NOT deploy');

      const failedEvidence = evidence.filter(e => e.type === 'failed');
      for (const fail of failedEvidence) {
        recommendations.push(`Fix: ${fail.source} - ${fail.message}`);
      }

      const highRisks = risks.filter(r => r.level === 'high');
      for (const risk of highRisks) {
        if (risk.mitigation) {
          recommendations.push(`Mitigate: ${risk.mitigation}`);
        }
      }

      recommendations.push('Re-run validation after fixes');
    } else {
      // REVIEW_REQUIRED
      recommendations.push('⚠️  Manual review required before deployment');

      const warningEvidence = evidence.filter(e => e.type === 'warning');
      for (const warning of warningEvidence) {
        recommendations.push(`Review: ${warning.source} - ${warning.message}`);
      }

      recommendations.push('Consider deploying to staging environment first');
      recommendations.push('Perform manual testing of affected areas');
      recommendations.push('If confident after review, proceed with deployment');
    }

    return recommendations;
  }

  /**
   * Generate final summary
   */
  private generateSummary(report: FinalReport): string {
    const lines: string[] = [];

    lines.push('═'.repeat(70));
    lines.push('AUTONOMOUS RESCUE SYSTEM - FINAL DEPLOYMENT REPORT');
    lines.push('═'.repeat(70));
    lines.push('');

    // Decision
    const decisionEmoji = report.decision === 'GO' ? '✅' : report.decision === 'NO-GO' ? '❌' : '⚠️';
    lines.push(`DECISION: ${decisionEmoji} ${report.decision}`);
    lines.push(`Confidence: ${(report.confidence * 100).toFixed(1)}%`);
    lines.push(`Overall Score: ${(report.overallScore * 100).toFixed(1)}%`);
    lines.push('');

    // Evidence summary
    lines.push('VALIDATION RESULTS:');
    const passed = report.evidence.filter(e => e.type === 'passed').length;
    const failed = report.evidence.filter(e => e.type === 'failed').length;
    const warnings = report.evidence.filter(e => e.type === 'warning').length;

    lines.push(`  ✅ Passed: ${passed}`);
    lines.push(`  ❌ Failed: ${failed}`);
    lines.push(`  ⚠️  Warnings: ${warnings}`);
    lines.push('');

    // Evidence details
    for (const evidence of report.evidence) {
      const icon = evidence.type === 'passed' ? '✅' : evidence.type === 'failed' ? '❌' : '⚠️';
      lines.push(`${icon} ${evidence.source}: ${evidence.message}`);
    }
    lines.push('');

    // Risks
    if (report.risks.length > 0) {
      lines.push('RISK ASSESSMENT:');
      const highRisks = report.risks.filter(r => r.level === 'high');
      const mediumRisks = report.risks.filter(r => r.level === 'medium');
      const lowRisks = report.risks.filter(r => r.level === 'low');

      if (highRisks.length > 0) {
        lines.push(`  🔴 High: ${highRisks.length}`);
        highRisks.forEach(r => lines.push(`     - ${r.category}: ${r.description}`));
      }
      if (mediumRisks.length > 0) {
        lines.push(`  🟡 Medium: ${mediumRisks.length}`);
      }
      if (lowRisks.length > 0) {
        lines.push(`  🟢 Low: ${lowRisks.length}`);
      }
      lines.push('');
    }

    // Checklist
    lines.push('DEPLOYMENT CHECKLIST:');
    const completed = report.checklist.filter(c => c.status === 'completed').length;
    const total = report.checklist.filter(c => c.required).length;
    lines.push(`  Progress: ${completed}/${total} required tasks completed`);
    lines.push('');

    // Recommendations
    lines.push('RECOMMENDATIONS:');
    for (const rec of report.recommendations) {
      lines.push(`  ${rec}`);
    }
    lines.push('');

    // Footer
    lines.push('═'.repeat(70));
    lines.push(`Generated: ${report.timestamp.toISOString()}`);
    lines.push('═'.repeat(70));

    return lines.join('\n');
  }

  /**
   * Save reports to disk
   */
  private async saveReports(report: FinalReport): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Save summary (text)
    const summaryPath = path.join(this.outputDir, `final-report-${timestamp}.txt`);
    await saveText(summaryPath, report.summary);
    log.info(`Saved summary to ${summaryPath}`, undefined, 'final-reporter');

    // Save full report (JSON)
    const jsonPath = path.join(this.outputDir, `final-report-${timestamp}.json`);
    await saveJSON(jsonPath, report);
    log.info(`Saved full report to ${jsonPath}`, undefined, 'final-reporter');

    // Save deployment checklist
    const checklistPath = path.join(this.outputDir, `deployment-checklist-${timestamp}.md`);
    const checklistMd = this.generateChecklistMarkdown(report);
    await saveText(checklistPath, checklistMd);
    log.info(`Saved checklist to ${checklistPath}`, undefined, 'final-reporter');

    // Save rollback plan
    const rollbackPath = path.join(this.outputDir, `rollback-plan-${timestamp}.md`);
    const rollbackMd = this.generateRollbackMarkdown(report);
    await saveText(rollbackPath, rollbackMd);
    log.info(`Saved rollback plan to ${rollbackPath}`, undefined, 'final-reporter');
  }

  /**
   * Generate checklist markdown
   */
  private generateChecklistMarkdown(report: FinalReport): string {
    const lines: string[] = [];

    lines.push('# Deployment Checklist');
    lines.push('');
    lines.push(`**Decision:** ${report.decision}`);
    lines.push(`**Confidence:** ${(report.confidence * 100).toFixed(1)}%`);
    lines.push('');

    lines.push('## Pre-Deployment');
    lines.push('');

    for (const item of report.checklist) {
      const checkbox = item.status === 'completed' ? '[x]' : '[ ]';
      const required = item.required ? ' *(required)*' : '';
      lines.push(`- ${checkbox} ${item.task}${required}`);

      if (item.notes) {
        lines.push(`  - ${item.notes}`);
      }
    }

    lines.push('');
    lines.push('## Deployment Steps');
    lines.push('');
    lines.push('1. [ ] Final code review');
    lines.push('2. [ ] Update environment variables if needed');
    lines.push('3. [ ] Deploy to production');
    lines.push('4. [ ] Run post-deployment smoke tests');
    lines.push('5. [ ] Monitor logs for 15 minutes');
    lines.push('6. [ ] Verify key functionality');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate rollback markdown
   */
  private generateRollbackMarkdown(report: FinalReport): string {
    const lines: string[] = [];

    lines.push('# Rollback Procedure');
    lines.push('');
    lines.push('**Use this procedure if deployment fails or critical issues are detected.**');
    lines.push('');

    for (const step of report.rollbackPlan) {
      const critical = step.critical ? ' **[CRITICAL]**' : '';
      lines.push(`## Step ${step.step}: ${step.action}${critical}`);
      lines.push('');

      if (step.command) {
        lines.push('```bash');
        lines.push(step.command);
        lines.push('```');
        lines.push('');
      }
    }

    lines.push('---');
    lines.push('');
    lines.push('**After rollback is complete:**');
    lines.push('- Verify production is stable');
    lines.push('- Document what went wrong');
    lines.push('- Fix issues in development');
    lines.push('- Re-run validation before next deployment attempt');
    lines.push('');

    return lines.join('\n');
  }
}
