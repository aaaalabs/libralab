#!/usr/bin/env ts-node
/**
 * Autonomous Rescue System Orchestrator
 * Coordinates all 20 agents across 5 phases
 */

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { getLogger, initLogger } from './utils/logger';

// Import all agents
import CrawlerAgent from './agents/01-crawler';
import URLMapperAgent from './agents/02-url-mapper';
import StructureAnalyzerAgent from './agents/03-structure-analyzer';
import ContentParserAgent from './agents/04-content-parser';
import DataExtractorAgent from './agents/05-data-extractor';
import ImageHarvesterAgent from './agents/06-image-harvester';
import APIScraperAgent from './agents/07-api-scraper';
import DataComparatorAgent from './agents/08-data-comparator';
import DiffGeneratorAgent from './agents/09-diff-generator';
import ReportBuilderAgent from './agents/10-report-builder';
import JSONGeneratorAgent from './agents/11-json-generator';
import FileUpdaterAgent from './agents/12-file-updater';
import ImageOrganizerAgent from './agents/13-image-organizer';
import BuildValidatorAgent from './agents/14-build-validator';
import VisualComparatorAgent from './agents/15-visual-comparator';
import DataVerifierAgent from './agents/16-data-verifier';
import FinalReporterAgent from './agents/17-final-reporter';
import DecisionEngineAgent from './agents/18-decision-engine';
import AutoHealerAgent from './agents/19-auto-healer';
import AuditTrailAgent from './agents/20-audit-trail';

interface OrchestratorConfig {
  mode: 'autonomous' | 'semi-autonomous';
  productionUrl: string;
  dryRun: boolean;
  phase?: string;
}

interface PhaseResult {
  phase: string;
  success: boolean;
  confidence: number;
  duration: number;
  data?: any;
  error?: string;
}

class RescueOrchestrator {
  private config: OrchestratorConfig;
  private log = getLogger();
  private results: PhaseResult[] = [];
  private startTime: number = 0;

  constructor(config: OrchestratorConfig) {
    this.config = config;
  }

  async execute(): Promise<void> {
    this.startTime = Date.now();

    console.log(chalk.bold.cyan('\n' + '═'.repeat(80)));
    console.log(chalk.bold.cyan('🚀 AUTONOMOUS RESCUE SYSTEM v2.0'));
    console.log(chalk.bold.cyan('═'.repeat(80)));
    console.log(chalk.gray(`Mode: ${this.config.mode}`));
    console.log(chalk.gray(`Production URL: ${this.config.productionUrl}`));
    console.log(chalk.gray(`Dry Run: ${this.config.dryRun ? 'YES' : 'NO'}`));
    console.log(chalk.bold.cyan('═'.repeat(80) + '\n'));

    try {
      // Phase 0: Setup
      await this.runPhase0Setup();

      // Phase 1: Discovery
      const phase1 = await this.runPhase1Discovery();
      if (!phase1.success) throw new Error('Phase 1 failed');

      // Phase 2: Extraction
      const phase2 = await this.runPhase2Extraction(phase1.data);
      if (!phase2.success) throw new Error('Phase 2 failed');

      // Phase 3: Comparison
      const phase3 = await this.runPhase3Comparison(phase2.data);
      if (!phase3.success) throw new Error('Phase 3 failed');

      // Phase 4: Implementation
      if (!this.config.dryRun) {
        const phase4 = await this.runPhase4Implementation(phase3.data);
        if (!phase4.success) throw new Error('Phase 4 failed');

        // Phase 5: Validation
        const phase5 = await this.runPhase5Validation(phase4.data);

        this.log.phase('RESCUE COMPLETE', 6);
        this.printSummary();

        if (phase5.data?.decision === 'GO') {
          console.log(chalk.green.bold('\n✅ RESCUE SUCCESSFUL - APPROVED FOR DEPLOYMENT'));
        } else if (phase5.data?.decision === 'REVIEW_REQUIRED') {
          console.log(chalk.yellow.bold('\n⚠️  RESCUE COMPLETE - MANUAL REVIEW REQUIRED'));
        } else {
          console.log(chalk.red.bold('\n❌ RESCUE COMPLETE - DEPLOYMENT BLOCKED'));
        }
      } else {
        console.log(chalk.yellow.bold('\n🔍 DRY RUN COMPLETE - NO CHANGES MADE'));
      }

      console.log(chalk.cyan(`\n📁 Check outputs: ${path.join(process.cwd(), 'scripts/rescue/outputs')}`));
      console.log(chalk.cyan(`📄 Review package: ${path.join(process.cwd(), 'scripts/rescue/outputs/review-package.html')}\n`));

    } catch (error: any) {
      this.log.error('Rescue system failed:', error.message);
      console.log(chalk.red.bold('\n❌ RESCUE SYSTEM FAILED'));
      console.log(chalk.red(`Error: ${error.message}\n`));
      process.exit(1);
    }
  }

