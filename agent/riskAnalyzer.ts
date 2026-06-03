import { SchemaAST, MigrationRequest, RiskReport } from './interfaces';

/**
 * Risk Analyzer - Evaluates the risk of a database migration
 */
export class RiskAnalyzer {
  /**
   * Analyze the risk of a migration request
   * @param request - The migration request
   * @returns RiskReport with detailed risk breakdown
   */
  public analyze(request: MigrationRequest): RiskReport {
    const lockRisk = this.calculateLockRisk(request);
    const dataVolumeImpact = this.calculateDataVolumeImpact(request);
    const indexImpact = this.calculateIndexImpact(request);
    const constraintRisk = this.calculateConstraintRisk(request);
    const rollbackComplexity = this.calculateRollbackComplexity(request);

    const overallScore = this.aggregateRiskScore({
      lockRisk,
      dataVolumeImpact,
      indexImpact,
      constraintRisk,
      rollbackComplexity
    });

    const riskLevel = this.determineRiskLevel(overallScore);
    const recommendations = this.generateRecommendations(request, {
      lockRisk,
      dataVolumeImpact,
      indexImpact,
      constraintRisk,
      rollbackComplexity
    });
    const warnings = this.generateWarnings(request, {
      lockRisk,
      dataVolumeImpact,
      indexImpact,
      constraintRisk,
      rollbackComplexity
    });

    return {
      overallScore,
      riskLevel,
      riskBreakdown: {
        lockRisk,
        dataVolumeImpact,
        indexImpact,
        constraintRisk,
        rollbackComplexity
      },
      recommendedStrategy: this.determineRecommendedStrategy(riskLevel),
      estimatedDuration: {
        phase1: '50ms',
        phase2: '25-40 min',
        phase3: '200ms'
      },
      recommendations,
      warnings
    };
  }

  /**
   * Calculate lock risk based on the operation
   */
  private calculateLockRisk(request: MigrationRequest): number {
    // Simplified lock risk calculation
    // In a real implementation, this would analyze the specific DDL operations
    // and map them to PostgreSQL/MySQL lock matrices
    let risk = 0;
    
    const changeDesc = request.changeDescription.toLowerCase();
    if (changeDesc.includes('add column') || changeDesc.includes('create table')) {
      risk = 10; // Low risk
    } else if (changeDesc.includes('add index') || changeDesc.includes('create index')) {
      risk = 30; // Medium risk
    } else if (changeDesc.includes('drop column') || changeDesc.includes('drop table')) {
      risk = 70; // High risk
    } else if (changeDesc.includes('alter column') || changeDesc.includes('change type')) {
      risk = 80; // High risk, might require table rewrite
    } else if (changeDesc.includes('add foreign key')) {
      risk = 50; // Medium risk
    } else {
      risk = 40; // Default medium risk
    }

    return Math.min(100, Math.max(0, risk));
  }

  /**
   * Calculate data volume impact
   */
  private calculateDataVolumeImpact(request: MigrationRequest): number {
    let maxRowCount = 0;
    
    if (request.rowCountOverride) {
      for (const count of Object.values(request.rowCountOverride)) {
        if (count > maxRowCount) {
          maxRowCount = count;
        }
      }
    }

    // Apply thresholds: <1M / 1M-10M / 10M-100M / >100M
    if (maxRowCount < 1_000_000) {
      return 10; // Low impact
    } else if (maxRowCount < 10_000_000) {
      return 30; // Medium impact
    } else if (maxRowCount < 100_000_000) {
      return 60; // High impact
    } else {
      return 90; // Critical impact
    }
  }

  /**
   * Calculate index impact
   */
  private calculateIndexImpact(request: MigrationRequest): number {
    const changeDesc = request.changeDescription.toLowerCase();
    
    if (changeDesc.includes('drop index')) {
      return 20; // Low risk, but might affect query performance
    } else if (changeDesc.includes('add index') || changeDesc.includes('create index')) {
      return 40; // Medium risk, concurrent index creation recommended
    } else if (changeDesc.includes('add primary key') || changeDesc.includes('add unique')) {
      return 60; // High risk, requires table scan and lock
    }
    
    return 10; // Default low impact
  }

