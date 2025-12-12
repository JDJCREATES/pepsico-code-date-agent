import React from 'react';
import { AgentStep as AgentStepType } from '@/app/types/agent';

interface AgentStepProps {
  step: AgentStepType;
}

export const AgentStep = ({ step }: AgentStepProps) => {
  const getStatusIcon = (status: AgentStepType['status']) => {
    switch (status) {
      case 'pending':
        return '⚪';
      case 'running':
        return '⏳';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
    }
  };

  const getStatusColor = (status: AgentStepType['status']) => {
    switch (status) {
      case 'pending':
        return 'border-zinc-300 bg-zinc-50 dark:bg-zinc-900/20';
      case 'running':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 animate-pulse';
      case 'completed':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    }
  };

  return (
    <div className={`p-3 rounded border-l-4 ${getStatusColor(step.status)} transition-all duration-300`}>
      <div className="flex items-start gap-2">
        <span className="text-lg">{getStatusIcon(step.status)}</span>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div>
              <p className="font-semibold text-sm text-zinc-900 dark:text-white">
                {step.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {step.description}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-500">
                {new Date(step.timestamp).toLocaleTimeString()}
              </span>
              {step.duration && (
                <p className="text-xs text-zinc-400">
                  {step.duration}ms
                </p>
              )}
            </div>
          </div>
          {step.reasoning && (
            <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-2 bg-white/50 dark:bg-black/20 p-2 rounded-b-sm">
              💭 {step.reasoning}
            </p>
          )}
          {step.extractedData && (
            <div className="mt-2 text-xs">
              <p className="font-medium text-zinc-600 dark:text-zinc-400">Extracted Data:</p>
              <pre className="mt-1 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-b-sm text-xs overflow-x-auto">
                {JSON.stringify(step.extractedData, null, 2)}
              </pre>
            </div>
          )}
          {step.functionCalls && step.functionCalls.length > 0 && (
            <div className="mt-2 space-y-1">
              {step.functionCalls.map((call, i) => (
                <div key={i} className="text-xs bg-purple-50 dark:bg-purple-900/20 p-2 rounded border-l-2 border-purple-500">
                  <span className="font-mono text-purple-700 dark:text-purple-300">
                    🔧 {call.name}()
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentStep;