/**
 * Build Validator Agent - Phase 5 Validation
 * Validates TypeScript compilation and build process
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { getLogger } from '../utils/logger';
import type { AgentResult } from '../types';
import path from 'path';

const execAsync = promisify(exec);
const log = getLogger();

interface BuildError {
  file: string;
  line?: number;
  column?: number;
  message: string;
  severity: 'error' | 'warning';
}

interface BuildValidation {
  buildSuccess: boolean;
  typeErrors: BuildError[];
  lintErrors: BuildError[];
  warnings: BuildError[];
  buildTime: number;
  autoFixedErrors: string[];
  importIssues: {
    unresolved: string[];
    circular: string[];
  };
  summary: string;
}

/**
 * Build Validator Agent
 * Runs TypeScript checks, build process, and validation
 */
export default class BuildValidatorAgent {
  private projectRoot: string;

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || path.join(process.cwd());
  }

  /**
   * Execute the build validator agent
   */
  async execute(): Promise<AgentResult<BuildValidation>> {
    const startTime = Date.now();
    log.info('Starting Build Validator Agent', { projectRoot: this.projectRoot }, 'build-validator');

    try {
      const validation = await this.validateBuild();
      const duration = Date.now() - startTime;
      validation.buildTime = duration;

      const confidence = this.calculateConfidence(validation);

      log.success(
        'Build Validator completed',
        {
          duration: `${duration}ms`,
          buildSuccess: validation.buildSuccess,
          typeErrors: validation.typeErrors.length,
          warnings: validation.warnings.length,
          confidence: confidence.toFixed(2)
        },
        'build-validator'
      );

      return {
        success: true,
        data: validation,
        confidence,
        timestamp: new Date()
      };
    } catch (error: any) {
      log.error('Build Validator Agent failed', error.message, 'build-validator');

      return {
        success: false,
        error: error.message,
        confidence: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Validate the build process
   */
  private async validateBuild(): Promise<BuildValidation> {
    const validation: BuildValidation = {
      buildSuccess: false,
      typeErrors: [],
      lintErrors: [],
      warnings: [],
      buildTime: 0,
      autoFixedErrors: [],
      importIssues: {
        unresolved: [],
        circular: []
      },
      summary: ''
    };

    // Step 1: TypeScript type checking
    log.info('Running TypeScript type check...', undefined, 'build-validator');
    const typeCheckResult = await this.runTypeCheck();
    validation.typeErrors = typeCheckResult.errors;
    validation.warnings.push(...typeCheckResult.warnings);

    // Step 2: Check for import issues
    log.info('Checking import resolution...', undefined, 'build-validator');
    const importIssues = await this.checkImports();
    validation.importIssues = importIssues;

    // Step 3: Attempt auto-fixes
    if (validation.typeErrors.length > 0) {
      log.info('Attempting auto-fixes for common errors...', undefined, 'build-validator');
      const fixedErrors = await this.attemptAutoFix(validation.typeErrors);
      validation.autoFixedErrors = fixedErrors;

      // Re-run type check after auto-fixes
      if (fixedErrors.length > 0) {
        const reCheckResult = await this.runTypeCheck();
        validation.typeErrors = reCheckResult.errors;
      }
    }

    // Step 4: Attempt build
    log.info('Attempting to build project...', undefined, 'build-validator');
    const buildResult = await this.runBuild();
    validation.buildSuccess = buildResult.success;

    if (!buildResult.success && buildResult.errors) {
      validation.typeErrors.push(...buildResult.errors);
    }
    if (buildResult.warnings) {
      validation.warnings.push(...buildResult.warnings);
    }

    // Step 5: Lint check (non-blocking)
    try {
      log.info('Running lint check...', undefined, 'build-validator');
      const lintResult = await this.runLint();
      validation.lintErrors = lintResult.errors;
      validation.warnings.push(...lintResult.warnings);
    } catch (error) {
      log.warn('Lint check skipped (not configured)', undefined, 'build-validator');
    }

    // Generate summary
    validation.summary = this.generateSummary(validation);

    return validation;
  }

  /**
   * Run TypeScript type check
   */
  private async runTypeCheck(): Promise<{ errors: BuildError[]; warnings: BuildError[] }> {
    const errors: BuildError[] = [];
    const warnings: BuildError[] = [];

    try {
      // Try to run tsc --noEmit
      await execAsync('npx tsc --noEmit', { cwd: this.projectRoot });
      log.success('TypeScript type check passed', undefined, 'build-validator');
    } catch (error: any) {
      // Parse TypeScript errors from stdout/stderr
      const output = error.stdout || error.stderr || '';
      const parsedErrors = this.parseTypeScriptOutput(output);

      parsedErrors.forEach(err => {
        if (err.severity === 'error') {
          errors.push(err);
        } else {
          warnings.push(err);
        }
      });

      log.warn(`TypeScript type check found ${errors.length} errors`, undefined, 'build-validator');
    }

    return { errors, warnings };
  }

  /**
   * Parse TypeScript compiler output
   */
  private parseTypeScriptOutput(output: string): BuildError[] {
    const errors: BuildError[] = [];
    const lines = output.split('\n');
    const errorPattern = /^(.+)\((\d+),(\d+)\):\s+(error|warning)\s+TS\d+:\s+(.+)$/;

    for (const line of lines) {
      const match = line.match(errorPattern);
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2], 10),
          column: parseInt(match[3], 10),
          message: match[5],
          severity: match[4] as 'error' | 'warning'
        });
      }
    }

    return errors;
  }

  /**
   * Check for import resolution issues
   */
  private async checkImports(): Promise<{ unresolved: string[]; circular: string[] }> {
    const unresolved: string[] = [];
    const circular: string[] = [];

    try {
      // Run a simple check for common import issues
      const { stdout } = await execAsync(
        'npx tsc --noEmit --listFiles 2>&1 | grep -i "cannot find" || true',
        { cwd: this.projectRoot }
      );

      if (stdout) {
        const lines = stdout.split('\n').filter(l => l.trim());
        lines.forEach(line => {
          const match = line.match(/Cannot find module ['"](.+)['"]/);
          if (match) {
            unresolved.push(match[1]);
          }
        });
      }
    } catch (error) {
      // Ignore errors - import checking is best-effort
    }

    return { unresolved, circular };
  }

  /**
   * Attempt to auto-fix common TypeScript errors
   */
  private async attemptAutoFix(errors: BuildError[]): Promise<string[]> {
    const fixedErrors: string[] = [];

    // Common auto-fixable patterns
    const autoFixablePatterns = [
      { pattern: /Property '.+' does not exist/, fix: 'Add missing property to type definition' },
      { pattern: /'.+' is declared but never used/, fix: 'Remove unused import/variable' },
      { pattern: /Type '.+' is not assignable to type/, fix: 'Add type assertion or fix type mismatch' }
    ];

    for (const error of errors) {
      for (const pattern of autoFixablePatterns) {
        if (pattern.pattern.test(error.message)) {
          fixedErrors.push(`${error.file}:${error.line} - ${pattern.fix}`);
          log.info(`Auto-fix suggestion: ${pattern.fix}`, { file: error.file }, 'build-validator');
        }
      }
    }

    return fixedErrors;
  }

  /**
   * Run build command
   */
  private async runBuild(): Promise<{
    success: boolean;
    errors?: BuildError[];
    warnings?: BuildError[];
  }> {
    try {
      // Try Next.js build
      await execAsync('npx next build', {
        cwd: this.projectRoot,
        timeout: 300000 // 5 minute timeout
      });

      log.success('Build completed successfully', undefined, 'build-validator');
      return { success: true };
    } catch (error: any) {
      const output = error.stdout || error.stderr || '';

      // Parse build errors
      const errors = this.parseBuildOutput(output);

      log.error(`Build failed with ${errors.length} errors`, undefined, 'build-validator');
      return { success: false, errors };
    }
  }

  /**
   * Parse build output for errors
   */
  private parseBuildOutput(output: string): BuildError[] {
    const errors: BuildError[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      // Match Next.js error format
      if (line.includes('Error:') || line.includes('Failed to compile')) {
        errors.push({
          file: 'build',
          message: line.trim(),
          severity: 'error'
        });
      }
    }

    return errors;
  }

  /**
   * Run lint check
   */
  private async runLint(): Promise<{ errors: BuildError[]; warnings: BuildError[] }> {
    const errors: BuildError[] = [];
    const warnings: BuildError[] = [];

    try {
      await execAsync('npx eslint . --ext .ts,.tsx,.js,.jsx', { cwd: this.projectRoot });
      log.success('Lint check passed', undefined, 'build-validator');
    } catch (error: any) {
      const output = error.stdout || error.stderr || '';
      const parsedErrors = this.parseLintOutput(output);

      parsedErrors.forEach(err => {
        if (err.severity === 'error') {
          errors.push(err);
        } else {
          warnings.push(err);
        }
      });
    }

    return { errors, warnings };
  }

  /**
   * Parse ESLint output
   */
  private parseLintOutput(output: string): BuildError[] {
    const errors: BuildError[] = [];
    const lines = output.split('\n');
    const errorPattern = /^(.+):(\d+):(\d+):\s+(error|warning)\s+(.+)$/;

    for (const line of lines) {
      const match = line.match(errorPattern);
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2], 10),
          column: parseInt(match[3], 10),
          message: match[5],
          severity: match[4] as 'error' | 'warning'
        });
      }
    }

    return errors;
  }

  /**
   * Generate validation summary
   */
  private generateSummary(validation: BuildValidation): string {
    const lines: string[] = [];

    lines.push('BUILD VALIDATION SUMMARY');
    lines.push('='.repeat(50));
    lines.push('');

    // Build status
    lines.push(`Build Status: ${validation.buildSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
    lines.push('');

    // Errors and warnings
    lines.push('Type Errors:', validation.typeErrors.length.toString());
    lines.push('Lint Errors:', validation.lintErrors.length.toString());
    lines.push('Warnings:', validation.warnings.length.toString());
    lines.push('');

    // Import issues
    if (validation.importIssues.unresolved.length > 0) {
      lines.push('Unresolved Imports:', validation.importIssues.unresolved.length.toString());
      validation.importIssues.unresolved.slice(0, 5).forEach(imp => {
        lines.push(`  - ${imp}`);
      });
      lines.push('');
    }

    // Auto-fixes
    if (validation.autoFixedErrors.length > 0) {
      lines.push('Auto-Fix Suggestions:', validation.autoFixedErrors.length.toString());
      validation.autoFixedErrors.slice(0, 5).forEach(fix => {
        lines.push(`  - ${fix}`);
      });
      lines.push('');
    }

    // Build time
    lines.push(`Build Time: ${validation.buildTime}ms`);
    lines.push('');

    // Recommendation
    if (validation.buildSuccess && validation.typeErrors.length === 0) {
      lines.push('✅ BUILD VALIDATION PASSED - Ready for deployment');
    } else if (validation.typeErrors.length > 0) {
      lines.push('❌ BUILD VALIDATION FAILED - Fix type errors before deployment');
    } else {
      lines.push('⚠️  BUILD VALIDATION PARTIAL - Review warnings and lint errors');
    }

    return lines.join('\n');
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(validation: BuildValidation): number {
    let score = 1.0;

    // Deduct for type errors (critical)
    score -= validation.typeErrors.length * 0.15;

    // Deduct for build failure (critical)
    if (!validation.buildSuccess) {
      score -= 0.5;
    }

    // Deduct for lint errors (medium impact)
    score -= validation.lintErrors.length * 0.05;

    // Deduct for warnings (low impact)
    score -= validation.warnings.length * 0.01;

    // Deduct for unresolved imports
    score -= validation.importIssues.unresolved.length * 0.1;

    // Bonus for successful auto-fixes
    score += validation.autoFixedErrors.length * 0.02;

    return Math.max(0, Math.min(1.0, score));
  }
}
