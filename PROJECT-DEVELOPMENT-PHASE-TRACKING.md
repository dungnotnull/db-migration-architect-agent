# PROJECT-DEVELOPMENT-PHASE-TRACKING.md — DB Migration Architect Agent

## Project Timeline Overview

```
Phase 0 ──── Phase 1 ──── Phase 2 ──── Phase 3 ──── Phase 4
Foundation   Core Agent   Sandbox      Knowledge    Production
 (2 weeks)   (3 weeks)   (3 weeks)    (2 weeks)    (2 weeks)
```

**Total Estimated Duration**: 12 weeks  
**Current Phase**: Phase 0  
**Last Updated**: 2026-05-31

---

## Phase 0 — Foundation & Project Setup
**Duration**: 2 weeks  
**Status**: 🟡 IN PROGRESS

### Goals
- Establish project structure, tooling, and development environment
- Define data contracts between all components
- Set up CI/CD pipeline

### Tasks

#### Environment Setup
- [x] Initialize repository with monorepo structure
  - `/agent` — core agent logic (Claude API calls, tool orchestration)
  - `/parsers` — Prisma schema and DDL SQL parsers
  - `/sandbox` — Docker sandbox orchestration
  - `/knowledge` — SECOND-KNOWLEDGE-BRAIN.md and updater scripts
  - `/reports` — report builder templates
  - `/cli` — CLI interface
  - `/tests` — test fixtures and integration tests
- [x] Set up TypeScript (or Python) with strict mode
- [x] Configure ESLint / Ruff + Prettier
- [x] Set up GitHub Actions CI (lint, type-check, unit tests)
- [x] Create `.env.example` with required environment variables
  - `ANTHROPIC_API_KEY`
  - `SANDBOX_DOCKER_HOST`
  - `KNOWLEDGE_CRAWL_INTERVAL_HOURS`

#### Data Contracts
- [x] Define `SchemaAST` interface — normalized representation of any schema
- [x] Define `MigrationRequest` interface — change request from developer
- [x] Define `RiskReport` interface — structured risk analysis output
- [x] Define `MigrationArtifact` interface — generated SQL + metadata
- [x] Define `SandboxReport` interface — EXPLAIN ANALYZE results
- [x] Define `ImpactReport` interface — final PR-ready report

#### Documentation
- [x] Complete `CLAUDE.md` ✅
- [x] Complete `PROJECT-detail.md` ✅
- [x] Complete `PROJECT-DEVELOPMENT-PHASE-TRACKING.md` ✅ (this file)
- [x] Initial `SECOND-KNOWLEDGE-BRAIN.md` with seed knowledge ✅
- [x] Contributing guide (`CONTRIBUTING.md`)
- [x] API documentation scaffold

### Deliverables
- [ ] Working repository with structure
- [ ] All TypeScript/Python interfaces defined
- [ ] CI pipeline green
- [ ] README with quickstart

### Exit Criteria
All tasks checked. CI passing. At least one engineer can clone and run `npm install && npm test` successfully.

---

## Phase 1 — Core Agent: Schema Ingestion + Risk Analysis
**Duration**: 3 weeks  
**Status**: ⬜ NOT STARTED  
**Depends on**: Phase 0 complete

### Goals
- Parse real Prisma and DDL schema files into internal AST
- Build risk analysis engine with configurable scoring
- Generate basic (non-optimized) migration SQL
- CLI can accept a change request and output a risk report

### Week 1 — Schema Parsers

#### Prisma Parser
- [ ] Use `@prisma/internals` to parse `.prisma` files
- [ ] Extract: models, fields (name, type, nullable, default), indexes, relations
- [ ] Normalize to `SchemaAST` format
- [ ] Unit tests: 10+ real-world schema fixtures (simple, complex, multi-relation)
- [ ] Handle Prisma enums, `@@map`, `@map` directives

#### DDL Parser (PostgreSQL)
- [ ] Integrate `pgsql-ast-parser` 
- [ ] Extract: `CREATE TABLE`, `ALTER TABLE`, `CREATE INDEX` statements
- [ ] Normalize to same `SchemaAST` format as Prisma output
- [ ] Unit tests: 10+ DDL fixtures

#### DDL Parser (MySQL)
- [ ] Integrate `node-sql-parser` or `@mysql/xdevapi`
- [ ] Handle MySQL-specific syntax: `ENGINE=InnoDB`, `CHARSET`, `AUTO_INCREMENT`
- [ ] Unit tests: MySQL schema fixtures

### Week 2 — Risk Analysis Engine