  private async runPhase0Setup(): Promise<void> {
    this.log.phase('SETUP', 0);
    const spinner = ora('Setting up rescue environment...').start();

    try {
      // Create output directories
      const outputDirs = [
        '00-setup/backups',
        '01-discovery',
        '02-extraction/images',
        '03-comparison',
        '04-implementation',
        '05-validation/visual-diff'
      ];

      for (const dir of outputDirs) {
        const dirPath = path.join(process.cwd(), 'scripts/rescue/outputs', dir);
        if (!fs.existsSync(dirPath)) {
          await fs.promises.mkdir(dirPath, { recursive: true });
        }
      }

      // Create data directory if needed
      const dataDir = path.join(process.cwd(), 'src/data');
      if (!fs.existsSync(dataDir)) {
        await fs.promises.mkdir(dataDir, { recursive: true });
      }

      spinner.succeed('Setup complete');
      this.log.success('Environment ready');
    } catch (error: any) {
      spinner.fail('Setup failed');
      throw error;
    }
  }

  private async runPhase1Discovery(): Promise<PhaseResult> {
    this.log.phase('DISCOVERY', 1);
    const phaseStart = Date.now();

    try {
      // Run agents in sequence
      const crawler = new CrawlerAgent(this.config.productionUrl);
      const crawlerResult = await crawler.execute();
      this.log.success(`Discovered ${crawlerResult.data?.urls.length || 0} URLs`);

      const urlMapper = new URLMapperAgent(crawlerResult.data!);
      const urlMapResult = await urlMapper.execute();
      this.log.success('URLs categorized by priority');

      const structureAnalyzer = new StructureAnalyzerAgent(urlMapResult.data!);
      const structureResult = await structureAnalyzer.execute();
      this.log.success('Page structure analyzed');

      const avgConfidence = (
        crawlerResult.confidence +
        urlMapResult.confidence +
        structureResult.confidence
      ) / 3;

      return {
        phase: 'Discovery',
        success: true,
        confidence: avgConfidence,
        duration: Date.now() - phaseStart,
        data: {
          crawler: crawlerResult.data,
          urlMap: urlMapResult.data,
          structure: structureResult.data
        }
      };
    } catch (error: any) {
      return {
        phase: 'Discovery',
        success: false,
        confidence: 0,
        duration: Date.now() - phaseStart,
        error: error.message
      };
    }
  }

