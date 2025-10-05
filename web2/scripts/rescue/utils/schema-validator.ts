/**
 * Schema Validator - Validates JSON data against expected schema
 */

import { getLogger } from './logger';
import type { RoomData } from '../types';

const log = getLogger();

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  autoFixed: boolean;
}

export class SchemaValidator {
  /**
   * Validate epicwg.json schema
   */
  validate(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let autoFixed = false;

    // Check root structure
    if (!data || typeof data !== 'object') {
      errors.push('Data must be an object');
      return { valid: false, errors, warnings, autoFixed };
    }

    if (!Array.isArray(data.rooms)) {
      errors.push('Data must contain a "rooms" array');
      return { valid: false, errors, warnings, autoFixed };
    }

    // Validate each room
    data.rooms.forEach((room: any, index: number) => {
      const roomErrors = this.validateRoom(room, index);
      errors.push(...roomErrors);
    });

    // Check for warnings
    if (data.rooms.length === 0) {
      warnings.push('No rooms found in data');
    }

    if (!data.lastUpdated) {
      warnings.push('Missing lastUpdated field');
    }

    if (!data.version) {
      warnings.push('Missing version field');
    }

    const valid = errors.length === 0;

    if (valid) {
      log.success('Schema validation passed', { warnings: warnings.length }, 'schema-validator');
    } else {
      log.error('Schema validation failed', { errors: errors.length, warnings: warnings.length }, 'schema-validator');
    }

    return { valid, errors, warnings, autoFixed };
  }

  /**
   * Validate individual room
   */
  private validateRoom(room: any, index: number): string[] {
    const errors: string[] = [];
    const prefix = `Room ${index}`;

    // Required fields
    const requiredFields = ['id', 'title', 'price', 'size'];
    for (const field of requiredFields) {
      if (!(field in room)) {
        errors.push(`${prefix}: Missing required field "${field}"`);
      }
    }

    // Type validation
    if (room.id && typeof room.id !== 'string') {
      errors.push(`${prefix}: "id" must be a string`);
    }

    if (room.title && typeof room.title !== 'string') {
      errors.push(`${prefix}: "title" must be a string`);
    }

    if (room.price && typeof room.price !== 'number') {
      errors.push(`${prefix}: "price" must be a number`);
    }

    if (room.size && typeof room.size !== 'number') {
      errors.push(`${prefix}: "size" must be a number`);
    }

    if (room.images && !Array.isArray(room.images)) {
      errors.push(`${prefix}: "images" must be an array`);
    }

    if (room.features && !Array.isArray(room.features)) {
      errors.push(`${prefix}: "features" must be an array`);
    }

    // Value validation
    if (room.price && room.price < 0) {
      errors.push(`${prefix}: "price" cannot be negative`);
    }

    if (room.size && room.size <= 0) {
      errors.push(`${prefix}: "size" must be positive`);
    }

    return errors;
  }

  /**
   * Apply auto-fixes to data
   */
  autoFix(data: any): any {
    const fixed = { ...data };

    // Ensure rooms array exists
    if (!Array.isArray(fixed.rooms)) {
      fixed.rooms = [];
    }

    // Add missing metadata
    if (!fixed.lastUpdated) {
      fixed.lastUpdated = new Date().toISOString();
    }

    if (!fixed.version) {
      fixed.version = '1.0.0';
    }

    // Fix rooms
    fixed.rooms = fixed.rooms.map((room: any) => {
      const fixedRoom = { ...room };

      // Ensure arrays
      if (!Array.isArray(fixedRoom.images)) {
        fixedRoom.images = [];
      }

      if (!Array.isArray(fixedRoom.features)) {
        fixedRoom.features = [];
      }

      // Set defaults
      if (!fixedRoom.availability) {
        fixedRoom.availability = 'available';
      }

      return fixedRoom;
    });

    log.info('Auto-fix applied to data', undefined, 'schema-validator');

    return fixed;
  }
}
