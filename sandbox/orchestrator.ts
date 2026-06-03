import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface SandboxConfig {
  engine: 'postgres' | 'mysql' | 'mongodb';
  version: string;
  cpuLimit: string; // e.g., '2.0'
  memoryLimit: string; // e.g., '4g'
  port?: number;
}

export interface SandboxInstance {
  containerId: string;
  port: number;
  connectionString: string;
}

/**
 * SandboxOrchestrator - Manages Docker sandbox lifecycle for database migrations
 */
export class SandboxOrchestrator {
  private config: SandboxConfig;
  private instance: SandboxInstance | null = null;

  constructor(config: SandboxConfig) {
    this.config = config;
  }

  /**
   * Get a random ephemeral port to prevent conflicts
   */
  private async getRandomPort(): Promise<number> {
    if (this.config.port) {
      return this.config.port;
    }
    // Generate a random port in the ephemeral range (49152-65535)
    return Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152;
  }

  /**
   * Get the Docker image name based on engine and version
   */
  private getImageName(): string {
    if (this.config.engine === 'postgres') {
      const validVersions = ['14', '15', '16'];
      const version = validVersions.includes(this.config.version) ? this.config.version : '15';
      return `postgres:${version}`;
    } else if (this.config.engine === 'mysql') {
      const validVersions = ['8.0', '8.4'];
      const version = validVersions.includes(this.config.version) ? this.config.version : '8.0';
      return `mysql:${version}`;
    } else if (this.config.engine === 'mongodb') {
      const validVersions = ['6', '7'];
      const version = validVersions.includes(this.config.version) ? this.config.version : '6';
      return `mongo:${version}`;
    }
    throw new Error(`Unsupported engine: ${this.config.engine}`);
  }

  /**
   * Get environment variables for the container
   */
  private getEnvVars(): string[] {
    if (this.config.engine === 'postgres') {
      return ['-e', 'POSTGRES_USER=testuser', '-e', 'POSTGRES_PASSWORD=testpass', '-e', 'POSTGRES_DB=testdb'];
    } else if (this.config.engine === 'mysql') {
      return ['-e', 'MYSQL_ROOT_PASSWORD=testpass', '-e', 'MYSQL_DATABASE=testdb', '-e', 'MYSQL_USER=testuser', '-e', 'MYSQL_PASSWORD=testpass'];
    } else {
      // MongoDB doesn't require env vars for basic local sandbox, but we can set them if needed
      return [];
    }
  }

  /**
   * Get the connection string for the running instance
   */
  private getConnectionString(port: number): string {
    if (this.config.engine === 'postgres') {
      return `postgresql://testuser:testpass@localhost:${port}/testdb`;
    } else if (this.config.engine === 'mysql') {
      return `mysql://testuser:testpass@localhost:${port}/testdb`;
    } else {
      return `mongodb://localhost:${port}/testdb`;
    }
  }

  /**
   * Provision and start the sandbox container
   */
  public async provision(): Promise<SandboxInstance> {
    const port = await this.getRandomPort();
    const image = this.getImageName();
    const containerName = `db-migrate-sandbox-${Date.now()}`;

    console.log(`Provisioning sandbox: ${image} on port ${port}...`);

    const envVars = this.getEnvVars();
    const resourceLimits = [
      '--cpus', this.config.cpuLimit || '2.0',
      '--memory', this.config.memoryLimit || '4g'
    ];

    // Health checks for different engines
    let healthCheck: string[] = [];
    let internalPort = '5432';

    if (this.config.engine === 'postgres') {
      healthCheck = ['--health-cmd', 'pg_isready -U testuser', '--health-interval', '2s', '--health-timeout', '2s', '--health-retries', 10];
      internalPort = '5432';
    } else if (this.config.engine === 'mysql') {
      healthCheck = ['--health-cmd', 'mysqladmin ping -h localhost -u testuser -ptestpass', '--health-interval', '2s', '--health-timeout', '2s', '--health-retries', 10];
      internalPort = '3306';
    } else if (this.config.engine === 'mongodb') {
      healthCheck = ['--health-cmd', 'mongosh --eval "db.adminCommand(\'ping\')"', '--health-interval', '2s', '--health-timeout', '2s', '--health-retries', 10];
      internalPort = '27017';
    }

    const dockerRunCmd = [
      'docker', 'run', '-d',
      '--name', containerName,
      '-p', `${port}:${internalPort}`,
      ...resourceLimits,
      ...healthCheck,
      ...envVars,
      image
    ];

    try {
      const { stdout } = await execAsync(dockerRunCmd.join(' '));
      const containerId = stdout.trim();
      
      console.log(`Container started: ${containerId}`);

      // Wait for health check to pass
      await this.waitForHealthy(containerId);

      this.instance = {
        containerId,
        port,
        connectionString: this.getConnectionString(port)
      };

      return this.instance;
    } catch (error) {
      console.error('Failed to provision sandbox:', error);
      await this.teardown(); // Clean up on failure
      throw error;
    }
  }

  /**
   * Wait for the container to be healthy
   */
  private async waitForHealthy(containerId: string, maxAttempts = 30): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const { stdout } = await execAsync(`docker inspect --format='{{.State.Health.Status}}' ${containerId}`);
        const status = stdout.trim();
        if (status === 'healthy') {
          console.log('Sandbox is healthy and ready.');
          return;
        }
        console.log(`Waiting for sandbox to be healthy... (${status})`);
      } catch {
        // Container might not have health status yet
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    throw new Error('Sandbox failed to become healthy within timeout');
  }

  /**
   * Execute a command inside the sandbox
   */
  public async executeCommand(command: string): Promise<{ stdout: string; stderr: string }> {
    if (!this.instance) {
      throw new Error('Sandbox not provisioned');
    }

    try {
      const { stdout, stderr } = await execAsync(`docker exec ${this.instance.containerId} ${command}`);
      return { stdout, stderr };
    } catch (error: any) {
      return { stdout: '', stderr: error.message || String(error) };
    }
  }

  /**
   * Execute a SQL/Script file inside the sandbox
   */
  public async executeSqlFile(filePath: string): Promise<void> {
    if (!this.instance) {
      throw new Error('Sandbox not provisioned');
    }

    const containerPath = `/tmp/migration_script`;
    
    // Copy file to container
    await execAsync(`docker cp "${filePath}" ${this.instance.containerId}:${containerPath}`);

    // Execute based on engine
    if (this.config.engine === 'postgres') {
      await this.executeCommand(`psql -U testuser -d testdb -f ${containerPath}`);
    } else if (this.config.engine === 'mysql') {
      await this.executeCommand(`mysql -u testuser -ptestpass testdb < ${containerPath}`);
    } else if (this.config.engine === 'mongodb') {
      // For MongoDB, we assume the file contains JavaScript/mongosh commands
      await this.executeCommand(`mongosh testdb < ${containerPath}`);
    }
  }

  /**
   * Clean teardown of the sandbox (always called, even on failure)
   */
  public async teardown(): Promise<void> {
    if (!this.instance) {
      return;
    }

    console.log(`Tearing down sandbox: ${this.instance.containerId}...`);
    try {
      // Force remove the container to ensure cleanup
      await execAsync(`docker rm -f ${this.instance.containerId}`);
      console.log('Sandbox torn down successfully.');
    } catch (error) {
      console.error('Error during sandbox teardown:', error);
    } finally {
      this.instance = null;
    }
  }

  /**
   * Get the current instance details
   */
  public getInstance(): SandboxInstance | null {
    return this.instance;
  }
}