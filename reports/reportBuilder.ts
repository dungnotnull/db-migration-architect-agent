import * as fs from 'fs';
import * as path from 'path';
import { RiskReport, SandboxReport, MigrationArtifact, ImpactReport, PerformanceDifference } from '../agent/interfaces';

export interface ReportConfig {
  outputDir: string;
  changeDescription: string;
  filename: string;
}

/**
 * ReportBuilder - Generates human-readable and machine-readable impact reports
 */
export class ReportBuilder {
  private config: ReportConfig;

  constructor(config: ReportConfig) {
    this.config = config;
  }

  /**
   * Build the final Impact Report
   */
  public build(riskReport: RiskReport, sandboxReport: SandboxReport, migrationArtifact: MigrationArtifact): ImpactReport {
    const prSummary = this.generatePrSummary(riskReport, sandboxReport);
    const prBody = this.generatePrBody(riskReport, sandboxReport, migrationArtifact);

    const impactReport: ImpactReport = {
      migrationInfo: {
        filename: migrationArtifact.filename,
        generatedAt: migrationArtifact.generatedAt,
        changeDescription: this.config.changeDescription
      },
      riskReport,
      sandboxReport,
      migrationArtifact,
      prSummary,
      prBody
    };

    return impactReport;
  }

  /**
   * Generate a short summary for PR title/description
   */
  private generatePrSummary(riskReport: RiskReport, sandboxReport: SandboxReport): string {
    const status = sandboxReport.success ? '✅ Safe' : '⚠️ Requires Review';
    return `[DB Migration] ${this.config.changeDescription} - Risk: ${riskReport.riskLevel} ${status}`;
  }

  /**
   * Generate a detailed PR body in Markdown
   */
  private generatePrBody(riskReport: RiskReport, sandboxReport: SandboxReport, migrationArtifact: MigrationArtifact): string {
    let markdown = `# Database Migration Impact Report\n\n`;
    markdown += `**Change Description:** ${this.config.changeDescription}\n`;
    markdown += `**Generated At:** ${migrationArtifact.generatedAt}\n`;
    markdown += `**Migration File:** \`${migrationArtifact.filename}\`\n\n`;

    markdown += `## 🚦 Risk Analysis\n`;
    markdown += `- **Overall Risk Score:** ${riskReport.overallScore}/100\n`;
    markdown += `- **Risk Level:** **${riskReport.riskLevel}**\n`;
    markdown += `- **Recommended Strategy:** ${riskReport.recommendedStrategy}\n\n`;

    markdown += `### Risk Breakdown\n`;
    markdown += `| Dimension | Score |\n`;
    markdown += `|-----------|-------|\n`;
    markdown += `| Lock Risk | ${riskReport.riskBreakdown.lockRisk}/100 |\n`;
    markdown += `| Data Volume Impact | ${riskReport.riskBreakdown.dataVolumeImpact}/100 |\n`;
    markdown += `| Index Impact | ${riskReport.riskBreakdown.indexImpact}/100 |\n`;
    markdown += `| Constraint Risk | ${riskReport.riskBreakdown.constraintRisk}/100 |\n`;
    markdown += `| Rollback Complexity | ${riskReport.riskBreakdown.rollbackComplexity}/100 |\n\n`;

    if (riskReport.warnings.length > 0) {
      markdown += `### ⚠️ Warnings\n`;
      riskReport.warnings.forEach(w => {
        markdown += `- ${w}\n`;
      });
      markdown += `\n`;
    }

    if (riskReport.recommendations.length > 0) {
      markdown += `### 💡 Recommendations\n`;
      riskReport.recommendations.forEach(r => {
        markdown += `- ${r}\n`;
      });
      markdown += `\n`;
    }

    markdown += `## 📊 Sandbox Performance Analysis\n`;
    if (sandboxReport.success) {
      markdown += `- **Migration Execution Time:** ${sandboxReport.migrationExecutionTime}ms\n`;
      
      if (sandboxReport.performanceDiff.length > 0) {
        markdown += `\n### Query Performance Diff\n`;
        markdown += `| Query | Pre (ms) | Post (ms) | Change | Status |\n`;
        markdown += `|-------|----------|-----------|--------|--------|\n`;
        
        for (const diff of sandboxReport.performanceDiff) {
          const statusIcon = diff.status === 'IMPROVED' ? '🟢' : diff.status === 'REGRESSED' ? '🔴' : '🟡';
          const changeStr = diff.changePercent > 0 ? `+${diff.changePercent}%` : `${diff.changePercent}%`;
          // Truncate query for table
          const shortQuery = diff.query.length > 40 ? diff.query.substring(0, 37) + '...' : diff.query;
          markdown += `| \`${shortQuery}\` | ${diff.preExecutionTimeMs} | ${diff.postExecutionTimeMs} | ${changeStr} | ${statusIcon} ${diff.status} |\n`;
        }
      }
    } else {
      markdown += `❌ **Sandbox execution failed:** ${sandboxReport.errorMessage}\n`;
    }
    markdown += `\n`;

    markdown += `## 📜 Migration SQL\n`;
    markdown += `\`\`\`sql\n${migrationArtifact.sql}\n\`\`\`\n\n`;

    markdown += `## 🔄 Rollback SQL\n`;
    markdown += `\`\`\`sql\n${migrationArtifact.rollbackSql}\n\`\`\`\n`;

    return markdown;
  }

  /**
   * Save the report to disk (both Markdown and JSON)
   */
  public save(impactReport: ImpactReport): { markdownPath: string; jsonPath: string } {
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }

    const baseName = this.config.filename.replace('.sql', '');
    const markdownPath = path.join(this.config.outputDir, `${baseName}_report.md`);
    const jsonPath = path.join(this.config.outputDir, `${baseName}_report.json`);

    fs.writeFileSync(markdownPath, impactReport.prBody, 'utf-8');
    fs.writeFileSync(jsonPath, JSON.stringify(impactReport, null, 2), 'utf-8');

    return { markdownPath, jsonPath };
  }

  /**
   * Calculate estimated migration duration based on row count and batch size
   */
  public calculateEstimatedDuration(rowCount: number, batchSize: number = 10000, sleepMs: number = 100): string {
    if (rowCount === 0) {
      return '< 1 second';
    }

    const batches = Math.ceil(rowCount / batchSize);
    const estimatedMs = batches * (50 + sleepMs); // 50ms base execution + sleep
    const estimatedSeconds = estimatedMs / 1000;

    if (estimatedSeconds < 60) {
      return `${Math.ceil(estimatedSeconds)} seconds`;
    } else if (estimatedSeconds < 3600) {
      return `${Math.ceil(estimatedSeconds / 60)} minutes`;
    } else {
      return `${(estimatedSeconds / 3600).toFixed(1)} hours`;
    }
  }
}