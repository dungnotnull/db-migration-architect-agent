# PROJECT-detail.md — DB Migration Architect Agent

## Executive Summary

**Project Name**: DB Migration Architect Agent  
**Type**: Autonomous AI Agent (Claude-powered, CLI + API interface)  
**Target Users**: Backend engineers, Tech Leads, DevOps engineers  
**Core Value Proposition**: Eliminate database migration downtime risk and reduce Tech Lead review time by 80% through automated risk analysis, safe migration generation, and sandboxed pre-flight validation.

---

## Problem Statement

### The Pain (Real, Widespread, Expensive)

Every engineering team that operates a production database at scale faces this dilemma:

> *"We need to add a column to the `orders` table. It has 50 million rows. Last time someone did a naive `ALTER TABLE`, we had 8 minutes of downtime at 2am."*

The root causes:
1. **Implicit table locks** — `ALTER TABLE` in both MySQL and PostgreSQL acquires `ACCESS EXCLUSIVE` locks by default, blocking all reads and writes
2. **Missing index strategy** — creating an index naively on a large table serializes writes for minutes or hours
3. **NOT NULL constraint explosions** — adding a non-nullable column to a populated table fails or locks
4. **Manual, error-prone reviews** — Tech Leads spend 30–60 minutes per migration reviewing for these issues, yet subtle bugs still slip through
5. **No pre-flight validation** — migrations are tested in staging (different data volume) or not at all

### Market Context

- Virtually every production web application (SaaS, fintech, e-commerce) runs a relational database
- Schema changes are required multiple times per sprint in active development
- Incidents caused by database migrations cost companies $5k–$500k per outage (downtime × revenue)
- Existing tools (`Flyway`, `Liquibase`, `Alembic`) handle migration *execution* but provide **zero risk analysis or safe pattern generation**

---

## Solution Architecture

### High-Level Flow

```
Developer Input
     │
     ▼
┌─────────────────────────┐
│   Schema Ingestion      │  ← Prisma schema, DDL SQL, or DB connection
│   (Prisma / DDL Parser) │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   Risk Analysis Engine  │  ← Volume, lock type, index, constraint, rollback
│   (Scored 0-100)        │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Migration Generator    │  ← Multi-phase SQL with annotations
│  (Safe Pattern Library) │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   Docker Sandbox        │  ← Isolated test environment
│   Dry-Run Executor      │  ← Seeded with representative data
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  EXPLAIN ANALYZE Engine │  ← Before/after query plan comparison
│  Performance Profiler   │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   Impact Report Builder │  ← Markdown + JSON report
│   PR-Ready Artifacts    │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Knowledge Updater      │  ← Crawl papers/docs → SECOND-KNOWLEDGE-BRAIN.md
│  (Self-improvement loop)│
└─────────────────────────┘
```

### Component Deep Dive

#### 1. Schema Ingestion Module
- **Prisma Parser**: Reads `.prisma` files, extracts models, fields, relations, indexes
- **DDL Parser**: Handles raw SQL `CREATE TABLE`, `ALTER TABLE` statements
- **Output**: Normalized internal schema AST (Abstract Syntax Tree) — database-agnostic intermediate representation

#### 2. Risk Analysis Engine

**Inputs**: Current schema AST + requested change  
**Outputs**: Risk score (0–100), risk breakdown per dimension, recommended strategy

Risk Dimensions:
| Dimension | Weight | Key Questions |
|-----------|--------|---------------|
| Lock Type | 35% | What lock does this operation acquire? Duration? |
| Data Volume | 25% | How many rows? What is the estimated operation time? |
| Index Impact | 20% | Are indexes added/dropped/rebuilt? |
| Constraint Complexity | 10% | FK validation? CHECK constraints? |
| Rollback Difficulty | 10% | Can this be reversed cleanly? Data loss risk? |

Risk Score Bands:
- 0–25: **LOW** — Standard migration acceptable
- 26–50: **MEDIUM** — Use safe patterns, monitor during execution
- 51–75: **HIGH** — Multi-phase migration required, schedule off-peak
- 76–100: **CRITICAL** — Online DDL tooling required (gh-ost / pt-osc)

