/**
 * Backup Manager - Handles backup operations for the rescue system
 */

import { promises as fs } from 'fs';
import path from 'path';
import { getLogger } from './logger';

const log = getLogger();

export class BackupManager {
  private backupDir: string;

  constructor(backupDir: string = './backups') {
    this.backupDir = backupDir;
  }

  /**
   * Create a backup of a file with timestamp
   */
  async createBackup(filePath: string): Promise<string> {
    try {
      // Ensure backup directory exists
      await fs.mkdir(this.backupDir, { recursive: true });

      // Generate backup filename with timestamp
      const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
      const fileName = path.basename(filePath);
      const backupFileName = `${fileName}.${timestamp}.backup`;
      const backupPath = path.join(this.backupDir, backupFileName);

      // Read and copy file
      const content = await fs.readFile(filePath, 'utf-8');
      await fs.writeFile(backupPath, content, 'utf-8');

      log.success(`Backup created: ${backupPath}`, undefined, 'backup-manager');

      return backupPath;
    } catch (error: any) {
      log.error(`Failed to create backup: ${error.message}`, undefined, 'backup-manager');
      throw error;
    }
  }

  /**
   * List all backups for a specific file
   */
  async listBackups(fileName: string): Promise<string[]> {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = files
        .filter(f => f.startsWith(fileName) && f.includes('.backup'))
        .map(f => path.join(this.backupDir, f));

      return backups;
    } catch (error: any) {
      log.warn(`Failed to list backups: ${error.message}`, undefined, 'backup-manager');
      return [];
    }
  }

  /**
   * Restore from a backup
   */
  async restoreBackup(backupPath: string, targetPath: string): Promise<void> {
    try {
      const content = await fs.readFile(backupPath, 'utf-8');
      await fs.writeFile(targetPath, content, 'utf-8');

      log.success(`Restored from backup: ${backupPath} -> ${targetPath}`, undefined, 'backup-manager');
    } catch (error: any) {
      log.error(`Failed to restore backup: ${error.message}`, undefined, 'backup-manager');
      throw error;
    }
  }
}
