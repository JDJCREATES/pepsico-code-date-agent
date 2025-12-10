import React from 'react';
import type { Step } from './AgentBoard';

interface AgentStepProps {
  step: Step;
}

export const AgentStep = ({ step }: AgentStepProps) => {
  const getStatusIcon = (status: Step['status']) => {
    switch (status) {
      case 'running':
        return '⏳';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
    }
  };

  const getStatusColor = (status: Step['status']) => {
    switch (status) {
      case 'running':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'completed':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    }
  };

  return (
    <div className={`p-3 rounded border-l-4 ${getStatusColor(step.status)}`}>
      <div className="flex items-start gap-2">
        <span className="text-lg">{getStatusIcon(step.status)}</span>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <p className="font-medium text-sm text-zinc-900 dark:text-white">
              {step.action}
            </p>
            <span className="text-xs text-zinc-500">
              {step.timestamp.toLocaleTimeString()}
            </span>
          </div>
          {step.details && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              {step.details}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentStep;