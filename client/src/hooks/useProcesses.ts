import { useState, useEffect } from 'react';
import { ProcessStatus } from '../types';
import { fetchProcesses, startProcess, stopProcess, restartProcess } from '../api/client';

export function useProcesses() {
  const [processes, setProcesses] = useState<Map<string, ProcessStatus>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProcesses();
    const interval = setInterval(loadProcesses, 2000);
    return () => clearInterval(interval);
  }, []);

  async function loadProcesses() {
    try {
      const data = await fetchProcesses();
      const processMap = new Map(data.map((p) => [p.id, p]));
      setProcesses(processMap);
    } catch (err) {
      console.error('Failed to fetch processes:', err);
    }
  }

  async function handleStart(projectId: string, processName: string) {
    setLoading(true);
    try {
      await startProcess(projectId, processName);
      await loadProcesses();
    } catch (err) {
      console.error('Failed to start process:', err);
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStop(processId: string) {
    setLoading(true);
    try {
      await stopProcess(processId);
      await loadProcesses();
    } catch (err) {
      console.error('Failed to stop process:', err);
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRestart(projectId: string, processName: string) {
    setLoading(true);
    try {
      await restartProcess(projectId, processName);
      await loadProcesses();
    } catch (err) {
      console.error('Failed to restart process:', err);
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return {
    processes,
    loading,
    startProcess: handleStart,
    stopProcess: handleStop,
    restartProcess: handleRestart,
  };
}