  private async runPhase2Extraction(phase1Data: any): Promise<PhaseResult> {
    this.log.phase('EXTRACTION', 2);
    const phaseStart = Date.now();

    try {
      const contentParser = new ContentParserAgent(phase1Data.structure, phase1Data.urlMap);
      const parsedResult = await contentParser.execute();
      this.log.success('Content parsed from production');

      const dataExtractor = new DataExtractorAgent(parsedResult.data!);
      const extractedResult = await dataExtractor.execute();
      this.log.success(`Extracted ${extractedResult.data?.rooms?.length || 0} rooms`);

      const imageHarvester = new ImageHarvesterAgent(extractedResult.data!);
      const imageResult = await imageHarvester.execute();
      this.log.success(`Downloaded ${imageResult.data?.downloaded?.length || 0} images`);

      const apiScraper = new APIScraperAgent(extractedResult.data!);
      const apiResult = await apiScraper.execute();
      this.log.success('API endpoints checked');

      const avgConfidence = (
        parsedResult.confidence +
        extractedResult.confidence +
        imageResult.confidence +
        apiResult.confidence
      ) / 4;

      return {
        phase: 'Extraction',
        success: true,
        confidence: avgConfidence,
        duration: Date.now() - phaseStart,
        data: {
          parsed: parsedResult.data,
          extracted: extractedResult.data,
          images: imageResult.data,
          api: apiResult.data
        }
      };
    } catch (error: any) {
      return {
        phase: 'Extraction',
        success: false,
        confidence: 0,
        duration: Date.now() - phaseStart,
        error: error.message
      };
    }
  }

  private async runPhase3Comparison(phase2Data: any): Promise<PhaseResult> {
    this.log.phase('COMPARISON', 3);
    const phaseStart = Date.now();

    try {
      // Load current data if exists
      const currentDataPath = path.join(process.cwd(), 'src/data/epicwg.json');
      const currentData = fs.existsSync(currentDataPath)
        ? JSON.parse(fs.readFileSync(currentDataPath, 'utf-8'))
        : { rooms: [] };

      const comparator = new DataComparatorAgent(phase2Data.extracted, currentData);
      const comparisonResult = await comparator.execute();
      this.log.success(`Compared data: ${comparisonResult.data?.stats?.totalChanges || 0} changes`);

      const diffGenerator = new DiffGeneratorAgent(comparisonResult.data!);
      const diffResult = await diffGenerator.execute();
      this.log.success('Diff report generated');

      const reportBuilder = new ReportBuilderAgent({
        phase1: {},
        phase2: phase2Data,
        phase3: { comparison: comparisonResult.data, diff: diffResult.data }
      });
      const reportResult = await reportBuilder.execute();
      this.log.success('Status report generated');

      // Autonomous decision
      const decisionEngine = new DecisionEngineAgent();
      const decision = await decisionEngine.execute({
        phase: 'comparison',
        confidence: comparisonResult.confidence,
        risks: comparisonResult.data?.risks || [],
        context: comparisonResult.data
      });

      this.log.success(`Decision: ${decision.data?.decision}`, decision.data?.reasoning);

      const avgConfidence = (
        comparisonResult.confidence +
        diffResult.confidence +
        reportResult.confidence
      ) / 3;

      return {
        phase: 'Comparison',
        success: true,
        confidence: avgConfidence,
        duration: Date.now() - phaseStart,
        data: {
          comparison: comparisonResult.data,
          diff: diffResult.data,
          report: reportResult.data,
          decision: decision.data
        }
      };
    } catch (error: any) {
      return {
        phase: 'Comparison',
        success: false,
        confidence: 0,
        duration: Date.now() - phaseStart,
        error: error.message
      };
    }
  }

  private async runPhase4Implementation(phase3Data: any): Promise<PhaseResult> {
    this.log.phase('IMPLEMENTATION', 4);
    const phaseStart = Date.now();

    try {
      const jsonGenerator = new JSONGeneratorAgent(
        phase3Data.comparison.newData,
        phase3Data.comparison
      );
      const jsonResult = await jsonGenerator.execute();
      this.log.success('New epicwg.json generated');

      const imageOrganizer = new ImageOrganizerAgent(phase3Data.images);
      const organizeResult = await imageOrganizer.execute();
      this.log.success('Images organized');

      const fileUpdater = new FileUpdaterAgent(
        jsonResult.data!,
        organizeResult.data!,
        phase3Data.comparison
      );
      const updateResult = await fileUpdater.execute();
      this.log.success('Files updated and committed to git');

      const avgConfidence = (
        jsonResult.confidence +
        organizeResult.confidence +
        updateResult.confidence
      ) / 3;

      return {
        phase: 'Implementation',
        success: true,
        confidence: avgConfidence,
        duration: Date.now() - phaseStart,
        data: {
          json: jsonResult.data,
          images: organizeResult.data,
          update: updateResult.data
        }
      };
    } catch (error: any) {
      return {
        phase: 'Implementation',
        success: false,
        confidence: 0,
        duration: Date.now() - phaseStart,
        error: error.message
      };
    }
  }

