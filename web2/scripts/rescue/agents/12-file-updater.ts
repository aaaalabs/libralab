/**
 * File Updater Agent - Phase 4 Implementation
 * Takes GeneratedJSON and updates src/data/epicwg.json
 * Creates git branch, stages changes, generates commit message
 */

import { promises as fs } from 'fs';
import path from 'path';
import { getLogger } from '../utils/logger';
import { GitManager } from '../utils/git-manager';
import type {
  GeneratedJSON,
  ImageManifest,
  UpdateResult,
  AgentResult,
  ComparisonResult
} from '../types';

const log = getLogger();

export default class FileUpdaterAgent {
  private generatedJSON: GeneratedJSON;
  private imageManifest: ImageManifest;
  private comparisonResult?: ComparisonResult;
  private gitManager: GitManager;
  private targetFile: string;

  constructor(
    generatedJSON: GeneratedJSON,
    imageManifest: ImageManifest,
    comparisonResult?: ComparisonResult,
    targetFile: string = './src/data/epicwg.json'
  ) {
    this.generatedJSON = generatedJSON;
    this.imageManifest = imageManifest;
    this.comparisonResult = comparisonResult;
    this.targetFile = targetFile;
    this.gitManager = new GitManager();
  }

  /**
   * Execute the file updater agent
   */
  async execute(): Promise<AgentResult<UpdateResult>> {
    const startTime = Date.now();
    log.info(
      'Starting File Updater Agent',
      {
        validated: this.generatedJSON.validated,
        targetFile: this.targetFile
      },
      'file-updater'
    );

    try {
      const filesUpdated: string[] = [];
      const filesCreated: string[] = [];
      const backups: string[] = [];

      // Check if target file exists
      const fileExists = await this.fileExists(this.targetFile);

      // Update epicwg.json
      await this.updateJSON();
      if (fileExists) {
        filesUpdated.push(this.targetFile);
      } else {
        filesCreated.push(this.targetFile);
      }

      // Add backup path to backups list
      if (this.generatedJSON.backupPath && this.generatedJSON.backupPath !== 'none') {
        backups.push(this.generatedJSON.backupPath);
      }

      // Create git branch
      const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
      const branchName = `rescue/production-sync-${timestamp}`;

      await this.gitManager.createBranch(branchName);

      // Stage all changes
      const filesToStage = [...filesUpdated, ...filesCreated];
      await this.gitManager.stageFiles(filesToStage);

      // Generate commit message
      const commitMessage = this.generateCommitMessage();

      // Get git status
      const gitStatus = await this.gitManager.getStatus();

      // Calculate confidence
      const confidence = this.calculateConfidence(filesUpdated.length + filesCreated.length);

      const duration = Date.now() - startTime;

      const result: UpdateResult = {
        filesUpdated,
        filesCreated,
        backups,
        gitStatus: {
          branch: gitStatus.branch,
          staged: gitStatus.staged,
          commitMessage
        },
        confidence
      };

      log.success(
        'File Updater completed successfully',
        {
          duration: `${duration}ms`,
          filesUpdated: filesUpdated.length,
          filesCreated: filesCreated.length,
          branch: branchName,
          confidence
        },
        'file-updater'
      );

      return {
        success: true,
        data: result,
        confidence,
        timestamp: new Date()
      };
    } catch (error: any) {
      log.error('File Updater Agent failed', error.message, 'file-updater');

      return {
        success: false,
        error: error.message,
        confidence: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Update epicwg.json file
   */
  private async updateJSON(): Promise<void> {
    const dir = path.dirname(this.targetFile);
    await fs.mkdir(dir, { recursive: true });

    // Pretty-print with 2-space indent
    const jsonString = JSON.stringify(this.generatedJSON.newJSON, null, 2);
    await fs.writeFile(this.targetFile, jsonString, 'utf-8');

    log.success(`Updated ${this.targetFile}`, undefined, 'file-updater');
  }

  /**
   * Generate detailed commit message
   */
  private generateCommitMessage(): string {
    const lines: string[] = [];

    lines.push('feat: sync production data from rescue system');
    lines.push('');

    if (this.comparisonResult) {
      const stats = this.comparisonResult.stats;
      lines.push('Changes summary:');

      if (stats.addedRooms > 0) {
        lines.push(`- Added ${stats.addedRooms} room(s)`);
      }
      if (stats.removedRooms > 0) {
        lines.push(`- Removed ${stats.removedRooms} room(s)`);
      }
      if (stats.changedRooms > 0) {
        lines.push(`- Modified ${stats.changedRooms} room(s)`);
      }
      if (stats.unchangedRooms > 0) {
        lines.push(`- Unchanged ${stats.unchangedRooms} room(s)`);
      }
      lines.push('');
    }

    lines.push('Image assets:');
    lines.push(`- Downloaded: ${this.imageManifest.downloaded.length}`);
    lines.push(`- Missing: ${this.imageManifest.missing.length}`);
    lines.push(`- Errors: ${this.imageManifest.errors.length}`);
    lines.push('');

    if (this.generatedJSON.schemaValidation.autoFixed) {
      lines.push('Note: Auto-fixes applied during schema validation');
      lines.push('');
    }

    lines.push('Generated by: Autonomous Rescue System');
    lines.push(`Confidence: ${(this.generatedJSON.confidence * 100).toFixed(1)}%`);

    return lines.join('\n');
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(filesProcessed: number): number {
    let score = 0.5; // Base confidence

    // Files successfully processed
    if (filesProcessed > 0) {
      score += 0.2;
    }

    // Schema validation
    if (this.generatedJSON.validated) {
      score += 0.2;
    } else {
      score -= 0.1;
    }

    // Image manifest quality
    const totalImages = this.imageManifest.downloaded.length +
                        this.imageManifest.missing.length +
                        this.imageManifest.errors.length;

    if (totalImages > 0) {
      const downloadedRatio = this.imageManifest.downloaded.length / totalImages;
      score += downloadedRatio * 0.1;
    }

    // Comparison result confidence
    if (this.comparisonResult) {
      score += this.comparisonResult.confidence * 0.2;
    }

    // Ensure score is between 0 and 1
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Commit the staged changes
   */
  async commit(): Promise<void> {
    const commitMessage = this.generateCommitMessage();
    await this.gitManager.commit(commitMessage);
    log.success('Changes committed to git', undefined, 'file-updater');
  }
}
