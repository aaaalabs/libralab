import * as fs from 'fs/promises';
import * as path from 'path';
import { getLogger } from '../utils/logger';
import type { AgentResult, Finding, Risk } from '../types';
import type { DecisionLog } from './18-decision-engine';
import type { HealingStrategy } from './19-auto-healer';

const log = getLogger();

/**
 * Audit Trail Agent - Autonomous System
 * Comprehensive logging and evidence collection for post-execution review
 */

export interface ExecutionEvidence {
  timestamp: Date;
  phase: string;
  agent: string;
  action: string;
  input?: any;
  output?: any;
  confidence: number;
  duration: number;
  success: boolean;
  error?: string;
}

export interface QualityMetrics {
  completeness: number;
  accuracy: number;
  confidence: number;
  dataIntegrity: number;
  overall: number;
}

export interface AuditReport {
  executionId: string;
  startTime: Date;
  endTime: Date;
  totalDuration: number;

  decisionLog: DecisionLog[];
  evidenceCollection: ExecutionEvidence[];
  riskReport: {
    totalRisks: number;
    byLevel: Record<string, number>;
    byCategory: Record<string, number>;
    criticalRisks: Risk[];
    mitigatedRisks: Risk[];
  };
  healingReport: {
    totalHealed: number;
    byStrategy: Record<string, number>;
    byError: Record<string, number>;
    strategies: HealingStrategy[];
  };
  qualityMetrics: QualityMetrics;
  artifactList: {
    path: string;
    type: string;
    size: number;
    description: string;
  }[];
  findings: Finding[];
  summary: string;
  timestamp: Date;
}

export interface ReviewPackage {
  html: string;
  json: string;
  markdown: string;
}

export default class AuditTrailAgent {
  private executionId: string;
  private startTime: Date;
  private evidenceCollection: ExecutionEvidence[] = [];
  private findings: Finding[] = [];
  private risks: Risk[] = [];
  private artifacts: AuditReport['artifactList'] = [];

  constructor(executionId?: string) {
    this.executionId = executionId || `exec-${Date.now()}`;
    this.startTime = new Date();
  }

  /**
   * Execute audit trail generation
   */
  async execute(
    decisionLogs: DecisionLog[],
    healingStrategies: HealingStrategy[],
    additionalData?: any
  ): Promise<AgentResult<AuditReport>> {
    const startTime = Date.now();
    log.info(
      'Generating Audit Trail',
      {
        executionId: this.executionId,
        decisions: decisionLogs.length,
        healings: healingStrategies.length
      },
      'audit-trail'
    );

    try {
      const report = await this.generateAuditReport(
        decisionLogs,
        healingStrategies,
        additionalData
      );

      const duration = Date.now() - startTime;

      log.success(
        'Audit Trail generated',
        {
          duration: `${duration}ms`,
          evidenceCount: report.evidenceCollection.length,
          risksTracked: report.riskReport.totalRisks,
          artifactsListed: report.artifactList.length
        },
        'audit-trail'
      );

      return {
        success: true,
        data: report,
        confidence: 1.0,
        timestamp: new Date()
      };
    } catch (error: any) {
      log.error('Audit Trail generation failed', error.message, 'audit-trail');

      // Return minimal audit report on failure
      const minimalReport: AuditReport = {
        executionId: this.executionId,
        startTime: this.startTime,
        endTime: new Date(),
        totalDuration: Date.now() - this.startTime.getTime(),
        decisionLog: decisionLogs,
        evidenceCollection: this.evidenceCollection,
        riskReport: {
          totalRisks: 0,
          byLevel: {},
          byCategory: {},
          criticalRisks: [],
          mitigatedRisks: []
        },
        healingReport: {
          totalHealed: 0,
          byStrategy: {},
          byError: {},
          strategies: healingStrategies
        },
        qualityMetrics: {
          completeness: 0,
          accuracy: 0,
          confidence: 0,
          dataIntegrity: 0,
          overall: 0
        },
        artifactList: [],
        findings: [],
        summary: 'Audit trail generation failed: ' + error.message,
        timestamp: new Date()
      };

      return {
        success: true,
        data: minimalReport,
        confidence: 0.3,
        timestamp: new Date()
      };
    }
  }

