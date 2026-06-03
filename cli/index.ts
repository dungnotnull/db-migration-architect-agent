#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { createParser } from '../parsers';
import { RiskAnalyzer } from '../agent/riskAnalyzer';
import { MigrationGenerator } from '../agent/migrationGenerator';
import { MigrationRequest, SandboxReport } from '../agent/interfaces';
import { SandboxOrchestrator } from '../sandbox/orchestrator';
import { DataSeeder } from '../sandbox/seeder';
import { ExplainAnalyzer } from '../sandbox/explainAnalyzer';
import { ReportBuilder } from '../reports/reportBuilder';
import { SchemaCache } from '../agent/schemaCache';

const program = new Command();

program
  .name('db-migrate-agent')
  .description('CLI for DB Migration Architect Agent')
  .version('0.1.0');

program
  .command('analyze')
  .description('Analyze a schema change and generate a migration')
  .requiredOption('-s, --schema <path>', 'Path to the schema file (.prisma, .sql)')
  .requiredOption('-c, --change <description>', 'Description of the change')
  .option('-e, --engine <engine>', 'Target database engine (postgres, mysql)', 'postgres')
  .option('-v, --version <version>', 'Database version (e.g., 15 for postgres, 8.0 for mysql)', '15')
  .option('-o, --output <path>', 'Output directory for generated files', '.')
  .option('--sandbox', 'Enable Docker sandbox for EXPLAIN ANALYZE performance testing', false)
  .option('--rows <count>', 'Number of rows to seed in sandbox', '10000')
  .action(async (options) => {
    try {
      console.log(`Analyzing schema: ${options.schema}`);
      console.log(`Change description: ${options.change}`);
      console.log(`Target engine: ${options.engine}`);

      // Read schema file
      if (!fs.existsSync(options.schema)) {
        console.error(`Error: Schema file not found at ${options.schema}`);
        process.exit(1);
      }

      const schemaContent = fs.readFileSync(options.schema, 'utf-8');
      
      // Determine parser type based on file extension
      const ext = path.extname(options.schema).toLowerCase();
      let schemaType: 'prisma' | 'mysql' | 'postgres' | 'mongodb' = 'postgres';
      
      if (ext === '.prisma') {
        schemaType = 'prisma';
      } else if (ext === '.sql') {
        if (schemaContent.toLowerCase().includes('engine=') || schemaContent.toLowerCase().includes('auto_increment')) {
          schemaType = 'mysql';
        } else {
          schemaType = 'postgres';
        }
      }

      console.log(`Detected schema type: ${schemaType}`);

      // Parse schema with caching
      const cache = new SchemaCache();
      let schemaAST = cache.get(schemaContent);
      
      if (schemaAST) {
        console.log('Loaded schema from cache (fast path).');
      } else {
        console.log('Parsing schema...');
        try {
          const parser = createParser(schemaType);
          schemaAST = await parser.parse(schemaContent);
          cache.set(schemaContent, schemaAST);
        } catch (error: any) {
          // Enhanced error message with line number estimation
          let errorMsg = error instanceof Error ? error.message : String(error);
          const lineMatch = errorMsg.match(/line (\d+)/i) || errorMsg.match(/at line (\d+)/i);
          if (lineMatch) {
            console.error(`\n❌ Schema Parse Error at line ${lineMatch[1]}:`);
          } else {
            console.error('\n❌ Schema Parse Error:');
          }
          console.error(`   ${errorMsg}`);
          console.error('\n💡 Tip: Check for syntax errors, missing brackets, or unsupported directives in your schema file.');
          process.exit(1);
        }
      }
      
      console.log(`Successfully parsed schema. Found ${schemaAST.tables.length} tables.`);

      // Create migration request
      const rowCount = parseInt(options.rows, 10) || 10000;
      const request: MigrationRequest = {
        schema: schemaAST,
        changeDescription: options.change,
        targetEngine: options.engine as 'postgres' | 'mysql',
        rowCountOverride: schemaAST.tables.reduce((acc, table) => {
          acc[table.name] = rowCount;
          return acc;
        }, {} as Record<string, number>)
      };

      // Analyze risk
      const riskAnalyzer = new RiskAnalyzer();
      const riskReport = riskAnalyzer.analyze(request);
      
      console.log('\n--- Risk Analysis Report ---');
      console.log(`Overall Risk Score: ${riskReport.overallScore}/100`);
      console.log(`Risk Level: ${riskReport.riskLevel}`);
      console.log(`Recommended Strategy: ${riskReport.recommendedStrategy}`);
      
      if (riskReport.warnings.length > 0) {
        console.log('\nWarnings:');
        riskReport.warnings.forEach(w => console.log(`  - ${w}`));
      }
      
      if (riskReport.recommendations.length > 0) {
        console.log('\nRecommendations:');
        riskReport.recommendations.forEach(r => console.log(`  - ${r}`));
      }

      // Generate migration
      const migrationGenerator = new MigrationGenerator();
      const artifact = migrationGenerator.generate(request, riskReport);

      // Ensure output directory exists
      if (!fs.existsSync(options.output)) {
        fs.mkdirSync(options.output, { recursive: true });
      }

      // Write migration file
      const migrationPath = path.join(options.output, artifact.filename);
      fs.writeFileSync(migrationPath, artifact.sql);
      console.log(`\nMigration file generated: ${migrationPath}`);

      // Write rollback file
      const rollbackFilename = artifact.filename.replace('.sql', '_rollback.sql');
      const rollbackPath = path.join(options.output, rollbackFilename);
      fs.writeFileSync(rollbackPath, artifact.rollbackSql);
      console.log(`Rollback file generated: ${rollbackPath}`);

      // Sandbox Execution (Phase 2)
      let sandboxReport: SandboxReport = {
        preMigration: [],
        postMigration: [],
        performanceDiff: [],
        lockInfo: [],
        migrationExecutionTime: 0,
        success: false,
        errorMessage: null
      };

      if (options.sandbox) {
        console.log('\n--- Starting Sandbox Execution ---');
        const orchestrator = new SandboxOrchestrator({
          engine: options.engine as 'postgres' | 'mysql',
          version: options.version,
          cpuLimit: '2.0',
          memoryLimit: '4g'
        });

        try {
          await orchestrator.provision();
          console.log('Sandbox provisioned successfully.');

          // Seed data
          const seeder = new DataSeeder(orchestrator, schemaAST, {
            targetRowCount: rowCount,
            columnDistributions: {
              // Example distribution
              'status': { 'active': 0.7, 'inactive': 0.3 }
            }
          });
          await seeder.seed();

          // Infer representative queries (simplified)
          const testQueries = schemaAST.tables.slice(0, 2).map(table => 
            `SELECT * FROM ${table.name} LIMIT 100;`
          );

          // Pre-migration analysis
          const explainAnalyzer = new ExplainAnalyzer(orchestrator, {
            queries: testQueries,
            engine: options.engine as 'postgres' | 'mysql'
          });
          
          console.log('Running pre-migration EXPLAIN ANALYZE...');
          const preMigration = await explainAnalyzer.analyzeQueries(testQueries);

          // Run migration
          console.log('Applying migration in sandbox...');
          const migrationStartTime = Date.now();
          await orchestrator.executeSqlFile(migrationPath);
          const migrationExecutionTime = Date.now() - migrationStartTime;

          // Post-migration analysis
          console.log('Running post-migration EXPLAIN ANALYZE...');
          const postMigration = await explainAnalyzer.analyzeQueries(testQueries);

          // Compare performance
          const performanceDiff = explainAnalyzer.comparePerformance(preMigration, postMigration);

          sandboxReport = {
            preMigration,
            postMigration,
            performanceDiff,
            lockInfo: [],
            migrationExecutionTime,
            success: true,
            errorMessage: null
          };

          console.log('Sandbox execution completed successfully.');
        } catch (error) {
          console.error('Sandbox execution failed:', error);
          sandboxReport.errorMessage = error instanceof Error ? error.message : String(error);
        } finally {
          console.log('Tearing down sandbox...');
          await orchestrator.teardown();
        }
      }

      // Generate Impact Report
      const reportBuilder = new ReportBuilder({
        outputDir: options.output,
        changeDescription: options.change,
        filename: artifact.filename
      });

      const impactReport = reportBuilder.build(riskReport, sandboxReport, artifact);
      const reportPaths = reportBuilder.save(impactReport);

      console.log(`\nImpact Report generated:`);
      console.log(`  Markdown: ${reportPaths.markdownPath}`);
      console.log(`  JSON: ${reportPaths.jsonPath}`);

      console.log('\nAnalysis complete!');
    } catch (error) {
      console.error('Error during analysis:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('knowledge')
  .description('Manage the self-improving knowledge base')
  .action(() => {
    console.log('Use `db-migrate-agent knowledge update` to crawl and ingest new knowledge.');
  });

program
  .command('knowledge update')
  .description('Crawl authoritative sources and update the knowledge base')
  .option('--dry-run', 'Simulate crawling without saving or ingesting', false)
  .action(async (options) => {
    try {
      console.log(`Starting knowledge update (dry-run: ${options.dryRun})...`);
      
      const { KnowledgeCrawler } = await import('../knowledge/crawler');
      const { KnowledgeIngester } = await import('../knowledge/ingester');
      
      const crawler = new KnowledgeCrawler();
      console.log('Crawling sources...');
      const crawledItems = await crawler.crawl(options.dryRun);
      
      console.log(`Found ${crawledItems.length} relevant items.`);
      
      if (options.dryRun) {
        console.log('\n--- Dry Run Results ---');
        crawledItems.forEach(item => {
          console.log(`- [${item.source}] ${item.title}`);
        });
        console.log('\nNo changes were saved.');
      } else {
        const ingester = new KnowledgeIngester();
        console.log('Ingesting knowledge...');
        const report = await ingester.ingest(crawledItems);
        console.log('\n' + report);
      }
    } catch (error) {
      console.error('Error during knowledge update:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse(process.argv);