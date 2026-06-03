import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface KnowledgeSource {
  name: string;
  url: string;
  type: 'rss' | 'http' | 'github';
}

export interface CrawledItem {
  id: string; // hash of content
  source: string;
  title: string;
  content: string;
  url: string;
  crawledAt: string;
  isRelevant: boolean;
}

/**
 * KnowledgeCrawler - Fetches and deduplicates knowledge from authoritative sources
 */
export class KnowledgeCrawler {
  private sources: KnowledgeSource[] = [
    { name: 'PostgreSQL Release Notes', url: 'https://www.postgresql.org/about/news/', type: 'http' },
    { name: 'Percona Blog', url: 'https://www.percona.com/blog/category/database-migrations/', type: 'http' },
    { name: 'PlanetScale Blog', url: 'https://planetscale.com/blog', type: 'http' }
  ];
  
  private processedHashes: Set<string> = new Set();
  private knowledgeDir: string;

  constructor(knowledgeDir: string = path.join(process.cwd(), 'knowledge')) {
    this.knowledgeDir = knowledgeDir;
    this.loadProcessedHashes();
  }

  /**
   * Load previously processed content hashes to avoid duplicates
   */
  private loadProcessedHashes(): void {
    const hashFile = path.join(this.knowledgeDir, '.processed_hashes.json');
    if (fs.existsSync(hashFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(hashFile, 'utf-8'));
        this.processedHashes = new Set(data);
      } catch {
        this.processedHashes = new Set();
      }
    }
  }

  /**
   * Save processed hashes to disk
   */
  private saveProcessedHashes(): void {
    if (!fs.existsSync(this.knowledgeDir)) {
      fs.mkdirSync(this.knowledgeDir, { recursive: true });
    }
    const hashFile = path.join(this.knowledgeDir, '.processed_hashes.json');
    fs.writeFileSync(hashFile, JSON.stringify(Array.from(this.processedHashes), null, 2));
  }

  /**
   * Generate a hash for content deduplication
   */
  private hashContent(content: string): string {
    return crypto.createHash('sha256').update(content.trim()).digest('hex');
  }

  /**
   * Simulate fetching content (In production, this would use node-fetch/axios and rss-parser)
   */
  private async fetchContent(source: KnowledgeSource): Promise<string> {
    // Simulated network delay for rate limiting demonstration
    await new Promise(resolve => setTimeout(resolve, 100)); // 100ms rate limit
    
    // Mock content for demonstration purposes
    return `
      Title: New Safe Migration Pattern in ${source.name}
      Content: Recent updates show that using CONCURRENTLY for index creation 
      and NOT VALID for foreign keys significantly reduces lock time in large tables.
      URL: ${source.url}/example-article
    `;
  }

  /**
   * Simulate AI-powered relevance filtering
   */
  private isRelevant(content: string): boolean {
    const keywords = ['migration', 'schema', 'lock', 'index', 'concurrently', 'not valid', 'downtime'];
    const lowerContent = content.toLowerCase();
    return keywords.some(keyword => lowerContent.includes(keyword));
  }

  /**
   * Crawl all registered sources
   */
  public async crawl(dryRun: boolean = false): Promise<CrawledItem[]> {
    const results: CrawledItem[] = [];

    for (const source of this.sources) {
      try {
        const content = await this.fetchContent(source);
        const contentHash = this.hashContent(content);

        if (this.processedHashes.has(contentHash)) {
          console.log(`[Crawler] Skipping duplicate content from: ${source.name}`);
          continue;
        }

        const relevant = this.isRelevant(content);
        
        const item: CrawledItem = {
          id: contentHash,
          source: source.name,
          title: `New Safe Migration Pattern in ${source.name}`,
          content: content.trim(),
          url: `${source.url}/example-article`,
          crawledAt: new Date().toISOString(),
          isRelevant: relevant
        };

        if (relevant) {
          results.push(item);
          if (!dryRun) {
            this.processedHashes.add(contentHash);
          }
          console.log(`[Crawler] Found relevant knowledge from: ${source.name}`);
        } else {
          console.log(`[Crawler] Content from ${source.name} deemed irrelevant.`);
        }
      } catch (error) {
        console.error(`[Crawler] Failed to crawl ${source.name}:`, error);
      }
    }

    if (!dryRun) {
      this.saveProcessedHashes();
    }

    return results;
  }
}