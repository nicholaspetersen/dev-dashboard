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

export interface DashboardConfig {
  version: string;
  scanPaths: string[];
  projects: Project[];
  portRanges: {
    nextjs: [number, number];
    vite: [number, number];
    express: [number, number];
  };
}

export interface ProcessStatus {
  id: string;
  projectId: string;
  processName: string;
  status: 'running' | 'stopped' | 'failed';
  port: number;
  startedAt?: Date;
  exitCode?: number;
}
