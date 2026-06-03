# DB Migration Architect Agent

[![npm version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://www.npmjs.com/package/@db-migrate-architect/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An autonomous AI-powered agent for safe, zero-downtime database schema migrations. It analyzes schema changes, calculates risk scores, generates safe migration SQL, and validates performance impacts in an isolated Docker sandbox.

## ✨ Features

- **Multi-Database Support**: PostgreSQL, MySQL, and MongoDB (NoSQL).
- **Risk Analysis Engine**: Evaluates lock risk, data volume impact, index impact, constraint risk, and rollback complexity.
- **Safe Migration Patterns**: Automatically applies best practices (e.g., `CONCURRENTLY` for Postgres, `NOT VALID` for FKs).
- **Docker Sandbox**: Provisions an isolated database, seeds synthetic data, and runs `EXPLAIN ANALYZE` to detect performance regressions.
- **Self-Improving Knowledge Base**: Crawls authoritative sources to stay updated on the latest safe migration patterns.
- **CI/CD Integrations**: Ready-to-use GitHub Action and pre-commit hooks to block risky migrations before they merge.

## 🚀 Quick Start

### Installation

```bash
npm install -g @db-migrate-architect/cli
```

### Basic Usage

Analyze a Prisma schema change:

```bash
db-migrate-agent analyze \
  --schema ./schema.prisma \
  --change "add column status to User" \
  --engine postgres \
  --output ./migrations
```

### Advanced Usage (with Sandbox)

Run the migration in an isolated Docker sandbox to get performance diff reports:

```bash
db-migrate-agent analyze \
  --schema ./schema.sql \
  --change "add index on user_email" \
  --engine postgres \
  --version 15 \
  --sandbox \
  --rows 100000 \
  --output ./reports
```

## 📚 Documentation

- [Project Details](./PROJECT-DETAIL.md)
- [Development Phase Tracking](./PROJECT-DEVELOPMENT-PHASE-TRACKING.md)
- [Knowledge Base](./knowledge/SECOND-KNOWLEDGE-BRAIN.md)

## 🛠️ CI/CD Integration

### GitHub Actions

Add this to your `.github/workflows/migration-check.yml`:

```yaml
steps:
  - uses: actions/checkout@v4
  - name: Check Migration Risk
    uses: db-migrate-architect/agent@v1
    with:
      schema-path: './schema.prisma'
      change-description: 'Add status column'
      engine: 'postgres'
      fail-on-risk-level: 'HIGH'
```

### Pre-commit Hook

Add to your `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/db-migrate-architect/agent
    rev: v1.0.0
    hooks:
      - id: db-migrate-agent
```

## 🏗️ Development

```bash
# Clone the repository
git clone https://github.com/db-migrate-architect/agent.git
cd agent

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

## 📄 License

MIT © DB Migration Architect Agent Team