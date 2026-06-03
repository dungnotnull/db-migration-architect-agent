import * as fs from 'fs';
import * as path from 'path';
import { CrawledItem } from './crawler';

export interface ExtractedPattern {
  title: string;
  description: string;
  applicableTo: string[]; // e.g., ['postgres', 'mysql']
  riskImpact: 'LOWERS_RISK' | 'RAISES_RISK' | 'NEUTRAL';
  confidence: number; // 0.0 to 1.0
}

/**
 * KnowledgeIngester - Processes crawled knowledge and updates the knowledge base
 */
export class KnowledgeIngester {
  private knowledgeBrainPath: string;

  constructor(knowledgeBrainPath: string = path.join(process.cwd(), 'knowledge', 'SECOND-KNOWLEDGE-BRAIN.md')) {
    this.knowledgeBrainPath = knowledgeBrainPath;
  }

  /**
   * Simulate AI-powered pattern extraction from raw content
   */
  private extractPatterns(item: CrawledItem): ExtractedPattern[] {
    const patterns: ExtractedPattern[] = [];
    const lowerContent = item.content.toLowerCase();

    if (lowerContent.includes('concurrently')) {
      patterns.push({
        title: 'Concurrent Index Creation',
        description: 'Use CREATE INDEX CONCURRENTLY in PostgreSQL to avoid exclusive table locks during index creation on large tables.',
        applicableTo: ['postgres'],
        riskImpact: 'LOWERS_RISK',
        confidence: 0.95
      });
    }

    if (lowerContent.includes('not valid')) {
      patterns.push({
        title: 'Add Foreign Key NOT VALID',
        description: 'Add foreign key constraints with NOT VALID in PostgreSQL to skip scanning existing data, then validate in a separate low-traffic transaction.',
        applicableTo: ['postgres'],
        riskImpact: 'LOWERS_RISK',
        confidence: 0.90
      });
    }

    if (lowerContent.includes('gh-ost') || lowerContent.includes('pt-online-schema-change')) {
      patterns.push({
        title: 'Online Schema Change Tools',
        description: 'For critical migrations on massive tables, use tools like gh-ost (MySQL) or pg_repack to achieve zero-downtime schema changes.',
        applicableTo: ['mysql', 'postgres'],
        riskImpact: 'LOWERS_RISK',
        confidence: 0.85
      });
    }

    return patterns;
  }

  /**
   * Append new knowledge to the SECOND-KNOWLEDGE-BRAIN.md file
   */
  public async ingest(items: CrawledItem[]): Promise<string> {
    if (items.length === 0) {
      return 'No new relevant knowledge to ingest.';
    }

    let newEntriesCount = 0;
    let report = '# Knowledge Ingestion Report\n\n';
    report += `Generated at: ${new Date().toISOString()}\n\n`;

    // Ensure directory exists
    const dir = path.dirname(this.knowledgeBrainPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Read existing knowledge brain or create new
    let existingContent = '';
    if (fs.existsSync(this.knowledgeBrainPath)) {
      existingContent = fs.readFileSync(this.knowledgeBrainPath, 'utf-8');
    } else {
      existingContent = '# SECOND-KNOWLEDGE-BRAIN.md\n\n## Safe Migration Patterns\n\n';
    }

    let appendContent = `\n## New Knowledge Added: ${new Date().toISOString().split('T')[0]}\n\n`;

    for (const item of items) {
      const patterns = this.extractPatterns(item);
      
      if (patterns.length > 0) {
        newEntriesCount += patterns.length;
        report += `### ✅ Processed: ${item.title}\n`;
        report += `- **Source:** ${item.source}\n`;
        report += `- **Patterns Extracted:** ${patterns.length}\n\n`;

        for (const pattern of patterns) {
          appendContent += `### ${pattern.title}\n`;
          appendContent += `- **Description:** ${pattern.description}\n`;
          appendContent += `- **Applicable To:** ${pattern.applicableTo.join(', ')}\n`;
          appendContent += `- **Risk Impact:** ${pattern.riskImpact}\n`;
          appendContent += `- **Confidence:** ${(pattern.confidence * 100).toFixed(0)}%\n`;
          appendContent += `- **Source:** [${item.title}](${item.url})\n\n`;
        }
      } else {
        report += `### ⚠️ Skipped: ${item.title} (No actionable patterns extracted)\n`;
      }
    }

    // Append to knowledge brain
    fs.writeFileSync(this.knowledgeBrainPath, existingContent + appendContent, 'utf-8');
    
    report += `\n## Summary\n`;
    report += `- **Total Items Processed:** ${items.length}\n`;
    report += `- **New Patterns Added:** ${newEntriesCount}\n`;
    report += `- **Knowledge Base Updated:** ${this.knowledgeBrainPath}\n`;

    return report;
  }

  /**
   * Get a summary of the current knowledge base
   */
  public getKnowledgeSummary(): string {
    if (!fs.existsSync(this.knowledgeBrainPath)) {
      return 'Knowledge base not found.';
    }
    
    const content = fs.readFileSync(this.knowledgeBrainPath, 'utf-8');
    const patternCount = (content.match(/### /g) || []).length - 1; // Subtract 1 for the main header
    
    return `Knowledge Base Summary:\n- File: ${this.knowledgeBrainPath}\n- Total Patterns Documented: ~${patternCount}`;
  }
}