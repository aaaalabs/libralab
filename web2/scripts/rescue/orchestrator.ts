import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';

// Import all 20 agents
import { ProductionScraperAgent } from './agents/phase1-analysis/01-production-scraper';
import { SchemaAnalyzerAgent } from './agents/phase1-analysis/02-schema-analyzer';
import { DataGapAnalyzerAgent } from './agents/phase1-analysis/03-data-gap-analyzer';
import { TypeDefinitionMinerAgent } from './agents/phase1-analysis/04-type-definition-miner';

import { TranslationStrategyAgent } from './agents/phase2-strategy/05-translation-strategy';
import { SchemaMapperAgent } from './agents/phase2-strategy/06-schema-mapper';
import { DataSourceIdentifierAgent } from './agents/phase2-strategy/07-data-source-identifier';
import { FallbackGeneratorAgent } from './agents/phase2-strategy/08-fallback-generator';

import { ContentTranslatorAgent } from './agents/phase3-execution/09-content-translator';
import { ImageMigratorAgent } from './agents/phase3-execution/10-image-migrator';
import { DataTransformerAgent } from './agents/phase3-execution/11-data-transformer';
import { CodeGeneratorAgent } from './agents/phase3-execution/12-code-generator';

import { BuildValidatorAgent } from './agents/phase4-validation/13-build-validator';
import { VisualComparatorAgent } from './agents/phase4-validation/14-visual-comparator';
import { DataVerifierAgent } from './agents/phase4-validation/15-data-verifier';
import { FunctionalTesterAgent } from './agents/phase4-validation/16-functional-tester';

import { AutoHealerAgent } from './agents/phase5-deployment/17-auto-healer';
import { RiskAssessorAgent } from './agents/phase5-deployment/18-risk-assessor';
import { DeploymentExecutorAgent } from './agents/phase5-deployment/19-deployment-executor';
import { AuditTrailAgent } from './agents/phase5-deployment/20-audit-trail';

// Import shared utilities
import { DecisionEngine } from './shared/decision-engine';

// Types
interface RescueConfig {
  mode: 'autonomous' | 'manual';
  productionUrl: string;
  confidence: {
    minimumOverall: number;
    minimumPerPhase: number;
    minimumForDeployment: number;
  };
  risk: {
    autoMitigate: boolean;
    maxAutoMitigationAttempts: number;
    blockOnCritical: boolean;
    acceptableLevels: string[];
  };
  fallback: {
    enableMultiStrategy: boolean;
    maxStrategiesPerAgent: number;
    preferSafetyOverSpeed: boolean;
  };
  healing: {
    enabled: boolean;
    maxAttempts: number;
    autoTranslate: boolean;
    autoFixImages: boolean;
    autoFixSchema: boolean;
  };
  validation: {
    buildRequired: boolean;
    visualComparisonRequired: boolean;
    maxVisualDifference: number;
    dataVerificationRequired: boolean;
  };
  deployment: {
    autoCommit: boolean;
    autoPush: boolean;
    createPR: boolean;
    requireManualApproval: boolean;
  };
}

interface PhaseResult {
  phase: string;
  success: boolean;
  confidence: number;
  duration: number;
  errors: string[];
  data: any;
}

interface ExecutionContext {
  config: RescueConfig;
  dryRun: boolean;
  startTime: number;
  phaseResults: PhaseResult[];
  sharedData: Map<string, any>;
}

// Main Orchestrator Class
export class RescueOrchestrator {
  private config: RescueConfig;
  private context: ExecutionContext;
  private decisionEngine: DecisionEngine;
  private auditTrail: AuditTrailAgent;

  constructor(config: RescueConfig, dryRun: boolean = false) {
    this.config = config;
    this.context = {
      config,
      dryRun,
      startTime: Date.now(),
      phaseResults: [],
      sharedData: new Map(),
    };
    this.decisionEngine = new DecisionEngine(config);
    this.auditTrail = new AuditTrailAgent();
  }

