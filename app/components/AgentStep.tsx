import React from 'react';
import { AgentStep as AgentStepType, NodeType } from '@/app/types/agent';

interface AgentStepProps {
  stepDef: {
    id: string;
    name: string;
    description: string;
    nodeType: NodeType;
  };
  stepData?: AgentStepType;
  stepNumber: number;
}

export const AgentStep = ({ stepDef, stepData, stepNumber }: AgentStepProps) => {
  const status = stepData?.status || 'pending';
  
  const getStatusStyle = () => {
    switch (status) {
      case 'pending':
        return 'grayscale opacity-30';
      case 'running':
        return 'animate-pulse';
      case 'completed':
        return '';
      case 'error':
        return 'grayscale opacity-50';
    }
  };

  return (
    <div className="flex items-start gap-2 py-2 border-b border-zinc-200 dark:border-zinc-800">
      {/* Status indicator - potato emoji */}
      <div className={`flex-shrink-0 text-lg ${getStatusStyle()}`}>
        🥔
      </div>
      
      {/* Step number */}
      <div className="flex-shrink-0 text-xs font-mono text-zinc-500 dark:text-zinc-400 w-4">
        {stepNumber}
      </div>
      
      {/* Step name */}
      <div className="flex-shrink-0 text-sm font-semibold text-zinc-900 dark:text-white min-w-[180px]">
        {stepDef.name}
      </div>
      
      {/* Streaming output field */}
      <div className="flex-1 min-w-0">
        {stepData?.reasoning ? (
          <div className="text-sm text-zinc-700 dark:text-zinc-300 font-mono">
            {stepData.reasoning}
          </div>
        ) : (
          <div className="text-sm text-zinc-400 dark:text-zinc-600 italic">
            {status === 'pending' ? 'Waiting...' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentStep;