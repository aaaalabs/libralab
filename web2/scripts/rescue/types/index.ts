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

// Phase 2: Extraction outputs
export interface ParsedContent {
  rooms: any[];
  features: string[];
  text: {
    en: string;
    de: string;
  };
  metrics: {
    totalRooms: number;
    totalImages: number;
    contentLength: number;
  };
  confidence: number;
  timestamp: Date;
}

export interface APIData {
  endpoints: {
    rooms?: any[];
    commonAreas?: any[];
    location?: any;
  };
  available: string[];
  confidence: number;
  timestamp: Date;
}

export interface ImageManifest {
  downloaded: {
    url: string;
    path: string;
    size: number;
  }[];
  missing: string[];
  errors: {
    url: string;
    error: string;
  }[];
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

// Phase 2: Extraction outputs
export interface RoomData {
  id: string;
  title: string;
  price: number;
  size: number;
  description: string;
  images: string[];
  features: string[];
  availability: 'available' | 'occupied' | 'reserved';
  floor?: number;
  furnished?: boolean;
  [key: string]: any;
}

export interface ExtractedData {
  rooms: RoomData[];
  metadata: {
    source: string;
    extractedAt: Date;
    totalRooms: number;
    confidence: number;
  };
}

export interface EpicWGData {
  rooms: RoomData[];
  lastUpdated: Date;
  version: string;
}

// Phase 3: Comparison outputs
export interface ChangeDetail {
  field: string;
  oldValue: any;
  newValue: any;
  severity: 'critical' | 'warning' | 'info';
}

export interface RoomComparison {
  roomId: string;
  status: 'added' | 'removed' | 'modified' | 'unchanged';
  changes: ChangeDetail[];
  confidence: number;
}

export interface ComparisonResult {
  added: RoomData[];
  removed: RoomData[];
  modified: RoomComparison[];
  unchanged: string[];
  criticalChanges: ChangeDetail[];
  stats: {
    totalRooms: number;
    changedRooms: number;
    addedRooms: number;
    removedRooms: number;
    unchangedRooms: number;
  };
  confidence: number;
  timestamp: Date;
}

export interface DiffSection {
  title: string;
  items: string[];
  severity: 'critical' | 'warning' | 'info';
}

export interface DiffReport {
  summary: string;
  sections: {
    rooms: DiffSection[];
    pricing: DiffSection[];
    features: DiffSection[];
    images: DiffSection[];
  };
  markdown: string;
  json: string;
  timestamp: Date;
}

export interface Finding {
  category: 'data' | 'structure' | 'content' | 'technical';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  details?: any;
}

export interface Risk {
  level: 'high' | 'medium' | 'low';
  category: string;
  description: string;
  mitigation?: string;
}

export interface StatusReport {
  phase: string;
  progress: number;
  findings: Finding[];
  risks: Risk[];
  nextSteps: string[];
  artifacts: {
    path: string;
    type: string;
    description: string;
  }[];
  summary: string;
  timestamp: Date;
}

// Agent base class
export interface AgentResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  confidence: number;
  timestamp: Date;
}

// Phase 4: Implementation outputs
export interface GeneratedJSON {
  newJSON: any;
  validated: boolean;
  schemaValidation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
    autoFixed: boolean;
  };
  backupPath: string;
  confidence: number;
  timestamp: Date;
}

export interface GeneratorResult {
  newJSON: any;
  validated: boolean;
  schemaValidation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
    autoFixed: boolean;
  };
  backupPath: string;
  confidence: number;
}

export interface UpdateResult {
  filesUpdated: string[];
  filesCreated: string[];
  backups: string[];
  gitStatus: {
    branch: string;
    staged: string[];
    commitMessage: string;
  };
  confidence: number;
}

export interface OrganizedImages {
  structure: {
    rooms: string[];
    epicwg: string[];
    partners: string[];
  };
  nameMapping: Record<string, string>;
  totalOrganized: number;
  confidence: number;
}