  /**
   * Execute all phases or a specific phase
   */
  async execute(targetPhase?: string): Promise<void> {
    console.log(chalk.bold.cyan('\n🚀 LibraLab Autonomous Rescue System\n'));
    console.log(chalk.gray(`Mode: ${this.config.mode}`));
    console.log(chalk.gray(`Dry Run: ${this.context.dryRun ? 'Yes' : 'No'}`));
    console.log(chalk.gray(`Target: ${targetPhase || 'All Phases'}\n`));

    await this.auditTrail.logStart({
      mode: this.config.mode,
      dryRun: this.context.dryRun,
      targetPhase,
    });

    try {
      if (targetPhase) {
        await this.executePhase(targetPhase);
      } else {
        await this.executeAllPhases();
      }

      await this.generateFinalReport();
    } catch (error) {
      console.error(chalk.red('\n❌ Fatal error during execution:'), error);
      await this.auditTrail.logError('orchestrator', error as Error);
      throw error;
    }
  }

  /**
   * Execute all phases sequentially
   */
  private async executeAllPhases(): Promise<void> {
    const phases = [
      { name: 'analysis', fn: () => this.executePhase1Analysis() },
      { name: 'strategy', fn: () => this.executePhase2Strategy() },
      { name: 'execution', fn: () => this.executePhase3Execution() },
      { name: 'validation', fn: () => this.executePhase4Validation() },
      { name: 'deployment', fn: () => this.executePhase5Deployment() },
    ];

    for (const phase of phases) {
      const result = await phase.fn();

      // Decision gate: check if we should continue
      const decision = await this.decisionEngine.evaluatePhase(result);

      if (!decision.proceed) {
        console.log(chalk.yellow(`\n⚠️  Phase ${phase.name} decision: HALT`));
        console.log(chalk.gray(`Reason: ${decision.reason}`));

        if (this.config.healing.enabled && decision.canHeal) {
          await this.attemptAutoHealing(phase.name, result);
        } else {
          break;
        }
      }
    }
  }

  /**
   * Execute a specific phase by name
   */
  private async executePhase(phaseName: string): Promise<void> {
    const phaseMap: { [key: string]: () => Promise<PhaseResult> } = {
      analysis: () => this.executePhase1Analysis(),
      strategy: () => this.executePhase2Strategy(),
      execution: () => this.executePhase3Execution(),
      validation: () => this.executePhase4Validation(),
      deployment: () => this.executePhase5Deployment(),
    };

    const phaseFunction = phaseMap[phaseName];
    if (!phaseFunction) {
      throw new Error(`Unknown phase: ${phaseName}`);
    }

    await phaseFunction();
  }

