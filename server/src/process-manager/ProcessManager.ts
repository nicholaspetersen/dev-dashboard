import { spawn, ChildProcess } from 'child_process';
import { LogBuffer, LogEntry } from './LogBuffer.js';
import { isPortAvailable } from '../port-manager/PortChecker.js';
import os from 'os';

export interface ProcessConfig {
  command: string;
  port: number;
  portArg?: string;
  workingDir?: string;
  env?: Record<string, string>;
}

export interface ManagedProcess {
  id: string;
  projectId: string;
  processName: string;
  childProcess: ChildProcess;
  status: 'running' | 'stopped' | 'failed';
  port: number;
  startedAt: Date;
  exitCode?: number;
}

type LogSubscriber = (processId: string, entry: LogEntry) => void;

/**
 * Manages spawning and lifecycle of child processes
 */
export class ProcessManager {
  private processes: Map<string, ManagedProcess> = new Map();
  private logBuffer: LogBuffer = new LogBuffer();
  private logSubscribers: Set<LogSubscriber> = new Set();

  /**
   * Start a new process
   */
  async startProcess(
    projectId: string,
    processName: string,
    config: ProcessConfig
  ): Promise<void> {
    const processId = `${projectId}:${processName}`;

    // Check if already running
    if (this.processes.has(processId)) {
      const existing = this.processes.get(processId)!;
      if (existing.status === 'running') {
        throw new Error(`Process ${processId} is already running`);
      }
    }

    // Check port availability
    const available = await isPortAvailable(config.port);
    if (!available) {
      throw new Error(`Port ${config.port} is already in use`);
    }

    // Build command with port argument if specified
    let command = config.command;
    if (config.portArg) {
      // If using npm/yarn, add -- before the args
      if (config.command.startsWith('npm') || config.command.startsWith('yarn')) {
        command = `${config.command} -- ${config.portArg} ${config.port}`;
      } else {
        command = `${config.command} ${config.portArg} ${config.port}`;
      }
    }

    // Expand ~ in working directory
    const workingDir = config.workingDir
      ? config.workingDir.replace(/^~/, os.homedir())
      : undefined;

    // Spawn child process
    const child = spawn('sh', ['-c', command], {
      cwd: workingDir,
      env: {
        ...process.env,
        ...config.env,
        PORT: config.port.toString(),
      },
    });

    // Capture stdout
    child.stdout?.on('data', (data) => {
      const entry: LogEntry = {
        timestamp: new Date(),
        level: 'stdout',
        message: data.toString(),
      };
      this.logBuffer.append(processId, entry);
      this.notifyLogSubscribers(processId, entry);
    });

    // Capture stderr
    child.stderr?.on('data', (data) => {
      const entry: LogEntry = {
        timestamp: new Date(),
        level: 'stderr',
        message: data.toString(),
      };
      this.logBuffer.append(processId, entry);
      this.notifyLogSubscribers(processId, entry);
    });

    // Handle process exit
    child.on('exit', (code) => {
      this.handleProcessExit(processId, code);
    });

    // Handle process errors
    child.on('error', (error) => {
      const entry: LogEntry = {
        timestamp: new Date(),
        level: 'stderr',
        message: `Process error: ${error.message}`,
      };
      this.logBuffer.append(processId, entry);
      this.notifyLogSubscribers(processId, entry);
    });

    // Store managed process
    this.processes.set(processId, {
      id: processId,
      projectId,
      processName,
      childProcess: child,
      status: 'running',
      port: config.port,
      startedAt: new Date(),
    });

    // Log process start
    const startEntry: LogEntry = {
      timestamp: new Date(),
      level: 'stdout',
      message: `[dev-dashboard] Started process on port ${config.port}\n`,
    };
    this.logBuffer.append(processId, startEntry);
    this.notifyLogSubscribers(processId, startEntry);
  }

  /**
   * Stop a running process
   */
  async stopProcess(processId: string): Promise<void> {
    const proc = this.processes.get(processId);
    if (!proc) {
      throw new Error(`Process ${processId} not found`);
    }

    if (proc.status !== 'running') {
      throw new Error(`Process ${processId} is not running`);
    }

    // Send SIGTERM for graceful shutdown
    proc.childProcess.kill('SIGTERM');

    // Wait 10s, then force kill if still running
    setTimeout(() => {
      if (proc.childProcess.exitCode === null) {
        proc.childProcess.kill('SIGKILL');
      }
    }, 10000);

    // Log process stop
    const stopEntry: LogEntry = {
      timestamp: new Date(),
      level: 'stdout',
      message: `[dev-dashboard] Stopping process...\n`,
    };
    this.logBuffer.append(processId, stopEntry);
    this.notifyLogSubscribers(processId, stopEntry);
  }

  /**
   * Restart a process
   */
  async restartProcess(processId: string, config: ProcessConfig): Promise<void> {
    await this.stopProcess(processId);

    // Wait a bit for the process to fully stop
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const [projectId, processName] = processId.split(':');
    await this.startProcess(projectId, processName, config);
  }

  /**
   * Get the status of a process
   */
  getProcessStatus(processId: string): ManagedProcess | undefined {
    return this.processes.get(processId);
  }

  /**
   * Get all processes
   */
  getAllProcesses(): ManagedProcess[] {
    return Array.from(this.processes.values());
  }

  /**
   * Get logs for a process
   */
  getProcessLogs(processId: string, count?: number): LogEntry[] {
    if (count) {
      return this.logBuffer.getRecentLogs(processId, count);
    }
    return this.logBuffer.getLogs(processId);
  }

  /**
   * Subscribe to log updates
   */
  subscribeToLogs(callback: LogSubscriber): () => void {
    this.logSubscribers.add(callback);
    return () => this.logSubscribers.delete(callback);
  }

  /**
   * Handle process exit
   */
  private handleProcessExit(processId: string, code: number | null): void {
    const proc = this.processes.get(processId);
    if (!proc) return;

    proc.status = code === 0 ? 'stopped' : 'failed';
    proc.exitCode = code ?? undefined;

    const exitEntry: LogEntry = {
      timestamp: new Date(),
      level: code === 0 ? 'stdout' : 'stderr',
      message: `[dev-dashboard] Process exited with code ${code}\n`,
    };
    this.logBuffer.append(processId, exitEntry);
    this.notifyLogSubscribers(processId, exitEntry);
  }

  /**
   * Notify log subscribers
   */
  private notifyLogSubscribers(processId: string, entry: LogEntry): void {
    this.logSubscribers.forEach((subscriber) => {
      subscriber(processId, entry);
    });
  }
}
