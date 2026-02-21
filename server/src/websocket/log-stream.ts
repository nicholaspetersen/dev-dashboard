import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { ProcessManager } from '../process-manager/ProcessManager.js';
import { LogEntry } from '../process-manager/LogBuffer.js';

interface LogStreamMessage {
  type: 'subscribe' | 'unsubscribe';
  processId: string;
}

/**
 * WebSocket server for streaming logs to clients
 */
export function createLogStreamServer(httpServer: Server, processManager: ProcessManager) {
  const wss = new WebSocketServer({ server: httpServer, path: '/logs' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    const subscriptions = new Set<string>();

    // Subscribe to log updates
    const unsubscribe = processManager.subscribeToLogs((processId: string, entry: LogEntry) => {
      // Only send if client is subscribed to this process
      if (subscriptions.has(processId)) {
        ws.send(
          JSON.stringify({
            type: 'log',
            processId,
            entry: {
              ...entry,
              timestamp: entry.timestamp.toISOString(),
            },
          })
        );
      }
    });

    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
      try {
        const message: LogStreamMessage = JSON.parse(data.toString());

        if (message.type === 'subscribe') {
          subscriptions.add(message.processId);
          console.log(`Client subscribed to process: ${message.processId}`);

          // Send existing logs when subscribing
          const existingLogs = processManager.getProcessLogs(message.processId);
          existingLogs.forEach((entry) => {
            ws.send(
              JSON.stringify({
                type: 'log',
                processId: message.processId,
                entry: {
                  ...entry,
                  timestamp: entry.timestamp.toISOString(),
                },
              })
            );
          });
        } else if (message.type === 'unsubscribe') {
          subscriptions.delete(message.processId);
          console.log(`Client unsubscribed from process: ${message.processId}`);
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    // Cleanup on disconnect
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      unsubscribe();
      subscriptions.clear();
    });
  });

  return wss;
}
