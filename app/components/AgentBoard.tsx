'use client';

import { AgentStep as AgentStepComponent } from '@/app/components/AgentStep';
import { AgentStep } from '@/app/types/agent';
import { AGENT_STEPS } from '@/app/lib/agentSteps';

interface AgentBoardProps {
  steps?: AgentStep[];
}

export default function AgentBoard({ steps = [] }: AgentBoardProps) {
  // Create map of step data by ID
  const stepMap = new Map(steps.map(s => [s.id, s]));

  // Check if validation failed (means tools will run)
  const validationFailed = stepMap.get('validation')?.status === 'error';

  return (
    <div className="w-full h-full flex flex-col rounded-lg border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 p-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Agent Reasoning Process
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
          Watch the agent think through the decision in real-time
        </p>
      </div>

      {/* Workflow Steps - Show ALL steps from the start */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {AGENT_STEPS.map((stepDef, index) => {
          const stepData = stepMap.get(stepDef.id);
          
          return (
            <div key={stepDef.id} className="space-y-2">
              <AgentStepComponent 
                stepDef={stepDef}
                stepData={stepData}
                stepNumber={index + 1}
              />
              
              {/* Connection line between steps */}
              {index < AGENT_STEPS.length - 1 && (
                <div className="flex justify-center">
                  <div className="w-0.5 h-2 bg-zinc-300 dark:bg-zinc-700"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Footer */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 p-3">
        <div className="flex items-center gap-6 text-xs">
          <span className="text-zinc-600 dark:text-zinc-400">
            Completed: <span className="font-bold text-green-600 dark:text-green-400">
              {steps.filter(s => s.status === 'completed').length}
            </span>
          </span>
          <span className="text-zinc-600 dark:text-zinc-400">
            Failed: <span className="font-bold text-red-600 dark:text-red-400">
              {steps.filter(s => s.status === 'error').length}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}