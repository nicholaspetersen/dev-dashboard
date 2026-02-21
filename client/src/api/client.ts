import { Project, ProcessStatus } from '../types';

const API_BASE = '/api';

export async function fetchProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE}/projects`);
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  return response.json();
}

export async function fetchProcesses(): Promise<ProcessStatus[]> {
  const response = await fetch(`${API_BASE}/processes`);
  if (!response.ok) {
    throw new Error('Failed to fetch processes');
  }
  return response.json();
}

export async function startProcess(projectId: string, processName: string): Promise<void> {
  const response = await fetch(`${API_BASE}/processes/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, processName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to start process');
  }
}

export async function stopProcess(processId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/processes/stop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ processId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to stop process');
  }
}

export async function restartProcess(projectId: string, processName: string): Promise<void> {
  const response = await fetch(`${API_BASE}/processes/restart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, processName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to restart process');
  }
}
