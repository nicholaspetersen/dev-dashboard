export interface LogEntry {
  timestamp: Date;
  level: 'stdout' | 'stderr';
  message: string;
}

/**
 * Buffer logs for each process with a maximum size
 */
export class LogBuffer {
  private buffers: Map<string, LogEntry[]> = new Map();
  private readonly maxLogs = 1000;

  /**
   * Append a log entry to a process's buffer
   */
  append(processId: string, entry: LogEntry): void {
    if (!this.buffers.has(processId)) {
      this.buffers.set(processId, []);
    }

    const buffer = this.buffers.get(processId)!;
    buffer.push(entry);

    // Keep only the last maxLogs entries
    if (buffer.length > this.maxLogs) {
      buffer.shift();
    }
  }

  /**
   * Get all logs for a process
   */
  getLogs(processId: string): LogEntry[] {
    return this.buffers.get(processId) || [];
  }

  /**
   * Get recent logs for a process (last N entries)
   */
  getRecentLogs(processId: string, count: number): LogEntry[] {
    const logs = this.getLogs(processId);
    return logs.slice(-count);
  }

  /**
   * Clear logs for a process
   */
  clear(processId: string): void {
    this.buffers.delete(processId);
  }

  /**
   * Clear all logs
   */
  clearAll(): void {
    this.buffers.clear();
  }
}