  /**
   * Record evidence of an operation
   */
  recordEvidence(evidence: Omit<ExecutionEvidence, 'timestamp'>): void {
    this.evidenceCollection.push({
      ...evidence,
      timestamp: new Date()
    });
  }

  /**
   * Add finding
   */
  addFinding(finding: Finding): void {
    this.findings.push(finding);
  }

  /**
   * Add risk
   */
  addRisk(risk: Risk): void {
    this.risks.push(risk);
  }

  /**
   * Add artifact
   */
  addArtifact(artifact: AuditReport['artifactList'][0]): void {
    this.artifacts.push(artifact);
  }

  /**
   * Generate comprehensive audit report
   */
  private async generateAuditReport(
    decisionLogs: DecisionLog[],
    healingStrategies: HealingStrategy[],
    additionalData?: any
  ): Promise<AuditReport> {
    const endTime = new Date();
    const totalDuration = endTime.getTime() - this.startTime.getTime();

    // Build risk report
    const riskReport = this.buildRiskReport();

    // Build healing report
    const healingReport = this.buildHealingReport(healingStrategies);

    // Calculate quality metrics
    const qualityMetrics = this.calculateQualityMetrics(
      decisionLogs,
      healingStrategies,
      additionalData
    );

    // Generate summary
    const summary = this.generateSummary(
      decisionLogs,
      riskReport,
      healingReport,
      qualityMetrics
    );

    const report: AuditReport = {
      executionId: this.executionId,
      startTime: this.startTime,
      endTime,
      totalDuration,
      decisionLog: decisionLogs,
      evidenceCollection: this.evidenceCollection,
      riskReport,
      healingReport,
      qualityMetrics,
      artifactList: this.artifacts,
      findings: this.findings,
      summary,
      timestamp: new Date()
    };

    return report;
  }

  /**
   * Build risk report
   */
  private buildRiskReport(): AuditReport['riskReport'] {
    const byLevel: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const criticalRisks: Risk[] = [];
    const mitigatedRisks: Risk[] = [];

    for (const risk of this.risks) {
      byLevel[risk.level] = (byLevel[risk.level] || 0) + 1;
      byCategory[risk.category] = (byCategory[risk.category] || 0) + 1;

      if (risk.level === 'high') {
        criticalRisks.push(risk);
      }

      if (risk.mitigation) {
        mitigatedRisks.push(risk);
      }
    }

    return {
      totalRisks: this.risks.length,
      byLevel,
      byCategory,
      criticalRisks,
      mitigatedRisks
    };
  }

  /**
   * Build healing report
   */
  private buildHealingReport(strategies: HealingStrategy[]): AuditReport['healingReport'] {
    const byStrategy: Record<string, number> = {};
    const byError: Record<string, number> = {};
    let totalHealed = 0;

    for (const strategy of strategies) {
      if (strategy.applied) {
        totalHealed++;
        byStrategy[strategy.strategy] = (byStrategy[strategy.strategy] || 0) + 1;
        byError[strategy.error] = (byError[strategy.error] || 0) + 1;
      }
    }

    return {
      totalHealed,
      byStrategy,
      byError,
      strategies
    };
  }

  /**
   * Calculate quality metrics
   */
  private calculateQualityMetrics(
    decisionLogs: DecisionLog[],
    healingStrategies: HealingStrategy[],
    additionalData?: any
  ): QualityMetrics {
    // Completeness: based on successful operations
    const successfulOps = this.evidenceCollection.filter(e => e.success).length;
    const totalOps = this.evidenceCollection.length || 1;
    const completeness = successfulOps / totalOps;

    // Accuracy: based on healing confidence and decision confidence
    const healingConfidences = healingStrategies
      .filter(h => h.applied)
      .map(h => h.confidence);
    const decisionConfidences = decisionLogs.map(d => d.decision.confidence);
    const allConfidences = [...healingConfidences, ...decisionConfidences];
    const accuracy = allConfidences.length > 0
      ? allConfidences.reduce((sum, c) => sum + c, 0) / allConfidences.length
      : 0.5;

    // Overall confidence: weighted average of evidence confidence
    const evidenceConfidences = this.evidenceCollection.map(e => e.confidence);
    const confidence = evidenceConfidences.length > 0
      ? evidenceConfidences.reduce((sum, c) => sum + c, 0) / evidenceConfidences.length
      : 0.5;

    // Data integrity: based on critical risks and healing success
    const criticalRisks = this.risks.filter(r => r.level === 'high').length;
    const healingSuccessRate = healingStrategies.length > 0
      ? healingStrategies.filter(h => h.applied && h.confidence > 0.7).length / healingStrategies.length
      : 1.0;
    const dataIntegrity = Math.max(0, (1.0 - (criticalRisks * 0.1)) * healingSuccessRate);

    // Overall: weighted combination
    const overall = (
      completeness * 0.3 +
      accuracy * 0.25 +
      confidence * 0.25 +
      dataIntegrity * 0.2
    );

    return {
      completeness,
      accuracy,
      confidence,
      dataIntegrity,
      overall
    };
  }