- [ ] Implement `RiskAnalyzer` class
- [ ] Lock Risk scorer
  - PostgreSQL lock classification matrix (based on `pg_locks` lock modes)
  - MySQL lock classification matrix (DDL_SHARE, EXCLUSIVE, etc.)
- [ ] Data Volume scorer
  - Accept row count as input parameter
  - Apply thresholds: <1M / 1M-10M / 10M-100M / >100M
- [ ] Index Impact scorer
  - Detect: new index, dropped index, implicit index (PK, UNIQUE, FK)
  - Classify: blocking vs non-blocking operation
- [ ] Constraint Risk scorer
  - FK with VALIDATE vs NOT VALID
  - CHECK constraint on existing data
  - NOT NULL on populated table
- [ ] Rollback scorer
  - Classify: SIMPLE / REQUIRES-DATA-MIGRATION / DESTRUCTIVE
- [ ] Aggregate weighted risk score (0–100)
- [ ] Unit tests for each scorer dimension with edge cases

### Week 3 — Migration Generator (v1) + CLI

- [ ] Implement `MigrationGenerator` class
- [ ] Pattern library v1 (8 core patterns from CLAUDE.md)
- [ ] Pattern selector: map risk dimensions → appropriate pattern
- [ ] SQL templating engine with inline comment generation
- [ ] Rollback SQL generation
- [ ] Pre-flight assertion generation (`DO $$ ASSERT ...`)
- [ ] Migration filename generation (`YYYYMMDDHHMMSS_description.sql`)
- [ ] CLI basic interface:
  ```bash
  db-migrate-agent analyze --schema ./schema.prisma --change "..."
  ```
- [ ] Output: risk report (terminal) + migration file (disk)
- [ ] Integration test: end-to-end from `.prisma` file → SQL file

### Deliverables
- [ ] `parsers/` module: Prisma + PostgreSQL + MySQL parsers
- [ ] `risk-analyzer/` module with full scoring
- [ ] `migration-generator/` module v1 with 8 patterns
- [ ] CLI `analyze` command working end-to-end
- [ ] Test coverage ≥ 80% for all modules

### Exit Criteria
`db-migrate-agent analyze` produces a risk-scored migration file for 10 different real-world change scenarios without error.

---

## Phase 2 — Docker Sandbox + EXPLAIN ANALYZE Engine
**Duration**: 3 weeks  
**Status**: ⬜ NOT STARTED  
**Depends on**: Phase 1 complete

### Goals
- Spin up isolated database container, load representative data, run migration
- Capture EXPLAIN ANALYZE before/after and produce performance diff
- Full sandbox lifecycle: provision → seed → run → capture → teardown

### Week 4 — Docker Sandbox Orchestration

- [ ] Implement `SandboxOrchestrator` class
- [ ] Auto-generate `docker-compose.sandbox.yml` based on target DB engine + version
- [ ] Support PostgreSQL 14, 15, 16
- [ ] Support MySQL 8.0, 8.4
- [ ] Implement health-check polling (wait for DB ready)
- [ ] Implement clean teardown (always, even on failure)
- [ ] Resource limits: CPU 2 cores, RAM 4GB (configurable)
- [ ] Unique port assignment to prevent conflicts (random ephemeral port)

#### Data Seeder
- [ ] Accept developer-provided DDL as seed schema
- [ ] Auto-generate synthetic data matching requested row counts
  - Use `pgbench` scale factor for PostgreSQL
  - Use `sysbench` for MySQL
  - Support custom column distributions (e.g., status: 70% active / 30% inactive)
- [ ] Data anonymization pass (detect and mask PII-shaped fields: email, phone, name patterns)
- [ ] Seeding performance target: 1M rows < 30 seconds

### Week 5 — EXPLAIN ANALYZE Engine

- [ ] Implement `ExplainAnalyzer` class
- [ ] Pre-migration query capture:
  - Infer representative queries from schema relations and indexes
  - Accept developer-provided query list
  - Run 3x and take median (warm cache vs cold cache option)
- [ ] Parse `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` output (PostgreSQL)
- [ ] Parse `EXPLAIN FORMAT=JSON` output (MySQL)
- [ ] Extract: `cost`, `actual time ms`, `rows`, `loops`, node type (Seq Scan, Index Scan, Hash Join, etc.)
- [ ] Post-migration query capture (same queries)
- [ ] Diff engine: compute delta for each metric
- [ ] Regression detection: flag any query with > 10% performance degradation
- [ ] Improvement detection: highlight queries with > 50% improvement
- [ ] Lock wait time capture during migration execution (`pg_stat_activity`)

### Week 6 — Report Builder + Full Integration

