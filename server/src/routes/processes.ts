import { Router } from 'express';
import { ProcessManager } from '../process-manager/ProcessManager.js';
import { loadConfig } from '../config.js';

export function createProcessesRouter(processManager: ProcessManager): Router {
  const router = Router();

  /**
   * GET /api/processes - Get all process statuses
   */
  router.get('/', (req, res) => {
    const processes = processManager.getAllProcesses();
    res.json(processes);
  });

  /**
   * GET /api/processes/:processId - Get specific process status
   */
  router.get('/:processId', (req, res) => {
    const { processId } = req.params;
    const process = processManager.getProcessStatus(processId);

    if (!process) {
      return res.status(404).json({ error: 'Process not found' });
    }

    res.json(process);
  });

  /**
   * POST /api/processes/start - Start a process
   */
  router.post('/start', async (req, res) => {
    try {
      const { projectId, processName } = req.body;

      if (!projectId || !processName) {
        return res.status(400).json({ error: 'projectId and processName required' });
      }

      // Load config to get process details
      const config = await loadConfig();
      const project = config.projects.find((p) => p.id === projectId);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const processConfig = project.processes.find((p) => p.name === processName);

      if (!processConfig) {
        return res.status(404).json({ error: 'Process not found' });
      }

      // Start process
      await processManager.startProcess(projectId, processName, {
        command: processConfig.command,
        port: processConfig.port,
        portArg: processConfig.portArg,
        workingDir: project.path,
      });

      res.json({ success: true, message: 'Process started' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  /**
   * POST /api/processes/stop - Stop a process
   */
  router.post('/stop', async (req, res) => {
    try {
      const { processId } = req.body;

      if (!processId) {
        return res.status(400).json({ error: 'processId required' });
      }

      await processManager.stopProcess(processId);

      res.json({ success: true, message: 'Process stopped' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  /**
   * POST /api/processes/restart - Restart a process
   */
  router.post('/restart', async (req, res) => {
    try {
      const { projectId, processName } = req.body;

      if (!projectId || !processName) {
        return res.status(400).json({ error: 'projectId and processName required' });
      }

      const processId = `${projectId}:${processName}`;

      // Load config to get process details
      const config = await loadConfig();
      const project = config.projects.find((p) => p.id === projectId);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const processConfig = project.processes.find((p) => p.name === processName);

      if (!processConfig) {
        return res.status(404).json({ error: 'Process not found' });
      }

      // Restart process
      await processManager.restartProcess(processId, {
        command: processConfig.command,
        port: processConfig.port,
        portArg: processConfig.portArg,
        workingDir: project.path,
      });

      res.json({ success: true, message: 'Process restarted' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  /**
   * GET /api/processes/:processId/logs - Get process logs
   */
  router.get('/:processId/logs', (req, res) => {
    const { processId } = req.params;
    const count = req.query.count ? parseInt(req.query.count as string) : undefined;

    const logs = processManager.getProcessLogs(processId, count);
    res.json(logs);
  });

  return router;
}
