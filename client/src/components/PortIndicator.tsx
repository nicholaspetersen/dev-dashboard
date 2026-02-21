import React from 'react';

interface PortIndicatorProps {
  port: number;
  isRunning: boolean;
}

export function PortIndicator({ port, isRunning }: PortIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          isRunning
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {isRunning ? (
          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-600"></span>
        ) : (
          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-gray-400"></span>
        )}
        {port}
      </span>
      {isRunning && (
        <a
          href={`http://localhost:${port}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-xs"
        >
          Open →
        </a>
      )}
    </div>
  );
}
