import { useState, useEffect, useRef } from 'react';
import { LogEntry } from '../types';

const WS_URL = 'ws://localhost:3100/logs';

export function useLogs(processId: string) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!processId) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`WebSocket connected for ${processId}`);
      ws.send(JSON.stringify({ type: 'subscribe', processId }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'log' && data.processId === processId) {
          setLogs((prev) => [...prev, data.entry].slice(-1000));
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log(`WebSocket disconnected for ${processId}`);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'unsubscribe', processId }));
      }
      ws.close();
    };
  }, [processId]);

  return { logs };
}
