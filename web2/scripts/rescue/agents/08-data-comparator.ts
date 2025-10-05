import * as diff from 'deep-diff';
import { getLogger } from '../utils/logger';
import type {
  ExtractedData,
  EpicWGData,
  RoomData,
  ComparisonResult,
  RoomComparison,
  ChangeDetail,
  AgentResult
} from '../types';

const log = getLogger();

/**
 * Data Comparator Agent - Phase 3 Comparison
 * Compares extracted data with current epicwg.json
 * Identifies added, removed, and modified rooms
 */
export default class DataComparatorAgent {
  private newData: ExtractedData;
  private oldData: EpicWGData;

  constructor(newData: ExtractedData, oldData: EpicWGData) {
    this.newData = newData;
    this.oldData = oldData;
  }

  /**
   * Execute the data comparator agent
   */
  async execute(): Promise<AgentResult<ComparisonResult>> {
    const startTime = Date.now();
    log.info(
      'Starting Data Comparator Agent',
      {
        newRooms: this.newData.rooms.length,
        oldRooms: this.oldData.rooms.length
      },
      'data-comparator'
    );

    try {
      const comparison = await this.compareData();
      const duration = Date.now() - startTime;

      log.success(
        'Data Comparator completed successfully',
        {
          duration: `${duration}ms`,
          added: comparison.added.length,
          removed: comparison.removed.length,
          modified: comparison.modified.length,
          unchanged: comparison.unchanged.length,
          confidence: comparison.confidence
        },
        'data-comparator'
      );

      return {
        success: true,
        data: comparison,
        confidence: comparison.confidence,
        timestamp: new Date()
      };
    } catch (error: any) {
      log.error('Data Comparator Agent failed', error.message, 'data-comparator');

      return {
        success: false,
        error: error.message,
        confidence: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Compare new and old data
   */
  private async compareData(): Promise<ComparisonResult> {
    const added: RoomData[] = [];
    const removed: RoomData[] = [];
    const modified: RoomComparison[] = [];
    const unchanged: string[] = [];
    const criticalChanges: ChangeDetail[] = [];

    // Create maps for efficient lookup
    const oldRoomsMap = new Map(this.oldData.rooms.map(r => [r.id, r]));
    const newRoomsMap = new Map(this.newData.rooms.map(r => [r.id, r]));

    // Find added and modified rooms
    for (const newRoom of this.newData.rooms) {
      const oldRoom = oldRoomsMap.get(newRoom.id);

      if (!oldRoom) {
        added.push(newRoom);
      } else {
        const roomChanges = this.compareRooms(oldRoom, newRoom);

        if (roomChanges.length > 0) {
          modified.push({
            roomId: newRoom.id,
            status: 'modified',
            changes: roomChanges,
            confidence: this.calculateRoomConfidence(roomChanges)
          });

          // Collect critical changes
          const critical = roomChanges.filter(c => c.severity === 'critical');
          criticalChanges.push(...critical);
        } else {
          unchanged.push(newRoom.id);
        }
      }
    }

    // Find removed rooms
    for (const oldRoom of this.oldData.rooms) {
      if (!newRoomsMap.has(oldRoom.id)) {
        removed.push(oldRoom);
      }
    }

    const stats = {
      totalRooms: this.newData.rooms.length,
      changedRooms: modified.length,
      addedRooms: added.length,
      removedRooms: removed.length,
      unchangedRooms: unchanged.length
    };

    const confidence = this.calculateConfidence(stats, criticalChanges.length);

    return {
      added,
      removed,
      modified,
      unchanged,
      criticalChanges,
      stats,
      confidence,
      timestamp: new Date()
    };
  }

  /**
   * Compare two rooms and identify changes
   */
  private compareRooms(oldRoom: RoomData, newRoom: RoomData): ChangeDetail[] {
    const changes: ChangeDetail[] = [];

    // Use deep-diff to find all differences
    const differences = diff.diff(oldRoom, newRoom);

    if (!differences) {
      return changes;
    }

    for (const difference of differences) {
      const change = this.processDifference(difference, oldRoom, newRoom);
      if (change) {
        changes.push(change);
      }
    }

    return changes;
  }

  /**
   * Process a deep-diff difference into a ChangeDetail
   */
  private processDifference(
    difference: diff.Diff<any, any>,
    oldRoom: RoomData,
    newRoom: RoomData
  ): ChangeDetail | null {
    const field = this.getFieldPath(difference);
    const severity = this.determineSeverity(field);

    switch (difference.kind) {
      case 'E': // Edit
        return {
          field,
          oldValue: difference.lhs,
          newValue: difference.rhs,
          severity
        };

      case 'N': // New
        return {
          field,
          oldValue: undefined,
          newValue: difference.rhs,
          severity
        };

      case 'D': // Delete
        return {
          field,
          oldValue: difference.lhs,
          newValue: undefined,
          severity
        };

      case 'A': // Array change
        return {
          field,
          oldValue: this.getNestedValue(oldRoom, field),
          newValue: this.getNestedValue(newRoom, field),
          severity
        };

      default:
        return null;
    }
  }

  /**
   * Get field path from difference
   */
  private getFieldPath(difference: diff.Diff<any, any>): string {
    if (!difference.path) {
      return 'root';
    }

    return difference.path.join('.');
  }

  /**
   * Get nested value from object by path
   */
  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Determine severity of a change based on field
   */
  private determineSeverity(field: string): 'critical' | 'warning' | 'info' {
    const criticalFields = ['price', 'availability', 'id'];
    const warningFields = ['size', 'title', 'description'];

    const lowerField = field.toLowerCase();

    if (criticalFields.some(cf => lowerField.includes(cf))) {
      return 'critical';
    }

    if (warningFields.some(wf => lowerField.includes(wf))) {
      return 'warning';
    }

    return 'info';
  }

  /**
   * Calculate confidence for room comparison
   */
  private calculateRoomConfidence(changes: ChangeDetail[]): number {
    if (changes.length === 0) {
      return 1.0;
    }

    const criticalCount = changes.filter(c => c.severity === 'critical').length;
    const warningCount = changes.filter(c => c.severity === 'warning').length;

    // Lower confidence with more critical changes
    let confidence = 1.0;
    confidence -= criticalCount * 0.15;
    confidence -= warningCount * 0.05;

    return Math.max(confidence, 0.3);
  }

  /**
   * Calculate overall confidence score
   */
  private calculateConfidence(
    stats: ComparisonResult['stats'],
    criticalChangesCount: number
  ): number {
    let score = 0.5; // Base confidence

    // High confidence if no changes
    if (stats.changedRooms === 0 && stats.addedRooms === 0 && stats.removedRooms === 0) {
      score = 0.95;
    } else {
      // Factor in critical changes
      if (criticalChangesCount === 0) {
        score += 0.3;
      } else {
        score += Math.max(0, 0.3 - (criticalChangesCount * 0.05));
      }

      // Factor in completeness
      const totalRooms = stats.totalRooms;
      if (totalRooms > 0) {
        const unchangedRatio = stats.unchangedRooms / totalRooms;
        score += unchangedRatio * 0.2;
      }
    }

    return Math.min(score, 1.0);
  }
}
