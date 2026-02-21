import { findAvailablePort } from './PortChecker.js';

export interface PortRanges {
  nextjs: [number, number];
  vite: [number, number];
  express: [number, number];
}

const DEFAULT_PORT_RANGES: PortRanges = {
  nextjs: [3000, 3010],
  vite: [5173, 5183],
  express: [3001, 3020],
};

/**
 * Manages port allocation for different project types
 */
export class PortAllocator {
  private portRanges: PortRanges;
  private allocatedPorts: Set<number> = new Set();

  constructor(portRanges?: PortRanges) {
    this.portRanges = portRanges || DEFAULT_PORT_RANGES;
  }

  /**
   * Allocate a port for a given project type
   */
  async allocatePort(projectType: string): Promise<number> {
    const range = this.getPortRange(projectType);
    const [startPort, endPort] = range;

    const port = await findAvailablePort(startPort, endPort);
    if (port === null) {
      throw new Error(`No available ports in range ${startPort}-${endPort} for ${projectType}`);
    }

    this.allocatedPorts.add(port);
    return port;
  }

  /**
   * Mark a port as allocated
   */
  markAllocated(port: number): void {
    this.allocatedPorts.add(port);
  }

  /**
   * Release an allocated port
   */
  releasePort(port: number): void {
    this.allocatedPorts.delete(port);
  }

  /**
   * Get the port range for a project type
   */
  private getPortRange(projectType: string): [number, number] {
    switch (projectType) {
      case 'nextjs':
        return this.portRanges.nextjs;
      case 'vite':
        return this.portRanges.vite;
      case 'express':
      case 'node':
        return this.portRanges.express;
      default:
        // Fallback range
        return [8000, 8100];
    }
  }
}