  /**
   * Phase 1: Analysis (Agents 01-04)
   */
  private async executePhase1Analysis(): Promise<PhaseResult> {
    console.log(chalk.bold.blue('\n📊 Phase 1: Analysis\n'));
    const startTime = Date.now();
    const errors: string[] = [];
    let overallConfidence = 0;

    try {
      // Agent 01: Production Scraper
      const spinner1 = ora('Scraping production data...').start();
      const scraper = new ProductionScraperAgent(this.config.productionUrl);
      const productionData = await scraper.execute();
      this.context.sharedData.set('productionData', productionData);
      overallConfidence += productionData.confidence;
      spinner1.succeed(`Scraped ${productionData.rooms.length} rooms with ${(productionData.confidence * 100).toFixed(0)}% confidence`);

      // Agent 02: Schema Analyzer
      const spinner2 = ora('Analyzing database schema...').start();
      const schemaAnalyzer = new SchemaAnalyzerAgent();
      const schemaAnalysis = await schemaAnalyzer.execute();
      this.context.sharedData.set('schemaAnalysis', schemaAnalysis);
      overallConfidence += schemaAnalysis.confidence;
      spinner2.succeed(`Analyzed ${schemaAnalysis.tables.length} tables`);

      // Agent 03: Data Gap Analyzer
      const spinner3 = ora('Identifying data gaps...').start();
      const gapAnalyzer = new DataGapAnalyzerAgent(productionData, schemaAnalysis);
      const gaps = await gapAnalyzer.execute();
      this.context.sharedData.set('dataGaps', gaps);
      overallConfidence += gaps.confidence;
      spinner3.succeed(`Found ${gaps.critical.length} critical gaps, ${gaps.medium.length} medium`);

      // Agent 04: Type Definition Miner
      const spinner4 = ora('Mining type definitions...').start();
      const typeMiner = new TypeDefinitionMinerAgent();
      const types = await typeMiner.execute();
      this.context.sharedData.set('typeDefinitions', types);
      overallConfidence += types.confidence;
      spinner4.succeed(`Extracted ${types.interfaces.length} interfaces, ${types.types.length} types`);

      overallConfidence /= 4; // Average confidence

      const result: PhaseResult = {
        phase: 'analysis',
        success: true,
        confidence: overallConfidence,
        duration: Date.now() - startTime,
        errors,
        data: {
          productionData,
          schemaAnalysis,
          gaps,
          types,
        },
      };

      this.context.phaseResults.push(result);
      await this.auditTrail.logPhase(result);

      console.log(chalk.green(`\n✓ Phase 1 completed with ${(overallConfidence * 100).toFixed(0)}% confidence`));
      return result;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(errorMsg);

      const result: PhaseResult = {
        phase: 'analysis',
        success: false,
        confidence: 0,
        duration: Date.now() - startTime,
        errors,
        data: null,
      };

      this.context.phaseResults.push(result);
      console.error(chalk.red(`\n✗ Phase 1 failed: ${errorMsg}`));
      return result;
    }
  }

  /**
   * Phase 2: Strategy (Agents 05-08)
   */
  private async executePhase2Strategy(): Promise<PhaseResult> {
    console.log(chalk.bold.blue('\n🎯 Phase 2: Strategy\n'));
    const startTime = Date.now();
    const errors: string[] = [];
    let overallConfidence = 0;

    try {
      const productionData = this.context.sharedData.get('productionData');
      const gaps = this.context.sharedData.get('dataGaps');

      // Agent 05: Translation Strategy
      const spinner1 = ora('Planning translation strategy...').start();
      const translationStrategy = new TranslationStrategyAgent(productionData);
      const strategy = await translationStrategy.execute();
      this.context.sharedData.set('translationStrategy', strategy);
      overallConfidence += strategy.confidence;
      spinner1.succeed(`Strategy: ${strategy.primaryMethod} with ${strategy.fallbacks.length} fallbacks`);

      // Agent 06: Schema Mapper
      const spinner2 = ora('Mapping schema fields...').start();
      const schemaMapper = new SchemaMapperAgent(gaps);
      const mappings = await schemaMapper.execute();
      this.context.sharedData.set('schemaMappings', mappings);
      overallConfidence += mappings.confidence;
      spinner2.succeed(`Mapped ${mappings.fieldMappings.length} fields`);

      // Agent 07: Data Source Identifier
      const spinner3 = ora('Identifying data sources...').start();
      const sourceIdentifier = new DataSourceIdentifierAgent(gaps);
      const sources = await sourceIdentifier.execute();
      this.context.sharedData.set('dataSources', sources);
      overallConfidence += sources.confidence;
      spinner3.succeed(`Identified ${sources.primary.length} primary sources`);

      // Agent 08: Fallback Generator
      const spinner4 = ora('Generating fallback strategies...').start();
      const fallbackGen = new FallbackGeneratorAgent(gaps, this.config);
      const fallbacks = await fallbackGen.execute();
      this.context.sharedData.set('fallbackStrategies', fallbacks);
      overallConfidence += fallbacks.confidence;
      spinner4.succeed(`Generated ${fallbacks.strategies.length} fallback strategies`);

      overallConfidence /= 4;

      const result: PhaseResult = {
        phase: 'strategy',
        success: true,
        confidence: overallConfidence,
        duration: Date.now() - startTime,
        errors,
        data: { strategy, mappings, sources, fallbacks },
      };

      this.context.phaseResults.push(result);
      await this.auditTrail.logPhase(result);

      console.log(chalk.green(`\n✓ Phase 2 completed with ${(overallConfidence * 100).toFixed(0)}% confidence`));
      return result;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(errorMsg);

      const result: PhaseResult = {
        phase: 'strategy',
        success: false,
        confidence: 0,
        duration: Date.now() - startTime,
        errors,
        data: null,
      };

      this.context.phaseResults.push(result);
      return result;
    }
  }

