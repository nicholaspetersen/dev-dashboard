import React, { useState } from 'react';
import { Project } from '../types';
import { useProcesses } from '../hooks/useProcesses';
import { PortIndicator } from './PortIndicator';
import { LogViewer } from './LogViewer';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { processes, loading, startProcess, stopProcess, restartProcess } = useProcesses();
  const [expandedLogs, setExpandedLogs] = useState<string | null>(null);

  return (
    <div className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
          <p className="text-sm text-gray-500 font-mono">{project.path}</p>
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 mt-1">
            {project.type}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {project.processes.map((proc) => {
          const processId = `${project.id}:${proc.name}`;
          const state = processes.get(processId);
          const isRunning = state?.status === 'running';
          const isLogsOpen = expandedLogs === processId;

          return (
            <div key={proc.name} className="border-t pt-3 first:border-t-0 first:pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-medium text-gray-700">
                    {proc.name}
                  </span>
                  <PortIndicator port={proc.port} isRunning={isRunning} />
                  {state?.status && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        state.status === 'running'
                          ? 'bg-green-100 text-green-800'
                          : state.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {state.status}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {isRunning ? (
                    <>
                      <button
                        onClick={() => restartProcess(project.id, proc.name)}
                        disabled={loading}
                        className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 disabled:opacity-50"
                      >
                        Restart
                      </button>
                      <button
                        onClick={() => stopProcess(processId)}
                        disabled={loading}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
                      >
                        Stop
                      </button>
                      <button
                        onClick={() =>
                          setExpandedLogs(isLogsOpen ? null : processId)
                        }
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                      >
                        {isLogsOpen ? 'Hide Logs' : 'View Logs'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startProcess(project.id, proc.name)}
                      disabled={loading}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
                    >
                      Start
                    </button>
                  )}
                </div>
              </div>

              <LogViewer processId={processId} isOpen={isLogsOpen} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
