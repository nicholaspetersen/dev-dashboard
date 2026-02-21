import { Router } from 'express';
import { loadConfig } from '../config.js';

export function createProjectsRouter(): Router {
  const router = Router();

  /**
   * GET /api/projects - Get all projects
   */
  router.get('/', async (req, res) => {
    try {
      const config = await loadConfig();
      res.json(config.projects);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  /**
   * GET /api/projects/:projectId - Get specific project
   */
  router.get('/:projectId', async (req, res) => {
    try {
      const { projectId } = req.params;
      const config = await loadConfig();
      const project = config.projects.find((p) => p.id === projectId);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(project);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  return router;
}
