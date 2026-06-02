# SECOND-KNOWLEDGE-BRAIN.md
# DB Migration Architect Agent — Living Knowledge Corpus

> **Purpose**: This file is the agent's persistent, self-updating knowledge base. It contains validated findings from research papers, engineering blogs, official documentation, and real-world case studies on safe database schema migration. The agent reads this file on every run. The `knowledge_updater` tool appends new entries automatically. Entries are never deleted — only superseded.
>
> **How to read this file**: Each entry has a confidence score (HIGH / MEDIUM / LOW), a source, a date ingested, and a structured summary. Higher confidence entries have been validated by multiple independent sources.

---

## Table of Contents

1. [Core Principles](#1-core-principles)
2. [PostgreSQL — Lock Mechanics](#2-postgresql--lock-mechanics)
3. [PostgreSQL — Safe DDL Patterns](#3-postgresql--safe-ddl-patterns)
4. [MySQL — Safe DDL Patterns](#4-mysql--safe-ddl-patterns)
5. [Online Schema Change Tools](#5-online-schema-change-tools)
6. [Expand/Contract Pattern](#6-expandcontract-pattern)
7. [Performance Analysis Techniques](#7-performance-analysis-techniques)
8. [Real-World Case Studies](#8-real-world-case-studies)
9. [Emerging Tools (2024–2025)](#9-emerging-tools-20242025)
10. [Research Papers](#10-research-papers)
11. [Anti-Patterns — Things That Cause Downtime](#11-anti-patterns--things-that-cause-downtime)
12. [Knowledge Update Log](#12-knowledge-update-log)

---

## 1. Core Principles

### [K-001] The Lock Hierarchy is Everything
**Date Ingested**: 2026-05-31  
**Source**: PostgreSQL Official Documentation, multiple engineering blogs  
**Confidence**: HIGH  

PostgreSQL has 8 lock levels. The most dangerous for schema migration is `ACCESS EXCLUSIVE`, which blocks every other operation including `SELECT`. Most DDL statements (ALTER TABLE, DROP TABLE, TRUNCATE) acquire `ACCESS EXCLUSIVE` by default. Understanding which lock a DDL statement acquires is the single most important factor in risk assessment.

Lock levels ordered from least to most restrictive:
1. `ACCESS SHARE` — acquired by SELECT
2. `ROW SHARE` — acquired by SELECT FOR UPDATE
3. `ROW EXCLUSIVE` — acquired by INSERT, UPDATE, DELETE
4. `SHARE UPDATE EXCLUSIVE` — acquired by CREATE INDEX CONCURRENTLY, ANALYZE
5. `SHARE` — acquired by CREATE INDEX (blocking)
6. `SHARE ROW EXCLUSIVE` — acquired by some triggers
7. `EXCLUSIVE` — rare
8. `ACCESS EXCLUSIVE` — acquired by most ALTER TABLE operations

**Agent Implication**: Any migration that acquires `ACCESS EXCLUSIVE` on a table with > 1M rows is classified as MEDIUM risk or above. Duration matters: even a 2-second lock is catastrophic at high traffic if connection queuing occurs.

---

### [K-002] Lock Queuing: The Hidden Multiplier
**Date Ingested**: 2026-05-31  
**Source**: Brandur Leach blog, Xata engineering blog  
**Confidence**: HIGH  

Even a brief `ACCESS EXCLUSIVE` lock can cause cascading connection exhaustion. If a long-running transaction is already running when the DDL arrives, the DDL waits. While it waits, it holds a queue position — and all subsequent queries (even SELECTs) that need any conflicting lock queue behind the DDL. This can exhaust connection pools in seconds.

**Mitigation**: Always set `lock_timeout = '2s'` before running DDL in production. This causes the DDL to fail immediately (rather than queue) if it cannot acquire the lock within 2 seconds. Retry with a backoff strategy.

```sql
SET lock_timeout = '2s';
SET statement_timeout = '60s';
ALTER TABLE ...;
```

**Agent Implication**: All generated migrations must include `SET lock_timeout` and `SET statement_timeout` as pre-flight steps.

---

### [K-003] Zero Downtime is a Spectrum, Not a Binary
**Date Ingested**: 2026-05-31  
**Source**: Tiger Data / Timescale engineering blog (2025-12-09)  
**Confidence**: HIGH  

True zero-downtime database migrations are aspirational — all migrations have some impact. The goal is to minimize impact to below the threshold of user perception (typically < 100ms perceived latency increase). Strategies exist for sub-second impact, but any cutover involving a primary switch will have some brief interruption.

**Agent Implication**: Reports should use "near-zero downtime" or "sub-second impact" rather than "zero downtime" for honest communication.

---

## 2. PostgreSQL — Lock Mechanics

### [K-004] Which ALTER TABLE Operations Are Safe in PostgreSQL
**Date Ingested**: 2026-05-31  
**Source**: PostgreSQL 16/17 Documentation, multiple corroborating sources  
**Confidence**: HIGH  

Operations that do NOT acquire `ACCESS EXCLUSIVE` or complete it in microseconds (metadata-only):

| Operation | Lock Type | Safe on Large Tables? |
|-----------|-----------|----------------------|
| `ADD COLUMN` (nullable, no default) | ACCESS EXCLUSIVE (metadata-only) | ✅ Yes — sub-millisecond |
| `ADD COLUMN` (nullable, volatile default) | ACCESS EXCLUSIVE + table rewrite | ❌ No — rewrites table |
| `ADD COLUMN` (nullable, constant default, PG 11+) | ACCESS EXCLUSIVE (metadata-only) | ✅ Yes — PG 11+ stores default in catalog |
| `DROP COLUMN` | ACCESS EXCLUSIVE (metadata-only) | ✅ Yes — logical delete only |
| `ALTER COLUMN SET DEFAULT` | ACCESS EXCLUSIVE (metadata-only) | ✅ Yes |
| `ALTER COLUMN DROP DEFAULT` | ACCESS EXCLUSIVE (metadata-only) | ✅ Yes |
| `ALTER COLUMN SET NOT NULL` (PG 18+) | SHARE UPDATE EXCLUSIVE | ✅ Yes — PG 18 improvement |
| `ALTER COLUMN SET NOT NULL` (PG < 18) | ACCESS EXCLUSIVE + full scan | ❌ No — scans entire table |
| `ALTER COLUMN TYPE` | ACCESS EXCLUSIVE + full rewrite | ❌ No — always rewrites |
| `CREATE INDEX` (blocking) | SHARE | ❌ No — blocks writes |
| `CREATE INDEX CONCURRENTLY` | SHARE UPDATE EXCLUSIVE | ✅ Yes |
| `ADD CONSTRAINT CHECK` (NOT VALID) | ACCESS EXCLUSIVE (metadata-only) | ✅ Yes |
| `VALIDATE CONSTRAINT` | SHARE UPDATE EXCLUSIVE | ✅ Yes |
| `ADD CONSTRAINT FOREIGN KEY` (NOT VALID) | SHARE ROW EXCLUSIVE | ✅ Yes |
| `ADD CONSTRAINT UNIQUE` | ACCESS EXCLUSIVE | ❌ No — creates index |
| `ADD CONSTRAINT PRIMARY KEY` | ACCESS EXCLUSIVE | ❌ No — creates index |
| `DROP CONSTRAINT` | ACCESS EXCLUSIVE (metadata-only) | ✅ Usually yes |
| `RENAME COLUMN` | ACCESS EXCLUSIVE (metadata-only) | ⚠️ App-level risk |
| `RENAME TABLE` | ACCESS EXCLUSIVE (metadata-only) | ⚠️ App-level risk |

**Key PostgreSQL 11 Change**: Adding a column with a constant default value (`ALTER TABLE t ADD COLUMN c int DEFAULT 42`) no longer requires a full table rewrite in PostgreSQL 11+. The default is stored in the catalog and filled lazily. This is a major safe migration enabler.

**Key PostgreSQL 18 Change**: `ALTER COLUMN SET NOT NULL` now only requires `SHARE UPDATE EXCLUSIVE` lock in PostgreSQL 18, making it safe for large tables.

---

### [K-005] The Anatomy of a Lock Wait Incident
**Date Ingested**: 2026-05-31  
**Source**: GoCardless engineering blog, Xata engineering blog  
**Confidence**: HIGH  

Timeline of a typical migration incident on a busy table:
1. Long-running OLAP query runs (T=0s), holds `ACCESS SHARE` lock
2. Developer runs `ALTER TABLE` at T=5s — it wants `ACCESS EXCLUSIVE`
3. ALTER waits for OLAP query to finish — sits in lock queue
4. New incoming queries (SELECTs, INSERTs) queue behind the ALTER (they need `ACCESS SHARE` but it conflicts with the queued `ACCESS EXCLUSIVE`)
5. Connection pool exhausts at T=10s (all connections are waiting)
6. Service is now completely unavailable
7. OLAP query finishes at T=30s — ALTER runs in 200ms — but 20+ connections timed out

**Mitigation Protocol**:
1. Set `lock_timeout = '2s'` — ALTER fails fast instead of queuing
2. Kill or warn about long-running queries before ALTER
3. Check `pg_stat_activity` for idle-in-transaction sessions
4. Use `pg_cancel_backend()` or `pg_terminate_backend()` for stuck queries

---

## 3. PostgreSQL — Safe DDL Patterns

### [K-006] The NOT VALID / VALIDATE CONSTRAINT Pattern
**Date Ingested**: 2026-05-31  
**Source**: PostgreSQL Documentation, multiple engineering blogs  
**Confidence**: HIGH  

Adding a constraint to an existing table requires scanning all existing rows to validate the constraint. This can hold `ACCESS EXCLUSIVE` for a long time on large tables.

**Safe Pattern**:
```sql
-- Phase 1: Add constraint without validating existing rows (near-instant)
-- This only acquires SHARE ROW EXCLUSIVE, not ACCESS EXCLUSIVE
ALTER TABLE orders
  ADD CONSTRAINT chk_orders_amount_positive
  CHECK (amount > 0) NOT VALID;

-- Phase 2: Validate existing rows separately (only SHARE UPDATE EXCLUSIVE)
-- This allows reads/writes to continue during validation
ALTER TABLE orders VALIDATE CONSTRAINT chk_orders_amount_positive;
```

The same pattern applies to `FOREIGN KEY` constraints:
```sql
ALTER TABLE order_items
  ADD CONSTRAINT fk_order_items_orders
  FOREIGN KEY (order_id) REFERENCES orders(id)
  NOT VALID;

ALTER TABLE order_items VALIDATE CONSTRAINT fk_order_items_orders;
```

---

### [K-007] Backfilling Large Tables Safely
**Date Ingested**: 2026-05-31  
**Source**: Percona Blog, GoCardless engineering blog  
**Confidence**: HIGH  

Never run a bare `UPDATE orders SET status = 'active'` on a table with millions of rows. This holds a write lock for the entire duration and generates a massive WAL spike.

**Safe Pattern — Keyed Batch Update**:
```sql
DO $$
DECLARE
  last_id BIGINT := 0;
  batch_size INT := 10000;
  rows_updated INT;
  max_id BIGINT;
BEGIN
  SELECT MAX(id) INTO max_id FROM orders;
  
  WHILE last_id < max_id LOOP
    UPDATE orders
    SET status = 'active'
    WHERE id > last_id
      AND id <= last_id + batch_size
      AND status IS NULL;
    
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    last_id := last_id + batch_size;
    
    -- Brief sleep to allow replication to catch up
    PERFORM pg_sleep(0.05);
    
    -- Optional: log progress
    RAISE NOTICE 'Updated up to id %, rows affected: %', last_id, rows_updated;
  END LOOP;
END $$;
```

**Key Parameters**:
- Batch size: 10,000–50,000 rows per batch (tune based on row size and write load)
- Sleep interval: 50–100ms (tune based on replication lag tolerance)
- Use `id`-keyed batching (not `LIMIT/OFFSET`) — LIMIT/OFFSET gets slower as offset grows

---

### [K-008] Safely Renaming a Column (3-Phase Pattern)
**Date Ingested**: 2026-05-31  
**Source**: Brandur Leach, multiple ORM documentation sites  
**Confidence**: HIGH  

`RENAME COLUMN` acquires `ACCESS EXCLUSIVE` but completes in milliseconds. The real danger is the application side — old code will immediately fail with "column not found". The 3-phase pattern solves this:

**Phase 1**: Add new column, update app to write to both columns, read from old column
```sql
ALTER TABLE users ADD COLUMN username VARCHAR(255);
-- Deploy app v2: writes username AND login, reads from login
```

**Phase 2**: Backfill old data into new column, update app to read from new column
```sql
UPDATE users SET username = login WHERE username IS NULL;
-- Deploy app v3: writes username AND login, reads from username
```

**Phase 3**: Remove old column (after all app instances are on v3)
```sql
ALTER TABLE users DROP COLUMN login;
-- Deploy app v4: writes username only, reads from username
```

---

### [K-009] CREATE INDEX CONCURRENTLY — Caveats
**Date Ingested**: 2026-05-31  
**Source**: PostgreSQL Documentation, Percona Blog  
**Confidence**: HIGH  

`CREATE INDEX CONCURRENTLY` (CIC) is the standard way to add an index without blocking writes. However, it has important caveats:

1. **Failure leaves an invalid index**: If CIC fails or is interrupted, it leaves behind an index marked `INVALID` in `pg_indexes`. This invalid index consumes space and is updated on writes, but never used for reads. Must be explicitly dropped.
2. **Cannot run inside a transaction**: CIC cannot be wrapped in `BEGIN/COMMIT`. Running it inside a transaction causes a `ERROR: CREATE INDEX CONCURRENTLY cannot run inside a transaction block`.
3. **Takes significantly longer**: CIC makes two passes over the table and waits for concurrent transactions between passes. Expect 2–5x longer than blocking index creation.
4. **Waits for long-running transactions**: CIC will not complete until all transactions that started before the second pass have finished. Long-running OLAP queries can cause CIC to hang.

**Pre-flight check for invalid indexes**:
```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE indexdef LIKE '%INVALID%'
   OR indexname IN (
     SELECT indexrelid::regclass::text
     FROM pg_index WHERE NOT indisvalid
   );
```

---

## 4. MySQL — Safe DDL Patterns

### [K-010] MySQL 8.0 INSTANT Algorithm
**Date Ingested**: 2026-05-31  
**Source**: MySQL 8.0 Documentation, Microsoft Azure MySQL Blog  
**Confidence**: HIGH  

MySQL 8.0 introduced `ALGORITHM=INSTANT` for certain operations, which completes in milliseconds regardless of table size — no table copy, no row-level locking.

**Supported operations (ALGORITHM=INSTANT)**:
- Adding a column (at the end of the row, or with `FIRST`/`AFTER` in 8.0.29+)
- Dropping a column (8.0.29+)
- Reordering columns (8.0.29+)
- Adding/dropping virtual generated columns
- Changing `NULL`/`NOT NULL` in some cases (8.0.29+)
- Changing column default value
- Adding/dropping enum or set values

**Syntax**:
```sql
ALTER TABLE orders
  ADD COLUMN status VARCHAR(50) DEFAULT NULL,
  ALGORITHM=INSTANT;
```

**Warning**: `INSTANT` uses metadata that tracks column "added after" position. After many instant operations, a table "upgrade" may eventually be needed. Monitor `INFORMATION_SCHEMA.INNODB_TABLES.INSTANT_COLS`.

---

### [K-011] MySQL Online DDL Lock Matrix
**Date Ingested**: 2026-05-31  
**Source**: MySQL 8.0 Documentation, Percona Blog  
**Confidence**: HIGH  

For operations not supported by `INSTANT`, use `ALGORITHM=INPLACE, LOCK=NONE`:

```sql
ALTER TABLE orders
  ADD INDEX idx_status (status),
  ALGORITHM=INPLACE,
  LOCK=NONE;
```

Operations and their minimum lock requirements (MySQL 8.0):

| Operation | Min Algorithm | Min Lock | Concurrent DML? |
|-----------|---------------|----------|----------------|
| Add column (end) | INSTANT | NONE | ✅ |
| Drop column | INSTANT | NONE | ✅ |
| Add index (secondary) | INPLACE | NONE | ✅ |
| Add primary key | INPLACE | NONE | ✅ (with conditions) |
| Drop primary key | COPY | SHARED | ❌ |
| Change column type | COPY | SHARED | ❌ |
| Add FK | INPLACE | NONE | ✅ |
| Drop FK | INPLACE | NONE | ✅ |
| Convert charset | COPY | SHARED | ❌ |
| Add FULLTEXT index | INPLACE | SHARED | ❌ |

---

## 5. Online Schema Change Tools

### [K-012] gh-ost — GitHub Online Schema Transmogrifier
**Date Ingested**: 2026-05-31  
**Source**: GitHub Engineering Blog, Bytebase comparison (2025), multiple case studies  
**Confidence**: HIGH  

**What it is**: A triggerless online schema change tool for MySQL, developed by GitHub Engineering. Creates a shadow copy (ghost table) of the target table, copies data in batches, and listens to the binary log to replay concurrent changes onto the ghost table. Performs an atomic table swap when complete.

**Mechanism**:
1. Creates `_tablename_gho` (ghost table) with new schema
2. Creates `_tablename_ghc` (changelog table) for coordination
3. Copies rows in configurable batches from original → ghost
4. Reads MySQL binlog via replication protocol to replay concurrent INSERTs/UPDATEs/DELETEs onto ghost
5. When fully caught up: atomic RENAME (`_gho` → original, original → `_del`)
6. Drops `_del` table after configurable delay

**Key Advantages** (vs pt-osc):
- Triggerless → lower write overhead (no trigger on every DML)
- Self-throttling based on replica lag
- Can pause/resume migration
- Binlog-based → consistent and safer under heavy write loads
- Can test on replica before running on primary

**Critical Limitations**:
- **Does NOT support tables with foreign key constraints** (will refuse to run)
- Requires `binlog_format=ROW` and `log_slave_updates=ON`
- Requires a unique key on the table (PK or unique index)
- Cannot be resumed if process dies — migration restarts from scratch
- Does not work with MySQL < 5.7

**When to use gh-ost vs pt-osc**:
- Tables with FK constraints → use pt-osc
- Heavy write workloads → use gh-ost (lower overhead)
- MySQL 5.5/5.6 → use pt-osc
- Need resumability → use pt-osc (with `--nodrop-new-table`)

---

### [K-013] pt-online-schema-change (pt-osc)
**Date Ingested**: 2026-05-31  
**Source**: Percona Toolkit Documentation, Bytebase comparison (2025)  
**Confidence**: HIGH  

**Mechanism**: Creates a shadow table, uses `AFTER INSERT/UPDATE/DELETE` triggers to mirror live changes, copies data in batches, then performs an atomic RENAME.

**Key Advantages**:
- Works with MySQL 5.5+
- Supports tables with foreign keys
- Resumable with `--nodrop-new-table` + `--nodrop-triggers`
- Simpler setup (no binlog requirements)

**Key Disadvantages**:
- Trigger overhead: every DML on original table fires 3 triggers → 2x write load
- Under heavy write load, triggers can cause significant performance degradation
- Cutover uses `RENAME TABLE` which may have brief lock contention

**Decision matrix** (from Bytebase, 2025):
```
FK constraints?          → pt-osc
MySQL < 5.7?            → pt-osc  
Heavy write load?       → gh-ost
Need resumability?      → pt-osc
Row-based replication?  → gh-ost preferred
Simple setup?           → pt-osc
```

---

### [K-014] pgroll — PostgreSQL Dual-Version Migration Tool
**Date Ingested**: 2026-05-31  
**Source**: Xata Engineering Blog, pgroll GitHub, PGDU 2025 Conference  
**Confidence**: HIGH  

**What it is**: Open-source CLI tool (Go binary) from Xata that implements the expand/contract pattern for PostgreSQL by automatically managing two simultaneous schema versions. Works with PostgreSQL 14+, including RDS and Aurora.

**Mechanism**:
1. **Expand Phase**: Applies migration as backward-compatible change (add hidden column, create view)
2. During expansion: old app sees old schema via old view, new app sees new schema via new view
3. New columns are backfilled automatically in the background
4. Old and new app versions run simultaneously without code changes
5. **Contract Phase**: Once all app instances are on new version, pgroll cleans up old column/views

**Key Features**:
- Zero `ACCESS EXCLUSIVE` lock (uses views + hidden columns + triggers for dual-write)
- Instant rollback: drop the new views, the old schema never changed
- Declarative JSON/YAML migration format
- Works with any Postgres service (RDS, Aurora, DigitalOcean, GCP)
- Single binary, no external dependencies

**Limitation**: Adds complexity to schema management (views on top of physical schema). Overhead from triggers during the migration window.

**Agent Implication**: For CRITICAL-risk migrations (column rename, type change) in PostgreSQL, recommend pgroll as the safest option.

---

### [K-015] Reshape — PostgreSQL Zero-Downtime Migration Tool
**Date Ingested**: 2026-05-31  
**Source**: GitHub (fabianlindfors/reshape), Xata blog  
**Confidence**: MEDIUM  

**What it is**: Open-source, experimental PostgreSQL-only migration tool that inspired pgroll. Uses the expand/contract pattern with simultaneous old/new schema availability.

**Status**: Marked as experimental; pgroll is the more production-ready descendant. Monitor for maturity.

**Agent Implication**: Recommend pgroll over Reshape for production use in 2025+.

---

## 6. Expand/Contract Pattern

### [K-016] The Expand/Contract (Parallel Change) Pattern — Canonical Definition
**Date Ingested**: 2026-05-31  
**Source**: Martin Fowler's Refactoring Databases, Xata Blog, multiple sources  
**Confidence**: HIGH  

The expand/contract pattern (also called "parallel change") is the gold standard for zero-downtime schema migrations involving breaking changes. It requires coordinating database changes with application deployments.

**Three Phases**:

**Phase 1 — Expand**: Make the database backward-compatible
- Add the new column/table (nullable, no constraints yet)
- Keep the old column/table intact
- Both old schema and new schema exist simultaneously

**Phase 2 — Migrate**: Move application to use new schema
- Application writes to BOTH old and new columns
- Application reads from new column
- Backfill old rows that weren't written to new column

**Phase 3 — Contract**: Remove old schema
- Verify all rows have values in new column
- Add constraints (NOT NULL, etc.) to new column
- Remove old column/table
- Remove dual-write logic from application

**Time between phases**: Each phase requires a separate deployment. Minimum 1–2 deployment cycles between phases, typically 1–7 days in practice.

---

## 7. Performance Analysis Techniques

### [K-017] Reading EXPLAIN ANALYZE Output Effectively
**Date Ingested**: 2026-05-31  
**Source**: PostgreSQL Documentation, use-the-index-luke.com  
**Confidence**: HIGH  

Key metrics to extract from `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)`:

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at LIMIT 100;
```

**Critical Fields**:
- `"Actual Total Time"` — actual wall-clock time (ms) for node
- `"Plan Rows"` vs `"Actual Rows"` — planner accuracy; large divergence indicates stale statistics
- `"Node Type"` — `"Seq Scan"` is almost always bad on large tables; `"Index Scan"` is good
- `"Shared Hit Blocks"` — data served from shared buffer cache (fast)
- `"Shared Read Blocks"` — data read from disk (slow; high value = buffer cache miss)
- `"Loops"` — for nested loop joins; multiply all other metrics by this

**Red Flags**:
- `Seq Scan` on table > 100k rows with a `WHERE` clause → missing index
- `Actual Rows` >> `Plan Rows` → stale statistics, run `ANALYZE table_name`
- High `Shared Read Blocks` → working set doesn't fit in `shared_buffers`
- Hash Join with huge temp files → `work_mem` too low

**Before/After Migration Diff**: Compare `Actual Total Time` and `Node Type`. A migration should never cause `Seq Scan` to appear where an `Index Scan` existed before.

---

### [K-018] Detecting Index Bloat Before Migration
**Date Ingested**: 2026-05-31  
**Source**: Percona Blog, pgstattuple extension  
**Confidence**: MEDIUM  

High-churn tables accumulate index bloat over time. Adding a new index to a bloated table is less effective. Detecting bloat before migration:

```sql
-- Requires pgstattuple extension
SELECT
  indexrelid::regclass AS index_name,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  round(100 * pgstatindex(indexrelid::regclass).avg_leaf_density) AS leaf_density_pct,
  round(100 * (1 - pgstatindex(indexrelid::regclass).avg_leaf_density / 100)) AS bloat_pct
FROM pg_index
WHERE indrelid = 'orders'::regclass;
```

If bloat > 30%, consider `REINDEX CONCURRENTLY` before or after migration to reclaim space and improve performance.

---

## 8. Real-World Case Studies

### [K-019] Fintech 500M-Row MySQL Migration Case Study
**Date Ingested**: 2026-05-31  
**Source**: Mafiree Engineering Blog (2026-02-20), DEV Community  
**Confidence**: HIGH  

**Context**: Fintech company needed to alter a 500M-row MySQL production table with zero downtime.

**Strategy Used**:
1. Simple changes (add nullable column) → MySQL 8.0 `ALGORITHM=INSTANT` — completed in < 1 second
2. Complex changes (change column type, add index on large columns) → gh-ost — ran over 4-6 hours during low-traffic window
3. Changes on FK-constrained tables → pt-osc — used when gh-ost could not run

**Key Configuration Settings for gh-ost**:
```bash
gh-ost \
  --max-load=Threads_running=25 \
  --critical-load=Threads_running=1000 \
  --chunk-size=1000 \
  --throttle-control-replicas=replica.host \
  --max-lag-millis=1500 \
  --approve-renamed-columns \
  --initially-drop-ghost-table
```

**Lesson**: Every migration phase had a documented rollback plan. The team pre-tested on a staging environment seeded with production-scale data.

---

### [K-020] GoCardless — Zero-Downtime Postgres Migration Lessons
**Date Ingested**: 2026-05-31  
**Source**: GoCardless Engineering Blog (2024)  
**Confidence**: HIGH  

GoCardless documented their approach to zero-downtime Postgres migrations on their payment processing infrastructure.

**Key Lessons**:
1. Lock queue poisoning is the #1 cause of migration-related incidents, not the migration itself
2. Setting `lock_timeout = '2s'` eliminated 90% of their migration-related incidents
3. They use a "migration advisory lock" pattern to ensure only one migration runs at a time
4. Long-running queries (>30s) must be terminated or waited out before any DDL
5. Always test with production-representative data, not just schema — query plans differ significantly

---

## 9. Emerging Tools (2024–2025)

### [K-021] pgroll Production Readiness (2025)
**Date Ingested**: 2026-05-31  
**Source**: pgroll GitHub, PGDU 2025 Conference, SyneHQ Blog  
**Confidence**: HIGH  

pgroll reached production-ready status in 2024-2025. Key milestones:
- Presented at PGDU 2025 conference
- Works with PostgreSQL 14, 15, 16, 17, and 18
- Benchmarked: backfill speed of ~100k rows/second on modern hardware
- Used in production by Xata (managed Postgres service)
- Compatible with RDS, Aurora, DigitalOcean, GCP Cloud SQL

**Adoption recommendation**: For PostgreSQL shops doing frequent column renames or type changes, pgroll is the most production-safe tool available in 2025. The expand/contract automation removes the need for custom 3-phase migration scripts.

---

### [K-022] PostgreSQL 18 — SET NOT NULL No Longer Requires Table Scan
**Date Ingested**: 2026-05-31  
**Source**: PostgreSQL 18 Release Notes  
**Confidence**: HIGH  

In PostgreSQL 18, `ALTER TABLE ... ALTER COLUMN ... SET NOT NULL` now only requires a `SHARE UPDATE EXCLUSIVE` lock when a `CHECK NOT NULL` constraint already exists (added with `NOT VALID` and validated). This is a significant improvement over PostgreSQL 17 and earlier, where `SET NOT NULL` required `ACCESS EXCLUSIVE` and a full table scan.

**New safe pattern for PostgreSQL 18+**:
```sql
-- Phase 1: Add check constraint (fast, ACCESS EXCLUSIVE metadata-only)
ALTER TABLE orders ADD CONSTRAINT chk_status_not_null CHECK (status IS NOT NULL) NOT VALID;

-- Phase 2: Validate (SHARE UPDATE EXCLUSIVE, allows reads/writes)
ALTER TABLE orders VALIDATE CONSTRAINT chk_status_not_null;

-- Phase 3: Set NOT NULL using constraint (SHARE UPDATE EXCLUSIVE in PG 18+)
ALTER TABLE orders ALTER COLUMN status SET NOT NULL;

-- Phase 4: Drop redundant check constraint
ALTER TABLE orders DROP CONSTRAINT chk_status_not_null;
```

**Agent Implication**: When target DB is PostgreSQL 18+, the risk score for `SET NOT NULL` migrations should be reduced from HIGH to MEDIUM.

---

## 10. Research Papers

### [K-023] "Online Schema Changes Without Downtime" — Survey of Techniques
**Date Ingested**: 2026-05-31  
**Source**: arXiv cs.DB, industry synthesis  
**Confidence**: MEDIUM  

The academic and industry literature on online schema changes converges on these fundamental techniques:

1. **Shadow table copying** (used by gh-ost, pt-osc, Facebook OSC): Create shadow table, copy data, use triggers or log replay for concurrent changes, atomic rename
2. **Multi-version views** (used by pgroll, reshape): Maintain two schema versions simultaneously using views and generated columns; contract after app migration
3. **Transactional DDL with short locks** (used by PostgreSQL with CONCURRENTLY): Acquire short locks at strategic moments, do the heavy work without locks, finalize with a brief lock

Each technique has different tradeoffs in terms of: write amplification, replication lag, lock granularity, rollback simplicity, and operational complexity.

---

## 11. Anti-Patterns — Things That Cause Downtime

### [K-024] Anti-Pattern Registry
**Date Ingested**: 2026-05-31  
**Source**: Multiple engineering postmortems, GoCardless blog, Percona blog  
**Confidence**: HIGH  

These patterns are known to cause production incidents:

| Anti-Pattern | Why It's Dangerous | Safe Alternative |
|-------------|---------------------|-----------------|
| `ALTER TABLE t ADD COLUMN c INT NOT NULL` on large table (PG < 11) | Full table rewrite | Add nullable, backfill, set NOT NULL |
| `CREATE INDEX idx ON t(col)` on large table | Blocks writes for minutes | `CREATE INDEX CONCURRENTLY` |
| `UPDATE t SET col = val` on millions of rows | Long-running write, huge WAL | Batched update with sleep |
| `ALTER TABLE t ALTER COLUMN c TYPE bigint` | Full table rewrite | Create new column, backfill, rename |
| `RENAME COLUMN` without 3-phase deploy | Application immediately breaks | 3-phase expand/contract |
| `ADD FOREIGN KEY` with VALIDATE on large table | Full table scan under lock | `NOT VALID` then `VALIDATE CONSTRAINT` |
| `TRUNCATE` as part of migration | Acquires ACCESS EXCLUSIVE | DELETE in batches |
| Running DDL inside a long transaction | Extends lock duration for entire transaction | Keep DDL transactions as short as possible |
| Missing `lock_timeout` setting | DDL queues and poisons connection pool | Always set `lock_timeout = '2s'` |
| Using LIMIT/OFFSET for batched backfill | O(n²) — gets slower with each batch | Keyed range batching with `id > last_id` |

---

## 12. Knowledge Update Log

This section is append-only. The `knowledge_updater` tool adds entries here after each crawl.

```
[2026-05-31] INITIAL SEED
  Sources crawled: 12
  New entries added: 24 (K-001 through K-024)
  Crawler: manual seed from project initialization
  Coverage: PostgreSQL lock mechanics, MySQL DDL, gh-ost, pt-osc, pgroll, expand/contract pattern, case studies

[NEXT UPDATE WILL APPEAR HERE]
```

---

## Crawl Source Registry

The following sources are checked by the `knowledge_updater` tool:

| Source | Type | URL | Frequency | Last Crawled |
|--------|------|-----|-----------|--------------|
| PostgreSQL Release Notes | Official Docs | postgresql.org/docs/release/ | Weekly | 2026-05-31 |
| MySQL Release Notes | Official Docs | dev.mysql.com/doc/relnotes/ | Weekly | 2026-05-31 |
| Percona Blog | Engineering Blog | percona.com/blog | Weekly | 2026-05-31 |
| PlanetScale Blog | Engineering Blog | planetscale.com/blog | Weekly | 2026-05-31 |
| Xata Blog | Engineering Blog | xata.io/blog | Weekly | 2026-05-31 |
| Brandur Leach Blog | Engineering Blog | brandur.org/articles | Weekly | 2026-05-31 |
| GoCardless Engineering | Engineering Blog | gocardless.com/blog | Monthly | 2026-05-31 |
| arXiv cs.DB | Research Papers | arxiv.org/list/cs.DB/recent | Monthly | 2026-05-31 |
| pgroll GitHub | Tool Releases | github.com/xataio/pgroll | Weekly | 2026-05-31 |
| gh-ost GitHub | Tool Releases | github.com/github/gh-ost | Weekly | 2026-05-31 |
| strong_migrations GitHub | Tool Releases | github.com/ankane/strong_migrations | Weekly | 2026-05-31 |
| Bytebase Blog | Engineering Blog | bytebase.com/blog | Weekly | 2026-05-31 |
| High Scalability | Engineering Blog | highscalability.com | Monthly | 2026-05-31 |

---

*This file is maintained by the DB Migration Architect Agent. Human edits are welcome — add entries in the same format above and update the Knowledge Update Log.*
