import { SandboxOrchestrator } from './orchestrator';
import { QueryPerformance, PerformanceDifference } from '../agent/interfaces';

export interface ExplainConfig {
  queries: string[];
  engine: 'postgres' | 'mysql' | 'mongodb';
}

/**
 * ExplainAnalyzer - Captures and analyzes EXPLAIN output before and after migrations
 */
export class ExplainAnalyzer {
  private orchestrator: SandboxOrchestrator;
  private config: ExplainConfig;

  constructor(orchestrator: SandboxOrchestrator, config: ExplainConfig) {
    this.orchestrator = orchestrator;
    this.config = config;
  }

  /**
   * Run EXPLAIN ANALYZE on a list of queries
   */
  public async analyzeQueries(queries: string[]): Promise<QueryPerformance[]> {
    const results: QueryPerformance[] = [];

    for (const query of queries) {
      const performance = await this.runExplain(query);
      if (performance) {
        results.push(performance);
      }
    }

    return results;
  }

  /**
   * Run EXPLAIN for a single query
   */
  private async runExplain(query: string): Promise<QueryPerformance | null> {
    try {
      let cmd = '';
      if (this.config.engine === 'postgres') {
        const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`;
        cmd = `psql -U testuser -d testdb -t -c "${explainQuery.replace(/"/g, '\\"')}"`;
      } else if (this.config.engine === 'mysql') {
        const explainQuery = `EXPLAIN FORMAT=JSON ${query}`;
        cmd = `mysql -u testuser -ptestpass testdb -e "${explainQuery.replace(/"/g, '\\"')}"`;
      } else if (this.config.engine === 'mongodb') {
        // MongoDB uses db.collection.explain("executionStats").find(...)
        // We assume the query is in the format: db.collection.find({...})
        // We'll wrap it to get executionStats
        const explainQuery = query.replace(/\.find\(/, '.explain("executionStats").find(');
        cmd = `mongosh testdb --quiet --eval "${explainQuery.replace(/"/g, '\\"')}"`;
      }

      const { stdout, stderr } = await this.orchestrator.executeCommand(cmd);
      
      if (stderr && !stderr.includes('WARNING') && this.config.engine !== 'mongodb') {
        console.error(`Error running EXPLAIN for query: ${query}`, stderr);
        return null;
      }

      const cleanedOutput = stdout.trim();
      if (!cleanedOutput) {
        return null;
      }

      let parsed: any;
      try {
        parsed = JSON.parse(cleanedOutput);
      } catch (e) {
        console.error('Failed to parse EXPLAIN JSON output:', cleanedOutput);
        return null;
      }

      return this.extractMetrics(parsed, query);
    } catch (error) {
      console.error(`Failed to run EXPLAIN for query: ${query}`, error);
      return null;
    }
  }

  /**
   * Extract metrics from EXPLAIN JSON output
   */
  private extractMetrics(parsed: any, query: string): QueryPerformance | null {
    if (this.config.engine === 'postgres') {
      if (!Array.isArray(parsed) || !parsed[0] || !parsed[0].Plan) {
        return null;
      }
      const plan = parsed[0].Plan;
      return {
        query,
        executionTimeMs: plan['Actual Total Time'] || 0,
        planningTimeMs: parsed[0]['Planning Time'] || 0,
        rowsReturned: plan['Actual Rows'] || 0,
        nodeType: plan['Node Type'],
        cost: plan['Total Cost'],
        loops: plan['Actual Loops'] || 1,
        buffers: plan['Shared Hit Blocks'] || 0
      };
    } else if (this.config.engine === 'mysql') {
      if (!Array.isArray(parsed) || !parsed[0] || !parsed[0].query_block) {
        return null;
      }
      const block = parsed[0].query_block;
      return {
        query,
        executionTimeMs: 0,
        planningTimeMs: 0,
        rowsReturned: block?.table?.rows_produced_per_join || 0,
        nodeType: block?.table?.access_type || 'UNKNOWN',
        cost: block?.cost_info?.query_cost || 0,
        loops: 1,
        buffers: 0
      };
    } else if (this.config.engine === 'mongodb') {
      // MongoDB explain output structure
      if (!parsed || !parsed.executionStats) {
        return null;
      }
      const stats = parsed.executionStats;
      return {
        query,
        executionTimeMs: stats.executionTimeMillis || 0,
        planningTimeMs: 0, // MongoDB doesn't separate planning time in the same way
        rowsReturned: stats.nReturned || 0,
        nodeType: parsed.queryPlanner?.winningPlan?.stage || 'UNKNOWN',
        cost: 0, // MongoDB doesn't use cost in the same way
        loops: 1,
        buffers: 0
      };
    }
    return null;
  }

  /**
   * Compare pre and post migration performance
   */
  public comparePerformance(pre: QueryPerformance[], post: QueryPerformance[]): PerformanceDifference[] {
    const diffs: PerformanceDifference[] = [];

    for (const preQuery of pre) {
      const postQuery = post.find(q => q.query === preQuery.query);
      if (!postQuery) {
        continue;
      }

      const preTime = preQuery.executionTimeMs;
      const postTime = postQuery.executionTimeMs;
      
      // Avoid division by zero
      const baseTime = preTime > 0 ? preTime : 1;
      const changePercent = ((postTime - preTime) / baseTime) * 100;

      let status: 'IMPROVED' | 'REGRESSED' | 'UNCHANGED' = 'UNCHANGED';
      if (changePercent < -10) {
        status = 'IMPROVED'; // Negative change means faster
      } else if (changePercent > 10) {
        status = 'REGRESSED'; // Positive change means slower
      }

      diffs.push({
        query: preQuery.query,
        preExecutionTimeMs: preTime,
        postExecutionTimeMs: postTime,
        changePercent: Number(changePercent.toFixed(2)),
        status
      });
    }

    return diffs;
  }

  /**
   * Capture lock wait time during migration (simplified)
   */
  public async captureLockWaitTime(): Promise<number> {
    // This is a simplified placeholder. 
    // In reality, you'd query pg_stat_activity or sys.innodb_locks during the migration.
    if (this.config.engine === 'postgres') {
      const cmd = `psql -U testuser -d testdb -t -c "SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (now() - state_change))), 0) FROM pg_stat_activity WHERE wait_event_type = 'Lock';"`;
      try {
        const { stdout } = await this.orchestrator.executeCommand(cmd);
        return parseFloat(stdout.trim()) || 0;
      } catch {
        return 0;
      }
    } else if (this.config.engine === 'mongodb') {
      // MongoDB uses document-level locking, so traditional lock wait time is less relevant.
      // We can check currentOp for locks if needed, but for now, return 0.
      return 0;
    }
    return 0;
  }
}