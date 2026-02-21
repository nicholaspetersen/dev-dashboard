import React, { useEffect, useRef } from 'react';
import { useLogs } from '../hooks/useLogs';

interface LogViewerProps {
  processId: string;
  isOpen: boolean;
}

export function LogViewer({ processId, isOpen }: LogViewerProps) {
  const { logs } = useLogs(processId);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="mt-3 border-t pt-3">
      <div className="bg-gray-900 rounded-lg p-3 max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-gray-400 text-sm">No logs yet...</p>
        ) : (
          <div className="font-mono text-xs space-y-0.5">
            {logs.map((log, index) => (
              <div
                key={index}
                className={
                  log.level === 'stderr' ? 'text-red-400' : 'text-green-400'
                }
              >
                <span className="text-gray-500">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>{' '}
                {log.message}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
