import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { SchemaAST } from '../agent/interfaces';
import { SandboxOrchestrator } from './orchestrator';

export interface SeedingConfig {
  targetRowCount: number;
  columnDistributions?: Record<string, Record<string, number>>; // e.g., { status: { active: 0.7, inactive: 0.3 } }
}

/**
 * DataSeeder - Generates synthetic data for sandbox testing
 */
export class DataSeeder {
  private orchestrator: SandboxOrchestrator;
  private schema: SchemaAST;
  private config: SeedingConfig;

  constructor(orchestrator: SandboxOrchestrator, schema: SchemaAST, config: SeedingConfig) {
    this.orchestrator = orchestrator;
    this.schema = schema;
    this.config = config;
  }

  /**
   * Generate and seed synthetic data into the sandbox
   */
  public async seed(): Promise<void> {
    console.log(`Starting data seeding for ${this.config.targetRowCount} rows...`);
    const startTime = Date.now();

    for (const table of this.schema.tables) {
      await this.seedTable(table);
    }

    const duration = (Date.now() - startTime) / 1000;
    console.log(`Data seeding completed in ${duration.toFixed(2)} seconds.`);
  }

  /**
   * Seed a single table
   */
  private async seedTable(table: { name: string; columns: any[] }): Promise<void> {
    if (this.config.targetRowCount === 0) {
      return;
    }

    console.log(`Seeding table: ${table.name} with ${this.config.targetRowCount} rows...`);
    
    // Generate batched INSERT statements for performance
    const batchSize = 10000;
    let totalInserted = 0;

    while (totalInserted < this.config.targetRowCount) {
      const currentBatchSize = Math.min(batchSize, this.config.targetRowCount - totalInserted);
      const insertStatements = this.generateBatchInserts(table, currentBatchSize, totalInserted);
      
      if (insertStatements.length === 0) {
        break;
      }

      const sql = insertStatements.join('\n');
      await this.executeRawSql(table.name, sql);
      
      totalInserted += currentBatchSize;
      console.log(`  Inserted ${totalInserted} / ${this.config.targetRowCount} rows into ${table.name}`);
    }
  }

  /**
   * Generate a batch of INSERT statements
   */
  private generateBatchInserts(table: { name: string; columns: any[] }, count: number, offset: number): string[] {
    const statements: string[] = [];
    const columnsToInsert = table.columns.filter((c: any) => !c.isPrimaryKey && !c.autoIncrement);
    
    if (columnsToInsert.length === 0) {
      return statements;
    }

    const columnNames = columnsToInsert.map((c: any) => c.name).join(', ');

    for (let i = 0; i < count; i++) {
      const values = columnsToInsert.map((c: any) => {
        return this.generateValue(c, offset + i);
      });
      statements.push(`INSERT INTO ${table.name} (${columnNames}) VALUES (${values.join(', ')});`);
    }

    return statements;
  }

  /**
   * Generate a synthetic value for a column
   */
  private generateValue(column: any, rowIndex: number): string {
    const type = column.type.toUpperCase();
    const name = column.name.toLowerCase();

    // Check for custom distributions
    if (this.config.columnDistributions && this.config.columnDistributions[name]) {
      const dist = this.config.columnDistributions[name];
      const rand = Math.random();
      let cumulative = 0;
      for (const [value, probability] of Object.entries(dist)) {
        cumulative += probability as number;
        if (rand <= cumulative) {
          return `'${value}'`;
        }
      }
    }

    // PII Anonymization / Synthetic Data Generation
    if (name.includes('email')) {
      return `'user${rowIndex}@example.com'`;
    }
    if (name.includes('phone')) {
      return `'+1-555-01${String(rowIndex % 100).padStart(2, '0')}'`;
    }
    if (name.includes('name') || name.includes('first_name') || name.includes('last_name')) {
      return `'User${rowIndex}'`;
    }
    if (name.includes('address')) {
      return `'${rowIndex} Synthetic St, Fakeville, FK 00000'`;
    }

    // Type-based generation
    if (type.includes('INT') || type.includes('SERIAL')) {
      return String(Math.floor(Math.random() * 10000));
    }
    if (type.includes('VARCHAR') || type.includes('TEXT') || type.includes('CHAR')) {
      const lengthMatch = type.match(/\d+/);
      const length = lengthMatch ? parseInt(lengthMatch[0], 10) : 50;
      const data = `synthetic_data_${rowIndex}`;
      return `'${data.substring(0, length)}'`;
    }
    if (type.includes('BOOLEAN')) {
      return Math.random() > 0.5 ? 'TRUE' : 'FALSE';
    }
    if (type.includes('TIMESTAMP') || type.includes('DATETIME') || type.includes('DATE')) {
      return `'2023-01-01 00:00:00'`;
    }
    if (type.includes('DECIMAL') || type.includes('NUMERIC') || type.includes('FLOAT') || type.includes('REAL')) {
      return (Math.random() * 1000).toFixed(2);
    }
    if (type.includes('JSON') || type.includes('JSONB')) {
      return `'{"key": "value_${rowIndex}"}'`;
    }

    // Fallback
    return `'unknown_${rowIndex}'`;
  }

  /**
   * Execute raw SQL in the sandbox by writing to a temp file and using orchestrator
   */
  private async executeRawSql(tableName: string, sql: string): Promise<void> {
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `seed_${tableName}_${Date.now()}.sql`);
    
    try {
      fs.writeFileSync(tempFile, sql, 'utf-8');
      await this.orchestrator.executeSqlFile(tempFile);
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }
}