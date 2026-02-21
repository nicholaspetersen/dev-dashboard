export interface ProcessConfig {
  name: string;
  command: string;
  port: number;
  portArg?: string;
  dependsOn?: string[];
}

export interface Project {
  id: string;
  name: string;
  path: string;
  type: string;
  processes: ProcessConfig[];
}

export interface ProcessStatus {
  id: string;
  projectId: string;
  processName: string;
  status: 'running' | 'stopped' | 'failed';
  port: number;
  startedAt?: string;
  exitCode?: number;
}

export interface LogEntry {
  timestamp: string;
  level: 'stdout' | 'stderr';
  message: string;
}
