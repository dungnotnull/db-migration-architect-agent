import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { SchemaAST } from '../agent/interfaces';

/**
 * SchemaCache - Caches parsed SchemaAST based on file content hash
 * Improves performance by avoiding re-parsing unchanged schema files
 */
export class SchemaCache {
  private cacheDir: string;

  constructor(cacheDir: string = path.join(os.tmpdir(), 'db-migrate-agent-cache')) {
    this.cacheDir = cacheDir;
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Generate a hash of the schema content
   */
  private hashContent(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Get cached AST if it exists and is valid
   */
  public get(content: string): SchemaAST | null {
    const hash = this.hashContent(content);
    const cacheFile = path.join(this.cacheDir, `${hash}.json`);

    if (fs.existsSync(cacheFile)) {
      try {
        const cachedData = fs.readFileSync(cacheFile, 'utf-8');
        return JSON.parse(cachedData) as SchemaAST;
      } catch (error) {
        // Cache corrupted, delete and return null
        fs.unlinkSync(cacheFile);
        return null;
      }
    }

    return null;
  }

  /**
   * Save AST to cache
   */
  public set(content: string, ast: SchemaAST): void {
    const hash = this.hashContent(content);
    const cacheFile = path.join(this.cacheDir, `${hash}.json`);

    try {
      fs.writeFileSync(cacheFile, JSON.stringify(ast), 'utf-8');
    } catch (error) {
      // Ignore cache write failures (e.g., disk full), it's a non-critical optimization
      console.warn('Failed to write to schema cache:', error);
    }
  }

  /**
   * Clear the entire cache
   */
  public clear(): void {
    if (fs.existsSync(this.cacheDir)) {
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(this.cacheDir, file));
        }
      }
    }
  }
}