- [ ] Implement `ReportBuilder` class
- [ ] Markdown report template (human-readable, GitHub-compatible)
- [ ] JSON report schema (machine-readable, CI/CD friendly)
- [ ] Merge: Risk Report + Sandbox Report + EXPLAIN diff → Impact Report
- [ ] Estimated migration duration calculator (based on row count + batch size + sleep interval)
- [ ] Recommendations engine (top 3 actionable recommendations per report)
- [ ] Full integration test: schema → analysis → sandbox → report
- [ ] CLI `--output-dir` flag to save all artifacts
- [ ] HTML report option (bonus)

### Deliverables
- [ ] `sandbox/` module: Docker lifecycle management
- [ ] `sandbox/seeder/` module: synthetic data generation
- [ ] `explain/` module: EXPLAIN ANALYZE parsing and diffing
- [ ] `reports/` module: Markdown + JSON report generation
- [ ] Full E2E integration test suite (5+ realistic scenarios)

### Exit Criteria
Running `db-migrate-agent analyze` on a change to a table seeded with 5M rows produces a complete impact report in < 5 minutes including sandbox execution.

---

## Phase 3 — Knowledge Updater (Self-Improvement System)
**Duration**: 2 weeks  
**Status**: ⬜ NOT STARTED  
**Depends on**: Phase 2 complete

### Goals
- Automated crawling of authoritative sources for new migration patterns and research
- Structured ingestion into SECOND-KNOWLEDGE-BRAIN.md
- Knowledge feeds back into risk scoring and pattern library

### Week 7 — Crawler Infrastructure

- [ ] Implement `KnowledgeCrawler` class
- [ ] Source registry (see `SECOND-KNOWLEDGE-BRAIN.md` for full list):
  - [ ] PostgreSQL release notes (RSS/scrape)
  - [ ] MySQL release notes (RSS/scrape)
  - [ ] Percona blog (RSS)
  - [ ] PlanetScale blog (RSS)
  - [ ] arXiv cs.DB section (arXiv API)
  - [ ] GitHub repositories: `ankane/strong_migrations`, `djrobstep/migra`, `fabianlindfors/reshape` (GitHub API, watch releases + issues)
  - [ ] Brandur Leach's blog (RSS)
  - [ ] High Scalability blog (RSS)
- [ ] Deduplication: hash-based, skip already-ingested articles
- [ ] Relevance filter: Claude-powered classification — is this about safe schema migration?
- [ ] Rate limiting: respect robots.txt, ≤ 1 req/sec per domain
- [ ] Crawl scheduling: run after each agent session + weekly cron (`node-cron` / APScheduler)

### Week 8 — Knowledge Ingestion + Pattern Extraction

- [ ] Implement `KnowledgeIngester` class
- [ ] Claude-powered summarization pipeline:
  - Input: raw article/paper text
  - Output: structured knowledge entry (title, date, source, key finding, applicable pattern, confidence)
- [ ] Pattern extractor: identify any new safe migration technique mentioned
- [ ] Conflict resolver: if new research contradicts existing knowledge, flag for human review
- [ ] Append to `SECOND-KNOWLEDGE-BRAIN.md` in structured format
- [ ] Risk weight updater: if new evidence changes risk assessment for a pattern, update scoring weights
- [ ] Pattern library updater: new confirmed patterns added to `MigrationGenerator`
- [ ] Knowledge diff report: weekly summary of what was learned
- [ ] CLI command: `db-migrate-agent knowledge update --dry-run`

### Deliverables
- [ ] `knowledge/crawler/` module
- [ ] `knowledge/ingester/` module  
- [ ] Cron job configuration
- [ ] `SECOND-KNOWLEDGE-BRAIN.md` populated with ≥ 30 validated entries
- [ ] Test: mock crawl → ingestion → knowledge update pipeline

### Exit Criteria
Running `db-migrate-agent knowledge update` successfully ingests new content from at least 3 sources and appends structured entries to `SECOND-KNOWLEDGE-BRAIN.md`.

---

## Phase 4 — Production Hardening & Release
**Duration**: 2 weeks  
**Status**: ⬜ NOT STARTED  
**Depends on**: Phase 3 complete

### Goals
- Harden all error paths
- Performance optimization
- Distribution packaging (npm, pip, Homebrew)
- Documentation finalization
- GitHub Action / pre-commit hook integrations

### Week 9 — Hardening

#### Error Handling
- [ ] Graceful degradation: if Docker unavailable, skip sandbox and note in report
- [ ] Schema parse failures: provide actionable error messages with line numbers
- [ ] API timeout handling: retry with exponential backoff
- [ ] Partial migration detection: if sandbox fails mid-migration, capture state and report
- [ ] Out-of-disk-space handling in sandbox