#### 3. Migration Generator

Maintains a library of **safe migration patterns** (sourced from SECOND-KNOWLEDGE-BRAIN.md):

| Change Type | MySQL Strategy | PostgreSQL Strategy |
|-------------|---------------|---------------------|
| Add nullable column | `ALGORITHM=INSTANT` (8.0+) | Metadata-only lock |
| Add NOT NULL column | Batched backfill + `MODIFY` | 3-phase: add nullable → backfill → set NOT NULL |
| Create index | `ALGORITHM=INPLACE` | `CREATE INDEX CONCURRENTLY` |
| Rename column | Application-level 3-phase | Application-level 3-phase |
| Add FK | `NOT VALID` → `VALIDATE` | `NOT VALID` → `VALIDATE CONSTRAINT` |
| Drop column | Verify no app references first | Same + check `pg_depend` |
| Change column type | gh-ost or pt-osc | Multi-phase + `pg_repack` if needed |

Each generated migration includes:
- Inline comments explaining every decision
- Estimated duration
- Lock type acquired
- Rollback SQL
- Pre-flight safety checks (`DO $$ ... ASSERT ...`)

#### 4. Docker Sandbox Executor

```
┌─────────────────────────────────────┐
│  Docker Compose (auto-provisioned)  │
│  ┌──────────────┐  ┌─────────────┐ │
│  │  DB Sandbox  │  │  Seeder     │ │
│  │  (PG/MySQL)  │  │  (subset of │ │
│  │  Port 5433   │  │   prod DDL +│ │
│  └──────────────┘  │   gen data) │ │
│                    └─────────────┘ │
└─────────────────────────────────────┘
```

- Auto-generates seed data matching production row counts (using `pgbench`, `sysbench`, or `faker`)
- Anonymizes any provided real data automatically (no PII in sandbox)
- Captures timing, lock waits, and query plans
- Tears down cleanly after each run

#### 5. EXPLAIN ANALYZE Engine

Runs a configurable set of representative queries before and after migration:
- Developer can supply query list, or agent infers from schema relations
- Captures: `cost`, `actual time`, `rows`, `loops`, scan type (Seq vs Index)
- Detects regressions: any query that gets > 10% slower is flagged as a WARNING

#### 6. Knowledge Updater (Self-Improvement Loop)

**Schedule**: Runs after each agent session + weekly cron  
**Sources crawled**:
- PostgreSQL release notes (postgresql.org/docs)
- MySQL release notes (dev.mysql.com)
- Percona blog (percona.com/blog)
- PlanetScale blog (planetscale.com/blog)
- arXiv CS.DB section (arxiv.org/list/cs.DB)
- GitHub: `ankane/strong_migrations`, `djrobstep/migra`, `fabianlindfors/reshape`
- Brandur Leach's blog (brandur.org) — PostgreSQL deep dives

**Update protocol**:
1. Crawl sources → extract relevant sections
2. Summarize new findings using Claude
3. Append to `SECOND-KNOWLEDGE-BRAIN.md` with date, source, and confidence score
4. Re-weight risk scoring engine if new evidence changes best practice

---

## Technical Stack

### Agent Framework
- **Claude API** (claude-sonnet-4) — core reasoning, risk analysis, natural language ↔ SQL
- **Claude Code** — for CLI interface and file system operations
- **MCP (Model Context Protocol)** — tool integrations

### Infrastructure
- **Docker** + **Docker Compose** — sandbox execution
- **PostgreSQL 16** / **MySQL 8.0** — target databases
- **Node.js / Python** — agent runtime (TBD based on team preference)

### Schema Parsing
- `@prisma/internals` — Prisma schema parsing
- `node-sql-parser` or `pgsql-ast-parser` — DDL parsing

### Performance Analysis
- Native `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` (PostgreSQL)
- Native `EXPLAIN FORMAT=JSON` (MySQL)
- `pg_stat_statements` for query tracking