  /**
   * Phase 3: Execution (Agents 09-12)
   */
  private async executePhase3Execution(): Promise<PhaseResult> {
    console.log(chalk.bold.blue('\n⚙️  Phase 3: Execution\n'));
    const startTime = Date.now();
    const errors: string[] = [];
    let overallConfidence = 0;

    try {
      const strategy = this.context.sharedData.get('translationStrategy');
      const mappings = this.context.sharedData.get('schemaMappings');

      // Agent 09: Content Translator
      const spinner1 = ora('Translating content...').start();
      const translator = new ContentTranslatorAgent(strategy);
      const translations = await translator.execute(this.context.dryRun);
      this.context.sharedData.set('translations', translations);
      overallConfidence += translations.confidence;
      spinner1.succeed(`Translated ${translations.count} items`);

      // Agent 10: Image Migrator
      const spinner2 = ora('Migrating images...').start();
      const imageMigrator = new ImageMigratorAgent();
      const images = await imageMigrator.execute(this.context.dryRun);
      this.context.sharedData.set('migratedImages', images);
      overallConfidence += images.confidence;
      spinner2.succeed(`Migrated ${images.count} images`);

      // Agent 11: Data Transformer
      const spinner3 = ora('Transforming data...').start();
      const dataTransformer = new DataTransformerAgent(mappings);
      const transformed = await dataTransformer.execute(this.context.dryRun);
      this.context.sharedData.set('transformedData', transformed);
      overallConfidence += transformed.confidence;
      spinner3.succeed(`Transformed ${transformed.count} records`);

      // Agent 12: Code Generator
      const spinner4 = ora('Generating code...').start();
      const codeGen = new CodeGeneratorAgent(mappings);
      const code = await codeGen.execute(this.context.dryRun);
      this.context.sharedData.set('generatedCode', code);
      overallConfidence += code.confidence;
      spinner4.succeed(`Generated ${code.files.length} files`);

      overallConfidence /= 4;

      const result: PhaseResult = {
        phase: 'execution',
        success: true,
        confidence: overallConfidence,
        duration: Date.now() - startTime,
        errors,
        data: { translations, images, transformed, code },
      };

      this.context.phaseResults.push(result);
      await this.auditTrail.logPhase(result);

      console.log(chalk.green(`\n✓ Phase 3 completed with ${(overallConfidence * 100).toFixed(0)}% confidence`));
      return result;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(errorMsg);

      const result: PhaseResult = {
        phase: 'execution',
        success: false,
        confidence: 0,
        duration: Date.now() - startTime,
        errors,
        data: null,
      };

      this.context.phaseResults.push(result);
      return result;
    }
  }

