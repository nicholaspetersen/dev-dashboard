import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { ProcessManager } from './process-manager/ProcessManager.js';
import { createProcessesRouter } from './routes/processes.js';
import { createProjectsRouter } from './routes/projects.js';
import { createLogStreamServer } from './websocket/log-stream.js';

const PORT = 3100;

async function main() {
  const app = express();
  const processManager = new ProcessManager();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // API routes
  app.use('/api/projects', createProjectsRouter());
  app.use('/api/processes', createProcessesRouter(processManager));

  // Create HTTP server and attach WebSocket
  const httpServer = createServer(app);
  createLogStreamServer(httpServer, processManager);

  // Start server
  httpServer.listen(PORT, () => {
    console.log(`Dev Dashboard server running on http://localhost:${PORT}`);
    console.log(`WebSocket server available at ws://localhost:${PORT}/logs`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');

    // Stop all running processes
    const processes = processManager.getAllProcesses();
    for (const proc of processes) {
      if (proc.status === 'running') {
        try {
          await processManager.stopProcess(proc.id);
        } catch (error) {
          console.error(`Error stopping process ${proc.id}:`, error);
        }
      }
    }

    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