### Knowledge Storage
- `SECOND-KNOWLEDGE-BRAIN.md` — human-readable, version-controlled knowledge corpus
- Optionally: vector embeddings (pgvector) for semantic search over the knowledge base

### Output
- Markdown reports (GitHub PR-friendly)
- JSON structured output (for CI/CD integration)
- Annotated SQL migration files

---

## User Interface Options

### Option A: CLI (Primary)
```bash
# Analyze a change request
db-migrate-agent analyze \
  --schema ./prisma/schema.prisma \
  --change "Add status column to orders, table has 50M rows" \
  --db-engine postgres

# Output: risk report + migration file + sandbox report
```

### Option B: Git Hook (Integrated)
```bash
# Pre-commit hook: auto-analyze any .sql migration file committed
# Blocks commit if CRITICAL risk detected
# Adds impact report as a commit comment
```

### Option C: GitHub Action (PR Integration)
```yaml
# .github/workflows/migration-check.yml
on: pull_request
jobs:
  analyze-migration:
    uses: db-migration-architect-agent@v1
    with:
      schema-path: prisma/schema.prisma
```

### Option D: Web Dashboard (Future)
- View migration history and risk trends
- Compare migration strategies side by side
- Knowledge base browser

---

## Key Differentiators vs. Existing Tools

| Feature | Flyway | Liquibase | Alembic | gh-ost | **This Agent** |
|---------|--------|-----------|---------|--------|----------------|
| Migration execution | ✅ | ✅ | ✅ | ✅ | ✅ |
| Risk analysis | ❌ | ❌ | ❌ | Partial | ✅ |
| Safe pattern generation | ❌ | ❌ | ❌ | ❌ | ✅ |
| Natural language input | ❌ | ❌ | ❌ | ❌ | ✅ |
| Sandbox dry-run | ❌ | ❌ | ❌ | ❌ | ✅ |
| EXPLAIN ANALYZE report | ❌ | ❌ | ❌ | ❌ | ✅ |
| Self-improving knowledge | ❌ | ❌ | ❌ | ❌ | ✅ |
| Rollback generation | Manual | Manual | Manual | ❌ | ✅ |

---

## Edge Cases & Known Limitations (v1)

| Edge Case | Handling |
|-----------|---------|
| Distributed DB (CockroachDB, Vitess) | Out of scope v1 — flagged in output |
| Partitioned tables | Detected, flagged as HIGH risk, manual guidance provided |
| Replication lag impact | Estimated, not measured (no replica in sandbox) |
| Stored procedures / triggers | Detected in schema, flagged for manual review |
| Schema-per-tenant (multi-tenant) | Out of scope v1 |
| NoSQL (MongoDB, Redis) | Out of scope — SQL only |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Migration incidents prevented | 0 CRITICAL-risk migrations merged without Tech Lead override |
| Tech Lead review time reduction | ≥ 70% reduction in time-to-approve |
| False positive rate (LOW risk flagged as HIGH) | < 5% |
| Sandbox execution time | < 5 minutes for changes on tables up to 10M rows |
| Knowledge base growth | ≥ 2 new validated patterns per month |

---

## Security & Compliance

- **No production connections** — agent operates sandbox-only; production schema is provided as files, not live connections
- **Data anonymization** — any real data used for seeding is automatically anonymized before sandbox load
- **Audit trail** — every analysis run is logged with input schema hash, change request, output risk score, and generated migration hash
- **Secrets management** — no database credentials stored; ephemeral Docker secrets only

---

## Future Roadmap

### v2 Features
- [ ] MySQL `gh-ost` integration for CRITICAL-risk migrations
- [ ] Automatic replication lag estimation
- [ ] Slack/Teams bot interface
- [ ] Multi-database cross-schema join impact analysis
- [ ] Historical migration performance trend dashboard

### v3 Features
- [ ] Fine-tuned ML model trained on 10k+ real migration outcomes
- [ ] Real-time production monitoring integration (alert when migration query plan degrades)
- [ ] Support for partitioned tables and sharded schemas
- [ ] Multi-tenant schema migration orchestration
