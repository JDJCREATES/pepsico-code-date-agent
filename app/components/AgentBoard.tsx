'use client';

import { AgentStep } from '@/app/components/AgentStep';

export interface Step {
  id: string;
  timestamp: Date;
  action: string;
  status: 'running' | 'completed' | 'error';
  details?: string;
}

interface AgentBoardProps {
  steps?: Step[];
}

export default function AgentBoard({ steps = [] }: AgentBoardProps) {
  return (
    <div className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
        Agent Reasoning
      </h2>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {steps.length === 0 ? (
          <p className="text-zinc-500 text-sm">No steps yet. Start the analysis to see agent reasoning.</p>
        ) : (
          steps.map((step) => (
            <AgentStep key={step.id} step={step} />
          ))
        )}
      </div>
    </div>
  );
}