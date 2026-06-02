// Data contracts for the DB Migration Architect Agent

/**
 * Normalized representation of any database schema
 */
export interface SchemaAST {
  // Database type (postgres, mysql, etc.)
  databaseType: string;
  
  // Tables in the schema
  tables: TableDefinition[];
  
  // Enums in the schema
  enums: EnumDefinition[];
  
  // Views in the schema
  views: ViewDefinition[];
}

/**
 * Definition of a database table
 */
export interface TableDefinition {
  name: string;
  columns: ColumnDefinition[];
  indexes: IndexDefinition[];
  foreignKeys: ForeignKeyDefinition[];
  constraints: ConstraintDefinition[];
}

/**
 * Definition of a database column
 */
export interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: string | null;
  isPrimaryKey: boolean;
  isUnique: boolean;
  autoIncrement: boolean;
}

/**
 * Definition of a database index
 */
export interface IndexDefinition {
  name: string;
  columns: string[];
  isUnique: boolean;
  isPrimary: boolean;
  indexType: string; // e.g., BTREE, HASH, GIN, etc.
}

/**
 * Definition of a foreign key constraint
 */
export interface ForeignKeyDefinition {
  name: string;
  columnNames: string[];
  referencedTable: string;
  referencedColumnNames: string[];
  onDelete: string; // CASCADE, SET NULL, RESTRICT, etc.
  onUpdate: string; // CASCADE, SET NULL, RESTRICT, etc.
}

/**
 * Definition of a table constraint
 */
export interface ConstraintDefinition {
  name: string;
  type: string; // CHECK, UNIQUE, PRIMARY KEY, FOREIGN KEY
  definition: string; // The constraint definition (e.g., "age > 0" for CHECK)
}

/**
 * Definition of a database enum
 */
export interface EnumDefinition {
  name: string;
  values: string[];
}

/**
 * Definition of a database view
 */
export interface ViewDefinition {
  name: string;
  definition: string; // SQL query that defines the view
}

/**
 * Change request from developer
 */
export interface MigrationRequest {
  // The schema to migrate
  schema: SchemaAST;
  
  // Description of the requested change
  changeDescription: string;
  
  // Target database engine
  targetEngine: 'postgres' | 'mysql';
  
  // Optional: specific queries to analyze for performance impact
  queriesToAnalyze?: string[];
  
  // Optional: row count for risk analysis (if known)
  rowCountOverride?: Record<string, number>; // tableName -> rowCount
}

/**
 * Structured risk analysis output
 */
export interface RiskReport {
  // Overall risk score (0-100)
  overallScore: number;
  
  // Risk level based on score
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  // Breakdown of scores by dimension
  riskBreakdown: {
    lockRisk: number;
    dataVolumeImpact: number;
    indexImpact: number;
    constraintRisk: number;
    rollbackComplexity: number;
  };
  
  // Recommended migration strategy
  recommendedStrategy: string;
  
  // Estimated duration for each phase
  estimatedDuration: {
    phase1: string; // e.g., "50ms"
    phase2: string; // e.g., "25-40 min"
    phase3: string; // e.g., "200ms"
  };
  
  // List of recommendations
  recommendations: string[];
  
  // Warnings or special considerations
  warnings: string[];
}

/**
 * Generated SQL + metadata
 */
export interface MigrationArtifact {
  // The generated SQL migration
  sql: string;
  
  // Rollback SQL
  rollbackSql: string;
  
  // Filename for the migration
  filename: string;
  
  // Timestamp when generated
  generatedAt: string;
  
  // Summary of what the migration does
  summary: string;
  
  // Warnings about the migration
  warnings: string[];
}

/**
 * EXPLAIN ANALYZE results
 */
export interface SandboxReport {
  // Pre-migration query performance
  preMigration: QueryPerformance[];
  
  // Post-migration query performance
  postMigration: QueryPerformance[];
  
  // Performance differences
  performanceDiff: PerformanceDifference[];
  
  // Lock information during migration
  lockInfo: LockInfo[];
  
  // Migration execution time
  migrationExecutionTime: number; // in milliseconds
  
  // Success status
  success: boolean;
  
  // Error message if failed
  errorMessage: string | null;
}

/**
 * Query performance metrics
 */
export interface QueryPerformance {
  query: string;
  executionTimeMs: number;
  planningTimeMs: number;
  rowsReturned: number;
  // Additional metrics from EXPLAIN ANALYZE
  [key: string]: any;
}

/**
 * Performance difference between pre and post migration
 */
export interface PerformanceDifference {
  query: string;
  preExecutionTimeMs: number;
  postExecutionTimeMs: number;
  changePercent: number; // Positive = improvement, Negative = regression
  status: 'IMPROVED' | 'REGRESSED' | 'UNCHANGED';
}

/**
 * Lock information during migration
 */
export interface LockInfo {
  lockType: string;
  durationMs: number;
  tableName: string;
  query: string;
}

/**
 * Final PR-ready report
 */
export interface ImpactReport {
  // Migration metadata
  migrationInfo: {
    filename: string;
    generatedAt: string;
    changeDescription: string;
  };
  
  // Risk analysis
  riskReport: RiskReport;
  
  // Sandbox execution results
  sandboxReport: SandboxReport;
  
  // Generated migration
  migrationArtifact: MigrationArtifact;
  
  // Summary for PR description
  prSummary: string;
  
  // Detailed analysis for PR body
  prBody: string;
}