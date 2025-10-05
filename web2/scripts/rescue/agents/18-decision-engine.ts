import { getLogger } from '../utils/logger';
import type { AgentResult, Risk } from '../types';

const log = getLogger();

/**
 * Decision Engine Agent - Autonomous System
 * Makes intelligent GO/NO-GO/FALLBACK decisions based on confidence scores
 * and risk assessments from all previous agents
 */

export interface DecisionInput {
  phase: string;
  confidence: number;
  risks: Risk[];
  context?: any;
  alternatives?: string[];
}

export interface DecisionEvidence {
  source: string;
  value: any;
  weight: number;
  reasoning: string;
}

export interface AutonomousDecision {
  decision: 'GO' | 'NO_GO' | 'FALLBACK' | 'TRY_ALTERNATIVE' | 'SKIP';
  reasoning: string[];
  evidence: DecisionEvidence[];
  alternatives: string[];
  confidence: number;
  riskLevel: 'high' | 'medium' | 'low';
  timestamp: Date;
}

export interface DecisionLog {
  phase: string;
  decision: AutonomousDecision;
  inputs: DecisionInput;
  metadata: {
    duration: number;
    factors: number;
    evidenceCount: number;
  };
}

export default class DecisionEngineAgent {
  private decisionLogs: DecisionLog[] = [];