  /**
   * Generate executive summary
   */
  private generateSummary(
    decisionLogs: DecisionLog[],
    riskReport: AuditReport['riskReport'],
    healingReport: AuditReport['healingReport'],
    qualityMetrics: QualityMetrics
  ): string {
    const lines: string[] = [];

    lines.push(`Execution ID: ${this.executionId}`);
    lines.push(`Duration: ${this.formatDuration(new Date().getTime() - this.startTime.getTime())}`);
    lines.push('');

    // Decisions
    lines.push('AUTONOMOUS DECISIONS:');
    const decisionCounts: Record<string, number> = {};
    for (const log of decisionLogs) {
      const decision = log.decision.decision;
      decisionCounts[decision] = (decisionCounts[decision] || 0) + 1;
    }
    for (const [decision, count] of Object.entries(decisionCounts)) {
      lines.push(`  ${decision}: ${count}`);
    }
    lines.push('');

    // Healing
    lines.push('AUTO-HEALING:');
    lines.push(`  Total errors healed: ${healingReport.totalHealed}`);
    lines.push(`  Top strategies: ${Object.entries(healingReport.byStrategy)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([s, c]) => `${s}(${c})`)
      .join(', ')}`);
    lines.push('');

    // Risks
    lines.push('RISK ASSESSMENT:');
    lines.push(`  Total risks: ${riskReport.totalRisks}`);
    lines.push(`  Critical: ${riskReport.criticalRisks.length}`);
    lines.push(`  Mitigated: ${riskReport.mitigatedRisks.length}`);
    lines.push('');

    // Quality
    lines.push('QUALITY METRICS:');
    lines.push(`  Completeness: ${(qualityMetrics.completeness * 100).toFixed(1)}%`);
    lines.push(`  Accuracy: ${(qualityMetrics.accuracy * 100).toFixed(1)}%`);
    lines.push(`  Confidence: ${(qualityMetrics.confidence * 100).toFixed(1)}%`);
    lines.push(`  Data Integrity: ${(qualityMetrics.dataIntegrity * 100).toFixed(1)}%`);
    lines.push(`  Overall Score: ${(qualityMetrics.overall * 100).toFixed(1)}%`);
    lines.push('');

    // Artifacts
    lines.push(`ARTIFACTS: ${this.artifacts.length} files generated`);

    return lines.join('\n');
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Save audit report to files
   */
  async saveAuditReport(
    report: AuditReport,
    outputDir: string
  ): Promise<{ jsonPath: string; htmlPath: string }> {
    const jsonPath = path.join(outputDir, 'audit-trail.json');
    const htmlPath = path.join(outputDir, 'review-package.html');

    // Save JSON
    await fs.writeFile(
      jsonPath,
      JSON.stringify(report, null, 2),
      'utf-8'
    );

    // Generate and save HTML review package
    const html = this.generateReviewPackageHTML(report);
    await fs.writeFile(htmlPath, html, 'utf-8');

    log.success(
      'Audit report saved',
      { jsonPath, htmlPath },
      'audit-trail'
    );

    return { jsonPath, htmlPath };
  }

  /**
   * Generate HTML review package
   */
  private generateReviewPackageHTML(report: AuditReport): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Audit Review - ${report.executionId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; border-radius: 8px; margin-bottom: 30px; }
    h1 { font-size: 2.5em; margin-bottom: 10px; }
    .subtitle { opacity: 0.9; font-size: 1.1em; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .metric-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .metric-value { font-size: 2em; font-weight: bold; color: #667eea; }
    .metric-label { color: #666; margin-top: 5px; }
    .section { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
    .section h2 { color: #667eea; margin-bottom: 20px; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f8f9fa; font-weight: 600; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 0.85em; font-weight: 500; }
    .badge-go { background: #d4edda; color: #155724; }
    .badge-no-go { background: #f8d7da; color: #721c24; }
    .badge-fallback { background: #fff3cd; color: #856404; }
    .badge-high { background: #f8d7da; color: #721c24; }
    .badge-medium { background: #fff3cd; color: #856404; }
    .badge-low { background: #d4edda; color: #155724; }
    .confidence-bar { background: #e9ecef; border-radius: 4px; height: 8px; overflow: hidden; }
    .confidence-fill { background: linear-gradient(90deg, #667eea, #764ba2); height: 100%; transition: width 0.3s; }
    pre { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; }
    .summary-box { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; white-space: pre-wrap; font-family: 'Courier New', monospace; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🔍 Autonomous System Audit Review</h1>
      <div class="subtitle">Execution ID: ${report.executionId}</div>
      <div class="subtitle">Duration: ${this.formatDuration(report.totalDuration)}</div>
    </header>

    <div class="metrics">
      <div class="metric-card">
        <div class="metric-value">${(report.qualityMetrics.overall * 100).toFixed(0)}%</div>
        <div class="metric-label">Overall Quality</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${report.decisionLog.length}</div>
        <div class="metric-label">Decisions Made</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${report.healingReport.totalHealed}</div>
        <div class="metric-label">Errors Healed</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${report.riskReport.totalRisks}</div>
        <div class="metric-label">Risks Tracked</div>
      </div>
    </div>

    <div class="section">
      <h2>📊 Executive Summary</h2>
      <div class="summary-box">${report.summary}</div>
    </div>

    <div class="section">
      <h2>🎯 Decision Log</h2>
      <table>
        <thead>
          <tr>
            <th>Phase</th>
            <th>Decision</th>
            <th>Confidence</th>
            <th>Risk Level</th>
            <th>Reasoning</th>
          </tr>
        </thead>
        <tbody>
          ${report.decisionLog.map(log => `
            <tr>
              <td>${log.phase}</td>
              <td><span class="badge badge-${log.decision.decision.toLowerCase().replace('_', '-')}">${log.decision.decision}</span></td>
              <td>
                <div class="confidence-bar">
                  <div class="confidence-fill" style="width: ${log.decision.confidence * 100}%"></div>
                </div>
                ${(log.decision.confidence * 100).toFixed(0)}%
              </td>
              <td><span class="badge badge-${log.decision.riskLevel}">${log.decision.riskLevel.toUpperCase()}</span></td>
              <td>${log.decision.reasoning[0] || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>🔧 Healing Report</h2>
      <p>Total errors healed: <strong>${report.healingReport.totalHealed}</strong></p>
      <h3 style="margin-top: 20px;">Top Healing Strategies:</h3>
      <table>
        <thead>
          <tr>
            <th>Strategy</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(report.healingReport.byStrategy)
            .sort((a, b) => b[1] - a[1])
            .map(([strategy, count]) => `
              <tr>
                <td>${strategy}</td>
                <td>${count}</td>
              </tr>
            `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>⚠️ Risk Assessment</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px;">
        ${Object.entries(report.riskReport.byLevel).map(([level, count]) => `
          <div style="padding: 15px; border-left: 4px solid ${level === 'high' ? '#dc3545' : level === 'medium' ? '#ffc107' : '#28a745'}; background: #f8f9fa;">
            <div style="font-size: 1.5em; font-weight: bold;">${count}</div>
            <div>${level.toUpperCase()} Risk${count !== 1 ? 's' : ''}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="section">
      <h2>📁 Generated Artifacts</h2>
      <table>
        <thead>
          <tr>
            <th>File</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${report.artifactList.map(artifact => `
            <tr>
              <td><code>${artifact.path}</code></td>
              <td>${artifact.type}</td>
              <td>${artifact.description}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <footer style="text-align: center; padding: 40px 20px; color: #666;">
      <p>Generated on ${report.timestamp.toLocaleString()}</p>
    </footer>
  </div>
</body>
</html>`;
  }
}
