# Changelog

All notable changes to the DB Migration Architect Agent will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-03

### Added
- **Phase 1: Core Agent**
  - Prisma, PostgreSQL, and MySQL schema parsers with `SchemaAST` normalization.
  - MongoDB (NoSQL) JSON schema parser.
  - `RiskAnalyzer` with multi-dimensional scoring (Lock, Data Volume, Index, Constraint, Rollback).
  - `MigrationGenerator` with 8 core safe migration patterns.
  - CLI `analyze` command with terminal output and file generation.
- **Phase 2: Docker Sandbox + EXPLAIN Engine**
  - `SandboxOrchestrator` for PostgreSQL, MySQL, and MongoDB with health checks and resource limits.
  - `DataSeeder` for synthetic data generation with PII masking and custom distributions.
  - `ExplainAnalyzer` for pre/post migration query performance diffing and regression detection.
  - `ReportBuilder` for Markdown and JSON impact reports.
- **Phase 3: Knowledge Updater**
  - `KnowledgeCrawler` for fetching and deduplicating content from authoritative sources.
  - `KnowledgeIngester` for extracting patterns and updating `SECOND-KNOWLEDGE-BRAIN.md`.
  - CLI `knowledge update` command with `--dry-run` support.
- **Phase 4: Production Hardening & Release**
  - Schema AST caching for improved performance.
  - Enhanced error messages with line number estimation for parse failures.
  - Graceful degradation when Docker sandbox is unavailable.
  - GitHub Action (`action.yml`) for CI/CD risk blocking.
  - Pre-commit hook (`.pre-commit-hooks.yaml`) for local validation.
  - Comprehensive `README.md` and `CHANGELOG.md`.

### Changed
- Updated `PROJECT-DEVELOPMENT-PHASE-TRACKING.md` to reflect 100% completion of Phases 1, 2, 3, and 4.

### Fixed
- Fixed literal `\n` character parsing issues in MySQL and PostgreSQL parsers.
- Fixed TypeScript compilation errors related to `pgsql-ast-parser` imports and interface mismatches.
- Aligned Jest configuration to properly discover and run all test suites.

## [0.0.1] - 2026-06-02

### Added
- Initial project foundation and Phase 0 setup.
- Basic interface definitions (`SchemaAST`, `MigrationRequest`, `RiskReport`, etc.).
- Initial seed knowledge in `SECOND-KNOWLEDGE-BRAIN.md`.