#### Performance
- [ ] Parallel execution: parse schema + start Docker container simultaneously
- [ ] Connection pooling for sandbox DB
- [ ] Streaming output for long-running sandbox operations (progress bar)
- [ ] Cache schema AST between runs (content-hash based)

#### Security Review
- [ ] Audit: confirm no production connection paths exist in code
- [ ] SQL injection prevention in generated migrations (parameterized where needed)
- [ ] Docker socket access — use `--no-new-privileges` flag
- [ ] Dependency audit (`npm audit` / `pip-audit`)
- [ ] Secret scanning in CI

### Week 10 — Distribution & Integrations

#### CLI Distribution
- [ ] Package as standalone binary (pkg / PyInstaller)
- [ ] npm package: `@db-migrate-architect/cli`
- [ ] Homebrew formula (macOS)
- [ ] Docker image: `ghcr.io/db-migrate-architect/agent:latest`

#### GitHub Action
- [ ] `action.yml` definition
- [ ] Inputs: `schema-path`, `db-engine`, `fail-on-risk-level`
- [ ] Outputs: risk score, report URL, migration file path
- [ ] Auto-comment on PR with impact report summary
- [ ] Block merge if CRITICAL risk (configurable)
- [ ] Publish to GitHub Marketplace

#### Pre-commit Hook
- [ ] `.pre-commit-hooks.yaml` definition
- [ ] Detect new migration files in commit
- [ ] Run analysis and block commit if CRITICAL risk
- [ ] Publish to pre-commit.com registry

#### Documentation
- [ ] Full README with installation, quickstart, examples
- [ ] Docs site (GitHub Pages or Mintlify)
- [ ] Video walkthrough (screen recording)
- [ ] Changelog (`CHANGELOG.md`)

### Deliverables
- [ ] npm package published
- [ ] Docker image published to GHCR
- [ ] GitHub Action published to Marketplace
- [ ] Pre-commit hook published
- [ ] Docs site live
- [ ] v1.0.0 GitHub Release

### Exit Criteria
A developer with zero prior knowledge of the project can install via npm, run against a real Prisma schema, and receive a complete impact report within 10 minutes of reading the README.

---

## Ongoing Backlog (Post v1.0)

| Item | Priority | Phase |
|------|----------|-------|
| MySQL `gh-ost` integration for CRITICAL migrations | HIGH | v2 |
| Slack / Teams bot interface | MEDIUM | v2 |
| Replication lag estimation in reports | MEDIUM | v2 |
| Historical migration trend dashboard | LOW | v2 |
| Partitioned table support | HIGH | v2 |
| pgvector semantic search over knowledge base | MEDIUM | v2 |
| Fine-tuned model on migration outcomes dataset | LOW | v3 |
| Multi-tenant schema orchestration | LOW | v3 |
| CockroachDB / Vitess support | LOW | v3 |

---

## Risk Register (Project Risks)

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Docker not available in target env | MEDIUM | HIGH | Graceful degradation mode (analysis only, no sandbox) |
| Prisma schema format changes (major version) | LOW | MEDIUM | Pin to Prisma version range; monitor release notes |
| Claude API latency > 30s | LOW | MEDIUM | Streaming + timeout fallback |
| Synthetic data not representative enough | MEDIUM | HIGH | Allow developer to provide real anonymized data |
| New DB feature invalidates risk model | LOW | HIGH | Knowledge updater catches this; monthly review cadence |
| False negatives (miss a risky pattern) | MEDIUM | CRITICAL | Conservative default scoring; community feedback loop |

---

## Team & Ownership

| Component | Owner | Status |
|-----------|-------|--------|
| Schema Parsers | TBD | Not started |
| Risk Analysis Engine | TBD | Not started |
| Migration Generator | TBD | Not started |
| Docker Sandbox | TBD | Not started |
| EXPLAIN Engine | TBD | Not started |
| Knowledge Updater | TBD | Not started |
| CLI + Integrations | TBD | Not started |
| Documentation | TBD | Not started |

---

## Progress Tracker

```
Phase 0  [██████████] 100%  Foundation
Phase 1  [░░░░░░░░░░]  0%  Core Agent
Phase 2  [░░░░░░░░░░]  0%  Sandbox
Phase 3  [░░░░░░░░░░]  0%  Knowledge
Phase 4  [░░░░░░░░░░]  0%  Release
─────────────────────────
Overall  [██░░░░░░░░]  20%
```

*Update this file at the end of each sprint.*
