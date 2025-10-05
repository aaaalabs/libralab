/**
 * Core types for the autonomous rescue system
 */

// Phase 1: Discovery outputs
export interface CrawlerOutput {
  urls: string[];
  sitemap: string[];
  pageTypes: Record<string, string>;
  confidence: number;
  timestamp: Date;
}

export interface URLMap {
  priority1: string[]; // Homepage, rooms
  priority2: string[]; // About, features
  priority3: string[]; // Legal, privacy
  apiEndpoints: string[];
  assetPaths: string[];
  confidence: number;
  coverage: number;
  timestamp: Date;
}

export interface ComponentPattern {
  selector: string;
  type: string;
  confidence: number;
  attributes: Record<string, any>;
}

export interface StructureMap {
  components: {
    roomCards: ComponentPattern[];
    navigation: ComponentPattern[];
    forms: ComponentPattern[];
    contentSections: ComponentPattern[];
  };
  layout: {
    gridSystem?: string;
    responsive: boolean;
    breakpoints?: string[];
  };
  confidence: number;
  timestamp: Date;
}

// Phase 2: Migration planning
export interface MigrationPlan {
  routes: RouteMapping[];
  components: ComponentMapping[];
  assets: AssetMapping[];
  database: DatabaseMapping[];
  confidence: number;
  timestamp: Date;
}

export interface RouteMapping {
  source: string;
  target: string;
  priority: number;
  strategy: 'direct' | 'redirect' | 'transform';
}

export interface ComponentMapping {
  source: string;
  target: string;
  dependencies: string[];
  complexity: 'low' | 'medium' | 'high';
}

export interface AssetMapping {
  source: string;
  target: string;
  type: string;
  optimized?: boolean;
}

export interface DatabaseMapping {
  table: string;
  fields: string[];
  relations: string[];
  migrationStrategy: string;
}

// Phase 3: Execution
export interface ExecutionReport {
  phase: string;
  status: 'success' | 'partial' | 'failed';
  details: ExecutionDetail[];
  confidence: number;
  timestamp: Date;
}

export interface ExecutionDetail {
  task: string;
  status: 'success' | 'failed';
  message: string;
  data?: any;
}

// Agent base class
export interface AgentResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  confidence: number;
  timestamp: Date;
}
