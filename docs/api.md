# API Documentation

## Overview

This document provides an overview of the DB Migration Architect Agent's public APIs.

## Modules

### Agent Core

The main agent orchestration logic.

### Schema Parsers

Interfaces for parsing Prisma schema and DDL files.

### Risk Analysis Engine

Components for analyzing migration risks.

### Migration Generator

Tools for generating safe migration SQL.

### Docker Sandbox

Utilities for running migrations in isolated environments.

### Report Builder

Functions for generating impact reports.

## Interfaces

### SchemaAST

Normalized representation of any database schema.

### MigrationRequest

Structure for representing a schema change request.

### RiskReport

Output format for risk analysis results.

### MigrationArtifact

Generated SQL migration file with metadata.

### SandboxReport

Results from running migrations in the sandbox environment.

### ImpactReport

Final PR-ready report combining all analysis.

## Usage Examples

See the README.md for quick start examples.