  /**
   * Execute decision making for a given phase
   */
  async execute(input: DecisionInput): Promise<AgentResult<AutonomousDecision>> {
    const startTime = Date.now();
    log.info(
      `Analyzing decision for phase: ${input.phase}`,
      {
        confidence: input.confidence,
        risksCount: input.risks.length,
        hasAlternatives: (input.alternatives?.length || 0) > 0
      },
      'decision-engine'
    );

    try {
      const decision = await this.makeDecision(input);
      const duration = Date.now() - startTime;

      // Log decision
      this.decisionLogs.push({
        phase: input.phase,
        decision,
        inputs: input,
        metadata: {
          duration,
          factors: this.countDecisionFactors(input),
          evidenceCount: decision.evidence.length
        }
      });

      log.success(
        `Decision made for ${input.phase}: ${decision.decision}`,
        {
          confidence: decision.confidence,
          riskLevel: decision.riskLevel,
          reasoning: decision.reasoning.length,
          alternatives: decision.alternatives.length
        },
        'decision-engine'
      );

      return {
        success: true,
        data: decision,
        confidence: decision.confidence,
        timestamp: new Date()
      };
    } catch (error: any) {
      log.error(
        `Decision Engine failed for ${input.phase}`,
        error.message,
        'decision-engine'
      );

      // Never fail - return conservative decision
      const safeDecision: AutonomousDecision = {
        decision: 'NO_GO',
        reasoning: ['Error in decision making', error.message],
        evidence: [],
        alternatives: input.alternatives || [],
        confidence: 0,
        riskLevel: 'high',
        timestamp: new Date()
      };

      return {
        success: true,
        data: safeDecision,
        confidence: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Make autonomous decision based on multi-factor analysis
   */
  private async makeDecision(input: DecisionInput): Promise<AutonomousDecision> {
    const evidence: DecisionEvidence[] = [];
    const reasoning: string[] = [];

    // Factor 1: Confidence score analysis
    const confidenceEvidence = this.analyzeConfidence(input.confidence);
    evidence.push(confidenceEvidence);
    reasoning.push(confidenceEvidence.reasoning);

    // Factor 2: Risk assessment
    const riskLevel = this.assessRiskLevel(input.risks);
    const riskEvidence: DecisionEvidence = {
      source: 'risk_assessment',
      value: riskLevel,
      weight: 0.3,
      reasoning: `Risk level: ${riskLevel} (${input.risks.length} risks identified)`
    };
    evidence.push(riskEvidence);
    reasoning.push(riskEvidence.reasoning);

    // Factor 3: Context analysis
    if (input.context) {
      const contextEvidence = this.analyzeContext(input.context);
      evidence.push(contextEvidence);
      reasoning.push(contextEvidence.reasoning);
    }

    // Decision rules with multi-factor scoring
    const totalWeight = evidence.reduce((sum, e) => sum + e.weight, 0);
    const weightedConfidence = evidence.reduce(
      (sum, e) => sum + (this.normalizeEvidenceValue(e) * e.weight),
      0
    ) / totalWeight;

    let decision: AutonomousDecision['decision'];
    let alternatives: string[] = input.alternatives || [];

    // Decision matrix
    if (weightedConfidence >= 0.9 && riskLevel === 'low') {
      decision = 'GO';
      reasoning.push('✓ Confidence ≥0.9 and risk=LOW → PROCEED');
    } else if (weightedConfidence >= 0.75 && (riskLevel === 'low' || riskLevel === 'medium')) {
      decision = 'GO';
      reasoning.push('✓ Confidence ≥0.75 and risk≤MEDIUM → PROCEED_WITH_LOGGING');
    } else if (weightedConfidence >= 0.5) {
      decision = 'FALLBACK';
      reasoning.push('⚠ Confidence ≥0.5 → FALLBACK_STRATEGY');
      alternatives = this.suggestFallbacks(input);
    } else if (weightedConfidence >= 0.3 && alternatives.length > 0) {
      decision = 'TRY_ALTERNATIVE';
      reasoning.push('⚠ Confidence ≥0.3 with alternatives → TRY_ALTERNATIVE');
    } else {
      decision = 'SKIP';
      reasoning.push('✗ Confidence <0.5, no alternatives → SKIP');
    }

    // Final decision object
    const autonomousDecision: AutonomousDecision = {
      decision,
      reasoning,
      evidence,
      alternatives,
      confidence: weightedConfidence,
      riskLevel,
      timestamp: new Date()
    };

    return autonomousDecision;
  }

  /**
   * Analyze confidence score
   */
  private analyzeConfidence(confidence: number): DecisionEvidence {
    let reasoning = '';
    let weight = 0.5;

    if (confidence >= 0.9) {
      reasoning = `Excellent confidence (${(confidence * 100).toFixed(1)}%)`;
      weight = 0.6;
    } else if (confidence >= 0.75) {
      reasoning = `Good confidence (${(confidence * 100).toFixed(1)}%)`;
      weight = 0.5;
    } else if (confidence >= 0.5) {
      reasoning = `Moderate confidence (${(confidence * 100).toFixed(1)}%)`;
      weight = 0.4;
    } else {
      reasoning = `Low confidence (${(confidence * 100).toFixed(1)}%)`;
      weight = 0.3;
    }

    return {
      source: 'confidence_analysis',
      value: confidence,
      weight,
      reasoning
    };
  }

  /**
   * Assess overall risk level
   */
  private assessRiskLevel(risks: Risk[]): 'high' | 'medium' | 'low' {
    if (risks.length === 0) {
      return 'low';
    }

    const highRisks = risks.filter(r => r.level === 'high').length;
    const mediumRisks = risks.filter(r => r.level === 'medium').length;

    if (highRisks > 0) {
      return 'high';
    } else if (mediumRisks > 2) {
      return 'high';
    } else if (mediumRisks > 0) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Analyze context data
   */
  private analyzeContext(context: any): DecisionEvidence {
    let score = 0.5;
    let reasoning = 'Context analysis: ';
    const factors: string[] = [];

    // Check for completeness indicators
    if (context.totalItems && context.processedItems) {
      const completeness = context.processedItems / context.totalItems;
      if (completeness >= 0.9) {
        score += 0.2;
        factors.push(`${(completeness * 100).toFixed(0)}% complete`);
      }
    }

    // Check for error rate
    if (context.errors !== undefined && context.total !== undefined) {
      const errorRate = context.errors / context.total;
      if (errorRate < 0.05) {
        score += 0.15;
        factors.push(`${(errorRate * 100).toFixed(1)}% error rate`);
      } else if (errorRate > 0.2) {
        score -= 0.2;
        factors.push(`HIGH error rate: ${(errorRate * 100).toFixed(1)}%`);
      }
    }

    // Check for data quality indicators
    if (context.validationsPassed) {
      score += 0.15;
      factors.push('validations passed');
    }

    reasoning += factors.join(', ');

    return {
      source: 'context_analysis',
      value: Math.max(0, Math.min(1, score)),
      weight: 0.2,
      reasoning
    };
  }

  /**
   * Normalize evidence value to 0-1 range
   */
  private normalizeEvidenceValue(evidence: DecisionEvidence): number {
    if (typeof evidence.value === 'number') {
      return Math.max(0, Math.min(1, evidence.value));
    }

    if (evidence.value === 'low') return 1.0;
    if (evidence.value === 'medium') return 0.6;
    if (evidence.value === 'high') return 0.3;

    return 0.5;
  }

  /**
   * Suggest fallback strategies
   */
  private suggestFallbacks(input: DecisionInput): string[] {
    const fallbacks: string[] = [];

    fallbacks.push('use_cached_data');
    fallbacks.push('manual_review_required');
    fallbacks.push('partial_execution');
    fallbacks.push('skip_and_log');

    if (input.alternatives && input.alternatives.length > 0) {
      fallbacks.push(...input.alternatives);
    }

    return fallbacks;
  }

  /**
   * Count decision factors
   */
  private countDecisionFactors(input: DecisionInput): number {
    let count = 2; // Always have confidence and risk
    if (input.context) count++;
    if (input.alternatives && input.alternatives.length > 0) count++;
    return count;
  }

  /**
   * Get all decision logs for audit
   */
  getDecisionLogs(): DecisionLog[] {
    return this.decisionLogs;
  }

  /**
   * Generate decision summary
   */
  generateSummary(): {
    totalDecisions: number;
    byDecision: Record<string, number>;
    averageConfidence: number;
    riskDistribution: Record<string, number>;
  } {
    const summary = {
      totalDecisions: this.decisionLogs.length,
      byDecision: {} as Record<string, number>,
      averageConfidence: 0,
      riskDistribution: {} as Record<string, number>
    };

    let totalConfidence = 0;

    for (const log of this.decisionLogs) {
      // Count by decision type
      const decision = log.decision.decision;
      summary.byDecision[decision] = (summary.byDecision[decision] || 0) + 1;

      // Count by risk level
      const risk = log.decision.riskLevel;
      summary.riskDistribution[risk] = (summary.riskDistribution[risk] || 0) + 1;

      // Sum confidence
      totalConfidence += log.decision.confidence;
    }

    if (this.decisionLogs.length > 0) {
      summary.averageConfidence = totalConfidence / this.decisionLogs.length;
    }

    return summary;
  }
}