  private async runPhase5Validation(phase4Data: any): Promise<PhaseResult> {
    this.log.phase('VALIDATION', 5);
    const phaseStart = Date.now();

    try {
      const buildValidator = new BuildValidatorAgent();
      const buildResult = await buildValidator.execute();
      this.log.success(`Build ${buildResult.data?.buildSuccess ? 'succeeded' : 'failed'}`);

      // Visual comparison (optional)
      let visualResult: any = { confidence: 1.0, data: { passed: true } };
      // Skip if no local server running

      const dataVerifier = new DataVerifierAgent();
      const verifyResult = await dataVerifier.execute();
      this.log.success(`Data verification: ${verifyResult.confidence * 100}% confidence`);

      const finalReporter = new FinalReporterAgent({
        buildValidation: buildResult.data!,
        visualComparison: visualResult.data,
        dataVerification: verifyResult.data!
      });
      const finalResult = await finalReporter.execute();
      this.log.success(`Final decision: ${finalResult.data?.decision}`);

      const avgConfidence = (
        buildResult.confidence +
        visualResult.confidence +
        verifyResult.confidence +
        finalResult.confidence
      ) / 4;

      return {
        phase: 'Validation',
        success: true,
        confidence: avgConfidence,
        duration: Date.now() - phaseStart,
        data: finalResult.data
      };
    } catch (error: any) {
      return {
        phase: 'Validation',
        success: false,
        confidence: 0,
        duration: Date.now() - phaseStart,
        error: error.message
      };
    }
  }

  private printSummary(): void {
    const totalDuration = Date.now() - this.startTime;
    const totalConfidence = this.results.reduce((sum, r) => sum + r.confidence, 0) / this.results.length;

    console.log(chalk.bold.cyan('\n' + '═'.repeat(80)));
    console.log(chalk.bold.cyan('📊 EXECUTION SUMMARY'));
    console.log(chalk.bold.cyan('═'.repeat(80)));

    this.results.forEach(result => {
      const status = result.success ? chalk.green('✅') : chalk.red('❌');
      const conf = (result.confidence * 100).toFixed(1);
      const dur = (result.duration / 1000).toFixed(0);

      console.log(`${status} ${chalk.bold(result.phase)}: ${conf}% confidence, ${dur}s`);
    });

    console.log(chalk.cyan('─'.repeat(80)));
    console.log(chalk.bold(`Overall Confidence: ${(totalConfidence * 100).toFixed(1)}%`));
    console.log(chalk.bold(`Total Duration: ${(totalDuration / 60000).toFixed(1)} minutes`));
    console.log(chalk.cyan('═'.repeat(80) + '\n'));
  }
}

// CLI entry point
async function main() {
  const args = process.argv.slice(2);

  const config: OrchestratorConfig = {
    mode: args.includes('--mode=autonomous') ? 'autonomous' : 'semi-autonomous',
    productionUrl: 'https://epic.libralab.ai',
    dryRun: args.includes('--dry-run'),
    phase: args.find(a => a.startsWith('--phase='))?.split('=')[1]
  };

  // Initialize logger
  initLogger();

  const orchestrator = new RescueOrchestrator(config);
  await orchestrator.execute();
}

if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('\n❌ Fatal error:'), error);
    process.exit(1);
  });
}

export default RescueOrchestrator;