  /**
   * Phase 4: Validation (Agents 13-16)
   */
  private async executePhase4Validation(): Promise<PhaseResult> {
    console.log(chalk.bold.blue('\n✅ Phase 4: Validation\n'));
    const startTime = Date.now();
    const errors: string[] = [];
    let overallConfidence = 0;

    try {
      // Agent 13: Build Validator
      const spinner1 = ora('Validating build...').start();
      const buildValidator = new BuildValidatorAgent();
      const buildResult = await buildValidator.execute();
      this.context.sharedData.set('buildValidation', buildResult);
      overallConfidence += buildResult.confidence;

      if (!buildResult.success) {
        spinner1.fail(`Build failed: ${buildResult.errors.join(', ')}`);
        errors.push(...buildResult.errors);
      } else {
        spinner1.succeed('Build passed');
      }

      // Agent 14: Visual Comparator
      if (this.config.validation.visualComparisonRequired) {
        const spinner2 = ora('Comparing visuals...').start();
        const visualComparator = new VisualComparatorAgent(this.config.productionUrl);
        const visualResult = await visualComparator.execute();
        this.context.sharedData.set('visualComparison', visualResult);
        overallConfidence += visualResult.confidence;
        spinner2.succeed(`Visual similarity: ${(visualResult.similarity * 100).toFixed(0)}%`);
      }

      // Agent 15: Data Verifier
      if (this.config.validation.dataVerificationRequired) {
        const spinner3 = ora('Verifying data integrity...').start();
        const dataVerifier = new DataVerifierAgent();
        const dataResult = await dataVerifier.execute();
        this.context.sharedData.set('dataVerification', dataResult);
        overallConfidence += dataResult.confidence;
        spinner3.succeed(`Data integrity: ${dataResult.passed}/${dataResult.total} checks passed`);
      }

      // Agent 16: Functional Tester
      const spinner4 = ora('Running functional tests...').start();
      const functionalTester = new FunctionalTesterAgent();
      const testResult = await functionalTester.execute();
      this.context.sharedData.set('functionalTests', testResult);
      overallConfidence += testResult.confidence;
      spinner4.succeed(`Tests: ${testResult.passed}/${testResult.total} passed`);

      overallConfidence /= 4;

      const result: PhaseResult = {
        phase: 'validation',
        success: errors.length === 0,
        confidence: overallConfidence,
        duration: Date.now() - startTime,
        errors,
        data: {
          build: buildResult,
          visual: this.context.sharedData.get('visualComparison'),
          data: this.context.sharedData.get('dataVerification'),
          tests: testResult,
        },
      };

      this.context.phaseResults.push(result);
      await this.auditTrail.logPhase(result);

      console.log(chalk.green(`\n✓ Phase 4 completed with ${(overallConfidence * 100).toFixed(0)}% confidence`));
      return result;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(errorMsg);

      const result: PhaseResult = {
        phase: 'validation',
        success: false,
        confidence: 0,
        duration: Date.now() - startTime,
        errors,
        data: null,
      };

      this.context.phaseResults.push(result);
      return result;
    }
  }

  /**
   * Phase 5: Deployment (Agents 17-20)
   */
  private async executePhase5Deployment(): Promise<PhaseResult> {
    console.log(chalk.bold.blue('\n🚀 Phase 5: Deployment\n'));
    const startTime = Date.now();
    const errors: string[] = [];
    let overallConfidence = 0;

    try {
      // Agent 18: Risk Assessor
      const spinner1 = ora('Assessing deployment risk...').start();
      const riskAssessor = new RiskAssessorAgent(this.context.phaseResults);
      const riskAssessment = await riskAssessor.execute();
      this.context.sharedData.set('riskAssessment', riskAssessment);
      overallConfidence += riskAssessment.confidence;
      spinner1.succeed(`Risk level: ${riskAssessment.level} (score: ${riskAssessment.score})`);

      // Check if risk is acceptable
      if (this.config.risk.blockOnCritical && riskAssessment.level === 'CRITICAL') {
        throw new Error('Deployment blocked: Critical risk detected');
      }

      // Agent 19: Deployment Executor
      if (!this.context.dryRun) {
        const spinner2 = ora('Executing deployment...').start();
        const deploymentExecutor = new DeploymentExecutorAgent(this.config);
        const deployResult = await deploymentExecutor.execute();
        this.context.sharedData.set('deployment', deployResult);
        overallConfidence += deployResult.confidence;
        spinner2.succeed(`Deployed successfully: ${deployResult.url}`);
      } else {
        console.log(chalk.yellow('⚠️  Dry run mode: Skipping actual deployment'));
      }

      overallConfidence /= 2;

      const result: PhaseResult = {
        phase: 'deployment',
        success: true,
        confidence: overallConfidence,
        duration: Date.now() - startTime,
        errors,
        data: {
          risk: riskAssessment,
          deployment: this.context.sharedData.get('deployment'),
        },
      };

      this.context.phaseResults.push(result);
      await this.auditTrail.logPhase(result);

      console.log(chalk.green(`\n✓ Phase 5 completed with ${(overallConfidence * 100).toFixed(0)}% confidence`));
      return result;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(errorMsg);

      const result: PhaseResult = {
        phase: 'deployment',
        success: false,
        confidence: 0,
        duration: Date.now() - startTime,
        errors,
        data: null,
      };

      this.context.phaseResults.push(result);
      return result;
    }
  }

