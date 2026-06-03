import { SandboxOrchestrator } from '../sandbox/orchestrator';
import { DataSeeder } from '../sandbox/seeder';
import { ExplainAnalyzer } from '../sandbox/explainAnalyzer';
import { ReportBuilder } from '../reports/reportBuilder';
import { RiskAnalyzer } from '../agent/riskAnalyzer';
import { MigrationGenerator } from '../agent/migrationGenerator';
import { SchemaAST, MigrationRequest, SandboxReport } from '../agent/interfaces';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Phase 2 Integration', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'db-migrate-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should generate a complete impact report without sandbox', async () => {
    const schemaAST: SchemaAST = {
      databaseType: 'postgres',
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'INTEGER', nullable: false, defaultValue: null, isPrimaryKey: true, isUnique: false, autoIncrement: true },
            { name: 'email', type: 'VARCHAR(255)', nullable: false, defaultValue: null, isPrimaryKey: false, isUnique: true, autoIncrement: false }
          ],
          indexes: [],
          foreignKeys: [],
          constraints: []
        }
      ],
      enums: [],
      views: []
    };

    const request: MigrationRequest = {
      schema: schemaAST,
      changeDescription: 'add column status to users',
      targetEngine: 'postgres',
      rowCountOverride: { 'users': 100000 }
    };

    const riskAnalyzer = new RiskAnalyzer();
    const riskReport = riskAnalyzer.analyze(request);

    const migrationGenerator = new MigrationGenerator();
    const artifact = migrationGenerator.generate(request, riskReport);

    const sandboxReport: SandboxReport = {
      preMigration: [],
      postMigration: [],
      performanceDiff: [],
      lockInfo: [],
      migrationExecutionTime: 0,
      success: false,
      errorMessage: 'Sandbox skipped in this test'
    };

    const reportBuilder = new ReportBuilder({
      outputDir: tempDir,
      changeDescription: request.changeDescription,
      filename: artifact.filename
    });

    const impactReport = reportBuilder.build(riskReport, sandboxReport, artifact);
    const reportPaths = reportBuilder.save(impactReport);

    expect(fs.existsSync(reportPaths.markdownPath)).toBe(true);
    expect(fs.existsSync(reportPaths.jsonPath)).toBe(true);
    
    const jsonContent = fs.readFileSync(reportPaths.jsonPath, 'utf-8');
    const parsedReport = JSON.parse(jsonContent);
    expect(parsedReport.migrationInfo.changeDescription).toBe('add column status to users');
    expect(parsedReport.riskReport.riskLevel).toBeDefined();
  });

  it('should calculate estimated duration correctly', () => {
    const reportBuilder = new ReportBuilder({
      outputDir: tempDir,
      changeDescription: 'test',
      filename: 'test.sql'
    });

    expect(reportBuilder.calculateEstimatedDuration(0)).toBe('< 1 second');
    expect(reportBuilder.calculateEstimatedDuration(5000, 10000)).toMatch(/seconds/);
    // 500,000 rows / 10,000 batch = 50 batches. 50 * 150ms = 7500ms = 8 seconds
    expect(reportBuilder.calculateEstimatedDuration(500000, 10000)).toMatch(/seconds/);
    // 5,000,000 rows / 10,000 batch = 500 batches. 500 * 150ms = 75000ms = 75 seconds = 2 minutes
    expect(reportBuilder.calculateEstimatedDuration(5000000, 10000)).toMatch(/minutes/);
    // 50,000,000 rows / 10,000 batch = 5000 batches. 5000 * 150ms = 750000ms = 750 seconds = 12.5 minutes
    // Let's use a larger number for hours: 500,000,000 rows = 50000 batches * 150ms = 7,500,000ms = 7500s = 2 hours
    expect(reportBuilder.calculateEstimatedDuration(500000000, 10000)).toMatch(/hours/);
  });
});