  /**
   * Calculate constraint risk
   */
  private calculateConstraintRisk(request: MigrationRequest): number {
    const changeDesc = request.changeDescription.toLowerCase();
    
    if (changeDesc.includes('add not null') && !changeDesc.includes('default')) {
      return 80; // High risk on populated table
    } else if (changeDesc.includes('add foreign key') && !changeDesc.includes('not valid')) {
      return 70; // High risk, validates existing data
    } else if (changeDesc.includes('add check')) {
      return 60; // Medium-high risk, validates existing data
    }
    
    return 20; // Default low risk
  }

  /**
   * Calculate rollback complexity
   */
  private calculateRollbackComplexity(request: MigrationRequest): number {
    const changeDesc = request.changeDescription.toLowerCase();
    
    if (changeDesc.includes('drop table') || changeDesc.includes('drop column')) {
      return 90; // Destructive, requires data backup for rollback
    } else if (changeDesc.includes('change type') || changeDesc.includes('alter column')) {
      return 70; // Requires data migration for rollback
    } else if (changeDesc.includes('add column') || changeDesc.includes('add index')) {
      return 20; // Simple rollback (just drop)
    }
    
    return 30; // Default medium complexity
  }

  /**
   * Aggregate weighted risk score (0-100)
   */
  private aggregateRiskScore(scores: {
    lockRisk: number;
    dataVolumeImpact: number;
    indexImpact: number;
    constraintRisk: number;
    rollbackComplexity: number;
  }): number {
    // Weighted average: lock (30%), data volume (25%), index (15%), constraint (20%), rollback (10%)
    const weightedScore = 
      (scores.lockRisk * 0.30) +
      (scores.dataVolumeImpact * 0.25) +
      (scores.indexImpact * 0.15) +
      (scores.constraintRisk * 0.20) +
      (scores.rollbackComplexity * 0.10);
      
    return Math.round(Math.min(100, Math.max(0, weightedScore)));
  }

  /**
   * Determine risk level based on score
   */
  private determineRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score < 25) return 'LOW';
    if (score < 50) return 'MEDIUM';
    if (score < 75) return 'HIGH';
    return 'CRITICAL';
  }

  /**
   * Determine recommended strategy based on risk level
   */
  private determineRecommendedStrategy(riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): string {
    switch (riskLevel) {
      case 'LOW':
        return 'Execute directly during low-traffic window';
      case 'MEDIUM':
        return 'Execute with monitoring, consider concurrent operations where applicable';
      case 'HIGH':
        return 'Use multi-step migration pattern (e.g., expand and contract)';
      case 'CRITICAL':
        return 'Requires extensive planning, data backup, and potentially zero-downtime migration tools (e.g., gh-ost, pt-online-schema-change)';
      default:
        return 'Review migration manually';
    }
  }

  /**
   * Generate recommendations based on risk breakdown
   */
  private generateRecommendations(
    request: MigrationRequest,
    scores: {
      lockRisk: number;
      dataVolumeImpact: number;
      indexImpact: number;
      constraintRisk: number;
      rollbackComplexity: number;
    }
  ): string[] {
    const recommendations: string[] = [];
    
    if (scores.lockRisk > 50) {
      recommendations.push('Consider using CONCURRENTLY for index creation to avoid table locks.');
    }
    if (scores.dataVolumeImpact > 50) {
      recommendations.push('For large tables, consider batching the migration or using online schema change tools.');
    }
    if (scores.constraintRisk > 50) {
      recommendations.push('When adding constraints to existing data, consider adding them as NOT VALID first, then validating in a separate step.');
    }
    if (scores.rollbackComplexity > 50) {
      recommendations.push('Ensure you have a tested rollback plan and recent data backup before executing.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Migration appears safe to execute with standard monitoring.');
    }
    
    return recommendations;
  }

  /**
   * Generate warnings based on risk breakdown
   */
  private generateWarnings(
    request: MigrationRequest,
    scores: {
      lockRisk: number;
      dataVolumeImpact: number;
      indexImpact: number;
      constraintRisk: number;
      rollbackComplexity: number;
    }
  ): string[] {
    const warnings: string[] = [];
    
    if (scores.lockRisk > 70) {
      warnings.push('This operation may cause significant table locking and block other queries.');
    }
    if (scores.dataVolumeImpact > 70) {
      warnings.push('High data volume may cause this migration to take a long time and consume significant resources.');
    }
    if (scores.rollbackComplexity > 70) {
      warnings.push('Rolling back this migration will be complex and may require manual data restoration.');
    }
    
    return warnings;
  }
}