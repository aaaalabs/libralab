/**
 * Git Manager - Handles git operations for the rescue system
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { getLogger } from './logger';

const execAsync = promisify(exec);
const log = getLogger();

export interface GitStatus {
  branch: string;
  staged: string[];
  unstaged: string[];
  untracked: string[];
}

export class GitManager {
  private workDir: string;

  constructor(workDir: string = process.cwd()) {
    this.workDir = workDir;
  }

  /**
   * Create a new branch
   */
  async createBranch(branchName: string): Promise<void> {
    try {
      await this.execGit(`git checkout -b ${branchName}`);
      log.success(`Created and switched to branch: ${branchName}`, undefined, 'git-manager');
    } catch (error: any) {
      log.error(`Failed to create branch: ${error.message}`, undefined, 'git-manager');
      throw error;
    }
  }

  /**
   * Stage files
   */
  async stageFiles(files: string[]): Promise<void> {
    try {
      for (const file of files) {
        await this.execGit(`git add "${file}"`);
      }
      log.success(`Staged ${files.length} file(s)`, { files }, 'git-manager');
    } catch (error: any) {
      log.error(`Failed to stage files: ${error.message}`, undefined, 'git-manager');
      throw error;
    }
  }

  /**
   * Commit changes
   */
  async commit(message: string): Promise<void> {
    try {
      await this.execGit(`git commit -m "${message}"`);
      log.success('Changes committed', { message }, 'git-manager');
    } catch (error: any) {
      log.error(`Failed to commit: ${error.message}`, undefined, 'git-manager');
      throw error;
    }
  }

  /**
   * Get current git status
   */
  async getStatus(): Promise<GitStatus> {
    try {
      // Get current branch
      const branchResult = await this.execGit('git branch --show-current');
      const branch = branchResult.stdout.trim();

      // Get status
      const statusResult = await this.execGit('git status --porcelain');
      const lines = statusResult.stdout.trim().split('\n').filter(Boolean);

      const staged: string[] = [];
      const unstaged: string[] = [];
      const untracked: string[] = [];

      for (const line of lines) {
        const status = line.substring(0, 2);
        const file = line.substring(3);

        if (status.startsWith('?')) {
          untracked.push(file);
        } else if (status[0] !== ' ') {
          staged.push(file);
        } else {
          unstaged.push(file);
        }
      }

      return { branch, staged, unstaged, untracked };
    } catch (error: any) {
      log.error(`Failed to get git status: ${error.message}`, undefined, 'git-manager');
      throw error;
    }
  }

  /**
   * Execute git command
   */
  private async execGit(command: string): Promise<{ stdout: string; stderr: string }> {
    return execAsync(command, { cwd: this.workDir });
  }
}
