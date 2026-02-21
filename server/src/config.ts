import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { DashboardConfig } from './types.js';

// Look for config in parent directory (project root)
const CONFIG_PATH = path.join(process.cwd(), '..', 'dev-dashboard.config.json');

/**
 * Expand ~ to home directory in paths
 */
function expandPath(p: string): string {
  return p.replace(/^~/, os.homedir());
}

/**
 * Contract home directory to ~ in paths
 */
function contractPath(p: string): string {
  return p.replace(os.homedir(), '~');
}

/**
 * Load and denormalize config (expand ~ paths)
 */
export async function loadConfig(): Promise<DashboardConfig> {
  try {
    const content = await fs.readFile(CONFIG_PATH, 'utf-8');
    const config: DashboardConfig = JSON.parse(content);

    // Expand ~ in paths
    config.scanPaths = config.scanPaths.map(expandPath);
    config.projects = config.projects.map((project) => ({
      ...project,
      path: expandPath(project.path),
    }));

    return config;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Config file not found: ${CONFIG_PATH}`);
    }
    throw error;
  }
}

/**
 * Save config (contract paths to ~)
 */
export async function saveConfig(config: DashboardConfig): Promise<void> {
  // Contract paths to use ~
  const normalized: DashboardConfig = {
    ...config,
    scanPaths: config.scanPaths.map(contractPath),
    projects: config.projects.map((project) => ({
      ...project,
      path: contractPath(project.path),
    })),
  };

  await fs.writeFile(CONFIG_PATH, JSON.stringify(normalized, null, 2), 'utf-8');
}