  /**
   * Attempt auto-healing for failed phase
   */
  private async attemptAutoHealing(phaseName: string, result: PhaseResult): Promise<void> {
    console.log(chalk.yellow(`\n🔧 Attempting auto-healing for ${phaseName}...`));

    const autoHealer = new AutoHealerAgent(this.config);
    const healingResult = await autoHealer.execute(result);

    if (healingResult.success) {
      console.log(chalk.green(`✓ Auto-healing successful for ${phaseName}`));
      // Retry the phase
      await this.executePhase(phaseName);
    } else {
      console.log(chalk.red(`✗ Auto-healing failed for ${phaseName}`));
    }
  }

  /**
   * Generate final execution report
   */
  private async generateFinalReport(): Promise<void> {
    const totalDuration = Date.now() - this.context.startTime;
    const overallConfidence = this.context.phaseResults.reduce(
      (sum, r) => sum + r.confidence,
      0
    ) / this.context.phaseResults.length;

    const report = {
      timestamp: new Date().toISOString(),
      mode: this.config.mode,
      dryRun: this.context.dryRun,
      duration: totalDuration,
      overallConfidence,
      phases: this.context.phaseResults,
      success: this.context.phaseResults.every(r => r.success),
    };

    // Save report
    const outputDir = path.join(process.cwd(), 'scripts/rescue/outputs');
    await fs.mkdir(outputDir, { recursive: true });
    const reportPath = path.join(outputDir, `rescue-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Log final audit
    await this.auditTrail.logComplete(report);

    // Display summary
    console.log(chalk.bold.cyan('\n📋 Execution Summary\n'));
    console.log(chalk.gray(`Duration: ${(totalDuration / 1000).toFixed(1)}s`));
    console.log(chalk.gray(`Overall Confidence: ${(overallConfidence * 100).toFixed(0)}%`));
    console.log(chalk.gray(`Success: ${report.success ? 'Yes' : 'No'}`));
    console.log(chalk.gray(`Report saved to: ${reportPath}\n`));

    if (report.success) {
      console.log(chalk.green.bold('✓ Rescue operation completed successfully!\n'));
    } else {
      console.log(chalk.red.bold('✗ Rescue operation encountered errors\n'));
    }
  }
}

/**
 * CLI Entry Point
 */
export async function main() {
  const program = new Command();

  program
    .name('rescue')
    .description('LibraLab Autonomous Rescue System')
    .version('1.0.0')
    .option('--phase <name>', 'Execute specific phase (analysis|strategy|execution|validation|deployment)')
    .option('--all', 'Execute all phases', false)
    .option('--mode <mode>', 'Execution mode (autonomous|manual)', 'autonomous')
    .option('--dry-run', 'Run without making actual changes', false)
    .option('--config <path>', 'Path to config file', './config/rescue-config.json');

  program.parse();

  const options = program.opts();

  // Load configuration
  const configPath = path.resolve(process.cwd(), 'scripts/rescue', options.config);
  const configContent = await fs.readFile(configPath, 'utf-8');
  const config: RescueConfig = JSON.parse(configContent);

  // Override mode if specified
  if (options.mode) {
    config.mode = options.mode as 'autonomous' | 'manual';
  }

  // Create and execute orchestrator
  const orchestrator = new RescueOrchestrator(config, options.dryRun);

  if (options.phase) {
    await orchestrator.execute(options.phase);
  } else {
    await orchestrator.execute();
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}
